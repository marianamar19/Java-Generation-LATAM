package com.hera.backend.dto.response;

import lombok.Builder;
import lombok.Data;

/**
 * DTO para la dirección dentro del pedido
 */

@Data
@Builder
public class DireccionEnvioDTO {

    private String calle;
    private String colonia;
    private String ciudad;
    private String estado;
    private String cp;
}
