package com.hera.backend.mapper;

import com.hera.backend.dto.response.UsuarioResponseDTO;
import com.hera.backend.entity.Usuario;
import org.springframework.stereotype.Component;

/**
 * Mapper para convertir entre la entidad Usuario y su DTO de respuesta
 * <p>
 * ¿QUÉ hace? Transforma Usuario (entidad JPA) en UsuarioResponseDTO
 * ¿PARA QUÉ sirve? Enviar datos del usuario al front sin exponer campos sensibles
 */

@Component
public class UsuarioMapper {

    /**
     * Convierte un Usuario a DTO
     * IMPORTANTE: No incluye campos sensibles como contrasena_hash
     */
    public UsuarioResponseDTO toDTO(Usuario usuario) {
        if (usuario == null) return null;

        return UsuarioResponseDTO.builder()
                .id(usuario.getId())
                .nombre(usuario.getNombre())
                .email(usuario.getEmail())
                .telefono(usuario.getTelefono())
                .fechaNacimiento(usuario.getFechaNacimiento())
                .rol(usuario.getRol())
                .fechaRegistro(usuario.getFechaRegistro())
                .build();
    }
}
