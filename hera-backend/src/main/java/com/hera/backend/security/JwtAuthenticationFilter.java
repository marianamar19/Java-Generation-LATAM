package com.hera.backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;

/**
 * Filtro que intercepta cada petición HTTP para validar el token JWT

 * ¿QUÉ hace?
 *   1. Extrae el token del header "Authorization"
 *   2. Valida el token y extrae el email
 *   3. Carga el usuario de la BD y lo establece en el contexto de seguridad

 * ¿PARA QUÉ sirve? Autenticar usuarios sin necesidad de sesiones HTTP
 * ¿DÓNDE se ejecuta? Antes de cada request, configurado en SecurityConfig
 */

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    /**
     * Método principal del filtro - se ejecuta en cada petición HTTP
     *
     * @param request Petición HTTP entrante
     * @param response Respuesta HTTP saliente
     * @param filterChain Cadena de filtros a continuar
     */
    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");

        // HEADER ESPERADO: "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9..."
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            log.debug("No hay token Bearer en la petición: {}", request.getRequestURI());
            filterChain.doFilter(request, response);
            return;
        }

        // Extraer el token (eliminar "Bearer " prefijo)
        final String token = authHeader.substring(7);
        log.debug("Token encontrado para URI: {}", request.getRequestURI());

        try {
            // Extraer email del token
            final String userEmail = jwtService.extractUsername(token);
            log.debug("Email extraído del token: {}", userEmail);

            // Verificar que no haya una autenticación previa en el contexto
            if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {

                // Cargar el usuario desde la base de datos
                UserDetails userDetails = userDetailsService.loadUserByUsername(userEmail);

                // Validar el token contra el usuario cargado
                if (jwtService.validateToken(token, userDetails)) {
                    log.debug("Token válido para usuario: {}", userEmail);

                    // Crear objeto de autenticación con los detalles del usuario
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,  // credentials: null porque ya está autenticado
                            userDetails.getAuthorities()
                    );

                    // Agregar detalles de la petición (IP, session, etc.)
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    // Establecer la autenticación en el contexto de Spring Security
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                } else {
                    log.warn("Token inválido o expirado para usuario: {}", userEmail);
                }
            }
        } catch (Exception e) {
            log.error("Error procesando token JWT: {}", e.getMessage());
            // No interrumpimos el flujo, solo logueamos el error
        }

        // Continuar con el resto de filtros y finalmente con el controller
        filterChain.doFilter(request, response);
    }

    private String extractToken(HttpServletRequest request) {
        // 1. Intentar extraer del header Authorization
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }

        // 2. Intentar extraer de la cookie HttpOnly
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            return Arrays.stream(cookies)
                    .filter(c -> "HERA_TOKEN".equals(c.getName()))
                    .map(Cookie::getValue)
                    .findFirst()
                    .orElse(null);
        }

        return null;
    }

    /**
     * Determina si este filtro debe saltarse para ciertas rutas

     * ¿PARA QUÉ sirve? Excluir endpoints públicos como /api/auth/login
     *
     * @param request Petición HTTP
     * @return true si NO debe aplicar el filtro
     */
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        // No aplicar filtro a endpoints públicos de autenticación
        boolean shouldSkip = path.startsWith("/api/auth/")
                || path.startsWith("/api-docs")
                || path.startsWith("/swagger-ui")
                || path.startsWith("/v3/api-docs");

        if (shouldSkip) {
            log.debug("Saltando filtro JWT para URI pública: {}", path);
        }
        return shouldSkip;
    }
}
