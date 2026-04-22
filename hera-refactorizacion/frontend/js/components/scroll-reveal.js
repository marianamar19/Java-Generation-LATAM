/**
 * scroll-reveal.js — HERA Component
 * 
 * Descripción: Inicializa el IntersectionObserver para animaciones reveal.
 * Los elementos aparecen cuando entran al viewport y desaparecen cuando salen.
 * Exporta: initScrollReveal
 * Importado por: todas las páginas
 */

function initScrollReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Entra al viewport → aparece con animación
          entry.target.classList.add('visible');
        } else {
          // Sale del viewport → desaparece (se oculta)
          entry.target.classList.remove('visible');
        }
      });
    },
    { threshold: 0.15 }  // 15% del elemento visible para activar
  );

  document.querySelectorAll('.reveal').forEach(el => {
    observer.observe(el);
  });
}

export { initScrollReveal };