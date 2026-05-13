package com.hera.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "usuarios")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(name = "contrasena_hash", nullable = false)
    private String contrasenaHash;

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String rol = "USER";

    @Column(name = "proveedor_auth", nullable = false, length = 20)
    @Builder.Default
    private String proveedorAuth = "local";

    @Column(length = 20)
    private String telefono;

    @Column(name = "fecha_nacimiento")
    private LocalDate fechaNacimiento;

    @Builder.Default
    private Boolean activo = true;

    @CreatedDate
    @Column(name = "fecha_registro", updatable = false)
    private LocalDateTime fechaRegistro;

    @Column(name = "ultimo_acceso")
    private LocalDateTime ultimoAcceso;

    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Direccion> direcciones = new ArrayList<>();

    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Sesion> sesiones = new ArrayList<>();

    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Favorito> favoritos = new ArrayList<>();

    @OneToOne(mappedBy = "usuario", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Carrito carrito;

    @OneToMany(mappedBy = "usuario")
    @Builder.Default
    private List<Pedido> pedidos = new ArrayList<>();

    @OneToMany(mappedBy = "usuario")
    @Builder.Default
    private List<ResenaProducto> resenas = new ArrayList<>();

}
