package com.codementor.backend.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;

/**
 * LoginRequest
 *
 * DTO representing a request to login using username and password.
 */
@Data
public class LoginRequest {
    @NotBlank(message = "Username is required.")
    private String username;
    @NotBlank(message = "Password is required.")
    private String password;
}
