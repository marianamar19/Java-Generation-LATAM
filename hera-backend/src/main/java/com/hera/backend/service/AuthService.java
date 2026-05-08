package com.hera.backend.service;

import com.hera.backend.dto.request.AuthRequest;
import com.hera.backend.dto.request.RegistroRequest;
import com.hera.backend.dto.response.AuthResponse;
import com.hera.backend.entity.Sesion;
import com.hera.backend.entity.Usuario;
import com.hera.backend.exception.BusinessException;
import com.hera.backend.repository.SesionRepository;
import com.hera.backend.repository.UsuarioRepository;
import com.hera.backend.security.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Servicio de autenticación y autorización
 *
 * ¿QUÉ hace? Gestiona el registro, login, logout y manejo de sesiones JWT
 * ¿PARA QUÉ sirve? Autenticar usuarios y generar tokens para proteger endpoints
 * ¿DÓNDE se usa? En AuthController (endpoints /api/auth/*)
 */

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final SesionRepository sesionRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    /**
     * Registra un nuevo usuario en el sistema
     *
     * ¿QUÉ hace? Valida email único, encripta contraseña con Base64, guarda en BD
     * ¿PARA QUÉ sirve? Crear cuentas nuevas de usuarios
     * ¿CUÁNDO se ejecuta? POST /api/auth/registro
     *
     * @param request Datos del nuevo usuario (nombre, email, password)
     * @return DTO con el token JWT y datos del usuario
     * @throws RuntimeException si el email ya está registrado
     */

    @Transactional
    public AuthResponse registrar(RegistroRequest request){
        log.debug("Registrando usuario con email: {}", request.getEmail());

        // Verificar si el email existe
        if (usuarioRepository.existsByEmail(request.getEmail())) {
            log.warn("EL email ya existe: {}", request.getEmail());
            throw new RuntimeException("El email ya esta registrado. Usa otro correo o inicia sesión");
        }

        // Crear un nuevo usuario con Builder
        Usuario usuario = Usuario.builder()
                .nombre(request.getNombre())
                .email(request.getEmail())
                .contrasenaHash(passwordEncoder.encode(request.getPassword())) //encripta la contraseña
                .rol("USER") //Rol por defecto
                .proveedorAuth("local")
                .activo(true)
                .build();

        Usuario saved = usuarioRepository.save(usuario);
        log.info("Usuario registrado exitosamente: {} - ID: {}", saved.getEmail(), saved.getId());

        //Genera token JWT y guarda sesion
        String token = jwtService.generateToken(saved.getEmail(), saved.getRol());
        guardarSesion(saved, token);

        return new AuthResponse(token, saved.getEmail(), saved.getNombre(), saved.getRol());
    }

    /**
     * Autentica un usuario existente
     *
     * ¿QUÉ hace? Verifica credenciales, genera token JWT, registra última conexión
     * ¿PARA QUÉ sirve? Permitir acceso a usuarios registrados
     * ¿CUÁNDO se ejecuta? POST /api/auth/login
     *
     * @param request Credenciales del usuario (email, password)
     * @return DTO con el token JWT y datos del usuario
     * @throws RuntimeException si las credenciales son incorrectas
     */

    @Transactional
    public AuthResponse login(AuthRequest request) throws BusinessException {
        log.debug("Login intento: {}", request.getEmail());

        // Buscar usuario por email
        Usuario usuario = usuarioRepository.findByEmailAndActivoTrue(request.getEmail())
                .orElseThrow(() -> new BusinessException("Credenciales inválidas", HttpStatus.UNAUTHORIZED
                        ));

        // ← BCrypt matches: compara texto plano con hash
        if (!passwordEncoder.matches(request.getPassword(), usuario.getContrasenaHash())) {
            log.warn("Contraseña incorrecta para: {}", request.getEmail());
            throw new RuntimeException("Credenciales inválidas");
        }

        // Actualizar ultimo acceso
        usuario.setUltimoAcceso(LocalDateTime.now());
        usuarioRepository.save(usuario);

        // Generar token y guardar sesion
        String token = jwtService.generateToken(usuario.getEmail(), usuario.getRol());
        guardarSesion(usuario, token);

        log.info("Login exitoso: {}", usuario.getEmail());
        return new AuthResponse(token, usuario.getEmail(), usuario.getNombre(), usuario.getRol());
    }

    /**
     * Guarda la sesión del usuario en la base de datos
     *
     * ¿QUÉ hace? Almacena el token JWT con fecha de expiración
     * ¿PARA QUÉ sirve? Poder invalidar tokens desde el servidor
     * ¿DÓNDE se usa? Internamente en registrar() y login()
     */

    private void guardarSesion(Usuario usuario, String token) {
        Sesion sesion = Sesion.builder()
                .usuario(usuario)
                .tokenJwt(token)
                .fechaExpiracion(LocalDateTime.now().plusHours(24))
                .activo(true)
                .build();
        sesionRepository.save(sesion);
        log.debug("Sesion guardada para usuario ID: {}", usuario.getId());
    }

    /**
     * Cierra la sesión de un usuario
     *
     * ¿QUÉ hace? Marca como inactiva la sesión del token actual
     * ¿PARA QUÉ sirve? Invalidar el token JWT manualmente
     * ¿CUÁNDO se ejecuta? POST /api/auth/logout
     *
     * @param token Token JWT a invalidar
     */
    @Transactional
    public void logout(String token) {
        sesionRepository.findByTokenJwtAndActivoTrue(token)
                .ifPresent(sesion -> {
                    sesion.setActivo(false);
                    sesionRepository.save(sesion);
                    log.debug("Sesión cerrada");
                });
    }

    /**
     * Verifica si un token JWT es válido y está activo
     *
     * ¿QUÉ hace? Valida el token y verifica que la sesión esté activa en BD
     * ¿PARA QUÉ sirve? Proteger endpoints y asegurar que el token no fue revocado
     * ¿DÓNDE se usa? En el filtro JwtAuthenticationFilter
     *
     * @param token Token JWT a validar
     * @return true si el token es válido y la sesión está activa
     */
    @Transactional(readOnly = true)
    public boolean validarToken(String token) {
        try {
            return sesionRepository.findByTokenJwtAndActivoTrue(token).isPresent()
                    && jwtService.validateToken(token);
        } catch (Exception e) {
            log.error("Error validando token: {}", e.getMessage());
            return false;
        }
    }

}
