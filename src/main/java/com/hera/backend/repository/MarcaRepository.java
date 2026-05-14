package com.hera.backend.repository;

import com.hera.backend.entity.Marca;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MarcaRepository extends JpaRepository<Marca, Long> {

    Optional<Marca> findBySlug(String slug);
    Optional<Marca> findByNombre(String nombre);
    List<Marca> findByActivoTrue();
}
