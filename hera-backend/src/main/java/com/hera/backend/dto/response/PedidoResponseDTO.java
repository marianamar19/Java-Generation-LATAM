package com.hera.backend.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO para enviar información de pedidos al front-end
 *
 * ¿QUÉ hace? Agrupa datos del pedido, dirección y detalles
 * ¿PARA QUÉ sirve? Mostrar historial de pedidos y confirmación de compra
 * ¿DÓNDE se usa? En PedidoController.obtenerPedido(), listarPedidosUsuario()
 */

@Data
@Builder
public class PedidoResponseDTO {

    private Long id;
    private String numeroPedido;
    private String nombreContacto;
    private String emailContacto;
    private String telefonoContacto;

    // Direccion de envio
    private DireccionEnvioDTO direccion;

    private String metodoEnvio;
    private BigDecimal costoEnvio;
    private String metodoPago;

    private BigDecimal subtotal;
    private BigDecimal descuento;
    private BigDecimal total;

    private String estado; // 'pendiente', 'confirmado', 'enviado', 'entregado'
    private LocalDateTime fechaPedido;
    private LocalDateTime fechaConfirmacion;
    private LocalDateTime fechaEnvio;
    private LocalDateTime fechaEntrega;

    private List<DetallePedidoResponseDTO> items;
}
