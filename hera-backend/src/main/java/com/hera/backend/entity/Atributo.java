package com.hera.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "atributos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Atributo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(length = 20)
    private String tipo;

    @Builder.Default
    private Boolean activo = true;

    @OneToMany(mappedBy = "atributo", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ProductoAtributo> productos = new ArrayList<>();

}
