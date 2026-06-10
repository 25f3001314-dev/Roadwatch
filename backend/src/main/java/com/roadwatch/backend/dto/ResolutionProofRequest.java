package com.roadwatch.backend.dto;

public class ResolutionProofRequest {
    private Double officerLat;
    private Double officerLng;
    private Long photoTimestampMs;

    public Double getOfficerLat() { return officerLat; }
    public void setOfficerLat(Double officerLat) { this.officerLat = officerLat; }
    public Double getOfficerLng() { return officerLng; }
    public void setOfficerLng(Double officerLng) { this.officerLng = officerLng; }
    public Long getPhotoTimestampMs() { return photoTimestampMs; }
    public void setPhotoTimestampMs(Long photoTimestampMs) { this.photoTimestampMs = photoTimestampMs; }
}
