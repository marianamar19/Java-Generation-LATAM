/**
 * fav-drawer.js — HERA
 *
 * Descripción: Lógica de favoritos: toggle de botones .fav-btn,
 *              renderizado de la lista en el dropdown desktop y en
 *              el panel móvil, construcción dinámica de filas,
 *              agregar al carrito desde favoritos y persistencia
 *              en localStorage.
 * Exporta:     initFavDrawer, renderFavList, getFavorites, setFavorites, registerOnRender
 * Importado por: js/pages/index.js, js/pages/favoritos.js
 */

import { getFavs, setFavs }  from '../utils/storage.js';
import { addItemToCart }     from './cart-drawer.js';

/* Estado local de favoritos — fuente de verdad en memoria */
let favorites = [];

/* Hook externo — permite que páginas como favoritos.html
   reaccionen cuando renderFavList() modifica la lista */
let _onRenderHook = null;

/**
 * Registra una función que se llamará al final de cada renderFavList().
 * Uso: favoritos.js lo usa para mantener su grid sincronizado con el dropdown.
 * @param {Function} fn - Callback sin parámetros
 */
function registerOnRender(fn) {
  _onRenderHook = fn;
}

/**
 * Devuelve el array de favoritos actual.
 * @returns {Array} Array de objetos favorito
 */
function getFavorites() {
  return favorites;
}

/**
 * Reemplaza el array de favoritos y persiste en localStorage.
 * Usado por favoritos.js cuando elimina un item desde el grid de la página.
 * @param {Array} newFavs - Nuevo array de favoritos
 */
function setFavorites(newFavs) {
  favorites = newFavs;
  setFavs(favorites);
}

/* Referencias DOM — asignadas en initFavDrawer */
let favCountBadge, favCountLabel, favList, favEmptyEl;
let favCountMobile, favListMobile, favEmptyMobile;

/**
 * Inicializa el sistema de favoritos: carga desde localStorage,
 * enlaza botones .fav-btn presentes en el DOM y renderiza las listas.
 * Debe llamarse una vez en el DOMContentLoaded de la página,
 * después de initCartDrawer.
 * @returns {void}
 */
function initFavDrawer() {
  favorites = getFavs();

  favCountBadge  = document.getElementById('fav-count');
  favCountLabel  = document.getElementById('fav-count-label');
  favList        = document.getElementById('fav-list');
  favEmptyEl     = document.getElementById('fav-empty');
  favCountMobile = document.getElementById('fav-count-mobile');
  favListMobile  = document.getElementById('fav-list-mobile');
  favEmptyMobile = document.getElementById('fav-empty-mobile');

  document.querySelectorAll('.fav-btn').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      _toggleFav(btn);
    });
  });

  favorites.forEach(function(f) {
    document.querySelectorAll('.fav-btn[data-product-id="' + f.id + '"]')
      .forEach(function(b) { b.classList.add('active'); });
  });

  const favAddAllBtn = document.getElementById('fav-add-all-btn');
  if (favAddAllBtn) favAddAllBtn.addEventListener('click', _addAllFavsToCart);

  renderFavList();
}

/* ── Toggle de favoritos ─────────────────────────────────────── */

function _toggleFav(btn) {
  const id       = btn.dataset.productId;
  const brand    = btn.dataset.brand;
  const name     = btn.dataset.name;
  const price    = btn.dataset.price;
  const nivel    = btn.dataset.nivel    || 'green';
  const volLabel = btn.dataset.volLabel || 'Presentación';
  const tipo     = btn.dataset.tipo     || 'perfumes';
  const cat      = btn.dataset.cat      || '';
  const gen      = btn.dataset.gen      || '';

  const card      = btn.closest('.ed-item');
  const selVolBtn = card ? card.querySelector('.ed-vol-btn.sel') : null;
  const vol       = selVolBtn ? selVolBtn.textContent.trim() : (btn.dataset.vol || '');

  if (btn.classList.contains('active')) {
    btn.classList.remove('active');
    favorites = favorites.filter(function(f) { return f.id !== id; });
  } else {
    btn.classList.add('active');
    if (!favorites.find(function(f) { return f.id === id; })) {
      favorites.push({ id, brand, name, price, vol, volLabel, nivel, tipo, cat, gen });
    }
    if (favCountBadge) {
      favCountBadge.style.transform = 'scale(1.5)';
      setTimeout(function() { favCountBadge.style.transform = 'scale(1)'; }, 200);
    }
  }

  document.querySelectorAll('.fav-btn[data-product-id="' + id + '"]').forEach(function(b) {
    b.classList.toggle('active', favorites.some(function(f) { return f.id === id; }));
  });

  renderFavList();
}

