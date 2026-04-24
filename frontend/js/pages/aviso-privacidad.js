/**
 * aviso-privacidad.js — HERA
 *
 * Descripción: Script de página para aviso-privacidad.html.
 *              Orquesta la carga de componentes universales y contiene
 *              la única lógica exclusiva de esta página: scroll-reveal.
 *              El buscador del navbar se inicializa con el catálogo
 *              compartido para mantener consistencia en toda la navegación.
 * Importado por: pages/aviso-privacidad.html via <script type="module">
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
  { id: 'jenny-1',     brand: 'Jenny Rivera',        name: 'Inolvidable EDP', price: '$1,210 MXN', badge: 'Más vendido',  tags: ['floral', 'femenino'] },
  { id: 'fierce-2',    brand: 'Abercrombie & Fitch', name: 'Fierce EDT',      price: '$760 MXN',                           tags: ['fresco', 'masculino'] },
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
