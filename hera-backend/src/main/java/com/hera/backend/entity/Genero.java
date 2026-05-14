package com.hera.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "generos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Genero {

    @Id
    private Long id;

    @Column(unique = true, nullable = false, length = 20)
    private String nombre;

    @OneToMany(mappedBy = "genero")
    private List<Producto> productos = new ArrayList<>();
}
