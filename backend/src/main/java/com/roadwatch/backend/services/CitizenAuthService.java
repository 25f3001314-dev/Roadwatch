package com.roadwatch.backend.services;

import com.roadwatch.backend.models.CitizenUser;
import com.roadwatch.backend.repositories.CitizenUserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Locale;

/**
 * Citizen registration + login. Separate from the admin AuthService
 * so the admin website continues working unchanged.
 */
@Service
public class CitizenAuthService {

    private final CitizenUserRepository userRepo;
    private final JwtService jwtService;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);

    public CitizenAuthService(CitizenUserRepository userRepo, JwtService jwtService) {
        this.userRepo = userRepo;
        this.jwtService = jwtService;
    }

    public CitizenUser register(String email, String password, String name, String phone) {
        email = email.toLowerCase(Locale.ROOT).trim();
        if (userRepo.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already registered");
        }
        CitizenUser user = new CitizenUser();
        user.setEmail(email);
        user.setPasswordHash(encoder.encode(password));
        user.setName(name);
        user.setPhone(phone);
        return userRepo.save(user);
    }

    public CitizenUser login(String email, String password) {
        email = email.toLowerCase(Locale.ROOT).trim();
        CitizenUser user = userRepo.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));
        if (!encoder.matches(password, user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }
        return user;
    }

    public String generateToken(CitizenUser user) {
        // Prefix with "citizen:" so JwtAuthFilter can distinguish citizen vs admin tokens
        return jwtService.generateToken("citizen:" + user.getId());
    }
}
