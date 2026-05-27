package com.roadwatch.backend.repositories;

import com.roadwatch.backend.models.Complaint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;

public interface ComplaintRepository extends JpaRepository<Complaint, Long>, JpaSpecificationExecutor<Complaint> {
    List<Complaint> findByReporterContactOrderByTimestampDesc(String reporterContact);
}
