package com.hera.backend.repository;

import com.hera.backend.entity.CarritoItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CarritoItemRepository extends JpaRepository<CarritoItem, Long> {

    List<CarritoItem> findByCarritoId(Long carritoId);
    Optional<CarritoItem> findByCarritoIdAndVarianteId(Long carritoId, Long varianteId);
    void deleteByCarritoId(Long carritoId);
}
