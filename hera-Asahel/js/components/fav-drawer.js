/**
 * fav-drawer.js — HERA
 *
 * Descripción: Lógica del sistema de favoritos: dropdown desktop
 *              y sección del panel lateral móvil. Gestiona el array
 *              de favoritos en localStorage, renderiza las filas fav-row
 *              y permite agregar items al carrito desde favoritos.
 * Exporta: initFavDrawer
 * Importado por: js/pages/404.js y todas las páginas del proyecto
 */

import { getFavs, saveFavs } from '../utils/storage.js';
import { formatPriceMXN, getNivelLabel } from '../utils/formatter.js';
import { addItemToCart } from './cart-drawer.js';

/* Estado en memoria — sincronizado con localStorage */
let favorites = [];

/* Referencias al DOM — se asignan en initFavDrawer */
let favToggle, favCountBadge, favCountLabel,
    favList, favEmptyEl, favDropdown,
    favCountMobile, favListMobile, favEmptyMobile;

/**
 * Inicializa el sistema de favoritos: obtiene referencias al DOM,
 * carga el array desde localStorage y renderiza el estado inicial.
 */
function initFavDrawer() {
  favToggle      = document.getElementById('fav-toggle');
  favCountBadge  = document.getElementById('fav-count');
  favCountLabel  = document.getElementById('fav-count-label');
  favList        = document.getElementById('fav-list');
  favEmptyEl     = document.getElementById('fav-empty');
  favDropdown    = document.getElementById('fav-dropdown');
  favCountMobile = document.getElementById('fav-count-mobile');
  favListMobile  = document.getElementById('fav-list-mobile');
  favEmptyMobile = document.getElementById('fav-empty-mobile');

  // Cargar favoritos desde localStorage al inicializar
  favorites = getFavs();

  // Toggle del dropdown desktop
  if (favToggle) {
    favToggle.addEventListener('click', function(e) {
      e.stopPropagation();
      // Cerrar dropdown de cuenta si estuviera abierto
      const accountDropdown = document.getElementById('account-dropdown');
      if (accountDropdown) accountDropdown.style.display = 'none';
      favDropdown.style.display = favDropdown.style.display === 'block' ? 'none' : 'block';
    });
    favDropdown.addEventListener('click', function(e) { e.stopPropagation(); });
  }

  // Botón "Agregar todo al carrito"
  const favAddAllBtn = document.getElementById('fav-add-all-btn');
  if (favAddAllBtn) favAddAllBtn.addEventListener('click', addAllFavsToCart);

  renderFavList();
}

/**
 * Renderiza las listas de favoritos en desktop y móvil.
 * Actualiza badges, etiquetas de conteo y el botón "agregar todo".
 */
function renderFavList() {
  const label = favorites.length + (favorites.length === 1 ? ' producto' : ' productos');

  if (favCountLabel)  favCountLabel.textContent  = label;
  if (favCountMobile) favCountMobile.textContent = label;

  if (favorites.length > 0) {
    // Mostrar badge con el número de favoritos
    if (favCountBadge) {
      favCountBadge.style.display = 'flex';
      favCountBadge.textContent   = favorites.length;
    }
    if (favEmptyEl)    favEmptyEl.style.display    = 'none';
    if (favEmptyMobile) favEmptyMobile.style.display = 'none';
  } else {
    if (favCountBadge)  favCountBadge.style.display  = 'none';
    if (favCountLabel)  favCountLabel.textContent     = '0 productos';
    if (favEmptyEl)     favEmptyEl.style.display      = 'block';
    if (favEmptyMobile) favEmptyMobile.style.display  = 'block';
  }

  // Refrescar lista desktop — eliminar filas anteriores sin tocar el estado vacío
  if (favList) {
    Array.from(favList.children).forEach(function(c) {
      if (c.id !== 'fav-empty') c.remove();
    });
    favorites.forEach(function(item) {
      favList.insertBefore(buildFavRow(item, false), favEmptyEl);
    });
  }

  // Refrescar lista móvil
  if (favListMobile) {
    Array.from(favListMobile.children).forEach(function(c) {
      if (c.id !== 'fav-empty-mobile') c.remove();
    });
    favorites.forEach(function(item) {
      favListMobile.insertBefore(buildFavRow(item, true), favEmptyMobile);
    });
  }

  // Persistir favoritos cada vez que cambia el estado
  saveFavs(favorites);

  // Mostrar/ocultar el botón "agregar todo"
  const addAllBtn = document.getElementById('fav-add-all');
  if (addAllBtn) addAllBtn.style.display = favorites.length > 0 ? 'block' : 'none';
}

/**
 * Construye el elemento HTML de una fila de favorito.
 * @param {Object}  item     - Objeto de producto favorito
 * @param {boolean} isMobile - true para usar la clase CSS de versión móvil
 * @returns {HTMLElement} Fila lista para insertar en el DOM
 */
function buildFavRow(item, isMobile) {
  const row = document.createElement('div');
  row.dataset.favId = item.id;
  row.className = 'fav-row ' + (isMobile ? 'fav-row--mobile' : 'fav-row--desktop');

  const nNivel  = item.nivel || 'green';
  const nLabel  = getNivelLabel(nNivel);
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

  // Agregar al carrito desde favoritos con feedback visual de confirmación
  row.querySelector('[data-add-cart]').addEventListener('click', function(e) {
    e.stopPropagation();
    addItemToCart(item.id, item.brand, item.name, item.price, item.vol || '', item.nivel || 'green');

    // Feedback temporal de confirmación antes de restaurar el ícono
    this.style.background = '#2e7d32';
    this.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12l5 5L20 7"/></svg>';
    const btn = this;
    setTimeout(function() {
      btn.style.background = '';
      btn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>';
    }, 1200);
  });

  // Quitar de favoritos y re-renderizar la lista
  row.querySelector('[data-remove]').addEventListener('click', function(e) {
    e.stopPropagation();
    const id = e.currentTarget.dataset.remove;
    favorites = favorites.filter(function(f) { return f.id !== id; });
    renderFavList();
  });

  return row;
}

/**
 * Agrega todos los favoritos al carrito en un solo click.
 * Cierra y vuelve a abrir el carrito para reflejar los cambios.
 */
function addAllFavsToCart() {
  if (!favorites.length) return;
  favorites.forEach(function(f) {
    addItemToCart(f.id, f.brand, f.name, f.price, f.vol || '', f.nivel || 'green');
  });
  // Re-abrir el carrito para mostrar todos los ítems añadidos
  if (window._heraOpenCart) {
    window._heraOpenCart();
  }
}

export { initFavDrawer };
