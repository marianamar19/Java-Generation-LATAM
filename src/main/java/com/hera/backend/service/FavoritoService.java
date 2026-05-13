package com.hera.backend.service;

import com.hera.backend.dto.response.ProductoResponseDTO;
import com.hera.backend.entity.Favorito;
import com.hera.backend.entity.Producto;
import com.hera.backend.entity.Usuario;
import com.hera.backend.exception.ResourceNotFoundException;
import com.hera.backend.mapper.ProductoMapper;
import com.hera.backend.repository.FavoritoRepository;
import com.hera.backend.repository.ProductoRepository;
import com.hera.backend.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Servicio para gestión de favoritos
 *
 * ¿QUÉ hace? Permite guardar/quitar productos favoritos por usuario
 * ¿PARA QUÉ sirve? Lista de "Me gusta" que persiste entre sesiones
 * ¿DÓNDE se usa? En FavoritoController (endpoints /api/favoritos/*)
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class FavoritoService {

    private final FavoritoRepository favoritoRepository;
    private final UsuarioRepository usuarioRepository;
    private final ProductoRepository productoRepository;
    private final ProductoMapper productoMapper;

    /**
     * Lista todos los favoritos de un usuario
     *
     * @param usuarioId ID del usuario autenticado
     * @return Lista de DTOs de productos favoritos
     */
    @Transactional(readOnly = true)
    public List<ProductoResponseDTO> listarPorUsuario(Long usuarioId) {
        log.debug("Listando favoritos del usuario ID: {}", usuarioId);

        if(!usuarioRepository.existsById(usuarioId)){
            throw new ResourceNotFoundException("Usuario", "id", usuarioId);
        }

        return favoritoRepository.findByUsuarioId(usuarioId).stream()
                .map(Favorito::getProducto)
                .map(productoMapper::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Agrega un producto a favoritos
     *
     * ¿CÓMO funciona? Verifica que no exista duplicado (unique key en BD)
     * ¿CUÁNDO? POST /api/favoritos/{productoId}
     *
     * @param usuarioId ID del usuario
     * @param productoId ID del producto a favoritear
     */
    @Transactional
    public void agregar(Long usuarioId, Long productoId) {
        log.debug("Agregando favorito - usuario: {}, producto: {}", usuarioId, productoId);

        // Verificar si ya existe (evitar duplicados)
        if (favoritoRepository.existsByUsuarioIdAndProductoId(usuarioId, productoId)) {
            log.debug("El producto ya está en favoritos, ignorando");
            return;
        }

        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", "id", usuarioId));

        Producto producto = productoRepository.findById(productoId)
                .orElseThrow(() -> new ResourceNotFoundException("Producto", "id", productoId));

        Favorito favorito = Favorito.builder()
                .usuario(usuario)
                .producto(producto)
                .fechaAgregado(LocalDateTime.now())
                .build();

        favoritoRepository.save(favorito);
        log.info("Producto ID: {} agregado a favoritos del usuario: {}", productoId, usuarioId);
    }

    /**
     * Elimina un producto de favoritos
     *
     * ¿CUÁNDO? DELETE /api/favoritos/{productoId}
     *
     * @param usuarioId ID del usuario
     * @param productoId ID del producto a quitar
     */
    @Transactional
    public void eliminar(Long usuarioId, Long productoId) {
        log.debug("Eliminando favorito - usuario: {}, producto: {}", usuarioId, productoId);

        if (!productoRepository.existsById(productoId)){
            throw new ResourceNotFoundException("Producto", "id", productoId);
        }

        favoritoRepository.deleteByUsuarioIdAndProductoId(usuarioId, productoId);
        log.info("Producto ID: {} eliminado de favoritos del usuario: {}", productoId, usuarioId);
    }

    /**
     * Verifica si un producto está en favoritos
     *
     * ¿PARA QUÉ sirve? Mostrar el corazón lleno o vacío en el front
     * ¿CUÁNDO? GET /api/favoritos/check/{productoId}
     *
     * @param usuarioId ID del usuario
     * @param productoId ID del producto a verificar
     * @return true si está en favoritos
     */
    @Transactional(readOnly = true)
    public boolean esFavorito(Long usuarioId, Long productoId) {
        return favoritoRepository.existsByUsuarioIdAndProductoId(usuarioId, productoId);
    }
}
