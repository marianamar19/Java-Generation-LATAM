package com.hera.backend.service;

import com.hera.backend.dto.request.PedidoItemRequest;
import com.hera.backend.dto.request.PedidoRequest;
import com.hera.backend.dto.response.DetallePedidoResponseDTO;
import com.hera.backend.dto.response.DireccionEnvioDTO;
import com.hera.backend.dto.response.PedidoResponseDTO;
import com.hera.backend.entity.*;
import com.hera.backend.exception.BusinessException;
import com.hera.backend.exception.ResourceNotFoundException;
import com.hera.backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PedidoService {

    private final PedidoRepository pedidoRepository;
    private final DetallePedidoRepository detallePedidoRepository;
    private final UsuarioRepository usuarioRepository;
    private final VarianteProductoRepository varianteProductoRepository;
    private final CarritoRepository carritoRepository;
    private final CarritoItemRepository carritoItemRepository;

    /**
     * Crea un nuevo pedido a partir del checkout
     */
    @Transactional
    public PedidoResponseDTO crearPedido(Long usuarioId, PedidoRequest request) throws BusinessException {
        log.info("Creando pedido para usuario ID: {}", usuarioId);

        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new BusinessException("Usuario no encontrado"));

        // Generar número de pedido único
        String numeroPedido = "HERA-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        // Crear pedido
        Pedido pedido = Pedido.builder()
                .numeroPedido(numeroPedido)
                .usuario(usuario)
                .nombreContacto(request.getNombreContacto())
                .emailContacto(request.getEmailContacto())
                .telefonoContacto(request.getTelefonoContacto())
                .direccionCalle(request.getDireccionCalle())
                .direccionColonia(request.getDireccionColonia())
                .direccionCiudad(request.getDireccionCiudad())
                .direccionEstado(request.getDireccionEstado())
                .direccionCp(request.getDireccionCp())
                .metodoEnvio(request.getMetodoEnvio())
                .costoEnvio(request.getCostoEnvio())
                .metodoPago(request.getMetodoPago())
                .subTotal(request.getSubtotal())
                .descuento(request.getDescuento() != null ? request.getDescuento() : BigDecimal.ZERO)
                .total(request.getTotal())
                .estado("pendiente")
                .fechaPedido(LocalDateTime.now())
                .build();

        pedido = pedidoRepository.save(pedido);
        log.info("Pedido guardado con ID: {}, número: {}", pedido.getId(), pedido.getNumeroPedido());

        // Crear detalles del pedido
        BigDecimal subtotalCalculado = BigDecimal.ZERO;
        for (PedidoItemRequest item : request.getItems()) {
            VarianteProducto variante = varianteProductoRepository.findById(item.getVarianteId())
                    .orElseThrow(() -> new BusinessException("Variante no encontrada ID: " + item.getVarianteId()));

            BigDecimal precioUnitario = item.getPrecioUnitario() != null ? item.getPrecioUnitario() : variante.getPrecio();
            BigDecimal subtotal = precioUnitario.multiply(BigDecimal.valueOf(item.getCantidad()));
            subtotalCalculado = subtotalCalculado.add(subtotal);

            DetallePedido detalle = DetallePedido.builder()
                    .pedido(pedido)
                    .variante(variante)
                    .nombreProducto(variante.getProducto().getNombre())
                    .precioUnitario(precioUnitario)
                    .cantidad(item.getCantidad())
                    .subtotal(subtotal)
                    .build();

            detallePedidoRepository.save(detalle);
        }

        // Vaciar carrito después del pedido
        carritoRepository.findByUsuarioId(usuarioId).ifPresent(carrito -> {
            carritoItemRepository.deleteByCarritoId(carrito.getId());
        });

        return toDTO(pedido);
    }

    /**
     * Lista todos los pedidos del usuario
     */
    @Transactional(readOnly = true)
    public List<PedidoResponseDTO> listarPorUsuario(Long usuarioId) {
        return pedidoRepository.findByUsuarioId(usuarioId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Lista todos los pedidos (ADMIN)
     */
    @Transactional(readOnly = true)
    public List<PedidoResponseDTO> listarTodos() {
        return pedidoRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Obtener pedido por ID (verifica pertenencia al usuario)
     */
    @Transactional(readOnly = true)
    public PedidoResponseDTO obtenerPorId(Long usuarioId, Long pedidoId) {
        Pedido pedido = pedidoRepository.findById(pedidoId)
                .orElseThrow(() -> new ResourceNotFoundException("Pedido", "id", pedidoId));

        if (!pedido.getUsuario().getId().equals(usuarioId)) {
            throw new BusinessException("Este pedido no pertenece al usuario");
        }

        return toDTO(pedido);
    }

    /**
     * Obtener pedido por número de pedido (público)
     */
    @Transactional(readOnly = true)
    public PedidoResponseDTO obtenerPorNumeroPedido(String numeroPedido) {
        Pedido pedido = pedidoRepository.findByNumeroPedido(numeroPedido)
                .orElseThrow(() -> new ResourceNotFoundException("Pedido", "numeroPedido", numeroPedido));
        return toDTO(pedido);
    }

    /**
     * Actualizar estado del pedido (ADMIN)
     */
    @Transactional
    public PedidoResponseDTO actualizarEstado(Long pedidoId, String nuevoEstado) {
        Pedido pedido = pedidoRepository.findById(pedidoId)
                .orElseThrow(() -> new ResourceNotFoundException("Pedido", "id", pedidoId));

        pedido.setEstado(nuevoEstado);

        // Actualizar fechas según el estado
        if ("confirmado".equals(nuevoEstado) && pedido.getFechaConfirmacion() == null) {
            pedido.setFechaConfirmacion(LocalDateTime.now());
        } else if ("enviado".equals(nuevoEstado) && pedido.getFechaEnvio() == null) {
            pedido.setFechaEnvio(LocalDateTime.now());
        } else if ("entregado".equals(nuevoEstado) && pedido.getFechaEntrega() == null) {
            pedido.setFechaEntrega(LocalDateTime.now());
        }

        pedido = pedidoRepository.save(pedido);
        return toDTO(pedido);
    }

    /**
     * Convertir entidad a DTO
     */
    private PedidoResponseDTO toDTO(Pedido pedido) {
        // Construir dirección
        DireccionEnvioDTO direccion = DireccionEnvioDTO.builder()
                .calle(pedido.getDireccionCalle())
                .colonia(pedido.getDireccionColonia())
                .ciudad(pedido.getDireccionCiudad())
                .estado(pedido.getDireccionEstado())
                .cp(pedido.getDireccionCp())
                .build();

        // Construir items
        List<DetallePedidoResponseDTO> items = detallePedidoRepository.findByPedidoId(pedido.getId()).stream()
                .map(detalle -> DetallePedidoResponseDTO.builder()
                        .nombreProducto(detalle.getNombreProducto())
                        .variante(detalle.getVariante() != null ? detalle.getVariante().getNombreVariante() : null)
                        .cantidad(detalle.getCantidad())
                        .precioUnitario(detalle.getPrecioUnitario())
                        .subtotal(detalle.getSubtotal())
                        .imagen(detalle.getVariante() != null && detalle.getVariante().getProducto() != null
                                ? detalle.getVariante().getProducto().getImagenPrincipalUrl() : null)
                        .build())
                .collect(Collectors.toList());

        return PedidoResponseDTO.builder()
                .id(pedido.getId())
                .numeroPedido(pedido.getNumeroPedido())
                .nombreContacto(pedido.getNombreContacto())
                .emailContacto(pedido.getEmailContacto())
                .telefonoContacto(pedido.getTelefonoContacto())
                .direccion(direccion)
                .metodoEnvio(pedido.getMetodoEnvio())
                .costoEnvio(pedido.getCostoEnvio())
                .metodoPago(pedido.getMetodoPago())
                .subtotal(pedido.getSubTotal())
                .descuento(pedido.getDescuento())
                .total(pedido.getTotal())
                .estado(pedido.getEstado())
                .fechaPedido(pedido.getFechaPedido())
                .fechaConfirmacion(pedido.getFechaConfirmacion())
                .fechaEnvio(pedido.getFechaEnvio())
                .fechaEntrega(pedido.getFechaEntrega())
                .items(items)
                .build();
    }
}