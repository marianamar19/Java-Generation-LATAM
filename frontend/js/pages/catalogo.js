/**
 * catalogo.js — HERA
 *
 * Descripción: Script exclusivo de la página Catálogo (perfumes + joyería).
 *              Orquesta la carga de componentes universales e inicializa
 *              toda la lógica exclusiva de esta página:
 *              grid de productos, filtros sidebar + drawer mobile,
 *              chips de filtros activos, tabs de categoría, sort,
 *              load-more, favoritos y buscador con catálogo completo.
 * Exporta:     (ninguno — es el entry point de la página)
 * Importado por: pages/catalogo.html vía <script type="module">
 */
 
import { loadAnnounceBar }          from '../components/announce-bar.js';
import { loadNavbar }   from '../components/navbar.js';
import { loadFooter }               from '../components/footer.js';
import { loadCartDrawer, addItemToCart } from '../components/cart-drawer.js';
import { initFavDrawer, getFavorites, renderFavList } from '../components/fav-drawer.js';
 
/* ══════════════════════════════════════════════════════════════
  CATÁLOGO DE PRODUCTOS
  ── TEMPORAL — datos hardcodeados por ausencia de backend
      Reemplazar por fetch('/api/productos') cuando esté disponible.
      Endpoint esperado: GET /api/productos
══════════════════════════════════════════════════════════════ */
const CATALOG = [
  { id:'jenny-1',      brand:'Jenny Rivera',        name:'Inolvidable EDP',    price:'$1,210 MXN', precio:1210, badge:'Más vendido',  cat:'diseñador', gen:'femenino',  fam:'floral',    marca:'jenny-rivera',     nuevo:false, tipo:'perfumes', nivel:'green',  vols:[{ml:50,precio:1210},{ml:100,precio:1890}],                                        img:'https://res.cloudinary.com/dgvvsw6fs/image/upload/c_crop,ar_3:4/v1777435414/Inolvidable_om7vkr.png' },
  { id:'fierce-2',     brand:'Abercrombie & Fitch', name:'Fierce EDT',         price:'$760 MXN',   precio:760,  badge:'',            cat:'diseñador', gen:'masculino', fam:'fresco',    marca:'abercrombie',      nuevo:false, tipo:'perfumes', nivel:'green',  vols:[{ml:50,precio:760},{ml:100,precio:1180},{ml:200,precio:1740}],                    img:'https://res.cloudinary.com/dgvvsw6fs/image/upload/c_crop,ar_3:4/v1777437610/Gemini_Generated_Image_alqn7qalqn7qalqn_1_tfubtj.png' },
  { id:'authentic-3',  brand:'Abercrombie & Fitch', name:'Authentic EDP',      price:'$975 MXN',   precio:975,  badge:'Ed. limitada', cat:'diseñador', gen:'unisex',   fam:'amaderado', marca:'abercrombie',      nuevo:false, tipo:'perfumes', nivel:'yellow', vols:[{ml:50,precio:975},{ml:100,precio:1540}],                                         img:'https://res.cloudinary.com/dgvvsw6fs/image/upload/c_crop,ar_3:4/v1777395579/Animale_Animale_for_Men_EDT_100_mL_q9rdzi.svg' },
  { id:'signature-4',  brand:'HERA Exclusivo',      name:'Signature Blanc',    price:'$1,490 MXN', precio:1490, badge:'Nuevo',        cat:'nicho',     gen:'unisex',   fam:'floral',    marca:'hera-exclusivo',   nuevo:true,  tipo:'perfumes', nivel:'yellow', vols:[{ml:50,precio:1490},{ml:100,precio:2280}],                                        img:'https://res.cloudinary.com/dgvvsw6fs/image/upload/c_crop,ar_3:4/v1777437622/Gemini_Generated_Image_vgjgs4vgjgs4vgjg_ujbhzu.png' },
  { id:'noir-5',       brand:'HERA Exclusivo',      name:'Noir Absolu',        price:'$1,480 MXN', precio:1480, badge:'-20%',         cat:'nicho',     gen:'masculino', fam:'oriental',  marca:'hera-exclusivo',   nuevo:false, tipo:'perfumes', nivel:'yellow', vols:[{ml:50,precio:1480},{ml:100,precio:2200}],                                        img:'https://res.cloudinary.com/dgvvsw6fs/image/upload/c_crop,ar_3:4/v1777442353/Gemini_Generated_Image_5gotmh5gotmh5got_ecscec.png' },
  { id:'oud-6',        brand:'HERA Árabe',          name:'Oud Rose',           price:'$1,320 MXN', precio:1320, badge:'',            cat:'arabes',    gen:'unisex',   fam:'oriental',  marca:'hera-arabe',       nuevo:false, tipo:'perfumes', nivel:'green',  vols:[{ml:30,precio:1320},{ml:50,precio:1890}],                                         img:'https://res.cloudinary.com/dgvvsw6fs/image/upload/c_crop,ar_3:4/v1777442351/Gemini_Generated_Image_a0rouca0rouca0ro_x9fg45.png' },
  { id:'sauvage-7',    brand:'Dior',                name:'Sauvage EDP',        price:'$2,450 MXN', precio:2450, badge:'Más vendido',  cat:'diseñador', gen:'masculino', fam:'fresco',    marca:'dior',             nuevo:false, tipo:'perfumes', nivel:'red',    vols:[{ml:60,precio:1850},{ml:100,precio:2450},{ml:200,precio:3100}],                   img:'https://res.cloudinary.com/dgvvsw6fs/image/upload/c_crop,ar_3:4/v1777440281/WhatsApp_Image_2026-04-28_at_10.27.03_PM_1_m37zng.jpg' },
  { id:'blanche-8',    brand:'Byredo',              name:'Blanche EDP',        price:'$2,100 MXN', precio:2100, badge:'',            cat:'nicho',     gen:'femenino',  fam:'floral',    marca:'byredo',           nuevo:false, tipo:'perfumes', nivel:'red',    vols:[{ml:50,precio:2100},{ml:100,precio:3400}],                                        img:'https://res.cloudinary.com/dgvvsw6fs/image/upload/c_crop,ar_3:4/v1777443101/Gemini_Generated_Image_mk173dmk173dmk17_ae1r3t.png' },
  { id:'lune-9',       brand:'HERA Árabe',          name:"Lune d'Orient",      price:'$1,580 MXN', precio:1580, badge:'',            cat:'arabes',    gen:'unisex',   fam:'oriental',  marca:'hera-arabe',       nuevo:false, tipo:'perfumes', nivel:'green',  vols:[{ml:30,precio:1580},{ml:50,precio:2200}],                                         img:'https://res.cloudinary.com/dgvvsw6fs/image/upload/c_crop,ar_3:4/v1777444881/Gemini_Generated_Image_sb0tsssb0tsssb0t_qathlh.png' },
  { id:'rose-10',      brand:'HERA Árabe',          name:'Rose Majlis',        price:'$1,290 MXN', precio:1290, badge:'Nuevo',        cat:'arabes',    gen:'femenino',  fam:'floral',    marca:'hera-arabe',       nuevo:true,  tipo:'perfumes', nivel:'green',  vols:[{ml:30,precio:1290},{ml:50,precio:1820}],                                         img:'https://res.cloudinary.com/dgvvsw6fs/image/upload/c_crop,ar_3:4/v1777445147/Gemini_Generated_Image_bhdh9lbhdh9lbhdh_azmv4z.png' },
  { id:'velvet-11',    brand:'HERA Exclusivo',      name:'Velvet Oud',         price:'$1,680 MXN', precio:1680, badge:'',            cat:'nicho',     gen:'unisex',   fam:'oriental',  marca:'hera-exclusivo',   nuevo:false, tipo:'perfumes', nivel:'yellow', vols:[{ml:50,precio:1680},{ml:100,precio:2590}],                                        img:'https://res.cloudinary.com/dgvvsw6fs/image/upload/c_crop,ar_3:4/v1777445560/Gemini_Generated_Image_y6d7cpy6d7cpy6d7_bfydmt.png' },
  { id:'set-1',        brand:'HERA Exclusivo',      name:'Gift Set Signature', price:'$2,200 MXN', precio:2200, badge:'Nuevo',        cat:'sets',      gen:'unisex',   fam:'floral',    marca:'hera-exclusivo',   nuevo:true,  tipo:'perfumes', nivel:'red',    vols:[{ml:100,precio:2200}],                                                            img:'https://res.cloudinary.com/dgvvsw6fs/image/upload/c_crop,ar_3:4/v1777445562/Gemini_Generated_Image_yfapc6yfapc6yfap_bw4xzg.png' },
  { id:'amber-12',     img:'https://res.cloudinary.com/dgvvsw6fs/image/upload/c_crop,ar_3:4/v1777448266/Gemini_Generated_Image_4taelp4taelp4tae_cgrsmb.png',     brand:'Jenny Rivera',        name:'Amber Eterno EDP',   price:'$1,050 MXN', precio:1050, badge:'',            cat:'diseñador', gen:'femenino',  fam:'oriental',  marca:'jenny-rivera',     nuevo:false, tipo:'perfumes', nivel:'green',  vols:[{ml:50,precio:1050},{ml:100,precio:1680}] },
  { id:'silver-13',    img:'https://res.cloudinary.com/dgvvsw6fs/image/upload/c_crop,ar_3:4/v1777448453/Gemini_Generated_Image_m0e355m0e355m0e3_hjfob5.png',    brand:'HERA Exclusivo',      name:'Silver Iris EDP',    price:'$1,750 MXN', precio:1750, badge:'',            cat:'nicho',     gen:'unisex',   fam:'floral',    marca:'hera-exclusivo',   nuevo:false, tipo:'perfumes', nivel:'red',    vols:[{ml:50,precio:1750},{ml:100,precio:2690}] },
  { id:'bm-1',         img:'https://res.cloudinary.com/dgvvsw6fs/image/upload/c_crop,ar_3:4/v1777448774/ChatGPT_Image_29_abr_2026_01_45_51_a.m._ajroup.png',         brand:"Victoria's Secret",  name:'Bombshell BM',       price:'$520 MXN',   precio:520,  badge:'Nuevo',        cat:'body-mist', gen:'femenino',  fam:'floral',    marca:'victorias-secret', nuevo:true,  tipo:'perfumes', nivel:'green',  vols:[{ml:250,precio:520}] },
  { id:'bm-2',         img:'https://res.cloudinary.com/dgvvsw6fs/image/upload/c_crop,ar_3:4/v1777448919/2ae6bd09-1f03-446d-b141-dfda6d1d50dd.4c651ebe9a57553a40b3bafaf6dbb5c7_dq7bk0.jpg',         brand:'Bath & Body Works',  name:'Japanese Cherry BM', price:'$480 MXN',   precio:480,  badge:'',            cat:'body-mist', gen:'femenino',  fam:'floral',    marca:'bbw',              nuevo:false, tipo:'perfumes', nivel:'green',  vols:[{ml:236,precio:480}] },
  { id:'anillo-1',     img:'https://res.cloudinary.com/dgvvsw6fs/image/upload/c_crop,ar_3:4/v1777449035/photo-1600015091485-e8343c72d42d_d1csiy.avif',     brand:'HERA Joyería',       name:'Anillo Solitario',   price:'$1,290 MXN', precio:1290, badge:'Nuevo',        cat:'anillos',   gen:'femenino',  fam:'',          marca:'hera-joyeria',     nuevo:true,  tipo:'joyeria',  nivel:'yellow', vols:[{ml:'5',precio:1290},{ml:'6',precio:1290},{ml:'7',precio:1290},{ml:'8',precio:1290},{ml:'9',precio:1350}], volLabel:'Talla', masVariantes:true },
  { id:'aretes-1',     img:'https://res.cloudinary.com/dgvvsw6fs/image/upload/c_crop,ar_3:4/v1777449460/photo-1748679451184-97ddab571605_maujos.avif',     brand:'HERA Joyería',       name:'Aretes Perla',       price:'$680 MXN',   precio:680,  badge:'',            cat:'aretes',    gen:'femenino',  fam:'',          marca:'hera-joyeria',     nuevo:false, tipo:'joyeria',  nivel:'yellow', vols:[{ml:'Plata .925',precio:680},{ml:'Oro 14k',precio:980}], volLabel:'Material', masVariantes:false },
  { id:'collar-1',     img:'https://res.cloudinary.com/dgvvsw6fs/image/upload/c_crop,ar_3:4/v1777449161/photo-1623321673989-830eff0fd59f_tbh1ru.avif',     brand:'HERA Joyería',       name:'Collar Dorado',      price:'$890 MXN',   precio:890,  badge:'',            cat:'collares',  gen:'unisex',   fam:'',          marca:'hera-joyeria',     nuevo:false, tipo:'joyeria',  nivel:'yellow', vols:[{ml:'40 cm',precio:890},{ml:'45 cm',precio:890},{ml:'50 cm',precio:920}], volLabel:'Largo', masVariantes:false },
  { id:'brazalete-1',  img:'https://res.cloudinary.com/dgvvsw6fs/image/upload/c_crop,ar_3:4/v1777449374/photo-1774294546043-df9ecc9bd70e_y196w8.avif',  brand:'HERA Joyería',       name:'Brazalete Minimal',  price:'$750 MXN',   precio:750,  badge:'Nuevo',        cat:'brazaletes',gen:'unisex',   fam:'',          marca:'hera-joyeria',     nuevo:true,  tipo:'joyeria',  nivel:'red',    vols:[{ml:'Plata .925',precio:750},{ml:'Oro 18k',precio:1200}], volLabel:'Material', masVariantes:false },
];
 
