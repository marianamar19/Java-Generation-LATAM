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

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductoService {

    private final ProductoRepository productoRepository;
    private final ProductoMapper productoMapper;
    private final MarcaRepository marcaRepository;
    private final CategoriaRepository categoriaRepository;
    private final GeneroRepository generoRepository;
    private final FamiliaOlfativaRepository familiaOlfativaRepository;
    private final NivelDisponibilidadRepository nivelDisponibilidadRepository;
    private final VarianteProductoRepository varianteRepository;
    private final ImagenProductoRepository imagenRepository;
    private final TemporadaRepository temporadaRepository;
    private final MomentoDiaRepository momentoDiaRepository;
    private final OcasionRepository ocasionRepository;
    private final NotaOlfativaRepository notaOlfativaRepository;
    private final ProductoRendimientoRepository rendimientoRepository;

    @Transactional(readOnly = true)
    public List<ProductoResponseDTO> listarTodos() {
        return productoRepository.findByActivoTrue().stream()
                .map(productoMapper::toDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProductoResponseDTO> listarPorTipo(String tipo) {
        return productoRepository.findByTipoAndActivoTrue(tipo).stream()
                .map(productoMapper::toDTO).collect(Collectors.toList());
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
    public List<ProductoResponseDTO> listarTodosAdmin() {
        return productoRepository.findAll().stream()
                .map(productoMapper::toDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProductoResponseDTO> buscar(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) return listarTodos();
        return productoRepository.buscarPorKeyword(keyword).stream()
                .map(productoMapper::toDTO).collect(Collectors.toList());
    }

    @Transactional
    public ProductoResponseDTO crearProducto(ProductoCreateRequest request) {
        log.info("Creando producto: {}", request.getNombre());

        Marca marca               = obtenerOCrearMarca(request.getMarca());
        Categoria categoria       = obtenerOCrearCategoria(request.getCategoria(), request.getTipo());
        Genero genero             = obtenerGenero(request.getGenero());
        NivelDisponibilidad nivel = obtenerNivelDisponibilidad(request.getNivelDisponibilidad());

        long consecutivo  = productoRepository.count() + 1;
        String productoId = generarProductoId(request, marca, categoria, genero, consecutivo);
        String slug       = generarSlug(request);

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
                .perfumista(request.getPerfumista())
                .anioLanzamiento(request.getAnioLanzamiento())
                .paisOrigen(request.getPaisOrigen())
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

        final Producto p1 = productoRepository.save(producto);
        log.info("Producto creado — productoId: {}, slug: {}", p1.getProductoId(), p1.getSlug());

        // Rendimiento
        if (request.getLongevidad() != null || request.getEstela() != null) {
            ProductoRendimiento rendimiento = ProductoRendimiento.builder()
                    .producto(p1)
                    .longevidad(request.getLongevidad())
                    .estela(request.getEstela())
                    .build();
            rendimientoRepository.save(rendimiento);
        }

        // Temporadas
        if (request.getTemporadas() != null) {
            for (Integer tempId : request.getTemporadas()) {
                final Long tid = Long.valueOf(tempId);
                temporadaRepository.findById(tid).ifPresent(temporada -> {
                    ProductoTemporada pt = new ProductoTemporada();
                    pt.setId(new ProductoTemporadaId(p1.getId(), temporada.getId()));
                    pt.setProducto(p1);
                    pt.setTemporada(temporada);
                    p1.getTemporadas().add(pt);
                });
            }
            productoRepository.save(p1);
        }

        // Momentos del día
        if (request.getMomentosDia() != null) {
            for (Integer momId : request.getMomentosDia()) {
                final Long mid = Long.valueOf(momId);
                momentoDiaRepository.findById(mid).ifPresent(momento -> {
                    ProductoMomentoDia pm = new ProductoMomentoDia();
                    pm.setId(new ProductoMomentoDiaId(p1.getId(), momento.getId()));
                    pm.setProducto(p1);
                    pm.setMomento(momento);
                    p1.getMomentosDia().add(pm);
                });
            }
            productoRepository.save(p1);
        }

        // Ocasiones
        if (request.getOcasiones() != null) {
            for (Integer ocaId : request.getOcasiones()) {
                final Long oid = Long.valueOf(ocaId);
                ocasionRepository.findById(oid).ifPresent(ocasion -> {
                    ProductoOcasion po = new ProductoOcasion();
                    po.setId(new ProductoOcasionId(p1.getId(), ocasion.getId()));
                    po.setProducto(p1);
                    po.setOcasion(ocasion);
                    p1.getOcasiones().add(po);
                });
            }
            productoRepository.save(p1);
        }

        // Notas olfativas
        guardarNotas(p1, request.getNotasSalida(), "salida");
        guardarNotas(p1, request.getNotasCorazon(), "corazon");
        guardarNotas(p1, request.getNotasBase(), "base");

        return productoMapper.toDTO(p1);
    }

    @Transactional
    public ProductoResponseDTO actualizarProducto(Long id, ProductoCreateRequest request) {
        log.info("Actualizando producto ID: {}", id);

        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto", "id", id));

        if (request.getNombre() != null)             producto.setNombre(request.getNombre());
        if (request.getPrecioBase() != null)         producto.setPrecioBase(request.getPrecioBase());
        if (request.getDescripcion() != null)        producto.setDescripcion(request.getDescripcion());
        if (request.getPerfumista() != null)         producto.setPerfumista(request.getPerfumista());
        if (request.getAnioLanzamiento() != null)    producto.setAnioLanzamiento(request.getAnioLanzamiento());
        if (request.getPaisOrigen() != null)         producto.setPaisOrigen(request.getPaisOrigen());
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
        if (request.getFamiliaOlfativa() != null) {
            familiaOlfativaRepository.findByNombre(request.getFamiliaOlfativa())
                    .ifPresent(producto::setFamiliaOlfativa);
        }
        
        final Producto p2 = productoRepository.save(producto);

        // Rendimiento
        if (request.getLongevidad() != null || request.getEstela() != null) {
            ProductoRendimiento rend = p2.getRendimiento() != null
                    ? p2.getRendimiento()
                    : ProductoRendimiento.builder().producto(p2).build();
            if (request.getLongevidad() != null) rend.setLongevidad(request.getLongevidad());
            if (request.getEstela() != null)     rend.setEstela(request.getEstela());
            rendimientoRepository.save(rend);
        }

        // Temporadas
        if (request.getTemporadas() != null) {
            p2.getTemporadas().clear();
            productoRepository.save(p2);
            for (Integer tempId : request.getTemporadas()) {
                final Long tid = Long.valueOf(tempId);
                temporadaRepository.findById(tid).ifPresent(temporada -> {
                    ProductoTemporada pt = new ProductoTemporada();
                    pt.setId(new ProductoTemporadaId(p2.getId(), temporada.getId()));
                    pt.setProducto(p2);
                    pt.setTemporada(temporada);
                    p2.getTemporadas().add(pt);
                });
            }
            productoRepository.save(p2);
        }

        // Momentos del día
        if (request.getMomentosDia() != null) {
            p2.getMomentosDia().clear();
            productoRepository.save(p2);
            for (Integer momId : request.getMomentosDia()) {
                final Long mid = Long.valueOf(momId);
                momentoDiaRepository.findById(mid).ifPresent(momento -> {
                    ProductoMomentoDia pm = new ProductoMomentoDia();
                    pm.setId(new ProductoMomentoDiaId(p2.getId(), momento.getId()));
                    pm.setProducto(p2);
                    pm.setMomento(momento);
                    p2.getMomentosDia().add(pm);
                });
            }
            productoRepository.save(p2);
        }

        // Ocasiones
        if (request.getOcasiones() != null) {
            p2.getOcasiones().clear();
            productoRepository.save(p2);
            for (Integer ocaId : request.getOcasiones()) {
                final Long oid = Long.valueOf(ocaId);
                ocasionRepository.findById(oid).ifPresent(ocasion -> {
                    ProductoOcasion po = new ProductoOcasion();
                    po.setId(new ProductoOcasionId(p2.getId(), ocasion.getId()));
                    po.setProducto(p2);
                    po.setOcasion(ocasion);
                    p2.getOcasiones().add(po);
                });
            }
            productoRepository.save(p2);
        }

        // Notas
        if (request.getNotasSalida() != null || request.getNotasCorazon() != null || request.getNotasBase() != null) {
            p2.getNotas().clear();
            productoRepository.saveAndFlush(p2);
            guardarNotas(p2, request.getNotasSalida(), "salida");
            guardarNotas(p2, request.getNotasCorazon(), "corazon");
            guardarNotas(p2, request.getNotasBase(), "base");
        }

        return productoMapper.toDTO(p2);
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

    @Transactional
    public ProductoResponseDTO toggleActivo(Long id, Boolean activo) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto", "id", id));
        producto.setActivo(activo);
        return productoMapper.toDTO(productoRepository.save(producto));
    }

    private void guardarNotas(Producto producto, List<String> nombres, String tipo) {
        if (nombres == null || nombres.isEmpty()) return;
        for (String nombre : nombres) {
            final String n = nombre;
            NotaOlfativa nota = notaOlfativaRepository.findByNombre(n)
                    .orElseGet(() -> notaOlfativaRepository.save(
                            NotaOlfativa.builder().nombre(n).tipo(tipo).build()));
            ProductoNota pn = new ProductoNota();
            pn.setId(new ProductoNotaId(producto.getId(), nota.getId()));
            pn.setProducto(producto);
            pn.setNota(nota);
            producto.getNotas().add(pn);
        }
        productoRepository.save(producto);
    }

    private String generarProductoId(ProductoCreateRequest request, Marca marca,
                                     Categoria categoria, Genero genero, long consecutivo) {
        String tipoCodigo   = "perfumes".equalsIgnoreCase(request.getTipo()) ? "HP" : "HJ";
        String marcaCodigo  = getMarcaCodigo(marca);
        String prodCodigo   = getProdCodigo(request.getNombre());
        String generoCodigo = getGeneroCodigo(genero);
        String consec       = String.format("%04d", consecutivo);
        if ("HP".equals(tipoCodigo)) {
            return String.join("-", tipoCodigo, marcaCodigo, prodCodigo, normalizar(request.getConcentracion()), generoCodigo, consec);
        } else {
            return String.join("-", tipoCodigo, marcaCodigo, getCategoriaCodigo(categoria), prodCodigo, normalizar(request.getMaterial()), generoCodigo, consec);
        }
    }

    private String generarSlug(ProductoCreateRequest request) {
        String extra = "perfumes".equalsIgnoreCase(request.getTipo())
                ? (request.getConcentracion() != null ? request.getConcentracion() : "")
                : (request.getMaterial() != null ? request.getMaterial() : "");
        String base = (request.getMarca() + " " + request.getNombre() + " " + extra).trim().toLowerCase();
        return Normalizer.normalize(base, Normalizer.Form.NFD)
                .replaceAll("[\\p{InCombiningDiacriticalMarks}]", "")
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-")
                .replaceAll("^-|-$", "");
    }

    private String getMarcaCodigo(Marca marca) {
        if (marca == null) return "UNKN";
        if (marca.getCodigoAbreviado() != null && !marca.getCodigoAbreviado().isBlank())
            return marca.getCodigoAbreviado().toUpperCase();
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
        String clean = Normalizer.normalize(nombre.trim(), Normalizer.Form.NFD)
                .replaceAll("[\\p{InCombiningDiacriticalMarks}]", "")
                .toUpperCase().replaceAll("[^A-Z0-9]", "");
        return clean.substring(0, Math.min(4, clean.length()));
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
            case "COLLARES", "COLLAR"      -> "CLLR";
            case "ARETES", "ARETE"         -> "ART";
            case "ANILLOS", "ANILLO"       -> "ALLO";
            case "PULSOS", "PULSO"         -> "PLSO";
            case "ESCLAVAS", "ESCLAVA"     -> "ESCL";
            case "BRAZALETES", "BRAZALETE" -> "BRZL";
            default -> normalizar(categoria.getNombre()).substring(0, Math.min(4, normalizar(categoria.getNombre()).length()));
        };
    }

    private String normalizar(String texto) {
        if (texto == null || texto.isBlank()) return "";
        return Normalizer.normalize(texto.trim(), Normalizer.Form.NFD)
                .replaceAll("[\\p{InCombiningDiacriticalMarks}]", "")
                .toUpperCase().replaceAll("[^A-Z0-9]", "");
    }

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