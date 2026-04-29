/**
 * navbar_v1.js — HERA
 *
 * Descripción: Componente universal del navbar. Carga el fragmento HTML
 *              desde /components/navbar.html, lo inyecta en el placeholder
 *              de la página y luego inicializa toda su lógica:
 *              menú móvil, dropdowns, estado de sesión, buscador, logo,
 *              badges de carrito/favoritos y enlace activo por URL.
 * Exporta:     loadNavbar, initNavbar, renderAccountNav,
 *              updateCartBadge, updateFavBadge, setCatalog
 * Importado por: js/pages/index.js y todos los demás scripts de página.
 */
 
import { isLoggedIn, clearLogin, getCart, getFavs } from '../utils/storage.js';
import { CATALOG } from '../utils/catalog.js';
 
/* ── Catálogo de productos para el buscador ──────────────────── */
let _catalog = CATALOG;
 
/* ── Guard — evita cargar el navbar más de una vez ───────────── */
let navbarLoaded = false;
 
/* ── Referencias globales — se asignan en initNavbar() ──────── */
let accountToggle   = null;
let accountLoginBtn = null;
let accountDropdown = null;
let favToggle       = null;
let favDropdown     = null;
let cartBadge       = null;
let favBadge        = null;
 
/* Referencia a closeMobileNav — se asigna en _initMobileNav para que logout la use */
let _closeMobileNav = function() {};
 
/* ══════════════════════════════════════
   BADGES — carrito y favoritos
══════════════════════════════════════ */
 
/**
 * Lee el carrito desde storage y actualiza el contador del navbar.
 * @returns {void}
 */
function updateCartBadge() {
  if (!cartBadge) return;
  const count = getCart().reduce((total, item) => total + (item.qty || 1), 0);
  cartBadge.textContent    = count;
  cartBadge.style.display  = count > 0 ? 'flex' : 'none';
}
 
/**
 * Lee los favoritos desde storage y actualiza el contador del navbar.
 * @returns {void}
 */
function updateFavBadge() {
  if (!favBadge) return;
  const count = getFavs().length;
  favBadge.textContent   = count;
  favBadge.style.display = count > 0 ? 'flex' : 'none';
}
 
/* ══════════════════════════════════════
   SESIÓN — cuenta nav
══════════════════════════════════════ */
 
/**
 * Renderiza los controles de cuenta según el estado de sesión actual.
 * Pública para que otras páginas puedan actualizar el navbar tras login/logout.
 * @returns {void}
 */
function renderAccountNav() {
  if (!accountToggle || !accountLoginBtn) return;
 
  if (isLoggedIn()) {
    accountLoginBtn.style.display = 'none';
    accountToggle.style.display   = 'flex';
  } else {
    accountLoginBtn.style.display = 'flex';
    accountToggle.style.display   = 'none';
    if (accountDropdown) accountDropdown.style.display = 'none';
  }
}
 
/* ══════════════════════════════════════
   BÚSQUEDA
══════════════════════════════════════ */
 
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
 
/* ══════════════════════════════════════
   MENÚ MÓVIL
══════════════════════════════════════ */
 
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
 
  if (mobileClose)   mobileClose.addEventListener('click', closeMobileNav);
  if (mobileOverlay) mobileOverlay.addEventListener('click', closeMobileNav);
 
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
 
  // Navegación al catálogo desde los items de Productos
  const navItemPerfumes = document.getElementById('nav-item-perfumes');
  const navItemJoyeria  = document.getElementById('nav-item-joyeria');
  if (navItemPerfumes) {
    navItemPerfumes.addEventListener('click', function(e) {
      if (!e.target.closest('a')) location.href = '/pages/catalogo.html?tab=perfumes';
    });
  }
  if (navItemJoyeria) {
    navItemJoyeria.addEventListener('click', function(e) {
      if (!e.target.closest('a')) location.href = '/pages/catalogo.html?tab=joyeria';
    });
  }
 
  // Exponer closeMobileNav para que logout pueda usarla
  _closeMobileNav = closeMobileNav;
}
 
/* ══════════════════════════════════════
   CUENTA — dropdown desktop
══════════════════════════════════════ */
 
/**
 * Inicializa el dropdown de cuenta (desktop) y el botón de logout.
 * @returns {void}
 */
