package com.hera.backend.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * DTO para agregar/actualizar items en el carrito
 *
 * ¿QUÉ hace? Recibe la variante y cantidad que el usuario quiere agregar
 * ¿PARA QUÉ sirve? Gestionar el carrito de compras
 * ¿DÓNDE se usa? En CarritoController.agregarItem() y actualizarCantidad()
 */

@Data
public class CarritoItemRequest {

    @NotNull(message = "El ID de la variante es obligatorio")
    private Long varianteId;

    @Min(value = 1, message = "La cantidad debe ser al menos 1")
    private Integer cantidad = 1;

}
