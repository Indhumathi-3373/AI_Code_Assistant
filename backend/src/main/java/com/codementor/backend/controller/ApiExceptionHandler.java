package com.codementor.backend.controller;

import com.codementor.backend.service.AiServiceException;
import com.codementor.backend.service.InvalidAiConfigurationException;
import jakarta.validation.ConstraintViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.LinkedHashMap;
import java.util.Map;

/** Converts predictable API failures into JSON responses the web client can display. */
@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> validation(MethodArgumentNotValidException exception) {
        String message = exception.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(error -> error.getDefaultMessage())
                .orElse("Invalid request.");
        return response(HttpStatus.BAD_REQUEST, message);
    }

    @ExceptionHandler({BadCredentialsException.class, ConstraintViolationException.class})
    public ResponseEntity<Map<String, String>> badRequest(Exception exception) {
        String message = exception instanceof BadCredentialsException
                ? "Invalid username or password."
                : "Invalid request.";
        return response(HttpStatus.BAD_REQUEST, message);
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, String>> unavailable(IllegalStateException exception) {
        return response(HttpStatus.SERVICE_UNAVAILABLE, exception.getMessage());
    }

    @ExceptionHandler(InvalidAiConfigurationException.class)
    public ResponseEntity<Map<String, String>> invalidAiConfiguration(InvalidAiConfigurationException exception) {
        return response(HttpStatus.BAD_REQUEST, exception.getMessage());
    }

    @ExceptionHandler(AiServiceException.class)
    public ResponseEntity<Map<String, String>> upstreamFailure(AiServiceException exception) {
        Map<String, String> body = new LinkedHashMap<>();
        body.put("message", exception.getMessage());
        if (exception.getUpstreamStatus() != null) {
            body.put("upstreamStatus", exception.getUpstreamStatus().toString());
        }
        return ResponseEntity.status(exception.getHttpStatus()).body(body);
    }

    private ResponseEntity<Map<String, String>> response(HttpStatus status, String message) {
        Map<String, String> body = new LinkedHashMap<>();
        body.put("message", message);
        return ResponseEntity.status(status).body(body);
    }
}
