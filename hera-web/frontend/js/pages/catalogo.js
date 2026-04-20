/**
 * catalogo.js — HERA
 *
 * Descripción: Script principal de la página de catálogo. Orquesta la carga
 *   de componentes universales, inicializa el motor de filtros, el grid de
 *   productos, el sort, el load more, el filter drawer móvil y los URL params.
 *
 * Exporta: (ninguno — es el punto de entrada de la página)
 * Importado por: pages/catalogo.html vía <script type="module">
 */

import { loadNavbar }                       from '../components/navbar.js';
import { initCartDrawer, addItemToCart,
         openCart, closeCart }              from '../components/cart-drawer.js';
import { initFavDrawer, toggleFav,
         renderFavList }                    from '../components/fav-drawer.js';
import { highlightQuery, formatPriceMXN,
         formatVolLabel }                   from '../utils/formatter.js';

// ── Constantes de paginación ─────────────────────────────────
const PAGE_SIZE = 12;
const INCREMENT = 6;

// ── TEMPORAL — datos hardcodeados por ausencia de backend
//    Reemplazar este array por una llamada fetch() a la API
//    cuando el backend esté disponible.
//    Endpoint esperado: GET /api/productos
// ─────────────────────────────────────────────────────────────
const CATALOG = [
  { id:'jenny-1',      brand:'Jenny Rivera',        name:'Inolvidable EDP',    price:'$1,210 MXN', precio:1210, badge:'Más vendido', cat:'diseñador', gen:'femenino',  fam:'floral',    marca:'jenny-rivera',     nuevo:false, tipo:'perfumes', nivel:'green',  vols:[{ml:50,precio:1210},{ml:100,precio:1890}] },
  { id:'fierce-2',     brand:'Abercrombie & Fitch', name:'Fierce EDT',         price:'$760 MXN',   precio:760,  badge:'',           cat:'diseñador', gen:'masculino', fam:'fresco',    marca:'abercrombie',      nuevo:false, tipo:'perfumes', nivel:'green',  vols:[{ml:50,precio:760},{ml:100,precio:1180},{ml:200,precio:1740}] },
  { id:'authentic-3',  brand:'Abercrombie & Fitch', name:'Authentic EDP',      price:'$975 MXN',   precio:975,  badge:'Ed. limitada',cat:'diseñador', gen:'unisex',   fam:'amaderado', marca:'abercrombie',      nuevo:false, tipo:'perfumes', nivel:'yellow', vols:[{ml:50,precio:975},{ml:100,precio:1540}] },
  { id:'signature-4',  brand:'HERA Exclusivo',      name:'Signature Blanc',    price:'$1,490 MXN', precio:1490, badge:'Nuevo',       cat:'nicho',     gen:'unisex',   fam:'floral',    marca:'hera-exclusivo',   nuevo:true,  tipo:'perfumes', nivel:'yellow', vols:[{ml:50,precio:1490},{ml:100,precio:2280}] },
  { id:'noir-5',       brand:'HERA Exclusivo',      name:'Noir Absolu',        price:'$1,480 MXN', precio:1480, badge:'-20%',        cat:'nicho',     gen:'masculino', fam:'oriental',  marca:'hera-exclusivo',   nuevo:false, tipo:'perfumes', nivel:'yellow', vols:[{ml:50,precio:1480},{ml:100,precio:2200}] },
  { id:'oud-6',        brand:'HERA Árabe',          name:'Oud Rose',           price:'$1,320 MXN', precio:1320, badge:'',           cat:'arabes',    gen:'unisex',   fam:'oriental',  marca:'hera-arabe',       nuevo:false, tipo:'perfumes', nivel:'green',  vols:[{ml:30,precio:1320},{ml:50,precio:1890}] },
  { id:'sauvage-7',    brand:'Dior',                name:'Sauvage EDP',        price:'$2,450 MXN', precio:2450, badge:'Más vendido', cat:'diseñador', gen:'masculino', fam:'fresco',    marca:'dior',             nuevo:false, tipo:'perfumes', nivel:'red',    vols:[{ml:60,precio:1850},{ml:100,precio:2450},{ml:200,precio:3100}] },
  { id:'blanche-8',    brand:'Byredo',              name:'Blanche EDP',        price:'$2,100 MXN', precio:2100, badge:'',           cat:'nicho',     gen:'femenino',  fam:'floral',    marca:'byredo',           nuevo:false, tipo:'perfumes', nivel:'red',    vols:[{ml:50,precio:2100},{ml:100,precio:3400}] },
  { id:'lune-9',       brand:'HERA Árabe',          name:"Lune d'Orient",      price:'$1,580 MXN', precio:1580, badge:'',           cat:'arabes',    gen:'unisex',   fam:'oriental',  marca:'hera-arabe',       nuevo:false, tipo:'perfumes', nivel:'green',  vols:[{ml:30,precio:1580},{ml:50,precio:2200}] },
  { id:'rose-10',      brand:'HERA Árabe',          name:'Rose Majlis',        price:'$1,290 MXN', precio:1290, badge:'Nuevo',       cat:'arabes',    gen:'femenino',  fam:'floral',    marca:'hera-arabe',       nuevo:true,  tipo:'perfumes', nivel:'green',  vols:[{ml:30,precio:1290},{ml:50,precio:1820}] },
  { id:'velvet-11',    brand:'HERA Exclusivo',      name:'Velvet Oud',         price:'$1,680 MXN', precio:1680, badge:'',           cat:'nicho',     gen:'unisex',   fam:'oriental',  marca:'hera-exclusivo',   nuevo:false, tipo:'perfumes', nivel:'yellow', vols:[{ml:50,precio:1680},{ml:100,precio:2590}] },
  { id:'set-1',        brand:'HERA Exclusivo',      name:'Gift Set Signature', price:'$2,200 MXN', precio:2200, badge:'Nuevo',       cat:'sets',      gen:'unisex',   fam:'floral',    marca:'hera-exclusivo',   nuevo:true,  tipo:'perfumes', nivel:'red',    vols:[{ml:100,precio:2200}] },
  { id:'amber-12',     brand:'Jenny Rivera',        name:'Amber Eterno EDP',   price:'$1,050 MXN', precio:1050, badge:'',           cat:'diseñador', gen:'femenino',  fam:'oriental',  marca:'jenny-rivera',     nuevo:false, tipo:'perfumes', nivel:'green',  vols:[{ml:50,precio:1050},{ml:100,precio:1680}] },
  { id:'silver-13',    brand:'HERA Exclusivo',      name:'Silver Iris EDP',    price:'$1,750 MXN', precio:1750, badge:'',           cat:'nicho',     gen:'unisex',   fam:'floral',    marca:'hera-exclusivo',   nuevo:false, tipo:'perfumes', nivel:'red',    vols:[{ml:50,precio:1750},{ml:100,precio:2690}] },
  { id:'bm-1',         brand:"Victoria's Secret",  name:'Bombshell BM',       price:'$520 MXN',   precio:520,  badge:'Nuevo',       cat:'body-mist', gen:'femenino',  fam:'floral',    marca:'victorias-secret', nuevo:true,  tipo:'perfumes', nivel:'green',  vols:[{ml:250,precio:520}] },
  { id:'bm-2',         brand:'Bath & Body Works',  name:'Japanese Cherry BM', price:'$480 MXN',   precio:480,  badge:'',           cat:'body-mist', gen:'femenino',  fam:'floral',    marca:'bbw',              nuevo:false, tipo:'perfumes', nivel:'green',  vols:[{ml:236,precio:480}] },
  { id:'anillo-1',     brand:'HERA Joyería',       name:'Anillo Solitario',   price:'$1,290 MXN', precio:1290, badge:'Nuevo',       cat:'anillos',   gen:'femenino',  fam:'',          marca:'hera-joyeria',     nuevo:true,  tipo:'joyeria',  nivel:'yellow', vols:[{ml:'5',precio:1290},{ml:'6',precio:1290},{ml:'7',precio:1290},{ml:'8',precio:1290},{ml:'9',precio:1350}], volLabel:'Talla', masVariantes:true },
  { id:'aretes-1',     brand:'HERA Joyería',       name:'Aretes Perla',       price:'$680 MXN',   precio:680,  badge:'',           cat:'aretes',    gen:'femenino',  fam:'',          marca:'hera-joyeria',     nuevo:false, tipo:'joyeria',  nivel:'yellow', vols:[{ml:'Plata .925',precio:680},{ml:'Oro 14k',precio:980}], volLabel:'Material', masVariantes:false },
  { id:'collar-1',     brand:'HERA Joyería',       name:'Collar Dorado',      price:'$890 MXN',   precio:890,  badge:'',           cat:'collares',  gen:'unisex',   fam:'',          marca:'hera-joyeria',     nuevo:false, tipo:'joyeria',  nivel:'yellow', vols:[{ml:'40 cm',precio:890},{ml:'45 cm',precio:890},{ml:'50 cm',precio:920}], volLabel:'Largo', masVariantes:false },
  { id:'brazalete-1',  brand:'HERA Joyería',       name:'Brazalete Minimal',  price:'$750 MXN',   precio:750,  badge:'Nuevo',       cat:'brazaletes',gen:'unisex',   fam:'',          marca:'hera-joyeria',     nuevo:true,  tipo:'joyeria',  nivel:'red',    vols:[{ml:'Plata .925',precio:750},{ml:'Oro 18k',precio:1200}], volLabel:'Material', masVariantes:false },
];

