package com.roadwatch.backend.dto.governance;

public class BudgetUtilizationDto {
    public Long roadId;
    public String roadCode;
    public String name;
    public String roadType;
    public Long contractorId;
    public double sanctioned;
    public double spent;
    public double utilizationPercent;
    public boolean overrun;
}
