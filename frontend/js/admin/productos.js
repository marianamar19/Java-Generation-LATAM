/**
 * productos.js — HERA Admin
 * Gestión de productos: listar, crear, editar, eliminar.
 */

import { guardAdmin, initLogout, loadAdminSidebar, buildEmptyState, escapeHtml, capitalize, showToast } from './admin-utils.js';
import { getProductos, getAdminProductos, createProducto, updateProducto, deleteProducto, authFetch } from '../utils/api.js';

guardAdmin();

let productosGlobal = [];
let editingId       = null;
let imageState      = { principal: null, galeria: [] };

const REQUIRED_FIELDS = ['f-brand', 'f-name', 'f-conc-mat', 'f-tipo', 'f-cat', 'f-gen', 'f-nivel', 'f-precio-base'];

/* ══════════════════════════════════════
   INICIALIZACIÓN
══════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', async () => {
    loadAdminSidebar('productos');
    initLogout();
    await cargarProductos();
    renderTable(productosGlobal);
    initModal();
    initFilters();
    initImagenes();
    initConcentracionMaterial();
    initContexto();
});

/* ══════════════════════════════════════
   CARGAR PRODUCTOS
══════════════════════════════════════ */

async function cargarProductos() {
    try {
        productosGlobal = await getAdminProductos();
        updateCount();
    } catch (e) {
        console.error('Error cargando productos:', e);
        showToast('Error al cargar productos', '#E1222B');
        productosGlobal = [];
    }
}

function updateCount() {
    const el = document.getElementById('prod-count');
    if (!el) return;
    const activos = productosGlobal.filter(p => p.activo !== false).length;
    el.textContent = `${productosGlobal.length} productos · ${activos} activos`;
}

/* ══════════════════════════════════════
   RENDER TABLA
══════════════════════════════════════ */

function renderTable(list) {
    const tbody = document.getElementById('prod-tbody');
    if (!tbody) return;

    if (!list || list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9">${buildEmptyState('Sin productos', 'box')}</td></tr>`;
        return;
    }

    tbody.innerHTML = list.map(p => `
        <tr>
            <td>
                <div class="adm-prod-cell">
                    <div class="adm-prod-thumb">
                        ${p.imagenPrincipalUrl
                            ? `<img src="${p.imagenPrincipalUrl}" alt="${escapeHtml(p.nombre)}" loading="lazy" />`
                            : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>`
                        }
                    </div>
                    <div class="adm-prod-info">
                        <div class="adm-prod-name">${escapeHtml(p.nombre || '—')}</div>
                        <div class="adm-prod-brand">${escapeHtml(p.marca || '—')}</div>
                        <div class="adm-prod-id">${escapeHtml(p.productId || '—')}</div>
                    </div>
                </div>
            </td>
            <td>
                <div>${capitalize(p.tipo || '—')}</div>
                <div style="font-size:10px;color:var(--adm-muted);">${capitalize(p.genero || '—')}</div>
            </td>
            <td>${capitalize(p.categoria || '—')}</td>
            <td style="font-size:11px;color:var(--adm-muted);">
                ${p.concentracion || p.material || '—'}
            </td>
            <td style="font-weight:600;">${p.precio || '—'}</td>
            <td><span class="adm-variantes-count">${p.variantes?.length || 0} variante${(p.variantes?.length || 0) !== 1 ? 's' : ''}</span></td>
            <td>${buildFlags(p)}</td>
            <td>${buildNivel(p.nivelDisponibilidad)}</td>
            <td>
                <div class="form-check form-switch mb-0">
                    <input class="form-check-input" type="checkbox" role="switch"
                        ${p.activo !== false ? 'checked' : ''}
                        data-toggle-id="${p.productId}" />
                </div>
            </td>
            <td>
                <div class="d-flex gap-1">
                    <button class="btn btn-sm btn-outline-secondary" data-edit-id="${p.productId}" aria-label="Editar">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" data-delete-id="${p.productId}" aria-label="Eliminar">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');

    tbody.querySelectorAll('[data-edit-id]').forEach(btn =>
        btn.addEventListener('click', () => openModal(btn.dataset.editId))
    );
    tbody.querySelectorAll('[data-delete-id]').forEach(btn =>
        btn.addEventListener('click', () => deleteProduct(btn.dataset.deleteId))
    );
    tbody.querySelectorAll('[data-toggle-id]').forEach(input =>
        input.addEventListener('change', () => toggleActivo(input.dataset.toggleId, input.checked))
    );
}

