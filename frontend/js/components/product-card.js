/**
 * product-card_v1.js — HERA
 *
 * Descripción: Funciones de render para los dos tipos de tarjeta de producto.
 *              Genera el HTML de cada card a partir de un objeto de producto
 *              del catálogo. El estilo vive en product-card.css.
 *
 *   renderCard(p)           → .product-card  (carrusel de bestsellers, fondo oscuro)
 *   renderCardEditorial(p)  → .ed-item        (grid de novedades editoriales)
 *
 * Exporta:     renderCard, renderCardEditorial
 * Importado por: js/pages/index.js
 *
 * ── Cuando llegue el backend, las funciones no cambian.
 *    Solo cambia la fuente de datos en index.js (fetch vs array).
 */
 
/* SVG reutilizables ─────────────────────────────────────────── */
const SVG_PLACEHOLDER = `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
  <rect x="3" y="3" width="18" height="18" rx="2"/>
  <circle cx="8.5" cy="8.5" r="1.5"/>
  <path d="m21 15-5-5L5 21"/>
</svg>`;
 
const SVG_FAV = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
</svg>`;
 
const SVG_ARROW = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <path d="m9 18 6-6-6-6"/>
</svg>`;
 
/* Helpers ───────────────────────────────────────────────────── */
 
/**
 * Devuelve el primer volumen del producto formateado como string legible.
 * @param {Object} p - Producto del catálogo
 * @returns {string} Ej: "50 ml" | "Talla 6" | "40 cm"
 */
function _defaultVol(p) {
  if (!p.vols || p.vols.length === 0) return '';
  const v = p.vols[0];
  return p.volLabel ? `${p.volLabel} ${v.ml}` : `${v.ml} ml`;
}
 
/**
 * Genera el HTML del badge si el producto tiene uno.
 * @param {string} badge - Texto del badge
 * @param {string} modifier - Clase modificadora CSS ('' | '--dark')
 * @returns {string} HTML del badge o string vacío
 */
function _badge(badge, modifier = '') {
  if (!badge) return '';
  return `<div class="product-badge${modifier ? ' product-badge' + modifier : ''}">${badge}</div>`;
}
 
/**
 * Genera el HTML del indicador de nivel de existencia.
 * @param {string} nivel - 'green' | 'yellow' | 'red'
 * @param {string} prefix - Prefijo de clase ('prod' | 'ed')
 * @returns {string} HTML del nivel
 */
function _nivel(nivel, prefix) {
  const labels = { green: 'En existencia', yellow: 'Disp. limitada', red: 'Sin existencia' };
  return `<div class="${prefix}-nivel ${nivel}">
    <span class="${prefix}-nivel-dot"></span>${labels[nivel] || ''}
  </div>`;
}
 
/* ══════════════════════════════════════
   RENDER: .product-card
   Carrusel de bestsellers — fondo oscuro
══════════════════════════════════════ */
 
/**
 * Genera el HTML de una tarjeta .product-card para el carrusel de bestsellers.
 * @param {Object} p - Producto del catálogo (catalog_v1.js)
 * @returns {string} HTML de la tarjeta
 */
