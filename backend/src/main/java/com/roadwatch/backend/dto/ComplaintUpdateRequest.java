package com.roadwatch.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Pattern;

/**
 * DTO for updating complaint fields (PATCH endpoint).
 * All fields are optional - only provided fields will be updated.
 *
 * Status flow:
 *   PENDING -> UNDER_REVIEW -> ASSIGNED -> IN_PROGRESS -> RESOLVED
 *                          \-> REJECTED
 */
public class ComplaintUpdateRequest {

    @JsonProperty("status")
    @Pattern(regexp = "PENDING|UNDER_REVIEW|REJECTED|ASSIGNED|IN_PROGRESS|RESOLVED|^$",
             message = "Status must be one of: PENDING, UNDER_REVIEW, REJECTED, ASSIGNED, IN_PROGRESS, RESOLVED")
    private String status;

    @JsonProperty("department")
    private String department;

    @JsonProperty("severity")
    @Pattern(regexp = "HIGH|MEDIUM|LOW|^$",
             message = "Severity must be one of: HIGH, MEDIUM, LOW")
    private String severity;

    @JsonProperty("adminNotes")
    private String adminNotes;

    public ComplaintUpdateRequest() {
    }

    public ComplaintUpdateRequest(String status, String department, String severity, String adminNotes) {
        this.status = status;
        this.department = department;
        this.severity = severity;
        this.adminNotes = adminNotes;
    }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }

    public String getAdminNotes() { return adminNotes; }
    public void setAdminNotes(String adminNotes) { this.adminNotes = adminNotes; }

    @Override
    public String toString() {
        return "ComplaintUpdateRequest{" +
                "status='" + status + '\'' +
                ", department='" + department + '\'' +
                ", severity='" + severity + '\'' +
                ", adminNotes='" + adminNotes + '\'' +
                '}';
    }
}
