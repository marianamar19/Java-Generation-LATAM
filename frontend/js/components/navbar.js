/**
 * navbar.js — HERA
 *
 * Descripción: Componente universal del navbar. Carga el fragmento HTML
 *              desde /components/navbar.html, lo inyecta en el placeholder
 *              de la página y luego inicializa toda su lógica:
 *              menú móvil, dropdowns, estado de sesión, buscador y logo.
 * Exporta:     loadNavbar, setCatalog
 * Importado por: js/pages/index.js y todos los demás scripts de página.
 */

import { isLoggedIn, clearLogin } from '../utils/storage.js';
import { CATALOG }               from '../utils/catalog.js';

/* Catálogo de productos para el buscador — cargado desde utils/catalog.js */
let _catalog = CATALOG;

/**
 * Carga el fragmento HTML del navbar desde /components/navbar.html,
 * lo inserta en #navbar-placeholder e inicializa toda la lógica.
 * @returns {Promise<void>}
 */
async function loadNavbar() {
  const placeholder = document.getElementById('navbar-placeholder');
  if (!placeholder) return;

  const response = await fetch('/components/navbar.html');
  const html     = await response.text();
  placeholder.innerHTML = html;

  // Inicializar lógica después de que el HTML está en el DOM
  _initSearch();
  _initMobileNav();
  _initAccountNav();
  _initFavDropdown();
}

/* ── Búsqueda ─────────────────────────────────────────────────── */

/**
 * Inicializa el search overlay: abrir, cerrar, debounce y render de resultados.
 * @returns {void}
 */
function _initSearch() {
  const searchOverlay  = document.getElementById('search-overlay');
  const searchInput    = document.getElementById('search-input');
  const searchResults  = document.getElementById('search-results');
  const searchCloseBtn = document.getElementById('search-close-btn');
  const searchBtn      = document.getElementById('search-btn');

  if (!searchOverlay || !searchBtn) return;

  function openSearch() {
    searchOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    // Pequeño delay para que la animación CSS del input termine antes de focus
    setTimeout(function() { searchInput.focus(); }, 300);
  }

  function closeSearch() {
    searchOverlay.classList.remove('open');
    document.body.style.overflow = '';
    searchInput.value = '';
    _renderSearchResults('', searchResults);
  }

  searchBtn.addEventListener('click', openSearch);
  searchCloseBtn.addEventListener('click', closeSearch);

  // Cerrar al hacer clic fuera del search-box
  searchOverlay.addEventListener('click', function(e) {
    if (e.target === searchOverlay) closeSearch();
  });

  // Cerrar con Escape
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeSearch();
  });

  // Delegación de clicks en resultados — cierra el overlay al elegir
  searchResults.addEventListener('click', function(e) {
    if (e.target.closest('.search-result-item')) closeSearch();
  });

  // Debounce para no disparar render en cada keystroke
  let searchDebounce;
  searchInput.addEventListener('input', function() {
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(function() {
      _renderSearchResults(searchInput.value, searchResults);
    }, 180);
  });
}

/**
 * Resalta la query dentro de un texto con <mark class="search-highlight">.
 * @param {string} text  - Texto original
 * @param {string} query - Término de búsqueda
 * @returns {string} HTML con el término resaltado
 */
