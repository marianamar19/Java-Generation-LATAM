package com.hera.backend.repository;

import com.hera.backend.entity.NotaOlfativa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NotaOlfativaRepository extends JpaRepository<NotaOlfativa, Long> {

    Optional<NotaOlfativa> findByNombre(String nombre);
    List<NotaOlfativa> findByTipo(String tipo);
}
