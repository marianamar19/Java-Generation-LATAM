package com.hera.backend.exception;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * DTO para respuestas de error tipadas
 *
 * Alternativa a usar Map<String, Object>
 * Proporciona mejor tipado y documentación
 */
@Data
@Builder
public class ErrorResponse {

    private LocalDateTime timestamp;
    private Integer status;
    private String error;
    private String message;
    private String path;
    private Map<String, String> details;

    public static ErrorResponse of(Integer status, String error, String message) {
        return ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(status)
                .error(error)
                .message(message)
                .build();
    }

    public static ErrorResponse of(Integer status, String error, String message, Map<String, String> details) {
        return ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(status)
                .error(error)
                .message(message)
                .details(details)
                .build();
    }

}
