/**
 * footer.js — HERA Component
 * 
 * Descripción: Carga el footer completo desde components/footer.html
 * Exporta: loadFooter
 * Importado por: páginas principales (devoluciones, index, catalogo)
 */

let footerLoaded = false;

async function loadFooter() {
  if (footerLoaded) {
    console.log('Footer ya cargado, omitiendo...');
    return;
  }

  const placeholder = document.getElementById('footer-placeholder');
  if (!placeholder) return;

  const pathsToTry = [
    '/components/footer.html',
    'components/footer.html',
    '../components/footer.html',
    './components/footer.html'
  ];
  
  for (const path of pathsToTry) {
    try {
      const response = await fetch(path);
      if (response.ok) {
        const html = await response.text();
        placeholder.innerHTML = html;
        console.log('Footer cargado desde:', path);
        footerLoaded = true;
        return;
      }
    } catch (error) {
      console.warn(`Error desde ${path}:`, error);
    }
  }
  
  placeholder.innerHTML = '<div style="padding: 1rem; text-align: center; background: #0F0F0F; color: #666;">Error al cargar el footer</div>';
}

export { loadFooter };