/* ══════════════════════════════════════
  ARRANQUE — DOMContentLoaded
══════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', async function() {
  loadAnnounceBar();
  await loadNavbar();
  loadFooter();
  await loadCartDrawer();
  initFavDrawer();
 
  // Lógica exclusiva de esta página
  _initScrollReveal();
  _initUrlParams();
  _updateSidebarForTab(activeCategoryTab);
  _applyFilters();
  _initCategoryTabs();
  _initSidebarBindings();
  _initFilterDrawer();
  _initSortSelect();
  _initLoadMore();
  _initEmptyStateClear();
  _initSortMobileBtn();
});
 
/* ══════════════════════════════════════
  SCROLL REVEAL — IntersectionObserver
══════════════════════════════════════ */
 
/**
 * Observa todos los elementos .reveal y alterna .visible
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
  ESTADO DE FILTROS
══════════════════════════════════════ */
let activeFilters     = { cat:[], gen:[], fam:[], marca:[], precioMin:0, precioMax:99999 };
let currentSort       = 'relevancia';
let visibleCount      = 12;
const INCREMENT       = 6;
let filteredCache     = CATALOG.slice();
let activeCategoryTab = 'perfumes';
 
/* Referencias DOM del grid */
const grid        = document.getElementById('product-grid');
const emptyState  = document.getElementById('catalog-empty');
const countEl     = document.getElementById('catalog-count');
const loadMoreBtn = document.getElementById('loadMoreBtn');
 
