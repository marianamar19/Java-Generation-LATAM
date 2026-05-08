package com.hera.backend.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class CarrierResponseDTO {

    private String nombre;          // "DHL", "Skydropx", "Casa Blanca"
    private String servicio;        // "Express", "Estándar", "Recolección"
    private String tiempoEstimado;  // "1-2 días hábiles"
    private BigDecimal costo;       // 99.00, 149.00, 0.00
}
