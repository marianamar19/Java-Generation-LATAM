/**
 * footer-minimo.js — HERA
 *
 * Descripción: Carga el fragmento HTML del footer mínimo de la página
 *              de cuenta desde /components/footer-minimo.html e inyecta
 *              en #footer-minimo-placeholder.
 *              Este footer solo contiene copyright y links legales,
 *              a diferencia del footer completo del resto del sitio.
 * Exporta:     loadFooterMinimo()
 * Importado por: js/pages/cuenta.js
 */

/**
 * Carga el fragmento HTML del footer mínimo e inyecta en el placeholder.
 * No requiere await — no tiene dependencias con otros componentes.
 * @returns {Promise<void>}
 */
async function loadFooterMinimo() {
  const placeholder = document.getElementById('footer-minimo-placeholder');
  if (!placeholder) return;
  const response = await fetch('/components/footer-minimo.html');
  const html = await response.text();
  placeholder.innerHTML = html;
}

export { loadFooterMinimo };
