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

import { getCart, setCart }            from '../utils/storage.js';
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
  _loadCartFromStorage();
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

/**
 * Agrega un producto al carrito o incrementa su cantidad si ya existe.
 * Persiste el estado, actualiza totales y abre el drawer.
 * @param {string}        id    - ID único del producto
 * @param {string}        brand - Marca del producto
 * @param {string}        name  - Nombre del producto
 * @param {string|number} price - Precio en cualquier formato
 * @param {string}        vol   - Presentación (volumen o talla)
 * @param {string}        nivel - Nivel de existencia: 'green' | 'yellow' | 'red'
 * @returns {void}
 */
function addItemToCart(id, brand, name, price, vol, nivel) {
  const priceDisplay = normalizePriceMXN(price);
  const nivelVal     = nivel || 'green';
  const volVal       = vol   || '';
  const nLabel       = { green: 'En existencia', yellow: 'Disp. limitada', red: 'Pieza exclusiva' }[nivelVal] || 'En existencia';
  const cartId       = 'cart-' + name.replace(/\s/g, '-').toLowerCase();

  const existing = cartItemsList.querySelector('[data-cart-id="' + cartId + '"]');

  if (existing) {
    // Si ya existe: solo sumar 1 a la cantidad
    const qEl = existing.querySelector('.qty-num');
    qEl.textContent = parseInt(qEl.textContent) + 1;
  } else {
    // Si no existe: crear el item y añadirlo al inicio
    const item = _buildCartItemEl({ id, brand, name, priceDisplay, volVal, nivelVal, nLabel, cartId, qty: 1 });
    cartItemsList.insertBefore(item, cartItemsList.firstChild);
    _bindCartItem(item);
  }

  _updateCartTotals();
  _saveCartToStorage();

  // Feedback visual en el badge — escala y vuelve al tamaño normal
  cartBadge.style.transform = 'scale(1.5)';
  setTimeout(function() { cartBadge.style.transform = 'scale(1)'; }, 200);

  openCart();
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
  const { brand, name, priceDisplay, volVal, nivelVal, nLabel, cartId, qty } = data;
  const volLine = volVal ? '<div class="cart-item-vol">' + volVal + '</div>' : '';

  const el          = document.createElement('div');
  el.className      = 'cart-item';
  el.dataset.cartId = cartId;
  el.innerHTML      =
    '<div class="cart-item-body">' +
      '<div class="cart-item-img">' +
        '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(249,249,249,0.3)" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>' +
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
  item.querySelector('.qty-minus').addEventListener('click', function() {
    const qEl = item.querySelector('.qty-num');
    const q   = parseInt(qEl.textContent);
    if (q > 1) {
      qEl.textContent = q - 1;
      _updateCartTotals();
      _saveCartToStorage();
    }
  });

  item.querySelector('.qty-plus').addEventListener('click', function() {
    const qEl = item.querySelector('.qty-num');
    qEl.textContent = parseInt(qEl.textContent) + 1;
    _updateCartTotals();
    _saveCartToStorage();
  });

  item.querySelector('.cart-item-remove').addEventListener('click', function() {
    item.remove();
    _updateCartTotals();
    _saveCartToStorage();
  });
}

/* ── Totales y barra de envío ────────────────────────────────── */

/**
 * Recalcula total, count, badge, barra de envío gratis y visibilidad del footer.
 * @returns {void}
 */
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
function _saveCartToStorage() {
  const items = [];
  cartItemsList.querySelectorAll('.cart-item').forEach(function(el) {
    // Leer nivel desde el modificador BEM del badge inline
    const nivelEl    = el.querySelector('.cart-item-nivel');
    const nivelClass = nivelEl
      ? (['green', 'yellow', 'red'].find(function(c) {
          return nivelEl.classList.contains('cart-item-nivel--' + c);
        }) || 'green')
      : 'green';
    const volEl = el.querySelector('.cart-item-vol');
    items.push({
      id:    el.dataset.cartId,
      brand: el.querySelector('.cart-item-brand').textContent,
      name:  el.querySelector('.cart-item-name').textContent,
      price: el.querySelector('.cart-item-price').textContent,
      vol:   volEl ? volEl.textContent : '',
      nivel: nivelClass,
      qty:   parseInt(el.querySelector('.qty-num').textContent),
    });
  });
  setCart(items);
}

/**
 * Lee los items de localStorage y reconstruye el DOM del carrito.
 * Llamado al cargar la página para restaurar el estado previo.
 * @returns {void}
 */
function _loadCartFromStorage() {
  const items = getCart();
  cartItemsList.innerHTML = '';

  if (items && items.length) {
    items.forEach(function(it) {
      const nivelVal     = it.nivel || 'green';
      const nLabel       = { green: 'En existencia', yellow: 'Disp. limitada', red: 'Pieza exclusiva' }[nivelVal] || 'En existencia';
      const priceDisplay = normalizePriceMXN(it.price);
      const cartId       = it.id;

      const el = _buildCartItemEl({
        brand: it.brand, name: it.name, priceDisplay,
        volVal: it.vol || '', nivelVal, nLabel, cartId, qty: it.qty || 1,
      });
      cartItemsList.appendChild(el);
      _bindCartItem(el);
    });
  }

  _updateCartTotals();
}

/* ── Checkout ────────────────────────────────────────────────── */

/**
 * Guarda el carrito y redirige a la página de checkout.
 * @returns {void}
 */
function _goToCheckout() {
  _saveCartToStorage();
  window.location.href = 'checkout.html';
}

export { loadCartDrawer, initCartDrawer, addItemToCart, openCart };
