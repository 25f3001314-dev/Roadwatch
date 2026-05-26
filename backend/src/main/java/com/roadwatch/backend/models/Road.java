package com.roadwatch.backend.models;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "roads",
       indexes = {
           @Index(name = "idx_road_type", columnList = "roadType"),
           @Index(name = "idx_road_district", columnList = "district"),
           @Index(name = "idx_road_authority_dept", columnList = "authorityDepartment")
       })
public class Road {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String roadCode;

    private String name;

    /** NH, SH, MDR, CITY, RURAL */
    private String roadType;

    /** Legacy free-text contractor name (kept for backward compatibility). */
    private String contractorName;

    private LocalDate lastRelayingDate;

    private Double budgetSanctioned;

    private Double budgetSpent;

    /** Lifecycle status: PLANNED | UNDER_CONSTRUCTION | OPERATIONAL | UNDER_REPAIR | CLOSED */
    private String status;

    // ─── Governance enhancements (additive, all nullable) ──────────────

    /** Owning department: NHAI | PWD | RURAL_ROADS | NAGAR_NIGAM | SMART_CITY */
    private String authorityDepartment;

    /** Foreign-key style reference to contractors table (nullable for legacy rows). */
    private Long contractorId;

    /** Foreign-key style reference to authorities table. */
    private Long authorityId;

    private String district;
    private String state;

    private LocalDate buildDate;
    private LocalDate lastRepairDate;
    private LocalDate nextScheduledMaintenance;

    /** Computed road condition: EXCELLENT, GOOD, FAIR, POOR, CRITICAL */
    private String currentCondition;

    /** Computed health score 0-100 (cached, refreshed by analytics service). */
    private Integer healthScore;

    /** Number of times this road has had repeat issues / failed repairs. */
    private Integer recurringIssueCount;

    /** Length of the road segment in km (nullable). */
    private Double lengthKm;

    /** Free-text jurisdiction descriptor (e.g. "Lucknow Municipal Corp - Ward 12"). */
    private String jurisdictionTag;

    public Road() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getRoadCode() { return roadCode; }
    public void setRoadCode(String roadCode) { this.roadCode = roadCode; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getRoadType() { return roadType; }
    public void setRoadType(String roadType) { this.roadType = roadType; }

    public String getContractorName() { return contractorName; }
    public void setContractorName(String contractorName) { this.contractorName = contractorName; }

    public LocalDate getLastRelayingDate() { return lastRelayingDate; }
    public void setLastRelayingDate(LocalDate lastRelayingDate) { this.lastRelayingDate = lastRelayingDate; }

    public Double getBudgetSanctioned() { return budgetSanctioned; }
    public void setBudgetSanctioned(Double budgetSanctioned) { this.budgetSanctioned = budgetSanctioned; }

    public Double getBudgetSpent() { return budgetSpent; }
    public void setBudgetSpent(Double budgetSpent) { this.budgetSpent = budgetSpent; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getAuthorityDepartment() { return authorityDepartment; }
    public void setAuthorityDepartment(String authorityDepartment) { this.authorityDepartment = authorityDepartment; }

    public Long getContractorId() { return contractorId; }
    public void setContractorId(Long contractorId) { this.contractorId = contractorId; }

    public Long getAuthorityId() { return authorityId; }
    public void setAuthorityId(Long authorityId) { this.authorityId = authorityId; }

    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public LocalDate getBuildDate() { return buildDate; }
    public void setBuildDate(LocalDate buildDate) { this.buildDate = buildDate; }

    public LocalDate getLastRepairDate() { return lastRepairDate; }
    public void setLastRepairDate(LocalDate lastRepairDate) { this.lastRepairDate = lastRepairDate; }

    public LocalDate getNextScheduledMaintenance() { return nextScheduledMaintenance; }
    public void setNextScheduledMaintenance(LocalDate nextScheduledMaintenance) { this.nextScheduledMaintenance = nextScheduledMaintenance; }

    public String getCurrentCondition() { return currentCondition; }
    public void setCurrentCondition(String currentCondition) { this.currentCondition = currentCondition; }

    public Integer getHealthScore() { return healthScore; }
    public void setHealthScore(Integer healthScore) { this.healthScore = healthScore; }

    public Integer getRecurringIssueCount() { return recurringIssueCount; }
    public void setRecurringIssueCount(Integer recurringIssueCount) { this.recurringIssueCount = recurringIssueCount; }

    public Double getLengthKm() { return lengthKm; }
    public void setLengthKm(Double lengthKm) { this.lengthKm = lengthKm; }

    public String getJurisdictionTag() { return jurisdictionTag; }
    public void setJurisdictionTag(String jurisdictionTag) { this.jurisdictionTag = jurisdictionTag; }
}