function buildNivel(nivel) {
    const labels = { green: 'En existencia', yellow: 'Disp. limitada', red: 'Pieza exclusiva' };
    return `<span class="adm-nivel ${nivel || ''}">${labels[nivel] || '—'}</span>`;
}

function buildFlags(p) {
    const flags = [];
    if (p.esNuevo)      flags.push(`<span class="adm-flag adm-flag-nuevo">Nuevo</span>`);
    if (p.esBestSeller) flags.push(`<span class="adm-flag adm-flag-best">Bestseller</span>`);
    if (p.esDestacado)  flags.push(`<span class="adm-flag adm-flag-dest">Destacado</span>`);
    return flags.length ? flags.join('') : `<span style="font-size:11px;color:var(--adm-muted);">—</span>`;
}

/* ══════════════════════════════════════
   FILTROS
══════════════════════════════════════ */

function initFilters() {
    const search      = document.getElementById('prod-search');
    const filterTipo  = document.getElementById('filter-tipo');
    const filterNivel = document.getElementById('filter-nivel');

    const apply = () => {
        let list = [...productosGlobal];
        const q = search?.value.trim().toLowerCase();
        if (q) list = list.filter(p =>
            p.nombre?.toLowerCase().includes(q) || p.marca?.toLowerCase().includes(q)
        );
        if (filterTipo?.value)  list = list.filter(p => p.tipo === filterTipo.value);
        if (filterNivel?.value) list = list.filter(p => p.nivelDisponibilidad === filterNivel.value);
        renderTable(list);
    };

    search?.addEventListener('input', apply);
    filterTipo?.addEventListener('change', apply);
    filterNivel?.addEventListener('change', apply);
    document.getElementById('btn-nuevo')?.addEventListener('click', () => openModal());
}

/* ══════════════════════════════════════
   MODAL
══════════════════════════════════════ */

function initModal() {
    document.getElementById('btn-save-product')?.addEventListener('click', saveProduct);
}

function openModal(productoId = null) {
    editingId = productoId;
    const modalEl = document.getElementById('prod-modal');
    const title   = document.getElementById('modal-title');

    if (productoId) {
        const p = productosGlobal.find(p => p.productId === productoId);
        if (p) populateForm(p);
        if (title) title.textContent = 'Editar producto';
    } else {
        resetForm();
        if (title) title.textContent = 'Nuevo producto';
    }

    const firstTab = document.querySelector('#prod-modal .nav-link');
    if (firstTab) bootstrap.Tab.getOrCreateInstance(firstTab).show();
    bootstrap.Modal.getOrCreateInstance(modalEl).show();
}

/* ══════════════════════════════════════
   CAMPO CONCENTRACIÓN / MATERIAL
══════════════════════════════════════ */

function initConcentracionMaterial() {
    document.getElementById('f-tipo')?.addEventListener('change', e => {
        updateConcMatField(e.target.value);
    });
}

function updateConcMatField(tipo) {
    const label  = document.getElementById('lbl-conc-mat');
    const select = document.getElementById('f-conc-mat');
    if (!label || !select) return;

    const currentVal = select.value;

    if (tipo === 'joyeria') {
        label.innerHTML = 'Material <span class="req">*</span>';
        select.innerHTML = `
            <option value="">Seleccionar</option>
            <option value="PLT">Plata</option>
            <option value="ORO">Oro</option>`;
    } else {
        label.innerHTML = 'Concentración <span class="req">*</span>';
        select.innerHTML = `
            <option value="">Seleccionar</option>
            <option value="EDP">EDP</option>
            <option value="EDT">EDT</option>
            <option value="EDC">EDC</option>
            <option value="PAR">Parfum</option>
            <option value="ELI">Elixir</option>
            <option value="FRA">Fragancia (Body Mist)</option>`;
    }

    // Restaurar valor si sigue siendo válido
    if ([...select.options].some(o => o.value === currentVal)) {
        select.value = currentVal;
    }
}

/* ══════════════════════════════════════
   IMÁGENES
══════════════════════════════════════ */

