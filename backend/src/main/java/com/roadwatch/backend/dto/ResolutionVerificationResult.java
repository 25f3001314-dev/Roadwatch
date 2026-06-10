package com.roadwatch.backend.dto;

public class ResolutionVerificationResult {

    public enum Status { RESOLVED, REJECTED }

    private Status status;
    private String reason;
    private String failedLayer;

    public static ResolutionVerificationResult pass() {
        ResolutionVerificationResult r = new ResolutionVerificationResult();
        r.status = Status.RESOLVED;
        r.reason = "All checks passed.";
        return r;
    }

    public static ResolutionVerificationResult fail(String layer, String reason) {
        ResolutionVerificationResult r = new ResolutionVerificationResult();
        r.status = Status.REJECTED;
        r.failedLayer = layer;
        r.reason = reason;
        return r;
    }

    public Status getStatus() { return status; }
    public String getReason() { return reason; }
    public String getFailedLayer() { return failedLayer; }
    public boolean isResolved() { return status == Status.RESOLVED; }
}
