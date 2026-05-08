package com.hera.backend.controller;

import com.hera.backend.dto.request.ActualizarEmailRequest;
import com.hera.backend.dto.request.ActualizarPasswordRequest;
import com.hera.backend.dto.request.ActualizarPerfilRequest;
import com.hera.backend.dto.response.UsuarioResponseDTO;
import com.hera.backend.exception.BusinessException;
import com.hera.backend.service.UsuarioService;
import io.swagger.v3.oas.annotations.Operation;
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

import java.util.Map;

/**
 * Controlador de usuario (perfil)
 *
 * ¿QUÉ hace? Gestiona el perfil del usuario autenticado
 * ¿PARA QUÉ sirve? Ver y actualizar datos personales, email y contraseña
 * Requiere autenticación (Bearer Token)
 */
@RestController
@RequestMapping("/api/usuario")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Usuario", description = "Gestión del perfil de usuario (requiere autenticación)")
@SecurityRequirement(name = "bearerAuth")
public class UsuarioController {

    private final UsuarioService usuarioService;
    private final TokenHelper tokenHelper;

    /**
     * Obtener perfil del usuario autenticado
     */
    @GetMapping("/perfil")
    @Operation(
            summary = "Obtener perfil",
            description = "Retorna los datos del usuario autenticado (nombre, email, teléfono, rol)"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Perfil obtenido exitosamente"),
            @ApiResponse(responseCode = "401", description = "No autenticado"),
            @ApiResponse(responseCode = "404", description = "Usuario no encontrado")
    })
    public ResponseEntity<UsuarioResponseDTO> obtenerPerfil(@AuthenticationPrincipal UserDetails userDetails){
        Long usuarioId = tokenHelper.obtenerIdDesdeUserDetails(userDetails);
        log.info("Obteniendo perfil de usuario ID: {}", usuarioId);
        return ResponseEntity.ok(usuarioService.obtenerPerfil(usuarioId));
    }

    /**
     * Actualizar perfil del usuario
     */
    @PutMapping("/perfil")
    @Operation(
            summary = "Actualizar perfil",
            description = "Actualiza los datos del usuario (nombre, teléfono, fecha de nacimiento). Todos los campos son opcionales."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Perfil actualizado exitosamente"),
            @ApiResponse(responseCode = "400", description = "Datos inválidos"),
            @ApiResponse(responseCode = "401", description = "No autenticado")
    })
    public ResponseEntity<UsuarioResponseDTO> actualizarPerfil(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ActualizarPerfilRequest request){
        Long usuarioId = tokenHelper.obtenerIdDesdeUserDetails(userDetails);
        log.info("Actualizando perfil de usuario iD: {}", usuarioId);
        return ResponseEntity.ok(usuarioService.actualizarPerfil(usuarioId, request));
    }

    /**
     * Cambiar email del usuario
     */
    @PutMapping("/email")
    @Operation(
            summary = "Cambiar email",
            description = "Actualiza el correo electrónico del usuario. El nuevo email no debe estar registrado."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Email actualizado exitosamente"),
            @ApiResponse(responseCode = "400", description = "Email ya existe o inválido"),
            @ApiResponse(responseCode = "401", description = "No autenticado")
    })
    public ResponseEntity<UsuarioResponseDTO> actualizarEmail(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ActualizarEmailRequest request) throws BusinessException {
        Long usuarioId = tokenHelper.obtenerIdDesdeUserDetails(userDetails);
        log.info("Cambiando email para usuario ID: {}", usuarioId);
        return ResponseEntity.ok(usuarioService.actualizarEmail(usuarioId, request));
    }

    /**
     * Cambiar contraseña del usuario
     */
    @PutMapping("/password")
    @Operation(
            summary = "Cambiar contraseña",
            description = "Actualiza la contraseña del usuario. Requiere la contraseña actual para verificación."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Contraseña actualizada exitosamente"),
            @ApiResponse(responseCode = "400", description = "Contraseña actual incorrecta o nueva contraseña inválida"),
            @ApiResponse(responseCode = "401", description = "No autenticado")
    })
    public ResponseEntity<?> actualizarPassword(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ActualizarPasswordRequest request) throws BusinessException {
        Long usuarioId = tokenHelper.obtenerIdDesdeUserDetails(userDetails);
        log.info("Cambiando contraseña para usuario ID: {}", usuarioId);
        usuarioService.actualizarPassword(usuarioId, request);
        return ResponseEntity.ok(Map.of("message", "Contraseña actualizada correctamente"));
    }

}





