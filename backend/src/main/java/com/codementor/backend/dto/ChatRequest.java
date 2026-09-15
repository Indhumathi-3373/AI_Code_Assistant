package com.codementor.backend.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * ChatRequest
 *
 * Incoming prompt payload from the client.
 */
@Data
public class ChatRequest {
    @NotBlank(message = "Prompt is required.")
    @Size(max = 10000, message = "Prompt must be 10,000 characters or fewer.")
    private String prompt;
}
