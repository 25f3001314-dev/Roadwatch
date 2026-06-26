package com.roadwatch.backend.controllers;

import com.roadwatch.backend.dto.ChatRequest;
import com.roadwatch.backend.dto.ChatResponse;
import com.roadwatch.backend.services.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai/chat") 
@RequiredArgsConstructor
@CrossOrigin
public class ChatController {

    private final ChatService chatService;

    @PostMapping
    public ResponseEntity<ChatResponse> handleChat(@RequestBody ChatRequest request) {
        String aiReply = chatService.getAiResponse(request.getMessage());
        return ResponseEntity.ok(new ChatResponse(aiReply));
    }
}