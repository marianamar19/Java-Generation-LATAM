package com.hera.backend.controller;

import com.hera.backend.dto.response.CarrierResponseDTO;
import com.hera.backend.exception.BusinessException;
import com.hera.backend.service.EnvioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Controlador de envíos
 *
 * ¿QUÉ hace? Calcula opciones de paquetería según código postal
 * ¿PARA QUÉ sirve? Mostrar carriers disponibles en el checkout
 * Endpoint público (no requiere autenticación)
 */
@RestController
@RequestMapping("/api/envio")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Envíos", description = "Cálculo de opciones de envío y paqueterías (público)")
public class EnvioController {

    private final EnvioService envioService;

    /**
     * Obtener carriers disponibles
     */
    @GetMapping("/carriers")
    @Operation(
            summary = "Obtener carriers",
            description = "Retorna las opciones de paquetería disponibles según el código postal. " +
                    "Si el CP está en ZMG, incluye opción de entrega local sin costo."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Carriers obtenidos exitosamente",
                    content = @Content(array = @ArraySchema(schema = @Schema(implementation = CarrierResponseDTO.class)))),
            @ApiResponse(responseCode = "400", description = "Código postal inválido",
                    content = @Content(examples = @ExampleObject(value = """
                         {
                             "timestamp": "2024-01-15T10:30:00",
                             "status": 400,
                             "error": "Bad Request",
                             "message": "El código postal debe tener 5 dígitos"
                         }
                     """)))
    })
    public ResponseEntity<List<CarrierResponseDTO>> obtenerCarriers(
            @Parameter(description = "Código postal (5 dígitos)", example = "44100", required = true)
            @RequestParam("cp") String codigoPostal) throws BusinessException {
        log.info("Consultando carriers para CP: {}", codigoPostal);
        return ResponseEntity.ok(envioService.obtenerCarriers(codigoPostal));
    }

    /**
     * Obtener monto mínimo para envío gratis
     */
    @GetMapping("/minimo-envio-gratis")
    @Operation(
            summary = "Monto mínimo envío gratis",
            description = "Retorna el monto mínimo de compra (en MXN) para aplicar envío gratis"
    )
    public ResponseEntity<?> obtenerMinimoEnvioGratis() {
        log.info("Consultando monto mínimo para envío gratis");
        return ResponseEntity.ok(java.util.Map.of(
                "minimo", envioService.obtenerMinimoEnvioGratis(),
                "moneda", "MXN"
        ));
    }
}
