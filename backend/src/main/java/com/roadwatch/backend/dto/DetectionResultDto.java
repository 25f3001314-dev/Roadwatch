package com.roadwatch.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class DetectionResultDto {
    private String label;
    private String rawLabel;
    private double confidence;
    private BoundingBoxDto bbox;

    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }
    public String getRawLabel() { return rawLabel; }
    public void setRawLabel(String rawLabel) { this.rawLabel = rawLabel; }
    public double getConfidence() { return confidence; }
    public void setConfidence(double confidence) { this.confidence = confidence; }
    public BoundingBoxDto getBbox() { return bbox; }
    public void setBbox(BoundingBoxDto bbox) { this.bbox = bbox; }
}
