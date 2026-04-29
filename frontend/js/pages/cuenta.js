/**
 * cuenta_v1.js — HERA
 *
 * Descripción: Lógica exclusiva de la página Mi Cuenta (login + registro).
 *              Maneja el track deslizante entre paneles, validación de
 *              formularios, fortaleza de contraseña, toggle de visibilidad,
 *              sistema de gestión de usuarios en localStorage, simulación
 *              de autenticación (hasta que haya backend) y el success
 *              overlay de confirmación.
 * Exporta:     initCuentaPage, switchToLogin, switchToRegister, submitForm
 * Importado por: pages/cuenta.html vía <script type="module">
 */
 
import { loadNavbar }       from '../components/navbar.js';
import { loadFooterMinimo } from '../components/footer-minimo.js';
import { loadCartDrawer }   from '../components/cart-drawer.js';
import { initFavDrawer }    from '../components/fav-drawer.js';
import {
  isLoggedIn,
  setLoggedIn,
  getCurrentUser,
  setCurrentUser,
  getUsersList,
  saveUsersList
} from '../utils/storage.js';
 
/* ── ADMIN — Credenciales hardcodeadas para demo del panel
   Reemplazar con validación server-side en Etapa 2.
   Endpoint esperado: POST /api/auth/admin/login
── */
const ADMIN_EMAIL = 'admin-hera@hotmail.com';
const ADMIN_PASS  = 'admin';
 
/* Variable de control para el intervalo de loading en el botón */
let processingTimer = null;
 
/* ══════════════════════════════════════
   ADMIN DEFAULT
══════════════════════════════════════ */
 
/**
 * Crea el usuario administrador por defecto en la lista de usuarios
 * si aún no existe. Se ejecuta al cargar la página.
 * @returns {void}
 */
function createDefaultAdmin() {
  const users      = getUsersList();
  const adminExists = users.some(u => u.email === ADMIN_EMAIL);
 
  if (!adminExists) {
    users.push({
      id:        'admin-001',
      name:      'Administrador HERA',
      email:     ADMIN_EMAIL,
      password:  ADMIN_PASS,
      role:      'admin',
      createdAt: new Date().toISOString(),
      lastLogin: null
    });
    saveUsersList(users);
  }
}
 
/* ══════════════════════════════════════
   AUTH SCENE — track deslizante
══════════════════════════════════════ */
 
/**
 * Activa el panel de registro desplazando el track al 50%.
 * @returns {void}
 */
function switchToRegister() {
  const authScene = document.getElementById('authScene');
  const dotLogin  = document.getElementById('dot-login');
  const dotReg    = document.getElementById('dot-reg');
 
  if (authScene) authScene.classList.add('show-register');
  if (dotLogin)  dotLogin.classList.remove('active');
  if (dotReg)    dotReg.classList.add('active');
}
 
/**
 * Regresa al panel de login desplazando el track a su posición inicial.
 * @returns {void}
 */
function switchToLogin() {
  const authScene = document.getElementById('authScene');
  const dotLogin  = document.getElementById('dot-login');
  const dotReg    = document.getElementById('dot-reg');
 
  if (authScene) authScene.classList.remove('show-register');
  if (dotLogin)  dotLogin.classList.add('active');
  if (dotReg)    dotReg.classList.remove('active');
}
 
/* ══════════════════════════════════════
   PASSWORD TOGGLE — mostrar/ocultar
══════════════════════════════════════ */
 
/**
 * Alterna la visibilidad del campo contraseña y actualiza el ícono del botón.
 * @param {string}      inputId - ID del campo password
 * @param {HTMLElement} btn     - Botón que disparó el toggle
 * @returns {void}
 */
function togglePassword(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
 
  const isPassword = input.type === 'password';
  input.type = isPassword ? 'text' : 'password';
 
  btn.innerHTML = isPassword
    ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>'
    : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
}
 
/* ══════════════════════════════════════
   PASSWORD STRENGTH — fortaleza visual
══════════════════════════════════════ */
 
