package com.hera.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "producto_atributos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductoAtributo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "producto_id", nullable = false)
    private Producto producto;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "atributo_id", nullable = false)
    private Atributo atributo;

    @Column(length = 255)
    private String valor;
}
