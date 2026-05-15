// js/pages/perfil.js
import { loadNavbar } from '../components/navbar.js';
import { loadFooterMinimo } from '../components/footer-minimo.js';
import { loadCartDrawer } from '../components/cart-drawer.js';
import { initFavDrawer } from '../components/fav-drawer.js';
import { getPerfil, updatePerfil, updateEmail, updatePassword, isAuthenticated, logout, getDirecciones, createDireccion, 
        updateDireccion, deleteDireccion } from '../../../../../../../frontend/js/utils/api.js';
import { formatDateLong } from '../../../../../../../frontend/js/utils/formatter.js';

/* ══════════════════════════════════════
  FUNCIONES AUXILIARES
══════════════════════════════════════ */

const qs  = (sel, ctx = document) => ctx.querySelector(sel);
const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

function getIniciales(nombre) {
  if (!nombre) return '?';
  return nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(p => p[0].toUpperCase())
    .join('');
}

function showMsg(el) {
  if (el) el.classList.add('show');
}

function hideMsg(el) {
  if (el) el.classList.remove('show');
}

function _initPanelSwitching() {
  const btns = qsa('.perfil-nav-btn');
  const panels = qsa('.perfil-panel');

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.panel;

      btns.forEach(b => b.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const panel = qs(`#panel-${target}`);
      if (panel) {
        panel.classList.add('active');
        window.dispatchEvent(new Event('hera:panel-activated'));
      }
    });
  });
}

/* ══════════════════════════════════════
  PERFIL - CARGA DE DATOS
══════════════════════════════════════ */

let perfilCache = null;

function populateUserUI(perfil) {
  const name = perfil.nombre || '';
  const email = perfil.email || '';
  const telefono = perfil.telefono || '';
  const fechaNacimiento = perfil.fechaNacimiento || '';
  const iniciales = getIniciales(name) || email.charAt(0).toUpperCase();
  const desde = perfil.fechaRegistro ? new Date(perfil.fechaRegistro).getFullYear() : new Date().getFullYear();

  // Header
  const hn = qs('#headerTagNombre');
  const hd = qs('#headerTagDesde');
  if (hn) hn.textContent = name || email.split('@')[0];
  if (hd) hd.textContent = 'Miembro desde ' + desde;

  // Sidebar
  const sIni = qs('#sidebarIniciales');
  const sNom = qs('#sidebarNombre');
  const sEm = qs('#sidebarEmail');
  const sDes = qs('#sidebarDesde');
  if (sIni) sIni.textContent = iniciales;
  if (sNom) sNom.textContent = name || email.split('@')[0];
  if (sEm) sEm.textContent = email;
  if (sDes) sDes.textContent = 'Miembro desde ' + desde;

  // Panel info
  const iIni = qs('#infoIniciales');
  const iNom = qs('#infoNombreCompleto');
  const iEm = qs('#infoEmail');
  const iDes = qs('#infoDesde');
  if (iIni) iIni.textContent = iniciales;
  if (iNom) iNom.textContent = name || email.split('@')[0];
  if (iEm) iEm.textContent = email;
  if (iDes) iDes.textContent = 'Miembro desde ' + desde;

  // Formulario
  const fNom = qs('#infoNombre');
  const fTel = qs('#infoTel');
  const fNac = qs('#infoNacimiento');
  if (fNom) fNom.value = name;
  if (fTel) fTel.value = telefono.replace(/^\+52\s?/, '');  
  if (fNac) fNac.value = fechaNacimiento;

  // Credenciales
  const cEm = qs('#credEmailActual');
  if (cEm) cEm.value = email;
}

async function cargarPerfil() {
  if (!isAuthenticated()) {
    window.location.href = 'cuenta.html';
    return;
  }
  try {
    const perfil = await getPerfil();
    perfilCache = perfil;
    populateUserUI(perfil);
  } catch (error) {
    console.error('Error cargando perfil:', error);
    alert('Error al cargar perfil: ' + error.message);
    if (error.message === 'Sesión expirada') window.location.href = 'cuenta.html';
  }
}

