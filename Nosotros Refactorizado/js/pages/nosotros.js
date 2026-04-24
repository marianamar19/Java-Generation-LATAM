/**
 * nosotros.js — HERA
 *
 * Descripción: Lógica exclusiva de la página nosotros.html.
 *              Inicializa el search overlay, las flip cards del equipo
 *              y el scroll reveal via IntersectionObserver.
 *              Orquesta la carga de todos los componentes universales.
 * Exporta: (ninguno — es el entry point de la página)
 * Importado por: pages/nosotros.html via <script type="module">
 */

import { loadNavbar }       from '../components/navbar.js';
import { initCartDrawer }   from '../components/cart-drawer.js';
import { initFavDrawer }    from '../components/fav-drawer.js';

/* ══════════════════════════════════════
   BOOTSTRAP — carga de componentes
══════════════════════════════════════ */

// El navbar y footer se cargan via fetch porque son fragmentos externos
loadNavbar();
loadFooter();

// El carrito y favoritos se inicializan después del DOM
initCartDrawer();
initFavDrawer();

// Lógica exclusiva de esta página
initSearch();
initFlipCards();
initScrollReveal();

/* ══════════════════════════════════════
   FOOTER — inyección via fetch
══════════════════════════════════════ */

/**
 * Carga el footer en el elemento #footer-placeholder de la página.
 * Sigue el mismo patrón que loadNavbar.
 * @returns {Promise<void>}
 */
async function loadFooter() {
  const placeholder = document.getElementById('footer-placeholder');
  if (!placeholder) return;

  const response = await fetch('/components/footer.html');
  const html     = await response.text();
  placeholder.innerHTML = html;
}

/* ══════════════════════════════════════
   SEARCH OVERLAY
   Datos hardcodeados temporalmente — reemplazar por GET /api/productos
   cuando el backend esté disponible.
══════════════════════════════════════ */

/**
 * Catálogo temporal hardcodeado por ausencia de backend.
 * Endpoint esperado: GET /api/productos
 */
const CATALOG = [
  { id: 'jenny-1',     brand: 'Jenny Rivera',        name: 'Inolvidable EDP',  price: '$1,210 MXN', badge: 'Más vendido',    tags: ['floral', 'femenino'] },
  { id: 'fierce-2',    brand: 'Abercrombie & Fitch',  name: 'Fierce EDT',       price: '$760 MXN',   badge: null,             tags: ['fresco', 'masculino'] },
  { id: 'authentic-3', brand: 'Abercrombie & Fitch',  name: 'Authentic EDP',    price: '$975 MXN',   badge: 'Ed. limitada',   tags: ['amaderado'] },
  { id: 'signature-4', brand: 'HERA Exclusivo',       name: 'Signature Blanc',  price: '$1,490 MXN', badge: 'Nuevo',          tags: ['floral', 'blanco'] },
  { id: 'noir-5',      brand: 'HERA Exclusivo',       name: 'Noir Absolu',      price: '$1,480 MXN', badge: '-20%',           tags: ['oriental', 'amaderado'] },
  { id: 'oud-6',       brand: 'Hera Árabe',           name: 'Oud Rose',         price: '$1,320 MXN', badge: null,             tags: ['árabe', 'oud', 'oriental'] },
];

/**
 * Inicializa el search overlay: abre, cierra, búsqueda con debounce
 * y renderizado de resultados con highlight de término buscado.
 */
