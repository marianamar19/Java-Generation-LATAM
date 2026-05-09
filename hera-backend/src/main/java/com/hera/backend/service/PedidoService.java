package com.hera.backend.service;

import com.hera.backend.dto.request.PedidoRequest;
import com.hera.backend.dto.response.DireccionEnvioDTO;
import com.hera.backend.dto.response.PedidoResponseDTO;
import com.hera.backend.entity.Pedido;
import com.hera.backend.entity.Usuario;
import com.hera.backend.exception.BusinessException;
import com.hera.backend.repository.PedidoRepository;
import com.hera.backend.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PedidoService {

    private final PedidoRepository pedidoRepository;
    private final UsuarioRepository usuarioRepository;

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
        log.info("Pedido creado con ID: {}, número: {}", pedido.getId(), pedido.getNumeroPedido());

        // Construir dirección de envío DTO
        DireccionEnvioDTO direccion = DireccionEnvioDTO.builder()
                .calle(pedido.getDireccionCalle())
                .colonia(pedido.getDireccionColonia())
                .ciudad(pedido.getDireccionCiudad())
                .estado(pedido.getDireccionEstado())
                .cp(pedido.getDireccionCp())
                .build();

        // Construir respuesta usando @Builder
        return PedidoResponseDTO.builder()
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
                .items(null)  // Los items se pueden agregar después
                .build();
    }

}
