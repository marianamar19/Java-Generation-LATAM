# HERA Perfumes & Joyería — Frontend

Proyecto de e-commerce de perfumes y joyería desarrollado como parte del bootcamp CH65. Este repositorio contiene el frontend completo: HTML, CSS y JavaScript organizados en una arquitectura modular orientada a escalar hacia un backend Spring Boot.

---

## Tabla de contenidos

1. [Resumen del proyecto](#resumen-del-proyecto)
2. [Arquitectura del monorepo](#arquitectura-del-monorepo)
3. [Requisitos previos](#requisitos-previos)
4. [Cómo levantar el servidor local](#cómo-levantar-el-servidor-local)
5. [Arquitectura de archivos](#arquitectura-de-archivos)
6. [Design System](#design-system)
7. [Patrón de inyección de componentes](#patrón-de-inyección-de-componentes)
8. [Módulos JavaScript](#módulos-javascript)
9. [Páginas disponibles](#páginas-disponibles)
10. [Datos temporales y preparación para backend](#datos-temporales-y-preparación-para-backend)
11. [Reglas de desarrollo](#reglas-de-desarrollo)
12. [Historial de refactorización](#historial-de-refactorización)

---

## Resumen del proyecto

HERA es una tienda en línea que comercializa perfumes originales (diseñador, nicho, árabes, testers, decants y body mist) y joyería exclusiva. El sitio está construido como frontend puro — sin framework — con la siguiente filosofía de diseño:

- Un archivo CSS por componente o página, nunca estilos inline.
- ES Modules nativos en el navegador, sin bundler (Vite, Webpack, etc.).
- Componentes universales (navbar, cart drawer, footer) cargados vía `fetch` en lugar de duplicarse en cada página.
- Preparado para integrar un backend Spring Boot mediante endpoints REST documentados en los comentarios del código.

---

## Arquitectura del monorepo

El proyecto está organizado como un monorepo con separación clara por responsabilidad. Cada capa vive en su propia carpeta raíz y puede desarrollarse de forma independiente:

```
hera-web/          Este repositorio — frontend HTML/CSS/JS
hera-api/          Backend Spring Boot (etapa posterior)
hera-admin/        Panel de administración (etapa posterior)
```

Este README corresponde únicamente a `hera-web`. Cuando el backend esté disponible, `hera-api` expondrá los endpoints REST que este frontend ya tiene documentados en los comentarios del código.

---

## Requisitos previos

- Node.js instalado (para levantar el servidor local con `npx serve`).
- Visual Studio Code recomendado como editor.
- Conexión a internet para cargar las fuentes de Google Fonts (`Instrument Sans` y `Cormorant Garamond`).

---

## Cómo levantar el servidor local

Este proyecto utiliza `fetch()` y ES Modules (`type="module"`), los cuales requieren un servidor HTTP real. No es posible abrir los archivos con doble clic (protocolo `file://`).

**Procedimiento recomendado con `npx serve`:**

1. Abrir una terminal en la carpeta raíz de `hera-web`.
2. Ejecutar:

```bash
npx serve .
```

3. Abrir en el navegador: `http://localhost:3000/frontend/pages/catalogo.html`

Este método es el más confiable porque no tiene caché interna y sirve siempre los archivos actuales del disco.

**Procedimiento alternativo con Live Server (VS Code):**

1. Abrir VS Code y seleccionar **File > Open Folder**.
2. Seleccionar la carpeta `hera-web` — no la carpeta `frontend/` en sí.
3. Hacer clic derecho sobre `frontend/pages/catalogo.html` y seleccionar **Open with Live Server**.
4. La URL resultante debe tener la forma `http://127.0.0.1:5500/frontend/pages/catalogo.html`.

Si la URL no incluye `/frontend/` como segmento del path, las rutas de `fetch` no resolverán correctamente y los componentes no se inyectarán. En ese caso usar `npx serve` como alternativa.

---

## Arquitectura de archivos

```
hera-web/
|
`-- frontend/
    |
    |-- assets/
    |   |-- images/
    |   |-- fonts/
    |   `-- icons/
    |
    |-- css/
    |   |-- base/
    |   |   |-- tokens.css              Variables CSS del Design System (colores, fuentes)
    |   |   |-- reset.css               Reset global, scroll behavior, scrollbar, .site-wrap
    |   |   `-- typography.css          Fuentes, eyebrows, headings, btn-primary, scroll reveal
    |   |-- components/
    |   |   |-- announce-bar.css        Barra de anuncios con marquee
    |   |   |-- navbar.css              Nav desktop, panel movil, dropdowns, cuenta, favoritos
    |   |   |-- drawer.css              Cart drawer + search overlay (agrupados por patron comun)
    |   |   `-- footer.css              Footer 4 columnas
    |   `-- pages/
    |       |-- index.css               Hero principal, secciones editoriales, novedades
    |       |-- catalogo.css            Header editorial, tabs, layout sidebar+main, product card
    |       |-- producto.css            Galeria, selector de variantes, informacion de producto
    |       |-- nosotros.css            Hero, valores, equipo, historia de la marca
    |       |-- contacto.css            Formulario de contacto, mapa, datos de ubicacion
    |       |-- favoritos.css           Grid de productos guardados, acciones de lista
    |       |-- faq.css                 Acordeon de preguntas frecuentes, categorias
    |       |-- politica-envios.css     Hero, ciclo, entregas, disponibilidad, FAQ, CTA
    |       |-- devoluciones.css        Politica de devoluciones, pasos del proceso
    |       |-- terminos.css            Terminos y condiciones, estructura de secciones legales
    |       |-- aviso-privacidad.css    Aviso de privacidad, estructura de secciones legales
    |       |-- checkout.css            Formulario de pedido, resumen, metodos de pago
    |       |-- cuenta.css              Dashboard de usuario, pedidos, datos personales
    |       |-- rastreo.css             Estado del pedido, linea de tiempo de envio
    |       |-- confirmacion.css        Pantalla de confirmacion de compra exitosa
    |       `-- 404.css                 Pagina de error 404
    |
    |-- js/
    |   |-- config/
    |   |   `-- api.js                  BASE_URL y configuracion del API (Spring Boot)
    |   |-- services/
    |   |   |-- auth.service.js         Llamadas de autenticacion al API
    |   |   |-- product.service.js      Llamadas de productos al API
    |   |   |-- order.service.js        Llamadas de pedidos al API
    |   |   |-- cart.service.js         Llamadas de carrito al API
    |   |   `-- payment.service.js      Llamadas de pagos al API
    |   |-- components/
    |   |   |-- navbar.js               Carga navbar.html via fetch e inicializa su logica
    |   |   |-- cart-drawer.js          Carga cart-drawer.html via fetch; gestiona carrito y totales
    |   |   `-- fav-drawer.js           Gestiona favoritos (desktop dropdown + panel movil)
    |   |-- pages/
    |   |   |-- index.js                Orquestador del home: hero, novedades, scroll reveal
    |   |   |-- catalogo.js             Orquestador del catalogo: filtros, sort, grid, URL params
    |   |   |-- producto.js             Orquestador de detalle de producto: variantes, galeria
    |   |   |-- nosotros.js             Orquestador de la pagina Nosotros
    |   |   |-- contacto.js             Orquestador del formulario de contacto
    |   |   |-- favoritos.js            Orquestador de la lista de favoritos
    |   |   |-- faq.js                  Orquestador del FAQ: acordeon de preguntas
    |   |   |-- politica-envios.js      Orquestador ligero: componentes + FAQ acordeon
    |   |   |-- devoluciones.js         Orquestador de la pagina de devoluciones
    |   |   |-- terminos.js             Orquestador de terminos y condiciones
    |   |   |-- aviso-privacidad.js     Orquestador del aviso de privacidad
    |   |   |-- checkout.js             Orquestador del checkout: formulario y pago
    |   |   |-- cuenta.js               Orquestador del dashboard de usuario
    |   |   |-- rastreo.js              Orquestador del rastreo de pedido
    |   |   |-- confirmacion.js         Orquestador de la confirmacion de compra
    |   |   `-- 404.js                  Orquestador de la pagina de error
    |   `-- utils/
    |       |-- storage.js              Wrapper de localStorage (hera_cart, hera_favs, hera_logged_in)
    |       `-- formatter.js            Formateo de precios MXN, cartId, etiquetas de volumen, highlight
    |
    |-- components/
    |   |-- navbar.html                 Fragmento HTML del navbar estandar (inyectado via fetch)
    |   |-- navbar-cuenta.html          Fragmento HTML del navbar exclusivo de cuenta.html
    |   |-- cart-drawer.html            Fragmento HTML del cart drawer + search overlay
    |   `-- footer.html                 Fragmento HTML del footer
    |
    `-- pages/
        |-- index.html                  Home — hero, novedades, categorias destacadas
        |-- catalogo.html               Catalogo de productos con filtros y sort
        |-- producto.html               Detalle de producto individual
        |-- nosotros.html               Historia y valores de la marca
        |-- contacto.html               Formulario de contacto y datos de atencion
        |-- favoritos.html              Lista de productos guardados por el usuario
        |-- faq.html                    Preguntas frecuentes generales
        |-- politica-envios.html        Politica de envios y ciclo semanal de pedidos
        |-- devoluciones.html           Politica de devoluciones y cambios
        |-- terminos.html               Terminos y condiciones del servicio
        |-- aviso-privacidad.html       Aviso de privacidad
        |-- checkout.html               Proceso de pago y confirmacion de datos
        |-- cuenta.html                 Dashboard del usuario autenticado
        |-- rastreo.html                Rastreo del estado de un pedido
        |-- confirmacion.html           Confirmacion de compra exitosa
        `-- 404.html                    Pagina de error para rutas no encontradas
```

---

## Design System

Todos los valores visuales del proyecto se definen como variables CSS en `css/base/tokens.css`. Nunca usar valores de color o fuente directamente en componentes o páginas.

### Paleta de colores

| Variable    | Valor     | Uso principal                        |
|-------------|-----------|--------------------------------------|
| `--red`     | `#E1222B` | Acento institucional, CTAs, badges   |
| `--cream`   | `#F9F9F9` | Fondo base del sitio                 |
| `--black`   | `#0F0F0F` | Texto principal, secciones oscuras   |
| `--lgray`   | `#E6E6E6` | Bordes, fondos secundarios           |
| `--dgray`   | `#2E2E2E` | Texto secundario, iconos             |

### Tipografías

| Variable   | Fuente                | Uso                                    |
|------------|-----------------------|----------------------------------------|
| `--sans`   | Instrument Sans       | UI, labels, botones, precios, nav      |
| `--serif`  | Cormorant Garamond    | Headings editoriales, nombres de producto, citas |

### Clases tipográficas reutilizables

Definidas en `css/base/typography.css`:

- `.eyebrow` — etiqueta decorativa con líneas laterales sobre fondo claro.
- `.eyebrow-light` — variante sobre fondo oscuro.
- `.heading-dark` — heading grande sobre fondo negro.
- `.heading-light` — heading grande sobre fondo claro.
- `.body-serif-dark` / `.body-serif-light` — párrafos con fuente serif.
- `.btn-primary` — botón rojo institucional. Variante: `.btn-primary--sm`.
- `.reveal` / `.reveal.visible` — animación de entrada por scroll (IntersectionObserver).

### Breakpoints

| Nombre           | Valor      | Descripción                              |
|------------------|------------|------------------------------------------|
| Desktop          | `> 1024px` | Layout completo, sidebar visible         |
| Tablet           | `<= 1024px`| Sidebar oculto, barra de filtros móvil   |
| Móvil            | `<= 768px` | Una columna, hamburger visible           |
| Móvil pequeño    | `<= 480px` | Ajustes menores de tipografía y grid     |

---

## Patrón de inyección de componentes

Los componentes universales no se copian en cada página HTML. En su lugar se cargan dinámicamente mediante `fetch`. Este patrón garantiza que cualquier modificación al navbar o al footer se aplique en todas las páginas automáticamente.

### Cómo funciona

Cada página HTML declara un placeholder vacío:

```html
<div id="navbar-placeholder"></div>
```

El script de la página llama a `loadNavbar()`, que descarga el fragmento HTML y lo inyecta en el placeholder:

```javascript
import { loadNavbar } from '../components/navbar.js';
await loadNavbar();
```

El mismo patrón aplica para el cart drawer (`#cart-placeholder`) y el footer (`#footer-placeholder`).

### Regla crítica sobre posicionamiento

El `#navbar-placeholder` debe estar **fuera del `<div class="site-wrap">`**, antes de él. Los placeholders del cart drawer y del search overlay también van fuera del `site-wrap` ya que son `position: fixed`.

### Cálculo de rutas en fetch

Las rutas de fetch usan `import.meta.url` para ser independientes del servidor:

```javascript
const base = new URL('../..', import.meta.url).href;
const response = await fetch(base + '/components/navbar.html');
```

El `'../..'` sube dos niveles desde `js/components/` o `js/pages/` hasta `frontend/`. Si en algún momento se cambia la estructura de carpetas, este valor debe ajustarse en consecuencia.

---

## Módulos JavaScript

Todos los archivos JS son ES Modules nativos. No hay variables globales (`window.*`). La comunicación entre módulos se hace exclusivamente mediante `import/export`.

### js/utils/storage.js

Wrapper de `localStorage` con manejo de errores. Centraliza las keys del proyecto.

| Función        | Descripción                                  |
|----------------|----------------------------------------------|
| `getCart()`    | Lee el carrito desde localStorage            |
| `saveCart()`   | Persiste el carrito en localStorage          |
| `getFavs()`    | Lee favoritos desde localStorage             |
| `saveFavs()`   | Persiste favoritos en localStorage           |
| `isLoggedIn()` | Indica si hay sesión activa                  |
| `setLoggedIn()`| Marca sesión como activa (temporal, sin JWT) |
| `logout()`     | Elimina la clave de sesión                   |

### js/utils/formatter.js

Funciones de formateo sin efectos secundarios.

| Función                    | Descripción                                            |
|----------------------------|--------------------------------------------------------|
| `formatPriceMXN(n)`        | Convierte número a "$1,210 MXN"                        |
| `normalizePriceInput()`    | Acepta número o string y siempre devuelve formato MXN  |
| `parsePriceMXN(str)`       | Extrae el valor numérico de un precio formateado       |
| `buildCartId(name, ml)`    | Genera el ID canónico de un ítem en el carrito         |
| `formatVolLabel(ml, tipo)` | Formatea etiqueta de volumen ("50 ml" o "Plata .925")  |
| `highlightQuery(text, q)`  | Envuelve coincidencias en `<mark class="search-highlight">` |

### js/components/navbar.js

Carga el fragmento HTML del navbar e inicializa: menú hamburguesa móvil, acordeones de submenús, estado de sesión (login/logout), link activo por pathname y cierre de dropdowns al hacer clic fuera.

Exporta: `loadNavbar`

### js/components/cart-drawer.js

Carga el fragmento HTML del cart drawer (que incluye también el search overlay). Gestiona: apertura/cierre del drawer, adición/eliminación de ítems, actualización de totales, barra de progreso de envío gratis ($1,500 MXN), persistencia en localStorage.

Exporta: `initCartDrawer`, `openCart`, `closeCart`, `addItemToCart`

### js/components/fav-drawer.js

Gestiona el dropdown de favoritos en desktop y su reflejo en el panel móvil. Recibe `addItemToCart` como callback desde el script de la página para evitar dependencia circular con `cart-drawer.js`.

Exporta: `initFavDrawer`, `toggleFav`, `renderFavList`, `buildFavRow`

### js/pages/catalogo.js

Orquestador de la página de catálogo. Responsabilidades exclusivas:

- Motor de filtros (categoría, género, familia olfativa, marca, rango de precio).
- Sort por relevancia, precio, novedades y bestsellers.
- Tabs de categoría (Perfumes / Joyería) con sidebar dinámico.
- Lectura de URL params (`?tab=`, `?cat=`) al cargar.
- Load more (paginación por incremento de 6).
- Filter drawer móvil (sincronización con sidebar desktop).
- Construcción del grid de producto con `buildCard()`.

### js/pages/politica-envios.js

Orquestador ligero. Inicializa los componentes universales, el acordeón FAQ y el scroll reveal. Contiene un CATALOG reducido de 6 productos exclusivamente para el search overlay.

### js/pages/[resto de páginas].js

Cada página del sitio tiene su propio orquestador en `js/pages/`. Su responsabilidad es importar los componentes universales necesarios (`loadNavbar`, `initCartDrawer`, `initFavDrawer`, `_loadFooter`) e inicializar la lógica exclusiva de esa página. Ningún orquestador de página debe contener lógica que pertenezca a un componente universal.

### js/config/api.js

Centraliza la `BASE_URL` del backend Spring Boot y cualquier configuración global del API. Todos los archivos en `js/services/` deben importar la URL desde este archivo, nunca escribirla directamente.

### js/services/

Capa de abstracción para las llamadas al API REST. Cada archivo corresponde a un dominio: `auth`, `product`, `order`, `cart`, `payment`. En la etapa actual del proyecto estas llamadas están simuladas con datos locales; al integrar el backend, los cambios se concentran en estos archivos sin necesidad de tocar los orquestadores de página.

---

## Páginas disponibles

| Archivo                         | URL de desarrollo                                             | Descripción                                    |
|---------------------------------|---------------------------------------------------------------|------------------------------------------------|
| `pages/index.html`              | `http://localhost:3000/frontend/pages/index.html`             | Home — hero, novedades, categorías destacadas  |
| `pages/catalogo.html`           | `http://localhost:3000/frontend/pages/catalogo.html`          | Catálogo con filtros, sort y tabs              |
| `pages/producto.html`           | `http://localhost:3000/frontend/pages/producto.html?id=[id]`  | Detalle de producto individual                 |
| `pages/nosotros.html`           | `http://localhost:3000/frontend/pages/nosotros.html`          | Historia y valores de la marca                 |
| `pages/contacto.html`           | `http://localhost:3000/frontend/pages/contacto.html`          | Formulario de contacto                         |
| `pages/favoritos.html`          | `http://localhost:3000/frontend/pages/favoritos.html`         | Lista de productos guardados                   |
| `pages/faq.html`                | `http://localhost:3000/frontend/pages/faq.html`               | Preguntas frecuentes generales                 |
| `pages/politica-envios.html`    | `http://localhost:3000/frontend/pages/politica-envios.html`   | Política de envíos y ciclo semanal             |
| `pages/devoluciones.html`       | `http://localhost:3000/frontend/pages/devoluciones.html`      | Política de devoluciones y cambios             |
| `pages/terminos.html`           | `http://localhost:3000/frontend/pages/terminos.html`          | Términos y condiciones del servicio            |
| `pages/aviso-privacidad.html`   | `http://localhost:3000/frontend/pages/aviso-privacidad.html`  | Aviso de privacidad                            |
| `pages/checkout.html`           | `http://localhost:3000/frontend/pages/checkout.html`          | Proceso de pago                                |
| `pages/cuenta.html`             | `http://localhost:3000/frontend/pages/cuenta.html`            | Dashboard del usuario autenticado              |
| `pages/rastreo.html`            | `http://localhost:3000/frontend/pages/rastreo.html`           | Rastreo del estado de un pedido                |
| `pages/confirmacion.html`       | `http://localhost:3000/frontend/pages/confirmacion.html`      | Confirmación de compra exitosa                 |
| `pages/404.html`                | `http://localhost:3000/frontend/pages/404.html`               | Página de error para rutas no encontradas      |

---

## Datos temporales y preparación para backend

El catálogo de productos está hardcodeado en `js/pages/catalogo.js` como un array `CATALOG`. Este array debe reemplazarse por una llamada al backend cuando el API esté disponible.

```javascript
// TEMPORAL — reemplazar por:
// const CATALOG = await fetch('/api/productos').then(r => r.json());
const CATALOG = [ ... ];
```

El endpoint esperado es `GET /api/productos`. La estructura de cada objeto producto está documentada en el propio array mediante los comentarios del código.

La sesión de usuario también es temporal: se simula con `localStorage.setItem('hera_logged_in', '1')`. Al integrar el backend, reemplazar por un token JWT en `js/utils/storage.js`.

La configuración de la URL base del API deberá centralizarse en `js/config/api.js` (archivo preparado en la arquitectura pero aún no creado).

---

## Reglas de desarrollo

### Al agregar una nueva página

1. Crear `pages/[nombre].html` — HTML limpio sin `<style>` ni `<script>` inline.
2. Crear `css/pages/[nombre].css` — solo estilos exclusivos de esa página.
3. Crear `js/pages/[nombre].js` — orquestador que importa los componentes universales.
4. Colocar `#navbar-placeholder` **fuera** del `<div class="site-wrap">`, antes de él.
5. Verificar que los `<link>` en el `<head>` incluyan los archivos base y de componentes necesarios.

### Al modificar un componente universal

Modificar únicamente el fragmento HTML en `components/[nombre].html` o la lógica en `js/components/[nombre].js`. El cambio se propagará automáticamente a todas las páginas que lo usen.

### Al agregar estilos

- Estilos globales de tipografía → `css/base/typography.css`
- Estilos de un componente existente → su archivo en `css/components/`
- Estilos exclusivos de una página → `css/pages/[nombre].css`
- Nunca agregar `<style>` inline en archivos HTML.
- Nunca usar valores de color o fuente directos; siempre usar variables de `tokens.css`.

### Convención de nombres

- Archivos CSS y JS: kebab-case (`politica-envios.css`).
- IDs en HTML: camelCase (`navHamburger`, `cartDrawerCount`).
- Clases CSS: BEM simplificado con prefijo del componente (`cart-item`, `cart-item-brand`).
- Funciones JS públicas: camelCase (`loadNavbar`, `addItemToCart`).
- Funciones JS privadas: prefijo guión bajo (`_initMobileMenu`, `_loadFooter`).

---

## Historial de refactorización

Este proyecto comenzó como un conjunto de monolitos HTML (CSS y JS embebidos en cada página) y fue migrado a la arquitectura modular documentada en este README.

El proceso completo está documentado en `HERA_Normalizacion_y_Refactorizacion_v1_9.md`, que incluye los hallazgos por tipo (A/B/C/D/E), las decisiones de diseño tomadas y el registro de cada página normalizada.

| Fase                                | Descripción                                                                         |
|-------------------------------------|-------------------------------------------------------------------------------------|
| Creación del Design System          | tokens.css, reset.css, typography.css como base compartida del proyecto             |
| Normalización v1.0 — v1.9           | Sincronización de bloques universales en todos los monolitos HTML                   |
| Refactorización — todas las páginas | Migración de monolitos a arquitectura modular (HTML + CSS + JS separados)           |
| Extracción de componentes           | Creación de navbar.html, cart-drawer.html y footer.html como fragmentos reutilizables |
