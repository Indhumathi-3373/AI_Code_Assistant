package com.codementor.backend.dto;

import lombok.Data;

/**
 * LoginRequest
 *
 * DTO representing a request to login using username and password.
 */
@Data
public class LoginRequest {
    private String username;
    private String password;
}
