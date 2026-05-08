package com.hera.backend.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

/**
 * DTO para enviar productos al front-end
 *
 * ¿QUÉ hace? Convierte la entidad Producto en un formato amigable para el front
 * ¿PARA QUÉ sirve? Mostrar productos en catálogo, búsquedas, favoritos
 * ¿DÓNDE se usa? En ProductoController.listar(), buscar(), obtenerPorId()
 *
 *  TRANSFORMACIONES IMPORTANTES:
 * - nivelDisponibilidad: de FK (id=1) a string ("green") → front espera string
 * - genero: de FK (id=1) a string ("masculino") → front espera string
 * - familiaOlfativa: de FK (id=1) a string ("floral") → front espera string
 * - temporadas: de relación N:M a List<String> → front espera ["otoño","invierno"]
 * - precio: de BigDecimal a string formateado "$2,490 MXN" → front espera string
 */

@Data
@Builder
public class ProductoResponseDTO {

    // Identificación
    private String productId;   // ID único para el front
    private String slug;        // URL amigable
    private String nombre;      // Nombre del producto

    // Marcas y categorias
    private String marca;       // Nombre de la marca (no el ID)
    private String categoria;   // Nombre de la categoría (no el ID)
    private String tipo;        // 'perfumes' o 'joyeria'

    // Precios
    private String precio;      // Formateado: "$2,490 MXN"
    private BigDecimal precioNumerico; // Valor numérico para cálculos

    // Badge y disponibilidad
    private String badge;       // 'Más vendido', 'Nuevo', '-20%'
    private String nivelDisponibilidad; // 'green', 'yellow', 'red'
    private String genero;      // 'masculino', 'femenino', 'unisex'
    private String familiaOlfativa; // 'floral', 'oriental', etc.

    //Contenido
    private String descripcion;
    private String perfumista;
    private Integer anioLanzamiento;
    private String paisOrigen;

    // Rendimiento (de tabla separada)
    private Integer longevidad;     // 1-5
    private Integer estela;         // 1-5
    private Double puntuacionGeneral; // 0-5

    // Contexto (arrays normalizados)
    private List<String> temporadas; // ['primavera', 'verano']
    private List<String> momentosDia; // ['dia', 'noche']
    private List<String> ocasiones; // ['cita', 'gala']

    // Flags
    private Boolean esNuevo;
    private Boolean esBestSeller;
    private Boolean esDestacado;

    // Imagenes
    private String imagenPrincipalUrl;
    private List<String> imagenes;

    // Variantes (tallas, presentaciones)
    private List<VarianteResponseDTO> variantes;
}
