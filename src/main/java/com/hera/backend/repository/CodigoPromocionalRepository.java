package com.hera.backend.repository;

import com.hera.backend.entity.CodigoPromocional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface CodigoPromocionalRepository extends JpaRepository<CodigoPromocional, Long> {

    @Query("SELECT c FROM CodigoPromocional c WHERE c.codigo = :codigo AND c.activo = true " +
            "AND (c.fechaInicio IS NULL OR c.fechaInicio <= :now) " +
            "AND (c.fechaFin IS NULL OR c.fechaFin >= :now) " +
            "AND (c.usosMaximos IS NULL OR c.usosActuales < c.usosMaximos)")
    Optional<CodigoPromocional> findCodigoValido(@Param("codigo") String codigo, @Param("now") LocalDateTime now);

}
