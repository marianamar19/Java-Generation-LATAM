package com.hera.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.AuditorAware;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

/*
* Configuracion para auditoria automatica de entidades
* Permite saber que usuario creo/modifico cada registro
* */

@Configuration
public class AuditorConfig {

    @Bean
    public AuditorAware<String> auditorAware(){
        return  () -> {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

            if (authentication == null || !authentication.isAuthenticated()
            || "anonymousUser".equals(authentication.getPrincipal())) {
                return  Optional.of("system");
            }
            return  Optional.ofNullable(authentication.getName());
        };
    }

}
