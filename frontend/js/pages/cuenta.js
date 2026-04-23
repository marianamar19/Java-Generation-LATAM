/**
 * cuenta.js — HERA
 *
 * Descripción: Lógica exclusiva de la página Mi Cuenta (login + registro).
 *              Maneja el track deslizante entre paneles, validación de
 *              formularios, fortaleza de contraseña, toggle de visibilidad,
 *              simulación de autenticación (hasta que haya backend) y el
 *              success overlay de confirmación.
 * Exporta:     (ninguno — es el entry point de la página)
 * Importado por: pages/cuenta.html vía <script type="module">
 */

import { loadNavbar, setCatalog } from '../components/navbar.js';
import { loadFooterCuenta }       from '../components/footer-cuenta.js';
import { loadCartDrawer }         from '../components/cart-drawer.js';
import { initFavDrawer }          from '../components/fav-drawer.js';

/* ── TEMPORAL — catálogo hardcodeado por ausencia de backend
   Reemplazar por fetch('/api/productos') cuando esté disponible.
── */
const CATALOG = [
  { id: 'jenny-1',     brand: 'Jenny Rivera',        name: 'Inolvidable EDP',  price: '$1,210 MXN', badge: 'Más vendido',   tags: ['floral', 'femenino']  },
  { id: 'fierce-2',    brand: 'Abercrombie & Fitch',  name: 'Fierce EDT',       price: '$760 MXN',   tags: ['fresco', 'masculino']   },
  { id: 'authentic-3', brand: 'Abercrombie & Fitch',  name: 'Authentic EDP',    price: '$975 MXN',   badge: 'Ed. limitada', tags: ['amaderado']            },
  { id: 'signature-4', brand: 'HERA Exclusivo',        name: 'Signature Blanc',  price: '$1,490 MXN', badge: 'Nuevo',        tags: ['floral', 'blanco']     },
  { id: 'noir-5',      brand: 'HERA Exclusivo',        name: 'Noir Absolu',      price: '$1,480 MXN', badge: '-20%',         tags: ['oriental', 'amaderado']},
  { id: 'oud-6',       brand: 'Hera Árabe',            name: 'Oud Rose',         price: '$1,320 MXN', tags: ['árabe', 'oud', 'oriental'] },
];

/* ── ADMIN — Credenciales hardcodeadas para demo del panel
   Reemplazar con validación server-side en Etapa 2.
   Endpoint esperado: POST /api/auth/admin/login
── */
const ADMIN_EMAIL = 'admin-hera@hotmail.com';
const ADMIN_PASS  = 'admin';

/* ══════════════════════════════════════
   ARRANQUE — DOMContentLoaded
══════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', async function() {
  setCatalog(CATALOG);
  await loadNavbar();
  loadFooterCuenta();
  await loadCartDrawer();
  initFavDrawer();

  _initAuthScene();
  _initPasswordToggles();
  _initPasswordStrength();
  _initFormListeners();
});

/* ══════════════════════════════════════
   AUTH SCENE — track deslizante
══════════════════════════════════════ */

/**
 * Inicializa la navegación entre el panel de login y registro.
 * El track se desplaza 50% (= 100% del escenario) al activar registro.
 * @returns {void}
 */
function _initAuthScene() {
  const authScene = document.getElementById('authScene');
  const dotLogin  = document.getElementById('dot-login');
  const dotReg    = document.getElementById('dot-reg');

  const linkToRegister = document.getElementById('link-to-register');
  const linkToLogin    = document.getElementById('link-to-login');

  if (linkToRegister) {
    linkToRegister.addEventListener('click', function(e) {
      e.preventDefault();
      authScene.classList.add('show-register');
      dotLogin.classList.remove('active');
      dotReg.classList.add('active');
    });
  }

  if (linkToLogin) {
    linkToLogin.addEventListener('click', function(e) {
      e.preventDefault();
      authScene.classList.remove('show-register');
      dotLogin.classList.add('active');
      dotReg.classList.remove('active');
    });
  }
}

/* ══════════════════════════════════════
   PASSWORD TOGGLE — mostrar/ocultar
══════════════════════════════════════ */

/**
 * Inicializa los botones que alternan la visibilidad de los campos password.
 * Lee el target desde data-pwd-target del botón.
 * @returns {void}
 */
function _initPasswordToggles() {
  document.querySelectorAll('.pwd-toggle').forEach(function(btn) {
    btn.addEventListener('click', function() {
      const targetId = btn.dataset.pwdTarget;
      const input    = document.getElementById(targetId);
      if (!input) return;
      input.type = input.type === 'password' ? 'text' : 'password';
    });
  });
}

