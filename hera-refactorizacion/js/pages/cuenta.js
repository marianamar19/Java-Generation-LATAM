/**
 * cuenta.js — HERA Page
 * 
 * Descripción: Lógica exclusiva de la página de autenticación (login/registro).
 * Maneja navegación entre paneles, validación de formularios, fortaleza de contraseña,
 * y simulación de autenticación (temporal hasta integrar backend).
 * Exporta: initCuentaPage
 * Importado por: pages/cuenta.html
 */

import { setLoggedIn, isLoggedIn } from '../utils/storage.js';
import { initNavbar, loadNavbar, renderAccountNav } from '../components/navbar.js';
import { initCartDrawer } from '../components/cart-drawer.js';
import { initFavDrawer } from '../components/fav-drawer.js';
import { initSearch } from '../components/search.js';
import { initMobileNav, renderMobileAccount } from '../components/mobile-nav.js';
import { loadFooterCuenta } from '../components/footer-cuenta.js';

// Referencias DOM del scene
let authScene = null;
let dotLogin = null;
let dotReg = null;
let linkToRegister = null;
let linkToLogin = null;

// Referencias de formularios
let loginEmail = null;
let loginPass = null;
let regName = null;
let regEmail = null;
let regPass = null;
let regPass2 = null;

// Timeout para simulación
let processingTimer = null;

/* ═══════════════════════════════════════════════════════════
   PANEL SWITCHING - Navegación entre Login y Registro
   ═══════════════════════════════════════════════════════════ */

/**
 * Cambia al panel de registro.
 */
function switchToRegister() {
  if (!authScene) return;
  authScene.classList.add('show-register');
  if (dotLogin) dotLogin.classList.remove('active');
  if (dotReg) dotReg.classList.add('active');
  
  // Scroll al top del panel
  const panelRegister = document.getElementById('panelRegister');
  if (panelRegister) panelRegister.scrollTop = 0;
}

/**
 * Cambia al panel de login.
 */
function switchToLogin() {
  if (!authScene) return;
  authScene.classList.remove('show-register');
  if (dotLogin) dotLogin.classList.add('active');
  if (dotReg) dotReg.classList.remove('active');
  
  // Scroll al top del panel
  const panelLogin = document.getElementById('panelLogin');
  if (panelLogin) panelLogin.scrollTop = 0;
}

/* ═══════════════════════════════════════════════════════════
   PASSWORD TOGGLE - Mostrar/ocultar contraseña
   ═══════════════════════════════════════════════════════════ */

/**
 * Alterna la visibilidad de un campo de contraseña.
 * @param {string} inputId - ID del input
 * @param {HTMLElement} btn - Botón que disparó la acción
 */
function togglePasswordVisibility(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  
  const isPassword = input.type === 'password';
  input.type = isPassword ? 'text' : 'password';
  
  // Cambiar ícono
  btn.innerHTML = isPassword
    ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>'
    : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
}

/* ═══════════════════════════════════════════════════════════
   PASSWORD STRENGTH - Medidor de fortaleza de contraseña
   ═══════════════════════════════════════════════════════════ */

/**
 * Evalúa la fortaleza de una contraseña.
 * @param {string} password - Contraseña a evaluar
 * @returns {Object} { score: number, label: string, level: string }
 */
function evaluatePasswordStrength(password) {
  if (!password) return { score: 0, label: '', level: '' };
  
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  
  const levels = ['weak', 'fair', 'good', 'strong'];
  const labels = ['Débil', 'Regular', 'Fuerte', 'Muy fuerte'];
  const level = levels[score - 1] || '';
  const label = labels[score - 1] || '';
  
  return { score, label, level };
}

/**
 * Actualiza la UI del medidor de fortaleza.
 * @param {string} password - Contraseña actual
 */
