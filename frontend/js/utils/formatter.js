/**
 * formatter.js — HERA
 *
 * Descripción: Funciones de formateo reutilizables para el proyecto.
 *              Maneja precios en MXN (parse y formato), fechas y
 *              normalización de strings de precio de múltiples formatos.
 * Exporta:     formatMXN, parseMXN, normalizePriceMXN
 * Importado por: js/components/cart-drawer.js, js/components/fav-drawer.js
 */

/**
 * Formatea un número como precio en pesos mexicanos.
 * Ejemplo: 1210 → '$1,210 MXN'
 * @param {number} value - Valor numérico a formatear
 * @returns {string} Precio formateado con símbolo y sufijo MXN
 */
function formatMXN(value) {
  return '$' + Number(value).toLocaleString('es-MX') + ' MXN';
}

/**
 * Extrae el valor numérico de un string de precio en cualquier formato.
 * Soporta: 1210, '1210', '$1,210 MXN', '$1,210', '1,210 MXN'
 * @param {string|number} str - String o número de precio
 * @returns {number} Valor numérico extraído, 0 si no se puede parsear
 */
function parseMXN(str) {
  return parseInt(String(str).replace(/[^0-9]/g, '')) || 0;
}

/**
 * Normaliza un precio en cualquier formato a string con formato '$N,NNN MXN'.
 * Útil para unificar precios que llegan del backend como número o como string.
 * Ejemplos:
 *   2100          → '$2,100 MXN'
 *   '2100'        → '$2,100 MXN'
 *   '$2,100 MXN'  → '$2,100 MXN'  (sin cambios)
 * @param {string|number} price - Precio en cualquier formato
 * @returns {string} Precio normalizado como '$N,NNN MXN'
 */
function normalizePriceMXN(price) {
  // Si ya viene formateado con signo de pesos, devolverlo tal cual
  if (typeof price === 'string' && price.includes('$')) return price;

  // Convertir número o string numérico a formato display
  const n = parseMXN(price);
  return !isNaN(n) ? formatMXN(n) : String(price);
}

export { formatMXN, parseMXN, normalizePriceMXN };
