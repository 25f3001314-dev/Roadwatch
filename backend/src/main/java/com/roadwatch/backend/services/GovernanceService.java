package com.roadwatch.backend.services;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;

import java.io.File;
import java.util.List;
import java.util.Map;

@Service
public class GovernanceService {

    private final ObjectMapper objectMapper = new ObjectMapper();

    private List<Map<String, Object>> roads;
    private List<Map<String, Object>> contractors;
    private List<Map<String, Object>> budgets;

    @PostConstruct
    public void init() {
        try {
            roads = objectMapper.readValue(
                    new File("seed_data/roads.json"),
                    new TypeReference<>() {}
            );

            contractors = objectMapper.readValue(
                    new File("seed_data/contractors.json"),
                    new TypeReference<>() {}
            );

            budgets = objectMapper.readValue(
                    new File("seed_data/road_budget.json"),
                    new TypeReference<>() {}
            );

            System.out.println("Governance datasets loaded successfully.");

        } catch (Exception e) {
            System.err.println("Failed to load governance datasets.");
            e.printStackTrace();
        }
    }

    public List<Map<String, Object>> getRoads() {
        return roads;
    }

    public List<Map<String, Object>> getContractors() {
        return contractors;
    }

    public List<Map<String, Object>> getBudgets() {
        return budgets;
    }
}
