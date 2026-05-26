package com.roadwatch.backend.repositories;

import com.roadwatch.backend.models.Authority;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuthorityRepository
        extends JpaRepository<Authority, Long>, JpaSpecificationExecutor<Authority> {
    List<Authority> findByDepartment(String department);
    List<Authority> findByDistrict(String district);
    List<Authority> findByDepartmentAndDistrict(String department, String district);
}