// ── Estado global del catálogo ────────────────────────────────
let activeFilters    = { cat:[], gen:[], fam:[], marca:[], precioMin:0, precioMax:99999 };
let currentSort      = 'relevancia';
let visibleCount     = PAGE_SIZE;
let filteredCache    = CATALOG.slice();
let activeCategoryTab = 'perfumes';

// ── Mapa de etiquetas para los chips de filtro activo ─────────
const LABEL_MAP = {
  cat:   { diseñador:'Diseñador', nicho:'Nicho', arabes:'Árabes', testers:'Testers', decants:'Decants', sets:'Sets', 'body-mist':'Body Mist', anillos:'Anillos', aretes:'Aretes', collares:'Collares', brazaletes:'Brazaletes' },
  gen:   { masculino:'Masculino', femenino:'Femenino', unisex:'Unisex' },
  fam:   { floral:'Floral', oriental:'Oriental', amaderado:'Amaderado', fresco:'Fresco', gourmand:'Gourmand' },
  marca: { 'jenny-rivera':'Jenny Rivera', abercrombie:'Abercrombie', 'hera-exclusivo':'HERA Exclusivo', 'hera-arabe':'HERA Árabe', dior:'Dior', byredo:'Byredo', 'hera-joyeria':'HERA Joyería' },
};

