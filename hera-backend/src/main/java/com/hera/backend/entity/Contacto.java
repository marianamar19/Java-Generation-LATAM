package com.hera.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "contactos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Contacto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 100)
    private String nombre;

    @Column(length = 150)
    private String email;

    @Column(length = 20)
    private String telefono;

    @Column(length = 50)
    private String asunto;

    @Column(columnDefinition = "TEXT")
    private String mensaje;

    @Builder.Default
    private Boolean leido = false;

    @Builder.Default
    private Boolean respondido = false;

    @Column(name = "fecha_envio")
    private LocalDateTime fechaEnvio;

}
