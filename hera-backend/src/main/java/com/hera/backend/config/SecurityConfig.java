package com.hera.backend.config;

import com.hera.backend.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final UserDetailsService userDetailsService;
    private final PasswordEncoder passwordEncoder;  // ✅ INYECTADO desde PasswordEncoderConfig

    /**
     * Configuración principal de seguridad
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        return http

                // Deshabilita CSRF porque usamos JWT
                .csrf(AbstractHttpConfigurer::disable)

                // Habilita CORS
                .cors(cors -> {})

                // Política STATELESS (sin sesiones)
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )

                // Configuración de endpoints
                .authorizeHttpRequests(auth -> auth

                        // =========================
                        // ENDPOINTS PÚBLICOS
                        // =========================
                        .requestMatchers(
                                "/",
                                "/api/auth/**",
                                "/api/contacto/**",
                                "/api/test/**",

                                // Swagger
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/v3/api-docs/**",
                                "/api-docs/**",
                                "/webjars/**"
                        ).permitAll()

                        // =========================
                        // PRODUCTOS PÚBLICOS (GET)
                        // =========================
                        .requestMatchers(HttpMethod.GET, "/api/productos/**")
                        .permitAll()

                        // =========================
                        // PRODUCTOS ADMIN
                        // =========================
                        .requestMatchers(HttpMethod.POST, "/api/productos/**")
                        .hasRole("ADMIN")

                        .requestMatchers(HttpMethod.PUT, "/api/productos/**")
                        .hasRole("ADMIN")

                        .requestMatchers(HttpMethod.DELETE, "/api/productos/**")
                        .hasRole("ADMIN")

                        .requestMatchers(HttpMethod.PATCH, "/api/productos/**")
                        .hasRole("ADMIN")

                        // =========================
                        // ADMIN GENERAL
                        // =========================
                        .requestMatchers("/api/admin/**")
                        .hasRole("ADMIN")

                        // Cualquier otro endpoint requiere autenticación
                        .anyRequest()
                        .authenticated()
                )

                // Provider de autenticación
                .authenticationProvider(authenticationProvider())

                // Filtro JWT
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)

                .build();
    }

    /**
     * AuthenticationProvider que usa:
     * - UserDetailsService
     * - PasswordEncoder (inyectado)
     */
    @Bean
    public AuthenticationProvider authenticationProvider() {

        DaoAuthenticationProvider authProvider =
                new DaoAuthenticationProvider();

        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder);

        return authProvider;
    }


    /**
     * AuthenticationManager
     */
    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config
    ) throws Exception {

        return config.getAuthenticationManager();
    }
}