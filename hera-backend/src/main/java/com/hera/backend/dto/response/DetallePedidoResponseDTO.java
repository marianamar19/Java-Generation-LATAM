package com.hera.backend.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

/**
 * DTO para cada item dentro del pedido
 */

@Data
@Builder
public class DetallePedidoResponseDTO {

    private String nombreProducto;
    private String variante;
    private Integer cantidad;
    private BigDecimal precioUnitario;
    private BigDecimal subtotal;
    private String imagen;
}
