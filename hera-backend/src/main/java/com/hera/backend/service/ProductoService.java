package com.hera.backend.service;

import com.hera.backend.dto.request.ProductoCreateRequest;
import com.hera.backend.dto.response.ProductoResponseDTO;
import com.hera.backend.entity.*;
import com.hera.backend.exception.BusinessException;
import com.hera.backend.exception.ResourceNotFoundException;
import com.hera.backend.mapper.ProductoMapper;
import com.hera.backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Servicio para gestión del catálogo de productos
 *
 * ¿QUÉ hace? Consulta productos con filtros y los convierte a DTO
 * ¿PARA QUÉ sirve? Mostrar productos en catálogo, búsquedas y páginas individuales
 * ¿DÓNDE se usa? En ProductoController (endpoints /api/productos/*)
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ProductoService {

    private final ProductoRepository productoRepository;
    private final ProductoMapper productoMapper;

    // Repositorios adicionales para crear productos
    private final MarcaRepository marcaRepository;
    private final CategoriaRepository categoriaRepository;
    private final GeneroRepository generoRepository;
    private final FamiliaOlfativaRepository familiaOlfativaRepository;
    private final NivelDisponibilidadRepository nivelDisponibilidadRepository;
    private final VarianteProductoRepository varianteRepository;
    private final ImagenProductoRepository imagenRepository;

    // ========== MÉTODOS PÚBLICOS (lectura) ==========

    @Transactional(readOnly = true)
    public List<ProductoResponseDTO> listarTodos() {
        return productoRepository.findByActivoTrue().stream()
                .map(productoMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProductoResponseDTO> listarPorTipo(String tipo) {
        return productoRepository.findByTipoAndActivoTrue(tipo).stream()
                .map(productoMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProductoResponseDTO obtenerPorSlug(String slug) {
        Producto producto = productoRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Producto", "slug", slug));
        return productoMapper.toDTO(producto);
    }

    // MÉTODO - Buscar por productId (String) y devolver la ENTIDAD
    @Transactional(readOnly = true)
    public Producto obtenerPorProductId(String productId) {
        log.debug("Buscando producto por productId: {}", productId);

        return productoRepository.findByProductoId(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Producto", "productId", productId));
    }

    //  Método auxiliar  - Si se necesita el DTO también
    @Transactional(readOnly = true)
    public ProductoResponseDTO obtenerPorProductIdDTO(String productId) {
        Producto producto = obtenerPorProductId(productId);
        return productoMapper.toDTO(producto);
    }

    @Transactional(readOnly = true)
    public List<ProductoResponseDTO> listarDestacados() {
        return productoRepository.findByEsDestacadoTrueAndActivoTrue().stream()
                .map(productoMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProductoResponseDTO> listarBestsellers() {
        return productoRepository.findByEsBestSellerTrueAndActivoTrue().stream()
                .map(productoMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProductoResponseDTO> listarNuevos() {
        return productoRepository.findByEsNuevoTrueAndActivoTrue().stream()
                .map(productoMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProductoResponseDTO> buscar(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return listarTodos();
        }
        return productoRepository.buscarPorKeyword(keyword).stream()
                .map(productoMapper::toDTO)
                .collect(Collectors.toList());
    }

    // ========== MÉTODOS DE ADMIN (solo para administradores) ==========

    @Transactional
    public ProductoResponseDTO crearProducto(ProductoCreateRequest request) {
        log.info("Creando producto: {}", request.getNombre());

        // Validar unicidad
        validarProductoUnico(request);

        // Obtener o crear relaciones
        Marca marca = obtenerOCrearMarca(request.getMarca());
        Categoria categoria = obtenerOCrearCategoria(request.getCategoria(), request.getTipo());
        Genero genero = obtenerGenero(request.getGenero());
        NivelDisponibilidad nivel = obtenerNivelDisponibilidad(request.getNivelDisponibilidad());

        // Crear producto
        Producto producto = Producto.builder()
                .productoId(request.getProductoId())
                .slug(request.getSlug())
                .nombre(request.getNombre())
                .tipo(request.getTipo())
                .precioBase(request.getPrecioBase())
                .descripcion(request.getDescripcion())
                .badge(request.getBadge())
                .imagenPrincipalUrl(request.getImagenPrincipalUrl())
                .esNuevo(request.getEsNuevo() != null ? request.getEsNuevo() : false)
                .esBestSeller(request.getEsBestSeller() != null ? request.getEsBestSeller() : false)
                .esDestacado(request.getEsDestacado() != null ? request.getEsDestacado() : false)
                .marca(marca)
                .categoria(categoria)
                .genero(genero)
                .nivelDisponibilidad(nivel)
                .activo(true)
                .build();

        producto = productoRepository.save(producto);
        log.info("Producto creado con ID: {}", producto.getId());

        return productoMapper.toDTO(producto);
    }

    @Transactional
    public ProductoResponseDTO actualizarProducto(Long id, ProductoCreateRequest request) {
        log.info("Actualizando producto ID: {}", id);

        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto", "id", id));

        // Actualizar campos básicos
        if (request.getNombre() != null) producto.setNombre(request.getNombre());
        if (request.getPrecioBase() != null) producto.setPrecioBase(request.getPrecioBase());
        if (request.getDescripcion() != null) producto.setDescripcion(request.getDescripcion());
        if (request.getBadge() != null) producto.setBadge(request.getBadge());
        if (request.getImagenPrincipalUrl() != null) producto.setImagenPrincipalUrl(request.getImagenPrincipalUrl());
        if (request.getEsNuevo() != null) producto.setEsNuevo(request.getEsNuevo());
        if (request.getEsBestSeller() != null) producto.setEsBestSeller(request.getEsBestSeller());
        if (request.getEsDestacado() != null) producto.setEsDestacado(request.getEsDestacado());

        // Actualizar relaciones
        if (request.getMarca() != null) producto.setMarca(obtenerOCrearMarca(request.getMarca()));
        if (request.getCategoria() != null) producto.setCategoria(obtenerOCrearCategoria(request.getCategoria(), request.getTipo()));
        if (request.getGenero() != null) producto.setGenero(obtenerGenero(request.getGenero()));
        if (request.getNivelDisponibilidad() != null) producto.setNivelDisponibilidad(obtenerNivelDisponibilidad(request.getNivelDisponibilidad()));

        producto = productoRepository.save(producto);
        return productoMapper.toDTO(producto);
    }

    @Transactional
    public void eliminarProducto(Long id) {
        log.info("Eliminando producto ID: {}", id);

        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto", "id", id));

        producto.setActivo(false);
        productoRepository.save(producto);
    }

    @Transactional
    public ProductoResponseDTO toggleDestacado(Long id) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto", "id", id));

        producto.setEsDestacado(!producto.getEsDestacado());
        producto = productoRepository.save(producto);
        return productoMapper.toDTO(producto);
    }

    // ========== MÉTODOS PRIVADOS AUXILIARES ==========

    private void validarProductoUnico(ProductoCreateRequest request) {
        if (productoRepository.findByProductoId(request.getProductoId()).isPresent()) {
            throw new BusinessException("Ya existe un producto con el ID: " + request.getProductoId());
        }
        if (productoRepository.findBySlug(request.getSlug()).isPresent()) {
            throw new BusinessException("Ya existe un producto con el slug: " + request.getSlug());
        }
    }

    private Marca obtenerOCrearMarca(String nombreMarca) {
        return marcaRepository.findByNombre(nombreMarca)
                .orElseGet(() -> {
                    Marca nueva = Marca.builder()
                            .nombre(nombreMarca)
                            .slug(nombreMarca.toLowerCase().replace(" ", "-"))
                            .activo(true)
                            .build();
                    return marcaRepository.save(nueva);
                });
    }

    private Categoria obtenerOCrearCategoria(String nombreCategoria, String tipo) {
        return categoriaRepository.findByNombre(nombreCategoria)
                .orElseGet(() -> {
                    Categoria nueva = Categoria.builder()
                            .nombre(nombreCategoria)
                            .slug(nombreCategoria.toLowerCase().replace(" ", "-"))
                            .tipo(tipo)
                            .activo(true)
                            .build();
                    return categoriaRepository.save(nueva);
                });
    }

    private Genero obtenerGenero(String nombreGenero) {
        if (nombreGenero == null) return null;
        return generoRepository.findByNombre(nombreGenero)
                .orElseThrow(() -> new BusinessException("Género no encontrado: " + nombreGenero));
    }

    private NivelDisponibilidad obtenerNivelDisponibilidad(String codigo) {
        return nivelDisponibilidadRepository.findByCodigo(codigo)
                .orElseThrow(() -> new BusinessException("Nivel de disponibilidad no encontrado: " + codigo));
    }
}
