/**
 * cart-drawer.js — HERA
 *
 * Descripción: Lógica completa del panel lateral de carrito.
 *              Maneja apertura/cierre, construcción de items DOM,
 *              control de cantidades, eliminación, cálculo de totales,
 *              barra de progreso hacia envío gratis y persistencia
 *              en localStorage. Delegación de eventos para items
 *              generados dinámicamente (bestsellers y novedades).
 * Exporta:     initCartDrawer, addItemToCart, openCart
 * Importado por: js/pages/index.js
 */

import { getCarrito, addToCart, updateCartItem, removeCartItem } from '../utils/api.js';
import { normalizePriceMXN, parseMXN } from '../utils/formatter.js';

/* Umbral para envío gratis (MXN) */
const FREE_SHIPPING = 1500;

/* Referencias DOM — se asignan en initCartDrawer */
let cartDrawer, cartOverlay, cartClose;
let cartItemsList, cartTotal, cartBadge, cartDrawerCount;
let cartEmpty, cartFooter;
let shippingBar, shippingMsg;

/**
 * Carga el fragmento HTML del cart drawer desde /components/cart-drawer.html,
 * lo inyecta en #cart-drawer-placeholder e inicializa toda su lógica.
 * Debe esperarse con await antes de initFavDrawer() porque fav-drawer
 * depende de addItemToCart y de que #cart-btn exista en el DOM.
 * @returns {Promise<void>}
 */
async function loadCartDrawer() {
  const placeholder = document.getElementById('cart-drawer-placeholder');
  if (!placeholder) return;
  const response = await fetch('/components/cart-drawer.html');
  const html     = await response.text();
  placeholder.innerHTML = html;
  initCartDrawer();
}

/**
 * Inicializa el cart drawer: captura referencias DOM, carga el
 * carrito persistido y enlaza todos los event listeners.
 * Llamado internamente por loadCartDrawer() después del fetch.
 * @returns {void}
 */
function initCartDrawer() {
  cartDrawer      = document.getElementById('cart-drawer');
  cartOverlay     = document.getElementById('cart-overlay');
  cartClose       = document.getElementById('cart-close');
  cartItemsList   = document.getElementById('cart-items-list');
  cartTotal       = document.getElementById('cart-total');
  cartBadge       = document.getElementById('cart-count');
  cartDrawerCount = document.getElementById('cart-drawer-count');
  cartEmpty       = document.getElementById('cart-empty');
  cartFooter      = document.getElementById('cart-footer');
  shippingBar     = document.getElementById('shipping-bar');
  shippingMsg     = document.getElementById('shipping-msg');

  if (!cartDrawer) return;

  // Botones de apertura y cierre
  document.getElementById('cart-btn').addEventListener('click', openCart);
  cartClose.addEventListener('click', closeCart);
  cartOverlay.addEventListener('click', closeCart);

  // Botones del footer del drawer
  const cartCheckoutBtn = document.getElementById('cart-checkout-btn');
  const cartContinueBtn = document.getElementById('cart-continue-btn');
  const cartEmptyCta    = document.getElementById('cart-empty-cta');

  if (cartCheckoutBtn) cartCheckoutBtn.addEventListener('click', _goToCheckout);
  if (cartContinueBtn) cartContinueBtn.addEventListener('click', closeCart);
  if (cartEmptyCta)    cartEmptyCta.addEventListener('click',    closeCart);

  // Cargar carrito persistido al arrancar la página
  _loadCartFromAPI();
}

/* ── Abrir / Cerrar ─────────────────────────────────────────── */

/**
 * Abre el panel lateral del carrito y bloquea el scroll del body.
 * @returns {void}
 */
