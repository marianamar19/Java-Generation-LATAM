package com.hera.backend.repository;

import com.hera.backend.entity.ProductoMomentoDia;
import com.hera.backend.entity.ProductoMomentoDiaId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductoMomentoDiaRepository extends JpaRepository<ProductoMomentoDia, ProductoMomentoDiaId> {

    List<ProductoMomentoDia> findByProductoId(Long productoId);
    void deleteByProductoId(Long productoId);
}
