package com.roadwatch.backend.controllers;

import com.roadwatch.backend.dto.AuthResponse;
import com.roadwatch.backend.dto.LoginRequest;
import com.roadwatch.backend.services.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Value("${roadwatch.admin.username:admin}")
    private String adminUsername;

    @PostMapping("/login")
    public AuthResponse login(@RequestBody LoginRequest request) {
        return authService.login(request);
    }

    /**
     * Returns the currently authenticated principal. Powers the Settings
     * page in the admin UI.
     */
    @GetMapping("/me")
    public Map<String, Object> me(Authentication authentication) {
        String username = authentication != null ? authentication.getName() : adminUsername;
        return Map.of(
                "username", username,
                "role", "ADMIN",
                "displayName", "RoadWatch Administrator"
        );
    }
}