/**
 * Calcula la fortaleza de la contraseña y actualiza las barras visuales.
 * @param {string} password - Valor actual del campo contraseña
 * @returns {void}
 */
function updateStrengthMeter(password) {
  const bars  = ['b1', 'b2', 'b3', 'b4'].map(id => document.getElementById(id));
  const label = document.getElementById('pwd-label');
 
  if (!bars[0]) return;
 
  // Resetear todas las barras
  bars.forEach(bar => { if (bar) bar.className = 'pwd-bar'; });
 
  if (!password) {
    if (label) label.textContent = '';
    return;
  }
 
  let score = 0;
  if (password.length >= 8)          score++;
  if (/[A-Z]/.test(password))        score++;
  if (/[0-9]/.test(password))        score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
 
  const levels = ['weak', 'fair', 'good', 'strong'];
  const labels = ['Débil', 'Regular', 'Fuerte', 'Muy fuerte'];
 
  for (let i = 0; i < score; i++) {
    if (bars[i]) bars[i].classList.add(levels[score - 1]);
  }
 
  if (label) label.textContent = `Fortaleza: ${labels[score - 1] || ''}`;
}
 
/**
 * Verifica si las contraseñas coinciden y actualiza el ícono y el mensaje de error.
 * @returns {boolean} true si coinciden o si el segundo campo está vacío
 */
function checkPasswordsMatch() {
  const pass1   = document.getElementById('reg-pass');
  const pass2   = document.getElementById('reg-pass2');
  const icon    = document.getElementById('match-icon');
  const errorEl = document.getElementById('err-reg-pass2');
 
  if (!pass1 || !pass2) return true;
 
  if (!pass2.value) {
    if (icon)    icon.style.display = 'none';
    if (errorEl) errorEl.classList.remove('show');
    return true;
  }
 
  const isMatch = pass1.value === pass2.value;
 
  if (icon) {
    icon.style.display = 'inline';
    icon.innerHTML = isMatch
      ? '<span class="val-icon-ok">✓</span>'
      : '<span class="val-icon-err">✗</span>';
  }
 
  if (errorEl) {
    isMatch ? errorEl.classList.remove('show') : errorEl.classList.add('show');
  }
 
  pass2.classList.toggle('success',  isMatch);
  pass2.classList.toggle('error',   !isMatch);
 
  return isMatch;
}
 
/* ══════════════════════════════════════
   VALIDACIÓN DE FORMULARIOS
══════════════════════════════════════ */
 
/**
 * Limpia el estado de error de un campo.
 * @param {string} inputId - ID del input
 * @param {string} errorId - ID del elemento de error
 */
function clearError(inputId, errorId) {
  const input = document.getElementById(inputId);
  const error = document.getElementById(errorId);
  if (input) input.classList.remove('error');
  if (error) error.classList.remove('show');
}
 
/**
 * Muestra un error en un campo.
 * @param {string} inputId - ID del input
 * @param {string} errorId - ID del elemento de error
 * @param {string} message - Mensaje de error a mostrar
 */
function setError(inputId, errorId, message) {
  const input = document.getElementById(inputId);
  const error = document.getElementById(errorId);
  if (input) input.classList.add('error');
  if (error) { error.textContent = message; error.classList.add('show'); }
}
 
/**
 * @param {string} email
 * @returns {boolean}
 */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
 
/**
 * Valida el formulario de login.
 * @returns {boolean} true si pasa la validación
 */
function validateLogin() {
  let isValid = true;
 
  clearError('login-email', 'err-login-email');
  clearError('login-pass',  'err-login-pass');
 
  const email = document.getElementById('login-email')?.value.trim() || '';
  const pass  = document.getElementById('login-pass')?.value          || '';
 
  if (!isValidEmail(email)) {
    setError('login-email', 'err-login-email', 'Ingresa un email válido.');
    isValid = false;
  }
  if (!pass) {
    setError('login-pass', 'err-login-pass', 'Este campo es obligatorio.');
    isValid = false;
  }
 
  return isValid;
}
 
