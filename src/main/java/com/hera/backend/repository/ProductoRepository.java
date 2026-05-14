package com.hera.backend.repository;

import com.hera.backend.entity.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, Long> {

    // Búsquedas básicas
    Optional<Producto> findByProductoId(String productoId);
    Optional<Producto> findBySlug(String slug);
    List<Producto> findByTipo(String tipo);
    List<Producto> findByActivoTrue();

    // Flags especiales
    List<Producto> findByEsNuevoTrueAndActivoTrue();
    List<Producto> findByEsBestSellerTrueAndActivoTrue();
    List<Producto> findByEsDestacadoTrueAndActivoTrue();
    List<Producto> findByTipoAndActivoTrue(String tipo);

    // Filtros por relaciones
    @Query("SELECT p FROM Producto p WHERE p.marca.id = :marcaId AND p.activo = true")
    List<Producto> findByMarcaId(@Param("marcaId") Long marcaId);

    @Query("SELECT p FROM Producto p WHERE p.categoria.id = :categoriaId AND p.activo = true")
    List<Producto> findByCategoriaId(@Param("categoriaId") Long categoriaId);

    @Query("SELECT p FROM Producto p WHERE p.nivelDisponibilidad.codigo = :nivelCodigo AND p.activo = true")
    List<Producto> findByNivelDisponibilidadCodigo(@Param("nivelCodigo") String nivelCodigo);

    // Búsqueda textual Búsqueda con LIKE (compatible con todas las BD)
    @Query("SELECT p FROM Producto p WHERE " +
            "(LOWER(p.nombre) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(p.descripcion) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND p.activo = true")
    List<Producto> buscarPorKeyword(@Param("keyword") String keyword);

    // Buscar por temporada
    @Query("SELECT p FROM Producto p JOIN p.temporadas t WHERE t.temporada.nombre = :temporada AND p.activo = true")
    List<Producto> findByTemporada(@Param("temporada") String temporada);
}
