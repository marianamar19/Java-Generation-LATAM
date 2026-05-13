package com.hera.backend.repository;

import com.hera.backend.entity.DetallePedido;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DetallePedidoRepository extends JpaRepository<DetallePedido, Long> {

    List<DetallePedido> findByPedidoId(Long pedidoId);

    @Query("SELECT d.variante.producto.id, SUM(d.cantidad) as totalVendido " +
            "FROM DetallePedido d " +
            "GROUP BY d.variante.producto.id " +
            "ORDER BY totalVendido DESC")
    List<Object[]> findProductosMasVendidos(Pageable pageable);
}
