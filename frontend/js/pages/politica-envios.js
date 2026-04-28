/**
 * politica-envios.js — HERA
 *
 * Descripción: Script exclusivo de la página Política de Envíos.
 *              Orquesta la carga de componentes universales e inicializa
 *              la lógica exclusiva de esta página: acordeón FAQ y scroll reveal.
 * Exporta:     (ninguno — es el entry point de la página)
 * Importado por: pages/politica-envios.html vía <script type="module">
 */

import { loadNavbar }   from '../components/navbar.js';
import { loadFooter }               from '../components/footer.js';
import { loadCartDrawer }           from '../components/cart-drawer.js';
import { initFavDrawer }            from '../components/fav-drawer.js';

/* ══════════════════════════════════════
  ARRANQUE — DOMContentLoaded
══════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', async function() {
  await loadNavbar();
  loadFooter();
  await loadCartDrawer();
  initFavDrawer();

  _initScrollReveal();
  _initFaqAccordion();
});

/* ══════════════════════════════════════
  SCROLL REVEAL — IntersectionObserver
  Replays cada vez que el elemento entra al viewport.
══════════════════════════════════════ */

/**
 * Observa todos los elementos .reveal y alterna .visible
 * según entren o salgan del viewport.
 * @returns {void}
 */
function _initScrollReveal() {
  const obs = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
      } else {
        e.target.classList.remove('visible');
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal').forEach(function(el) { obs.observe(el); });
}

/* ══════════════════════════════════════
  FAQ — Acordeón
  Un solo item abierto a la vez.
══════════════════════════════════════ */

/**
 * Inicializa el acordeón del FAQ: abre/cierra items y
 * cierra los demás cuando se abre uno nuevo.
 * @returns {void}
 */
function _initFaqAccordion() {
  document.querySelectorAll('.faq-question').forEach(function(btn) {
    btn.addEventListener('click', function() {
      const answer = btn.nextElementSibling;
      const isOpen = btn.classList.contains('open');

      // Cerrar todos
      document.querySelectorAll('.faq-question').forEach(function(b) {
        b.classList.remove('open');
        b.setAttribute('aria-expanded', 'false');
        b.nextElementSibling.classList.remove('open');
      });

      // Si estaba cerrado, abrirlo
      if (!isOpen) {
        btn.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
        answer.classList.add('open');
      }
    });
  });
}
