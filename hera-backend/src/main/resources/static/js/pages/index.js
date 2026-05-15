/**
 * index.js — HERA
 *
 * Descripción: Script exclusivo de la página de inicio (index.html).
 *              Orquesta la carga de componentes universales e inicializa
 *              toda la lógica específica de esta página:
 *              hero card, carrusel de bestsellers, novedades editoriales,
 *              scroll reveal, selector de volumen y navegación por categorías.
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
import { CATALOG }    from '../utils/catalog.js';
import { getProductos } from '../utils/api.js';
import { renderCard, renderCardEditorial } from '../components/product-card.js';
 
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
  await initFavDrawer();
 
  // Lógica exclusiva de esta página
  _initScrollReveal();
  _initCatCards();
  _initCarouselDelegation();
  _initEditorialDelegation();
});
 
/* ══════════════════════════════════════
  RENDER — Hero card
  Lee el producto con heroDestacado:true
  desde CATALOG y actualiza los textos.
══════════════════════════════════════ */
 
/**
 * Busca el producto heroDestacado en el catálogo y actualiza
 * los elementos de texto de la hero card en el DOM.
 * @returns {void}
 */
async function _renderHeroCard() {
  try {
    const raw = await getProductos();
    const p   = raw.find(p => p.esDestacado);
    if (!p) return;

    const variantes = p.variantes || [];
    const vol       = variantes[0]?.valor
      ? (/^\d+$/.test(String(variantes[0].valor))
          ? variantes[0].valor + ' ml'
          : variantes[0].valor)
      : '';
    const volLabel = variantes[0]?.etiquetaTipo || 'Presentación';

    // Imagen — usa IDs del HTML
    const img         = document.getElementById('heroCardImg');
    const placeholder = document.getElementById('heroCardPlaceholder');
    if (img && p.imagenPrincipalUrl) {
      img.src           = p.imagenPrincipalUrl;
      img.alt           = p.nombre;
      img.style.display = 'block';
      if (placeholder) placeholder.style.display = 'none';
    }

    const nameEl     = document.getElementById('heroCardName');
    const volLabelEl = document.getElementById('heroCardVolLabel');
    const volsEl = document.getElementById('heroCardVols');
    const priceEl    = document.getElementById('heroCardPrice');
    const ctaEl      = document.getElementById('heroCardCta');
    const nivelEl    = document.getElementById('heroCardNivel');

    if (nameEl)     nameEl.textContent     = p.nombre + ' by ' + p.marca;
    if (volLabelEl) volLabelEl.textContent = volLabel;
    if (volsEl && variantes.length > 0) {
    volsEl.innerHTML = variantes.map((v, i) => {
        const label = /^\d+$/.test(String(v.valor))
            ? v.valor + ' ml' : v.valor;
        return `<button class="hero-card-vol-btn${i === 0 ? ' sel' : ''}"
            data-precio="${v.precio}">${label}</button>`;
    }).join('');

    volsEl.querySelectorAll('.hero-card-vol-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            volsEl.querySelectorAll('.hero-card-vol-btn').forEach(b => b.classList.remove('sel'));
            btn.classList.add('sel');
            if (priceEl && btn.dataset.precio) {
                priceEl.textContent = '$' + Math.round(btn.dataset.precio).toLocaleString('es-MX') + ' MXN';
            }
        });
    });

    const firstPrecio = variantes[0]?.precio;
    if (priceEl && firstPrecio) {
        priceEl.textContent = '$' + Math.round(firstPrecio).toLocaleString('es-MX') + ' MXN';
    }
}
    if (ctaEl) {
    ctaEl.href = 'producto.html';
    ctaEl.addEventListener('click', () => {
        sessionStorage.setItem('productoSlug', p.slug);
    });
}

    if (nivelEl) {
      const labels = { green: 'En existencia', yellow: 'Disp. limitada', red: 'Sin existencia' };
      nivelEl.className = `hero-card-nivel ${p.nivelDisponibilidad}`;
      const dot = nivelEl.querySelector('.hero-card-nivel-dot');
      nivelEl.textContent = labels[p.nivelDisponibilidad] || '';
      if (dot) nivelEl.prepend(dot);
    }

    const favBtn = document.querySelector('.hero-card-fav');
    if (favBtn) {
      favBtn.dataset.productId = p.productId;
      favBtn.dataset.nivel     = p.nivelDisponibilidad;
      favBtn.dataset.vol       = vol;
      favBtn.dataset.volLabel  = volLabel;
      favBtn.dataset.brand     = p.marca;
      favBtn.dataset.name      = p.nombre;
      favBtn.dataset.price     = p.precio;
      favBtn.dataset.img       = p.imagenPrincipalUrl || '';
    }
  } catch (e) {
    console.error('Error cargando hero card:', e);
  }
}
 
