/**
 * footer-cuenta.js — HERA
 *
 * Descripción: Carga el fragmento HTML del footer mínimo de la página
 *              de cuenta desde /components/footer-cuenta.html e inyecta
 *              en #footer-cuenta-placeholder.
 *              Este footer solo contiene copyright y links legales,
 *              a diferencia del footer completo del resto del sitio.
 * Exporta:     loadFooterCuenta
 * Importado por: js/pages/cuenta.js
 */

/**
 * Carga el fragmento HTML del footer mínimo e inyecta en el placeholder.
 * No requiere await — no tiene dependencias con otros componentes.
 * @returns {Promise<void>}
 */
async function loadFooterCuenta() {
  const placeholder = document.getElementById('footer-cuenta-placeholder');
  if (!placeholder) return;
  const response = await fetch('/components/footer-cuenta.html');
  const html = await response.text();
  placeholder.innerHTML = html;
}

export { loadFooterCuenta };
