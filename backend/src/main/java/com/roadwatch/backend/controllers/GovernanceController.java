package com.roadwatch.backend.controllers;

import com.roadwatch.backend.dto.governance.*;
import com.roadwatch.backend.services.AccountabilityScoringService;
import com.roadwatch.backend.services.TransparencyAnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Public-facing transparency & governance analytics endpoints.
 *
 * NOTE: read endpoints under /api/governance/public/** are designed to be
 * citizen-accessible and rely on the public-permit configuration in
 * SecurityConfig. Admin-only operations live under /api/governance/admin/**.
 */
@RestController
@RequestMapping("/api/governance")
public class GovernanceController {

    @Autowired private TransparencyAnalyticsService analytics;
    @Autowired private AccountabilityScoringService scoring;

    @GetMapping("/public/overview")
    public GovernanceOverviewDto overview() {
        return analytics.getOverview();
    }

    @GetMapping("/public/worst-roads")
    public List<RoadHealthDto> worstRoads(@RequestParam(defaultValue = "10") int limit) {
        return analytics.getWorstRoads(Math.min(Math.max(limit, 1), 100));
    }

    @GetMapping("/public/contractor-leaderboard")
    public List<ContractorScoreDto> contractorLeaderboard() {
        return analytics.getContractorLeaderboard();
    }

    @GetMapping("/public/department-efficiency")
    public List<DepartmentEfficiencyDto> departmentEfficiency() {
        return analytics.getDepartmentEfficiency();
    }

    @GetMapping("/public/budget-utilization")
    public List<BudgetUtilizationDto> budgetUtilization() {
        return analytics.getBudgetUtilization();
    }

    @GetMapping("/public/heatmap")
    public List<HeatmapPointDto> heatmap() {
        return analytics.getComplaintHeatmap();
    }

    @GetMapping("/public/corruption-indicators")
    public List<CorruptionIndicatorDto> corruptionIndicators() {
        return analytics.getCorruptionIndicators();
    }

    @GetMapping("/public/delayed-repairs")
    public List<DelayedRepairDto> delayedRepairs() {
        return analytics.getDelayedRepairs();
    }

    @PostMapping("/admin/refresh-scores")
    public Map<String, Object> refreshScores() {
        scoring.refreshAllScores();
        return Map.of("status", "ok", "message", "All accountability scores refreshed");
    }
}
