package com.hera.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "ocasiones")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Ocasion {

    @Id
    private Long id;

    @Column(unique = true, nullable = false, length = 50)
    private String nombre;

    @Column(length = 50)
    private String icono;

    @Builder.Default
    private Integer orden = 0;

    @OneToMany(mappedBy = "ocasion")
    private List<ProductoOcasion> productos = new ArrayList<>();

}
