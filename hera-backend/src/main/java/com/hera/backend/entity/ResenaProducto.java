package com.hera.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "resenas_producto")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResenaProducto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "producto_id", nullable = false)
    private Producto producto;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    @Column(nullable = false)
    private Integer calificacion;

    @Column(nullable = false,columnDefinition = "TEXT")
    private String comentario;

    @Column(nullable = false, length = 100)
    private String autor;

    @Column(length = 100)
    private String ciudad;

    private LocalDateTime fecha;

    @Builder.Default
    private Boolean aprobada = false;
}