/* ══════════════════════════════════════
  URL PARAMS: ?tab=perfumes|joyeria  /  ?cat=diseñador
  Lee parámetros al cargar y configura tab + filtro
══════════════════════════════════════ */
 
/**
 * Lee ?tab y ?cat de la URL y configura el estado inicial.
 * @returns {void}
 */
function _initUrlParams() {
  const params   = new URLSearchParams(window.location.search);
  const tabParam = params.get('tab');
  const catParam = params.get('cat');
  const joyCats  = ['anillos', 'aretes', 'collares', 'brazaletes'];
  let targetTab  = 'perfumes';
 
  if (tabParam === 'joyeria') {
    targetTab = 'joyeria';
  } else if (catParam) {
    const c = decodeURIComponent(catParam).toLowerCase();
    if (joyCats.indexOf(c) !== -1) targetTab = 'joyeria';
  }
 
  activeCategoryTab = targetTab;
  document.querySelectorAll('.catalog-tab-btn').forEach(function(b) {
    b.classList.toggle('active', b.dataset.tab === targetTab);
  });
 
  const emEl = document.getElementById('catalog-title-em');
  const preEl = document.getElementById('catalog-title-pre');
  if (emEl) emEl.textContent = targetTab === 'joyeria' ? 'joyería.' : 'perfumes.';
  if (preEl) preEl.textContent = targetTab === 'joyeria' ? 'Nuestra' : 'Nuestros';
 
  if (catParam) {
    const clean = decodeURIComponent(catParam).toLowerCase();
    if (!activeFilters.cat.includes(clean)) activeFilters.cat.push(clean);
  }
}
 
