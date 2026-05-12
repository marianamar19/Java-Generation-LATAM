package com.hera.backend.repository;

import com.hera.backend.entity.ImagenProducto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ImagenProductoRepository extends JpaRepository<ImagenProducto, Long> {

    List<ImagenProducto> findByProductoIdOrderByOrdenAsc(Long productoId);
    List<ImagenProducto> findByProductoIdAndEsPrincipalTrue(Long productoId);
    void deleteByProductoId(Long productoId);
}
