# REA Atlas — auditoría de fidelidad visual y funcional

**Versión del prototipo:** 2026-10-16 · revisión de diseño Pier Gorelli.
**Entrada:** `site-concept-before-pier-gorelli.html` (copia inmutable de la propuesta anterior).
**Salida:** `site-concept.html` (HTML único, no publicado).
**Referencia de diseño:** https://piergorelli.com/ (sitio web, HTML y CSS disponibles en octubre de 2026).
**Límite importante:** es una *adaptación visual para el producto REA Atlas*, no una reproducción literal del contenido ni del logo de Pier Gorelli.

## Superficie, fuente y método REA Reuse

Alcance solicitado: hacer que el HTML de REA Atlas sea visualmente fiel al sitio de referencia elegido en Awwwards, preservando su función de biblioteca de componentes.

Fuente observada: HTML/stylesheet del sitio original (Astro), contrastada con el prototipo previo y el HTML reimplementado. La brecha se resuelve mediante inspección de código público y QA de navegador; un análisis binario/instrumentación REA no es necesario (`rea.status: not-needed` para esta capacidad).

No se copiaron logos, fotografías ni archivos CSS/JS completos del sitio fuente. Los valores medidos y patrones de composición se reimplementaron en código original para REA Atlas. El sitio original conserva sus derechos; atribución visible en el pie de página.

## Matriz de cambios

| Requisito | Comportamiento/patrón verificado en fuente | Adaptación REA Atlas | Comprobación |
|---|---|---|---|
| Identidad editorial | Fondo crema `#f4f4f0`, tinta `#0e0e0d`, acento azul `#2f5bff` | Variables CSS y variantes dark/orange/lime | Lectura de CSS fuente y prueba de tema/acentos |
| Tipografía | Geist Variable, Geist Mono, escala fluida `--step-3..5` | Familia Geist de carga no bloqueante con fallback, jerarquía equivalente | Inspección de reglas CSS, screenshot desktop/móvil |
| Encabezado | Header fijo de 72 px, navegación numerada, controles de apariencia | Header horizontal; en móvil reemplazo por menú/paleta | Browser QA seis tamaños |
| Retícula | Sistema de 12 columnas, gutter `clamp(16px,2.2vw,32px)` y guías | Secciones 12-col + retícula Alt+G | Browser QA comando/retícula |
| Portada | Hero 100svh, titular enorme y segundo titular en línea editorial | `REA Atlas.` + misión de biblioteca; notes y CTA | Capturas 1440×900, 390 y 320 px |
| Composición editorial | Outline type, reglas finas y metadatos monoespaciados | Manifesto a 3 líneas, catálogo numerado, inspector editorial | Captura completa desktop/móvil |
| Transiciones | Duraciones .4/.8/1.2s; easing cubic-bezier(.76,0,.24,1), (.25,1,.5,1) | Tokens de movimiento, reveales y transiciones funcionales | Inspección CSS fuente y pruebas interacciones |
| Utilidades | Theme, cycling accent, command palette, 12-col grid toggle | Interacciones implementadas y `prefers-reduced-motion` | Browser behavior PASS |
| Función REA | Fuente es portfolio; REA es biblioteca | Conserva búsqueda, 4 muestras, colecciones e inspector, sin simular registry publicado | Browser smoke PASS + 9 pruebas Node |
| Mobile 320 px | Responsividad de diseño editorial | Retícula 4 col, titular adaptable, stage pane y manifesto sin overflow | Browser QA scrollWidth ≤ viewport de 320 a 1440 |

## Evidencia reproducible

```bash
cd rea-design-library-reference
npm test
python tests/test_site_preview.py
python tests/test_site_behavior.py
```

**Resultado registrado (2026-10-16):** 9/9 pruebas Node; browser smoke PASS; browser behavior PASS.

Capturas de implementación:
- `hero-desktop.png`: vista inicial 1440×900.
- `hero-mobile.png`: vista inicial 390×844.
- `hero-mobile-320.png`: vista inicial 320×760.
- `site-concept-preview.png`: captura completa de escritorio.
- `site-concept-mobile.png`: captura completa móvil.

## Limitaciones y pendientes

- **No existe acreditación de identidad 1:1** entre pixels de fuente original y prototipo: no se obtuvieron capturas temporales equivalentes del origen para realizar imagen-diff. La similitud fue evaluada por inspección de código/CSS fuente y screenshots del prototipo.
- El original y REA Atlas tienen contenidos y componentes distintos por intención del producto; por tanto una comparación de página completa pixel idéntica carece de sentido sin cambiar la función del producto.
- Las fuentes web Geist se intentan cargar en segundo plano; sin conexión se usa fallback local, por lo que puede variar la tipografía.
- Hero original usa WebGL/GSAP/Lenis en áreas concretas; REA Atlas mantiene interacciones sin WebGL ni dependencias externas, no imita esos efectos propietarios línea por línea.
- La demo de FALP sigue en estado `candidate`; no representa una comparación visual aprobada con el sitio FALP autenticado.
- `Importar` muestra un aviso porque el flujo de extracción aún no está construido. Las URLs `OWNER/REPO` son marcadores y no son un registry real.
- No se hizo commit, PR, merge ni despliegue. El código es entregado como artefacto local independiente.

## Fuentes

- Sitio referencia: https://piergorelli.com/
- CSS base inspeccionado: https://piergorelli.com/_astro/Base.CCmxeWj5.css
- CSS de portada inspeccionado: https://piergorelli.com/_astro/index.CG0hduNO.css
- Colección Awwwards: https://www.awwwards.com/sites/pier-gorelli
