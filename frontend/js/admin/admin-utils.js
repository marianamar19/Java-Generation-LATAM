/**
 * admin-utils.js — HERA Admin
 * Utilidades compartidas por todas las páginas del panel admin.
 * Exporta: guardAdmin, initLogout, loadAdminSidebar,
 *          buildEmptyState, escapeHtml, capitalize,
 *          showToast, renderDate
 */

import { isAuthenticated, getCurrentUser, logout } from '../utils/api.js';

const CUENTA_URL = '/pages/cuenta.html';

/* ══════════════════════════════════════
   GUARD — Verificar sesión admin
══════════════════════════════════════ */

export function guardAdmin() {
    if (!isAuthenticated()) {
        sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
        window.location.replace(CUENTA_URL);
        return false;
    }
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

export function initLogout() {
    const btn = document.getElementById('btn-logout');
    if (!btn) return;
    btn.addEventListener('click', async () => { await logout(); });
}

/* ══════════════════════════════════════
   SIDEBAR DINÁMICO
══════════════════════════════════════ */

export function loadAdminSidebar(activePage = '') {
    const nav = [
        { id: 'dashboard',      label: 'Dashboard',     href: 'dashboard.html',      icon: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>' },
        { id: 'productos',      label: 'Productos',     href: 'productos.html',      icon: '<path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>' },
        { id: 'ordenes',        label: 'Órdenes',       href: 'ordenes.html',        icon: '<path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/>' },
        { id: 'clientes',       label: 'Clientes',      href: 'clientes.html',       icon: '<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>' },
        { id: 'configuracion',  label: 'Configuración', href: 'configuracion.html',  icon: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>' },
    ];

    const placeholder = document.getElementById('adm-sidebar-placeholder');
    if (!placeholder) return;

    placeholder.outerHTML = `
        <aside class="adm-sidebar">
            <div class="adm-sidebar-logo">
                <div class="adm-logo-brand">Hera</div>
                <div class="adm-logo-sub">Panel Admin</div>
            </div>
            <nav aria-label="Navegación del panel admin">
                <div class="adm-nav-section">
                    <div class="adm-nav-label">Principal</div>
                    ${nav.slice(0, 4).map(item => `
                        <a href="${item.href}" class="adm-nav-item${activePage === item.id ? ' active' : ''}" aria-label="${item.label}">
                            <svg class="adm-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">${item.icon}</svg>
                            <span class="adm-nav-text">${item.label}</span>
                        </a>
                    `).join('')}
                </div>
                <div class="adm-nav-section">
                    <div class="adm-nav-label">Sitio</div>
                    ${nav.slice(4).map(item => `
                        <a href="${item.href}" class="adm-nav-item${activePage === item.id ? ' active' : ''}" aria-label="${item.label}">
                            <svg class="adm-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">${item.icon}</svg>
                            <span class="adm-nav-text">${item.label}</span>
                        </a>
                    `).join('')}
                </div>
            </nav>
            <div class="adm-sidebar-bottom">
                <a href="../../pages/index.html" class="adm-nav-item" aria-label="Ver sitio público">
                    <svg class="adm-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                    <span class="adm-nav-text">Ver sitio</span>
                </a>
                <button class="adm-nav-item" id="btn-logout" aria-label="Cerrar sesión del panel admin">
                    <svg class="adm-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                    <span class="adm-nav-text">Cerrar sesión</span>
                </button>
            </div>
        </aside>`;
}

/* ══════════════════════════════════════
   FECHA EN TOPBAR
══════════════════════════════════════ */

export function renderDate(elementId = 'adm-date') {
    const el = document.getElementById(elementId);
    if (!el) return;
    const now  = new Date();
    const dias  = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
    const meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
    const str  = `${dias[now.getDay()]}, ${now.getDate()} de ${meses[now.getMonth()]} de ${now.getFullYear()}`;
    el.textContent = str.charAt(0).toUpperCase() + str.slice(1);
}

/* ══════════════════════════════════════
   TOAST
══════════════════════════════════════ */

export function showToast(msg, color = '#4caf50') {
    const toastEl = document.getElementById('adm-toast');
    const dot     = document.getElementById('toast-dot');
    const msgEl   = document.getElementById('toast-msg');
    if (!toastEl) return;
    if (msgEl) msgEl.textContent = msg;
    if (dot)   dot.style.background = color;
    bootstrap.Toast.getOrCreateInstance(toastEl, { delay: 3000 }).show();
}

/* ══════════════════════════════════════
   UTILIDADES DE TEXTO
══════════════════════════════════════ */

export function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

export function capitalize(str) {
    if (!str) return '—';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/* ══════════════════════════════════════
   EMPTY STATE
══════════════════════════════════════ */

export function buildEmptyState(texto, icon = 'doc') {
    const icons = {
        doc: '<svg class="adm-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></svg>',
        box: '<svg class="adm-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>',
    };
    return `<div class="adm-empty">${icons[icon] || icons.doc}<span class="adm-empty-text">${texto}</span></div>`;
}