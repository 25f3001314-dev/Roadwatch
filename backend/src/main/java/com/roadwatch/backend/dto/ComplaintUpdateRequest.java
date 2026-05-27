package com.roadwatch.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Pattern;

/**
 * DTO for updating complaint fields (PATCH endpoint).
 * All fields are optional - only provided fields will be updated.
 *
 * Status flow (civic workflow):
 *   PENDING -> ACCEPTED -> FORWARDED -> IN_PROGRESS -> RESOLVED
 *          \-> REJECTED
 *
 * Legacy statuses UNDER_REVIEW and ASSIGNED are still accepted for
 * backward compatibility.
 */
public class ComplaintUpdateRequest {

    @JsonProperty("status")
    @Pattern(regexp = "PENDING|ACCEPTED|UNDER_REVIEW|REJECTED|FORWARDED|ASSIGNED|IN_PROGRESS|RESOLVED|^$",
             message = "Status must be one of: PENDING, ACCEPTED, UNDER_REVIEW, REJECTED, FORWARDED, ASSIGNED, IN_PROGRESS, RESOLVED")
    private String status;

    @JsonProperty("department")
    private String department;

    @JsonProperty("severity")
    @Pattern(regexp = "HIGH|MEDIUM|LOW|^$",
             message = "Severity must be one of: HIGH, MEDIUM, LOW")
    private String severity;

    @JsonProperty("adminNotes")
    private String adminNotes;

    @JsonProperty("departmentResponse")
    private String departmentResponse;

    @JsonProperty("resolutionProofUrl")
    private String resolutionProofUrl;

    public ComplaintUpdateRequest() {
    }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }

    public String getAdminNotes() { return adminNotes; }
    public void setAdminNotes(String adminNotes) { this.adminNotes = adminNotes; }

    public String getDepartmentResponse() { return departmentResponse; }
    public void setDepartmentResponse(String departmentResponse) { this.departmentResponse = departmentResponse; }

    public String getResolutionProofUrl() { return resolutionProofUrl; }
    public void setResolutionProofUrl(String resolutionProofUrl) { this.resolutionProofUrl = resolutionProofUrl; }

    @Override
    public String toString() {
        return "ComplaintUpdateRequest{" +
                "status='" + status + '\'' +
                ", department='" + department + '\'' +
                ", severity='" + severity + '\'' +
                ", adminNotes='" + adminNotes + '\'' +
                ", departmentResponse='" + departmentResponse + '\'' +
                ", resolutionProofUrl='" + resolutionProofUrl + '\'' +
                '}';
    }
}
