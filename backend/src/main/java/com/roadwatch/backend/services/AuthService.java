package com.roadwatch.backend.services;

import com.roadwatch.backend.dto.AuthResponse;
import com.roadwatch.backend.dto.LoginRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {

    private final String adminUsername;
    private final String adminPassword;
    private final JwtService jwtService;

    public AuthService(
            @Value("${roadwatch.admin.username}") String adminUsername,
            @Value("${roadwatch.admin.password}") String adminPassword,
            JwtService jwtService) {
        this.adminUsername = adminUsername;
        this.adminPassword = adminPassword;
        this.jwtService = jwtService;
    }

    public AuthResponse login(LoginRequest request) {
        if (request.getUsername() == null || request.getPassword() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Username and password required");
        }
        if (!adminUsername.equals(request.getUsername()) || !adminPassword.equals(request.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }
        String token = jwtService.generateToken(request.getUsername());
        return new AuthResponse(token, jwtService.getExpirationMs() / 1000);
    }
}