/* ══════════════════════════════════════
  CATEGORY TABS + SIDEBAR DINÁMICO
══════════════════════════════════════ */
 
/**
 * Muestra/oculta secciones del sidebar según el tab activo.
 * @param {string} tab - 'perfumes' | 'joyeria'
 * @returns {void}
 */
function _updateSidebarForTab(tab) {
  document.querySelectorAll('.catalog-sidebar .filter-section[data-tabs]').forEach(function(el) {
    const tabs = el.dataset.tabs.split(' ');
    el.style.display = tabs.indexOf(tab) !== -1 ? '' : 'none';
  });
}
 
/**
 * Cambia el tab activo: actualiza estado, sidebar, título y resetea filtros.
 * @param {string} tab - 'perfumes' | 'joyeria'
 * @param {HTMLElement|null} btn - Botón tab clickeado
 * @returns {void}
 */
function _setTab(tab, btn) {
  activeCategoryTab = tab;
  document.querySelectorAll('.catalog-tab-btn').forEach(function(b) { b.classList.remove('active'); });
  if (btn) btn.classList.add('active');
  const emEl = document.getElementById('catalog-title-em');
  const preEl = document.getElementById('catalog-title-pre');
  if (emEl) emEl.textContent = tab === 'joyeria' ? 'joyería.' : 'perfumes.';
  if (preEl) preEl.textContent = tab === 'joyeria' ? 'Nuestra' : 'Nuestros';
  visibleCount = 12;
  _updateSidebarForTab(tab);
  _clearAllFilters();
}
 
/**
 * Enlaza los botones de categoría tab.
 * @returns {void}
 */
function _initCategoryTabs() {
  document.querySelectorAll('.catalog-tab-btn').forEach(function(btn) {
    btn.addEventListener('click', function() { _setTab(btn.dataset.tab, btn); });
  });
}
 
/* ══════════════════════════════════════
  RENDER DE GRID
══════════════════════════════════════ */
 
/**
 * Construye la tarjeta DOM de un producto.
 * @param {Object} p - Objeto de producto del CATALOG
 * @returns {HTMLElement} div.ed-item con toda la lógica enlazada
 */
