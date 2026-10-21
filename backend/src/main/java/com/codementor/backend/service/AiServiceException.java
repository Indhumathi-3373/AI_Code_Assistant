package com.codementor.backend.service;

import org.springframework.http.HttpStatus;

public class AiServiceException extends RuntimeException {

    private final boolean retryable;
    private final HttpStatus httpStatus;
    private final Integer upstreamStatus;

    public AiServiceException(String message, Throwable cause) {
        this(message, cause, false, HttpStatus.BAD_GATEWAY);
    }

    public AiServiceException(String message, Throwable cause, boolean retryable) {
        this(message, cause, retryable, HttpStatus.BAD_GATEWAY);
    }

    public AiServiceException(String message, Throwable cause, boolean retryable, HttpStatus httpStatus) {
        this(message, cause, retryable, httpStatus, null);
    }

    public AiServiceException(String message, Throwable cause, boolean retryable, HttpStatus httpStatus, Integer upstreamStatus) {
        super(message, cause);
        this.retryable = retryable;
        this.httpStatus = httpStatus;
        this.upstreamStatus = upstreamStatus;
    }

    public AiServiceException(String message) {
        this(message, null, false, HttpStatus.BAD_GATEWAY);
    }

    public boolean isRetryable() {
        return retryable;
    }

    public HttpStatus getHttpStatus() {
        return httpStatus;
    }

    public Integer getUpstreamStatus() {
        return upstreamStatus;
    }
}
