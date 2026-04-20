# HERA - Refactorización de Devoluciones

## Resumen del Proyecto

Refactorización del monolito HTML de la página de **Política de Devoluciones y Garantías** de HERA Perfumes & Joyería, extrayendo CSS y JavaScript a archivos separados e implementando una arquitectura modular con ES Modules y componentes reutilizables.

---

## Objetivos

- ✅ Eliminar todo CSS y JS inline del HTML
- ✅ Separar estilos en archivos modulares por componente
- ✅ Implementar carga dinámica de componentes (navbar, footer) vía fetch
- ✅ Mantener 100% de la funcionalidad original
- ✅ Documentar toda la estructura y dependencias

---

## 📁 Estructura de Archivos Final
hera-refactorizacion/
├── css/
│ ├── base/
│ │ ├── tokens.css # Variables CSS del Design System
│ │ ├── reset.css # Reset global
│ │ └── typography.css # Fuentes y tipografía base
│ ├── components/
│ │ ├── navbar.css # Estilos del navbar desktop
│ │ ├── mobile-nav.css # Estilos del panel móvil
│ │ ├── drawer.css # Carrito y favoritos
│ │ ├── footer.css # Footer completo + footer mínimo
│ │ └── search.css # Overlay de búsqueda
│ └── pages/
│ └── devoluciones.css # Estilos exclusivos de la página
│
├── js/
│ ├── utils/
│ │ ├── storage.js # Wrapper de localStorage
│ │ └── formatter.js # Formateo de precios y fechas
│ ├── components/
│ │ ├── navbar.js # Carga e inicializa navbar
│ │ ├── footer.js # Carga footer completo
│ │ ├── footer-cuenta.js # Carga footer mínimo
│ │ ├── cart-drawer.js # Lógica del carrito
│ │ ├── fav-drawer.js # Lógica de favoritos
│ │ ├── mobile-nav.js # Menú hamburguesa móvil
│ │ ├── search.js # Búsqueda en tiempo real
│ │ └── scroll-reveal.js # Animaciones al hacer scroll
│ └── pages/
│ └── devoluciones.js # Lógica específica de la página
│
├── components/
│ ├── navbar.html # Navbar completo (con search overlay)
│ ├── footer.html # Footer completo (grid, redes, pagos)
│ └── footer-cuenta.html # Footer mínimo (solo enlaces)
│
└── pages/
└── devoluciones.html # HTML limpio (sin estilos inline)


---

## Componentes Implementados

### Base (CSS)
| Archivo | Descripción |
|---------|-------------|
| `tokens.css` | Variables CSS (`--red`, `--cream`, `--black`, `--sans`, `--serif`, etc.) |
| `reset.css` | Reset global, scrollbar personalizada |
| `typography.css` | Google Fonts, jerarquía de títulos |

### Componentes Universales
| Componente | CSS | JS | HTML |
|------------|-----|-----|------|
| Navbar | `navbar.css` | `navbar.js` | `navbar.html` |
| Panel móvil | `mobile-nav.css` | `mobile-nav.js` | (dentro de navbar.html) |
| Carrito | `drawer.css` | `cart-drawer.js` | (en cada página) |
| Favoritos | `drawer.css` | `fav-drawer.js` | (en cada página) |
| Búsqueda | `search.css` | `search.js` | (dentro de navbar.html) |
| Footer completo | `footer.css` | `footer.js` | `footer.html` |
| Footer mínimo | `footer.css` | `footer-cuenta.js` | `footer-cuenta.html` |
| Scroll reveal | - | `scroll-reveal.js` | - |

### Página Específica
| Archivo | Descripción |
|---------|-------------|
| `devoluciones.css` | Estilos del hero, secciones legales, CTA |
| `devoluciones.js` | Inicializa todos los componentes |

---

## Patrón de Inyección de Componentes

Los componentes navbar y footer se cargan dinámicamente vía fetch:

```javascript
// Ejemplo: navbar.js
/*async function loadNavbar() {
  const placeholder = document.getElementById('navbar-placeholder');
  const response = await fetch('/components/navbar.html');
  placeholder.innerHTML = await response.text();
  initNavbar();
}*/
---
#### Scroll Reveal (Animaciones)
/*Funcionamiento
Los elementos con clase .reveal están ocultos inicialmente (opacity: 0, transform: translateY(22px))

Cuando entran al viewport, se les agrega la clase .visible (aparecen con animación)

Cuando salen del viewport, se les remueve la clase .visible (desaparecen)*/

--- 

##### Importante 
npx serve
bash
cd hera-refactorizacion

-> npx serve .

-> Abrir: http://localhost:3000/pages/devoluciones.html
