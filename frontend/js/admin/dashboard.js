/**
 * dashboard.js — HERA Admin (VERSIÓN CORREGIDA)
 */

import { initLogout, buildEmptyState } from './admin-utils.js';
import { isAuthenticated, getCurrentUser } from '../utils/api.js';

// AGREGAR CONSTANTE
const API_BASE_URL = 'http://localhost:8080';

/* ══════════════════════════════════════
   VERIFICACIÓN DE AUTENTICACIÓN
══════════════════════════════════════ */

if (!isAuthenticated()) {
    sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
    window.location.href = '/pages/cuenta.html';
}

const currentUser = getCurrentUser();
if (currentUser && currentUser.rol !== 'ADMIN') {
    window.location.href = '/pages/index.html';
}

/* ══════════════════════════════════════
   CONFIGURACIÓN DE ESTATUS
══════════════════════════════════════ */
const STATUS_CONFIG = {
    pendiente:  { label: 'Pendiente',  color: '#f9a825' },
    confirmado: { label: 'Confirmado', color: '#1a6fc4' },
    procesando: { label: 'Procesando', color: '#1a6fc4' },
    enviado:    { label: 'Enviado',    color: '#4caf50' },
    entregado:  { label: 'Entregado',  color: '#4caf50' },
    cancelado:  { label: 'Cancelado',  color: '#E1222B' },
};

/* ══════════════════════════════════════
   ESTADO GLOBAL
══════════════════════════════════════ */
let pedidosGlobal = [];
let productosGlobal = [];

/* ══════════════════════════════════════
   CARGA DE DATOS
══════════════════════════════════════ */

