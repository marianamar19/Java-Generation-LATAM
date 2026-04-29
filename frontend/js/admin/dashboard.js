/**
 * dashboard.js — HERA Admin
 *
 * Descripción: Lógica completa del dashboard de administración.
 *              Gestiona el auth-check, carga de datos (localStorage
 *              con fallback a datos demo), renderizado de KPIs,
 *              tabla de órdenes recientes, panel de estatus,
 *              top productos y gráfica de ventas.
 *
 * Exporta:     (ninguno — script de página, punto de entrada)
 * Importado por: pages/admin/dashboard.html via <script type="module">
 *
 * Dependencias externas:
 *   - Chart.js 4.4.3 (cargado via CDN antes de este script)
 */
 
import { guardAdmin, initLogout, buildEmptyState } from './admin-utils.js';
 
/* Ejecutar guard inmediatamente — antes que cualquier otra lógica */
guardAdmin();
 
/* ══════════════════════════════════════
   DATOS DEMO — TEMPORAL
   Fuente: hera_orders en localStorage con fallback a estos datos.
   Reemplazar con: fetch('/api/orders') cuando exista backend.
══════════════════════════════════════ */
const DEMO_ORDERS = [
  { id: 'ORD-20260417-001', fecha: '2026-04-17T10:30', cliente: { nombre: 'Ana García',   email: 'ana@mail.com'    }, items: [{ productId: 'jenny-1',  name: 'Inolvidable EDP',  qty: 1, precio: 1210 }], pago: { total: 1309 }, estatus: 'pendiente'  },
  { id: 'ORD-20260417-002', fecha: '2026-04-17T09:15', cliente: { nombre: 'Carlos Ruiz',  email: 'carlos@mail.com' }, items: [{ productId: 'sauvage-7', name: 'Sauvage EDP',      qty: 1, precio: 2450 }], pago: { total: 2549 }, estatus: 'confirmado' },
  { id: 'ORD-20260416-003', fecha: '2026-04-16T18:45', cliente: { nombre: 'María López',  email: 'maria@mail.com'  }, items: [{ productId: 'blanche-8', name: 'Blanche EDP',      qty: 1, precio: 2100 }], pago: { total: 2199 }, estatus: 'enviado'    },
  { id: 'ORD-20260416-004', fecha: '2026-04-16T14:00', cliente: { nombre: 'Luis Torres',  email: 'luis@mail.com'   }, items: [{ productId: 'noir-5',    name: 'Noir Absolu',      qty: 2, precio: 2960 }], pago: { total: 3059 }, estatus: 'entregado'  },
  { id: 'ORD-20260415-005', fecha: '2026-04-15T11:20', cliente: { nombre: 'Sofía Méndez', email: 'sofia@mail.com'  }, items: [{ productId: 'oud-6',     name: 'Oud Rose',         qty: 1, precio: 1320 }], pago: { total: 1419 }, estatus: 'cancelado'  },
  { id: 'ORD-20260415-006', fecha: '2026-04-15T09:00', cliente: { nombre: 'Pedro Vargas', email: 'pedro@mail.com'  }, items: [{ productId: 'anillo-1',  name: 'Anillo Solitario', qty: 1, precio: 1290 }], pago: { total: 1389 }, estatus: 'entregado'  },
  { id: 'ORD-20260414-007', fecha: '2026-04-14T16:30', cliente: { nombre: 'Valeria Cruz', email: 'val@mail.com'    }, items: [{ productId: 'collar-1',  name: 'Collar Dorado',    qty: 1, precio: 890  }], pago: { total: 989  }, estatus: 'enviado'    },
];
 
/* ══════════════════════════════════════
   CONFIGURACIÓN DE ESTATUS
   Fuente de verdad para colores y etiquetas de badges.
   El color se aplica via style="" en el DOM porque proviene
   de esta config en tiempo de ejecución — excepción aceptada.
══════════════════════════════════════ */
const STATUS_CONFIG = {
  pendiente:  { label: 'Pendiente',  color: '#f9a825' },
  confirmado: { label: 'Confirmado', color: '#1a6fc4' },
  enviado:    { label: 'Enviado',    color: '#4caf50' },
  entregado:  { label: 'Entregado',  color: '#4caf50' },
  cancelado:  { label: 'Cancelado',  color: '#E1222B' },
};
 
/* ══════════════════════════════════════
   PUNTO DE ENTRADA
══════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  renderDate();
  const orders = _loadOrders();
  renderKPIs(orders);
  renderOrdersTable(orders);
  renderStatusList(orders);
  renderTopProducts(orders);
  renderSalesChart();
  initLogout();
});
 
/* ══════════════════════════════════════
   FECHA EN TOPBAR
   Formatea la fecha actual en español sin depender de
   capitalización automática del browser.
══════════════════════════════════════ */
 
/**
 * Renderiza la fecha actual en el elemento #adm-date del topbar.
 * @returns {void}
 */
