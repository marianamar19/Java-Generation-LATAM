package com.hera.backend.repository;

import com.hera.backend.entity.MomentoDia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MomentoDiaRepository extends JpaRepository<MomentoDia, Long> {

    Optional<MomentoDia> findByNombre(String nombre);
}
