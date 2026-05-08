package com.hera.backend.dto.request;

import lombok.Data;

import java.math.BigDecimal;

/**
 * DTO para cada item del pedido
 */

@Data
public class PedidoItemRequest {

    private Long varianteId;
    private Integer cantidad;
    private BigDecimal precioUnitario;
}
