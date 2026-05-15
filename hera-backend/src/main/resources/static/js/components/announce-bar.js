/**
 * announce-bar.js — HERA
 *
 * Descripción: Carga el fragmento HTML de la barra de anuncios
 *              desde /components/announce-bar.html e inyecta en
 *              #announce-bar-placeholder.
 *              No todas las páginas la muestran — cuenta.html
 *              por ejemplo no la incluye.
 * Exporta:     loadAnnounceBar
 * Importado por: js/pages/[nombre].js en las páginas que la necesiten
 */

/**
 * Carga el fragmento HTML del announce bar e inyecta en el placeholder.
 * No requiere await — no tiene dependencias con otros componentes.
 * @returns {Promise<void>}
 */
async function loadAnnounceBar() {
  const placeholder = document.getElementById('announce-bar-placeholder');
  if (!placeholder) return;
  const response = await fetch('/components/announce-bar.html');
  const html = await response.text();
  placeholder.innerHTML = html;
}

export { loadAnnounceBar };
