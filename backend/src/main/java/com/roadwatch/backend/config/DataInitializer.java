package com.roadwatch.backend.config;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.roadwatch.backend.models.*;
import com.roadwatch.backend.repositories.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final RoadRepository roadRepository;
    private final AuthorityRepository authorityRepository;
    private final ContractorRepository contractorRepository;
    private final BudgetRepository budgetRepository;
    private final RepairHistoryRepository repairHistoryRepository;
    private final MaintenanceScheduleRepository maintenanceScheduleRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final Map<String, Long> roadCodeToId = new HashMap<>();
    private final Map<String, Long> contractorCodeToId = new HashMap<>();
    private final Map<String, String> contractorCodeToName = new HashMap<>();

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (roadRepository.count() > 0) {
            log.info("✅ DB mein pehle se data hai — seed skip.");
            return;
        }
        log.info("🌱 Seed data loading shuru...");
        loadAuthorities();
        loadContractors();
        loadRoads();
        loadBudgets();
        loadRepairHistory();
        loadMaintenanceSchedules();
        log.info("✅ Seed data loading complete!");
    }

    private void loadRoads() throws Exception {
        JsonNode arr = readJson("seed_data/roads.json");
        for (JsonNode n : arr) {
            Road road = new Road();
            String code = n.path("roadId").asText("");
            if (code.isEmpty()) { log.warn("Road skip missing roadId: {}", n); continue; }
            road.setRoadCode(code);
            road.setName(n.path("roadName").asText(""));
            road.setRoadType(n.path("roadType").asText(""));
            road.setCurrentCondition(toTitleCase(n.path("condition").asText("UNKNOWN")));
            road.setHealthScore(n.path("roadHealthScore").asInt(0));
            road.setLengthKm(n.path("lengthKm").asDouble(0.0));
            road.setState(n.path("state").asText(""));
            road.setDistrict(n.path("district").asText(""));
            if (!n.path("lastRelayingDate").asText("").isEmpty()) {
                road.setLastRelayingDate(LocalDate.parse(n.path("lastRelayingDate").asText("")));
            }
            String contractorCode = n.path("contractorId").asText("");
            if (!contractorCode.isEmpty() && contractorCodeToId.get(contractorCode) != null) {
                road.setContractorId(contractorCodeToId.get(contractorCode));
                road.setContractorName(contractorCodeToName.get(contractorCode));
            }
            Road saved = roadRepository.save(road);
            roadCodeToId.put(code, saved.getId());
        }
        log.info("✅ Roads loaded: {}", roadRepository.count());
    }

    private void loadAuthorities() throws Exception {
        JsonNode arr = readJson("seed_data/authorities.json");
        for (JsonNode n : arr) {
            Authority auth = new Authority();
            auth.setName(n.path("name").asText(""));
            auth.setEmail(n.path("contactEmail").asText(""));
            auth.setPhone(n.path("phone").asText(""));
            auth.setDistrict(n.path("district").asText(""));
            auth.setState(n.path("state").asText(""));
            auth.setZone(n.path("zone").asText(""));
            auth.setDepartment(n.path("type").asText(""));
            auth.setEfficiencyScore(n.path("efficiencyScore").asInt(0));
            authorityRepository.save(auth);
        }
        log.info("✅ Authorities loaded: {}", authorityRepository.count());
    }

    private void loadContractors() throws Exception {
        JsonNode arr = readJson("seed_data/contractors.json");
        for (JsonNode n : arr) {
            Contractor con = new Contractor();
            String code = n.path("contractorId").asText("");
            con.setRegistrationNumber(code);
            String name = n.path("name").asText("");
            con.setName(name);
            con.setContactEmail(n.path("email").asText(""));
            con.setContactPhone(n.path("phone").asText(""));
            con.setPerformanceScore(n.path("rating").asDouble(0.0));
            con.setTotalProjectsActive(n.path("activeProjects").asInt(0));
            con.setTotalProjectsCompleted(n.path("projectsCompleted").asInt(0));
            con.setBlacklisted(n.path("blacklisted").asBoolean(false));
            Contractor saved = contractorRepository.save(con);
            contractorCodeToId.put(code, saved.getId());
            contractorCodeToName.put(code, name);
        }
        log.info("✅ Contractors loaded: {}", contractorRepository.count());
    }

    private void loadBudgets() throws Exception {
        JsonNode arr = readJson("seed_data/road_budget.json");
        for (JsonNode n : arr) {
            Budget budget = new Budget();
            String roadCode = n.path("roadId").asText("");
            if (roadCodeToId.get(roadCode) == null) { log.warn("Budget skip: {}", roadCode); continue; }
            budget.setRoadId(roadCodeToId.get(roadCode));
            budget.setAmountSanctioned(BigDecimal.valueOf(n.path("sanctionedAmount").asDouble(0.0)));
            budget.setAmountSpent(BigDecimal.valueOf(n.path("spentAmount").asDouble(0.0)));
            roadRepository.findByRoadCode(roadCode).ifPresent(road -> {
                budget.setRoadName(road.getName());
                budget.setRoadType(road.getRoadType());
                if (road.getContractorId() != null) {
                    contractorRepository.findById(road.getContractorId()).ifPresent(c -> budget.setContractorName(c.getName()));
                }
            });
            budgetRepository.save(budget);
        }
        log.info("✅ Budgets loaded: {}", budgetRepository.count());
    }

    private void loadRepairHistory() throws Exception {
        JsonNode arr = readJson("seed_data/repair_history.json");
        for (JsonNode n : arr) {
            RepairHistory rh = new RepairHistory();
            String roadCode = n.path("roadId").asText("");
            if (roadCodeToId.get(roadCode) == null) { log.warn("RepairHistory skip: {}", roadCode); continue; }
            String repairDate = n.path("repairDate").asText("");
            if (!repairDate.isEmpty()) rh.setStartDate(LocalDate.parse(repairDate));
            rh.setRepairType(n.path("issueType").asText(""));
            rh.setStatus(n.path("status").asText(""));
            rh.setActualCost(new BigDecimal(n.path("repairCost").asLong(0)));
            rh.setRoadId(roadCodeToId.get(roadCode));
            repairHistoryRepository.save(rh);
        }
        log.info("✅ RepairHistory loaded: {}", repairHistoryRepository.count());
    }

    private void loadMaintenanceSchedules() throws Exception {
        JsonNode arr = readJson("seed_data/maintenance_schedule.json");
        for (JsonNode n : arr) {
            MaintenanceSchedule ms = new MaintenanceSchedule();
            String roadCode = n.path("roadId").asText("");
            if (roadCodeToId.get(roadCode) == null) { log.warn("MaintenanceSchedule skip: {}", roadCode); continue; }
            String scheduledStr = n.path("nextInspectionDate").asText("");
            if (!scheduledStr.isEmpty()) ms.setScheduledDate(LocalDate.parse(scheduledStr));
            ms.setMaintenanceType(n.path("plannedMaintenance").asText(""));
            ms.setStatus(n.path("status").asText(""));
            ms.setRemarks(n.path("plannedMaintenance").asText(""));
            ms.setRoadId(roadCodeToId.get(roadCode));
            maintenanceScheduleRepository.save(ms);
        }
        log.info("✅ MaintenanceSchedules loaded: {}", maintenanceScheduleRepository.count());
    }

    private JsonNode readJson(String path) throws Exception {
        ClassPathResource resource = new ClassPathResource(path);
        try (InputStream is = resource.getInputStream()) {
            return objectMapper.readTree(is);
        }
    }

    private String toTitleCase(String input) {
        if (input == null || input.isEmpty()) return input;
        return input.charAt(0) + input.substring(1).toLowerCase();
    }
}
