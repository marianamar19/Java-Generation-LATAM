package com.hera.backend.repository;

import com.hera.backend.entity.Contacto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContactoRepository extends JpaRepository<Contacto, Long> {

    List<Contacto> findByLeidoFalseOrderByFechaEnvioDesc();
    List<Contacto> findByRespondidoFalseOrderByFechaEnvioDesc();
}
