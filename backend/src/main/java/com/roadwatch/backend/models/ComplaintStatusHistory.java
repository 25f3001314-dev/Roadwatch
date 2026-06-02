package com.roadwatch.backend.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Immutable audit log entry for every complaint status change.
 */
@Entity
@Table(name = "complaint_status_history", indexes = {
        @Index(name = "idx_csh_complaint", columnList = "complaint_id"),
        @Index(name = "idx_csh_time", columnList = "changed_at")
})
public class ComplaintStatusHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "complaint_id", nullable = false)
    private Long complaintId;

    @Column(name = "from_status", length = 20)
    private String fromStatus;

    @Column(name = "to_status", nullable = false, length = 20)
    private String toStatus;

    @Column(name = "changed_by", length = 100)
    private String changedBy;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "changed_at", nullable = false, updatable = false)
    private LocalDateTime changedAt;

    public ComplaintStatusHistory() {}

    @PrePersist
    void onCreate() { changedAt = LocalDateTime.now(); }

    public Long getId() { return id; }
    public Long getComplaintId() { return complaintId; }
    public void setComplaintId(Long complaintId) { this.complaintId = complaintId; }
    public String getFromStatus() { return fromStatus; }
    public void setFromStatus(String fromStatus) { this.fromStatus = fromStatus; }
    public String getToStatus() { return toStatus; }
    public void setToStatus(String toStatus) { this.toStatus = toStatus; }
    public String getChangedBy() { return changedBy; }
    public void setChangedBy(String changedBy) { this.changedBy = changedBy; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public LocalDateTime getChangedAt() { return changedAt; }
}
