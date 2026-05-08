package com.hera.backend.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/*
* Configuracion de Swagger/OpenAPI para documentacion automatica de la API
* URL: http://localhost:8080/swagger-ui.html
* */

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customeOpenAPI(){
        return  new OpenAPI()
                .info(new Info()
                        .title("HERA API - Perfumes y Joyeria")
                        .version("1.0")
                        .description("API para la tienda de perfumeria y joyera HERA")
                        .contact(new Contact()
                                .name("HERA Team")
                                .email("hola@heraperfumes.com")
                                .url("http://heraperfumes.com")))
                .addSecurityItem(new SecurityRequirement().addList("bearerAuth"))
                .components(new Components()
                        .addSecuritySchemes("bearerAuth", new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("Ingresa el token JWT obtenido en /api/auth/login")));
    }
}
