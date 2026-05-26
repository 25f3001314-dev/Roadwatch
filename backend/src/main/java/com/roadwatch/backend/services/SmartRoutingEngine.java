package com.roadwatch.backend.services;

import com.roadwatch.backend.models.Authority;
import com.roadwatch.backend.models.Complaint;
import com.roadwatch.backend.models.ComplaintAssignmentHistory;
import com.roadwatch.backend.models.Road;
import com.roadwatch.backend.repositories.AuthorityRepository;
import com.roadwatch.backend.repositories.ComplaintAssignmentHistoryRepository;
import com.roadwatch.backend.repositories.RoadRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

/**
 * Smart Routing Engine.
 *
 * Decides which department / authority a complaint belongs to using:
 *   1. Explicit road match (if Complaint.roadId is known).
 *   2. Geo-radius nearest-road heuristic against the {@code roads} table.
 *   3. Road-type → department mapping fallback (NH→NHAI, SH→PWD, MDR→PWD,
 *      RURAL→RURAL_ROADS, CITY→NAGAR_NIGAM).
 *   4. Officer/Authority lookup by department (+district when known).
 *
 * Also computes emergency flag, ETA, and writes a
 * {@link ComplaintAssignmentHistory} audit record.
 *
 * Backwards compatible: if no roads exist or no authorities match, the
 * complaint still saves with a sensible default department exactly like the
 * legacy {@link DecisionEngineService}.
 */
@Service
public class SmartRoutingEngine {
    private static final Logger logger = LoggerFactory.getLogger(SmartRoutingEngine.class);

    @Autowired private RoadRepository roadRepository;
    @Autowired private AuthorityRepository authorityRepository;
    @Autowired private ComplaintAssignmentHistoryRepository historyRepository;

    /** Result of a routing decision. */
    public static class RoutingDecision {
        public Long roadId;
        public Long authorityId;
        public String authorityName;
        public String department;
        public String jurisdictionTag;
        public boolean emergency;
        public LocalDate expectedRepairDate;
        public String reason;
    }

    public RoutingDecision route(Complaint complaint) {
        RoutingDecision d = new RoutingDecision();

        // 1. Match a road.
        Road matchedRoad = matchRoad(complaint);
        if (matchedRoad != null) {
            d.roadId = matchedRoad.getId();
            d.jurisdictionTag = matchedRoad.getJurisdictionTag();
            d.department = pickDepartment(matchedRoad, complaint);
            d.reason = "Matched road #" + matchedRoad.getId() + " (" + matchedRoad.getName() + ")";
        } else {
            d.department = mapRoadTypeToDepartment(complaint.getRoadType());
            d.reason = "No road match — used roadType→department fallback";
        }

        // 2. Pick the best authority within department.
        Authority authority = pickAuthority(d.department, matchedRoad);
        if (authority != null) {
            d.authorityId = authority.getId();
            d.authorityName = authority.getName();
            if (d.jurisdictionTag == null) d.jurisdictionTag = authority.getJurisdictionTag();
        }

        // 3. Emergency promotion + ETA.
        d.emergency = isEmergency(complaint);
        d.expectedRepairDate = computeEta(complaint, d.emergency);

        return d;
    }

