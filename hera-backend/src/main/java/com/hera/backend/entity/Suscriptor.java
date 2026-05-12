package com.hera.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "suscriptores")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Suscriptor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, length = 150)
    private String email;

    @Builder.Default
    private Boolean activo = true;

    @Column(name = "fecha_suscripcion")
    private LocalDateTime fechaSuscripcion;

}
