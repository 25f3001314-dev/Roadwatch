package com.roadwatch.backend.models;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "roads")
public class Road {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String roadCode;

    private String name;

    private String roadType;

    private String contractorName;

    private LocalDate lastRelayingDate;

    private Double budgetSanctioned;

    private Double budgetSpent;

    private String status;

    public Road() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getRoadCode() { return roadCode; }
    public void setRoadCode(String roadCode) { this.roadCode = roadCode; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getRoadType() { return roadType; }
    public void setRoadType(String roadType) { this.roadType = roadType; }

    public String getContractorName() { return contractorName; }
    public void setContractorName(String contractorName) { this.contractorName = contractorName; }

    public LocalDate getLastRelayingDate() { return lastRelayingDate; }
    public void setLastRelayingDate(LocalDate lastRelayingDate) { this.lastRelayingDate = lastRelayingDate; }

    public Double getBudgetSanctioned() { return budgetSanctioned; }
    public void setBudgetSanctioned(Double budgetSanctioned) { this.budgetSanctioned = budgetSanctioned; }

    public Double getBudgetSpent() { return budgetSpent; }
    public void setBudgetSpent(Double budgetSpent) { this.budgetSpent = budgetSpent; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
