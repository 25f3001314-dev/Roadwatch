package com.roadwatch.backend.dto;

public class ResolutionProofRequest {
    private String officerLat;
    private String officerLng;
    private Long photoTimestampMs;

    public String getOfficerLat() { return officerLat; }
    public void setOfficerLat(String officerLat) { this.officerLat = officerLat; }

    public String getOfficerLng() { return officerLng; }
    public void setOfficerLng(String officerLng) { this.officerLng = officerLng; }

    public Long getPhotoTimestampMs() { return photoTimestampMs; }
    public void setPhotoTimestampMs(Long photoTimestampMs) { this.photoTimestampMs = photoTimestampMs; }

    // Helper: returns clean Double value, strips "GPS:" prefix if present
    public Double getOfficerLatValue() {
        if (officerLat == null) return null;
        return Double.parseDouble(officerLat.replace("GPS:", "").trim());
    }

    public Double getOfficerLngValue() {
        if (officerLng == null) return null;
        return Double.parseDouble(officerLng.replace("GPS:", "").trim());
    }
}
