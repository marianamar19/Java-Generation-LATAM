/**
 * index.js — HERA
 *
 * Descripción: Script exclusivo de la página de inicio (index.html).
 *              Orquesta la carga de componentes universales e inicializa
 *              toda la lógica específica de esta página:
 *              hero card, carrusel de bestsellers, novedades editoriales,
 *              scroll reveal, selector de volumen y navegación por categorías.
 *
 *              Los productos se leen desde CATALOG (catalog.js) y se
 *              renderizan mediante product-card.js — cuando llegue el
 *              backend solo hay que cambiar la fuente de datos aquí,
 *              las funciones de render no cambian.
 *
 * Exporta:     (ninguno — es el entry point de la página)
 * Importado por: pages/index.html vía <script type="module">
 */

import { loadAnnounceBar }               from '../components/announce-bar.js';
import { loadNavbar }                    from '../components/navbar.js';
import { loadCartDrawer, addItemToCart } from '../components/cart-drawer.js';
import { initFavDrawer }                 from '../components/fav-drawer.js';
import { loadNewsletter }                from '../components/newsletter.js';
import { loadFooter }                    from '../components/footer.js';
import { CATALOG }                       from '../utils/catalog.js';
import { getDestacados, getBestsellers, getNuevos } from '../utils/api.js';

function _mapProducto(p) {
  const variantes = p.variantes || [];
  return {
    id:            p.productId,
    slug:          p.slug,
    name:          p.nombre,
    brand:         p.marca,
    tipo:          p.tipo,
    cat:           p.categoria,
    gen:           p.genero,
    price:         p.precio,
    nivel:         p.nivelDisponibilidad,
    badge:         p.badge         || '',
    img:           p.imagenPrincipalUrl || '',
    nuevo:         p.esNuevo,
    bestSeller:    p.esBestSeller,
    heroDestacado: p.esDestacado,
    volLabel:      variantes[0]?.etiquetaTipo || '',
    vols:          variantes.map(v => ({
      ml:     v.valor,
      precio: v.precio
    }))
  };
}

/* ══════════════════════════════════════════════════════════════
  ARRANQUE — DOMContentLoaded
══════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', async function() {

  loadAnnounceBar();
  await loadNavbar();
  loadFooter();
  await loadNewsletter();
  await loadCartDrawer();

  // Render de secciones dinámicas — antes de init para que los
  // elementos existan cuando los listeners se enlacen
  await _renderHeroCard();
  await _renderBestSellers();
  await _renderNovedades();
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
  RENDER — Hero card
  Lee el producto con heroDestacado:true
  y actualiza los textos de la hero card.
  La estructura HTML vive en index.html —
  solo se actualizan los valores de texto
  y los data-attributes del botón de fav.
══════════════════════════════════════ */

/**
 * Busca el producto heroDestacado en el catálogo y actualiza
 * los elementos de texto de la hero card en el DOM.
 * @returns {void}
 */
async function _renderHeroCard() {
  try {
    const data = await getDestacados();
    const productos = data.map(_mapProducto);
    const p = productos[0];
    if (!p) return;

    const vol      = p.vols?.[0] ? `${p.vols[0].ml}` : '';
    const volLabel = p.volLabel || 'Presentación';

    // Imagen
    const img = document.getElementById('heroCardImg');
    const placeholder = document.getElementById('heroCardPlaceholder');
    if (img && p.img) {
      img.src = p.img;
      img.alt = p.name;
      img.style.display = 'block';
      if (placeholder) placeholder.style.display = 'none';
    }

    // Textos
    const nameEl     = document.getElementById('heroCardName');
    const volEl      = document.getElementById('heroCardVol');
    const volLabelEl = document.getElementById('heroCardVolLabel');
    const priceEl    = document.getElementById('heroCardPrice');
    const ctaEl      = document.getElementById('heroCardCta');
    const nivelEl    = document.getElementById('heroCardNivel');

    if (nameEl)     nameEl.textContent     = p.name + ' by ' + p.brand;
    if (volEl)      volEl.textContent      = vol;
    if (volLabelEl) volLabelEl.textContent = volLabel;
    if (priceEl)    priceEl.textContent    = p.price;
    if (ctaEl)      ctaEl.href             = `producto.html?id=${p.id}`;

    if (nivelEl) {
      const labels = { green: 'En existencia', yellow: 'Disp. limitada', red: 'Sin existencia' };
      nivelEl.className = `hero-card-nivel ${p.nivel}`;
      const dot = nivelEl.querySelector('.hero-card-nivel-dot');
      nivelEl.textContent = labels[p.nivel] || '';
      if (dot) nivelEl.prepend(dot);
    }

    // Botón favoritos
    const favBtn = document.querySelector('.hero-card-fav');
    if (favBtn) {
      favBtn.dataset.productId = p.id;
      favBtn.dataset.tipo      = p.tipo;
      favBtn.dataset.cat       = p.cat;
      favBtn.dataset.gen       = p.gen;
      favBtn.dataset.nivel     = p.nivel;
      favBtn.dataset.vol       = vol;
      favBtn.dataset.volLabel  = volLabel;
      favBtn.dataset.brand     = p.brand;
      favBtn.dataset.name      = p.name;
      favBtn.dataset.price     = p.price;
      favBtn.dataset.img       = p.img || '';
    }
  } catch (e) {
    console.error('Error cargando hero card:', e);
  }
}

