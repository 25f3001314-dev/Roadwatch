package com.roadwatch.backend.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Persistent notification record — the citizen's inbox.
 * Also tracks whether FCM delivery succeeded.
 */
@Entity
@Table(name = "notifications", indexes = {
        @Index(name = "idx_notif_user", columnList = "user_id"),
        @Index(name = "idx_notif_complaint", columnList = "complaint_id")
})
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "complaint_id")
    private Long complaintId;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String body;

    /** AI_ANALYSIS | ASSIGNED | IN_PROGRESS | RESOLVED | REJECTED | SYSTEM */
    @Column(nullable = false, length = 30)
    private String category;

    @Column(name = "is_read", nullable = false)
    private boolean read = false;

    @Column(name = "fcm_sent", nullable = false)
    private boolean fcmSent = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public Notification() {}

    @PrePersist
    void onCreate() { createdAt = LocalDateTime.now(); }

    // Getters & Setters
    public Long getId() { return id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public Long getComplaintId() { return complaintId; }
    public void setComplaintId(Long complaintId) { this.complaintId = complaintId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getBody() { return body; }
    public void setBody(String body) { this.body = body; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public boolean isRead() { return read; }
    public void setRead(boolean read) { this.read = read; }
    public boolean isFcmSent() { return fcmSent; }
    public void setFcmSent(boolean fcmSent) { this.fcmSent = fcmSent; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
