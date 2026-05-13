/**
 * admin-utils.js — HERA Admin (VERSIÓN CORREGIDA)
 * Ahora usa sessionStorage (mismo que api.js)
 */

import { isAuthenticated, getCurrentUser, logout } from '../utils/api.js';

/* Ruta absoluta a cuenta */
const CUENTA_URL = '/pages/cuenta.html';

/* ══════════════════════════════════════
   GUARD — Verificar sesión admin
══════════════════════════════════════ */
 
/**
 * Verifica que exista una sesión admin válida usando api.js
 * @returns {boolean}
 */
function guardAdmin() {
    // Verificar autenticación real
    if (!isAuthenticated()) {
        sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
        window.location.replace(CUENTA_URL);
        return false;
    }

    // Verificar que sea ADMIN
    const user = getCurrentUser();
    if (!user || user.rol !== 'ADMIN') {
        window.location.replace('/pages/index.html');
        return false;
    }

    return true;
}
 
/* ══════════════════════════════════════
   LOGOUT
══════════════════════════════════════ */
 
/**
 * Inicializa el botón de cerrar sesión del sidebar.
 * Usa la función logout de api.js
 */
function initLogout() {
    const btn = document.getElementById('btn-logout');
    if (!btn) return;
    
    btn.addEventListener('click', async () => {
        await logout();  // Usa la función de api.js
        // logout() ya redirige a cuenta.html
    });
}
 
/* ══════════════════════════════════════
   EMPTY STATE (sin cambios)
══════════════════════════════════════ */
function buildEmptyState(texto, icon) {
    const icons = {
        doc: '<svg class="adm-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></svg>',
        box: '<svg class="adm-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>',
    };
    const svg = icons[icon] || icons.doc;
    return `<div class="adm-empty">${svg}<span class="adm-empty-text">${texto}</span></div>`;
}
export { guardAdmin, initLogout, buildEmptyState };