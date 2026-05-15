/**
 * cuenta.js — HERA (VERSIÓN - CORREGIDA)
 * 
 * Descripción: Lógica exclusiva de la página Mi Cuenta (login + registro).
 *              Maneja el track deslizante entre paneles, validación de
 *              formularios, fortaleza de contraseña, toggle de visibilidad,
 *              autenticación real con API y success overlay.
 * 
 * Exporta:     initCuentaPage, switchToLogin, switchToRegister, submitForm
 * Importado por: pages/cuenta.html vía <script type="module">
 */

import { loadNavbar } from '../components/navbar.js';
import { loadFooterMinimo } from '../components/footer-minimo.js';
import { loadCartDrawer } from '../components/cart-drawer.js';
import { initFavDrawer } from '../components/fav-drawer.js';
import { login, register, isAuthenticated, clearAuth } from '../utils/api.js';

/* ══════════════════════════════════════
  AUTH SCENE — track deslizante
══════════════════════════════════════ */

function switchToRegister() {
  const authScene = document.getElementById('authScene');
  const dotLogin = document.getElementById('dot-login');
  const dotReg = document.getElementById('dot-reg');
  if (authScene) authScene.classList.add('show-register');
  if (dotLogin) dotLogin.classList.remove('active');
  if (dotReg) dotReg.classList.add('active');
}

function switchToLogin() {
  const authScene = document.getElementById('authScene');
  const dotLogin = document.getElementById('dot-login');
  const dotReg = document.getElementById('dot-reg');
  if (authScene) authScene.classList.remove('show-register');
  if (dotLogin) dotLogin.classList.add('active');
  if (dotReg) dotReg.classList.remove('active');
}

/* ══════════════════════════════════════
  PASSWORD UTILITIES
══════════════════════════════════════ */

function togglePassword(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const isPassword = input.type === 'password';
  input.type = isPassword ? 'text' : 'password';
  btn.innerHTML = isPassword
    ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>'
    : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
}

function updateStrengthMeter(password) {
  const bars = ['b1', 'b2', 'b3', 'b4'].map(id => document.getElementById(id));
  const label = document.getElementById('pwd-label');
  bars.forEach(bar => { if (bar) bar.className = 'pwd-bar'; });
  if (!password) { if (label) label.textContent = ''; return; }
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  const levels = ['weak', 'fair', 'good', 'strong'];
  const labels = ['Débil', 'Regular', 'Fuerte', 'Muy fuerte'];
  for (let i = 0; i < score; i++) {
    if (bars[i]) bars[i].classList.add(levels[score - 1]);
  }
  if (label) label.textContent = `Fortaleza: ${labels[score - 1] || ''}`;
}

function checkPasswordsMatch() {
  const pass1 = document.getElementById('reg-pass');
  const pass2 = document.getElementById('reg-pass2');
  const icon = document.getElementById('match-icon');
  const errorEl = document.getElementById('err-reg-pass2');
  if (!pass1 || !pass2) return true;
  if (!pass2.value) {
    if (icon) icon.style.display = 'none';
    if (errorEl) errorEl.classList.remove('show');
    return true;
  }
  const isMatch = pass1.value === pass2.value;
  if (icon) {
    icon.style.display = 'inline';
    icon.innerHTML = isMatch ? '<span class="val-icon-ok">✓</span>' : '<span class="val-icon-err">✗</span>';
  }
  if (errorEl) isMatch ? errorEl.classList.remove('show') : errorEl.classList.add('show');
  pass2.classList.toggle('success', isMatch);
  pass2.classList.toggle('error', !isMatch);
  return isMatch;
}

/* ══════════════════════════════════════
  VALIDACIÓN DE FORMULARIOS
══════════════════════════════════════ */

function clearError(inputId, errorId) {
  const input = document.getElementById(inputId);
  const error = document.getElementById(errorId);
  if (input) input.classList.remove('error');
  if (error) error.classList.remove('show');
}