function updateStrengthMeter(password) {
  const bars = ['b1', 'b2', 'b3', 'b4'].map(id => document.getElementById(id));
  const labelEl = document.getElementById('pwd-label');
  
  if (!bars.some(b => b)) return;
  
  // Resetear clases
  bars.forEach(bar => {
    if (bar) bar.className = 'pwd-bar';
  });
  
  if (!password) {
    if (labelEl) labelEl.textContent = '';
    return;
  }
  
  const { score, label } = evaluatePasswordStrength(password);
  const levels = ['weak', 'fair', 'good', 'strong'];
  
  for (let i = 0; i < score; i++) {
    if (bars[i]) bars[i].classList.add(levels[score - 1]);
  }
  
  if (labelEl) labelEl.textContent = `Fortaleza: ${label}`;
}

/* ═══════════════════════════════════════════════════════════
   PASSWORD MATCH - Validación de coincidencia
   ═══════════════════════════════════════════════════════════ */

/**
 * Verifica si las contraseñas coinciden.
 * @returns {boolean}
 */
function checkPasswordsMatch() {
  if (!regPass || !regPass2) return true;
  
  const p1 = regPass.value;
  const p2 = regPass2.value;
  const icon = document.getElementById('match-icon');
  const errorEl = document.getElementById('err-reg-pass2');
  
  if (!p2) {
    regPass2.classList.remove('error', 'success');
    if (icon) icon.style.display = 'none';
    if (errorEl) errorEl.classList.remove('show');
    return true;
  }
  
  if (p1 === p2) {
    regPass2.classList.add('success');
    regPass2.classList.remove('error');
    if (icon) {
      icon.innerHTML = '<span class="val-icon-ok">✓</span>';
      icon.style.display = 'block';
    }
    if (errorEl) errorEl.classList.remove('show');
    return true;
  }
  
  regPass2.classList.add('error');
  regPass2.classList.remove('success');
  if (icon) {
    icon.innerHTML = '<span class="val-icon-err">✗</span>';
    icon.style.display = 'block';
  }
  if (errorEl) errorEl.classList.add('show');
  return false;
}

/* ═══════════════════════════════════════════════════════════
   FORM VALIDATION - Validación de campos
   ═══════════════════════════════════════════════════════════ */

/**
 * Limpia errores de un campo específico.
 * @param {string} inputId - ID del input
 * @param {string} errorId - ID del elemento de error
 */
function clearFieldError(inputId, errorId) {
  const input = document.getElementById(inputId);
  const error = document.getElementById(errorId);
  if (input) input.classList.remove('error');
  if (error) error.classList.remove('show');
}

/**
 * Establece error en un campo.
 * @param {string} inputId - ID del input
 * @param {string} errorId - ID del elemento de error
 * @param {string} message - Mensaje de error
 */
function setFieldError(inputId, errorId, message) {
  const input = document.getElementById(inputId);
  const error = document.getElementById(errorId);
  if (input) input.classList.add('error');
  if (error) {
    error.textContent = message;
    error.classList.add('show');
  }
}

/**
 * Valida un email.
 * @param {string} email - Email a validar
 * @returns {boolean}
 */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Valida el formulario de login.
 * @returns {boolean}
 */
function validateLogin() {
  let isValid = true;
  
  clearFieldError('login-email', 'err-login-email');
  clearFieldError('login-pass', 'err-login-pass');
  
  if (!loginEmail || !loginPass) return false;
  
  if (!isValidEmail(loginEmail.value.trim())) {
    setFieldError('login-email', 'err-login-email', 'Ingresa un email válido.');
    isValid = false;
  }
  
  if (!loginPass.value) {
    setFieldError('login-pass', 'err-login-pass', 'Este campo es obligatorio.');
    isValid = false;
  }
  
  return isValid;
}

/**
 * Valida el formulario de registro.
 * @returns {boolean}
 */
