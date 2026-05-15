/**
 * producto.js — HERA
 *
 * Descripción: Lógica exclusiva de la página de producto.
 *              Orquesta la carga de componentes universales
 *              (navbar, cart, favs) e inicializa todas las
 *              secciones propias de esta página: galería,
 *              selector de tallas, notas olfativas, acordes,
 *              performance dots, contexto, familia, reseñas,
 *              grid de similares y buscador.
 * Exporta:     (ninguno — es el punto de entrada de la página)
 * Importado por: pages/producto.html via <script type="module">
 */
 
import { loadNavbar }     from '../components/navbar.js';
import { loadFooter }     from '../components/footer.js';
import { loadCartDrawer, addItemToCart } from '../components/cart-drawer.js';
import { initFavDrawer, renderFavList, getFavorites as getFavsList, setFavorites } from '../components/fav-drawer.js';
import { formatMXN, normalizePriceMXN } from '../utils/formatter.js';
import { getFavs }  from '../utils/storage.js';

/* ── Reseñas — storage inline (storage.js no tiene getReviews/saveReviews) ── */
// Usa la key dinámica hera_reviews_<productId> directamente con KEYS
function getReviews(productId) {
  try {
    const raw = localStorage.getItem('hera_reviews_' + productId);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}
function saveReviews(productId, reviews) {
  try { localStorage.setItem('hera_reviews_' + productId, JSON.stringify(reviews)); } catch {}
}
 
/* ── Fecha en español — formatter.js no exporta formatDateES ── */
function formatDateES(date = new Date()) {
  const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  return meses[date.getMonth()] + ' ' + date.getFullYear();
}

/* ── getFavorites — fav-drawer.js no exporta el array interno ── */
// Lee directamente desde localStorage para verificar estado inicial
function getFavorites() { return getFavs(); }

/* ══════════════════════════════════════════════════════════════
  PRODUCT DATA
  ── TEMPORAL — hardcodeado por ausencia de backend
    Reemplazar por fetch() GET /api/productos/:id
    (leer ?id= del query string para cargar el producto correcto)
  ══════════════════════════════════════════════════════════════ */
let PRODUCT = null;

function getQueryParam(name) {
    return new URLSearchParams(window.location.search).get(name);
}

function mapProducto(dto) {
    const sizes = dto.variantes?.map(v => ({
        id: v.id,
        ml: v.valor || '',
        price: v.precio ? `$${Number(v.precio).toLocaleString('es-MX')} MXN` : (dto.precio || ''),
        value: Number(v.precio) || 0,
        img: dto.imagenPrincipalUrl || ''
    })) || [];

    return {
        id:             dto.slug || dto.productId,
        productId:      dto.productId,
        brand:          dto.marca || '',
        name:           dto.nombre || '',
        concentration:  dto.concentracion || dto.material || '',
        category:       dto.categoria || '',
        gender:         dto.genero || '',
        country:        dto.paisOrigen || '',
        perfumer:       dto.perfumista || '',
        family_olfativa:dto.familiaOlfativa || '',
        launch:         dto.anioLanzamiento || '',
        badge:          dto.badge || '',
        description:    dto.descripcion || '',
        headNotes:  dto.notasSalida  || [],
        heartNotes: dto.notasCorazon || [],
        baseNotes:  dto.notasBase    || [],
        accords: [],
        longevity:      dto.longevidad || 0,
        sillage:        dto.estela || 0,
        rating:         dto.puntuacionGeneral || 0,
        reviewCount:    0,
        seasons:        dto.temporadas || [],
        timeOfDay: (dto.momentosDia || []).map(m => {
            const map = { 'día': 'dia', 'noche': 'noche', 'todo el día': 'dia' };
            return map[m] || m;
        }),
        occasions: (dto.ocasiones || []).map(o => {
            const map = {
                'casual': 'casual',
                'trabajo': 'oficina',
                'cita': 'cita',
                'gala / evento': 'gala',
                'deportivo': 'gym',
                'vacaciones': 'playa'
            };
            return map[o] || o;
        }),
        sizes,
        activeSize: 0,
        precio:         dto.precio || '',
        nivel:          dto.nivelDisponibilidad || 'green',
        volLabel:       'Presentación',
        tipo:           dto.tipo || 'perfumes',
        cat:            (dto.categoria || '').toLowerCase(),
        gen:            (dto.genero || '').toLowerCase(),
        family: [],
        reviews: [],
        ratingDist: [0, 0, 0, 0, 0],
        similar: [],
        imgs: [
            ...(dto.imagenPrincipalUrl ? [dto.imagenPrincipalUrl] : []),
            ...(dto.imagenes || [])
        ],
    };
}

/* ══════════════════════════════════════════════════════════════
   BOOTSTRAP — carga componentes universales y luego la página
   ══════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', async () => {
    try { await loadNavbar(); }     catch (e) { console.warn('[navbar]', e); }
    loadFooter();
    try { await loadCartDrawer(); } catch (e) { console.warn('[cart]', e); }
    await initFavDrawer();

   const slug = getQueryParam('slug') || sessionStorage.getItem('productoSlug');
    if (slug) sessionStorage.removeItem('productoSlug');
    if (!slug) {
        console.error('URL sin parámetro ?slug=');
        document.querySelector('.product-info')?.insertAdjacentHTML('afterbegin',
            '<p style="color:red;padding:20px;">No se especificó un producto. Usa ?slug=nombre-del-producto</p>');
        return;
    }

    try {
        const res = await fetch(`http://localhost:8080/api/productos/slug/${slug}`);
        if (!res.ok) throw new Error(`Producto no encontrado: ${slug}`);
        const dto = await res.json();
        PRODUCT = mapProducto(dto);
    } catch (e) {
        console.error('Error cargando producto:', e);
        return;
    }

    initProductHeader();
    initSizeSelector();
    initNivelBadge();
    initMainActions();
    initGallery();
    initDetails();
    initNotes();
    initAccords();
    initPerformanceDots();
    initContextCards();
    initFamilyGrid();
    initReviews();
    initSimilarGrid();
    initScrollReveal();
});
 
/* ══════════════════════════════════════════════════════════════
   _toggleFav — helper local
   fav-drawer.js no exporta toggleFav; esta función replica su
   lógica usando la API pública exportada (getFavsList / setFavorites
   / renderFavList) para los botones generados dinámicamente
   (familia del perfume y grid de similares).
   ══════════════════════════════════════════════════════════════ */
 
/**
 * Alterna el estado de favorito de un btn.fav-btn.
 * Sincroniza el estado visual de todos los botones con el mismo
 * data-product-id y actualiza el dropdown del navbar.
 * @param {HTMLElement} btn - Botón .fav-btn con los data-* del producto.
 */
function _toggleFav(btn) {
  const id       = btn.dataset.productId;
  const brand    = btn.dataset.brand    || '';
  const name     = btn.dataset.name     || '';
  const price    = btn.dataset.price    || '';
  const nivel    = btn.dataset.nivel    || 'green';
  const volLabel = btn.dataset.volLabel || 'Presentación';
  const tipo     = btn.dataset.tipo     || 'perfumes';
  const cat      = btn.dataset.cat      || '';
  const gen      = btn.dataset.gen      || '';
  const vol      = btn.dataset.vol      || '';
  const img      = btn.dataset.img || '';
 
  let favs = getFavsList();
  const isActive = btn.classList.contains('active');
 
  if (isActive) {
    favs = favs.filter(f => f.id !== id);
  } else {
    if (!favs.find(f => f.id === id)) {
      const productId = btn.dataset.productId;
        favs.push({ id, productId, varianteId: id, brand, name, price, vol, volLabel, nivel, tipo, cat, gen, img });
    }
  }
 
  // Sincroniza el estado visual de todos los botones con este producto
  document.querySelectorAll(`.fav-btn[data-product-id="${id}"]`).forEach(b => {
    b.classList.toggle('active', favs.some(f => f.id === id));
  });
 
  setFavorites(favs);
  renderFavList();
}
 
/* ══════════════════════════════════════════════════════════════
   SELECTOR DE TALLAS (exclusive)
   ══════════════════════════════════════════════════════════════ */
 
let selectedSizeIdx = 0;
 
/**
 * Renderiza los botones de talla y actualiza el precio al
 * seleccionar una presentación distinta.
 */
function initSizeSelector() {
  const cont = document.getElementById('prod-sizes');
  if (!cont) return;
  cont.innerHTML = '';
  PRODUCT.sizes.forEach((s, i) => {
    const btn = document.createElement('button');
    btn.className = 'size-btn' + (i === selectedSizeIdx ? ' active' : '');
    btn.textContent = s.ml + ' ml';
    btn.addEventListener('click', () => {
      selectedSizeIdx = i;
      document.getElementById('prod-price').textContent = s.price;
      document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const mainImg = document.getElementById('main-product-img');
      if (mainImg && s.img) {
        mainImg.style.opacity = '0';
        setTimeout(() => {
          mainImg.src = s.img;
          mainImg.style.opacity = '1';
        }, 150);
      }
      const mainFavBtn = document.getElementById('btn-fav-main');
        if (mainFavBtn) {
            mainFavBtn.dataset.productId  = s.id || '';
            mainFavBtn.dataset.varianteId = s.id || '';
            mainFavBtn.classList.toggle('active',
                getFavorites().some(f => f.id == s.id)
            );
        }
    });
    cont.appendChild(btn);
  });
}

function initDetails() {
    const grid = document.getElementById('details-grid');
    if (!grid) return;

    const items = [
        { label: 'Perfumista',         value: PRODUCT.perfumer,        icon: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>' },
        { label: 'País de origen',     value: PRODUCT.country,         icon: '<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>' },
        { label: 'Familia olfativa',   value: PRODUCT.family_olfativa,  icon: '<path d="M12 22V12M12 12C12 6 6 3 6 3s0 4 3 7M12 12c0-6 6-9 6-9s0 4-3 7"/><path d="M5 18c1-2 3-3 7-4"/><path d="M19 18c-1-2-3-3-7-4"/>' },
        { label: 'Año de lanzamiento', value: PRODUCT.launch,          icon: '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>' },
        { label: 'Categoría',          value: PRODUCT.category,        icon: '<path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>' },
        { label: 'Género',             value: PRODUCT.gender,          icon: '<circle cx="12" cy="11" r="3"/><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 0 1-2.827 0l-4.244-4.243a8 8 0 1 1 11.314 0z"/>' },
    ].filter(d => d.value);

    // Distribuir en 3 columnas de 2 items
    const cols = [items.slice(0,2), items.slice(2,4), items.slice(4,6)];
    grid.innerHTML = cols.map(col => `
        <div>
            ${col.map(d => `
                <div class="intel-row">
                    <div class="intel-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">${d.icon}</svg>
                    </div>
                    <div>
                        <div class="intel-text-label">${d.label}</div>
                        <div class="intel-text-value">${d.value}</div>
                    </div>
                </div>`).join('')}
        </div>`
    ).join('');
}

/* ══════════════════════════════════════════════════════════════
   NIVEL BADGE (exclusive)
   ══════════════════════════════════════════════════════════════ */
 
/**
 * Aplica la clase de color y el texto del badge de disponibilidad
 * del producto principal según PRODUCT.nivel.
 */
function initNivelBadge() {
  const badge   = document.getElementById('prod-nivel-badge');
  const labelEl = document.getElementById('prod-nivel-label');
  if (!badge || !labelEl) return;
  const n      = PRODUCT.nivel || 'green';
  const labels = { green: 'En existencia', yellow: 'Disponibilidad limitada', red: 'Pieza exclusiva' };
  badge.className = 'prod-nivel-badge ' + n;
  labelEl.textContent = labels[n] || n;
}

/* ══════════════════════════════════════════════════════════════
   Header el producto
   ══════════════════════════════════════════════════════════════ */

function initProductHeader() {
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val || ''; };
    const setHTML = (id, val) => { const el = document.getElementById(id); if (el) el.innerHTML = val || ''; };

    // Badge
    const badgeEl = document.getElementById('prod-badge');
    if (badgeEl) {
        badgeEl.textContent = PRODUCT.badge ? PRODUCT.badge.toUpperCase() : '';
        badgeEl.style.display = PRODUCT.badge ? 'inline-block' : 'none';
    }

    set('prod-brand',         PRODUCT.brand);
    set('prod-name',          PRODUCT.name);
    set('prod-concentration', PRODUCT.concentration);
    set('prod-rating',        PRODUCT.rating);
    set('prod-desc',          PRODUCT.description);

    // Review count
    const countEl = document.getElementById('prod-review-count');
    if (countEl) countEl.textContent = PRODUCT.reviewCount ? `${PRODUCT.reviewCount} reseñas` : '';

    // Stars
    const starsEl = document.getElementById('prod-stars-display');
    if (starsEl) {
        const r = PRODUCT.rating || 0;
        starsEl.innerHTML = Array.from({length:5}, (_,i) =>
            `<span style="opacity:${i < Math.round(r) ? '1' : '.25'}">★</span>`
        ).join('');
    }

    // Price inicial
    const priceEl = document.getElementById('prod-price');
    if (priceEl) {
        priceEl.textContent = PRODUCT.sizes?.length
            ? PRODUCT.sizes[PRODUCT.activeSize || 0]?.price || ''
            : PRODUCT.precio || '';
    }

    // Chips categoría + género
    const chipsEl = document.getElementById('prod-chips');
    if (chipsEl) {
        const chips = [PRODUCT.category, PRODUCT.gender].filter(Boolean);
        chipsEl.innerHTML = chips.map(c =>
            `<span class="product-meta-chip">${c.toUpperCase()}</span>`
        ).join('');
    }

    // Page title
    const titleEl = document.getElementById('page-title');
    if (titleEl) titleEl.textContent = `${PRODUCT.brand} ${PRODUCT.name} — HERA Perfumes & Joyería`;
}

/* ══════════════════════════════════════════════════════════════
   BOTONES PRINCIPALES — Add to cart y Favorito (exclusive)
   ══════════════════════════════════════════════════════════════ */
 
/**
 * Registra los event listeners del botón principal de carrito
 * y del botón grande de favoritos del hero del producto.
 */
function initMainActions() {
  // Scroll hacia las reseñas al hacer clic en la fila de rating
  const prodRatingRow = document.getElementById('prod-rating-row');
  if (prodRatingRow) {
    prodRatingRow.addEventListener('click', () => {
      const rs = document.getElementById('reviews-section');
      if (rs) rs.scrollIntoView({ behavior: 'smooth' });
    });
  }
 
  // Botón principal "Añadir al carrito"
  const mainAddCartBtn = document.getElementById('btn-add-cart-main');
if (mainAddCartBtn) {
    mainAddCartBtn.addEventListener('click', () => {
      const size = PRODUCT.sizes[selectedSizeIdx];
      const priceTxt = size?.price || PRODUCT.precio || '';
      const mlTxt    = size?.ml    || '';
      addItemToCart(size?.id);
    });
}
 
  // Botón grande de favoritos del hero
  const mainFavBtn = document.getElementById('btn-fav-main');
  if (mainFavBtn) {
    // Sincroniza estado inicial con la lista de favoritos persistida
      const initialSize = PRODUCT.sizes[selectedSizeIdx];
        if (getFavorites().some(f => f.id == initialSize?.id)) {
            mainFavBtn.classList.add('active');
        }
    }
    mainFavBtn.addEventListener('click', () => {
      // Dataset siempre actualizado (necesario tanto al añadir como al quitar)
      // para que _toggleFav pueda construir el objeto completo del favorito.
      // NO se toca classList aquí — _toggleFav lo gestiona internamente.
      const selSize = PRODUCT.sizes[selectedSizeIdx];
      mainFavBtn.dataset.productId = PRODUCT.productId || PRODUCT.id;
      mainFavBtn.dataset.brand     = PRODUCT.brand;
      mainFavBtn.dataset.name      = `${PRODUCT.name} EDP`;
      mainFavBtn.dataset.price = selSize?.price || PRODUCT.sizes[0]?.price || '';
      mainFavBtn.dataset.nivel     = PRODUCT.nivel || 'green';
      mainFavBtn.dataset.volLabel  = PRODUCT.volLabel || 'Presentación';
      mainFavBtn.dataset.tipo      = PRODUCT.tipo || 'perfumes';
      mainFavBtn.dataset.cat       = PRODUCT.cat || '';
      mainFavBtn.dataset.gen       = PRODUCT.gen || '';
      mainFavBtn.dataset.vol = selSize?.ml ? `${selSize.ml} ml` : '';
      mainFavBtn.dataset.varianteId = size?.id || '';
      mainFavBtn.dataset.img = PRODUCT.imgs?.[0] || '';
      _toggleFav(mainFavBtn);
      // btn-fav-main usa clase .btn-fav-lg, no .fav-btn —
      // _toggleFav no lo alcanza con su querySelectorAll;
      // sincronizamos el estado visual del corazón aquí
      mainFavBtn.classList.toggle('active', getFavorites().some(f => f.id == selSize?.id));
    });
  }

/* ══════════════════════════════════════════════════════════════
   GALERÍA — fit en viewport + carrusel vertical (exclusive)
   Los style.width / style.height son valores calculados
   dinámicamente — deben vivir en JS, no en CSS
   ══════════════════════════════════════════════════════════════ */
 
/**
 * Inicializa la galería de producto: carrusel de miniaturas
 * vertical y ajuste de la imagen principal al viewport.
 */
function initGallery() {
    const thumbsCont    = document.getElementById('product-thumbs');
    const mainImg       = document.getElementById('main-product-img');
    const thumbPrevBtn  = document.getElementById('thumb-prev');
    const thumbNextBtn  = document.getElementById('thumb-next');
    if (!thumbsCont || !mainImg) return;

    const imgs = PRODUCT.imgs?.length ? PRODUCT.imgs
               : PRODUCT.sizes?.map(s => s.img).filter(Boolean) || [];

    // Imagen principal inicial
    if (imgs.length) mainImg.src = imgs[0];

    // Crear thumbnails dinámicamente
    thumbsCont.innerHTML = '';
    imgs.forEach((src, i) => {
        const thumb = document.createElement('div');
        thumb.className = 'product-thumb' + (i === 0 ? ' active' : '');
        thumb.innerHTML = `<img src="${src}" style="width:100%;height:100%;object-fit:contain;" />`;
        thumb.addEventListener('click', () => {
            document.querySelectorAll('.product-thumb').forEach(t => t.classList.remove('active'));
            thumb.classList.add('active');
            mainImg.style.opacity = '0';
            setTimeout(() => { mainImg.src = src; mainImg.style.opacity = '1'; }, 150);
        });
        thumbsCont.appendChild(thumb);
    });

    const galleryThumbs  = Array.from(document.querySelectorAll('.product-thumb'));
    const galleryImgMain = document.querySelector('.product-img-main');
    const THUMB_W        = 62;
    const THUMB_GAP      = 8;
    const THUMB_VISIBLE  = 3;
    const THUMB_H        = Math.round(THUMB_W * 4 / 3);
    let   thumbOffset    = 0;
    const thumbMaxOffset = Math.max(0, galleryThumbs.length - THUMB_VISIBLE);

    function setThumbContainerHeight() {
        const visible = Math.min(THUMB_VISIBLE, galleryThumbs.length);
        thumbsCont.style.height = ((visible * THUMB_H) + (visible - 1) * THUMB_GAP) + 'px';
    }

    function updateThumbCarousel() {
        thumbsCont.style.transform = `translateY(-${thumbOffset * (THUMB_H + THUMB_GAP)}px)`;
        if (thumbPrevBtn) thumbPrevBtn.disabled = thumbOffset === 0;
        if (thumbNextBtn) thumbNextBtn.disabled = thumbOffset >= thumbMaxOffset;
    }

    if (thumbPrevBtn) thumbPrevBtn.addEventListener('click', () => { if (thumbOffset > 0) { thumbOffset--; updateThumbCarousel(); } });
    if (thumbNextBtn) thumbNextBtn.addEventListener('click', () => { if (thumbOffset < thumbMaxOffset) { thumbOffset++; updateThumbCarousel(); } });

    if (thumbMaxOffset === 0) {
        if (thumbPrevBtn) thumbPrevBtn.style.display = 'none';
        if (thumbNextBtn) thumbNextBtn.style.display = 'none';
    }

    function fitGallery() {
        if (window.innerWidth <= 1024 || !galleryImgMain) return;
        const THUMB_STRIP = THUMB_W + 10;
        const colW   = galleryImgMain.closest('.product-gallery')?.offsetWidth || (window.innerWidth / 2 - 120);
        const availW = colW - THUMB_STRIP;
        const maxH   = window.innerHeight - 200;
        const finalH = Math.min(maxH, availW * (4/3));
        const finalW = finalH * (3/4);
        galleryImgMain.style.width  = finalW + 'px';
        galleryImgMain.style.height = finalH + 'px';
        setThumbContainerHeight();
        updateThumbCarousel();
    }

    window.addEventListener('resize', fitGallery);
    window.addEventListener('load',   fitGallery);
    requestAnimationFrame(fitGallery);
}
 
/* ══════════════════════════════════════════════════════════════
   NOTAS OLFATIVAS (exclusive)
   ══════════════════════════════════════════════════════════════ */
 
/**
 * Puebla las listas de notas de salida, corazón y base con
 * los datos de PRODUCT.
 */
function initNotes() {
  console.log('headNotes:', PRODUCT.headNotes, 'heartNotes:', PRODUCT.heartNotes, 'baseNotes:', PRODUCT.baseNotes);
  const map = {
    'notes-head':  PRODUCT.headNotes,
    'notes-heart': PRODUCT.heartNotes,
    'notes-base':  PRODUCT.baseNotes,
  };
  Object.keys(map).forEach(id => {
    const ul = document.getElementById(id);
    if (!ul) return;
    (map[id] || []).forEach(nota => {
      const li = document.createElement('li');
      li.textContent = nota;
      ul.appendChild(li);
    });
  });
}
 
/* ══════════════════════════════════════════════════════════════
   ACORDES OLFATIVOS (exclusive)
   ══════════════════════════════════════════════════════════════ */
 
/**
 * Renderiza las barras de acorde y las anima cuando el
 * contenedor entra en el viewport con IntersectionObserver.
 */
function initAccords() {
  const cont = document.getElementById('accords-container');
  if (!cont) return;
  PRODUCT.accords.forEach(a => {
    const row = document.createElement('div');
    row.className = 'accord-row';
    row.innerHTML = `
      <div class="accord-header"><span class="accord-name">${a.name}</span></div>
      <div class="accord-bar-track">
        <div class="accord-bar-fill" data-pct="${a.pct}"></div>
      </div>`;
    cont.appendChild(row);
  });
 
  // Anima las barras al entrar en pantalla para reforzar el context scroll
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.querySelectorAll('.accord-bar-fill').forEach(bar => {
          bar.style.width = bar.dataset.pct + '%';
        });
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.2 });
  obs.observe(cont);
 
  // También anima las barras de distribución de reseñas al hacerlas visibles
  const distObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.querySelectorAll('.review-dist-fill').forEach(bar => {
          bar.style.width = bar.dataset.pct + '%';
        });
        distObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.2 });
  const distEl = document.getElementById('review-dist');
  if (distEl) distObs.observe(distEl);
}
 
