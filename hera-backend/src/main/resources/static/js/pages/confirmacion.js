/**
 * confirmacion.js — HERA
 *
 * Descripción: Lógica exclusiva de la página de confirmación de pedido.
 *              Lee el número de orden desde la URL (?orden=HERA-2025-001),
 *              consulta el backend vía GET /api/pedidos/rastrear/{numeroPedido}
 *              y renderiza todos los datos en el DOM.
 *
 *              Ya no depende de localStorage para los datos de la orden.
 *              localStorage solo se usa para limpiar el carrito tras confirmar.
 *
 * Exporta:     (ninguno — script de página, entry point único)
 * Importado por: pages/confirmacion.html vía <script type="module">
 */

import { loadNavbar }    from '../components/navbar.js';
import { loadFooter }    from '../components/footer.js';
import { initCartDrawer} from '../components/cart-drawer.js';
import { initFavDrawer } from '../components/fav-drawer.js';

/* ── URL base del backend ───────────────────────────────────────
   Cuando el backend esté en producción, cambiar por la URL real.
   Ejemplo: 'https://api.hera.mx'                                */
const API_BASE = 'http://localhost:8080';

/* ══════════════════════════════════════════════════════
   INICIALIZACIÓN ASÍNCRONA
══════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', async function () {

  /* ── 1. Leer número de orden desde la URL ── */
  const params      = new URLSearchParams(window.location.search);
  const numeroPedido = params.get('orden');

  if (!numeroPedido) {
    // Alguien llegó a esta página sin número de orden en la URL
    window.location.href = 'index.html';
    return;
  }

  /* ── 2. Cargar componentes universales ── */
  await loadNavbar();
  loadFooter();
  initCartDrawer();
  await initFavDrawer();

  /* ── 3. Mensaje de carrito vacío personalizado para esta página ── */
  const cartEmptyEl = document.getElementById('cart-empty');
  if (cartEmptyEl) {
    const cartEmptyP = cartEmptyEl.querySelector('p');
    if (cartEmptyP) {
      cartEmptyP.innerHTML = 'Ya realizaste tu compra.<br>¡Gracias por elegir HERA!';
    }
  }

  /* ── 4. Consultar la orden al backend ── */
  _mostrarCargando();

  try {
    const order = await _fetchOrden(numeroPedido);
    _renderOrder(order);
    _limpiarCarritoLocal();
  } catch (err) {
    _mostrarError(err.message);
    return;
  }

  /* ── 5. Scroll reveal ── */
  _initScrollReveal();
});


/* ══════════════════════════════════════════════════════
   FETCH — consulta al backend
══════════════════════════════════════════════════════ */

/**
 * Consulta GET /api/pedidos/rastrear/{numeroPedido} y devuelve
 * el objeto PedidoResponseDTO parseado.
 *
 * No requiere token JWT porque el endpoint /rastrear es público —
 * el número de orden actúa como identificador suficientemente opaco.
 * Si en el futuro se protege, agregar el header Authorization aquí.
 *
 * @param {string} numeroPedido - Ej: "HERA-2025-001"
 * @returns {Promise<Object>} PedidoResponseDTO del backend
 * @throws {Error} Si la respuesta no es 200 o el fetch falla
 */
