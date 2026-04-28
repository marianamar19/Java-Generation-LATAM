/**
 * favoritos.js — HERA
 *
 * Descripción: Lógica exclusiva de la página Mis Favoritos.
 *              Maneja el catálogo temporal, el sistema de tabs
 *              Perfumes/Joyería, los filtros de sidebar y drawer
 *              móvil (disponibilidad, género, categoría, marca),
 *              el grid de fav-cards, los chips de filtros activos
 *              y la extensión de renderFavList para mantener
 *              el grid sincronizado con el dropdown del navbar.
 *
 * Exporta:     (módulo de página, no exporta funciones públicas)
 * Importado por: pages/favoritos.html (type="module")
 */

import { loadNavbar } from '../components/navbar.js';
import { loadFooter }             from '../components/footer.js';
import { loadCartDrawer, addItemToCart } from '../components/cart-drawer.js';
import { initFavDrawer, getFavorites, setFavorites, registerOnRender } from '../components/fav-drawer.js';
import { loadNewsletter }                from '../components/newsletter.js';


/* ══════════════════════════════════════
  ESTADO: tabs y filtros activos
══════════════════════════════════════ */

/** Tab activo: 'perfumes' | 'joyeria' */
let activeTab = 'perfumes';

/** Filtros seleccionados por el usuario */
let activeFilters = { nivel:[], gen:[], cat:[], marca:[] };

/**
 * Mapa de etiquetas legibles para valores de filtro.
 * Evita repetir strings hardcodeados en cada render.
 */
const LABEL_MAP = {
  nivel: { green:'En existencia', yellow:'Disp. limitada', red:'Pieza exclusiva' },
  gen:   { masculino:'Masculino', femenino:'Femenino', unisex:'Unisex' },
  cat: {
    diseñador:'Diseñador', nicho:'Nicho', arabes:'Árabes', testers:'Testers',
    decants:'Decants', sets:'Sets', 'body-mist':'Body Mist',
    anillos:'Anillos', aretes:'Aretes', collares:'Collares', brazaletes:'Brazaletes'
  }
};

/* ══════════════════════════════════════
  FILTROS
══════════════════════════════════════ */

/**
 * Devuelve los favoritos del tab activo que pasan todos los filtros seleccionados.
 * @returns {Array} Array de objetos favorito filtrados
 */
function getFilteredFavs() {
  return getFavorites().filter(function(f){
    if ((f.tipo||'perfumes') !== activeTab) return false;
    if (activeFilters.nivel.length  && !activeFilters.nivel.includes(f.nivel||'green')) return false;
    if (activeFilters.gen.length    && !activeFilters.gen.includes(f.gen||''))   return false;
    if (activeFilters.cat.length    && !activeFilters.cat.includes(f.cat||''))   return false;
    if (activeFilters.marca.length  && !activeFilters.marca.includes(f.brand||'')) return false;
    return true;
  });
}

/**
 * Activa o desactiva un valor de filtro y re-renderiza.
 * @param {string} key     - Clave del filtro: 'nivel'|'gen'|'cat'|'marca'
 * @param {string} val     - Valor del filtro
 * @param {boolean} checked - true = añadir, false = quitar
 */
function toggleFilter(key, val, checked) {
  if (checked) {
    if (!activeFilters[key].includes(val)) activeFilters[key].push(val);
  } else {
    activeFilters[key] = activeFilters[key].filter(function(v){ return v!==val; });
  }
  renderFavsPage();
  renderActiveChips();
}

/**
 * Limpia todos los filtros activos y re-renderiza.
 * También desmarca todos los checkboxes en sidebar y drawer.
 */
function clearAllFilters() {
  activeFilters = { nivel:[], gen:[], cat:[], marca:[] };
  document.querySelectorAll('#fav-sidebar input[type="checkbox"], #filter-drawer-content input[type="checkbox"]').forEach(function(cb){ cb.checked=false; });
  renderFavsPage();
  renderActiveChips();
}

/* ══════════════════════════════════════
  SIDEBAR DE FILTROS — render dinámico
══════════════════════════════════════ */

