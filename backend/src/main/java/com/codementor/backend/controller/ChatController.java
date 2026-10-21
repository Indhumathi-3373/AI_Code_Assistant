package com.codementor.backend.controller;

import com.codementor.backend.dto.ChatRequest;
import com.codementor.backend.dto.ChatResponse;
import com.codementor.backend.model.Conversation;
import com.codementor.backend.repository.ConversationRepository;
import com.codementor.backend.service.OpenAiService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

/**
 * ChatController
 *
 * REST Controller exposing chat interfaces.
 * Connects with OpenAPI service to respond using the 8-Step learning flow.
 * Persists each successful AI interaction as a {@link Conversation} record
 * in the H2 database via {@link ConversationRepository}.
 */
@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final OpenAiService openAiService;
    private final ConversationRepository conversationRepository;

    public ChatController(OpenAiService openAiService, ConversationRepository conversationRepository) {
        this.openAiService = openAiService;
        this.conversationRepository = conversationRepository;
    }

    @PostMapping
    public ResponseEntity<ChatResponse> getChatResponse(@Valid @RequestBody ChatRequest request) {
        String prompt = request.getPrompt().trim();
        ChatResponse response = "nvidia".equalsIgnoreCase(request.getProvider())
                ? openAiService.getCodeMentorResponse(prompt, request.getApiKey(), request.getModel(), request.getProvider())
                : openAiService.getCodeMentorResponse(prompt, request.getApiKey(), request.getModel());

        // Persist the conversation to H2 for history tracking
        Conversation conversation = Conversation.builder()
                .topic(response.getTopic())
                .difficulty(response.getDifficulty())
                .promptText(prompt)
                .build();
        conversationRepository.save(conversation);

        return ResponseEntity.ok(response);
    }
}
