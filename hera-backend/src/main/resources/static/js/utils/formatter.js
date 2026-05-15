// js/utils/formatter.js
/**
 * formatter.js — HERA
 * Con soporte de zona horaria (México)
 */

/**
 * Formatea un número como precio en pesos mexicanos.
 * Si ya viene formateado, lo devuelve sin cambios.
 * @param {number|string} value - Valor numérico o string de precio
 * @returns {string} Precio formateado con símbolo y sufijo MXN
 */
function formatMXN(value) {
  // Si es string y ya tiene formato, devolverlo tal cual
  if (typeof value === 'string' && (value.includes('$') || value.includes('MXN'))) {
    return value;
  }
  
  const num = typeof value === 'number' ? value : parseMXN(value);
  return '$' + num.toLocaleString('es-MX') + ' MXN';
}

/**
 * Extrae el valor numérico de un string de precio en cualquier formato.
 * @param {string|number} str - String o número de precio
 * @returns {number} Valor numérico extraído, 0 si no se puede parsear
 */
function parseMXN(str) {
  return parseInt(String(str).replace(/[^0-9]/g, '')) || 0;
}

/**
 * Normaliza un precio en cualquier formato a string con formato '$N,NNN MXN'.
 * @param {string|number} price - Precio en cualquier formato
 * @returns {string} Precio normalizado
 */
function normalizePriceMXN(price) {
  if (typeof price === 'string' && price.includes('$')) return price;
  const n = parseMXN(price);
  return !isNaN(n) ? formatMXN(n) : String(price);
}

/**
 * Formatea una fecha ISO a formato México (dd/mm/yyyy)
 * @param {string} isoString - Fecha ISO del backend
 * @returns {string} Fecha formateada
 */
function formatDateMX(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleDateString('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

/**
 * Formatea una fecha ISO a formato legible (dd de mes, yyyy)
 * @param {string} isoString - Fecha ISO del backend
 * @returns {string} Fecha formateada
 */
function formatDateLong(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

export { formatMXN, parseMXN, normalizePriceMXN, formatDateMX, formatDateLong };