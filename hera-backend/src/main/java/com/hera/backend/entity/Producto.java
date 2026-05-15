package com.hera.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "productos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class Producto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "producto_id", unique = true, length = 50)
    private String productoId;

    @Column(unique = true, length = 150)
    private String slug;

    @Column(nullable = false, length = 150)
    private String nombre;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "marca_id", nullable = false)
    private Marca marca;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "categoria_id", nullable = false)
    private Categoria categoria;

    @Column(length = 20)
    private String tipo;

    @Column(precision = 10, scale = 2)
    private BigDecimal precioBase;  // Este es el precio numérico

    @Column(length = 50)
    private String badge;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nivel_disponibilidad_id", nullable = false)
    private NivelDisponibilidad nivelDisponibilidad;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "genero_id")
    private Genero genero;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "familia_olfativa_id")
    private FamiliaOlfativa familiaOlfativa;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @Column(length = 150)
    private String perfumista;

    private Integer anioLanzamiento;

    @Column(name = "pais_origen", length = 100)
    private String paisOrigen;

    @Column(length = 20)
    private String concentracion; // EDP, EDT, EDC, PAR, ELI, FRA — solo perfumes

    @Column(length = 10)
    private String material; // PLT, ORO — solo joyería

    private Integer longevidad;
    private Integer estela;

    @Column(name = "imagen_principal_url", length = 500)
    private String imagenPrincipalUrl;

    @Column(name = "imagenes_extra", columnDefinition = "JSON")
    private String imagenesExtra;

    @Column(name = "es_nuevo")
    @Builder.Default
    private Boolean esNuevo = false;

    @Column(name = "es_best_seller")
    @Builder.Default
    private Boolean esBestSeller = false;

    @Column(name = "es_destacado")
    @Builder.Default
    private Boolean esDestacado = false;

    @Builder.Default
    private Boolean activo = true;

    @Builder.Default
    private Integer orden = 0;

    @CreatedDate
    @Column(name = "fecha_creacion", updatable = false)
    private LocalDateTime fechaCreacion;

    @LastModifiedDate
    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;

    //Relaciones

    @OneToOne(mappedBy = "producto", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private ProductoRendimiento rendimiento;

    @OneToMany(mappedBy = "producto", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<VarianteProducto> variantes = new ArrayList<>();

    @OneToMany(mappedBy = "producto", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<ImagenProducto> imagenes = new ArrayList<>();

    @OneToMany(mappedBy = "producto", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<ProductoAtributo> atributos = new ArrayList<>();

    @OneToMany(mappedBy = "producto", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<ProductoTemporada> temporadas = new ArrayList<>();

    @OneToMany(mappedBy = "producto", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<ProductoOcasion> ocasiones = new ArrayList<>();

    @OneToMany(mappedBy = "producto", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<ProductoMomentoDia> momentosDia = new ArrayList<>();

    @OneToMany(mappedBy = "producto", cascade = CascadeType.ALL, orphanRemoval = true,fetch = FetchType.LAZY)
    @Builder.Default
    private List<ProductoNota> notas = new ArrayList<>();

    @OneToMany(mappedBy = "producto", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<ProductoAcorde> acordes = new ArrayList<>();

    @OneToMany(mappedBy = "producto", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Favorito> favoritos = new ArrayList<>();

    @OneToMany(mappedBy = "producto", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<ResenaProducto> resenas = new ArrayList<>();

}
