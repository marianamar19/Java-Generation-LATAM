package com.hera.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "configuracion")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Configuracion {

    @Id
    @Column(length = 100)
    private String clave;

    @Column(nullable = false, length = 500)
    private String valor;

    @Column(length = 200)
    private String descripcion;

    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;

}
