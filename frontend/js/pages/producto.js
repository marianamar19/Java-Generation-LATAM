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
const PRODUCT = {
  id: 'dior-sauvage-edp', brand: 'Dior', name: 'Sauvage', concentration: 'Eau de Parfum',
  category: 'Diseñador', gender: 'Masculino', country: 'Francia',
  perfumer: 'François Demachy', family_olfativa: 'Aromática amaderada', launch: 2018,
  badge: 'Más vendido',
  description: 'Una fuerza de la naturaleza hecha perfume. Sauvage EDP profundiza la tradición con una apertura de lavanda silvestre y pimienta de Sichuan, mientras una base de sándalo de Mysore y ámbar gris le otorgan una durabilidad excepcional. Un clásico contemporáneo.',
  headNotes:  ['Lavanda silvestre', 'Pimienta de Sichuan'],
  heartNotes: ['Lavanda', 'Geranio', 'Vetiver'],
  baseNotes:  ['Sándalo de Mysore', 'Ámbar gris', 'Cedro', 'Vainilla ahumada'],
  accords: [
    { name: 'Amaderado', pct: 92 }, { name: 'Lavanda', pct: 86 },
    { name: 'Especiado', pct: 74 }, { name: 'Fresco',  pct: 68 },
    { name: 'Vainilla',  pct: 48 }, { name: 'Terroso', pct: 36 },
  ],
  longevity: 4, sillage: 4, rating: 4.4, reviewCount: 124,
  seasons: ['otono', 'invierno'], timeOfDay: ['noche'], occasions: ['cita', 'gala', 'casual'],
  sizes: [
    { ml: 60,  price: '$1,890 MXN', value: 1890, img: 'https://res.cloudinary.com/dgvvsw6fs/image/upload/q_auto/f_auto/v1777440279/WhatsApp_Image_2026-04-28_at_10.27.02_PM_3_bocruu.jpg'},
    { ml: 100, price: '$2,490 MXN', value: 2490, img: 'https://res.cloudinary.com/dgvvsw6fs/image/upload/q_auto/f_auto/v1777440284/WhatsApp_Image_2026-04-28_at_10.27.03_PM_kukzvv.jpg'},
    { ml: 200, price: '$3,290 MXN', value: 3290, img: 'https://res.cloudinary.com/dgvvsw6fs/image/upload/q_auto/f_auto/v1777440281/WhatsApp_Image_2026-04-28_at_10.27.03_PM_1_m37zng.jpg'},
  ],
  activeSize: 1, nivel: 'red', volLabel: 'Presentación',
  tipo: 'perfumes', cat: 'diseñador', gen: 'masculino',
  family: [
    { name: 'Sauvage EDT',       concentration: 'Eau de Toilette', img: 'https://www.elpalaciodehierro.com/dw/image/v2/BDKB_PRD/on/demandware.static/-/Sites-palacio-master-catalog/default/dw378b49e0/images/41676579/large/41676579_x1.jpg?sw=2200&sh=2500', price: '$1,690 MXN', vol: '100 ml', nivel: 'red' },
    { name: 'Sauvage EDP',       concentration: 'Eau de Parfum', img: 'https://www.elpalaciodehierro.com/dw/image/v2/BDKB_PRD/on/demandware.static/-/Sites-palacio-master-catalog/default/dwdbe214e2/images/39882541/large/39882541_x1.jpg?sw=2200&sh=2500',  price: '$2,490 MXN', vol: '100 ml', nivel: 'red', current: true },
    { name: 'Sauvage Parfum',    concentration: 'Parfum',   img: 'https://www.elpalaciodehierro.com/dw/image/v2/BDKB_PRD/on/demandware.static/-/Sites-palacio-master-catalog/default/dwb13a66e5/images/40397845/large/40397845_x1.jpg?sw=2200&sh=2500',        price: '$3,190 MXN', vol: '75 ml',  nivel: 'red' },
    { name: 'Sauvage Elixir',    concentration: 'Elixir',    img: 'https://www.elpalaciodehierro.com/dw/image/v2/BDKB_PRD/on/demandware.static/-/Sites-palacio-master-catalog/default/dw9b91bf30/images/42786853/large/42786853_x1.jpg?sw=2200&sh=2500',       price: '$3,890 MXN', vol: '60 ml',  nivel: 'red' },
    { name: 'Sauvage Eau Forte', concentration: 'Eau Forte',   img: 'https://www.elpalaciodehierro.com/dw/image/v2/BDKB_PRD/on/demandware.static/-/Sites-palacio-master-catalog/default/dw2b04f8f5/images/44123188/large/44123188_x1.jpg?sw=2200&sh=2500',     price: '$2,190 MXN', vol: '100 ml', nivel: 'red' },
  ],
  reviews: [
    { author: 'Carlos M.',  city: 'Guadalajara, Jal.', rating: 5, text: 'Increíble duración. Lo uso para salidas nocturnas y al día siguiente sigue presente. Definitivamente el mejor de la colección Sauvage.', date: 'Marzo 2025' },
    { author: 'Sofía R.',   city: 'Ciudad de México',  rating: 4, text: 'Mi favorito desde hace años. La diferencia con el EDT es notable: más profundo y elegante. Ideal para eventos formales y cenas.', date: 'Enero 2025' },
    { author: 'Andrés T.',  city: 'Monterrey, N.L.',   rating: 5, text: 'Perfecto para cenas y eventos formales. Recibo comentarios cada vez que lo uso. La botella también es muy elegante.', date: 'Febrero 2025' },
    { author: 'Luis G.',    city: 'Puebla, Pue.',      rating: 4, text: 'Muy buen perfume. La estela es notable sin ser agresiva. Lo compré para el invierno y es perfecta para la temporada fría.', date: 'Diciembre 2024' },
    { author: 'Mariana V.', city: 'Guadalajara, Jal.', rating: 5, text: 'Se lo compré a mi pareja y me encantó tanto que ya quiero uno para mí. Unisex en todo sentido. Excelente compra.', date: 'Noviembre 2024' },
  ],
  ratingDist: [82, 28, 10, 3, 1],
  similar: [
    { id: 'bleu-chanel',   tipo: 'perfumes', cat: 'diseñador', gen: 'masculino', brand: 'Chanel', name: 'Bleu de Chanel EDP', img: 'https://www.elpalaciodehierro.com/dw/image/v2/BDKB_PRD/on/demandware.static/-/Sites-palacio-master-catalog/default/dwb06470b3/images/31531703/large/31531703_x1.jpg?sw=2200&sh=2500', price: '$2,890 MXN', badge: null,    nivel: 'red',    volLabel: 'Presentación', vols: [{ ml: 50, precio: 2890 }, { ml: 100, precio: 4200 }] },
    { id: 'ysl-myslf',     tipo: 'perfumes', cat: 'diseñador', gen: 'masculino', brand: 'YSL',   name: 'Myself EDP', img: 'https://www.yslbeauty.com.mx/dw/image/v2/AATL_PRD/on/demandware.static/-/Sites-ysl-master-catalog/es_MX/dwea5d1bb8/2024/pdp/fragancia/YSLM-51115YSL/3614273852821%20(60ML)/ysl_dmi_fram_myslf_edp_packshot_front_60ml_3000x3000px_3614273852821_rgb.jpg?sw=1536&sh=1536&sm=cut&sfrm=jpeg&q=85',       price: '$1,990 MXN', badge: 'Nuevo',  nivel: 'yellow', volLabel: 'Presentación', vols: [{ ml: 60, precio: 1990 }, { ml: 100, precio: 2890 }] },
    { id: 'aventus-creed', tipo: 'perfumes', cat: 'nicho',     gen: 'masculino', brand: 'Creed', name: 'Aventus EDP',  img: 'https://www.elpalaciodehierro.com/dw/image/v2/BDKB_PRD/on/demandware.static/-/Sites-palacio-master-catalog/default/dw06b20c29/images/40626051/large/40626051_x1.jpg?sw=2200&sh=2500',     price: '$4,290 MXN', badge: 'Nicho',  nivel: 'red',    volLabel: 'Presentación', vols: [{ ml: 50, precio: 4290 }, { ml: 75,  precio: 5890 }] },
  ],
  imgs: [
    'https://res.cloudinary.com/dgvvsw6fs/image/upload/q_auto/f_auto/v1777440282/WhatsApp_Image_2026-04-28_at_10.27.02_PM_cx55jc.jpg',
    'https://res.cloudinary.com/dgvvsw6fs/image/upload/q_auto/f_auto/v1777440278/WhatsApp_Image_2026-04-28_at_10.27.02_PM_2_ohxcbl.jpg',
    'https://res.cloudinary.com/dgvvsw6fs/image/upload/q_auto/f_auto/v1777440277/WhatsApp_Image_2026-04-28_at_10.27.02_PM_1_hij9ew.jpg',
  ],
};
 