function initSearch() {
  const searchOverlay  = document.getElementById('search-overlay');
  const searchInput    = document.getElementById('search-input');
  const searchResults  = document.getElementById('search-results');
  const searchCloseBtn = document.getElementById('search-close-btn');
  const searchBtn      = document.getElementById('search-btn');

  if (!searchOverlay || !searchInput) return;

  function openSearch() {
    searchOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    // Focus con delay para esperar la animación de entrada del panel
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
  searchOverlay.addEventListener('click', e => {
    if (e.target === searchOverlay) closeSearch();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeSearch();
  });

  // Cierra el overlay al hacer click en un resultado
  searchResults.addEventListener('click', e => {
    if (e.target.closest('.search-result-item')) closeSearch();
  });

  // Debounce de 180ms para no disparar búsqueda en cada tecla
  let searchDebounce;
  searchInput.addEventListener('input', () => {
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(() => renderSearchResults(searchInput.value), 180);
  });

  renderSearchResults('');
}

/**
 * Envuelve las coincidencias del query con <mark> para resaltarlas visualmente.
 * @param {string} text  - Texto original
 * @param {string} query - Término buscado
 * @returns {string} Texto con coincidencias marcadas
 */
function highlight(text, query) {
  if (!query) return text;
  const re = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(re, '<mark class="search-highlight">$1</mark>');
}

/**
 * Filtra el catálogo por el query y actualiza el HTML de resultados.
 * @param {string} query - Término de búsqueda
 */
function renderSearchResults(query) {
  const searchResults = document.getElementById('search-results');
  if (!searchResults) return;

  const q = query.trim().toLowerCase();

  if (!q) {
    searchResults.innerHTML = '<p class="search-hint">Busca por nombre o marca</p>';
    return;
  }

  const hits = CATALOG.filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.brand.toLowerCase().includes(q) ||
    (p.tags && p.tags.some(t => t.includes(q)))
  );

  if (hits.length === 0) {
    searchResults.innerHTML = `
      <div class="search-empty">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <p>Sin resultados para "<strong>${query}</strong>"</p>
      </div>`;
    return;
  }

  let html = `<p class="search-hint">${hits.length} resultado${hits.length !== 1 ? 's' : ''}</p>`;

  hits.forEach(p => {
    html += `
      <div class="search-result-item">
        <div class="search-result-thumb">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(249,249,249,.3)" stroke-width="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <path d="m21 15-5-5L5 21"/>
          </svg>
        </div>
        <div class="search-result-info">
          <div class="search-result-brand">${highlight(p.brand, query)}</div>
          <div class="search-result-name">${highlight(p.name, query)}</div>
          <div class="search-result-price">${p.price}</div>
          ${p.badge ? `<div class="search-result-badge">${p.badge}</div>` : ''}
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(15,15,15,.25)" stroke-width="2">
          <path d="m9 18 6-6-6-6"/>
        </svg>
      </div>`;
  });

  searchResults.innerHTML = html;
}

/* ══════════════════════════════════════
   FLIP CARDS — exclusivo de nosotros.html
   - Click en frente → flip al reverso
   - Links sociales → navegan sin flipear
   - "← toca para volver" → flip de vuelta
   - ESC → cierra la tarjeta activa
══════════════════════════════════════ */

/**
 * Inicializa las flip cards del equipo.
 * Solo una tarjeta puede estar volteada a la vez.
 */
function initFlipCards() {
  const flipCards = document.querySelectorAll('.flip-card');
  let activeCard  = null;

  flipCards.forEach(card => {
    const front    = card.querySelector('.flip-card-front');
    const backHint = card.querySelector('.flip-card-back-hint');

    // Click en el frente voltea la tarjeta y colapsa la anterior si había una
    front.addEventListener('click', e => {
      e.stopPropagation();
      if (activeCard && activeCard !== card) activeCard.classList.remove('flipped');
      card.classList.add('flipped');
      activeCard = card;
    });

    // Click en el hint "← toca para volver" regresa al frente
    if (backHint) {
      backHint.addEventListener('click', e => {
        e.stopPropagation();
        card.classList.remove('flipped');
        activeCard = null;
      });
    }

    // Los links sociales no propagan el click para evitar voltear la tarjeta
    card.querySelectorAll('.flip-card-link').forEach(link => {
      link.addEventListener('click', e => e.stopPropagation());
    });
  });

  // ESC cierra la tarjeta activa sin necesidad de hacer click
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && activeCard) {
      activeCard.classList.remove('flipped');
      activeCard = null;
    }
  });
}

/* ══════════════════════════════════════
   SCROLL REVEAL — IntersectionObserver
   Re-ejecuta la animación en cada pasada del scroll (Design System v4)
══════════════════════════════════════ */

/**
 * Observa todos los elementos .reveal y aplica/quita la clase .visible
 * según entren o salgan del viewport.
 */
function initScrollReveal() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      } else {
        // Quitar la clase permite que la animación se repita al volver a pasar
        entry.target.classList.remove('visible');
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
}