// ── Referencias DOM del catálogo ──────────────────────────────
let grid, emptyState, countEl, loadMoreBtn;
let chipsRow, mobileChips;

// ══════════════════════════════════════════════════════════════
//  INIT — punto de entrada
// ══════════════════════════════════════════════════════════════

/**
 * Inicializa todos los módulos de la página en el orden correcto:
 * 1. Navbar (fetch + lógica)
 * 2. Cart drawer (fetch + lógica)
 * 3. Fav drawer (inyecta callback del carrito para evitar circular)
 * 4. Search overlay
 * 5. Footer (fetch)
 * 6. Catálogo (URL params → filtros → render inicial)
 */
async function init() {
  // Componentes universales — el orden importa porque el carrito
  // debe estar en el DOM antes de que el fav drawer pueda llamar addItemToCart
  await loadNavbar();
  await initCartDrawer();
  initFavDrawer(addItemToCart);
  _initSearchOverlay();
  _loadFooter();

  // Obtener referencias DOM del catálogo
  grid        = document.getElementById('product-grid');
  emptyState  = document.getElementById('catalog-empty');
  countEl     = document.getElementById('catalog-count');
  loadMoreBtn = document.getElementById('loadMoreBtn');
  chipsRow    = document.getElementById('active-chips-row');
  mobileChips = document.getElementById('mobile-active-chips');

  // Leer URL params antes del render inicial para aplicar tab y filtro pre-seleccionado
  _applyUrlParams();

  // Sidebar y tabs
  _initCategoryTabs();
  _initSidebarFilters();
  _initFilterDrawer();
  _initSort();
  _initLoadMore();
  _initEmptyState();
  _initSortMobileBtn();

  // Render inicial del grid
  updateSidebarForTab(activeCategoryTab);
  applyFilters();
}

// ══════════════════════════════════════════════════════════════
//  GRID DE PRODUCTOS
// ══════════════════════════════════════════════════════════════

/**
 * Construye y devuelve el elemento DOM de una tarjeta de producto.
 * @param {Object} p - Objeto de producto del CATALOG
 * @returns {HTMLElement}
 */
