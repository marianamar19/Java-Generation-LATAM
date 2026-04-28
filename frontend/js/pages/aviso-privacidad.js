/**
 * aviso-privacidad.js — HERA
 *
 * Descripción: Script de página para aviso-privacidad.html.
 *              Orquesta la carga de componentes universales y contiene
 *              la única lógica exclusiva de esta página: scroll-reveal.
 * Importado por: pages/aviso-privacidad.html via <script type="module">
 */

import { loadNavbar } from '../components/navbar.js';
import { loadFooter }             from '../components/footer.js';
import { loadCartDrawer }         from '../components/cart-drawer.js';
import { initFavDrawer }          from '../components/fav-drawer.js';

document.addEventListener('DOMContentLoaded', async function () {

  // Orden obligatorio según la arquitectura del proyecto
  await loadNavbar();      // await OBLIGATORIO
  loadFooter();            // sin await
  await loadCartDrawer();  // await OBLIGATORIO
  initFavDrawer();         // depende del cart drawer

  // Lógica exclusiva de la página
  _initScrollReveal();
});

/* ── Scroll Reveal ───────────────────────────────────────────── */

/**
 * Observa los elementos .reveal con IntersectionObserver y
 * alterna la clase .visible al entrar/salir del viewport.
 */
function _initScrollReveal() {
  const obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
      } else {
        e.target.classList.remove('visible');
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal').forEach(function (el) {
    obs.observe(el);
  });
}
