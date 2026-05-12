package com.hera.backend.mapper;

import com.hera.backend.dto.request.DireccionRequest;
import com.hera.backend.dto.response.DireccionResponseDTO;
import com.hera.backend.entity.Direccion;
import com.hera.backend.entity.Usuario;
import org.springframework.stereotype.Component;

/**
 * Mapper bidireccional para Direcciones
 *
 * ¿QUÉ hace? Convierte:
 *   - Request → Entity (para crear/actualizar)
 *   - Entity → Response (para enviar al front)
 * ¿PARA QUÉ sirve? Separar lo que llega del front de lo que guarda la BD
 */

@Component
public class DireccionMapper {

    /**
     * Convierte un DTO de request a entidad Direccion
     * @param request Datos enviados por el front
     * @param usuario Usuario al que pertenece esta dirección
     * @return Entidad lista para persistir
     */
    public Direccion toEntity(DireccionRequest request, Usuario usuario) {
        if (request == null) return null;

        return Direccion.builder()
                .id(request.getId()) // Si es null, JPA crea uno nuevo; si tiene valor, actualiza
                .usuario(usuario)
                .alias(request.getAlias())
                .nombreDestinatario(request.getNombreDestinatario())
                .calleNumero(request.getCalleNumero())
                .numeroInterior(request.getNumeroInterior())
                .colonia(request.getColonia())
                .ciudad(request.getCiudad())
                .estado(request.getEstado())
                .codigoPostal(request.getCodigoPostal())
                .telefonoContacto(request.getTelefonoContacto())
                .esPredeterminada(request.getEsPredeterminada() != null ? request.getEsPredeterminada() : false)
                .build();
    }

    /**
     * Convierte una entidad Direccion a DTO de respuesta
     */
    public DireccionResponseDTO toDTO(Direccion direccion) {
        if (direccion == null) return null;

        return DireccionResponseDTO.builder()
                .id(direccion.getId())
                .alias(direccion.getAlias())
                .nombreDestinatario(direccion.getNombreDestinatario())
                .calleNumero(direccion.getCalleNumero())
                .numeroInterior(direccion.getNumeroInterior())
                .colonia(direccion.getColonia())
                .ciudad(direccion.getCiudad())
                .estado(direccion.getEstado())
                .codigoPostal(direccion.getCodigoPostal())
                .telefonoContacto(direccion.getTelefonoContacto())
                .esPredeterminada(direccion.getEsPredeterminada())
                .build();
    }
}
