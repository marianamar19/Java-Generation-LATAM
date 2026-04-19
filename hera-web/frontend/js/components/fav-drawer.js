/**
 * fav-drawer.js — HERA
 *
 * Descripción: Gestiona el dropdown de favoritos (desktop) y su reflejo
 *   en el panel móvil. Lee y persiste el estado en localStorage.
 *   Construye las filas de producto dinámicamente con buildFavRow().
 *   Se integra con el carrito a través de la función addItemToCart()
 *   que recibe como parámetro para evitar dependencia circular.
 *
 * Exporta: initFavDrawer, toggleFav, renderFavList
 * Importado por: js/pages/catalogo.js y páginas que muestran botones de favorito
 */

import { getFavs, saveFavs } from '../utils/storage.js';

// ── Referencias DOM (pobladas en initFavDrawer) ───────────────
let favToggle, favCountBadge, favCountLabel;
let favList, favEmptyEl, favDropdown;
let favCountMobile, favListMobile, favEmptyMobile;
let addItemToCartFn = null; // inyectada desde catalogo.js para evitar circular

/** Array en memoria de favoritos. Fuente de verdad: localStorage. */
let favorites = [];

/**
 * Inicializa el módulo de favoritos. Lee localStorage, asocia eventos
 * y hace el render inicial.
 * @param {Function} addToCartCallback - Referencia a addItemToCart del carrito
 */
function initFavDrawer(addToCartCallback) {
  addItemToCartFn = addToCartCallback;

  // Cargar favoritos desde localStorage
  favorites = getFavs();

  // Obtener referencias DOM
  favToggle      = document.getElementById('fav-toggle');
  favCountBadge  = document.getElementById('fav-count');
  favCountLabel  = document.getElementById('fav-count-label');
  favList        = document.getElementById('fav-list');
  favEmptyEl     = document.getElementById('fav-empty');
  favDropdown    = document.getElementById('fav-dropdown');
  favCountMobile = document.getElementById('fav-count-mobile');
  favListMobile  = document.getElementById('fav-list-mobile');
  favEmptyMobile = document.getElementById('fav-empty-mobile');

  // Toggle del dropdown de favoritos en desktop
  if (favToggle) {
    favToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      // Cierra el dropdown de cuenta si estuviera abierto
      const accountDropdown = document.getElementById('account-dropdown');
      if (accountDropdown) accountDropdown.style.display = 'none';
      favDropdown.style.display = favDropdown.style.display === 'block' ? 'none' : 'block';
    });
    favDropdown.addEventListener('click', (e) => e.stopPropagation());
  }

  // Botón "Agregar todo al carrito"
  const favAddAllBtn = document.getElementById('fav-add-all-btn');
  if (favAddAllBtn) favAddAllBtn.addEventListener('click', _addAllFavsToCart);

  // Sincronizar botones de favorito ya presentes en el DOM (productos renderizados antes del init)
  _syncFavButtons();
  renderFavList();
}

// ── Toggle de favorito ────────────────────────────────────────

/**
 * Añade o quita un producto de la lista de favoritos.
 * Función canónica para todos los botones .fav-btn del proyecto.
 * @param {HTMLElement} btn - Botón .fav-btn con data-attributes del producto
 */
function toggleFav(btn) {
  const id       = btn.dataset.productId;
  const brand    = btn.dataset.brand;
  const name     = btn.dataset.name;
  const price    = btn.dataset.price;
  const nivel    = btn.dataset.nivel    || 'green';
  const volLabel = btn.dataset.volLabel || 'Presentación';
  const tipo     = btn.dataset.tipo     || 'perfumes';
  const cat      = btn.dataset.cat      || '';
  const gen      = btn.dataset.gen      || '';

  // Lee el volumen del botón .ed-vol-btn.sel activo en la tarjeta
  const card      = btn.closest('.ed-item');
  const selVolBtn = card ? card.querySelector('.ed-vol-btn.sel') : null;
  const vol       = selVolBtn ? selVolBtn.textContent.trim() : (btn.dataset.vol || '');

  if (btn.classList.contains('active')) {
    btn.classList.remove('active');
    favorites = favorites.filter((f) => f.id !== id);
  } else {
    btn.classList.add('active');
    if (!favorites.find((f) => f.id === id)) {
      favorites.push({ id, brand, name, price, vol, volLabel, nivel, tipo, cat, gen });
    }
    // Feedback visual en el badge — estado dinámico, requiere JS
    if (favCountBadge) {
      favCountBadge.style.transform = 'scale(1.5)';
      setTimeout(() => { favCountBadge.style.transform = 'scale(1)'; }, 200);
    }
  }

  // Sincroniza todos los botones que apunten al mismo producto (grid + favoritos panel)
  document.querySelectorAll(`.fav-btn[data-product-id="${id}"]`).forEach((b) => {
    b.classList.toggle('active', favorites.some((f) => f.id === id));
  });

  renderFavList();
}

// ── Render ────────────────────────────────────────────────────

/**
 * Re-renderiza las listas de favoritos (desktop y móvil) y actualiza
 * todos los contadores y badges. Persiste el estado en localStorage.
 */
