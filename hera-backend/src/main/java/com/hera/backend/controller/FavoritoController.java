package com.hera.backend.controller;

import com.hera.backend.dto.response.ProductoResponseDTO;
import com.hera.backend.service.FavoritoService;
import com.hera.backend.service.UsuarioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controlador de favoritos
 *
 * ¿QUÉ hace? Gestiona la lista de productos favoritos del usuario
 * ¿PARA QUÉ sirve? Guardar productos que le gustan al usuario
 * Requiere autenticación (Bearer Token)
 */
@RestController
@RequestMapping("/api/favoritos")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Favoritos", description = "Gestión de productos favoritos (requiere autenticación)")
@SecurityRequirement(name = "bearerAuth")
public class FavoritoController {

    private final FavoritoService favoritoService;
    private final UsuarioService usuarioService;

    /**
     * Listar favoritos del usuario
     */
    @GetMapping
    @Operation(summary = "Listar favoritos", description = "Retorna todos los productos favoritos del usuario autenticado")
    public ResponseEntity<List<ProductoResponseDTO>> listar(@AuthenticationPrincipal UserDetails userDetails) {
        Long usuarioId = usuarioService.obtenerIdPorEmail(userDetails.getUsername());
        log.info("Listando favoritos del usuario: {}", usuarioId);
        return ResponseEntity.ok(favoritoService.listarPorUsuario(usuarioId));
    }

    /**
     * Agregar producto a favoritos
     */
    @PostMapping("/{productoId}")
    @Operation(summary = "Agregar a favoritos", description = "Agrega un producto a la lista de favoritos del usuario")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Producto agregado a favoritos"),
            @ApiResponse(responseCode = "404", description = "Producto no encontrado")
    })
    public ResponseEntity<?> agregar(
            @AuthenticationPrincipal UserDetails userDetails,
            @Parameter(description = "ID del producto a favoritear", example = "1", required = true)
            @PathVariable Long productoId) {
        Long usuarioId = usuarioService.obtenerIdPorEmail(userDetails.getUsername());
        log.info("Agregando producto {} a favoritos del usuario: {}", productoId, usuarioId);
        favoritoService.agregar(usuarioId, productoId);
        return ResponseEntity.ok(java.util.Map.of("message", "Producto agregado a favoritos"));
    }

    /**
     * Quitar producto de favoritos
     */
    @DeleteMapping("/{productoId}")
    @Operation(summary = "Quitar de favoritos", description = "Elimina un producto de la lista de favoritos")
    public ResponseEntity<?> eliminar(
            @AuthenticationPrincipal UserDetails userDetails,
            @Parameter(description = "ID del producto a quitar de favoritos", required = true)
            @PathVariable Long productoId) {
        Long usuarioId = usuarioService.obtenerIdPorEmail(userDetails.getUsername());
        log.info("Eliminando producto {} de favoritos del usuario: {}", productoId, usuarioId);
        favoritoService.eliminar(usuarioId, productoId);
        return ResponseEntity.ok(java.util.Map.of("message", "Producto eliminado de favoritos"));
    }

    /**
     * Verificar si producto está en favoritos
     */
    @GetMapping("/check/{productoId}")
    @Operation(summary = "Verificar favorito", description = "Verifica si un producto específico está en la lista de favoritos")
    public ResponseEntity<?> esFavorito(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long productoId) {
        Long usuarioId = usuarioService.obtenerIdPorEmail(userDetails.getUsername());
        boolean isFav = favoritoService.esFavorito(usuarioId, productoId);
        return ResponseEntity.ok(java.util.Map.of("esFavorito", isFav));
    }
}