/* ══════════════════════════════════════════════════════════════
   PERFORMANCE DOTS (exclusive)
   ══════════════════════════════════════════════════════════════ */
 
const LEVEL_LABELS = ['', 'Escasa', 'Media', 'Moderada', 'Alta', 'Excepcional'];
 
/**
 * Dibuja los puntos de performance para longevidad y estela.
 */
function initPerformanceDots() {
    const perfGrid = document.getElementById('perf-grid');
    if (!perfGrid) return;

    const perf = document.querySelector('.perf-header');
    if (perf) {
        perf.innerHTML = `
            <div>
                <div class="perf-section-label">Desempeño</div>
                <div class="perf-title">¿Cómo se <em style="font-family:var(--serif);font-style:italic;font-weight:300;color:rgba(249,249,249,.35);">comporta?</em></div>
            </div>
            <div class="perf-subtitle">Basado en las opiniones de nuestra comunidad de compradores.</div>`;
    }

    const LEVEL_DESC = {
        1: { lon: 'Dura menos de 2 horas en piel.',             sil: 'Solo tú lo percibes.' },
        2: { lon: 'Dura entre 2 y 4 horas en piel.',            sil: 'Quienes estén muy cerca lo notarán.' },
        3: { lon: 'Dura entre 4 y 8 horas en piel.',            sil: 'Quienes te rodean lo percibirán.' },
        4: { lon: 'La fragancia permanece perceptible durante 8 a 12 horas en piel.', sil: 'Se proyecta a una distancia notable; quienes te rodean lo percibirán.' },
        5: { lon: 'Excepcional duración, más de 12 horas.',     sil: 'Proyección invasiva, se percibe a gran distancia.' },
    };

    const lon = PRODUCT.longevity || 0;
    const est = PRODUCT.sillage   || 0;
    const rat = PRODUCT.rating    || 0;

    const items = [
        {
            label: 'Longevidad',
            val: lon,
            desc: LEVEL_DESC[lon]?.lon || '',
        },
        {
            label: 'Estela (Sillage)',
            val: est,
            desc: LEVEL_DESC[est]?.sil || '',
        },
    ];

    const dotsHTML = (val) => Array.from({length:5}, (_,i) =>
        `<div class="perf-dot${i < val ? ' filled' : ''}"></div>`
    ).join('');

    let html = items.map(item => `
        <div class="perf-item">
            <div class="perf-item-label">${item.label.toUpperCase()}</div>
            <div class="perf-dots">${dotsHTML(item.val)}</div>
            <div class="perf-level">${LEVEL_LABELS[item.val] || ''}</div>
            ${item.desc ? `<div class="perf-desc">${item.desc}</div>` : ''}
        </div>`
    ).join('');

    // Tercer card: puntuación general
    if (rat > 0) {
        const stars = Array.from({length:5}, (_,i) =>
            `<span${i >= Math.round(rat) ? ' class="empty"' : ''}>★</span>`
        ).join('');
        html += `
            <div class="perf-item">
                <div class="perf-item-label">Puntuación general</div>
                <div class="perf-rating-big">
                    <span class="perf-rating-num">${rat.toFixed(1)}</span>
                    <span class="perf-rating-max">/ 5</span>
                </div>
                <div class="perf-stars-display">${stars}</div>
                <div class="perf-review-count">Basado en ${PRODUCT.reviewCount || 0} reseñas verificadas</div>
            </div>`;
    }

    perfGrid.innerHTML = html;
}
 
