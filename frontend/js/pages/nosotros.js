/**
 * nosotros.js — HERA
 *
 * Descripción: Script exclusivo de la página Nosotros.
 *              Orquesta la carga de componentes universales e inicializa
 *              la lógica exclusiva de esta página: flip cards del equipo
 *              y scroll reveal.
 * Exporta:     (ninguno — es el entry point de la página)
 * Importado por: pages/nosotros.html vía <script type="module">
 */

import { loadAnnounceBar }        from '../components/announce-bar.js';
import { loadNavbar, setCatalog } from '../components/navbar.js';
import { loadFooter }             from '../components/footer.js';
import { loadCartDrawer }         from '../components/cart-drawer.js';
import { initFavDrawer }          from '../components/fav-drawer.js';

/* ── TEMPORAL — catálogo hardcodeado por ausencia de backend ── */
const CATALOG = [
  { id: 'jenny-1',     brand: 'Jenny Rivera',        name: 'Inolvidable EDP',  price: '$1,210 MXN', badge: 'Más vendido',   tags: ['floral', 'femenino']   },
  { id: 'fierce-2',    brand: 'Abercrombie & Fitch',  name: 'Fierce EDT',       price: '$760 MXN',   tags: ['fresco', 'masculino']    },
  { id: 'authentic-3', brand: 'Abercrombie & Fitch',  name: 'Authentic EDP',    price: '$975 MXN',   badge: 'Ed. limitada', tags: ['amaderado']             },
  { id: 'signature-4', brand: 'HERA Exclusivo',        name: 'Signature Blanc',  price: '$1,490 MXN', badge: 'Nuevo',        tags: ['floral', 'blanco']      },
  { id: 'noir-5',      brand: 'HERA Exclusivo',        name: 'Noir Absolu',      price: '$1,480 MXN', badge: '-20%',         tags: ['oriental', 'amaderado'] },
  { id: 'oud-6',       brand: 'Hera Árabe',            name: 'Oud Rose',         price: '$1,320 MXN', tags: ['árabe', 'oud', 'oriental'] },
];

/* ══════════════════════════════════════
   ARRANQUE — DOMContentLoaded
══════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', async function() {
  setCatalog(CATALOG);
  loadAnnounceBar();
  await loadNavbar();
  loadFooter();
  await loadCartDrawer();
  initFavDrawer();

  // Lógica exclusiva de esta página
  _initFlipCards();
  _initScrollReveal();
});

/* ══════════════════════════════════════
   FLIP CARDS — exclusivo de nosotros.html
   - Click en frente → flip al reverso
   - Links sociales → navegan sin flipear
   - "← toca para volver" → flip de vuelta
   - ESC → cierra la tarjeta activa
══════════════════════════════════════ */

/**
 * Inicializa las flip cards del equipo.
 * Solo una tarjeta puede estar volteada a la vez.
 * @returns {void}
 */
function _initFlipCards() {
  const flipCards = document.querySelectorAll('.flip-card');
  let activeCard  = null;

  flipCards.forEach(function(card) {
    const front    = card.querySelector('.flip-card-front');
    const backHint = card.querySelector('.flip-card-back-hint');

    // Click en el frente voltea la tarjeta y colapsa la anterior si había una
    front.addEventListener('click', function(e) {
      e.stopPropagation();
      if (activeCard && activeCard !== card) activeCard.classList.remove('flipped');
      card.classList.add('flipped');
      activeCard = card;
    });

    // Click en el hint "← toca para volver" regresa al frente
    if (backHint) {
      backHint.addEventListener('click', function(e) {
        e.stopPropagation();
        card.classList.remove('flipped');
        activeCard = null;
      });
    }

    // Los links sociales no propagan el click para evitar voltear la tarjeta
    card.querySelectorAll('.flip-card-link').forEach(function(link) {
      link.addEventListener('click', function(e) { e.stopPropagation(); });
    });
  });

  // ESC cierra la tarjeta activa sin necesidad de hacer click
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && activeCard) {
      activeCard.classList.remove('flipped');
      activeCard = null;
    }
  });
}

/* ══════════════════════════════════════
   SCROLL REVEAL — IntersectionObserver
   Re-ejecuta la animación en cada pasada del scroll.
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
