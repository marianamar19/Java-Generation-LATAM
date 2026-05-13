package com.hera.backend.service;

import com.hera.backend.dto.request.DireccionRequest;
import com.hera.backend.dto.response.DireccionResponseDTO;
import com.hera.backend.entity.Direccion;
import com.hera.backend.entity.Usuario;
import com.hera.backend.exception.ResourceNotFoundException;
import com.hera.backend.mapper.DireccionMapper;
import com.hera.backend.repository.DireccionRepository;
import com.hera.backend.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Servicio para gestión de direcciones de envío
 *
 * ¿QUÉ hace? CRUD de direcciones, establece dirección predeterminada
 * ¿PARA QUÉ sirve? Guardar direcciones en el perfil del usuario
 * ¿DÓNDE se usa? En DireccionController (endpoints /api/direcciones/*)
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class DireccionService {

    private final DireccionRepository direccionRepository;
    private final UsuarioRepository usuarioRepository;
    private final DireccionMapper direccionMapper;

    /**
     * Lista todas las direcciones de un usuario
     *
     * @param usuarioId ID del usuario autenticado
     * @return Lista de DTOs de direcciones
     */
    @Transactional(readOnly = true)
    public List<DireccionResponseDTO> listarPorUsuario(Long usuarioId) {
        log.debug("Listando direcciones del usuario ID: {}", usuarioId);

        // Verificar que el usuario exista
        if (!usuarioRepository.existsById(usuarioId)){
            throw new ResourceNotFoundException("Usuario", "id", usuarioId);
        }

        return direccionRepository.findByUsuarioId(usuarioId).stream()
                .map(direccionMapper::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Obtiene una dirección específica
     *
     * @param usuarioId ID del usuario (para verificar pertenencia)
     * @param direccionId ID de la dirección a obtener
     * @return DTO de la dirección
     */
    @Transactional(readOnly = true)
    public DireccionResponseDTO obtenerPorId(Long usuarioId, Long direccionId) {
        log.debug("Obteniendo dirección ID: {} del usuario: {}", direccionId, usuarioId);

        Direccion direccion = direccionRepository.findByIdAndUsuarioId(direccionId, usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Dirección", "id", direccionId));

        return direccionMapper.toDTO(direccion);
    }

    /**
     * Crea una nueva dirección para el usuario
     *
     * ¿CÓMO funciona? Si es la primera dirección o request marca esPredeterminada=true,
     *                 se establece como predeterminada y se quita de otras.
     *
     * @param usuarioId ID del usuario
     * @param request Datos de la nueva dirección
     * @return DTO de la dirección creada
     */
    @Transactional
    public DireccionResponseDTO crear(Long usuarioId, DireccionRequest request) {
        log.debug("Creando nueva dirección para usuario ID: {}", usuarioId);

        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", "id", usuarioId));

        // Verificar si es la primera dirección del usuario
        boolean esPrimeraDireccion = direccionRepository.findByUsuarioId(usuarioId).isEmpty();

        // Si es la primera dirección o el request pide que sea predeterminada
        if (esPrimeraDireccion || Boolean.TRUE.equals(request.getEsPredeterminada())) {
            // Quitar predeterminada de otras direcciones
            direccionRepository.findByUsuarioIdAndEsPredeterminadaTrue(usuarioId)
                    .ifPresent(dir -> {
                        dir.setEsPredeterminada(false);
                        direccionRepository.save(dir);
                    });
            request.setEsPredeterminada(true);
        }

        Direccion direccion = direccionMapper.toEntity(request, usuario);
        Direccion saved = direccionRepository.save(direccion);
        log.info("Dirección creada con ID: {} para usuario: {}", saved.getId(), usuarioId);

        return direccionMapper.toDTO(saved);
    }

    /**
     * Actualiza una dirección existente
     *
     * @param usuarioId ID del usuario (para verificar pertenencia)
     * @param direccionId ID de la dirección a actualizar
     * @param request Datos actualizados
     * @return DTO de la dirección actualizada
     */
    @Transactional
    public DireccionResponseDTO actualizar(Long usuarioId, Long direccionId, DireccionRequest request) {
        log.debug("Actualizando dirección ID: {} del usuario: {}", direccionId, usuarioId);

        // Verificar que la dirección pertenece al usuario
        Direccion direccion = direccionRepository.findByIdAndUsuarioId(direccionId, usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Dirección", "id", direccionId));

        // Si se está marcando como predeterminada, quitar de otras direcciones
        if (Boolean.TRUE.equals(request.getEsPredeterminada()) && !direccion.getEsPredeterminada()) {
            direccionRepository.findByUsuarioIdAndEsPredeterminadaTrue(usuarioId)
                    .ifPresent(dir -> {
                        dir.setEsPredeterminada(false);
                        direccionRepository.save(dir);
                    });
        }

        // Actualizar campos
        direccion.setAlias(request.getAlias());
        direccion.setNombreDestinatario(request.getNombreDestinatario());
        direccion.setCalleNumero(request.getCalleNumero());
        direccion.setNumeroInterior(request.getNumeroInterior());
        direccion.setColonia(request.getColonia());
        direccion.setCiudad(request.getCiudad());
        direccion.setEstado(request.getEstado());
        direccion.setCodigoPostal(request.getCodigoPostal());
        direccion.setTelefonoContacto(request.getTelefonoContacto());
        direccion.setEsPredeterminada(request.getEsPredeterminada() != null ? request.getEsPredeterminada() : false);

        Direccion updated = direccionRepository.save(direccion);
        log.info("Dirección ID: {} actualizada", direccionId);

        return direccionMapper.toDTO(updated);
    }

    /**
     * Elimina una dirección
     *
     * @param usuarioId ID del usuario (para verificar pertenencia)
     * @param direccionId ID de la dirección a eliminar
     */
    @Transactional
    public void eliminar(Long usuarioId, Long direccionId) {
        log.debug("Eliminando dirección ID: {} del usuario: {}", direccionId, usuarioId);

        Direccion direccion = direccionRepository.findByIdAndUsuarioId(direccionId, usuarioId)
                .orElseThrow(() -> new RuntimeException("Dirección no encontrada"));

        direccionRepository.delete(direccion);
        log.info("Dirección ID: {} eliminada", direccionId);
    }
}
