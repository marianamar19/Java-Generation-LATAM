/**
 * perfil_v1.js — HERA
 *
 * Descripción: Script de la página de perfil de usuario.
 *              Gestiona el auth-check, la carga de componentes
 *              universales (navbar, footer, cart, favs), el scroll
 *              reveal, y toda la lógica exclusiva de la página:
 *              panel switching por sidebar, datos del usuario,
 *              panel de pedidos, credenciales y direcciones.
 *
 * Exporta:     (ninguno — script de página, punto de entrada)
 * Importado por: pages/perfil.html via <script type="module">
 * Dependencias:  navbar.js, footer-minimo.js, cart-drawer.js,
 *                fav-drawer.js, storage.js, formatter.js
 */
 
import { loadNavbar }       from '../components/navbar.js';
import { loadFooterMinimo } from '../components/footer-minimo.js';
import { loadCartDrawer }   from '../components/cart-drawer.js';
import { initFavDrawer }    from '../components/fav-drawer.js';
import {
  isLoggedIn,
  logout,
  getCurrentUser,
  setCurrentUser
} from '../utils/storage.js';
import { formatMXN } from '../utils/formatter.js';
 
/* ══════════════════════════════════════
   UTILIDADES LOCALES
══════════════════════════════════════ */
 
/**
 * Wrapper de document.querySelector para reducir verbosidad.
 * @param {string}       sel - Selector CSS
 * @param {Element|null} ctx - Contexto (default: document)
 * @returns {Element|null}
 */
function qs(sel, ctx)  { return (ctx || document).querySelector(sel); }
 
/**
 * Wrapper de document.querySelectorAll que devuelve un Array real.
 * @param {string}       sel - Selector CSS
 * @param {Element|null} ctx - Contexto (default: document)
 * @returns {Element[]}
 */
function qsa(sel, ctx) { return Array.from((ctx || document).querySelectorAll(sel)); }
 
/**
 * Genera iniciales a partir del nombre completo.
 * Si tiene al menos dos palabras toma la primera letra de cada una.
 * Si es una sola palabra toma las dos primeras letras.
 * @param {string} name - Nombre completo del usuario
 * @returns {string} Iniciales en mayúscula, o "–" si está vacío
 */
function getIniciales(name) {
  const partes = (name || '').trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return '–';
  if (partes.length >= 2)  return (partes[0][0] + partes[1][0]).toUpperCase();
  return partes[0].substring(0, 2).toUpperCase();
}
 
/**
 * Formatea una fecha ISO a "dd mmm yyyy" en español.
 * Devuelve "–" si la fecha está vacía o no es válida.
 * @param {string|number} iso - Fecha ISO o timestamp
 * @returns {string} Ej: "01 dic 2024", o "–" si no es válida
 */
function fechaCorta(iso) {
  if (!iso) return '–';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '–';
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
}
 
/**
 * Genera un ID único para direcciones nuevas.
 * @returns {string} Ej: "dir_1704067200000_342"
 */
function generarId() {
  return 'dir_' + Date.now() + '_' + Math.floor(Math.random() * 999);
}
 
/**
 * Muestra un mensaje de feedback y lo oculta automáticamente.
 * @param {Element|null} el       - Elemento del mensaje
 * @param {number|false} duration - Ms hasta ocultarlo (false = no ocultar)
 */
function showMsg(el, duration) {
  if (!el) return;
  el.classList.add('show');
  if (duration !== false) setTimeout(() => el.classList.remove('show'), duration || 3500);
}
 
/**
 * Oculta un mensaje de feedback.
 * @param {Element|null} el - Elemento del mensaje
 */
function hideMsg(el) {
  if (el) el.classList.remove('show');
}
 
/* ══════════════════════════════════════
   SCROLL REVEAL
══════════════════════════════════════ */
 
/**
 * Inicializa el IntersectionObserver para las clases .reveal.
 * Se re-observa al activar paneles porque los elementos
 * del nuevo panel no estaban en el viewport.
 */
function _initScrollReveal() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.1 });
 
  function observeAll() {
    qsa('.reveal').forEach((el) => {
      if (!el.classList.contains('visible')) obs.observe(el);
    });
  }
 
  observeAll();
  window.addEventListener('hera:panel-activated', observeAll);
}
 
/* ══════════════════════════════════════
   DATOS DEL USUARIO
   Fuente única: getCurrentUser() → hera_current_user
   Campos disponibles: id, name, email, role,
   createdAt, lastLogin, tel, nacimiento
   ── TEMPORAL — Reemplazar setCurrentUser por
   PATCH /api/usuario cuando el backend esté disponible.
══════════════════════════════════════ */
 
