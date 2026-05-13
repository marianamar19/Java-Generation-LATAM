package com.hera.backend.config;

import io.jsonwebtoken.security.Keys;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.crypto.SecretKey;
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

    @Bean
    public SecretKey jwtSecretKey() {
        // Generar una clave criptográficamente segura al arrancar
        SecureRandom random = new SecureRandom();
        byte[] keyBytes = new byte[32]; // 256 bits
        random.nextBytes(keyBytes);

        // Codificar en Base64 (por si quieres guardarla para debugging)
        String generatedSecret = Base64.getEncoder().encodeToString(keyBytes);

        System.out.println("JWT Secret generada automáticamente (válida hasta reiniciar)");
        System.out.println("   NOTA: Al reiniciar la aplicación, los tokens anteriores quedarán inválidos");

        return Keys.hmacShaKeyFor(keyBytes);
    }
}
