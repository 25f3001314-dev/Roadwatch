package com.roadwatch.backend.dto.governance;

import java.time.LocalDate;

public class DelayedRepairDto {
    public Long repairId;
    public Long roadId;
    public Long contractorId;
    public String repairType;
    public LocalDate expectedCompletion;
    public int delayDays;
    public String status;
}
