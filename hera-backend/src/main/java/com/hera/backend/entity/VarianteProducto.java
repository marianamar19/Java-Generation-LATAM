package com.hera.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "variantes_producto")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VarianteProducto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    private Producto producto;

    @Column(unique = true, length = 100)
    private String sku;

    @Column(name = "nombre_variante", length = 100)
    private String nombreVariante;

    @Column(name = "etiqueta_tipo", length = 50)
    @Builder.Default
    private String etiquetaTipo = "Presentación";

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal precio;

    @Column(name = "precio_descuento", precision = 10, scale = 2)
    private BigDecimal precioDescuento;

    @Builder.Default
    private Integer stock = 0;

    @Builder.Default
    private Boolean activo = true;


}
