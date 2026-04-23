/**
 * storage.js — HERA
 *
 * Descripción: Wrapper sobre localStorage para las claves del proyecto.
 *              Centraliza los nombres de clave y maneja errores de parsing
 *              para evitar crashes si los datos están corruptos.
 * Exporta:     getCart, setCart, getFavs, setFavs, isLoggedIn, setLoggedIn, clearLogin
 * Importado por: js/components/cart-drawer.js, js/components/fav-drawer.js,
 *                js/components/navbar.js
 */

/* ── Claves de localStorage del proyecto ─────────────────────── */
const STORAGE_KEYS = {
  cart:      'hera_cart',
  favs:      'hera_favs',
  loggedIn:  'hera_logged_in',
};

/**
 * Lee y parsea un valor JSON de localStorage.
 * Devuelve el fallback si la clave no existe o el JSON está roto.
 * @param {string} key      - Clave de localStorage
 * @param {*}      fallback - Valor a devolver si la clave no existe o falla
 * @returns {*} Valor parseado o fallback
 */
function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    // JSON inválido — devolver fallback para no romper la app
    return fallback;
  }
}

/**
 * Guarda un valor como JSON en localStorage.
 * @param {string} key   - Clave de localStorage
 * @param {*}      value - Valor a serializar y guardar
 * @returns {void}
 */
function writeJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

/* ── API pública ─────────────────────────────────────────────── */

/**
 * Devuelve el array de items del carrito desde localStorage.
 * @returns {Array<Object>} Lista de items del carrito
 */
function getCart() {
  return readJSON(STORAGE_KEYS.cart, []);
}

/**
 * Persiste el array de items del carrito en localStorage.
 * @param {Array<Object>} items - Lista de items del carrito
 * @returns {void}
 */
function setCart(items) {
  writeJSON(STORAGE_KEYS.cart, items);
}

/**
 * Devuelve el array de productos favoritos desde localStorage.
 * @returns {Array<Object>} Lista de productos favoritos
 */
function getFavs() {
  return readJSON(STORAGE_KEYS.favs, []);
}

/**
 * Persiste el array de favoritos en localStorage.
 * @param {Array<Object>} items - Lista de favoritos
 * @returns {void}
 */
function setFavs(items) {
  writeJSON(STORAGE_KEYS.favs, items);
}

/**
 * Indica si el usuario tiene sesión activa.
 * @returns {boolean} true si hera_logged_in === '1'
 */
function isLoggedIn() {
  return localStorage.getItem(STORAGE_KEYS.loggedIn) === '1';
}

/**
 * Marca al usuario como logueado en localStorage.
 * @returns {void}
 */
function setLoggedIn() {
  localStorage.setItem(STORAGE_KEYS.loggedIn, '1');
}

/**
 * Elimina la sesión del usuario de localStorage.
 * @returns {void}
 */
function clearLogin() {
  localStorage.removeItem(STORAGE_KEYS.loggedIn);
}

export { getCart, setCart, getFavs, setFavs, isLoggedIn, setLoggedIn, clearLogin };
