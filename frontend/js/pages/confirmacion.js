/**
 * confirmacion.js — HERA
 *
 * Descripción: Lógica exclusiva de la página de confirmación de pedido.
 *              Lee la orden desde localStorage (hera_last_order), redirige
 *              a index.html si no existe, renderiza todos los datos del
 *              pedido en el DOM e inicializa el scroll reveal.
 *
 * Exporta:     (ninguno — script de página, entry point único)
 * Importado por: pages/confirmacion.html vía <script type="module">
 */

import { loadNavbar }    from '../components/navbar.js';
import { loadFooter }    from '../components/footer.js';
import { initCartDrawer} from '../components/cart-drawer.js';
import { initFavDrawer } from '../components/fav-drawer.js';
import { parseMXN }      from '../utils/formatter.js';


/* ══════════════════════════════════════════════════════
   INICIALIZACIÓN ASÍNCRONA
   Orden obligatorio: loadNavbar (await) → loadFooter →
   initCartDrawer → initFavDrawer → lógica de página.
══════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', async function () {

  /* ── 1. Guard: redirigir si no hay orden registrada ── */
  const order = _readOrder();
  if (!order) {
    // No hay datos de compra — el usuario llegó directamente a esta URL
    window.location.href = 'index.html';
    return;
  }

  /* ── 2. Navbar: SIEMPRE await antes de cualquier componente
          que dependa de #cart-btn, #fav-toggle, #search-btn, etc. ── */
  await loadNavbar();

  /* ── 3. Footer: no tiene dependencias, no requiere await ── */
  loadFooter();

  /* ── 4. Cart drawer: inicia tras el navbar para que #cart-btn exista ── */
  initCartDrawer();

  /* ── 5. Fav drawer: inicia tras el cart drawer (depende de addItemToCart) ── */
  initFavDrawer();

  /* ── 6. Mensaje de carrito vacío personalizado para esta página
          El carrito se vacía en checkout; este texto es exclusivo
          de confirmacion.html y sobreescribe el genérico del componente ── */
  const cartEmptyEl = document.getElementById('cart-empty');
  if (cartEmptyEl) {
    const cartEmptyP = cartEmptyEl.querySelector('p');
    if (cartEmptyP) {
      cartEmptyP.innerHTML = 'Ya realizaste tu compra.<br>¡Gracias por elegir HERA!';
    }
  }

  /* ── 7. Lógica exclusiva de la página ── */
  _renderOrder(order);
  _initScrollReveal();
});


/* ══════════════════════════════════════════════════════
   LECTURA DE ORDEN
══════════════════════════════════════════════════════ */

/**
 * Lee y parsea la orden guardada en localStorage por checkout.js.
 * @returns {Object|null} Objeto de orden o null si no existe o está corrupto
 */
function _readOrder() {
  try {
    return JSON.parse(localStorage.getItem('hera_last_order') || 'null');
  } catch (e) {
    return null;
  }
}


/* ══════════════════════════════════════════════════════
   HELPERS DE FORMATO
══════════════════════════════════════════════════════ */

/**
 * Convierte el código interno del método de pago a texto legible en español.
 * @param {string} m - Código de método: 'card' | 'paypal' | 'transfer'
 * @returns {string} Nombre legible del método de pago
 */
function _metodoTexto(m) {
  if (m === 'card')     return 'Tarjeta de crédito / débito';
  if (m === 'paypal')   return 'PayPal';
  if (m === 'transfer') return 'Transferencia SPEI';
  return m || '—';
}


/* ══════════════════════════════════════════════════════
   RENDERIZADO DINÁMICO DE ORDEN
   Llena todos los placeholders del DOM con los datos
   de la orden leída desde localStorage.
══════════════════════════════════════════════════════ */

/**
 * Inyecta los datos de la orden en los elementos del DOM.
 * Cubre: hero meta, datos de contacto, dirección, método de pago,
 * bloque SPEI condicional, envío, lista de artículos y totales.
 * @param {Object} order - Objeto de orden guardado por checkout.js
 * @returns {void}
 */