/* ══════════════════════════════════════
  ACCIONES DEL PERFIL
══════════════════════════════════════ */

async function guardarPerfil() {
  const nombre = qs('#infoNombre')?.value || '';
  const telefono = '+52 ' + (qs('#infoTel')?.value || '');
  const fechaNacimiento = qs('#infoNacimiento')?.value || null;

  if (!nombre) {
    alert('El nombre no puede estar vacío');
    return;
  }

  try {
    const actualizado = await updatePerfil({ nombre, telefono, fechaNacimiento });
    perfilCache = actualizado;
    populateUserUI(actualizado);
    showMsg(qs('#infoMsgOk'));
    setTimeout(() => hideMsg(qs('#infoMsgOk')), 3000);
  } catch (error) {
    console.error('Error guardando perfil:', error);
    alert('Error al guardar: ' + error.message);
  }
}

async function cambiarEmail() {
  const nuevoEmail = qs('#credEmailNuevo')?.value?.trim();
  const confirmEmail = qs('#credEmailConfirm')?.value?.trim();

  if (!nuevoEmail || !confirmEmail) {
    alert('Por favor completa ambos campos de email');
    return;
  }
  if (nuevoEmail !== confirmEmail) {
    alert('Los emails no coinciden');
    return;
  }

  try {
    await updateEmail(nuevoEmail);
    alert('Email actualizado correctamente');
    qs('#credEmailNuevo').value = '';
    qs('#credEmailConfirm').value = '';
    cargarPerfil();
  } catch (error) {
    alert('Error al cambiar email: ' + error.message);
  }
}

async function cambiarPassword() {
  const passwordActual = qs('#credPassActual')?.value || '';
  const nuevaPassword = qs('#credPassNueva')?.value || '';
  const confirmPassword = qs('#credPassConfirm')?.value || '';

  if (!passwordActual || !nuevaPassword || !confirmPassword) {
    alert('Por favor completa todos los campos de contraseña');
    return;
  }
  if (nuevaPassword.length < 6) {
    alert('La nueva contraseña debe tener al menos 6 caracteres');
    return;
  }
  if (nuevaPassword !== confirmPassword) {
    alert('Las contraseñas no coinciden');
    return;
  }

  try {
    await updatePassword(passwordActual, nuevaPassword);
    alert('Contraseña actualizada correctamente');
    qs('#credPassActual').value = '';
    qs('#credPassNueva').value = '';
    qs('#credPassConfirm').value = '';
  } catch (error) {
    alert('Error al cambiar contraseña: ' + error.message);
  }
}

/* ══════════════════════════════════════
  INICIALIZACIÓN
══════════════════════════════════════ */

function initPanelListeners() {
  const btnGuardarInfo = qs('#btnGuardarInfo');
  const btnActualizarEmail = qs('#btnActualizarEmail');
  const btnActualizarPass = qs('#btnActualizarPass');
  const btnLogout = qs('#btnLogout');

  if (btnGuardarInfo) btnGuardarInfo.addEventListener('click', guardarPerfil);
  if (btnActualizarEmail) btnActualizarEmail.addEventListener('click', cambiarEmail);
  if (btnActualizarPass) btnActualizarPass.addEventListener('click', cambiarPassword);
  if (btnLogout) btnLogout.addEventListener('click', async () => { await logout(); });

  const telInput = qs('#infoTel');
  if (telInput) {
    telInput.addEventListener('input', () => {
      // Solo números
      let val = telInput.value.replace(/\D/g, '').slice(0, 10);
      // Formato: XX XXXX XXXX
      if (val.length > 6)      val = val.slice(0,2) + ' ' + val.slice(2,6) + ' ' + val.slice(6);
      else if (val.length > 2) val = val.slice(0,2) + ' ' + val.slice(2);
      telInput.value = val;
    });
  }
}

