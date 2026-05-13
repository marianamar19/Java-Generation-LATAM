package com.hera.backend.config;

import io.jsonwebtoken.security.Keys;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.crypto.SecretKey;
import java.util.Base64;

/*
* Configuracion del JWT completamente harcodeado
* Requisitos: No usar application.properties
* */
@Configuration
public class JwtConfig {

    //Clave harcodeada en Base64
    private static final String HARDCODED_SECRET = "aGVyYS1iYWNrZW5kLXNlY3JldC1rZXktMjU2Yml0cy1zZWN1cmU=";

    //Tiempos de expiracion Hardcodeados
    public static  final long EXPIRATION = 86400000; // 24 horas
    public static  final long REFRESH_EXPIRATION = 604800000; // 7 dias

    @Bean
    public SecretKey jwtSecretKey(){
        byte[] decoded = Base64.getDecoder().decode(HARDCODED_SECRET);
        return Keys.hmacShaKeyFor(decoded);
    }

}
