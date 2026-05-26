package com.roadwatch.backend.services;

import com.roadwatch.backend.dto.governance.*;
import com.roadwatch.backend.models.*;
import com.roadwatch.backend.repositories.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Aggregations for the transparency / governance dashboards.
 * All methods are read-only and DTO-shaped for the frontend.
 */
@Service
public class TransparencyAnalyticsService {

    @Autowired private RoadRepository roadRepository;
    @Autowired private ContractorRepository contractorRepository;
    @Autowired private AuthorityRepository authorityRepository;
    @Autowired private ComplaintRepository complaintRepository;
    @Autowired private RepairHistoryRepository repairHistoryRepository;
    @Autowired private RoadProjectRepository roadProjectRepository;
    @Autowired private AccountabilityScoringService scoringService;

    // ─── National headline KPIs ────────────────────────────────────────

    public GovernanceOverviewDto getOverview() {
        GovernanceOverviewDto dto = new GovernanceOverviewDto();
        List<Road> roads = roadRepository.findAll();
        List<Complaint> complaints = complaintRepository.findAll();
        List<Contractor> contractors = contractorRepository.findAll();
        List<RoadProject> projects = roadProjectRepository.findAll();

        dto.totalRoads = roads.size();
        dto.totalComplaints = complaints.size();
        dto.totalContractors = contractors.size();
        dto.totalAuthorities = authorityRepository.count();
        dto.totalProjects = projects.size();

        dto.unresolvedComplaints = (int) complaints.stream()
                .filter(c -> !"RESOLVED".equalsIgnoreCase(c.getStatus()))
                .filter(c -> !"REJECTED".equalsIgnoreCase(c.getStatus())).count();
        dto.emergencyComplaints = (int) complaints.stream()
                .filter(c -> Boolean.TRUE.equals(c.getEmergency())).count();

        dto.totalSanctionedBudget = roads.stream()
                .filter(r -> r.getBudgetSanctioned() != null)
                .mapToDouble(Road::getBudgetSanctioned).sum();
        dto.totalSpentBudget = roads.stream()
                .filter(r -> r.getBudgetSpent() != null)
                .mapToDouble(Road::getBudgetSpent).sum();
        dto.budgetUtilizationPercent = dto.totalSanctionedBudget == 0 ? 0
                : pct(dto.totalSpentBudget / dto.totalSanctionedBudget * 100);

        dto.delayedProjects = (int) projects.stream()
                .filter(p -> "DELAYED".equalsIgnoreCase(p.getStatus())
                        || "STALLED".equalsIgnoreCase(p.getStatus())).count();
        dto.blacklistedContractors = (int) contractors.stream()
                .filter(c -> Boolean.TRUE.equals(c.getBlacklisted())).count();

        dto.avgResolutionHours = pct(complaints.stream()
                .filter(c -> "RESOLVED".equalsIgnoreCase(c.getStatus()))
                .filter(c -> c.getTimestamp() != null && c.getResolvedAt() != null)
                .mapToLong(c -> Duration.between(c.getTimestamp(), c.getResolvedAt()).toHours())
                .average().orElse(0));

        return dto;
    }

    // ─── Worst roads (highest unresolved + recurring issues) ──────────

    public List<RoadHealthDto> getWorstRoads(int limit) {
        List<Road> roads = roadRepository.findAll();
        return roads.stream()
                .map(r -> {
                    RoadHealthDto d = new RoadHealthDto();
                    d.id = r.getId();
                    d.roadCode = r.getRoadCode();
                    d.name = r.getName();
                    d.roadType = r.getRoadType();
                    d.district = r.getDistrict();
                    d.authorityDepartment = r.getAuthorityDepartment();
                    d.contractorId = r.getContractorId();
                    d.lengthKm = r.getLengthKm();
                    d.healthScore = (int) Math.round(scoringService.computeRoadHealthScore(r));
                    d.recurringIssueCount = r.getRecurringIssueCount() == null ? 0 : r.getRecurringIssueCount();
                    d.unresolvedComplaints = (int) complaintRepository.findAll().stream()
                            .filter(c -> r.getId().equals(c.getRoadId()))
                            .filter(c -> !"RESOLVED".equalsIgnoreCase(c.getStatus())
                                    && !"REJECTED".equalsIgnoreCase(c.getStatus())).count();
                    return d;
                })
                .sorted(Comparator.comparingInt((RoadHealthDto d) -> d.healthScore))
                .limit(limit)
                .toList();
    }

