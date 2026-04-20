/**
 * navbar.js — HERA
 *
 * Descripción: Componente universal del navbar estándar.
 *              Carga el fragmento HTML desde components/navbar.html
 *              e inicializa toda la lógica: menú móvil, dropdowns,
 *              estado de sesión (cuenta) y marcado del enlace activo.
 * Exporta: loadNavbar
 * Importado por: js/pages/404.js y todas las páginas excepto cuenta.html
 */

import { isLoggedIn, logout } from '../utils/storage.js';

/**
 * Carga el navbar en el elemento #navbar-placeholder de la página.
 * Una vez inyectado el HTML, inicializa toda la lógica del componente.
 * @returns {Promise<void>}
 */
async function loadNavbar() {
  const placeholder = document.getElementById('navbar-placeholder');
  if (!placeholder) return;

  const response = await fetch('/components/navbar.html');
  const html = await response.text();
  placeholder.innerHTML = html;

  // Inicializar lógica después de insertar el HTML en el DOM
  initNavbar();
}

/**
 * Inicializa la lógica del navbar una vez que el HTML está en el DOM.
 * Orquesta el menú móvil, el estado de cuenta y el enlace activo.
 */
function initNavbar() {
  initActiveLink();
  initMobileMenu();
  initDropdownNavigation();
  initAccountMenu();
  initSearchBtn();
}

/**
 * Marca el link del navbar que corresponde a la URL actual como .active.
 * Compara el href de cada link contra la ruta de la página activa.
 */
function initActiveLink() {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(function(link) {
    if (link.getAttribute('href') === currentPath) {
      link.classList.add('active');
    }
  });
}

/**
 * Inicializa el menú hamburger y el panel lateral móvil.
 * Controla apertura, cierre y el overlay oscuro de fondo.
 */
function initMobileMenu() {
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

  // Exponer closeMobileNav para que logout del menú móvil pueda cerrar el panel
  window._heraCloseMobileNav = closeMobileNav;

  // Acordeón Productos en el panel móvil
  const productosToggle = document.getElementById('mobileProductosToggle');
  const productosSub    = document.getElementById('mobileProductosSub');
  if (productosToggle) {
    productosToggle.addEventListener('click', function(e) {
      e.stopPropagation();
      productosSub.classList.toggle('open');
      productosToggle.classList.toggle('active');
    });
  }

  // Acordeón Mi cuenta en móvil — solo activo cuando hay sesión
  const cuentaToggle = document.getElementById('mobileCuentaToggle');
  const cuentaSub    = document.getElementById('mobileCuentaSub');
  if (cuentaToggle) {
    cuentaToggle.addEventListener('click', function(e) {
      e.stopPropagation();
      cuentaSub.classList.toggle('open');
      cuentaToggle.classList.toggle('active');
    });
  }
}

/**
 * Conecta los items del dropdown de categorías a sus URLs del catálogo.
 * Al hacer click en el área del item (no en un link anidado), navega al catálogo.
 */
function initDropdownNavigation() {
  const navItemPerfumes = document.getElementById('nav-item-perfumes');
  const navItemJoyeria  = document.getElementById('nav-item-joyeria');

  if (navItemPerfumes) {
    navItemPerfumes.addEventListener('click', function(e) {
      // Navegar solo si el click no fue en un link del flyout
      if (!e.target.closest('a')) location.href = 'catalogo.html?tab=perfumes';
    });
  }
  if (navItemJoyeria) {
    navItemJoyeria.addEventListener('click', function(e) {
      if (!e.target.closest('a')) location.href = 'catalogo.html?tab=joyeria';
    });
  }
}

/**
 * Gestiona el menú de cuenta según el estado de sesión:
 * - Sin sesión: muestra el botón de login
 * - Con sesión: muestra el toggle con dropdown de opciones
 * También inicializa el botón de cerrar sesión en desktop y móvil.
 */
function initAccountMenu() {
  const accountToggle         = document.getElementById('account-toggle');
  const accountLoginBtn       = document.getElementById('account-login-btn');
  const accountDropdown       = document.getElementById('account-dropdown');
  const favDropdown           = document.getElementById('fav-dropdown');
  const btnLogout             = document.getElementById('btn-logout');
  const btnLogoutMobile       = document.getElementById('btn-logout-mobile');
  const mobileCuentaToggle    = document.getElementById('mobileCuentaToggle');
  const mobileCuentaLoginLink = document.getElementById('mobileCuentaLoginLink');

  /**
   * Actualiza la visibilidad de los elementos de cuenta según el estado de sesión.
   * Se llama al cargar el navbar y después de hacer logout.
   */
  function renderAccountNav() {
    if (isLoggedIn()) {
      if (accountLoginBtn)       accountLoginBtn.style.display  = 'none';
      if (accountToggle)         accountToggle.style.display    = 'flex';
      if (mobileCuentaLoginLink) mobileCuentaLoginLink.style.display = 'none';
      if (mobileCuentaToggle)    mobileCuentaToggle.style.display    = 'flex';
    } else {
      if (accountLoginBtn)       accountLoginBtn.style.display  = 'flex';
      if (accountToggle)         accountToggle.style.display    = 'none';
      if (accountDropdown)       accountDropdown.style.display  = 'none';
      if (mobileCuentaLoginLink) mobileCuentaLoginLink.style.display = 'flex';
      if (mobileCuentaToggle)    mobileCuentaToggle.style.display    = 'none';
    }
  }

  // Sincronizar estado de cuenta con localStorage al cargar
  renderAccountNav();

  // Toggle del dropdown de cuenta en desktop
  if (accountToggle) {
    accountToggle.addEventListener('click', function(e) {
      e.stopPropagation();
      // Cerrar favoritos si estuviera abierto para evitar dropdowns superpuestos
      if (favDropdown) favDropdown.style.display = 'none';
      accountDropdown.style.display = accountDropdown.style.display === 'block' ? 'none' : 'block';
    });
    accountDropdown.addEventListener('click', function(e) { e.stopPropagation(); });
  }

  // Logout desktop
  if (btnLogout) {
    btnLogout.addEventListener('click', function(e) {
      e.preventDefault();
      logout();
      renderAccountNav();
    });
  }

  // Logout móvil — cierra el panel lateral también
  if (btnLogoutMobile) {
    btnLogoutMobile.addEventListener('click', function(e) {
      e.preventDefault();
      logout();
      renderAccountNav();
      if (window._heraCloseMobileNav) window._heraCloseMobileNav();
    });
  }

  // Cerrar dropdowns al hacer click fuera de ellos
  document.addEventListener('click', function() {
    if (accountDropdown) accountDropdown.style.display = 'none';
    if (favDropdown)     favDropdown.style.display     = 'none';
  });
}

/**
 * Conecta el botón de búsqueda del navbar con el search overlay de la página.
 * El overlay se inicializa en el script de cada página, por lo que este
 * listener delega en el evento global openSearch si existe.
 */
function initSearchBtn() {
  const searchBtn = document.getElementById('search-btn');
  if (searchBtn) {
    searchBtn.addEventListener('click', function() {
      // openSearch se expone desde el script de cada página
      if (typeof window._heraOpenSearch === 'function') {
        window._heraOpenSearch();
      }
    });
  }
}

export { loadNavbar };