function buildCard(p) {
  const isFav      = document.querySelector(`.fav-btn[data-product-id="${p.id}"]`)?.classList.contains('active') ?? false;
  const vols       = p.vols || [];
  const volLabel   = p.volLabel || 'Presentación';
  const MAX_SHOW   = 3;
  const showVols   = vols.slice(0, MAX_SHOW);
  const extraCount = vols.length > MAX_SHOW ? vols.length - MAX_SHOW : 0;

  // Badge: clases canónicas según tipo
  let badgeHTML = '';
  if (p.badge) {
    const badgeMod = (p.badge === '-20%' || p.badge === 'Ed. limitada') ? 'ed-item-badge--dark' : 'ed-item-badge--red';
    badgeHTML = `<span class="ed-item-badge ${badgeMod}">${p.badge}</span>`;
  }

  // Botones de volumen
  let volsHTML = showVols.map((v, i) => {
    const displayLabel = formatVolLabel(v.ml, p.tipo);
    return `<button class="ed-vol-btn${i === 0 ? ' sel' : ''}" data-precio="${v.precio}" data-ml="${v.ml}">${displayLabel}</button>`;
  }).join('');
  if (extraCount > 0) {
    volsHTML += `<a href="/pages/producto.html?id=${p.id}" class="ed-vol-more">+${extraCount} más</a>`;
  }
  const volSection = vols.length > 0
    ? `<div class="ed-vol-label">${volLabel}</div><div class="ed-vols">${volsHTML}</div>`
    : '';

  const precioInicial = vols.length > 0 ? formatPriceMXN(vols[0].precio) : p.price;
  const imgLabel      = p.tipo === 'joyeria' ? 'Imagen de la pieza' : 'Imagen del perfume';
  const nivelLabels   = { green:'En existencia', yellow:'Disponibilidad limitada', red:'Pieza exclusiva' };
  const nNivel        = p.nivel || 'green';

  const html =
    `<div class="ed-item" data-id="${p.id}">` +
      `<div class="ed-item-header">` +
        badgeHTML +
        `<button class="fav-btn${isFav ? ' active' : ''}"` +
          ` data-product-id="${p.id}"` +
          ` data-brand="${p.brand}"` +
          ` data-name="${p.name}"` +
          ` data-price="${p.price}"` +
          ` data-nivel="${p.nivel || 'green'}"` +
          ` data-vol-label="${p.volLabel || 'Presentación'}"` +
          ` data-tipo="${p.tipo || 'perfumes'}"` +
          ` data-cat="${p.cat || ''}"` +
          ` data-gen="${p.gen || ''}"` +
          ` aria-label="Añadir a favoritos">` +
          `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>` +
        `</button>` +
      `</div>` +
      `<div class="ed-img-zone">` +
        `<div class="ed-img-placeholder">` +
          `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>` +
          `<span>${imgLabel}</span>` +
        `</div>` +
        `<div class="ed-cart-overlay">` +
          `<button class="ed-cart-btn">Agregar al carrito</button>` +
        `</div>` +
      `</div>` +
      `<div class="ed-brand">${p.brand}</div>` +
      `<div class="ed-name">${p.name}</div>` +
      volSection +
      `<div class="ed-footer">` +
        `<div class="ed-price">${precioInicial}</div>` +
        `<a href="/pages/producto.html?id=${p.id}" class="ed-cta">Ver producto <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg></a>` +
      `</div>` +
      `<div class="ed-nivel ${nNivel}"><span class="ed-nivel-dot"></span>${nivelLabels[nNivel]}</div>` +
    `</div>`;

  const wrapper  = document.createElement('div');
  wrapper.innerHTML = html;
  const card = wrapper.firstChild;

  // Selector de volumen — actualiza precio al seleccionar
  card.querySelectorAll('.ed-vol-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      card.querySelectorAll('.ed-vol-btn').forEach((b) => b.classList.remove('sel'));
      btn.classList.add('sel');
      card.querySelector('.ed-price').textContent = formatPriceMXN(parseInt(btn.dataset.precio));
    });
  });

  // Links: evitar propagación al card
  const ctaLink    = card.querySelector('.ed-cta');
  const volMoreLink = card.querySelector('.ed-vol-more');
  if (ctaLink)    ctaLink.addEventListener('click', (e) => e.stopPropagation());
  if (volMoreLink) volMoreLink.addEventListener('click', (e) => e.stopPropagation());

  // Botón favorito
  const favBtn = card.querySelector('.fav-btn');
  favBtn.addEventListener('click', (e) => { e.stopPropagation(); toggleFav(favBtn); });

  // Botón agregar al carrito desde la tarjeta
  const cartBtnCard = card.querySelector('.ed-cart-btn');
  cartBtnCard.addEventListener('click', (e) => {
    e.stopPropagation();
    const selVol = card.querySelector('.ed-vol-btn.sel');
    const precio = selVol ? parseInt(selVol.dataset.precio) : p.precio;
    const ml     = selVol ? selVol.dataset.ml : '';
    const vol    = ml ? formatVolLabel(ml, p.tipo) : '';
    addItemToCart(
      p.id + (ml ? '-' + ml : ''),
      p.brand,
      p.name,
      formatPriceMXN(precio),
      vol,
      p.nivel || 'green'
    );
  });

  return card;
}

// ══════════════════════════════════════════════════════════════
//  FILTROS Y SORT
// ══════════════════════════════════════════════════════════════

/**
 * Aplica los filtros activos + sort al CATALOG, actualiza filteredCache
 * y dispara el re-render del grid, chips y badge de filtros.
 */
function applyFilters() {
  const af = activeFilters;
  filteredCache = CATALOG.filter((p) => {
    if (activeCategoryTab !== 'todos' && p.tipo !== activeCategoryTab) return false;
    if (af.cat.length   && !af.cat.includes(p.cat))     return false;
    if (af.gen.length   && !af.gen.includes(p.gen))     return false;
    if (af.fam.length   && !af.fam.includes(p.fam))     return false;
    if (af.marca.length && !af.marca.includes(p.marca)) return false;
    if (af.precioMin > 0     && p.precio < af.precioMin) return false;
    if (af.precioMax < 99999 && p.precio > af.precioMax) return false;
    return true;
  });
  filteredCache = _sortCatalog(filteredCache);
  _renderGrid();
  _renderActiveChips();
  _syncCheckboxes();
  _updateFilterBadge();
}

