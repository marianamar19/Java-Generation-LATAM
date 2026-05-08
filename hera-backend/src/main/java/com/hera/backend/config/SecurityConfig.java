package com.hera.backend.config;

import com.hera.backend.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * Configuración principal de seguridad de Spring Security
 *
 * ¿QUÉ hace?
 *   1. Deshabilita CSRF (usamos JWT)
 *   2. Configura CORS
 *   3. Define qué endpoints son públicos y cuáles requieren autenticación
 *   4. Configura el filtro JWT
 *   5. Establece política de sesiones STATELESS (sin sesiones HTTP)
 *
 * ¿PARA QUÉ sirve? Proteger los endpoints de la API
 */

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final UserDetailsService userDetailsService;
    private final PasswordEncoder passwordEncoder;

    /**
     * Define las reglas de autorización para cada endpoint
     *
     * @param http Configuración HTTP de Spring Security
     * @return SecurityFilterChain configurado
     */

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception{
        return http
                .csrf(AbstractHttpConfigurer::disable)
                // Deshabilita CSRF (no necesario con JWT)
                .cors(cors -> {})
                // Configurar que endpoints requieren autenticacion
                .authorizeHttpRequests(auth -> auth
                        // Endpoint publicos no requieren token
                        .requestMatchers( "/",
                                "/api/auth/**",
                                "/api/productos/**",
                                "/api/carriers/**",
                                "/api/contacto/**",
                                "/api/test/**",
                                // SWAGGER
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/v3/api-docs/**",
                                "/api-docs/**",
                                "/webjars/**"
                        ).permitAll()
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .anyRequest().authenticated()
                )
                // Configurar politicas de sesion STATELESS (sin estado)
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                        )
                
                // Configurar proveedor de autenticacion (usa nuestra base de datos)
                .authenticationProvider(authenticationProvider())
                
                // Agrega filtros JWT antes del filtro de autenticacion por defecto
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                
                .build();
    }

    /**
     * Proveedor de autenticación que usa nuestra implementación de UserDetailsService
     * y nuestro PasswordEncoder (Base64)
     *
     * @return AuthenticationProvider configurado
     */
    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder);
        return authProvider;
    }

    /**
     * AuthenticationManager - el punto de entrada para autenticar credenciales
     *
     * @param config Configuración de autenticación
     * @return AuthenticationManager
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception{
        return config.getAuthenticationManager();
    }

}
