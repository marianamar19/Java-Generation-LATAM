/**
 * productos.js — HERA Admin
 *
 * Descripción: Lógica completa de la página de gestión de productos.
 *              Gestiona el catálogo en localStorage, tabla con filtros,
 *              drawer de creación/edición, variantes de precio,
 *              validación Bootstrap, toggle de activo, eliminación
 *              y feedback via Bootstrap Toast.
 *
 * Exporta:     (ninguno — script de página, punto de entrada)
 * Importado por: pages/admin/productos.html via <script type="module">
 *
 * Dependencias externas:
 *   - Bootstrap 5.3.3 (cargado via CDN — usado para Toast API)
 */

import { guardAdmin, initLogout, buildEmptyState } from './admin-utils.js';

/* Ejecutar guard inmediatamente — antes que cualquier otra lógica */
guardAdmin();

/* ══════════════════════════════════════
   CATÁLOGO FALLBACK — TEMPORAL
   Fuente: hera_products en localStorage con fallback a estos datos.
   Reemplazar con: fetch('/api/products') cuando exista backend.
══════════════════════════════════════ */
const CATALOG_FALLBACK = [
  { id:'jenny-1',     brand:'Jenny Rivera',       name:'Inolvidable EDP',   price:'$1,210 MXN', precio:1210, badge:'Más vendido',  cat:'diseñador', gen:'femenino',  fam:'floral',    marca:'jenny-rivera',   nuevo:false, tipo:'perfumes', nivel:'green',  vols:[{ml:50,precio:1210},{ml:100,precio:1890}],              volLabel:'Presentación', masVariantes:false, activo:true },
  { id:'fierce-2',    brand:'Abercrombie & Fitch', name:'Fierce EDT',        price:'$760 MXN',   precio:760,  badge:'',            cat:'diseñador', gen:'masculino', fam:'fresco',    marca:'abercrombie',    nuevo:false, tipo:'perfumes', nivel:'green',  vols:[{ml:50,precio:760},{ml:100,precio:1180},{ml:200,precio:1740}], volLabel:'Presentación', masVariantes:false, activo:true },
  { id:'authentic-3', brand:'Abercrombie & Fitch', name:'Authentic EDP',     price:'$975 MXN',   precio:975,  badge:'Ed. limitada', cat:'diseñador', gen:'unisex',   fam:'amaderado', marca:'abercrombie',    nuevo:false, tipo:'perfumes', nivel:'yellow', vols:[{ml:50,precio:975},{ml:100,precio:1540}],               volLabel:'Presentación', masVariantes:false, activo:true },
  { id:'signature-4', brand:'HERA Exclusivo',      name:'Signature Blanc',   price:'$1,490 MXN', precio:1490, badge:'Nuevo',        cat:'nicho',     gen:'unisex',   fam:'floral',    marca:'hera-exclusivo', nuevo:true,  tipo:'perfumes', nivel:'yellow', vols:[{ml:50,precio:1490},{ml:100,precio:2280}],              volLabel:'Presentación', masVariantes:false, activo:true },
  { id:'noir-5',      brand:'HERA Exclusivo',      name:'Noir Absolu',       price:'$1,480 MXN', precio:1480, badge:'-20%',         cat:'nicho',     gen:'masculino', fam:'oriental',  marca:'hera-exclusivo', nuevo:false, tipo:'perfumes', nivel:'yellow', vols:[{ml:50,precio:1480},{ml:100,precio:2200}],              volLabel:'Presentación', masVariantes:false, activo:true },
  { id:'oud-6',       brand:'HERA Árabe',          name:'Oud Rose',          price:'$1,320 MXN', precio:1320, badge:'',            cat:'arabes',    gen:'unisex',   fam:'oriental',  marca:'hera-arabe',     nuevo:false, tipo:'perfumes', nivel:'green',  vols:[{ml:30,precio:1320},{ml:50,precio:1890}],               volLabel:'Presentación', masVariantes:false, activo:true },
  { id:'sauvage-7',   brand:'Dior',                name:'Sauvage EDP',       price:'$2,450 MXN', precio:2450, badge:'Más vendido',  cat:'diseñador', gen:'masculino', fam:'fresco',    marca:'dior',           nuevo:false, tipo:'perfumes', nivel:'red',    vols:[{ml:60,precio:1850},{ml:100,precio:2450},{ml:200,precio:3100}], volLabel:'Presentación', masVariantes:false, activo:true },
  { id:'blanche-8',   brand:'Byredo',              name:'Blanche EDP',       price:'$2,100 MXN', precio:2100, badge:'',            cat:'nicho',     gen:'femenino',  fam:'floral',    marca:'byredo',         nuevo:false, tipo:'perfumes', nivel:'red',    vols:[{ml:50,precio:2100},{ml:100,precio:3400}],              volLabel:'Presentación', masVariantes:false, activo:true },
  { id:'anillo-1',    brand:'HERA Joyería',        name:'Anillo Solitario',  price:'$1,290 MXN', precio:1290, badge:'Nuevo',        cat:'anillos',   gen:'femenino',  fam:'',          marca:'hera-joyeria',   nuevo:true,  tipo:'joyeria',  nivel:'yellow', vols:[{ml:'5',precio:1290},{ml:'6',precio:1290},{ml:'7',precio:1290}], volLabel:'Talla',        masVariantes:true,  activo:true },
  { id:'aretes-1',    brand:'HERA Joyería',        name:'Aretes Perla',      price:'$680 MXN',   precio:680,  badge:'',            cat:'aretes',    gen:'femenino',  fam:'',          marca:'hera-joyeria',   nuevo:false, tipo:'joyeria',  nivel:'yellow', vols:[{ml:'Plata .925',precio:680},{ml:'Oro 14k',precio:980}],        volLabel:'Material',     masVariantes:false, activo:true },
  { id:'collar-1',    brand:'HERA Joyería',        name:'Collar Dorado',     price:'$890 MXN',   precio:890,  badge:'',            cat:'collares',  gen:'unisex',   fam:'',          marca:'hera-joyeria',   nuevo:false, tipo:'joyeria',  nivel:'yellow', vols:[{ml:'40 cm',precio:890},{ml:'45 cm',precio:890}],              volLabel:'Largo',        masVariantes:false, activo:true },
  { id:'brazalete-1', brand:'HERA Joyería',        name:'Brazalete Minimal', price:'$750 MXN',   precio:750,  badge:'Nuevo',        cat:'brazaletes',gen:'unisex',   fam:'',          marca:'hera-joyeria',   nuevo:true,  tipo:'joyeria',  nivel:'red',    vols:[{ml:'Plata .925',precio:750},{ml:'Oro 18k',precio:1200}],       volLabel:'Material',     masVariantes:false, activo:true },
];

