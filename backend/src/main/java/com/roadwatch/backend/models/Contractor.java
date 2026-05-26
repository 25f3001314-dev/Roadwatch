package com.roadwatch.backend.models;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "contractors")
public class Contractor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String registrationNumber;

    private String name;
    private String category; // A, B, C class
    private String contactEmail;
    private String contactPhone;
    private String address;
    private String state;

    private Integer totalProjectsCompleted;
    private Integer totalProjectsActive;
    private Integer repeatFailures;
    private Double performanceScore; // 0-100

    private LocalDate registeredSince;
    private Boolean blacklisted;
    private String blacklistReason;

    public Contractor() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getRegistrationNumber() { return registrationNumber; }
    public void setRegistrationNumber(String registrationNumber) { this.registrationNumber = registrationNumber; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getContactEmail() { return contactEmail; }
    public void setContactEmail(String contactEmail) { this.contactEmail = contactEmail; }
    public String getContactPhone() { return contactPhone; }
    public void setContactPhone(String contactPhone) { this.contactPhone = contactPhone; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getState() { return state; }
    public void setState(String state) { this.state = state; }
    public Integer getTotalProjectsCompleted() { return totalProjectsCompleted; }
    public void setTotalProjectsCompleted(Integer totalProjectsCompleted) { this.totalProjectsCompleted = totalProjectsCompleted; }
    public Integer getTotalProjectsActive() { return totalProjectsActive; }
    public void setTotalProjectsActive(Integer totalProjectsActive) { this.totalProjectsActive = totalProjectsActive; }
    public Integer getRepeatFailures() { return repeatFailures; }
    public void setRepeatFailures(Integer repeatFailures) { this.repeatFailures = repeatFailures; }
    public Double getPerformanceScore() { return performanceScore; }
    public void setPerformanceScore(Double performanceScore) { this.performanceScore = performanceScore; }
    public LocalDate getRegisteredSince() { return registeredSince; }
    public void setRegisteredSince(LocalDate registeredSince) { this.registeredSince = registeredSince; }
    public Boolean getBlacklisted() { return blacklisted; }
    public void setBlacklisted(Boolean blacklisted) { this.blacklisted = blacklisted; }
    public String getBlacklistReason() { return blacklistReason; }
    public void setBlacklistReason(String blacklistReason) { this.blacklistReason = blacklistReason; }
}
