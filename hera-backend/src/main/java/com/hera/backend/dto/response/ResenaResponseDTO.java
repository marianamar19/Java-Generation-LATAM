package com.hera.backend.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * DTO para enviar reseñas de productos al front-end
 *
 * ¿QUÉ hace? Convierte la entidad ResenaProducto en formato amigable
 * ¿PARA QUÉ sirve? Mostrar opiniones de otros clientes en la página del producto
 * ¿DÓNDE se usa? En ProductoController.obtenerResenas()
 */

@Data
@Builder
public class ResenaResponseDTO {

    private Long id;
    private String autor;
    private String ciudad;
    private Byte calificacion; // 1-5 estrellas
    private String comentario;
    private LocalDateTime fecha;
}
