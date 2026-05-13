package com.hera.backend.repository;

import com.hera.backend.entity.NivelDisponibilidad;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface NivelDisponibilidadRepository extends JpaRepository<NivelDisponibilidad, Long> {

    Optional<NivelDisponibilidad> findByCodigo(String codigo);
    Optional<NivelDisponibilidad> findByNombre(String nombre);
}
