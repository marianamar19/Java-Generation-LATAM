/**
 * storage.js — HERA
 *
 * Descripción: Wrapper sobre localStorage para las keys del proyecto.
 *              Centraliza el acceso a hera_cart, hera_favs y hera_logged_in,
 *              evitando errores de typo en claves y encapsulando el manejo
 *              de errores de parsing JSON en un único lugar.
 * Exporta: getCart, saveCart, getFavs, saveFavs, isLoggedIn, setLoggedIn, logout
 * Importado por: js/components/cart-drawer.js, js/components/fav-drawer.js,
 *                js/components/navbar.js
 */

/* ── Claves de localStorage — centralizadas para evitar typos ── */
const KEYS = {
  CART:      'hera_cart',
  FAVS:      'hera_favs',
  LOGGED_IN: 'hera_logged_in'
};

/**
 * Lee y parsea un valor JSON de localStorage de forma segura.
 * @param {string} key - Clave de localStorage
 * @param {*} fallback - Valor por defecto si la clave no existe o hay error
 * @returns {*} El valor parseado o el fallback
 */
function safeGet(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}

/**
 * Serializa y guarda un valor en localStorage de forma segura.
 * @param {string} key - Clave de localStorage
 * @param {*} value - Valor a guardar (será serializado a JSON)
 */
function safeSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('[HERA storage] No se pudo guardar en localStorage:', key, e);
  }
}

/**
 * Obtiene el array de ítems del carrito desde localStorage.
 * @returns {Array} Array de objetos de carrito, vacío si no hay datos
 */
function getCart() {
  return safeGet(KEYS.CART, []);
}

/**
 * Persiste el array de ítems del carrito en localStorage.
 * @param {Array} items - Array de objetos de carrito
 */
function saveCart(items) {
  safeSet(KEYS.CART, items);
}

/**
 * Obtiene el array de productos favoritos desde localStorage.
 * @returns {Array} Array de objetos de favoritos, vacío si no hay datos
 */
function getFavs() {
  return safeGet(KEYS.FAVS, []);
}

/**
 * Persiste el array de favoritos en localStorage.
 * @param {Array} items - Array de objetos de favoritos
 */
function saveFavs(items) {
  safeSet(KEYS.FAVS, items);
}

/**
 * Comprueba si el usuario tiene sesión activa.
 * @returns {boolean} true si hay sesión, false en caso contrario
 */
function isLoggedIn() {
  return localStorage.getItem(KEYS.LOGGED_IN) === '1';
}

/**
 * Marca al usuario como autenticado en localStorage.
 */
function setLoggedIn() {
  localStorage.setItem(KEYS.LOGGED_IN, '1');
}

/**
 * Elimina la sesión del usuario de localStorage.
 */
function logout() {
  localStorage.removeItem(KEYS.LOGGED_IN);
}

export { getCart, saveCart, getFavs, saveFavs, isLoggedIn, setLoggedIn, logout };
