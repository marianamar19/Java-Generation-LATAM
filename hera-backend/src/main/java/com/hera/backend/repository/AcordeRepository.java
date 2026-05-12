package com.hera.backend.repository;

import com.hera.backend.entity.Acorde;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AcordeRepository extends JpaRepository<Acorde, Long> {

    Optional<Acorde> findByNombre(String nombre);
}