function _renderOrder(order) {

  /* ── Hero meta ── */
  document.getElementById('heroOrderNum').textContent = order.orderNum || '—';
  document.getElementById('heroFecha').textContent    = order.fecha   || '—';
  document.getElementById('heroTotal').textContent    = order.total   || '—';
  document.getElementById('heroMetodo').textContent   = _metodoTexto(order.metodo);

  /* ── Datos de contacto ── */
  document.getElementById('datosContacto').innerHTML =
    '<strong>' + (order.nombre   || '—') + '</strong><br>' +
    (order.email    || '') + '<br>' +
    (order.telefono || '');

  /* ── Dirección de entrega ── */
  const dir = order.direccion || {};
  document.getElementById('datosDireccion').innerHTML =
    (dir.calle  || '') + '<br>' +
    (dir.ciudad || '') +
    (dir.estado ? ', ' + dir.estado : '') +
    (dir.cp     ? ' CP ' + dir.cp   : '');

  /* ── Método de pago ── */
  document.getElementById('datosMetodo').textContent = _metodoTexto(order.metodo);

  /* ── Bloque SPEI — solo visible si el método es transferencia ── */
  if (order.metodo === 'transfer') {
    document.getElementById('speiBlock').style.display  = 'block';
    document.getElementById('speiOrderNum').textContent = order.orderNum || '—';
  }

  /* ── Envío ── */
  document.getElementById('datosEnvio').textContent = order.envio || 'Gratis';

  /* ── Lista de artículos — construida dinámicamente ── */
  const items  = order.items || [];
  const listEl = document.getElementById('orderItemsList');

  if (items.length) {
    let html = '';
    items.forEach(function (it) {
      html +=
        '<div class="order-item reveal">' +
          '<div class="order-item-img">' +
            '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(15,15,15,.2)" stroke-width="1.5">' +
              '<rect x="3" y="3" width="18" height="18" rx="1"/>' +
              '<circle cx="8.5" cy="8.5" r="1.5"/>' +
              '<path d="m21 15-5-5L5 21"/>' +
            '</svg>' +
          '</div>' +
          '<div class="order-item-body">' +
            '<div class="order-item-brand">' + (it.brand || '') + '</div>' +
            '<div class="order-item-name">'  + (it.name  || '') + '</div>' +
            '<div class="order-item-meta">' +
              '<span class="order-item-price">' + (it.price || '') + '</span>' +
              '<span class="order-item-qty">×'  + (it.qty  || 1)  + '</span>' +
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

  /* ── Totales — JS activa la visibilidad del bloque ── */
  const totalsEl = document.getElementById('orderTotals');
  totalsEl.style.display = 'flex';

  // Subtotal: suma precios × cantidades de cada artículo
  let subtotal = 0;
  items.forEach(function (it) {
    subtotal += parseMXN(it.price) * (it.qty || 1);
  });
  document.getElementById('totalSubtotal').textContent =
    '$' + subtotal.toLocaleString('es-MX') + ' MXN';

  // Descuento — solo visible si la orden lo incluye
  const descuentoNum = order.descuento
    ? parseInt(String(order.descuento).replace(/[^0-9]/g, '')) || 0
    : 0;
  if (descuentoNum > 0) {
    document.getElementById('rowDescuento').style.display  = 'flex';
    document.getElementById('totalDescuento').textContent  = '−' + order.descuento;
  }

  document.getElementById('totalEnvio').textContent = order.envio || 'Gratis';
  document.getElementById('totalFinal').textContent = order.total || '—';
}


/* ══════════════════════════════════════════════════════
   SCROLL REVEAL — IntersectionObserver
   Design System v4: replay cada vez que el elemento
   entra o sale del viewport.
══════════════════════════════════════════════════════ */

/**
 * Inicializa el IntersectionObserver para animar los elementos .reveal.
 * Se llama en dos fases:
 *   1. Elementos estáticos presentes en el DOM desde el inicio.
 *   2. Elementos .reveal inyectados dinámicamente por _renderOrder()
 *      (los .order-item dentro de #orderItemsList).
 * @returns {void}
 */
function _initScrollReveal() {

  /* Observer reutilizable — activa/desactiva .visible al entrar/salir del viewport */
  function _makeObserver() {
    return new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) e.target.classList.add('visible');
        else                  e.target.classList.remove('visible');
      });
    }, { threshold: 0.12 });
  }

  /* Fase 1 — elementos estáticos del HTML */
  const staticObs = _makeObserver();
  document.querySelectorAll('.reveal').forEach(function (el) {
    staticObs.observe(el);
  });

  /* Fase 2 — elementos .reveal generados dinámicamente por _renderOrder()
     Si ya están en el viewport se activan directamente; si no, se observan */
  const dynamicObs = _makeObserver();
  document.querySelectorAll('#orderItemsList .reveal').forEach(function (el) {
    if (el.getBoundingClientRect().top < window.innerHeight) {
      // El elemento ya es visible sin scroll — activar inmediatamente
      el.classList.add('visible');
    } else {
      dynamicObs.observe(el);
    }
  });
}
