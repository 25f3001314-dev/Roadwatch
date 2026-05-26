package com.roadwatch.backend.repositories;

import com.roadwatch.backend.models.Road;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoadRepository extends JpaRepository<Road, Long>, JpaSpecificationExecutor<Road> {
    Optional<Road> findByRoadCode(String roadCode);
    List<Road> findByAuthorityDepartment(String authorityDepartment);
    List<Road> findByContractorId(Long contractorId);
    List<Road> findByDistrict(String district);
    List<Road> findByRoadType(String roadType);
}
