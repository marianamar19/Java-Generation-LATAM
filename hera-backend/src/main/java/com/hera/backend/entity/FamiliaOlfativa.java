package com.hera.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "familias_olfativas")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FamiliaOlfativa {

    @Id
    private Integer id;

    @Column(unique = true, nullable = false, length = 100)
    private String nombre;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @Builder.Default
    private Integer orden = 0;

    @OneToMany(mappedBy = "familiaOlfativa")
    private List<Producto> productos = new ArrayList<>();
}
