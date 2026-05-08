package com.hera.backend.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

/**
 * DTO para cada item dentro del carrito
 */

@Data
@Builder
public class CarritoItemResponseDTO {

    private String id;              // ID único para el front (carrito-item-id)
    private String productId;       // ID del producto original
    private String nombre;          // Nombre del producto
    private String marca;           // Marca del producto
    private String variante;        // '50 ml', '100 ml'
    private Integer cantidad;
    private BigDecimal precioUnitario;
    private BigDecimal subtotal;
    private String nivelDisponibilidad; // 'green', 'yellow', 'red'
    private String imagen;          // URL de la imagen principal
}
