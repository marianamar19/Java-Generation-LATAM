package com.hera.backend.repository;

import com.hera.backend.entity.ProductoRendimiento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProductoRendimientoRepository extends JpaRepository<ProductoRendimiento, Long> {

    Optional<ProductoRendimiento> findByProductoId(Long productoId);
}