/**
 * Reconstruye los filtros dinámicos del sidebar (categorías y marcas)
 * según los favoritos del tab activo. Actualiza también los contadores
 * de los filtros estáticos (nivel y gen). Al final replica el sidebar
 * en el drawer móvil para mantener ambos sincronizados.
 */
function renderSidebarFilters() {
  const tabFavs = getFavorites().filter(function(f){ return (f.tipo||'perfumes')===activeTab; });

  /* Título de categoría según tab activo */
  const catTitle = document.getElementById('filter-cat-title');
  if (catTitle) catTitle.textContent = activeTab==='perfumes' ? 'Categoría' : 'Tipo de joya';

  /* Categorías dinámicas — se generan desde los datos reales de favoritos */
  const cats = {};
  tabFavs.forEach(function(f){ if(f.cat) cats[f.cat]=(cats[f.cat]||0)+1; });
  const catOpts = document.getElementById('filter-cat-options');
  if (catOpts) {
    catOpts.innerHTML = '';
    Object.keys(cats).forEach(function(c){
      const lbl     = LABEL_MAP.cat[c] || c;
      const checked = activeFilters.cat.includes(c) ? ' checked' : '';
      const label   = document.createElement('label');
      label.className = 'filter-option';
      label.innerHTML = '<input type="checkbox"'+checked+' data-filter="cat" value="'+c+'"><span>'+lbl+'</span><span class="filter-count">'+cats[c]+'</span>';
      catOpts.appendChild(label);
    });
    const catSec = document.getElementById('filter-cat-section');
    if (catSec) catSec.style.display = Object.keys(cats).length > 0 ? 'block' : 'none';
  }

  /* Marcas dinámicas — se generan desde los datos reales de favoritos */
  const marcas = {};
  tabFavs.forEach(function(f){ if(f.brand) marcas[f.brand]=(marcas[f.brand]||0)+1; });
  const marcaOpts = document.getElementById('filter-marca-options');
  if (marcaOpts) {
    marcaOpts.innerHTML = '';
    Object.keys(marcas).forEach(function(m){
      const checked = activeFilters.marca.includes(m) ? ' checked' : '';
      const label   = document.createElement('label');
      label.className = 'filter-option';
      label.innerHTML = '<input type="checkbox"'+checked+' data-filter="marca" value="'+m+'"><span>'+m+'</span><span class="filter-count">'+marcas[m]+'</span>';
      marcaOpts.appendChild(label);
    });
    const marcaSec = document.getElementById('filter-marca-section');
    if (marcaSec) marcaSec.style.display = Object.keys(marcas).length > 0 ? 'block' : 'none';
  }

  /* Contadores en filtros estáticos (nivel + gen) */
  ['green','yellow','red'].forEach(function(n){
    const el = document.getElementById('fc-nivel-'+n);
    if (el) el.textContent = tabFavs.filter(function(f){return (f.nivel||'green')===n;}).length || '';
  });
  ['masculino','femenino','unisex'].forEach(function(g){
    const el = document.getElementById('fc-gen-'+g);
    if (el) el.textContent = tabFavs.filter(function(f){return (f.gen||'')===g;}).length || '';
  });

  /* Replicar sidebar al drawer móvil para mantenerlos sincronizados */
  const drawerContent = document.getElementById('filter-drawer-content');
  if (drawerContent) drawerContent.innerHTML = document.getElementById('fav-sidebar').innerHTML;
}

/* ══════════════════════════════════════
  GRID DE FAVORITOS
══════════════════════════════════════ */

/**
 * Construye y devuelve el elemento DOM de una tarjeta de favorito.
 * @param {Object} item - Objeto favorito del array favorites
 * @returns {HTMLElement} El elemento .fav-card listo para insertar en el DOM
 */
