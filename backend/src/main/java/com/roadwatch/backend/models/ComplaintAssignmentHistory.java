package com.roadwatch.backend.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "complaint_assignment_history",
        indexes = {
            @Index(name = "idx_cah_complaint", columnList = "complaintId"),
            @Index(name = "idx_cah_authority", columnList = "assignedAuthorityId")
        })
public class ComplaintAssignmentHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long complaintId;
    private Long assignedAuthorityId;
    private Long previousAuthorityId;

    private String department;        // NHAI, PWD, etc.
    private String previousDepartment;

    private String action;            // AUTO_ASSIGNED, MANUALLY_REASSIGNED, ESCALATED, RESOLVED, REJECTED
    private String reason;            // free-text reason / rule applied
    private String performedBy;       // 'system' or admin username
    private LocalDateTime occurredAt;

    private String jurisdictionTag;   // optional jurisdiction code
    private Boolean emergency;

    public ComplaintAssignmentHistory() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getComplaintId() { return complaintId; }
    public void setComplaintId(Long complaintId) { this.complaintId = complaintId; }
    public Long getAssignedAuthorityId() { return assignedAuthorityId; }
    public void setAssignedAuthorityId(Long assignedAuthorityId) { this.assignedAuthorityId = assignedAuthorityId; }
    public Long getPreviousAuthorityId() { return previousAuthorityId; }
    public void setPreviousAuthorityId(Long previousAuthorityId) { this.previousAuthorityId = previousAuthorityId; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public String getPreviousDepartment() { return previousDepartment; }
    public void setPreviousDepartment(String previousDepartment) { this.previousDepartment = previousDepartment; }
    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    public String getPerformedBy() { return performedBy; }
    public void setPerformedBy(String performedBy) { this.performedBy = performedBy; }
    public LocalDateTime getOccurredAt() { return occurredAt; }
    public void setOccurredAt(LocalDateTime occurredAt) { this.occurredAt = occurredAt; }
    public String getJurisdictionTag() { return jurisdictionTag; }
    public void setJurisdictionTag(String jurisdictionTag) { this.jurisdictionTag = jurisdictionTag; }
    public Boolean getEmergency() { return emergency; }
    public void setEmergency(Boolean emergency) { this.emergency = emergency; }
}
