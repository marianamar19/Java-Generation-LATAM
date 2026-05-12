// js/pages/perfil.js
import { loadNavbar } from '../components/navbar.js';
import { loadFooterMinimo } from '../components/footer-minimo.js';
import { loadCartDrawer } from '../components/cart-drawer.js';
import { initFavDrawer } from '../components/fav-drawer.js';
import { getPerfil, updatePerfil, updateEmail, updatePassword, isAuthenticated, logout } from '../utils/api.js';
import { formatDateLong } from '../utils/formatter.js';

// ... (funciones auxiliares: qs, qsa, getIniciales, fechaCorta, generarId, showMsg, hideMsg, _initScrollReveal)

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
  if (fTel) fTel.value = telefono;
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
  const telefono = qs('#infoTel')?.value || '';
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


async function initPerfilPage() {
  if (!isAuthenticated()) {
    window.location.href = 'cuenta.html';
    return;
  }

  await loadNavbar();
  loadFooterMinimo();
  await loadCartDrawer();
  initFavDrawer();

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

