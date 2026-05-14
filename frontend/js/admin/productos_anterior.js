/**
 * productos.js — HERA Admin
 * Gestión de productos: listar, crear, editar, eliminar, activar/desactivar.
 * VERSIÓN CORREGIDA - Usa /api/productos directamente
 */

import { guardAdmin, initLogout, buildEmptyState } from './admin-utils.js';
import { getProductos, createProducto, updateProducto, deleteProducto } from '../utils/api.js';

guardAdmin();

let productosGlobal = [];
let editingId = null;

// Campos obligatorios del formulario
const REQUIRED_FIELDS = [
    'f-brand', 'f-name', 'f-tipo', 'f-cat', 'f-gen', 'f-nivel', 'f-precio-base'
];

// =====================================================
// GENERACIÓN AUTOMÁTICA DE ID Y SLUG
// =====================================================
function generateProductIdAndSlug() {
    const marca = document.getElementById('f-brand')?.value.trim() || '';
    const nombre = document.getElementById('f-name')?.value.trim() || '';
    
    if (marca && nombre) {
        // Generar ID único: MARCA-NOMBRE
        let productId = `${marca}-${nombre}`.toUpperCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^A-Z0-9-]/g, '');
        
        if (productId.length > 50) productId = productId.substring(0, 50);
        document.getElementById('f-id').value = productId;
        
        // Generar slug
        let slug = `${marca}-${nombre}`.toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9-]/g, '')
            .replace(/-+/g, '-');
        
        const slugPreview = document.getElementById('f-marca-preview');
        if (slugPreview) slugPreview.textContent = `slug: ${slug}`;
    }
}

// =====================================================
// IMAGEN - VISTA PREVIA
// =====================================================
let imagenesGaleria = [];

function initImagenPreview() {
    const imgPrincipalInput = document.getElementById('f-imagen-principal');
    const btnPreview = document.getElementById('btn-preview-img');
    const previewContainer = document.getElementById('preview-img-container');
    const previewImg = document.getElementById('preview-img');
    
    if (!imgPrincipalInput || !btnPreview) return;
    
    btnPreview.addEventListener('click', () => {
        const url = imgPrincipalInput.value.trim();
        if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
            previewImg.src = url;
            previewContainer.style.display = 'block';
        } else if (url) {
            showToast('URL inválida (debe comenzar con http:// o https://)', '#f9a825');
        }
    });
    
    imgPrincipalInput.addEventListener('input', () => {
        previewContainer.style.display = 'none';
    });
}

function initGaleriaImagenes() {
    const btnAgregar = document.getElementById('btn-agregar-imagen');
    const inputExtra = document.getElementById('f-imagen-extra');
    
    if (!btnAgregar) return;
    
    btnAgregar.addEventListener('click', () => {
        const url = inputExtra?.value.trim();
        if (!url) {
            showToast('Ingresa una URL de imagen', '#f9a825');
            return;
        }
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            showToast('URL inválida', '#f9a825');
            return;
        }
        
        imagenesGaleria.push(url);
        renderGaleriaImagenes();
        inputExtra.value = '';
    });
}

function renderGaleriaImagenes() {
    const galeriaList = document.getElementById('galeria-imagenes-list');
    if (!galeriaList) return;
    
    if (imagenesGaleria.length === 0) {
        galeriaList.innerHTML = '<div class="text-muted small">No hay imágenes adicionales</div>';
        return;
    }
    
    galeriaList.innerHTML = imagenesGaleria.map((url, index) => `
        <div class="galeria-item" style="position: relative; width: 80px; height: 80px; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
            <img src="${url}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='https://placehold.co/80x80?text=Error'">
            <button type="button" class="btn-remove-galeria" data-index="${index}" 
                style="position: absolute; top: 2px; right: 2px; width: 20px; height: 20px; background: rgba(0,0,0,0.6); color: white; border: none; border-radius: 50%; font-size: 12px; cursor: pointer;">✕</button>
        </div>
    `).join('');
    
    galeriaList.querySelectorAll('.btn-remove-galeria').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(btn.dataset.index);
            imagenesGaleria.splice(index, 1);
            renderGaleriaImagenes();
        });
    });
}

