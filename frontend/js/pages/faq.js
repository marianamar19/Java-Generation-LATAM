/**
 * faq.js — HERA
 *
 * Descripción: Script de página para faq.html. Orquesta la carga de
 *              componentes universales y contiene la lógica exclusiva
 *              de esta página: cursor personalizado, scroll-reveal y
 *              acordeón FAQ independiente por categoría.
 * Importado por: pages/faq.html via <script type="module">
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
  _initFaqAccordion();
});

/* ── Cursor personalizado ────────────────────────────────────── */

/**
 * Activa el cursor animado en desktop.
 * El punto sigue el mouse de forma inmediata; el anillo usa lerp.
 * En móvil (≤ 768px) el cursor CSS ya está oculto vía media query.
 */

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

/* ── Acordeón FAQ ────────────────────────────────────────────── */

/**
 * Inicializa el acordeón de preguntas frecuentes.
 * Cada [data-faq-group] es independiente: abrir una pregunta
 * cierra las demás dentro del mismo grupo pero no afecta otros.
 */
function _initFaqAccordion() {
  document.querySelectorAll('[data-faq-group]').forEach(function (group) {
    group.querySelectorAll('.faq-q').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const ans    = btn.nextElementSibling;
        const isOpen = btn.classList.contains('open');

        // Cierra todos los items del grupo antes de evaluar
        group.querySelectorAll('.faq-q').forEach(function (b) {
          b.classList.remove('open');
          b.setAttribute('aria-expanded', 'false');
          const a = b.nextElementSibling;
          if (a) a.classList.remove('open');
        });

        // Si no estaba abierto, abre el clickeado
        if (!isOpen) {
          btn.classList.add('open');
          btn.setAttribute('aria-expanded', 'true');
          if (ans) ans.classList.add('open');
        }
      });
    });
  });
}
