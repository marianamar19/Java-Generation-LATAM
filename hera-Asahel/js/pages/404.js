/**
 * 404.js — HERA
 *
 * Descripción: Script exclusivo de la página de error 404.
 *              Inicializa todos los componentes universales (navbar,
 *              carrito, favoritos, búsqueda) y el scroll reveal propio
 *              de la página.
 * Exporta: (ninguno — es el entry point de la página)
 * Importado por: pages/404.html (vía <script type="module">)
 */

import { loadNavbar }      from '../components/navbar.js';
import { initCartDrawer }  from '../components/cart-drawer.js';
import { initFavDrawer }   from '../components/fav-drawer.js';

/* ── Datos de catálogo hardcodeados — reemplazar por fetch a /api/productos ── */
const CATALOG = [
  { id: 'sauvage-1', brand: 'Dior',                name: 'Sauvage EDP',     price: '$2,450 MXN', tags: ['fresco','amaderado'] },
  { id: 'fierce-2',  brand: 'Abercrombie & Fitch', name: 'Fierce Cologne',  price: '$1,180 MXN', tags: ['fresco','marino'] },
  { id: 'jenny-1',   brand: 'Jenny Rivera',         name: 'Inolvidable EDP', price: '$1,210 MXN', tags: ['floral','femenino'] },
  { id: 'noir-5',    brand: 'HERA Exclusivo',       name: 'Noir Absolu',     price: '$1,480 MXN', tags: ['oriental','amaderado'] }
];

document.addEventListener('DOMContentLoaded', () => {
  // Carga el navbar desde el fragmento HTML y lo inicializa
  loadNavbar();

  // Inicializa el carrito lateral con su estado de localStorage
  initCartDrawer();

  // Inicializa el dropdown de favoritos (desktop + móvil)
  initFavDrawer();

  // Inicializa el buscador overlay
  initSearch();

  // Activa el scroll reveal para los elementos .reveal de la página
  initScrollReveal();
});

/* ══════════════════════════════════════
   SEARCH — Overlay de búsqueda global
══════════════════════════════════════ */

/**
 * Inicializa el overlay de búsqueda: apertura, cierre, input con debounce
 * y delegación de clicks en resultados.
 */
function initSearch() {
  const searchOverlay  = document.getElementById('search-overlay');
  const searchInput    = document.getElementById('search-input');
  const searchResults  = document.getElementById('search-results');
  const searchCloseBtn = document.getElementById('search-close-btn');
  const searchBtn      = document.getElementById('search-btn');

  if (!searchBtn) return;

  function openSearch() {
    searchOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    // Pequeño delay para que la animación del panel termine antes de enfocar
    setTimeout(() => searchInput.focus(), 300);
  }

  function closeSearch() {
    searchOverlay.classList.remove('open');
    document.body.style.overflow = '';
    searchInput.value = '';
    renderSearchResults('');
  }

  searchBtn.addEventListener('click', openSearch);
  searchCloseBtn.addEventListener('click', closeSearch);
  searchOverlay.addEventListener('click', (e) => {
    if (e.target === searchOverlay) closeSearch();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeSearch();
  });

  // Delegación de clicks en resultados — cierra el overlay al seleccionar
  searchResults.addEventListener('click', (e) => {
    if (e.target.closest('.search-result-item')) closeSearch();
  });

  // Debounce para no disparar la búsqueda en cada pulsación
  let searchDebounce;
  searchInput.addEventListener('input', () => {
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(() => renderSearchResults(searchInput.value), 180);
  });

  /**
   * Resalta la coincidencia de búsqueda dentro de un texto.
   * @param {string} text  - Texto original
   * @param {string} query - Término buscado
   * @returns {string} HTML con <mark> alrededor de las coincidencias
   */
  function highlight(text, query) {
    if (!query) return text;
    const re = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(re, '<mark class="search-highlight">$1</mark>');
  }

  /**
   * Filtra el catálogo y renderiza los resultados en el panel de búsqueda.
   * @param {string} query - Término de búsqueda ingresado por el usuario
   */
  function renderSearchResults(query) {
    const q = query.trim().toLowerCase();
    if (!q) {
      searchResults.innerHTML = '<p class="search-hint">Busca por nombre o marca</p>';
      return;
    }
    const hits = CATALOG.filter((p) =>
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      (p.tags && p.tags.some((t) => t.includes(q)))
    );
    if (!hits.length) {
      searchResults.innerHTML = `<div class="search-empty"><p>Sin resultados para "${query}"</p></div>`;
      return;
    }
    let html = `<p class="search-hint">${hits.length} resultado${hits.length !== 1 ? 's' : ''}</p>`;
    hits.forEach((p) => {
      html +=
        `<div class="search-result-item">` +
          `<div class="search-result-thumb"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(249,249,249,.3)" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/></svg></div>` +
          `<div class="search-result-info">` +
            `<div class="search-result-brand">${highlight(p.brand, query)}</div>` +
            `<div class="search-result-name">${highlight(p.name, query)}</div>` +
            `<div class="search-result-price">${p.price}</div>` +
          `</div>` +
        `</div>`;
    });
    searchResults.innerHTML = html;
  }
}

/* ══════════════════════════════════════
   SCROLL REVEAL — IntersectionObserver
══════════════════════════════════════ */

/**
 * Activa el scroll reveal para todos los elementos con clase .reveal.
 * Usa IntersectionObserver para añadir/quitar la clase .visible
 * cuando el elemento entra o sale del viewport.
 */
function initScrollReveal() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
      } else {
        // Quita la clase al salir para que la animación se repita al volver a entrar
        e.target.classList.remove('visible');
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal').forEach((el) => obs.observe(el));
}
