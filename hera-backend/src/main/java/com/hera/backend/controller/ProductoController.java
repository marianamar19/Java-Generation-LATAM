package com.hera.backend.controller;

import com.hera.backend.dto.response.ProductoResponseDTO;
import com.hera.backend.service.ProductoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controlador de productos (catálogo)
 *
 * ¿QUÉ hace? Expone endpoints para consultar productos
 * ¿PARA QUÉ sirve? Mostrar catálogo, búsquedas, detalle de producto
 * Endpoints públicos (no requieren autenticación)
 */
@RestController
@RequestMapping("/api/productos")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Productos", description = "Consulta del catálogo de productos (público)")
public class ProductoController {

    private final ProductoService productoService;

    @GetMapping
    @Operation(
            summary = "Listar todos los productos",
            description = "Retorna todos los productos activos del catálogo sin filtros"
    )
    @ApiResponse(
            responseCode = "200",
            description = "Lista de productos obtenida exitosamente",
            content = @Content(array = @ArraySchema(schema = @Schema(implementation = ProductoResponseDTO.class)))
    )
    public ResponseEntity<List<ProductoResponseDTO>> listarTodos(){
        log.info("Listando todos los productos");
        return ResponseEntity.ok(productoService.listarTodos());
    }

    @GetMapping("/tipo/{tipo}")
    @Operation(
            summary = "Listar productos por tipo",
            description = "Filtra productos por tipo: 'perfumes' o 'joyeria'"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Productos filtrados exitosamente"),
            @ApiResponse(responseCode = "400", description = "Tipo inválido (debe ser 'perfumes' o 'joyeria')")
    })
    public ResponseEntity<List<ProductoResponseDTO>> listarPorTipo(
            @Parameter(description = "Tipo de producto: perfumes o joyeria", example = "perfumes", required = true)
            @PathVariable String tipo){
        log.info("Listar producto por tipo: {}", tipo);
        return ResponseEntity.ok(productoService.listarPorTipo(tipo));
    }

    @GetMapping("/slug/{slug}")
    @Operation(
            summary = "Obtener producto por slug",
            description = "Retorna un producto específico usando su slug (URL amigable). Ejemplo: 'dior-sauvage-edp'"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Producto encontrado"),
            @ApiResponse(responseCode = "404", description = "Producto no encontrado")
    })
    public ResponseEntity<ProductoResponseDTO> obtenerPorSlug(
            @Parameter(description = "Slug del producto (URL amigable)", example = "dior-sauvage-edp", required = true)
            @PathVariable String slug){
        log.info("Buscando producto por slug: {}", slug);
        return ResponseEntity.ok(productoService.obtenerPorSlug(slug));
    }

    @GetMapping("/destacados")
    @Operation(
            summary = "Productos destacados",
            description = "Retorna productos con flag esDestacado=true (para la sección hero de la home)"
    )
    public  ResponseEntity<List<ProductoResponseDTO>> listarDestacados(){
        log.info("Listar productos destacados");
        return ResponseEntity.ok(productoService.listarDestacados());
    }

    @GetMapping("/bestsellers")
    @Operation(
            summary = "Bestsellers",
            description = "Retorna productos más vendidos (flag esBestSeller=true) para el carrusel de la home"
    )
    public  ResponseEntity<List<ProductoResponseDTO>> listarBestsellers(){
        log.info("Listando bestsellers");
        return ResponseEntity.ok(productoService.listarBestsellers());
    }

    @GetMapping("/nuevos")
    @Operation(
            summary = "Productos nuevos",
            description = "Retorna productos recién agregados (flag esNuevo=true) para la sección editorial de la home"
    )
    public  ResponseEntity<List<ProductoResponseDTO>> listarNuevos(){
        log.info("Listando productos nuevos");
        return ResponseEntity.ok(productoService.listarNuevos());
    }

    /**
     * Buscar productos por palabra clave
     */
    @GetMapping("/buscar")
    @Operation(
            summary = "Buscar productos",
            description = "Busca productos por coincidencia en nombre o descripción. Si no se proporciona query, retorna todos."
    )
    public ResponseEntity<List<ProductoResponseDTO>> buscar(
            @Parameter(description = "Término de búsqueda", example = "sauvage")
            @RequestParam(value = "q", required = false) String query){
        log.info("Buscando productos con query: {}", query);
        return ResponseEntity.ok(productoService.buscar(query));
    }

}
