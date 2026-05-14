package com.hera.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "marcas")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Marca {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(name = "codigo_abreviado", length = 10)
    private String codigoAbreviado; // "JPG", "D", "HRA", "CK", "GA", "YSL"

    @Column(nullable = false, unique = true, length = 100)
    private String slug;

    @Column(name = "pais_origen", length = 100)
    private String paisOrigen;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "logo_url", length = 500)
    private String logoUrl;

    @Column(name = "es_marca_propia")
    @Builder.Default
    private Boolean esMarcaPropia = false;

    @Builder.Default
    private Boolean activo = true;

    @OneToMany(mappedBy = "marca", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Producto> productos = new ArrayList<>();

}
