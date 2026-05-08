package com.hera.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing(auditorAwareRef = "auditorAware")
public class HeraBackendApplication {

	public static void main(String[] args) {
        SpringApplication.run(HeraBackendApplication.class, args);
        System.out.println("Hera BackEnd Iniciando correctamente");
        System.out.println("http://localhost:8080");
        System.out.println("http://localhost:8080/swagger-ui.html");
	}

}
