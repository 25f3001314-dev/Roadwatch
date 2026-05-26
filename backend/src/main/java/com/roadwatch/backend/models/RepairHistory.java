package com.roadwatch.backend.models;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "repair_history")
public class RepairHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long roadId;
    private Long contractorId;
    private Long complaintId;

    private String repairType; // POTHOLE_FILL, RESURFACING, FULL_RELAY, PATCH_WORK
    private LocalDate startDate;
    private LocalDate completionDate;
    private LocalDate expectedCompletionDate;

    private BigDecimal estimatedCost;
    private BigDecimal actualCost;

    private String status; // SCHEDULED, IN_PROGRESS, COMPLETED, DELAYED, FAILED
    private Integer qualityRating; // 1-5
    private Boolean failedWithinWarranty;
    private Integer warrantyMonths;

    private String remarks;

    public RepairHistory() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getRoadId() { return roadId; }
    public void setRoadId(Long roadId) { this.roadId = roadId; }
    public Long getContractorId() { return contractorId; }
    public void setContractorId(Long contractorId) { this.contractorId = contractorId; }
    public Long getComplaintId() { return complaintId; }
    public void setComplaintId(Long complaintId) { this.complaintId = complaintId; }
    public String getRepairType() { return repairType; }
    public void setRepairType(String repairType) { this.repairType = repairType; }
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    public LocalDate getCompletionDate() { return completionDate; }
    public void setCompletionDate(LocalDate completionDate) { this.completionDate = completionDate; }
    public LocalDate getExpectedCompletionDate() { return expectedCompletionDate; }
    public void setExpectedCompletionDate(LocalDate expectedCompletionDate) { this.expectedCompletionDate = expectedCompletionDate; }
    public BigDecimal getEstimatedCost() { return estimatedCost; }
    public void setEstimatedCost(BigDecimal estimatedCost) { this.estimatedCost = estimatedCost; }
    public BigDecimal getActualCost() { return actualCost; }
    public void setActualCost(BigDecimal actualCost) { this.actualCost = actualCost; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Integer getQualityRating() { return qualityRating; }
    public void setQualityRating(Integer qualityRating) { this.qualityRating = qualityRating; }
    public Boolean getFailedWithinWarranty() { return failedWithinWarranty; }
    public void setFailedWithinWarranty(Boolean failedWithinWarranty) { this.failedWithinWarranty = failedWithinWarranty; }
    public Integer getWarrantyMonths() { return warrantyMonths; }
    public void setWarrantyMonths(Integer warrantyMonths) { this.warrantyMonths = warrantyMonths; }
    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
}
