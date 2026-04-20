/**
 * cart-drawer.js — HERA
 *
 * Descripción: Componente del carrito lateral (drawer). Gestiona apertura,
 *              cierre, carga desde localStorage, renderizado de ítems,
 *              controles de cantidad, eliminación y cálculo de totales.
 *              También expone addItemToCart para que otros módulos puedan
 *              agregar productos al carrito.
 * Exporta: initCartDrawer, addItemToCart
 * Importado por: js/pages/*.js, js/components/fav-drawer.js
 */

import { getCart, saveCart } from '../utils/storage.js';
import { formatMXN, parseMXN } from '../utils/formatter.js';

/* ── Referencias DOM — se resuelven al llamar initCartDrawer ── */
let cartDrawer, cartOverlay, cartClose, cartEmpty,
    cartFooter, cartItemsList, cartTotal,
    cartDrawerCount, cartBadge;

/**
 * Inicializa el carrito lateral: bind de eventos y carga inicial.
 * Debe llamarse una vez que el DOM esté listo.
 */
function initCartDrawer() {
  cartDrawer      = document.getElementById('cart-drawer');
  cartOverlay     = document.getElementById('cart-overlay');
  cartClose       = document.getElementById('cart-close');
  cartEmpty       = document.getElementById('cart-empty');
  cartFooter      = document.getElementById('cart-footer');
  cartItemsList   = document.getElementById('cart-items-list');
  cartTotal       = document.getElementById('cart-total');
  cartDrawerCount = document.getElementById('cart-drawer-count');
  cartBadge       = document.getElementById('cart-count');

  const cartBtn       = document.getElementById('cart-btn');
  const cartCheckout  = document.getElementById('cart-checkout-btn');
  const cartContinue  = document.getElementById('cart-continue-btn');

  cartBtn?.addEventListener('click', openCart);
  cartClose?.addEventListener('click', closeCart);
  cartOverlay?.addEventListener('click', closeCart);
  cartCheckout?.addEventListener('click', goToCheckout);
  cartContinue?.addEventListener('click', closeCart);

  // Carga el estado persistido al iniciar la página
  loadCartFromStorage();
}

/**
 * Abre el panel lateral del carrito y bloquea el scroll del body.
 */
function openCart() {
  cartDrawer?.classList.add('open');
  cartOverlay?.classList.add('open');
  document.body.style.overflow = 'hidden';
}

/**
 * Cierra el panel lateral del carrito y restaura el scroll del body.
 */
function closeCart() {
  cartDrawer?.classList.remove('open');
  cartOverlay?.classList.remove('open');
  document.body.style.overflow = '';
}

/**
 * Navega al checkout tras persistir el estado del carrito.
 */
function goToCheckout() {
  _saveCartToStorage();
  window.location.href = 'checkout.html';
}

/**
 * Construye y agrega un ítem al carrito, o incrementa su cantidad si ya existe.
 * Abre el drawer automáticamente para dar feedback visual.
 * @param {string} id    - Identificador único del producto
 * @param {string} brand - Nombre de la marca
 * @param {string} name  - Nombre del producto
 * @param {string|number} price - Precio (string MXN o número entero)
 * @param {string} vol   - Volumen / presentación (ej: "100ml")
 * @param {string} nivel - Nivel de disponibilidad: 'green' | 'yellow' | 'red'
 */
function addItemToCart(id, brand, name, price, vol, nivel) {
  const priceDisplay = formatMXN(price);
  const nivelVal     = nivel || 'green';
  const volVal       = vol   || '';
  const nLabel       = { green: 'En existencia', yellow: 'Disp. limitada', red: 'Pieza exclusiva' }[nivelVal] || 'En existencia';
  const volLine      = volVal ? `<div class="cart-item-vol">${volVal}</div>` : '';
  const cartId       = 'cart-' + name.replace(/\s/g, '-').toLowerCase();

  // Si el ítem ya existe en el carrito, solo incrementa la cantidad
  const existing = cartItemsList?.querySelector(`[data-cart-id="${cartId}"]`);
  if (existing) {
    const qEl = existing.querySelector('.qty-num');
    qEl.textContent = parseInt(qEl.textContent) + 1;
  } else {
    const item = document.createElement('div');
    item.className    = 'cart-item';
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
    cartItemsList?.insertBefore(item, cartItemsList.firstChild);
    _bindCartItem(item);
  }

  updateCartTotals();
  _saveCartToStorage();

  // Feedback visual en el badge — animación de pulso
  if (cartBadge) {
    cartBadge.style.transform = 'scale(1.5)';
    setTimeout(() => { cartBadge.style.transform = 'scale(1)'; }, 200);
  }
  openCart();
}

