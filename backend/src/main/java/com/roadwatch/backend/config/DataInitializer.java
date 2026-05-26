package com.roadwatch.backend.config;

import com.roadwatch.backend.models.*;
import com.roadwatch.backend.repositories.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * Seeds reference data for the governance platform on first boot.
 *
 * Idempotent — only inserts when each repository is empty.
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private final RoadRepository roadRepository;
    private final AuthorityRepository authorityRepository;
    private final ContractorRepository contractorRepository;
    private final RoadProjectRepository projectRepository;
    private final RepairHistoryRepository repairRepository;
    private final MaintenanceScheduleRepository scheduleRepository;

    public DataInitializer(RoadRepository roadRepository,
                           AuthorityRepository authorityRepository,
                           ContractorRepository contractorRepository,
                           RoadProjectRepository projectRepository,
                           RepairHistoryRepository repairRepository,
                           MaintenanceScheduleRepository scheduleRepository) {
        this.roadRepository = roadRepository;
        this.authorityRepository = authorityRepository;
        this.contractorRepository = contractorRepository;
        this.projectRepository = projectRepository;
        this.repairRepository = repairRepository;
        this.scheduleRepository = scheduleRepository;
    }

    @Override
    public void run(String... args) {
        seedContractors();
        seedRoads();
        seedAuthorities();
        seedProjects();
        seedRepairs();
        seedSchedules();
    }

    private void seedContractors() {
        if (contractorRepository.count() > 0) return;
        contractorRepository.saveAll(List.of(
                contractor("LT-2003-A1", "L&T Infrastructure", "A", "Maharashtra", 145, 12, 1, false),
                contractor("TP-2009-A2", "Tata Projects", "A", "Maharashtra", 98, 8, 2, false),
                contractor("DBL-1999-A3", "Dilip Buildcon", "A", "Madhya Pradesh", 76, 14, 4, false),
                contractor("IRB-2010-A4", "IRB Infrastructure", "A", "Maharashtra", 62, 9, 0, false),
                contractor("KEC-2007-B1", "KEC Roads Pvt Ltd", "B", "Uttar Pradesh", 24, 5, 3, false),
                contractor("BLK-2012-C1", "Blacklisted Builders Ltd", "C", "Bihar", 11, 0, 9, true)
        ));
    }

    private void seedRoads() {
        if (roadRepository.count() > 0) return;
        roadRepository.saveAll(List.of(
                road("ROAD-NH-01", "Delhi-Meerut Expressway", "NH", "NHAI", 1L, 450_000_000d, 420_000_000d,
                        "OPERATIONAL", "Meerut", "Uttar Pradesh", LocalDate.now().minusYears(3),
                        LocalDate.now().minusMonths(8), 82, 1, 90.0),
                road("ROAD-NH-28", "Gorakhpur-Basti Highway", "NH", "NHAI", 2L, 620_000_000d, 580_000_000d,
                        "UNDER_REPAIR", "Gorakhpur", "Uttar Pradesh", LocalDate.now().minusYears(5),
                        LocalDate.now().minusMonths(2), 65, 3, 110.0),
                road("ROAD-SH-12", "Lucknow-Barabanki Highway", "SH", "PWD", 3L, 180_000_000d, 195_000_000d,
                        "OPERATIONAL", "Lucknow", "Uttar Pradesh", LocalDate.now().minusYears(7),
                        LocalDate.now().minusYears(2), 42, 5, 56.0),
                road("ROAD-MDR-44", "Kanpur Outer Ring Road", "MDR", "PWD", 4L, 95_000_000d, 88_000_000d,
                        "OPERATIONAL", "Kanpur", "Uttar Pradesh", LocalDate.now().minusYears(2),
                        LocalDate.now().minusMonths(11), 78, 0, 28.0),
                road("ROAD-CITY-19", "Hazratganj Civic Loop", "CITY", "NAGAR_NIGAM", 5L, 32_000_000d, 31_500_000d,
                        "OPERATIONAL", "Lucknow", "Uttar Pradesh", LocalDate.now().minusYears(4),
                        LocalDate.now().minusMonths(5), 70, 2, 6.5),
                road("ROAD-RUR-203", "Sitapur Rural Connector", "RURAL", "RURAL_ROADS", 5L, 18_000_000d, 16_000_000d,
                        "OPERATIONAL", "Sitapur", "Uttar Pradesh", LocalDate.now().minusYears(6),
                        LocalDate.now().minusYears(3), 38, 6, 18.0)
        ));
    }

    private void seedAuthorities() {
        if (authorityRepository.count() > 0) return;
        authorityRepository.saveAll(List.of(
                authority("Er. Rajesh Kumar Sharma", "Chief Engineer", "NHAI", "Meerut", "ee.nhai.meerut@gov.in"),
                authority("Er. Anil Kumar Verma", "Executive Engineer", "PWD", "Lucknow", "ee.pwd.lko@gov.in"),
                authority("Er. Priya Saxena", "Asst. Engineer", "PWD", "Kanpur", "ae.pwd.knp@gov.in"),
                authority("Er. Manoj Tripathi", "Engineer", "NAGAR_NIGAM", "Lucknow", "engg.lmc@gov.in"),
                authority("Er. Sunita Devi", "Engineer", "RURAL_ROADS", "Sitapur", "engg.rr.sitapur@gov.in"),
                authority("Er. Rakesh Pandey", "Project Manager", "SMART_CITY", "Lucknow", "pm.smartcity.lko@gov.in")
        ));
    }

    private void seedProjects() {
        if (projectRepository.count() > 0) return;
        projectRepository.saveAll(List.of(
                project("PRJ-2024-001", "Delhi-Meerut Expressway Phase 4", 1L, 1L, "NHAI",
                        "WIDENING", LocalDate.now().minusMonths(18), LocalDate.now().minusMonths(15),
                        LocalDate.now().plusMonths(6), null, 450_000_000d, 290_000_000d, 64.0,
                        "IN_PROGRESS", 0),
                project("PRJ-2023-014", "Gorakhpur Basti Resurfacing", 2L, 2L, "NHAI",
                        "RESURFACING", LocalDate.now().minusYears(2), LocalDate.now().minusMonths(20),
                        LocalDate.now().minusMonths(2), null, 180_000_000d, 175_000_000d, 92.0,
                        "DELAYED", 60),
                project("PRJ-2022-077", "Sitapur Rural Connector Repair", 6L, 5L, "RURAL_ROADS",
                        "PATCH_WORK", LocalDate.now().minusYears(3), LocalDate.now().minusYears(2),
                        LocalDate.now().minusYears(1), LocalDate.now().minusMonths(10), 18_000_000d, 16_000_000d,
                        100.0, "COMPLETED", 0)
        ));
    }

    private void seedRepairs() {
        if (repairRepository.count() > 0) return;
        repairRepository.saveAll(List.of(
                repair(2L, 2L, "POTHOLE_FILL", LocalDate.now().minusMonths(6), LocalDate.now().minusMonths(5),
                        BigDecimal.valueOf(420_000), BigDecimal.valueOf(450_000), "COMPLETED", true, 12, false),
                repair(3L, 3L, "RESURFACING", LocalDate.now().minusYears(2), LocalDate.now().minusMonths(22),
                        BigDecimal.valueOf(8_500_000), BigDecimal.valueOf(9_200_000), "COMPLETED", true, 60, false),
                repair(6L, 5L, "PATCH_WORK", LocalDate.now().minusMonths(8), null,
                        BigDecimal.valueOf(280_000), null, "DELAYED", false, 12, false)
        ));
    }

    private void seedSchedules() {
        if (scheduleRepository.count() > 0) return;
        scheduleRepository.saveAll(List.of(
                schedule(1L, "ROUTINE", LocalDate.now().plusMonths(2), "SCHEDULED", "NHAI", 1L, 180),
                schedule(2L, "EMERGENCY", LocalDate.now().plusDays(5), "SCHEDULED", "NHAI", 2L, null),
                schedule(3L, "PERIODIC", LocalDate.now().minusDays(10), "OVERDUE", "PWD", 3L, 365)
        ));
    }

    // ─── tiny factory helpers ─────────────────────────────────────────

    private Contractor contractor(String reg, String name, String cat, String state,
                                  int completed, int active, int failures, boolean blacklisted) {
        Contractor c = new Contractor();
        c.setRegistrationNumber(reg);
        c.setName(name);
        c.setCategory(cat);
        c.setState(state);
        c.setTotalProjectsCompleted(completed);
        c.setTotalProjectsActive(active);
        c.setRepeatFailures(failures);
        c.setBlacklisted(blacklisted);
        c.setBlacklistReason(blacklisted ? "Repeated quality failures and warranty breaches" : null);
        c.setRegisteredSince(LocalDate.now().minusYears(8));
        return c;
    }

    private Road road(String code, String name, String type, String dept, Long contractorId,
                      Double sanctioned, Double spent, String status, String district, String state,
                      LocalDate buildDate, LocalDate lastRepairDate, int healthScore, int recurring, double lengthKm) {
        Road r = new Road();
        r.setRoadCode(code);
        r.setName(name);
        r.setRoadType(type);
        r.setAuthorityDepartment(dept);
        r.setContractorId(contractorId);
        r.setBudgetSanctioned(sanctioned);
        r.setBudgetSpent(spent);
        r.setStatus(status);
        r.setDistrict(district);
        r.setState(state);
        r.setBuildDate(buildDate);
        r.setLastRepairDate(lastRepairDate);
        r.setLastRelayingDate(lastRepairDate);
        r.setHealthScore(healthScore);
        r.setRecurringIssueCount(recurring);
        r.setLengthKm(lengthKm);
        r.setCurrentCondition(healthScore >= 85 ? "EXCELLENT" :
                healthScore >= 70 ? "GOOD" : healthScore >= 50 ? "FAIR" : healthScore >= 30 ? "POOR" : "CRITICAL");
        r.setJurisdictionTag(district + "/" + dept);
        r.setNextScheduledMaintenance(LocalDate.now().plusMonths(3));
        return r;
    }

    private Authority authority(String name, String designation, String department,
                                String district, String email) {
        Authority a = new Authority();
        a.setName(name);
        a.setDesignation(designation);
        a.setDepartment(department);
        a.setZone(department + " - " + district);
        a.setDistrict(district);
        a.setEmail(email);
        a.setState("Uttar Pradesh");
        a.setEfficiencyScore(75);
        a.setTotalComplaintsHandled(0);
        return a;
    }

    private RoadProject project(String code, String name, Long roadId, Long contractorId, String dept,
                                String type, LocalDate sanction, LocalDate start, LocalDate expected,
                                LocalDate actual, Double sanctioned, Double spent, Double progress,
                                String status, int delayDays) {
        RoadProject p = new RoadProject();
        p.setProjectCode(code);
        p.setName(name);
        p.setRoadId(roadId);
        p.setContractorId(contractorId);
        p.setAuthorityDepartment(dept);
        p.setProjectType(type);
        p.setSanctionDate(sanction);
        p.setStartDate(start);
        p.setExpectedCompletion(expected);
        p.setActualCompletion(actual);
        p.setSanctionedAmount(BigDecimal.valueOf(sanctioned));
        p.setExpenditure(BigDecimal.valueOf(spent));
        p.setProgressPercent(progress);
        p.setStatus(status);
        p.setDelayDays(delayDays);
        return p;
    }

    private RepairHistory repair(Long roadId, Long contractorId, String type,
                                 LocalDate start, LocalDate completion,
                                 BigDecimal estimated, BigDecimal actual, String status,
                                 boolean withinWarranty, int warrantyMonths, boolean failed) {
        RepairHistory r = new RepairHistory();
        r.setRoadId(roadId);
        r.setContractorId(contractorId);
        r.setRepairType(type);
        r.setStartDate(start);
        r.setExpectedCompletionDate(start.plusMonths(1));
        r.setCompletionDate(completion);
        r.setEstimatedCost(estimated);
        r.setActualCost(actual);
        r.setStatus(status);
        r.setWarrantyMonths(warrantyMonths);
        r.setFailedWithinWarranty(failed);
        r.setQualityRating(failed ? 2 : 4);
        return r;
    }

    private MaintenanceSchedule schedule(Long roadId, String type, LocalDate date, String status,
                                         String dept, Long contractorId, Integer freqDays) {
        MaintenanceSchedule m = new MaintenanceSchedule();
        m.setRoadId(roadId);
        m.setMaintenanceType(type);
        m.setScheduledDate(date);
        m.setStatus(status);
        m.setAssignedDepartment(dept);
        m.setAssignedContractorId(contractorId);
        m.setFrequencyDays(freqDays);
        return m;
    }
}
