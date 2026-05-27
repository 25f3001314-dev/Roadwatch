package com.roadwatch.backend.dto;

public class ComplaintStatsDto {
    private long total;
    private long pending;
    private long accepted;
    private long underReview;
    private long rejected;
    private long forwarded;
    private long assigned;
    private long inProgress;
    private long resolved;
    private long highSeverity;

    public ComplaintStatsDto() {
    }

    public ComplaintStatsDto(long total, long pending, long accepted, long underReview,
                             long rejected, long forwarded, long assigned,
                             long inProgress, long resolved, long highSeverity) {
        this.total = total;
        this.pending = pending;
        this.accepted = accepted;
        this.underReview = underReview;
        this.rejected = rejected;
        this.forwarded = forwarded;
        this.assigned = assigned;
        this.inProgress = inProgress;
        this.resolved = resolved;
        this.highSeverity = highSeverity;
    }

    public long getTotal() { return total; }
    public long getPending() { return pending; }
    public long getAccepted() { return accepted; }
    public long getUnderReview() { return underReview; }
    public long getRejected() { return rejected; }
    public long getForwarded() { return forwarded; }
    public long getAssigned() { return assigned; }
    public long getInProgress() { return inProgress; }
    public long getResolved() { return resolved; }
    public long getHighSeverity() { return highSeverity; }

    public void setTotal(long total) { this.total = total; }
    public void setPending(long pending) { this.pending = pending; }
    public void setAccepted(long accepted) { this.accepted = accepted; }
    public void setUnderReview(long underReview) { this.underReview = underReview; }
    public void setRejected(long rejected) { this.rejected = rejected; }
    public void setForwarded(long forwarded) { this.forwarded = forwarded; }
    public void setAssigned(long assigned) { this.assigned = assigned; }
    public void setInProgress(long inProgress) { this.inProgress = inProgress; }
    public void setResolved(long resolved) { this.resolved = resolved; }
    public void setHighSeverity(long highSeverity) { this.highSeverity = highSeverity; }
}
