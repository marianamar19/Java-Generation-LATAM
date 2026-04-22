/**
 * cart-drawer.js — HERA
 *
 * Descripción: Lógica completa del carrito lateral (cart drawer).
 *              Gestiona apertura/cierre, lectura y escritura en
 *              localStorage, renderizado de items, controles de
 *              cantidad, eliminación y cálculo de totales + envío.
 * Exporta: initCartDrawer, openCart, addItemToCart
 * Importado por: js/pages/404.js y todas las páginas del proyecto
 */

import { getCart, saveCart } from '../utils/storage.js';
import { formatPriceMXN, parseMXN, getNivelLabel } from '../utils/formatter.js';

/** Monto mínimo de compra para obtener envío gratis */
const FREE_SHIPPING = 1500;

/* Referencias a elementos del DOM — se asignan en initCartDrawer */
let cartDrawer, cartOverlay, cartClose,
    cartItemsList, cartEmpty, cartFooter,
    cartTotal, cartDrawerCount, cartBadge,
    shippingBar, shippingMsg;

/**
 * Inicializa el cart drawer: obtiene referencias al DOM,
 * enlaza eventos de apertura/cierre y carga el carrito desde localStorage.
 * Debe llamarse una vez que el DOM esté disponible.
 */
function initCartDrawer() {
  cartDrawer      = document.getElementById('cart-drawer');
  cartOverlay     = document.getElementById('cart-overlay');
  cartClose       = document.getElementById('cart-close');
  cartItemsList   = document.getElementById('cart-items-list');
  cartEmpty       = document.getElementById('cart-empty');
  cartFooter      = document.getElementById('cart-footer');
  cartTotal       = document.getElementById('cart-total');
  cartDrawerCount = document.getElementById('cart-drawer-count');
  cartBadge       = document.getElementById('cart-count');
  shippingBar     = document.getElementById('shipping-bar');
  shippingMsg     = document.getElementById('shipping-msg');

  if (!cartDrawer) return;

  // Eventos de apertura del drawer vía ícono del navbar
  const cartBtn = document.getElementById('cart-btn');
  if (cartBtn) cartBtn.addEventListener('click', openCart);
  cartClose.addEventListener('click', closeCart);
  cartOverlay.addEventListener('click', closeCart);

  // Botones del footer del drawer
  const cartCheckoutBtn = document.getElementById('cart-checkout-btn');
  const cartContinueBtn = document.getElementById('cart-continue-btn');
  const cartEmptyCta    = document.getElementById('cart-empty-cta');
  if (cartCheckoutBtn) cartCheckoutBtn.addEventListener('click', goToCheckout);
  if (cartContinueBtn) cartContinueBtn.addEventListener('click', closeCart);
  if (cartEmptyCta)    cartEmptyCta.addEventListener('click', closeCart);

  // Cargar carrito persistido en localStorage al iniciar la página
  loadCartFromStorage();

  // Exponer openCart para que fav-drawer.js pueda abrirlo tras agregar un ítem
  window._heraOpenCart = openCart;
}

/**
 * Abre el carrito lateral y bloquea el scroll del body.
 */
