package com.roadwatch.backend.dto.governance;

public class GovernanceOverviewDto {
    public long totalRoads;
    public long totalComplaints;
    public long totalContractors;
    public long totalAuthorities;
    public long totalProjects;
    public int unresolvedComplaints;
    public int emergencyComplaints;
    public int delayedProjects;
    public int blacklistedContractors;
    public double totalSanctionedBudget;
    public double totalSpentBudget;
    public double budgetUtilizationPercent;
    public double avgResolutionHours;
}
