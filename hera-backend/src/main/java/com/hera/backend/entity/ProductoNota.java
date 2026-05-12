package com.hera.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "producto_notas")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductoNota {

    @EmbeddedId
    private ProductoNotaId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("productoId")
    @JoinColumn(name = "producto_id")
    private Producto producto;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("notaId")
    @JoinColumn(name = "nota_id")
    private NotaOlfativa nota;
}
