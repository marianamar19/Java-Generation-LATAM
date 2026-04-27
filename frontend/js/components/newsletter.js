/**
 * newsletter.js — HERA
 *
 * Descripción: Carga el fragmento HTML del newsletter desde
 *              /components/newsletter.html e inyecta en
 *              #newsletter-placeholder.
 * Exporta:     loadNewsletter
 * Importado por: js/pages/[nombre].js en las páginas que lo usen
 */

async function loadNewsletter() {
    const placeholder = document.getElementById('newsletter-placeholder');
    if (!placeholder) return;
    const response = await fetch('/components/newsletter.html');
    const html = await response.text();
    placeholder.innerHTML = html;
}

export { loadNewsletter };