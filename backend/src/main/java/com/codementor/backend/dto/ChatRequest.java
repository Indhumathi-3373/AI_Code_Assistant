package com.codementor.backend.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Pattern;

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

    @Size(max = 500, message = "API key is invalid.")
    private String apiKey;

    @Size(max = 100, message = "Model name is too long.")
    @Pattern(regexp = "^[A-Za-z0-9._/-]*$", message = "Model name is invalid.")
    private String model;

    @Pattern(regexp = "^(openai|nvidia)?$", message = "AI provider is invalid.")
    private String provider;
}