function buildFavCard(item) {
  const card = document.createElement('div');
  card.className = 'fav-card';
  card.dataset.id = item.id;
  const n      = item.nivel || 'green';
  const nLabel = {green:'En existencia', yellow:'Disp. limitada', red:'Pieza exclusiva'}[n];
  const imgLabel = (item.tipo||'perfumes')==='joyeria' ? 'Imagen de la pieza' : 'Imagen del perfume';
  const volLine  = item.vol ? '<div class="fav-card-vol">'+item.vol+'</div>' : '';

  card.innerHTML =
    '<button class="fav-card-remove" aria-label="Quitar de favoritos"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg></button>' +
    '<div class="fav-card-img">' +
      '<div class="fav-card-placeholder">' +
        '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>' +
        '<span>'+imgLabel+'</span>' +
      '</div>' +
      '<div class="fav-card-overlay">' +
        '<button class="fav-card-cart-btn">Agregar al carrito</button>' +
      '</div>' +
    '</div>' +
    '<div class="fav-card-brand">'+item.brand+'</div>' +
    '<div class="fav-card-name">'+item.name+'</div>' +
    volLine +
    '<div class="fav-card-footer">' +
      '<div class="fav-card-price">'+item.price+'</div>' +
      '<a href="producto.html?id='+item.id+'" class="fav-card-cta">Ver producto <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg></a>' +
    '</div>' +
    '<div class="fav-card-nivel '+n+'"><span class="fav-card-nivel-dot"></span>'+nLabel+'</div>';

  card.querySelector('.fav-card-remove').addEventListener('click', function(e){
    e.stopPropagation();
    _removeFromFavs(item.id);
  });
  card.querySelector('.fav-card-cart-btn').addEventListener('click', function(e){
    e.stopPropagation();
    addItemToCart(item.id, item.brand, item.name, item.price, item.vol || '', item.nivel || 'green');
  });

  return card;
}

/**
 * Elimina un favorito del array y actualiza el dropdown/panel + grid de la página.
 * @param {string} id - ID del producto a eliminar
 */
function _removeFromFavs(id) {
  setFavorites(getFavorites().filter(function(f){ return f.id !== id; }));
  document.querySelectorAll('.fav-btn[data-product-id="'+id+'"]').forEach(function(b){ b.classList.remove('active'); });
  // renderFavsPage se llama automáticamente vía el hook registerOnRender
  // que activa fav-drawer.js después de persistir el nuevo estado
  renderFavsPage();
}

/**
 * Re-renderiza el grid completo de favoritos según el tab y filtros activos.
 * Actualiza contadores, muestra/oculta estado vacío y el botón "agregar filtrados".
 */
function renderFavsPage() {
  renderSidebarFilters();
  const filtered = getFilteredFavs();
  const grid     = document.getElementById('fav-grid');
  const emptyEl  = document.getElementById('fav-page-empty');
  const countEl  = document.getElementById('count-visible');
  const pluralEl = document.getElementById('count-plural');
  const plural2El= document.getElementById('count-plural2');
  const addFilteredBtn = document.getElementById('btn-add-filtered');
  const emptyTitle     = document.getElementById('fav-empty-title');
  const emptySub       = document.getElementById('fav-empty-sub');
  const emptyCta       = document.getElementById('fav-empty-cta');

  grid.innerHTML = '';

  if (countEl)  countEl.textContent  = filtered.length;
  if (pluralEl) pluralEl.textContent = filtered.length===1?'':'s';
  if (plural2El)plural2El.textContent= filtered.length===1?'':'s';

  const tabTotal = getFavorites().filter(function(f){ return (f.tipo||'perfumes')===activeTab; }).length;

  /* Sin favoritos en el tab activo — estado vacío primario */
  if (tabTotal === 0) {
    if (emptyEl) emptyEl.classList.add('visible');
    if (emptyTitle) emptyTitle.textContent = activeTab==='perfumes'?'Sin perfumes guardados':'Sin joyería guardada';
    if (emptySub) emptySub.textContent = 'Guarda productos con ♥ desde el catálogo';
    if (emptyCta) { emptyCta.textContent='Explorar '+(activeTab==='perfumes'?'perfumes':'joyería'); emptyCta.href='catalogo.html?tab='+activeTab; }
    if (addFilteredBtn) addFilteredBtn.style.display='none';
    return;
  }

  /* Hay favoritos pero los filtros no devuelven resultados — estado vacío secundario */
  if (filtered.length === 0) {
    if (emptyEl) emptyEl.classList.add('visible');
    if (emptyTitle) emptyTitle.textContent = 'Sin resultados';
    if (emptySub) emptySub.textContent = 'Prueba ajustando o limpiando los filtros';
    if (emptyCta) {
      emptyCta.textContent='Limpiar filtros';
      emptyCta.href='#';
      emptyCta.removeEventListener('click', emptyCta._clearHandler);
      emptyCta._clearHandler = function(e){ e.preventDefault(); clearAllFilters(); };
      emptyCta.addEventListener('click', emptyCta._clearHandler);
    }
    if (addFilteredBtn) addFilteredBtn.style.display='none';
    return;
  }

  if (emptyEl) emptyEl.classList.remove('visible');
  if (addFilteredBtn) addFilteredBtn.style.display='flex';

  filtered.forEach(function(item){ grid.appendChild(buildFavCard(item)); });
  renderActiveChips();
}

