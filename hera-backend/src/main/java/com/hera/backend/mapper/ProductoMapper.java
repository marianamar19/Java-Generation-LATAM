package com.hera.backend.mapper;

import com.hera.backend.dto.response.ProductoResponseDTO;
import com.hera.backend.dto.response.VarianteResponseDTO;
import com.hera.backend.entity.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Mapper para convertir entre la entidad Producto y su DTO de respuesta
 *
 * ¿QUÉ hace? Transforma objetos Producto (con relaciones JPA) en
 *            ProductoResponseDTO (formato que entiende el front)
 * ¿PARA QUÉ sirve? Separar la estructura interna de la BD de lo que envía la API
 * ¿POR QUÉ manual? MapStruct tuvo problemas, este enfoque es más controlable
 *
 *  TRANSFORMACIONES CLAVE:
 * 1. nivelDisponibilidad_id (Integer) → nivelDisponibilidad (String)
 * 2. genero_id (Integer) → genero (String)
 * 3. familiaOlfativa_id (Integer) → familiaOlfativa (String)
 * 4. temporadas (relación N:M) → List<String>
 * 5. precio (BigDecimal) → precio (String formateado "$2,490 MXN")
 */

@Component
@RequiredArgsConstructor
public class ProductoMapper {

    /**
     * Convierte un Producto (entidad JPA) en ProductoResponseDTO (para el front)
     *
     * @param producto Entidad con todas sus relaciones cargadas
     * @return DTO listo para serializar a JSON
     */
    public ProductoResponseDTO toDTO(Producto producto) {
        if (producto == null) return null;

        return ProductoResponseDTO.builder()
                // Identificación básica
                .id(producto.getId())
                .productId(producto.getProductoId())
                .slug(producto.getSlug())
                .nombre(producto.getNombre())

                // Datos de relaciones (convertimos IDs a nombres)
                .marca(producto.getMarca() != null ? producto.getMarca().getNombre() : null)
                .categoria(producto.getCategoria() != null ? producto.getCategoria().getNombre() : null)
                .tipo(producto.getTipo())

                // Precios: numérico + formateado para el front
                .precioNumerico(producto.getPrecioBase())
                .precio(formatearPrecio(producto.getPrecioBase()))

                // Badge y disponibilidad (convertimos FK a string)
                .badge(producto.getBadge())
                .nivelDisponibilidad(producto.getNivelDisponibilidad() != null
                        ? producto.getNivelDisponibilidad().getCodigo() : "green")
                .genero(producto.getGenero() != null
                        ? producto.getGenero().getNombre() : null)
                .familiaOlfativa(producto.getFamiliaOlfativa() != null
                        ? producto.getFamiliaOlfativa().getNombre() : null)
                .concentracion(producto.getConcentracion())
                .material(producto.getMaterial())

                // Contenido textual
                .descripcion(producto.getDescripcion())
                .perfumista(producto.getPerfumista())
                .anioLanzamiento(producto.getAnioLanzamiento())
                .paisOrigen(producto.getPaisOrigen())

                // Rendimiento (de tabla separada)
                .longevidad(producto.getRendimiento() != null ? producto.getRendimiento().getLongevidad() : null)
                .estela(producto.getRendimiento() != null ? producto.getRendimiento().getEstela() : null)
                .puntuacionGeneral(producto.getRendimiento() != null && producto.getRendimiento().getPuntuacionGeneral() != null
                        ? producto.getRendimiento().getPuntuacionGeneral().doubleValue() : null)

                // Contexto (convertimos relaciones N:M a arrays de strings)
                .temporadas(extraerNombresTemporadas(producto.getTemporadas()))
                .momentosDia(extraerMomentosDia(producto.getMomentosDia()))
                .ocasiones(extraerNombresOcasiones(producto.getOcasiones()))
                .notasSalida(extraerNotasPorTipo(producto.getNotas(), "salida"))
                .notasCorazon(extraerNotasPorTipo(producto.getNotas(), "corazon"))
                .notasBase(extraerNotasPorTipo(producto.getNotas(), "base"))

                // Flags de marketing
                .esNuevo(producto.getEsNuevo())
                .esBestSeller(producto.getEsBestSeller())
                .esDestacado(producto.getEsDestacado())
                .activo(producto.getActivo())

                // Imágenes
                .imagenPrincipalUrl(producto.getImagenPrincipalUrl())
                .imagenes(extraerUrlsImagenes(producto.getImagenes()))

                // Variantes (tallas, presentaciones)
                .variantes(convertirVariantes(producto.getVariantes()))

                .build();
    }

