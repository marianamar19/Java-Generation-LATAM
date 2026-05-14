package com.hera.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "producto_temporadas")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductoTemporada {

    @EmbeddedId
    private ProductoTemporadaId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("productoId")
    @JoinColumn(name = "producto_id")
    private Producto producto;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("temporadaId")
    @JoinColumn(name = "temporada_id")
    private Temporada temporada;
}
