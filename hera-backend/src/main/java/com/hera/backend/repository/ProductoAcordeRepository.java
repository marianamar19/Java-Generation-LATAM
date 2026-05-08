package com.hera.backend.repository;

import com.hera.backend.entity.ProductoAcorde;
import com.hera.backend.entity.ProductoAcordeId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductoAcordeRepository extends JpaRepository<ProductoAcorde, ProductoAcordeId> {

    List<ProductoAcorde> findByProductoId(Long productoId);
    void deleteByProductoId(Long productoId);
}
