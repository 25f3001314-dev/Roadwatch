package com.roadwatch.backend.models;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "road_projects")
public class RoadProject {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String projectCode;
    private String name;
    private String description;

    private Long roadId;
    private Long contractorId;
    private String authorityDepartment; // NHAI, PWD, RURAL_ROADS, NAGAR_NIGAM, SMART_CITY

    private String projectType; // NEW_CONSTRUCTION, WIDENING, RESURFACING, BRIDGE, FLYOVER
    private LocalDate sanctionDate;
    private LocalDate startDate;
    private LocalDate expectedCompletion;
    private LocalDate actualCompletion;

    private BigDecimal sanctionedAmount;
    private BigDecimal expenditure;
    private Double progressPercent;

    private String status; // SANCTIONED, TENDERED, IN_PROGRESS, COMPLETED, DELAYED, STALLED
    private Integer delayDays;
    private String delayReason;

    public RoadProject() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getProjectCode() { return projectCode; }
    public void setProjectCode(String projectCode) { this.projectCode = projectCode; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Long getRoadId() { return roadId; }
    public void setRoadId(Long roadId) { this.roadId = roadId; }
    public Long getContractorId() { return contractorId; }
    public void setContractorId(Long contractorId) { this.contractorId = contractorId; }
    public String getAuthorityDepartment() { return authorityDepartment; }
    public void setAuthorityDepartment(String authorityDepartment) { this.authorityDepartment = authorityDepartment; }
    public String getProjectType() { return projectType; }
    public void setProjectType(String projectType) { this.projectType = projectType; }
    public LocalDate getSanctionDate() { return sanctionDate; }
    public void setSanctionDate(LocalDate sanctionDate) { this.sanctionDate = sanctionDate; }
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    public LocalDate getExpectedCompletion() { return expectedCompletion; }
    public void setExpectedCompletion(LocalDate expectedCompletion) { this.expectedCompletion = expectedCompletion; }
    public LocalDate getActualCompletion() { return actualCompletion; }
    public void setActualCompletion(LocalDate actualCompletion) { this.actualCompletion = actualCompletion; }
    public BigDecimal getSanctionedAmount() { return sanctionedAmount; }
    public void setSanctionedAmount(BigDecimal sanctionedAmount) { this.sanctionedAmount = sanctionedAmount; }
    public BigDecimal getExpenditure() { return expenditure; }
    public void setExpenditure(BigDecimal expenditure) { this.expenditure = expenditure; }
    public Double getProgressPercent() { return progressPercent; }
    public void setProgressPercent(Double progressPercent) { this.progressPercent = progressPercent; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Integer getDelayDays() { return delayDays; }
    public void setDelayDays(Integer delayDays) { this.delayDays = delayDays; }
    public String getDelayReason() { return delayReason; }
    public void setDelayReason(String delayReason) { this.delayReason = delayReason; }
}
