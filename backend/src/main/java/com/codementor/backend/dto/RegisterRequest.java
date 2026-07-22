package com.codementor.backend.dto;

import lombok.Data;

/**
 * RegisterRequest
 *
 * DTO representing a request to register a new user account.
 */
@Data
public class RegisterRequest {
    private String username;
    private String email;
    private String password;
}
