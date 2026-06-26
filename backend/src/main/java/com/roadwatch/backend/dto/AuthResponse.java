package com.roadwatch.backend.dto;

public class AuthResponse {
    private String token;
    private String tokenType = "Bearer";
    private long expiresIn;
    private String name;
    private String department;

    public AuthResponse(String token, long expiresIn) {
        this.token = token;
        this.expiresIn = expiresIn;
    }

    public AuthResponse(String token, long expiresIn, String name, String department) {
        this.token = token;
        this.expiresIn = expiresIn;
        this.name = name;
        this.department = department;
    }

    public String getToken() { return token; }
    public String getTokenType() { return tokenType; }
    public long getExpiresIn() { return expiresIn; }
    public String getName() { return name; }
    public String getDepartment() { return department; }
}
