/**
 * politica-envios.js — HERA
 *
 * Descripción: Script principal de la página Política de Envíos.
 *   Orquesta la carga de componentes universales (navbar, carrito,
 *   favoritos, footer) e inicializa la lógica exclusiva de la página:
 *   acordeón FAQ y scroll reveal.
 *
 *   Esta página no tiene lógica de negocio propia más allá del FAQ,
 *   por lo que el archivo es intencionalmente ligero.
 *
 * Exporta: (ninguno — es el punto de entrada de la página)
 * Importado por: pages/politica-envios.html vía <script type="module">
 */

import { loadNavbar }             from '../components/navbar.js';
import { initCartDrawer,
         addItemToCart }          from '../components/cart-drawer.js';
import { initFavDrawer }          from '../components/fav-drawer.js';
import { highlightQuery }         from '../utils/formatter.js';

// ── TEMPORAL — catálogo reducido para el search overlay
//    Reemplazar por llamada fetch() a GET /api/productos
// ────────────────────────────────────────────────────────
const CATALOG = [
  { id:'jenny-1',     brand:'Jenny Rivera',        name:'Inolvidable EDP',  price:'$1,210 MXN', badge:'Más vendido', tags:['floral','femenino'] },
  { id:'fierce-2',    brand:'Abercrombie & Fitch',  name:'Fierce EDT',       price:'$760 MXN',   tags:['fresco','masculino'] },
  { id:'authentic-3', brand:'Abercrombie & Fitch',  name:'Authentic EDP',    price:'$975 MXN',   badge:'Ed. limitada', tags:['amaderado'] },
  { id:'signature-4', brand:'HERA Exclusivo',       name:'Signature Blanc',  price:'$1,490 MXN', badge:'Nuevo', tags:['floral','blanco'] },
  { id:'noir-5',      brand:'HERA Exclusivo',       name:'Noir Absolu',      price:'$1,480 MXN', badge:'-20%', tags:['oriental','amaderado'] },
  { id:'oud-6',       brand:'Hera Árabe',           name:'Oud Rose',         price:'$1,320 MXN', tags:['árabe','oud','oriental'] },
];

// ══════════════════════════════════════════════════════════
//  INIT — punto de entrada
// ══════════════════════════════════════════════════════════

/**
 * Inicializa todos los módulos de la página en orden:
 * 1. Navbar (fetch + lógica de sesión + menú móvil)
 * 2. Cart drawer (fetch + persistencia)
 * 3. Fav drawer (inyecta callback del carrito)
 * 4. Search overlay (local, sin fetch)
 * 5. Footer (fetch)
 * 6. Scroll reveal
 * 7. FAQ acordeón
 */
async function init() {
  await loadNavbar();
  await initCartDrawer();
  initFavDrawer(addItemToCart);
  _initSearchOverlay();
  _loadFooter();
  _initScrollReveal();
  _initFaqAccordion();
}

// ── Search overlay ────────────────────────────────────────

/**
 * Inicializa el search overlay: apertura, cierre y búsqueda en el
 * CATALOG local con debounce de 180ms.
 * @private
 */
function _initSearchOverlay() {
  const searchOverlay  = document.getElementById('search-overlay');
  const searchInput    = document.getElementById('search-input');
  const searchResults  = document.getElementById('search-results');
  const searchCloseBtn = document.getElementById('search-close-btn');
  const searchBtn      = document.getElementById('search-btn');

  if (!searchOverlay) return;

  function openSearch() {
    searchOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    setTimeout(() => searchInput.focus(), 300);
  }

  function closeSearch() {
    searchOverlay.classList.remove('open');
    document.body.style.overflow = '';
    searchInput.value = '';
    _renderSearchResults('');
  }

  if (searchBtn)      searchBtn.addEventListener('click', openSearch);
  if (searchCloseBtn) searchCloseBtn.addEventListener('click', closeSearch);
  searchOverlay.addEventListener('click', (e) => {
    if (e.target === searchOverlay) closeSearch();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeSearch();
  });

  // Delegación de clicks en resultados para cerrar al navegar
  searchResults.addEventListener('click', (e) => {
    if (e.target.closest('.search-result-item')) closeSearch();
  });

  let searchDebounce;
  searchInput.addEventListener('input', () => {
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(() => _renderSearchResults(searchInput.value), 180);
  });
}

/**
 * Renderiza los resultados de búsqueda en el search overlay.
 * @param {string} query - Término de búsqueda
 * @private
 */
function _renderSearchResults(query) {
  const searchResults = document.getElementById('search-results');
  if (!searchResults) return;

  const q = (query || '').trim().toLowerCase();
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
    searchResults.innerHTML = `<div class="search-empty"><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/><path d="M8 11h6M11 8v6" opacity=".4"/></svg><p>Sin resultados para "<strong>${query}</strong>"</p></div>`;
    return;
  }

  let html = `<p class="search-hint">${hits.length} resultado${hits.length !== 1 ? 's' : ''}</p>`;
  hits.forEach((p) => {
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

// ── Footer ────────────────────────────────────────────────

/**
 * Carga el fragmento del footer en #footer-placeholder vía fetch.
 * @private
 */
async function _loadFooter() {
  const placeholder = document.getElementById('footer-placeholder');
  if (!placeholder) return;
  // Ruta relativa al archivo JS para independencia del servidor
  const base = new URL('../..', import.meta.url).href;
  const res  = await fetch(base + '/components/footer.html');
  const html = await res.text();
  placeholder.innerHTML = html;
}

// ── Scroll reveal ─────────────────────────────────────────

/**
 * Inicializa el IntersectionObserver de scroll reveal.
 * Aplica/quita la clase .visible en cada elemento .reveal
 * cada vez que entra o sale del viewport (Design System v4).
 * @private
 */
function _initScrollReveal() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
      } else {
        e.target.classList.remove('visible');
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal').forEach((el) => obs.observe(el));
}

// ── FAQ acordeón ──────────────────────────────────────────

/**
 * Inicializa el acordeón del FAQ.
 * Al abrir una pregunta cierra todas las demás (comportamiento exclusivo:
 * solo una respuesta visible a la vez).
 * @private
 */
function _initFaqAccordion() {
  document.querySelectorAll('.faq-question').forEach((btn) => {
    btn.addEventListener('click', () => {
      const answer = btn.nextElementSibling;
      const isOpen = btn.classList.contains('open');

      // Cierra todas las preguntas antes de abrir la seleccionada
      document.querySelectorAll('.faq-question').forEach((b) => {
        b.classList.remove('open');
        b.setAttribute('aria-expanded', 'false');
        b.nextElementSibling.classList.remove('open');
      });

      // Si no estaba abierta, abrirla
      if (!isOpen) {
        btn.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
        answer.classList.add('open');
      }
    });
  });
}

// ── Arranque ──────────────────────────────────────────────
init();
