package com.roadwatch.backend.repositories;

import com.roadwatch.backend.models.MaintenanceSchedule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface MaintenanceScheduleRepository extends JpaRepository<MaintenanceSchedule, Long> {
    List<MaintenanceSchedule> findByRoadId(Long roadId);
    List<MaintenanceSchedule> findByStatus(String status);
    List<MaintenanceSchedule> findByScheduledDateBefore(LocalDate date);
}