/**
 * Sincroniza todos los elementos de UI que muestran datos del usuario:
 * header (tags), sidebar (avatar, nombre, email), panel info (avatar hero,
 * formulario) y panel credenciales (email actual).
 * Se llama al cargar la página y después de cada guardado.
 */
function populateUserUI() {
  const user      = getCurrentUser() || {};
  const name      = user.name       || '';
  const email     = user.email      || 'usuario@hera.mx';
  const tel       = user.tel        || '';
  const nac       = user.nacimiento || '';
  const iniciales = getIniciales(name) || email.charAt(0).toUpperCase();
  const desde     = user.createdAt
    ? new Date(user.createdAt).getFullYear()
    : new Date().getFullYear();
 
  // Header — tags de bienvenida
  const hn = qs('#headerTagNombre');
  const hd = qs('#headerTagDesde');
  if (hn) hn.textContent = name || email.split('@')[0];
  if (hd) hd.textContent = 'Miembro desde ' + desde;
 
  // Sidebar — avatar e identidad
  const sIni = qs('#sidebarIniciales');
  const sNom = qs('#sidebarNombre');
  const sEm  = qs('#sidebarEmail');
  const sDes = qs('#sidebarDesde');
  if (sIni) sIni.textContent = iniciales;
  if (sNom) sNom.textContent = name || email.split('@')[0];
  if (sEm)  sEm.textContent  = email;
  if (sDes) sDes.textContent = 'Miembro desde ' + desde;
 
  // Panel info — avatar hero
  const iIni = qs('#infoIniciales');
  const iNom = qs('#infoNombreCompleto');
  const iEm  = qs('#infoEmail');
  const iDes = qs('#infoDesde');
  if (iIni) iIni.textContent = iniciales;
  if (iNom) iNom.textContent = name || email.split('@')[0];
  if (iEm)  iEm.textContent  = email;
  if (iDes) iDes.textContent = 'Miembro desde ' + desde;
 
  // Panel info — formulario (pre-llenar con datos guardados)
  const fNom = qs('#infoNombre');
  const fTel = qs('#infoTel');
  const fNac = qs('#infoNacimiento');
  if (fNom) fNom.value = name;
  if (fTel) fTel.value = tel;
  if (fNac) fNac.value = nac;
 
  // Panel credenciales — correo actual (solo lectura)
  const cEm = qs('#credEmailActual');
  if (cEm) cEm.value = email;
}
 
/* ══════════════════════════════════════
   PANEL: INFORMACIÓN — guardar cambios
══════════════════════════════════════ */
 
/**
 * Inicializa los botones del panel de información personal.
 * Guardar valida el nombre antes de persistir en getCurrentUser.
 */
function _initPanelInfo() {
  const btnGuardar  = qs('#btnGuardarInfo');
  const btnCancelar = qs('#btnCancelarInfo');
  const msgOk       = qs('#infoMsgOk');
  const msgErr      = qs('#infoMsgErr');
 
  if (btnGuardar) {
    btnGuardar.addEventListener('click', () => {
      hideMsg(msgOk); hideMsg(msgErr);
 
      const name = (qs('#infoNombre').value || '').trim();
      const tel  = (qs('#infoTel').value    || '').trim();
      const nac  =  qs('#infoNacimiento').value || '';
 
      if (!name) { showMsg(msgErr); return; }
 
      const user = getCurrentUser() || {};
      setCurrentUser({ ...user, name, tel, nacimiento: nac });
      populateUserUI();
      showMsg(msgOk);
    });
  }
 
  if (btnCancelar) {
    btnCancelar.addEventListener('click', () => {
      populateUserUI();
      hideMsg(msgOk); hideMsg(msgErr);
    });
  }
}
 
/* ══════════════════════════════════════
   PANEL: PEDIDOS — render
   TEMPORAL — lee de hera_orders y hera_last_order en localStorage.
   Reemplazar por fetch() a GET /api/pedidos cuando el backend esté disponible.
══════════════════════════════════════ */
 
/**
 * Formatea un objeto de dirección a una línea de texto legible.
 * @param {string|Object} dir - Dirección como string u objeto
 * @returns {string}
 */
function formatDireccion(dir) {
  if (!dir) return '';
  if (typeof dir === 'string') return dir;
  return [dir.calle, dir.colonia, dir.ciudad, dir.estado]
    .filter(Boolean)
    .join(', ');
}
 