    /**
     * Formatea un BigDecimal como moneda mexicana
     * Ej: 2490 → "$2,490 MXN"
     */
    private String formatearPrecio(BigDecimal precio) {
        if (precio == null) return "$0 MXN";
        return "$" + precio.setScale(0, RoundingMode.HALF_UP).toPlainString()
                .replaceAll("\\B(?=(\\d{3})+(?!\\d))", ",") + " MXN";
    }

    /**
     * Extrae los nombres de las temporadas de la relación N:M
     * Ej: temporadas → ["otoño", "invierno"]
     */
    private List<String> extraerNombresTemporadas(List<ProductoTemporada> temporadas) {
        if (temporadas == null) return List.of();
        return temporadas.stream()
                .filter(pt -> pt.getTemporada() != null)
                .map(pt -> pt.getTemporada().getNombre())
                .collect(Collectors.toList());
    }

    /**
     * Extrae los nombres de los momentos del día
     * Ej: momentosDia → ["noche", "dia"]
     */
    private List<String> extraerMomentosDia(List<ProductoMomentoDia> momentos) {
        if (momentos == null) return List.of();
        return momentos.stream()
                .filter(pm -> pm.getMomento() != null)
                .map(pm -> pm.getMomento().getNombre())
                .collect(Collectors.toList());
    }

    /**
     * Extrae los nombres de las ocasiones
     * Ej: ocasiones → ["cita", "gala", "oficina"]
     */
    private List<String> extraerNombresOcasiones(List<ProductoOcasion> ocasiones) {
        if (ocasiones == null) return List.of();
        return ocasiones.stream()
                .filter(po -> po.getOcasion() != null)
                .map(po -> po.getOcasion().getNombre())
                .collect(Collectors.toList());
    }

    /**
     * Extrae las URLs de las imágenes ordenadas por prioridad
     * La principal va primero
     */
    private List<String> extraerUrlsImagenes(List<ImagenProducto> imagenes) {
        if (imagenes == null) return List.of();
        return imagenes.stream()
                .sorted((a, b) -> {
                    // Priorizar esPrincipal=true
                    if (Boolean.TRUE.equals(a.getEsPrincipal())) return -1;
                    if (Boolean.TRUE.equals(b.getEsPrincipal())) return 1;
                    return Integer.compare(a.getOrden(), b.getOrden());
                })
                .map(ImagenProducto::getUrl)
                .collect(Collectors.toList());
    }

    /**
     * Convierte la lista de variantes a DTO
     */
    private List<VarianteResponseDTO> convertirVariantes(List<VarianteProducto> variantes) {
        if (variantes == null) return List.of();
        return variantes.stream()
                .filter(v -> v.getActivo() != null && v.getActivo())
                .map(v -> VarianteResponseDTO.builder()
                        .id(v.getId())
                        .valor(v.getNombreVariante())
                        .precio(v.getPrecio())
                        .precioDescuento(v.getPrecioDescuento())
                        .etiquetaTipo(v.getEtiquetaTipo())
                        .stock(v.getStock())
                        .build())
                .collect(Collectors.toList());
    }

    private List<String> extraerNotasPorTipo(List<ProductoNota> notas, String tipo) {
        if (notas == null) return List.of();
        return notas.stream()
                .filter(pn -> pn.getNota() != null && tipo.equals(pn.getNota().getTipo()))
                .map(pn -> pn.getNota().getNombre())
                .collect(Collectors.toList());

    }
}