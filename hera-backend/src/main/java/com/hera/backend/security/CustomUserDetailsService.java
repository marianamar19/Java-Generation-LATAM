package com.hera.backend.security;

import com.hera.backend.entity.Usuario;
import com.hera.backend.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;

/**
 * Servicio que carga los datos del usuario desde la BD para Spring Security

 * ¿QUÉ hace? Busca el usuario por email y lo convierte a UserDetails
 * ¿PARA QUÉ sirve? Que Spring Security pueda usar nuestros usuarios de BD
 * ¿DÓNDE se usa? En JwtAuthenticationFilter y en autenticación de login
 */

@Service
@RequiredArgsConstructor
@Slf4j
public class CustomUserDetailsService implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;

    /**
     * Carga un usuario por su email (username)
     *
     * @param email Email del usuario a buscar
     * @return UserDetails (objeto que entiende Spring Security)
     * @throws UsernameNotFoundException si el usuario no existe
     */

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {

        log.debug("Cargando usuario por email: {}", email);

        Usuario usuario= usuarioRepository.findByEmailAndActivoTrue(email)
                .orElseThrow(() -> {
                    log.warn("Usuario no encontrado con email: {}", email);
                    return  new UsernameNotFoundException("Usuario no encontrado: " + email);
                });

        log.debug("Usuario encontrado: {}, rol: {}", usuario.getEmail(), usuario.getRol());

        // Convertir el rol de la BD al formato que espera Spring Security
        // Spring Security espera "ROLE_USER" o "ROLE_ADMIN"

        String rolSpring = "ROLE_" + usuario.getRol();

        return User.builder()
                .username(usuario.getEmail())
                .password(usuario.getContrasenaHash())
                .authorities(Collections.singleton(new SimpleGrantedAuthority(rolSpring)))
                .disabled(!usuario.getActivo())
                .accountExpired(false)
                .accountLocked(false)
                .build();
    }
}
