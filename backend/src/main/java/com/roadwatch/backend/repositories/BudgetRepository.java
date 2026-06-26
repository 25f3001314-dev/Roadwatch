package com.roadwatch.backend.repositories;

import com.roadwatch.backend.models.Budget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, Long> {
    // Ye method chatbot ko roadId se budget dhoondhne me madad karega
    Optional<Budget> findByRoadId(Long roadId);
}
