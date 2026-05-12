package com.hera.backend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * DTO para cambiar el email del usuario
 *
 * ¿QUÉ hace? Recibe el nuevo email del usuario
 * ¿PARA QUÉ sirve? Actualizar el correo electrónico en la cuenta
 * ¿DÓNDE se usa? En UsuarioController.actualizarEmail()
 */

@Data
public class ActualizarEmailRequest {

    @NotBlank(message = "El nuevo email es obligatorio")
    @Email(message = "Debe ser un email válido")
    private String nuevoEmail;
}
