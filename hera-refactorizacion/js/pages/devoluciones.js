/**
 * devoluciones.js — HERA
 *
 * Descripción: Lógica exclusiva de la página de política de devoluciones y garantías
 * Exporta: initPage
 * Importado por: pages/devoluciones.html
 */

// Importar componentes
import { loadNavbar } from "../components/navbar.js";
import { loadFooter } from "../components/footer.js";
import { initCartDrawer } from "../components/cart-drawer.js";
import { initFavDrawer } from "../components/fav-drawer.js";
import { initMobileNav } from "../components/mobile-nav.js";
import { initSearch } from "../components/search.js";
import { initScrollReveal } from "../components/scroll-reveal.js";

// Importar utils para debug
import { getCart, getFavs, isLoggedIn } from "../utils/storage.js";

/**
 * Inicializa la página de devoluciones.
 */
async function initPage() {
  console.log('=== Inicializando devoluciones.js ===');
  
  // Debug: verificar que utils funcionan
  console.log('Utils cargados:', { 
    getCart: typeof getCart, 
    getFavs: typeof getFavs, 
    isLoggedIn: typeof isLoggedIn 
  });
  
  // Cargar componentes vía fetch
  console.log('Cargando navbar...');
  await loadNavbar();
  console.log('Navbar cargado');
  
  console.log('Cargando footer...');
  await loadFooter();
  console.log('Footer cargado');

  // Inicializar todos los componentes
  console.log('Inicializando scroll reveal...');
  initScrollReveal();
  
  console.log('Inicializando carrito...');
  initCartDrawer();
  
  console.log('Inicializando favoritos...');
  initFavDrawer();
  
  console.log('Inicializando menú móvil...');
  initMobileNav();
  
  console.log('Inicializando búsqueda...');
  initSearch();
  
  console.log('=== Todos los componentes inicializados ===');
}

// Iniciar cuando el DOM esté listo
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initPage);
} else {
  initPage();
}