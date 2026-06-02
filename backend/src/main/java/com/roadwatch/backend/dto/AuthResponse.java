package com.roadwatch.backend.dto;

public class AuthResponse {
    private String token;
    private String tokenType = "Bearer";
    private long expiresIn;

    public AuthResponse(String token, long expiresIn) {
        this.token = token;
        this.expiresIn = expiresIn;
    }

    public String getToken() { return token; }
    public String getTokenType() { return tokenType; }
    public long getExpiresIn() { return expiresIn; }
}
