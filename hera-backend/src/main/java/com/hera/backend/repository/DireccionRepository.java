package com.hera.backend.repository;

import com.hera.backend.entity.Direccion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DireccionRepository extends JpaRepository<Direccion, Long> {

    List<Direccion> findByUsuarioId(Long usuarioId);
    Optional<Direccion> findByIdAndUsuarioId(Long id, Long usuarioId);
    Optional<Direccion> findByUsuarioIdAndEsPredeterminadaTrue(Long usuarioId);

}
