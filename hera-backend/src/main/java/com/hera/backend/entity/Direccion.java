package com.hera.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "direcciones")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Direccion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(nullable = false, length = 50)
    private String alias;

    @Column(name = "nombre_destinatario", nullable = false, length = 100)
    private String nombreDestinatario;

    @Column(name = "calle_numero", nullable = false, length = 150)
    private String calleNumero;

    @Column(name = "numero_interior", length = 20)
    private String numeroInterior;

    @Column(nullable = false, length = 100)
    private String colonia;

    @Column(nullable = false, length = 100)
    private String ciudad;

    @Column(nullable = false, length = 50)
    private String estado;

    @Column(name = "codigo_postal", nullable = false, length = 10)
    private String codigoPostal;

    @Column(name = "telefono_contacto", length = 20)
    private String telefonoContacto;

    @Column(name = "es_predeterminado", nullable = false)
    @Builder.Default
    private Boolean esPredeterminada = false;

}