/* ══════════════════════════════════════════════════════════════
   CONTEXT CARDS — cuándo usarlo (exclusive)
   ══════════════════════════════════════════════════════════════ */
 
const SEASONS_DATA = [
  { id: 'primavera', label: 'Primavera', icon: '<path d="M12 22V12M12 12C12 6 6 3 6 3s0 4 3 7M12 12c0-6 6-9 6-9s0 4-3 7"/><path d="M5 18c1-2 3-3 7-4"/><path d="M19 18c-1-2-3-3-7-4"/>' },
  { id: 'verano',    label: 'Verano',    icon: '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>' },
  { id: 'otono',     label: 'Otoño',     icon: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>' },
  { id: 'invierno',  label: 'Invierno',  icon: '<line x1="12" y1="2" x2="12" y2="22"/><path d="m17 7-5 5-5-5"/><path d="m17 17-5-5-5 5"/><line x1="2" y1="12" x2="22" y2="12"/><path d="m7 7 5 5 5-5"/><path d="m7 17 5-5 5 5"/>' },
];
const TIMES_DATA = [
  { id: 'dia',   label: 'Día',   icon: '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>' },
  { id: 'noche', label: 'Noche', icon: '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>' },
];
const OCCASIONS_DATA = [
  { id: 'cita',    label: 'Cita romántica', icon: '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>' },
  { id: 'oficina', label: 'Oficina',         icon: '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>' },
  { id: 'casual',  label: 'Casual',          icon: '<path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.57a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.57a2 2 0 0 0-1.34-2.23z"/>' },
  { id: 'gym',     label: 'Gym',             icon: '<rect x="3" y="8" width="3" height="8" rx="1"/><rect x="18" y="8" width="3" height="8" rx="1"/><line x1="6" y1="12" x2="18" y2="12"/>' },
  { id: 'gala',    label: 'Gala / Evento',   icon: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>' },
  { id: 'playa',   label: 'Playa',           icon: '<path d="M12 2C7 2 3 7 3 12h18c0-5-4-10-9-10z"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M9 21h6"/>' },
];
 
/**
 * Puebla las tarjetas de contexto (temporada, hora, ocasión)
 * marcando como .active las que aplican al producto.
 */
function initContextCards() {
    const container = document.getElementById('context-container');
    if (!container) return;

    const momentoCards = TIMES_DATA.map(item => `
        <div class="ctx-card${PRODUCT.timeOfDay.includes(item.id) ? ' active' : ''}">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">${item.icon}</svg>
            <span class="ctx-card-name">${item.label}</span>
        </div>`).join('');

    const temporadaCards = SEASONS_DATA.map(item => `
        <div class="ctx-card${PRODUCT.seasons.includes(item.id) ? ' active' : ''}">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">${item.icon}</svg>
            <span class="ctx-card-name">${item.label}</span>
        </div>`).join('');

    const ocasionCards = OCCASIONS_DATA.map(item => `
        <div class="ctx-card${PRODUCT.occasions.includes(item.id) ? ' active' : ''}">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">${item.icon}</svg>
            <span class="ctx-card-name">${item.label}</span>
        </div>`).join('');

    container.innerHTML = `
        <div class="context-row-1">
            <div class="context-block">
                <div class="context-label">Momento del día</div>
                <div class="context-cards">${momentoCards}</div>
            </div>
            <div class="context-block-wide">
                <div class="context-label">Temporada recomendada</div>
                <div class="context-cards">${temporadaCards}</div>
            </div>
        </div>
        <div>
            <div class="context-label">Ocasión ideal</div>
            <div class="context-cards">${ocasionCards}</div>
        </div>`;
}
 
/* ══════════════════════════════════════════════════════════════
   FAMILIA DEL PERFUME (exclusive)
   ══════════════════════════════════════════════════════════════ */
 
/**
 * Construye el grid de variantes de la familia del perfume.
 * Oculta la sección completa si hay menos de 2 variantes.
 */
function initFamilyGrid() {
  const familySec = document.getElementById('family-section');
  if (!PRODUCT.family || PRODUCT.family.length < 2) {
    if (familySec) familySec.style.display = 'none';
    return;
  }
  const grid = document.getElementById('family-scroll');
  if (!grid) return;
 
  // El número de columnas se calcula dinámicamente para adaptarse
  // a la cantidad real de variantes en la familia
  grid.style.gridTemplateColumns = `repeat(${PRODUCT.family.length}, 1fr)`;
 
  const familyTitleEl = document.getElementById('family-title-name');
  if (familyTitleEl) familyTitleEl.textContent = PRODUCT.name;
 
  PRODUCT.family.forEach(v => {
    const card     = document.createElement('div');
    card.className = 'fm-card' + (v.current ? ' current' : '');
    const badge    = v.current ? '<div class="fm-badge fm-badge-current">Viendo</div>' : '';
    const btnLabel = v.current ? 'Viendo' : 'Ver producto';
    const nNivel   = v.nivel || 'red';
    const nLabel   = { green: 'En existencia', yellow: 'Disp. limitada', red: 'Pieza exclusiva' }[nNivel] || 'En existencia';
    const favId    = 'family-' + v.name.replace(/\s+/g, '-').toLowerCase();
    card.innerHTML = `
      ${badge}
      <div class="fm-img-wrap">
        ${v.img
      ? `<img src="${v.img}" style="width:100%; height:100%; object-fit:contain;" />`
      : `<div class="fm-placeholder">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
          <span>Imagen del perfume</span>
        </div>`
    }
        <div class="fm-overlay">
          <button class="fm-overlay-btn">${btnLabel}</button>
        </div>
        <button class="fav-btn" data-product-id="${favId}" data-brand="${PRODUCT.brand}"
          data-name="${v.name}" data-price="${v.price}" data-nivel="${nNivel}"
          data-vol-label="Presentación" data-tipo="perfumes" aria-label="Añadir a favoritos">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
        </button>
      </div>
      <div class="fm-info">
        <div class="fm-brand">${PRODUCT.brand}</div>
        <div class="fm-name">${v.name}</div>
        <div class="fm-detail">${v.concentration}${v.vol ? ' · ' + v.vol : ''}</div>
        <div class="fm-price">${v.price}</div>
        <div class="fm-nivel ${nNivel}"><span class="fm-nivel-dot"></span>${nLabel}</div>
      </div>`;
    grid.appendChild(card);
 
    // Vincula el fav-btn después de que el sistema de favoritos está listo
    const favBtn = card.querySelector('.fav-btn');
    if (favBtn) {
      if (getFavorites().some(f => f.id === favId)) favBtn.classList.add('active');
      favBtn.addEventListener('click', e => { e.stopPropagation(); _toggleFav(favBtn); });
    }
  });
}
 
/* ══════════════════════════════════════════════════════════════
   RESEÑAS (exclusive)
   ══════════════════════════════════════════════════════════════ */
 
/**
 * Inicializa el sistema de reseñas: distribución de estrellas,
 * formulario de nueva reseña con validación y lista de reseñas.
 */
function initReviews() {
  /**
   * Carga las reseñas base + las guardadas por el usuario.
   * @returns {Array}
   */
  function loadAllReviews() {
    return [...PRODUCT.reviews, ...getReviews(PRODUCT.id)];
  }
 
  const bigNum = document.getElementById('rev-big-num');
  const starsLg = document.getElementById('rev-stars-lg');
  if (bigNum) bigNum.textContent = PRODUCT.rating ? PRODUCT.rating.toFixed(1) : '0';
  if (starsLg) {
      starsLg.innerHTML = Array.from({length:5}, (_,i) =>
          `<span${i >= Math.round(PRODUCT.rating || 0) ? ' class="empty"' : ''}>★</span>`
      ).join('');
  }

  /**
   * Construye el elemento DOM de una tarjeta de reseña.
   * @param {Object} r - Objeto de reseña.
   * @returns {HTMLElement}
   */
  function buildReviewCard(r) {
    let stars = '';
    for (let j = 1; j <= 5; j++) {
      stars += j <= r.rating ? '★' : '<span class="review-star-empty">★</span>';
    }
    const card = document.createElement('div');
    card.className = 'review-card';
    card.innerHTML = `
      <div class="review-header">
        <div>
          <div class="review-author">${r.author}</div>
          <div class="review-city">${r.city}</div>
        </div>
        <div class="review-meta">
          <div class="review-stars">${stars}</div>
          <div class="review-date">${r.date}</div>
        </div>
      </div>
      <p class="review-text">${r.text}</p>`;
    return card;
  }
 
  function renderList() {
    const lc = document.getElementById('review-list');
    const ce = document.getElementById('rev-list-count');
    if (!lc) return;
    lc.innerHTML = '';
    const all = loadAllReviews();
    all.forEach(r => lc.appendChild(buildReviewCard(r)));
    if (ce) ce.textContent = all.length + ' reseña' + (all.length !== 1 ? 's' : '');
  }
 
  // Distribución de estrellas
  const distCont = document.getElementById('review-dist');
  if (distCont) {
    const total = PRODUCT.ratingDist.reduce((s, v) => s + v, 0);
    for (let i = 0; i < 5; i++) {
      const sn  = 5 - i;
      const pct = total > 0 ? Math.round((PRODUCT.ratingDist[i] / total) * 100) : 0;
      const row = document.createElement('div');
      row.className = 'review-dist-row';
      row.innerHTML = `
        <span class="review-dist-label">${sn}</span>
        <div class="review-dist-track">
          <div class="review-dist-fill" data-pct="${pct}"></div>
        </div>
        <span class="review-dist-count">${PRODUCT.ratingDist[i]}</span>`;
      distCont.appendChild(row);
    }
  }
 
  // Selector de estrellas del formulario
  const starInput   = document.getElementById('star-input');
  let selectedStars = 0;
  if (starInput) {
    const starSpans = starInput.querySelectorAll('span');
    starSpans.forEach(sp => {
      sp.addEventListener('mouseover', () => {
        const val = parseInt(sp.dataset.val);
        starSpans.forEach(s => s.classList.toggle('active', parseInt(s.dataset.val) <= val));
      });
      sp.addEventListener('mouseout', () => {
        starSpans.forEach(s => s.classList.toggle('active', parseInt(s.dataset.val) <= selectedStars));
      });
      sp.addEventListener('click', () => {
        selectedStars = parseInt(sp.dataset.val);
        starSpans.forEach(s => s.classList.toggle('active', parseInt(s.dataset.val) <= selectedStars));
      });
    });
 
    // Envío de reseña
    const submitBtn  = document.getElementById('rev-submit');
    const successMsg = document.getElementById('rev-success');
    if (submitBtn) {
      submitBtn.addEventListener('click', () => {
        const name = document.getElementById('rev-name').value.trim();
        const city = document.getElementById('rev-city').value.trim();
        const text = document.getElementById('rev-text').value.trim();
        if (!name || !text || selectedStars === 0) {
          // Feedback visual de validación — estado dinámico, requiere JS
          submitBtn.style.background = 'var(--red)';
          submitBtn.textContent = 'Completa todos los campos';
          setTimeout(() => { submitBtn.style.background = ''; submitBtn.textContent = 'Publicar reseña'; }, 2000);
          return;
        }
        const review = { author: name, city: city || 'México', rating: selectedStars, text, date: formatDateES() };
        // Guarda solo las reseñas nuevas (las base viven en PRODUCT.reviews)
        const stored = getReviews(PRODUCT.id);
        stored.unshift(review);
        saveReviews(PRODUCT.id, stored);
        renderList();
        // Limpia el formulario tras publicar
        document.getElementById('rev-name').value = '';
        document.getElementById('rev-city').value = '';
        document.getElementById('rev-text').value = '';
        selectedStars = 0;
        starSpans.forEach(s => s.classList.remove('active'));
        if (successMsg) {
          successMsg.style.display = 'block';
          setTimeout(() => { successMsg.style.display = 'none'; }, 3000);
        }
      });
    }
  }
 
  renderList();
}
 
/* ══════════════════════════════════════════════════════════════
   SIMILAR GRID (exclusive)
   ══════════════════════════════════════════════════════════════ */
 
/**
 * Construye el grid de productos similares con sus botones de
 * volumen, carrito y favoritos.
 */
function initSimilarGrid() {
  const grid = document.getElementById('similar-grid');
  if (!grid || !PRODUCT.similar) return;
 
  PRODUCT.similar.forEach(p => {
    let badge = '';
    if (p.badge === 'Nuevo' || p.badge === 'Más vendido') badge = `<span class="ed-badge ed-badge-red">${p.badge}</span>`;
    else if (p.badge) badge = `<span class="ed-badge ed-badge-gray">${p.badge}</span>`;
 
    const vols     = p.vols || [];
    const volLabel = p.volLabel || 'Presentación';
    const volsHTML = vols.map((v, i) => {
      const lbl = /^\d+$/.test(String(v.ml)) ? v.ml + ' ml' : v.ml;
      return `<button class="ed-vol-btn${i === 0 ? ' sel' : ''}" data-precio="${v.precio}" data-ml="${v.ml}">${lbl}</button>`;
    }).join('');
    const volSection     = vols.length > 0 ? `<div class="ed-vol-label">${volLabel}</div><div class="ed-vols">${volsHTML}</div>` : '';
    const precioInicial  = vols.length > 0 ? formatMXN(vols[0].precio) : p.price;
    const nNivel         = p.nivel || 'green';
    const nLabel         = { green: 'En existencia', yellow: 'Disp. limitada', red: 'Pieza exclusiva' }[nNivel] || 'En existencia';
 
    const item = document.createElement('div');
    item.className = 'ed-item reveal';
    item.innerHTML = `
      <div class="ed-badge-row">
        ${badge}
        <button class="fav-btn" data-product-id="${p.id}" data-brand="${p.brand}"
          data-name="${p.name}" data-price="${p.price}" data-nivel="${nNivel}"
          data-vol-label="${volLabel}" data-tipo="${p.tipo || 'perfumes'}"
          data-cat="${p.cat || ''}" data-gen="${p.gen || ''}" aria-label="Añadir a favoritos">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
        </button>
      </div>
      <div class="ed-img-zone">
      ${p.img
        ? `<img src="${p.img}" style="width:100%; height:100%; object-fit:contain;" />`
        : `<div class="ed-img-placeholder">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="1"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
            <span>Imagen del perfume</span>
          </div>`
}
        <div class="ed-cart-overlay">
          <button class="ed-cart-btn" data-brand="${p.brand}" data-name="${p.name}"
            data-price="${p.price}" data-nivel="${nNivel}">Agregar al carrito</button>
        </div>
      </div>
      <div class="ed-brand">${p.brand}</div>
      <div class="ed-name">${p.name}</div>
      ${volSection}
      <div class="ed-footer">
        <div class="ed-price">${precioInicial}</div>
        <a href="producto.html?id=${p.id}" class="ed-cta">Ver producto
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>
        </a>
      </div>
      <div class="ed-nivel ${nNivel}"><span class="ed-nivel-dot"></span>${nLabel}</div>`;
 
    // Selector de volúmenes actualiza el precio mostrado
    item.querySelectorAll('.ed-vol-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        item.querySelectorAll('.ed-vol-btn').forEach(b => b.classList.remove('sel'));
        btn.classList.add('sel');
        item.querySelector('.ed-price').textContent = formatMXN(parseInt(btn.dataset.precio));
      });
    });
 
    // Fav-btn vinculado al sistema de favoritos
    const favBtn = item.querySelector('.fav-btn');
    if (favBtn) {
      if (getFavorites().some(f => f.id === favBtn.dataset.productId)) favBtn.classList.add('active');
      favBtn.addEventListener('click', e => { e.stopPropagation(); _toggleFav(favBtn); });
    }
 
    // Botón de carrito rápido desde el overlay de la tarjeta.
    // Lee el volumen seleccionado en ese momento para:
    //   1. Mostrar el ml correcto en el carrito
    //   2. Usar el precio del volumen seleccionado
    //   3. Generar un ID único por volumen (distintas presentaciones
    //      deben ser líneas separadas en el carrito, no acumular qty)
    const cartBtn = item.querySelector('.ed-cart-btn');
    if (cartBtn) {
      cartBtn.addEventListener('click', () => {
        const selVol   = item.querySelector('.ed-vol-btn.sel');
        const ml       = selVol ? selVol.dataset.ml : '';
        const volStr   = ml ? ml + ' ml' : '';
        const priceVal = selVol ? parseInt(selVol.dataset.precio) : null;
        const priceStr = priceVal ? formatMXN(priceVal) : p.price;
        // ID único por producto + volumen — evita que distintas
        // presentaciones se acumulen en el mismo item del carrito
        const uniqueId = ml ? `${p.id}-${ml}ml` : p.id;
        const fullName = volStr ? `${p.name} ${volStr}` : p.name;
        addItemToCart(p.varianteId || uniqueId);
      });
    }
 
    grid.appendChild(item);
  });
 
  // Re-observa los nuevos elementos .reveal del grid
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) e.target.classList.add('visible');
      else e.target.classList.remove('visible');
    });
  }, { threshold: 0.12 });
  grid.querySelectorAll('.reveal').forEach(el => obs.observe(el));
}
 
/* ══════════════════════════════════════════════════════════════
   SCROLL REVEAL (canonical)
   ══════════════════════════════════════════════════════════════ */
 
/**
 * Observa todos los elementos .reveal de la página y les aplica
 * .visible cuando entran en el viewport.
 */
function initScrollReveal() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) e.target.classList.add('visible');
      else e.target.classList.remove('visible');
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
}
 