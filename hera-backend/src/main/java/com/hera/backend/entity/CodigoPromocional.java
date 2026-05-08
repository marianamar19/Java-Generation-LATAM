package com.hera.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "codigos_promocionales")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CodigoPromocional {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, length = 50)
    private String codigo;

    @Column(length = 20)
    private String tipo;

    @Column(precision = 10, scale = 2)
    private Integer valor;

    @Builder.Default
    private Boolean activo = true;

    @Column(name = "usos_maximos")
    private Integer usosMaximos;

    @Column(name = "usos_actuales")
    @Builder.Default
    private Integer usosActuales = 0;

    @Column(name = "fecha_inicio")
    private LocalDateTime fechaInicio;

    @Column(name = "fecha_fin")
    private LocalDateTime fechaFin;

    @OneToMany(mappedBy = "codigoPromocional", fetch = FetchType.LAZY)
    private List<Pedido> pedidos = new ArrayList<>();

}