function initImagenes() {
    const addBtn   = document.getElementById('btn-agregar-imagen');
    const urlInput = document.getElementById('f-imagen-url');
    const dropZone = document.getElementById('img-preview');

    addBtn?.addEventListener('click', () => {
        const url = urlInput?.value.trim();
        if (url) { addImage(url); urlInput.value = ''; }
    });
    urlInput?.addEventListener('keydown', e => {
        if (e.key === 'Enter') { e.preventDefault(); addBtn?.click(); }
    });

    if (dropZone) {
        dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('drag-over'); });
        dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
        dropZone.addEventListener('drop', e => {
            e.preventDefault();
            dropZone.classList.remove('drag-over');
            const index = parseInt(e.dataTransfer.getData('text/plain'));
            if (!isNaN(index)) promoteToMain(index);
        });
    }
}

function addImage(url) {
    if (!url.startsWith('http')) { showToast('URL inválida', '#f9a825'); return; }
    if (!imageState.principal) { imageState.principal = url; renderPrincipal(); }
    else { imageState.galeria.push(url); renderGaleria(); }
}

function removePrincipal() {
    imageState.principal = imageState.galeria.length > 0 ? imageState.galeria.shift() : null;
    renderPrincipal(); renderGaleria();
}

function promoteToMain(index) {
    const newMain = imageState.galeria[index];
    if (!newMain) return;
    imageState.galeria.splice(index, 1);
    if (imageState.principal) imageState.galeria.unshift(imageState.principal);
    imageState.principal = newMain;
    renderPrincipal(); renderGaleria();
}

