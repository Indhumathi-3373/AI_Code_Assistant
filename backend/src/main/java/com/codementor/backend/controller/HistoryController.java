package com.codementor.backend.controller;

import com.codementor.backend.model.Conversation;
import com.codementor.backend.repository.ConversationRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * HistoryController
 *
 * REST controller that exposes conversation history management endpoints.
 * Supports listing, searching, deleting, pinning/unpinning, and renaming
 * previously saved conversations stored in the H2 database.
 */
@RestController
@RequestMapping("/api/history")
public class HistoryController {

    private final ConversationRepository conversationRepository;

    public HistoryController(ConversationRepository conversationRepository) {
        this.conversationRepository = conversationRepository;
    }

    /**
     * GET /api/history
     * Returns all conversations ordered by creation date descending (newest first).
     *
     * @return list of all conversations
     */
    @GetMapping
    public ResponseEntity<List<Conversation>> getAllConversations() {
        List<Conversation> conversations = conversationRepository.findAllByOrderByCreatedAtDesc();
        return ResponseEntity.ok(conversations);
    }

    /**
     * GET /api/history/search?keyword={keyword}
     * Searches conversations by topic keyword (case-insensitive).
     *
     * @param keyword the search term
     * @return matching conversations ordered by date descending
     */
    @GetMapping("/search")
    public ResponseEntity<List<Conversation>> searchConversations(@RequestParam String keyword) {
        List<Conversation> results =
                conversationRepository.findByTopicContainingIgnoreCaseOrderByCreatedAtDesc(keyword);
        return ResponseEntity.ok(results);
    }

    /**
     * DELETE /api/history/{id}
     * Deletes a conversation by its ID.
     *
     * @param id the conversation ID to delete
     * @return 204 No Content on success, 404 if not found
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteConversation(@PathVariable Long id) {
        if (!conversationRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        conversationRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * PATCH /api/history/{id}/pin
     * Toggles the {@code isPinned} flag on a conversation.
     *
     * @param id the conversation ID
     * @return updated conversation, or 404 if not found
     */
    @PatchMapping("/{id}/pin")
    public ResponseEntity<Conversation> togglePin(@PathVariable Long id) {
        return conversationRepository.findById(id)
                .map(conversation -> {
                    conversation.setPinned(!conversation.isPinned());
                    return ResponseEntity.ok(conversationRepository.save(conversation));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * PATCH /api/history/{id}/rename
     * Updates the topic of a conversation.
     *
     * @param id   the conversation ID
     * @param body request body containing the key {@code "topic"} with the new name
     * @return updated conversation, or 404 if not found
     */
    @PatchMapping("/{id}/rename")
    public ResponseEntity<Conversation> renameConversation(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        return conversationRepository.findById(id)
                .map(conversation -> {
                    conversation.setTopic(body.get("topic"));
                    return ResponseEntity.ok(conversationRepository.save(conversation));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
