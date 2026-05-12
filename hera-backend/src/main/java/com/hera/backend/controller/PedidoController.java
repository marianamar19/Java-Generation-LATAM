package com.hera.backend.controller;

import com.hera.backend.dto.request.PedidoRequest;
import com.hera.backend.dto.response.PedidoResponseDTO;
import com.hera.backend.exception.BusinessException;
import com.hera.backend.service.PedidoService;
import com.hera.backend.service.UsuarioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/pedidos")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Pedidos", description = "Gestión de pedidos del e-commerce")
@SecurityRequirement(name = "bearerAuth")
public class PedidoController {

    private final PedidoService pedidoService;
    private final UsuarioService usuarioService;

    /**
     * Crear un nuevo pedido (checkout)
     */
    @PostMapping
    @Operation(
            summary = "Crear nuevo pedido",
            description = "Crea un pedido a partir del carrito actual. Requiere autenticación."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Pedido creado exitosamente",
                    content = @Content(schema = @Schema(implementation = PedidoResponseDTO.class))),
            @ApiResponse(responseCode = "400", description = "Datos inválidos o carrito vacío"),
            @ApiResponse(responseCode = "401", description = "No autenticado")
    })
    public ResponseEntity<PedidoResponseDTO> crearPedido(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody PedidoRequest request) throws BusinessException {

        Long usuarioId = usuarioService.obtenerIdPorEmail(userDetails.getUsername());
        log.info("Creando pedido para usuario ID: {}", usuarioId);

        PedidoResponseDTO response = pedidoService.crearPedido(usuarioId, request);
        return ResponseEntity.status(201).body(response);
    }

    /**
     * Listar mis pedidos (usuario autenticado)
     */
    @GetMapping("/mis-pedidos")
    @Operation(
            summary = "Listar mis pedidos",
            description = "Retorna todos los pedidos del usuario autenticado"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Pedidos obtenidos exitosamente"),
            @ApiResponse(responseCode = "401", description = "No autenticado")
    })
    public ResponseEntity<List<PedidoResponseDTO>> listarMisPedidos(
            @AuthenticationPrincipal UserDetails userDetails) {

        Long usuarioId = usuarioService.obtenerIdPorEmail(userDetails.getUsername());
        log.info("Listando pedidos del usuario ID: {}", usuarioId);

        return ResponseEntity.ok(pedidoService.listarPorUsuario(usuarioId));
    }

    /**
     * Obtener detalle de un pedido específico
     */
    @GetMapping("/{id}")
    @Operation(
            summary = "Obtener detalle de pedido",
            description = "Retorna los detalles completos de un pedido específico"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Pedido encontrado"),
            @ApiResponse(responseCode = "404", description = "Pedido no encontrado"),
            @ApiResponse(responseCode = "401", description = "No autenticado")
    })
    public ResponseEntity<PedidoResponseDTO> obtenerPedido(
            @AuthenticationPrincipal UserDetails userDetails,
            @Parameter(description = "ID del pedido", example = "1", required = true)
            @PathVariable Long id) {

        Long usuarioId = usuarioService.obtenerIdPorEmail(userDetails.getUsername());
        log.info("Obteniendo pedido ID: {} para usuario: {}", id, usuarioId);

        return ResponseEntity.ok(pedidoService.obtenerPorId(usuarioId, id));
    }

    /**
     * Rastrear pedido por número de orden (público, sin autenticación)
     */
    @GetMapping("/rastrear/{numeroPedido}")
    @Operation(
            summary = "Rastrear pedido",
            description = "Obtiene información de un pedido por su número de orden. No requiere autenticación."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Pedido encontrado"),
            @ApiResponse(responseCode = "404", description = "Pedido no encontrado")
    })
    public ResponseEntity<PedidoResponseDTO> rastrearPedido(
            @Parameter(description = "Número de pedido", example = "HERA-ABC123", required = true)
            @PathVariable String numeroPedido) {

        log.info("Rastreando pedido con número: {}", numeroPedido);
        return ResponseEntity.ok(pedidoService.obtenerPorNumeroPedido(numeroPedido));
    }

    // ==================== ENDPOINTS DE ADMIN ====================

    /**
     * Listar todos los pedidos (solo ADMIN)
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(
            summary = "Listar todos los pedidos",
            description = "Retorna todos los pedidos del sistema. Solo accesible por administradores."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Pedidos obtenidos exitosamente"),
            @ApiResponse(responseCode = "403", description = "No autorizado")
    })
    public ResponseEntity<List<PedidoResponseDTO>> listarTodos() {
        log.info("Listando todos los pedidos (ADMIN)");
        return ResponseEntity.ok(pedidoService.listarTodos());
    }

    /**
     * Actualizar estado de un pedido (solo ADMIN)
     */
    @PutMapping("/{id}/estado")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(
            summary = "Actualizar estado del pedido",
            description = "Cambia el estado de un pedido. Estados posibles: pendiente, confirmado, enviado, entregado, cancelado."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Estado actualizado"),
            @ApiResponse(responseCode = "404", description = "Pedido no encontrado"),
            @ApiResponse(responseCode = "403", description = "No autorizado")
    })
    public ResponseEntity<PedidoResponseDTO> actualizarEstado(
            @Parameter(description = "ID del pedido", example = "1", required = true)
            @PathVariable Long id,
            @Parameter(description = "Nuevo estado", example = "confirmado", required = true)
            @RequestParam String estado) {

        log.info("Actualizando estado del pedido ID: {} a: {}", id, estado);
        return ResponseEntity.ok(pedidoService.actualizarEstado(id, estado));
    }
}