function renderPrincipal() {
    const preview = document.getElementById('img-preview');
    if (!preview) return;
    if (imageState.principal) {
        preview.innerHTML = `
            <img src="${imageState.principal}" style="width:100%;height:100%;object-fit:cover;" />
            <button class="adm-img-remove-principal" id="btn-remove-principal" aria-label="Eliminar imagen principal">✕</button>`;
        preview.querySelector('#btn-remove-principal')?.addEventListener('click', e => {
            e.stopPropagation(); removePrincipal();
        });
    } else {
        preview.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
            <span>Arrastra aquí</span>`;
    }
}

function renderGaleria() {
    const container = document.getElementById('galeria-imagenes-list');
    if (!container) return;
    if (imageState.galeria.length === 0) {
        container.innerHTML = '<span style="font-size:10px;color:var(--adm-muted);">Galería vacía</span>';
        return;
    }
    container.innerHTML = imageState.galeria.map((url, i) => `
        <div class="adm-gallery-thumb" draggable="true" data-index="${i}" title="Arrastra para hacer principal">
            <img src="${url}" onerror="this.style.display='none'" />
            <button class="adm-gallery-thumb-remove" data-index="${i}" aria-label="Eliminar imagen">✕</button>
        </div>`
    ).join('');

    container.querySelectorAll('.adm-gallery-thumb').forEach(thumb => {
        thumb.addEventListener('dragstart', e => {
            e.dataTransfer.setData('text/plain', thumb.dataset.index);
            thumb.classList.add('dragging');
        });
        thumb.addEventListener('dragend', () => thumb.classList.remove('dragging'));
    });
    container.querySelectorAll('.adm-gallery-thumb-remove').forEach(btn => {
        btn.addEventListener('click', e => {
            e.stopPropagation();
            imageState.galeria.splice(parseInt(btn.dataset.index), 1);
            renderGaleria();
        });
    });
}

/* ══════════════════════════════════════
   VARIANTES
══════════════════════════════════════ */

function addVariantRow(valor = '', precio = '', stock = 10) {
    const list = document.getElementById('variants-list');
    if (!list) return;
    const row = document.createElement('div');
    row.className = 'adm-variant-row';
    row.innerHTML = `
        <input class="form-control form-control-sm" type="text" placeholder="Ej: 50 ml" value="${escapeHtml(valor)}" />
        <input class="form-control form-control-sm" type="number" placeholder="Precio MXN" value="${precio}" min="0" />
        <input class="form-control form-control-sm" type="number" placeholder="Stock" value="${stock}" min="0" />
        <button class="btn btn-sm btn-outline-danger" type="button" aria-label="Eliminar variante">✕</button>`;
    row.querySelector('button').addEventListener('click', () => row.remove());
    list.appendChild(row);
}

function getVariants() {
    return [...document.querySelectorAll('#variants-list .adm-variant-row')].map(row => {
        const inputs = row.querySelectorAll('input');
        return {
            valor:  inputs[0]?.value.trim() || '',
            precio: parseFloat(inputs[1]?.value) || 0,
            stock:  parseInt(inputs[2]?.value) ?? 10
        };
    }).filter(v => v.valor);
}

document.getElementById('btn-add-variant')?.addEventListener('click', () => addVariantRow());

/* ══════════════════════════════════════
   FORMULARIO
══════════════════════════════════════ */

function populateForm(p) {
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.value = val ?? ''; };

    set('f-brand',       p.marca || '');
    set('f-name',        p.nombre || '');
    set('f-tipo',        p.tipo || '');
    set('f-cat',         p.categoria || '');
    set('f-gen',         p.genero || '');
    set('f-fam',         p.familiaOlfativa || '');
    set('f-pais',        p.paisOrigen || '');
    set('f-anio',        p.anioLanzamiento || '');
    set('f-descripcion', p.descripcion || '');
    set('f-nivel',       p.nivelDisponibilidad || '');
    set('f-badge',       p.badge || '');
    set('f-precio-base', p.precioNumerico || '');

    // Campo dinámico concentración/material
    updateConcMatField(p.tipo || '');
    const concMatVal = p.concentracion || p.material || '';
    setTimeout(() => {
        const select = document.getElementById('f-conc-mat');
        if (select) select.value = concMatVal;
    }, 0);

    const chk = (id, val) => { const el = document.getElementById(id); if (el) el.checked = !!val; };
    chk('f-nuevo',       p.esNuevo);
    chk('f-bestseller',  p.esBestSeller);
    chk('f-destacado',   p.esDestacado);
    chk('f-activo',      p.activo !== false);

    const list = document.getElementById('variants-list');
    if (list) list.innerHTML = '';
    if (p.variantes?.length) p.variantes.forEach(v => addVariantRow(v.valor, v.precio, v.stock ?? 10));
    else addVariantRow();

    imageState.principal = p.imagenPrincipalUrl || null;
    imageState.galeria   = p.imagenes?.map(i => i.url || i).filter(Boolean) || [];
    renderPrincipal();
    renderGaleria();
    clearErrors();

    // Contexto
    const setV = (id, val) => { const el = document.getElementById(id); if (el) el.value = val ?? ''; };
    setV('f-perfumista', p.perfumista || '');
    const lon = p.longevidad || 3, est = p.estela || 3;
    const lonEl = document.getElementById('f-longevidad');
    const estEl = document.getElementById('f-estela');
    if (lonEl) lonEl.value = lon;
    if (estEl) estEl.value = est;
    const valLon = document.getElementById('val-longevidad');
    const valEst = document.getElementById('val-estela');
    if (valLon) valLon.textContent = lon;
    if (valEst) valEst.textContent = est;
    notasState.head  = p.notasSalida  || [];
    notasState.heart = p.notasCorazon || [];
    notasState.base  = p.notasBase    || [];
    renderTags(document.getElementById('tags-head-list'),  notasState, 'head');
    renderTags(document.getElementById('tags-heart-list'), notasState, 'heart');
    renderTags(document.getElementById('tags-base-list'),  notasState, 'base');
    const TEMP_MAP = { primavera:1, verano:2, 'otoño':3, invierno:4 };
    const MOM_MAP  = { 'día':1, noche:2, 'todo el día':3 };
    const OCA_MAP  = { casual:1, trabajo:2, cita:3, 'gala / evento':4, deportivo:5, vacaciones:6 };
    const setChk = (cid, vals, map) => {
        document.querySelectorAll(`#${cid} input`).forEach(cb => {
            cb.checked = (vals || []).map(v => map[v?.toLowerCase()]).includes(parseInt(cb.value));
        });
    };
    setChk('ctx-temporadas', p.temporadas,  TEMP_MAP);
    setChk('ctx-momentos',   p.momentosDia, MOM_MAP);
    setChk('ctx-ocasiones',  p.ocasiones,   OCA_MAP);

}

