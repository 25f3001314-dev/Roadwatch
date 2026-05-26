package com.roadwatch.backend.controllers;

import com.roadwatch.backend.services.GovernanceService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/governance")
@CrossOrigin
public class GovernanceController {

    private final GovernanceService governanceService;

    public GovernanceController(GovernanceService governanceService) {
        this.governanceService = governanceService;
    }

    @GetMapping("/roads")
    public List<Map<String, Object>> getRoads() {
        return governanceService.getRoads();
    }

    @GetMapping("/contractors")
    public List<Map<String, Object>> getContractors() {
        return governanceService.getContractors();
    }

    @GetMapping("/budgets")
    public List<Map<String, Object>> getBudgets() {
        return governanceService.getBudgets();
    }
}