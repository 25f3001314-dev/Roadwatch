package com.roadwatch.backend.services;

import com.roadwatch.backend.dto.CitizenAuthRequest;
import com.roadwatch.backend.dto.CitizenLoginResponse;
import com.roadwatch.backend.models.User;
import com.roadwatch.backend.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@Service
public class CitizenAuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtService jwtService;

    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public CitizenLoginResponse login(CitizenAuthRequest request) {
        if (request.getEmail() == null || request.getPassword() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email and password required");
        }
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));

        if (!encoder.matches(request.getPassword(), user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        String token = jwtService.generateToken(user.getEmail());
        return new CitizenLoginResponse(token, jwtService.getExpirationMs() / 1000,
                user.getId(), user.getEmail(), user.getName());
    }

    public CitizenLoginResponse register(Map<String, String> body) {
        String name = body.get("name");
        String email = body.get("email");
        String phone = body.get("phone");
        String password = body.get("password");

        if (name == null || email == null || password == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Name, email and password required");
        }
        if (userRepository.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already registered");
        }

        User user = new User(name, email, phone, encoder.encode(password));
        User saved = userRepository.save(user);

        String token = jwtService.generateToken(saved.getEmail());
        return new CitizenLoginResponse(token, jwtService.getExpirationMs() / 1000,
                saved.getId(), saved.getEmail(), saved.getName());
    }
}
