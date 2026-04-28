/**
 * storage_v1.js — HERA
 *
 * Descripción: Wrapper sobre localStorage para todas las claves del proyecto.
 *              Centraliza los nombres de clave, maneja errores de parsing
 *              y expone la API completa: carrito, favoritos, sesión y
 *              gestión de usuarios (prototipo — reemplazar con backend en Etapa 2).
 * Exporta:     STORAGE_KEYS,
 *              getItem, setItem, removeItem, clear,
 *              getCart, setCart, getFavs, setFavs,
 *              isLoggedIn, setLoggedIn, logout, clearLogin,
 *              getCurrentUser, setCurrentUser,
 *              getUsersList, saveUsersList
 * Importado por: js/components/navbar.js, js/components/cart-drawer.js,
 *                js/components/fav-drawer.js, js/pages/cuenta.js
 */
 
/* ── Claves de localStorage del proyecto ─────────────────────── */
const STORAGE_KEYS = {
  cart:         'hera_cart',
  favs:         'hera_favs',
  loggedIn:     'hera_logged_in',
  currentUser:  'hera_current_user',
  usersList:    'hera_users_list',
};
 
/* ══════════════════════════════════════
   API GENÉRICA
══════════════════════════════════════ */
 
/**
 * Lee y parsea un valor JSON de localStorage.
 * Devuelve null si la clave no existe o el JSON está roto.
 * @param {string} key - Clave de localStorage
 * @returns {*} Valor parseado o null
 */
function getItem(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}
 
/**
 * Guarda un valor como JSON en localStorage.
 * @param {string} key   - Clave de localStorage
 * @param {*}      value - Valor a serializar y guardar
 * @returns {void}
 */
function setItem(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) { /* silencioso — storage lleno o modo privado */ }
}
 
/**
 * Elimina una clave de localStorage.
 * @param {string} key - Clave a eliminar
 * @returns {void}
 */
function removeItem(key) {
  localStorage.removeItem(key);
}
 
/**
 * Elimina todas las claves del proyecto de localStorage.
 * @returns {void}
 */
function clear() {
  Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
}
 
/* ══════════════════════════════════════
   CARRITO
══════════════════════════════════════ */
 
/**
 * Devuelve el array de items del carrito desde localStorage.
 * @returns {Array<Object>} Lista de items del carrito
 */
function getCart() {
  return getItem(STORAGE_KEYS.cart) || [];
}
 
/**
 * Persiste el array de items del carrito en localStorage.
 * @param {Array<Object>} items - Lista de items del carrito
 * @returns {void}
 */
function setCart(items) {
  setItem(STORAGE_KEYS.cart, items);
}
 
/* ══════════════════════════════════════
   FAVORITOS
══════════════════════════════════════ */
 
/**
 * Devuelve el array de productos favoritos desde localStorage.
 * @returns {Array<Object>} Lista de productos favoritos
 */
function getFavs() {
  return getItem(STORAGE_KEYS.favs) || [];
}
 
/**
 * Persiste el array de favoritos en localStorage.
 * @param {Array<Object>} items - Lista de favoritos
 * @returns {void}
 */
function setFavs(items) {
  setItem(STORAGE_KEYS.favs, items);
}
 
/* ══════════════════════════════════════
   SESIÓN
══════════════════════════════════════ */
 
/**
 * Indica si el usuario tiene sesión activa.
 * @returns {boolean} true si hera_logged_in === 'true'
 */
function isLoggedIn() {
  return localStorage.getItem(STORAGE_KEYS.loggedIn) === 'true';
}
 
/**
 * Actualiza el estado de sesión en localStorage.
 * @param {boolean} status - true para marcar como logueado, false para lo contrario
 * @returns {void}
 */
function setLoggedIn(status) {
  localStorage.setItem(STORAGE_KEYS.loggedIn, status ? 'true' : 'false');
}
 
/**
 * Cierra la sesión: elimina el flag de login y los datos del usuario actual.
 * ── TEMPORAL — en Etapa 2 reemplazar por llamada a POST /api/auth/logout
 * @returns {void}
 */
function logout() {
  localStorage.removeItem(STORAGE_KEYS.loggedIn);
  localStorage.removeItem(STORAGE_KEYS.currentUser);
}
 
/**
 * Alias de logout() — mantenido para compatibilidad con navbar_v1.js.
 * @returns {void}
 */
function clearLogin() {
  logout();
}
 
/* ══════════════════════════════════════
   USUARIO ACTUAL
   ── TEMPORAL — prototipo sin backend ──
   Almacena las credenciales del usuario activo en localStorage
   para que el navbar y otras páginas puedan mostrar su nombre y rol.
   En Etapa 2: reemplazar por sesión server-side / JWT.
══════════════════════════════════════ */
 
/**
 * Devuelve el objeto del usuario con sesión activa.
 * Estructura: { id, name, email, role, lastLogin, createdAt? }
 * @returns {Object|null} Usuario actual o null si no hay sesión
 */
function getCurrentUser() {
  return getItem(STORAGE_KEYS.currentUser);
}
 
/**
 * Persiste el objeto del usuario con sesión activa.
 * Pasar null para limpiar la sesión.
 * @param {Object|null} user - Objeto de usuario o null
 * @returns {void}
 */
function setCurrentUser(user) {
  if (user === null) {
    localStorage.removeItem(STORAGE_KEYS.currentUser);
  } else {
    setItem(STORAGE_KEYS.currentUser, user);
  }
}
 
/* ══════════════════════════════════════
   LISTA DE USUARIOS REGISTRADOS
   ── TEMPORAL — prototipo sin backend ──
   Simula una base de datos de usuarios en localStorage.
   En Etapa 2: reemplazar por llamadas a la API REST de Java.
══════════════════════════════════════ */
 
/**
 * Devuelve la lista completa de usuarios registrados.
 * @returns {Array<Object>} Lista de usuarios
 */
function getUsersList() {
  return getItem(STORAGE_KEYS.usersList) || [];
}
 
/**
 * Persiste la lista completa de usuarios registrados.
 * @param {Array<Object>} users - Lista de usuarios
 * @returns {void}
 */
function saveUsersList(users) {
  setItem(STORAGE_KEYS.usersList, users);
}
 
export {
  STORAGE_KEYS,
  getItem, setItem, removeItem, clear,
  getCart, setCart,
  getFavs, setFavs,
  isLoggedIn, setLoggedIn, logout, clearLogin,
  getCurrentUser, setCurrentUser,
  getUsersList, saveUsersList
};