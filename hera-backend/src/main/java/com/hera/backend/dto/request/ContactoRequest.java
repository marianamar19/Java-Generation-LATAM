package com.hera.backend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * DTO para el formulario de contacto
 *
 * ¿QUÉ hace? Recibe el mensaje que envía un usuario desde el front
 * ¿PARA QUÉ sirve? Almacenar consultas, dudas o sugerencias
 * ¿DÓNDE se usa? En ContactoController.enviarMensaje()
 */

@Data
public class ContactoRequest {

    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 100, message = "El nombre no puede exceder 100 caracteres")
    private String nombre;

    @NotBlank(message = "El email es obligatorio")
    @Email(message = "Debe ser un email válido")
    @Size(max = 150, message = "El email no puede exceder 150 caracteres")
    private String email;

    @Size(max = 20, message = "El teléfono no puede exceder 20 caracteres")
    private String telefono;

    @NotBlank(message = "El asunto es obligatorio")
    @Size(max = 50, message = "El asunto no puede exceder 50 caracteres")
    private String asunto;

    @NotBlank(message = "El mensaje es obligatorio")
    private String mensaje;
}