/**
 * Lee pedidos de localStorage y construye el listado de tarjetas.
 * Se llama cuando el usuario activa el panel "pedidos".
 */
function renderPedidos() {
  const list = qs('#pedidosList');
  if (!list) return;
 
  let pedidos = [];
  try { pedidos = JSON.parse(localStorage.getItem('hera_orders') || '[]'); }
  catch (e) { pedidos = []; }
 
  // Incorporar hera_last_order si no está ya en el array (compat con checkout.js)
  let lastOrder = null;
  try { lastOrder = JSON.parse(localStorage.getItem('hera_last_order') || 'null'); }
  catch (e) {}
  if (lastOrder && lastOrder.orderNum) {
    const yaExiste = pedidos.some((p) => p.orderNum === lastOrder.orderNum);
    if (!yaExiste) pedidos.unshift(lastOrder);
  }
 
  if (pedidos.length === 0) {
    list.innerHTML =
      '<div class="perfil-pedidos-empty">' +
        '<div class="perfil-pedidos-empty-icon">' +
          '<svg width="56" height="56" viewBox="0 0 56 56" fill="none"><rect x="10" y="8" width="36" height="40" stroke="currentColor" stroke-width="2"/><path d="M18 20h20M18 28h20M18 36h12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>' +
        '</div>' +
        '<div class="perfil-pedidos-empty-titulo">Sin pedidos aún</div>' +
        '<div class="perfil-pedidos-empty-sub">Tus pedidos aparecerán aquí después de tu primera compra.</div>' +
        '<a href="catalogo.html"><button class="perfil-btn perfil-btn-primary">Explorar catálogo</button></a>' +
      '</div>';
    return;
  }
 
  list.innerHTML = '';
  pedidos.forEach((p) => {
    const statusMap = { entregado: 'Entregado', enviado: 'En camino', procesando: 'Procesando' };
    const status    = p.status || 'procesando';
    const statusTxt = statusMap[status] || 'Procesando';
    const items     = p.items || [];
    const resumen   = items.length > 0
      ? items.slice(0, 2).map((i) => i.name || i).join(', ') + (items.length > 2 ? ' y ' + (items.length - 2) + ' más.' : '.')
      : p.resumen || '–';
    const totalDisp = p.total
      ? (typeof p.total === 'number' ? formatMXN(p.total) : p.total)
      : '–';
    const dirTxt = formatDireccion(p.direccion);
 
    const card = document.createElement('div');
    card.className = 'perfil-pedido-card reveal';
    card.innerHTML =
      '<div class="perfil-pedido-head">' +
        '<div>' +
          '<div class="perfil-pedido-num">Pedido ' + (p.orderNum || '#000') + '</div>' +
          '<div class="perfil-pedido-fecha">' + fechaCorta(p.date || p.fecha) + '</div>' +
        '</div>' +
        '<span class="perfil-pedido-status ' + status + '">' + statusTxt + '</span>' +
      '</div>' +
      '<div class="perfil-pedido-items">' + resumen + '</div>' +
      '<div class="perfil-pedido-foot">' +
        '<div class="perfil-pedido-total-wrap">' +
          '<span class="perfil-pedido-total-label">Total</span>' +
          '<span class="perfil-pedido-total">' + totalDisp + '</span>' +
        '</div>' +
        (dirTxt ? '<div class="perfil-pedido-dir">Enviado a: ' + dirTxt + '</div>' : '') +
      '</div>';
    list.appendChild(card);
  });
 
  window.dispatchEvent(new Event('hera:panel-activated'));
}
 
/* ══════════════════════════════════════
   PANEL: CREDENCIALES
   TEMPORAL — las mutaciones de email y contraseña
   se simulan en localStorage.
   Reemplazar por: PATCH /api/cuenta/email y POST /api/cuenta/password
══════════════════════════════════════ */
 
/**
 * Inicializa la lógica de los formularios de cambio de email y contraseña.
 */
