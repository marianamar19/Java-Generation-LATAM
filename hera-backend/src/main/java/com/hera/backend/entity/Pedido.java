package com.hera.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "pedidos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Pedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "numero_pedido", unique = true, length = 20)
    private String numeroPedido;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    @Column(name = "nombre_contacto", length = 150)
    private String nombreContacto;

    @Column(name = "email_contacto", length = 150)
    private String emailContacto;

    @Column(name = "telefono_contacto", length = 20)
    private String telefonoContacto;

    @Column(name = "direccion_calle", length = 150)
    private String direccionCalle;

    @Column(name = "direccion_colonia", length = 100)
    private String direccionColonia;

    @Column(name = "direccion_ciudad", length = 100)
    private String direccionCiudad;

    @Column(name = "direccion_estado", length = 50)
    private String direccionEstado;

    @Column(name = "direccion_cp", length = 10)
    private String direccionCp;

    @Column(name = "metodo_envio", length = 50)
    private String metodoEnvio;

    @Column(name = "costo_envio", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal costoEnvio = BigDecimal.ZERO;

    @Column(name = "metodo_pago", length = 20)
    private String metodoPago;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal subTotal;

    @Column(precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal descuento = BigDecimal.ZERO;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal total;

    @Builder.Default
    private String estado = "pendiente";

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "codigo_promocional_id")
    private CodigoPromocional codigoPromocional;

    @Column(name = "fecha_pedido")
    private LocalDateTime fechaPedido;

    @Column(name = "fecha_confirmacion")
    private LocalDateTime fechaConfirmacion;

    @Column(name = "fecha_envio")
    private LocalDateTime fechaEnvio;

    @Column(name = "fecha_entrega")
    private LocalDateTime fechaEntrega;

    @OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<DetallePedido> detalles = new ArrayList<>();

}
