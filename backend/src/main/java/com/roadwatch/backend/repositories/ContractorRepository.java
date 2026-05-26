package com.roadwatch.backend.repositories;

import com.roadwatch.backend.models.Contractor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;

public interface ContractorRepository
        extends JpaRepository<Contractor, Long>, JpaSpecificationExecutor<Contractor> {
    Optional<Contractor> findByRegistrationNumber(String registrationNumber);
}
