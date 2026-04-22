/**
 * contacto.js — HERA
 *
 * Descripción: Script exclusivo de la página de Contacto.
 *              Inicializa todos los componentes universales
 *              (navbar, footer, carrito, favoritos, búsqueda)
 *              y la lógica específica de esta página:
 *              selector de asunto, validación del formulario,
 *              simulación de envío y scroll reveal.
 * Exporta: (ninguno — script de entrada)
 * Importado por: pages/contacto.html vía <script type="module">
 */

import { loadNavbar }      from '../components/navbar.js';
import { initCartDrawer }  from '../components/cart-drawer.js';
import { initFavDrawer }   from '../components/fav-drawer.js';
import { highlightQuery }  from '../utils/formatter.js';

/* ── TEMPORAL — catálogo hardcodeado por ausencia de backend ────
   Reemplazar por fetch() a la API cuando el backend esté listo.
   Endpoint esperado: GET /api/productos
   ──────────────────────────────────────────────────────────── */
const CATALOG = [
  { id:'jenny-1',      brand:'Jenny Rivera',        name:'Inolvidable EDP',  price:'$1,210 MXN', badge:'Más vendido',  tags:['floral','femenino'] },
  { id:'fierce-2',     brand:'Abercrombie & Fitch',  name:'Fierce EDT',       price:'$760 MXN',   tags:['fresco','masculino'] },
  { id:'authentic-3',  brand:'Abercrombie & Fitch',  name:'Authentic EDP',    price:'$975 MXN',   badge:'Ed. limitada', tags:['amaderado'] },
  { id:'signature-4',  brand:'HERA Exclusivo',       name:'Signature Blanc',  price:'$1,490 MXN', badge:'Nuevo',        tags:['floral','blanco'] },
  { id:'noir-5',       brand:'HERA Exclusivo',       name:'Noir Absolu',      price:'$1,480 MXN', badge:'-20%',         tags:['oriental','amaderado'] },
  { id:'oud-6',        brand:'Hera Árabe',           name:'Oud Rose',         price:'$1,320 MXN', tags:['árabe','oud','oriental'] },
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

  // Lógica exclusiva de la página de Contacto
  initAsuntoSelector();
  initContactForm();

  // Scroll reveal para las clases .reveal de la página
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
    // Esperar a que termine la transición CSS antes de dar foco
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

  // Cerrar al seleccionar un resultado
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
   ASUNTO SELECTOR
   Lógica exclusiva de contacto.html
══════════════════════════════════════ */

/**
 * Inicializa el selector visual de asunto del formulario.
 * Al hacer click en un botón .asunto-opt se marca como seleccionado
 * y se actualiza el input hidden #asunto con su data-val.
 */
function initAsuntoSelector() {
  const asuntoOpts  = document.querySelectorAll('.asunto-opt');
  const asuntoInput = document.getElementById('asunto');

  if (!asuntoOpts.length || !asuntoInput) return;

  asuntoOpts.forEach(function(btn) {
    btn.addEventListener('click', function() {
      // Desmarcar todos antes de marcar el nuevo seleccionado
      asuntoOpts.forEach(function(b) { b.classList.remove('selected'); });
      btn.classList.add('selected');
      asuntoInput.value = btn.dataset.val;

      // Limpiar el error del campo asunto al hacer una selección
      document.getElementById('field-asunto').classList.remove('has-error');
    });
  });
}

/* ══════════════════════════════════════
   FORM VALIDATION + SUBMIT
   Lógica exclusiva de contacto.html
══════════════════════════════════════ */

/**
 * Inicializa la validación del formulario de contacto, el envío simulado
 * y el reseteo del formulario desde el estado de éxito.
 */
function initContactForm() {
  const form        = document.getElementById('contactForm');
  const formWrapper = document.getElementById('formWrapper');
  const formSuccess = document.getElementById('formSuccess');
  const formReset   = document.getElementById('formReset');
  const submitBtn   = document.getElementById('submitBtn');
  const submitText  = document.getElementById('submitText');

  if (!form) return;

  /**
   * Valida el formato de un email.
   * @param {string} v - Valor del campo email
   * @returns {boolean}
   */
  function validateEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
  }

  /**
   * Agrega o quita la clase has-error en un campo del formulario.
   * @param {string}  fieldId - ID del .form-field contenedor
   * @param {boolean} show    - true para mostrar el error
   */
  function setError(fieldId, show) {
    const el = document.getElementById(fieldId);
    if (el) el.classList.toggle('has-error', show);
  }

  // Validar y procesar el envío del formulario
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    const nombre  = document.getElementById('nombre').value.trim();
    const email   = document.getElementById('email').value.trim();
    const asunto  = document.getElementById('asunto').value;
    const mensaje = document.getElementById('mensaje').value.trim();

    let valid = true;

    setError('field-nombre',  !nombre);            if (!nombre)             valid = false;
    setError('field-email',   !validateEmail(email)); if (!validateEmail(email)) valid = false;
    setError('field-asunto',  !asunto);             if (!asunto)             valid = false;
    setError('field-mensaje', !mensaje);            if (!mensaje)            valid = false;

    if (!valid) return;

    /* TEMPORAL — simula envío con setTimeout.
       Reemplazar con fetch() al endpoint real.
       Endpoint esperado: POST /api/contacto → { ok: true } */
    submitBtn.disabled      = true;
    submitText.textContent  = 'Enviando…';
    // Reducir opacidad para reforzar el estado de carga visualmente
    submitBtn.style.opacity = '.6';

    setTimeout(function() {
      formWrapper.style.display = 'none';
      formSuccess.classList.add('show');
    }, 1200);
  });

  // Limpiar error de cada campo tan pronto el usuario empiece a escribir
  ['nombre', 'email', 'mensaje'].forEach(function(id) {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', function() { setError('field-' + id, false); });
  });

  // Resetear formulario y volver al estado inicial desde el mensaje de éxito
  formReset.addEventListener('click', function() {
    form.reset();
    document.querySelectorAll('.asunto-opt').forEach(function(b) { b.classList.remove('selected'); });
    document.getElementById('asunto').value = '';
    submitBtn.disabled      = false;
    submitText.textContent  = 'Enviar mensaje';
    submitBtn.style.opacity = '1';
    formSuccess.classList.remove('show');
    formWrapper.style.display = '';
  });
}

/* ══════════════════════════════════════
   SCROLL REVEAL — IntersectionObserver
   Replays cada vez que el elemento entra al viewport
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
