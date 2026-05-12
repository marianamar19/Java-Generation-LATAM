package com.hera.backend.repository;

import com.hera.backend.entity.ProductoNota;
import com.hera.backend.entity.ProductoNotaId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductoNotaRepository extends JpaRepository<ProductoNota, ProductoNotaId> {

    List<ProductoNota> findByProductoId(Long productoId);
    void deleteByProductoId(Long productoId);
}
