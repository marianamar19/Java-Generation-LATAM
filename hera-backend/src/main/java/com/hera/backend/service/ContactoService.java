package com.hera.backend.service;

import com.hera.backend.dto.request.ContactoRequest;
import com.hera.backend.entity.Contacto;
import com.hera.backend.repository.ContactoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Servicio para gestión del formulario de contacto
 *
 * ¿QUÉ hace? Guarda mensajes enviados desde el front
 * ¿PARA QUÉ sirve? Almacenar consultas, sugerencias o reclamos
 * ¿DÓNDE se usa? En ContactoController (endpoints /api/contacto/*)
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ContactoService {

    private final ContactoRepository contactoRepository;

    /**
     * Guarda un mensaje del formulario de contacto
     *
     * ¿CÓMO funciona? Todos los mensajes se guardan con timestamp
     * ¿CUÁNDO? POST /api/contacto/enviar
     *
     * @param request Datos del formulario (nombre, email, asunto, mensaje)
     */
    @Transactional
    public void enviarMensaje(ContactoRequest request) {
        log.debug("Nuevo mensaje de contacto de: {}", request.getEmail());

        Contacto contacto = Contacto.builder()
                .nombre(request.getNombre())
                .email(request.getEmail())
                .telefono(request.getTelefono())
                .asunto(request.getAsunto())
                .mensaje(request.getMensaje())
                .leido(false)
                .respondido(false)
                .fechaEnvio(LocalDateTime.now())
                .build();

        contactoRepository.save(contacto);
        log.info("Mensaje de contacto guardado - asunto: {}, email: {}",
                request.getAsunto(), request.getEmail());
    }
}
