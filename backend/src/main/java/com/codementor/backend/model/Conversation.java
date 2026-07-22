package com.codementor.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Conversation
 *
 * JPA entity representing a saved conversation session in CodeMentor AI.
 * Each record captures the topic, difficulty level, original prompt,
 * pin status, message count, and the timestamp when it was created.
 * Persisted to the H2 in-memory database via Spring Data JPA.
 */
@Entity
@Table(name = "conversations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Conversation {

    /** Auto-generated primary key. */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** DSA topic extracted from the AI response (e.g., "Binary Search"). */
    private String topic;

    /** Difficulty level extracted from the AI response (e.g., "Medium"). */
    private String difficulty;

    /** The original user prompt that initiated the conversation. */
    @Column(length = 2000)
    private String promptText;

    /** Timestamp when the conversation was first persisted. */
    private LocalDateTime createdAt;

    /** Whether this conversation is pinned by the user. Defaults to false. */
    @Builder.Default
    private boolean isPinned = false;

    /** Number of messages exchanged in this conversation. Defaults to 1. */
    @Builder.Default
    private int messageCount = 1;

    /**
     * Lifecycle callback that auto-populates {@code createdAt} before the
     * entity is first inserted into the database.
     */
    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