/**
 * Ordena un array de productos según currentSort.
 * @param {Array} arr
 * @returns {Array}
 * @private
 */
function _sortCatalog(arr) {
  const s = currentSort;
  if (s === 'precio-asc')  return arr.slice().sort((a, b) => a.precio - b.precio);
  if (s === 'precio-desc') return arr.slice().sort((a, b) => b.precio - a.precio);
  if (s === 'novedades')   return arr.slice().sort((a, b) => (b.nuevo ? 1 : 0) - (a.nuevo ? 1 : 0));
  if (s === 'bestsellers') return arr.slice().sort((a, b) => (b.badge === 'Más vendido' ? 1 : 0) - (a.badge === 'Más vendido' ? 1 : 0));
  return arr;
}

/**
 * Re-renderiza el grid con los productos del filteredCache según visibleCount.
 * @private
 */
function _renderGrid() {
  grid.innerHTML = '';
  const slice = filteredCache.slice(0, visibleCount);
  if (slice.length === 0) {
    emptyState.classList.add('visible');
    if (loadMoreBtn) loadMoreBtn.style.display = 'none';
    countEl.textContent = 'Sin resultados';
    return;
  }
  emptyState.classList.remove('visible');
  slice.forEach((p) => grid.appendChild(buildCard(p)));
  countEl.textContent = `Mostrando ${slice.length} de ${filteredCache.length} producto${filteredCache.length !== 1 ? 's' : ''}`;
  if (loadMoreBtn) loadMoreBtn.style.display = filteredCache.length > visibleCount ? 'inline-block' : 'none';
}

// ── Chips de filtros activos ───────────────────────────────────

/**
 * Renderiza los chips de filtros activos en desktop y en la barra móvil.
 * @private
 */
function _renderActiveChips() {
  const chips = [];
  ['cat', 'gen', 'fam', 'marca'].forEach((group) => {
    activeFilters[group].forEach((val) => {
      const label = (LABEL_MAP[group] && LABEL_MAP[group][val]) ? LABEL_MAP[group][val] : val;
      chips.push({ group, val, label });
    });
  });
  if (activeFilters.precioMin > 0 || activeFilters.precioMax < 99999) {
    const pMin  = activeFilters.precioMin > 0     ? '$' + activeFilters.precioMin  : '';
    const pMax  = activeFilters.precioMax < 99999 ? '$' + activeFilters.precioMax  : '';
    const pLabel = (pMin && pMax) ? `${pMin}–${pMax}` : (pMin ? `desde ${pMin}` : `hasta ${pMax}`);
    chips.push({ group:'precio', val:'precio', label:pLabel });
  }

  // Desktop chips
  chipsRow.innerHTML = '';
  if (chips.length > 0) {
    chips.forEach((c) => {
      const btn = document.createElement('button');
      btn.className = 'active-chip';
      btn.innerHTML = `${c.label} <span class="chip-x">×</span>`;
      btn.addEventListener('click', () => _removeFilter(c.group, c.val));
      chipsRow.appendChild(btn);
    });
    const clearBtn = document.createElement('button');
    clearBtn.className   = 'chips-clear-all';
    clearBtn.textContent = 'Limpiar todo';
    clearBtn.addEventListener('click', clearAllFilters);
    chipsRow.appendChild(clearBtn);
  }

  // Mobile filter bar chips (máx. 3)
  mobileChips.innerHTML = '';
  chips.slice(0, 3).forEach((c) => {
    const btn = document.createElement('button');
    btn.className = 'filter-mobile-chip';
    btn.innerHTML = `${c.label} <span>×</span>`;
    btn.addEventListener('click', () => _removeFilter(c.group, c.val));
    mobileChips.appendChild(btn);
  });
}

/**
 * Elimina un filtro específico del estado activo y re-aplica.
 * @param {string} group - Grupo del filtro: 'cat' | 'gen' | 'fam' | 'marca' | 'precio'
 * @param {string} val   - Valor del filtro
 * @private
 */