/* ══════════════════════════════════════
  RENDER — Bestsellers
══════════════════════════════════════ */
 
/**
 * Obtiene todos los productos del backend, filtra los bestsellers
 * y genera las tarjetas en el carrusel.
 * @returns {Promise<void>}
 */
async function _renderBestSellers() {
  const track = document.getElementById('carouselTrack');
  if (!track) return;
 
  try {
    const raw      = await getProductos();
    const productos = raw
      .filter(p => p.esBestSeller)
      .map(p => ({
        ...p,
        id:         p.productId,
        brand:      p.marca,
        name:       p.nombre,
        price:      p.precio,
        nivel:      p.nivelDisponibilidad,
        badge:      p.badge || '',
        img:        p.imagenPrincipalUrl || '',
        varianteId: p.variantes && p.variantes[0] ? p.variantes[0].id : null,
        vols:       p.variantes ? p.variantes.map(v => ({
          ml:     /^\d+$/.test(String(v.valor)) ? v.valor + ' ml' : v.valor,
          precio: v.precio,
          id:     v.id
        })) : [],
      }));
    track.innerHTML = productos.map(renderCard).join('');
    _initCarousel(); // reinicia el carrusel con los nuevos elementos
  } catch (e) {
    console.error('Error cargando bestsellers:', e);
  }
}
 
/* ══════════════════════════════════════
  RENDER — Novedades editoriales
══════════════════════════════════════ */
 
/**
 * Obtiene todos los productos del backend, filtra los nuevos
 * y genera las tarjetas editoriales.
 * @returns {Promise<void>}
 */
async function _renderNovedades() {
  const grid = document.querySelector('.editorial-grid');
  if (!grid) return;
 
  try {
    const raw      = await getProductos();
    const productos = raw
      .filter(p => p.esNuevo)
      .slice(0, 3)
      .map(p => ({
        ...p,
        id:         p.productId,
        brand:      p.marca,
        name:       p.nombre,
        price:      p.precio,
        nivel:      p.nivelDisponibilidad,
        badge:      p.badge || '',
        img:        p.imagenPrincipalUrl || '',
        varianteId: p.variantes && p.variantes[0] ? p.variantes[0].id : null,
        vols:       p.variantes ? p.variantes.map(v => ({
          ml:     /^\d+$/.test(String(v.valor)) ? v.valor + ' ml' : v.valor,
          precio: v.precio
        })) : [],
      }));
    grid.innerHTML = productos.map(renderCardEditorial).join('');
    _initVolButtons(); // reinicia los selectores de volumen con los nuevos elementos
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
 * Inicializa el carrusel de productos: controles anterior/siguiente,
 * barra de progreso y recalculo al resize.
 * @returns {void}
 */
function _initCarousel() {
  const track        = document.getElementById('carouselTrack');
  const prevBtn      = document.getElementById('prevBtn');
  const nextBtn      = document.getElementById('nextBtn');
  const progressFill = document.getElementById('carouselProgress');
 
  if (!track) return;
 
  const cards = track.querySelectorAll('.ed-item'); // antes: .product-card
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
 * Delegación de eventos para los botones del carrusel:
 * selección de variante y agregar al carrito.
 * @returns {void}
 */
function _initCarouselDelegation() {
  const carouselTrack = document.getElementById('carouselTrack');
  if (!carouselTrack) return;
 
  carouselTrack.addEventListener('click', function(e) {
    // Selección de variante — actualiza varianteId en el botón de carrito
    const volBtn = e.target.closest('.ed-vol-btn');
    if (volBtn) {
      const card = volBtn.closest('.ed-item');
      if (!card) return;
      card.querySelectorAll('.ed-vol-btn').forEach(function(b) { b.classList.remove('sel'); });
      volBtn.classList.add('sel');
      const precio = volBtn.dataset.precio;
      if (precio) {
        card.querySelector('.ed-price').textContent = '$' + parseInt(precio).toLocaleString('es-MX') + ' MXN';
      }
      const cartBtn = card.querySelector('[data-action="add-to-cart"]');
      if (cartBtn && volBtn.dataset.varianteId) {
        cartBtn.dataset.varianteId = volBtn.dataset.varianteId;
      }
      return;
    }
 
    const btn = e.target.closest('[data-action="add-to-cart"]');
    if (!btn) return;
    e.stopPropagation();
 
    const card      = btn.closest('.ed-item');
    const selVolBtn = card ? card.querySelector('.ed-vol-btn.sel') : null;
    const varianteId = selVolBtn && selVolBtn.dataset.varianteId
      ? selVolBtn.dataset.varianteId
      : btn.dataset.varianteId;
 
    addItemToCart(varianteId);
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
 
    addItemToCart(btn.dataset.varianteId);
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