/**
 * Valida el formulario de registro.
 * @returns {boolean} true si pasa la validación
 */
function validateRegister() {
  let isValid = true;
 
  clearError('reg-name',  'err-reg-name');
  clearError('reg-email', 'err-reg-email');
  clearError('reg-pass',  'err-reg-pass');
 
  const name  = document.getElementById('reg-name')?.value.trim()  || '';
  const email = document.getElementById('reg-email')?.value.trim() || '';
  const pass  = document.getElementById('reg-pass')?.value          || '';
 
  if (!name) {
    setError('reg-name', 'err-reg-name', 'Este campo es obligatorio.');
    isValid = false;
  }
  if (!isValidEmail(email)) {
    setError('reg-email', 'err-reg-email', 'Ingresa un email válido.');
    isValid = false;
  }
  if (!pass) {
    setError('reg-pass', 'err-reg-pass', 'Este campo es obligatorio.');
    isValid = false;
  }
  if (!checkPasswordsMatch()) isValid = false;
 
  return isValid;
}
 
/* ══════════════════════════════════════
   GESTIÓN DE USUARIOS
══════════════════════════════════════ */
 
/**
 * Registra un nuevo usuario en la lista de localStorage.
 * @param {string} name     - Nombre del usuario
 * @param {string} email    - Email del usuario
 * @param {string} password - Contraseña
 * @returns {Object|null} El usuario creado, o null si el email ya existe
 */
function registerUser(name, email, password) {
  const users = getUsersList();
 
  if (users.some(u => u.email === email.toLowerCase())) {
    alert('Este correo ya está registrado. Por favor, inicia sesión.');
    return null;
  }
 
  const newUser = {
    id:        Date.now().toString(),
    name:      name.trim(),
    email:     email.toLowerCase().trim(),
    password:  password,
    role:      'user',
    createdAt: new Date().toISOString(),
    lastLogin: null
  };
 
  users.push(newUser);
  saveUsersList(users);
  return newUser;
}
 
/**
 * Busca al usuario en la lista y actualiza su lastLogin si las credenciales son correctas.
 * @param {string} email    - Email ingresado
 * @param {string} password - Contraseña ingresada
 * @returns {Object|null} El usuario encontrado, o null si las credenciales no coinciden
 */
function loginUser(email, password) {
  const users = getUsersList();
  const user  = users.find(u => u.email === email.toLowerCase() && u.password === password);
 
  if (user) {
    user.lastLogin = new Date().toISOString();
    saveUsersList(users);
    setLoggedIn(true);
    setCurrentUser({
      id:        user.id,
      name:      user.name,
      email:     user.email,
      role:      user.role || 'user',
      lastLogin: user.lastLogin
    });
    return user;
  }
 
  return null;
}
 
/* ══════════════════════════════════════
   SUCCESS OVERLAY
══════════════════════════════════════ */
 
/**
 * Muestra el overlay de confirmación con el mensaje indicado y,
 * opcionalmente, redirige a una URL tras 2.8 s.
 * @param {string}  title       - Eyebrow del overlay
 * @param {string}  message     - Cuerpo del mensaje
 * @param {boolean} [redirect=true]          - Si debe redirigir al cerrarse
 * @param {string}  [redirectUrl='index.html'] - URL de destino
 * @returns {void}
 */
function showSuccessOverlay(title, message, redirect = true, redirectUrl = 'index.html') {
  const overlay = document.getElementById('successOverlay');
  const eyebrow = document.getElementById('success-eyebrow');
  const msg     = document.getElementById('success-msg');
  const link    = document.getElementById('success-link');
 
  if (!overlay) return;
 
  if (eyebrow) eyebrow.textContent = title;
  if (msg)     msg.textContent     = message;
  if (link)  { link.style.display  = 'block'; link.href = redirectUrl; }
 
  overlay.classList.add('show');
  overlay.addEventListener('click', () => overlay.classList.remove('show'), { once: true });
 
  if (redirect) {
    setTimeout(() => {
      overlay.classList.remove('show');
      setTimeout(() => { window.location.href = redirectUrl; }, 350);
    }, 2800);
  } else {
    setTimeout(() => overlay.classList.remove('show'), 2800);
  }
}
 