function resetForm() {
    ['f-brand','f-name','f-tipo','f-cat','f-gen','f-fam',
     'f-pais','f-anio','f-descripcion','f-nivel','f-badge','f-precio-base'
    ].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });

    const concMat = document.getElementById('f-conc-mat');
    if (concMat) concMat.value = '';

    ['f-nuevo','f-bestseller','f-destacado'].forEach(id => {
        const el = document.getElementById(id); if (el) el.checked = false;
    });
    const activo = document.getElementById('f-activo');
    if (activo) activo.checked = true;

    const list = document.getElementById('variants-list');
    if (list) list.innerHTML = '';
    addVariantRow();

    imageState = { principal: null, galeria: [] };
    renderPrincipal();
    renderGaleria();
    clearErrors();

    // Resetear campo a concentración por defecto
    updateConcMatField('perfumes');

    // Contexto
    const perfEl = document.getElementById('f-perfumista');
    if (perfEl) perfEl.value = '';
    const lonEl = document.getElementById('f-longevidad');
    if (lonEl) lonEl.value = 3;
    const estEl = document.getElementById('f-estela');
    if (estEl) estEl.value = 3;
    const valLon = document.getElementById('val-longevidad');
    if (valLon) valLon.textContent = '3';
    const valEst = document.getElementById('val-estela');
    if (valEst) valEst.textContent = '3';
    notasState.head = []; notasState.heart = []; notasState.base = [];
    ['tags-head-list','tags-heart-list','tags-base-list'].forEach(id => {
        const el = document.getElementById(id); if (el) el.innerHTML = '';
    });
    ['tags-head-input','tags-heart-input','tags-base-input'].forEach(id => {
        const el = document.getElementById(id); if (el) el.value = '';
    });
    ['ctx-temporadas','ctx-momentos','ctx-ocasiones'].forEach(cid => {
        document.querySelectorAll(`#${cid} input`).forEach(cb => cb.checked = false);
    });
}


function validateForm() {
    let ok = true;
    REQUIRED_FIELDS.forEach(id => {
        const el = document.getElementById(id);
        if (!el?.value?.trim()) { el?.classList.add('is-invalid'); ok = false; }
        else el?.classList.remove('is-invalid');
    });
    const precio = document.getElementById('f-precio-base');
    if (precio && parseFloat(precio.value) <= 0) {
        precio.classList.add('is-invalid'); ok = false;
    }
    return ok;
}

function clearErrors() {
    REQUIRED_FIELDS.forEach(id => document.getElementById(id)?.classList.remove('is-invalid'));
}

/* ══════════════════════════════════════
   GUARDAR PRODUCTO
══════════════════════════════════════ */

async function saveProduct() {
    if (!validateForm()) { showToast('Completa los campos obligatorios', '#f9a825'); return; }

    const tipo     = document.getElementById('f-tipo').value;
    const concMat  = document.getElementById('f-conc-mat').value;
    const esPerfume = tipo === 'perfumes';

    const data = {
        nombre:              document.getElementById('f-name').value.trim(),
        marca:               document.getElementById('f-brand').value.trim(),
        tipo,
        concentracion:       esPerfume ? concMat : null,
        material:            !esPerfume ? concMat : null,
        categoria:           document.getElementById('f-cat').value,
        genero:              document.getElementById('f-gen').value,
        familiaOlfativa:     document.getElementById('f-fam').value || null,
        paisOrigen:          document.getElementById('f-pais').value.trim() || null,
        anioLanzamiento:     parseInt(document.getElementById('f-anio').value) || null,
        descripcion:         document.getElementById('f-descripcion').value.trim() || null,
        precioBase:          parseFloat(document.getElementById('f-precio-base').value),
        nivelDisponibilidad: document.getElementById('f-nivel').value,
        badge:               document.getElementById('f-badge').value.trim() || null,
        esNuevo:             document.getElementById('f-nuevo').checked,
        esBestSeller:        document.getElementById('f-bestseller').checked,
        esDestacado:         document.getElementById('f-destacado').checked,
        activo:              document.getElementById('f-activo').checked,
        imagenPrincipalUrl:  imageState.principal || null,
        imagenesExtra:       imageState.galeria.length ? JSON.stringify(imageState.galeria) : null,
        variantes:           getVariants(),
        perfumista:          document.getElementById('f-perfumista')?.value.trim() || null,
        longevidad:          parseInt(document.getElementById('f-longevidad')?.value) || null,
        estela:              parseInt(document.getElementById('f-estela')?.value)     || null,
        notasSalida:         [...notasState.head],
        notasCorazon:        [...notasState.heart],
        notasBase:           [...notasState.base],
        temporadas:          [...document.querySelectorAll('#ctx-temporadas input:checked')].map(cb => parseInt(cb.value)),
        momentosDia:         [...document.querySelectorAll('#ctx-momentos input:checked')].map(cb => parseInt(cb.value)),
        ocasiones:           [...document.querySelectorAll('#ctx-ocasiones input:checked')].map(cb => parseInt(cb.value)),
    };

    try {
        if (editingId) {
            const existing = productosGlobal.find(p => p.productId === editingId);
            await updateProducto(existing.id, data);
            showToast('Producto actualizado', '#4caf50');
        } else {
            await createProducto(data);
            showToast('Producto creado', '#4caf50');
        }
        bootstrap.Modal.getInstance(document.getElementById('prod-modal'))?.hide();
        await cargarProductos();
        renderTable(productosGlobal);
    } catch (e) {
        console.error('Error guardando producto:', e);
        showToast('Error: ' + e.message, '#E1222B');
    }
}

