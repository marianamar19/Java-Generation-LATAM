package com.hera.backend.controller;

import com.hera.backend.dto.request.AuthRequest;
import com.hera.backend.dto.request.RegistroRequest;
import com.hera.backend.dto.response.AuthResponse;
import com.hera.backend.exception.BusinessException;
import com.hera.backend.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controlador de autenticación
 *
 * ¿QUÉ hace? Expone endpoints para login, registro y logout
 * ¿PARA QUÉ sirve? Autenticar usuarios y gestionar sesiones JWT
 * ¿DÓNDE está disponible? En /api/auth/*
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Autenticación", description = "Endpoints para login, registro y gestión de sesiones")
public class AuthController {

    private final AuthService authService;

    /**
     * Registro de nuevo usuario
     */
    @PostMapping("/registrar")
    @Operation(
            summary = "Registro de nuevo usuario",
            description = "Crea una nueva cuenta de usuario en el sistema. EL email debe ser único."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Usuario registrado exitosamente",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = AuthResponse.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Datos inválidos o email ya existente",
                    content = @Content(mediaType = "application/json", examples = @ExampleObject(value = """
                            {
                                                "timestamp": "2024-01-15T10:30:00",
                                                "status": 400,
                                                "error": "Bad Request",
                                                "message": "El email ya está registrado"
                                            }
                            """))
            )
    })
    public ResponseEntity<AuthResponse> registrar(
            @Parameter(description = "Datos de registro del usuario", required = true)
            @Valid @RequestBody RegistroRequest request){
        log.info("Solicitud de registro para email: {}", request.getEmail());
        AuthResponse response = authService.registrar(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Login de usuario
     */
    @PostMapping("/login")
    @Operation(
            summary = "Login de usuario",
            description = "Autentica un usuario con email y contraseña. Retorna un token JWT para futuras peticiones."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Login exitoso",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = AuthResponse.class))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Credenciales inválidas",
                    content = @Content(mediaType = "application/json", examples = @ExampleObject(value = """
                {
                    "timestamp": "2024-01-15T10:30:00",
                    "status": 401,
                    "error": "Unauthorized",
                    "message": "Credenciales inválidas"
                }
            """))
            )
    })
    public ResponseEntity<AuthResponse> login(
            @Parameter(description = "Credenciales de acceso", required = true)
            @Valid @RequestBody AuthRequest request) throws BusinessException {
        log.info("Intento de login para email: {}", request.getEmail());
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Logout de usuario
     */
    @PostMapping("/logout")
    @Operation(
            summary = "Cerrar sesión",
            description = "Invalida el token JWT actual. El token ya no podrá ser usado para autenticación."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Sesión cerrada correctamente"),
            @ApiResponse(responseCode = "401", description = "Token inválido o no proporcionado")
    })
    public ResponseEntity<?> logout(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            authService.logout(token);
            log.info("Logout exitoso");
        }
        return ResponseEntity.ok(java.util.Map.of("message", "Sesión cerrada correctamente"));
    }

    /**
     * Validar token (útil para debugging)
     */
    @GetMapping("/validar-token")
    @Operation(
            summary = "Validar token JWT",
            description = "Verifica si un token JWT es válido y no ha expirado. Útil para debugging."
    )
    public ResponseEntity<?> validarToken(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            boolean isValid = authService.validarToken(token);
            return ResponseEntity.ok(java.util.Map.of("valido", isValid));
        }
        return ResponseEntity.ok(java.util.Map.of("valido", false, "message", "No se proporcionó token"));
    }

}
