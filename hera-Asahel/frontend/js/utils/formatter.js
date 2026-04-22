/**
 * formatter.js — HERA
 *
 * Descripción: Funciones de formateo reutilizables en todo el proyecto.
 *              Maneja precios en MXN (desde número o string), etiquetas
 *              de nivel de disponibilidad y highlight de términos buscados.
 * Exporta: formatPriceMXN, parseMXN, getNivelLabel, highlightQuery
 * Importado por: js/components/cart-drawer.js, js/components/fav-drawer.js
 */

/* ── Formateo de precios ─────────────────────────────────────── */

/**
 * Convierte un número o string de precio a formato "$X,XXX MXN".
 * Acepta tanto valores numéricos como strings con o sin símbolo de $.
 * @param {number|string} raw - Precio sin formatear
 * @returns {string} Precio en formato legible para MXN
 */
function formatPriceMXN(raw) {
  if (typeof raw === 'number') {
    return '$' + raw.toLocaleString('es-MX') + ' MXN';
  }
  if (typeof raw === 'string') {
    // Si ya tiene el símbolo y la divisa, se devuelve tal cual
    if (raw.includes('$') && raw.includes('MXN')) return raw;
    // Si tiene $ pero no MXN, se agrega la divisa
    if (raw.includes('$')) return raw + ' MXN';
    // Si es un número en string, se formatea completo
    const n = parseInt(raw.replace(/[^0-9]/g, ''));
    if (!isNaN(n)) return '$' + n.toLocaleString('es-MX') + ' MXN';
  }
  return String(raw);
}

/**
 * Extrae el valor numérico de un string de precio MXN.
 * Útil para sumar totales del carrito.
 * @param {string} str - Precio en formato "$X,XXX MXN" o similar
 * @returns {number} Valor entero sin símbolo ni divisa
 */
function parseMXN(str) {
  return parseInt(String(str).replace(/[^0-9]/g, '')) || 0;
}

/* ── Etiquetas de nivel de disponibilidad ────────────────────── */

/**
 * Devuelve la etiqueta de texto correspondiente al nivel de disponibilidad.
 * Los niveles reflejan el stock del producto: green = normal, yellow = limitado, red = exclusivo.
 * @param {string} nivel - 'green' | 'yellow' | 'red'
 * @returns {string} Etiqueta legible para el usuario
 */
function getNivelLabel(nivel) {
  const labels = {
    green:  'En existencia',
    yellow: 'Disp. limitada',
    red:    'Pieza exclusiva',
  };
  return labels[nivel] || 'En existencia';
}

/* ── Highlight de búsqueda ───────────────────────────────────── */

/**
 * Envuelve las ocurrencias del término de búsqueda en <mark> para resaltarlas.
 * Escapa caracteres especiales para evitar errores en la expresión regular.
 * @param {string} text  - Texto original donde buscar
 * @param {string} query - Término a resaltar
 * @returns {string} HTML con las ocurrencias resaltadas
 */
function highlightQuery(text, query) {
  if (!query) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`(${escaped})`, 'gi');
  return text.replace(re, '<mark class="search-highlight">$1</mark>');
}

export { formatPriceMXN, parseMXN, getNivelLabel, highlightQuery };