function _removeFilter(group, val) {
  if (group === 'precio') {
    activeFilters.precioMin = 0;
    activeFilters.precioMax = 99999;
    ['f-precio-min','f-precio-max','dm-precio-min','dm-precio-max'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
  } else {
    activeFilters[group] = activeFilters[group].filter((v) => v !== val);
  }
  visibleCount = PAGE_SIZE;
  applyFilters();
}

/**
 * Limpia todos los filtros activos y reinicia el sort.
 */
function clearAllFilters() {
  activeFilters = { cat:[], gen:[], fam:[], marca:[], precioMin:0, precioMax:99999 };
  document.querySelectorAll('[data-group]').forEach((cb) => { cb.checked = false; });
  document.querySelectorAll('.price-input').forEach((i) => { i.value = ''; });
  visibleCount = PAGE_SIZE;
  currentSort  = 'relevancia';
  const sortEl = document.getElementById('sort-select');
  if (sortEl) sortEl.value = 'relevancia';
  applyFilters();
}

/**
 * Sincroniza el estado visual de los checkboxes con activeFilters.
 * Necesario después de limpiar filtros o al abrir el filter drawer.
 * @private
 */
function _syncCheckboxes() {
  ['cat', 'gen', 'fam', 'marca'].forEach((group) => {
    document.querySelectorAll(`[data-group="${group}"]`).forEach((cb) => {
      cb.checked = activeFilters[group].includes(cb.value);
    });
  });
}

/**
 * Actualiza el badge numérico del botón de filtros en la barra móvil.
 * @private
 */
function _updateFilterBadge() {
  let count = activeFilters.cat.length + activeFilters.gen.length
            + activeFilters.fam.length + activeFilters.marca.length;
  if (activeFilters.precioMin > 0 || activeFilters.precioMax < 99999) count++;
  const badge = document.getElementById('filter-badge');
  if (badge) {
    badge.textContent    = count;
    badge.style.display  = count > 0 ? 'inline-flex' : 'none';
  }
}

// ── Sidebar dinámico (muestra/oculta secciones según tab activo) ──

/**
 * Muestra u oculta las secciones del sidebar según el tab activo.
 * Cada .filter-section tiene un atributo data-tabs con los tabs donde debe mostrarse.
 * @param {string} tab - Tab activo: 'perfumes' | 'joyeria' | 'todos'
 */
function updateSidebarForTab(tab) {
  document.querySelectorAll('.catalog-sidebar .filter-section[data-tabs]').forEach((el) => {
    const tabs = el.dataset.tabs.split(' ');
    el.style.display = tabs.includes(tab) ? '' : 'none';
  });
}

// ══════════════════════════════════════════════════════════════
//  BINDINGS — eventos de la UI
// ══════════════════════════════════════════════════════════════

/**
 * Inicializa los checkboxes y rangos de precio del sidebar desktop.
 * @private
 */
function _initSidebarFilters() {
  document.querySelectorAll('.catalog-sidebar [data-group]').forEach((cb) => {
    cb.addEventListener('change', () => {
      const g = cb.dataset.group;
      const v = cb.value;
      if (cb.checked) {
        if (!activeFilters[g].includes(v)) activeFilters[g].push(v);
      } else {
        activeFilters[g] = activeFilters[g].filter((x) => x !== v);
      }
      visibleCount = PAGE_SIZE;
      applyFilters();
    });
  });

  const fPrecioMin  = document.getElementById('f-precio-min');
  const fPrecioMax  = document.getElementById('f-precio-max');
  const dmPrecioMin = document.getElementById('dm-precio-min');
  const dmPrecioMax = document.getElementById('dm-precio-max');

  if (fPrecioMin) fPrecioMin.addEventListener('change', () => {
    activeFilters.precioMin = parseInt(fPrecioMin.value) || 0;
    if (dmPrecioMin) dmPrecioMin.value = fPrecioMin.value;
    visibleCount = PAGE_SIZE; applyFilters();
  });
  if (fPrecioMax) fPrecioMax.addEventListener('change', () => {
    activeFilters.precioMax = parseInt(fPrecioMax.value) || 99999;
    if (dmPrecioMax) dmPrecioMax.value = fPrecioMax.value;
    visibleCount = PAGE_SIZE; applyFilters();
  });

  const sidebarClearAll = document.getElementById('sidebarClearAll');
  if (sidebarClearAll) sidebarClearAll.addEventListener('click', clearAllFilters);
}

/**
 * Inicializa los tabs de categoría (Perfumes / Joyería).
 * @private
 */
function _initCategoryTabs() {
  document.querySelectorAll('.catalog-tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => _setTab(btn.dataset.tab, btn));
  });
}

/**
 * Activa un tab de categoría, actualiza el título dinámico y aplica filtros.
 * @param {string} tab - 'perfumes' | 'joyeria'
 * @param {HTMLElement} btn - Botón que se activó
 * @private
 */
function _setTab(tab, btn) {
  activeCategoryTab = tab;
  document.querySelectorAll('.catalog-tab-btn').forEach((b) => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  const emEl = document.getElementById('catalog-title-em');
  if (emEl) emEl.textContent = tab === 'joyeria' ? 'joyería.' : 'perfumes.';
  visibleCount = PAGE_SIZE;
  updateSidebarForTab(tab);
  clearAllFilters();
}

/**
 * Inicializa el select de ordenamiento.
 * @private
 */
function _initSort() {
  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) sortSelect.addEventListener('change', () => {
    currentSort = sortSelect.value;
    applyFilters();
  });
}

