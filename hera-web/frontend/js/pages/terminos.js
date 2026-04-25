/**
 * terminos.js — HERA
 *
 * Descripción: Script principal de la página de términos y condiciones.
 *   Carga componentes universales, inicializa navbar, carrito, favoritos,
 *   buscador, footer y efectos visuales propios de la página.
 *
 * Exporta: (ninguno — es el punto de entrada de la página)
 * Importado por: pages/terminos.html vía <script type="module">
 */

import { loadNavbar } from '../components/navbar.js';
import {
  initCartDrawer,
  addItemToCart,
  openCart,
  closeCart
} from '../components/cart-drawer.js';
import {
  initFavDrawer
} from '../components/fav-drawer.js';
import {
  highlightQuery
} from '../utils/formatter.js';

// ── TEMPORAL — catálogo mínimo para el buscador ───────────────
const CATALOG = [
  { id: 'sauvage-1', brand: 'Dior', name: 'Sauvage EDP', price: '$2,450 MXN', tags: ['fresco', 'amaderado'] },
  { id: 'fierce-2', brand: 'Abercrombie & Fitch', name: 'Fierce Cologne', price: '$1,180 MXN', tags: ['fresco', 'marino'] },
  { id: 'jenny-1', brand: 'Jenny Rivera', name: 'Inolvidable EDP', price: '$1,210 MXN', tags: ['floral', 'femenino'] },
  { id: 'noir-5', brand: 'HERA Exclusivo', name: 'Noir Absolu', price: '$1,480 MXN', tags: ['oriental', 'amaderado'] }
];

// ══════════════════════════════════════════════════════════════
// INIT — punto de entrada
// ══════════════════════════════════════════════════════════════

async function init() {
  // Componentes universales
  await loadNavbar();
  await initCartDrawer();
  initFavDrawer(addItemToCart);

  // Módulos universales
  _initSearchOverlay();
  await _loadFooter();

  // Lógica propia de la página
  _initRevealAnimations();
  _initCursor();
}

// ══════════════════════════════════════════════════════════════
// SEARCH OVERLAY
// ══════════════════════════════════════════════════════════════

function _initSearchOverlay() {
  const searchOverlay = document.getElementById('search-overlay');
  const searchInput = document.getElementById('search-input');
  const searchResults = document.getElementById('search-results');
  const searchCloseBtn = document.getElementById('search-close-btn');
  const searchBtn = document.getElementById('search-btn');

  if (!searchOverlay || !searchInput || !searchResults) return;

  function openSearchOverlay() {
    searchOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    setTimeout(() => searchInput.focus(), 300);
  }

  function closeSearchOverlay() {
    searchOverlay.classList.remove('open');
    document.body.style.overflow = '';
    searchInput.value = '';
    _renderSearchResults('');
  }

  if (searchBtn) {
    searchBtn.addEventListener('click', openSearchOverlay);
  }

  if (searchCloseBtn) {
    searchCloseBtn.addEventListener('click', closeSearchOverlay);
  }

  searchOverlay.addEventListener('click', (e) => {
    if (e.target === searchOverlay) closeSearchOverlay();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeSearchOverlay();
  });

  let searchDebounce;
  searchInput.addEventListener('input', () => {
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(() => {
      _renderSearchResults(searchInput.value);
    }, 180);
  });
}

function _renderSearchResults(query) {
  const searchResults = document.getElementById('search-results');
  if (!searchResults) return;

  const q = (query || '').trim().toLowerCase();

  if (!q) {
    searchResults.innerHTML = '<p class="search-hint">Busca por nombre o marca</p>';
    return;
  }

  const hits = CATALOG.filter((p) => {
    return (
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      (p.tags && p.tags.some((tag) => tag.toLowerCase().includes(q)))
    );
  });

  if (!hits.length) {
    searchResults.innerHTML = `<div class="search-empty"><p>Sin resultados para "<strong>${query}</strong>"</p></div>`;
    return;
  }

  let html = `<p class="search-hint">${hits.length} resultado${hits.length !== 1 ? 's' : ''}</p>`;

  hits.forEach((p) => {
    html += `
      <div class="search-result-item">
        <div class="search-result-thumb">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(249,249,249,.3)" stroke-width="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
          </svg>
        </div>
        <div style="flex:1;min-width:0;">
          <div class="search-result-brand">${highlightQuery(p.brand, query)}</div>
          <div class="search-result-name">${highlightQuery(p.name, query)}</div>
          <div class="search-result-price">${p.price}</div>
        </div>
      </div>
    `;
  });

  searchResults.innerHTML = html;
}

// ══════════════════════════════════════════════════════════════
// FOOTER
// ══════════════════════════════════════════════════════════════

async function _loadFooter() {
  const placeholder = document.getElementById('footer-placeholder');
  if (!placeholder) return;

  const base = new URL('../..', import.meta.url).href;
  const res = await fetch(base + '/components/footer.html');
  const html = await res.text();
  placeholder.innerHTML = html;
}

// ══════════════════════════════════════════════════════════════
// REVEAL ANIMATIONS
// ══════════════════════════════════════════════════════════════

function _initRevealAnimations() {
  const revealEls = document.querySelectorAll('.reveal');
  if (!revealEls.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 });

  revealEls.forEach((el) => {
    if (el.getBoundingClientRect().top < window.innerHeight) {
      el.classList.add('visible');
    }
    observer.observe(el);
  });
}

// ══════════════════════════════════════════════════════════════
// CURSOR CUSTOM
// ══════════════════════════════════════════════════════════════

function _initCursor() {
  const cursor = document.getElementById('cursor');
  const ring = document.getElementById('cursorRing');

  if (!cursor || !ring || window.innerWidth <= 768) return;

  let mouseX = 0;
  let mouseY = 0;
  let ringX = 0;
  let ringY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.left = `${mouseX}px`;
    cursor.style.top = `${mouseY}px`;
  });

  function animateRing() {
    ringX += (mouseX - ringX) * 0.1;
    ringY += (mouseY - ringY) * 0.1;
    ring.style.left = `${ringX}px`;
    ring.style.top = `${ringY}px`;
    requestAnimationFrame(animateRing);
  }

  animateRing();

  document.querySelectorAll('a, button, .cta-card').forEach((el) => {
    el.addEventListener('mouseenter', () => {
      cursor.style.transform = 'translate(-50%,-50%) scale(2)';
      ring.style.width = '60px';
      ring.style.height = '60px';
    });

    el.addEventListener('mouseleave', () => {
      cursor.style.transform = 'translate(-50%,-50%) scale(1)';
      ring.style.width = '36px';
      ring.style.height = '36px';
    });
  });
}

// ── Arranque ──────────────────────────────────────────────────
init();