package com.hera.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "niveles_disponibilidad")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NivelDisponibilidad {

    @Id
    private Integer id;

    @Column(unique = true, nullable = false, length = 20)
    private String codigo;

    @Column(nullable = false, length = 50)
    private String nombre;

    @Column(name = "color_hex", nullable = false, length = 7)
    private String colorHex;

    @Builder.Default
    private Integer orden = 0;

    @OneToMany(mappedBy = "nivelDisponibilidad")
    private List<Producto> productos = new ArrayList<>();
}
