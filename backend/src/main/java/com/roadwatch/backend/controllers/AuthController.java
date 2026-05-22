package com.roadwatch.backend.controllers;

import com.roadwatch.backend.dto.AuthResponse;
import com.roadwatch.backend.dto.LoginRequest;
import com.roadwatch.backend.services.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public AuthResponse login(@RequestBody LoginRequest request) {
        return authService.login(request);
    }
}
