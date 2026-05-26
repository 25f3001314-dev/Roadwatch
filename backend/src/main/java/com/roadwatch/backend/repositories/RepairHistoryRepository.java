package com.roadwatch.backend.repositories;

import com.roadwatch.backend.models.RepairHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RepairHistoryRepository extends JpaRepository<RepairHistory, Long> {
    List<RepairHistory> findByRoadIdOrderByStartDateDesc(Long roadId);
    List<RepairHistory> findByContractorIdOrderByStartDateDesc(Long contractorId);
    List<RepairHistory> findByFailedWithinWarrantyTrue();
    List<RepairHistory> findByStatus(String status);
}