/* ══════════════════════════════════════
   ESTADO DE LA PÁGINA
══════════════════════════════════════ */
const appState = { products: [], editingId: null, filtered: [] };

/* ══════════════════════════════════════
   CAMPOS REQUERIDOS — validación Bootstrap
══════════════════════════════════════ */
const REQUIRED_FIELDS = [
  { id: 'f-brand', errId: 'err-brand' },
  { id: 'f-name',  errId: 'err-name'  },
  { id: 'f-id',    errId: 'err-id'    },
  { id: 'f-tipo',  errId: 'err-tipo'  },
  { id: 'f-cat',   errId: 'err-cat'   },
  { id: 'f-gen',   errId: 'err-gen'   },
  { id: 'f-nivel', errId: 'err-nivel' },
];

/* ══════════════════════════════════════
   PUNTO DE ENTRADA
══════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  _loadProducts();
  renderTable(appState.filtered);
  _initDrawer();
  _initSlugAutoGen();
  _initFilters();
  initLogout();
});

/* ══════════════════════════════════════
   PERSISTENCIA — localStorage
   TEMPORAL — Reemplazar con fetch('/api/products')
   cuando exista backend.
══════════════════════════════════════ */

/**
 * Carga el catálogo desde localStorage o usa el fallback.
 * @returns {void}
 */
