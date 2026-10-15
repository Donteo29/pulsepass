package com.pulsepass.exception;

import com.pulsepass.dto.response.ErrorResponse;
import jakarta.validation.ConstraintViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.method.annotation.HandlerMethodValidationException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> details = new LinkedHashMap<>();
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            details.putIfAbsent(error.getField(), error.getDefaultMessage() == null
                    ? "Invalid value" : error.getDefaultMessage());
        }
        return build(HttpStatus.BAD_REQUEST, "Validation failed", details);
    }

    @ExceptionHandler(HandlerMethodValidationException.class)
    public ResponseEntity<ErrorResponse> handleMethodValidation(HandlerMethodValidationException ex) {
        return build(HttpStatus.BAD_REQUEST, "Validation failed", Map.of());
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ErrorResponse> handleConstraintViolation(ConstraintViolationException ex) {
        Map<String, String> details = new LinkedHashMap<>();
        ex.getConstraintViolations().forEach(v ->
                details.putIfAbsent(v.getPropertyPath().toString(), v.getMessage()));
        return build(HttpStatus.BAD_REQUEST, "Validation failed", details);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> handleMalformedJson(HttpMessageNotReadableException ex) {
        return build(HttpStatus.BAD_REQUEST, "Malformed or unreadable request body", Map.of());
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(ResourceNotFoundException ex) {
        return build(HttpStatus.NOT_FOUND, ex.getMessage(), Map.of());
    }

    @ExceptionHandler({DuplicateResourceException.class, BusinessRuleException.class})
    public ResponseEntity<ErrorResponse> handleConflict(RuntimeException ex) {
        return build(HttpStatus.CONFLICT, ex.getMessage(), Map.of());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleUnexpected(Exception ex) {
        // No se exponen stack traces ni mensajes internos al cliente.
        return build(HttpStatus.INTERNAL_SERVER_ERROR, "An unexpected internal error occurred", Map.of());
    }

    private ResponseEntity<ErrorResponse> build(
            HttpStatus status, String message, Map<String, String> details) {
        ErrorResponse body = new ErrorResponse(
                LocalDateTime.now(), status.value(), status.getReasonPhrase(), message, details);
        return ResponseEntity.status(status).body(body);
    }
}
