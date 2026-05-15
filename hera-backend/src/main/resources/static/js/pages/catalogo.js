/**
 * catalogo.js — HERA
 *
 * Descripción: Script exclusivo de la página Catálogo (perfumes + joyería).
 *              Carga productos desde la API real.
 */

import { loadAnnounceBar } from '../components/announce-bar.js';
import { loadNavbar } from '../components/navbar.js';
import { loadFooter } from '../components/footer.js';
import { loadCartDrawer, addItemToCart } from '../components/cart-drawer.js';
import { initFavDrawer, getFavorites } from '../components/fav-drawer.js';
import { getProductos, getProductosByTipo, searchProductos } from '../utils/api.js';

// =====================================================
// ESTADO GLOBAL
// =====================================================
let productosGlobal = [];
let filteredCache = [];
let activeFilters = { cat: [], gen: [], fam: [], marca: [], precioMin: 0, precioMax: 99999 };
let currentSort = 'relevancia';
let visibleCount = 12;
const INCREMENT = 6;
let activeCategoryTab = 'perfumes';
let isLoading = false;

// Referencias DOM
const grid = document.getElementById('product-grid');
const emptyState = document.getElementById('catalog-empty');
const countEl = document.getElementById('catalog-count');
const loadMoreBtn = document.getElementById('loadMoreBtn');

// Mapeo de etiquetas
const LABEL_MAP = {
    cat: { 
        diseñador: 'Diseñador', nicho: 'Nicho', arabes: 'Árabes', 
        testers: 'Testers', decants: 'Decants', sets: 'Sets', 
        'body-mist': 'Body Mist', anillos: 'Anillos', aretes: 'Aretes', 
        collares: 'Collares', brazaletes: 'Brazaletes' 
    },
    gen: { masculino: 'Masculino', femenino: 'Femenino', unisex: 'Unisex' },
    fam: { floral: 'Floral', oriental: 'Oriental', amaderado: 'Amaderado', fresco: 'Fresco', gourmand: 'Gourmand' },
    marca: { 
        'jenny-rivera': 'Jenny Rivera', abercrombie: 'Abercrombie', 
        'hera-exclusivo': 'HERA Exclusivo', 'hera-arabe': 'HERA Árabe', 
        dior: 'Dior', byredo: 'Byredo', 'hera-joyeria': 'HERA Joyería' 
    }
};

// =====================================================
// CARGAR PRODUCTOS DESDE LA API
// =====================================================

/**
 * Carga productos desde el backend
 */
async function cargarProductosDesdeAPI() {
    try {
        isLoading = true;
        console.log('🔄 Cargando productos desde la API...');
        
        const productos = await getProductos();
        console.log(`✅ ${productos.length} productos cargados`);
        
        // Transformar al formato interno
        productosGlobal = productos.map(p => ({
            id: p.id,
            productId: p.productId,
            slug: p.slug,
            nombre: p.nombre,
            marca: p.marca,
            categoria: p.categoria,
            tipo: p.tipo,
            precio: p.precio,
            precioNumerico: p.precioNumerico || 0,
            badge: p.badge,
            nivel: p.nivelDisponibilidad || 'green',
            genero: p.genero,
            familia: p.familiaOlfativa,
            imagenPrincipalUrl: p.imagenPrincipalUrl,
            imagenes: p.imagenes || [],
            variantes: p.variantes || [],
            esNuevo: p.esNuevo || false,
            esBestSeller: p.esBestSeller || false,
            cat: p.categoria?.toLowerCase() || '',
            gen: p.genero || '',
            fam: p.familiaOlfativa || '',
            marcaSlug: p.marca?.toLowerCase().replace(/\s+/g, '-') || ''
        }));
        
        return productosGlobal;
    } catch (error) {
        console.error('Error cargando productos:', error);
        productosGlobal = [];
        return [];
    } finally {
        isLoading = false;
    }
}

// =====================================================
// FILTRADO Y ORDENAMIENTO
// =====================================================

/**
 * Aplica filtros y ordena los productos
 */
