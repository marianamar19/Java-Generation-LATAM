/**
 * fav-drawer.js — HERA Component
 * 
 * Descripción: Lógica del dropdown de favoritos y panel móvil de favoritos.
 * Maneja la lista de productos favoritos, persistencia y acciones.
 * Exporta: initFavDrawer, addToFavs, removeFromFavs, isFav, renderFavLists
 * Importado por: todas las páginas
 */

import { getFavs, setFavs } from '../utils/storage.js';
import { addToCart } from './cart-drawer.js';

// Referencias DOM (desktop)
let favDropdown = null;
let favList = null;
let favEmpty = null;
let favCountLabel = null;
let favCountBadge = null;
let favAddAll = null;
let favAddAllBtn = null;

// Referencias DOM (mobile)
let favListMobile = null;
let favEmptyMobile = null;
let favCountMobile = null;

// Estado interno
let favorites = [];

/**
 * Carga favoritos desde localStorage.
 */
function loadFavs() {
  favorites = getFavs();
}

/**
 * Guarda favoritos en localStorage y actualiza UI.
 */
function saveFavs() {
  setFavs(favorites);
  updateFavBadges();
  renderFavLists();
}

/**
 * Actualiza los badges de favoritos en navbar y mobile.
 */
function updateFavBadges() {
  const count = favorites.length;
  
  if (favCountBadge) {
    if (count > 0) {
      favCountBadge.style.display = 'flex';
      favCountBadge.textContent = count;
    } else {
      favCountBadge.style.display = 'none';
    }
  }
  
  const label = `${count} ${count === 1 ? 'producto' : 'productos'}`;
  if (favCountLabel) favCountLabel.textContent = label;
  if (favCountMobile) favCountMobile.textContent = label;
}

/**
 * Construye una fila de favorito.
 * @param {Object} item - Item favorito
 * @param {boolean} isMobile - Si es para vista móvil
 * @returns {HTMLElement}
 */
