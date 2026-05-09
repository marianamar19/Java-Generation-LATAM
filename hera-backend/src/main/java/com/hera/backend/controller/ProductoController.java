package com.hera.backend.controller;

import com.hera.backend.dto.request.ProductoCreateRequest;
import com.hera.backend.dto.response.ProductoResponseDTO;
import com.hera.backend.service.ProductoService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/productos")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Productos", description = "Gestión de productos")
public class ProductoController {

    private final ProductoService productoService;

    // ========== ENDPOINTS PÚBLICOS ==========

    @GetMapping
    public ResponseEntity<List<ProductoResponseDTO>> listarTodos() {
        return ResponseEntity.ok(productoService.listarTodos());
    }

    @GetMapping("/tipo/{tipo}")
    public ResponseEntity<List<ProductoResponseDTO>> listarPorTipo(@PathVariable String tipo) {
        return ResponseEntity.ok(productoService.listarPorTipo(tipo));
    }

    @GetMapping("/slug/{slug}")
    public ResponseEntity<ProductoResponseDTO> obtenerPorSlug(@PathVariable String slug) {
        return ResponseEntity.ok(productoService.obtenerPorSlug(slug));
    }

    @GetMapping("/destacados")
    public ResponseEntity<List<ProductoResponseDTO>> listarDestacados() {
        return ResponseEntity.ok(productoService.listarDestacados());
    }

    @GetMapping("/bestsellers")
    public ResponseEntity<List<ProductoResponseDTO>> listarBestsellers() {
        return ResponseEntity.ok(productoService.listarBestsellers());
    }

    @GetMapping("/nuevos")
    public ResponseEntity<List<ProductoResponseDTO>> listarNuevos() {
        return ResponseEntity.ok(productoService.listarNuevos());
    }

    @GetMapping("/buscar")
    public ResponseEntity<List<ProductoResponseDTO>> buscar(@RequestParam(required = false) String q) {
        return ResponseEntity.ok(productoService.buscar(q));
    }

    // ========== ENDPOINTS DE ADMIN (solo ADMIN) ==========

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductoResponseDTO> crearProducto(@Valid @RequestBody ProductoCreateRequest request) {
        log.info("Creando nuevo producto: {}", request.getNombre());
        return ResponseEntity.status(HttpStatus.CREATED).body(productoService.crearProducto(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductoResponseDTO> actualizarProducto(
            @PathVariable Long id,
            @Valid @RequestBody ProductoCreateRequest request) {
        log.info("Actualizando producto ID: {}", id);
        return ResponseEntity.ok(productoService.actualizarProducto(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> eliminarProducto(@PathVariable Long id) {
        log.info("Eliminando producto ID: {}", id);
        productoService.eliminarProducto(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/destacado")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductoResponseDTO> toggleDestacado(@PathVariable Long id) {
        log.info("Toggle destacado producto ID: {}", id);
        return ResponseEntity.ok(productoService.toggleDestacado(id));
    }
}