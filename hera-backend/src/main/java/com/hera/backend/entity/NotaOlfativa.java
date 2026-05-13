package com.hera.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "notas_olfativas")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotaOlfativa {

    @Id
    private Long id;

    @Column(unique = true, nullable = false, length = 100)
    private String nombre;

    @Column(nullable = false, columnDefinition = "ENUM('salida', 'corazon', 'base')")
    private String tipo;

    @Builder.Default
    private Integer orden = 0;

    @OneToMany(mappedBy = "nota")
    private List<ProductoNota> productos = new ArrayList<>();
}
