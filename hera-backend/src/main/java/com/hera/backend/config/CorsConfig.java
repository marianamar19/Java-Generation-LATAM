package com.hera.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/*
* Configuracion cors para permitir peticiones desde el front end
* Permite que el front-end (puerto 5500, 3000, etc.) pueda llamar a la API
* */

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(
                        "http://localhost:3000",
                        "http://localhost:5500",
                        "http://localhost:8080",
                        "http://127.0.0.1:5500",
                        "http://127.0.0.1:8080",
                        "http://54.196.219.63",
                        "http://54.196.219.63:8080"
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }

}