async function _fetchOrden(numeroPedido) {
  const res = await fetch(
    `${API_BASE}/api/pedidos/rastrear/${encodeURIComponent(numeroPedido)}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + (localStorage.getItem('hera_token') || ''),
},
    }
  );

  if (!res.ok) {
    if (res.status === 404) {
      throw new Error('No encontramos una orden con ese número. Verifica el enlace o contáctanos por WhatsApp.');
    }
    throw new Error('Ocurrió un error al consultar tu orden. Intenta de nuevo o contáctanos.');
  }

  return res.json();
}


/* ══════════════════════════════════════════════════════
   ESTADO DE CARGA Y ERROR
══════════════════════════════════════════════════════ */

/**
 * Muestra un estado de carga discreto mientras se consulta el backend.
 * Usa los mismos elementos del DOM que _renderOrder() llenará después.
 */
function _mostrarCargando() {
  const ids = ['heroOrderNum', 'heroFecha', 'heroTotal', 'heroMetodo',
               'datosContacto', 'datosDireccion', 'datosMetodo', 'datosEnvio'];
  ids.forEach(function (id) {
    const el = document.getElementById(id);
    if (el) el.textContent = 'Cargando...';
  });
}

/**
 * Muestra un mensaje de error en el hero cuando el fetch falla.
 * @param {string} mensaje - Texto del error a mostrar al usuario
 */
function _mostrarError(mensaje) {
  const heroOrderNum = document.getElementById('heroOrderNum');
  const heroFecha    = document.getElementById('heroFecha');
  if (heroOrderNum) heroOrderNum.textContent = 'Error';
  if (heroFecha)    heroFecha.textContent    = mensaje;

  // Oculta la sección de artículos para no mostrar contenido vacío
  const totalsEl = document.getElementById('orderTotals');
  if (totalsEl) totalsEl.style.display = 'none';
}


/* ══════════════════════════════════════════════════════
   RENDERIZADO — mapeo PedidoResponseDTO → DOM
   Mapeo de campos:
     backend              → DOM id
     numeroPedido         → heroOrderNum
     fechaPedido          → heroFecha
     total                → heroTotal
     metodoPago           → heroMetodo, datosMetodo
     nombreContacto       → datosContacto
     emailContacto        → datosContacto
     telefonoContacto     → datosContacto
     direccion.calle      → datosDireccion
     direccion.colonia    → datosDireccion
     direccion.ciudad     → datosDireccion
     direccion.estado     → datosDireccion
     direccion.cp         → datosDireccion
     metodoEnvio          → datosEnvio
     costoEnvio           → datosEnvio, totalEnvio
     subtotal             → totalSubtotal
     descuento            → totalDescuento
     total                → totalFinal
     items[].nombreProducto → order-item-name
     items[].variante       → order-item-name (sufijo)
     items[].precioUnitario → order-item-price
     items[].cantidad       → order-item-qty
══════════════════════════════════════════════════════ */

/**
 * Inyecta todos los datos del PedidoResponseDTO en el DOM.
 * @param {Object} order - PedidoResponseDTO recibido del backend
 */
function _renderOrder(order) {

  /* ── Hero meta ── */
  document.getElementById('heroOrderNum').textContent = order.numeroPedido || '—';
  document.getElementById('heroFecha').textContent    = _formatFecha(order.fechaPedido);
  document.getElementById('heroTotal').textContent    = _formatMXN(order.total);
  document.getElementById('heroMetodo').textContent   = _metodoTexto(order.metodoPago);

  /* ── Datos de contacto ── */
  document.getElementById('datosContacto').innerHTML =
    '<strong>' + (order.nombreContacto   || '—') + '</strong><br>' +
    (order.emailContacto    || '') + '<br>' +
    (order.telefonoContacto || '');

  /* ── Dirección de entrega ── */
  const dir = order.direccion || {};
  document.getElementById('datosDireccion').innerHTML =
    (dir.calle   ? dir.calle + '<br>' : '') +
    (dir.colonia ? dir.colonia + '<br>' : '') +
    (dir.ciudad  || '') +
    (dir.estado  ? ', ' + dir.estado : '') +
    (dir.cp      ? ' CP ' + dir.cp   : '');

  /* ── Método de pago ── */
  document.getElementById('datosMetodo').textContent = _metodoTexto(order.metodoPago);

  /* ── Bloque SPEI — solo visible si el método es transferencia ── */
  if (order.metodoPago === 'TRANSFERENCIA' || order.metodoPago === 'transfer') {
    const speiBlock   = document.getElementById('speiBlock');
    const speiOrderEl = document.getElementById('speiOrderNum');
    if (speiBlock)   speiBlock.style.display   = 'block';
    if (speiOrderEl) speiOrderEl.textContent   = order.numeroPedido || '—';
  }

  /* ── Envío ── */
  const costoEnvio = parseFloat(order.costoEnvio) || 0;
  document.getElementById('datosEnvio').textContent =
    _metodoEnvioTexto(order.metodoEnvio) +
    (costoEnvio > 0 ? ' — ' + _formatMXN(order.costoEnvio) : ' — Gratis');

  /* ── Lista de artículos ── */
  const items  = order.items || [];
  const listEl = document.getElementById('orderItemsList');

  if (items.length) {
    let html = '';
    items.forEach(function (it) {
      // Combina nombreProducto + variante para mostrar "Sauvage EDP 100 ml"
      const nombreCompleto = it.nombreProducto +
        (it.variante ? ' ' + it.variante : '');

      html +=
        '<div class="order-item reveal">' +
          '<div class="order-item-img">' +
            '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" ' +
            'stroke="rgba(15,15,15,.2)" stroke-width="1.5">' +
              '<rect x="3" y="3" width="18" height="18" rx="1"/>' +
              '<circle cx="8.5" cy="8.5" r="1.5"/>' +
              '<path d="m21 15-5-5L5 21"/>' +
            '</svg>' +
          '</div>' +
          '<div class="order-item-body">' +
            '<div class="order-item-name">'  + nombreCompleto + '</div>' +
            '<div class="order-item-meta">' +
              '<span class="order-item-price">' + _formatMXN(it.precioUnitario) + '</span>' +
              '<span class="order-item-qty">×' + (it.cantidad || 1) + '</span>' +
            '</div>' +
          '</div>' +
        '</div>';
    });
    listEl.innerHTML = html;
  } else {
    listEl.innerHTML =
      '<p style="font-family:var(--serif);font-size:16px;font-style:italic;' +
      'color:rgba(15,15,15,.4);padding:24px 0;">No hay artículos registrados.</p>';
  }

  /* ── Totales ── */
  const totalsEl = document.getElementById('orderTotals');
  totalsEl.style.display = 'flex';

  document.getElementById('totalSubtotal').textContent = _formatMXN(order.subtotal);

  const descuento = parseFloat(order.descuento) || 0;
  if (descuento > 0) {
    document.getElementById('rowDescuento').style.display  = 'flex';
    document.getElementById('totalDescuento').textContent  = '−' + _formatMXN(order.descuento);
  }

  document.getElementById('totalEnvio').textContent  =
    costoEnvio > 0 ? _formatMXN(order.costoEnvio) : 'Gratis';
  document.getElementById('totalFinal').textContent  = _formatMXN(order.total);
}


/* ══════════════════════════════════════════════════════
   HELPERS DE FORMATO
══════════════════════════════════════════════════════ */

/**
 * Formatea un BigDecimal del backend como precio en MXN.
 * @param {number|string|null} amount
 * @returns {string} Ej: "$2,490 MXN"
 */
function _formatMXN(amount) {
  const n = parseFloat(amount);
  if (isNaN(n)) return '—';
  return '$' + n.toLocaleString('es-MX', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }) + ' MXN';
}

/**
 * Formatea un LocalDateTime del backend a texto legible en español.
 * El backend devuelve ISO 8601: "2025-05-12T14:30:00"
 * @param {string|null} fechaISO
 * @returns {string} Ej: "12 de mayo de 2025"
 */
function _formatFecha(fechaISO) {
  if (!fechaISO) return '—';
  try {
    return new Date(fechaISO).toLocaleDateString('es-MX', {
      year:  'numeric',
      month: 'long',
      day:   'numeric',
    });
  } catch (e) {
    return fechaISO;
  }
}

/**
 * Convierte el código de método de pago del backend a texto legible.
 * Acepta tanto los valores del enum de Spring como los del frontend anterior.
 * @param {string} m
 * @returns {string}
 */
function _metodoTexto(m) {
  if (!m) return '—';
  const val = m.toUpperCase();
  if (val === 'TARJETA'      || val === 'CARD')     return 'Tarjeta de crédito / débito';
  if (val === 'PAYPAL')                              return 'PayPal';
  if (val === 'TRANSFERENCIA'|| val === 'TRANSFER')  return 'Transferencia SPEI';
  return m;
}

/**
 * Convierte el código de método de envío del backend a texto legible.
 * @param {string} m
 * @returns {string}
 */
function _metodoEnvioTexto(m) {
  if (!m) return '—';
  const val = m.toUpperCase();
  if (val === 'LOCAL')    return 'Entrega local (sábados)';
  if (val === 'NACIONAL') return 'Envío nacional';
  if (val === 'EXPRESS')  return 'Envío express';
  return m;
}

/**
 * Limpia el carrito de localStorage después de confirmar la orden.
 * El carrito del backend ya se procesó — no necesitamos mantenerlo localmente.
 */
function _limpiarCarritoLocal() {
  try {
    localStorage.removeItem('hera_cart');
    localStorage.removeItem('hera_last_order');
  } catch (e) {
    // localStorage puede no estar disponible — no es crítico
  }
}


/* ══════════════════════════════════════════════════════
   SCROLL REVEAL
══════════════════════════════════════════════════════ */

/**
 * Inicializa el IntersectionObserver para los elementos .reveal.
 * Se llama después de _renderOrder() para que los .order-item
 * dinámicos también queden observados.
 */
function _initScrollReveal() {
  function _makeObserver() {
    return new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) e.target.classList.add('visible');
        else                  e.target.classList.remove('visible');
      });
    }, { threshold: 0.12 });
  }

  const staticObs = _makeObserver();
  document.querySelectorAll('.reveal').forEach(function (el) {
    staticObs.observe(el);
  });

  const dynamicObs = _makeObserver();
  document.querySelectorAll('#orderItemsList .reveal').forEach(function (el) {
    if (el.getBoundingClientRect().top < window.innerHeight) {
      el.classList.add('visible');
    } else {
      dynamicObs.observe(el);
    }
  });
}
