package com.hera.backend.exception;

import lombok.Getter;

/**
 * Excepción para recursos no encontrados (HTTP 404)
 *
 * ¿CUÁNDO usarla? Cuando se busca un producto, usuario, etc. que no existe en BD
 *
 * Ejemplo:
 *   throw new ResourceNotFoundException("Producto", "id", 123L);
 */
@Getter
public class ResourceNotFoundException extends RuntimeException {

    private final String resourceName;
    private final String fieldName;
    private final Object fieldValue;

    public ResourceNotFoundException(String resourceName, String fieldName, Object fieldValue) {
        super(String.format("%s no encontrado con %s = '%s'", resourceName, fieldName, fieldValue));
        this.resourceName = resourceName;
        this.fieldName = fieldName;
        this.fieldValue = fieldValue;
    }

    public ResourceNotFoundException(String message) {
        super(message);
        this.resourceName = null;
        this.fieldName = null;
        this.fieldValue = null;
    }
}