async function cargarDatos() {
    try {
        // Cargar productos (público)
        const productosResp = await fetch(`${API_BASE_URL}/api/productos`);
        if (productosResp.ok) {
            productosGlobal = await productosResp.json();
            console.log('Productos cargados:', productosGlobal.length);
        } else {
            console.error('Error productos:', productosResp.status);
        }

        // Cargar pedidos (requiere token ADMIN)
        const token = sessionStorage.getItem('hera_token');
        if (token) {
            const pedidosResp = await fetch(`${API_BASE_URL}/api/pedidos`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (pedidosResp.ok) {
                pedidosGlobal = await pedidosResp.json();
                console.log('Pedidos cargados:', pedidosGlobal.length);
            } else {
                console.error('Error pedidos:', pedidosResp.status);
                pedidosGlobal = [];
            }
        } else {
            pedidosGlobal = [];
        }
        
    } catch (error) {
        console.error('❌ Error cargando datos:', error);
        pedidosGlobal = [];
        productosGlobal = [];
    }
}

/* ══════════════════════════════════════
   RENDER KPIs
══════════════════════════════════════ */

function renderKPIs() {
    const today = new Date().toISOString().slice(0, 10);
    const ordersHoy = pedidosGlobal.filter(p => p.fechaPedido && p.fechaPedido.slice(0, 10) === today);
    const ingresosHoy = ordersHoy.reduce((sum, o) => sum + (o.total || 0), 0);
    const pendientes = pedidosGlobal.filter(p => p.estado === 'pendiente').length;
    const productCount = productosGlobal.length;

    const elOrdenes = document.getElementById('kpi-ordenes');
    const elIngresos = document.getElementById('kpi-ingresos');
    const elIngresosSub = document.getElementById('kpi-ingresos-sub');
    const elProductos = document.getElementById('kpi-productos');
    const elPendientes = document.getElementById('kpi-pendientes');
    const cardPendientes = document.getElementById('kpi-card-pendientes');

    if (elOrdenes) elOrdenes.textContent = ordersHoy.length;
    if (elIngresos) elIngresos.textContent = '$' + ingresosHoy.toLocaleString('es-MX') + ' MXN';
    if (elIngresosSub) {
        elIngresosSub.textContent = ordersHoy.length > 0
            ? ordersHoy.length + (ordersHoy.length === 1 ? ' venta hoy' : ' ventas hoy')
            : 'Sin ventas registradas hoy';
    }
    if (elProductos) elProductos.textContent = productCount;
    if (elPendientes) elPendientes.textContent = pendientes;

    if (cardPendientes && pendientes > 0) {
        cardPendientes.classList.add('adm-kpi-card--alert');
        elPendientes.classList.add('adm-kpi-value--accent');
    }
}

/* ══════════════════════════════════════
   TABLA DE ÓRDENES
══════════════════════════════════════ */

function renderOrdersTable(orders) {
    const tbody = document.getElementById('adm-orders-tbody');
    if (!tbody) return;

    const recientes = [...orders]
        .sort((a, b) => new Date(b.fechaPedido) - new Date(a.fechaPedido))
        .slice(0, 7);

    if (recientes.length === 0) {
        tbody.innerHTML = `<td><td colspan="6">${buildEmptyState('Sin órdenes registradas aún')}</td></tr>`;
        return;
    }

    tbody.innerHTML = recientes.map((o) => {
        const fecha = o.fechaPedido ? new Date(o.fechaPedido).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
        const numProds = o.items ? o.items.length : 0;
        const labelProds = numProds + (numProds === 1 ? ' producto' : ' productos');
        const total = o.total ? '$' + o.total.toLocaleString('es-MX') : '—';
        const nombre = o.nombreContacto || '—';
        const email = o.emailContacto || '—';

        return `
            <tr>
                <td><span class="adm-order-id">${o.numeroPedido || o.id}</span></td>
                <td>
                    <div class="adm-order-name">${escapeHtml(nombre)}</div>
                    <div class="adm-order-email">${escapeHtml(email)}</div>
                </td>
                <td><span class="adm-order-qty">${labelProds}</span></td>
                <td><span class="adm-order-total">${total}</span></td>
                <td>${_buildBadge(o.estado)}</td>
                <td><span class="adm-order-date">${fecha}</span></td>
            </tr>
        `;
    }).join('');
}

function _buildBadge(estado) {
    const cfg = STATUS_CONFIG[estado];
    if (!cfg) return `<span class="adm-badge">${estado || '—'}</span>`;
    return `<span class="adm-badge adm-badge--${estado}"><span class="adm-badge-dot"></span>${cfg.label}</span>`;
}

/* ══════════════════════════════════════
   STATUS LIST
══════════════════════════════════════ */

function renderStatusList(orders) {
    const container = document.getElementById('adm-status-list');
    if (!container) return;

    const conteo = {};
    orders.forEach((o) => {
        const estado = o.estado || 'pendiente';
        conteo[estado] = (conteo[estado] || 0) + 1;
    });

    container.innerHTML = Object.keys(STATUS_CONFIG).map((key) => {
        const cfg = STATUS_CONFIG[key];
        const count = conteo[key] || 0;
        return `
            <div class="adm-status-row">
                <div class="adm-status-label">
                    <span class="adm-status-dot" style="background:${cfg.color}"></span>
                    ${cfg.label}
                </div>
                <span class="adm-status-count">${count}</span>
            </div>
        `;
    }).join('');
}

/* ══════════════════════════════════════
   TOP PRODUCTOS
══════════════════════════════════════ */

function renderTopProducts(orders) {
    const container = document.getElementById('adm-top-products');
    if (!container) return;

    const conteo = {};
    orders.forEach((o) => {
        if (!o.items) return;
        o.items.forEach((item) => {
            const productId = item.productId || item.id;
            if (!conteo[productId]) {
                conteo[productId] = { name: item.nombreProducto || item.nombre, brand: '', count: 0 };
            }
            conteo[productId].count += item.cantidad || 1;
        });
    });

    const sorted = Object.values(conteo)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

    if (sorted.length === 0) {
        container.innerHTML = buildEmptyState('Sin ventas registradas aún');
        return;
    }

    container.innerHTML = sorted.map((p) => `
        <div class="adm-top-item">
            <div class="adm-top-info">
                <div class="adm-top-name">${escapeHtml(p.name)}</div>
                <div class="adm-top-brand">${escapeHtml(p.brand)}</div>
            </div>
            <span class="adm-top-count">${p.count}x</span>
        </div>
    `).join('');
}

/* ══════════════════════════════════════
   GRÁFICA DE VENTAS
══════════════════════════════════════ */

function renderSalesChart() {
    const canvas = document.getElementById('adm-chart-ventas');
    if (!canvas || typeof Chart === 'undefined') return;

    const labels = [];
    const dataVentas = [];

    for (let i = 6; i >= 0; i--) {
        const fecha = new Date();
        fecha.setDate(fecha.getDate() - i);
        const fechaStr = fecha.toISOString().slice(0, 10);
        labels.push(fecha.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' }));
        
        const ventasDia = pedidosGlobal
            .filter(p => p.fechaPedido && p.fechaPedido.slice(0, 10) === fechaStr)
            .reduce((sum, p) => sum + (p.total || 0), 0);
        
        dataVentas.push(ventasDia);
    }

    new Chart(canvas, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                data: dataVentas,
                backgroundColor: 'rgba(225, 34, 43, 0.12)',
                borderColor: '#E1222B',
                borderWidth: 1.5,
                borderRadius: 0,
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#0F0F0F',
                    borderColor: '#E6E6E6',
                    borderWidth: 1,
                    titleColor: '#F9F9F9',
                    bodyColor: 'rgba(249,249,249,.7)',
                    padding: 10,
                    callbacks: {
                        label: (ctx) => ` $${ctx.parsed.y.toLocaleString('es-MX')} MXN`,
                    },
                },
            },
            scales: {
                x: {
                    grid: { color: 'rgba(15,15,15,.05)' },
                    ticks: { color: 'rgba(15,15,15,.4)', font: { size: 11, family: 'Instrument Sans' } },
                },
                y: {
                    grid: { color: 'rgba(15,15,15,.05)' },
                    ticks: {
                        color: 'rgba(15,15,15,.4)',
                        font: { size: 11, family: 'Instrument Sans' },
                        callback: (val) => `$${val.toLocaleString('es-MX')}`,
                    },
                },
            },
        },
    });
}

/* ══════════════════════════════════════
   RENDER COMPLETO
══════════════════════════════════════ */

function renderDashboard() {
    renderKPIs();
    renderOrdersTable(pedidosGlobal);
    renderStatusList(pedidosGlobal);
    renderTopProducts(pedidosGlobal);
    renderSalesChart();
}

/* ══════════════════════════════════════
   UTILIDAD
══════════════════════════════════════ */

function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

/* ══════════════════════════════════════
   FECHA EN TOPBAR
══════════════════════════════════════ */

function renderDate() {
    const el = document.getElementById('adm-date');
    if (!el) return;

    const now = new Date();
    const dias = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    const str = `${dias[now.getDay()]}, ${now.getDate()} de ${meses[now.getMonth()]} de ${now.getFullYear()}`;

    el.textContent = str.charAt(0).toUpperCase() + str.slice(1);
}

/* ══════════════════════════════════════
   INICIALIZACIÓN
══════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', async () => {
    renderDate();
    await cargarDatos();
    renderDashboard();
    initLogout();
});