function _initPanelCredenciales() {
  // ── Cambio de correo ────────────────────────────────────────
  const btnEmail    = qs('#btnActualizarEmail');
  const emailMsgOk  = qs('#emailMsgOk');
  const emailMsgErr = qs('#emailMsgErr');
  const emailErrTxt = qs('#emailMsgErrTxt');
 
  if (btnEmail) {
    btnEmail.addEventListener('click', () => {
      hideMsg(emailMsgOk); hideMsg(emailMsgErr);
      const nuevo   = (qs('#credEmailNuevo').value   || '').trim();
      const confirm = (qs('#credEmailConfirm').value || '').trim();
 
      if (!nuevo || !confirm) {
        if (emailErrTxt) emailErrTxt.textContent = 'Por favor completa ambos campos.';
        showMsg(emailMsgErr); return;
      }
      if (nuevo !== confirm) {
        if (emailErrTxt) emailErrTxt.textContent = 'Los correos no coinciden.';
        showMsg(emailMsgErr); return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nuevo)) {
        if (emailErrTxt) emailErrTxt.textContent = 'Ingresa un correo válido.';
        showMsg(emailMsgErr); return;
      }
 
      const user = getCurrentUser() || {};
      setCurrentUser({ ...user, email: nuevo });
      populateUserUI();
      qs('#credEmailNuevo').value   = '';
      qs('#credEmailConfirm').value = '';
      showMsg(emailMsgOk);
    });
  }
 
  // ── Cambio de contraseña ────────────────────────────────────
  const btnPass    = qs('#btnActualizarPass');
  const passMsgOk  = qs('#passMsgOk');
  const passMsgErr = qs('#passMsgErr');
  const passErrTxt = qs('#passMsgErrTxt');
 
  if (btnPass) {
    btnPass.addEventListener('click', () => {
      hideMsg(passMsgOk); hideMsg(passMsgErr);
      const actual  = qs('#credPassActual').value  || '';
      const nueva   = qs('#credPassNueva').value   || '';
      const confirm = qs('#credPassConfirm').value || '';
 
      if (!actual || !nueva || !confirm) {
        if (passErrTxt) passErrTxt.textContent = 'Por favor completa todos los campos.';
        showMsg(passMsgErr); return;
      }
      if (nueva.length < 8) {
        if (passErrTxt) passErrTxt.textContent = 'La contraseña debe tener al menos 8 caracteres.';
        showMsg(passMsgErr); return;
      }
      if (nueva !== confirm) {
        if (passErrTxt) passErrTxt.textContent = 'Las contraseñas no coinciden.';
        showMsg(passMsgErr); return;
      }
 
      /* TEMPORAL — simulación frontend. Endpoint esperado: POST /api/cuenta/password */
      qs('#credPassActual').value  = '';
      qs('#credPassNueva').value   = '';
      qs('#credPassConfirm').value = '';
      showMsg(passMsgOk);
    });
  }
}
 
/* ══════════════════════════════════════
   PANEL: DIRECCIONES
   TEMPORAL — persistencia en localStorage con key hera_addresses.
   Reemplazar por GET/POST/PUT/DELETE /api/direcciones cuando
   el backend esté disponible.
══════════════════════════════════════ */
 
const DIR_KEY = 'hera_addresses';
 
/**
 * Lee el array de direcciones desde localStorage.
 * @returns {Array} Direcciones guardadas, o [] si no hay datos
 */
function getDirs() {
  try { return JSON.parse(localStorage.getItem(DIR_KEY) || '[]'); }
  catch (e) { return []; }
}
 
/**
 * Persiste el array de direcciones en localStorage.
 * @param {Array} arr - Array actualizado de direcciones
 */
function saveDirs(arr) {
  localStorage.setItem(DIR_KEY, JSON.stringify(arr));
}
 
/**
 * Inicializa el panel de gestión de direcciones:
 * renderiza la lista, y enlaza los botones de agregar,
 * guardar y cancelar del formulario inline.
 */
