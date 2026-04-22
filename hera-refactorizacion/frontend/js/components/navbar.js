/**
 * navbar.js — HERA Component
 * 
 * Descripción: Componente universal del navbar. Carga el HTML desde components/navbar.html
 * e inicializa toda su lógica: menú móvil, estado activo, sesión.
 * Exporta: loadNavbar, initNavbar, renderAccountNav, updateCartBadge, updateFavBadge
 * Importado por: todas las páginas
 */

import { isLoggedIn, logout, getCart, getFavs } from '../utils/storage.js';

let navbarLoaded = false;

// Referencias globales del navbar
let accountToggle = null;
let accountLoginBtn = null;
let accountDropdown = null;
let favToggle = null;
let favDropdown = null;
let cartBadge = null;
let favBadge = null;

/**
 * Actualiza el badge del carrito en el navbar.
 */
function updateCartBadge() {
  if (!cartBadge) return;
  const cart = getCart();
  const count = cart.reduce((total, item) => total + (item.qty || 1), 0);
  cartBadge.textContent = count;
  cartBadge.style.display = count > 0 ? 'flex' : 'none';
}

/**
 * Actualiza el badge de favoritos en el navbar.
 */
function updateFavBadge() {
  if (!favBadge) return;
  const favs = getFavs();
  const count = favs.length;
  favBadge.textContent = count;
  favBadge.style.display = count > 0 ? 'flex' : 'none';
}

/**
 * Renderiza los botones de cuenta según el estado de sesión.
 */
function renderAccountNav() {
  if (!accountToggle || !accountLoginBtn) return;
  
  const loggedIn = isLoggedIn();
  
  if (loggedIn) {
    accountLoginBtn.style.display = 'none';
    accountToggle.style.display = 'flex';
    if (accountDropdown) accountDropdown.style.display = 'none';
  } else {
    accountLoginBtn.style.display = 'flex';
    accountToggle.style.display = 'none';
    if (accountDropdown) accountDropdown.style.display = 'none';
  }
}

/**
 * Inicializa el menú de cuenta (dropdown).
 */
function initAccountMenu() {
  if (!accountToggle || !accountDropdown) return;
  
  accountToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    if (favDropdown) favDropdown.style.display = 'none';
    const isOpen = accountDropdown.style.display === 'block';
    accountDropdown.style.display = isOpen ? 'none' : 'block';
  });
  
  accountDropdown.addEventListener('click', (e) => e.stopPropagation());
}

/**
 * Inicializa el menú de favoritos (dropdown).
 */
function initFavMenu() {
  if (!favToggle || !favDropdown) return;
  
  favToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    if (accountDropdown) accountDropdown.style.display = 'none';
    const isOpen = favDropdown.style.display === 'block';
    favDropdown.style.display = isOpen ? 'none' : 'block';
  });
  
  favDropdown.addEventListener('click', (e) => e.stopPropagation());
}

/**
 * Configura el cierre de dropdowns al hacer click fuera.
 */
function initOutsideClick() {
  document.addEventListener('click', () => {
    if (accountDropdown) accountDropdown.style.display = 'none';
    if (favDropdown) favDropdown.style.display = 'none';
  });
}

/**
 * Marca el enlace activo del navbar según la URL actual.
 */
function setActiveNavLink() {
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.nav-links a, .nav-mobile-link');
  
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (!href || href === '#') return;
    
    link.classList.remove('active');
    
    const linkPath = href.split('?')[0];
    if (currentPath.includes(linkPath) && linkPath !== '') {
      link.classList.add('active');
    }
  });
}

/**
 * Configura el logo para scroll suave al inicio.
 */
function initLogoScroll() {
  const logoLink = document.getElementById('nav-logo-link');
  if (logoLink) {
    logoLink.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}

/**
 * Configura los dropdowns de Productos para navegación.
 */
function initProductDropdowns() {
  const navItemPerfumes = document.getElementById('nav-item-perfumes');
  const navItemJoyeria = document.getElementById('nav-item-joyeria');
  
  if (navItemPerfumes) {
    navItemPerfumes.addEventListener('click', (e) => {
      if (!e.target.closest('a')) {
        window.location.href = 'catalogo.html?tab=perfumes';
      }
    });
  }
  
  if (navItemJoyeria) {
    navItemJoyeria.addEventListener('click', (e) => {
      if (!e.target.closest('a')) {
        window.location.href = 'catalogo.html?tab=joyeria';
      }
    });
  }
}

/**
 * Inicializa toda la lógica del navbar después de que el HTML está en el DOM.
 */
function initNavbar() {
  accountToggle = document.getElementById('account-toggle');
  accountLoginBtn = document.getElementById('account-login-btn');
  accountDropdown = document.getElementById('account-dropdown');
  favToggle = document.getElementById('fav-toggle');
  favDropdown = document.getElementById('fav-dropdown');
  cartBadge = document.getElementById('cart-count');
  favBadge = document.getElementById('fav-count');
  
  renderAccountNav();
  initAccountMenu();
  initFavMenu();
  initOutsideClick();
  setActiveNavLink();
  initLogoScroll();
  initProductDropdowns();
  
  updateCartBadge();
  updateFavBadge();
}

/**
 * Carga el navbar en el elemento #navbar-placeholder.
 * @returns {Promise<void>}
 */
async function loadNavbar() {
  if (navbarLoaded) {
    console.log('Navbar ya cargado, omitiendo...');
    return;
  }

  const placeholder = document.getElementById('navbar-placeholder');
  if (!placeholder) {
    console.warn('navbar-placeholder not found');
    return;
  }

  const pathsToTry = [
    '/components/navbar.html',
    'components/navbar.html',
    '../components/navbar.html',
    './components/navbar.html'
  ];
  
  for (const path of pathsToTry) {
    try {
      console.log(`Intentando cargar navbar desde: ${path}`);
      const response = await fetch(path);
      if (response.ok) {
        const html = await response.text();
        placeholder.innerHTML = html;
        console.log('Navbar cargado exitosamente desde:', path);
        navbarLoaded = true;
        initNavbar();
        return;
      }
    } catch (error) {
      console.warn(`Error desde ${path}:`, error);
    }
  }
  
  console.error('No se pudo cargar el navbar');
  placeholder.innerHTML = '<div style="padding: 1rem; text-align: center; background: #E1222B; color: white;">Error al cargar el menú</div>';
}

// ✅ EXPORTACIÓN CORRECTA - SOLO UNA VEZ
export { loadNavbar, initNavbar, renderAccountNav, updateCartBadge, updateFavBadge };