function aplicarFiltrosYOrdenar() {
    if (!productosGlobal.length) {
        filteredCache = [];
        renderizarGrid();
        return;
    }
    
    let productos = [...productosGlobal];
    
    // Filtrar por tipo (pestaña)
    if (activeCategoryTab !== 'todos') {
        productos = productos.filter(p => p.tipo === activeCategoryTab);
    }
    
    // Filtrar por categoría
    if (activeFilters.cat.length) {
        productos = productos.filter(p => activeFilters.cat.includes(p.cat));
    }
    
    // Filtrar por género
    if (activeFilters.gen.length) {
        productos = productos.filter(p => activeFilters.gen.includes(p.gen));
    }
    
    // Filtrar por familia olfativa
    if (activeFilters.fam.length) {
        productos = productos.filter(p => activeFilters.fam.includes(p.fam));
    }
    
    // Filtrar por marca
    if (activeFilters.marca.length) {
        productos = productos.filter(p => activeFilters.marca.includes(p.marcaSlug));
    }
    
    // Filtrar por precio
    if (activeFilters.precioMin > 0) {
        productos = productos.filter(p => p.precioNumerico >= activeFilters.precioMin);
    }
    if (activeFilters.precioMax < 99999) {
        productos = productos.filter(p => p.precioNumerico <= activeFilters.precioMax);
    }
    
    // Ordenar
    if (currentSort === 'precio-asc') {
        productos.sort((a, b) => a.precioNumerico - b.precioNumerico);
    } else if (currentSort === 'precio-desc') {
        productos.sort((a, b) => b.precioNumerico - a.precioNumerico);
    } else if (currentSort === 'novedades') {
        productos.sort((a, b) => (b.esNuevo ? 1 : 0) - (a.esNuevo ? 1 : 0));
    } else if (currentSort === 'bestsellers') {
        productos.sort((a, b) => (b.esBestSeller ? 1 : 0) - (a.esBestSeller ? 1 : 0));
    }
    // 'relevancia' mantiene el orden original de la API
    
    filteredCache = productos;
    renderizarGrid();
    renderActiveChips();
    actualizarFiltrosCheckboxes();
    actualizarBadgeFiltros();
}

// =====================================================
// RENDERIZADO DEL GRID
// =====================================================

/**
 * Construye una tarjeta de producto
 */
function construirCardProducto(p) {
    const card = document.createElement('div');
    card.className = 'ed-item';
    card.dataset.id = p.id;
    
    const firstVarianteId = p.variantes?.[0]?.id;
    const isFav = getFavorites().some(f =>
        (firstVarianteId && f.id == firstVarianteId) || f.productId === p.productId
    );
    const nivelLabels = { green: 'En existencia', yellow: 'Disponibilidad limitada', red: 'Pieza exclusiva' };
    const nivel = p.nivel || 'green';
    
    // Badge HTML
    let badgeHTML = '';
    if (p.badge) {
        const badgeMod = (p.badge === '-20%' || p.badge === 'Ed. limitada') ? 'ed-item-badge--dark' : 'ed-item-badge--red';
        badgeHTML = `<span class="ed-item-badge ${badgeMod}">${p.badge}</span>`;
    }
    
    // Imagen
    const imgHTML = p.imagenPrincipalUrl
        ? `<img class="ed-img" src="${p.imagenPrincipalUrl}" alt="${p.nombre}" loading="lazy" style="width:100%;height:100%;object-fit:contain;">`
        : `<div class="ed-img-placeholder">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
            <span>Imagen del producto</span>
        </div>`;
    
    // Variantes
    let variantesHTML = '';
    if (p.variantes && p.variantes.length) {
        variantesHTML = `
            <div class="ed-vol-label">Presentación</div>
            <div class="ed-vols">
            ${p.variantes.map((v, i) => `<button class="ed-vol-btn${i === 0 ? ' sel' : ''}" data-precio="${v.precio}" data-variante-id="${v.id}">${/^\d+$/.test(String(v.valor)) ? v.valor + ' ml' : v.valor}</button>`).join('')}
            </div>
        `;
    }
    
    card.innerHTML = `
        <div class="ed-item-header">
            ${badgeHTML}
            <button class="fav-btn${isFav ? ' active' : ''}" data-product-id="${p.productId}" data-brand="${p.marca}" data-name="${p.nombre}" data-price="${p.precio}" data-nivel="${nivel}" data-vol-label="Presentación" data-tipo="${p.tipo}"  data-img="${p.imagenPrincipalUrl || ''}" aria-label="Añadir a favoritos">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            </button>
        </div>
        <div class="ed-img-zone">
            ${imgHTML}
            <div class="ed-cart-overlay">
            <button class="ed-cart-btn" data-variante-id="${p.variantes && p.variantes[0] ? p.variantes[0].id : ''}">Agregar al carrito</button>
            </div>
        </div>
        <div class="ed-brand">${p.marca || ''}</div>
        <div class="ed-name">${p.nombre}</div>
        ${variantesHTML}
        <div class="ed-footer">
            <div class="ed-price">${p.precio || `$${p.precioNumerico?.toLocaleString('es-MX')} MXN`}</div>
            <a href="/pages/producto.html?slug=${p.slug}" class="ed-cta">Ver producto <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg></a>
        </div>
        <div class="ed-nivel ${nivel}"><span class="ed-nivel-dot"></span>${nivelLabels[nivel]}</div>
    `;
    

    
    // Evento para selector de variante
        card.querySelectorAll('.ed-vol-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                card.querySelectorAll('.ed-vol-btn').forEach(b => b.classList.remove('sel'));
                btn.classList.add('sel');
                const precio = btn.dataset.precio;
                if (precio) {
                    card.querySelector('.ed-price').textContent = `$${parseInt(precio).toLocaleString('es-MX')} MXN`;
                }
                // Actualizar varianteId en el botón del carrito según la variante seleccionada
                const cartBtn = card.querySelector('.ed-cart-btn');
                if (cartBtn) cartBtn.dataset.varianteId = btn.dataset.varianteId;
            });
        });
    
    // Evento para agregar al carrito
        const cartBtn = card.querySelector('.ed-cart-btn');
        cartBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            addItemToCart(cartBtn.dataset.varianteId);
        });
    
        const ctaBtn = card.querySelector('.ed-cta');
        if (ctaBtn) {
            ctaBtn.addEventListener('click', (e) => {
                e.preventDefault();
                sessionStorage.setItem('productoSlug', p.slug);
                window.location.href = '/pages/producto.html';
            });
        }

    return card;
}