/**
 * Inicializa el botón de sort móvil que delega al select nativo.
 * @private
 */
function _initSortMobileBtn() {
  const sortMobileBtn = document.getElementById('sortMobileBtn');
  const sortSelect    = document.getElementById('sort-select');
  if (sortMobileBtn && sortSelect) {
    sortMobileBtn.addEventListener('click', () => sortSelect.focus());
  }
}

/**
 * Inicializa el botón de "Cargar más productos".
 * @private
 */
function _initLoadMore() {
  if (loadMoreBtn) loadMoreBtn.addEventListener('click', () => {
    visibleCount += INCREMENT;
    _renderGrid();
  });
}

/**
 * Inicializa el botón de "Limpiar filtros" del empty state.
 * @private
 */
function _initEmptyState() {
  const emptyStateClearBtn = document.getElementById('emptyStateClearBtn');
  if (emptyStateClearBtn) emptyStateClearBtn.addEventListener('click', clearAllFilters);
}

// ── Filter drawer móvil ───────────────────────────────────────

/**
 * Inicializa el drawer de filtros móvil: apertura, cierre, aplicar y limpiar.
 * @private
 */
function _initFilterDrawer() {
  const filterDrawerOverlay = document.getElementById('filterDrawerOverlay');
  const filterDrawer        = document.getElementById('filterDrawer');
  const filterOpenBtn       = document.getElementById('filterOpenBtn');
  const filterDrawerClose   = document.getElementById('filterDrawerClose');
  const filterDrawerApply   = document.getElementById('filterDrawerApply');
  const filterDrawerReset   = document.getElementById('filterDrawerReset');
  const dmPrecioMin         = document.getElementById('dm-precio-min');
  const dmPrecioMax         = document.getElementById('dm-precio-max');

  function openFilterDrawer() {
    filterDrawer.classList.add('open');
    filterDrawerOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeFilterDrawer() {
    filterDrawer.classList.remove('open');
    filterDrawerOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  // Exponer closeFilterDrawer para el Escape global
  window._closeFilterDrawer = closeFilterDrawer;

  if (filterOpenBtn)       filterOpenBtn.addEventListener('click', () => { _copyFiltersToDrawer(); openFilterDrawer(); });
  if (filterDrawerClose)   filterDrawerClose.addEventListener('click', closeFilterDrawer);
  if (filterDrawerOverlay) filterDrawerOverlay.addEventListener('click', closeFilterDrawer);

  // Aplica los filtros del drawer al estado global
  if (filterDrawerApply) filterDrawerApply.addEventListener('click', () => {
    ['cat','gen','fam'].forEach((group) => {
      activeFilters[group] = [];
      document.querySelectorAll(`.filter-drawer [data-group="${group}"]`).forEach((cb) => {
        if (cb.checked) activeFilters[group].push(cb.value);
      });
    });
    activeFilters.precioMin = parseInt(dmPrecioMin?.value) || 0;
    activeFilters.precioMax = parseInt(dmPrecioMax?.value) || 99999;
    visibleCount = PAGE_SIZE;
    applyFilters();
    closeFilterDrawer();
  });

  // Limpia el drawer y los filtros globales
  if (filterDrawerReset) filterDrawerReset.addEventListener('click', () => {
    document.querySelectorAll('.filter-drawer [data-group]').forEach((cb) => { cb.checked = false; });
    if (dmPrecioMin) dmPrecioMin.value = '';
    if (dmPrecioMax) dmPrecioMax.value = '';
    clearAllFilters();
    closeFilterDrawer();
  });

  // Tecla Escape cierra el filter drawer además del search overlay
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeFilterDrawer();
  });
}

/**
 * Copia el estado actual de activeFilters al drawer antes de abrirlo,
 * para que el usuario vea reflejados los filtros ya aplicados.
 * @private
 */
function _copyFiltersToDrawer() {
  document.querySelectorAll('.filter-drawer [data-group]').forEach((cb) => {
    cb.checked = (activeFilters[cb.dataset.group] || []).includes(cb.value);
  });
  const dmPrecioMin = document.getElementById('dm-precio-min');
  const dmPrecioMax = document.getElementById('dm-precio-max');
  if (dmPrecioMin) dmPrecioMin.value = activeFilters.precioMin > 0 ? activeFilters.precioMin : '';
  if (dmPrecioMax) dmPrecioMax.value = activeFilters.precioMax < 99999 ? activeFilters.precioMax : '';
}

// ── Search overlay ────────────────────────────────────────────

