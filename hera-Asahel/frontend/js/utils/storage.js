/**
 * storage.js — HERA
 *
 * Descripción: Wrapper sobre localStorage para las keys del proyecto.
 *              Centraliza la lectura/escritura del carrito, favoritos
 *              y estado de sesión, previniendo errores de parsing en
 *              contextos donde localStorage no está disponible.
 * Exporta: getCart, saveCart, getFavs, saveFavs, isLoggedIn, setLoggedIn, logout
 * Importado por: js/components/cart-drawer.js, js/components/fav-drawer.js, js/components/navbar.js
 */

/* ── Keys del proyecto ───────────────────────────────────────── */
const KEYS = {
  CART:      'hera_cart',
  FAVS:      'hera_favs',
  LOGGED_IN: 'hera_logged_in',
};

/* ── Lectura segura de localStorage ─────────────────────────── */

/**
 * Lee y parsea un valor JSON de localStorage.
 * Si la clave no existe o el JSON está malformado, devuelve el fallback.
 * @param {string} key - Clave de localStorage
 * @param {*} fallback - Valor por defecto si falla la lectura
 * @returns {*} Valor parseado o fallback
 */
function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

/**
 * Serializa un valor a JSON y lo guarda en localStorage.
 * @param {string} key - Clave de localStorage
 * @param {*} value - Valor a guardar
 */
function writeJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

/* ── API pública: Carrito ────────────────────────────────────── */

/**
 * Devuelve el array de items del carrito desde localStorage.
 * @returns {Array} Array de items del carrito (puede estar vacío)
 */
function getCart() {
  return readJSON(KEYS.CART, []);
}

/**
 * Persiste el array de items del carrito en localStorage.
 * @param {Array} items - Array de items del carrito
 */
function saveCart(items) {
  writeJSON(KEYS.CART, items);
}

/* ── API pública: Favoritos ──────────────────────────────────── */

/**
 * Devuelve el array de favoritos del usuario desde localStorage.
 * @returns {Array} Array de favoritos (puede estar vacío)
 */
function getFavs() {
  return readJSON(KEYS.FAVS, []);
}

/**
 * Persiste el array de favoritos en localStorage.
 * @param {Array} favs - Array de productos favoritos
 */
function saveFavs(favs) {
  writeJSON(KEYS.FAVS, favs);
}

/* ── API pública: Sesión ─────────────────────────────────────── */

/**
 * Indica si el usuario tiene una sesión activa.
 * Se basa en el flag hera_logged_in = '1' guardado al hacer login.
 * @returns {boolean} true si está autenticado
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
 * Elimina el flag de sesión, efectuando el logout del usuario.
 */
function logout() {
  localStorage.removeItem(KEYS.LOGGED_IN);
}

export { getCart, saveCart, getFavs, saveFavs, isLoggedIn, setLoggedIn, logout };
