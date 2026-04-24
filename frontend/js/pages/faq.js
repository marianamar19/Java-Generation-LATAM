/**
 * faq.js — HERA
 *
 * Descripción: Script de página para faq.html. Orquesta la carga de
 *              componentes universales y contiene la lógica exclusiva
 *              de esta página: cursor personalizado, scroll-reveal y
 *              acordeón FAQ independiente por categoría.
 * Importado por: pages/faq.html via <script type="module">
 */

import { loadAnnounceBar }        from '../components/announce-bar.js';
import { loadNavbar, setCatalog } from '../components/navbar.js';
import { loadFooter }             from '../components/footer.js';
import { loadCartDrawer }         from '../components/cart-drawer.js';
import { initFavDrawer }          from '../components/fav-drawer.js';

/* ── TEMPORAL — datos hardcodeados por ausencia de backend
   Reemplazar este array por una llamada fetch() a la API
   cuando el backend esté disponible.
   Endpoint esperado: GET /api/productos
── */
const CATALOG = [
  { id: 'sauvage-1',   brand: 'Dior',                name: 'Sauvage EDP',     price: '$2,450 MXN', badge: 'Bestseller',   tags: ['fresco', 'amaderado'] },
  { id: 'fierce-2',    brand: 'Abercrombie & Fitch', name: 'Fierce Cologne',  price: '$1,180 MXN',                         tags: ['fresco', 'marino'] },
  { id: 'jenny-1',     brand: 'Jenny Rivera',        name: 'Inolvidable EDP', price: '$1,210 MXN', badge: 'Más vendido',  tags: ['floral', 'femenino'] },
  { id: 'authentic-3', brand: 'Abercrombie & Fitch', name: 'Authentic EDP',   price: '$975 MXN',   badge: 'Ed. limitada', tags: ['amaderado'] },
  { id: 'signature-4', brand: 'HERA Exclusivo',      name: 'Signature Blanc', price: '$1,490 MXN', badge: 'Nuevo',        tags: ['floral', 'blanco'] },
  { id: 'noir-5',      brand: 'HERA Exclusivo',      name: 'Noir Absolu',     price: '$1,480 MXN', badge: '-20%',         tags: ['oriental', 'amaderado'] },
  { id: 'oud-6',       brand: 'Hera Árabe',          name: 'Oud Rose',        price: '$1,320 MXN',                         tags: ['árabe', 'oud', 'oriental'] },
];

document.addEventListener('DOMContentLoaded', async function () {

  // Inyecta el catálogo en navbar antes de que el buscador arranque
  setCatalog(CATALOG);

  // Orden obligatorio según la arquitectura del proyecto
  loadAnnounceBar();       // sin await — no tiene dependencias
  await loadNavbar();      // await OBLIGATORIO
  loadFooter();            // sin await
  await loadCartDrawer();  // await OBLIGATORIO
  initFavDrawer();         // depende del cart drawer

  // Lógica exclusiva de la página
  _initCursor();
  _initScrollReveal();
  _initFaqAccordion();
});

/* ── Cursor personalizado ────────────────────────────────────── */

/**
 * Activa el cursor animado en desktop.
 * El punto sigue el mouse de forma inmediata; el anillo usa lerp.
 * En móvil (≤ 768px) el cursor CSS ya está oculto vía media query.
 */
function _initCursor() {
  const cursor = document.getElementById('cursor');
  const ring   = document.getElementById('cursorRing');

  if (!cursor || window.innerWidth <= 768) return;

  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', function (e) {
    mx = e.clientX;
    my = e.clientY;
    cursor.style.left = mx + 'px';
    cursor.style.top  = my + 'px';
  });

  // Anillo con interpolación suave (lerp factor 0.1)
  (function loop() {
    rx += (mx - rx) * 0.1;
    ry += (my - ry) * 0.1;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(loop);
  })();

  // Escala al hover sobre elementos interactivos
  document.querySelectorAll('a, button, .faq-q, .cta-card').forEach(function (el) {
    el.addEventListener('mouseenter', function () {
      cursor.style.transform = 'translate(-50%,-50%) scale(2)';
      ring.style.width  = '60px';
      ring.style.height = '60px';
    });
    el.addEventListener('mouseleave', function () {
      cursor.style.transform = 'translate(-50%,-50%) scale(1)';
      ring.style.width  = '36px';
      ring.style.height = '36px';
    });
  });
}

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
