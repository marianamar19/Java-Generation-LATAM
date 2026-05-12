package com.hera.backend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * DTO para la solicitud de autenticación (login)
 *
 * ¿QUÉ hace? Recibe las credenciales del usuario desde el front-end
 * ¿PARA QUÉ sirve? Validar y procesar el inicio de sesión
 * ¿DÓNDE se usa? En AuthController.login()
 */

@Data
public class AuthRequest {
    @NotBlank(message = "El email es obligatorio")
    @Email(message = "Debe ser un email válido")
    private String email;

    @NotBlank(message = "La contraseña es obligatoria")
    private String password;
}