function renderDate() {
  const el = document.getElementById('adm-date');
  if (!el) return;
 
  const now   = new Date();
  const dias  = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
  const meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  const str   = `${dias[now.getDay()]}, ${now.getDate()} de ${meses[now.getMonth()]} de ${now.getFullYear()}`;
 
  // Capitalizar solo la primera letra del string completo
  el.textContent = str.charAt(0).toUpperCase() + str.slice(1);
}
 
/* ══════════════════════════════════════
   CARGA DE ÓRDENES
══════════════════════════════════════ */
 
/**
 * Lee órdenes de localStorage. Si no hay datos, devuelve DEMO_ORDERS.
 * TEMPORAL — Reemplazar con fetch('/api/orders') cuando exista backend.
 * @returns {Array} Array de órdenes
 */
function _loadOrders() {
  try {
    const stored = localStorage.getItem('hera_orders');
    return stored ? JSON.parse(stored) : DEMO_ORDERS;
  } catch (e) {
    return DEMO_ORDERS;
  }
}
 
/* ══════════════════════════════════════
   KPI CARDS
══════════════════════════════════════ */
 
/**
 * Calcula y renderiza las 4 KPI cards del dashboard:
 * órdenes hoy, ingresos hoy, productos activos y pendientes.
 * @param {Array} orders - Array de órdenes
 * @returns {void}
 */
function renderKPIs(orders) {
  const today      = new Date().toISOString().slice(0, 10);
  const ordersHoy  = orders.filter((o) => o.fecha && o.fecha.slice(0, 10) === today);
  const ingresosHoy = ordersHoy.reduce((sum, o) => sum + (o.pago?.total || 0), 0);
  const pendientes  = orders.filter((o) => o.estatus === 'pendiente').length;
 
  /* ── TEMPORAL — contar productos desde localStorage
     Reemplazar con: fetch('/api/products/count')
  ── */
  let productCount = 0;
  try {
    const prods = JSON.parse(localStorage.getItem('hera_products') || 'null');
    productCount = prods ? prods.length : 0;
  } catch (e) { productCount = 0; }
 
  const elOrdenes      = document.getElementById('kpi-ordenes');
  const elIngresos     = document.getElementById('kpi-ingresos');
  const elIngresosSub  = document.getElementById('kpi-ingresos-sub');
  const elProductos    = document.getElementById('kpi-productos');
  const elPendientes   = document.getElementById('kpi-pendientes');
  const cardPendientes = document.getElementById('kpi-card-pendientes');
 
  if (elOrdenes)    elOrdenes.textContent   = ordersHoy.length;
  if (elIngresos)   elIngresos.textContent  = '$' + ingresosHoy.toLocaleString('es-MX') + ' MXN';
  if (elIngresosSub) elIngresosSub.textContent = ordersHoy.length > 0
    ? ordersHoy.length + (ordersHoy.length === 1 ? ' venta hoy' : ' ventas hoy')
    : 'Sin ventas registradas hoy';
  if (elProductos)  elProductos.textContent = productCount;
  if (elPendientes) elPendientes.textContent = pendientes;
 
  // Acento rojo en la card de pendientes cuando hay órdenes por atender
  if (cardPendientes && pendientes > 0) {
    cardPendientes.classList.add('adm-kpi-card--alert');
    elPendientes.classList.add('adm-kpi-value--accent');
  }
}
 
/* ══════════════════════════════════════
   TABLA DE ÓRDENES RECIENTES
══════════════════════════════════════ */
 
/**
 * Construye y renderiza las últimas 7 órdenes en la tabla.
 * @param {Array} orders - Array de órdenes
 * @returns {void}
 */
function renderOrdersTable(orders) {
  const tbody = document.getElementById('adm-orders-tbody');
  if (!tbody) return;
 
  const recientes = orders.slice(0, 7);
 
  if (recientes.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6">${_buildEmptyState('Sin órdenes registradas aún')}</td></tr>`;
    return;
  }
 
  tbody.innerHTML = recientes.map((o) => {
    const fecha      = o.fecha ? new Date(o.fecha).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
    const numProds   = o.items ? o.items.length : 0;
    const labelProds = numProds + (numProds === 1 ? ' producto' : ' productos');
    const total      = o.pago?.total ? '$' + o.pago.total.toLocaleString('es-MX') : '—';
    const nombre     = o.cliente?.nombre || '—';
    const email      = o.cliente?.email  || '';
 
    return (
      `<tr>
        <td><span class="adm-order-id">${o.id}</span></td>
        <td>
          <div class="adm-order-name">${nombre}</div>
          <div class="adm-order-email">${email}</div>
        </td>
        <td><span class="adm-order-qty">${labelProds}</span></td>
        <td><span class="adm-order-total">${total}</span></td>
        <td>${_buildBadge(o.estatus)}</td>
        <td><span class="adm-order-date">${fecha}</span></td>
      </tr>`
    );
  }).join('');
}
 
/* ══════════════════════════════════════
   HELPERS DE CONSTRUCCIÓN DOM
══════════════════════════════════════ */
 
/**
 * Construye el HTML de un badge de estatus.
 * @param {string} estatus - Clave de estatus ('pendiente' | 'confirmado' | etc.)
 * @returns {string} HTML del badge
 */
