package com.roadwatch.backend.dto.governance;

public class DepartmentEfficiencyDto {
    public String department;
    public int totalComplaints;
    public int resolved;
    public int pending;
    public int inProgress;
    public double resolutionRatePercent;
    public double avgResolutionHours;
}
