package com.roadwatch.backend.models;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "budgets")
public class Budget {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String roadType; // NH, SH, MDR
    private String roadName;
    private String contractorName;

    private BigDecimal amountSanctioned;
    private BigDecimal amountSpent;

    private LocalDate lastRelayingDate;

    public Budget() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getRoadType() { return roadType; }
    public void setRoadType(String roadType) { this.roadType = roadType; }
    public String getRoadName() { return roadName; }
    public void setRoadName(String roadName) { this.roadName = roadName; }
    public String getContractorName() { return contractorName; }
    public void setContractorName(String contractorName) { this.contractorName = contractorName; }
    public BigDecimal getAmountSanctioned() { return amountSanctioned; }
    public void setAmountSanctioned(BigDecimal amountSanctioned) { this.amountSanctioned = amountSanctioned; }
    public BigDecimal getAmountSpent() { return amountSpent; }
    public void setAmountSpent(BigDecimal amountSpent) { this.amountSpent = amountSpent; }
    public LocalDate getLastRelayingDate() { return lastRelayingDate; }
    public void setLastRelayingDate(LocalDate lastRelayingDate) { this.lastRelayingDate = lastRelayingDate; }
}
