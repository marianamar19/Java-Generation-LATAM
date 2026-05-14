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

import java.text.Normalizer;
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

    @Transactional(readOnly = true)
    public Producto obtenerPorProductId(String productId) {
        return productoRepository.findByProductoId(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Producto", "productId", productId));
    }

    @Transactional(readOnly = true)
    public ProductoResponseDTO obtenerPorProductIdDTO(String productId) {
        return productoMapper.toDTO(obtenerPorProductId(productId));
    }

    @Transactional(readOnly = true)
    public List<ProductoResponseDTO> listarDestacados() {
        return productoRepository.findByEsDestacadoTrueAndActivoTrue().stream()
                .map(productoMapper::toDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProductoResponseDTO> listarBestsellers() {
        return productoRepository.findByEsBestSellerTrueAndActivoTrue().stream()
                .map(productoMapper::toDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProductoResponseDTO> listarNuevos() {
        return productoRepository.findByEsNuevoTrueAndActivoTrue().stream()
                .map(productoMapper::toDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProductoResponseDTO> buscar(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) return listarTodos();
        return productoRepository.buscarPorKeyword(keyword).stream()
                .map(productoMapper::toDTO).collect(Collectors.toList());
    }

    // ========== MÉTODOS DE ADMIN (solo para administradores) ==========

    @Transactional
    public ProductoResponseDTO crearProducto(ProductoCreateRequest request) {
        log.info("Creando producto: {}", request.getNombre());

        Marca marca         = obtenerOCrearMarca(request.getMarca());
        Categoria categoria = obtenerOCrearCategoria(request.getCategoria(), request.getTipo());
        Genero genero       = obtenerGenero(request.getGenero());
        NivelDisponibilidad nivel = obtenerNivelDisponibilidad(request.getNivelDisponibilidad());

        // Generar ID y slug automáticamente
        long consecutivo = productoRepository.count() + 1;
        String productoId = generarProductoId(request, marca, categoria, genero, consecutivo);
        String slug       = generarSlug(request);

        // Resolver colisiones
        while (productoRepository.findByProductoId(productoId).isPresent()) {
            consecutivo++;
            productoId = generarProductoId(request, marca, categoria, genero, consecutivo);
        }
        while (productoRepository.findBySlug(slug).isPresent()) {
            slug = slug + "-" + consecutivo;
        }

        Producto producto = Producto.builder()
                .productoId(productoId)
                .slug(slug)
                .nombre(request.getNombre())
                .tipo(request.getTipo())
                .precioBase(request.getPrecioBase())
                .descripcion(request.getDescripcion())
                .badge(request.getBadge())
                .imagenPrincipalUrl(request.getImagenPrincipalUrl())
                .concentracion(request.getConcentracion())
                .material(request.getMaterial())
                .esNuevo(Boolean.TRUE.equals(request.getEsNuevo()))
                .esBestSeller(Boolean.TRUE.equals(request.getEsBestSeller()))
                .esDestacado(Boolean.TRUE.equals(request.getEsDestacado()))
                .activo(request.getActivo() != null ? request.getActivo() : true)
                .marca(marca)
                .categoria(categoria)
                .genero(genero)
                .nivelDisponibilidad(nivel)
                .build();

        producto = productoRepository.save(producto);
        log.info("Producto creado — productoId: {}, slug: {}", producto.getProductoId(), producto.getSlug());

        return productoMapper.toDTO(producto);
    }

    @Transactional
    public ProductoResponseDTO actualizarProducto(Long id, ProductoCreateRequest request) {
        log.info("Actualizando producto ID: {}", id);

        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto", "id", id));

        if (request.getNombre() != null)             producto.setNombre(request.getNombre());
        if (request.getPrecioBase() != null)         producto.setPrecioBase(request.getPrecioBase());
        if (request.getDescripcion() != null)        producto.setDescripcion(request.getDescripcion());
        if (request.getBadge() != null)              producto.setBadge(request.getBadge());
        if (request.getImagenPrincipalUrl() != null) producto.setImagenPrincipalUrl(request.getImagenPrincipalUrl());
        if (request.getConcentracion() != null)      producto.setConcentracion(request.getConcentracion());
        if (request.getMaterial() != null)           producto.setMaterial(request.getMaterial());
        if (request.getEsNuevo() != null)            producto.setEsNuevo(request.getEsNuevo());
        if (request.getEsBestSeller() != null)       producto.setEsBestSeller(request.getEsBestSeller());
        if (request.getEsDestacado() != null)        producto.setEsDestacado(request.getEsDestacado());
        if (request.getActivo() != null)             producto.setActivo(request.getActivo());

        if (request.getMarca() != null)               producto.setMarca(obtenerOCrearMarca(request.getMarca()));
        if (request.getCategoria() != null)           producto.setCategoria(obtenerOCrearCategoria(request.getCategoria(), request.getTipo()));
        if (request.getGenero() != null)              producto.setGenero(obtenerGenero(request.getGenero()));
        if (request.getNivelDisponibilidad() != null) producto.setNivelDisponibilidad(obtenerNivelDisponibilidad(request.getNivelDisponibilidad()));

        producto = productoRepository.save(producto);
        return productoMapper.toDTO(producto);
    }

    @Transactional
    public void eliminarProducto(Long id) {
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
        return productoMapper.toDTO(productoRepository.save(producto));
    }

    // ========== GENERACIÓN DE ID Y SLUG ==========

    private String generarProductoId(ProductoCreateRequest request, Marca marca,
                                     Categoria categoria, Genero genero, long consecutivo) {
        String tipoCodigo = "perfumes".equalsIgnoreCase(request.getTipo()) ? "HP" : "HJ";
        String marcaCodigo = getMarcaCodigo(marca);
        String prodCodigo  = getProdCodigo(request.getNombre());
        String generoCodigo = getGeneroCodigo(genero);
        String consec = String.format("%04d", consecutivo);

        if ("HP".equals(tipoCodigo)) {
            String conc = normalizar(request.getConcentracion());
            return String.join("-", tipoCodigo, marcaCodigo, prodCodigo, conc, generoCodigo, consec);
        } else {
            String catCodigo = getCategoriaCodigo(categoria);
            String mat = normalizar(request.getMaterial());
            return String.join("-", tipoCodigo, marcaCodigo, catCodigo, prodCodigo, mat, generoCodigo, consec);
        }
    }

    private String generarSlug(ProductoCreateRequest request) {
        String extra = "perfumes".equalsIgnoreCase(request.getTipo())
                ? (request.getConcentracion() != null ? request.getConcentracion() : "")
                : (request.getMaterial() != null ? request.getMaterial() : "");

        String base = (request.getMarca() + " " + request.getNombre() + " " + extra)
                .trim().toLowerCase();

        return Normalizer.normalize(base, Normalizer.Form.NFD)
                .replaceAll("[\\p{InCombiningDiacriticalMarks}]", "")
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-")
                .replaceAll("^-|-$", "");
    }

    // ========== MÉTODOS AUXILIARES DE CODIFICACIÓN ==========

    private String getMarcaCodigo(Marca marca) {
        if (marca == null) return "UNKN";
        if (marca.getCodigoAbreviado() != null && !marca.getCodigoAbreviado().isBlank())
            return marca.getCodigoAbreviado().toUpperCase();
        // Fallback: iniciales de cada palabra
        String norm = Normalizer.normalize(marca.getNombre().trim(), Normalizer.Form.NFD)
                .replaceAll("[\\p{InCombiningDiacriticalMarks}]", "")
                .toUpperCase().replaceAll("[^A-Z\\s]", "");
        StringBuilder sb = new StringBuilder();
        for (String p : norm.trim().split("\\s+"))
            if (!p.isEmpty()) sb.append(p.charAt(0));
        return sb.toString();
    }

    private String getProdCodigo(String nombre) {
        if (nombre == null || nombre.isBlank()) return "UNKN";
        return Normalizer.normalize(nombre.trim(), Normalizer.Form.NFD)
                .replaceAll("[\\p{InCombiningDiacriticalMarks}]", "")
                .toUpperCase().replaceAll("[^A-Z0-9]", "")
                .substring(0, Math.min(4, Normalizer.normalize(nombre.trim(), Normalizer.Form.NFD)
                        .replaceAll("[\\p{InCombiningDiacriticalMarks}]", "")
                        .toUpperCase().replaceAll("[^A-Z0-9]", "").length()));
    }

    private String getGeneroCodigo(Genero genero) {
        if (genero == null) return "U";
        return switch (genero.getNombre().toLowerCase()) {
            case "masculino" -> "M";
            case "femenino"  -> "F";
            default          -> "U";
        };
    }

    private String getCategoriaCodigo(Categoria categoria) {
        if (categoria == null) return "";
        return switch (categoria.getNombre().toUpperCase().trim()) {
            case "COLLARES", "COLLAR"     -> "CLLR";
            case "ARETES", "ARETE"        -> "ART";
            case "ANILLOS", "ANILLO"      -> "ALLO";
            case "PULSOS", "PULSO"        -> "PLSO";
            case "ESCLAVAS", "ESCLAVA"    -> "ESCL";
            case "BRAZALETES", "BRAZALETE"-> "BRZL";
            default -> normalizar(categoria.getNombre())
                    .substring(0, Math.min(4, normalizar(categoria.getNombre()).length()));
        };
    }

    private String normalizar(String texto) {
        if (texto == null || texto.isBlank()) return "";
        return Normalizer.normalize(texto.trim(), Normalizer.Form.NFD)
                .replaceAll("[\\p{InCombiningDiacriticalMarks}]", "")
                .toUpperCase().replaceAll("[^A-Z0-9]", "");
    }

    // ========== AUXILIARES DE RELACIONES ==========

    private Marca obtenerOCrearMarca(String nombreMarca) {
        return marcaRepository.findByNombre(nombreMarca)
                .orElseGet(() -> marcaRepository.save(Marca.builder()
                        .nombre(nombreMarca)
                        .slug(nombreMarca.toLowerCase().replace(" ", "-"))
                        .activo(true).build()));
    }

    private Categoria obtenerOCrearCategoria(String nombreCategoria, String tipo) {
        return categoriaRepository.findByNombre(nombreCategoria)
                .orElseGet(() -> categoriaRepository.save(Categoria.builder()
                        .nombre(nombreCategoria)
                        .slug(nombreCategoria.toLowerCase().replace(" ", "-"))
                        .tipo(tipo).activo(true).build()));
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
