package com.hera.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * DTO para crear/actualizar direcciones de envío
 *
 * ¿QUÉ hace? Recibe todos los campos de una dirección
 * ¿PARA QUÉ sirve? Crear o modificar direcciones en el perfil del usuario
 * ¿DÓNDE se usa? En DireccionController.guardar() y actualizar()
 */

@Data
public class DireccionRequest {

    private Long id;

    @NotBlank(message = "El alias es obligatorio (Ej: Casa, Oficina)")
    @Size(max = 50, message = "El alias no puede exceder 50 caracteres")
    private String alias;

    @NotBlank(message = "El nombre del destinatario es obligatorio")
    @Size(max = 100, message = "El nombre no puede exceder 100 caracteres")
    private String nombreDestinatario;

    @NotBlank(message = "La calle y número es obligatorio")
    @Size(max = 150, message = "La calle no puede exceder 150 caracteres")
    private String calleNumero;

    @Size(max = 20, message = "El número interior no puede exceder 20 caracteres")
    private String numeroInterior;

    @NotBlank(message = "La colonia es obligatoria")
    @Size(max = 100, message = "La colonia no puede exceder 100 caracteres")
    private String colonia;

    @NotBlank(message = "La ciudad es obligatoria")
    @Size(max = 100, message = "La ciudad no puede exceder 100 caracteres")
    private String ciudad;

    @NotBlank(message = "El estado es obligatorio")
    @Size(max = 50, message = "El estado no puede exceder 50 caracteres")
    private String estado;

    @NotBlank(message = "El código postal es obligatorio")
    @Size(min = 5, max = 10, message = "El código postal debe tener entre 5 y 10 caracteres")
    private String codigoPostal;

    @Size(max = 20, message = "El teléfono no puede exceder 20 caracteres")
    private String telefonoContacto;

    // Si es true, se marca como dirección principal
    private Boolean esPredeterminada;
}

