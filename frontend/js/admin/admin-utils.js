/**
 * admin-utils.js — HERA Admin
 *
 * Descripción: Utilidades compartidas por todas las páginas del
 *              panel de administración. Centraliza el auth-check,
 *              el logout y el helper de estado vacío para evitar
 *              duplicación entre páginas del admin.
 *
 * Exporta:     guardAdmin, initLogout, buildEmptyState
 * Importado por: js/admin/dashboard.js, js/admin/productos.js
 *                y todos los demás scripts de página del admin.
 */
 
/* Ruta absoluta a cuenta — funciona con npx serve desde /frontend */
const CUENTA_URL = '/pages/cuenta.html';
 
/* ══════════════════════════════════════
   GUARD — Verificar sesión admin
══════════════════════════════════════ */
 
/**
 * Verifica que exista una sesión admin válida en localStorage.
 * Si no existe o está corrupta, redirige a cuenta.html una sola vez.
 * Usa window.location.replace para evitar que el módulo se re-evalúe
 * y cause un loop al volver a ejecutar el guard.
 * @returns {void}
 */
function guardAdmin() {
  try {
    const auth = JSON.parse(localStorage.getItem('hera_admin_auth') || 'null');
    if (!auth || !auth.loggedIn) {
      window.location.replace(CUENTA_URL);
    }
  } catch (e) {
    window.location.replace(CUENTA_URL);
  }
}
 
/* ══════════════════════════════════════
   LOGOUT
══════════════════════════════════════ */
 
/**
 * Inicializa el botón de cerrar sesión del sidebar.
 * Elimina hera_admin_auth de localStorage y redirige a cuenta.html.
 * Usa replace() para limpiar el historial y evitar que el back-button
 * vuelva al panel sin sesión activa.
 * @returns {void}
 */
function initLogout() {
  const btn = document.getElementById('btn-logout');
  if (!btn) return;
  btn.addEventListener('click', () => {
    try {
      /* Eliminar TODAS las keys de sesión — si quedan hera_logged_in
         o hera_current_user, cuenta.js detecta sesión activa y redirige
         de vuelta al dashboard creando el loop infinito */
      localStorage.removeItem('hera_admin_auth');
      localStorage.removeItem('hera_logged_in');
      localStorage.removeItem('hera_current_user');
      localStorage.removeItem('hera_user');
    } catch (e) { /* silencioso */ }
    window.location.replace(CUENTA_URL);
  });
}
 
/* ══════════════════════════════════════
   EMPTY STATE
══════════════════════════════════════ */
 
/**
 * Construye el HTML del estado vacío reutilizable en tablas y listas.
 * @param {string} texto  - Mensaje descriptivo a mostrar
 * @param {'box'|'doc'} [icon='doc'] - Ícono: 'box' para productos, 'doc' para órdenes
 * @returns {string} HTML del estado vacío
 */
function buildEmptyState(texto, icon) {
  const icons = {
    doc: '<svg class="adm-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></svg>',
    box: '<svg class="adm-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>',
  };
  const svg = icons[icon] || icons.doc;
  return (
    `<div class="adm-empty">` +
      svg +
      `<span class="adm-empty-text">${texto}</span>` +
    `</div>`
  );
}
 
export { guardAdmin, initLogout, buildEmptyState };