/* ══════════════════════════════════════
  CHIPS DE FILTROS ACTIVOS
══════════════════════════════════════ */

/**
 * Renderiza los chips de filtros activos en la barra superior del grid.
 * Cada chip permite eliminar ese filtro individualmente.
 */
function renderActiveChips() {
  const row = document.getElementById('active-chips-row');
  if (!row) return;
  row.innerHTML = '';
  ['nivel','gen','cat','marca'].forEach(function(key){
    activeFilters[key].forEach(function(val){
      const lbl  = (LABEL_MAP[key] && LABEL_MAP[key][val]) || val;
      const chip = document.createElement('div');
      chip.className = 'active-chip';
      chip.innerHTML = lbl + ' <span>×</span>';
      chip.addEventListener('click', function(){
        activeFilters[key] = activeFilters[key].filter(function(v){return v!==val;});
        /* Desmarcar el checkbox correspondiente en sidebar y drawer */
        const cb = document.querySelector('#fav-sidebar input[data-filter="'+key+'"][value="'+val+'"]');
        if (cb) cb.checked = false;
        renderFavsPage();
        renderActiveChips();
      });
      row.appendChild(chip);
    });
  });
}

/* ══════════════════════════════════════
  TABS
══════════════════════════════════════ */

/**
 * Cambia el tab activo, resetea filtros y re-renderiza.
 * @param {string} tab - 'perfumes' | 'joyeria'
 * @param {HTMLElement} btn - Botón tab clickeado (para marcar como active)
 */
function setFavTab(tab, btn) {
  activeTab = tab;
  document.querySelectorAll('.fav-tab-btn').forEach(function(b){ b.classList.remove('active'); });
  btn.classList.add('active');
  /* Resetear filtros al cambiar de tab para evitar estados inconsistentes */
  activeFilters = { nivel:[], gen:[], cat:[], marca:[] };
  renderSidebarFilters();
  renderFavsPage();
}

/* ══════════════════════════════════════
  AGREGAR FILTRADOS AL CARRITO
══════════════════════════════════════ */

/**
 * Agrega al carrito todos los favoritos visibles con los filtros activos.
 */
function addFilteredToCart() {
  getFilteredFavs().forEach(function(f){
    addItemToCart(f.id, f.brand, f.name, f.price, f.vol || '', f.nivel || 'green');
  });
}

/* ══════════════════════════════════════
  FILTER DRAWER MÓVIL
══════════════════════════════════════ */

/**
 * Abre el panel de filtros móvil.
 */
function openFilterDrawer() {
  document.getElementById('filterDrawer').classList.add('open');
  document.getElementById('filterOverlay').classList.add('open');
  document.body.style.overflow='hidden';
}

/**
 * Cierra el panel de filtros móvil.
 */
function closeFilterDrawer() {
  document.getElementById('filterDrawer').classList.remove('open');
  document.getElementById('filterOverlay').classList.remove('open');
  document.body.style.overflow='';
}

/* ══════════════════════════════════════
  SCROLL REVEAL
══════════════════════════════════════ */

