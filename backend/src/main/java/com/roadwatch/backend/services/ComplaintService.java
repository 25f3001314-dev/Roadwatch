package com.roadwatch.backend.services;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.roadwatch.backend.dto.AiAnalysisResponseDto;
import com.roadwatch.backend.dto.ComplaintStatsDto;
import com.roadwatch.backend.dto.ComplaintUpdateRequest;
import com.roadwatch.backend.models.Complaint;
import com.roadwatch.backend.models.ComplaintAssignmentHistory;
import com.roadwatch.backend.repositories.ComplaintRepository;
import com.roadwatch.backend.services.WhatsAppNotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.nio.file.Path;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Service
public class ComplaintService {
    private static final Logger logger = LoggerFactory.getLogger(ComplaintService.class);

    private static final Set<String> VALID_STATUSES = Set.of(
            "PENDING", "ACCEPTED", "UNDER_REVIEW", "REJECTED", "FORWARDED", "ASSIGNED", "IN_PROGRESS", "RESOLVED"
    );

    private static final Set<String> VALID_SEVERITIES = Set.of("HIGH", "MEDIUM", "LOW");

    @Autowired
    private ComplaintRepository complaintRepository;

    @Autowired
    private AiServiceClient aiServiceClient;

    @Autowired
    private DecisionEngineService decisionEngineService;

    @Autowired
    private ImageStorageService imageStorageService;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired(required = false)
    private SmartRoutingEngine routingEngine;

    @Autowired(required = false)
    private com.roadwatch.backend.repositories.ComplaintAssignmentHistoryRepository historyRepository;

    @Autowired(required = false)
    private WhatsAppNotificationService whatsAppNotificationService;

    @org.springframework.beans.factory.annotation.Value("${roadwatch.ai.optional:false}")
    private boolean aiOptional;

