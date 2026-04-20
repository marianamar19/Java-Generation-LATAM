/**
 * cart-drawer.js — HERA Component
 * 
 * Descripción: Lógica del carrito lateral (drawer). Maneja apertura/cierre,
 * renderizado de items, actualización de cantidades y persistencia.
 * Exporta: initCartDrawer, openCart, closeCart, addToCart, updateCartTotals
 * Importado por: todas las páginas
 */

import { getCart, setCart } from '../utils/storage.js';
import { formatMXN, parseMXN } from '../utils/formatter.js';

// Constantes
const FREE_SHIPPING_THRESHOLD = 1500;

// Referencias DOM
let cartDrawer = null;
let cartOverlay = null;
let cartItemsList = null;
let cartEmpty = null;
let cartFooter = null;
let cartTotal = null;
let cartDrawerCount = null;
let shippingBar = null;
let shippingMsg = null;
let cartBadge = null;

/**
 * Actualiza el badge del carrito en el navbar.
 */
function updateCartBadge() {
  if (!cartBadge) {
    cartBadge = document.getElementById('cart-count');
  }
  if (!cartBadge) return;
  
  const cart = getCart();
  const count = cart.reduce((total, item) => total + (item.qty || 1), 0);
  cartBadge.textContent = count;
  cartBadge.style.display = count > 0 ? 'flex' : 'none';
}

/**
 * Guarda el estado actual del carrito en localStorage.
 */
function saveCartToStorage() {
  const items = [];
  if (!cartItemsList) return;
  
  cartItemsList.querySelectorAll('.cart-item').forEach((el) => {
    const volEl = el.querySelector('.cart-item-vol');
    const nivelBar = el.querySelector('.cart-item-nivel-bar');
    let nivelClass = 'green';
    if (nivelBar) {
      if (nivelBar.classList.contains('green')) nivelClass = 'green';
      else if (nivelBar.classList.contains('yellow')) nivelClass = 'yellow';
      else if (nivelBar.classList.contains('red')) nivelClass = 'red';
    }
    
    items.push({
      id: el.dataset.cartId,
      brand: el.querySelector('.cart-item-brand')?.textContent || '',
      name: el.querySelector('.cart-item-name')?.textContent || '',
      price: el.querySelector('.cart-item-price')?.textContent || '',
      vol: volEl ? volEl.textContent : '',
      nivel: nivelClass,
      qty: parseInt(el.querySelector('.qty-num')?.textContent || '1')
    });
  });
  
  setCart(items);
  updateCartBadge();
}

/**
 * Calcula y actualiza los totales del carrito (subtotal, envío, contador).
 */
function updateCartTotals() {
  if (!cartItemsList) return;
  
  const items = cartItemsList.querySelectorAll('.cart-item');
  let total = 0;
  let itemCount = 0;
  
  items.forEach((item) => {
    const price = parseMXN(item.querySelector('.cart-item-price')?.textContent || '0');
    const qty = parseInt(item.querySelector('.qty-num')?.textContent || '1');
    total += price * qty;
    itemCount += qty;
  });
  
  // Actualizar UI
  if (cartTotal) {
    cartTotal.textContent = formatMXN(total);
  }
  
  if (cartDrawerCount) {
    cartDrawerCount.textContent = `(${itemCount})`;
  }
  
  // Actualizar barra de envío gratis
  if (shippingBar && shippingMsg) {
    const pct = Math.min((total / FREE_SHIPPING_THRESHOLD) * 100, 100);
    shippingBar.style.width = `${pct}%`;
    
    if (total >= FREE_SHIPPING_THRESHOLD) {
      shippingMsg.innerHTML = '🎉 <span class="cart-shipping-success">¡Tienes envío gratis!</span>';
      shippingBar.style.background = '#2e7d32';
    } else if (total > 0) {
      const missing = FREE_SHIPPING_THRESHOLD - total;
      shippingMsg.innerHTML = `Te faltan <span class="cart-shipping-amount">${formatMXN(missing)}</span> para envío gratis`;
      shippingBar.style.background = 'var(--red)';
    } else {
      shippingMsg.innerHTML = '';
    }
  }
  
  // Mostrar/ocultar estados vacío y footer
  const isEmpty = itemCount === 0;
  if (cartEmpty) cartEmpty.style.display = isEmpty ? 'flex' : 'none';
  if (cartFooter) cartFooter.style.display = isEmpty ? 'none' : 'block';
}

/**
 * Vincula event listeners a un item del carrito.
 * @param {HTMLElement} item - Elemento del item
 */
function bindCartItemEvents(item) {
  const minusBtn = item.querySelector('.qty-minus');
  const plusBtn = item.querySelector('.qty-plus');
  const removeBtn = item.querySelector('.cart-item-remove');
  const qtyEl = item.querySelector('.qty-num');
  
  if (minusBtn) {
    minusBtn.addEventListener('click', () => {
      let qty = parseInt(qtyEl.textContent);
      if (qty > 1) {
        qtyEl.textContent = qty - 1;
        updateCartTotals();
        saveCartToStorage();
      }
    });
  }
  
  if (plusBtn) {
    plusBtn.addEventListener('click', () => {
      let qty = parseInt(qtyEl.textContent);
      qtyEl.textContent = qty + 1;
      updateCartTotals();
      saveCartToStorage();
    });
  }
  
  if (removeBtn) {
    removeBtn.addEventListener('click', () => {
      item.remove();
      updateCartTotals();
      saveCartToStorage();
    });
  }
}