function buildFavRow(item, isMobile = false) {
  const row = document.createElement('div');
  row.dataset.favId = item.id;
  row.className = `fav-row ${isMobile ? 'fav-row--mobile' : 'fav-row--desktop'}`;
  
  const nivel = item.nivel || 'green';
  const nivelLabel = {
    green: 'En existencia',
    yellow: 'Disp. limitada',
    red: 'Pieza exclusiva'
  }[nivel] || 'En existencia';
  const volLine = item.vol ? `<div class="fav-row-vol">${escapeHtml(item.vol)}</div>` : '';
  
  row.innerHTML = `
    <div class="fav-row-img">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(15,15,15,.25)" stroke-width="1.5">
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <circle cx="8.5" cy="8.5" r="1.5"/>
        <path d="m21 15-5-5L5 21"/>
      </svg>
    </div>
    <div class="fav-row-body">
      <div class="fav-row-nivel fav-row-nivel--${nivel}">
        <span class="fav-row-nivel-dot"></span>
        <span class="fav-row-nivel-label">${nivelLabel}</span>
      </div>
      <div class="fav-row-brand">${escapeHtml(item.brand)}</div>
      <div class="fav-row-name">${escapeHtml(item.name)}</div>
      ${volLine}
      <div class="fav-row-price">${escapeHtml(item.price)}</div>
    </div>
    <div class="fav-row-actions">
      <button data-add-cart="${item.id}" class="fav-row-btn-cart" aria-label="Agregar al carrito">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="9" cy="21" r="1"/>
          <circle cx="20" cy="21" r="1"/>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
        </svg>
      </button>
      <button data-remove="${item.id}" class="fav-row-btn-remove" aria-label="Quitar de favoritos">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      </button>
    </div>
  `;
  
  // Event listeners
  const addBtn = row.querySelector('[data-add-cart]');
  const removeBtn = row.querySelector('[data-remove]');
  
  if (addBtn) {
    addBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      addToCart({
        id: item.id,
        brand: item.brand,
        name: item.name,
        price: item.price,
        vol: item.vol || '',
        nivel: item.nivel || 'green'
      });
      
      // Feedback visual
      addBtn.style.background = '#2e7d32';
      addBtn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12l5 5L20 7"/></svg>';
      setTimeout(() => {
        addBtn.style.background = '';
        addBtn.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="9" cy="21" r="1"/>
          <circle cx="20" cy="21" r="1"/>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
        </svg>`;
      }, 1200);
    });
  }
  
  if (removeBtn) {
    removeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      removeFromFavs(item.id);
    });
  }
  
  return row;
}

/**
 * Escapa caracteres HTML.
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
 * Renderiza las listas de favoritos (desktop y mobile).
 */
function renderFavLists() {
  // Desktop
  if (favList) {
    // Limpiar excepto el elemento de vacío
    Array.from(favList.children).forEach(child => {
      if (child.id !== 'fav-empty') child.remove();
    });
    
    if (favorites.length > 0) {
      if (favEmpty) favEmpty.style.display = 'none';
      favorites.forEach(item => {
        if (favList) favList.insertBefore(buildFavRow(item, false), favEmpty);
      });
    } else {
      if (favEmpty) favEmpty.style.display = 'block';
    }
  }
  
  // Mobile
  if (favListMobile) {
    Array.from(favListMobile.children).forEach(child => {
      if (child.id !== 'fav-empty-mobile') child.remove();
    });
    
    if (favorites.length > 0) {
      if (favEmptyMobile) favEmptyMobile.style.display = 'none';
      favorites.forEach(item => {
        if (favListMobile) favListMobile.insertBefore(buildFavRow(item, true), favEmptyMobile);
      });
    } else {
      if (favEmptyMobile) favEmptyMobile.style.display = 'block';
    }
  }
  
  // Mostrar/ocultar botón "Agregar todo"
  if (favAddAll) {
    favAddAll.style.display = favorites.length > 0 ? 'block' : 'none';
  }
}

/**
 * Agrega un producto a favoritos.
 * @param {Object} product - Producto a agregar
 * @returns {boolean} - true si se agregó, false si ya existía
 */
function addToFavs(product) {
  const exists = favorites.some(f => f.id === product.id);
  if (!exists) {
    favorites.push(product);
    saveFavs();
    return true;
  }
  return false;
}

/**
 * Elimina un producto de favoritos.
 * @param {string} productId - ID del producto
 * @returns {boolean} - true si se eliminó
 */
function removeFromFavs(productId) {
  const initialLength = favorites.length;
  favorites = favorites.filter(f => f.id !== productId);
  
  if (favorites.length !== initialLength) {
    saveFavs();
    return true;
  }
  return false;
}

/**
 * Verifica si un producto está en favoritos.
 * @param {string} productId - ID del producto
 * @returns {boolean}
 */
function isFav(productId) {
  return favorites.some(f => f.id === productId);
}

/**
 * Agrega todos los favoritos al carrito.
 */
function addAllFavsToCart() {
  favorites.forEach(fav => {
    addToCart({
      id: fav.id,
      brand: fav.brand,
      name: fav.name,
      price: fav.price,
      vol: fav.vol || '',
      nivel: fav.nivel || 'green'
    });
  });
}

/**
 * Inicializa el componente de favoritos.
 */
function initFavDrawer() {
  // Referencias desktop
  favDropdown = document.getElementById('fav-dropdown');
  favList = document.getElementById('fav-list');
  favEmpty = document.getElementById('fav-empty');
  favCountLabel = document.getElementById('fav-count-label');
  favCountBadge = document.getElementById('fav-count');
  favAddAll = document.getElementById('fav-add-all');
  favAddAllBtn = document.getElementById('fav-add-all-btn');
  
  // Referencias mobile
  favListMobile = document.getElementById('fav-list-mobile');
  favEmptyMobile = document.getElementById('fav-empty-mobile');
  favCountMobile = document.getElementById('fav-count-mobile');
  
  // Cargar datos
  loadFavs();
  renderFavLists();
  
  // Evento para "Agregar todo al carrito"
  if (favAddAllBtn) {
    favAddAllBtn.addEventListener('click', addAllFavsToCart);
  }
}

export { 
  initFavDrawer, 
  addToFavs, 
  removeFromFavs, 
  isFav, 
  renderFavLists,
  loadFavs
};