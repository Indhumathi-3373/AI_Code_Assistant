package com.codementor.backend.dto;

import lombok.Data;

/**
 * ChatRequest
 *
 * Incoming prompt payload from the client.
 */
@Data
public class ChatRequest {
    private String prompt;
}
