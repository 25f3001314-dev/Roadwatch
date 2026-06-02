package com.roadwatch.backend.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Citizen user account. Named CitizenUser to avoid collision with the
 * admin-only auth system that already exists (AuthService uses env-var credentials).
 *
 * Citizens register via the mobile app and own complaints.
 */
@Entity
@Table(name = "citizen_users", indexes = {
        @Index(name = "idx_citizen_email", columnList = "email", unique = true),
        @Index(name = "idx_citizen_phone", columnList = "phone")
})
public class CitizenUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 255)
    private String email;

    @Column(length = 20)
    private String phone;

    @Column(name = "password_hash", nullable = false, length = 100)
    private String passwordHash;

    @Column(length = 100)
    private String name;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public CitizenUser() {}

    @PrePersist
    void onCreate() { createdAt = LocalDateTime.now(); }

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
