/**
 * navbar.js — HERA
 *
 * Descripción: Carga el fragmento HTML del navbar desde components/navbar.html,
 *   lo inyecta en #navbar-placeholder e inicializa toda su lógica:
 *   menú móvil, acordeones, estado activo de links, sesión de usuario
 *   y cierre de dropdowns al hacer clic fuera.
 *
 * Exporta: loadNavbar
 * Importado por: js/pages/catalogo.js y todas las páginas excepto cuenta.html
 */

import { isLoggedIn, logout } from '../utils/storage.js';

/**
 * Carga el navbar en #navbar-placeholder e inicializa su lógica.
 * Debe llamarse una sola vez al inicio del script de la página.
 * @returns {Promise<void>}
 */
async function loadNavbar() {
  const placeholder = document.getElementById('navbar-placeholder');
  if (!placeholder) return;

  // Calcula la ruta base relativa al archivo JS para que funcione
  // independientemente de desde qué carpeta apunte Live Server
  const base = new URL('../..', import.meta.url).href;
  const response = await fetch(base + '/components/navbar.html');
  const html = await response.text();
  placeholder.innerHTML = html;

  // Inicializa la lógica una vez que el HTML está en el DOM
  _initMobileMenu();
  _initNavDropdowns();
  _initAccountState();
  _initActiveLinks();
}

// ── Menú hamburguesa móvil ────────────────────────────────────

/**
 * Inicializa el menú móvil: apertura, cierre y acordeón de submenús.
 * @private
 */
function _initMobileMenu() {
  const hamburger   = document.getElementById('navHamburger');
  const mobilePanel = document.getElementById('navMobilePanel');
  const overlay     = document.getElementById('navMobileOverlay');
  const closeBtn    = document.getElementById('navMobileClose');

  if (!hamburger) return;

  function openMobileNav() {
    hamburger.classList.add('open');
    mobilePanel.classList.add('open');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileNav() {
    hamburger.classList.remove('open');
    mobilePanel.classList.remove('open');
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', (e) => {
    e.stopPropagation();
    mobilePanel.classList.contains('open') ? closeMobileNav() : openMobileNav();
  });
  if (closeBtn)  closeBtn.addEventListener('click', closeMobileNav);
  if (overlay)   overlay.addEventListener('click', closeMobileNav);

  // Acordeón Productos en móvil
  const productosToggle = document.getElementById('mobileProductosToggle');
  const productosSub    = document.getElementById('mobileProductosSub');
  if (productosToggle) {
    productosToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      productosSub.classList.toggle('open');
      productosToggle.classList.toggle('active');
    });
  }

  // Acordeón Mi cuenta en móvil — solo activo cuando hay sesión (renderAccountNav lo controla)
  const cuentaToggle = document.getElementById('mobileCuentaToggle');
  const cuentaSub    = document.getElementById('mobileCuentaSub');
  if (cuentaToggle) {
    cuentaToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      cuentaSub.classList.toggle('open');
      cuentaToggle.classList.toggle('active');
    });
  }

  // Exponer closeMobileNav para que otros módulos (logout móvil) puedan llamarla
  window._closeMobileNav = closeMobileNav;
}

// ── Nav dropdowns desktop ─────────────────────────────────────

/**
 * Inicializa los clicks en los items del dropdown de Perfumes y Joyería
 * que navegan al catálogo al hacer clic fuera de los links internos.
 * @private
 */
function _initNavDropdowns() {
  const navItemPerfumes = document.getElementById('nav-item-perfumes');
  const navItemJoyeria  = document.getElementById('nav-item-joyeria');

  if (navItemPerfumes) {
    navItemPerfumes.addEventListener('click', (e) => {
      if (!e.target.closest('a')) location.href = '/pages/catalogo.html?tab=perfumes';
    });
  }
  if (navItemJoyeria) {
    navItemJoyeria.addEventListener('click', (e) => {
      if (!e.target.closest('a')) location.href = '/pages/catalogo.html?tab=joyeria';
    });
  }
}

// ── Estado de sesión ──────────────────────────────────────────

