package com.roadwatch.backend.models;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "road_inspection_logs",
       indexes = { @Index(name = "idx_ril_road", columnList = "roadId") })
public class RoadInspectionLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long roadId;
    private Long inspectorAuthorityId;
    private LocalDate inspectionDate;

    private String conditionRating;   // EXCELLENT, GOOD, FAIR, POOR, CRITICAL
    private Integer healthScore;      // 0-100
    private Integer potholeCount;
    private Integer crackCount;
    private Boolean waterloggingObserved;
    private Boolean lightingFunctional;

    @Column(columnDefinition = "TEXT")
    private String observations;

    private String nextInspectionRecommendation; // ROUTINE | URGENT | EMERGENCY

    public RoadInspectionLog() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getRoadId() { return roadId; }
    public void setRoadId(Long roadId) { this.roadId = roadId; }
    public Long getInspectorAuthorityId() { return inspectorAuthorityId; }
    public void setInspectorAuthorityId(Long inspectorAuthorityId) { this.inspectorAuthorityId = inspectorAuthorityId; }
    public LocalDate getInspectionDate() { return inspectionDate; }
    public void setInspectionDate(LocalDate inspectionDate) { this.inspectionDate = inspectionDate; }
    public String getConditionRating() { return conditionRating; }
    public void setConditionRating(String conditionRating) { this.conditionRating = conditionRating; }
    public Integer getHealthScore() { return healthScore; }
    public void setHealthScore(Integer healthScore) { this.healthScore = healthScore; }
    public Integer getPotholeCount() { return potholeCount; }
    public void setPotholeCount(Integer potholeCount) { this.potholeCount = potholeCount; }
    public Integer getCrackCount() { return crackCount; }
    public void setCrackCount(Integer crackCount) { this.crackCount = crackCount; }
    public Boolean getWaterloggingObserved() { return waterloggingObserved; }
    public void setWaterloggingObserved(Boolean waterloggingObserved) { this.waterloggingObserved = waterloggingObserved; }
    public Boolean getLightingFunctional() { return lightingFunctional; }
    public void setLightingFunctional(Boolean lightingFunctional) { this.lightingFunctional = lightingFunctional; }
    public String getObservations() { return observations; }
    public void setObservations(String observations) { this.observations = observations; }
    public String getNextInspectionRecommendation() { return nextInspectionRecommendation; }
    public void setNextInspectionRecommendation(String nextInspectionRecommendation) { this.nextInspectionRecommendation = nextInspectionRecommendation; }
}
