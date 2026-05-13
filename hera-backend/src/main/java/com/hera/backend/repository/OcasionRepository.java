package com.hera.backend.repository;

import com.hera.backend.entity.Ocasion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OcasionRepository extends JpaRepository<Ocasion, Long> {

    Optional<Ocasion> findByNombre(String nombre);
}
