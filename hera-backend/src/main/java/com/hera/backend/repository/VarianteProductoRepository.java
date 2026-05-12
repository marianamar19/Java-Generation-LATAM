package com.hera.backend.repository;

import com.hera.backend.entity.VarianteProducto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VarianteProductoRepository  extends JpaRepository<VarianteProducto, Long> {

    List<VarianteProducto> findByProductoId(Long productoId);
    List<VarianteProducto> findByProductoIdAndActivoTrue(Long productoId);
    Optional<VarianteProducto> findBySku(String sku);
    boolean existsBySku(String sku);

    void deleteByProductoId(Long id);
}
