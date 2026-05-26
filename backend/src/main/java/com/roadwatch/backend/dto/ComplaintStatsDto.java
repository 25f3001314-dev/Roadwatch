package com.roadwatch.backend.dto;

public class ComplaintStatsDto {
    private long total;
    private long pending;
    private long underReview;
    private long rejected;
    private long assigned;
    private long inProgress;
    private long resolved;
    private long highSeverity;

    public ComplaintStatsDto() {
    }

    public ComplaintStatsDto(long total,
                             long pending,
                             long underReview,
                             long rejected,
                             long assigned,
                             long inProgress,
                             long resolved,
                             long highSeverity) {
        this.total = total;
        this.pending = pending;
        this.underReview = underReview;
        this.rejected = rejected;
        this.assigned = assigned;
        this.inProgress = inProgress;
        this.resolved = resolved;
        this.highSeverity = highSeverity;
    }

    public long getTotal() { return total; }
    public long getPending() { return pending; }
    public long getUnderReview() { return underReview; }
    public long getRejected() { return rejected; }
    public long getAssigned() { return assigned; }
    public long getInProgress() { return inProgress; }
    public long getResolved() { return resolved; }
    public long getHighSeverity() { return highSeverity; }

    public void setTotal(long total) { this.total = total; }
    public void setPending(long pending) { this.pending = pending; }
    public void setUnderReview(long underReview) { this.underReview = underReview; }
    public void setRejected(long rejected) { this.rejected = rejected; }
    public void setAssigned(long assigned) { this.assigned = assigned; }
    public void setInProgress(long inProgress) { this.inProgress = inProgress; }
    public void setResolved(long resolved) { this.resolved = resolved; }
    public void setHighSeverity(long highSeverity) { this.highSeverity = highSeverity; }
}
