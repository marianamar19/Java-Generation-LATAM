package com.hera.backend.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

/**
 * DTO para actualizar el perfil del usuario
 *
 * ¿QUÉ hace? Recibe los campos editables del perfil
 * ¿PARA QUÉ sirve? Actualizar nombre, teléfono y fecha de nacimiento
 * ¿DÓNDE se usa? En UsuarioController.actualizarPerfil()
 */

@Data
public class ActualizarPerfilRequest {

    @Size(min = 2, max = 100, message = "El nombre debe tener entre 2 y 100 caracteres")
    private String nombre;

    @Size(max = 20, message = "El teléfono no puede exceder 20 caracteres")
    private String telefono;

    private LocalDate fechaNacimiento;
}
