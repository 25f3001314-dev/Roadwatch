package com.roadwatch.backend.models;

import jakarta.persistence.*;
import org.locationtech.jts.geom.Point;
import org.springframework.format.annotation.DateTimeFormat;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.datatype.jsr310.deser.LocalDateTimeDeserializer;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateTimeSerializer;
import java.time.LocalDateTime;
import com.roadwatch.backend.config.PointToJsonSerializer;
import com.roadwatch.backend.config.PointWktConverter;

@Entity
@Table(name = "complaints")
public class Complaint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Citizen who submitted this complaint. NULL for legacy/anonymous submissions. */
    @Column(name = "user_id")
    private Long userId;

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

    // ── Department Workflow Fields (Phase 1.5: civic workflow layer) ──────

    /** Department's response text (e.g. "Team dispatched", "Work started") */
    @Column(name = "dept_response", columnDefinition = "TEXT")
    private String deptResponse;

    /** Officer/team assigned by the department */
    @Column(name = "assigned_officer", length = 200)
    private String assignedOfficer;

    /** Expected completion date set by department */
    @Column(name = "expected_completion")
    private LocalDateTime expectedCompletion;

    /** URL of the repair/resolution proof image uploaded by admin/department */
    @Column(name = "resolution_image_url", length = 500)
    private String resolutionImageUrl;

    /** When the complaint was actually resolved */
    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    /** Citizen satisfaction rating (1-5 stars, NULL = not yet rated) */
    @Column(name = "citizen_rating")
    private Integer citizenRating;

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
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getDeptResponse() { return deptResponse; }
    public void setDeptResponse(String deptResponse) { this.deptResponse = deptResponse; }
    public String getAssignedOfficer() { return assignedOfficer; }
    public void setAssignedOfficer(String assignedOfficer) { this.assignedOfficer = assignedOfficer; }
    public LocalDateTime getExpectedCompletion() { return expectedCompletion; }
    public void setExpectedCompletion(LocalDateTime expectedCompletion) { this.expectedCompletion = expectedCompletion; }
    public String getResolutionImageUrl() { return resolutionImageUrl; }
    public void setResolutionImageUrl(String resolutionImageUrl) { this.resolutionImageUrl = resolutionImageUrl; }
    public LocalDateTime getResolvedAt() { return resolvedAt; }
    public void setResolvedAt(LocalDateTime resolvedAt) { this.resolvedAt = resolvedAt; }
    public Integer getCitizenRating() { return citizenRating; }
    public void setCitizenRating(Integer citizenRating) { this.citizenRating = citizenRating; }
}
