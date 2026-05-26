package com.roadwatch.backend.repositories;

import com.roadwatch.backend.models.RoadProject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;

public interface RoadProjectRepository
        extends JpaRepository<RoadProject, Long>, JpaSpecificationExecutor<RoadProject> {
    List<RoadProject> findByRoadId(Long roadId);
    List<RoadProject> findByContractorId(Long contractorId);
    List<RoadProject> findByStatus(String status);
}