/**
 * Sincroniza el navbar con el estado de sesión actual (localStorage).
 * Muestra el botón de login o el dropdown de cuenta según corresponda.
 * @private
 */
function _initAccountState() {
  const accountToggle         = document.getElementById('account-toggle');
  const accountLoginBtn       = document.getElementById('account-login-btn');
  const accountDropdown       = document.getElementById('account-dropdown');
  const favDropdown           = document.getElementById('fav-dropdown');
  const btnLogout             = document.getElementById('btn-logout');
  const btnLogoutMobile       = document.getElementById('btn-logout-mobile');
  const mobileCuentaToggle    = document.getElementById('mobileCuentaToggle');
  const mobileCuentaLoginLink = document.getElementById('mobileCuentaLoginLink');

  function renderAccountNav() {
    if (isLoggedIn()) {
      // Desktop: mostrar dropdown de cuenta, ocultar link de login
      if (accountLoginBtn) accountLoginBtn.style.display = 'none';
      if (accountToggle)   accountToggle.style.display   = 'flex';
      // Móvil: mostrar acordeón, ocultar link directo
      if (mobileCuentaLoginLink) mobileCuentaLoginLink.style.display = 'none';
      if (mobileCuentaToggle)    mobileCuentaToggle.style.display    = 'flex';
    } else {
      // Desktop: mostrar link directo a cuenta.html
      if (accountLoginBtn) accountLoginBtn.style.display = 'flex';
      if (accountToggle)   accountToggle.style.display   = 'none';
      if (accountDropdown) accountDropdown.style.display = 'none';
      // Móvil: mostrar link directo
      if (mobileCuentaLoginLink) mobileCuentaLoginLink.style.display = 'flex';
      if (mobileCuentaToggle)    mobileCuentaToggle.style.display    = 'none';
    }
  }

  renderAccountNav();

  // Toggle del dropdown de cuenta en desktop
  if (accountToggle) {
    accountToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      if (favDropdown) favDropdown.style.display = 'none';
      accountDropdown.style.display =
        accountDropdown.style.display === 'block' ? 'none' : 'block';
    });
    accountDropdown.addEventListener('click', (e) => e.stopPropagation());
  }

  // Logout desktop
  if (btnLogout) {
    btnLogout.addEventListener('click', (e) => {
      e.preventDefault();
      logout();
      renderAccountNav();
    });
  }

  // Logout móvil — también cierra el panel
  if (btnLogoutMobile) {
    btnLogoutMobile.addEventListener('click', (e) => {
      e.preventDefault();
      logout();
      renderAccountNav();
      if (window._closeMobileNav) window._closeMobileNav();
    });
  }

  // Cierra dropdowns al hacer clic en cualquier otra parte del documento
  document.addEventListener('click', () => {
    if (accountDropdown) accountDropdown.style.display = 'none';
    if (favDropdown)     favDropdown.style.display     = 'none';
  });
}

// ── Link activo ───────────────────────────────────────────────

/**
 * Marca como activo el link del navbar que corresponde a la página actual.
 * Compara el pathname de la URL con el href de cada link data-nav.
 * @private
 */
function _initActiveLinks() {
  const currentPath = window.location.pathname;

  // Links desktop
  document.querySelectorAll('.nav-links a[data-nav]').forEach((link) => {
    if (currentPath.includes(link.getAttribute('href').replace('/pages/', ''))) {
      link.classList.add('active');
    }
  });

  // Links móvil
  document.querySelectorAll('.nav-mobile-link[data-nav]').forEach((link) => {
    if (currentPath.includes(link.getAttribute('href').replace('/pages/', ''))) {
      link.classList.add('active');
    }
  });

  // En catálogo, "Productos" es el link activo (no tiene href directo)
  if (currentPath.includes('catalogo')) {
    const productosLink = document.querySelector('.nav-links a[data-nav="productos"]');
    if (productosLink) productosLink.classList.add('active');
    const mobileProductosToggle = document.getElementById('mobileProductosToggle');
    if (mobileProductosToggle) mobileProductosToggle.classList.add('active');
  }
}

export { loadNavbar };
