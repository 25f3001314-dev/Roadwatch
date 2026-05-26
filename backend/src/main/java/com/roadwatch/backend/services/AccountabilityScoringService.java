package com.roadwatch.backend.services;

import com.roadwatch.backend.models.Authority;
import com.roadwatch.backend.models.Complaint;
import com.roadwatch.backend.models.Contractor;
import com.roadwatch.backend.models.RepairHistory;
import com.roadwatch.backend.models.Road;
import com.roadwatch.backend.repositories.AuthorityRepository;
import com.roadwatch.backend.repositories.ComplaintRepository;
import com.roadwatch.backend.repositories.ContractorRepository;
import com.roadwatch.backend.repositories.RepairHistoryRepository;
import com.roadwatch.backend.repositories.RoadRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Computes contractor / authority / road accountability scores.
 *
 * All scores are 0-100, higher = better.
 *
 * Implementation is intentionally simple and deterministic so the scoring
 * is auditable and explainable to citizens.
 */
@Service
public class AccountabilityScoringService {
    private static final Logger logger = LoggerFactory.getLogger(AccountabilityScoringService.class);

    @Autowired private ComplaintRepository complaintRepository;
    @Autowired private RoadRepository roadRepository;
    @Autowired private ContractorRepository contractorRepository;
    @Autowired private AuthorityRepository authorityRepository;
    @Autowired private RepairHistoryRepository repairHistoryRepository;

    /**
     * Contractor score = base 100 - penalties for failed repairs, warranty breaches,
     * and active blacklist; bonus for completed projects.
     */
    public double computeContractorScore(Contractor c) {
        if (c == null) return 0;
        double score = 100;

        if (Boolean.TRUE.equals(c.getBlacklisted())) score -= 60;
        if (c.getRepeatFailures() != null) score -= Math.min(40, c.getRepeatFailures() * 5);

        List<RepairHistory> history = repairHistoryRepository.findByContractorIdOrderByStartDateDesc(c.getId());
        long failedWarranty = history.stream()
                .filter(r -> Boolean.TRUE.equals(r.getFailedWithinWarranty()))
                .count();
        score -= Math.min(30, failedWarranty * 4);

        long delayed = history.stream()
                .filter(r -> "DELAYED".equalsIgnoreCase(r.getStatus())).count();
        score -= Math.min(20, delayed * 2);

        long completed = history.stream()
                .filter(r -> "COMPLETED".equalsIgnoreCase(r.getStatus()))
                .filter(r -> !Boolean.TRUE.equals(r.getFailedWithinWarranty()))
                .count();
        score += Math.min(20, completed * 0.5);

        return clamp(score);
    }

    /**
     * Authority efficiency = base 100 - penalty for slow/unresolved complaints
     * + bonus for fast resolution times.
     */
    public double computeAuthorityScore(Authority a) {
        if (a == null) return 0;
        List<Complaint> complaints = complaintRepository.findAll().stream()
                .filter(c -> a.getId().equals(c.getAssignedAuthorityId())
                        || (a.getDepartment() != null
                                && a.getDepartment().equalsIgnoreCase(c.getRoutedDepartment())))
                .toList();

        if (complaints.isEmpty()) return 75; // neutral baseline

        long total = complaints.size();
        long resolved = complaints.stream()
                .filter(c -> "RESOLVED".equalsIgnoreCase(c.getStatus())).count();
        long unresolved = total - resolved;

        double resolutionRate = (double) resolved / total; // 0..1

        double avgHours = complaints.stream()
                .filter(c -> "RESOLVED".equalsIgnoreCase(c.getStatus()))
                .filter(c -> c.getTimestamp() != null && c.getResolvedAt() != null)
                .mapToLong(c -> Duration.between(c.getTimestamp(), c.getResolvedAt()).toHours())
                .average().orElse(72);

        double score = 100 * resolutionRate;
        score -= Math.min(30, unresolved * 0.5);
        if (avgHours <= 24) score += 10;
        else if (avgHours <= 72) score += 5;
        else if (avgHours > 168) score -= 10;

        return clamp(score);
    }

    /**
     * Road health = base 100 - penalty per unresolved complaint and recurring issue,
     * + small bonus if recently relayed.
     */
    public double computeRoadHealthScore(Road r) {
        if (r == null) return 0;
        double score = 100;

        List<Complaint> complaints = complaintRepository.findAll().stream()
                .filter(c -> r.getId().equals(c.getRoadId())
                        || (c.getRoadType() != null && c.getRoadType().equalsIgnoreCase(r.getRoadType())))
                .toList();

        long unresolved = complaints.stream()
                .filter(c -> !"RESOLVED".equalsIgnoreCase(c.getStatus()))
                .filter(c -> !"REJECTED".equalsIgnoreCase(c.getStatus())).count();
        long high = complaints.stream()
                .filter(c -> "HIGH".equalsIgnoreCase(c.getSeverity())).count();

        score -= Math.min(40, unresolved * 2);
        score -= Math.min(30, high * 3);
        if (r.getRecurringIssueCount() != null) score -= Math.min(20, r.getRecurringIssueCount() * 4);

        if (r.getLastRepairDate() != null) {
            long daysSince = Duration.between(r.getLastRepairDate().atStartOfDay(), LocalDateTime.now()).toDays();
            if (daysSince <= 180) score += 5;
            else if (daysSince > 1825) score -= 10; // > 5 years
        }
        return clamp(score);
    }

    /**
     * Refresh cached scores on all entities. Safe to call periodically.
     */
    public void refreshAllScores() {
        logger.info("Refreshing accountability scores...");
        contractorRepository.findAll().forEach(c -> {
            c.setPerformanceScore(computeContractorScore(c));
            contractorRepository.save(c);
        });
        authorityRepository.findAll().forEach(a -> {
            a.setEfficiencyScore((int) Math.round(computeAuthorityScore(a)));
            authorityRepository.save(a);
        });
        roadRepository.findAll().forEach(r -> {
            r.setHealthScore((int) Math.round(computeRoadHealthScore(r)));
            r.setCurrentCondition(deriveCondition(r.getHealthScore()));
            roadRepository.save(r);
        });
    }

    private String deriveCondition(Integer score) {
        if (score == null) return "UNKNOWN";
        if (score >= 85) return "EXCELLENT";
        if (score >= 70) return "GOOD";
        if (score >= 50) return "FAIR";
        if (score >= 30) return "POOR";
        return "CRITICAL";
    }

    private double clamp(double v) {
        return Math.max(0, Math.min(100, v));
    }
}
