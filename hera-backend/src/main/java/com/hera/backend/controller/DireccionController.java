package com.hera.backend.controller;

import com.hera.backend.dto.request.DireccionRequest;
import com.hera.backend.dto.response.DireccionResponseDTO;
import com.hera.backend.service.DireccionService;
import com.hera.backend.service.UsuarioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controlador de direcciones de envío
 *
 * ¿QUÉ hace? CRUD de direcciones guardadas por el usuario
 * ¿PARA QUÉ sirve? Administrar direcciones en el perfil
 * Requiere autenticación (Bearer Token)
 */
@RestController
@RequestMapping("/api/direcciones")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Direcciones", description = "Gestión de direcciones de envío (requiere autenticación)")
@SecurityRequirement(name = "bearerAuth")
public class DireccionController {

    private final DireccionService direccionService;
    private final UsuarioService usuarioService;

    /**
     * Listar direcciones del usuario
     */
    @GetMapping
    @Operation(summary = "Listar direcciones", description = "Retorna todas las direcciones guardadas por el usuario")
    public ResponseEntity<List<DireccionResponseDTO>> listar(@AuthenticationPrincipal UserDetails userDetails) {
        Long usuarioId = usuarioService.obtenerIdPorEmail(userDetails.getUsername());
        log.info("Listando direcciones del usuario: {}", usuarioId);
        return ResponseEntity.ok(direccionService.listarPorUsuario(usuarioId));
    }

    /**
     * Obtener dirección por ID
     */
    @GetMapping("/{id}")
    @Operation(summary = "Obtener dirección", description = "Retorna una dirección específica por su ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Dirección encontrada"),
            @ApiResponse(responseCode = "404", description = "Dirección no encontrada")
    })
    public ResponseEntity<DireccionResponseDTO> obtener(
            @AuthenticationPrincipal UserDetails userDetails,
            @Parameter(description = "ID de la dirección", example = "1", required = true)
            @PathVariable Long id) {
        Long usuarioId = usuarioService.obtenerIdPorEmail(userDetails.getUsername());
        log.info("Obteniendo dirección ID: {} del usuario: {}", id, usuarioId);
        return ResponseEntity.ok(direccionService.obtenerPorId(usuarioId, id));
    }

    /**
     * Crear nueva dirección
     */
    @PostMapping
    @Operation(summary = "Crear dirección", description = "Agrega una nueva dirección al perfil del usuario")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Dirección creada exitosamente"),
            @ApiResponse(responseCode = "400", description = "Datos inválidos")
    })
    public ResponseEntity<DireccionResponseDTO> crear(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody DireccionRequest request) {
        Long usuarioId = usuarioService.obtenerIdPorEmail(userDetails.getUsername());
        log.info("Creando nueva dirección para usuario: {}", usuarioId);
        return ResponseEntity.ok(direccionService.crear(usuarioId, request));
    }

    /**
     * Actualizar dirección existente
     */
    @PutMapping("/{id}")
    @Operation(summary = "Actualizar dirección", description = "Modifica una dirección existente")
    public ResponseEntity<DireccionResponseDTO> actualizar(
            @AuthenticationPrincipal UserDetails userDetails,
            @Parameter(description = "ID de la dirección a actualizar", required = true)
            @PathVariable Long id,
            @Valid @RequestBody DireccionRequest request) {
        Long usuarioId = usuarioService.obtenerIdPorEmail(userDetails.getUsername());
        log.info("Actualizando dirección ID: {} del usuario: {}", id, usuarioId);
        return ResponseEntity.ok(direccionService.actualizar(usuarioId, id, request));
    }

    /**
     * Eliminar dirección
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar dirección", description = "Elimina una dirección del perfil del usuario")
    public ResponseEntity<?> eliminar(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        Long usuarioId = usuarioService.obtenerIdPorEmail(userDetails.getUsername());
        log.info("Eliminando dirección ID: {} del usuario: {}", id, usuarioId);
        direccionService.eliminar(usuarioId, id);
        return ResponseEntity.ok(java.util.Map.of("message", "Dirección eliminada correctamente"));
    }
}
