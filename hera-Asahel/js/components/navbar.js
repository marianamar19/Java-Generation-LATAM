/**
 * navbar.js — HERA
 *
 * Descripción: Componente universal del navbar. Carga el fragmento HTML
 *              desde components/navbar.html vía fetch e inicializa toda
 *              su lógica: menú móvil con acordeones, estado activo del
 *              enlace actual, dropdowns de cuenta y cierre de sesión.
 * Exporta: loadNavbar
 * Importado por: js/pages/*.js (todas las páginas excepto cuenta.html)
 */

import { isLoggedIn, logout as doLogout } from '../utils/storage.js';

/**
 * Carga el navbar en el elemento #navbar-placeholder de la página
 * e inicializa su lógica una vez insertado en el DOM.
 * @returns {Promise<void>}
 */
async function loadNavbar() {
  const placeholder = document.getElementById('navbar-placeholder');
  if (!placeholder) return;

  const response = await fetch('/components/navbar.html');
  const html = await response.text();
  placeholder.innerHTML = html;

  // Inicializa toda la lógica después de que el HTML está en el DOM
  initNavbar();
}

/**
 * Inicializa la lógica completa del navbar una vez que el HTML está insertado.
 * Incluye: menú hamburguesa, acordeones móviles, estado de sesión,
 * dropdowns de cuenta y cierre global al hacer click fuera.
 */
function initNavbar() {
  _initMobileMenu();
  _initDropdownNav();
  _initAccountSession();
}

/**
 * Inicializa el menú hamburguesa y el panel lateral móvil.
 * Gestiona apertura, cierre y acordeones de submenús.
 */
function _initMobileMenu() {
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

  hamburger.addEventListener('click', (e) => {
    e.stopPropagation();
    mobilePanel.classList.contains('open') ? closeMobileNav() : openMobileNav();
  });
  mobileClose?.addEventListener('click', closeMobileNav);
  mobileOverlay?.addEventListener('click', closeMobileNav);

  // Acordeón Productos en móvil
  const productosToggle = document.getElementById('mobileProductosToggle');
  const productosSub    = document.getElementById('mobileProductosSub');
  productosToggle?.addEventListener('click', (e) => {
    e.stopPropagation();
    productosSub?.classList.toggle('open');
    productosToggle.classList.toggle('active');
  });

  // Acordeón Mi cuenta en móvil — solo activo si hay sesión
  const cuentaToggle = document.getElementById('mobileCuentaToggle');
  const cuentaSub    = document.getElementById('mobileCuentaSub');
  cuentaToggle?.addEventListener('click', (e) => {
    e.stopPropagation();
    cuentaSub?.classList.toggle('open');
    cuentaToggle.classList.toggle('active');
  });

  // Expone closeMobileNav para que otros módulos puedan cerrar el panel
  window._closeHeraMobileNav = closeMobileNav;
}

/**
 * Inicializa los dropdowns del nav desktop (Perfumes, Joyería).
 * Los ítems del dropdown navegan al catálogo al hacer click en el área del ítem.
 */
function _initDropdownNav() {
  const navItemPerfumes = document.getElementById('nav-item-perfumes');
  const navItemJoyeria  = document.getElementById('nav-item-joyeria');

  navItemPerfumes?.addEventListener('click', (e) => {
    if (!e.target.closest('a')) location.href = 'catalogo.html?tab=perfumes';
  });
  navItemJoyeria?.addEventListener('click', (e) => {
    if (!e.target.closest('a')) location.href = 'catalogo.html?tab=joyeria';
  });

  // Marca el enlace activo según la URL actual
  const currentPath = location.pathname.split('/').pop();
  document.querySelectorAll('.nav-links a, .nav-mobile-link').forEach((link) => {
    const href = link.getAttribute('href');
    if (href && href !== '#' && href.includes(currentPath)) {
      link.classList.add('active');
    }
  });
}

/**
 * Inicializa la lógica de sesión del navbar: muestra/oculta botones
 * según si hay sesión activa, y gestiona el cierre de sesión.
 */
function _initAccountSession() {
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
      if (accountLoginBtn) accountLoginBtn.style.display = 'none';
      if (accountToggle)   accountToggle.style.display   = 'flex';
      if (mobileCuentaLoginLink) mobileCuentaLoginLink.style.display = 'none';
      if (mobileCuentaToggle)    mobileCuentaToggle.style.display    = 'flex';
    } else {
      if (accountLoginBtn)  accountLoginBtn.style.display  = 'flex';
      if (accountToggle)    accountToggle.style.display    = 'none';
      if (accountDropdown)  accountDropdown.style.display  = 'none';
      if (mobileCuentaLoginLink) mobileCuentaLoginLink.style.display = 'flex';
      if (mobileCuentaToggle)    mobileCuentaToggle.style.display    = 'none';
    }
  }

  function handleLogout() {
    doLogout();
    if (accountDropdown) accountDropdown.style.display = 'none';
    renderAccountNav();
  }

  // Renderiza el estado inicial de sesión
  renderAccountNav();

  accountToggle?.addEventListener('click', (e) => {
    e.stopPropagation();
    if (favDropdown) favDropdown.style.display = 'none';
    if (accountDropdown) {
      accountDropdown.style.display = accountDropdown.style.display === 'block' ? 'none' : 'block';
    }
  });
  accountDropdown?.addEventListener('click', (e) => e.stopPropagation());

  btnLogout?.addEventListener('click', (e) => { e.preventDefault(); handleLogout(); });
  btnLogoutMobile?.addEventListener('click', (e) => {
    e.preventDefault();
    handleLogout();
    window._closeHeraMobileNav?.();
  });

  // Cierra dropdowns al hacer click fuera del nav
  document.addEventListener('click', () => {
    if (accountDropdown) accountDropdown.style.display = 'none';
    if (favDropdown)     favDropdown.style.display     = 'none';
  });
}

export { loadNavbar };
