package com.roadwatch.backend.models;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "maintenance_schedules")
public class MaintenanceSchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long roadId;
    private String maintenanceType; // ROUTINE, PERIODIC, EMERGENCY, INSPECTION
    private LocalDate scheduledDate;
    private LocalDate completedDate;
    private String status; // SCHEDULED, IN_PROGRESS, COMPLETED, OVERDUE, CANCELLED
    private String assignedDepartment;
    private Long assignedContractorId;
    private String remarks;
    private Integer frequencyDays; // recurrence interval

    public MaintenanceSchedule() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getRoadId() { return roadId; }
    public void setRoadId(Long roadId) { this.roadId = roadId; }
    public String getMaintenanceType() { return maintenanceType; }
    public void setMaintenanceType(String maintenanceType) { this.maintenanceType = maintenanceType; }
    public LocalDate getScheduledDate() { return scheduledDate; }
    public void setScheduledDate(LocalDate scheduledDate) { this.scheduledDate = scheduledDate; }
    public LocalDate getCompletedDate() { return completedDate; }
    public void setCompletedDate(LocalDate completedDate) { this.completedDate = completedDate; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getAssignedDepartment() { return assignedDepartment; }
    public void setAssignedDepartment(String assignedDepartment) { this.assignedDepartment = assignedDepartment; }
    public Long getAssignedContractorId() { return assignedContractorId; }
    public void setAssignedContractorId(Long assignedContractorId) { this.assignedContractorId = assignedContractorId; }
    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
    public Integer getFrequencyDays() { return frequencyDays; }
    public void setFrequencyDays(Integer frequencyDays) { this.frequencyDays = frequencyDays; }
}
