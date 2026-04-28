/**
 * 404.js — HERA
 *
 * Descripción: Script exclusivo de la página de error 404.
 *              Orquesta la carga de componentes universales
 *              (navbar, cart drawer, fav drawer, footer) e
 *              inicializa el scroll reveal para las animaciones
 *              de entrada del hero.
 *              No tiene lógica exclusiva de página más allá del
 *              scroll reveal — el hero es puramente declarativo.
 *
 * Exporta:     (ninguno — es el entry point de la página)
 * Importado por: pages/404.html vía <script type="module">
 */

import { loadNavbar } from '../components/navbar.js';
import { loadCartDrawer }         from '../components/cart-drawer.js';
import { initFavDrawer }          from '../components/fav-drawer.js';
import { loadFooter }             from '../components/footer.js';

/* ══════════════════════════════════════
  ARRANQUE — DOMContentLoaded
══════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', async function () {

  // AWAIT obligatorio: el navbar debe estar en el DOM antes de inicializar
  // cualquier componente que referencia sus elementos (#cart-btn, #fav-toggle, etc.)
  await loadNavbar();

  // Footer sin dependencias — puede cargarse sin await
  loadFooter();

  // Cart drawer vía fetch — await porque fav-drawer depende de que
  // #cart-btn y los elementos del drawer ya estén en el DOM
  await loadCartDrawer();

  // Favoritos — enlaza el estado de localStorage y renderiza los dropdowns
  initFavDrawer();

  // Scroll reveal — único comportamiento exclusivo de esta página
  _initScrollReveal();
});

/* ══════════════════════════════════════
  SCROLL REVEAL — IntersectionObserver
  Replays cada vez que el elemento entra al viewport.
  Design System v4.
══════════════════════════════════════ */

/**
 * Observa todos los elementos .reveal y alterna la clase .visible
 * según entren o salgan del viewport.
 * El 404 tiene pocos elementos reveal (eyebrow, h1, sub, invite),
 * todos en el hero, por lo que el observer es ligero.
 * @returns {void}
 */
function _initScrollReveal() {
  const obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      // Añadir .visible al entrar, quitar al salir — permite replay en cada scroll
      if (e.isIntersecting) {
        e.target.classList.add('visible');
      } else {
        e.target.classList.remove('visible');
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal').forEach(function (el) { obs.observe(el); });
}
