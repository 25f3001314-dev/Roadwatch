package com.roadwatch.backend.models;

import jakarta.persistence.*;

@Entity
@Table(name = "authorities",
       indexes = {
           @Index(name = "idx_auth_dept", columnList = "department"),
           @Index(name = "idx_auth_district", columnList = "district")
       })
public class Authority {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private String designation;

    private String zone;

    private String email;

    private String phone;

    private String district;

    // ─── Governance enhancements (additive, all nullable) ──────────────

    /** NHAI | PWD | RURAL_ROADS | NAGAR_NIGAM | SMART_CITY | TRAFFIC_POLICE | OTHER */
    private String department;

    /** State/region scope. */
    private String state;

    /** Optional jurisdiction tag matching roads.jurisdictionTag. */
    private String jurisdictionTag;

    /** Computed efficiency score 0-100 (refreshed by analytics service). */
    private Integer efficiencyScore;

    /** Total complaints handled (cached). */
    private Integer totalComplaintsHandled;

    /** Average resolution time in hours (cached). */
    private Double avgResolutionHours;

    public Authority() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDesignation() { return designation; }
    public void setDesignation(String designation) { this.designation = designation; }

    public String getZone() { return zone; }
    public void setZone(String zone) { this.zone = zone; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getJurisdictionTag() { return jurisdictionTag; }
    public void setJurisdictionTag(String jurisdictionTag) { this.jurisdictionTag = jurisdictionTag; }

    public Integer getEfficiencyScore() { return efficiencyScore; }
    public void setEfficiencyScore(Integer efficiencyScore) { this.efficiencyScore = efficiencyScore; }

    public Integer getTotalComplaintsHandled() { return totalComplaintsHandled; }
    public void setTotalComplaintsHandled(Integer totalComplaintsHandled) { this.totalComplaintsHandled = totalComplaintsHandled; }

    public Double getAvgResolutionHours() { return avgResolutionHours; }
    public void setAvgResolutionHours(Double avgResolutionHours) { this.avgResolutionHours = avgResolutionHours; }
}
