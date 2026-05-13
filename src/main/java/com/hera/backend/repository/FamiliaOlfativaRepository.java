package com.hera.backend.repository;

import com.hera.backend.entity.FamiliaOlfativa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FamiliaOlfativaRepository extends JpaRepository<FamiliaOlfativa, Integer> {

    Optional<FamiliaOlfativa> findByNombre(String nombre);
}
