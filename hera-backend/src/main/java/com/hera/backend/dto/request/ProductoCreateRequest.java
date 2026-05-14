package com.hera.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

/**
 * DTO para crear o actualizar un producto
 *
 * ¿QUÉ hace? Recibe los datos del producto desde el frontend
 * ¿PARA QUÉ sirve? Crear nuevos productos o actualizar existentes
 * ¿DÓNDE se usa? En AdminProductoController
 */
@Data
public class ProductoCreateRequest {

    // ========== CAMPOS OBLIGATORIOS ==========

    @NotBlank(message = "El nombre es obligatorio")
    private String nombre;

    @NotBlank(message = "El tipo es obligatorio (perfumes/joyeria)")
    private String tipo;

    @NotNull(message = "El precio base es obligatorio")
    @Positive(message = "El precio debe ser mayor a 0")
    private BigDecimal precioBase;

    // ========== IDENTIFICADORES (generados automáticamente en backend) ==========

    private String productoId; // ignorado al crear, generado por el service
    private String slug;       // ignorado al crear, generado por el service

    // ========== CONCENTRACIÓN / MATERIAL ==========

    private String concentracion; // EDP, EDT, EDC, PAR, ELI, FRA — solo perfumes
    private String material;      // PLT, ORO — solo joyería

    // ========== CAMPOS OPCIONALES ==========

    private String descripcion;
    private String perfumista;
    private Integer anioLanzamiento;
    private String paisOrigen;
    private String badge;
    private String imagenPrincipalUrl;
    private String imagenesExtra;

    // ========== FLAGS ==========

    private Boolean esNuevo;
    private Boolean esBestSeller;
    private Boolean esDestacado;
    private Boolean activo;

    // ========== RELACIONES ==========

    private String marca;
    private String categoria;
    private String genero;
    private String familiaOlfativa;
    private String nivelDisponibilidad;

    // ========== LISTAS ==========

    private List<VarianteRequest> variantes;
    private List<ImagenRequest> imagenes;
    private List<Integer> temporadas;
    private List<Integer> momentosDia;
    private List<Integer> ocasiones;
    private Integer longevidad;
    private Integer estela;
    private List<String> notasSalida;
    private List<String> notasCorazon;
    private List<String> notasBase;
}
