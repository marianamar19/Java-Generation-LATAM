package com.hera.backend.dto.response;

import lombok.Builder;
import lombok.Data;

/**
 * DTO para enviar direcciones al front-end
 *
 * ¿QUÉ hace? Convierte la entidad Direccion en un formato amigable
 * ¿PARA QUÉ sirve? Mostrar direcciones guardadas en el perfil del usuario
 * ¿DÓNDE se usa? En DireccionController.listar(), obtenerPorId()
 */

@Data
@Builder
public class DireccionResponseDTO {

    private Long id;
    private String alias;
    private String nombreDestinatario;
    private String calleNumero;
    private String numeroInterior;
    private String colonia;
    private String ciudad;
    private String estado;
    private String codigoPostal;
    private String telefonoContacto;
    private Boolean esPredeterminada;
}
