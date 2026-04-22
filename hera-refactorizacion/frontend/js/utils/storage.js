/**
 * storage.js — HERA Utils
 * 
 * Descripción: Wrapper sobre localStorage con keys centralizadas
 * Exporta: getItem, setItem, removeItem, clear, getCart, setCart, getFavs, setFavs, isLoggedIn, setLoggedIn, logout
 * Importado por: cart-drawer.js, fav-drawer.js, cuenta.js, navbar.js
 */

// Keys centralizadas del proyecto
const STORAGE_KEYS = {
  CART: 'hera_cart',
  FAVS: 'hera_favs',
  LOGGED_IN: 'hera_logged_in',
  USER: 'hera_user',
  SESSION_TOKEN: 'hera_session_token'
};

/**
 * Obtiene un item del localStorage.
 * @param {string} key - La clave del item
 * @returns {any} El valor parseado o null si no existe
 */
function getItem(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error(`Error reading ${key} from localStorage:`, e);
    return null;
  }
}

/**
 * Guarda un item en localStorage.
 * @param {string} key - La clave del item
 * @param {any} value - El valor a guardar
 */
function setItem(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error writing ${key} to localStorage:`, e);
  }
}

/**
 * Elimina un item del localStorage.
 * @param {string} key - La clave del item
 */
function removeItem(key) {
  localStorage.removeItem(key);
}

/**
 * Limpia todos los items del proyecto del localStorage.
 * (No limpia todo localStorage, solo las keys del proyecto)
 */
function clear() {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
}

/**
 * Obtiene el carrito actual.
 * @returns {Array} Array de items del carrito
 */
function getCart() {
  return getItem(STORAGE_KEYS.CART) || [];
}

/**
 * Guarda el carrito.
 * @param {Array} cart - Array de items del carrito
 */
function setCart(cart) {
  setItem(STORAGE_KEYS.CART, cart);
}

/**
 * Obtiene la lista de favoritos.
 * @returns {Array} Array de items favoritos
 */
function getFavs() {
  return getItem(STORAGE_KEYS.FAVS) || [];
}

/**
 * Guarda la lista de favoritos.
 * @param {Array} favs - Array de items favoritos
 */
function setFavs(favs) {
  setItem(STORAGE_KEYS.FAVS, favs);
}

/**
 * Verifica si el usuario tiene sesión activa.
 * @returns {boolean} true si está logueado
 */
function isLoggedIn() {
  return getItem(STORAGE_KEYS.LOGGED_IN) === true || getItem(STORAGE_KEYS.LOGGED_IN) === '1';
}

/**
 * Establece el estado de sesión del usuario.
 * @param {boolean} status - Estado de sesión
 * @param {Object|null} userData - Datos opcionales del usuario
 */
function setLoggedIn(status, userData = null) {
  setItem(STORAGE_KEYS.LOGGED_IN, status);
  if (userData) {
    setItem(STORAGE_KEYS.USER, userData);
  } else if (!status) {
    removeItem(STORAGE_KEYS.USER);
    removeItem(STORAGE_KEYS.SESSION_TOKEN);
  }
}

/**
 * Cierra la sesión del usuario.
 */
function logout() {
  removeItem(STORAGE_KEYS.LOGGED_IN);
  removeItem(STORAGE_KEYS.USER);
  removeItem(STORAGE_KEYS.SESSION_TOKEN);
}

/**
 * Obtiene los datos del usuario logueado.
 * @returns {Object|null} Datos del usuario o null
 */
function getUser() {
  return getItem(STORAGE_KEYS.USER);
}

export {
  STORAGE_KEYS,
  getItem,
  setItem,
  removeItem,
  clear,
  getCart,
  setCart,
  getFavs,
  setFavs,
  isLoggedIn,
  setLoggedIn,
  logout,
  getUser
};