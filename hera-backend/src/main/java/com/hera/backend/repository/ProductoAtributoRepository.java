package com.hera.backend.repository;

import com.hera.backend.entity.ProductoAtributo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductoAtributoRepository extends JpaRepository<ProductoAtributo, Long> {

    List<ProductoAtributo> findByProductoId(Long productoId);
    Optional<ProductoAtributo> findByProductoIdAndAtributoId(Long productoId, Long atributoId);
    void deleteByProductoId(Long productoId);
}
