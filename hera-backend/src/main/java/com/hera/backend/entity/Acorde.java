package com.hera.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "acordes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Acorde {

    @Id
    private Long id;

    @Column(unique = true, nullable = false, length = 100)
    private String nombre;

    @Builder.Default
    private Integer orden = 0;

    @OneToMany(mappedBy = "acorde")
    private List<ProductoAcorde> productos = new ArrayList<>();
}
