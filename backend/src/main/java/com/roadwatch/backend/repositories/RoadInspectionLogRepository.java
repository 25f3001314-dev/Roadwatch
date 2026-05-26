package com.roadwatch.backend.repositories;

import com.roadwatch.backend.models.RoadInspectionLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RoadInspectionLogRepository extends JpaRepository<RoadInspectionLog, Long> {
    List<RoadInspectionLog> findByRoadIdOrderByInspectionDateDesc(Long roadId);
}