/**
 * Renderiza el grid de productos
 */
function renderizarGrid() {
    if (!grid) return;
    
    const slice = filteredCache.slice(0, visibleCount);
    
    if (slice.length === 0) {
        if (emptyState) emptyState.classList.add('visible');
        if (loadMoreBtn) loadMoreBtn.style.display = 'none';
        if (countEl) countEl.textContent = 'Sin resultados';
        grid.innerHTML = '';
        return;
    }
    
    if (emptyState) emptyState.classList.remove('visible');
    grid.innerHTML = '';
    
    slice.forEach(producto => {
        grid.appendChild(construirCardProducto(producto));
    });
    
    if (countEl) {
        countEl.textContent = `Mostrando ${slice.length} de ${filteredCache.length} producto${filteredCache.length !== 1 ? 's' : ''}`;
    }
    if (loadMoreBtn) {
        loadMoreBtn.style.display = filteredCache.length > visibleCount ? 'inline-block' : 'none';
    }
}

// =====================================================
// FILTROS UI
// =====================================================

function renderActiveChips() {
    const chipsRow = document.getElementById('active-chips-row');
    const mobileChips = document.getElementById('mobile-active-chips');
    if (!chipsRow) return;
    
    const chips = [];
    
    ['cat', 'gen', 'fam', 'marca'].forEach(group => {
        activeFilters[group].forEach(val => {
            const label = LABEL_MAP[group]?.[val] || val;
            chips.push({ group, val, label });
        });
    });
    
    if (activeFilters.precioMin > 0 || activeFilters.precioMax < 99999) {
        const pMin = activeFilters.precioMin > 0 ? `$${activeFilters.precioMin}` : '';
        const pMax = activeFilters.precioMax < 99999 ? `$${activeFilters.precioMax}` : '';
        const pLabel = pMin && pMax ? `${pMin}–${pMax}` : (pMin || pMax);
        chips.push({ group: 'precio', val: 'precio', label: pLabel });
    }
    
    chipsRow.innerHTML = '';
    if (chips.length > 0) {
        chips.forEach(c => {
            const btn = document.createElement('button');
            btn.className = 'active-chip';
            btn.innerHTML = `${c.label} <span class="chip-x">×</span>`;
            btn.addEventListener('click', () => removerFiltro(c.group, c.val));
            chipsRow.appendChild(btn);
        });
        const clearBtn = document.createElement('button');
        clearBtn.className = 'chips-clear-all';
        clearBtn.textContent = 'Limpiar todo';
        clearBtn.addEventListener('click', limpiarTodosFiltros);
        chipsRow.appendChild(clearBtn);
    }
    
    if (mobileChips) {
        mobileChips.innerHTML = '';
        chips.slice(0, 3).forEach(c => {
            const btn = document.createElement('button');
            btn.className = 'filter-mobile-chip';
            btn.innerHTML = `${c.label} <span>×</span>`;
            btn.addEventListener('click', () => removerFiltro(c.group, c.val));
            mobileChips.appendChild(btn);
        });
    }
}

