package com.roadwatch.backend.repositories;

import com.roadwatch.backend.models.RepairHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RepairHistoryRepository extends JpaRepository<RepairHistory, Long> {
    List<RepairHistory> findByRoadId(Long roadId);
    List<RepairHistory> findByRoadIdOrderByStartDateDesc(Long roadId);
    List<RepairHistory> findByContractorIdOrderByStartDateDesc(Long contractorId);
    List<RepairHistory> findByStatus(String status);
    List<RepairHistory> findByFailedWithinWarrantyTrue();
}