/* ══════════════════════════════════════
   PASSWORD STRENGTH — fortaleza visual
══════════════════════════════════════ */

/**
 * Inicializa el indicador de fortaleza de contraseña en el panel de registro.
 * Actualiza las barras y la etiqueta en tiempo real.
 * @returns {void}
 */
function _initPasswordStrength() {
  const regPass = document.getElementById('reg-pass');
  if (!regPass) return;

  regPass.addEventListener('input', function() {
    _updatePasswordStrength(regPass.value);
    _checkPasswordMatch();
  });

  const regPass2 = document.getElementById('reg-pass2');
  if (regPass2) {
    regPass2.addEventListener('input', _checkPasswordMatch);
  }
}

/**
 * Calcula la fortaleza de la contraseña y actualiza las barras visuales.
 * @param {string} val - Valor actual del campo de contraseña
 * @returns {void}
 */
function _updatePasswordStrength(val) {
  var score = 0;
  if (val.length >= 8)              score++;
  if (/[A-Z]/.test(val))            score++;
  if (/[0-9]/.test(val))            score++;
  if (/[^A-Za-z0-9]/.test(val))     score++;

  var levels = ['', 'weak', 'fair', 'good', 'strong'];
  var labels = ['', 'Débil', 'Regular', 'Buena', 'Fuerte'];

  var bars  = [document.getElementById('b1'), document.getElementById('b2'),
               document.getElementById('b3'), document.getElementById('b4')];
  var label = document.getElementById('pwd-label');

  bars.forEach(function(b, i) {
    if (!b) return;
    b.className = 'pwd-bar' + (i < score ? ' ' + levels[score] : '');
  });
  if (label) label.textContent = val.length > 0 ? labels[score] : '';
}

/**
 * Verifica si las contraseñas coinciden y muestra el icono correspondiente.
 * @returns {boolean} true si coinciden
 */
function _checkPasswordMatch() {
  var p1  = document.getElementById('reg-pass');
  var p2  = document.getElementById('reg-pass2');
  var ico = document.getElementById('match-icon');
  if (!p1 || !p2 || !ico) return true;

  if (!p2.value) { ico.style.display = 'none'; return false; }

  var match = p1.value === p2.value;
  ico.style.display    = 'inline';
  ico.className        = 'val-icon ' + (match ? 'val-icon-ok' : 'val-icon-err');
  ico.textContent      = match ? '✓' : '✕';
  p2.classList.toggle('success', match);
  p2.classList.toggle('error',  !match);
  return match;
}

/* ══════════════════════════════════════
   VALIDACIÓN DE FORMULARIOS
══════════════════════════════════════ */

/**
 * Muestra un error en un campo.
 * @param {string} inputId - ID del input
 * @param {string} errId   - ID del elemento de error
 * @param {string} msg     - Mensaje de error
 */
function _setErr(inputId, errId, msg) {
  document.getElementById(inputId).classList.add('error');
  var e = document.getElementById(errId);
  e.textContent = msg;
  e.classList.add('show');
}

/**
 * Limpia el error de un campo.
 * @param {string} inputId - ID del input
 * @param {string} errId   - ID del elemento de error
 */
function _clrErr(inputId, errId) {
  document.getElementById(inputId).classList.remove('error');
  document.getElementById(errId).classList.remove('show');
}

/**
 * Valida el formulario según el tipo indicado.
 * @param {string} type - 'login' | 'register'
 * @returns {boolean} true si pasa la validación
 */
function _validate(type) {
  var ok = true;

  function isEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }

  if (type === 'login') {
    _clrErr('login-email', 'err-login-email');
    _clrErr('login-pass',  'err-login-pass');
    if (!isEmail(document.getElementById('login-email').value.trim()))
      { _setErr('login-email','err-login-email','Ingresa un email válido.'); ok = false; }
    if (!document.getElementById('login-pass').value)
      { _setErr('login-pass','err-login-pass','Este campo es obligatorio.'); ok = false; }
  }

  if (type === 'register') {
    _clrErr('reg-name',  'err-reg-name');
    _clrErr('reg-email', 'err-reg-email');
    _clrErr('reg-pass',  'err-reg-pass');
    if (!document.getElementById('reg-name').value.trim())
      { _setErr('reg-name','err-reg-name','Este campo es obligatorio.'); ok = false; }
    if (!isEmail(document.getElementById('reg-email').value.trim()))
      { _setErr('reg-email','err-reg-email','Ingresa un email válido.'); ok = false; }
    if (!document.getElementById('reg-pass').value)
      { _setErr('reg-pass','err-reg-pass','Este campo es obligatorio.'); ok = false; }
    if (!_checkPasswordMatch()) ok = false;
  }

  return ok;
}

