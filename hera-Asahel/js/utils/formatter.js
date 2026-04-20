/**
 * formatter.js — HERA
 *
 * Descripción: Funciones de formateo de datos para mostrar al usuario.
 *              Centraliza el formato de precios en MXN y cualquier
 *              transformación de presentación reutilizable en el proyecto.
 * Exporta: formatMXN, parseMXN
 * Importado por: js/components/cart-drawer.js, js/components/fav-drawer.js,
 *                js/pages/*.js
 */

/**
 * Convierte un valor numérico o string a formato de precio MXN.
 * Acepta números enteros, floats o strings con o sin símbolo de moneda.
 * @param {number|string} value - Precio a formatear
 * @returns {string} Precio formateado, ej: "$2,450 MXN"
 */
function formatMXN(value) {
  // Si es número, formatea directamente con toLocaleString
  if (typeof value === 'number') {
    return '$' + value.toLocaleString('es-MX') + ' MXN';
  }
  // Si ya tiene el símbolo, lo devuelve tal cual para no doble-formatear
  if (typeof value === 'string' && value.includes('$')) {
    return value;
  }
  // Extrae dígitos del string y formatea
  const n = parseInt(String(value).replace(/[^0-9]/g, ''));
  return isNaN(n) ? String(value) : '$' + n.toLocaleString('es-MX') + ' MXN';
}

/**
 * Extrae el valor entero de un string de precio MXN.
 * Útil para calcular totales del carrito.
 * @param {string} str - String de precio, ej: "$2,450 MXN"
 * @returns {number} Valor entero o 0 si no se pudo parsear
 */
function parseMXN(str) {
  return parseInt(String(str).replace(/[^0-9]/g, '')) || 0;
}

export { formatMXN, parseMXN };
