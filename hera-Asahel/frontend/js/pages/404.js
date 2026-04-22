/**
 * 404.js — HERA
 *
 * Descripción: Script exclusivo de la página 404. Inicializa todos
 *              los componentes universales (navbar, footer, carrito, favoritos)
 *              y la lógica de búsqueda con catálogo hardcodeado temporal.
 *              No contiene lógica específica de negocio más allá del
 *              search overlay, ya que la página 404 no tiene secciones propias.
 * Exporta: (ninguno — script de entrada)
 * Importado por: pages/404.html vía <script type="module">
 */

import { loadNavbar } from '../components/navbar.js';
import { initCartDrawer } from '../components/cart-drawer.js';
import { initFavDrawer } from '../components/fav-drawer.js';
import { highlightQuery } from '../utils/formatter.js';

/* ── TEMPORAL — datos hardcodeados por ausencia de backend ─────
   Reemplazar este array por una llamada fetch() a la API
   cuando el backend esté disponible.
   Endpoint esperado: GET /api/productos
   ──────────────────────────────────────────────────────────── */
const CATALOG = [
  { id:'jenny-1',      brand:'Jenny Rivera',       name:'Inolvidable EDP',  price:'$1,210 MXN', badge:'Más vendido', tags:['floral','femenino'] },
  { id:'fierce-2',     brand:'Abercrombie & Fitch', name:'Fierce EDT',        price:'$760 MXN',   tags:['fresco','masculino'] },
  { id:'authentic-3',  brand:'Abercrombie & Fitch', name:'Authentic EDP',     price:'$975 MXN',   badge:'Ed. limitada', tags:['amaderado'] },
  { id:'signature-4',  brand:'HERA Exclusivo',      name:'Signature Blanc',   price:'$1,490 MXN', badge:'Nuevo', tags:['floral','blanco'] },
  { id:'noir-5',       brand:'HERA Exclusivo',      name:'Noir Absolu',       price:'$1,480 MXN', badge:'-20%', tags:['oriental','amaderado'] },
  { id:'oud-6',        brand:'Hera Árabe',          name:'Oud Rose',          price:'$1,320 MXN', tags:['árabe','oud','oriental'] },
];

/* ══════════════════════════════════════════════════════════════
   INICIALIZACIÓN — DOMContentLoaded
   Se esperan todos los elementos antes de enlazar eventos
   ══════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', async function() {

  // Cargar navbar y footer vía fetch en paralelo para minimizar tiempo de espera
  await Promise.all([loadNavbar(), loadFooter()]);

  // Inicializar carrito lateral con su lógica de localStorage
  initCartDrawer();

  // Inicializar sistema de favoritos (dropdown desktop + panel móvil)
  initFavDrawer();

  // Inicializar search overlay y exponerlo al navbar
  initSearch();

  // Inicializar scroll reveal para las clases .reveal de la página
  initScrollReveal();
});

/* ══════════════════════════════════════
   FOOTER
══════════════════════════════════════ */

/**
 * Carga el footer en el elemento #footer-placeholder de la página.
 * Sigue el mismo patrón de inyección que loadNavbar en navbar.js.
 * @returns {Promise<void>}
 */
async function loadFooter() {
  const placeholder = document.getElementById('footer-placeholder');
  if (!placeholder) return;

  const response = await fetch('/components/footer.html');
  const html = await response.text();
  placeholder.innerHTML = html;
}

/* ══════════════════════════════════════
   SEARCH OVERLAY
══════════════════════════════════════ */

/**
 * Inicializa el search overlay: apertura, cierre, input con debounce
 * y renderizado de resultados filtrados desde el catálogo local.
 */
function initSearch() {
  const searchOverlay  = document.getElementById('search-overlay');
  const searchInput    = document.getElementById('search-input');
  const searchResults  = document.getElementById('search-results');
  const searchCloseBtn = document.getElementById('search-close-btn');

  if (!searchOverlay) return;

  /**
   * Abre el search overlay y da foco al input después de la animación CSS.
   */
  function openSearch() {
    searchOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    // Esperar a que termine la transición CSS antes de dar foco
    setTimeout(function() { searchInput.focus(); }, 300);
  }

  /**
   * Cierra el search overlay y limpia el input y los resultados.
   */
  function closeSearch() {
    searchOverlay.classList.remove('open');
    document.body.style.overflow = '';
    searchInput.value = '';
    renderSearchResults('');
  }

  // Exponer openSearch para que navbar.js pueda dispararlo desde el botón de búsqueda
  window._heraOpenSearch = openSearch;

  searchCloseBtn.addEventListener('click', closeSearch);
  searchOverlay.addEventListener('click', function(e) {
    // Cerrar solo si el click fue en el overlay, no en la caja de búsqueda
    if (e.target === searchOverlay) closeSearch();
  });
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeSearch();
  });

  // Delegación de click en resultados — cerrar el buscador al seleccionar
  searchResults.addEventListener('click', function(e) {
    if (e.target.closest('.search-result-item')) closeSearch();
  });

  // Debounce en el input para no disparar búsquedas en cada keystroke
  let searchDebounce;
  searchInput.addEventListener('input', function() {
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(function() {
      renderSearchResults(searchInput.value);
    }, 180);
  });
}

/**
 * Filtra el catálogo según el query y renderiza los resultados en el DOM.
 * Resalta el término buscado en nombre y marca.
 * @param {string} query - Texto ingresado por el usuario
 */
function renderSearchResults(query) {
  const searchResults = document.getElementById('search-results');
  if (!searchResults) return;

  const q = query.trim().toLowerCase();
  if (!q) {
    searchResults.innerHTML = '<p class="search-hint">Busca por nombre o marca</p>';
    return;
  }

  const hits = CATALOG.filter(function(p) {
    return p.name.toLowerCase().includes(q)
      || p.brand.toLowerCase().includes(q)
      || (p.tags && p.tags.some(function(t) { return t.includes(q); }));
  });

  if (hits.length === 0) {
    searchResults.innerHTML =
      `<div class="search-empty">` +
        `<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/><path d="M8 11h6M11 8v6" opacity=".4"/></svg>` +
        `<p>Sin resultados para "<strong>${query}</strong>"</p>` +
      `</div>`;
    return;
  }

  let html = `<p class="search-hint">${hits.length} resultado${hits.length !== 1 ? 's' : ''}</p>`;
  hits.forEach(function(p) {
    html +=
      `<div class="search-result-item">` +
        `<div class="search-result-thumb"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(249,249,249,.3)" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg></div>` +
        `<div class="search-result-info">` +
          `<div class="search-result-brand">${highlightQuery(p.brand, query)}</div>` +
          `<div class="search-result-name">${highlightQuery(p.name, query)}</div>` +
          `<div class="search-result-price">${p.price}</div>` +
          (p.badge ? `<div class="search-result-badge">${p.badge}</div>` : '') +
        `</div>` +
        `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(15,15,15,.25)" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>` +
      `</div>`;
  });
  searchResults.innerHTML = html;
}

/* ══════════════════════════════════════
   SCROLL REVEAL — IntersectionObserver
   Replays cada vez que el elemento entra al viewport (Design System v4)
══════════════════════════════════════ */

/**
 * Observa todos los elementos .reveal y alterna la clase .visible
 * conforme entran y salen del viewport.
 */
function initScrollReveal() {
  const obs = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
      } else {
        e.target.classList.remove('visible');
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal').forEach(function(el) { obs.observe(el); });
}