function openCart() {
  cartDrawer.classList.add('open');
  cartOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

/**
 * Cierra el carrito lateral y restaura el scroll del body.
 */
function closeCart() {
  cartDrawer.classList.remove('open');
  cartOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

/**
 * Redirige al checkout guardando el estado actual del carrito antes de navegar.
 * Se guarda primero para no perder ítems si el usuario vuelve atrás.
 */
function goToCheckout() {
  _saveCartToStorage();
  window.location.href = 'checkout.html';
}

/**
 * Recorre los ítems del DOM y los serializa en localStorage.
 * Se llama cada vez que cambia la cantidad o se elimina un ítem.
 */
function _saveCartToStorage() {
  const items = [];
  cartItemsList.querySelectorAll('.cart-item').forEach(function(el) {
    const volEl    = el.querySelector('.cart-item-vol');
    const nivelBar = el.querySelector('.cart-item-nivel-bar');
    const nivelClass = nivelBar
      ? (['green','yellow','red'].find(function(c){ return nivelBar.classList.contains(c); }) || 'green')
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
 * Lee el carrito desde localStorage e inyecta los ítems en el DOM.
 * Necesario para restaurar el estado del carrito al navegar entre páginas.
 */
function loadCartFromStorage() {
  const items = getCart();
  cartItemsList.innerHTML = '';
  if (items && items.length) {
    items.forEach(function(it) {
      const priceDisplay = formatPriceMXN(it.priceStr || it.price);
      const nivelVal  = it.nivel || 'green';
      const nLabel    = getNivelLabel(nivelVal);
      const volLine   = it.vol ? `<div class="cart-item-vol">${it.vol}</div>` : '';
      const el = document.createElement('div');
      el.className = 'cart-item';
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
  }
  updateCartTotals();
}

/**
 * Calcula totales, actualiza badge, barra de envío y visibilidad del footer.
 * Se llama cada vez que cambia la cantidad de un ítem o se agrega/elimina uno.
 */
function updateCartTotals() {
  const items = cartItemsList.querySelectorAll('.cart-item');
  let total = 0;
  items.forEach(function(item) {
    const price = parseMXN(item.querySelector('.cart-item-price').textContent);
    const qty   = parseInt(item.querySelector('.qty-num').textContent);
    total += price * qty;
  });
  const count = Array.from(items).reduce(function(s, i) {
    return s + parseInt(i.querySelector('.qty-num').textContent);
  }, 0);

  cartTotal.textContent         = formatPriceMXN(total);
  cartBadge.textContent         = count;
  cartBadge.style.display       = count > 0 ? 'flex' : 'none';
  cartDrawerCount.textContent   = `(${count})`;

  // Barra de progreso hacia envío gratis
  const pct = Math.min((total / FREE_SHIPPING) * 100, 100);
  shippingBar.style.width = pct + '%';
  if (total >= FREE_SHIPPING) {
    shippingMsg.innerHTML       = '🎉 <span class="cart-shipping-success">¡Tienes envío gratis!</span>';
    shippingBar.style.background = '#2e7d32';
  } else if (total > 0) {
    const remaining             = (FREE_SHIPPING - total).toLocaleString('es-MX');
    shippingMsg.innerHTML       = `Te faltan <span class="cart-shipping-amount">$${remaining} MXN</span> para envío gratis`;
    shippingBar.style.background = 'var(--red)';
  } else {
    shippingMsg.innerHTML       = '';
  }

  // Alternar entre estado vacío y footer con totales
  cartEmpty.style.display  = count === 0 ? 'flex' : 'none';
  cartFooter.style.display = count === 0 ? 'none' : 'block';
}

/**
 * Enlaza los controles de cantidad y eliminación de un ítem recién creado.
 * @param {HTMLElement} item - Elemento .cart-item recién insertado en el DOM
 */
function _bindCartItem(item) {
  item.querySelector('.qty-minus').addEventListener('click', function() {
    const qEl = item.querySelector('.qty-num');
    const q   = parseInt(qEl.textContent);
    if (q > 1) {
      qEl.textContent = q - 1;
      updateCartTotals();
      _saveCartToStorage();
    }
  });
  item.querySelector('.qty-plus').addEventListener('click', function() {
    const qEl = item.querySelector('.qty-num');
    qEl.textContent = parseInt(qEl.textContent) + 1;
    updateCartTotals();
    _saveCartToStorage();
  });
  item.querySelector('.cart-item-remove').addEventListener('click', function() {
    item.remove();
    updateCartTotals();
    _saveCartToStorage();
  });
}

/**
 * Agrega un producto al carrito (o incrementa su cantidad si ya existe).
 * Animates el badge y abre el drawer como confirmación visual.
 * @param {string} id     - ID único del producto
 * @param {string} brand  - Marca del producto
 * @param {string} name   - Nombre del producto
 * @param {string|number} price - Precio del producto
 * @param {string} vol    - Volumen o variante (puede ser vacío)
 * @param {string} nivel  - Nivel de disponibilidad: 'green' | 'yellow' | 'red'
 */
function addItemToCart(id, brand, name, price, vol, nivel) {
  const priceDisplay = formatPriceMXN(price);
  const nivelVal     = nivel || 'green';
  const nLabel       = getNivelLabel(nivelVal);
  const volLine      = vol ? `<div class="cart-item-vol">${vol}</div>` : '';
  const cartId       = 'cart-' + name.replace(/\s/g, '-').toLowerCase();
  const existing     = cartItemsList.querySelector(`[data-cart-id="${cartId}"]`);

  if (existing) {
    // Incrementar cantidad si el ítem ya está en el carrito
    const qEl = existing.querySelector('.qty-num');
    qEl.textContent = parseInt(qEl.textContent) + 1;
  } else {
    const item = document.createElement('div');
    item.className = 'cart-item';
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

  updateCartTotals();
  _saveCartToStorage();

  // Animación de rebote en el badge del navbar para confirmar la acción
  cartBadge.style.transform = 'scale(1.5)';
  setTimeout(function() { cartBadge.style.transform = 'scale(1)'; }, 200);

  openCart();
}

export { initCartDrawer, openCart, addItemToCart };