function _buildCard(p) {
  const favorites = getFavorites();
  const isFav     = favorites.some(function(f) { return f.id === p.id; });
  const vols      = p.vols || [];
  const volLabel  = p.volLabel || 'Presentación';
  const MAX_SHOW  = 3;
  const showVols  = vols.slice(0, MAX_SHOW);
  const extraCount = vols.length > MAX_SHOW ? vols.length - MAX_SHOW : 0;
 
  // Badge
  let badgeHTML = '';
  if (p.badge) {
    const badgeMod = (p.badge === '-20%' || p.badge === 'Ed. limitada') ? 'ed-item-badge--dark' : 'ed-item-badge--red';
    badgeHTML = '<span class="ed-item-badge ' + badgeMod + '">' + p.badge + '</span>';
  }
 
  // Botones de volumen
  let volsHTML = showVols.map(function(v, i) {
    const displayLabel = (p.tipo === 'perfumes' && /^\d+$/.test(String(v.ml))) ? v.ml + ' ml' : v.ml;
    return '<button class="ed-vol-btn' + (i === 0 ? ' sel' : '') + '" data-precio="' + v.precio + '" data-ml="' + v.ml + '">' + displayLabel + '</button>';
  }).join('');
 
  if (extraCount > 0) {
    volsHTML += '<a href="producto.html?id=' + p.id + '" class="ed-vol-more">+' + extraCount + ' más</a>';
  }
 
  const volSection = vols.length > 0
    ? '<div class="ed-vol-label">' + volLabel + '</div><div class="ed-vols">' + volsHTML + '</div>'
    : '';
 
  const precioInicial  = vols.length > 0 ? '$' + vols[0].precio.toLocaleString('es-MX') + ' MXN' : p.price;
  const imgLabel       = p.tipo === 'joyeria' ? 'Imagen de la pieza' : 'Imagen del perfume';
  const nivelLabels    = { green:'En existencia', yellow:'Disponibilidad limitada', red:'Pieza exclusiva' };
  const nNivel         = p.nivel || 'green';
 
  const html =
    '<div class="ed-item" data-id="' + p.id + '">' +
      '<div class="ed-item-header">' +
        badgeHTML +
        '<button class="fav-btn' + (isFav ? ' active' : '') + '"' +
          ' data-product-id="' + p.id + '"' +
          ' data-brand="' + p.brand + '"' +
          ' data-name="' + p.name + '"' +
          ' data-price="' + p.price + '"' +
          ' data-nivel="' + (p.nivel || 'green') + '"' +
          ' data-vol-label="' + (p.volLabel || 'Presentación') + '"' +
          ' data-tipo="' + (p.tipo || 'perfumes') + '"' +
          ' data-cat="' + (p.cat || '') + '"' +
          ' data-gen="' + (p.gen || '') + '"' +
          ' aria-label="Añadir a favoritos">' +
          '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>' +
        '</button>' +
      '</div>' +
      '<div class="ed-img-zone">' +
        (p.img
          ? '<img class="ed-img" src="' + p.img + '" alt="' + p.name + '" loading="lazy">'
          : '<div class="ed-img-placeholder">' +
              '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>' +
              '<span>' + imgLabel + '</span>' +
            '</div>'
        ) +
        '<div class="ed-cart-overlay">' +
          '<button class="ed-cart-btn">Agregar al carrito</button>' +
        '</div>' +
      '</div>' +
      '<div class="ed-brand">' + p.brand + '</div>' +
      '<div class="ed-name">'  + p.name  + '</div>' +
      volSection +
      '<div class="ed-footer">' +
        '<div class="ed-price">' + precioInicial + '</div>' +
        '<a href="producto.html?id=' + p.id + '" class="ed-cta">Ver producto <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg></a>' +
      '</div>' +
      '<div class="ed-nivel ' + nNivel + '"><span class="ed-nivel-dot"></span>' + nivelLabels[nNivel] + '</div>' +
    '</div>';
 
  const wrapper = document.createElement('div');
  wrapper.innerHTML = html;
  const card = wrapper.firstChild;
 
  // Selector de volumen — actualiza precio al seleccionar
  card.querySelectorAll('.ed-vol-btn').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      card.querySelectorAll('.ed-vol-btn').forEach(function(b) { b.classList.remove('sel'); });
      btn.classList.add('sel');
      card.querySelector('.ed-price').textContent = '$' + parseInt(btn.dataset.precio).toLocaleString('es-MX') + ' MXN';
    });
  });
 
  // Links: evitar propagación
  const ctaLink = card.querySelector('.ed-cta');
  if (ctaLink) ctaLink.addEventListener('click', function(e) { e.stopPropagation(); });
  const volMoreLink = card.querySelector('.ed-vol-more');
  if (volMoreLink) volMoreLink.addEventListener('click', function(e) { e.stopPropagation(); });
 
  // Botón favorito — delega al sistema de fav-drawer.js a través del evento nativo
  const favBtn = card.querySelector('.fav-btn');
  favBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    // fav-drawer.js ya escucha estos botones tras initFavDrawer();
    // aquí solo forzamos el re-render del grid para reflejar el cambio
    // (el toggle real lo hace el listener registrado en initFavDrawer)
    setTimeout(function() { _renderGrid(); }, 50);
  });
 
  // Botón agregar al carrito
  const cartBtnCard = card.querySelector('.ed-cart-btn');
  cartBtnCard.addEventListener('click', function(e) {
    e.stopPropagation();
    const selVol = card.querySelector('.ed-vol-btn.sel');
    const precio = selVol ? parseInt(selVol.dataset.precio) : p.precio;
    const ml     = selVol ? selVol.dataset.ml : '';
    const vol    = ml ? (p.tipo === 'perfumes' && /^\d+$/.test(String(ml)) ? ml + ' ml' : String(ml)) : '';
    addItemToCart(
      p.id + (ml ? '-' + ml : ''),
      p.brand,
      p.name,
      '$' + precio.toLocaleString('es-MX') + ' MXN',
      vol,
      p.nivel || 'green'
    );
  });
 
  return card;
}
 
