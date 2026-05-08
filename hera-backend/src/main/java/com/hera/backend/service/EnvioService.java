package com.hera.backend.service;

import com.hera.backend.dto.response.CarrierResponseDTO;
import com.hera.backend.exception.BusinessException;
import com.hera.backend.repository.ConfiguracionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
 * Servicio para cálculo de envíos y paqueterías
 *
 * ¿QUÉ hace? Simula consulta de carriers según código postal
 * ¿PARA QUÉ sirve? Mostrar opciones de envío en el checkout
 * ¿DÓNDE se usa? En EnvioController (endpoints /api/envio/*)
 *
 * TEMPORAL: Esto debe reemplazarse por integración real con API de paqueterías
 *              (Skydropx, DHL, Estafeta, etc.)
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EnvioService {

    private final ConfiguracionRepository configuracionRepository;

    // Códigos postales de la Zona Metropolitana de Guadalajara
    private static final List<String> CODIGOS_POSTALES_GDL = List.of(
            "44100", "44200", "44300", "44400", "44500", "44600", "44700", "44800", "44900",
            "45000", "45010", "45020", "45030", "45040", "45050", "45060", "45070", "45080",
            "45090", "45100", "45110", "45120", "45130", "45140", "45150", "45200", "45400",
            "45500", "45600", "45650", "45670", "45900", "44160"
    );

    /**
     * Obtiene las opciones de paquetería disponibles para un código postal
     *
     * ¿CÓMO funciona?
     *   - Si CP está en GDL → muestra opción de entrega local sin costo
     *   - Si no → muestra carriers estándar con costos desde configuracion
     *
     * TEMPORAL: Simulación. En producción, integrar con API real.
     *
     * @param cp Código postal ingresado por el usuario
     * @return Lista de opciones de envío disponibles
     */
    public List<CarrierResponseDTO> obtenerCarriers(String cp) throws BusinessException {
        log.debug("Consultando carriers para CP: {}", cp);

        // Validar código postal
        if (cp == null || cp.trim().isEmpty()){
            throw new BusinessException("El código postal es obligatorio");
        }

        if (!cp.matches("\\d{5}")){
            throw new BusinessException("El código postal debe tener 5 dígitos");
        }

        List<CarrierResponseDTO> carriers = new ArrayList<>();

        // Obtener costos desde la tabla de configuración
        BigDecimal costoEstandar = obtenerCostoConfiguracion("costo_envio_estandar", new BigDecimal("99"));
        BigDecimal costoDhl = obtenerCostoConfiguracion("costo_envio_dhl", new BigDecimal("149"));

        // Carriers estándar (para todo México)
        carriers.add(CarrierResponseDTO.builder()
                .nombre("Skydropx")
                .servicio("Estándar")
                .tiempoEstimado("3-5 días hábiles")
                .costo(costoEstandar)
                .build());

        carriers.add(CarrierResponseDTO.builder()
                .nombre("DHL")
                .servicio("Express")
                .tiempoEstimado("1-2 días hábiles")
                .costo(costoDhl)
                .build());

        // Si el CP está en GDL, agregar opción de entrega local sin costo
        if (CODIGOS_POSTALES_GDL.contains(cp)) {
            carriers.add(CarrierResponseDTO.builder()
                    .nombre("Casa Blanca")
                    .servicio("Recolección en sucursal")
                    .tiempoEstimado("Mismo día (sábados)")
                    .costo(BigDecimal.ZERO)
                    .build());

            log.debug("CP en ZMG - opción de entrega local agregada");
        }

        return carriers;
    }

    /**
     * Obtiene el monto mínimo para envío gratis
     *
     * @return BigDecimal (ej: 1500)
     */
    public BigDecimal obtenerMinimoEnvioGratis() {
        return obtenerCostoConfiguracion("envio_gratis_minimo", new BigDecimal("1500"));
    }

    /**
     * Helper para leer valores de la tabla de configuración
     */
    private BigDecimal obtenerCostoConfiguracion(String clave, BigDecimal defaultValue) {
        try {
            return configuracionRepository.findByClave(clave)
                    .map(config -> {
                        try {
                            return new BigDecimal(config.getValor());
                    }catch (NumberFormatException e){
                         log.warn("Configuracion {} tiene valor inválido: {}", clave, config.getValor());
                         return defaultValue;
                        }
                    })
                    .orElse(defaultValue);
        } catch (Exception e) {
            log.warn("Error al leer configuración {}: {}", clave, e.getMessage());
            return defaultValue;
        }
    }
}
