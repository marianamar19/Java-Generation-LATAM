/**
 * devoluciones.js — HERA
 *
 * Descripción: Script exclusivo de la página Devoluciones y Garantías.
 *              Orquesta la carga de componentes universales e inicializa
 *              la única lógica exclusiva de esta página: scroll reveal.
 * Exporta:     (ninguno — es el entry point de la página)
 * Importado por: pages/devoluciones.html vía <script type="module">
 */

import { loadNavbar }     from '../components/navbar.js';
import { loadFooter }     from '../components/footer.js';
import { loadCartDrawer } from '../components/cart-drawer.js';
import { initFavDrawer }  from '../components/fav-drawer.js';

/* ══════════════════════════════════════
  ARRANQUE — DOMContentLoaded
══════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', async function() {
  await loadNavbar();
  loadFooter();
  await loadCartDrawer();
  initFavDrawer();

  _initScrollReveal();
});

/* ══════════════════════════════════════
  SCROLL REVEAL — IntersectionObserver
══════════════════════════════════════ */

/**
 * Observa todos los elementos .reveal y aplica/quita .visible
 * según entren o salgan del viewport.
 * @returns {void}
 */
function _initScrollReveal() {
  const obs = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      } else {
        entry.target.classList.remove('visible');
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal').forEach(function(el) { obs.observe(el); });
}