function renderFavList() {
  const label = favorites.length + (favorites.length === 1 ? ' producto' : ' productos');
  if (favCountLabel)  favCountLabel.textContent  = label;
  if (favCountMobile) favCountMobile.textContent = label;

  if (favorites.length > 0) {
    if (favCountBadge)  { favCountBadge.style.display = 'flex'; favCountBadge.textContent = favorites.length; }
    if (favEmptyEl)     favEmptyEl.style.display     = 'none';
    if (favEmptyMobile) favEmptyMobile.style.display = 'none';
  } else {
    if (favCountBadge)  favCountBadge.style.display  = 'none';
    if (favCountLabel)  favCountLabel.textContent     = '0 productos';
    if (favEmptyEl)     favEmptyEl.style.display      = 'block';
    if (favEmptyMobile) favEmptyMobile.style.display  = 'block';
  }

  // Reconstruir lista desktop
  if (favList) {
    Array.from(favList.children).forEach((c) => { if (c.id !== 'fav-empty') c.remove(); });
    favorites.forEach((item) => favList.insertBefore(buildFavRow(item, false), favEmptyEl));
  }

  // Reconstruir lista móvil
  if (favListMobile) {
    Array.from(favListMobile.children).forEach((c) => { if (c.id !== 'fav-empty-mobile') c.remove(); });
    favorites.forEach((item) => favListMobile.insertBefore(buildFavRow(item, true), favEmptyMobile));
  }

  // Actualizar link "Ver todos" con el conteo si supera 3
  const verTodosLink = document.getElementById('fav-ver-todos');
  if (verTodosLink) {
    verTodosLink.textContent = favorites.length > 3
      ? `Ver todos (${favorites.length}) →`
      : 'Ver mis favoritos →';
  }

  // Mostrar/ocultar botón "Agregar todo al carrito"
  const addAllBtn = document.getElementById('fav-add-all');
  if (addAllBtn) addAllBtn.style.display = favorites.length > 0 ? 'block' : 'none';

  saveFavs(favorites);
}

/**
 * Construye una fila de favorito para el dropdown (desktop) o el panel (móvil).
 * @param {Object} item     - Objeto de favorito con id, brand, name, price, vol, nivel
 * @param {boolean} isMobile - true → fila del panel móvil, false → fila del dropdown desktop
 * @returns {HTMLElement}
 */
function buildFavRow(item, isMobile) {
  const row       = document.createElement('div');
  row.dataset.favId = item.id;
  row.className   = 'fav-row ' + (isMobile ? 'fav-row--mobile' : 'fav-row--desktop');

  const nNivel  = item.nivel || 'green';
  const nLabel  = { green:'En existencia', yellow:'Disp. limitada', red:'Pieza exclusiva' }[nNivel] || 'En existencia';
  const volLine = item.vol ? `<div class="fav-row-vol">${item.vol}</div>` : '';

  row.innerHTML =
    `<div class="fav-row-img"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(15,15,15,.25)" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg></div>` +
    `<div class="fav-row-body">` +
      `<div class="fav-row-nivel fav-row-nivel--${nNivel}"><span class="fav-row-nivel-dot"></span><span class="fav-row-nivel-label">${nLabel}</span></div>` +
      `<div class="fav-row-brand">${item.brand}</div>` +
      `<div class="fav-row-name">${item.name}</div>` +
      volLine +
      `<div class="fav-row-price">${item.price}</div>` +
    `</div>` +
    `<div class="fav-row-actions">` +
      `<button data-add-cart="${item.id}" class="fav-row-btn-cart"  aria-label="Agregar al carrito"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg></button>` +
      `<button data-remove="${item.id}"   class="fav-row-btn-remove" aria-label="Quitar de favoritos"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg></button>` +
    `</div>`;

  // Botón agregar al carrito desde favoritos
  row.querySelector('[data-add-cart]').addEventListener('click', (e) => {
    e.stopPropagation();
    if (addItemToCartFn) {
      addItemToCartFn(item.id, item.brand, item.name, item.price, item.vol || '', item.nivel || 'green');
    }
    // Feedback visual — estado dinámico, requiere JS
    const btn = e.currentTarget;
    btn.style.background = '#2e7d32';
    btn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12l5 5L20 7"/></svg>';
    setTimeout(() => {
      btn.style.background = '';
      btn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>';
    }, 1200);
  });

  // Botón quitar de favoritos
  row.querySelector('[data-remove]').addEventListener('click', (e) => {
    e.stopPropagation();
    const id = e.currentTarget.dataset.remove;
    favorites = favorites.filter((f) => f.id !== id);
    // Desactiva los .fav-btn correspondientes en el grid
    document.querySelectorAll(`.fav-btn[data-product-id="${id}"]`).forEach((b) => {
      b.classList.remove('active');
    });
    renderFavList();
  });

  return row;
}

// ── Helpers privados ──────────────────────────────────────────

/**
 * Agrega todos los favoritos al carrito de una sola vez.
 * @private
 */
function _addAllFavsToCart() {
  if (!favorites.length || !addItemToCartFn) return;
  favorites.forEach((f) => {
    addItemToCartFn(f.id, f.brand, f.name, f.price, f.vol || '', f.nivel || 'green');
  });
}

/**
 * Sincroniza el estado visual (clase .active) de todos los .fav-btn
 * que ya estén en el DOM con el array de favoritos en memoria.
 * Necesario cuando el grid se renderiza antes de que initFavDrawer se llame.
 * @private
 */
function _syncFavButtons() {
  favorites.forEach((f) => {
    document.querySelectorAll(`.fav-btn[data-product-id="${f.id}"]`).forEach((b) => {
      b.classList.add('active');
    });
  });
}

export { initFavDrawer, toggleFav, renderFavList, buildFavRow };
