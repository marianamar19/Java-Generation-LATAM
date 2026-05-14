package com.hera.backend.controller;

import com.hera.backend.dto.request.CarritoItemRequest;
import com.hera.backend.dto.response.CarritoResponseDTO;
import com.hera.backend.exception.BusinessException;
import com.hera.backend.service.CarritoService;
import com.hera.backend.service.UsuarioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

/**
 * Controlador del carrito de compras
 *
 * ¿QUÉ hace? Gestiona el carrito para usuarios logueados e invitados
 * ¿PARA QUÉ sirve? Agregar/quitar productos, actualizar cantidades
 * Soporte para usuarios logueados (requiere token) e invitados (usa token en header)
 */
@RestController
@RequestMapping("/api/carrito")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Carrito", description = "Gestión del carrito de compras (soporta usuarios logueados e invitados)")
public class CarritoController {

    private final CarritoService carritoService;
    private final UsuarioService usuarioService;

    /**
     * Helper para obtener token del carrito (para invitados)
     */
    private String obtenerCarritoToken(HttpServletRequest request){
        String token = request.getHeader("X-Carrito-Token");
        if (token == null || token.isEmpty()){
            token = UUID.randomUUID().toString();
        }
        return token;
    }

    @GetMapping
    @Operation(
            summary = "Obtener carrito",
            description = "Retorna el contenido actual del carrito con totales calculados. " +
                    "Para usuarios logueados usa el token JWT. Para invitados usa X-Carrito-Token."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Carrito obtenido exitosamente"),
            @ApiResponse(responseCode = "404", description = "Carrito no encontrado")
    })
    public ResponseEntity<CarritoResponseDTO> obtenerCarrito(
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest request){
        Long usuarioId = (userDetails != null) ? usuarioService.obtenerIdPorEmail(userDetails.getUsername()) : null;
        String token = (usuarioId == null) ? obtenerCarritoToken(request) : null;
        log.info("Obteniendo carrito - usuario: {}, token: {}", usuarioId, token);

        var carrito = carritoService.obtenerOCrearCarrito(usuarioId, token);
        var response = carritoService.obtenerCarrito(carrito.getId());

        if (usuarioId == null){
            return ResponseEntity.ok()
                    .header("X-Carrito-Token",token)
                    .body(response);
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping("/items")
    @Operation(
            summary = "Agregar al carrito",
            description = "Agrega un producto al carrito. Si ya existe, aumenta la cantidad."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Item agregado exitosamente"),
            @ApiResponse(responseCode = "400", description = "Stock insuficiente o datos inválidos"),
            @ApiResponse(responseCode = "404", description = "Producto o variante no encontrada")
    })
    public ResponseEntity<?> agregarItem(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody CarritoItemRequest request,
            HttpServletRequest req) throws BusinessException {

        Long usuarioId = (userDetails != null) ? usuarioService.obtenerIdPorEmail(userDetails.getUsername()) : null;
        String token = (usuarioId == null) ? obtenerCarritoToken(req) : null;

        var carrito = carritoService.obtenerOCrearCarrito(usuarioId, token);
        carritoService.agregarItem(carrito.getId(), request);
        log.info("Item agregar al cvarrito ID: {}", carrito);
        return ResponseEntity.ok(Map.of("message", "Item agregado al carrito"));
    }

    /**
     * Actualizar cantidad de un item
     */
    @PutMapping("/items/{itemId}")
    @Operation(
            summary = "Actualizar cantidad",
            description = "Cambia la cantidad de un item específico en el carrito. Si cantidad es 0, elimina el item."
    )
    public ResponseEntity<?> actualizarCantidad(
            @AuthenticationPrincipal UserDetails userDetails,
            @Parameter(description = "ID del item en el carrito", required = true)
            @PathVariable Long itemId,
            @Parameter(description = "Nueva cantidad", example = "3", required = true)
            @RequestParam Integer cantidad,
            HttpServletRequest req) throws BusinessException {

        Long usuarioId = (userDetails != null) ? usuarioService.obtenerIdPorEmail(userDetails.getUsername()) : null;
        String token = (usuarioId == null) ? obtenerCarritoToken(req) : null;

        var carrito = carritoService.obtenerOCrearCarrito(usuarioId, token);
        carritoService.actualizarCantidad(carrito.getId(), itemId, cantidad);

        log.info("Cantidad actualizada - item: {}, nueva cantidad: {}", itemId, cantidad);

        return ResponseEntity.ok(Map.of("message", "Cantidad actualizada"));
    }

    /**
     * Eliminar item del carrito
     */
    @DeleteMapping("/items/{itemId}")
    @Operation(
            summary = "Eliminar item",
            description = "Elimina un producto específico del carrito"
    )
    public ResponseEntity<?> eliminarItem(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long itemId,
            HttpServletRequest req) throws BusinessException {

        Long usuarioId = (userDetails != null) ? usuarioService.obtenerIdPorEmail(userDetails.getUsername()) : null;
        String token = (usuarioId == null) ? obtenerCarritoToken(req) : null;

        var carrito = carritoService.obtenerOCrearCarrito(usuarioId, token);
        carritoService.eliminarItem(carrito.getId(), itemId);

        log.info("Item eliminado del carrito: {}", itemId);

        return ResponseEntity.ok(Map.of("message", "Item eliminado"));
    }

    /**
     * Vaciar carrito
     */
    @DeleteMapping("/vaciar")
    @Operation(
            summary = "Vaciar carrito",
            description = "Elimina todos los items del carrito"
    )
    public ResponseEntity<?> vaciarCarrito(
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest req) {

        Long usuarioId = (userDetails != null) ? usuarioService.obtenerIdPorEmail(userDetails.getUsername()) : null;
        String token = (usuarioId == null) ? obtenerCarritoToken(req) : null;

        var carrito = carritoService.obtenerOCrearCarrito(usuarioId, token);
        carritoService.vaciarCarrito(carrito.getId());

        log.info("Carrito vaciado: {}", carrito.getId());

        return ResponseEntity.ok(Map.of("message", "Carrito vaciado"));
    }

}






