package com.hera.backend.controller;

import com.hera.backend.dto.request.ContactoRequest;
import com.hera.backend.service.ContactoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controlador de contacto
 *
 * ¿QUÉ hace? Recibe mensajes del formulario de contacto
 * ¿PARA QUÉ sirve? Guardar consultas de usuarios en la BD
 * Endpoint público (no requiere autenticación)
 */
@RestController
@RequestMapping("/api/contacto")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Contacto", description = "Formulario de contacto (público)")
public class ContactoController {

    private final ContactoService contactoService;

    /**
     * Enviar mensaje de contacto
     */
    @PostMapping("/enviar")
    @Operation(
            summary = "Enviar mensaje",
            description = "Envía un mensaje desde el formulario de contacto. El mensaje se guarda en la base de datos."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Mensaje enviado correctamente"),
            @ApiResponse(responseCode = "400", description = "Datos inválidos", content = @Content(examples = @ExampleObject(value = """
            {
                "timestamp": "2024-01-15T10:30:00",
                "status": 400,
                "error": "Bad Request",
                "message": "Error de validación en los campos enviados",
                "details": {
                    "email": "Debe ser un email válido",
                    "nombre": "El nombre es obligatorio"
                }
            }
        """)))
    })
    public ResponseEntity<?> enviarMensaje(@Valid @RequestBody ContactoRequest request) {
        log.info("Nuevo mensaje de contacto de: {}", request.getEmail());
        contactoService.enviarMensaje(request);
        return ResponseEntity.ok(java.util.Map.of("message", "Mensaje enviado correctamente"));
    }
}
