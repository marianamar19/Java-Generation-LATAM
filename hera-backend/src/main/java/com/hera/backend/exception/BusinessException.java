package com.hera.backend.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

/**
 * Excepción para errores de negocio (reglas de la aplicación)
 *
 * ¿CUÁNDO usarla? Cuando se viola una regla de negocio
 *
 * Ejemplos:
 *   - Email ya registrado
 *   - Producto sin stock suficiente
 *   - Código promocional inválido
 *   - Monto mínimo no alcanzado
 */
@Getter
public class BusinessException extends Throwable {

    private final HttpStatus status;

    public BusinessException(String message) {
        super(message);
        this.status = HttpStatus.BAD_REQUEST;
    }

    public BusinessException(String message, HttpStatus status) {
        super(message);
        this.status = status;
    }

    public BusinessException(String message, Throwable cause) {
        super(message, cause);
        this.status = HttpStatus.BAD_REQUEST;
    }
}