function removerFiltro(group, val) {
    if (group === 'precio') {
        activeFilters.precioMin = 0;
        activeFilters.precioMax = 99999;
        const pMinEl = document.getElementById('f-precio-min');
        const pMaxEl = document.getElementById('f-precio-max');
        if (pMinEl) pMinEl.value = '';
        if (pMaxEl) pMaxEl.value = '';
    } else {
        activeFilters[group] = activeFilters[group].filter(v => v !== val);
    }
    visibleCount = 12;
    aplicarFiltrosYOrdenar();
}

function limpiarTodosFiltros() {
    activeFilters = { cat: [], gen: [], fam: [], marca: [], precioMin: 0, precioMax: 99999 };
    document.querySelectorAll('[data-group]').forEach(cb => { cb.checked = false; });
    document.querySelectorAll('.price-input').forEach(i => { i.value = ''; });
    visibleCount = 12;
    currentSort = 'relevancia';
    const sortEl = document.getElementById('sort-select');
    if (sortEl) sortEl.value = 'relevancia';
    aplicarFiltrosYOrdenar();
}

function actualizarFiltrosCheckboxes() {
    ['cat', 'gen', 'fam', 'marca'].forEach(group => {
        document.querySelectorAll(`[data-group="${group}"]`).forEach(cb => {
            cb.checked = activeFilters[group].includes(cb.value);
        });
    });
}

function actualizarBadgeFiltros() {
    let count = activeFilters.cat.length + activeFilters.gen.length + activeFilters.fam.length + activeFilters.marca.length;
    if (activeFilters.precioMin > 0 || activeFilters.precioMax < 99999) count++;
    const badge = document.getElementById('filter-badge');
    if (badge) {
        badge.textContent = count;
        badge.style.display = count > 0 ? 'inline-flex' : 'none';
    }
}

// =====================================================
// INICIALIZACIÓN DE COMPONENTES UI
// =====================================================

function initSidebarBindings() {
    document.querySelectorAll('.catalog-sidebar [data-group]').forEach(cb => {
        cb.addEventListener('change', () => {
            const g = cb.dataset.group;
            const v = cb.value;
            if (cb.checked) {
                if (!activeFilters[g].includes(v)) activeFilters[g].push(v);
            } else {
                activeFilters[g] = activeFilters[g].filter(x => x !== v);
            }
            visibleCount = 12;
            aplicarFiltrosYOrdenar();
        });
    });
    
    const fPrecioMin = document.getElementById('f-precio-min');
    const fPrecioMax = document.getElementById('f-precio-max');
    
    if (fPrecioMin) {
        fPrecioMin.addEventListener('change', () => {
            activeFilters.precioMin = parseInt(fPrecioMin.value) || 0;
            visibleCount = 12;
            aplicarFiltrosYOrdenar();
        });
    }
    if (fPrecioMax) {
        fPrecioMax.addEventListener('change', () => {
            activeFilters.precioMax = parseInt(fPrecioMax.value) || 99999;
            visibleCount = 12;
            aplicarFiltrosYOrdenar();
        });
    }
    
    const sidebarClearAll = document.getElementById('sidebarClearAll');
    if (sidebarClearAll) sidebarClearAll.addEventListener('click', limpiarTodosFiltros);
}

function initSortSelect() {
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', () => {
            currentSort = sortSelect.value;
            aplicarFiltrosYOrdenar();
        });
    }
}

function initLoadMore() {
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
            visibleCount += INCREMENT;
            renderizarGrid();
        });
    }
}

function initEmptyStateClear() {
    const emptyStateClearBtn = document.getElementById('emptyStateClearBtn');
    if (emptyStateClearBtn) {
        emptyStateClearBtn.addEventListener('click', limpiarTodosFiltros);
    }
}

function initSortMobileBtn() {
    const sortMobileBtn = document.getElementById('sortMobileBtn');
    const sortSelect = document.getElementById('sort-select');
    if (sortMobileBtn && sortSelect) {
        sortMobileBtn.addEventListener('click', () => sortSelect.focus());
    }
}

