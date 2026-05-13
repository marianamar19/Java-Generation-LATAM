package com.hera.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;


@Entity
@Table(name = "momentos_dia")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MomentoDia {

    @Id
    private Long id;

    @Column(unique = true, nullable = false, length = 20)
    private String nombre;

    @Builder.Default
    private Integer orden = 0;

    @OneToMany(mappedBy = "momento")
    private List<ProductoMomentoDia> productos = new ArrayList<>();
}
