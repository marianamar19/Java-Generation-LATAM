package com.hera.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO de respuesta para autenticación exitosa
 *
 * ¿QUÉ hace? Devuelve el token JWT y datos básicos del usuario
 * ¿PARA QUÉ sirve? Que el front guarde el token y muestre información del usuario
 * ¿DÓNDE se usa? En AuthController.login() y registro()
 */

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {

    // JWT para autenticar peticiones posteriores
    private String token;
    // Tipo de token (siempre Bearer)
    private String tipo = "Bearer";
    // Email del usuario autenticado
    private String email;
    // Nombre del usuario
    private String nombre;
    // Rol del usuario (USER, ADMIN)
    private String rol;

    // Constructor simplificado para uso común
    public AuthResponse(String token, String email, String nombre, String rol) {
        this.token = token;
        this.email = email;
        this.nombre = nombre;
        this.rol = rol;
        this.tipo = "Bearer";
    }
}