/**
 * Ordena el array filtrado según currentSort.
 * @param {Array} arr
 * @returns {Array}
 */
function _sortCatalog(arr) {
  const s = currentSort;
  if (s === 'precio-asc')  return arr.slice().sort(function(a, b) { return a.precio - b.precio; });
  if (s === 'precio-desc') return arr.slice().sort(function(a, b) { return b.precio - a.precio; });
  if (s === 'novedades')   return arr.slice().sort(function(a, b) { return (b.nuevo ? 1 : 0) - (a.nuevo ? 1 : 0); });
  if (s === 'bestsellers') return arr.slice().sort(function(a, b) { return (b.badge === 'Más vendido' ? 1 : 0) - (a.badge === 'Más vendido' ? 1 : 0); });
  return arr;
}
 
/**
 * Aplica todos los filtros activos y ordena. Llama _renderGrid.
 * @returns {void}
 */
function _applyFilters() {
  const af = activeFilters;
  filteredCache = CATALOG.filter(function(p) {
    if (activeCategoryTab !== 'todos' && p.tipo !== activeCategoryTab) return false;
    if (af.cat.length   && !af.cat.includes(p.cat))    return false;
    if (af.gen.length   && !af.gen.includes(p.gen))    return false;
    if (af.fam.length   && !af.fam.includes(p.fam))    return false;
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
 * Renderiza la porción visible del grid.
 * @returns {void}
 */
function _renderGrid() {
  grid.innerHTML = '';
  const slice = filteredCache.slice(0, visibleCount);
  if (slice.length === 0) {
    emptyState.classList.add('visible');
    loadMoreBtn.style.display = 'none';
    countEl.textContent = 'Sin resultados';
    return;
  }
  emptyState.classList.remove('visible');
  slice.forEach(function(p) { grid.appendChild(_buildCard(p)); });
  countEl.textContent = 'Mostrando ' + slice.length + ' de ' + filteredCache.length + ' producto' + (filteredCache.length !== 1 ? 's' : '');
  loadMoreBtn.style.display = filteredCache.length > visibleCount ? 'inline-block' : 'none';
}
 
/* ══════════════════════════════════════
  FILTER CHIPS (active filters display)
══════════════════════════════════════ */
const LABEL_MAP = {
  cat:   { diseñador:'Diseñador', nicho:'Nicho', arabes:'Árabes', testers:'Testers', decants:'Decants', sets:'Sets', 'body-mist':'Body Mist', anillos:'Anillos', aretes:'Aretes', collares:'Collares', brazaletes:'Brazaletes' },
  gen:   { masculino:'Masculino', femenino:'Femenino', unisex:'Unisex' },
  fam:   { floral:'Floral', oriental:'Oriental', amaderado:'Amaderado', fresco:'Fresco', gourmand:'Gourmand' },
  marca: { 'jenny-rivera':'Jenny Rivera', abercrombie:'Abercrombie', 'hera-exclusivo':'HERA Exclusivo', 'hera-arabe':'HERA Árabe', dior:'Dior', byredo:'Byredo', 'hera-joyeria':'HERA Joyería' },
};
 
/**
 * Renderiza chips de filtros activos en desktop y en la mobile bar.
 * @returns {void}
 */
function _renderActiveChips() {
  const chipsRow    = document.getElementById('active-chips-row');
  const mobileChips = document.getElementById('mobile-active-chips');
  const chips = [];
 
  ['cat', 'gen', 'fam', 'marca'].forEach(function(group) {
    activeFilters[group].forEach(function(val) {
      const label = (LABEL_MAP[group] && LABEL_MAP[group][val]) ? LABEL_MAP[group][val] : val;
      chips.push({ group, val, label });
    });
  });
 
  if (activeFilters.precioMin > 0 || activeFilters.precioMax < 99999) {
    const pMin   = activeFilters.precioMin  > 0     ? '$' + activeFilters.precioMin  : '';
    const pMax   = activeFilters.precioMax  < 99999 ? '$' + activeFilters.precioMax  : '';
    const pLabel = (pMin && pMax) ? pMin + '–' + pMax : (pMin ? 'desde ' + pMin : 'hasta ' + pMax);
    chips.push({ group:'precio', val:'precio', label:pLabel });
  }
 
  // Desktop chips
  chipsRow.innerHTML = '';
  if (chips.length > 0) {
    chips.forEach(function(c) {
      const btn = document.createElement('button');
      btn.className = 'active-chip';
      btn.innerHTML = c.label + ' <span class="chip-x">×</span>';
      btn.addEventListener('click', function() { _removeFilter(c.group, c.val); });
      chipsRow.appendChild(btn);
    });
    const clearBtn = document.createElement('button');
    clearBtn.className   = 'chips-clear-all';
    clearBtn.textContent = 'Limpiar todo';
    clearBtn.addEventListener('click', _clearAllFilters);
    chipsRow.appendChild(clearBtn);
  }
 
  // Mobile bar chips (máx 3)
  mobileChips.innerHTML = '';
  chips.slice(0, 3).forEach(function(c) {
    const btn = document.createElement('button');
    btn.className = 'filter-mobile-chip';
    btn.innerHTML = c.label + ' <span>×</span>';
    btn.addEventListener('click', function() { _removeFilter(c.group, c.val); });
    mobileChips.appendChild(btn);
  });
}
 
/**
 * Elimina un filtro individual y re-aplica.
 * @param {string} group
 * @param {string} val
 * @returns {void}
 */
function _removeFilter(group, val) {
  if (group === 'precio') {
    activeFilters.precioMin = 0;
    activeFilters.precioMax = 99999;
    const pMinEl  = document.getElementById('f-precio-min');
    const pMaxEl  = document.getElementById('f-precio-max');
    const dmMinEl = document.getElementById('dm-precio-min');
    const dmMaxEl = document.getElementById('dm-precio-max');
    if (pMinEl)  pMinEl.value  = '';
    if (pMaxEl)  pMaxEl.value  = '';
    if (dmMinEl) dmMinEl.value = '';
    if (dmMaxEl) dmMaxEl.value = '';
  } else {
    activeFilters[group] = activeFilters[group].filter(function(v) { return v !== val; });
  }
  visibleCount = 12;
  _applyFilters();
}
 
/**
 * Limpia todos los filtros activos y resetea el sort.
 * @returns {void}
 */
function _clearAllFilters() {
  activeFilters = { cat:[], gen:[], fam:[], marca:[], precioMin:0, precioMax:99999 };
  document.querySelectorAll('[data-group]').forEach(function(cb) { cb.checked = false; });
  document.querySelectorAll('.price-input').forEach(function(i) { i.value = ''; });
  visibleCount = 12;
  currentSort  = 'relevancia';
  const sortEl = document.getElementById('sort-select');
  if (sortEl) sortEl.value = 'relevancia';
  _applyFilters();
}
 
/**
 * Sincroniza el estado checked de todos los checkboxes con activeFilters.
 * @returns {void}
 */
function _syncCheckboxes() {
  ['cat', 'gen', 'fam', 'marca'].forEach(function(group) {
    document.querySelectorAll('[data-group="' + group + '"]').forEach(function(cb) {
      cb.checked = activeFilters[group].includes(cb.value);
    });
  });
}
 
/**
 * Actualiza el badge numérico del botón de filtros mobile.
 * @returns {void}
 */
function _updateFilterBadge() {
  let count = activeFilters.cat.length + activeFilters.gen.length + activeFilters.fam.length + activeFilters.marca.length;
  if (activeFilters.precioMin > 0 || activeFilters.precioMax < 99999) count++;
  const badge = document.getElementById('filter-badge');
  if (badge) {
    badge.textContent  = count;
    badge.style.display = count > 0 ? 'inline-flex' : 'none';
  }
}
 
/* ══════════════════════════════════════
  SIDEBAR BINDINGS (desktop)
══════════════════════════════════════ */
 
/**
 * Enlaza los checkboxes del sidebar y los inputs de precio.
 * @returns {void}
 */
function _initSidebarBindings() {
  document.querySelectorAll('.catalog-sidebar [data-group]').forEach(function(cb) {
    cb.addEventListener('change', function() {
      const g = cb.dataset.group;
      const v = cb.value;
      if (cb.checked) {
        if (!activeFilters[g].includes(v)) activeFilters[g].push(v);
      } else {
        activeFilters[g] = activeFilters[g].filter(function(x) { return x !== v; });
      }
      visibleCount = 12;
      _applyFilters();
    });
  });
 
  const fPrecioMin  = document.getElementById('f-precio-min');
  const fPrecioMax  = document.getElementById('f-precio-max');
  const dmPrecioMin = document.getElementById('dm-precio-min');
  const dmPrecioMax = document.getElementById('dm-precio-max');
 
  if (fPrecioMin) fPrecioMin.addEventListener('change', function() {
    activeFilters.precioMin = parseInt(this.value) || 0;
    if (dmPrecioMin) dmPrecioMin.value = this.value;
    visibleCount = 12; _applyFilters();
  });
  if (fPrecioMax) fPrecioMax.addEventListener('change', function() {
    activeFilters.precioMax = parseInt(this.value) || 99999;
    if (dmPrecioMax) dmPrecioMax.value = this.value;
    visibleCount = 12; _applyFilters();
  });
 
  const sidebarClearAll = document.getElementById('sidebarClearAll');
  if (sidebarClearAll) sidebarClearAll.addEventListener('click', _clearAllFilters);
}
 
/* ══════════════════════════════════════
  FILTER DRAWER (mobile)
══════════════════════════════════════ */
 
/**
 * Inicializa el drawer de filtros mobile: apertura, cierre, aplicar y reset.
 * @returns {void}
 */
function _initFilterDrawer() {
  const filterDrawerOverlay = document.getElementById('filterDrawerOverlay');
  const filterDrawer        = document.getElementById('filterDrawer');
  const filterOpenBtn       = document.getElementById('filterOpenBtn');
  const filterDrawerClose   = document.getElementById('filterDrawerClose');
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
 
  if (filterOpenBtn)       filterOpenBtn.addEventListener('click', openFilterDrawer);
  if (filterDrawerClose)   filterDrawerClose.addEventListener('click', closeFilterDrawer);
  if (filterDrawerOverlay) filterDrawerOverlay.addEventListener('click', closeFilterDrawer);
 
  // Cerrar con Escape también cierra el filter drawer
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeFilterDrawer();
  });
 
  // Copiar estado actual de filtros al drawer antes de abrirlo
  function copyFiltersToDrawer() {
    document.querySelectorAll('.filter-drawer [data-group]').forEach(function(cb) {
      cb.checked = (activeFilters[cb.dataset.group] || []).includes(cb.value);
    });
    if (dmPrecioMin) dmPrecioMin.value = activeFilters.precioMin > 0     ? activeFilters.precioMin : '';
    if (dmPrecioMax) dmPrecioMax.value = activeFilters.precioMax < 99999 ? activeFilters.precioMax : '';
  }
  if (filterOpenBtn) filterOpenBtn.addEventListener('click', copyFiltersToDrawer);
 
  // Aplicar filtros del drawer
  const filterDrawerApply = document.getElementById('filterDrawerApply');
  if (filterDrawerApply) filterDrawerApply.addEventListener('click', function() {
    ['cat', 'gen', 'fam'].forEach(function(group) {
      activeFilters[group] = [];
      document.querySelectorAll('.filter-drawer [data-group="' + group + '"]').forEach(function(cb) {
        if (cb.checked) activeFilters[group].push(cb.value);
      });
    });
    activeFilters.precioMin = parseInt(dmPrecioMin ? dmPrecioMin.value : 0) || 0;
    activeFilters.precioMax = parseInt(dmPrecioMax ? dmPrecioMax.value : 0) || 99999;
    visibleCount = 12;
    _applyFilters();
    closeFilterDrawer();
  });
 
  // Reset desde el drawer
  const filterDrawerReset = document.getElementById('filterDrawerReset');
  if (filterDrawerReset) filterDrawerReset.addEventListener('click', function() {
    document.querySelectorAll('.filter-drawer [data-group]').forEach(function(cb) { cb.checked = false; });
    if (dmPrecioMin) dmPrecioMin.value = '';
    if (dmPrecioMax) dmPrecioMax.value = '';
    _clearAllFilters();
    closeFilterDrawer();
  });
}
 
/* ══════════════════════════════════════
  SORT
══════════════════════════════════════ */
 
/**
 * Enlaza el select nativo de ordenación.
 * @returns {void}
 */
function _initSortSelect() {
  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) sortSelect.addEventListener('change', function() {
    currentSort = this.value;
    _applyFilters();
  });
}
 
