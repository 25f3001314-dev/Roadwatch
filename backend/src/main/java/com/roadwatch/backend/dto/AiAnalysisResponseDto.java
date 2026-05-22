package com.roadwatch.backend.dto;

import java.util.List;

public class AiAnalysisResponseDto {
    private boolean success;
    private List<DetectionResultDto> detections;

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }
    public List<DetectionResultDto> getDetections() { return detections; }
    public void setDetections(List<DetectionResultDto> detections) { this.detections = detections; }
}
