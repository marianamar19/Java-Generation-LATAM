package com.hera.backend.repository;

import com.hera.backend.entity.ProductoOcasion;
import com.hera.backend.entity.ProductoOcasionId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductoOcasionRepository extends JpaRepository<ProductoOcasion, ProductoOcasionId> {

    List<ProductoOcasion> findByProductoId(Long productoId);
    void deleteByProductoId(Long productoId);
}
