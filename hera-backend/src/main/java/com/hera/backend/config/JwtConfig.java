package com.hera.backend.config;

import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Base64;

/*
 * Configuracion del JWT completamente harcodeado
 * Requisitos: No usar application.properties
 * */
@Configuration
public class JwtConfig {

    //Tiempos de expiracion Hardcodeados
    public static final long EXPIRATION = 86400000; // 24 horas
    public static final long REFRESH_EXPIRATION = 604800000; // 7 días

    // Leer la clave secreta desde application.properties o variable de entorno
    @Value("${jwt.secret:}")
    private String jwtSecret;

    @Bean
    public SecretKey jwtSecretKey() {

        // Si hay una clave configurada en application.properties/variables de entorno, úsala
        if (jwtSecret != null && !jwtSecret.isEmpty()) {
            System.out.println("Usando clave JWT desde configuración");
            // La clave debe tener al menos 32 caracteres (256 bits)
            return Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
        }

        // FALLBACK SOLO PARA DESARROLLO LOCAL
        // En producción, SIEMPRE debes configurar PROD_JWT_SECRET
        System.out.println("Usando clave JWT por defecto (SOLO PARA DESARROLLO)");
        String defaultSecret = "miClaveSecretaDefaultParaDesarrollo1234567890";
        return Keys.hmacShaKeyFor(defaultSecret.getBytes(StandardCharsets.UTF_8));

    }
}