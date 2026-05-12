package com.hera.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * DTO para cambiar la contraseña del usuario
 *
 * ¿QUÉ hace? Recibe la contraseña actual y la nueva
 * ¿PARA QUÉ sirve? Verificar identidad y actualizar la contraseña
 * ¿DÓNDE se usa? En UsuarioController.actualizarPassword()
 */

@Data
public class ActualizarPasswordRequest {

    @NotBlank(message = "La contraseña actual es obligatoria")
    private String passwordActual;

    @NotBlank(message = "La nueva contraseña es obligatoria")
    @Size(min = 6, message = "La nueva contraseña debe tener al menos 6 caracteres")
    private String nuevaPassword;

}