function _initPanelDirecciones() {
  const grid        = qs('#addrGrid');
  const formWrap    = qs('#addrFormWrap');
  const formTitulo  = qs('#addrFormTitulo');
  const editIdEl    = qs('#addrEditId');
  const btnAgregar  = qs('#btnAgregarDir');
  const btnGuardar  = qs('#btnGuardarDir');
  const btnCancelar = qs('#btnCancelarDir');
  const msgOk       = qs('#addrMsgOk');
  const msgErr      = qs('#addrMsgErr');
 
  /** Limpia todos los campos del formulario de dirección */
  function clearForm() {
    ['addrAlias','addrNombre','addrCalle','addrInterior','addrColonia',
     'addrCiudad','addrEstado','addrCP','addrTel'].forEach((id) => {
      const el = qs('#' + id);
      if (el) el.value = '';
    });
    const pred = qs('#addrPredeterminada');
    if (pred) pred.checked = false;
    if (editIdEl) editIdEl.value = '';
  }
 
  /** Construye el DOM de la lista de tarjetas de dirección */
  function renderDirs() {
    const dirs = getDirs();
    if (!grid) return;
    grid.innerHTML = '';
 
    if (dirs.length === 0) {
      grid.innerHTML =
        '<div class="perfil-addr-empty">' +
          '<div class="perfil-addr-empty-titulo">Sin direcciones guardadas</div>' +
          '<div class="perfil-addr-empty-sub">Agrega tu primera dirección de envío.</div>' +
        '</div>';
      return;
    }
 
    dirs.forEach((dir) => {
      const card    = document.createElement('div');
      card.className = 'perfil-addr-card reveal';
 
      const alias   = document.createElement('div');
      alias.className = 'perfil-addr-alias' + (dir.predeterminada ? ' default' : '');
      alias.innerHTML = (dir.alias || 'Dirección') +
        (dir.predeterminada ? '<span class="perfil-addr-predeterminada">Predeterminada</span>' : '');
 
      const nombre  = document.createElement('div');
      nombre.className   = 'perfil-addr-nombre';
      nombre.textContent = dir.nombre || '';
 
      const calle   = document.createElement('div');
      calle.className   = 'perfil-addr-linea';
      calle.textContent = dir.calle + (dir.interior ? ', ' + dir.interior : '');
 
      const col     = document.createElement('div');
      col.className   = 'perfil-addr-linea';
      col.textContent = 'Col. ' + dir.colonia + ', ' + dir.ciudad;
 
      const est     = document.createElement('div');
      est.className   = 'perfil-addr-linea';
      est.textContent = dir.estado + ' ' + dir.cp;
 
      const tel     = document.createElement('div');
      tel.className   = 'perfil-addr-tel';
      tel.textContent = dir.tel || '';
 
      const actions = document.createElement('div');
      actions.className = 'perfil-addr-actions';
 
      const btnEd   = document.createElement('button');
      btnEd.className    = 'perfil-btn perfil-btn-outline perfil-btn-sm';
      btnEd.textContent  = 'Editar';
      btnEd.dataset.editId = dir.id;
 
      const btnDel  = document.createElement('button');
      btnDel.className   = 'perfil-btn perfil-btn-danger perfil-btn-sm';
      btnDel.textContent = 'Eliminar';
      btnDel.dataset.delId = dir.id;
 
      actions.appendChild(btnEd);
      actions.appendChild(btnDel);
      card.append(alias, nombre, calle, col, est, tel, actions);
      grid.appendChild(card);
    });
 
    window.dispatchEvent(new Event('hera:panel-activated'));
  }
 
  // Delegación de clicks en el grid — editar y eliminar
  if (grid) {
    grid.addEventListener('click', (e) => {
      const editBtn = e.target.closest('[data-edit-id]');
      const delBtn  = e.target.closest('[data-del-id]');
 
      if (editBtn) {
        const id  = editBtn.dataset.editId;
        const dir = getDirs().find((d) => d.id === id);
        if (!dir) return;
        clearForm();
        if (formTitulo) formTitulo.textContent = 'Editar dirección';
        if (editIdEl)   editIdEl.value = id;
        qs('#addrAlias').value    = dir.alias    || '';
        qs('#addrNombre').value   = dir.nombre   || '';
        qs('#addrCalle').value    = dir.calle    || '';
        qs('#addrInterior').value = dir.interior || '';
        qs('#addrColonia').value  = dir.colonia  || '';
        qs('#addrCiudad').value   = dir.ciudad   || '';
        qs('#addrEstado').value   = dir.estado   || '';
        qs('#addrCP').value       = dir.cp       || '';
        qs('#addrTel').value      = dir.tel      || '';
        const pred = qs('#addrPredeterminada');
        if (pred) pred.checked = !!dir.predeterminada;
        if (formWrap) { formWrap.classList.add('show'); formWrap.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
      }
 
      if (delBtn) {
        const did  = delBtn.dataset.delId;
        const dirs = getDirs().filter((d) => d.id !== did);
        saveDirs(dirs);
        renderDirs();
        if (formWrap) formWrap.classList.remove('show');
        clearForm();
      }
    });
  }
 
  // Botón "Agregar dirección"
  if (btnAgregar) {
    btnAgregar.addEventListener('click', () => {
      clearForm();
      if (formTitulo) formTitulo.textContent = 'Nueva dirección';
      if (formWrap)   { formWrap.classList.add('show'); formWrap.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
      hideMsg(msgOk); hideMsg(msgErr);
    });
  }
 
  // Botón "Guardar dirección"
  if (btnGuardar) {
    btnGuardar.addEventListener('click', () => {
      hideMsg(msgOk); hideMsg(msgErr);
      const alias    = (qs('#addrAlias').value    || '').trim();
      const nombre   = (qs('#addrNombre').value   || '').trim();
      const calle    = (qs('#addrCalle').value    || '').trim();
      const interior = (qs('#addrInterior').value || '').trim();
      const colonia  = (qs('#addrColonia').value  || '').trim();
      const ciudad   = (qs('#addrCiudad').value   || '').trim();
      const estado   = (qs('#addrEstado').value   || '').trim();
      const cp       = (qs('#addrCP').value       || '').trim();
      const tel      = (qs('#addrTel').value      || '').trim();
      const predEl   =  qs('#addrPredeterminada');
      const pred     = predEl ? predEl.checked : false;
 
      if (!alias || !nombre || !calle || !colonia || !ciudad || !estado || !cp) {
        showMsg(msgErr); return;
      }
 
      const dirs = getDirs();
      const id   = (editIdEl && editIdEl.value) || '';
 
      if (pred) dirs.forEach((d) => { d.predeterminada = false; });
 
      if (id) {
        const idx = dirs.findIndex((d) => d.id === id);
        if (idx > -1) {
          dirs[idx] = { id, alias, nombre, calle, interior, colonia, ciudad, estado, cp, tel, predeterminada: pred };
        }
      } else {
        dirs.push({ id: generarId(), alias, nombre, calle, interior, colonia, ciudad, estado, cp, tel, predeterminada: pred });
      }
 
      saveDirs(dirs);
      renderDirs();
      showMsg(msgOk);
      setTimeout(() => {
        if (formWrap) formWrap.classList.remove('show');
        clearForm();
      }, 2000);
    });
  }
 
  // Botón "Cancelar"
  if (btnCancelar) {
    btnCancelar.addEventListener('click', () => {
      if (formWrap) formWrap.classList.remove('show');
      clearForm();
      hideMsg(msgOk); hideMsg(msgErr);
    });
  }
 
  renderDirs();
}
 
/* ══════════════════════════════════════
   PANEL SWITCHING — sidebar nav
══════════════════════════════════════ */
 
/**
 * Inicializa el sistema de paneles controlado por la nav del sidebar.
 * Activa el panel correcto según el hash de la URL al cargar.
 */
function _initPanelSwitching() {
  const panelMap = {
    'info':         'panel-info',
    'pedidos':      'panel-pedidos',
    'credenciales': 'panel-credenciales',
    'direcciones':  'panel-direcciones',
  };
 
  function activatePanel(key) {
    qsa('.perfil-nav-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.panel === key);
    });
    qsa('.perfil-panel').forEach((panel) => {
      panel.classList.toggle('active', panel.id === panelMap[key]);
    });
    if (key === 'pedidos') renderPedidos();
    window.dispatchEvent(new Event('hera:panel-activated'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
 
  qsa('.perfil-nav-btn').forEach((btn) => {
    btn.addEventListener('click', () => activatePanel(btn.dataset.panel));
  });
 
  const hash = window.location.hash.replace('#', '');
  if (panelMap[hash]) activatePanel(hash);
}
 
/* ══════════════════════════════════════
   CERRAR SESIÓN — botón sidebar
══════════════════════════════════════ */
 
/**
 * Inicializa el botón "Cerrar sesión" del sidebar de perfil.
 * Usa logout() de storage.js para limpiar toda la sesión.
 */
function _initLogoutSidebar() {
  const btn = qs('#btnLogout');
  if (!btn) return;
  btn.addEventListener('click', () => {
    logout();
    window.location.href = 'cuenta.html';
  });
}
 
/* ══════════════════════════════════════
   PUNTO DE ENTRADA
══════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', async () => {
 
  // 1. Auth check — redirigir inmediatamente si no hay sesión activa
  if (!isLoggedIn()) {
    window.location.replace('cuenta.html');
    return;
  }
 
  // 2. Cargar navbar y esperar — CRÍTICO
  await loadNavbar();
 
  // 3. Footer
  loadFooterMinimo();
 
  // 4. Inicializar carrito y favoritos
  await loadCartDrawer();
  initFavDrawer();
 
  // 5. Lógica exclusiva de la página
  _initScrollReveal();
  populateUserUI();
  _initPanelInfo();
  _initPanelCredenciales();
  _initPanelDirecciones();
  _initPanelSwitching();
  _initLogoutSidebar();
});
 