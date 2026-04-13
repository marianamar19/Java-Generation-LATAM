# HERA Perfumes & Joyería
## Guía de Normalización y Refactorización del Frontend
**Versión:** 2.0  
**Estado:** Activo  
**Audiencia:** Equipo de desarrollo frontend — CH65

**Historial de versiones:**
| Versión | Cambios |
|---------|---------|
| 1.0 | Documento inicial |
| 1.1 | Añadido protocolo de auditoría de archivos (Sección 16). Actualizado tipos de suciedad para incluir CSS/JS inline en strings de JavaScript. Añadido tipo de error: etiquetas HTML huérfanas. Actualizado Paso 1 del orden de trabajo. |
| 1.2 | Añadida Sección 0: Instrucciones para el operador IA. Codifica el protocolo de trabajo que evita omisiones y consumo innecesario de tokens. |
| 1.3 | Corregida terminología: "componentes" reemplazado por "bloques" según etapa actual del proyecto. Añadida Sección 17: Protocolo de sincronización de bloques globales. Actualizada Sección 0 con instrucciones para tareas de sincronización. |
| 1.4 | Eliminado cursor personalizado del proyecto. Removido de la tabla de bloques globales (Sección 7) y de la estructura de archivos futuros (Sección 13). |
| 1.5 | Añadida Sección 18: Aprendizajes de sincronización. Añadida Sección 19: Registro de bloques del proyecto. Actualizado Paso 4 de la Sección 17 con verificación de especificidad CSS. Actualizada Sección 0.3 con distinción entre bloques globales y exclusivos para comentarios de breakpoint. |
| 1.6 | Añadidas líneas exactas de cada bloque en `index_v1.html` a la Sección 19. Permite extraer bloques sin leer el archivo completo. Añadida instrucción en Sección 0.1 sobre uso del registro de líneas. |
| 1.7 | Añadida confirmación explícita de bloques universales como paso previo obligatorio (Sección 0.1 paso 0 y Sección 0.7). Añadido protocolo de presentación de hallazgos en chat antes de aplicar cambios (Sección 0.7). Añadida pregunta de auditoría post-normalización. Registrada `contacto.html` en Sección 19. |
| 1.8 | Registrada `cuenta.html` en Sección 19. Actualizada tabla 19.1 con páginas sincronizadas. Añadida tabla de bloques exclusivos de `cuenta.html` en Sección 19.2. |
| 1.9 | Registrada `aviso-privacidad.html` en Sección 19. Actualizada tabla 19.1 con páginas sincronizadas. Añadida tabla de bloques exclusivos de `aviso-privacidad.html` en Sección 19.2. |
| 2.0 | Registrada `404.html` en Sección 19. Actualizada tabla 19.1 con páginas sincronizadas. Añadida tabla de bloques exclusivos de `404.html` en Sección 19.2. |

---

## Índice

