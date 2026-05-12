package com.hera.backend.repository;

import com.hera.backend.entity.Temporada;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TemporadaRepository extends JpaRepository<Temporada, Long> {

    Optional<Temporada> findByNombre(String nombre);

}
