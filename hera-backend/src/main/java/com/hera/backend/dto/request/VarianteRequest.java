package com.hera.backend.dto.request;

import lombok.Data;

import java.math.BigDecimal;

/**
 * DTO para variantes de producto (tallas, presentaciones)
 * Se usa dentro de ProductoCreateRequest
 */
@Data
public class VarianteRequest {

    private String nombreVariante;   // "50 ml", "100 ml", "Talla M"
    private BigDecimal precio;
    private BigDecimal precioDescuento;
    private String etiquetaTipo;     // "Presentación", "Talla", "Material"
    private Integer stock;
}
