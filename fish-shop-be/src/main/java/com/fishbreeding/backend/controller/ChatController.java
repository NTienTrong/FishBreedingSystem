package com.fishbreeding.backend.controller;

import com.fishbreeding.backend.dto.ChatRequest;
import com.fishbreeding.backend.service.GeminiChatService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public/chat")
public class ChatController {

    private final GeminiChatService geminiChatService;

    public ChatController(GeminiChatService geminiChatService) {
        this.geminiChatService = geminiChatService;
    }

    @PostMapping
    public ResponseEntity<String> chat(@Valid @RequestBody ChatRequest request) {
        String answer = geminiChatService.chat(request.message());
        return ResponseEntity.ok(answer);
    }
}
