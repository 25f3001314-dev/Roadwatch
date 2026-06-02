package com.roadwatch.backend.controllers;

import com.roadwatch.backend.models.CitizenUser;
import com.roadwatch.backend.models.DeviceToken;
import com.roadwatch.backend.repositories.CitizenUserRepository;
import com.roadwatch.backend.repositories.DeviceTokenRepository;
import com.roadwatch.backend.services.CitizenAuthService;
import com.roadwatch.backend.services.JwtService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Citizen-facing auth endpoints. Separate from admin /api/auth/login
 * so the deployed admin website is unaffected.
 *
 * Mobile app calls these:
 *   POST /api/citizen/register
 *   POST /api/citizen/login
 *   POST /api/citizen/fcm-token
 *   GET  /api/citizen/me/complaints
 *   GET  /api/citizen/me/notifications
 */
@RestController
@RequestMapping("/api/citizen")
public class CitizenAuthController {

    private final CitizenAuthService authService;
    private final JwtService jwtService;
    private final DeviceTokenRepository tokenRepo;
    private final CitizenUserRepository userRepo;

    public CitizenAuthController(CitizenAuthService authService,
                                 JwtService jwtService,
                                 DeviceTokenRepository tokenRepo,
                                 CitizenUserRepository userRepo) {
        this.authService = authService;
        this.jwtService = jwtService;
        this.tokenRepo = tokenRepo;
        this.userRepo = userRepo;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");
        String name = body.get("name");
        String phone = body.get("phone");

        if (email == null || password == null || password.length() < 8) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Email and password (min 8 chars) required"));
        }

        CitizenUser user = authService.register(email, password, name, phone);
        String token = authService.generateToken(user);
        return ResponseEntity.ok(Map.of(
                "token", token,
                "expiresIn", 86400,
                "user", Map.of(
                        "id", user.getId(),
                        "email", user.getEmail(),
                        "name", user.getName() != null ? user.getName() : "")
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");

        if (email == null || password == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Email and password required"));
        }

        CitizenUser user = authService.login(email, password);
        String token = authService.generateToken(user);
        return ResponseEntity.ok(Map.of(
                "token", token,
                "expiresIn", 86400,
                "user", Map.of(
                        "id", user.getId(),
                        "email", user.getEmail(),
                        "name", user.getName() != null ? user.getName() : "")
        ));
    }

    @PostMapping("/fcm-token")
    public ResponseEntity<?> registerFcmToken(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody Map<String, String> body) {

        Long userId = extractCitizenId(authHeader);
        if (userId == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid citizen token"));
        }

        String fcmToken = body.get("token");
        if (fcmToken == null || fcmToken.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "FCM token required"));
        }

        // Upsert: if token exists, ensure active; if new, insert
        DeviceToken existing = tokenRepo.findByFcmToken(fcmToken).orElse(null);
        if (existing != null) {
            existing.setActive(true);
            tokenRepo.save(existing);
        } else {
            CitizenUser user = userRepo.findById(userId).orElse(null);
            if (user == null) {
                return ResponseEntity.status(401).body(Map.of("error", "User not found"));
            }
            DeviceToken dt = new DeviceToken();
            dt.setUser(user);
            dt.setFcmToken(fcmToken);
            dt.setPlatform(body.getOrDefault("platform", "android"));
            tokenRepo.save(dt);
        }

        return ResponseEntity.ok(Map.of("success", true));
    }

    /**
     * Extract citizen user ID from JWT. Token subject is "citizen:{id}".
     */
    private Long extractCitizenId(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) return null;
        try {
            String token = authHeader.substring(7);
            if (!jwtService.isValid(token)) return null;
            String subject = jwtService.extractUsername(token);
            if (subject != null && subject.startsWith("citizen:")) {
                return Long.parseLong(subject.substring(8));
            }
        } catch (Exception ignored) {}
        return null;
    }
}
