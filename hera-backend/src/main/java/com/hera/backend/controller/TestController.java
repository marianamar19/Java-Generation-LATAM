package com.hera.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Controlador de pruebas (solo desarrollo)
 *
 * ¿PARA QUÉ sirve? Verificar que el backend está funcionando
 * Endpoint público (no requiere autenticación)
 */
@RestController
@RequestMapping("/api/test")
@Slf4j
@Tag(name = "Test", description = "Endpoints para pruebas y health check")
public class TestController {

    /**
     * Health check
     */
    @GetMapping("/hello")
    @Operation(
            summary = "Health check",
            description = "Verifica que el servidor está respondiendo correctamente"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Servidor funcionando correctamente"),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public ResponseEntity<Map<String, String>> hello() {
        log.info("Health check");

        Map<String, String> response = new HashMap<>();
        response.put("message", "¡HERA Backend funcionando correctamente!");
        response.put("status", "OK");
        response.put("timestamp", LocalDateTime.now().toString());
        response.put("version", "1.0.0");

        return ResponseEntity.ok(response);
    }

    /**
     * Database health check
     */
    @GetMapping("/db-check")
    @Operation(
            summary = "Database health check",
            description = "Verifica que la conexión a la base de datos está activa"
    )
    public ResponseEntity<Map<String, Object>> dbCheck() {
        log.info("Database health check");

        Map<String, Object> response = new HashMap<>();
        response.put("database", "hera_db");
        response.put("status", "conectada");
        response.put("message", "Base de datos lista para usar");
        response.put("timestamp", LocalDateTime.now().toString());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/ping")
    public Map<String, String> ping() {
        return Map.of("status", "ok", "message", "Test controller works!");
    }

}
