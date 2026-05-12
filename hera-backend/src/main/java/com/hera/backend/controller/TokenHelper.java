package com.hera.backend.controller;

import com.hera.backend.service.UsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

/**
 * Helper para extraer información del token JWT
 *
 * ¿QUÉ hace? Convierte UserDetails de Spring Security en ID de usuario
 * ¿PARA QUÉ sirve? Evitar código repetido en los controllers
 */
@Component
@RequiredArgsConstructor
public class TokenHelper {

    private final UsuarioService usuarioService;

    /**
     * Obtiene el ID del usuario a partir de los detalles del token
     */
    public Long obtenerIdDesdeUserDetails(UserDetails userDetails){
        if (userDetails == null){
            throw new RuntimeException("Usuario no autenticado");
        }
        return usuarioService.obtenerIdPorEmail(userDetails.getUsername());
    }
}
