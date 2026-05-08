package com.hera.backend.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

/**
 * DTO para las variantes de producto (tallas, presentaciones)
 */

@Data
@Builder
public class VarianteResponseDTO {

    private String valor;       // '50 ml', '100 ml', 'Talla M'
    private BigDecimal precio;  // Precio de esta variante
    private BigDecimal precioDescuento; // Precio con descuento (si aplica)
    private String etiquetaTipo; // 'Presentación', 'Talla', 'Material'
}