function _loadProducts() {
  try {
    const stored = localStorage.getItem('hera_products');
    appState.products = stored ? JSON.parse(stored) : CATALOG_FALLBACK;
  } catch (e) {
    appState.products = CATALOG_FALLBACK;
  }
  appState.filtered = appState.products.slice();
  _updateCount();
}

/**
 * Persiste el catálogo en localStorage.
 * @returns {void}
 */
function _saveProducts() {
  try { localStorage.setItem('hera_products', JSON.stringify(appState.products)); }
  catch (e) { /* silencioso */ }
}

/**
 * Actualiza el conteo de productos en el topbar.
 * @returns {void}
 */
function _updateCount() {
  const el = document.getElementById('prod-count');
  if (!el) return;
  const total   = appState.products.length;
  const activos = appState.products.filter((p) => p.activo !== false).length;
  el.textContent = `${total} productos · ${activos} activos`;
}

/* ══════════════════════════════════════
   RENDER TABLA
══════════════════════════════════════ */

/**
 * Renderiza la lista de productos en la tabla.
 * @param {Array} list - Array de productos a mostrar
 * @returns {void}
 */
function renderTable(list) {
  const tbody = document.getElementById('prod-tbody');
  if (!tbody) return;

  if (!list || list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8">${buildEmptyState('Sin productos que coincidan', 'box')}</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map((p) => {
    const precio  = p.precio ? '$' + p.precio.toLocaleString('es-MX') + ' MXN' : '—';
    const numVols = p.vols ? p.vols.length : 0;
    const checked = p.activo !== false ? 'checked' : '';
    return (
      `<tr>
        <td>
          <div class="adm-prod-name">${p.name  || '—'}</div>
          <div class="adm-prod-brand">${p.brand || '—'}</div>
          <div class="adm-prod-id">${p.id    || '—'}</div>
        </td>
        <td>${_capitalize(p.tipo || '—')}</td>
        <td>${_capitalize(p.cat  || '—')}</td>
        <td style="font-weight:600;">${precio}</td>
        <td style="color:var(--adm-muted);font-size:12px;">${numVols}${numVols === 1 ? ' variante' : ' variantes'}</td>
        <td>${_buildNivel(p.nivel)}</td>
        <td>
          <div class="form-check form-switch mb-0">
            <input class="form-check-input" type="checkbox" ${checked}
              data-toggle-id="${p.id}" role="switch"
              aria-label="Activar o desactivar producto" />
          </div>
        </td>
        <td>
          <div class="d-flex gap-1">
            <button class="btn btn-sm btn-outline-secondary" data-edit-id="${p.id}" aria-label="Editar producto">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button class="btn btn-sm btn-outline-danger" data-delete-id="${p.id}" aria-label="Eliminar producto">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
            </button>
          </div>
        </td>
      </tr>`
    );
  }).join('');

  // Enlazar eventos después de inyectar el HTML
  tbody.querySelectorAll('[data-edit-id]').forEach((btn) => {
    btn.addEventListener('click', () => _openDrawer(btn.dataset.editId));
  });
  tbody.querySelectorAll('[data-delete-id]').forEach((btn) => {
    btn.addEventListener('click', () => _deleteProduct(btn.dataset.deleteId));
  });
  tbody.querySelectorAll('[data-toggle-id]').forEach((chk) => {
    chk.addEventListener('change', () => _toggleActivo(chk.dataset.toggleId, chk.checked));
  });
}

/* ══════════════════════════════════════
   HELPERS DE CONSTRUCCIÓN DOM
══════════════════════════════════════ */

/**
 * Construye el badge de disponibilidad (nivel).
 * @param {string} nivel - 'green' | 'yellow' | 'red'
 * @returns {string} HTML del badge
 */
