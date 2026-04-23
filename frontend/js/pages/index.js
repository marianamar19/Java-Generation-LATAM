/**
 * index.js — HERA
 *
 * Descripción: Script exclusivo de la página de inicio (index.html).
 *              Orquesta la carga de componentes universales e inicializa
 *              toda la lógica específica de esta página:
 *              carrusel de bestsellers, scroll reveal, selector de volumen
 *              en novedades y navegación por las categorías.
 * Exporta:     (ninguno — es el entry point de la página)
 * Importado por: pages/index.html vía <script type="module">
 */

import { loadAnnounceBar } from '../components/announce-bar.js';
import { loadNavbar, setCatalog } from '../components/navbar.js';
import { loadCartDrawer, addItemToCart } from '../components/cart-drawer.js';
import { initFavDrawer }          from '../components/fav-drawer.js';
import { loadFooter } from '../components/footer.js';

/* ══════════════════════════════════════════════════════════════
  CATÁLOGO DE PRODUCTOS
  Datos hardcodeados temporalmente. Reemplazar por:
    fetch('/api/productos').then(r => r.json()).then(data => setCatalog(data))
  cuando el backend Spring Boot esté disponible.
  Endpoint esperado: GET /api/productos
══════════════════════════════════════════════════════════════ */
const CATALOG = [
  { id: 'jenny-1',     brand: 'Jenny Rivera',        name: 'Inolvidable EDP',  price: '$1,210 MXN', badge: 'Más vendido',   tags: ['floral', 'femenino']       },
  { id: 'fierce-2',    brand: 'Abercrombie & Fitch',  name: 'Fierce EDT',       price: '$760 MXN',   tags: ['fresco', 'masculino']        },
  { id: 'authentic-3', brand: 'Abercrombie & Fitch',  name: 'Authentic EDP',    price: '$975 MXN',   badge: 'Ed. limitada', tags: ['amaderado']                  },
  { id: 'signature-4', brand: 'HERA Exclusivo',        name: 'Signature Blanc',  price: '$1,490 MXN', badge: 'Nuevo',        tags: ['floral', 'blanco']           },
  { id: 'noir-5',      brand: 'HERA Exclusivo',        name: 'Noir Absolu',      price: '$1,480 MXN', badge: '-20%',         tags: ['oriental', 'amaderado']      },
  { id: 'oud-6',       brand: 'Hera Árabe',            name: 'Oud Rose',         price: '$1,320 MXN', tags: ['árabe', 'oud', 'oriental']  },
];

/* ══════════════════════════════════════════════════════════════
  ARRANQUE — DOMContentLoaded
══════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', async function() {
  // Inyectar catálogo antes de loadNavbar para que el buscador lo tenga disponible
  setCatalog(CATALOG);


  // Cargar el announce bar
  loadAnnounceBar();
  // Cargar navbar (nav desktop, panel móvil, search)
  await loadNavbar();
  // Cargar footer
  loadFooter();

  // Cargar cart drawer vía fetch e inicializar — await porque fav-drawer
  // depende de que #cart-btn y los elementos del drawer ya estén en el DOM
  await loadCartDrawer();

  // Inicializar favoritos — enlaza .fav-btn y restaura estado desde localStorage
  initFavDrawer();

  // Lógica exclusiva de esta página
  _initScrollReveal();
  _initCarousel();
  _initVolButtons();
  _initCatCards();
  _initCarouselDelegation();
  _initEditorialDelegation();
});

/* ══════════════════════════════════════
  SCROLL REVEAL — IntersectionObserver
  Replays cada vez que el elemento entra
  al viewport. Design System v4.
══════════════════════════════════════ */

/**
 * Observa todos los elementos .reveal y alterna la clase .visible
 * según entren o salgan del viewport.
 * @returns {void}
 */
