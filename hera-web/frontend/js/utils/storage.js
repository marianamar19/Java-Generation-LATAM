/**
 * storage.js — HERA
 *
 * Descripción: Wrapper sobre localStorage para todas las keys del proyecto.
 *   Centraliza la serialización/deserialización y el manejo de errores,
 *   evitando que un JSON corrupto rompa silenciosamente cualquier página.
 *
 * Exporta: getCart, saveCart, getFavs, saveFavs, isLoggedIn, setLoggedIn, logout
 * Importado por: js/components/cart-drawer.js, js/components/fav-drawer.js,
 *                js/components/navbar.js, js/pages/catalogo.js
 */

// ── Keys canónicas del proyecto ──────────────────────────────
const KEYS = {
  CART:      'hera_cart',
  FAVS:      'hera_favs',
  LOGGED_IN: 'hera_logged_in',
};

/**
 * Lee y parsea un valor de localStorage de forma segura.
 * @param {string} key - Clave de localStorage
 * @param {*} fallback - Valor a devolver si la clave no existe o el JSON está corrupto
 * @returns {*} El valor parseado o el fallback
 */
function readStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

/**
 * Serializa y guarda un valor en localStorage de forma segura.
 * @param {string} key - Clave de localStorage
 * @param {*} value - Valor a guardar (será serializado con JSON.stringify)
 * @returns {boolean} true si se guardó correctamente, false si falló
 */
function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

// ── Cart ─────────────────────────────────────────────────────

/**
 * Devuelve el array de ítems del carrito guardado en localStorage.
 * @returns {Array} Array de ítems del carrito (vacío si no existe o está corrupto)
 */
function getCart() {
  return readStorage(KEYS.CART, []);
}

/**
 * Persiste el array de ítems del carrito en localStorage.
 * @param {Array} items - Array de ítems del carrito
 * @returns {boolean} true si se guardó correctamente
 */
function saveCart(items) {
  return writeStorage(KEYS.CART, items);
}

// ── Favoritos ─────────────────────────────────────────────────

/**
 * Devuelve el array de productos favoritos guardado en localStorage.
 * @returns {Array} Array de favoritos (vacío si no existe o está corrupto)
 */
function getFavs() {
  return readStorage(KEYS.FAVS, []);
}

/**
 * Persiste el array de favoritos en localStorage.
 * @param {Array} favs - Array de favoritos
 * @returns {boolean} true si se guardó correctamente
 */
function saveFavs(favs) {
  return writeStorage(KEYS.FAVS, favs);
}

// ── Sesión ────────────────────────────────────────────────────

/**
 * Indica si el usuario tiene sesión activa.
 * La sesión es simulada con localStorage hasta integrar el backend.
 * @returns {boolean}
 */
function isLoggedIn() {
  return localStorage.getItem(KEYS.LOGGED_IN) === '1';
}

/**
 * Marca la sesión como activa.
 * ── TEMPORAL — reemplazar por token JWT del backend cuando esté disponible ──
 */
function setLoggedIn() {
  localStorage.setItem(KEYS.LOGGED_IN, '1');
}

/**
 * Cierra sesión eliminando la clave de sesión de localStorage.
 * ── TEMPORAL — reemplazar por invalidación de token en el backend ──
 */
function logout() {
  localStorage.removeItem(KEYS.LOGGED_IN);
}

export { getCart, saveCart, getFavs, saveFavs, isLoggedIn, setLoggedIn, logout, KEYS };