/* ── Render de la lista ──────────────────────────────────────── */

function renderFavList() {
  const label = favorites.length + (favorites.length === 1 ? ' producto' : ' productos');

  if (favCountLabel)  favCountLabel.textContent  = label;
  if (favCountMobile) favCountMobile.textContent = label;

  if (favorites.length > 0) {
    if (favCountBadge)  { favCountBadge.style.display = 'flex'; favCountBadge.textContent = favorites.length; }
    if (favEmptyEl)     favEmptyEl.style.display    = 'none';
    if (favEmptyMobile) favEmptyMobile.style.display = 'none';
  } else {
    if (favCountBadge)  favCountBadge.style.display  = 'none';
    if (favCountLabel)  favCountLabel.textContent     = '0 productos';
    if (favEmptyEl)     favEmptyEl.style.display      = 'block';
    if (favEmptyMobile) favEmptyMobile.style.display  = 'block';
  }

  if (favList) {
    Array.from(favList.children).forEach(function(c) { if (c.id !== 'fav-empty') c.remove(); });
    favorites.forEach(function(item) {
      favList.insertBefore(_buildFavRow(item, false), favEmptyEl);
    });
  }

  if (favListMobile) {
    Array.from(favListMobile.children).forEach(function(c) { if (c.id !== 'fav-empty-mobile') c.remove(); });
    favorites.forEach(function(item) {
      favListMobile.insertBefore(_buildFavRow(item, true), favEmptyMobile);
    });
  }

  const addAllBtn = document.getElementById('fav-add-all');
  if (addAllBtn) addAllBtn.style.display = favorites.length > 0 ? 'block' : 'none';

  setFavs(favorites);

  // Llamar el hook externo si está registrado (ej: favoritos.js sincroniza su grid)
  if (_onRenderHook) _onRenderHook();
}

/* ── Construcción de filas ───────────────────────────────────── */

function _buildFavRow(item, isMobile) {
  const row        = document.createElement('div');
  row.dataset.favId = item.id;
  row.className    = 'fav-row ' + (isMobile ? 'fav-row--mobile' : 'fav-row--desktop');

  const nNivel  = item.nivel || 'green';
  const nLabel  = { green: 'En existencia', yellow: 'Disp. limitada', red: 'Pieza exclusiva' }[nNivel] || 'En existencia';
  const volLine = item.vol ? '<div class="fav-row-vol">' + item.vol + '</div>' : '';

  row.innerHTML =
    '<div class="fav-row-img">' +
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(15,15,15,.25)" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>' +
    '</div>' +
    '<div class="fav-row-body">' +
      '<div class="fav-row-nivel fav-row-nivel--' + nNivel + '">' +
        '<span class="fav-row-nivel-dot"></span>' +
        '<span class="fav-row-nivel-label">' + nLabel + '</span>' +
      '</div>' +
      '<div class="fav-row-brand">' + item.brand + '</div>' +
      '<div class="fav-row-name">'  + item.name  + '</div>' +
      volLine +
      '<div class="fav-row-price">' + item.price + '</div>' +
    '</div>' +
    '<div class="fav-row-actions">' +
      '<button data-add-cart="'  + item.id + '" class="fav-row-btn-cart" aria-label="Agregar al carrito">' +
        '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>' +
      '</button>' +
      '<button data-remove="' + item.id + '" class="fav-row-btn-remove" aria-label="Quitar de favoritos">' +
        '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>' +
      '</button>' +
    '</div>';

  row.querySelector('[data-add-cart]').addEventListener('click', function(e) {
    e.stopPropagation();
    addItemToCart(item.id, item.brand, item.name, item.price, item.vol || '', item.nivel || 'green');
    const btn = this;
    btn.style.background = '#2e7d32';
    btn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12l5 5L20 7"/></svg>';
    setTimeout(function() {
      btn.style.background = '';
      btn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>';
    }, 1200);
  });

  row.querySelector('[data-remove]').addEventListener('click', function(e) {
    e.stopPropagation();
    const id = e.currentTarget.dataset.remove;
    favorites = favorites.filter(function(f) { return f.id !== id; });
    document.querySelectorAll('.fav-btn[data-product-id="' + id + '"]')
      .forEach(function(b) { b.classList.remove('active'); });
    renderFavList();
  });

  return row;
}

/* ── Agregar todo al carrito ─────────────────────────────────── */

function _addAllFavsToCart() {
  if (!favorites.length) return;
  favorites.forEach(function(f) {
    addItemToCart(f.id, f.brand, f.name, f.price, f.vol || '', f.nivel || 'green');
  });
}

export { initFavDrawer, renderFavList, getFavorites, setFavorites, registerOnRender };