package com.roadwatch.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class ChatResponse {
    private String reply;

    public ChatResponse(String reply) { this.reply = reply; }

    public String getReply() { return reply; }
    public void setReply(String reply) { this.reply = reply; }

    // Frontend agar 'reply' ki jagah 'response' ya 'text' dhoondhe toh usko mil jaye
    @JsonProperty("response")
    public String getResponse() { return reply; }

    @JsonProperty("text")
    public String getText() { return reply; }
}