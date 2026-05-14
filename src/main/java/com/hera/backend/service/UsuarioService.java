package com.hera.backend.service;


import com.hera.backend.dto.request.ActualizarEmailRequest;
import com.hera.backend.dto.request.ActualizarPasswordRequest;
import com.hera.backend.dto.request.ActualizarPerfilRequest;
import com.hera.backend.dto.response.UsuarioResponseDTO;
import com.hera.backend.entity.Usuario;
import com.hera.backend.exception.BusinessException;
import com.hera.backend.exception.ResourceNotFoundException;
import com.hera.backend.mapper.UsuarioMapper;
import com.hera.backend.repository.UsuarioRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final UsuarioMapper usuarioMapper;
    private final PasswordEncoder passwordEncoder;  // ← BCrypt

    /**
     * Obtiene el perfil completo de un usuario
     *
     * ¿QUÉ hace? Busca por ID y convierte a DTO (excluye contraseña)
     * ¿PARA QUÉ sirve? Mostrar datos en el panel de perfil
     * ¿CUÁNDO? GET /api/usuario/perfil
     *
     * @param usuarioId ID del usuario autenticado
     * @return DTO con datos del usuario (sin campos sensibles)
     */
    @Transactional(readOnly = true)
    public UsuarioResponseDTO obtenerPerfil(Long usuarioId) {
        // ResourceNotFoundException (404)
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", "id", usuarioId));
        return usuarioMapper.toDTO(usuario);
    }

    /**
     * Actualiza el perfil del usuario (nombre, teléfono, fecha nacimiento)
     *
     * ¿QUÉ hace? Modifica solo los campos enviados en la request
     * ¿PARA QUÉ sirve? Permitir al usuario editar su información personal
     * ¿CUÁNDO? PUT /api/usuario/perfil
     *
     * @param usuarioId ID del usuario autenticado
     * @param request Datos actualizados (campos opcionales)
     * @return DTO actualizado
     */
    @Transactional
    public UsuarioResponseDTO actualizarPerfil(Long usuarioId, ActualizarPerfilRequest request) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", "id", usuarioId));

        if (request.getNombre() != null && !request.getNombre().isEmpty()){
            usuario.setNombre(request.getNombre());
        }
        if (request.getTelefono() != null){
            usuario.setTelefono(request.getTelefono());
        }
        if (request.getFechaNacimiento() != null){
            usuario.setFechaNacimiento(request.getFechaNacimiento());
        }

        return usuarioMapper.toDTO(usuarioRepository.save(usuario));
    }

    /**
     * Cambia el email del usuario
     *
     * ¿QUÉ hace? Verifica que el nuevo email no esté en uso y actualiza
     * ¿PARA QUÉ sirve? Permitir cambiar el correo de la cuenta
     * ¿CUÁNDO? PUT /api/usuario/email
     *
     * @param usuarioId ID del usuario autenticado
     * @param request Contiene el nuevo email
     * @return DTO actualizado
     * @throws RuntimeException si el email ya está registrado
     */
    @Transactional
    public UsuarioResponseDTO actualizarEmail(Long usuarioId, ActualizarEmailRequest request) throws BusinessException {
        // BusinessException para email duplicado
        if (usuarioRepository.existsByEmail(request.getNuevoEmail())) {
            throw new BusinessException("El email '" + request.getNuevoEmail() + "' ya está en uso por otra cuenta");
        }

        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", "id", usuarioId));

        usuario.setEmail(request.getNuevoEmail());
        return usuarioMapper.toDTO(usuarioRepository.save(usuario));
    }

    /**
     * Cambia la contraseña del usuario
     *
     * ¿QUÉ hace? Verifica la contraseña actual, luego actualiza con la nueva
     * ¿PARA QUÉ sirve? Seguridad: permite cambiar la contraseña periódicamente
     * ¿CUÁNDO? PUT /api/usuario/password
     *
     * @param usuarioId ID del usuario autenticado
     * @param request Contiene password actual y nueva
     * @throws RuntimeException si la contraseña actual es incorrecta
     */
    @Transactional
    public void actualizarPassword(Long usuarioId, @Valid ActualizarPasswordRequest request) throws BusinessException {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", "id", usuarioId));

        // BusinessException para contraseña incorrecta
        if (!passwordEncoder.matches(request.getPasswordActual(), usuario.getContrasenaHash())) {
            throw new BusinessException("Contraseña actual incorrecta", HttpStatus.UNAUTHORIZED);
        }

        // ← BCrypt: codificar nueva contraseña
        usuario.setContrasenaHash(passwordEncoder.encode(request.getNuevaPassword()));
        usuarioRepository.save(usuario);

        log.info("Contraseña actualizada para usuario ID: {}", usuarioId);
    }

    // Método auxiliar para obtener usuario por email (útil para otros servicios)
    @Transactional(readOnly = true)
    public Usuario obtenerPorEmail(String email) {
        return usuarioRepository.findByEmailAndActivoTrue(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", "email", email));
    }

    // Método auxiliar para obtener ID por email
    @Transactional(readOnly = true)
    public Long obtenerIdPorEmail(String email) {
        Usuario usuario = obtenerPorEmail(email);
        return usuario.getId();
    }
}

