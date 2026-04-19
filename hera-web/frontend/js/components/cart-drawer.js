/**
 * cart-drawer.js — HERA
 *
 * Descripción: Gestiona el drawer lateral del carrito de compras.
 *   Carga el fragmento HTML desde components/cart-drawer.html (o lo recibe
 *   inyectado), inicializa la apertura/cierre, renderiza ítems desde
 *   localStorage, actualiza totales y el indicador de envío gratuito.
 *
 * Exporta: initCartDrawer, openCart, closeCart, addItemToCart
 * Importado por: js/pages/catalogo.js y cualquier página con carrito
 */

import { getCart, saveCart }                       from '../utils/storage.js';
import { formatPriceMXN, normalizePriceInput,
         parsePriceMXN, buildCartId, formatVolLabel } from '../utils/formatter.js';

// ── Constantes ────────────────────────────────────────────────
const FREE_SHIPPING = 1500; // MXN — umbral para envío gratis

// ── Referencias DOM (pobladas en initCartDrawer) ──────────────
let cartBtn, cartDrawer, cartOverlay, cartClose;
let cartEmpty, cartFooter, cartItemsList;
let cartTotal, cartDrawerCount, cartBadge;
let shippingBar, shippingMsg;

/**
 * Inyecta el HTML del cart drawer en #cart-placeholder e inicializa toda su lógica.
 * Debe llamarse una sola vez desde el script de la página.
 * @returns {Promise<void>}
 */
async function initCartDrawer() {
  const placeholder = document.getElementById('cart-placeholder');
  if (placeholder) {
    // Ruta relativa al archivo JS para independencia del servidor
    const base = new URL('../..', import.meta.url).href;
    const res  = await fetch(base + '/components/cart-drawer.html');
    const html = await res.text();
    placeholder.innerHTML = html;
  }

  // Obtener referencias DOM después de inyectar el HTML
  cartBtn         = document.getElementById('cart-btn');
  cartDrawer      = document.getElementById('cart-drawer');
  cartOverlay     = document.getElementById('cart-overlay');
  cartClose       = document.getElementById('cart-close');
  cartEmpty       = document.getElementById('cart-empty');
  cartFooter      = document.getElementById('cart-footer');
  cartItemsList   = document.getElementById('cart-items-list');
  cartTotal       = document.getElementById('cart-total');
  cartDrawerCount = document.getElementById('cart-drawer-count');
  shippingBar     = document.getElementById('shipping-bar');
  shippingMsg     = document.getElementById('shipping-msg');
  cartBadge       = document.getElementById('cart-count');

  if (!cartDrawer) return;

  // Eventos de apertura y cierre
  if (cartBtn)     cartBtn.addEventListener('click', openCart);
  if (cartClose)   cartClose.addEventListener('click', closeCart);
  if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

  // Botones del footer del drawer
  const checkoutBtn  = document.getElementById('cart-checkout-btn');
  const continueBtn  = document.getElementById('cart-continue-btn');
  const emptyCta     = document.getElementById('cart-empty-cta');
  if (checkoutBtn) checkoutBtn.addEventListener('click', _goToCheckout);
  if (continueBtn) continueBtn.addEventListener('click', closeCart);
  if (emptyCta)    emptyCta.addEventListener('click', closeCart);

  // Cargar el estado persistido al iniciar la página
  _loadCartFromStorage();
}

// ── Apertura / cierre ─────────────────────────────────────────

/**
 * Abre el drawer del carrito bloqueando el scroll del body.
 */
