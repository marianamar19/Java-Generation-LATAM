package com.hera.backend.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * DTO con los datos del usuario para enviar al front
 *
 * ¿QUÉ hace? Devuelve la información del perfil de usuario
 * ¿PARA QUÉ sirve? Mostrar datos en el panel de perfil
 * ¿DÓNDE se usa? En UsuarioController.obtenerPerfil()
 */

@Data
@Builder
public class UsuarioResponseDTO {

    private Long id;
    private String nombre;
    private String email;
    private String telefono;
    private LocalDate fechaNacimiento;
    private String rol;
    private LocalDateTime fechaRegistro;
}
