package com.hera.backend.config;

import com.hera.backend.entity.FamiliaOlfativa;
import com.hera.backend.entity.Genero;
import com.hera.backend.entity.NivelDisponibilidad;
import com.hera.backend.entity.Usuario;
import com.hera.backend.repository.FamiliaOlfativaRepository;
import com.hera.backend.repository.GeneroRepository;
import com.hera.backend.repository.NivelDisponibilidadRepository;
import com.hera.backend.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Inicializador de datos de prueba
 *
 * ¿QUÉ hace? Ejecuta al arrancar la aplicación
 * ¿PARA QUÉ sirve? Crear usuarios y catálogos iniciales si la BD está vacía
 * ¿CÓMO funciona? CommandLineRunner de Spring Boot ejecuta run() una sola vez
 *
 *    SOLO ejecuta si la tabla usuarios está VACÍA (count = 0)
 *    Si ya hay datos, NO hace nada (no sobrescribe)
 */

@Component
@Order(2) // Orden de ejecución (2) - se ejecuta después de PasswordHashGenerator
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;  // ← BCrypt
    private final NivelDisponibilidadRepository nivelDisponibilidadRepository;
    private final GeneroRepository generoRepository;
    private final FamiliaOlfativaRepository familiaOlfativaRepository;

    /**
     * Método principal que ejecuta Spring Boot al iniciar la app
     *
     * @param args Argumentos de línea de comandos (no se usan)
     */

    @Override
    @Transactional
    public void run(String... args) {
     if (usuarioRepository.count() > 0) {
        log.info("Datos existentes, omitiendo inicialización");
        return; // ← Salir sin hacer nada
    }

        // EJECUCIÓN: Solo llega aquí si la BD está VACÍA
        log.info("Inicializando datos de prueba con BCrypt...");

        /**
         * Crea los usuarios iniciales (admin y demo)
         * Solo se ejecuta si no existían usuarios previamente
         */
    // Usuario ADMIN - contraseña: admin123
    Usuario admin = Usuario.builder()
            .nombre("Administrador HERA")
            .email("admin@hera.com")
            .contrasenaHash(passwordEncoder.encode("admin123"))  // ← BCrypt encode
            .rol("ADMIN")
            .proveedorAuth("local")
            .telefono("+52 33 1005 0843")
            .activo(true)
            .build();
        usuarioRepository.save(admin);

    // Usuario DEMO - contraseña: demo123
    Usuario demo = Usuario.builder()
            .nombre("Usuario Demo")
            .email("demo@hera.com")
            .contrasenaHash(passwordEncoder.encode("demo123"))  // ← BCrypt encode
            .rol("USER")
            .proveedorAuth("local")
            .telefono("+52 33 1234 5678")
            .activo(true)
            .build();
        usuarioRepository.save(demo);

        log.info("Usuarios creados:");
        log.info("ADMIN - email: admin@hera.com / password: admin123");
        log.info("DEMO  - email: demo@hera.com / password: demo123");

    inicializarCatalogos();
}

private void inicializarCatalogos() {
    // Niveles de disponibilidad
    if (nivelDisponibilidadRepository.count() == 0) {
        nivelDisponibilidadRepository.save(NivelDisponibilidad.builder()
                .id(1).codigo("green").nombre("En existencia").colorHex("#2e7d32").orden(1).build());
        nivelDisponibilidadRepository.save(NivelDisponibilidad.builder()
                .id(2).codigo("yellow").nombre("Disponibilidad limitada").colorHex("#ed6c02").orden(2).build());
        nivelDisponibilidadRepository.save(NivelDisponibilidad.builder()
                .id(3).codigo("red").nombre("Pieza exclusiva").colorHex("#d32f2f").orden(3).build());
        log.info("Niveles de disponibilidad creados");
    }

    // Géneros
    if (generoRepository.count() == 0) {
        generoRepository.save(Genero.builder().id(1).nombre("masculino").build());
        generoRepository.save(Genero.builder().id(2).nombre("femenino").build());
        generoRepository.save(Genero.builder().id(3).nombre("unisex").build());
        log.info("Géneros creados");
    }

    // Familias olfativas
    if (familiaOlfativaRepository.count() == 0) {
        familiaOlfativaRepository.save(FamiliaOlfativa.builder()
                .id(1).nombre("floral").descripcion("Notas de flores").orden(1).build());
        familiaOlfativaRepository.save(FamiliaOlfativa.builder()
                .id(2).nombre("oriental").descripcion("Notas cálidas").orden(2).build());
        familiaOlfativaRepository.save(FamiliaOlfativa.builder()
                .id(3).nombre("amaderado").descripcion("Notas de maderas").orden(3).build());
        familiaOlfativaRepository.save(FamiliaOlfativa.builder()
                .id(4).nombre("fresco").descripcion("Notas cítricas").orden(4).build());
        familiaOlfativaRepository.save(FamiliaOlfativa.builder()
                .id(5).nombre("gourmand").descripcion("Notas dulces").orden(5).build());
        log.info("Familias olfativas creadas");
    }
}
}