function openCart() {
  cartDrawer.classList.add('open');
  cartOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

/**
 * Cierra el panel lateral del carrito y restaura el scroll.
 * @returns {void}
 */
function closeCart() {
  cartDrawer.classList.remove('open');
  cartOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

/* ── Agregar al carrito ─────────────────────────────────────── */

async function addItemToCart(varianteId) {
  try {
    await addToCart(varianteId, 1);
    await _loadCartFromAPI();
    cartBadge.style.transform = 'scale(1.5)';
    setTimeout(function() { cartBadge.style.transform = 'scale(1)'; }, 200);
    openCart();
  } catch (e) {
    console.error('Error agregando al carrito:', e);
  }
}

/* ── Construcción de items DOM ───────────────────────────────── */

/**
 * Construye y devuelve el elemento DOM de un item del carrito.
 * El indicador de nivel se muestra como badge inline (punto + etiqueta)
 * dentro del bloque de info, sobre la marca — igual que en checkout.
 * @param {Object} data - Datos del item
 * @returns {HTMLElement} div.cart-item listo para insertar
 */
function _buildCartItemEl(data) {
  const { brand, name, priceDisplay, volVal, nivelVal, nLabel, cartId, qty, img } = data;
  const volLine = volVal ? '<div class="cart-item-vol">' + volVal + '</div>' : '';

  const el          = document.createElement('div');
  el.className      = 'cart-item';
  el.dataset.cartId = cartId;
  el.innerHTML      =
    '<div class="cart-item-body">' +
      '<div class="cart-item-img">' +
        (img ? '<img src="' + img + '" alt="' + name + '">' : '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(249,249,249,0.3)" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>') +
      '</div>' +
      '<div class="cart-item-info">' +
        '<div class="cart-item-nivel cart-item-nivel--' + nivelVal + '">' +
          '<span class="cart-item-nivel-dot"></span>' +
          '<span class="cart-item-nivel-label">' + nLabel + '</span>' +
        '</div>' +
        '<div class="cart-item-brand">' + brand        + '</div>' +
        '<div class="cart-item-name">'  + name         + '</div>' +
        volLine +
        '<div class="cart-item-price">' + priceDisplay + '</div>' +
        '<div class="cart-item-qty">' +
          '<button class="qty-btn qty-minus">−</button>' +
          '<span class="qty-num">' + (qty || 1) + '</span>' +
          '<button class="qty-btn qty-plus">+</button>' +
        '</div>' +
      '</div>' +
      '<button class="cart-item-remove" title="Eliminar">' +
        '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>' +
      '</button>' +
    '</div>';
  return el;
}

/**
 * Enlaza los event listeners de cantidad (+/-) y eliminación a un item del carrito.
 * @param {HTMLElement} item - Elemento div.cart-item
 * @returns {void}
 */
function _bindCartItem(item) {
  item.querySelector('.qty-minus').addEventListener('click', async function() {
    const qEl    = item.querySelector('.qty-num');
    const q      = parseInt(qEl.textContent);
    const itemId = item.dataset.itemId;
    if (q > 1) {
      try {
        await updateCartItem(itemId, q - 1);  // PUT /api/carrito/items/{itemId}?cantidad=N
        qEl.textContent = q - 1;
        _updateCartTotals();
      } catch (e) {
        console.error('Error al reducir cantidad:', e);
      }
    }
  });

  item.querySelector('.qty-plus').addEventListener('click', async function() {
    const qEl    = item.querySelector('.qty-num');
    const q      = parseInt(qEl.textContent);
    const itemId = item.dataset.itemId;
    try {
      await updateCartItem(itemId, q + 1);    // PUT /api/carrito/items/{itemId}?cantidad=N
      qEl.textContent = q + 1;
      _updateCartTotals();
    } catch (e) {
      console.error('Error al aumentar cantidad:', e);
    }
  });

  item.querySelector('.cart-item-remove').addEventListener('click', async function() {
    const itemId = item.dataset.itemId;
    try {
      await removeCartItem(itemId);           // DELETE /api/carrito/items/{itemId}
      item.remove();
      _updateCartTotals();
    } catch (e) {
      console.error('Error al eliminar item:', e);
    }
  });
}

/* ── Totales y barra de envío ────────────────────────────────── */

function _updateCartTotals() {
  const items = cartItemsList.querySelectorAll('.cart-item');
  let total   = 0;
  let count   = 0;

  items.forEach(function(item) {
    const price = parseMXN(item.querySelector('.cart-item-price').textContent);
    const qty   = parseInt(item.querySelector('.qty-num').textContent);
    total += price * qty;
    count += qty;
  });

  cartTotal.textContent       = '$' + total.toLocaleString('es-MX') + ' MXN';
  cartBadge.textContent       = count;
  cartBadge.style.display     = count > 0 ? 'flex' : 'none';
  cartDrawerCount.textContent = '(' + count + ')';

  // Barra de progreso hacia envío gratis
  const pct = Math.min((total / FREE_SHIPPING) * 100, 100);
  shippingBar.style.width = pct + '%';

  if (total >= FREE_SHIPPING) {
    shippingMsg.innerHTML        = '🎉 <span class="cart-shipping-success">¡Tienes envío gratis!</span>';
    shippingBar.style.background = '#2e7d32';
  } else if (total > 0) {
    const faltante = (FREE_SHIPPING - total).toLocaleString('es-MX');
    shippingMsg.innerHTML        = 'Te faltan <span class="cart-shipping-amount">$' + faltante + ' MXN</span> para envío gratis';
    shippingBar.style.background = 'var(--red)';
  } else {
    shippingMsg.innerHTML = '';
  }

  // Alternar entre estado vacío y footer con totales
  cartEmpty.style.display  = count === 0 ? 'flex'  : 'none';
  cartFooter.style.display = count === 0 ? 'none'  : 'block';
}

/* ── Persistencia ────────────────────────────────────────────── */

/**
 * Lee el DOM del carrito y persiste los items en localStorage.
 * Lee el nivel desde la clase modificadora del badge (.cart-item-nivel--green/yellow/red).
 * @returns {void}
 */

// Carrito autenticado — backend
async function _loadCartFromAPI() {
  try {
    const carrito = await getCarrito();
    cartItemsList.innerHTML = '';
    if (carrito.items && carrito.items.length) {
      carrito.items.forEach(function(it) {
        const nivelVal     = it.nivelDisponibilidad || 'green';
        const nLabel       = { green: 'En existencia', yellow: 'Disp. limitada', red: 'Pieza exclusiva' }[nivelVal] || 'En existencia';
        const priceDisplay = normalizePriceMXN(it.precioUnitario);
        const el = _buildCartItemEl({
          brand: it.marca, name: it.nombre, priceDisplay,
          volVal: it.variante ? (/^\d+$/.test(String(it.variante)) ? it.variante + ' ml' : it.variante) : '',
          nivelVal, nLabel, cartId: it.id, qty: it.cantidad || 1,
          img: it.imagen || ''
        });
        el.dataset.itemId = it.id;
        cartItemsList.appendChild(el);
        _bindCartItem(el);
      });
    }
    _updateCartTotals();
  } catch (e) {
    console.error('Error cargando carrito:', e);
  }
}
/* ── Checkout ────────────────────────────────────────────────── */

/**
 * Guarda el carrito y redirige a la página de checkout.
 * @returns {void}
 */
function _goToCheckout() {
  window.location.href = '/pages/checkout.html';
}

export { loadCartDrawer, initCartDrawer, addItemToCart, openCart };