function initFilterDrawer() {
    const overlay = document.getElementById('filterDrawerOverlay');
    const drawer = document.getElementById('filterDrawer');
    const openBtn = document.getElementById('filterOpenBtn');
    const closeBtn = document.getElementById('filterDrawerClose');
    const applyBtn = document.getElementById('filterDrawerApply');
    const resetBtn = document.getElementById('filterDrawerReset');
    
    if (!drawer) return;
    
    const open = () => {
        drawer.classList.add('open');
        if (overlay) overlay.classList.add('open');
        document.body.style.overflow = 'hidden';
        // Copiar filtros actuales al drawer
        document.querySelectorAll('.filter-drawer [data-group]').forEach(cb => {
            cb.checked = activeFilters[cb.dataset.group]?.includes(cb.value) || false;
        });
        const dmMin = document.getElementById('dm-precio-min');
        const dmMax = document.getElementById('dm-precio-max');
        if (dmMin) dmMin.value = activeFilters.precioMin > 0 ? activeFilters.precioMin : '';
        if (dmMax) dmMax.value = activeFilters.precioMax < 99999 ? activeFilters.precioMax : '';
    };
    
    const close = () => {
        drawer.classList.remove('open');
        if (overlay) overlay.classList.remove('open');
        document.body.style.overflow = '';
    };
    
    if (openBtn) openBtn.addEventListener('click', open);
    if (closeBtn) closeBtn.addEventListener('click', close);
    if (overlay) overlay.addEventListener('click', close);
    
    if (applyBtn) {
        applyBtn.addEventListener('click', () => {
            ['cat', 'gen', 'fam'].forEach(group => {
                activeFilters[group] = [];
                document.querySelectorAll(`.filter-drawer [data-group="${group}"]`).forEach(cb => {
                    if (cb.checked) activeFilters[group].push(cb.value);
                });
            });
            const dmMin = document.getElementById('dm-precio-min');
            const dmMax = document.getElementById('dm-precio-max');
            activeFilters.precioMin = parseInt(dmMin?.value) || 0;
            activeFilters.precioMax = parseInt(dmMax?.value) || 99999;
            visibleCount = 12;
            aplicarFiltrosYOrdenar();
            close();
        });
    }
    
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            document.querySelectorAll('.filter-drawer [data-group]').forEach(cb => cb.checked = false);
            const dmMin = document.getElementById('dm-precio-min');
            const dmMax = document.getElementById('dm-precio-max');
            if (dmMin) dmMin.value = '';
            if (dmMax) dmMax.value = '';
            limpiarTodosFiltros();
            close();
        });
    }
}

function initUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    const catParam = params.get('cat');
    const joyCats = ['anillos', 'aretes', 'collares', 'brazaletes'];
    let targetTab = 'perfumes';
    
    if (tabParam === 'joyeria') targetTab = 'joyeria';
    else if (catParam && joyCats.includes(decodeURIComponent(catParam).toLowerCase())) targetTab = 'joyeria';
    
    activeCategoryTab = targetTab;
    document.querySelectorAll('.catalog-tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === targetTab);
    });
    
    const emEl = document.getElementById('catalog-title-em');
    const preEl = document.getElementById('catalog-title-pre');
    if (emEl) emEl.textContent = targetTab === 'joyeria' ? 'joyería.' : 'perfumes.';
    if (preEl) preEl.textContent = targetTab === 'joyeria' ? 'Nuestra' : 'Nuestros';
}

function initCategoryTabs() {
    document.querySelectorAll('.catalog-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            activeCategoryTab = tab;
            document.querySelectorAll('.catalog-tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const emEl = document.getElementById('catalog-title-em');
            const preEl = document.getElementById('catalog-title-pre');
            if (emEl) emEl.textContent = tab === 'joyeria' ? 'joyería.' : 'perfumes.';
            if (preEl) preEl.textContent = tab === 'joyeria' ? 'Nuestra' : 'Nuestros';
            visibleCount = 12;
            limpiarTodosFiltros();
        });
    });
}

function updateSidebarForTab(tab) {
    document.querySelectorAll('.catalog-sidebar .filter-section[data-tabs]').forEach(el => {
        const tabs = el.dataset.tabs.split(' ');
        el.style.display = tabs.includes(tab) ? '' : 'none';
    });
}

function initScrollReveal() {
    const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) e.target.classList.add('visible');
            else e.target.classList.remove('visible');
        });
    }, { threshold: 0.12 });
    document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
}

// =====================================================
// ARRANQUE PRINCIPAL
// =====================================================

async function initCatalogoPage() {
    console.log('🚀 Inicializando catálogo...');
    
    loadAnnounceBar();
    await loadNavbar();
    loadFooter();
    await loadCartDrawer();
    await initFavDrawer();
    
    initScrollReveal();
    initUrlParams();
    updateSidebarForTab(activeCategoryTab);
    initCategoryTabs();
    initSidebarBindings();
    initFilterDrawer();
    initSortSelect();
    initLoadMore();
    initEmptyStateClear();
    initSortMobileBtn();
    
    // Cargar productos desde la API
    await cargarProductosDesdeAPI();
    aplicarFiltrosYOrdenar();
}

// Ejecutar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCatalogoPage);
} else {
    initCatalogoPage();
}