// =====================================================
// PUNTO DE ENTRADA
// =====================================================
document.addEventListener('DOMContentLoaded', async () => {
    const brandInput = document.getElementById('f-brand');
    const nameInput = document.getElementById('f-name');
    if (brandInput) brandInput.addEventListener('input', generateProductIdAndSlug);
    if (nameInput) nameInput.addEventListener('input', generateProductIdAndSlug);
    
    initImagenPreview();
    initGaleriaImagenes();
    
    await cargarProductos();
    renderTable(productosGlobal);
    initDrawer();
    initFilters();
    initLogout();
});

// =====================================================
// CARGAR PRODUCTOS
// =====================================================
async function cargarProductos() {
    try {
        // ✅ CORREGIDO: Usar la función getProductos de api.js
        // getProductos() ya hace fetch a /api/productos
        productosGlobal = await getProductos();
        updateCount();
    } catch (error) {
        console.error('Error cargando productos:', error);
        showToast('Error al cargar productos: ' + error.message, '#E1222B');
        productosGlobal = [];
    }
}

function updateCount() {
    const el = document.getElementById('prod-count');
    if (el) {
        const activos = productosGlobal.filter(p => p.activo !== false).length;
        el.textContent = `${productosGlobal.length} productos · ${activos} activos`;
    }
}

