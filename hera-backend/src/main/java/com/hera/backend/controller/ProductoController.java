package com.hera.backend.controller;

import com.hera.backend.dto.request.ProductoCreateRequest;
import com.hera.backend.dto.response.ProductoResponseDTO;
import com.hera.backend.service.ProductoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
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
@Tag(name = "Productos", description = "Endpoints para gestión de productos (público + administración)")
public class ProductoController {

    private final ProductoService productoService;

    // ==================== ENDPOINTS PÚBLICOS ====================

    @GetMapping
    @Operation(
            summary = "Listar todos los productos",
            description = "Retorna una lista de todos los productos activos en el catálogo. No requiere autenticación."
    )
    @ApiResponse(
            responseCode = "200",
            description = "Lista de productos obtenida exitosamente",
            content = @Content(array = @ArraySchema(schema = @Schema(implementation = ProductoResponseDTO.class)))
    )
    public ResponseEntity<List<ProductoResponseDTO>> listarTodos() {
        log.info("Listando todos los productos");
        return ResponseEntity.ok(productoService.listarTodos());
    }

    @GetMapping("/tipo/{tipo}")
    @Operation(
            summary = "Listar productos por tipo",
            description = "Filtra productos por tipo: 'perfumes' o 'joyeria'. No requiere autenticación."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Productos filtrados exitosamente"),
            @ApiResponse(responseCode = "400", description = "Tipo inválido (debe ser 'perfumes' o 'joyeria')")
    })
    public ResponseEntity<List<ProductoResponseDTO>> listarPorTipo(
            @Parameter(description = "Tipo de producto", example = "perfumes", required = true)
            @PathVariable String tipo) {
        log.info("Listando productos por tipo: {}", tipo);
        return ResponseEntity.ok(productoService.listarPorTipo(tipo));
    }

    @GetMapping("/slug/{slug}")
    @Operation(
            summary = "Obtener producto por slug",
            description = "Busca un producto específico usando su slug (URL amigable). Ejemplo: 'dior-sauvage-edp'"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Producto encontrado"),
            @ApiResponse(responseCode = "404", description = "Producto no encontrado")
    })
    public ResponseEntity<ProductoResponseDTO> obtenerPorSlug(
            @Parameter(description = "Slug del producto", example = "dior-sauvage-edp", required = true)
            @PathVariable String slug) {
        log.info("Buscando producto por slug: {}", slug);
        return ResponseEntity.ok(productoService.obtenerPorSlug(slug));
    }

    @GetMapping("/destacados")
    @Operation(
            summary = "Listar productos destacados",
            description = "Retorna productos con flag 'destacado' activo para la sección hero de la página principal."
    )
    public ResponseEntity<List<ProductoResponseDTO>> listarDestacados() {
        log.info("Listando productos destacados");
        return ResponseEntity.ok(productoService.listarDestacados());
    }

    @GetMapping("/bestsellers")
    @Operation(
            summary = "Listar bestsellers",
            description = "Retorna los productos más vendidos (flag 'bestSeller') para el carrusel de la home."
    )
    public ResponseEntity<List<ProductoResponseDTO>> listarBestsellers() {
        log.info("Listando bestsellers");
        return ResponseEntity.ok(productoService.listarBestsellers());
    }

    @GetMapping("/nuevos")
    @Operation(
            summary = "Listar productos nuevos",
            description = "Retorna los productos recién agregados (flag 'nuevo') para la sección editorial."
    )
    public ResponseEntity<List<ProductoResponseDTO>> listarNuevos() {
        log.info("Listando productos nuevos");
        return ResponseEntity.ok(productoService.listarNuevos());
    }

    @GetMapping("/buscar")
    @Operation(
            summary = "Buscar productos",
            description = "Busca productos por coincidencia en nombre o descripción. Si no se proporciona query, retorna todos."
    )
    public ResponseEntity<List<ProductoResponseDTO>> buscar(
            @Parameter(description = "Término de búsqueda", example = "sauvage")
            @RequestParam(required = false) String q) {
        log.info("Buscando productos con query: {}", q);
        return ResponseEntity.ok(productoService.buscar(q));
    }

    // ==================== ENDPOINTS DE ADMIN (requieren token JWT y rol ADMIN) ====================

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(
            summary = "Crear nuevo producto (solo ADMIN)",
            description = "Crea un nuevo producto en el catálogo. Requiere autenticación con token JWT y rol ADMIN.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Producto creado exitosamente"),
            @ApiResponse(responseCode = "400", description = "Datos inválidos o producto duplicado"),
            @ApiResponse(responseCode = "401", description = "No autenticado"),
            @ApiResponse(responseCode = "403", description = "No tiene permisos de administrador")
    })
    public ResponseEntity<ProductoResponseDTO> crearProducto(
            @Parameter(description = "Datos del producto a crear", required = true)
            @Valid @RequestBody ProductoCreateRequest request) {
        log.info("Creando nuevo producto: {}", request.getNombre());
        return ResponseEntity.status(HttpStatus.CREATED).body(productoService.crearProducto(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(
            summary = "Actualizar producto (solo ADMIN)",
            description = "Actualiza un producto existente. Requiere autenticación con token JWT y rol ADMIN.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Producto actualizado exitosamente"),
            @ApiResponse(responseCode = "404", description = "Producto no encontrado"),
            @ApiResponse(responseCode = "401", description = "No autenticado"),
            @ApiResponse(responseCode = "403", description = "No tiene permisos de administrador")
    })
    public ResponseEntity<ProductoResponseDTO> actualizarProducto(
            @Parameter(description = "ID del producto a actualizar", example = "1", required = true)
            @PathVariable Long id,
            @Parameter(description = "Datos actualizados del producto", required = true)
            @Valid @RequestBody ProductoCreateRequest request) {
        log.info("Actualizando producto ID: {}", id);
        return ResponseEntity.ok(productoService.actualizarProducto(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(
            summary = "Eliminar producto (solo ADMIN)",
            description = "Elimina un producto (soft delete). Requiere autenticación con token JWT y rol ADMIN.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Producto eliminado exitosamente"),
            @ApiResponse(responseCode = "404", description = "Producto no encontrado"),
            @ApiResponse(responseCode = "401", description = "No autenticado"),
            @ApiResponse(responseCode = "403", description = "No tiene permisos de administrador")
    })
    public ResponseEntity<Void> eliminarProducto(
            @Parameter(description = "ID del producto a eliminar", example = "1", required = true)
            @PathVariable Long id) {
        log.info("Eliminando producto ID: {}", id);
        productoService.eliminarProducto(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/destacado")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(
            summary = "Marcar/desmarcar como destacado (solo ADMIN)",
            description = "Alterna el estado 'destacado' del producto. Requiere autenticación con token JWT y rol ADMIN.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Estado actualizado exitosamente"),
            @ApiResponse(responseCode = "404", description = "Producto no encontrado"),
            @ApiResponse(responseCode = "401", description = "No autenticado"),
            @ApiResponse(responseCode = "403", description = "No tiene permisos de administrador")
    })
    public ResponseEntity<ProductoResponseDTO> toggleDestacado(
            @Parameter(description = "ID del producto", example = "1", required = true)
            @PathVariable Long id) {
        log.info("Toggle destacado producto ID: {}", id);
        return ResponseEntity.ok(productoService.toggleDestacado(id));
    }
}