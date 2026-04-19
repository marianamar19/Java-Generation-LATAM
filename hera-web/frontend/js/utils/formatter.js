/**
 * formatter.js — HERA
 *
 * Descripción: Funciones de formateo reutilizables: precios MXN, strings de
 *   búsqueda, IDs de carrito y etiquetas de volumen. Centraliza el formato
 *   para que cualquier cambio (símbolo de moneda, locale, etc.) se aplique
 *   en un solo lugar.
 *
 * Exporta: formatPriceMXN, normalizePriceInput, buildCartId,
 *          formatVolLabel, highlightQuery
 * Importado por: js/components/cart-drawer.js, js/components/fav-drawer.js,
 *                js/pages/catalogo.js
 */

/**
 * Formatea un número como precio en MXN.
 * @param {number} amount - Cantidad numérica
 * @returns {string} Ej: "$1,210 MXN"
 */
function formatPriceMXN(amount) {
  return '$' + Number(amount).toLocaleString('es-MX') + ' MXN';
}

/**
 * Normaliza una entrada de precio que puede venir como número, string numérico
 * o string formateado ("$1,210 MXN") y siempre devuelve el string formateado.
 * Usado al cargar ítems del carrito desde localStorage donde el formato puede variar.
 * @param {number|string} raw - Precio en cualquier formato
 * @returns {string} Precio formateado: "$1,210 MXN"
 */
function normalizePriceInput(raw) {
  if (typeof raw === 'number') return formatPriceMXN(raw);
  if (typeof raw === 'string') {
    if (raw.includes('$')) return raw; // ya está formateado
    const n = parseInt(raw.replace(/[^0-9]/g, ''));
    if (!isNaN(n)) return formatPriceMXN(n);
  }
  return raw || '$0 MXN';
}

/**
 * Extrae el valor numérico de un string de precio formateado.
 * Usado para calcular totales del carrito.
 * @param {string} str - Precio formateado: "$1,210 MXN"
 * @returns {number} Valor numérico: 1210
 */
function parsePriceMXN(str) {
  return parseInt(String(str).replace(/[^0-9]/g, '')) || 0;
}

/**
 * Genera el cartId canónico de un ítem de carrito a partir del nombre del producto.
 * Formato: "cart-nombre-del-producto"
 * @param {string} name - Nombre del producto
 * @param {string|number} [ml] - Volumen o talla seleccionada (opcional)
 * @returns {string} ID único del ítem en el carrito
 */
function buildCartId(name, ml) {
  const base = 'cart-' + name.replace(/\s/g, '-').toLowerCase().replace(/[^a-z0-9-]/g, '');
  return ml ? base + '-' + String(ml) : base;
}

/**
 * Formatea la etiqueta de volumen para mostrar en el carrito y favoritos.
 * Para perfumes con ml numérico agrega la unidad: "50 ml".
 * Para joyería y otros usa el valor tal cual: "Plata .925".
 * @param {string|number} ml - Valor del volumen/talla
 * @param {string} tipo - Tipo de producto: 'perfumes' | 'joyeria'
 * @returns {string} Etiqueta formateada
 */
function formatVolLabel(ml, tipo) {
  if (!ml) return '';
  if (tipo === 'perfumes' && /^\d+$/.test(String(ml))) return ml + ' ml';
  return String(ml);
}

/**
 * Envuelve las coincidencias de una query en <mark class="search-highlight">.
 * Usado por renderSearchResults para resaltar el texto buscado.
 * @param {string} text - Texto original
 * @param {string} query - Término buscado
 * @returns {string} HTML con las coincidencias marcadas
 */
function highlightQuery(text, query) {
  if (!query) return text;
  const re = new RegExp('(' + query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
  return text.replace(re, '<mark class="search-highlight">$1</mark>');
}

export {
  formatPriceMXN,
  normalizePriceInput,
  parsePriceMXN,
  buildCartId,
  formatVolLabel,
  highlightQuery,
};
