/**
 * footer.js — HERA
 *
 * Descripción: Componente universal del footer. Carga el fragmento HTML
 *              desde /components/footer.html y lo inyecta en el elemento
 *              #footer-placeholder de la página.
 * Exporta:     loadFooter
 * Importado por: js/pages/index.js y todos los demás scripts de página.
 */

/**
 * Carga el footer en el elemento #footer-placeholder de la página.
 * @returns {Promise<void>}
 */
async function loadFooter() {
  const placeholder = document.getElementById('footer-placeholder');
  if (!placeholder) return;

  const response = await fetch('/components/footer.html');
  const html     = await response.text();
  placeholder.innerHTML = html;
}

export { loadFooter };