function validateRegister() {
  let isValid = true;
  
  clearFieldError('reg-name', 'err-reg-name');
  clearFieldError('reg-email', 'err-reg-email');
  clearFieldError('reg-pass', 'err-reg-pass');
  
  if (!regName || !regEmail || !regPass || !regPass2) return false;
  
  if (!regName.value.trim()) {
    setFieldError('reg-name', 'err-reg-name', 'Este campo es obligatorio.');
    isValid = false;
  }
  
  if (!isValidEmail(regEmail.value.trim())) {
    setFieldError('reg-email', 'err-reg-email', 'Ingresa un email válido.');
    isValid = false;
  }
  
  if (!regPass.value) {
    setFieldError('reg-pass', 'err-reg-pass', 'Este campo es obligatorio.');
    isValid = false;
  }
  
  if (!checkPasswordsMatch()) {
    isValid = false;
  }
  
  return isValid;
}

/* ═══════════════════════════════════════════════════════════
   SUBMIT HANDLERS - Envío de formularios (simulación temporal)
   ═══════════════════════════════════════════════════════════ */

/**
 * Muestra el overlay de éxito.
 * @param {string} title - Título del mensaje
 * @param {string} message - Mensaje de éxito
 * @param {boolean} redirect - Si debe redirigir después
 */
function showSuccessOverlay(title, message, redirect = true) {
  const overlay = document.getElementById('successOverlay');
  const eyebrow = document.getElementById('success-eyebrow');
  const msg = document.getElementById('success-msg');
  const link = document.getElementById('success-link');
  
  if (!overlay) return;
  
  if (eyebrow) eyebrow.textContent = title;
  if (msg) msg.textContent = message;
  if (link) link.style.display = 'block';
  
  overlay.classList.add('show');
  
  // Cerrar al hacer click
  overlay.addEventListener('click', () => {
    overlay.classList.remove('show');
  }, { once: true });
  
  // Redirigir después de 2.8 segundos
  if (redirect) {
    setTimeout(() => {
      overlay.classList.remove('show');
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 350);
    }, 2800);
  } else {
    setTimeout(() => {
      overlay.classList.remove('show');
    }, 2800);
  }
}

/**
 * Envía el formulario de login/registro/invitado.
 * @param {string} type - Tipo: 'login', 'register', o 'guest'
 */
function submitForm(type) {
  // Validar según tipo
  if (type !== 'guest') {
    const isValid = type === 'login' ? validateLogin() : validateRegister();
    if (!isValid) return;
  }
  
  // Obtener botón para feedback visual
  const btnId = type === 'login' ? 'btn-login' : (type === 'register' ? 'btn-register' : null);
  const btn = btnId ? document.getElementById(btnId) : null;
  
  let dotCount = 0;
  
  // Deshabilitar botón y mostrar "procesando"
  if (btn) {
    btn.disabled = true;
    processingTimer = setInterval(() => {
      dotCount = (dotCount + 1) % 4;
      const dots = '.'.repeat(dotCount);
      if (type === 'login') btn.textContent = `PROCESANDO${dots}`;
      else if (type === 'register') btn.textContent = `CREANDO CUENTA${dots}`;
    }, 380);
  }
  
  // Simular delay de red (temporal hasta integrar backend)
  setTimeout(() => {
    // Limpiar timer y restaurar botón
    if (processingTimer) clearInterval(processingTimer);
    if (btn) {
      btn.disabled = false;
      if (type === 'login') btn.textContent = 'INICIAR SESIÓN';
      else if (type === 'register') btn.textContent = 'CREAR CUENTA';
    }
    
    // ⚠️ TEMPORAL: Simulación de autenticación
    // TODO: Reemplazar por llamada a API:
    // POST /api/auth/login
    // POST /api/auth/register
    if (type === 'login' || type === 'register') {
      setLoggedIn(true);
      // Actualizar navbar y menú móvil con el nuevo estado
      renderAccountNav();
      renderMobileAccount();
    }
    
    // Mostrar overlay de éxito
    if (type === 'login') {
      showSuccessOverlay('Sesión iniciada', 'Bienvenido de vuelta.');
    } else if (type === 'register') {
      showSuccessOverlay('Cuenta creada', 'Bienvenido a HERA.');
    } else {
      showSuccessOverlay('Modo invitado', 'Explorando como invitado.', false);
    }
  }, type === 'guest' ? 400 : 2000);
}

