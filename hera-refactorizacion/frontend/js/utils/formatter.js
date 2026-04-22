/**
 * formatter.js — HERA Utils
 * 
 * Descripción: Funciones de formateo de precios, fechas y textos
 * Exporta: formatMXN, formatDate, formatCompactNumber, truncateText, slugify
 * Importado por: cart-drawer.js, fav-drawer.js, cuenta.js
 */

/**
 * Formatea un número a moneda mexicana (MXN).
 * @param {number} amount - Cantidad a formatear
 * @param {boolean} includeSymbol - Si incluir el símbolo $
 * @returns {string} Precio formateado ej: "$1,234 MXN"
 */
function formatMXN(amount, includeSymbol = true) {
  const formatter = new Intl.NumberFormat('es-MX', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
  
  const formatted = formatter.format(amount);
  return includeSymbol ? `$${formatted} MXN` : `${formatted} MXN`;
}

/**
 * Parsea un string de precio MXN a número.
 * @param {string} priceStr - String de precio ej: "$1,210 MXN"
 * @returns {number} Valor numérico
 */
function parseMXN(priceStr) {
  if (typeof priceStr === 'number') return priceStr;
  return parseInt(String(priceStr).replace(/[^0-9]/g, '')) || 0;
}

/**
 * Formatea una fecha a formato local.
 * @param {Date|string} date - Fecha a formatear
 * @param {Object} options - Opciones de Intl.DateTimeFormat
 * @returns {string} Fecha formateada
 */
function formatDate(date, options = {}) {
  const d = date instanceof Date ? date : new Date(date);
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  
  return d.toLocaleDateString('es-MX', { ...defaultOptions, ...options });
}

/**
 * Formatea un número a formato compacto (ej: 1.5k).
 * @param {number} num - Número a formatear
 * @returns {string} Número formateado
 */
function formatCompactNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
}

/**
 * Trunca un texto a una longitud máxima.
 * @param {string} text - Texto a truncar
 * @param {number} maxLength - Longitud máxima
 * @param {string} suffix - Sufijo para texto truncado
 * @returns {string} Texto truncado
 */
function truncateText(text, maxLength = 50, suffix = '...') {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - suffix.length) + suffix;
}

/**
 * Convierte un string a slug URL-friendly.
 * @param {string} text - Texto a convertir
 * @returns {string} Slug generado
 */
function slugify(text) {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s-]/g, '')    // Remove special chars
    .replace(/\s+/g, '-')             // Replace spaces with hyphens
    .replace(/-+/g, '-');             // Remove multiple hyphens
}

/**
 * Capitaliza la primera letra de cada palabra.
 * @param {string} text - Texto a capitalizar
 * @returns {string} Texto capitalizado
 */
function capitalizeWords(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export {
  formatMXN,
  parseMXN,
  formatDate,
  formatCompactNumber,
  truncateText,
  slugify,
  capitalizeWords
};