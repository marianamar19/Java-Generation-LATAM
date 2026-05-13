package com.hera.backend.repository;

import com.hera.backend.entity.Suscriptor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SuscriptorRepository extends JpaRepository<Suscriptor, Long> {

    Optional<Suscriptor> findByEmail(String email);
    boolean existsByEmail(String email);
}