/* ═══════════════════════════════════════════════════════════
   SCROLL REVEAL - Intersection Observer
   ═══════════════════════════════════════════════════════════ */

/**
 * Inicializa el efecto de revelado al hacer scroll.
 */
function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      } else {
        entry.target.classList.remove('visible');
      }
    });
  }, { threshold: 0.12 });
  
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

/* ═══════════════════════════════════════════════════════════
   INITIALIZATION - Punto de entrada de la página
   ═══════════════════════════════════════════════════════════ */

/**
 * Inicializa todos los event listeners de la página de cuenta.
 */
function initCuentaEventListeners() {
  // Panel switching
  if (linkToRegister) {
    linkToRegister.addEventListener('click', (e) => {
      e.preventDefault();
      switchToRegister();
    });
  }
  
  if (linkToLogin) {
    linkToLogin.addEventListener('click', (e) => {
      e.preventDefault();
      switchToLogin();
    });
  }
  
  // Password toggles
  document.querySelectorAll('.pwd-toggle').forEach(btn => {
    const targetId = btn.dataset.pwdTarget;
    if (targetId) {
      btn.addEventListener('click', () => togglePasswordVisibility(targetId, btn));
    }
  });
  
  // Password strength
  if (regPass) {
    regPass.addEventListener('input', () => updateStrengthMeter(regPass.value));
  }
  
  // Password match
  if (regPass2) {
    regPass2.addEventListener('input', checkPasswordsMatch);
  }
  
  // Clear errors on input
  const fieldErrorMap = {
    'login-email': 'err-login-email',
    'login-pass': 'err-login-pass',
    'reg-name': 'err-reg-name',
    'reg-email': 'err-reg-email',
    'reg-pass': 'err-reg-pass',
    'reg-pass2': 'err-reg-pass2'
  };
  
  Object.entries(fieldErrorMap).forEach(([inputId, errorId]) => {
    const input = document.getElementById(inputId);
    if (input) {
      input.addEventListener('input', () => clearFieldError(inputId, errorId));
    }
  });
  
  // Submit buttons
  const btnLogin = document.getElementById('btn-login');
  const btnRegister = document.getElementById('btn-register');
  const btnGuest = document.getElementById('btn-guest');
  
  if (btnLogin) btnLogin.addEventListener('click', () => submitForm('login'));
  if (btnRegister) btnRegister.addEventListener('click', () => submitForm('register'));
  if (btnGuest) btnGuest.addEventListener('click', () => submitForm('guest'));
}

/**
 * Inicializa la página de cuenta.
 */
async function initCuentaPage() {
  // Obtener referencias DOM
  authScene = document.getElementById('authScene');
  dotLogin = document.getElementById('dot-login');
  dotReg = document.getElementById('dot-reg');
  linkToRegister = document.getElementById('link-to-register');
  linkToLogin = document.getElementById('link-to-login');
  
  loginEmail = document.getElementById('login-email');
  loginPass = document.getElementById('login-pass');
  regName = document.getElementById('reg-name');
  regEmail = document.getElementById('reg-email');
  regPass = document.getElementById('reg-pass');
  regPass2 = document.getElementById('reg-pass2');
  
  // Inicializar todos los componentes
  await loadNavbar();
  await loadFooterCuenta();

  initCartDrawer();
  initFavDrawer();
  initSearch();
  initMobileNav();
  initCuentaEventListeners();
  initScrollReveal();
  
  // Si ya hay sesión activa, redirigir a index
  if (isLoggedIn()) {
    window.location.href = 'index.html';
  }
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCuentaPage);
} else {
  initCuentaPage();
}

export { initCuentaPage, switchToLogin, switchToRegister, submitForm };