/* ══════════════════════════════════════
  LOAD MORE
══════════════════════════════════════ */
 
/**
 * Enlaza el botón "Cargar más".
 * @returns {void}
 */
function _initLoadMore() {
  if (loadMoreBtn) loadMoreBtn.addEventListener('click', function() {
    visibleCount += INCREMENT;
    _renderGrid();
  });
}
 
/* ══════════════════════════════════════
  EMPTY STATE — limpiar filtros
══════════════════════════════════════ */
 
/**
 * Enlaza el botón del empty state.
 * @returns {void}
 */
function _initEmptyStateClear() {
  const emptyStateClearBtn = document.getElementById('emptyStateClearBtn');
  if (emptyStateClearBtn) emptyStateClearBtn.addEventListener('click', _clearAllFilters);
}
 
/* ══════════════════════════════════════
  SORT MÓVIL — delega al select nativo
══════════════════════════════════════ */
 
/**
 * Hace que el botón "Ordenar" de la mobile bar abra el select nativo.
 * @returns {void}
 */
function _initSortMobileBtn() {
  const sortMobileBtn = document.getElementById('sortMobileBtn');
  const sortSelect    = document.getElementById('sort-select');
  if (sortMobileBtn && sortSelect) {
    sortMobileBtn.addEventListener('click', function() { sortSelect.focus(); });
  }
}
 