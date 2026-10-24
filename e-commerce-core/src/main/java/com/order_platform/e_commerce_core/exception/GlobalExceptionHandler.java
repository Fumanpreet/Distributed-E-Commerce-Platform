package com.order_platform.e_commerce_core.exception;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.client.RestClientException;

import java.time.Instant;
import java.util.stream.Collectors;

/*
 * Turns exceptions into a consistent JSON error body the frontend can show:
 * { status, error, message, path, timestamp }
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    public record ErrorResponse(int status, String error, String message, String path, Instant timestamp) {
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    ResponseEntity<ErrorResponse> handleNotFound(ResourceNotFoundException ex, HttpServletRequest request) {
        return build(HttpStatus.NOT_FOUND, ex.getMessage(), request);
    }

    // e.g. "User with this email already exists"
    @ExceptionHandler(IllegalArgumentException.class)
    ResponseEntity<ErrorResponse> handleBadArgument(IllegalArgumentException ex, HttpServletRequest request) {
        return build(HttpStatus.CONFLICT, ex.getMessage(), request);
    }

    // e.g. checkout with an empty cart
    @ExceptionHandler(IllegalStateException.class)
    ResponseEntity<ErrorResponse> handleBadState(IllegalStateException ex, HttpServletRequest request) {
        return build(HttpStatus.BAD_REQUEST, ex.getMessage(), request);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex, HttpServletRequest request) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .map(error -> error.getField() + " " + error.getDefaultMessage())
                .collect(Collectors.joining(", "));
        return build(HttpStatus.BAD_REQUEST, message, request);
    }

    // checkout-service / inventory-service unreachable or erroring
    @ExceptionHandler(RestClientException.class)
    ResponseEntity<ErrorResponse> handleDownstream(RestClientException ex, HttpServletRequest request) {
        log.error("Downstream service call failed", ex);
        return build(HttpStatus.BAD_GATEWAY, "A backend service is unavailable, please try again", request);
    }

    private ResponseEntity<ErrorResponse> build(HttpStatus status, String message, HttpServletRequest request) {
        return ResponseEntity.status(status)
                .body(new ErrorResponse(status.value(), status.getReasonPhrase(), message, request.getRequestURI(), Instant.now()));
    }
}
