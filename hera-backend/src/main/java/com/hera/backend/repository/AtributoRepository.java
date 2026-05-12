package com.hera.backend.repository;

import com.hera.backend.entity.Atributo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AtributoRepository extends JpaRepository<Atributo, Long> {

    Optional<Atributo> findByNombre(String nombre);
    Optional<Atributo> findByNombreAndActivoTrue(String nombre);
}