/**
 * Lee el carrito desde localStorage y renderiza todos los ítems.
 * Llamado al inicializar el componente para restaurar el estado persistido.
 */
function loadCartFromStorage() {
  const items = getCart();
  if (!cartItemsList) return;
  cartItemsList.innerHTML = '';
  items.forEach((it) => {
    const priceDisplay = formatMXN(it.priceStr || it.price);
    const nivelVal     = it.nivel || 'green';
    const nLabel       = { green: 'En existencia', yellow: 'Disp. limitada', red: 'Pieza exclusiva' }[nivelVal] || 'En existencia';
    const volLine      = it.vol ? `<div class="cart-item-vol">${it.vol}</div>` : '';
    const el = document.createElement('div');
    el.className    = 'cart-item';
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
  updateCartTotals();
}

/**
 * Recalcula el total y el badge del carrito basándose en los ítems del DOM.
 * Sincroniza el badge y el header del drawer con la cantidad real.
 */
function updateCartTotals() {
  if (!cartItemsList) return;
  const items = cartItemsList.querySelectorAll('.cart-item');
  let total = 0;
  items.forEach((item) => {
    total += parseMXN(item.querySelector('.cart-item-price')?.textContent) *
             parseInt(item.querySelector('.qty-num')?.textContent || 1);
  });
  const count = Array.from(items).reduce((s, i) => s + parseInt(i.querySelector('.qty-num')?.textContent || 1), 0);

  if (cartTotal)       cartTotal.textContent       = formatMXN(total);
  if (cartBadge)       { cartBadge.textContent = count; cartBadge.style.display = count > 0 ? 'flex' : 'none'; }
  if (cartDrawerCount) cartDrawerCount.textContent  = `(${count})`;
  if (cartEmpty)       cartEmpty.style.display       = count === 0 ? 'flex' : 'none';
  if (cartFooter)      cartFooter.style.display      = count === 0 ? 'none' : 'block';
}

/**
 * Serializa el estado actual del DOM del carrito y lo persiste en localStorage.
 * Llamada después de cada operación (añadir, quitar, cambiar cantidad).
 */
function _saveCartToStorage() {
  if (!cartItemsList) return;
  const items = [];
  cartItemsList.querySelectorAll('.cart-item').forEach((el) => {
    const nivelBar   = el.querySelector('.cart-item-nivel-bar');
    const nivelClass = nivelBar ? (['green','yellow','red'].find((c) => nivelBar.classList.contains(c)) || 'green') : 'green';
    items.push({
      id:    el.dataset.cartId,
      brand: el.querySelector('.cart-item-brand')?.textContent,
      name:  el.querySelector('.cart-item-name')?.textContent,
      price: el.querySelector('.cart-item-price')?.textContent,
      vol:   el.querySelector('.cart-item-vol')?.textContent || '',
      nivel: nivelClass,
      qty:   parseInt(el.querySelector('.qty-num')?.textContent || 1)
    });
  });
  saveCart(items);
}

/**
 * Vincula los eventos de cantidad (+/-) y eliminación a un ítem del DOM.
 * Debe llamarse cada vez que se inserta un nuevo ítem en el carrito.
 * @param {HTMLElement} item - Elemento DOM .cart-item
 */
function _bindCartItem(item) {
  item.querySelector('.qty-minus')?.addEventListener('click', () => {
    const qEl = item.querySelector('.qty-num');
    const q   = parseInt(qEl.textContent);
    if (q > 1) { qEl.textContent = q - 1; updateCartTotals(); _saveCartToStorage(); }
  });
  item.querySelector('.qty-plus')?.addEventListener('click', () => {
    const qEl = item.querySelector('.qty-num');
    qEl.textContent = parseInt(qEl.textContent) + 1;
    updateCartTotals();
    _saveCartToStorage();
  });
  item.querySelector('.cart-item-remove')?.addEventListener('click', () => {
    item.remove();
    updateCartTotals();
    _saveCartToStorage();
  });
}

export { initCartDrawer, addItemToCart, openCart, closeCart, updateCartTotals };
