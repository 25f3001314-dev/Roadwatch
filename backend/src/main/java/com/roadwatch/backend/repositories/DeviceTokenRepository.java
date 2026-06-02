package com.roadwatch.backend.repositories;

import com.roadwatch.backend.models.CitizenUser;
import com.roadwatch.backend.models.DeviceToken;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface DeviceTokenRepository extends JpaRepository<DeviceToken, Long> {
    Optional<DeviceToken> findByFcmToken(String fcmToken);
    List<DeviceToken> findByUserAndActiveTrue(CitizenUser user);
    List<DeviceToken> findByUser_IdAndActiveTrue(Long userId);
}
