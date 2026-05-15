package com.hera.backend.service;

import com.hera.backend.dto.request.CarritoItemRequest;
import com.hera.backend.dto.response.CarritoItemResponseDTO;
import com.hera.backend.dto.response.CarritoResponseDTO;
import com.hera.backend.entity.Carrito;
import com.hera.backend.entity.CarritoItem;
import com.hera.backend.entity.Usuario;
import com.hera.backend.entity.VarianteProducto;
import com.hera.backend.exception.BusinessException;
import com.hera.backend.exception.ResourceNotFoundException;
import com.hera.backend.repository.CarritoItemRepository;
import com.hera.backend.repository.CarritoRepository;
import com.hera.backend.repository.UsuarioRepository;
import com.hera.backend.repository.VarianteProductoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Servicio para gestión del carrito de compras
 *
 * ¿QUÉ hace? Maneja items del carrito, cálculos de totales y envío gratis
 * ¿PARA QUÉ sirve? Persistir carrito entre sesiones (logueados e invitados)
 * ¿DÓNDE se usa? En CarritoController (endpoints /api/carrito/*)
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CarritoService {

    private static final BigDecimal ENVIO_GRATIS_MINIMO = new BigDecimal("1500");

    private final CarritoRepository carritoRepository;
    private final CarritoItemRepository carritoItemRepository;
    private final UsuarioRepository usuarioRepository;
    private final VarianteProductoRepository varianteProductoRepository;

    /**
     * Obtiene o crea un carrito para el usuario (logueado o invitado)
     *
     * ¿QUÉ hace? Si el usuario está logueado, busca su carrito. Si es invitado,
     *            busca por token o crea uno nuevo.
     * ¿PARA QUÉ sirve? Mantener el carrito consistente entre dispositivos
     *
     * @param usuarioId ID del usuario (puede ser null para invitados)
     * @param tokenUsuario Token de sesión para invitados
     * @return Carrito entity listo para usar
     */
    @Transactional
    public Carrito obtenerOCrearCarrito(Long usuarioId, String tokenUsuario) {
        log.debug("Obteniendo carrito - usuarioId: {}, token: {}", usuarioId, tokenUsuario);

        // Caso 1: Usuario logueado
        if (usuarioId != null) {
            return carritoRepository.findByUsuarioId(usuarioId)
                    .orElseGet(() -> {
                        Usuario usuario = usuarioRepository.findById(usuarioId)
                                .orElseThrow(() -> new ResourceNotFoundException("Usuario", "id", usuarioId));

                        Carrito nuevoCarrito = Carrito.builder()
                                .usuario(usuario)
                                .fechaCreacion(LocalDateTime.now())
                                .build();

                        log.info("Carrito nuevo creado para usuario ID: {}", usuarioId);
                        return carritoRepository.save(nuevoCarrito);
                    });
        }

        // Caso 2: Usuario invitado
        if (tokenUsuario != null && !tokenUsuario.isEmpty()) {
            return carritoRepository.findByCarritoToken(tokenUsuario)
                    .orElseGet(() -> {
                        Carrito nuevoCarrito = Carrito.builder()
                                .carritoToken(tokenUsuario)
                                .fechaCreacion(LocalDateTime.now())
                                .build();

                        log.debug("Carrito nuevo creado para token: {}", tokenUsuario);
                        return carritoRepository.save(nuevoCarrito);
                    });
        }

        // Caso 3: Nuevo invitado sin token - generar uno nuevo
        String nuevoToken = UUID.randomUUID().toString();
        Carrito nuevoCarrito = Carrito.builder()
                .carritoToken(nuevoToken)
                .fechaCreacion(LocalDateTime.now())
                .build();

        log.debug("Carrito nuevo creado con token generado: {}", nuevoToken);
        return carritoRepository.save(nuevoCarrito);
    }

    /**
     * Agrega un producto al carrito
     *
     * ¿QUÉ hace? Si la variante ya existe, suma cantidad; si no, crea nuevo item
     * ¿CUÁNDO? POST /api/carrito/items
     *
     * @param carritoId ID del carrito
     * @param request Contiene varianteId y cantidad
     */
    @Transactional
    public void agregarItem(Long carritoId, CarritoItemRequest request) throws BusinessException {
        log.debug("Agregando item al carrito {}: varianteId={}, cantidad={}",
                carritoId, request.getVarianteId(), request.getCantidad());

        Carrito carrito = carritoRepository.findById(carritoId)
                .orElseThrow(() -> new ResourceNotFoundException("Carrito", "id", carritoId));

        VarianteProducto variante = varianteProductoRepository.findById(request.getVarianteId())
                .orElseThrow(() -> new ResourceNotFoundException("Variante", "id", request.getVarianteId()));

        // Verificar si el producto ya está en el carrito
        if (variante.getStock() < request.getCantidad()){
            throw  new BusinessException("Stock insuficiente. Solo hay " + variante.getStock() + " unidades disponibles");
        }

        var existing = carritoItemRepository
                .findByCarritoIdAndVarianteId(carritoId, request.getVarianteId());

        if (existing.isPresent()) {
            // Si ya existe, solo sumamos cantidad
            CarritoItem item = existing.get();
            int nuevaCantidad = item.getCantidad() + request.getCantidad();

            // verificar stock total despues de sumar
            if (variante.getStock() < nuevaCantidad) {
                throw new BusinessException("No puedes agregar más. Stock máximo: " + variante.getStock());
            }

            item.setCantidad(item.getCantidad() + request.getCantidad());
            carritoItemRepository.save(item);
            log.debug("Cantidad actualizada para item existente: {}", item.getId());
        } else {
            // Si no existe, creamos uno nuevo
            CarritoItem nuevoItem = CarritoItem.builder()
                    .carrito(carrito)
                    .variante(variante)
                    .cantidad(request.getCantidad())
                    .build();
            carritoItemRepository.save(nuevoItem);
            log.debug("Item nuevo agregado al carrito: {}", nuevoItem.getId());
        }

        // Actualizar fecha de modificación del carrito
        carrito.setFechaActualizacion(LocalDateTime.now());
        carritoRepository.save(carrito);
    }

    /**
     * Obtiene el contenido del carrito con cálculos de totales
     *
     * ¿QUÉ hace? Calcula subtotal, verifica envío gratis, formatea respuesta
     * ¿PARA QUÉ sirve? Mostrar el carrito al usuario con precios actualizados
     * ¿CUÁNDO? GET /api/carrito
     *
     * @param carritoId ID del carrito
     * @return DTO con items, totales y estado de envío gratis
     */
    @Transactional(readOnly = true)
    public CarritoResponseDTO obtenerCarrito(Long carritoId) {
        log.debug("Obteniendo contenido del carrito: {}", carritoId);

        Carrito carrito = carritoRepository.findById(carritoId)
                .orElseThrow(() -> new ResourceNotFoundException("Carrito", "id", carritoId));

        List<CarritoItem> items = carritoItemRepository.findByCarritoId(carritoId);

        // Calcular subtotal sumando precio × cantidad
        BigDecimal subtotal = items.stream()
                .map(item -> item.getVariante().getPrecio()
                        .multiply(BigDecimal.valueOf(item.getCantidad())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Determinar si aplica envío gratis
        boolean tieneEnvioGratis = subtotal.compareTo(ENVIO_GRATIS_MINIMO) >= 0;
        BigDecimal faltante = tieneEnvioGratis
                ? BigDecimal.ZERO : ENVIO_GRATIS_MINIMO.subtract(subtotal);

        // Construir DTOs de items
        List<CarritoItemResponseDTO> itemsDTO = items.stream()
                .map(item -> CarritoItemResponseDTO.builder()
                        .id(String.valueOf(item.getId()))
                        .varianteId(item.getVariante().getId())
                        .productId(item.getVariante().getProducto().getProductoId())
                        .nombre(item.getVariante().getProducto().getNombre())
                        .marca(item.getVariante().getProducto().getMarca().getNombre())
                        .variante(item.getVariante().getNombreVariante())
                        .cantidad(item.getCantidad())
                        .precioUnitario(item.getVariante().getPrecio())
                        .subtotal(item.getVariante().getPrecio()
                                .multiply(BigDecimal.valueOf(item.getCantidad())))
                        .nivelDisponibilidad(item.getVariante().getProducto()
                                .getNivelDisponibilidad().getCodigo())
                        .imagen(item.getVariante().getProducto().getImagenPrincipalUrl())
                        .build())
                .collect(Collectors.toList());

        // Calcular total de items (cantidades, no productos)
        Integer totalItems = items.stream()
                .mapToInt(CarritoItem::getCantidad)
                .sum();

        return CarritoResponseDTO.builder()
                .items(itemsDTO)
                .totalItems(totalItems)
                .subtotal(subtotal)
                .descuento(BigDecimal.ZERO)  // Descuentos se aplican en checkout
                .total(subtotal)
                .tieneEnvioGratis(tieneEnvioGratis)
                .faltanteEnvioGratis(faltante)
                .build();
    }

    /**
     * Actualiza la cantidad de un item en el carrito
     *
     * ¿PARA QUÉ sirve? Permitir al usuario aumentar/disminuir cantidades
     * ¿CUÁNDO? PUT /api/carrito/items/{itemId}
     */
    @Transactional
    public void actualizarCantidad(Long carritoId, Long itemId, Integer cantidad) throws BusinessException {
        log.debug("Actualizando cantidad del item {} a {}", itemId, cantidad);

        CarritoItem item = carritoItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Item", "id", itemId));

        // Verificar que el item pertenece al carrito correcto
        if (!item.getCarrito().getId().equals(carritoId)) {
            throw new BusinessException("El item no pertenece a este carrito");
        }

        if (cantidad <= 0) {
            // Si cantidad es 0 o menor, eliminar el item
            carritoItemRepository.delete(item);
            log.debug("Item eliminado del carrito por cantidad inválida");
        } else {
            // Verificar stock disponible
            VarianteProducto variante = item.getVariante();
            if (variante.getStock() < cantidad){
                throw new BusinessException("Stock insuficiente. Máximo disponible: " + variante.getStock());
            }

            item.setCantidad(cantidad);
            carritoItemRepository.save(item);
            log.debug("Cantidad actualizada a: {}", cantidad);
        }

        // Actualizar fecha de modificación del carrito
        Carrito carrito = carritoRepository.findById(carritoId).orElseThrow();
        carrito.setFechaActualizacion(LocalDateTime.now());
        carritoRepository.save(carrito);
    }

    /**
     * Elimina un item completo del carrito
     *
     * ¿PARA QUÉ sirve? Botón "Eliminar" en el carrito
     * ¿CUÁNDO? DELETE /api/carrito/items/{itemId}
     */
    @Transactional
    public void eliminarItem(Long carritoId, Long itemId) throws BusinessException {
        log.debug("Eliminando item {} del carrito {}", itemId, carritoId);

        CarritoItem item = carritoItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Item", "id", itemId));

        // Verificar que el item pertenece al carrito correcto
        if (!item.getCarrito().getId().equals(carritoId)) {
            throw new BusinessException("Item no pertenece a este carrito");
        }

        carritoItemRepository.delete(item);

        // Actualizar fecha de modificación del carrito
        Carrito carrito = carritoRepository.findById(carritoId).orElseThrow();
        carrito.setFechaActualizacion(LocalDateTime.now());
        carritoRepository.save(carrito);

        log.debug("Item eliminado exitosamente");
    }

    /**
     * Vacía completamente el carrito
     *
     * ¿PARA QUÉ sirve? Después de finalizar un pedido o por limpieza manual
     * ¿CUÁNDO? DELETE /api/carrito/empty
     */
    @Transactional
    public void vaciarCarrito(Long carritoId) {
        log.debug("Vaciando carrito: {}", carritoId);

        Carrito carrito = carritoRepository.findById(carritoId)
                .orElseThrow(() -> new ResourceNotFoundException("Carrito", "id", carritoId));

        carritoItemRepository.deleteByCarritoId(carritoId);
        carrito.setFechaActualizacion(LocalDateTime.now());
        carritoRepository.save(carrito);

        log.info("Carrito {} vaciado exitosamente", carritoId);
    }
}