function _highlight(text, query) {
  if (!query) return text;
  const re = new RegExp('(' + query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
  return text.replace(re, '<mark class="search-highlight">$1</mark>');
}

/**
 * Filtra el catálogo y renderiza los resultados en el contenedor.
 * @param {string}      query     - Texto de búsqueda
 * @param {HTMLElement} container - Elemento donde inyectar los resultados
 * @returns {void}
 */
function _renderSearchResults(query, container) {
  const q = query.trim().toLowerCase();

  if (!q) {
    container.innerHTML = '<p class="search-hint">Busca por nombre o marca</p>';
    return;
  }

  const hits = _catalog.filter(function(p) {
    return (
      p.name.toLowerCase().includes(q)  ||
      p.brand.toLowerCase().includes(q) ||
      (p.tags && p.tags.some(function(t) { return t.includes(q); }))
    );
  });

  if (hits.length === 0) {
    container.innerHTML =
      '<div class="search-empty">' +
        '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/><path d="M8 11h6M11 8v6" opacity=".4"/></svg>' +
        '<p>Sin resultados para "<strong>' + query + '</strong>"</p>' +
      '</div>';
    return;
  }

  let html = '<p class="search-hint">' + hits.length + ' resultado' + (hits.length !== 1 ? 's' : '') + '</p>';

  hits.forEach(function(p) {
    html +=
      '<div class="search-result-item">' +
        '<div class="search-result-thumb">' +
          '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(249,249,249,.3)" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>' +
        '</div>' +
        '<div class="search-result-info">' +
          '<div class="search-result-brand">'  + _highlight(p.brand, query) + '</div>' +
          '<div class="search-result-name">'   + _highlight(p.name,  query) + '</div>' +
          '<div class="search-result-price">'  + p.price + '</div>' +
          (p.badge ? '<div class="search-result-badge">' + p.badge + '</div>' : '') +
        '</div>' +
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(15,15,15,.25)" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>' +
      '</div>';
  });

  container.innerHTML = html;
}

/* ── Menú móvil ──────────────────────────────────────────────── */

/**
 * Inicializa el panel lateral de navegación móvil:
 * hamburger, overlay, cierre y acordeones de submenús.
 * @returns {void}
 */
function _initMobileNav() {
  const hamburger     = document.getElementById('navHamburger');
  const mobilePanel   = document.getElementById('navMobilePanel');
  const mobileOverlay = document.getElementById('navMobileOverlay');
  const mobileClose   = document.getElementById('navMobileClose');

  if (!hamburger) return;

  function openMobileNav() {
    hamburger.classList.add('open');
    mobilePanel.classList.add('open');
    mobileOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileNav() {
    hamburger.classList.remove('open');
    mobilePanel.classList.remove('open');
    mobileOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', function(e) {
    e.stopPropagation();
    mobilePanel.classList.contains('open') ? closeMobileNav() : openMobileNav();
  });

  mobileClose.addEventListener('click', closeMobileNav);
  mobileOverlay.addEventListener('click', closeMobileNav);

  // Acordeón de "Productos" en el panel móvil
  const productosToggle = document.getElementById('mobileProductosToggle');
  const productosSub    = document.getElementById('mobileProductosSub');
  if (productosToggle) {
    productosToggle.addEventListener('click', function(e) {
      e.stopPropagation();
      productosSub.classList.toggle('open');
      productosToggle.classList.toggle('active');
    });
  }

  // Acordeón de "Mi cuenta" en el panel móvil — solo activo si hay sesión
  const cuentaToggle = document.getElementById('mobileCuentaToggle');
  const cuentaSub    = document.getElementById('mobileCuentaSub');
  if (cuentaToggle) {
    cuentaToggle.addEventListener('click', function(e) {
      e.stopPropagation();
      cuentaSub.classList.toggle('open');
      cuentaToggle.classList.toggle('active');
    });
  }

  // Logo en el panel: scroll al topo si estamos en index
  const navLogoLink = document.getElementById('nav-logo-link');
  if (navLogoLink) {
    navLogoLink.addEventListener('click', function(e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Dropdown de Perfumes y Joyería navegan al catálogo al clic en el item padre
  const navItemPerfumes = document.getElementById('nav-item-perfumes');
  const navItemJoyeria  = document.getElementById('nav-item-joyeria');
  if (navItemPerfumes) {
    navItemPerfumes.addEventListener('click', function(e) {
      if (!e.target.closest('a')) location.href = 'catalogo.html?tab=perfumes';
    });
  }
  if (navItemJoyeria) {
    navItemJoyeria.addEventListener('click', function(e) {
      if (!e.target.closest('a')) location.href = 'catalogo.html?tab=joyeria';
    });
  }

  // Exponer closeMobileNav al scope del módulo para que logout pueda llamarla
  _closeMobileNav = closeMobileNav;
}

/* Referencia a closeMobileNav — se asigna en _initMobileNav para que logout la use */
let _closeMobileNav = function() {};

/* ── Estado de sesión ────────────────────────────────────────── */

/**
 * Inicializa los controles de cuenta (dropdown desktop + links móvil)
 * y configura los botones de logout.
 * @returns {void}
 */
function _initAccountNav() {
  const accountLoginBtn      = document.getElementById('account-login-btn');
  const accountToggle        = document.getElementById('account-toggle');
  const accountDropdown      = document.getElementById('account-dropdown');
  const favDropdown          = document.getElementById('fav-dropdown');
  const btnLogout            = document.getElementById('btn-logout');
  const btnLogoutMobile      = document.getElementById('btn-logout-mobile');
  const mobileCuentaLoginLink = document.getElementById('mobileCuentaLoginLink');
  const mobileCuentaToggle   = document.getElementById('mobileCuentaToggle');

  if (!accountLoginBtn) return;

  // Renderiza los controles de cuenta según el estado de sesión
  function renderAccountNav() {
    if (isLoggedIn()) {
      // Desktop: dropdown de cuenta
      accountLoginBtn.style.display   = 'none';
      accountToggle.style.display     = 'flex';
      // Móvil: acordeón de cuenta
      mobileCuentaLoginLink.style.display = 'none';
      mobileCuentaToggle.style.display    = 'flex';
    } else {
      // Desktop: link directo a cuenta.html
      accountLoginBtn.style.display   = 'flex';
      accountToggle.style.display     = 'none';
      accountDropdown.style.display   = 'none';
      // Móvil: link directo a cuenta.html
      mobileCuentaLoginLink.style.display = 'flex';
      mobileCuentaToggle.style.display    = 'none';
    }
  }

  function logout() {
    clearLogin();
    accountDropdown.style.display = 'none';
    renderAccountNav();
  }

  renderAccountNav();

  // Toggle dropdown al clicar en el botón de cuenta
  if (accountToggle) {
    accountToggle.addEventListener('click', function(e) {
      e.stopPropagation();
      // Cerrar favoritos si estaba abierto para evitar solapamiento
      if (favDropdown) favDropdown.style.display = 'none';
      accountDropdown.style.display =
        accountDropdown.style.display === 'block' ? 'none' : 'block';
    });
    // Evitar que un clic dentro del dropdown lo cierre
    accountDropdown.addEventListener('click', function(e) { e.stopPropagation(); });
  }

  if (btnLogout) {
    btnLogout.addEventListener('click', function(e) { e.preventDefault(); logout(); });
  }
  if (btnLogoutMobile) {
    btnLogoutMobile.addEventListener('click', function(e) {
      e.preventDefault();
      logout();
      _closeMobileNav();
    });
  }

  // Cerrar dropdowns al clicar fuera
  document.addEventListener('click', function() {
    if (accountDropdown) accountDropdown.style.display = 'none';
    if (favDropdown)     favDropdown.style.display     = 'none';
  });
}

/* ── Dropdown de favoritos (desktop) ────────────────────────── */

/**
 * Inicializa el toggle del dropdown de favoritos desktop.
 * La lógica de render de filas la maneja fav-drawer.js.
 * @returns {void}
 */
function _initFavDropdown() {
  const favToggle   = document.getElementById('fav-toggle');
  const favDropdown = document.getElementById('fav-dropdown');
  const accountDropdown = document.getElementById('account-dropdown');

  if (!favToggle) return;

  favToggle.addEventListener('click', function(e) {
    e.stopPropagation();
    // Cerrar dropdown de cuenta si estaba abierto
    if (accountDropdown) accountDropdown.style.display = 'none';
    favDropdown.style.display =
      favDropdown.style.display === 'block' ? 'none' : 'block';
  });

  // Evitar que un clic dentro del dropdown lo cierre
  favDropdown.addEventListener('click', function(e) { e.stopPropagation(); });
}

export { loadNavbar };