/* ══════════════════════════════════════
   SUBMIT — autenticación y registro
══════════════════════════════════════ */
 
/**
 * Procesa el submit del formulario: valida, simula loading en el botón,
 * ejecuta la lógica de autenticación/registro y muestra el success overlay.
 * @param {string} type - 'login' | 'register' | 'guest'
 * @returns {void}
 */
function submitForm(type) {
  if (type !== 'guest') {
    const isValid = type === 'login' ? validateLogin() : validateRegister();
    if (!isValid) return;
  }
 
  const btnId = type === 'login' ? 'btn-login' : (type === 'register' ? 'btn-register' : null);
  const btn   = btnId ? document.getElementById(btnId) : null;
  let dotCount = 0;
 
  // Feedback visual de carga en el botón
  if (btn) {
    btn.disabled    = true;
    processingTimer = setInterval(() => {
      dotCount = (dotCount + 1) % 4;
      const dots = '.'.repeat(dotCount);
      btn.textContent = type === 'login' ? `PROCESANDO${dots}` : `CREANDO CUENTA${dots}`;
    }, 380);
  }
 
  setTimeout(() => {
    if (processingTimer) clearInterval(processingTimer);
    if (btn) {
      btn.disabled    = false;
      btn.textContent = type === 'login' ? 'INICIAR SESIÓN' : 'CREAR CUENTA';
    }
 
    let successTitle = '';
    let successMsg   = '';
    let shouldRedirect = true;
    let redirectUrl    = 'index.html';
 
    if (type === 'login') {
      const email = document.getElementById('login-email')?.value.trim() || '';
      const pass  = document.getElementById('login-pass')?.value          || '';
 
      /* ── ADMIN — verificar credenciales de administrador
         Si coinciden → guardar sesión admin y redirigir al panel.
      ── */
      if (email === ADMIN_EMAIL && pass === ADMIN_PASS) {
        setLoggedIn(true);
        setCurrentUser({
          id:        'admin-001',
          name:      'Administrador HERA',
          email:     ADMIN_EMAIL,
          role:      'admin',
          lastLogin: new Date().toISOString()
        });
        /* Guardar sesión admin — requerido por guardAdmin() en dashboard.js */
        localStorage.setItem('hera_admin_auth', JSON.stringify({ loggedIn: true }));
        showSuccessOverlay(
          'Acceso Admin',
          'Bienvenido al panel de administración.',
          true,
          '/pages/admin/dashboard.html'
        );
        return;
      }
 
      /* ── LOGIN NORMAL — buscar usuario en la lista ── */
      const user = loginUser(email, pass);
      if (!user) {
        setError('login-email', 'err-login-email', 'Correo o contraseña incorrectos.');
        setError('login-pass',  'err-login-pass',  'Correo o contraseña incorrectos.');
        return;
      }
 
      successTitle = 'Sesión iniciada';
      successMsg   = `Bienvenido de vuelta, ${user.name}.`;
 
    } else if (type === 'register') {
      const name  = document.getElementById('reg-name')?.value.trim()  || '';
      const email = document.getElementById('reg-email')?.value.trim() || '';
      const pass  = document.getElementById('reg-pass')?.value          || '';
 
      const newUser = registerUser(name, email, pass);
      if (!newUser) return;
 
      setLoggedIn(true);
      setCurrentUser({
        id:        newUser.id,
        name:      newUser.name,
        email:     newUser.email,
        role:      'user',
        createdAt: newUser.createdAt
      });
 
      successTitle = 'Cuenta creada';
      successMsg   = `Bienvenido a HERA, ${newUser.name}.`;
 
    } else {
      /* ── MODO INVITADO — sin sesión ── */
      setLoggedIn(false);
      setCurrentUser(null);
      successTitle   = 'Modo invitado';
      successMsg     = 'Explorando como invitado.';
      shouldRedirect = false;
    }
 
    showSuccessOverlay(successTitle, successMsg, shouldRedirect, redirectUrl);
 
  }, type === 'guest' ? 400 : 2000);
}
 
