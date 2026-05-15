package com.hera.backend.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

/**
 * DTO para crear un nuevo pedido desde el checkout
 *
 * ¿QUÉ hace? Recibe toda la información del checkout
 * ¿PARA QUÉ sirve? Crear un pedido en el sistema
 * ¿DÓNDE se usa? En PedidoController.crearPedido()
 */

@Data
public class PedidoRequest {

    // Datos de contacto
    @NotBlank(message = "El nombre es obligatorio")
    private String nombreContacto;

    @NotBlank(message = "El email es obligatorio")
    @Email(message = "Email inválido")
    private String emailContacto;

    private String telefonoContacto;

    // Dirección de envío
    @NotBlank(message = "La calle es obligatoria")
    private String direccionCalle;

    @NotBlank(message = "La colonia es obligatoria")
    private String direccionColonia;

    @NotBlank(message = "La ciudad es obligatoria")
    private String direccionCiudad;

    @NotBlank(message = "El estado es obligatorio")
    private String direccionEstado;

    @NotBlank(message = "El código postal es obligatorio")
    private String direccionCp;

    // Envío
    @NotBlank(message = "El método de envío es obligatorio")
    private String metodoEnvio;

    @NotNull(message = "El costo de envío es obligatorio")
    @PositiveOrZero(message = "El costo de envío no puede ser negativo")
    private BigDecimal costoEnvio;

    // Pago
    @NotBlank(message = "El método de pago es obligatorio")
    private String metodoPago; // card, paypal, transfer

    // Totales
    @NotNull(message = "El subtotal es obligatorio")
    private BigDecimal subtotal;

    private BigDecimal descuento;

    @NotNull(message = "El total es obligatorio")
    private BigDecimal total;

    // Código promocional (opcional)
    private String codigoPromocional;

    // Items del pedido
    @NotNull(message = "Debe haber al menos un item")
    private List<PedidoItemRequest> items;
}
