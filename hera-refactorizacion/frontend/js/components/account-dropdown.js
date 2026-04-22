/**
 * account-dropdown.js — HERA Component
 * 
 * Descripción: Lógica del dropdown de cuenta (login/logout).
 * Exporta: initAccountDropdown, isLoggedIn, logout
 * Importado por: todas las páginas
 */

let accountToggle = null;
let accountDropdown = null;
let accountLoginBtn = null;
let btnLogout = null;
let btnLogoutMobile = null;

/**
 * Verifica si el usuario está logueado.
 * @returns {boolean}
 */
function isLoggedIn() {
  return localStorage.getItem('hera_logged_in') === '1';
}

/**
 * Cierra sesión del usuario.
 */
function logout() {
  localStorage.removeItem('hera_logged_in');
  if (accountDropdown) accountDropdown.style.display = 'none';
  renderAccountNav();
}

/**
 * Actualiza la UI de navegación según estado de sesión.
 */
function renderAccountNav() {
  const isLogged = isLoggedIn();
  
  if (accountLoginBtn) {
    accountLoginBtn.style.display = isLogged ? 'none' : 'flex';
  }
  
  if (accountToggle) {
    accountToggle.style.display = isLogged ? 'flex' : 'none';
  }
  
  // Elementos móviles
  const mobileCuentaLoginLink = document.getElementById('mobileCuentaLoginLink');
  const mobileCuentaToggle = document.getElementById('mobileCuentaToggle');
  
  if (mobileCuentaLoginLink) {
    mobileCuentaLoginLink.style.display = isLogged ? 'none' : 'flex';
  }
  
  if (mobileCuentaToggle) {
    mobileCuentaToggle.style.display = isLogged ? 'flex' : 'none';
  }
}

/**
 * Inicializa el componente de cuenta.
 */
function initAccountDropdown() {
  accountToggle = document.getElementById('account-toggle');
  accountDropdown = document.getElementById('account-dropdown');
  accountLoginBtn = document.getElementById('account-login-btn');
  btnLogout = document.getElementById('btn-logout');
  btnLogoutMobile = document.getElementById('btn-logout-mobile');
  
  renderAccountNav();
  
  if (accountToggle) {
    accountToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      if (accountDropdown) {
        accountDropdown.style.display = accountDropdown.style.display === 'block' ? 'none' : 'block';
      }
    });
  }
  
  if (accountDropdown) {
    accountDropdown.addEventListener('click', (e) => e.stopPropagation());
  }
  
  if (btnLogout) {
    btnLogout.addEventListener('click', (e) => {
      e.preventDefault();
      logout();
    });
  }
  
  if (btnLogoutMobile) {
    btnLogoutMobile.addEventListener('click', (e) => {
      e.preventDefault();
      logout();
    });
  }
  
  // Cerrar dropdown al hacer clic fuera
  document.addEventListener('click', () => {
    if (accountDropdown) accountDropdown.style.display = 'none';
  });
}

export { initAccountDropdown, isLoggedIn, logout };