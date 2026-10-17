# REA Atlas — diff 1:1 contra el sistema visual de Pier Gorelli

**Fecha:** 16-10-2026 · **Entrega:** v3 · **Referencia:** [piergorelli.com](https://piergorelli.com/) · **Archivo editado:** `site-concept.html`

> **Interpretación estricta:** la comparación es 1 a 1 **por propiedades, geometría observable y estados de interacción**. No es un *pixel diff* certificado: el navegador de pruebas no puede descargar las capturas equivalentes del sitio original ni cargar las fuentes web externas. El contenido y el logotipo de REA Atlas son distintos por diseño. **No declarar “idéntico en píxeles” ni “mismo shader/GSAP”**.

## 1. Matriz de diferencias: referencia → REA Atlas v2 → REA Atlas v3

| # | Aspecto | Observado en referencia | v2 (previa) | v3 (actual) | Resultado |
|---:|---|---|---|---|---|
| 01 | Canvas claro | `#F4F4F0` | Ya presente | `#F4F4F0` | **Coincidencia CSS** |
| 02 | Texto principal | `#0E0E0D` | Ya presente | `#0E0E0D` | **Coincidencia CSS** |
| 03 | Acento | `#2F5BFF` | Ya presente | `#2F5BFF` | **Coincidencia CSS** |
| 04 | Oscuro | Canvas `#0B0B0C` | Ya presente | `#0B0B0C` | **Coincidencia CSS** |
| 05 | Acentos alternativos | Orange/Lime además de Blue | Ya presente | Igual, con actualización del terreno | **Coincidencia de tokens** |
| 06 | Fuente display/body | `Geist Variable` | Import CSS asíncrono | `Geist` variable 100–900 por Google Fonts | **Declaración equivalente; raster sin verificar** |
| 07 | Fuente metadatos | `Geist Mono Variable` | Import CSS asíncrono | `Geist Mono` variable 100–900 | **Declaración equivalente; raster sin verificar** |
| 08 | Escala display desktop | `--step-5 = 177.6px` a 1440px | 177.6px | **177.6px medidos** | **Coincidencia CSS y geometría** |
| 09 | Segundo titular | `--step-3 = 70.08px` a 1440px | 70.08px | **70.08px medidos** | **Coincidencia CSS y geometría** |
| 10 | Tracking titular | `-0.055em` / subheading `-0.045em` | Ya presente | Conservado | **Coincidencia CSS** |
| 11 | Encabezado | 72px fijo y navegación numerada | 72px | **72px medidos**, navegación roll | **Coincidencia CSS** |
| 12 | Indicador scroll | Regla graduada con progreso porcentual | Regla sin valor numérico | Regla + contador `%` visible en scroll | **Reconstrucción funcional** |
| 13 | Retícula | 12 columnas desktop; 4 a móvil | 12/4 | **12/4 comprobadas** | **Coincidencia CSS** |
| 14 | Gutter desktop | `clamp(16px,2.2vw,32px)` | Ya presente | **31.68px medidos a 1440px** | **Coincidencia CSS** |
| 15 | Hero | `100svh` / padding superior 96px | Similar | **900px medidos en viewport 900px** | **Coincidencia CSS** |
| 16 | Blueprint de introducción | Guías, rectángulos y etiquetas temporales | Ausente | Guías + medidas DOM; salida después de la entrada | **Paridad de patrón, tiempos aproximados** |
| 17 | Título al entrar | Desplazamiento vertical, 1.1s, ease expo.out | Revelado con otro desfase | 1.1s medidos, 0.55s de espera, easing aproximado con `linear()` | **Muy cercano; no mismo interpolador exacto** |
| 18 | Palabras animadas | Blur→nítido, Y 20%, 0.5s, intervalos variables | 0.7s y secuencia uniforme de 65ms | 0.5s, Y 20%, blur 8px, pausas por puntuación | **Cercano; fuente usa aleatoriedad** |
| 19 | Notas/CTA al entrar | Fade + `translateY(16px)`, 1s | Estáticos | 1s con retrasos coordinados | **Reconstrucción funcional** |
| 20 | Terreno topográfico | WebGL2, campo de contornos, respuesta al pointer | Círculos concéntricos CSS | Shader WebGL2 propio + fallback Canvas 2D; responde al puntero | **Aproximado, no shader idéntico** |
| 21 | Cursor técnico | Cruces X/Y, aro y acción contextual | Cursor estándar | Cruces, aro `scale(4.2)`, estados hover/down y etiqueta | **Reconstrucción funcional** |
| 22 | Botones magnéticos | Desplazamiento según cursor, retorno elástico | Ausente | Desplazamiento porcentual y retorno con CSS | **Aproximación** |
| 23 | Preloader | Monograma dibujado y contador | Ausente | Monograma RA propio, progreso 00–100% y salida | **Aproximación con identidad propia** |
| 24 | Manifiesto | Texto outline con fill ligado al scroll | Revelado por hover/observer | Fill por progreso de scroll, no activación binaria | **Paridad de interacción** |
| 25 | Showcase de trabajos | 12 columnas, trabajo fijado en scroll, altura `100svh − 88px` | Muestra de 550px no fija | **812px medidos** a 900px, sticky y avance progresivo | **Paridad de geometría, transición aproximada** |
| 26 | Cambio de muestra | GSAP secuenciado | Fade simple 0.8s | Animación 1.2s / recorte y blur, selección manual y por scroll | **Aproximación** |
| 27 | Navegación suavizada | Lenis: duración 1.15s (rueda + enlaces) | `scroll-behavior: smooth` | Interpolación 1.15s al activar enlaces internos | **Parcial: rueda nativa** |
| 28 | View transitions | Astro para navegación multipágina | No existen | No existen (REA Atlas es una página) | **No aplicable sin multipágina** |
| 29 | Temas y atajos | Light/dark, Blue/Orange/Lime, ⌘K y ⌥G | Funcionaban | Conservados con pruebas | **Paridad de función** |
| 30 | `prefers-reduced-motion` | Cancela movimiento decorativo | Soportado | Cancela intro, cursor, canvas, pinned y transiciones | **Paridad de intención** |
| 31 | Reflow | Debe caber en 320px | Cumplido salvo desviación posterior a sticky | Comprobado de 320 a 1920px sin desborde | **QA aprobado** |

## 2. Geometría real medida por Playwright

Entorno: Chromium local, viewport **1440×900**, `deviceScaleFactor=1`. Los valores de referencia proceden de hojas CSS del sitio original inspeccionadas el 16-10-2026.

| Métrica | CSS original | REA Atlas v3 renderizado | Delta |
|---|---:|---:|---:|
| Header | 72px | 72px | **0px** |
| Altura mínima portada | 900px | 900px | **0px** |
| Gutter desktop | 31.68px | 31.68px | **0px** |
| `display / --step-5` | 177.60px | 177.60px | **0px** |
| `h2 / --step-3` | 70.08px | 70.08px | **0px** |
| Showcase pinned | 812px | 812px | **0px** |
| Columnas desktop | 12 | 12 | **0** |
| Columnas responsive <768px | 4 | 4 | **0** |

**Cuidado con la interpretación:** igualar los valores de CSS no prueba que la tipografía renderizada o la composición del texto sea píxel a píxel idéntica. Las dos páginas contienen frases de largo diferente y el navegador aislado usó tipografías de fallback al no poder obtener Geist desde Google Fonts.

## 3. Análisis temporal

| Secuencia | Origen | REA Atlas v3 | Límite |
|---|---|---|---|
| Duraciones base | 400/800/1200ms | 400/800/1200ms | Igual como token |
| Curva in-out | cubic-bezier(.76,0,.24,1) | Igual | Igual como token |
| Curva out | cubic-bezier(.25,1,.5,1) | Igual | Igual como token |
| Aparición titular | 1100ms, expo.out | 1100ms, `linear()` por puntos | Misma duración, forma muy próxima |
| Blueprint | Dibujado ~1000ms, labels escalonadas | Dibujado 1000ms, labels escalonadas | Dinámica de salida aproximada |
| Aparición por palabra | 500ms; 30–120ms aleatorios + pausas puntuación | 500ms; 75ms deterministas + pausas puntuación | Diferencia real por aleatoriedad y copy |
| Notas/CTA | 1000ms + 16px ascendente | 1000ms + 16px | Inicio retrasado de manera aproximada |
| Scroll interno | Lenis 1150ms expo out | RAF 1150ms expo out | La rueda de mouse sigue nativa |
| Terreno | WebGL2 5 octavas, respuesta suavizada; tiempo de reposo | Shader propio 5 octavas o Canvas 2D, respuesta suavizada | No identidad de frames |
| Showcase | GSAP ScrollTrigger y timelines específicos | Sticky + progreso manual/scroll + CSS animation | No identidad de frames |

**No se usó ni distribuyó código JS/CSS completo del autor**, ni sus fuentes como archivos, logos o imágenes. Se reconstruyeron patrones desde propiedades públicas medidas, con implementaciones propias.

## 4. Archivos para inspeccionar

| Archivo | Qué contiene |
|---|---|
| `site-concept-v2-before-diff.html` | Copia intacta de v2 para comparar y revertir. |
| `site-concept.html` | HTML v3 editable y funcional. |
| `hero-desktop.png` / `hero-hover-desktop.png` | Capturas de la implementación en escritorio, estado final y pointer. |
| `showcase-desktop.png` | Showcase fijado a 812px, inspector de una muestra. |
| `hero-mobile.png` / `hero-mobile-320.png` | Capturas móviles sin movimiento para medir geometría. |
| `REFERENCE-METRICS.json` | Medidas/tokens obtenidos del CSS y JavaScript públicos originales. |
| `QA-V3.json` | Medidas y comprobaciones ejecutadas en el prototipo. |
| `tests/test_fidelity_v3.py` | Prueba automatizada que produce el informe y capturas. |

## 5. Resultados reproducibles

```bash
cd rea-design-library-reference
npm test
python tests/test_site_behavior.py
python tests/test_site_preview.py
python tests/test_fidelity_v3.py
```

Resultado último: **9/9 pruebas Node, smoke y comportamiento OK, 40/40 comprobaciones de geometría/movimiento OK**. La prueba `test_fidelity_v3.py` comprueba geometría, temporización CSS, navegación, indicadores, showcase sticky, canvas en entorno sin WebGL y reflow en 11 anchos. No es un test de identidad de píxeles entre dominios.

## 6. Brechas pendientes para afirmar 1:1 real

1. Capturar **el original y nuestro HTML** en los mismos viewport, navegador, DPR, zoom, fuente cargada, theme y estado de interacción, con tiempos `t=0, .4, .8, 1.2, 1.8, 3.5s` y hover/scroll equivalentes. Guardar PNG y grabaciones de ambos lados.
2. Comparar `pixelmatch`/Playwright por **regiones equivalentes** (header, hero, progress, navegación), evitando comparar contenidos distintos como si fueran equivalentes.
3. Ejecutar con Geist y Geist Mono realmente cargadas y medir cambios de saltos de línea, ascendente, interletrado y ancho del texto. CSS declarado está correcto; la fuente no llegó al sandbox QA sin internet.
4. Medir fotogramas WebGL2, recorrido del cursor, easing de Lenis y ScrollTrigger; ajustar trazas de forma cuantitativa y probar diferencias con `prefers-reduced-motion`.
5. Resolver si se requiere copiar la estructura narrativa completa del portfolio (no es aconsejable para un catálogo) o mantener las funciones específicas de REA Atlas. Mientras el copy, logos y propósito sean distintos, **no es razonable declarar identidad visual de página completa**.

## Fuentes consultadas

- [Pier Gorelli, homepage](https://piergorelli.com/)
- [CSS base original](https://piergorelli.com/_astro/Base.CCmxeWj5.css)
- [CSS del home original](https://piergorelli.com/_astro/index.CG0hduNO.css)
- [Animaciones originales compiladas](https://piergorelli.com/_astro/motion.DTpMruWt.js)
- [Animación de showcase original](https://piergorelli.com/_astro/work-stage.DzNATKeh.js)
- [Terreno WebGL original](https://piergorelli.com/_astro/hero-gl.Dqb3x-ht.js)
- [Declaración de accesibilidad del autor](https://piergorelli.com/accessibility/)