/**
 * Inicializa el IntersectionObserver para animar elementos .reveal.
 * Replays en cada scroll pass (entrada y salida del viewport).
 */
function _initScrollReveal() {
  const obs = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if (e.isIntersecting) { e.target.classList.add('visible'); }
      else { e.target.classList.remove('visible'); }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(function(el){ obs.observe(el); });
}

/* ══════════════════════════════════════
  EXTENSIÓN DE renderFavList (del fav-drawer)
  Intercepta la función canónica para que cualquier cambio
  desde el dropdown nav o el panel móvil también actualice
  el grid exclusivo de esta página.
══════════════════════════════════════ */

/**
 * Registra renderFavsPage como hook en fav-drawer para que cada vez
 * que renderFavList() se ejecute (desde el dropdown o panel móvil)
 * el grid de esta página también se actualice automáticamente.
 */
function _extendRenderFavList() {
  registerOnRender(renderFavsPage);
}

/* ══════════════════════════════════════
  INICIALIZACIÓN PRINCIPAL
══════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', async function() {

  // 1. AWAIT obligatorio: esperar a que el navbar esté en el DOM antes de
  //    inicializar cualquier componente que referencie sus elementos
  //    (#cart-btn, #fav-toggle, #search-btn, etc.)
  await loadNavbar();

  // 2. Footer no tiene dependencias — puede cargarse sin await
  loadFooter();

 // 3. Cargar newsletter
  loadNewsletter();

  // 4. Cargar cart drawer vía fetch e inicializar
  await loadCartDrawer();
  initFavDrawer();

  // 5. Extender renderFavList para sincronizar el grid con el dropdown
  _extendRenderFavList();

  // 6. Evento Escape: cerrar buscador Y filter drawer
  document.addEventListener('keydown', function(e){
    if (e.key === 'Escape') closeFilterDrawer();
  });

  // 7. Tabs
  document.getElementById('tab-btn-perfumes').addEventListener('click', function(){
    setFavTab('perfumes', this);
  });
  document.getElementById('tab-btn-joyeria').addEventListener('click', function(){
    setFavTab('joyeria', this);
  });

  // 8. Filtros — delegación de eventos en sidebar
  document.getElementById('fav-sidebar').addEventListener('change', function(e) {
    const cb = e.target.closest('input[type="checkbox"][data-filter]');
    if (!cb) return;
    toggleFilter(cb.dataset.filter, cb.value, cb.checked);
    /* Sincronizar estado con el drawer móvil */
    const drawerCb = document.querySelector('#filter-drawer-content input[data-filter="'+cb.dataset.filter+'"][value="'+cb.value+'"]');
    if (drawerCb) drawerCb.checked = cb.checked;
  });

  // 9. Filtros — delegación de eventos en drawer móvil
  document.getElementById('filter-drawer-content').addEventListener('change', function(e) {
    const cb = e.target.closest('input[type="checkbox"][data-filter]');
    if (!cb) return;
    toggleFilter(cb.dataset.filter, cb.value, cb.checked);
    /* Sincronizar estado con el sidebar */
    const sidebarCb = document.querySelector('#fav-sidebar input[data-filter="'+cb.dataset.filter+'"][value="'+cb.value+'"]');
    if (sidebarCb) sidebarCb.checked = cb.checked;
  });

  // 10. Botón limpiar todo
  document.getElementById('clear-all-btn').addEventListener('click', clearAllFilters);

  // 11. Botón agregar filtrados al carrito
  document.getElementById('btn-add-filtered').addEventListener('click', addFilteredToCart);

  // 12. Botón filtros móvil
  document.getElementById('btn-filter-mobile').addEventListener('click', openFilterDrawer);

  // 13. Cerrar filter drawer
  document.getElementById('filterDrawerClose').addEventListener('click', closeFilterDrawer);
  document.getElementById('filterOverlay').addEventListener('click', closeFilterDrawer);

  // 14. Scroll reveal
  _initScrollReveal();

  // 15. Render inicial del grid (usa los favoritos ya cargados por initFavDrawer)
  renderFavsPage();
});