function _buildNivel(nivel) {
  const labels = { green: 'En existencia', yellow: 'Disp. limitada', red: 'Pieza exclusiva' };
  const n      = nivel || 'green';
  return `<span class="badge adm-nivel ${n}">${labels[n] || n}</span>`;
}

/**
 * Capitaliza la primera letra de un string.
 * @param {string} str
 * @returns {string}
 */
function _capitalize(str) {
  if (!str) return '—';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/* ══════════════════════════════════════
   FILTROS
══════════════════════════════════════ */

/**
 * Inicializa los listeners de búsqueda y filtros de tipo/disponibilidad.
 * @returns {void}
 */
function _initFilters() {
  const searchInput = document.getElementById('prod-search');
  const filterTipo  = document.getElementById('filter-tipo');
  const filterNivel = document.getElementById('filter-nivel');

  function applyFilters() {
    const q     = searchInput ? searchInput.value.trim().toLowerCase() : '';
    const tipo  = filterTipo  ? filterTipo.value  : '';
    const nivel = filterNivel ? filterNivel.value : '';

    appState.filtered = appState.products.filter((p) => {
      const matchQ     = !q     || (p.name  || '').toLowerCase().includes(q) || (p.brand || '').toLowerCase().includes(q);
      const matchTipo  = !tipo  || p.tipo  === tipo;
      const matchNivel = !nivel || p.nivel === nivel;
      return matchQ && matchTipo && matchNivel;
    });
    renderTable(appState.filtered);
  }

  if (searchInput) searchInput.addEventListener('input',  applyFilters);
  if (filterTipo)  filterTipo.addEventListener('change',  applyFilters);
  if (filterNivel) filterNivel.addEventListener('change', applyFilters);
}

/* ══════════════════════════════════════
   TOGGLE ACTIVO
══════════════════════════════════════ */

/**
 * Activa o desactiva un producto y persiste el cambio.
 * @param {string}  id     - ID del producto
 * @param {boolean} activo - Nuevo estado
 * @returns {void}
 */
function _toggleActivo(id, activo) {
  appState.products = appState.products.map((p) =>
    p.id === id ? { ...p, activo } : p
  );
  _saveProducts();
  _updateCount();
  showToast(activo ? 'Producto activado' : 'Producto desactivado', activo ? '#4caf50' : '#f9a825');
}

/* ══════════════════════════════════════
   ELIMINAR
══════════════════════════════════════ */

/**
 * Solicita confirmación y elimina el producto del catálogo.
 * @param {string} id - ID del producto a eliminar
 * @returns {void}
 */
function _deleteProduct(id) {
  if (!confirm('¿Eliminar este producto del catálogo? Esta acción no se puede deshacer.')) return;
  appState.products = appState.products.filter((p) => p.id !== id);
  appState.filtered = appState.filtered.filter((p) => p.id !== id);
  _saveProducts();
  renderTable(appState.filtered);
  _updateCount();
  showToast('Producto eliminado', '#E1222B');
}

/* ══════════════════════════════════════
   DRAWER — Panel lateral de formulario
══════════════════════════════════════ */

/**
 * Inicializa todos los event listeners del drawer.
 * @returns {void}
 */
function _initDrawer() {
  const btnNuevo  = document.getElementById('btn-nuevo');
  const overlay   = document.getElementById('drawer-overlay');
  const btnClose  = document.getElementById('drawer-close');
  const btnCancel = document.getElementById('btn-cancel-drawer');
  const btnSave   = document.getElementById('btn-save-product');
  const btnAddVar = document.getElementById('btn-add-variant');

  if (btnNuevo)  btnNuevo.addEventListener('click',  () => _openDrawer(null));
  if (overlay)   overlay.addEventListener('click',   _closeDrawer);
  if (btnClose)  btnClose.addEventListener('click',  _closeDrawer);
  if (btnCancel) btnCancel.addEventListener('click', _closeDrawer);
  if (btnSave)   btnSave.addEventListener('click',   _saveProduct);
  if (btnAddVar) btnAddVar.addEventListener('click', () => _addVariantRow());
}

/**
 * Abre el drawer en modo creación (editId = null) o edición.
 * @param {string|null} editId - ID del producto a editar, o null para nuevo
 * @returns {void}
 */
function _openDrawer(editId) {
  appState.editingId = editId || null;
  const drawer  = document.getElementById('prod-drawer');
  const overlay = document.getElementById('drawer-overlay');
  const title   = document.getElementById('drawer-title');
  const btnSave = document.getElementById('btn-save-product');

  if (editId) {
    const prod = appState.products.find((p) => p.id === editId);
    if (!prod) return;
    title.textContent   = 'Editar producto';
    btnSave.textContent = 'Guardar cambios';
    _populateForm(prod);
  } else {
    title.textContent   = 'Nuevo producto';
    btnSave.textContent = 'Guardar producto';
    _resetForm();
    _addVariantRow();
  }

  if (overlay) overlay.classList.add('open');
  if (drawer)  drawer.classList.add('open');

  // Focus en el primer campo después de la animación
  setTimeout(() => {
    const first = document.getElementById('f-brand');
    if (first) first.focus();
  }, 350);
}

/**
 * Cierra el drawer y limpia el estado de edición.
 * @returns {void}
 */
function _closeDrawer() {
  const drawer  = document.getElementById('prod-drawer');
  const overlay = document.getElementById('drawer-overlay');
  if (overlay) overlay.classList.remove('open');
  if (drawer)  drawer.classList.remove('open');
  appState.editingId = null;
}

/* ══════════════════════════════════════
   VARIANTES
══════════════════════════════════════ */

/**
 * Agrega una fila de variante (valor + precio) al listado del formulario.
 * @param {string|number} [ml]     - Valor preexistente (edición)
 * @param {number}        [precio] - Precio preexistente (edición)
 * @returns {void}
 */
function _addVariantRow(ml, precio) {
  const list = document.getElementById('variants-list');
  if (!list) return;

  const row       = document.createElement('div');
  row.className   = 'd-flex align-items-center gap-2';
  row.innerHTML   =
    `<span class="adm-variant-label-small">Vol / Talla</span>` +
    `<input class="form-control form-control-sm variant-ml" type="text" placeholder="Ej: 50, XL, Oro 14k" value="${ml || ''}" aria-label="Valor de variante" />` +
    `<span class="adm-variant-label-small">Precio</span>` +
    `<input class="form-control form-control-sm variant-precio" type="number" placeholder="MXN" value="${precio || ''}" min="0" aria-label="Precio de variante" />` +
    `<button class="btn btn-sm btn-outline-danger flex-shrink-0" type="button" aria-label="Eliminar variante">` +
      `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>` +
    `</button>`;

  row.querySelector('.btn-outline-danger').addEventListener('click', () => {
    if (list.querySelectorAll('.d-flex').length > 1) {
      row.remove();
    } else {
      showToast('Debe haber al menos una variante', '#f9a825');
    }
  });

  list.appendChild(row);
}

/**
 * Lee todas las filas de variantes del formulario y devuelve el array.
 * @returns {Array<{ml: string|number, precio: number}>}
 */
function _getVariants() {
  const rows = document.querySelectorAll('#variants-list .d-flex');
  const vols = [];
  rows.forEach((row) => {
    const ml     = row.querySelector('.variant-ml')?.value.trim()     || '';
    const precio = row.querySelector('.variant-precio')?.value.trim() || '';
    if (ml && precio) {
      vols.push({ ml: isNaN(ml) ? ml : parseFloat(ml), precio: parseFloat(precio) });
    }
  });
  return vols;
}

/* ══════════════════════════════════════
   FORMULARIO — Poblar / Resetear
══════════════════════════════════════ */

/**
 * Rellena el formulario con los datos de un producto existente.
 * @param {Object} p - Objeto del producto
 * @returns {void}
 */
function _populateForm(p) {
  _setVal('f-brand',     p.brand    || '');
  _setVal('f-marca',     p.marca    || '');
  _setVal('f-name',      p.name     || '');
  _setVal('f-id',        p.id       || '');
  _setVal('f-tipo',      p.tipo     || '');
  _setVal('f-cat',       p.cat      || '');
  _setVal('f-gen',       p.gen      || '');
  _setVal('f-fam',       p.fam      || '');
  _setVal('f-vol-label', p.volLabel || 'Presentación');
  _setVal('f-nivel',     p.nivel    || '');
  _setVal('f-badge',     p.badge    || '');

  const marcaPreview = document.getElementById('f-marca-preview');
  if (marcaPreview) marcaPreview.textContent = p.marca ? 'slug: ' + p.marca : '';

  const chkNuevo  = document.getElementById('f-nuevo');
  const chkActivo = document.getElementById('f-activo');
  if (chkNuevo)  chkNuevo.checked  = !!p.nuevo;
  if (chkActivo) chkActivo.checked = p.activo !== false;

  const list = document.getElementById('variants-list');
  if (list) list.innerHTML = '';
  if (p.vols && p.vols.length > 0) {
    p.vols.forEach((v) => _addVariantRow(v.ml, v.precio));
  } else {
    _addVariantRow();
  }
  _clearAllErrors();
}

/**
 * Resetea todos los campos del formulario a sus valores por defecto.
 * @returns {void}
 */
function _resetForm() {
  ['f-brand','f-marca','f-name','f-id','f-badge'].forEach((id) => _setVal(id, ''));
  ['f-tipo','f-cat','f-gen','f-fam','f-nivel'].forEach((id)    => _setVal(id, ''));
  _setVal('f-vol-label', 'Presentación');

  const chkNuevo  = document.getElementById('f-nuevo');
  const chkActivo = document.getElementById('f-activo');
  if (chkNuevo)  chkNuevo.checked  = false;
  if (chkActivo) chkActivo.checked = true;

  const marcaPreview = document.getElementById('f-marca-preview');
  if (marcaPreview) marcaPreview.textContent = '';

  const list = document.getElementById('variants-list');
  if (list) list.innerHTML = '';

  _clearAllErrors();
}

/**
 * Wrapper de getElementById + value setter.
 * @param {string} id  - ID del elemento
 * @param {string} val - Valor a asignar
 * @returns {void}
 */
function _setVal(id, val) {
  const el = document.getElementById(id);
  if (el) el.value = val;
}

/* ══════════════════════════════════════
   VALIDACIÓN — Bootstrap .is-invalid
══════════════════════════════════════ */

/**
 * Valida los campos requeridos del formulario.
 * Aplica clase .is-invalid de Bootstrap a los campos vacíos.
 * @returns {boolean} true si todos los campos son válidos
 */
function _validateForm() {
  let ok = true;
  REQUIRED_FIELDS.forEach((f) => {
    const el = document.getElementById(f.id);
    if (!el || !el.value.trim()) {
      if (el) el.classList.add('is-invalid');
      ok = false;
    } else {
      if (el) el.classList.remove('is-invalid');
    }
  });
  return ok;
}

/**
 * Elimina todas las clases .is-invalid del formulario.
 * @returns {void}
 */
function _clearAllErrors() {
  REQUIRED_FIELDS.forEach((f) => {
    const el = document.getElementById(f.id);
    if (el) el.classList.remove('is-invalid');
  });
}

/* ══════════════════════════════════════
   GUARDAR PRODUCTO
══════════════════════════════════════ */

/**
 * Valida el formulario, construye el objeto producto y lo guarda
 * en el array local y en localStorage. Actualiza la tabla y cierra el drawer.
 * @returns {void}
 */
function _saveProduct() {
  if (!_validateForm()) {
    showToast('Completa los campos obligatorios', '#f9a825');
    return;
  }

  const vols = _getVariants();
  if (vols.length === 0) {
    showToast('Agrega al menos una variante con precio', '#f9a825');
    return;
  }

  const precioBase = vols[0].precio;
  const id         = document.getElementById('f-id').value.trim();

  // Verificar ID único solo al crear (no al editar)
  if (!appState.editingId) {
    const exists = appState.products.find((p) => p.id === id);
    if (exists) {
      const elId  = document.getElementById('f-id');
      const errId = document.getElementById('err-id');
      if (elId)  elId.classList.add('is-invalid');
      if (errId) errId.textContent = 'Este ID ya existe. Usa uno diferente.';
      showToast('El ID ya existe en el catálogo', '#E1222B');
      return;
    }
  }

  const prod = {
    id,
    brand:        document.getElementById('f-brand').value.trim(),
    marca:        document.getElementById('f-marca').value.trim(),
    name:         document.getElementById('f-name').value.trim(),
    tipo:         document.getElementById('f-tipo').value,
    cat:          document.getElementById('f-cat').value,
    gen:          document.getElementById('f-gen').value,
    fam:          document.getElementById('f-fam').value,
    volLabel:     document.getElementById('f-vol-label').value,
    nivel:        document.getElementById('f-nivel').value,
    badge:        document.getElementById('f-badge').value.trim(),
    nuevo:        document.getElementById('f-nuevo').checked,
    activo:       document.getElementById('f-activo').checked,
    vols,
    precio:       precioBase,
    price:        '$' + precioBase.toLocaleString('es-MX') + ' MXN',
    masVariantes: vols.length > 1,
    // Preservar creadoEn original al editar
    creadoEn: appState.editingId
      ? (appState.products.find((p) => p.id === appState.editingId) || {}).creadoEn || new Date().toISOString()
      : new Date().toISOString(),
    actualizadoEn: new Date().toISOString(),
  };

  if (appState.editingId) {
    appState.products = appState.products.map((p) =>
      p.id === appState.editingId ? prod : p
    );
    showToast('Producto actualizado correctamente', '#4caf50');
  } else {
    appState.products.unshift(prod);
    showToast('Producto creado correctamente', '#4caf50');
  }

  _saveProducts();
  appState.filtered = appState.products.slice();
  renderTable(appState.filtered);
  _updateCount();
  _closeDrawer();
}

/* ══════════════════════════════════════
   TOAST — Bootstrap Toast API
══════════════════════════════════════ */

/**
 * Muestra un toast de feedback con mensaje y color de punto.
 * Depende de Bootstrap cargado via CDN.
 * @param {string} msg   - Mensaje a mostrar
 * @param {string} color - Color CSS del punto indicador
 * @returns {void}
 */
function showToast(msg, color) {
  const toastEl = document.getElementById('adm-toast');
  const dot     = document.getElementById('toast-dot');
  const msgEl   = document.getElementById('toast-msg');
  if (!toastEl) return;
  if (msgEl) msgEl.textContent     = msg;
  if (dot)   dot.style.background  = color || '#4caf50';
  const bsToast = bootstrap.Toast.getOrCreateInstance(toastEl, { delay: 3000 });
  bsToast.show();
}

/* ══════════════════════════════════════
   SLUG — Auto-generación desde marca
══════════════════════════════════════ */

/**
 * Genera un slug URL-friendly desde un string.
 * @param {string} str - Texto de entrada
 * @returns {string} Slug en kebab-case sin acentos
 */
function _generateSlug(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

/**
 * Inicializa la auto-generación del slug de marca al escribir en #f-brand.
 * @returns {void}
 */
function _initSlugAutoGen() {
  const brandInput   = document.getElementById('f-brand');
  const marcaHidden  = document.getElementById('f-marca');
  const marcaPreview = document.getElementById('f-marca-preview');
  if (!brandInput) return;

  brandInput.addEventListener('input', () => {
    const slug = _generateSlug(brandInput.value);
    if (marcaHidden)  marcaHidden.value       = slug;
    if (marcaPreview) marcaPreview.textContent = slug ? 'slug: ' + slug : '';
  });
}
