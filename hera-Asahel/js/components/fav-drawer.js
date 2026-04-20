/**
 * fav-drawer.js — HERA
 *
 * Descripción: Componente de favoritos (dropdown desktop + panel móvil).
 *              Gestiona el estado de la lista de favoritos desde localStorage,
 *              renderiza las filas de producto con acciones de agregar al
 *              carrito y quitar de favoritos.
 * Exporta: initFavDrawer
 * Importado por: js/pages/*.js
 */

import { getFavs, saveFavs } from '../utils/storage.js';
import { addItemToCart } from './cart-drawer.js';

/* ── Estado local de favoritos — fuente de verdad en localStorage ── */
let favorites = [];

/**
 * Inicializa el componente de favoritos: lee el estado desde localStorage
 * y vincula los eventos del toggle y el botón "Agregar todo al carrito".
 */
function initFavDrawer() {
  // Carga el estado inicial desde localStorage
  favorites = getFavs();

  const favToggle    = document.getElementById('fav-toggle');
  const favDropdown  = document.getElementById('fav-dropdown');
  const accountDropdown = document.getElementById('account-dropdown');
  const favAddAllBtn = document.getElementById('fav-add-all-btn');

  favToggle?.addEventListener('click', (e) => {
    e.stopPropagation();
    // Cierra el dropdown de cuenta si está abierto para evitar solapamiento
    if (accountDropdown) accountDropdown.style.display = 'none';
    if (favDropdown) {
      favDropdown.style.display = favDropdown.style.display === 'block' ? 'none' : 'block';
    }
  });
  favDropdown?.addEventListener('click', (e) => e.stopPropagation());
  favAddAllBtn?.addEventListener('click', _addAllFavsToCart);

  // Renderiza el estado inicial
  renderFavList();
}

/**
 * Renderiza la lista completa de favoritos tanto en desktop como en móvil.
 * Sincroniza el badge de conteo y persiste el estado en localStorage.
 */
function renderFavList() {
  const favCountBadge  = document.getElementById('fav-count');
  const favCountLabel  = document.getElementById('fav-count-label');
  const favList        = document.getElementById('fav-list');
  const favEmptyEl     = document.getElementById('fav-empty');
  const favCountMobile = document.getElementById('fav-count-mobile');
  const favListMobile  = document.getElementById('fav-list-mobile');
  const favEmptyMobile = document.getElementById('fav-empty-mobile');
  const favAddAllWrap  = document.getElementById('fav-add-all');

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

  // Reconstruye el listado desktop sin tocar el nodo #fav-empty
  if (favList) {
    Array.from(favList.children).forEach((c) => { if (c.id !== 'fav-empty') c.remove(); });
    favorites.forEach((item) => { favList.insertBefore(_buildFavRow(item, false), favEmptyEl); });
  }

  // Reconstruye el listado móvil sin tocar el nodo #fav-empty-mobile
  if (favListMobile) {
    Array.from(favListMobile.children).forEach((c) => { if (c.id !== 'fav-empty-mobile') c.remove(); });
    favorites.forEach((item) => { favListMobile.insertBefore(_buildFavRow(item, true), favEmptyMobile); });
  }

  // Persiste el estado actualizado
  saveFavs(favorites);

  if (favAddAllWrap) favAddAllWrap.style.display = favorites.length > 0 ? 'flex' : 'none';
}

/**
 * Construye el elemento DOM de una fila de favorito.
 * @param {Object}  item     - Objeto del producto favorito
 * @param {boolean} isMobile - true para aplicar estilos móvil
 * @returns {HTMLElement} Elemento .fav-row listo para insertar en el DOM
 */
function _buildFavRow(item, isMobile) {
  const row = document.createElement('div');
  row.dataset.favId = item.id;
  row.className = 'fav-row ' + (isMobile ? 'fav-row--mobile' : 'fav-row--desktop');

  const nNivel = item.nivel || 'green';
  const nLabel = { green: 'En existencia', yellow: 'Disp. limitada', red: 'Pieza exclusiva' }[nNivel] || 'En existencia';
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
      `<button data-add-cart="${item.id}" class="fav-row-btn-cart" aria-label="Agregar al carrito"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg></button>` +
      `<button data-remove="${item.id}" class="fav-row-btn-remove" aria-label="Quitar de favoritos"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg></button>` +
    `</div>`;

  // Botón agregar al carrito con feedback visual
  row.querySelector('[data-add-cart]').addEventListener('click', function (e) {
    e.stopPropagation();
    addItemToCart(item.id, item.brand, item.name, item.price, item.vol || '', item.nivel || 'green');
    // Feedback visual — indica que el producto fue agregado
    this.style.background = '#2e7d32';
    this.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12l5 5L20 7"/></svg>';
    const btn = this;
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
    renderFavList();
  });

  return row;
}

/**
 * Agrega todos los favoritos actuales al carrito en una sola acción.
 */
function _addAllFavsToCart() {
  if (!favorites.length) return;
  favorites.forEach((f) => addItemToCart(f.id, f.brand, f.name, f.price, f.vol || '', f.nivel || 'green'));
}

export { initFavDrawer, renderFavList };