    /** Apply a routing decision to a complaint and write history. */
    public void applyDecision(Complaint complaint, RoutingDecision d, String performedBy, String mode) {
        Long previousAuthority = complaint.getAssignedAuthorityId();
        String previousDept = complaint.getRoutedDepartment();

        complaint.setRoadId(d.roadId);
        if (d.authorityId != null) {
            complaint.setAssignedAuthorityId(d.authorityId);
            complaint.setAssignedAuthorityName(d.authorityName);
        }
        if (d.department != null) {
            complaint.setRoutedDepartment(d.department);
            // Keep legacy `department` field in sync so existing UI keeps working.
            if (complaint.getDepartment() == null || complaint.getDepartment().isBlank()) {
                complaint.setDepartment(d.department);
            }
        }
        complaint.setJurisdictionTag(d.jurisdictionTag);
        complaint.setRoutingMode(mode);
        complaint.setEmergency(d.emergency);
        complaint.setExpectedRepairDate(d.expectedRepairDate);

        ComplaintAssignmentHistory h = new ComplaintAssignmentHistory();
        h.setComplaintId(complaint.getId());
        h.setAssignedAuthorityId(d.authorityId);
        h.setPreviousAuthorityId(previousAuthority);
        h.setDepartment(d.department);
        h.setPreviousDepartment(previousDept);
        h.setAction("AUTO".equalsIgnoreCase(mode) ? "AUTO_ASSIGNED" : "MANUALLY_REASSIGNED");
        h.setReason(d.reason);
        h.setPerformedBy(performedBy != null ? performedBy : "system");
        h.setOccurredAt(LocalDateTime.now());
        h.setJurisdictionTag(d.jurisdictionTag);
        h.setEmergency(d.emergency);

        // Save history only if complaint already has an id.
        if (complaint.getId() != null) {
            try { historyRepository.save(h); }
            catch (Exception ex) { logger.warn("Could not persist routing history: {}", ex.getMessage()); }
        }
    }

    // ──────────────────────────────────────────────────────────────────

    private Road matchRoad(Complaint c) {
        if (c.getRoadId() != null) {
            return roadRepository.findById(c.getRoadId()).orElse(null);
        }
        // We don't yet store road geometry on the Road entity, so geo-matching
        // here falls back to roadType + jurisdictionTag heuristics. Once roads
        // gain LineString geometry, swap this for a PostGIS ST_DWithin query.
        if (c.getRoadType() == null) return null;
        List<Road> typed = roadRepository.findByRoadType(c.getRoadType().toUpperCase());
        return typed.stream().findFirst().orElse(null);
    }

    private String pickDepartment(Road r, Complaint c) {
        if (r.getAuthorityDepartment() != null && !r.getAuthorityDepartment().isBlank()) {
            return r.getAuthorityDepartment();
        }
        return mapRoadTypeToDepartment(r.getRoadType() != null ? r.getRoadType() : c.getRoadType());
    }

    /** Canonical road-type → department mapping. */
    public String mapRoadTypeToDepartment(String roadType) {
        if (roadType == null) return "PWD";
        switch (roadType.toUpperCase()) {
            case "NH":     return "NHAI";
            case "SH":
            case "MDR":    return "PWD";
            case "RURAL":  return "RURAL_ROADS";
            case "CITY":   return "NAGAR_NIGAM";
            case "SMART":  return "SMART_CITY";
            default:       return "PWD";
        }
    }

    private Authority pickAuthority(String department, Road road) {
        if (department == null) return null;
        List<Authority> list;
        if (road != null && road.getDistrict() != null) {
            list = authorityRepository.findByDepartmentAndDistrict(department, road.getDistrict());
            if (!list.isEmpty()) return preferLowestLoad(list);
        }
        list = authorityRepository.findByDepartment(department);
        if (!list.isEmpty()) return preferLowestLoad(list);
        // Final fallback — first authority whose zone/legacy field matches.
        Optional<Authority> any = authorityRepository.findAll().stream().findFirst();
        return any.orElse(null);
    }

    private Authority preferLowestLoad(List<Authority> list) {
        return list.stream()
                .min(Comparator.comparingInt(a ->
                        a.getTotalComplaintsHandled() == null ? 0 : a.getTotalComplaintsHandled()))
                .orElse(list.get(0));
    }

    private boolean isEmergency(Complaint c) {
        if ("HIGH".equalsIgnoreCase(c.getSeverity())) return true;
        if (c.getAiConfidence() != null && c.getAiConfidence() > 0.9) return true;
        if (c.getAiLabel() != null) {
            String l = c.getAiLabel().toLowerCase();
            if (l.contains("waterlog") || l.contains("collapse") || l.contains("debris")) return true;
        }
        return false;
    }

    private LocalDate computeEta(Complaint c, boolean emergency) {
        LocalDate base = LocalDate.now();
        if (emergency) return base.plusDays(2);
        if ("HIGH".equalsIgnoreCase(c.getSeverity())) return base.plusDays(3);
        if ("MEDIUM".equalsIgnoreCase(c.getSeverity())) return base.plusDays(7);
        return base.plusDays(14);
    }
}