/**
 * Crea un elemento DOM para un item del carrito.
 * @param {Object} item - Item del carrito
 * @returns {HTMLElement}
 */
function createCartItemElement(item) {
  const priceDisplay = item.priceStr || item.price;
  const nivelVal = item.nivel || 'green';
  const nivelLabel = {
    green: 'En existencia',
    yellow: 'Disp. limitada',
    red: 'Pieza exclusiva'
  }[nivelVal] || 'En existencia';
  const volLine = item.vol ? `<div class="cart-item-vol">${item.vol}</div>` : '';
  
  const el = document.createElement('div');
  el.className = 'cart-item';
  el.dataset.cartId = item.id || `cart-${item.name.replace(/\s/g, '-').toLowerCase()}`;
  el.innerHTML = `
    <div class="cart-item-nivel-bar ${nivelVal}">
      <span class="cart-item-nivel-dot"></span>${nivelLabel}
    </div>
    <div class="cart-item-body">
      <div class="cart-item-img">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(249,249,249,0.3)" stroke-width="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <path d="m21 15-5-5L5 21"/>
        </svg>
      </div>
      <div class="cart-item-info">
        <div class="cart-item-brand">${escapeHtml(item.brand)}</div>
        <div class="cart-item-name">${escapeHtml(item.name)}</div>
        ${volLine}
        <div class="cart-item-price">${priceDisplay}</div>
        <div class="cart-item-qty">
          <button class="qty-btn qty-minus">−</button>
          <span class="qty-num">${item.qty || 1}</span>
          <button class="qty-btn qty-plus">+</button>
        </div>
      </div>
      <button class="cart-item-remove" title="Eliminar">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      </button>
    </div>
  `;
  
  return el;
}

/**
 * Escapa caracteres HTML para prevenir XSS.
 * @param {string} str - String a escapar
 * @returns {string}
 */
function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Carga el carrito desde localStorage y renderiza en el drawer.
 */
function loadCart() {
  if (!cartItemsList) return;
  
  const cart = getCart();
  cartItemsList.innerHTML = '';
  
  if (cart && cart.length) {
    cart.forEach((item) => {
      const el = createCartItemElement(item);
      cartItemsList.appendChild(el);
      bindCartItemEvents(el);
    });
  }
  
  updateCartTotals();
}

/**
 * Agrega un producto al carrito.
 * @param {Object} product - Producto a agregar
 * @param {number} quantity - Cantidad (default: 1)
 */
function addToCart(product, quantity = 1) {
  const cart = getCart();
  const existingIndex = cart.findIndex(item => item.id === product.id);
  
  if (existingIndex !== -1) {
    cart[existingIndex].qty = (cart[existingIndex].qty || 1) + quantity;
  } else {
    cart.push({
      ...product,
      qty: quantity
    });
  }
  
  setCart(cart);
  loadCart();
  
  // Feedback visual en el badge
  if (cartBadge) {
    cartBadge.style.transform = 'scale(1.5)';
    setTimeout(() => {
      if (cartBadge) cartBadge.style.transform = 'scale(1)';
    }, 200);
  }
}

/**
 * Abre el drawer del carrito.
 */
function openCart() {
  if (cartDrawer) cartDrawer.classList.add('open');
  if (cartOverlay) cartOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  loadCart(); // Recargar para asegurar datos actualizados
}

/**
 * Cierra el drawer del carrito.
 */
function closeCart() {
  if (cartDrawer) cartDrawer.classList.remove('open');
  if (cartOverlay) cartOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

/**
 * Redirige al checkout guardando el carrito primero.
 */
function goToCheckout() {
  saveCartToStorage();
  window.location.href = 'checkout.html';
}

/**
 * Inicializa el componente del carrito.
 */
function initCartDrawer() {
  // Obtener referencias DOM
  cartDrawer = document.getElementById('cart-drawer');
  cartOverlay = document.getElementById('cart-overlay');
  cartItemsList = document.getElementById('cart-items-list');
  cartEmpty = document.getElementById('cart-empty');
  cartFooter = document.getElementById('cart-footer');
  cartTotal = document.getElementById('cart-total');
  cartDrawerCount = document.getElementById('cart-drawer-count');
  shippingBar = document.getElementById('shipping-bar');
  shippingMsg = document.getElementById('shipping-msg');
  cartBadge = document.getElementById('cart-count');
  
  if (!cartDrawer) return;
  
  // Botones
  const cartBtn = document.getElementById('cart-btn');
  const cartClose = document.getElementById('cart-close');
  const cartCheckoutBtn = document.getElementById('cart-checkout-btn');
  const cartContinueBtn = document.getElementById('cart-continue-btn');
  const cartEmptyCta = document.getElementById('cart-empty-cta');
  
  // Event listeners
  if (cartBtn) cartBtn.addEventListener('click', openCart);
  if (cartClose) cartClose.addEventListener('click', closeCart);
  if (cartOverlay) cartOverlay.addEventListener('click', closeCart);
  if (cartCheckoutBtn) cartCheckoutBtn.addEventListener('click', goToCheckout);
  if (cartContinueBtn) cartContinueBtn.addEventListener('click', closeCart);
  if (cartEmptyCta) cartEmptyCta.addEventListener('click', closeCart);
  
  // Cargar carrito inicial
  loadCart();
}

export { 
  initCartDrawer, 
  openCart, 
  closeCart, 
  addToCart, 
  updateCartTotals,
  loadCart
};