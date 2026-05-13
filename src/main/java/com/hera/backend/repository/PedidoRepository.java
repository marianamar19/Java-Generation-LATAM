package com.hera.backend.repository;

import com.hera.backend.entity.Pedido;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PedidoRepository extends JpaRepository<Pedido, Long> {

    Optional<Pedido> findByNumeroPedido(String numeroPedido);
    List<Pedido> findByUsuarioId(Long usuarioId);
    Page<Pedido> findByUsuarioIdOrderByFechaPedidoDesc(Long usuarioId, Pageable pageable);
    List<Pedido> findByEstado(String estado);

    List<Pedido> findByEstadoAndFechaPedidoBefore(String estado, LocalDateTime fecha);

    @Query("SELECT p FROM Pedido p WHERE p.fechaPedido BETWEEN :inicio AND :fin")
    List<Pedido> findPedidosEntreFechas(@Param("inicio") LocalDateTime inicio, @Param("fin") LocalDateTime fin);

    @Query("SELECT SUM(p.total) FROM Pedido p WHERE DATE(p.fechaPedido) = CURRENT_DATE")
    Optional<BigDecimal> sumTotalVentasHoy();
}