function _initScrollReveal() {
  const obs = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      // Añadir visible al entrar, quitar al salir — para que replaye en cada scroll
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
  CARRUSEL — Bestsellers
  Desktop: 4 cards visibles.
  Tablet:  3 cards visibles.
  Móvil:   2 cards visibles.
══════════════════════════════════════ */

/**
 * Inicializa el carrusel de products: controles anterior/siguiente,
 * barra de progreso y recalculo al resize.
 * @returns {void}
 */
function _initCarousel() {
  const track        = document.getElementById('carouselTrack');
  const prevBtn      = document.getElementById('prevBtn');
  const nextBtn      = document.getElementById('nextBtn');
  const progressFill = document.getElementById('carouselProgress');

  if (!track) return;

  const cards = track.querySelectorAll('.product-card');
  let cur     = 0;

  /**
   * Devuelve el número de cards visibles según el ancho del viewport.
   * @returns {number} 2 | 3 | 4
   */
  function getVis() {
    return window.innerWidth <= 768 ? 2 : window.innerWidth <= 1024 ? 3 : 4;
  }

  /**
   * Aplica la transformación al track y actualiza controles y barra.
   * @param {boolean} animate - Si false, desactiva brevemente la transición de la barra
   * @returns {void}
   */
  function updateCarousel(animate) {
    const vis     = getVis();
    const maxStep = cards.length - vis;

    // Clamp del índice para no salirse del rango
    if (cur < 0)       cur = 0;
    if (cur > maxStep) cur = maxStep;

    const w     = track.parentElement.offsetWidth;
    const cardW = (w - (vis - 1) * 2) / vis;
    track.style.transform = 'translateX(-' + (cur * (cardW + 2)) + 'px)';

    prevBtn.disabled = cur === 0;
    nextBtn.disabled = cur >= maxStep;

    // Calcular posición y ancho del thumb de progreso
    const thumbW    = (vis / cards.length) * 100;
    const thumbLeft = (cur  / cards.length) * 100;

    if (!animate) progressFill.style.transition = 'none';
    progressFill.style.width = thumbW    + '%';
    progressFill.style.left  = thumbLeft + '%';
    if (!animate) {
      setTimeout(function() {
        progressFill.style.transition = 'left .35s ease, width .35s ease';
      }, 50);
    }
  }

  prevBtn.addEventListener('click', function() { if (cur > 0) { cur--; updateCarousel(true); } });
  nextBtn.addEventListener('click', function() { if (cur < cards.length - getVis()) { cur++; updateCarousel(true); } });

  // Recalcular al cambiar el tamaño de la ventana (sin animación para evitar saltos)
  window.addEventListener('resize', function() { updateCarousel(false); });

  updateCarousel(false);
}

/* ══════════════════════════════════════
  DELEGACIÓN — Bestsellers carousel
  Escuchar add-to-cart en toda la pista
  para no enlazar N listeners.
══════════════════════════════════════ */

/**
 * Delegación de eventos para los botones "Agregar al carrito" del carrusel.
 * @returns {void}
 */
function _initCarouselDelegation() {
  const carouselTrack = document.getElementById('carouselTrack');
  if (!carouselTrack) return;

  carouselTrack.addEventListener('click', function(e) {
    const btn = e.target.closest('[data-action="add-to-cart"]');
    if (!btn) return;
    e.stopPropagation();
    addItemToCart(
      btn.dataset.id,
      btn.dataset.brand,
      btn.dataset.name,
      btn.dataset.price,
      btn.dataset.vol,
      btn.dataset.nivel
    );
  });
}

/* ══════════════════════════════════════
  DELEGACIÓN — Novedades (ed-item)
  Lee el volumen del botón .ed-vol-btn.sel
  activo en la tarjeta al momento del click.
══════════════════════════════════════ */

/**
 * Delegación de eventos para los botones "Agregar al carrito" de las novedades.
 * El precio se calcula desde el botón de volumen activo, no desde el data-price fijo.
 * @returns {void}
 */
function _initEditorialDelegation() {
  const editorialGrid = document.querySelector('.editorial-grid');
  if (!editorialGrid) return;

  editorialGrid.addEventListener('click', function(e) {
    const btn = e.target.closest('[data-action="add-to-cart"]');
    if (!btn) return;
    e.stopPropagation();

    // Leer el volumen y precio del selector activo en la tarjeta
    const card      = btn.closest('.ed-item');
    const selVolBtn = card ? card.querySelector('.ed-vol-btn.sel') : null;
    const vol       = selVolBtn ? selVolBtn.textContent.trim() : '';
    const price     = selVolBtn && selVolBtn.dataset.precio
      ? '$' + parseInt(selVolBtn.dataset.precio).toLocaleString('es-MX') + ' MXN'
      : btn.dataset.price;

    addItemToCart(btn.dataset.id, btn.dataset.brand, btn.dataset.name, price, vol, btn.dataset.nivel);
  });
}

/* ══════════════════════════════════════
  SELECTOR DE VOLUMEN — Novedades
  Toggle de botones .ed-vol-btn dentro
  de cada .ed-vols y actualización del
  precio visible.
══════════════════════════════════════ */

/**
 * Inicializa los selectores de volumen en las tarjetas de novedades.
 * Al seleccionar un volumen se actualiza el precio mostrado en la tarjeta.
 * @returns {void}
 */
function _initVolButtons() {
  document.querySelectorAll('.ed-vols').forEach(function(group) {
    group.querySelectorAll('.ed-vol-btn').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        // Quitar .sel de todos los botones del grupo y aplicarlo solo al clicado
        group.querySelectorAll('.ed-vol-btn').forEach(function(b) { b.classList.remove('sel'); });
        btn.classList.add('sel');

        // Actualizar el precio de la tarjeta con el precio del volumen seleccionado
        const priceEl = btn.closest('.ed-item').querySelector('.ed-price');
        if (priceEl && btn.dataset.precio) {
          priceEl.textContent = '$' + parseInt(btn.dataset.precio).toLocaleString('es-MX') + ' MXN';
        }
      });
    });
  });
}

/* ══════════════════════════════════════
  CATEGORÍAS — Navegación al catálogo
══════════════════════════════════════ */

/**
 * Enlaza las cat-cards para navegar al catálogo filtrado al hacer clic.
 * @returns {void}
 */
function _initCatCards() {
  const catCardPerfumes = document.getElementById('cat-card-perfumes');
  const catCardJoyeria  = document.getElementById('cat-card-joyeria');

  if (catCardPerfumes) {
    catCardPerfumes.addEventListener('click', function() {
      location.href = 'catalogo.html?tab=perfumes';
    });
  }

  if (catCardJoyeria) {
    catCardJoyeria.addEventListener('click', function() {
      location.href = 'catalogo.html?tab=joyeria';
    });
  }
}
