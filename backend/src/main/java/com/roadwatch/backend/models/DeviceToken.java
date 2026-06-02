package com.roadwatch.backend.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * FCM device token linked to a citizen user.
 * One user can have multiple devices (phone + tablet).
 */
@Entity
@Table(name = "device_tokens", indexes = {
        @Index(name = "idx_dt_token", columnList = "fcm_token", unique = true),
        @Index(name = "idx_dt_user", columnList = "user_id")
})
public class DeviceToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private CitizenUser user;

    @Column(name = "fcm_token", nullable = false, length = 500, unique = true)
    private String fcmToken;

    @Column(length = 10)
    private String platform = "android";

    @Column(name = "is_active", nullable = false)
    private boolean active = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public DeviceToken() {}

    @PrePersist
    void onCreate() { createdAt = LocalDateTime.now(); }

    public Long getId() { return id; }
    public CitizenUser getUser() { return user; }
    public void setUser(CitizenUser user) { this.user = user; }
    public String getFcmToken() { return fcmToken; }
    public void setFcmToken(String fcmToken) { this.fcmToken = fcmToken; }
    public String getPlatform() { return platform; }
    public void setPlatform(String platform) { this.platform = platform; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}