/* ══════════════════════════════════════
   LISTENERS — errores en tiempo real y submit
══════════════════════════════════════ */
 
/**
 * Enlaza todos los listeners de la página:
 * cambio de panel, password toggles, fortaleza, coincidencia,
 * limpieza de errores y botones de submit.
 * @returns {void}
 */
function initEventListeners() {
  // Cambio de panel
  const linkToRegister = document.getElementById('link-to-register');
  const linkToLogin    = document.getElementById('link-to-login');
  if (linkToRegister) linkToRegister.addEventListener('click', e => { e.preventDefault(); switchToRegister(); });
  if (linkToLogin)    linkToLogin.addEventListener('click',    e => { e.preventDefault(); switchToLogin(); });
 
  // Password toggles — actualiza ícono SVG
  document.querySelectorAll('.pwd-toggle').forEach(btn => {
    const targetId = btn.dataset.pwdTarget;
    if (targetId) btn.addEventListener('click', () => togglePassword(targetId, btn));
  });
 
  // Fortaleza de contraseña + verificación de coincidencia al escribir en reg-pass
  const regPass = document.getElementById('reg-pass');
  if (regPass) {
    regPass.addEventListener('input', () => {
      updateStrengthMeter(regPass.value);
      checkPasswordsMatch();
    });
  }
 
  // Verificación de coincidencia al escribir en reg-pass2
  const regPass2 = document.getElementById('reg-pass2');
  if (regPass2) regPass2.addEventListener('input', checkPasswordsMatch);
 
  // Limpiar errores al escribir en cualquier campo
  const errorMap = {
    'login-email': 'err-login-email',
    'login-pass':  'err-login-pass',
    'reg-name':    'err-reg-name',
    'reg-email':   'err-reg-email',
    'reg-pass':    'err-reg-pass',
    'reg-pass2':   'err-reg-pass2'
  };
  Object.entries(errorMap).forEach(([inputId, errorId]) => {
    const input = document.getElementById(inputId);
    if (input) input.addEventListener('input', () => clearError(inputId, errorId));
  });
 
  // Submit buttons
  const btnLogin    = document.getElementById('btn-login');
  const btnRegister = document.getElementById('btn-register');
  const btnGuest    = document.getElementById('btn-guest');
 
  if (btnLogin)    btnLogin.addEventListener('click',    () => submitForm('login'));
  if (btnRegister) btnRegister.addEventListener('click', () => submitForm('register'));
  if (btnGuest)    btnGuest.addEventListener('click',    () => submitForm('guest'));
}
 
/* ══════════════════════════════════════
   ARRANQUE — inicialización de la página
══════════════════════════════════════ */
 
/**
 * Punto de entrada de la página Mi Cuenta.
 * Crea el admin por defecto, carga los componentes y enlaza los listeners.
 * Si el usuario ya tiene sesión activa, redirige directamente a index.html.
 * @returns {Promise<void>}
 */
async function initCuentaPage() {
  createDefaultAdmin();
 
  await loadNavbar();
  await loadFooterMinimo();
  await loadCartDrawer();
  initFavDrawer();
 
  initEventListeners();
 
  /* ── TEMPORAL — simulación de sesión por ausencia de backend
     Reemplazar con llamada al endpoint de autenticación.
     Endpoint esperado: POST /api/auth/login | POST /api/auth/register
  ── */
  if (isLoggedIn() && getCurrentUser()) {
    const currentUser = getCurrentUser();
    if (currentUser.role === 'admin') {
      window.location.replace('/pages/admin/dashboard.html');
    } else {
      window.location.replace('/pages/index.html');
    }
  }
}
 
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCuentaPage);
} else {
  initCuentaPage();
}
 
export { initCuentaPage, switchToLogin, switchToRegister, submitForm };