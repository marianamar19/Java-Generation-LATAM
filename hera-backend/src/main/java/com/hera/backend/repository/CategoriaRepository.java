package com.hera.backend.repository;

import com.hera.backend.entity.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoriaRepository extends JpaRepository<Categoria, Long> {

    Optional<Categoria> findByNombre(String nombre);
    Optional<Categoria> findBySlug(String slug);
    List<Categoria> findByTipo(String tipo);
    List<Categoria> findByTipoAndActivoTrue(String tipo);
    List<Categoria> findByCategoriaPadreId(Long categoriaPadreId);
}
