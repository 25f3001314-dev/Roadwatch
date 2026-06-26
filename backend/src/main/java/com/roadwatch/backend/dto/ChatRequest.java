package com.roadwatch.backend.dto;

import com.fasterxml.jackson.annotation.JsonAlias;

public class ChatRequest {
    // If frontend sends 'message', 'text', or 'prompt', this will handle it
    @JsonAlias({"text", "prompt", "userText"})
    private String message;

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}