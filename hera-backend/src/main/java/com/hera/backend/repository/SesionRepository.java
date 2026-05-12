package com.hera.backend.repository;

import com.hera.backend.entity.Sesion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SesionRepository extends JpaRepository<Sesion, Long> {

    Optional<Sesion> findByTokenJwtAndActivoTrue(String tokenJwt);
    void deleteByUsuarioId(Long usuarioId);
}
