package com.hera.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "temporadas")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Temporada {

    @Id
    private Long id;

    @Column(unique = true, nullable = false, length = 50)
    private String nombre;

    @Builder.Default
    private Integer orden = 0;

    @OneToMany(mappedBy = "temporada")
    private List<ProductoTemporada> productos = new ArrayList<>();
}
