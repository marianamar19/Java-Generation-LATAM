package com.hera.backend.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class CarritoResponseDTO {

    private List<CarritoItemResponseDTO> items;
    private Integer totalItems;
    private BigDecimal subtotal;
    private BigDecimal descuento;
    private BigDecimal total;
    private Boolean tieneEnvioGratis;
    private BigDecimal faltanteEnvioGratis;
}