    // ─── Contractor leaderboard ───────────────────────────────────────

    public List<ContractorScoreDto> getContractorLeaderboard() {
        return contractorRepository.findAll().stream()
                .map(c -> {
                    ContractorScoreDto dto = new ContractorScoreDto();
                    dto.id = c.getId();
                    dto.name = c.getName();
                    dto.registrationNumber = c.getRegistrationNumber();
                    dto.category = c.getCategory();
                    dto.state = c.getState();
                    dto.blacklisted = Boolean.TRUE.equals(c.getBlacklisted());
                    dto.repeatFailures = c.getRepeatFailures() == null ? 0 : c.getRepeatFailures();
                    dto.totalProjectsCompleted = c.getTotalProjectsCompleted() == null ? 0 : c.getTotalProjectsCompleted();
                    dto.totalProjectsActive = c.getTotalProjectsActive() == null ? 0 : c.getTotalProjectsActive();
                    dto.score = pct(scoringService.computeContractorScore(c));
                    return dto;
                })
                .sorted(Comparator.comparingDouble((ContractorScoreDto d) -> d.score).reversed())
                .toList();
    }

    // ─── Department efficiency ────────────────────────────────────────

    public List<DepartmentEfficiencyDto> getDepartmentEfficiency() {
        Map<String, List<Complaint>> byDept = complaintRepository.findAll().stream()
                .filter(c -> c.getRoutedDepartment() != null || c.getDepartment() != null)
                .collect(Collectors.groupingBy(c -> {
                    String d = c.getRoutedDepartment() != null ? c.getRoutedDepartment() : c.getDepartment();
                    return d == null ? "UNASSIGNED" : d.toUpperCase();
                }));

        return byDept.entrySet().stream().map(e -> {
            DepartmentEfficiencyDto d = new DepartmentEfficiencyDto();
            d.department = e.getKey();
            List<Complaint> list = e.getValue();
            d.totalComplaints = list.size();
            d.resolved = (int) list.stream().filter(c -> "RESOLVED".equalsIgnoreCase(c.getStatus())).count();
            d.pending = (int) list.stream().filter(c -> "PENDING".equalsIgnoreCase(c.getStatus())).count();
            d.inProgress = (int) list.stream().filter(c -> "IN_PROGRESS".equalsIgnoreCase(c.getStatus())).count();
            d.resolutionRatePercent = d.totalComplaints == 0 ? 0
                    : pct((double) d.resolved / d.totalComplaints * 100);
            d.avgResolutionHours = pct(list.stream()
                    .filter(c -> "RESOLVED".equalsIgnoreCase(c.getStatus()))
                    .filter(c -> c.getTimestamp() != null && c.getResolvedAt() != null)
                    .mapToLong(c -> Duration.between(c.getTimestamp(), c.getResolvedAt()).toHours())
                    .average().orElse(0));
            return d;
        }).sorted(Comparator.comparingDouble((DepartmentEfficiencyDto d) -> d.resolutionRatePercent).reversed())
          .toList();
    }

    // ─── Budget utilization per road / department ─────────────────────

    public List<BudgetUtilizationDto> getBudgetUtilization() {
        return roadRepository.findAll().stream()
                .filter(r -> r.getBudgetSanctioned() != null && r.getBudgetSanctioned() > 0)
                .map(r -> {
                    BudgetUtilizationDto b = new BudgetUtilizationDto();
                    b.roadId = r.getId();
                    b.roadCode = r.getRoadCode();
                    b.name = r.getName();
                    b.roadType = r.getRoadType();
                    b.contractorId = r.getContractorId();
                    b.sanctioned = r.getBudgetSanctioned();
                    b.spent = r.getBudgetSpent() == null ? 0 : r.getBudgetSpent();
                    b.utilizationPercent = pct(b.spent / b.sanctioned * 100);
                    b.overrun = b.spent > b.sanctioned;
                    return b;
                })
                .sorted(Comparator.comparingDouble((BudgetUtilizationDto b) -> b.utilizationPercent).reversed())
                .toList();
    }

    // ─── Heatmap data: complaint clusters by location ─────────────────