/* ══════════════════════════════════════
   ELIMINAR / TOGGLE
══════════════════════════════════════ */

async function deleteProduct(productoId) {
    if (!confirm('¿Eliminar este producto? Esta acción no se puede deshacer.')) return;
    try {
        const p = productosGlobal.find(p => p.productId === productoId);
        await deleteProducto(p.id);
        showToast('Producto eliminado', '#4caf50');
        await cargarProductos();
        renderTable(productosGlobal);
    } catch (e) {
        showToast('Error al eliminar: ' + e.message, '#E1222B');
    }
}

async function toggleActivo(id, activo) {
    try {
        const producto = productosGlobal.find(p => p.productId === id);
        if (!producto) return;
        await authFetch(`/api/productos/${producto.id}/activo?activo=${activo}`, { method: 'PATCH' });
        await cargarProductos();
        renderTable(productosGlobal);
        showToast(activo ? 'Producto activado' : 'Producto desactivado', '#4caf50');
    } catch (error) {
        showToast('Error: ' + error.message, '#E1222B');
    }
}

/* ══════════════════════════════════════
   CONTEXTO — Notas olfativas
══════════════════════════════════════ */

const notasState = { head: [], heart: [], base: [] };

function initContexto() {
    [['f-longevidad','val-longevidad'],['f-estela','val-estela']].forEach(([sid, vid]) => {
        const s = document.getElementById(sid), v = document.getElementById(vid);
        if(s && v) s.addEventListener('input', () => v.textContent = s.value);
    });
    initTagsInput('tags-head-input',  'tags-head-list',  'head');
    initTagsInput('tags-heart-input', 'tags-heart-list', 'heart');
    initTagsInput('tags-base-input',  'tags-base-list',  'base');
}

function initTagsInput(inputId, listId, key) {
    const input = document.getElementById(inputId);
    const list  = document.getElementById(listId);
    if (!input || !list) return;
    input.closest('.adm-tags-input')?.addEventListener('click', () => input.focus());
    input.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const val = input.value.trim().replace(/,$/, '');
            if (val && !notasState[key].includes(val)) {
                notasState[key].push(val);
                renderTags(list, notasState, key);
            }
            input.value = '';
        }
        if (e.key === 'Backspace' && input.value === '' && notasState[key].length > 0) {
            notasState[key].pop();
            renderTags(list, notasState, key);
        }
    });
}

function renderTags(listEl, state, key) {
    if (!listEl) return;
    listEl.innerHTML = state[key].map((tag, i) => `
        <span class="adm-tag">
            ${tag}
            <button class="adm-tag-remove" data-key="${key}" data-index="${i}" type="button">×</button>
        </span>`).join('');
    listEl.querySelectorAll('.adm-tag-remove').forEach(btn => {
        btn.addEventListener('click', () => {
            notasState[btn.dataset.key].splice(parseInt(btn.dataset.index), 1);
            renderTags(listEl, notasState, btn.dataset.key);
        });
    });
}