/* ══════════════════════════════════════
  RENDER — Bestsellers
  Filtra bestSeller:true del catálogo
  y genera las product-cards en el track.
══════════════════════════════════════ */

/**
 * Renderiza las tarjetas del carrusel de bestsellers.
 * ── Con backend: reemplazar CATALOG.filter por
 *    await fetch('/api/productos?bestSeller=true').then(r => r.json())
 * @returns {void}
 */
async function _renderBestSellers() {
  const track = document.getElementById('carouselTrack');
  if (!track) return;
  try {
    const data = await getBestsellers();
    const productos = data.map(_mapProducto);
    track.innerHTML = productos.map(renderCard).join('');
  } catch (e) {
    console.error('Error cargando bestsellers:', e);
  }
}

/* ══════════════════════════════════════
  RENDER — Novedades editoriales
  Filtra nuevo:true del catálogo
  y genera las ed-items en el grid.
══════════════════════════════════════ */

/**
 * Renderiza las tarjetas del grid editorial de novedades.
 * ── Con backend: reemplazar CATALOG.filter por
 *    await fetch('/api/productos?nuevo=true').then(r => r.json())
 * @returns {void}
 */

async function _renderNovedades() {
  const grid = document.querySelector('.editorial-grid');
  if (!grid) return;
  try {
    const data = await getNuevos();
    const productos = data.map(_mapProducto).slice(0, 3);
    grid.innerHTML = productos.map(renderCardEditorial).join('');
  } catch (e) {
    console.error('Error cargando novedades:', e);
  }
}

/* ══════════════════════════════════════
  SCROLL REVEAL — IntersectionObserver
══════════════════════════════════════ */

/**
 * Observa todos los elementos .reveal y alterna la clase .visible
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
  CARRUSEL — Bestsellers
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

  function getVis() {
    return window.innerWidth <= 768 ? 2 : window.innerWidth <= 1024 ? 3 : 4;
  }

  function updateCarousel(animate) {
    const vis     = getVis();
    const maxStep = cards.length - vis;

    if (cur < 0)       cur = 0;
    if (cur > maxStep) cur = maxStep;

    const w     = track.parentElement.offsetWidth;
    const cardW = (w - (vis - 1) * 2) / vis;
    track.style.transform = 'translateX(-' + (cur * (cardW + 2)) + 'px)';

    prevBtn.disabled = cur === 0;
    nextBtn.disabled = cur >= maxStep;

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
  window.addEventListener('resize', function() { updateCarousel(false); });

  updateCarousel(false);
}

/* ══════════════════════════════════════
  DELEGACIÓN — Carrusel bestsellers
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
      btn.dataset.nivel,
      btn.dataset.img || ''
    );
  });
}

/* ══════════════════════════════════════
  DELEGACIÓN — Novedades (ed-item)
══════════════════════════════════════ */

/**
 * Delegación de eventos para los botones "Agregar al carrito" de las novedades.
 * @returns {void}
 */
function _initEditorialDelegation() {
  const editorialGrid = document.querySelector('.editorial-grid');
  if (!editorialGrid) return;

  editorialGrid.addEventListener('click', function(e) {
    const btn = e.target.closest('[data-action="add-to-cart"]');
    if (!btn) return;
    e.stopPropagation();

    const card      = btn.closest('.ed-item');
    const selVolBtn = card ? card.querySelector('.ed-vol-btn.sel') : null;
    const vol       = selVolBtn ? selVolBtn.textContent.trim() : '';
    const price     = selVolBtn && selVolBtn.dataset.precio
      ? '$' + parseInt(selVolBtn.dataset.precio).toLocaleString('es-MX') + ' MXN'
      : btn.dataset.price;

    addItemToCart(btn.dataset.id, btn.dataset.brand, btn.dataset.name, price, vol, btn.dataset.nivel, btn.dataset.img || '');
  });
}

/* ══════════════════════════════════════
  SELECTOR DE VOLUMEN — Novedades
══════════════════════════════════════ */

/**
 * Inicializa los selectores de volumen en las tarjetas de novedades.
 * @returns {void}
 */
function _initVolButtons() {
  document.querySelectorAll('.ed-vols').forEach(function(group) {
    group.querySelectorAll('.ed-vol-btn').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        group.querySelectorAll('.ed-vol-btn').forEach(function(b) { b.classList.remove('sel'); });
        btn.classList.add('sel');

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