export function renderCard(p) {
  const vol       = _defaultVol(p);
  const badgeHtml = _badge(p.badge);
  const nivelHtml = _nivel(p.nivel, 'prod');
  const volLabel  = p.volLabel || 'Presentación';
  let detalle = vol;
  if (p.tipo === 'joyeria' && p.vols && p.vols[0]) {
    detalle = vol + ' · ' + p.vols[0].ml;
  }
 
  return `
    <div class="product-card">
      ${badgeHtml}
      <div class="product-img-wrap">
        <div class="img-placeholder">
          ${SVG_PLACEHOLDER}
          <span>Imagen del producto</span>
        </div>
        <div class="product-overlay">
          <button class="product-overlay-btn"
            data-action="add-to-cart"
            data-id="${p.id}"
            data-brand="${p.brand}"
            data-name="${p.name}"
            data-price="${p.price}"
            data-vol="${vol}"
            data-nivel="${p.nivel}">Agregar al carrito</button>
        </div>
        <button class="fav-btn"
          data-product-id="${p.id}"
          data-tipo="${p.tipo}"
          data-cat="${p.cat}"
          data-gen="${p.gen}"
          data-nivel="${p.nivel}"
          data-vol="${vol}"
          data-vol-label="${volLabel}"
          data-brand="${p.brand}"
          data-name="${p.name}"
          data-price="${p.price}"
          aria-label="Añadir a favoritos">
          ${SVG_FAV}
        </button>
      </div>
      <div class="product-info">
        <div class="product-brand">${p.brand}</div>
        <div class="product-name">${p.name}</div>
        <div class="product-detail">${detalle}</div>
        <div class="product-price">${p.price}</div>
        ${nivelHtml}
      </div>
    </div>
  `.trim();
}
 
/* ══════════════════════════════════════
   RENDER: .ed-item
   Grid editorial de novedades
══════════════════════════════════════ */
 
/**
 * Genera el HTML de una tarjeta .ed-item para el grid editorial de novedades.
 * @param {Object} p - Producto del catálogo (catalog_v1.js)
 * @returns {string} HTML de la tarjeta
 */
export function renderCardEditorial(p) {
  const volLabel  = p.volLabel || 'Presentación';
  const vols      = p.vols || [];
  const nivelHtml = _nivel(p.nivel, 'ed');
  const imgLabel  = p.tipo === 'joyeria' ? 'Imagen de la pieza' : 'Imagen del perfume';
 
  // Badge — rojo para 'Nuevo', oscuro para el resto
  let badgeHtml = '';
  if (p.badge) {
    const mod = p.badge === 'Nuevo' ? '--red' : '--dark';
    badgeHtml = `<span class="ed-item-badge ed-item-badge${mod}">${p.badge}</span>`;
  }
 
  // Botones de volumen
  const volBtns = vols.map((v, i) => `
    <button class="ed-vol-btn${i === 0 ? ' sel' : ''}"
      data-ml="${v.ml}"
      data-precio="${v.precio}">${v.ml}${!p.volLabel ? ' ml' : ''}</button>
  `).join('');
 
  return `
    <div class="ed-item reveal">
      <div class="ed-item-header">
        ${badgeHtml}
        <button class="fav-btn"
          data-product-id="${p.id}"
          data-tipo="${p.tipo}"
          data-cat="${p.cat}"
          data-gen="${p.gen}"
          data-nivel="${p.nivel}"
          data-vol="${vols[0] ? vols[0].ml : ''}"
          data-vol-label="${volLabel}"
          data-brand="${p.brand}"
          data-name="${p.name}"
          data-price="${p.price}"
          aria-label="Añadir a favoritos">
          ${SVG_FAV}
        </button>
      </div>
      <div class="ed-img-zone">
        <div class="ed-img-placeholder">
          ${SVG_PLACEHOLDER}
          <span>${imgLabel}</span>
        </div>
        <div class="ed-cart-overlay">
          <button class="ed-cart-btn"
            data-action="add-to-cart"
            data-id="${p.id}"
            data-brand="${p.brand}"
            data-name="${p.name}"
            data-price="${p.price}"
            data-vol-sel="true"
            data-nivel="${p.nivel}">Agregar al carrito</button>
        </div>
      </div>
      <div class="ed-brand">${p.brand}</div>
      <div class="ed-name">${p.name}</div>
      <div class="ed-vol-label">${volLabel}</div>
      <div class="ed-vols">${volBtns}</div>
      <div class="ed-footer">
        <div class="ed-price">${p.price}</div>
        <a href="producto.html?id=${p.id}" class="ed-cta">Ver producto ${SVG_ARROW}</a>
      </div>
      ${nivelHtml}
    </div>
  `.trim();
}