package com.roadwatch.backend.services;
import com.roadwatch.backend.dto.AuthResponse;
import com.roadwatch.backend.dto.LoginRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@Service
public class AuthService {
    private final String adminUsername;
    private final String adminPassword;
    private final JwtService jwtService;

    private static final Map<String, String[]> OFFICERS = Map.of(
            "pwd_officer", new String[]{"pwd123", "Rajesh Kumar Singh", "PWD"},
            "civic_officer", new String[]{"civic123", "Sunita Sharma", "Civic Maintenance"},
            "traffic_officer", new String[]{"traffic123", "Amit Verma", "Traffic"},
            "electricity_officer", new String[]{"elec123", "Priya Gupta", "Electricity"}
    );

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

        String username = request.getUsername();
        String password = request.getPassword();

        // Check hardcoded officer accounts first
        if (OFFICERS.containsKey(username)) {
            String[] officer = OFFICERS.get(username);
            if (!officer[0].equals(password)) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
            }
            String token = jwtService.generateToken(username);
            return new AuthResponse(token, jwtService.getExpirationMs() / 1000, officer[1], officer[2]);
        }

        // Fall back to admin login
        if (!adminUsername.equals(username) || !adminPassword.equals(password)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }
        String token = jwtService.generateToken(username);
        return new AuthResponse(token, jwtService.getExpirationMs() / 1000);
    }
}
