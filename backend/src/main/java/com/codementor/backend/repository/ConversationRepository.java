package com.codementor.backend.repository;

import com.codementor.backend.model.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * ConversationRepository
 *
 * Spring Data JPA repository for {@link Conversation} entities.
 * Provides CRUD operations and custom query methods for conversation history.
 */
public interface ConversationRepository extends JpaRepository<Conversation, Long> {

    /**
     * Returns all conversations sorted by creation date descending (newest first).
     *
     * @return list of all conversations
     */
    List<Conversation> findAllByOrderByCreatedAtDesc();

    /**
     * Searches conversations whose topic contains the given keyword (case-insensitive),
     * sorted by creation date descending.
     *
     * @param keyword the search term to match against conversation topics
     * @return matching conversations
     */
    List<Conversation> findByTopicContainingIgnoreCaseOrderByCreatedAtDesc(String keyword);

    /**
     * Returns only pinned conversations sorted by creation date descending.
     *
     * @return list of pinned conversations
     */
    List<Conversation> findByIsPinnedTrueOrderByCreatedAtDesc();
}
