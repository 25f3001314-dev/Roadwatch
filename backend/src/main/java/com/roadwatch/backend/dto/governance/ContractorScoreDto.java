package com.roadwatch.backend.dto.governance;

public class ContractorScoreDto {
    public Long id;
    public String name;
    public String registrationNumber;
    public String category;
    public String state;
    public boolean blacklisted;
    public int repeatFailures;
    public int totalProjectsCompleted;
    public int totalProjectsActive;
    public double score;
}