function openCart() {
  cartDrawer.classList.add('open');
  cartOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

/**
 * Cierra el drawer del carrito restaurando el scroll del body.
 */
function closeCart() {
  cartDrawer.classList.remove('open');
  cartOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

// ── Agregar ítems ─────────────────────────────────────────────

/**
 * Agrega un producto al carrito o incrementa su cantidad si ya existe.
 * Normaliza el precio, construye el cartId, anima el badge y abre el drawer.
 * @param {string} id        - ID del producto
 * @param {string} brand     - Marca
 * @param {string} name      - Nombre del producto
 * @param {number|string} price - Precio (cualquier formato)
 * @param {string} vol       - Volumen/talla formateado (ej: "50 ml")
 * @param {string} [nivel]   - Nivel de disponibilidad: 'green' | 'yellow' | 'red'
 */
function addItemToCart(id, brand, name, price, vol, nivel = 'green') {
  const priceDisplay = normalizePriceInput(price);
  const nivelVal     = nivel || 'green';
  const volVal       = vol   || '';
  const nLabel       = { green:'En existencia', yellow:'Disp. limitada', red:'Pieza exclusiva' }[nivelVal] || 'En existencia';
  const volLine      = volVal ? `<div class="cart-item-vol">${volVal}</div>` : '';
  const cartId       = buildCartId(name, id.includes('-') ? id.split('-').pop() : '');

  const existing = cartItemsList.querySelector(`[data-cart-id="${cartId}"]`);
  if (existing) {
    // El producto ya está en el carrito: solo incrementa la cantidad
    const qEl = existing.querySelector('.qty-num');
    qEl.textContent = parseInt(qEl.textContent) + 1;
  } else {
    // Nuevo ítem: crear el elemento y añadirlo al tope de la lista
    const item = document.createElement('div');
    item.className     = 'cart-item';
    item.dataset.cartId = cartId;
    item.innerHTML =
      `<div class="cart-item-nivel-bar ${nivelVal}"><span class="cart-item-nivel-dot"></span>${nLabel}</div>` +
      `<div class="cart-item-body">` +
        `<div class="cart-item-img"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(249,249,249,0.3)" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg></div>` +
        `<div class="cart-item-info">` +
          `<div class="cart-item-brand">${brand}</div>` +
          `<div class="cart-item-name">${name}</div>` +
          volLine +
          `<div class="cart-item-price">${priceDisplay}</div>` +
          `<div class="cart-item-qty"><button class="qty-btn qty-minus">−</button><span class="qty-num">1</span><button class="qty-btn qty-plus">+</button></div>` +
        `</div>` +
        `<button class="cart-item-remove" title="Eliminar"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg></button>` +
      `</div>`;
    cartItemsList.insertBefore(item, cartItemsList.firstChild);
    _bindCartItem(item);
  }

  _updateCartTotals();
  _saveCartToStorage();

  // Feedback visual en el badge — estado dinámico, requiere JS
  if (cartBadge) {
    cartBadge.style.transform = 'scale(1.5)';
    setTimeout(() => { cartBadge.style.transform = 'scale(1)'; }, 200);
  }

  openCart();
}

// ── Persistencia ──────────────────────────────────────────────

/**
 * Serializa el estado actual del DOM del carrito y lo guarda en localStorage.
 * @private
 */
function _saveCartToStorage() {
  const items = [];
  cartItemsList.querySelectorAll('.cart-item').forEach((el) => {
    const volEl    = el.querySelector('.cart-item-vol');
    const nivelBar = el.querySelector('.cart-item-nivel-bar');
    const nivelClass = nivelBar
      ? (['green','yellow','red'].find((c) => nivelBar.classList.contains(c)) || 'green')
      : 'green';
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
  saveCart(items);
}

/**
 * Lee el carrito de localStorage y reconstruye el DOM.
 * @private
 */
function _loadCartFromStorage() {
  const items = getCart();
  cartItemsList.innerHTML = '';
  items.forEach((it) => {
    const priceDisplay = normalizePriceInput(it.price);
    const nivelVal     = it.nivel || 'green';
    const nLabel       = { green:'En existencia', yellow:'Disp. limitada', red:'Pieza exclusiva' }[nivelVal] || 'En existencia';
    const volLine      = it.vol ? `<div class="cart-item-vol">${it.vol}</div>` : '';
    const el = document.createElement('div');
    el.className     = 'cart-item';
    el.dataset.cartId = it.id;
    el.innerHTML =
      `<div class="cart-item-nivel-bar ${nivelVal}"><span class="cart-item-nivel-dot"></span>${nLabel}</div>` +
      `<div class="cart-item-body">` +
        `<div class="cart-item-img"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(249,249,249,0.3)" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg></div>` +
        `<div class="cart-item-info">` +
          `<div class="cart-item-brand">${it.brand}</div>` +
          `<div class="cart-item-name">${it.name}</div>` +
          volLine +
          `<div class="cart-item-price">${priceDisplay}</div>` +
          `<div class="cart-item-qty"><button class="qty-btn qty-minus">−</button><span class="qty-num">${it.qty || 1}</span><button class="qty-btn qty-plus">+</button></div>` +
        `</div>` +
        `<button class="cart-item-remove" title="Eliminar"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg></button>` +
      `</div>`;
    cartItemsList.appendChild(el);
    _bindCartItem(el);
  });
  _updateCartTotals();
}

// ── Eventos internos de cada ítem ─────────────────────────────

/**
 * Asocia los botones de cantidad y eliminar a un ítem del carrito.
 * @param {HTMLElement} item - Elemento .cart-item
 * @private
 */
function _bindCartItem(item) {
  item.querySelector('.qty-minus').addEventListener('click', () => {
    const qEl = item.querySelector('.qty-num');
    const q   = parseInt(qEl.textContent);
    if (q > 1) { qEl.textContent = q - 1; _updateCartTotals(); _saveCartToStorage(); }
  });
  item.querySelector('.qty-plus').addEventListener('click', () => {
    const qEl = item.querySelector('.qty-num');
    qEl.textContent = parseInt(qEl.textContent) + 1;
    _updateCartTotals(); _saveCartToStorage();
  });
  item.querySelector('.cart-item-remove').addEventListener('click', () => {
    item.remove(); _updateCartTotals(); _saveCartToStorage();
  });
}

// ── Totales y barra de envío ──────────────────────────────────

/**
 * Recalcula el total, actualiza el badge, el contador del header y la barra de envío.
 * @private
 */
function _updateCartTotals() {
  const items = cartItemsList.querySelectorAll('.cart-item');
  let total = 0;
  items.forEach((item) => {
    total += parsePriceMXN(item.querySelector('.cart-item-price').textContent)
           * parseInt(item.querySelector('.qty-num').textContent);
  });
  const count = Array.from(items).reduce((s, i) => s + parseInt(i.querySelector('.qty-num').textContent), 0);

  if (cartTotal)       cartTotal.textContent       = formatPriceMXN(total);
  if (cartBadge)       { cartBadge.textContent = count; cartBadge.style.display = count > 0 ? 'flex' : 'none'; }
  if (cartDrawerCount) cartDrawerCount.textContent = `(${count})`;

  // Barra de progreso de envío gratuito — estado calculado dinámicamente, requiere JS
  const pct = Math.min((total / FREE_SHIPPING) * 100, 100);
  if (shippingBar) shippingBar.style.width = pct + '%';
  if (shippingMsg) {
    if (total >= FREE_SHIPPING) {
      shippingMsg.innerHTML       = '🎉 <span class="cart-shipping-success">¡Tienes envío gratis!</span>';
      if (shippingBar) shippingBar.style.background = '#2e7d32';
    } else if (total > 0) {
      shippingMsg.innerHTML       = `Te faltan <span class="cart-shipping-amount">${formatPriceMXN(FREE_SHIPPING - total)}</span> para envío gratis`;
      if (shippingBar) shippingBar.style.background = 'var(--red)';
    } else {
      shippingMsg.innerHTML = '';
    }
  }

  if (cartEmpty)  cartEmpty.style.display  = count === 0 ? 'flex'  : 'none';
  if (cartFooter) cartFooter.style.display = count === 0 ? 'none'  : 'block';
}

// ── Checkout ──────────────────────────────────────────────────

/**
 * Persiste el carrito y redirige a la página de checkout.
 * @private
 */
function _goToCheckout() {
  _saveCartToStorage();
  window.location.href = '/pages/checkout.html';
}

export { initCartDrawer, openCart, closeCart, addItemToCart };
