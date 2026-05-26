package com.roadwatch.backend.repositories;

import com.roadwatch.backend.models.ComplaintAssignmentHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ComplaintAssignmentHistoryRepository
        extends JpaRepository<ComplaintAssignmentHistory, Long> {
    List<ComplaintAssignmentHistory> findByComplaintIdOrderByOccurredAtAsc(Long complaintId);
    List<ComplaintAssignmentHistory> findByAssignedAuthorityIdOrderByOccurredAtDesc(Long authorityId);
}
