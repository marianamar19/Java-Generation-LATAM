/**
 * search.js — HERA Component
 * 
 * Descripción: Componente de búsqueda con overlay, búsqueda en tiempo real
 * y resaltado de resultados.
 * Exporta: initSearch, openSearch, closeSearch
 * Importado por: todas las páginas
 */

// Catálogo temporal (será reemplazado por fetch a API)
// TODO: Reemplazar por llamada a GET /api/productos cuando backend esté listo
const CATALOG = [
  { id: 'jenny-1', brand: 'Jenny Rivera', name: 'Inolvidable EDP', price: '$1,210 MXN', badge: 'Más vendido', tags: ['floral', 'femenino'] },
  { id: 'fierce-2', brand: 'Abercrombie & Fitch', name: 'Fierce EDT', price: '$760 MXN', tags: ['fresco', 'masculino'] },
  { id: 'authentic-3', brand: 'Abercrombie & Fitch', name: 'Authentic EDP', price: '$975 MXN', badge: 'Ed. limitada', tags: ['amaderado'] },
  { id: 'signature-4', brand: 'HERA Exclusivo', name: 'Signature Blanc', price: '$1,490 MXN', badge: 'Nuevo', tags: ['floral', 'blanco'] },
  { id: 'noir-5', brand: 'HERA Exclusivo', name: 'Noir Absolu', price: '$1,480 MXN', badge: '-20%', tags: ['oriental', 'amaderado'] },
  { id: 'oud-6', brand: 'Hera Árabe', name: 'Oud Rose', price: '$1,320 MXN', tags: ['árabe', 'oud', 'oriental'] },
];

// Referencias DOM
let searchOverlay = null;
let searchInput = null;
let searchResults = null;
let searchCloseBtn = null;
let searchBtn = null;
let searchDebounce = null;

/**
 * Escapa caracteres para regex.
 * @param {string} str - String a escapar
 * @returns {string}
 */
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Resalta el texto buscado en un string.
 * @param {string} text - Texto original
 * @param {string} query - Término de búsqueda
 * @returns {string} Texto con <mark> alrededor del término
 */
function highlightText(text, query) {
  if (!query || !text) return text;
  const escapedQuery = escapeRegex(query);
  const regex = new RegExp(`(${escapedQuery})`, 'gi');
  return text.replace(regex, '<mark class="search-highlight">$1</mark>');
}

/**
 * Renderiza los resultados de búsqueda.
 * @param {string} query - Término de búsqueda
 */
function renderSearchResults(query) {
  const q = query.trim().toLowerCase();
  
  if (!q) {
    searchResults.innerHTML = '<p class="search-hint">Busca por nombre o marca</p>';
    return;
  }
  
  // Filtrar productos
  const hits = CATALOG.filter(product => {
    return product.name.toLowerCase().includes(q) ||
           product.brand.toLowerCase().includes(q) ||
           (product.tags && product.tags.some(tag => tag.includes(q)));
  });
  
  if (hits.length === 0) {
    searchResults.innerHTML = `
      <div class="search-empty">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.35-4.35"/>
          <path d="M8 11h6M11 8v6" opacity=".4"/>
        </svg>
        <p>Sin resultados para "<strong>${escapeHtml(query)}</strong>"</p>
      </div>
    `;
    return;
  }
  
  // Construir HTML de resultados
  let html = `<p class="search-hint">${hits.length} ${hits.length === 1 ? 'resultado' : 'resultados'}</p>`;
  
  hits.forEach(product => {
    html += `
      <div class="search-result-item" data-product-id="${product.id}">
        <div class="search-result-thumb">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(249,249,249,.3)" stroke-width="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <path d="m21 15-5-5L5 21"/>
          </svg>
        </div>
        <div class="search-result-info">
          <div class="search-result-brand">${highlightText(escapeHtml(product.brand), query)}</div>
          <div class="search-result-name">${highlightText(escapeHtml(product.name), query)}</div>
          <div class="search-result-price">${escapeHtml(product.price)}</div>
          ${product.badge ? `<div class="search-result-badge">${escapeHtml(product.badge)}</div>` : ''}
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(15,15,15,.25)" stroke-width="2">
          <path d="m9 18 6-6-6-6"/>
        </svg>
      </div>
    `;
  });
  
  searchResults.innerHTML = html;
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
 * Abre el overlay de búsqueda.
 */
function openSearch() {
  if (!searchOverlay) return;
  searchOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  setTimeout(() => {
    if (searchInput) searchInput.focus();
  }, 300);
}

/**
 * Cierra el overlay de búsqueda.
 */
function closeSearch() {
  if (!searchOverlay) return;
  searchOverlay.classList.remove('open');
  document.body.style.overflow = '';
  if (searchInput) searchInput.value = '';
  renderSearchResults('');
}

/**
 * Maneja el input de búsqueda con debounce.
 * @param {Event} e - Evento de input
 */
function handleSearchInput(e) {
  clearTimeout(searchDebounce);
  searchDebounce = setTimeout(() => {
    renderSearchResults(e.target.value);
  }, 180);
}

/**
 * Maneja clicks en resultados de búsqueda.
 * @param {Event} e - Evento de click
 */
function handleResultClick(e) {
  const resultItem = e.target.closest('.search-result-item');
  if (resultItem) {
    const productId = resultItem.dataset.productId;
    // TODO: Navegar a página de producto cuando exista
    // window.location.href = `producto.html?id=${productId}`;
    closeSearch();
  }
}

/**
 * Maneja tecla Escape para cerrar búsqueda.
 * @param {Event} e - Evento de teclado
 */
function handleKeydown(e) {
  if (e.key === 'Escape') {
    closeSearch();
  }
}

/**
 * Inicializa el componente de búsqueda.
 */
function initSearch() {
  searchOverlay = document.getElementById('search-overlay');
  searchInput = document.getElementById('search-input');
  searchResults = document.getElementById('search-results');
  searchCloseBtn = document.getElementById('search-close-btn');
  searchBtn = document.getElementById('search-btn');
  
  if (!searchOverlay) return;
  
  // Event listeners
  if (searchBtn) searchBtn.addEventListener('click', openSearch);
  if (searchCloseBtn) searchCloseBtn.addEventListener('click', closeSearch);
  if (searchInput) searchInput.addEventListener('input', handleSearchInput);
  if (searchResults) searchResults.addEventListener('click', handleResultClick);
  if (searchOverlay) {
    searchOverlay.addEventListener('click', (e) => {
      if (e.target === searchOverlay) closeSearch();
    });
  }
  
  document.addEventListener('keydown', handleKeydown);
}

export { initSearch, openSearch, closeSearch };