/* ══════════════════════════════════════
  SCROLL REVEAL (AGREGAR ESTA FUNCIÓN)
══════════════════════════════════════ */

function _initScrollReveal() {
    const obs = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
            if (e.isIntersecting) {
                e.target.classList.add('visible');
            } else {
                e.target.classList.remove('visible');
            }
        });
    }, { threshold: 0.1 });

    function observeAll() {
        document.querySelectorAll('.reveal').forEach((el) => {
            if (!el.classList.contains('visible')) obs.observe(el);
        });
    }

    observeAll();
    window.addEventListener('hera:panel-activated', observeAll);
}

/* ══════════════════════════════════════
  DIRECCIONES
══════════════════════════════════════ */

function renderDirs(dirs) {
  const grid = qs('#addrGrid');
  if (!grid) return;

  if (!dirs || dirs.length === 0) {
    grid.innerHTML = `
      <div class="perfil-addr-empty">
        <div class="perfil-addr-empty-titulo">Sin direcciones guardadas</div>
        <div class="perfil-addr-empty-sub">Agrega una dirección para agilizar tus pedidos.</div>
      </div>`;
    return;
  }

grid.innerHTML = dirs.map(d => `
  <div class="perfil-addr-card" data-id="${d.id}">
    <div class="perfil-addr-info">
      <div class="perfil-addr-alias">
        ${d.alias || 'Dirección'}
        ${d.esPredeterminada ? '<span class="perfil-addr-predeterminada">Principal</span>' : ''}
      </div>
      <div class="perfil-addr-nombre">${d.nombreDestinatario || ''}</div>
      <div class="perfil-addr-linea">${d.calleNumero || ''}${d.numeroInterior ? ' ' + d.numeroInterior : ''}</div>
      <div class="perfil-addr-linea">${d.colonia || ''}, ${d.ciudad || ''}, ${d.estado || ''} CP ${d.codigoPostal || ''}</div>
      <div class="perfil-addr-tel">${d.telefonoContacto || ''}</div>
    </div>
    <div class="perfil-addr-actions">
      <button class="perfil-btn perfil-btn-outline btn-edit-dir" data-id="${d.id}">Editar</button>
      <button class="perfil-btn perfil-btn-danger btn-del-dir" data-id="${d.id}">Eliminar</button>
    </div>
  </div>`
).join('');

  qsa('.btn-edit-dir').forEach(btn => btn.addEventListener('click', () => abrirFormDir(btn.dataset.id, dirs)));
  qsa('.btn-del-dir').forEach(btn => btn.addEventListener('click', () => eliminarDir(btn.dataset.id)));
}