function _initAccountNav() {
  const btnLogout       = document.getElementById('btn-logout');
  const btnLogoutMobile = document.getElementById('btn-logout-mobile');
 
  if (!accountToggle) return;
 
  // Toggle dropdown al clicar en el botón de cuenta
  accountToggle.addEventListener('click', function(e) {
    e.stopPropagation();
    if (favDropdown) favDropdown.style.display = 'none';
    accountDropdown.style.display =
      accountDropdown.style.display === 'block' ? 'none' : 'block';
  });
 
  // Evitar que un clic dentro del dropdown lo cierre
  if (accountDropdown) {
    accountDropdown.addEventListener('click', function(e) { e.stopPropagation(); });
  }
 
  function doLogout() {
    clearLogin();
    if (accountDropdown) accountDropdown.style.display = 'none';
    renderAccountNav();
  }
 
  if (btnLogout) {
    btnLogout.addEventListener('click', function(e) { e.preventDefault(); doLogout(); });
  }
  if (btnLogoutMobile) {
    btnLogoutMobile.addEventListener('click', function(e) {
      e.preventDefault();
      doLogout();
      _closeMobileNav();
    });
  }
}
 
/* ══════════════════════════════════════
   DROPDOWN DE FAVORITOS (desktop)
══════════════════════════════════════ */
 
/**
 * Inicializa el toggle del dropdown de favoritos desktop.
 * @returns {void}
 */
function _initFavDropdown() {
  if (!favToggle) return;
 
  favToggle.addEventListener('click', function(e) {
    e.stopPropagation();
    if (accountDropdown) accountDropdown.style.display = 'none';
    favDropdown.style.display =
      favDropdown.style.display === 'block' ? 'none' : 'block';
  });
 
  if (favDropdown) {
    favDropdown.addEventListener('click', function(e) { e.stopPropagation(); });
  }
}
 
/* ══════════════════════════════════════
   ENLACE ACTIVO — según URL actual
══════════════════════════════════════ */
 
/**
 * Marca el enlace del navbar que corresponde a la página actual.
 * @returns {void}
 */
function setActiveNavLink() {
  const currentPath = window.location.pathname;
  document.querySelectorAll('.nav-links a, .nav-mobile-link').forEach(link => {
    const href = link.getAttribute('href');
    if (!href || href === '#') return;
    link.classList.remove('active');
    const linkPath = href.split('?')[0];
    if (linkPath !== '' && currentPath.includes(linkPath)) {
      link.classList.add('active');
    }
  });
}
 
/* ══════════════════════════════════════
   CIERRE DE DROPDOWNS AL CLICAR FUERA
══════════════════════════════════════ */
 
/**
 * Cierra todos los dropdowns al clicar fuera de ellos.
 * @returns {void}
 */
function _initOutsideClick() {
  document.addEventListener('click', function() {
    if (accountDropdown) accountDropdown.style.display = 'none';
    if (favDropdown)     favDropdown.style.display     = 'none';
  });
}
 
/* ══════════════════════════════════════
   INIT — post-inyección del HTML
══════════════════════════════════════ */
 
/**
 * Asigna las referencias globales e inicializa toda la lógica del navbar
 * después de que el HTML ha sido inyectado en el DOM.
 * Puede llamarse externamente si el HTML se inyecta por otra vía.
 * @returns {void}
 */
function initNavbar() {
  accountToggle   = document.getElementById('account-toggle');
  accountLoginBtn = document.getElementById('account-login-btn');
  accountDropdown = document.getElementById('account-dropdown');
  favToggle       = document.getElementById('fav-toggle');
  favDropdown     = document.getElementById('fav-dropdown');
  cartBadge       = document.getElementById('cart-count');
  favBadge        = document.getElementById('fav-count');
 
  _initSearch();
  _initMobileNav();
  renderAccountNav();
  _initAccountNav();
  _initFavDropdown();
  _initOutsideClick();
  setActiveNavLink();
  updateCartBadge();
  updateFavBadge();
}
 
/* ══════════════════════════════════════
   CARGA DEL HTML
══════════════════════════════════════ */
 
/**
 * Carga el fragmento HTML del navbar desde /components/navbar.html,
 * lo inserta en #navbar-placeholder e inicializa toda la lógica.
 * Incluye guard para evitar doble carga.
 * @returns {Promise<void>}
 */
async function loadNavbar() {
  if (navbarLoaded) return;
 
  const placeholder = document.getElementById('navbar-placeholder');
  if (!placeholder) return;
 
  const response = await fetch('/components/navbar.html');
  const html     = await response.text();
  placeholder.innerHTML = html;
 
  navbarLoaded = true;
  initNavbar();
}
 
/* ══════════════════════════════════════
   UTILIDADES PÚBLICAS
══════════════════════════════════════ */
 
/**
 * Reemplaza el catálogo usado por el buscador.
 * Útil si el catálogo se carga de forma asíncrona.
 * @param {Array<Object>} catalog - Nuevo catálogo de productos
 * @returns {void}
 */
function setCatalog(catalog) {
  _catalog = catalog;
}
 
export { loadNavbar, initNavbar, renderAccountNav, updateCartBadge, updateFavBadge, setCatalog };