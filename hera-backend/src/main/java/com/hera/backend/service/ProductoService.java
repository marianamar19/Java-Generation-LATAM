package com.hera.backend.service;

import com.hera.backend.dto.response.ProductoResponseDTO;
import com.hera.backend.entity.Producto;
import com.hera.backend.exception.ResourceNotFoundException;
import com.hera.backend.mapper.ProductoMapper;
import com.hera.backend.repository.ProductoRepository;
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

    /**
     * Obtiene todos los productos activos
     *
     * @return Lista de DTOs de productos
     */
    @Transactional(readOnly = true)
    public List<ProductoResponseDTO> listarTodos() {
        log.debug("Listando todos los productos activos");

        return productoRepository.findByActivoTrue().stream()
                .map(productoMapper::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Obtiene productos por tipo (perfumes o joyeria)
     *
     * ¿PARA QUÉ sirve? Filtrar el catálogo por la pestaña seleccionada
     *
     * @param tipo 'perfumes' o 'joyeria'
     * @return Lista de DTOs filtrada
     */
    @Transactional(readOnly = true)
    public List<ProductoResponseDTO> listarPorTipo(String tipo) {
        log.debug("Listando productos por tipo: {}", tipo);

        return productoRepository.findByTipoAndActivoTrue(tipo).stream()
                .map(productoMapper::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Obtiene un producto por su slug (URL amigable)
     *
     * ¿PARA QUÉ sirve? Cargar la página de detalle de producto
     *
     * @param slug Identificador URL (ej: 'dior-sauvage-edp')
     * @return DTO del producto
     */
    @Transactional(readOnly = true)
    public ProductoResponseDTO obtenerPorSlug(String slug) {
        log.debug("Buscando producto por slug: {}", slug);

        Producto producto = productoRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Producto", "slug", slug));

        return productoMapper.toDTO(producto);
    }

    @Transactional(readOnly = true)
    public ProductoResponseDTO obtenerPorId(Long id) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto", "id", id));
        return productoMapper.toDTO(producto);
    }

    /**
     * Obtiene productos destacados (hero de la página principal)
     *
     * @return Lista de productos con flag esDestacado = true
     */
    @Transactional(readOnly = true)
    public List<ProductoResponseDTO> listarDestacados() {
        log.debug("Listando productos destacados");

        return productoRepository.findByEsDestacadoTrueAndActivoTrue().stream()
                .map(productoMapper::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Obtiene bestsellers para el carrusel de la home
     *
     * @return Lista de productos con flag esBestSeller = true
     */
    @Transactional(readOnly = true)
    public List<ProductoResponseDTO> listarBestsellers() {
        log.debug("Listando bestsellers");

        return productoRepository.findByEsBestSellerTrueAndActivoTrue().stream()
                .map(productoMapper::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Obtiene productos nuevos para la sección editorial de la home
     *
     * @return Lista de productos con flag esNuevo = true
     */
    @Transactional(readOnly = true)
    public List<ProductoResponseDTO> listarNuevos() {
        log.debug("Listando productos nuevos");

        return productoRepository.findByEsNuevoTrueAndActivoTrue().stream()
                .map(productoMapper::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Busca productos por palabra clave (nombre o descripción)
     *
     * ¿PARA QUÉ sirve? Funcionalidad de búsqueda en el navbar
     *
     * @param keyword Palabra o frase a buscar
     * @return Lista de productos que coinciden
     */
    @Transactional(readOnly = true)
    public List<ProductoResponseDTO> buscar(String keyword) {
        log.debug("Buscando productos con keyword: {}", keyword);

        if (keyword == null || keyword.trim().isEmpty()) {
            return listarTodos();
        }

        return productoRepository.buscarPorKeyword(keyword).stream()
                .map(productoMapper::toDTO)
                .collect(Collectors.toList());
    }
}
