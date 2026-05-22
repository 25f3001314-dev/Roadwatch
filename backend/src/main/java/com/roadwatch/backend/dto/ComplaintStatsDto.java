package com.roadwatch.backend.dto;

public class ComplaintStatsDto {
    private long total;
    private long pending;
    private long assigned;
    private long inProgress;
    private long resolved;
    private long highSeverity;

    public ComplaintStatsDto(long total, long pending, long assigned, long inProgress, long resolved, long highSeverity) {
        this.total = total;
        this.pending = pending;
        this.assigned = assigned;
        this.inProgress = inProgress;
        this.resolved = resolved;
        this.highSeverity = highSeverity;
    }

    public long getTotal() { return total; }
    public long getPending() { return pending; }
    public long getAssigned() { return assigned; }
    public long getInProgress() { return inProgress; }
    public long getResolved() { return resolved; }
    public long getHighSeverity() { return highSeverity; }
}
