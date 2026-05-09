package com.hera.backend.dto.request;

import lombok.Data;

/**
 * DTO para imágenes de producto
 * Se usa dentro de ProductoCreateRequest
 */
@Data
public class ImagenRequest {

    private String url;
    private Integer orden;
    private Boolean esPrincipal;

}
