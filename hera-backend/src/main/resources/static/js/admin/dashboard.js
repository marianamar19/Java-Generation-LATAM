/**
 * dashboard.js — HERA Admin
 * Lógica exclusiva del dashboard: KPIs, tabla de órdenes,
 * status list, top productos y gráfica de ventas.
 */

import { guardAdmin, initLogout, loadAdminSidebar, buildEmptyState, escapeHtml, renderDate } from './admin-utils.js';
import { getProductos } from '../../../../../../../frontend/js/utils/api.js';

guardAdmin();

const STATUS_CONFIG = {
    pendiente:  { label: 'Pendiente',  color: '#f9a825' },
    confirmado: { label: 'Confirmado', color: '#1a6fc4' },
    procesando: { label: 'Procesando', color: '#1a6fc4' },
    enviado:    { label: 'Enviado',    color: '#4caf50' },
    entregado:  { label: 'Entregado',  color: '#4caf50' },
    cancelado:  { label: 'Cancelado',  color: '#E1222B' },
};

let pedidosGlobal   = [];
let productosGlobal = [];

/* ══════════════════════════════════════
   CARGA DE DATOS
══════════════════════════════════════ */

async function cargarDatos() {
    try {
        productosGlobal = await getProductos();
    } catch (e) {
        console.error('Error cargando productos:', e);
        productosGlobal = [];
    }

    try {
        const token = sessionStorage.getItem('hera_token');
        if (!token) { pedidosGlobal = []; return; }

        const res = await fetch('http://localhost:8082/api/pedidos', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        pedidosGlobal = res.ok ? await res.json() : [];
    } catch (e) {
        console.error('Error cargando pedidos:', e);
        pedidosGlobal = [];
    }
}

/* ══════════════════════════════════════
   KPIs
══════════════════════════════════════ */

function renderKPIs() {
    const today       = new Date().toISOString().slice(0, 10);
    const ordersHoy   = pedidosGlobal.filter(p => p.fechaPedido?.slice(0, 10) === today);
    const ingresosHoy = ordersHoy.reduce((sum, o) => sum + (o.total || 0), 0);
    const pendientes  = pedidosGlobal.filter(p => p.estado === 'pendiente').length;

    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

    set('kpi-ordenes',     ordersHoy.length);
    set('kpi-ingresos',    '$' + ingresosHoy.toLocaleString('es-MX') + ' MXN');
    set('kpi-ingresos-sub', ordersHoy.length > 0 ? `${ordersHoy.length} venta${ordersHoy.length > 1 ? 's' : ''} hoy` : 'Sin ventas registradas hoy');
    set('kpi-productos',   productosGlobal.length);
    set('kpi-pendientes',  pendientes);

    if (pendientes > 0) {
        document.getElementById('kpi-card-pendientes')?.classList.add('adm-kpi-card--alert');
        document.getElementById('kpi-pendientes')?.classList.add('adm-kpi-value--accent');
    }
}

/* ══════════════════════════════════════
   TABLA DE ÓRDENES
══════════════════════════════════════ */

function renderOrdersTable() {
    const tbody = document.getElementById('adm-orders-tbody');
    if (!tbody) return;

    const recientes = [...pedidosGlobal]
        .sort((a, b) => new Date(b.fechaPedido) - new Date(a.fechaPedido))
        .slice(0, 7);

    if (recientes.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6">${buildEmptyState('Sin órdenes registradas aún')}</td></tr>`;
        return;
    }

    tbody.innerHTML = recientes.map(o => {
        const fecha    = o.fechaPedido ? new Date(o.fechaPedido).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
        const numProds = o.items?.length || 0;
        const total    = o.total ? '$' + o.total.toLocaleString('es-MX') : '—';
        return `
            <tr>
                <td><span class="adm-order-id">${o.numeroPedido || o.id}</span></td>
                <td>
                    <div class="adm-order-name">${escapeHtml(o.nombreContacto || '—')}</div>
                    <div class="adm-order-email">${escapeHtml(o.emailContacto || '—')}</div>
                </td>
                <td><span class="adm-order-qty">${numProds} producto${numProds !== 1 ? 's' : ''}</span></td>
                <td><span class="adm-order-total">${total}</span></td>
                <td>${_buildBadge(o.estado)}</td>
                <td><span class="adm-order-date">${fecha}</span></td>
            </tr>`;
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

function renderStatusList() {
    const container = document.getElementById('adm-status-list');
    if (!container) return;

    const conteo = {};
    pedidosGlobal.forEach(o => {
        const estado = o.estado || 'pendiente';
        conteo[estado] = (conteo[estado] || 0) + 1;
    });

    container.innerHTML = Object.keys(STATUS_CONFIG).map(key => {
        const cfg = STATUS_CONFIG[key];
        return `
            <div class="adm-status-row">
                <div class="adm-status-label">
                    <span class="adm-status-dot" style="background:${cfg.color}"></span>
                    ${cfg.label}
                </div>
                <span class="adm-status-count">${conteo[key] || 0}</span>
            </div>`;
    }).join('');
}

/* ══════════════════════════════════════
   TOP PRODUCTOS
══════════════════════════════════════ */

function renderTopProducts() {
    const container = document.getElementById('adm-top-products');
    if (!container) return;

    const conteo = {};
    pedidosGlobal.forEach(o => {
        o.items?.forEach(item => {
            const id = item.productId || item.id;
            if (!conteo[id]) conteo[id] = { name: item.nombreProducto || item.nombre || '—', count: 0 };
            conteo[id].count += item.cantidad || 1;
        });
    });

    const sorted = Object.values(conteo).sort((a, b) => b.count - a.count).slice(0, 5);

    if (sorted.length === 0) {
        container.innerHTML = buildEmptyState('Sin ventas registradas aún');
        return;
    }

    container.innerHTML = sorted.map(p => `
        <div class="adm-top-item">
            <div class="adm-top-info">
                <div class="adm-top-name">${escapeHtml(p.name)}</div>
            </div>
            <span class="adm-top-count">${p.count}x</span>
        </div>`
    ).join('');
}

/* ══════════════════════════════════════
   GRÁFICA DE VENTAS
══════════════════════════════════════ */

function renderSalesChart() {
    const canvas = document.getElementById('adm-chart-ventas');
    if (!canvas || typeof Chart === 'undefined') return;

    const labels = [], data = [];
    for (let i = 6; i >= 0; i--) {
        const fecha = new Date();
        fecha.setDate(fecha.getDate() - i);
        const fechaStr = fecha.toISOString().slice(0, 10);
        labels.push(fecha.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' }));
        data.push(pedidosGlobal
            .filter(p => p.fechaPedido?.slice(0, 10) === fechaStr)
            .reduce((sum, p) => sum + (p.total || 0), 0)
        );
    }

    new Chart(canvas, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                data,
                backgroundColor: 'rgba(225,34,43,.12)',
                borderColor:     '#E1222B',
                borderWidth:     1.5,
                borderRadius:    0,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#0F0F0F',
                    borderColor:     '#E6E6E6',
                    borderWidth:     1,
                    titleColor:      '#F9F9F9',
                    bodyColor:       'rgba(249,249,249,.7)',
                    padding:         10,
                    callbacks: { label: ctx => ` $${ctx.parsed.y.toLocaleString('es-MX')} MXN` }
                }
            },
            scales: {
                x: { grid: { color: 'rgba(15,15,15,.05)' }, ticks: { color: 'rgba(15,15,15,.4)', font: { size: 11, family: 'Instrument Sans' } } },
                y: { grid: { color: 'rgba(15,15,15,.05)' }, ticks: { color: 'rgba(15,15,15,.4)', font: { size: 11, family: 'Instrument Sans' }, callback: val => `$${val.toLocaleString('es-MX')}` } }
            }
        }
    });
}

/* ══════════════════════════════════════
   INICIALIZACIÓN
══════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', async () => {
    loadAdminSidebar('dashboard');
    renderDate();
    initLogout();
    await cargarDatos();
    renderKPIs();
    renderOrdersTable();
    renderStatusList();
    renderTopProducts();
    renderSalesChart();
});