/* ══════════════════════════════════════
   SUBMIT — simulación de autenticación
══════════════════════════════════════ */

/**
 * Procesa el submit del formulario: valida, simula loading, maneja
 * acceso admin y muestra el success overlay.
 * @param {string} type - 'login' | 'register' | 'guest'
 * @returns {void}
 */
function _submitForm(type) {
  if (type !== 'guest' && !_validate(type)) return;

  var btnId = type === 'login' ? 'btn-login' : (type === 'register' ? 'btn-register' : null);
  var btn   = btnId ? document.getElementById(btnId) : null;
  var d     = 0;
  var pTimer;

  // Feedback visual de carga en el botón
  if (btn) {
    btn.disabled = true;
    pTimer = setInterval(function() {
      d = (d + 1) % 4;
      btn.textContent = 'PROCESANDO' + '.'.repeat(d);
    }, 380);
  }

  setTimeout(function() {
    if (btn) {
      clearInterval(pTimer);
      btn.disabled    = false;
      btn.textContent = type === 'login' ? 'INICIAR SESIÓN' : 'CREAR CUENTA';
    }

    /* ── ADMIN — verificar credenciales de administrador
       Si coinciden → guardar sesión admin y redirigir al panel.
       Si no coinciden → flujo normal del cliente sin cambios.
    ── */
    if (type === 'login') {
      var inputEmail = document.getElementById('login-email').value.trim();
      var inputPass  = document.getElementById('login-pass').value;
      if (inputEmail === ADMIN_EMAIL && inputPass === ADMIN_PASS) {
        try {
          localStorage.setItem('hera_admin_auth', JSON.stringify({
            loggedIn:  true,
            loginTime: new Date().toISOString()
          }));
        } catch (e) { /* silencioso */ }
        window.location.href = 'admin/dashboard.html';
        return;
      }
    }

    /* ── TEMPORAL — simulación de sesión por ausencia de backend
       Reemplazar localStorage.setItem por llamada al endpoint de autenticación.
       Endpoint esperado: POST /api/auth/login | POST /api/auth/register
    ── */
    if (type === 'login' || type === 'register') {
      localStorage.setItem('hera_logged_in', '1');
    }

    // Mostrar success overlay
    var ov  = document.getElementById('successOverlay');
    var ey  = document.getElementById('success-eyebrow');
    var mg  = document.getElementById('success-msg');
    var lnk = document.getElementById('success-link');

    if (type === 'login')         { ey.textContent = 'Sesión iniciada'; mg.textContent = 'Bienvenido de vuelta.'; }
    else if (type === 'register') { ey.textContent = 'Cuenta creada';   mg.textContent = 'Bienvenido a HERA.'; }
    else                          { ey.textContent = 'Modo invitado';   mg.textContent = 'Explorando como invitado.'; }

    // El display del link es estado dinámico — válido en JS
    if (lnk) lnk.style.display = 'block';
    ov.classList.add('show');
    ov.addEventListener('click', function() { ov.classList.remove('show'); }, { once: true });

    setTimeout(function() {
      ov.classList.remove('show');
      if (type !== 'guest') setTimeout(function() { window.location.href = 'index.html'; }, 350);
    }, 2800);

  }, type === 'guest' ? 400 : 2000);
}

/* ══════════════════════════════════════
   LISTENERS — limpiar errores en tiempo real y submit
══════════════════════════════════════ */

/**
 * Enlaza los listeners de los botones de submit y de limpieza de errores.
 * @returns {void}
 */
function _initFormListeners() {
  // Limpiar errores al escribir
  var fieldMap = {
    'login-email': 'err-login-email',
    'login-pass':  'err-login-pass',
    'reg-name':    'err-reg-name',
    'reg-email':   'err-reg-email',
    'reg-pass':    'err-reg-pass'
  };
  Object.keys(fieldMap).forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.addEventListener('input', function() { _clrErr(id, fieldMap[id]); });
  });

  // Submit buttons
  var btnLogin    = document.getElementById('btn-login');
  var btnRegister = document.getElementById('btn-register');
  var btnGuest    = document.getElementById('btn-guest');

  if (btnLogin)    btnLogin.addEventListener('click',    function() { _submitForm('login'); });
  if (btnRegister) btnRegister.addEventListener('click', function() { _submitForm('register'); });
  if (btnGuest)    btnGuest.addEventListener('click',    function() { _submitForm('guest'); });
}
