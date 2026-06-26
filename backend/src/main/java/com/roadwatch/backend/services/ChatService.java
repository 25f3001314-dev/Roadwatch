package com.roadwatch.backend.services;

import com.roadwatch.backend.models.*;
import com.roadwatch.backend.repositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final RoadRepository roadRepository;
    private final BudgetRepository budgetRepository;
    private final RepairHistoryRepository repairHistoryRepository;
    private final MaintenanceScheduleRepository maintenanceScheduleRepository;
    private final ContractorRepository contractorRepository;
    private final AuthorityRepository authorityRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${roadwatch.chat.mistral.api-key}")
    private String apiKey;

    @Value("${roadwatch.chat.mistral.url}")
    private String apiUrl;

    @Value("${roadwatch.chat.mistral.model}")
    private String apiModel;

    public String getAiResponse(String userMessage) {
        List<Road> roads = roadRepository.findAll();
        StringBuilder dbContext = new StringBuilder("Current Road Database State:\n");

        for (Road road : roads.subList(0, Math.min(roads.size(), 15))) {

            dbContext.append(String.format("- Road: %s (%s), Type: %s, District: %s, State: %s, Condition: %s, Health Score: %d\n",
                    road.getName(), road.getRoadCode(), road.getRoadType(),
                    road.getDistrict(), road.getState(),
                    road.getCurrentCondition(), road.getHealthScore()));

            if (road.getContractorId() != null) {
                contractorRepository.findById(road.getContractorId()).ifPresent(c -> {
                    dbContext.append(String.format("  -> Contractor: %s | Phone: %s | Email: %s | Rating: %.1f | Blacklisted: %s\n",
                            c.getName(),
                            c.getContactPhone() != null ? c.getContactPhone() : "N/A",
                            c.getContactEmail() != null ? c.getContactEmail() : "N/A",
                            c.getPerformanceScore() != null ? c.getPerformanceScore() : 0.0,
                            Boolean.TRUE.equals(c.getBlacklisted()) ? "YES" : "No"));
                });
            }

            authorityRepository.findAll().stream()
                .filter(a -> "Central Govt".equals(a.getDepartment()) || "National".equals(a.getState()))
                .findFirst().ifPresent(auth -> {
                    dbContext.append(String.format("  -> Authority: %s | Email: %s | Phone: %s | Zone: %s\n",
                            auth.getName(),
                            auth.getEmail() != null ? auth.getEmail() : "N/A",
                            auth.getPhone() != null ? auth.getPhone() : "N/A",
                            auth.getZone() != null ? auth.getZone() : "N/A"));
                });

            budgetRepository.findByRoadId(road.getId()).ifPresent(budget -> {
                dbContext.append(String.format("  -> Budget: Sanctioned Rs.%s | Spent Rs.%s\n",
                        budget.getAmountSanctioned(), budget.getAmountSpent()));
            });

            List<RepairHistory> repairs = repairHistoryRepository.findByRoadId(road.getId());
            if (!repairs.isEmpty()) {
                dbContext.append(String.format("  -> Repair History (%d records):\n", repairs.size()));
                for (RepairHistory rh : repairs) {
                    dbContext.append(String.format("     * %s | Date: %s | Cost: Rs.%s | Status: %s\n",
                            rh.getRepairType() != null ? rh.getRepairType() : "General Repair",
                            rh.getStartDate() != null ? rh.getStartDate() : "N/A",
                            rh.getActualCost() != null ? rh.getActualCost() : "N/A",
                            rh.getStatus() != null ? rh.getStatus() : "N/A"));
                }
            } else {
                dbContext.append("  -> Repair History: No records.\n");
            }

            List<MaintenanceSchedule> schedules = maintenanceScheduleRepository.findByRoadId(road.getId());
            if (!schedules.isEmpty()) {
                dbContext.append(String.format("  -> Maintenance Schedule (%d tasks):\n", schedules.size()));
                for (MaintenanceSchedule ms : schedules) {
                    dbContext.append(String.format("     * %s | Date: %s | Remarks: %s | Status: %s\n",
                            ms.getMaintenanceType() != null ? ms.getMaintenanceType() : "General",
                            ms.getScheduledDate() != null ? ms.getScheduledDate() : "N/A",
                            ms.getRemarks() != null ? ms.getRemarks() : "N/A",
                            ms.getStatus() != null ? ms.getStatus() : "N/A"));
                }
            } else {
                dbContext.append("  -> Maintenance Schedule: None scheduled.\n");
            }

            dbContext.append("\n");
        }

        String systemPrompt = "You are RoadWatch AI, an intelligent civic assistant for India's road infrastructure. " +
                "Use ONLY the following real-time database context to answer questions. " +
                "Never use placeholder values like XXXX. If data is available in context, use it exactly. " +
                "Be professional, accurate, and concise. " +
                "When user wants to register a complaint, generate a unique Complaint ID in format RW-<YEAR>-<5DIGIT_RANDOM> (e.g. RW-2026-48291), assign status as 'Pending', and show: Complaint ID, Road, Issue Type, Status, Assigned Authority with contact.\n\n" + dbContext.toString();

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);

            Map<String, Object> body = new HashMap<>();
            body.put("model", apiModel);

            List<Map<String, String>> messages = new ArrayList<>();
            messages.add(Map.of("role", "system", "content", systemPrompt));
            messages.add(Map.of("role", "user", "content", userMessage));
            body.put("messages", messages);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(apiUrl, entity, Map.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                List<Map<String, Object>> choices = (List<Map<String, Object>>) response.getBody().get("choices");
                if (!choices.isEmpty()) {
                    Map<String, Object> messageObj = (Map<String, Object>) choices.get(0).get("message");
                    return (String) messageObj.get("content");
                }
            }
            return "Sorry, I am facing trouble processing that request right now.";
        } catch (Exception e) {
            return "Error communicating with AI Engine: " + e.getMessage();
        }
    }
}
