package com.roadwatch.backend.dto.governance;

public class RoadHealthDto {
    public Long id;
    public String roadCode;
    public String name;
    public String roadType;
    public String district;
    public String authorityDepartment;
    public Long contractorId;
    public Double lengthKm;
    public Integer healthScore;
    public Integer recurringIssueCount;
    public Integer unresolvedComplaints;
}
