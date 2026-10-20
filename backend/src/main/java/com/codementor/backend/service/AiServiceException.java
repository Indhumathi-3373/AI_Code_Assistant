package com.codementor.backend.service;

public class AiServiceException extends RuntimeException {

    private final boolean retryable;

    public AiServiceException(String message, Throwable cause) {
        this(message, cause, false);
    }

    public AiServiceException(String message, Throwable cause, boolean retryable) {
        super(message, cause);
        this.retryable = retryable;
    }

    public AiServiceException(String message) {
        super(message);
        this.retryable = false;
    }

    public boolean isRetryable() {
        return retryable;
    }
}
