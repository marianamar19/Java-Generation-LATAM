package com.hera.backend.repository;

import com.hera.backend.entity.ProductoTemporada;
import com.hera.backend.entity.ProductoTemporadaId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductoTemporadaRepository extends JpaRepository<ProductoTemporada, ProductoTemporadaId> {

    List<ProductoTemporada> findByProductoId(Long productoId);
    void deleteByProductoId(Long productoId);
}
