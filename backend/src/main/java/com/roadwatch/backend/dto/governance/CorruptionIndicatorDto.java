package com.roadwatch.backend.dto.governance;

public class CorruptionIndicatorDto {
    public String kind;        // BUDGET_OVERRUN | WARRANTY_FAILURE | REPEAT_FAILURE_ROAD
    public String entityType;  // ROAD | CONTRACTOR | REPAIR | PROJECT
    public Long entityId;
    public String entityName;
    public String detail;
    public String severity;    // LOW | MEDIUM | HIGH
}