function _buildBadge(estatus) {
  const cfg = STATUS_CONFIG[estatus];
  if (!cfg) return `<span class="adm-badge">${estatus || '—'}</span>`;
  return (
    `<span class="adm-badge adm-badge--${estatus}">` +
      `<span class="adm-badge-dot"></span>${cfg.label}` +
    `</span>`
  );
}
 
/* ══════════════════════════════════════
   PANEL DERECHO — Estatus de órdenes
══════════════════════════════════════ */
 
/**
 * Renderiza la lista de estatus con conteo de órdenes por estado.
 * El color del dot se aplica via style="" porque proviene de
 * STATUS_CONFIG en tiempo de ejecución — excepción aceptada.
 * @param {Array} orders - Array de órdenes
 * @returns {void}
 */
function renderStatusList(orders) {
  const container = document.getElementById('adm-status-list');
  if (!container) return;
 
  // Contar órdenes por estatus
  const conteo = {};
  orders.forEach((o) => { conteo[o.estatus] = (conteo[o.estatus] || 0) + 1; });
 
  container.innerHTML = Object.keys(STATUS_CONFIG).map((key) => {
    const cfg   = STATUS_CONFIG[key];
    const count = conteo[key] || 0;
    return (
      `<div class="adm-status-row">` +
        `<div class="adm-status-label">` +
          `<span class="adm-status-dot" style="background:${cfg.color}"></span>` +
          cfg.label +
        `</div>` +
        `<span class="adm-status-count">${count}</span>` +
      `</div>`
    );
  }).join('');
}
 
/* ══════════════════════════════════════
   PANEL DERECHO — Top productos
══════════════════════════════════════ */
 
/**
 * Agrega las unidades vendidas por producto y renderiza
 * los 5 más vendidos en el panel lateral derecho.
 * @param {Array} orders - Array de órdenes
 * @returns {void}
 */
function renderTopProducts(orders) {
  const container = document.getElementById('adm-top-products');
  if (!container) return;
 
  // Agregar conteo de unidades por productId
  const conteo = {};
  orders.forEach((o) => {
    if (!o.items) return;
    o.items.forEach((item) => {
      if (!conteo[item.productId]) {
        conteo[item.productId] = { name: item.name, brand: '', count: 0 };
      }
      conteo[item.productId].count += item.qty || 1;
    });
  });
 
  const sorted = Object.values(conteo)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
 
  if (sorted.length === 0) {
    container.innerHTML = _buildEmptyState('Sin ventas registradas aún');
    return;
  }
 
  container.innerHTML = sorted.map((p) =>
    `<div class="adm-top-item">` +
      `<div class="adm-top-info">` +
        `<div class="adm-top-name">${p.name}</div>` +
        `<div class="adm-top-brand">${p.brand}</div>` +
      `</div>` +
      `<span class="adm-top-count">${p.count}x</span>` +
    `</div>`
  ).join('');
}
 
/* ══════════════════════════════════════
   GRÁFICA DE VENTAS — Chart.js
   TEMPORAL — datos demo visuales hasta que hera_orders
   tenga historial real de 7 días.
   Reemplazar con agregación de hera_orders por fecha.
══════════════════════════════════════ */
 
/**
 * Inicializa la gráfica de barras de ventas de los últimos 7 días.
 * Depende de Chart.js cargado via CDN antes de este script.
 * @returns {void}
 */
function renderSalesChart() {
  const canvas = document.getElementById('adm-chart-ventas');
  if (!canvas || typeof Chart === 'undefined') return;
 
  const labels = ['11 abr', '12 abr', '13 abr', '14 abr', '15 abr', '16 abr', '17 abr'];
  const data   = [8400, 12300, 6800, 15200, 9800, 18400, 13600];
 
  new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: 'rgba(225, 34, 43, 0.12)',
        borderColor:     '#E1222B',
        borderWidth:     1.5,
        borderRadius:    0,
      }],
    },
    options: {
      responsive:          true,
      maintainAspectRatio: false,  /* Usa el alto del contenedor — evita el loop de resize */
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#0F0F0F',
          borderColor:     '#E6E6E6',
          borderWidth:     1,
          titleColor:      '#F9F9F9',
          bodyColor:       'rgba(249,249,249,.7)',
          padding:         10,
          callbacks: {
            label: (ctx) => ` $${ctx.parsed.y.toLocaleString('es-MX')} MXN`,
          },
        },
      },
      scales: {
        x: {
          grid:  { color: 'rgba(15,15,15,.05)' },
          ticks: { color: 'rgba(15,15,15,.4)', font: { size: 11, family: 'Instrument Sans' } },
        },
        y: {
          grid:  { color: 'rgba(15,15,15,.05)' },
          ticks: {
            color:    'rgba(15,15,15,.4)',
            font:     { size: 11, family: 'Instrument Sans' },
            callback: (val) => `$${val.toLocaleString('es-MX')}`,
          },
        },
      },
    },
  });
}
 
/* fin dashboard.js */