/**
 * politica-envios.js — HERA
 *
 * Descripción: Script exclusivo de la página Política de Envíos.
 *              Inicializa todos los componentes universales
 *              (navbar, footer, carrito, favoritos, búsqueda)
 *              y la lógica específica de esta página:
 *              acordeón FAQ y scroll reveal.
 * Exporta: (ninguno — script de entrada)
 * Importado por: pages/politica-envios.html vía <script type="module">
 */

import { loadNavbar }     from '../components/navbar.js';
import { initCartDrawer } from '../components/cart-drawer.js';
import { initFavDrawer }  from '../components/fav-drawer.js';
import { highlightQuery } from '../utils/formatter.js';

/* ── TEMPORAL — catálogo hardcodeado por ausencia de backend ────
   Reemplazar por fetch() a la API cuando el backend esté listo.
   Endpoint esperado: GET /api/productos
   ──────────────────────────────────────────────────────────── */
const CATALOG = [
  { id:'jenny-1',     brand:'Jenny Rivera',        name:'Inolvidable EDP', price:'$1,210 MXN', badge:'Más vendido',  tags:['floral','femenino'] },
  { id:'fierce-2',    brand:'Abercrombie & Fitch',  name:'Fierce EDT',      price:'$760 MXN',   tags:['fresco','masculino'] },
  { id:'authentic-3', brand:'Abercrombie & Fitch',  name:'Authentic EDP',   price:'$975 MXN',   badge:'Ed. limitada', tags:['amaderado'] },
  { id:'signature-4', brand:'HERA Exclusivo',       name:'Signature Blanc', price:'$1,490 MXN', badge:'Nuevo',        tags:['floral','blanco'] },
  { id:'noir-5',      brand:'HERA Exclusivo',       name:'Noir Absolu',     price:'$1,480 MXN', badge:'-20%',         tags:['oriental','amaderado'] },
  { id:'oud-6',       brand:'Hera Árabe',           name:'Oud Rose',        price:'$1,320 MXN', tags:['árabe','oud','oriental'] },
];

/* ══════════════════════════════════════════════════════════════
   INICIALIZACIÓN — DOMContentLoaded
   ══════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', async function() {

  // Cargar navbar y footer en paralelo — ninguno depende del otro
  await Promise.all([loadNavbar(), loadFooter()]);

  // Inicializar componentes universales del layout
  initCartDrawer();
  initFavDrawer();

  // Inicializar search overlay y exponerlo al navbar
  initSearch();

  // Lógica exclusiva de la página
  initFaqAccordion();
  initScrollReveal();
});

/* ══════════════════════════════════════
   FOOTER — inyección vía fetch
══════════════════════════════════════ */

/**
 * Carga el footer en el elemento #footer-placeholder de la página.
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

  function openSearch() {
    searchOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    setTimeout(function() { searchInput.focus(); }, 300);
  }

  function closeSearch() {
    searchOverlay.classList.remove('open');
    document.body.style.overflow = '';
    searchInput.value = '';
    renderSearchResults('');
  }

  // Exponer openSearch para que navbar.js lo dispare desde el botón de búsqueda
  window._heraOpenSearch = openSearch;

  searchCloseBtn.addEventListener('click', closeSearch);
  searchOverlay.addEventListener('click', function(e) {
    if (e.target === searchOverlay) closeSearch();
  });
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeSearch();
  });

  searchResults.addEventListener('click', function(e) {
    if (e.target.closest('.search-result-item')) closeSearch();
  });

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
        `<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>` +
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
   FAQ — ACORDEÓN
   Lógica exclusiva de esta página
══════════════════════════════════════ */

/**
 * Inicializa el acordeón del FAQ.
 * Al abrir una pregunta, cierra todas las demás (comportamiento exclusivo).
 * Gestiona aria-expanded para accesibilidad.
 */
function initFaqAccordion() {
  document.querySelectorAll('.faq-question').forEach(function(btn) {
    btn.addEventListener('click', function() {
      const answer = btn.nextElementSibling;
      const isOpen = btn.classList.contains('open');

      // Cerrar todos los items antes de abrir el seleccionado
      document.querySelectorAll('.faq-question').forEach(function(b) {
        b.classList.remove('open');
        b.setAttribute('aria-expanded', 'false');
        b.nextElementSibling.classList.remove('open');
      });

      // Si estaba cerrado, abrirlo; si estaba abierto, ya quedó cerrado arriba
      if (!isOpen) {
        btn.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
        answer.classList.add('open');
      }
    });
  });
}

/* ══════════════════════════════════════
   SCROLL REVEAL — IntersectionObserver
   Replays cada vez que el elemento entra al viewport
══════════════════════════════════════ */

/**
 * Observa todos los elementos .reveal y alterna .visible
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
