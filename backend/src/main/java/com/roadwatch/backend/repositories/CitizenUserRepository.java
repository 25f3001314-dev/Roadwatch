package com.roadwatch.backend.repositories;

import com.roadwatch.backend.models.CitizenUser;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CitizenUserRepository extends JpaRepository<CitizenUser, Long> {
    Optional<CitizenUser> findByEmail(String email);
    boolean existsByEmail(String email);
}