/* ══════════════════════════════════════════════════════════════
   BOOTSTRAP — carga componentes universales y luego la página
   ══════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', async () => {
  // Cada fetch en su propio try/catch: si navbar o cart-drawer fallan,
  // el resto de la página sigue inicializándose correctamente
  try { await loadNavbar(); }      catch (e) { console.warn('[navbar]', e); }
  loadFooter();
  try { await loadCartDrawer(); }  catch (e) { console.warn('[cart]', e); }
 
  // initFavDrawer recibe addItemToCart como callback para evitar
  // dependencia circular entre fav-drawer y cart-drawer
  initFavDrawer();
 
  // Inicializa todas las secciones exclusivas de la página
  initSizeSelector();
  initNivelBadge();
  initMainActions();
  initGallery();
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
 
  let favs = getFavsList();
  const isActive = btn.classList.contains('active');
 
  if (isActive) {
    favs = favs.filter(f => f.id !== id);
  } else {
    if (!favs.find(f => f.id === id)) {
      favs.push({ id, brand, name, price, vol, volLabel, nivel, tipo, cat, gen });
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
 
let selectedSizeIdx = PRODUCT.activeSize;
 
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
    });
    cont.appendChild(btn);
  });
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
      addItemToCart(
        PRODUCT.id,
        PRODUCT.brand,
        `${PRODUCT.name} EDP ${size.ml}ml`,
        size.price,
        `${size.ml} ml`,
        PRODUCT.nivel || 'green'
      );
    });
  }
 
  // Botón grande de favoritos del hero
  const mainFavBtn = document.getElementById('btn-fav-main');
  if (mainFavBtn) {
    // Sincroniza estado inicial con la lista de favoritos persistida
    if (getFavorites().some(f => f.id === PRODUCT.id)) {
      mainFavBtn.classList.add('active');
    }
    mainFavBtn.addEventListener('click', () => {
      // Dataset siempre actualizado (necesario tanto al añadir como al quitar)
      // para que _toggleFav pueda construir el objeto completo del favorito.
      // NO se toca classList aquí — _toggleFav lo gestiona internamente.
      const selSize = PRODUCT.sizes[selectedSizeIdx];
      mainFavBtn.dataset.productId = PRODUCT.id;
      mainFavBtn.dataset.brand     = PRODUCT.brand;
      mainFavBtn.dataset.name      = `${PRODUCT.name} EDP`;
      mainFavBtn.dataset.price     = selSize.price;
      mainFavBtn.dataset.nivel     = PRODUCT.nivel || 'green';
      mainFavBtn.dataset.volLabel  = PRODUCT.volLabel || 'Presentación';
      mainFavBtn.dataset.tipo      = PRODUCT.tipo || 'perfumes';
      mainFavBtn.dataset.cat       = PRODUCT.cat || '';
      mainFavBtn.dataset.gen       = PRODUCT.gen || '';
      mainFavBtn.dataset.vol       = `${selSize.ml} ml`;
      _toggleFav(mainFavBtn);
      // btn-fav-main usa clase .btn-fav-lg, no .fav-btn —
      // _toggleFav no lo alcanza con su querySelectorAll;
      // sincronizamos el estado visual del corazón aquí
      mainFavBtn.classList.toggle('active', getFavorites().some(f => f.id === PRODUCT.id));
    });
  }
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
  const galleryThumbs     = Array.from(document.querySelectorAll('.product-thumb'));
  const galleryThumbsCont = document.querySelector('.product-thumbs');
  const galleryImgMain    = document.querySelector('.product-img-main');
  const thumbPrevBtn      = document.getElementById('thumb-prev');
  const thumbNextBtn      = document.getElementById('thumb-next');
 
  const THUMB_W       = 62;
  const THUMB_GAP     = 8;
  const THUMB_VISIBLE = 3;
  const THUMB_H       = Math.round(THUMB_W * 4 / 3);
  let thumbOffset     = 0;
  const thumbMaxOffset = Math.max(0, galleryThumbs.length - THUMB_VISIBLE);

  // ── Poblar galería con imágenes de PRODUCT.imgs ──────────────
const mainImg = document.getElementById('main-product-img');

if (PRODUCT.imgs && PRODUCT.imgs.length) {
  // Imagen principal: arranca con la primera
  if (mainImg) mainImg.src = PRODUCT.imgs[0];

  // Thumbs: reemplaza el SVG placeholder por un <img> real
  galleryThumbs.forEach((thumb, i) => {
    if (PRODUCT.imgs[i]) {
      thumb.innerHTML = `<img src="${PRODUCT.imgs[i]}"
        style="width:100%; height:100%; object-fit:contain;" />`;
    }
  });
}
 
  galleryThumbs.forEach((thumb, i) => {
    thumb.addEventListener('click', () => {
      galleryThumbs.forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');

      if (mainImg && PRODUCT.imgs && PRODUCT.imgs[i]) {
      mainImg.style.opacity = '0';
      setTimeout(() => {
        mainImg.src = PRODUCT.imgs[i];
        mainImg.style.opacity = '1';
      }, 150);
    }
    });
  });
 
  function setThumbContainerHeight() {
    const visible = Math.min(THUMB_VISIBLE, galleryThumbs.length);
    const h = (visible * THUMB_H) + (visible - 1) * THUMB_GAP;
    galleryThumbsCont.style.height = h + 'px';
  }
 
  function updateThumbCarousel() {
    const step = THUMB_H + THUMB_GAP;
    galleryThumbsCont.style.transform = `translateY(-${thumbOffset * step}px)`;
    thumbPrevBtn.disabled = thumbOffset === 0;
    thumbNextBtn.disabled = thumbOffset >= thumbMaxOffset;
  }
 
  thumbPrevBtn.addEventListener('click', () => { if (thumbOffset > 0)              { thumbOffset--; updateThumbCarousel(); } });
  thumbNextBtn.addEventListener('click', () => { if (thumbOffset < thumbMaxOffset) { thumbOffset++; updateThumbCarousel(); } });
 
  // Oculta los botones de navegación si no hay suficientes thumbs
  if (thumbMaxOffset === 0) {
    thumbPrevBtn.style.display = 'none';
    thumbNextBtn.style.display = 'none';
  }
 
  function fitGallery() {
    // En tablet/móvil el CSS controla el tamaño; no se calcula aquí
    if (window.innerWidth <= 1024) return;
    const THUMB_STRIP = THUMB_W + 10;
    const CHROME      = 200;
    const colW        = galleryImgMain.closest('.product-gallery').offsetWidth || (window.innerWidth / 2 - 120);
    const availW      = colW - THUMB_STRIP;
    const naturalH    = availW * (4 / 3);
    const maxH        = window.innerHeight - CHROME;
    const finalH      = Math.min(maxH, naturalH);
    const finalW      = finalH * (3 / 4);
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
  /**
   * Llena el contenedor con dots, coloreando los que corresponden
   * al valor dado.
   * @param {string} containerId
   * @param {number} val - Valor de 1 a 5.
   */
  function renderDots(containerId, val) {
    const c = document.getElementById(containerId);
    if (!c) return;
    c.innerHTML = '';
    for (let i = 1; i <= 5; i++) {
      const d = document.createElement('div');
      d.className = 'perf-dot' + (i <= val ? ' filled' : '');
      c.appendChild(d);
    }
  }
 
  renderDots('longevity-dots', PRODUCT.longevity);
  renderDots('sillage-dots',   PRODUCT.sillage);
 
  const lonEl = document.getElementById('longevity-level');
  const silEl = document.getElementById('sillage-level');
  if (lonEl) lonEl.textContent = LEVEL_LABELS[PRODUCT.longevity];
  if (silEl) silEl.textContent = LEVEL_LABELS[PRODUCT.sillage];
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
  /**
   * @param {string}   containerId - ID del contenedor destino.
   * @param {Object[]} data        - Array de definición de tarjetas.
   * @param {string[]} activeList  - IDs que deben marcarse como activos.
   */
  function renderContextCards(containerId, data, activeList) {
    const cont = document.getElementById(containerId);
    if (!cont) return;
    data.forEach(item => {
      const active = activeList.includes(item.id);
      const card   = document.createElement('div');
      card.className = 'ctx-card' + (active ? ' active' : '');
      card.innerHTML = `
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">${item.icon}</svg>
        <span class="ctx-card-name">${item.label}</span>`;
      cont.appendChild(card);
    });
  }
  renderContextCards('season-cards',   SEASONS_DATA,   PRODUCT.seasons);
  renderContextCards('time-cards',     TIMES_DATA,     PRODUCT.timeOfDay);
  renderContextCards('occasion-cards', OCCASIONS_DATA, PRODUCT.occasions);
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
        addItemToCart(uniqueId, p.brand, fullName, priceStr, volStr, p.nivel || 'green');
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
 