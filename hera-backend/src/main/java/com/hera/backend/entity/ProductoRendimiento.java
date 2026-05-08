package com.hera.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "producto_rendimiento")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductoRendimiento {

    @Id
    @Column(name = "producto_id")
    private Long productoId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "producto_id")
    private Producto producto;

    private Integer longevidad;
    private Integer estela;

    @Column(name = "puntuacion_general", precision = 3, scale = 2)
    private BigDecimal puntuacionGeneral;

    @Column(name = "total_resenas")
    @Builder.Default
    private Integer totalResenas = 0;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