    public List<HeatmapPointDto> getComplaintHeatmap() {
        return complaintRepository.findAll().stream()
                .filter(c -> c.getLocation() != null)
                .map(c -> {
                    HeatmapPointDto h = new HeatmapPointDto();
                    h.complaintId = c.getId();
                    h.lat = c.getLocation().getY();
                    h.lng = c.getLocation().getX();
                    h.severity = c.getSeverity();
                    h.status = c.getStatus();
                    h.aiLabel = c.getAiLabel();
                    h.weight = severityWeight(c.getSeverity());
                    return h;
                })
                .toList();
    }

    // ─── Repeat-failure / corruption indicators ───────────────────────

    public List<CorruptionIndicatorDto> getCorruptionIndicators() {
        List<CorruptionIndicatorDto> out = new ArrayList<>();
        // Roads where spent > sanctioned
        roadRepository.findAll().stream()
                .filter(r -> r.getBudgetSanctioned() != null && r.getBudgetSpent() != null
                        && r.getBudgetSpent() > r.getBudgetSanctioned())
                .forEach(r -> {
                    CorruptionIndicatorDto i = new CorruptionIndicatorDto();
                    i.kind = "BUDGET_OVERRUN";
                    i.entityType = "ROAD";
                    i.entityId = r.getId();
                    i.entityName = r.getName();
                    i.detail = "Spent ₹" + r.getBudgetSpent() + " against sanctioned ₹" + r.getBudgetSanctioned();
                    i.severity = "HIGH";
                    out.add(i);
                });
        // Repair failures within warranty
        repairHistoryRepository.findByFailedWithinWarrantyTrue().forEach(r -> {
            CorruptionIndicatorDto i = new CorruptionIndicatorDto();
            i.kind = "WARRANTY_FAILURE";
            i.entityType = "REPAIR";
            i.entityId = r.getId();
            i.entityName = "Repair #" + r.getId() + " road " + r.getRoadId();
            i.detail = "Repair failed within warranty period of " + r.getWarrantyMonths() + " months";
            i.severity = "HIGH";
            out.add(i);
        });
        // Roads with high recurring issue count
        roadRepository.findAll().stream()
                .filter(r -> r.getRecurringIssueCount() != null && r.getRecurringIssueCount() >= 3)
                .forEach(r -> {
                    CorruptionIndicatorDto i = new CorruptionIndicatorDto();
                    i.kind = "REPEAT_FAILURE_ROAD";
                    i.entityType = "ROAD";
                    i.entityId = r.getId();
                    i.entityName = r.getName();
                    i.detail = "Road has " + r.getRecurringIssueCount() + " recurring issues despite repairs";
                    i.severity = "MEDIUM";
                    out.add(i);
                });
        return out;
    }

    // ─── Repair / project delay summary ───────────────────────────────

    public List<DelayedRepairDto> getDelayedRepairs() {
        LocalDate today = LocalDate.now();
        List<DelayedRepairDto> out = new ArrayList<>();
        repairHistoryRepository.findAll().stream()
                .filter(h -> "IN_PROGRESS".equalsIgnoreCase(h.getStatus())
                        || "DELAYED".equalsIgnoreCase(h.getStatus()))
                .filter(h -> h.getExpectedCompletionDate() != null
                        && h.getExpectedCompletionDate().isBefore(today)
                        && h.getCompletionDate() == null)
                .forEach(h -> {
                    DelayedRepairDto d = new DelayedRepairDto();
                    d.repairId = h.getId();
                    d.roadId = h.getRoadId();
                    d.contractorId = h.getContractorId();
                    d.repairType = h.getRepairType();
                    d.expectedCompletion = h.getExpectedCompletionDate();
                    d.delayDays = (int) Duration.between(
                            h.getExpectedCompletionDate().atStartOfDay(),
                            today.atStartOfDay()).toDays();
                    d.status = h.getStatus();
                    out.add(d);
                });
        out.sort(Comparator.comparingInt((DelayedRepairDto d) -> d.delayDays).reversed());
        return out;
    }

    // ─── helpers ──────────────────────────────────────────────────────

    private double severityWeight(String sev) {
        if (sev == null) return 0.3;
        switch (sev.toUpperCase()) {
            case "HIGH": return 1.0;
            case "MEDIUM": return 0.6;
            case "LOW": return 0.3;
            default: return 0.3;
        }
    }

    private double pct(double v) {
        return BigDecimal.valueOf(v).setScale(2, RoundingMode.HALF_UP).doubleValue();
    }
}