function setError(inputId, errorId, message) {
  const input = document.getElementById(inputId);
  const error = document.getElementById(errorId);
  if (input) input.classList.add('error');
  if (error) { error.textContent = message; error.classList.add('show'); }
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateLogin() {
  let isValid = true;
  clearError('login-email', 'err-login-email');
  clearError('login-pass', 'err-login-pass');
  const email = document.getElementById('login-email')?.value.trim() || '';
  const pass = document.getElementById('login-pass')?.value || '';
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

function validateRegister() {
  let isValid = true;
  clearError('reg-name', 'err-reg-name');
  clearError('reg-email', 'err-reg-email');
  clearError('reg-pass', 'err-reg-pass');
  const name = document.getElementById('reg-name')?.value.trim() || '';
  const email = document.getElementById('reg-email')?.value.trim() || '';
  const pass = document.getElementById('reg-pass')?.value || '';
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
  SUCCESS OVERLAY
══════════════════════════════════════ */

function showSuccessOverlay(title, message, redirect = true, redirectUrl = 'index.html') {
  const overlay = document.getElementById('successOverlay');
  const eyebrow = document.getElementById('success-eyebrow');
  const msg = document.getElementById('success-msg');
  const link = document.getElementById('success-link');
  if (!overlay) return;
  if (eyebrow) eyebrow.textContent = title;
  if (msg) msg.textContent = message;
  if (link) { link.style.display = 'block'; link.href = redirectUrl; }
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
  SUBMIT — Autenticación real
══════════════════════════════════════ */

async function submitForm(type) {
  if (type !== 'guest') {
    const isValid = type === 'login' ? validateLogin() : validateRegister();
    if (!isValid) return;
  }

  const btnId = type === 'login' ? 'btn-login' : (type === 'register' ? 'btn-register' : null);
  const btn = btnId ? document.getElementById(btnId) : null;
  let dotCount = 0;
  let processingTimer = null;

  if (btn) {
    btn.disabled = true;
    processingTimer = setInterval(() => {
      dotCount = (dotCount + 1) % 4;
      const dots = '.'.repeat(dotCount);
      btn.textContent = type === 'login' ? `PROCESANDO${dots}` : `CREANDO CUENTA${dots}`;
    }, 380);
  }

  const cleanup = () => {
    if (processingTimer) clearInterval(processingTimer);
    if (btn) {
      btn.disabled = false;
      btn.textContent = type === 'login' ? 'INICIAR SESIÓN' : 'CREAR CUENTA';
    }
  };

  try {
    if (type === 'login') {
      const email = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-pass').value;
      const user = await login(email, password);
      cleanup();
      showSuccessOverlay('Sesión iniciada', `Bienvenido ${user.nombre}`);
      setTimeout(() => {
        if (user.rol === 'ADMIN') {
          window.location.href = '/pages/admin/dashboard.html';
        } else {
          const redirect = sessionStorage.getItem('redirectAfterLogin');
          if (redirect) {
            sessionStorage.removeItem('redirectAfterLogin');
            window.location.href = redirect;
          } else {
            window.location.href = '/index.html';
          }
        }
      }, 2000);
    } else if (type === 'register') {
      const nombre = document.getElementById('reg-name').value.trim();
      const email = document.getElementById('reg-email').value.trim();
      const password = document.getElementById('reg-pass').value;
      const telefono = document.getElementById('reg-telefono')?.value || '';
      const user = await register(nombre, email, password, telefono);
      cleanup();
      showSuccessOverlay('Cuenta creada', `Bienvenido a HERA, ${user.nombre}`);
      setTimeout(() => {
        window.location.href = '/index.html';
      }, 2000);
    } else if (type === 'guest') {
      clearAuth();
      cleanup();
      showSuccessOverlay('Modo invitado', 'Explorando como invitado.', false);
      setTimeout(() => {
        window.location.href = '/index.html';
      }, 2000);
    }
  } catch (error) {
    cleanup();
    if (type === 'login') {
      setError('login-email', 'err-login-email', error.message);
      setError('login-pass', 'err-login-pass', error.message);
    } else {
      alert(error.message);
    }
  }
}

/* ══════════════════════════════════════
  EVENT LISTENERS
══════════════════════════════════════ */

function initEventListeners() {
  const linkToRegister = document.getElementById('link-to-register');
  const linkToLogin = document.getElementById('link-to-login');
  if (linkToRegister) linkToRegister.addEventListener('click', e => { e.preventDefault(); switchToRegister(); });
  if (linkToLogin) linkToLogin.addEventListener('click', e => { e.preventDefault(); switchToLogin(); });

  document.querySelectorAll('.pwd-toggle').forEach(btn => {
    const targetId = btn.dataset.pwdTarget;
    if (targetId) btn.addEventListener('click', () => togglePassword(targetId, btn));
  });

  const regPass = document.getElementById('reg-pass');
  if (regPass) {
    regPass.addEventListener('input', () => {
      updateStrengthMeter(regPass.value);
      checkPasswordsMatch();
    });
  }

  const regPass2 = document.getElementById('reg-pass2');
  if (regPass2) regPass2.addEventListener('input', checkPasswordsMatch);

  const errorMap = {
    'login-email': 'err-login-email',
    'login-pass': 'err-login-pass',
    'reg-name': 'err-reg-name',
    'reg-email': 'err-reg-email',
    'reg-pass': 'err-reg-pass',
    'reg-pass2': 'err-reg-pass2'
  };
  Object.entries(errorMap).forEach(([inputId, errorId]) => {
    const input = document.getElementById(inputId);
    if (input) input.addEventListener('input', () => clearError(inputId, errorId));
  });

  const btnLogin = document.getElementById('btn-login');
  const btnRegister = document.getElementById('btn-register');
  const btnGuest = document.getElementById('btn-guest');
  if (btnLogin) btnLogin.addEventListener('click', () => submitForm('login'));
  if (btnRegister) btnRegister.addEventListener('click', () => submitForm('register'));
  if (btnGuest) btnGuest.addEventListener('click', () => submitForm('guest'));
}

/* ══════════════════════════════════════
  INICIALIZACIÓN — CORREGIDA (SIN BUCLE)
══════════════════════════════════════ */

async function initCuentaPage() {
  // Cargar componentes
  await loadNavbar();
  await loadFooterMinimo();
  await loadCartDrawer();
  await initFavDrawer();
  initEventListeners();

  // CORREGIDO: Solo redirigir si estamos en cuenta.html y hay sesión
  const currentPath = window.location.pathname;
  const isCuentaPage = currentPath.includes('cuenta.html');
  
  if (isAuthenticated() && isCuentaPage) {
    try {
      const user = JSON.parse(sessionStorage.getItem('hera_user') || '{}');
      if (user.rol === 'ADMIN') {
        window.location.replace('/pages/admin/dashboard.html');
      } else {
        window.location.replace('/index.html');
      }
    } catch (e) {
      // Si hay error, no redirigir
      console.warn('Error al obtener usuario:', e);
    }
  }
}

// Ejecutar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCuentaPage);
} else {
  initCuentaPage();
}

// Exportar funciones necesarias
export { initCuentaPage, switchToLogin, switchToRegister, submitForm };