// =====================================================
// RENDER TABLA
// =====================================================
function renderTable(list) {
    const tbody = document.getElementById('prod-tbody');
    if (!tbody) return;

    if (!list || list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8">${buildEmptyState('Sin productos', 'box')}</td></tr>`;
        return;
    }

    tbody.innerHTML = list.map(p => `
        <tr>
            <td>
                <div class="adm-prod-name">${escapeHtml(p.nombre || '—')}</div>
                <div class="adm-prod-brand">${escapeHtml(p.marca || '—')}</div>
                <div class="adm-prod-id">${escapeHtml(p.productoId || '—')}</div>
            </td>
            <td>${capitalize(p.tipo || '—')}</td>
            <td>${capitalize(p.categoria || '—')}</td>
            <td style="font-weight:600;">${p.precio || '—'}</td>
            <td>${buildNivel(p.nivelDisponibilidad)}</td>
            <td>
                <div class="form-check form-switch">
                    <input class="form-check-input" type="checkbox" ${p.activo !== false ? 'checked' : ''}
                        data-toggle-id="${p.productoId}" role="switch" />
                </div>
            </td>
            <td>
                <div class="d-flex gap-1">
                    <button class="btn btn-sm btn-outline-secondary" data-edit-id="${p.productoId}">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" data-delete-id="${p.productoId}">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');

    tbody.querySelectorAll('[data-edit-id]').forEach(btn => {
        btn.addEventListener('click', () => openDrawer(btn.dataset.editId));
    });
    tbody.querySelectorAll('[data-delete-id]').forEach(btn => {
        btn.addEventListener('click', () => deleteProduct(btn.dataset.deleteId));
    });
    tbody.querySelectorAll('[data-toggle-id]').forEach(chk => {
        chk.addEventListener('change', () => toggleActivo(chk.dataset.toggleId, chk.checked));
    });
}

function capitalize(str) {
    if (!str) return '—';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function buildNivel(nivel) {
    const labels = { green: 'En existencia', yellow: 'Disp. limitada', red: 'Pieza exclusiva' };
    const n = nivel || 'green';
    return `<span class="badge adm-nivel ${n}">${labels[n] || n}</span>`;
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// =====================================================
// FILTROS
// =====================================================
function initFilters() {
    const searchInput = document.getElementById('prod-search');
    const filterTipo = document.getElementById('filter-tipo');
    const filterNivel = document.getElementById('filter-nivel');

    function applyFilters() {
        const q = searchInput?.value.trim().toLowerCase() || '';
        const tipo = filterTipo?.value || '';
        const nivel = filterNivel?.value || '';

        const filtered = productosGlobal.filter(p => {
            const matchQ = !q || (p.nombre || '').toLowerCase().includes(q) || (p.marca || '').toLowerCase().includes(q);
            const matchTipo = !tipo || p.tipo === tipo;
            const matchNivel = !nivel || p.nivelDisponibilidad === nivel;
            return matchQ && matchTipo && matchNivel;
        });
        renderTable(filtered);
    }

    if (searchInput) searchInput.addEventListener('input', applyFilters);
    if (filterTipo) filterTipo.addEventListener('change', applyFilters);
    if (filterNivel) filterNivel.addEventListener('change', applyFilters);
}

// =====================================================
// ACCIONES
// =====================================================
async function toggleActivo(id, activo) {
    try {
        const producto = productosGlobal.find(p => p.productoId === id);
        if (!producto) return;
        await updateProducto(producto.id, { ...producto, activo });
        await cargarProductos();
        renderTable(productosGlobal);
        showToast(activo ? 'Producto activado' : 'Producto desactivado', '#4caf50');
    } catch (error) {
        showToast('Error: ' + error.message, '#E1222B');
    }
}

async function deleteProduct(id) {
    if (!confirm('¿Eliminar este producto? No se puede deshacer.')) return;
    try {
        const producto = productosGlobal.find(p => p.productoId === id);
        if (!producto) return;
        await deleteProducto(producto.id);
        await cargarProductos();
        renderTable(productosGlobal);
        showToast('Producto eliminado', '#E1222B');
    } catch (error) {
        showToast('Error: ' + error.message, '#E1222B');
    }
}

// =====================================================
// VARIANTES
// =====================================================
function addVariantRow(nombreVariante = '', precio = '') {
    const list = document.getElementById('variants-list');
    if (!list) return;

    const row = document.createElement('div');
    row.className = 'd-flex align-items-center gap-2 mb-2';
    row.innerHTML = `
        <input type="text" class="form-control form-control-sm variant-ml" placeholder="Ej: 100 ml, Talla M" value="${escapeHtml(nombreVariante)}" style="flex:2;" />
        <input type="number" class="form-control form-control-sm variant-precio" placeholder="Precio MXN" value="${precio}" style="flex:1;" min="0" step="1" />
        <button class="btn btn-sm btn-outline-danger" type="button" aria-label="Eliminar variante">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
    `;

    row.querySelector('.btn-outline-danger').addEventListener('click', () => {
        if (list.querySelectorAll('.d-flex').length > 1) {
            row.remove();
        } else {
            showToast('Debe haber al menos una variante', '#f9a825');
        }
    });

    list.appendChild(row);
}

function getVariants() {
    const rows = document.querySelectorAll('#variants-list .d-flex');
    const variants = [];
    rows.forEach((row) => {
        const nombreVariante = row.querySelector('.variant-ml')?.value.trim() || '';
        const precio = parseFloat(row.querySelector('.variant-precio')?.value) || 0;
        if (nombreVariante && precio > 0) {
            variants.push({ nombreVariante, precio, etiquetaTipo: 'Presentación' });
        }
    });
    return variants;
}

// =====================================================
// DRAWER - PANEL LATERAL
// =====================================================
function initDrawer() {
    const btnNuevo = document.getElementById('btn-nuevo');
    const overlay = document.getElementById('drawer-overlay');
    const btnClose = document.getElementById('drawer-close');
    const btnCancel = document.getElementById('btn-cancel-drawer');
    const btnSave = document.getElementById('btn-save-product');
    const btnAddVar = document.getElementById('btn-add-variant');

    if (btnNuevo) btnNuevo.addEventListener('click', () => openDrawer(null));
    if (overlay) overlay.addEventListener('click', closeDrawer);
    if (btnClose) btnClose.addEventListener('click', closeDrawer);
    if (btnCancel) btnCancel.addEventListener('click', closeDrawer);
    if (btnSave) btnSave.addEventListener('click', saveProduct);
    if (btnAddVar) btnAddVar.addEventListener('click', () => addVariantRow());
}

function openDrawer(editId) {
    editingId = editId;
    const drawer = document.getElementById('prod-drawer');
    const overlay = document.getElementById('drawer-overlay');
    const title = document.getElementById('drawer-title');
    const btnSave = document.getElementById('btn-save-product');

    imagenesGaleria = [];
    renderGaleriaImagenes();

    if (editId) {
        const prod = productosGlobal.find(p => p.productoId === editId);
        if (!prod) return;
        title.textContent = 'Editar producto';
        btnSave.textContent = 'Guardar cambios';
        populateForm(prod);
    } else {
        title.textContent = 'Nuevo producto';
        btnSave.textContent = 'Guardar producto';
        resetForm();
        addVariantRow();
    }

    if (overlay) overlay.classList.add('open');
    if (drawer) drawer.classList.add('open');
    setTimeout(() => {
        const first = document.getElementById('f-brand');
        if (first) first.focus();
    }, 350);
}

function closeDrawer() {
    const drawer = document.getElementById('prod-drawer');
    const overlay = document.getElementById('drawer-overlay');
    if (overlay) overlay.classList.remove('open');
    if (drawer) drawer.classList.remove('open');
    editingId = null;
}

// =====================================================
// FORMULARIO
// =====================================================
function populateForm(p) {
    setVal('f-brand', p.marca || '');
    setVal('f-name', p.nombre || '');
    setVal('f-id', p.productoId || '');
    setVal('f-tipo', p.tipo || '');
    setVal('f-cat', p.categoria || '');
    setVal('f-gen', p.genero || '');
    setVal('f-fam', p.familiaOlfativa || '');
    setVal('f-nivel', p.nivelDisponibilidad || '');
    setVal('f-badge', p.badge || '');
    setVal('f-precio-base', p.precioNumerico || p.precioBase || 0);
    
    if (p.imagenPrincipalUrl) {
        setVal('f-imagen-principal', p.imagenPrincipalUrl);
        const previewContainer = document.getElementById('preview-img-container');
        const previewImg = document.getElementById('preview-img');
        if (previewContainer && previewImg) {
            previewImg.src = p.imagenPrincipalUrl;
            previewContainer.style.display = 'block';
        }
    }

    const slugPreview = document.getElementById('f-marca-preview');
    if (slugPreview && p.slug) slugPreview.textContent = `slug: ${p.slug}`;

    const chkNuevo = document.getElementById('f-nuevo');
    const chkActivo = document.getElementById('f-activo');
    if (chkNuevo) chkNuevo.checked = !!p.esNuevo;
    if (chkActivo) chkActivo.checked = p.activo !== false;

    const list = document.getElementById('variants-list');
    if (list) list.innerHTML = '';
    if (p.variantes && p.variantes.length > 0) {
        p.variantes.forEach(v => addVariantRow(v.valor, v.precio));
    } else {
        addVariantRow();
    }

    clearErrors();
}

function resetForm() {
    const fields = ['f-brand', 'f-name', 'f-id', 'f-badge', 'f-tipo', 'f-cat', 'f-gen', 'f-fam', 'f-nivel', 'f-precio-base', 'f-imagen-principal'];
    fields.forEach(id => setVal(id, ''));
    
    const chkNuevo = document.getElementById('f-nuevo');
    const chkActivo = document.getElementById('f-activo');
    if (chkNuevo) chkNuevo.checked = false;
    if (chkActivo) chkActivo.checked = true;
    
    const slugPreview = document.getElementById('f-marca-preview');
    if (slugPreview) slugPreview.textContent = '';
    
    const list = document.getElementById('variants-list');
    if (list) list.innerHTML = '';
    
    imagenesGaleria = [];
    renderGaleriaImagenes();
    const previewContainer = document.getElementById('preview-img-container');
    if (previewContainer) previewContainer.style.display = 'none';
    
    clearErrors();
}

function setVal(id, val) {
    const el = document.getElementById(id);
    if (el) el.value = val;
}

function validateForm() {
    let ok = true;
    REQUIRED_FIELDS.forEach(id => {
        const el = document.getElementById(id);
        const value = el?.value?.trim();
        if (!value || (id === 'f-precio-base' && parseFloat(value) <= 0)) {
            if (el) el.classList.add('is-invalid');
            ok = false;
        } else {
            if (el) el.classList.remove('is-invalid');
        }
    });
    return ok;
}

function clearErrors() {
    REQUIRED_FIELDS.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.remove('is-invalid');
    });
}

// =====================================================
// GUARDAR PRODUCTO
// =====================================================
async function saveProduct() {
    if (!validateForm()) {
        showToast('Completa los campos obligatorios correctamente', '#f9a825');
        return;
    }

    const marca = document.getElementById('f-brand').value.trim();
    const nombre = document.getElementById('f-name').value.trim();
    const precioBase = parseFloat(document.getElementById('f-precio-base').value);
    const imagenPrincipalUrl = document.getElementById('f-imagen-principal')?.value.trim() || null;
    
    if (isNaN(precioBase) || precioBase <= 0) {
        showToast('El precio base debe ser mayor a 0', '#f9a825');
        return;
    }
    
    const productId = `${marca}-${nombre}`.toUpperCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^A-Z0-9-]/g, '');
    
    const slug = `${marca}-${nombre}`.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-');
    
    const variants = getVariants();

    const productData = {
        nombre: nombre,
        productoId: productId,
        slug: slug,
        tipo: document.getElementById('f-tipo').value,
        precioBase: precioBase,
        marca: marca,
        categoria: document.getElementById('f-cat').value,
        genero: document.getElementById('f-gen').value,
        familiaOlfativa: document.getElementById('f-fam').value || null,
        nivelDisponibilidad: document.getElementById('f-nivel').value,
        badge: document.getElementById('f-badge').value.trim() || null,
        esNuevo: document.getElementById('f-nuevo').checked,
        activo: document.getElementById('f-activo').checked !== false,
        variantes: variants,
        imagenPrincipalUrl: imagenPrincipalUrl,
        imagenesExtra: imagenesGaleria.length > 0 ? JSON.stringify(imagenesGaleria) : null
    };

    console.log('Enviando producto:', productData);

    try {
        if (editingId) {
            const existing = productosGlobal.find(p => p.productoId === editingId);
            await updateProducto(existing.id, productData);
            showToast('Producto actualizado', '#4caf50');
        } else {
            await createProducto(productData);
            showToast('Producto creado', '#4caf50');
        }
        await cargarProductos();
        renderTable(productosGlobal);
        closeDrawer();
    } catch (error) {
        console.error('Error:', error);
        let errorMsg = error.message;
        if (error.message.includes('401')) {
            errorMsg = 'Sesión expirada. Vuelve a iniciar sesión.';
            setTimeout(() => {
                window.location.href = '/pages/cuenta.html';
            }, 2000);
        }
        showToast('Error: ' + errorMsg, '#E1222B');
    }
}

// =====================================================
// TOAST
// =====================================================
function showToast(msg, color) {
    const toastEl = document.getElementById('adm-toast');
    const dot = document.getElementById('toast-dot');
    const msgEl = document.getElementById('toast-msg');
    if (!toastEl) return;
    if (msgEl) msgEl.textContent = msg;
    if (dot) dot.style.background = color;
    const bsToast = bootstrap.Toast.getOrCreateInstance(toastEl, { delay: 3000 });
    bsToast.show();
}