0. [Instrucciones para el operador IA](#0-instrucciones-para-el-operador-ia)
   - 0.1 Antes de ejecutar cualquier tarea
   - 0.2 Protocolo de auditoría
   - 0.3 Checklist de cumplimiento por archivo
   - 0.4 Tabla de botones con aria-label obligatorio
   - 0.5 Regla de entrega
   - 0.6 Formato del reporte de auditoría
   - **0.7 Protocolo de confirmación de bloques universales y presentación de hallazgos** ← nuevo
1. [Contexto y motivación](#1-contexto-y-motivación)
2. [Objetivo](#2-objetivo)
3. [Alcance](#3-alcance)
4. [Principios fundamentales del proyecto](#4-principios-fundamentales-del-proyecto)
5. [Separación de responsabilidades](#5-separación-de-responsabilidades)
6. [Convención de nombres](#6-convención-de-nombres)
7. [Componentes globales identificados](#7-componentes-globales-identificados)
8. [Tipos de suciedad y cómo resolverlos](#8-tipos-de-suciedad-y-cómo-resolverlos)
9. [Manejo de errores](#9-manejo-de-errores)
10. [SEO y accesibilidad](#10-seo-y-accesibilidad)
11. [Diseño responsive](#11-diseño-responsive)
12. [Documentación del código](#12-documentación-del-código)
13. [Consideraciones futuras](#13-consideraciones-futuras)
14. [Lo que no se debe modificar todavía](#14-lo-que-no-se-debe-modificar-todavía)
15. [Orden de trabajo recomendado](#15-orden-de-trabajo-recomendado)
16. [Protocolo de auditoría de archivos](#16-protocolo-de-auditoría-de-archivos)
17. [Protocolo de sincronización de bloques globales](#17-protocolo-de-sincronización-de-bloques-globales)
18. [Aprendizajes de sincronización](#18-aprendizajes-de-sincronización)
19. [Registro de bloques del proyecto](#19-registro-de-bloques-del-proyecto)

---

## 0. Instrucciones para el operador IA

Esta sección define cómo debe comportarse el modelo de IA al trabajar con este proyecto. Su propósito es eliminar omisiones, evitar iteraciones innecesarias y minimizar el consumo de tokens por correcciones evitables.

**Esta sección tiene prioridad sobre cualquier comportamiento por defecto del modelo.**

---

### 0.1 — Antes de ejecutar cualquier tarea

Al recibir una tarea sobre cualquier archivo del proyecto, el modelo debe leer este documento **antes de tocar el archivo**. No asumir conocimiento previo del documento aunque haya sido leído en la misma sesión: las instrucciones pueden haber cambiado entre versiones.

Secuencia obligatoria antes de ejecutar:

1. Leer este documento completo.
2. Identificar qué secciones aplican a la tarea recibida.
3. Determinar el **tipo de tarea**:
   - **Auditoría / normalización:** seguir Sección 16 + checklist Sección 0.3.
   - **Sincronización de bloques globales:** seguir Sección 17.
   - **Ambas combinadas:** primero Sección 17, luego Sección 16 sobre el contenido exclusivo restante.
4. **Confirmar bloques universales con el usuario** siguiendo el protocolo de la Sección 0.7. Este paso es obligatorio antes de tocar el archivo y antes de los pasos siguientes.
5. Si la tarea requiere extraer un bloque de `index_v1.html`, consultar **primero** la Sección 19.1 para obtener las líneas exactas del bloque. Leer solo esas líneas en lugar de leer el archivo completo.
6. Leer el archivo objetivo completo en bloques consecutivos sin gaps antes de ejecutar.
7. Solo entonces ejecutar.

**No saltarse ningún paso aunque la tarea parezca simple.**

---

### 0.2 — Protocolo de auditoría (obligatorio en toda revisión)

Toda tarea que implique revisar, comparar o auditar un archivo debe seguir el protocolo de 4 pasos de la **Sección 16** sin excepción:

1. Lectura completa en una sola pasada, bloques de 500–600 líneas sin gaps.
2. Lista bruta de hallazgos: número de línea, tipo, descripción en una línea.
3. Clasificación y soluciones propuestas sobre los hallazgos completos.
4. Verificación cruzada en las zonas de alto riesgo listadas en la Sección 16.

**Regla crítica:** No clasificar ni proponer soluciones durante la lectura. Primero ver todo, luego pensar. Mezclar ambas actividades es la causa principal de omisiones.

---

### 0.3 — Checklist de cumplimiento por archivo

Al auditar o normalizar cualquier archivo HTML del proyecto, verificar **todos** los puntos de esta lista. No reportar un archivo como completo hasta que cada punto esté confirmado.

#### Suciedad (Sección 8)
- [ ] Tipo A: cero `style="..."` en etiquetas HTML
- [ ] Tipo B: cero `onclick=`, `onmouseover=`, `onmouseout=` en etiquetas HTML
- [ ] Tipo C: cero `style="..."` dentro de strings de `innerHTML` en JavaScript
- [ ] Tipo D: cero `onclick=` dentro de strings de `innerHTML` en JavaScript
- [ ] Tipo E: cero etiquetas HTML huérfanas o mal anidadas

#### Estructura (Sección 5)
- [ ] CSS en bloque `<style>` dentro del `<head>`
- [ ] JavaScript en bloque `<script>` al final del `<body>`
- [ ] HTML sin atributos de estilo ni eventos inline

#### Convención de nombres (Sección 6)
- [ ] Clases CSS en `kebab-case` con prefijo de componente
- [ ] IDs en `kebab-case`
- [ ] Funciones JS en `camelCase` con verbo al inicio
- [ ] Variables JS en `camelCase`

#### Manejo de errores (Sección 9)
- [ ] Toda lectura de `localStorage` protegida con `try/catch`
- [ ] Todo acceso al DOM verificado con guard (`if (elemento)`) antes de operar

#### SEO y accesibilidad (Sección 10)
- [ ] Un solo `<h1>` por página
- [ ] Jerarquía de encabezados correcta (`<h2>` para secciones, `<h3>` para subsecciones)
- [ ] `aria-label` en todos los botones de solo ícono (ver tabla completa en Sección 10)
- [ ] `<meta name="description">` único y específico por página
- [ ] `<title>` único y específico por página

#### Diseño responsive (Sección 11)
- [ ] Cuatro breakpoints presentes: `>1024px` (base), `≤1024px`, `≤768px`, `≤480px`
- [ ] Cada breakpoint documentado con bloque `/* ═══ BREAKPOINT: NOMBRE — valor ═══ */`
- [ ] **Bloques globales** sincronizados desde `index_v1.html`: verificar que traen sus comentarios `/* ── BLOQUE — comportamiento por breakpoint ── */` incluidos
- [ ] **Bloques exclusivos de la página** (contenido propio): cada sección con CSS responsive debe tener su propio comentario `/* ── NOMBRE-SECCIÓN — comportamiento por breakpoint ── */` describiendo Desktop, Tablet y Móvil — este comentario NO viene del index, hay que generarlo para cada página

#### Documentación (Sección 12)
- [ ] Todo bloque de componente tiene encabezado `/* ══ ... ══ */`
- [ ] Todo código temporal (hardcodeado por ausencia de backend) tiene comentario `/* ── TEMPORAL — ... ── */` con: descripción, instrucción de reemplazo, condición y endpoint esperado
- [ ] Las excepciones de estilo dinámico en JS tienen comentario que explica por qué deben vivir en JS

#### Excepciones aceptadas (no marcar como error)
- `style.display`, `style.overflow`, `style.transform`, `style.width`, `style.background` asignados **desde JavaScript** para controlar estado dinámico (visibilidad, animaciones, posición calculada) son válidos y **no** son Tipo A ni Tipo C. Deben tener comentario si no son autoexplicativos.

---

### 0.4 — Tabla de botones con aria-label obligatorio

Esta tabla es la referencia canónica. En cada archivo que contenga estos elementos, verificar que tengan exactamente el `aria-label` indicado.

| ID del elemento | `aria-label` requerido |
|----------------|------------------------|
| `#cart-btn` | `"Abrir carrito de compras"` |
| `#search-btn` | `"Abrir buscador"` |
| `#search-close-btn` | `"Cerrar buscador"` |
| `#fav-toggle` | `"Ver mis favoritos"` |
| `#nav-hamburger` / `#navHamburger` | `"Abrir menú de navegación"` |
| `#nav-mobile-close` / `#navMobileClose` | `"Cerrar menú"` |
| `#cart-close` | `"Cerrar carrito"` |
| `.fav-btn` (botones de producto) | `"Añadir a favoritos"` |

---

### 0.5 — Regla de entrega

El modelo no debe entregar un archivo como terminado si algún punto del checklist de la Sección 0.3 no está confirmado. Si algún punto no aplica al archivo en cuestión (por ejemplo, un archivo sin carrito no tendrá `#cart-btn`), anotarlo explícitamente como "No aplica" en el reporte.

---

### 0.6 — Formato del reporte de auditoría

Al finalizar una auditoría o normalización, entregar siempre un reporte con esta estructura:

```
## Reporte de auditoría — [nombre del archivo]

### Hallazgos resueltos
| Tipo | Línea(s) | Descripción | Solución aplicada |
|------|----------|-------------|-------------------|

### Puntos del checklist
| Criterio | Estado |
|----------|--------|
| Tipo A — style= inline HTML | ✅ / ❌ |
| ... (todos los puntos de la Sección 0.3) |

### Excepciones documentadas
Lista de style.* en JS que son válidos y por qué.

### Pendientes (si los hay)
Lista de puntos que no pudieron resolverse y por qué.
```

---

### 0.7 — Protocolo de confirmación de bloques universales y presentación de hallazgos

Este protocolo define tres momentos de comunicación obligatoria con el usuario durante cualquier normalización o sincronización.

---

#### Momento 1 — Confirmación de bloques universales (ANTES de ejecutar)

Antes de leer el archivo objetivo o escribir una sola línea de código, el operador IA debe preguntar explícitamente al usuario qué bloques universales deben estar presentes en la página destino.

**Formato obligatorio de la pregunta:**

> *"Antes de comenzar, confirma qué bloques universales deben estar presentes en `[página].html`:"*
>
> | # | Bloque | ¿Incluir? |
> |---|--------|-----------|
> | 1 | Barra de anuncios | ¿Sí / No? |
> | 2 | Navbar completo | ¿Sí / No? |
> | 3 | Panel nav móvil | ¿Sí / No? |
> | 4 | Mi cuenta (sesión) | ¿Sí / No? |
> | 5 | Favoritos (dropdown + móvil) | ¿Sí / No? |
> | 6 | Search overlay | ¿Sí / No? |
> | 7 | Cart drawer | ¿Sí / No? |
> | 8 | Newsletter | ¿Sí / No? |
> | 9 | Footer completo | ¿Sí / No? |
> | 10 | Scroll reveal | ¿Sí / No? |

**Regla:** El operador IA no puede asumir qué bloques van basándose en lo que la fuente de verdad tiene o en lo que otras páginas similares usan. La tabla del §12.1 del Design System es la referencia de páginas ya confirmadas; para cualquier página en proceso, la pregunta explícita es obligatoria.

---

#### Momento 2 — Presentación de hallazgos en el chat (ANTES de aplicar cambios)

Una vez leído el archivo objetivo completo, el operador IA debe presentar **en el chat** la lista completa de hallazgos encontrados antes de aplicar cualquier cambio. El usuario puede revisar, comentar o priorizar antes de que el operador proceda.

**Formato obligatorio de la lista:**

```
HALLAZGOS — [nombre-archivo].html
──────────────────────────────────
Tipo A — CSS inline en HTML           (N hallazgos)
  [ ] 1. Línea N — [elemento] tiene style="..." → extraer como .[clase]
  [ ] 2. ...

Tipo B — JS inline en HTML            (N hallazgos)
  [ ] 3. Línea N — [elemento] tiene onclick="..." → addEventListener
  [ ] ...

Tipo C — CSS inline en strings JS     (N hallazgos)
  [ ] ...

Tipo E — Estructurales                (N hallazgos)
  [ ] ...

Bloques globales a sincronizar        (N bloques)
  [ ] ...
```

El usuario confirma o comenta. El operador no aplica cambios hasta recibir confirmación.

---

#### Momento 3 — Pregunta de auditoría (DESPUÉS de normalizar)

Al finalizar la normalización y antes de actualizar el registro (Sección 19), el operador IA pregunta:

> *"La normalización de `[página].html` está completa. ¿Procedo con la auditoría contra el archivo de Normalización y Refactorización actual para verificar cumplimiento total antes de actualizar el registro?"*

Solo tras aprobación del usuario se ejecuta la auditoría. Solo tras aprobar el resultado de la auditoría se actualiza la Sección 19 con la nueva página.

---

## 1. Contexto y motivación

El sitio web de HERA fue construido como un prototipo funcional dentro de un monolito HTML: cada página contiene su propio HTML, CSS y JavaScript en un solo archivo. Esta decisión fue correcta para la etapa de prototipado porque permitió visualizar e interactuar con el sitio de forma rápida.

Sin embargo, conforme el proyecto creció y múltiples colaboradores trabajaron en distintas páginas de forma simultánea, se introdujeron inconsistencias que hoy representan un problema real:

- Funciones JavaScript que hacen exactamente lo mismo pero tienen nombres distintos según el archivo donde viven.
- Estilos CSS escritos directamente dentro del HTML (`style="..."`) que deben mantenerse manualmente en cada página por separado.
- Lógica JavaScript escrita directamente dentro del HTML (`onclick="..."`, `onmouseover="..."`) que mezcla responsabilidades y dificulta el mantenimiento.
- Componentes como el navbar, el footer y el carrito que existen en múltiples páginas pero no son idénticos entre sí.

El resultado es un sitio donde un cambio en un componente no se refleja automáticamente en todas las páginas, y donde encontrar y corregir un error requiere revisar cada archivo individualmente.

Este documento define el plan para resolver esos problemas de forma ordenada, profesional y sin introducir errores nuevos en el proceso.

---

## 2. Objetivo

Normalizar todos los archivos HTML del proyecto para que:

1. Todos los componentes compartidos sean idénticos en estructura HTML, nombres de clases CSS y nombres de funciones JavaScript en todas las páginas donde aparecen.
2. No exista ningún estilo CSS ni ninguna instrucción JavaScript escrita directamente dentro de etiquetas HTML.
3. El código esté completamente documentado y sea legible para cualquier miembro del equipo.
4. El proyecto quede en condiciones óptimas para la siguiente fase: la refactorización en archivos separados (HTML, CSS, JS independientes por componente).

> **Importante:** Esta fase no separa los archivos todavía. El resultado sigue siendo un monolito por página, pero un monolito limpio, consistente y bien documentado. La separación de archivos es la fase siguiente.

---

## 3. Alcance

### Páginas incluidas

Todas las páginas del proyecto actualmente en el repositorio:

| Archivo | Descripción |
|---------|-------------|
| `index.html` | Página principal — **fuente de verdad** para todos los bloques globales |
| `catalogo.html` | Catálogo de productos |
| `producto.html` | Detalle de producto |
| `checkout.html` | Proceso de pago |
| `cuenta.html` | Perfil y sesión del usuario |
| `favoritos.html` | Lista de favoritos |
| `nosotros.html` | Página de marca |
| `contacto.html` | Formulario de contacto |
| `confirmacion.html` | Confirmación de pedido |
| `faq.html` | Preguntas frecuentes |
| `devoluciones.html` | Política de devoluciones |
| `Politica_envios.html` | Política de envíos |
| `terminos.html` | Términos y condiciones |
| `aviso-privacidad.html` | Aviso de privacidad |
| `404.html` | Página de error |

### Fuente de verdad

`index_v1.html` es el archivo normalizado y fuente de verdad del proyecto. Todo bloque global que exista en otras páginas debe ser idéntico a su versión en `index_v1.html`. Si hay discrepancia, `index_v1.html` gana.

### Fuera del alcance de esta fase

- Separación de archivos CSS y JS independientes (fase siguiente).
- Integración con backend.
- Cambios en el diseño visual o en la funcionalidad.
- Creación de páginas nuevas.

---

## 4. Principios fundamentales del proyecto

Estas reglas aplican sin excepción a todos los archivos y a todos los miembros del equipo.

### Principio 1 — Una sola función para una sola responsabilidad

Si dos botones en distintas partes del sitio hacen exactamente lo mismo, deben llamar a exactamente la misma función con exactamente el mismo nombre.

```
❌ MAL — misma acción, nombres distintos por archivo
   checkout.html  → agregarAlCarrito()
   catalogo.html  → addToCart()
   favoritos.html → addItemToCart()

✅ BIEN — misma acción, mismo nombre en todos los archivos
   Todos los archivos → addItemToCart()
```

### Principio 2 — El HTML solo describe estructura

El HTML define qué elementos existen en la página. Nada más. No define cómo se ven (eso es CSS) ni qué hacen (eso es JavaScript).

### Principio 3 — Sin código inline

Ninguna etiqueta HTML puede contener atributos `style="..."`, `onclick="..."`, `onmouseover="..."` ni ninguna otra forma de CSS o JavaScript embebido directamente.

### Principio 4 — Consistencia absoluta en bloques globales

Un bloque global (navbar, footer, carrito, buscador, etc.) debe ser byte a byte idéntico en todas las páginas donde aparece. Si se cambia en una página, se cambia en todas. La fuente de verdad para cada bloque es `index_v1.html`.

### Principio 5 — Documentación obligatoria

Todo bloque de código que no sea autoexplicativo debe tener un comentario que describa qué hace, por qué existe y desde dónde se usa.

---

## 5. Separación de responsabilidades

Aunque por ahora el código sigue siendo un monolito por página, la estructura interna debe respetar una separación clara entre las tres capas.

### Estructura correcta dentro del monolito

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>HERA — Nombre de la página</title>

  <!-- FUENTES -->
  <link href="https://fonts.googleapis.com/..." rel="stylesheet" />

  <!-- CSS — toda la capa visual va aquí, dentro de <style> -->
  <style>
    /* ... */
  </style>
</head>
<body>

  <!-- HTML — solo estructura y atributos semánticos -->
  <!-- Sin style="...", sin onclick="...", sin onmouseover="..." -->

  <!-- JAVASCRIPT — al final del body, después de que el HTML existe -->
  <script>
    /* ... */
  </script>

</body>
</html>
```

### Por qué el CSS va en el `<head>` y el JS al final del `<body>`

El navegador lee el archivo de arriba a abajo. Si el CSS se carga primero, la página se ve correctamente desde el inicio. Si el JavaScript se carga al final, ya existe todo el HTML cuando el JS intenta conectarse a los elementos — lo que evita errores silenciosos donde una función intenta encontrar un botón que todavía no ha sido creado.

---

## 6. Convención de nombres

Estas convenciones son obligatorias y no tienen excepciones.

### Clases CSS — `kebab-case` con prefijo de componente

```
.{componente}-{elemento}--{modificador-opcional}

Ejemplos:
  .cart-badge
  .cart-item
  .cart-item--active
  .nav-dropdown
  .footer-links
  .fav-btn
  .fav-btn--active      ← modificador de estado
```

### IDs HTML — `kebab-case`

Los IDs se usan para elementos únicos en la página (un solo carrito, un solo buscador, etc.).

```
Ejemplos:
  #cart-btn
  #search-input
  #nav-hamburger
  #fav-count
```

### Funciones JavaScript — `camelCase` con verbo al inicio

El nombre de la función debe describir la acción que realiza.

```
Ejemplos:
  openCart()
  closeCart()
  addItemToCart()
  toggleFav()
  renderFavList()
  openSearch()
  renderSearchResults()
```

### Variables JavaScript — `camelCase`

```
Ejemplos:
  cartItems
  favList
  searchQuery
  cartBadge
```

### Archivos — `kebab-case`

```
Ejemplos (fase de refactorización):
  cart.js
  nav.css
  search.css
  favorites.js
```

### Cuando un componente tiene variante de contexto

Si el estilo de un elemento cambia según la sección donde vive, se usa el selector de contexto en CSS en lugar de crear una clase nueva.

```css
/* Base — aplica siempre */
.fav-btn { color: rgba(15,15,15,.3); }

/* Variante — dentro de product-card */
.product-card .fav-btn { color: rgba(249,249,249,.35); }

/* Variante — dentro de ed-item */
.ed-item .fav-btn { color: rgba(15,15,15,.3); }
```

La función JS es siempre la misma (`toggleFav()`). El contexto visual se maneja en CSS, no en JavaScript.

---

## 7. Bloques globales identificados

### Terminología según etapa del proyecto

| Etapa | Término correcto |
|-------|-----------------|
| **Actual** — monolito por página | **Bloque** o **fragmento** — código copiado que vive dentro de cada archivo |
| **Siguiente fase** — CSS/JS en archivos separados | **Módulo** — código extraído a archivos propios pero aún ensamblado manualmente |
| **Fase futura** — ensamblado en servidor (AWS) | **Componente** o **partial** — unidad reutilizable instanciada automáticamente |

El término "componente" implica encapsulamiento y reutilización real. En la etapa actual cada bloque global es código duplicado que se mantiene idéntico de forma manual. Usar "bloque" evita confusión con frameworks o arquitecturas que el proyecto todavía no usa.

---

Estos bloques deben ser idénticos en todas las páginas donde aparecen. La versión de referencia para cada uno es la que existe en `index_v1.html` (archivo normalizado — fuente de verdad).

| # | Bloque | ¿Dónde aparece? | ¿Tiene JS? | localStorage key |
|---|--------|-----------------|-----------|-----------------|
| 1 | Barra de anuncios | Todas las páginas | No | — |
| 2 | Navbar (desktop) | Todas las páginas | Sí | — |
| 3 | Panel móvil de navegación | Todas las páginas | Sí | — |
| 4 | Mi cuenta (sesión) | Todas las páginas | Sí | `hera_logged_in` |
| 5 | Favoritos (dropdown + panel móvil) | Todas las páginas | Sí | `hera_favs` |
| 6 | Search overlay (buscador) | Todas las páginas | Sí | — |
| 7 | Cart drawer (carrito lateral) | Todas las páginas | Sí | `hera_cart` |
| 8 | Footer | Todas excepto `cuenta.html` | No | — |
| 9 | Scroll reveal (IntersectionObserver) | Todas las páginas | Sí | — |

### Tokens globales (base de diseño)

Estos valores viven en `:root` y no deben redefinirse en ningún otro lugar del CSS.

```css
:root {
  --red:   #E1222B;
  --cream: #F9F9F9;
  --black: #0F0F0F;
  --lgray: #E6E6E6;
  --dgray: #2E2E2E;
  --sans:  'Instrument Sans', sans-serif;
  --serif: 'Cormorant Garamond', serif;
}
```

---

## 8. Tipos de suciedad y cómo resolverlos

Existen cuatro tipos de suciedad en el proyecto. Los primeros dos viven en el HTML. Los últimos dos viven dentro del JavaScript. Todos deben eliminarse.

### Tipo A — CSS inline en HTML (`style="..."`)

**Problema:**
```html
<!-- ❌ El estilo vive dentro del HTML -->
<span id="cart-count" style="position:absolute; top:-4px; right:-6px; 
width:16px; height:16px; background:var(--red); border-radius:50%;">
```

Si este elemento existe en 10 páginas, hay 10 copias del mismo estilo. Cambiar una no cambia las demás.

**Solución — mover el estilo al bloque `<style>`:**
```html
<!-- ✅ HTML limpio -->
<span id="cart-count" class="cart-badge">
```
```css
/* CSS — un solo lugar */
.cart-badge {
  position: absolute;
  top: -4px;
  right: -6px;
  width: 16px;
  height: 16px;
  background: var(--red);
  border-radius: 50%;
}
```

**Caso especial — `onmouseover` para efectos de hover:**

Estos no son JavaScript real, son efectos visuales que pertenecen al CSS.

```html
<!-- ❌ Efecto visual escrito como JS -->
<a onmouseover="this.style.color='var(--red)'"
   onmouseout="this.style.color='var(--dgray)'">
  Mis pedidos
</a>
```
```css
/* ✅ Donde siempre debió vivir */
.account-dropdown a:hover { color: var(--red); }
```

---

### Tipo B — JavaScript inline en HTML (`onclick="..."`)

**Problema:**
```html
<!-- ❌ La lógica vive dentro del HTML -->
<button onclick="goToCheckout()">Proceder al pago</button>
```

**Solución — conectar el evento desde el bloque `<script>`:**
```html
<!-- ✅ HTML limpio — solo el ID -->
<button id="checkout-btn">Proceder al pago</button>
```
```js
/* JS — un solo lugar */
document.getElementById('checkout-btn')
  .addEventListener('click', goToCheckout);
```

---

### Tipo C — CSS inline dentro de strings JavaScript

Este tipo es el más difícil de detectar porque no está en el HTML directamente sino dentro de funciones JavaScript que generan HTML con `innerHTML`. El resultado es idéntico al Tipo A — se crean elementos con `style="..."` en tiempo de ejecución.

```js
// ❌ CSS inline dentro de un string de JS
row.innerHTML = '<div style="font-size:11px;color:rgba(15,15,15,.5);">' + item.vol + '</div>';

// ✅ Usar una clase
row.innerHTML = '<div class="fav-row-vol">' + item.vol + '</div>';
```

```js
// ❌ CSS inline en la función highlight() del buscador
return text.replace(re, '<mark style="background:rgba(225,34,43,.15);color:var(--red);">$1</mark>');

// ✅ Usar una clase
return text.replace(re, '<mark class="search-highlight">$1</mark>');
```

**Aplica también a:** `row.style.cssText = '...'` y cualquier asignación directa de estilos a través de `innerHTML` strings.

**Excepción aceptada:** Estilos que son valores calculados dinámicamente en JS (posición del cursor, dimensiones del carrusel, estados de visibilidad controlados por lógica de negocio) son aceptables y no se eliminan. Se documentan con un comentario que explica por qué deben vivir en JS.

---

### Tipo D — JavaScript inline en strings de HTML generado por JS

Similar al Tipo B pero dentro de templates de `innerHTML`:

```js
// ❌ onclick inline dentro de un string de JS
html += '<div class="search-result-item" onclick="closeSearch()">';

// ✅ Usar delegación de eventos en el contenedor
document.getElementById('search-results').addEventListener('click', function(e) {
  if (e.target.closest('.search-result-item')) closeSearch();
});
```

---

### Tipo E — Errores estructurales HTML

Etiquetas de cierre huérfanas (sin apertura correspondiente) o mal anidadas. No son inline CSS/JS pero son suciedad que produce HTML inválido y puede causar comportamiento inesperado en distintos navegadores.

```html
<!-- ❌ </a> huérfano — no tiene <a> de apertura -->
<div class="hero-card-wrap">
  <div class="hero-card">...</div>
  </a>   ← eliminar esta línea
</div>
```

**Solución:** eliminar la etiqueta huérfana.

---

## 9. Manejo de errores

Toda operación que pueda fallar debe tener protección. El código no debe romperse silenciosamente.

### Regla — lectura de localStorage

```js
/* ❌ Sin protección — si el dato está corrupto, el sitio rompe */
var items = JSON.parse(localStorage.getItem('hera_cart'));

/* ✅ Con protección — si falla, devuelve un array vacío */
var items = [];
try {
  var raw = localStorage.getItem('hera_cart');
  if (raw) items = JSON.parse(raw);
} catch(e) {
  items = [];
}
```

### Regla — acceso a elementos del DOM

```js
/* ❌ Sin protección — si el elemento no existe, el sitio rompe */
document.getElementById('fav-count').textContent = '3';

/* ✅ Con protección — verifica antes de operar */
var favCount = document.getElementById('fav-count');
if (favCount) favCount.textContent = '3';
```

Esta protección es especialmente importante para componentes que no existen en todas las páginas.

---

## 10. SEO y accesibilidad

### Estructura de encabezados

Cada página debe tener exactamente un `<h1>` que describe el contenido principal. Las secciones usan `<h2>`, las subsecciones `<h3>`.

```html
<!-- ✅ Jerarquía correcta -->
<h1>Catálogo de Perfumes</h1>
  <h2>Bestsellers de la semana</h2>
  <h2>Novedades</h2>
```

### Botones con solo ícono

Todo botón que no tenga texto visible debe tener `aria-label` descriptivo. Google y los lectores de pantalla usan este atributo para entender qué hace el botón.

```html
<!-- ❌ Google no sabe qué hace este botón -->
<button id="cart-btn">
  <svg>...</svg>
</button>

<!-- ✅ Google entiende el propósito del botón -->
<button id="cart-btn" aria-label="Abrir carrito de compras">
  <svg>...</svg>
</button>
```

### Botones que deben tener `aria-label`

Ver tabla completa en **Sección 0.4**. Esa tabla es la referencia canónica.

### Meta tags por página

Cada página debe tener su propio `<title>` y `<meta name="description">` únicos. Estos son los textos que Google muestra en los resultados de búsqueda.

```html
<title>Catálogo de Perfumes Originales — HERA Perfumes & Joyería</title>
<meta name="description" content="Descubre nuestra colección de perfumes 100% originales. 
Diseñador, nicho, árabes y más. Envío a todo México." />
```

### Links descriptivos

El texto visible de un link debe describir a dónde lleva, nunca usar frases genéricas.

```html
<!-- ❌ No aporta información a Google -->
<a href="catalogo.html">Click aquí</a>

<!-- ✅ Google entiende el destino -->
<a href="catalogo.html">Ver catálogo de perfumes</a>
```

---

## 11. Diseño responsive

### Breakpoints del proyecto

Estos valores son fijos. No deben modificarse sin actualizar todos los archivos.

| Nombre | Valor | Uso |
|--------|-------|-----|
| Desktop | `> 1024px` | Estilos base (sin media query) |
| Tablet | `≤ 1024px` | `@media (max-width: 1024px)` |
| Móvil | `≤ 768px` | `@media (max-width: 768px)` |
| Móvil pequeño | `≤ 480px` | `@media (max-width: 480px)` |

### Filosofía: Desktop-first

El proyecto usa Desktop-first: los estilos base aplican a pantallas grandes y los `@media` reducen hacia móvil. Esta filosofía se mantiene por consistencia — no se cambia a mitad del proyecto.

### Regla — los media queries también deben ser clases, no inline

Un estilo responsive escrito como `style="..."` tiene exactamente el mismo problema que cualquier otro CSS inline: no puede estar en el HTML.

```html
<!-- ❌ MAL -->
<div style="display:none;" class="mobile-only">

<!-- ✅ BIEN — la lógica responsive vive en el CSS -->
<div class="mobile-only">
```
```css
.mobile-only { display: none; }

@media (max-width: 768px) {
  .mobile-only { display: block; }
}
```

### Cada componente debe documentar su comportamiento por breakpoint

```css
/* ── NAV — comportamiento por breakpoint
   Desktop  (>1024px): horizontal con dropdowns hover
   Tablet   (≤1024px): horizontal comprimido, gap reducido
   Móvil    (≤768px):  oculto, reemplazado por panel lateral
── */
```

Este bloque va inmediatamente antes de los estilos base del componente. Es obligatorio en todo componente que tenga comportamiento diferente según breakpoint.

---

## 12. Documentación del código

### Encabezado de bloque (para cada componente o sección)

```js
/* ════════════════════════════════════════
   CARRITO — Drawer lateral de compras

   Responsabilidad: abrir/cerrar el drawer,
   renderizar ítems, calcular totales y
   persistir estado en localStorage.

   Se activa desde: navbar (cart-btn),
   página producto, página catálogo,
   dropdown de favoritos.

   localStorage key: hera_cart
════════════════════════════════════════ */
```

### Comentario de función (solo cuando no es evidente)

```js
/* Agrega un producto al carrito. Si el producto ya existe,
   incrementa su cantidad en lugar de crear un ítem duplicado. */
function addItemToCart(id, brand, name, price, vol, nivel) { }
```

### Comentario de código temporal (pendiente de backend)

Todo código que existe solo porque no hay backend todavía debe marcarse explícitamente.

```js
/* ── TEMPORAL — datos hardcodeados por ausencia de backend
   Reemplazar este array por una llamada fetch() a la API
   cuando el backend esté disponible.
   Endpoint esperado: GET /api/productos
── */
var CATALOG = [
  { id: 'jenny-1', brand: 'Jenny Rivera', name: 'Inolvidable EDP', ... },
];
```

### Lo que NO se documenta

No se escriben comentarios que expliquen lo obvio. El código bien nombrado se explica solo.

```js
/* ❌ Comentario innecesario — el nombre ya lo dice todo */
// Abre el carrito
function openCart() { }

/* ✅ Sin comentario — el nombre es suficiente */
function openCart() { }
```

---

## 13. Consideraciones futuras

### Integración con backend

Cuando el backend esté disponible, los cambios en el frontend serán los siguientes:

**Lo que desaparece:**
- El array `CATALOG` hardcodeado en cada página.
- La lógica de "sesión simulada" con `localStorage.setItem('hera_logged_in', '1')`.

**Lo que se modifica:**
- Todas las funciones que hoy leen de `CATALOG` (como `renderSearchResults()`) deberán recibir los datos como parámetro en lugar de leer un array local.
- La lógica de autenticación deberá conectarse al sistema de tokens del backend.

**Lo que se agrega:**
- Una capa de peticiones HTTP con `fetch()` para obtener productos, precios y disponibilidad del servidor.

**Decisión de arquitectura para hacer bien hoy:**

Las funciones de renderizado deben recibir datos como parámetro para que el cambio al backend sea mínimo.

```js
/* ✅ Bien preparado para el backend — recibe datos como parámetro */
function renderSearchResults(productos) {
  /* renderiza los productos */
}

/* Hoy se llama así (datos locales): */
renderSearchResults(CATALOG.filter(...));

/* Mañana se llamará así (datos del servidor): */
fetch('/api/productos?q=' + query)
  .then(res => res.json())
  .then(productos => renderSearchResults(productos));
```

### Separación de archivos (siguiente fase)

La siguiente fase después de esta normalización es separar CSS y JS en archivos independientes. La estructura objetivo será:

```
/assets
  /css
    global.css        ← tokens, reset, tipografía
    nav.css           ← navbar + panel móvil
    cart.css          ← cart drawer
    footer.css        ← footer
    search.css        ← search overlay
    favorites.css     ← favoritos
  /js
    config.js         ← constantes globales (FREE_SHIPPING, localStorage keys)
    nav.js            ← lógica de navegación y menú móvil
    cart.js           ← lógica del carrito
    favorites.js      ← lógica de favoritos
    search.js         ← lógica del buscador
    account.js        ← lógica de sesión
    scroll-reveal.js  ← IntersectionObserver
```

### Despliegue en AWS

El proyecto migrará de GitHub Pages a AWS. Esto habilita el uso de componentes del lado del servidor para ensamblar el navbar y el footer automáticamente en todas las páginas, eliminando la necesidad de copiarlos manualmente.

---

## 14. Lo que no se debe modificar todavía

Para evitar errores durante esta fase de normalización, las siguientes cosas quedan fuera del alcance hasta nuevo aviso:

| Qué | Por qué esperar |
|-----|----------------|
| Lógica de sesión (`hera_logged_in`) | Se reemplaza por completo cuando llegue el backend |
| Array `CATALOG` hardcodeado | Se reemplaza por llamadas al backend |
| Diseño visual y layout | No forma parte del objetivo de esta fase |
| Creación de páginas nuevas | Primero se normalizan las existentes |
| Separación en archivos CSS/JS independientes | Es la fase siguiente, no la actual |
| Imágenes y atributos `loading="lazy"` | Se aplica cuando lleguen las imágenes reales |

---

## 15. Orden de trabajo recomendado

Para ejecutar esta normalización sin introducir errores, seguir este orden estrictamente:

### Paso 1 — Rastreo de código inline

Seguir el **Protocolo de auditoría de archivos** definido en la Sección 16. El rastreo cubre los cinco tipos de suciedad:
- Tipo A: `style="..."` en etiquetas HTML
- Tipo B: `onclick="..."`, `onmouseover="..."`, `onmouseout="..."` en etiquetas HTML
- Tipo C: `style="..."` dentro de strings de `innerHTML` en JavaScript
- Tipo D: `onclick="..."` dentro de strings de `innerHTML` en JavaScript
- Tipo E: etiquetas HTML huérfanas o mal anidadas

No se clasifica ni se propone solución durante el rastreo. Primero se recolecta todo, luego se organiza.

### Paso 2 — Auditoría de bloques globales

Comparar cada bloque global (navbar, footer, carrito, buscador, etc.) en todos los archivos contra la versión de `index_v1.html`. Documentar todas las discrepancias.

### Paso 3 — Normalización de funciones JavaScript

Identificar funciones que hacen lo mismo pero tienen nombres distintos entre archivos. Definir el nombre canónico (usando `index.html` como referencia) y documentar qué archivos necesitan actualización.

### Paso 4 — Aplicar cambios

En este orden y de a un archivo a la vez:
1. Mover CSS inline al bloque `<style>`
2. Mover JS inline al bloque `<script>` usando `addEventListener`
3. Reemplazar `onmouseover`/`onmouseout` con reglas CSS `:hover`
4. Actualizar nombres de funciones inconsistentes
5. Aplicar manejo de errores consistente
6. Agregar `aria-label` a botones de solo ícono (usar tabla de Sección 0.4)
7. Agregar/corregir meta tags de SEO
8. Agregar documentación de código
9. Agregar comentarios de comportamiento por breakpoint en cada componente CSS

### Paso 5 — Verificación

Después de modificar cada archivo, verificar en el navegador que:
- El layout se ve idéntico en desktop, tablet y móvil
- El navbar abre y cierra correctamente
- El carrito agrega productos, actualiza el contador y persiste en localStorage
- Los favoritos funcionan en desktop y en el panel móvil
- El buscador filtra resultados correctamente
- No hay errores en la consola del navegador

### Paso 6 — Reporte

Entregar el reporte de auditoría con el formato definido en la **Sección 0.6**.

---

## 16. Protocolo de auditoría de archivos

Este protocolo existe porque las revisiones parciales o en bloques no secuenciales pierden hallazgos. El costo de una auditoría incompleta es mayor que el de hacerla bien a la primera. Seguir este protocolo sin excepción en cada archivo que se audite.

---

### Por qué falla una auditoría parcial

Leer un archivo en bloques con gaps entre ellos hace que secciones enteras queden sin revisar. El trust section, la función `buildFavRow()` y los strings de `innerHTML` en `updateCartTotals()` son ejemplos reales de suciedad que se escapa cuando se revisa por secciones en lugar de forma secuencial. El otro error frecuente es mezclar rastreo con análisis — categorizar mientras se busca divide la atención y genera omisiones.

---

### Protocolo en 4 pasos — sin excepciones

**Paso 1 — Lectura completa en una sola pasada**

Leer el archivo entero de corrido en bloques consecutivos sin gaps. El tamaño de bloque recomendado es de 500–600 líneas por llamada para garantizar que no haya líneas omitidas entre bloques. No clasificar, no proponer soluciones todavía. Solo marcar las líneas con hallazgo.

**Paso 2 — Lista bruta de hallazgos**

Una lista plana: número de línea, tipo de suciedad (A/B/C/D/E), descripción en una línea. Sin tabla, sin análisis. Rápido y completo.

**Paso 3 — Clasificación y soluciones**

Con todos los hallazgos en mano, organizarlos en la tabla final con categorías y soluciones propuestas. Esto se hace una sola vez sobre datos completos.

**Paso 4 — Verificación cruzada única**

Una segunda pasada rápida enfocada exclusivamente en las zonas de mayor riesgo de omisión:

| Zona de alto riesgo | Por qué se escapa con frecuencia |
|---------------------|----------------------------------|
| Funciones JS con `innerHTML` strings | No son HTML visible — requieren leer el JS con la misma atención que el HTML |
| Secciones de contenido editorial (trust, novedades, pq-hera) | Tienen mucho HTML de contenido con inline CSS sin clases propias |
| Cart drawer HTML | Tiene múltiples capas de contenedores anidados con estilos inline |
| Strings de `innerHTML` en funciones de renderizado (`buildFavRow`, `renderSearchResults`, `updateCartTotals`) | Generan CSS inline en tiempo de ejecución, invisible en el HTML estático |
| Comentarios de comportamiento por breakpoint en CSS de componentes | No son suciedad visible — se omiten cuando la auditoría se enfoca solo en código inline |

Si en esta segunda pasada no se encuentra nada nuevo — la auditoría está cerrada. Si se encuentra algo, se agrega a la lista y se repite la verificación una vez más.

---

### Qué buscar por tipo — checklist rápido

| Tipo | Qué buscar | Dónde esconderse |
|------|-----------|-----------------|
| A | `style="` en etiquetas HTML | En cualquier etiqueta — especialmente divs sin clase, spans de badge/contador, contenedores de dropdown |
| B | `onclick=` `onmouseover=` `onmouseout=` en etiquetas HTML | Botones de acción, links de navegación, tarjetas de categorías, logo del nav |
| C | `style="` dentro de strings en `innerHTML =` o `innerHTML +=` | Funciones `build*`, `render*`, `load*` en el bloque `<script>` |
| D | `onclick=` dentro de strings en `innerHTML =` o `innerHTML +=` | Mismas funciones que Tipo C |
| E | Etiquetas de cierre sin apertura (`</a>`, `</div>` extra) | Cerca de elementos que alguna vez estuvieron envueltos en un link o contenedor que luego se eliminó |
| Doc | Falta de comentario `/* ── COMPONENTE — comportamiento por breakpoint ── */` | Sección CSS de cualquier componente con estilos responsive |

---

---

## 17. Protocolo de sincronización de bloques globales

Este protocolo aplica cuando la tarea es replicar uno o más bloques globales de `index_v1.html` hacia una página destino. Su objetivo es hacer la transferencia sin romper nada del contenido exclusivo de la página ni dejar residuos del bloque anterior.

---

### Por qué no se normaliza primero y se sincroniza después

Normalizar el bloque global del archivo destino antes de reemplazarlo es trabajo que se va a desechar. Si el navbar de `nosotros.html` tiene suciedad y se va a sobrescribir por completo con el del `index_v1.html`, limpiar esa suciedad primero no aporta valor. El orden correcto es: reemplazar primero, normalizar el resto después.

---

### Protocolo en 5 pasos

**Paso 1 — Lectura completa del archivo destino**

Leer el archivo destino completo en bloques consecutivos sin gaps (Sección 16). El objetivo de esta lectura no es auditar suciedad sino **mapear la estructura**:

- Identificar dónde empieza y termina el HTML de cada bloque global actual.
- Identificar qué clases CSS del `<style>` pertenecen a cada bloque global vs. al contenido exclusivo de la página.
- Identificar qué funciones y variables del `<script>` pertenecen a cada bloque global vs. al contenido exclusivo de la página.
- Anotar cualquier particularidad de la página que pueda verse afectada por el reemplazo (clases compartidas, IDs que el bloque usa y la página también, etc.).

**No ejecutar ningún cambio en este paso.**

**Paso 2 — Extracción de los bloques desde `index_v1.html`**

Para cada bloque a sincronizar, identificar y delimitar con precisión sus tres capas en `index_v1.html`:

| Capa | Qué incluir |
|------|-------------|
| HTML | Todo el marcado del bloque, desde el comentario de apertura hasta el tag de cierre |
| CSS | Todos los selectores dentro del `<style>` que pertenecen exclusivamente al bloque |
| JS | Todas las variables, funciones y event listeners dentro del `<script>` que pertenecen al bloque |

Regla: si un selector CSS o una función JS es usada tanto por el bloque global como por contenido exclusivo de la página, **no se considera parte del bloque** — se trata como código compartido y se gestiona en el Paso 4.

**Paso 3 — Reemplazar en el archivo destino**

En este orden estricto:

1. Reemplazar el HTML del bloque en el destino por el HTML extraído del `index_v1.html`.
2. Reemplazar los estilos CSS del bloque en el destino por los estilos extraídos del `index_v1.html`.
3. Reemplazar el JS del bloque en el destino por el JS extraído del `index_v1.html`.

Si el bloque no existe en el archivo destino (página que nunca lo tuvo), insertarlo en la posición correcta según la estructura definida en la Sección 5.

**Paso 4 — Reconciliación**

Después del reemplazo, verificar:

- **Clases CSS huérfanas:** ¿quedaron selectores en el `<style>` del destino que ya no tienen referencia en el HTML porque pertenecían al bloque anterior? → Eliminarlos.
- **JS huérfano:** ¿quedaron funciones o variables en el `<script>` del destino que ya no tienen referencia porque pertenecían al bloque anterior? → Eliminarlos.
- **Referencias rotas:** ¿el bloque nuevo del `index_v1.html` hace referencia a clases CSS o elementos DOM que no existen en la página destino? → Agregarlos o documentar por qué no aplican.
- **Colisiones de nombre:** ¿algún selector CSS del bloque nuevo tiene el mismo nombre que un selector del contenido exclusivo de la página pero con estilos distintos? → Resolver el conflicto antes de continuar.
- **Colisiones de especificidad:** ¿algún elemento del destino tiene clases de origen global Y clases exclusivas de la página al mismo tiempo? Verificar que el CSS resultante aplica correctamente. Si un estilo exclusivo de la página no se ve porque el CSS global lo pisa por orden de aparición, reforzar el selector exclusivo usando doble clase (`.clase-base.clase-variante { }`) en lugar de mover reglas. Ver Sección 18 para contexto de esta regla.

**Paso 5 — Normalizar el contenido exclusivo restante**

Una vez que los bloques globales están sincronizados y la reconciliación está completa, ejecutar el checklist de la Sección 0.3 sobre el contenido exclusivo de la página (su propio HTML, CSS y JS). Seguir el protocolo de auditoría de la Sección 16.

Entregar el reporte con el formato de la Sección 0.6, indicando:
- Qué bloques fueron sincronizados.
- Qué se encontró en la reconciliación.
- Estado del checklist sobre el contenido exclusivo.

---

### Qué NO hacer durante la sincronización

- No modificar el contenido o lógica de los bloques que vienen de `index_v1.html`. Se replican tal cual — si hay algo que corregir en un bloque global, se corrige primero en `index_v1.html` y luego se propaga.
- No aprovechar la sincronización para hacer cambios de diseño o funcionalidad.
---

---

## 18. Aprendizajes de sincronización

Esta sección registra lecciones aprendidas durante la ejecución del proyecto. Cada entrada tiene una regla concreta derivada de un error o hallazgo real. El operador IA debe leer esta sección antes de ejecutar cualquier sincronización o auditoría.

---

### 18.1 — El checklist de breakpoints aplica en dos dimensiones

**Origen:** Auditoría de `nosotros.html` (v1.4 → v1.5).

**Hallazgo:** Los comentarios de comportamiento por breakpoint se aplicaban correctamente a los bloques globales sincronizados desde `index_v1.html`, pero no a los bloques exclusivos de la página (`.nos-hero`, `.nos-historia`, `.nos-valores`, `.nos-equipo`, `.nos-porque`).

**Regla:** El requisito de comentar el comportamiento responsive aplica a **todo CSS que tenga reglas en los `@media`**, sin importar si el bloque es global o exclusivo. Los bloques globales traen sus comentarios del `index_v1.html`. Los bloques exclusivos requieren que el operador los genere para cada página. No asumir que los bloques exclusivos están cubiertos solo porque los globales lo están.

---

### 18.2 — Sincronización y normalización son fases distintas, el checklist cubre ambas

**Origen:** Auditoría de `nosotros.html` (v1.4 → v1.5).

**Hallazgo:** Durante la sincronización el foco natural va a los bloques globales. El Paso 5 del Protocolo de Sincronización (Sección 17) indica normalizar el contenido exclusivo restante, pero en la práctica es fácil reportar el archivo como terminado al concluir la sincronización sin ejecutar el checklist completo sobre el contenido exclusivo.

**Regla:** El archivo no puede reportarse como completo hasta que el checklist de la Sección 0.3 haya sido verificado punto por punto sobre **todo el archivo**, incluyendo el contenido exclusivo. La sincronización resuelve los bloques globales; la normalización resuelve el resto. Ambas deben completarse antes de entregar.

---

### 18.3 — Colisiones de especificidad CSS son silenciosas y visualmente destructivas

**Origen:** Sección "Las personas detrás de HERA" en `nosotros.html`.

**Hallazgo:** El elemento `<h2 class="nos-title-light nos-title-light--dark">` tenía clase de un bloque de contenido exclusivo (`nos-title-light`, definida en línea ~490) y clase de una variante local (`nos-title-light--dark`, definida antes en línea 335). Como CSS aplica la regla que aparece más abajo en el archivo cuando los pesos son iguales, `.nos-title-light` (más abajo) pisaba `.nos-title-light--dark` (más arriba), haciendo el título invisible sobre el fondo gris claro.

**Regla:** Cuando un elemento tiene clases de dos orígenes distintos (global y exclusivo), verificar el orden de declaración en el `<style>`. Si la clase exclusiva aparece antes que la clase global en el archivo, su peso es menor y será pisada. La solución es usar doble clase en el selector: `.clase-global.clase-variante { }` — esto aumenta el peso a dos clases y gana sin importar el orden.

**Patrón correcto:**
```css
/* ❌ Una clase — puede ser pisada por orden de aparición */
.nos-title-light--dark { color: var(--black); }

/* ✅ Doble clase — gana siempre por especificidad */
.nos-title-light.nos-title-light--dark { color: var(--black); }
```

---

## 19. Registro de bloques del proyecto

Este registro es la fuente de verdad para identificar, localizar y reutilizar cualquier bloque del proyecto. Cada entrada especifica en qué archivo vive la versión canónica, qué capas de código incluye y qué páginas ya lo tienen sincronizado.

**Cómo usar este registro:**
- Para sincronizar un bloque a una página nueva: extraer las capas indicadas de la fuente canónica y seguir el Protocolo de la Sección 17.
- Para verificar si una página ya tiene el bloque: consultar la columna "Páginas sincronizadas".
- Para saber qué capas hay que copiar: consultar las columnas HTML / CSS / JS.

---

### 19.1 — Bloques universales

Presentes en todas las páginas (o casi todas). Fuente canónica: `index_v1.html`.

Las columnas de líneas indican el rango exacto dentro de `index_v1.html` donde vive cada capa del bloque. Usar estas líneas para extraer el bloque sin leer el archivo completo.

| # | Bloque | HTML líneas | CSS líneas | JS líneas | Páginas sincronizadas |
|---|--------|------------|------------|-----------|----------------------|
| 1 | Barra de anuncios | 869–882 | 37–41 | — | `index_v1.html`, `nosotros.html` |
| 2 | Navbar desktop | 886–995 | 41–104 | 1428–1498 | `index_v1.html`, `nosotros.html`, `contacto.html`, `cuenta.html`, `aviso-privacidad.html`, `404.html` |
| 3 | Panel nav móvil | 803–867 | 84–101, 636–669 | 1428–1498 | `index_v1.html`, `nosotros.html`, `contacto.html`, `cuenta.html`, `aviso-privacidad.html`, `404.html` |
| 4 | Mi cuenta (sesión) | 889–935 (dentro del nav) | 684–694 | 1499–1563 | `index_v1.html`, `nosotros.html`, `contacto.html`, `cuenta.html`, `aviso-privacidad.html`, `404.html` |
| 5 | Favoritos (dropdown + panel móvil) | 855–867 (panel), 968–993 (desktop) | 693–714, 770–795 | 1817–1951 | `index_v1.html`, `nosotros.html`, `contacto.html`, `cuenta.html`, `aviso-privacidad.html`, `404.html` |
| 6 | Search overlay | 997–1009 | 621–765 | 1352–1427 | `index_v1.html`, `nosotros.html`, `contacto.html`, `cuenta.html`, `aviso-privacidad.html`, `404.html` |
| 7 | Cart drawer | 1308–1335 | 378–640 | 1564–1816 | `index_v1.html`, `nosotros.html`, `contacto.html`, `cuenta.html`, `aviso-privacidad.html`, `404.html` |
| 8 | Footer | 1284–1305 | 356–377 | — | `index_v1.html`, `nosotros.html`, `contacto.html`, `aviso-privacidad.html`, `404.html` |
| 9 | Scroll reveal | — | 428–435 | 1952–1968 | `index_v1.html`, `nosotros.html`, `contacto.html`, `cuenta.html`, `aviso-privacidad.html`, `404.html` |

**Nota importante:** Los bloques Navbar, Panel móvil y Mi cuenta están físicamente entrelazados en el HTML (el panel móvil contiene la sección de cuenta, y el nav contiene los iconos de cuenta, favoritos y carrito). Al sincronizar, los tres se extraen y se colocan juntos. Las líneas de JS de Navbar y Mi cuenta comparten el mismo bloque (1428–1563).

**Nota sobre CATALOG + renderSearchResults:** Van junto al bloque Search overlay. JS líneas 1337–1351 (CATALOG) y 1352–1427 (Search JS completo).

---

### 19.2 — Bloques exclusivos por página

Contenido único de cada página. No se replican a otras páginas salvo indicación explícita.

#### `index_v1.html`

| # | Bloque | HTML | CSS | JS |
|---|--------|------|-----|----|
| 1 | Hero (landing) | ✅ | ✅ | — |
| 2 | Trust section (confianza) | ✅ | ✅ | — |
| 3 | Bestsellers (carrusel de productos) | ✅ | ✅ | ✅ |
| 4 | Brand editorial (Por qué HERA) | ✅ | ✅ | — |
| 5 | Categorías | ✅ | ✅ | ✅ |
| 6 | Novedades (editorial grid) | ✅ | ✅ | ✅ |
| 7 | Testimonials | ✅ | ✅ | — |

#### `nosotros.html`

| # | Bloque | HTML | CSS | JS |
|---|--------|------|-----|----|
| 1 | Hero nosotros | ✅ | ✅ | — |
| 2 | Historia | ✅ | ✅ | — |
| 3 | Valores | ✅ | ✅ | — |
| 4 | Equipo (flip cards) | ✅ | ✅ | ✅ |
| 5 | Por qué elegirnos | ✅ | ✅ | — |

#### `contacto.html`

| # | Bloque | HTML | CSS | JS |
|---|--------|------|-----|----|
| 1 | Contact hero (avatar circular + headline) | ✅ | ✅ | — |
| 2 | Contact split (info de contacto + formulario) | ✅ | ✅ | ✅ |
| 3 | Contact strip (datos rápidos — fondo rojo) | ✅ | ✅ | — |

**Bloques universales excluidos intencionalmente:** Barra de anuncios, Newsletter. Ver §12.1 del Design System.

---

#### `cuenta.html`

| # | Bloque | HTML | CSS | JS |
|---|--------|------|-----|----|
| 1 | Auth panel login | ✅ | ✅ | ✅ |
| 2 | Auth panel registro | ✅ | ✅ | ✅ |
| 3 | Footer mínimo | ✅ | ✅ | — |
| 4 | Success overlay | ✅ | ✅ | ✅ |

**Bloques universales excluidos intencionalmente:** Barra de anuncios (bloque 1), Footer completo (bloque 8).

---

#### `aviso-privacidad.html`

| # | Bloque | HTML | CSS | JS |
|---|--------|------|-----|----|
| 1 | Page hero (h1 + hero-meta 3 columnas) | ✅ | ✅ | — |
| 2 | S2 Responsable | ✅ | ✅ | — |
| 3 | S3 Datos recabados | ✅ | ✅ | — |
| 4 | S4 Finalidades | ✅ | ✅ | — |
| 5 | S5 Derechos ARCO | ✅ | ✅ | — |
| 6 | S6 Transferencias a terceros | ✅ | ✅ | — |
| 7 | S7 Cookies y localStorage | ✅ | ✅ | — |
| 8 | S8 Cambios al aviso | ✅ | ✅ | — |

**Bloques universales excluidos intencionalmente:** Barra de anuncios (bloque 1), Newsletter (bloque 8).

---

#### `404.html`

| # | Bloque | HTML | CSS | JS |
|---|--------|------|-----|----|
| 1 | Hero 404 (fondo negro, número decorativo, copy de error) | ✅ | ✅ | — |

**Bloques universales excluidos intencionalmente:** Barra de anuncios (bloque 1), Newsletter (bloque 8).

---

### 19.3 — Convención para actualizar este registro

Cada vez que se sincronice un bloque universal a una nueva página, agregar esa página en la columna "Páginas sincronizadas" de la Sección 19.1.

Cada vez que se normalice una página nueva, agregar su tabla de bloques exclusivos en la Sección 19.2 con el nombre del archivo como encabezado.

---

*Documento generado como parte del proceso de normalización del proyecto HERA Perfumes & Joyería — CH65.*  
*Versión 2.0 — 13 de abril 2026.*  
*Cualquier modificación a este documento debe ser comunicada a todo el equipo antes de aplicarse.*