function abrirFormDir(id = null, dirs = []) {
  const wrap   = qs('#addrFormWrap');
  const titulo = qs('#addrFormTitulo');
  const editId = qs('#addrEditId');
  if (!wrap) return;

  // Limpiar todos los campos
  ['addrAlias','addrNombre','addrCalle','addrInterior',
  'addrColonia','addrCiudad','addrEstado','addrCP','addrTel'].forEach(id => {
    const el = qs('#' + id); if (el) el.value = '';
  });
  const check = qs('#addrPredeterminada');
  if (check) check.checked = false;

  if (id) {
    const dir = dirs.find(d => String(d.id) === String(id));
    if (dir) {
      if (qs('#addrAlias'))    qs('#addrAlias').value    = dir.alias              || '';
      if (qs('#addrNombre'))   qs('#addrNombre').value   = dir.nombreDestinatario || '';
      if (qs('#addrCalle'))    qs('#addrCalle').value    = dir.calleNumero        || '';
      if (qs('#addrInterior')) qs('#addrInterior').value = dir.numeroInterior     || '';
      if (qs('#addrColonia'))  qs('#addrColonia').value  = dir.colonia            || '';
      if (qs('#addrCiudad'))   qs('#addrCiudad').value   = dir.ciudad             || '';
      if (qs('#addrEstado'))   qs('#addrEstado').value   = dir.estado             || '';
      if (qs('#addrCP'))       qs('#addrCP').value       = dir.codigoPostal       || '';
      if (qs('#addrTel'))      qs('#addrTel').value      = dir.telefonoContacto   || '';
      if (check)               check.checked             = dir.esPredeterminada   || false;
    }
    if (editId)  editId.value      = id;
    if (titulo)  titulo.textContent = 'Editar dirección';
  } else {
    if (editId)  editId.value      = '';
    if (titulo)  titulo.textContent = 'Nueva dirección';
  }

  wrap.classList.add('show');
  wrap.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

async function eliminarDir(id) {
  if (!confirm('¿Eliminar esta dirección?')) return;
  try {
    await deleteDireccion(id);
    const dirs = await getDirecciones();
    renderDirs(dirs);
  } catch (e) {
    alert('Error al eliminar: ' + e.message);
  }
}

async function _initDirecciones() {
  try {
    const dirs = await getDirecciones();
    renderDirs(dirs);
  } catch (e) {
    console.warn('Error cargando direcciones:', e);
  }

  qs('#btnAgregarDir')?.addEventListener('click', () => abrirFormDir());

  qs('#btnCancelarDir')?.addEventListener('click', () => {
    qs('#addrFormWrap')?.classList.remove('show');
  });

  const addrTelInput = qs('#addrTel');
  if (addrTelInput) {
    addrTelInput.addEventListener('input', () => {
      let val = addrTelInput.value.replace(/\D/g, '').slice(0, 10);
      if (val.length > 6)      val = val.slice(0,2) + ' ' + val.slice(2,6) + ' ' + val.slice(6);
      else if (val.length > 2) val = val.slice(0,2) + ' ' + val.slice(2);
      addrTelInput.value = val;
    });
  }

  qs('#btnGuardarDir')?.addEventListener('click', async () => {
    const editId = qs('#addrEditId')?.value || '';

    const data = {
      alias:              qs('#addrAlias')?.value.trim()    || '',
      nombreDestinatario: qs('#addrNombre')?.value.trim()   || '',
      calleNumero:        qs('#addrCalle')?.value.trim()    || '',
      numeroInterior:     qs('#addrInterior')?.value.trim() || '',
      colonia:            qs('#addrColonia')?.value.trim()  || '',
      ciudad:             qs('#addrCiudad')?.value.trim()   || '',
      estado:             qs('#addrEstado')?.value.trim()   || '',
      codigoPostal:       qs('#addrCP')?.value.trim()       || '',
      telefonoContacto:   '+52 ' + (qs('#addrTel')?.value.trim() || ''),
      esPredeterminada:   qs('#addrPredeterminada')?.checked || false,
    };

    // Validar campos obligatorios
    if (!data.alias || !data.nombreDestinatario || !data.calleNumero ||
        !data.colonia || !data.ciudad || !data.estado || !data.codigoPostal) {
      showMsg(qs('#addrMsgErr'));
      setTimeout(() => hideMsg(qs('#addrMsgErr')), 3000);
      return;
    }

    try {
      if (editId) {
        await updateDireccion(editId, data);
      } else {
        await createDireccion(data);
      }
      qs('#addrFormWrap')?.classList.remove('show');
      showMsg(qs('#addrMsgOk'));
      setTimeout(() => hideMsg(qs('#addrMsgOk')), 3000);
      const dirs = await getDirecciones();
      renderDirs(dirs);
    } catch (e) {
      alert('Error al guardar dirección: ' + e.message);
    }
  });
}

async function initPerfilPage() {
  if (!isAuthenticated()) {
    window.location.href = 'cuenta.html';
    return;
  }

  await loadNavbar();
  loadFooterMinimo();
  await loadCartDrawer();
  await initFavDrawer();

  _initScrollReveal();
  await cargarPerfil();
  initPanelListeners();
  _initPanelSwitching();
  _initDirecciones(); // Si existe
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPerfilPage);
} else {
  initPerfilPage();
}

