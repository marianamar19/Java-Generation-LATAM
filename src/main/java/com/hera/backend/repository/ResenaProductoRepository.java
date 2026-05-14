package com.hera.backend.repository;

import com.hera.backend.entity.ResenaProducto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResenaProductoRepository extends JpaRepository<ResenaProducto, Long> {

    List<ResenaProducto> findByProductoId(Long productoId);
    List<ResenaProducto> findByProductoIdAndAprobadaTrueOrderByFechaDesc(Long productoId);
    List<ResenaProducto> findByAprobadaFalse();

    @Query("SELECT AVG(r.calificacion) FROM ResenaProducto r WHERE r.producto.id = :productoId AND r.aprobada = true")
    Double calcularPromedioCalificacion(@Param("productoId") Long productoId);

    @Query("SELECT COUNT(r) FROM ResenaProducto r WHERE r.producto.id = :productoId AND r.aprobada = true")
    Long contarResenasAprobadas(@Param("productoId") Long productoId);}
