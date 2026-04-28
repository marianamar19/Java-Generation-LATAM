/**
 * contacto.js — HERA
 *
 * Descripción: Script exclusivo de la página Contacto.
 *              Orquesta la carga de componentes universales e
 *              inicializa toda la lógica exclusiva de esta página:
 *              scroll reveal, selector visual de asunto y
 *              validación + simulación de envío del formulario
 *              de contacto (con estado de éxito y reset).
 *
 * Exporta:     (ninguno — es el entry point de la página)
 * Importado por: pages/contacto.html vía <script type="module">
 */

import { loadNavbar } from '../components/navbar.js';
import { loadCartDrawer }         from '../components/cart-drawer.js';
import { initFavDrawer }          from '../components/fav-drawer.js';
import { loadFooter }             from '../components/footer.js';

/* ══════════════════════════════════════
   ARRANQUE — DOMContentLoaded
══════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', async function () {

  // AWAIT obligatorio: el navbar debe estar en el DOM antes de inicializar
  // cualquier componente que referencia sus elementos (#cart-btn, etc.)
  await loadNavbar();

  // Footer sin dependencias — puede cargarse sin await
  loadFooter();

  // Cart drawer vía fetch — await porque fav-drawer depende de que
  // #cart-btn y los elementos del drawer ya estén en el DOM
  await loadCartDrawer();

  // Favoritos — enlaza el estado de localStorage y renderiza los dropdowns
  initFavDrawer();

  // Lógica exclusiva de esta página
  _initScrollReveal();
  _initAsuntoSelector();
  _initContactForm();
});

/* ══════════════════════════════════════
   SCROLL REVEAL — IntersectionObserver
   Replays cada vez que el elemento entra al viewport.
   Design System v4.
══════════════════════════════════════ */

/**
 * Observa todos los elementos .reveal y alterna la clase .visible
 * según entren o salgan del viewport.
 * @returns {void}
 */
function _initScrollReveal() {
  const obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
      } else {
        e.target.classList.remove('visible');
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal').forEach(function (el) { obs.observe(el); });
}

/* ══════════════════════════════════════
   SELECTOR VISUAL DE ASUNTO
   Chips de botón que actualizan un input hidden
   con el valor seleccionado.
══════════════════════════════════════ */

/**
 * Inicializa los botones de asunto (.asunto-opt).
 * Al seleccionar uno actualiza el input hidden #asunto y
 * limpia el estado de error del campo.
 * @returns {void}
 */
function _initAsuntoSelector() {
  const asuntoOpts  = document.querySelectorAll('.asunto-opt');
  const asuntoInput = document.getElementById('asunto');

  asuntoOpts.forEach(function (btn) {
    btn.addEventListener('click', function () {
      // Desactivar todos y activar solo el clicado
      asuntoOpts.forEach(function (b) { b.classList.remove('selected'); });
      btn.classList.add('selected');
      asuntoInput.value = btn.dataset.val;

      // Limpiar error visual si ya había uno al no seleccionar asunto
      document.getElementById('field-asunto').classList.remove('has-error');
    });
  });
}

/* ══════════════════════════════════════
   FORMULARIO DE CONTACTO
   Validación, simulación de envío, estado
   de éxito y reset.
══════════════════════════════════════ */

/**
 * Inicializa toda la lógica del formulario de contacto:
 * - Validación de campos obligatorios en el submit
 * - Simulación de envío con estado de carga (TEMPORAL — sin backend)
 * - Mostrar overlay de éxito tras el envío
 * - Reset completo al pulsar "Enviar otro mensaje"
 * - Limpieza de errores en tiempo real al escribir
 * @returns {void}
 */
function _initContactForm() {
  const form        = document.getElementById('contactForm');
  const formWrapper = document.getElementById('formWrapper');
  const formSuccess = document.getElementById('formSuccess');
  const formReset   = document.getElementById('formReset');
  const submitBtn   = document.getElementById('submitBtn');
  const submitText  = document.getElementById('submitText');
  const asuntoOpts  = document.querySelectorAll('.asunto-opt');
  const asuntoInput = document.getElementById('asunto');

  if (!form) return;

  /* ── Validaciones ── */

  /**
   * Valida que un string sea un email con formato correcto.
   * @param {string} v - Valor a validar
   * @returns {boolean}
   */
  function _isEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
  }

  /**
   * Añade o quita el estado de error en un campo del formulario.
   * @param {string}  fieldId - ID del contenedor .form-field (ej: 'field-nombre')
   * @param {boolean} show    - true = mostrar error, false = limpiarlo
   */
  function _setError(fieldId, show) {
    const el = document.getElementById(fieldId);
    if (el) {
      if (show) el.classList.add('has-error');
      else      el.classList.remove('has-error');
    }
  }

  /* ── Submit ── */

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const nombre  = document.getElementById('nombre').value.trim();
    const email   = document.getElementById('email').value.trim();
    const asunto  = document.getElementById('asunto').value;
    const mensaje = document.getElementById('mensaje').value.trim();

    // Validar todos los campos — acumular errores sin hacer short-circuit
    let valid = true;

    if (!nombre)         { _setError('field-nombre',  true); valid = false; }
    else                   _setError('field-nombre',  false);

    if (!_isEmail(email)) { _setError('field-email',  true); valid = false; }
    else                   _setError('field-email',   false);

    if (!asunto)          { _setError('field-asunto', true); valid = false; }
    else                   _setError('field-asunto',  false);

    if (!mensaje)         { _setError('field-mensaje', true); valid = false; }
    else                   _setError('field-mensaje',  false);

    if (!valid) return;

    /* TEMPORAL — simula envío con setTimeout.
       Reemplazar con fetch() al endpoint real cuando el backend esté disponible.
       Endpoint esperado: POST /api/contacto → { ok: true }
    */
    submitBtn.disabled    = true;
    submitText.textContent = 'Enviando…';
    // Reducir opacidad para indicar estado de procesamiento
    submitBtn.style.opacity = '.6';

    setTimeout(function () {
      formWrapper.style.display = 'none';
      formSuccess.classList.add('show');
    }, 1200);
  });

  /* ── Limpieza de errores en tiempo real ── */

  // Al escribir en cualquier campo de texto se limpia su error inmediatamente
  ['nombre', 'email', 'mensaje'].forEach(function (id) {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', function () {
        _setError('field-' + id, false);
      });
    }
  });

  /* ── Reset del formulario ── */

  formReset.addEventListener('click', function () {
    form.reset();

    // Desactivar todos los chips de asunto
    asuntoOpts.forEach(function (b) { b.classList.remove('selected'); });
    asuntoInput.value = '';

    // Restaurar el botón de envío a su estado inicial
    submitBtn.disabled     = false;
    submitText.textContent = 'Enviar mensaje';
    submitBtn.style.opacity = '1';

    // Ocultar el overlay de éxito y mostrar el formulario de nuevo
    formSuccess.classList.remove('show');
    formWrapper.style.display = '';
  });
}
