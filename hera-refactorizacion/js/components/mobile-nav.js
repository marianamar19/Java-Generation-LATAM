/**
 * mobile-nav.js — HERA Component
 * 
 * Descripción: Componente del panel de navegación móvil (hamburguesa).
 * Maneja apertura/cierre, acordeones y estado de sesión.
 * Exporta: initMobileNav, openMobileNav, closeMobileNav
 * Importado por: todas las páginas
 */

import { isLoggedIn, logout } from '../utils/storage.js';

// Referencias DOM
let hamburger = null;
let mobilePanel = null;
let mobileOverlay = null;
let mobileClose = null;
let productosToggle = null;
let productosSub = null;
let cuentaToggle = null;
let cuentaSub = null;
let mobileCuentaLoginLink = null;
let mobileCuentaToggle = null;
let btnLogoutMobile = null;

/**
 * Abre el panel de navegación móvil.
 */
function openMobileNav() {
  if (!hamburger || !mobilePanel || !mobileOverlay) return;
  hamburger.classList.add('open');
  mobilePanel.classList.add('open');
  mobileOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

/**
 * Cierra el panel de navegación móvil.
 */
function closeMobileNav() {
  if (!hamburger || !mobilePanel || !mobileOverlay) return;
  hamburger.classList.remove('open');
  mobilePanel.classList.remove('open');
  mobileOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

/**
 * Renderiza los elementos de cuenta en el menú móvil según sesión.
 */
function renderMobileAccount() {
  if (!mobileCuentaLoginLink || !mobileCuentaToggle) return;
  
  const loggedIn = isLoggedIn();
  
  if (loggedIn) {
    mobileCuentaLoginLink.style.display = 'none';
    mobileCuentaToggle.style.display = 'flex';
  } else {
    mobileCuentaLoginLink.style.display = 'flex';
    mobileCuentaToggle.style.display = 'none';
    // Asegurar que el submenú esté cerrado si no hay sesión
    if (cuentaSub) cuentaSub.classList.remove('open');
    if (cuentaToggle) cuentaToggle.classList.remove('active');
  }
}

/**
 * Inicializa el acordeón de Productos.
 */
function initProductosAccordion() {
  if (!productosToggle || !productosSub) return;
  
  productosToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    productosSub.classList.toggle('open');
    productosToggle.classList.toggle('active');
  });
}

/**
 * Inicializa el acordeón de Mi Cuenta (solo visible con sesión).
 */
function initCuentaAccordion() {
  if (!cuentaToggle || !cuentaSub) return;
  
  cuentaToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    // Solo abrir si hay sesión
    if (isLoggedIn()) {
      cuentaSub.classList.toggle('open');
      cuentaToggle.classList.toggle('active');
    }
  });
}

/**
 * Inicializa el botón de logout móvil.
 */
function initLogoutMobile() {
  if (!btnLogoutMobile) return;
  
  btnLogoutMobile.addEventListener('click', (e) => {
    e.preventDefault();
    logout();
    renderMobileAccount();
    closeMobileNav();
  });
}

/**
 * Inicializa el componente de navegación móvil.
 */
function initMobileNav() {
  // Obtener referencias DOM
  hamburger = document.getElementById('navHamburger');
  mobilePanel = document.getElementById('navMobilePanel');
  mobileOverlay = document.getElementById('navMobileOverlay');
  mobileClose = document.getElementById('navMobileClose');
  productosToggle = document.getElementById('mobileProductosToggle');
  productosSub = document.getElementById('mobileProductosSub');
  cuentaToggle = document.getElementById('mobileCuentaToggle');
  cuentaSub = document.getElementById('mobileCuentaSub');
  mobileCuentaLoginLink = document.getElementById('mobileCuentaLoginLink');
  mobileCuentaToggle = document.getElementById('mobileCuentaToggle');
  btnLogoutMobile = document.getElementById('btn-logout-mobile');
  
  if (!hamburger || !mobilePanel) return;
  
  // Event listeners
  hamburger.addEventListener('click', (e) => {
    e.stopPropagation();
    mobilePanel.classList.contains('open') ? closeMobileNav() : openMobileNav();
  });
  
  if (mobileClose) mobileClose.addEventListener('click', closeMobileNav);
  if (mobileOverlay) mobileOverlay.addEventListener('click', closeMobileNav);
  
  // Inicializar componentes
  initProductosAccordion();
  initCuentaAccordion();
  initLogoutMobile();
  renderMobileAccount();
}

export { initMobileNav, openMobileNav, closeMobileNav, renderMobileAccount };