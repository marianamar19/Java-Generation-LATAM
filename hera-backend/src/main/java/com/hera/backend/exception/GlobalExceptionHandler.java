package com.hera.backend.exception;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Manejador global de excepciones
 *
 * ¿QUÉ hace? Intercepta todas las excepciones lanzadas por los controllers
 * ¿PARA QUÉ sirve? Devolver respuestas consistentes y amigables al front-end
 * ¿CÓMO funciona? @RestControllerAdvice captura excepciones de toda la app
 *
 *  ESTRUCTURA DE RESPUESTA DE ERROR:
 * {
 *   "timestamp": "2024-01-15T10:30:00",
 *   "status": 400,
 *   "error": "Bad Request",
 *   "message": "El email ya está registrado",
 *   "path": "/api/auth/registro"
 * }
 */
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    // ESTE MÉTODO - Captura RuntimeException y los convierte en 400
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handleRuntimeException(RuntimeException ex) {
        log.warn("Error de negocio: {}", ex.getMessage());

        Map<String, Object> response = buildErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                "Bad Request",
                ex.getMessage(),  // ← Usa el mensaje original
                null
        );

        return ResponseEntity.badRequest().body(response);
    }


    /**
     * Maneja excepciones de validación de Bean Validation (@Valid)
     *
     * ¿CUÁNDO ocurre? Cuando un @RequestBody no cumple las validaciones
     * Ej: @NotBlank, @Email, @Size
     *
     * @param ex Excepción con detalles de campos inválidos
     * @return Mapa con campo → mensaje de error
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationExceptions(
            MethodArgumentNotValidException ex) {

        log.warn("Error de validación: {}", ex.getMessage());

        Map<String, String> fieldErrors = new HashMap<>();
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            fieldErrors.put(error.getField(), error.getDefaultMessage());
        }

        Map<String, Object> response = buildErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                "Bad Request",
                "Error de validación en los campos enviados",
                fieldErrors
        );

        return ResponseEntity.badRequest().body(response);
    }

    /**
     * Maneja excepciones de validación de constraint violations
     *
     * ¿CUÁNDO ocurre? Cuando un @RequestParam o @PathVariable no es válido
     */
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<Map<String, Object>> handleConstraintViolation(
            ConstraintViolationException ex) {

        log.warn("Violación de constraint: {}", ex.getMessage());

        String errors = ex.getConstraintViolations().stream()
                .map(ConstraintViolation::getMessage)
                .collect(Collectors.joining(", "));

        Map<String, Object> response = buildErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                "Bad Request",
                errors,
                null
        );

        return ResponseEntity.badRequest().body(response);
    }

    /**
     * Maneja excepciones de tipo de argumento incorrecto
     *
     * ¿CUÁNDO ocurre? Cuando se pasa un String donde se espera un Long
     * Ej: /api/usuarios/abc (siendo abc no numérico)
     */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<Map<String, Object>> handleTypeMismatch(
            MethodArgumentTypeMismatchException ex) {

        log.warn("Tipo de argumento incorrecto: {}", ex.getMessage());

        String message = String.format(
                "El parámetro '%s' debe ser de tipo %s",
                ex.getName(),
                ex.getRequiredType() != null ? ex.getRequiredType().getSimpleName() : "válido"
        );

        Map<String, Object> response = buildErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                "Bad Request",
                message,
                null
        );

        return ResponseEntity.badRequest().body(response);
    }

    /**
     * Maneja excepciones de JSON mal formado
     *
     * ¿CUÁNDO ocurre? Cuando el body de la petición no es JSON válido
     */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, Object>> handleMalformedJson(
            HttpMessageNotReadableException ex) {

        log.warn("JSON mal formado: {}", ex.getMessage());

        Map<String, Object> response = buildErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                "Bad Request",
                "El cuerpo de la petición no es un JSON válido",
                null
        );

        return ResponseEntity.badRequest().body(response);
    }

    /**
     * Maneja excepciones de credenciales incorrectas (login)
     *
     * ¿CUÁNDO ocurre? Cuando el usuario ingresa email o contraseña incorrectos
     */
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<Map<String, Object>> handleBadCredentials(
            BadCredentialsException ex) {

        log.warn("Credenciales inválidas: {}", ex.getMessage());

        Map<String, Object> response = buildErrorResponse(
                HttpStatus.UNAUTHORIZED.value(),
                "Unauthorized",
                "Credenciales inválidas. Verifica tu email y contraseña",
                null
        );

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }

    /**
     * Maneja excepciones de acceso denegado (falta de permisos)
     *
     * ¿CUÁNDO ocurre? Cuando un usuario sin rol ADMIN intenta acceder a /api/admin
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, Object>> handleAccessDenied(
            AccessDeniedException ex) {

        log.warn("Acceso denegado: {}", ex.getMessage());

        Map<String, Object> response = buildErrorResponse(
                HttpStatus.FORBIDDEN.value(),
                "Forbidden",
                "No tienes permisos para acceder a este recurso",
                null
        );

        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
    }

    /**
     * Maneja excepciones de recursos no encontrados (404)
     *
     * ¿CUÁNDO ocurre? Cuando un producto, usuario, etc. no existe en BD
     */
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNotFound(
            ResourceNotFoundException ex) {

        log.warn("Recurso no encontrado: {}", ex.getMessage());

        Map<String, Object> response = buildErrorResponse(
                HttpStatus.NOT_FOUND.value(),
                "Not Found",
                ex.getMessage(),
                null
        );

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }

    /**
     * Maneja excepciones de negocio (errores esperados)
     *
     * ¿CUÁNDO ocurre? Cuando hay violación de reglas de negocio
     * Ej: email ya registrado, producto sin stock, etc.
     */
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<Map<String, Object>> handleBusinessException(
            BusinessException ex) {

        log.warn("Error de negocio: {}", ex.getMessage());

        HttpStatus status = ex.getStatus() != null ? ex.getStatus() : HttpStatus.BAD_REQUEST;

        Map<String, Object> response = buildErrorResponse(
                status.value(),
                status.getReasonPhrase(),
                ex.getMessage(),
                null
        );

        return ResponseEntity.status(status).body(response);
    }

    /**
     * Maneja cualquier otra excepción no capturada (fallback)
     *
     * ¿CUÁNDO ocurre? Error inesperado del servidor (500)
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenericException(Exception ex) {

        log.error("Error interno del servidor: {}", ex.getMessage(), ex);

        Map<String, Object> response = buildErrorResponse(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Internal Server Error",
                "Ocurrió un error inesperado. Por favor, intenta más tarde",
                null
        );

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    /**
     * Construye la respuesta de error estándar
     *
     * @param status Código HTTP (400, 401, 404, 500, etc.)
     * @param error Nombre del error (Bad Request, Unauthorized, etc.)
     * @param message Mensaje legible para el usuario
     * @param details Detalles adicionales (errores de validación por campo)
     * @return Mapa con la estructura de error
     */
    private Map<String, Object> buildErrorResponse(
            int status,
            String error,
            String message,
            Map<String, String> details) {

        Map<String, Object> response = new HashMap<>();
        response.put("timestamp", LocalDateTime.now().toString());
        response.put("status", status);
        response.put("error", error);
        response.put("message", message);
        response.put("path", getCurrentPath());

        if (details != null && !details.isEmpty()) {
            response.put("details", details);
        }

        return response;
    }

    /**
     * Obtiene la ruta actual desde el contexto de la petición
     * NOTA: Requiere importar HttpServletRequest
     * Para simplificar, se puede omitir o pasar como parámetro
     */
    private String getCurrentPath() {
        // Implementación simplificada
        return "";
    }


}
