package com.hera.backend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;

/**
 * Servicio para generación y validación de tokens JWT
 * ¿QUÉ hace? Crea tokens firmados, extrae información, valida expiración
 * ¿PARA QUÉ sirve? Autenticar peticiones sin necesidad de sesiones en servidor
 * ¿DÓNDE se usa? En JwtAuthenticationFilter y AuthService
 */

@Service
@RequiredArgsConstructor
@Slf4j
public class JwtService {

    private final SecretKey jwtSecretKey;

    // Tiempo de expiracion en milesegundos
    private static final long EXPIRATION = 86400000; // 24 horas

    /**
     * Extrae el email/username del token JWT
     * ¿QUÉ hace? Obtiene el "subject" del token (donde guardamos el email)
     * @param token Token JWT recibido en el header Authorization
     * @return Email del usuario (o null si no se puede extraer)
     */
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    /**
     * Extrae la fecha de expiración del token
     * @param token Token JWT
     * @return Fecha y hora de expiración
     */
    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    /**
     * Extrae un claim específico del token usando una función resolver
     * @param token Token JWT
     * @param claimsResolver Función que extrae el claim deseado
     * @return Valor del claim extraído
     */
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    /**
     * Extrae todos los claims (payload) del token JWT
     * ¿CÓMO funciona? Parsea el token usando la clave secreta y verifica firma
     *
     * @param token Token JWT
     * @return Claims (todos los datos del token)
     * @throws RuntimeException si el token es inválido o está mal formado
     */
    private Claims extractAllClaims(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(jwtSecretKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (Exception e) {
            log.error("Error al parsear token JWT: {}", e.getMessage());
            throw new RuntimeException("Token JWT inválido", e);
        }
    }

    /**
     * Verifica si el token ha expirado
     *
     * @param token Token JWT
     * @return true si la fecha de expiración es anterior a ahora
     */
    private Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    /**
     * Genera un token JWT para un usuario
     * ¿QUÉ contiene? Email como subject, rol en claims, fechas de emisión/expiración
     *
     * @param userDetails Detalles del usuario autenticado
     * @return Token JWT firmado
     */
    public String generateToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("roles", userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .toList());
        return generateToken(claims, userDetails.getUsername());
    }

    /**
     * Genera un token JWT directamente con email y rol
     *
     * @param email Email del usuario
     * @param rol Rol del usuario (USER, ADMIN)
     * @return Token JWT firmado
     */
    public String generateToken(String email, String rol) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("rol", rol);
        claims.put("roles", List.of("ROLE_" + rol));
        return generateToken(claims, email);
    }

    /**
     * Metodo interno para construir el token JWT con claims y subject
     * @param claims Datos adicionales a incluir en el token
     * @param subject Email del usuario
     * @return Token JWT firmado
     */
    private String generateToken(Map<String, Object> claims, String subject) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + EXPIRATION);

        return Jwts.builder()
                .claims(claims)
                .subject(subject)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(jwtSecretKey)
                .compact();
    }

    /**
     * Valida que un token sea correcto para un usuario específico
     * ¿QUÉ verifica?
     *   1. Que el email del token coincida con el usuario
     *   2. Que el token no haya expirado
     *
     * @param token Token JWT a validar
     * @param userDetails Detalles del usuario esperado
     * @return true si el token es válido
     */
    public Boolean validateToken(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }

    /**
     * Valida que un token sea correcto (sin comparar con usuario)
     *
     * @param token Token JWT a validar
     * @return true si el token está bien formado y no expiró
     */
    public Boolean validateToken(String token) {
        try {
            return !isTokenExpired(token);
        } catch (Exception e) {
            log.error("Error validando token: {}", e.getMessage());
            return false;
        }
    }
}
