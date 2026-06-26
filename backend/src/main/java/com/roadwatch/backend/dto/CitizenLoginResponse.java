package com.roadwatch.backend.dto;

public class CitizenLoginResponse {
    private String token;
    private String tokenType = "Bearer";
    private long expiresIn;
    private UserInfo user;

    public CitizenLoginResponse(String token, long expiresIn, Long userId, String email, String name) {
        this.token = token;
        this.expiresIn = expiresIn;
        this.user = new UserInfo(userId, email, name);
    }

    public String getToken() { return token; }
    public String getTokenType() { return tokenType; }
    public long getExpiresIn() { return expiresIn; }
    public UserInfo getUser() { return user; }

    public static class UserInfo {
        private Long id;
        private String email;
        private String name;

        public UserInfo(Long id, String email, String name) {
            this.id = id;
            this.email = email;
            this.name = name;
        }

        public Long getId() { return id; }
        public String getEmail() { return email; }
        public String getName() { return name; }
    }
}