/**
 * Inicializa el search overlay: apertura, cierre y búsqueda con debounce.
 * @private
 */
function _initSearchOverlay() {
  const searchOverlay  = document.getElementById('search-overlay');
  const searchInput    = document.getElementById('search-input');
  const searchResults  = document.getElementById('search-results');
  const searchCloseBtn = document.getElementById('search-close-btn');
  const searchBtn      = document.getElementById('search-btn');

  if (!searchOverlay) return;

  function openSearch() {
    searchOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    setTimeout(() => searchInput.focus(), 300);
  }
  function closeSearch() {
    searchOverlay.classList.remove('open');
    document.body.style.overflow = '';
    searchInput.value = '';
    _renderSearchResults('');
  }

  if (searchBtn)      searchBtn.addEventListener('click', openSearch);
  if (searchCloseBtn) searchCloseBtn.addEventListener('click', closeSearch);
  searchOverlay.addEventListener('click', (e) => { if (e.target === searchOverlay) closeSearch(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeSearch(); });

  // Delegación de clicks en resultados para cerrar el overlay al navegar
  searchResults.addEventListener('click', (e) => {
    if (e.target.closest('.search-result-item')) closeSearch();
  });

  // Debounce de 180ms para no disparar en cada tecla
  let searchDebounce;
  searchInput.addEventListener('input', () => {
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(() => _renderSearchResults(searchInput.value), 180);
  });
}

/**
 * Renderiza los resultados de búsqueda en el overlay.
 * @param {string} query - Término de búsqueda
 * @private
 */
function _renderSearchResults(query) {
  const searchResults = document.getElementById('search-results');
  const q = (query || '').trim().toLowerCase();
  if (!q) {
    searchResults.innerHTML = '<p class="search-hint">Busca por nombre o marca</p>';
    return;
  }
  const hits = CATALOG.filter((p) => (p.name + ' ' + p.brand).toLowerCase().includes(q));
  if (!hits.length) {
    searchResults.innerHTML = `<div class="search-empty"><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg><p>Sin resultados para "<strong>${query}</strong>"</p></div>`;
    return;
  }
  let html = `<p class="search-hint">${hits.length} resultado${hits.length !== 1 ? 's' : ''}</p>`;
  hits.forEach((p) => {
    html +=
      `<div class="search-result-item">` +
        `<div class="search-result-thumb"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(249,249,249,.3)" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg></div>` +
        `<div class="search-result-info">` +
          `<div class="search-result-brand">${highlightQuery(p.brand, query)}</div>` +
          `<div class="search-result-name">${highlightQuery(p.name, query)}</div>` +
          `<div class="search-result-price">${p.price}</div>` +
          (p.badge ? `<div class="search-result-badge">${p.badge}</div>` : '') +
        `</div>` +
        `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(15,15,15,.25)" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>` +
      `</div>`;
  });
  searchResults.innerHTML = html;
}

// ── Footer ────────────────────────────────────────────────────

/**
 * Carga el fragmento del footer en #footer-placeholder.
 * @private
 */
async function _loadFooter() {
  const placeholder = document.getElementById('footer-placeholder');
  if (!placeholder) return;
  // Ruta relativa al archivo JS para independencia del servidor
  const base = new URL('../..', import.meta.url).href;
  const res  = await fetch(base + '/components/footer.html');
  const html = await res.text();
  placeholder.innerHTML = html;
}

// ── URL params ────────────────────────────────────────────────

/**
 * Lee los query params de la URL (?tab=, ?cat=) al cargar la página
 * y pre-configura el tab activo y el filtro de categoría.
 * @private
 */
function _applyUrlParams() {
  const params   = new URLSearchParams(window.location.search);
  const tabParam = params.get('tab');
  const catParam = params.get('cat');
  const joyCats  = ['anillos','aretes','collares','brazaletes'];
  let targetTab  = 'perfumes';

  if (tabParam === 'joyeria') {
    targetTab = 'joyeria';
  } else if (catParam) {
    const c = decodeURIComponent(catParam).toLowerCase();
    if (joyCats.includes(c)) targetTab = 'joyeria';
  }

  activeCategoryTab = targetTab;
  document.querySelectorAll('.catalog-tab-btn').forEach((b) => {
    b.classList.toggle('active', b.dataset.tab === targetTab);
  });
  const emEl = document.getElementById('catalog-title-em');
  if (emEl) emEl.textContent = targetTab === 'joyeria' ? 'joyería.' : 'perfumes.';

  // Pre-aplicar filtro de categoría si viene en la URL
  if (catParam) {
    const clean = decodeURIComponent(catParam).toLowerCase();
    if (!activeFilters.cat.includes(clean)) activeFilters.cat.push(clean);
  }
}

// ── Arranque ──────────────────────────────────────────────────
init();
