package com.hera.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Configuración del codificador de contraseñas usando BCrypt
 *
 * ¿QUÉ hace BCrypt?
 *   - Algoritmo de hashing adaptativo (se puede hacer más lento con el tiempo)
 *   - Incluye "salt" automático (previene ataques de rainbow table)
 *   - Genera strings como: $2a$10$N.ZuP2gMjJz.8XxXxXxXxO5x7N5c5tN5c5tN5c5t
 *     donde: $2a = versión, 10 = factor de costo (2^10 iteraciones)
 *
 * ¿PARA QUÉ sirve? Almacenar contraseñas de forma segura en la BD
 * ¿POR QUÉ BCrypt? Es el estándar de Spring Security, más seguro que Base64
 */

@Configuration
public class PasswordEncoderConfig {

    /**
     * Factor de costo: número de iteraciones = 2^costo
     * Valor recomendado: 10-12 (balance entre seguridad y rendimiento)
     * Mayor costo = más seguro pero más lento
     */
    private static final int STRENGTH = 12;

    /**
     * Crea el bean del codificador de contraseñas
     *
     * @return PasswordEncoder implementado con BCrypt
     */

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(STRENGTH);
    }
}
