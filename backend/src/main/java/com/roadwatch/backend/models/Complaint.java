package com.roadwatch.backend.models;

import jakarta.persistence.*;
import org.locationtech.jts.geom.Point;
import org.springframework.format.annotation.DateTimeFormat;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.datatype.jsr310.deser.LocalDateTimeDeserializer;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateTimeSerializer;
import java.time.LocalDate;
import java.time.LocalDateTime;
import com.roadwatch.backend.config.PointToJsonSerializer;
import com.roadwatch.backend.config.PointWktConverter;

@Entity
@Table(name = "complaints",
       indexes = {
           @Index(name = "idx_complaint_status", columnList = "status"),
           @Index(name = "idx_complaint_severity", columnList = "severity"),
           @Index(name = "idx_complaint_department", columnList = "department"),
           @Index(name = "idx_complaint_road_id", columnList = "roadId")
       })
public class Complaint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String description;

    private String imageUrl;

    @Column(length = 120)
    @Convert(converter = PointWktConverter.class)
    @JsonSerialize(using = PointToJsonSerializer.class)
    private Point location;

    @JsonSerialize(using = LocalDateTimeSerializer.class)
    @JsonDeserialize(using = LocalDateTimeDeserializer.class)
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss", timezone = "Asia/Kolkata")
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
    private LocalDateTime timestamp;

    private String severity;

    private String status;

    private String roadType;

    private String department;

    private String aiLabel;

    private Double aiConfidence;

    @Column(columnDefinition = "TEXT")
    private String aiDetectionsJson;

    @Column(columnDefinition = "TEXT")
    private String adminNotes;

    // ─── Smart routing & lifecycle (additive, all nullable) ────────────

    /** Foreign-key style reference to a known Road row. */
    private Long roadId;

    /** Foreign-key style reference to the Authority/Officer assigned. */
    private Long assignedAuthorityId;

    /** Snapshot of authority name at time of assignment (display optimisation). */
    private String assignedAuthorityName;

    /** Owning department resolved by the routing engine. */
    private String routedDepartment;

    /** Free-text jurisdiction descriptor populated by routing engine. */
    private String jurisdictionTag;

    /** Was this routed automatically by the system or manually by an admin. */
    private String routingMode; // AUTO | MANUAL

    /** Promotion flag — set when severity HIGH or AI confidence very high. */
    private Boolean emergency;

    /** ETA committed to the citizen. */
    private LocalDate expectedRepairDate;

    /** When the complaint was finally resolved. */
    private LocalDateTime resolvedAt;

    /** Optional citizen-supplied contact (preserved from current API; nullable). */
    private String reporterContact;

    // ─── Civic workflow fields ─────────────────────────────────────────

    /** Department's response text (work started, team assigned, etc.). */
    @Column(columnDefinition = "TEXT")
    private String departmentResponse;

    /** When the department last responded. */
    private LocalDateTime departmentResponseDate;

    /** URL of the resolution proof image (before/after repair). */
    private String resolutionProofUrl;

    public Complaint() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public Point getLocation() { return location; }
    public void setLocation(Point location) { this.location = location; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getRoadType() { return roadType; }
    public void setRoadType(String roadType) { this.roadType = roadType; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public String getAiLabel() { return aiLabel; }
    public void setAiLabel(String aiLabel) { this.aiLabel = aiLabel; }
    public Double getAiConfidence() { return aiConfidence; }
    public void setAiConfidence(Double aiConfidence) { this.aiConfidence = aiConfidence; }
    public String getAiDetectionsJson() { return aiDetectionsJson; }
    public void setAiDetectionsJson(String aiDetectionsJson) { this.aiDetectionsJson = aiDetectionsJson; }
    public String getAdminNotes() { return adminNotes; }
    public void setAdminNotes(String adminNotes) { this.adminNotes = adminNotes; }

    public Long getRoadId() { return roadId; }
    public void setRoadId(Long roadId) { this.roadId = roadId; }
    public Long getAssignedAuthorityId() { return assignedAuthorityId; }
    public void setAssignedAuthorityId(Long assignedAuthorityId) { this.assignedAuthorityId = assignedAuthorityId; }
    public String getAssignedAuthorityName() { return assignedAuthorityName; }
    public void setAssignedAuthorityName(String assignedAuthorityName) { this.assignedAuthorityName = assignedAuthorityName; }
    public String getRoutedDepartment() { return routedDepartment; }
    public void setRoutedDepartment(String routedDepartment) { this.routedDepartment = routedDepartment; }
    public String getJurisdictionTag() { return jurisdictionTag; }
    public void setJurisdictionTag(String jurisdictionTag) { this.jurisdictionTag = jurisdictionTag; }
    public String getRoutingMode() { return routingMode; }
    public void setRoutingMode(String routingMode) { this.routingMode = routingMode; }
    public Boolean getEmergency() { return emergency; }
    public void setEmergency(Boolean emergency) { this.emergency = emergency; }
    public LocalDate getExpectedRepairDate() { return expectedRepairDate; }
    public void setExpectedRepairDate(LocalDate expectedRepairDate) { this.expectedRepairDate = expectedRepairDate; }
    public LocalDateTime getResolvedAt() { return resolvedAt; }
    public void setResolvedAt(LocalDateTime resolvedAt) { this.resolvedAt = resolvedAt; }
    public String getReporterContact() { return reporterContact; }
    public void setReporterContact(String reporterContact) { this.reporterContact = reporterContact; }

    public String getDepartmentResponse() { return departmentResponse; }
    public void setDepartmentResponse(String departmentResponse) { this.departmentResponse = departmentResponse; }
    public LocalDateTime getDepartmentResponseDate() { return departmentResponseDate; }
    public void setDepartmentResponseDate(LocalDateTime departmentResponseDate) { this.departmentResponseDate = departmentResponseDate; }
    public String getResolutionProofUrl() { return resolutionProofUrl; }
    public void setResolutionProofUrl(String resolutionProofUrl) { this.resolutionProofUrl = resolutionProofUrl; }
}
