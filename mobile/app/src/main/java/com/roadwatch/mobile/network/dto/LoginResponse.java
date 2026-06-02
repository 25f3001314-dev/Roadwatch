package com.roadwatch.mobile.network.dto;

public class LoginResponse {
    public String token;
    public String tokenType;
    public long expiresIn;

    public String resolveToken() {
        return token;
    }

    public String getToken() { return token; }
    public long getExpiresIn() { return expiresIn; }
}