    public Complaint createComplaint(Complaint complaint, MultipartFile image) {
        if (image == null || image.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Image is required");
        }

        try {
            // ImageStorageService now auto-detects request context for correct HTTPS/HTTP URL
            String imageUrl = imageStorageService.store(image);
            logger.debug("Complaint image stored at: {}", imageUrl);
            complaint.setImageUrl(imageUrl);

            AiAnalysisResponseDto aiResponse = null;
            try {
                aiResponse = aiServiceClient.analyzeImage(image, "/analyze_surface");
            } catch (Exception aiEx) {
                if (!aiOptional) {
                    throw aiEx;
                }
                logger.warn("AI service call failed but roadwatch.ai.optional=true. YOLO detections will be missing. Error: {}",
                        aiEx.getMessage(), aiEx);
            }
            decisionEngineService.assignSeverityAndDepartment(complaint, aiResponse);

            if (aiResponse != null && aiResponse.getDetections() != null) {
                complaint.setAiDetectionsJson(objectMapper.writeValueAsString(aiResponse.getDetections()));
            }

            complaint.setStatus("PENDING");
            complaint.setTimestamp(LocalDateTime.now());

            // Persist first so the routing audit trail can reference complaint id.
            Complaint saved = complaintRepository.save(complaint);

            // Smart routing — non-fatal, additive.
            if (routingEngine != null) {
                try {
                    var decision = routingEngine.route(saved);
                    routingEngine.applyDecision(saved, decision, "system", "AUTO");
                    saved = complaintRepository.save(saved);
                } catch (Exception routeEx) {
                    logger.warn("Smart routing failed for complaint {}: {}",
                            saved.getId(), routeEx.getMessage());
                }
            }
            return saved;
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Failed to process complaint: " + e.getMessage(),
                    e
            );
        }
    }

    public Page<Complaint> findComplaints(
            String status,
            String severity,
            String department,
            String roadType,
            String q,
            Double lat,
            Double lng,
            Double radiusKm,
            Boolean emergency,
            Long roadId,
            Long authorityId,
            Pageable pageable
    ) {
        Specification<Complaint> spec = Specification.where(null);

        if (status != null && !status.isBlank()) {
            spec = spec.and((root, query, cb) ->
                    cb.equal(cb.upper(root.get("status")), status.trim().toUpperCase()));
        }
        if (severity != null && !severity.isBlank()) {
            spec = spec.and((root, query, cb) ->
                    cb.equal(cb.upper(root.get("severity")), severity.trim().toUpperCase()));
        }
        if (department != null && !department.isBlank()) {
            spec = spec.and((root, query, cb) ->
                    cb.like(cb.lower(root.get("department")), "%" + department.trim().toLowerCase() + "%"));
        }
        if (roadType != null && !roadType.isBlank()) {
            spec = spec.and((root, query, cb) ->
                    cb.equal(cb.upper(root.get("roadType")), roadType.trim().toUpperCase()));
        }
        if (q != null && !q.isBlank()) {
            String pattern = "%" + q.trim().toLowerCase() + "%";
            spec = spec.and((root, query, cb) -> cb.or(
                    cb.like(cb.lower(root.get("description")), pattern),
                    cb.like(cb.lower(root.get("aiLabel")), pattern),
                    cb.like(cb.lower(root.get("assignedAuthorityName")), pattern)
            ));
        }
        if (Boolean.TRUE.equals(emergency)) {
            spec = spec.and((root, query, cb) -> cb.isTrue(root.get("emergency")));
        }
        if (roadId != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("roadId"), roadId));
        }
        if (authorityId != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("assignedAuthorityId"), authorityId));
        }

        Page<Complaint> result = complaintRepository.findAll(spec, pageable);

        // Geo-radius post-filter (Point not directly comparable in CriteriaQuery
        // without PostGIS-specific functions; safe at admin-dashboard scale).
        if (lat != null && lng != null && radiusKm != null && radiusKm > 0) {
            final double radiusKmFinal = radiusKm;
            final double latFinal = lat;
            final double lngFinal = lng;
            java.util.List<Complaint> filtered = result.getContent().stream()
                    .filter(c -> c.getLocation() != null)
                    .filter(c -> haversineKm(latFinal, lngFinal,
                            c.getLocation().getY(), c.getLocation().getX()) <= radiusKmFinal)
                    .toList();
            return new org.springframework.data.domain.PageImpl<>(filtered, pageable, filtered.size());
        }
        return result;
    }

    private static double haversineKm(double lat1, double lon1, double lat2, double lon2) {
        double R = 6371.0;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    public Complaint getById(Long id) {
        return complaintRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Complaint not found"));
    }

    public Complaint updateComplaint(Long id, ComplaintUpdateRequest request) {
        logger.debug("Updating complaint {} with request: {}", id, request);
        Complaint complaint = getById(id);

        String previousStatus = complaint.getStatus();
        String newStatus = null;

        // Only update status if provided and not blank
        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            String status = request.getStatus().trim().toUpperCase();
            logger.debug("Validating status: {}", status);
            if (!VALID_STATUSES.contains(status)) {
                logger.warn("Invalid status '{}' provided. Allowed: {}", status, VALID_STATUSES);
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Invalid status. Allowed: " + VALID_STATUSES
                );
            }
            complaint.setStatus(status);
            if ("RESOLVED".equalsIgnoreCase(status) && complaint.getResolvedAt() == null) {
                complaint.setResolvedAt(LocalDateTime.now());
                if (whatsAppNotificationService != null && complaint.getReporterContact() != null) {
                    whatsAppNotificationService.notifyComplaintResolved(complaint.getReporterContact(), complaint.getId(), complaint.getDepartment());
                }
            }
            if (!status.equalsIgnoreCase(previousStatus)) {
                newStatus = status;
                logger.info("Complaint {} status: {} -> {}", id, previousStatus, status);
            }
        }

        // Only update department if provided and not blank
        if (request.getDepartment() != null && !request.getDepartment().isBlank()) {
            String department = request.getDepartment().trim();
            logger.debug("Setting department: {}", department);
            complaint.setDepartment(department);
        }

        // Only update severity if provided and not blank
        if (request.getSeverity() != null && !request.getSeverity().isBlank()) {
            String severity = request.getSeverity().trim().toUpperCase();
            logger.debug("Validating severity: {}", severity);
            if (!VALID_SEVERITIES.contains(severity)) {
                logger.warn("Invalid severity '{}' provided. Allowed: {}", severity, VALID_SEVERITIES);
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid severity");
            }
            complaint.setSeverity(severity);
        }

        // Update admin notes (can be empty string or null)
        if (request.getAdminNotes() != null) {
            logger.debug("Setting admin notes");
            complaint.setAdminNotes(request.getAdminNotes());
        }

        // Update department response
        if (request.getDepartmentResponse() != null) {
            complaint.setDepartmentResponse(request.getDepartmentResponse());
            complaint.setDepartmentResponseDate(LocalDateTime.now());
        }

        // Update resolution proof URL
        if (request.getResolutionProofUrl() != null) {
            complaint.setResolutionProofUrl(request.getResolutionProofUrl());
        }

        Complaint saved = complaintRepository.save(complaint);

        // Audit trail: record any admin-driven status transition. Non-fatal —
        // a logging failure must never break the PATCH. Reuses the existing
        // complaint_assignment_history table; no new table introduced.
        if (newStatus != null && historyRepository != null) {
            try {
                ComplaintAssignmentHistory event = new ComplaintAssignmentHistory();
                event.setComplaintId(id);
                event.setAssignedAuthorityId(saved.getAssignedAuthorityId());
                event.setDepartment(saved.getDepartment());
                event.setAction("STATUS_" + newStatus);
                event.setReason(buildTransitionReason(previousStatus, newStatus, request.getAdminNotes()));
                event.setPerformedBy(currentUsernameOrSystem());
                event.setOccurredAt(LocalDateTime.now());
                event.setEmergency(saved.getEmergency());
                event.setJurisdictionTag(saved.getJurisdictionTag());
                historyRepository.save(event);
            } catch (Exception ex) {
                logger.warn("Could not persist status-change audit row for complaint {}: {}",
                        id, ex.getMessage());
            }
        }

        logger.info("Complaint {} updated successfully", id);
        return saved;
    }

    private static String buildTransitionReason(String previousStatus, String newStatus, String adminNotes) {
        String prev = previousStatus == null ? "(unset)" : previousStatus;
        StringBuilder sb = new StringBuilder("Status: ").append(prev).append(" -> ").append(newStatus);
        if (adminNotes != null && !adminNotes.isBlank()) {
            sb.append(". Notes: ").append(adminNotes.trim());
        }
        return sb.toString();
    }

    private static String currentUsernameOrSystem() {
        try {
            org.springframework.security.core.Authentication auth =
                    org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && auth.getName() != null
                    && !"anonymousUser".equals(auth.getName())) {
                return auth.getName();
            }
        } catch (Exception ignored) {
            // fall through
        }
        return "system";
    }

    public ComplaintStatsDto getStats() {
        List<Complaint> all = complaintRepository.findAll();
        long total = all.size();
        long pending = all.stream().filter(c -> "PENDING".equalsIgnoreCase(c.getStatus())).count();
        long accepted = all.stream().filter(c -> "ACCEPTED".equalsIgnoreCase(c.getStatus())).count();
        long underReview = all.stream().filter(c -> "UNDER_REVIEW".equalsIgnoreCase(c.getStatus())).count();
        long rejected = all.stream().filter(c -> "REJECTED".equalsIgnoreCase(c.getStatus())).count();
        long forwarded = all.stream().filter(c -> "FORWARDED".equalsIgnoreCase(c.getStatus())).count();
        long assigned = all.stream().filter(c -> "ASSIGNED".equalsIgnoreCase(c.getStatus())).count();
        long inProgress = all.stream().filter(c -> "IN_PROGRESS".equalsIgnoreCase(c.getStatus())).count();
        long resolved = all.stream().filter(c -> "RESOLVED".equalsIgnoreCase(c.getStatus())).count();
        long highSeverity = all.stream().filter(c -> "HIGH".equalsIgnoreCase(c.getSeverity())).count();

        return new ComplaintStatsDto(total, pending, accepted, underReview, rejected, forwarded, assigned, inProgress, resolved, highSeverity);
    }

    public List<Complaint> reanalyzeComplaintsWithMissingAiLabels() {
        List<Complaint> complaintsToReanalyze = complaintRepository.findAll().stream()
                .filter(c -> c.getAiLabel() == null
                        || "none".equalsIgnoreCase(c.getAiLabel())
                        || c.getSeverity() == null
                        || c.getSeverity().trim().isEmpty()
                        || "0".equals(c.getSeverity().trim()))
                .toList();

        List<Complaint> updated = new ArrayList<>();

        for (Complaint complaint : complaintsToReanalyze) {
            try {
                String filename = extractFilenameFromUrl(complaint.getImageUrl());
                if (filename == null) {
                    continue;
                }

                Path imagePath = imageStorageService.resolve(filename);
                var aiResponse = aiServiceClient.analyzeImage(imagePath, "/analyze_surface");
                decisionEngineService.assignSeverityAndDepartment(complaint, aiResponse);

                if (aiResponse != null && aiResponse.getDetections() != null) {
                    complaint.setAiDetectionsJson(objectMapper.writeValueAsString(aiResponse.getDetections()));
                }

                updated.add(complaintRepository.save(complaint));
            } catch (Exception ignored) {
                // Skip individual failures and continue reanalysis for other complaints.
            }
        }

        return updated;
    }

    private String extractFilenameFromUrl(String imageUrl) {
        if (imageUrl == null || imageUrl.isBlank()) {
            return null;
        }

        int lastSlash = imageUrl.lastIndexOf('/');
        if (lastSlash < 0 || lastSlash == imageUrl.length() - 1) {
            return null;
        }

        return imageUrl.substring(lastSlash + 1);
    }

    public List<Complaint> getAllForMap() {
        return complaintRepository.findAll();
    }

    public List<Complaint> getEmergencyCases() {
        return complaintRepository.findAll().stream()
                .filter(c -> "HIGH".equalsIgnoreCase(c.getSeverity()))
                .filter(c -> !"RESOLVED".equalsIgnoreCase(c.getStatus()))
                .filter(c -> !"REJECTED".equalsIgnoreCase(c.getStatus()))
                .sorted((a, b) -> {
                    if (a.getTimestamp() == null) return 1;
                    if (b.getTimestamp() == null) return -1;
                    return b.getTimestamp().compareTo(a.getTimestamp());
                })
                .toList();
    }

    public List<Complaint> getResolvedComplaints() {
        return complaintRepository.findAll().stream()
                .filter(c -> "RESOLVED".equalsIgnoreCase(c.getStatus()))
                .sorted((a, b) -> {
                    if (a.getTimestamp() == null) return 1;
                    if (b.getTimestamp() == null) return -1;
                    return b.getTimestamp().compareTo(a.getTimestamp());
                })
                .toList();
    }

    public Complaint forwardToDepartment(Long id, String department, String reason) {
        if (department == null || department.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Department is required");
        }
        Complaint complaint = getById(id);
        String previousDepartment = complaint.getDepartment();

        complaint.setStatus("FORWARDED");
        complaint.setDepartment(department);
        complaint.setRoutedDepartment(department);
        complaint.setRoutingMode("MANUAL");
        Complaint saved = complaintRepository.save(complaint);

        if (historyRepository != null) {
            ComplaintAssignmentHistory event = new ComplaintAssignmentHistory();
            event.setComplaintId(id);
            event.setDepartment(department);
            event.setPreviousDepartment(previousDepartment);
            event.setAction("FORWARDED");
            event.setReason(reason != null ? reason : "Forwarded to " + department);
            event.setPerformedBy(currentUsernameOrSystem());
            event.setOccurredAt(LocalDateTime.now());
            event.setEmergency(saved.getEmergency());
            historyRepository.save(event);
        }
        return saved;
    }

    public Complaint uploadResolutionProof(Long id, org.springframework.web.multipart.MultipartFile image) {
        if (image == null || image.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Image is required");
        }
        Complaint complaint = getById(id);
        String url;
        try {
            url = imageStorageService.store(image);
        } catch (java.io.IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Image upload failed: " + e.getMessage());
        }
        complaint.setResolutionProofUrl(url);
        return complaintRepository.save(complaint);
    }

    public java.util.Map<String, Object> getTimeline(Long id) {
        Complaint c = getById(id);
        java.util.Map<String, Object> out = new java.util.HashMap<>();
        out.put("complaint", c);
        out.put("currentStatus", c.getStatus());
        out.put("expectedRepairDate", c.getExpectedRepairDate());
        out.put("resolvedAt", c.getResolvedAt());
        out.put("assignedAuthorityId", c.getAssignedAuthorityId());
        out.put("assignedAuthorityName", c.getAssignedAuthorityName());
        out.put("emergency", c.getEmergency());
        if (historyRepository != null) {
            out.put("events", historyRepository.findByComplaintIdOrderByOccurredAtAsc(id));
        } else {
            out.put("events", java.util.List.of());
        }
        return out;
    }
}