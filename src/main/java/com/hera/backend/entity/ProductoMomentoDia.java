package com.hera.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "producto_momentos_dia")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductoMomentoDia {

    @EmbeddedId
    private ProductoMomentoDiaId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("productoId")
    @JoinColumn(name = "producto_id")
    private Producto producto;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("momentoId")
    @JoinColumn(name = "momento_id")
    private MomentoDia momento;
}
