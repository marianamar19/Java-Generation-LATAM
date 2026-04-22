/**
 * footer-cuenta.js — HERA Component
 * 
 * Descripción: Carga el footer mínimo desde components/footer-cuenta.html
 * Exporta: loadFooterCuenta
 * Importado por: pages/cuenta.js
 */

let footerCuentaLoaded = false;

async function loadFooterCuenta() {
  if (footerCuentaLoaded) {
    console.log('Footer cuenta ya cargado, omitiendo...');
    return;
  }

  const placeholder = document.getElementById('footer-placeholder');
  if (!placeholder) return;

  const pathsToTry = [
    '/components/footer-cuenta.html',
    'components/footer-cuenta.html',
    '../components/footer-cuenta.html',
    './components/footer-cuenta.html'
  ];
  
  for (const path of pathsToTry) {
    try {
      const response = await fetch(path);
      if (response.ok) {
        const html = await response.text();
        placeholder.innerHTML = html;
        console.log('Footer cuenta cargado desde:', path);
        footerCuentaLoaded = true;
        return;
      }
    } catch (error) {
      console.warn(`Error desde ${path}:`, error);
    }
  }
  
  placeholder.innerHTML = '<div style="padding: 1rem; text-align: center; background: #0F0F0F; color: #666;">Error al cargar el footer</div>';
}

export { loadFooterCuenta };