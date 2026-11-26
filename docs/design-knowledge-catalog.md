# Catálogo de conocimiento de diseño / Design knowledge catalog

Inventario de conceptos y mapa de reutilización, no un segundo registro de componentes.
Corte documental: 2026-11-26. Base de código: [4ae9b6e](https://github.com/fegome90-cmd/ui-kit/commit/4ae9b6e04afbfa50f5a9196a6a0d35d5458d8ec4).
La versión publicada de cualquier catálogo externo no se presume equivalente a este corte.

## 1. Contrato de consolidación

- **Conocimiento:** este índice bilingüe organiza conceptos y relaciones. Los identificadores son de vocabulario, no nombres instalables.
- **Código:** [component-registry.ts](../lib/component-registry.ts) es la única fuente canónica de slugs, familias, categoría, archivos, madurez y API. El [registry shadcn](../scripts/build-registry.mjs) se deriva de ese código.
- **Laboratorio:** una demostración didáctica puede enseñar una técnica sin ser un componente distribuible. Un prototipo no demuestra disponibilidad en main.
- **Referencias:** guardar enlace y una síntesis propia; no copiar recursos de terceros ni contenido privado. No incorporar capturas, código, archivos de respaldo ni credenciales de sitios privados a un repo público.
- **No duplicación:** antes de proponer un componente, buscar por concepto, sinónimos, slugs y PR abiertos. Preferir ampliar la documentación de una implementación existente.
- **Promoción:** un candidato requiere las verificaciones de [guía de trabajo](guia-de-trabajo.md), derechos comprobados y evidencia de instalación y comportamiento antes de declararse estable. El registro puede generar items candidate: no asumir que generación implica autorización o QA.

## 2. Índice bilingüe

60 términos de la línea base histórica, organizados en nueve áreas. Son entradas de conocimiento, **no** 60 fichas completas ni un inventario exhaustivo de ningún sitio activo.
Las relaciones siguientes son propuestas de navegación semántica revisadas contra los slugs de main, no equivalencias funcionales ni aprobación de accesibilidad. (C) indica candidate en el corte; las demás relaciones apuntan a entradas declaradas stable en el registro. «—» significa que no se propone una relación directa en este índice, no que la técnica sea inexistente.

### Fundamentos / Foundations

| ID | ES | EN | Ejemplos relacionados en UI Kit |
|---|---|---|---|
| FUN-001 | Composición | Composition | `rea-catalog`, `lab-bento-grid` (C) |
| FUN-002 | Jerarquía visual | Visual hierarchy | `rea-specimen-stage`, `kraa-reading-canvas`, `lab-chapter-card` (C) |
| FUN-003 | Contraste visual | Visual contrast | `lab-palette` (C), `rea-swatches` |
| FUN-004 | Equilibrio | Balance | `lab-bento-grid` (C) |
| FUN-005 | Alineación | Alignment | `rea-grid-overlay` |
| FUN-006 | Proximidad | Proximity | `action-cluster` |
| FUN-007 | Espacio negativo | Negative space | `kraa-reading-canvas` |
| FUN-008 | Gestalt | Gestalt principles | `lab-process-steps` (C) |

### Tipografía / Typography

| ID | ES | EN | Ejemplos relacionados en UI Kit |
|---|---|---|---|
| TYP-001 | Clasificación tipográfica | Typeface classification | `ninja-font-card` |
| TYP-002 | Peso y tamaño | Font weight and size | `ninja-font-card`, `kraa-typography-settings` |
| TYP-003 | Longitud de línea | Line length | `kraa-reading-canvas`, `kraa-typography-settings` |
| TYP-004 | Interlineado | Line height | `kraa-reading-canvas`, `kraa-typography-settings` |
| TYP-005 | Tracking | Tracking | `rea-note` |
| TYP-006 | Kerning | Kerning | — |
| TYP-007 | Escala tipográfica | Type scale | `kraa-typography-settings` |
| TYP-008 | Corrección óptica | Optical adjustment | — |

### Color e imagen / Color and imagery

| ID | ES | EN | Ejemplos relacionados en UI Kit |
|---|---|---|---|
| CLR-001 | Espacios de color | Color spaces | `lab-palette` (C) |
| CLR-002 | Paletas y armonías | Color palettes and harmonies | `lab-palette` (C), `rea-swatches` |
| CLR-003 | Contraste de color | Color contrast ratio | `lab-palette` (C) |
| CLR-004 | Vector y raster | Vector and raster | — |
| CLR-005 | Resolución y densidad | Resolution and pixel density | — |
| CLR-006 | Formatos de imagen | Image formats | — |
| CLR-007 | Iconografía e ilustración | Iconography and illustration | `icons`, `kit-icons` |

### Layout / Layout

| ID | ES | EN | Ejemplos relacionados en UI Kit |
|---|---|---|---|
| LAY-001 | Anatomía de pantalla | Screen anatomy | `rea-site-header`, `kraa-document-workspace` |
| LAY-002 | CSS Grid | CSS Grid | `rea-grid-overlay`, `lab-bento-grid` (C) |
| LAY-003 | Contenedor y ancho máximo | Container and max width | `kraa-reading-canvas` |
| LAY-004 | Breakpoints | Breakpoints | `ninja-panel`, `kraa-document-workspace` |
| LAY-005 | Modelo de caja | CSS box model | `rea-grid-overlay` |
| LAY-006 | Capas y orden de apilamiento | Layers and stacking | — |

### Componentes / Components

| ID | ES | EN | Ejemplos relacionados en UI Kit |
|---|---|---|---|
| CMP-001 | Botón | Button | `blue-button`, `ninja-button`, `kraa-button`, `rea-button` |
| CMP-002 | Campo de formulario | Form field | `form-fields`, `kraa-field`, `ninja-input` |
| CMP-003 | Controles de selección | Selection controls | `toggle-switch`, `ninja-toggle-group`, `kraa-toggle-group`, `filter-select` |
| CMP-004 | Pestañas | Tabs | `status-tabs`, `lab-feature-tabs` (C) |
| CMP-005 | Acordeón | Accordion | `lab-signal-disclosure` (C) |
| CMP-006 | Tooltip y popover | Tooltip and popover | `icon-button`, `lab-signal-disclosure` (C) |
| CMP-007 | Diálogo y panel lateral | Dialog and drawer | `ninja-panel`, `kraa-document-actions` |
| CMP-008 | Toast | Toast | `rea-toast`, `lab-notification` (C) |
| CMP-009 | Carga, vacío y error | Loading, empty and error | `rea-monogram`, `lab-notification` (C) |

### Sistemas / Design systems

| ID | ES | EN | Ejemplos relacionados en UI Kit |
|---|---|---|---|
| SYS-001 | Tokens | Design tokens | `rea-theme`, `kraa-theme`, `lab-palette` (C) |
| SYS-002 | Estilos reutilizables | Reusable styles | `rea-hover-lift`, `rea-theme` |
| SYS-003 | Variantes | Component variants | `ninja-button`, `rea-button`, `kraa-button` |
| SYS-004 | Estados de interfaz | Interface states | `ninja-button`, `lab-notification` (C) |
| SYS-005 | Documentación de sistema | Design system documentation | `rea-catalog`, `rea-inspector` |

### Implementación / Implementation

| ID | ES | EN | Ejemplos relacionados en UI Kit |
|---|---|---|---|
| LIB-001 | Biblioteca de componentes | Component library | — |
| LIB-002 | Primitivas de interfaz | UI primitives | `ninja-panel`, `ninja-slider`, `ninja-toggle-group` |
| LIB-003 | CSS de utilidades | Utility-first CSS | `rea-button` |
| LIB-004 | Framework de aplicación | Application framework | — |
| LIB-005 | Distribución de código editable | Editable source distribution | — |
| LIB-006 | Biblioteca de animación | Animation library | — |

### Movimiento / Motion

| ID | ES | EN | Ejemplos relacionados en UI Kit |
|---|---|---|---|
| ANI-001 | Curvas de aceleración | Easing | `rea-hover-lift` |
| ANI-002 | Duración y retardo | Duration and delay | `rea-monogram`, `lab-marquee` (C) |
| ANI-003 | Resorte | Spring | — |
| ANI-004 | Escalonamiento y coreografía | Stagger and choreography | `rea-gen-words` |
| ANI-005 | Feedback y gestos | Feedback and gestures | `rea-hover-lift`, `lab-presence-dot` (C), `lab-reveal-card` (C) |
| ANI-006 | Movimiento reducido | Reduced motion | `rea-wireline`, `lab-marquee` (C), `ninja-animated-headline` |

### Entornos / Environments

| ID | ES | EN | Ejemplos relacionados en UI Kit |
|---|---|---|---|
| ENV-001 | Entornos, modos y variables | Environments, modes and variables | — |
| ENV-002 | Estructura de archivos | Project structure | — |
| ENV-003 | Dependencias y scripts | Dependencies and scripts | — |
| ENV-004 | Build de producción | Production build | — |
| ENV-005 | Despliegue y preview | Deployment and preview | — |

## 3. Movimiento: conceptos, mecanismos y componentes

### Inventario de main

El registro tiene 95 entradas únicas (65 declaradas stable y 30 candidate). Cinco están clasificadas como Movimiento. También existe movimiento en otras categorías.

| Patrón | Slug existente | Uso y límite |
|---|---|---|
| Trazo SVG / preloader | `rea-monogram` | Decorativo; no representa progreso real de una operación. |
| Revelación por palabras | `rea-gen-words` | Texto cinético; mantener lectura completa. |
| Texto ligado al desplazamiento | `rea-wireline` | Relación con scroll; alternativa estática. |
| Elevación en hover | `rea-hover-lift` | Feedback de superficie; alternativa sin desplazamiento. |
| Marquesina continua | `lab-marquee` (C) | Repetición; verificar pausa, teclado y reducción de movimiento. |
| Rotación tipográfica | `ninja-animated-headline` | Cambio visual; no duplicar como nueva familia de texto animado. |
| Fondo topográfico | `rea-terrain` (C) | Fondo visual; no condición de navegación. |
| Pulso | `lab-presence-dot` (C) | Presencia, no gravedad ni cantidad. |
| Revelación de tarjeta | `lab-reveal-card` (C) | Feedback en hover/focus. |
| Brillo reactivo | `lab-glow-card` (C) | Relacionado con respuesta al puntero; no equivale a un borde recorrido. |
| Fondo giratorio | `lab-backdrop` (C) | Decoración, no estado del sistema. |
| Cambio de magnitudes | `lab-encoding-compare` (C) | Movimiento de gráficos; no equivale a contador animado. |
| Narrativa de scroll | `lab-scrolly-section` (C) | Composición narrativa, no motor de scroll suave. |
| Contador estático | `lab-lozenge` (C) | Cantidad textual; no confundir con ticker. |

### Trabajo ya propuesto: no duplicar

- [PR #3](https://github.com/fegome90-cmd/ui-kit/pull/3): especificación de movimiento reutilizable.
- [PR #4](https://github.com/fegome90-cmd/ui-kit/pull/4), candidato en commit [57009b5](https://github.com/fegome90-cmd/ui-kit/commit/57009b5d8c2c1e3256353e1da3c3b73aa79cdb33): está apilado sobre #3, no en main. Introduce entrada de escena (`lab-scene-enter`), ampliación con retorno (`lab-focus-expand`), comentario por estado (`lab-step-reveal`) y una demo de composición. GSAP, FLIP y CustomEase tienen carga diferida y fallback instantáneo, según su descripción; no se reejecutaron sus pruebas en esta consolidación.
- [PR #5](https://github.com/fegome90-cmd/ui-kit/pull/5): inspector geométrico candidato, relacionado con alineación y modelo de caja. No contar como entregado.

### Técnicas didácticas a conservar

| Técnica | Aplicación | Referencia pública | Relación |
|---|---|---|---|
| Spring y drag | Interacción física | [Motion](https://motion.dev/docs) | ANI-003, ANI-005 |
| FLIP / reflow | Continuidad al reordenar | [AutoAnimate](https://auto-animate.formkit.com/) | PR #4, ANI-004 |
| Timeline | Secuencia cancelable | [GSAP](https://gsap.com/docs/v3/) | PR #4, ANI-002, ANI-004 |
| Stagger espacial / ripple | Propagación de feedback | [Anime.js](https://animejs.com/) | ANI-004, ANI-005 |
| Física de resortes | Damping, tensión y masa | [React Spring](https://www.react-spring.dev/) | ANI-003 |
| Scroll suave | Control del desplazamiento | [Lenis](https://lenis.darkroom.engineering/) | Evaluar solo si aporta valor |
| Herramientas de autoría | Animación dirigida por estado | [Theatre.js](https://www.theatrejs.com/) / [Rive](https://rive.app/) | Referencias; no afirmar que los motores estén integrados |

No se incorporan dependencias por aparecer en una referencia. Preferir CSS, SVG o WAAPI para mecanismos simples y reutilizar el núcleo del PR #4 para transiciones de layout cuando corresponda.

### Brechas y referencias externas

[Shadcn Studio Illustrations](https://shadcnstudio.com/illustrations) es una fuente de ejemplos, no un upstream de código para este registry. Su [documentación](https://shadcnstudio.com/docs/getting-started/illustrations) explica los patrones y dependencias; su [licencia](https://shadcnstudio.com/license) restringe redistribución y productos competidores. Solo investigación conceptual y enlaces; una implementación nueva debe ser independiente, con revisión de derechos. No se incorporan componentes, derivados, screenshots ni assets.

| Patrón ES / EN | Estado de cobertura a este corte | Decisión |
|---|---|---|
| Conexión animada / Animated beam | Sin slug específico identificado en main ni en el subconjunto de movimiento del PR #4 | Prioridad 1: estudiar SVG propio para representar conexiones de datos; semántica independiente del efecto. |
| Órbita / Orbit | Sin slug específico identificado; rueda de categorías es una visualización distinta | Prioridad 2: estudiar movimiento orbital sin alterar el orden accesible. |
| Pila de tarjetas / Card stack | Relacionado con FLIP y ampliación del PR #4; no equivalente | Esperar evaluación de #4 y considerar composición del mecanismo existente. |
| Ondas / Ripple | Técnica didáctica relacionada con stagger y pulso; pulso no es propagación espacial | Explorar variante, no duplicar fundamentos. |
| Marquesina / Marquee | `lab-marquee` (C) | Reutilizar y completar QA. |
| Texto animado / Text animation | `ninja-animated-headline`, `rea-gen-words`, `rea-wireline` | Documentar variantes existentes. |
| Contador animado / Number ticker | Relación con `lab-lozenge` y codificación animada; no equivalente | Evaluar caso de uso de métrica; comunicar valor final sin lectura repetitiva. |
| Borde recorrido / Border beam | Relacionado con `lab-glow-card` (C); no equivalente | Diferir hasta que exista una finalidad no decorativa. |

Las ausencias significan «no identificado en los registros inspeccionados», no una auditoría de todos los archivos ni de sitios privados.

## 4. Criterio de selección

1. Identificar objetivo: comprensión, orientación, feedback, continuidad o decoración.
2. Buscar primero en el registro y luego en PR abiertos; enlazar la implementación relacionada sin copiarla.
3. Elegir el mecanismo suficiente más simple. No añadir una librería sin necesidad demostrada.
4. Preservar navegación, foco, lectura, estados reales y alternativa con `prefers-reduced-motion`.
5. Si se implementa, registrar slug, origen, derechos, archivos, preview, dependencias y madurez en el flujo existente; ejecutar lint, tipos, tests y registry, y comprobar móvil y teclado.
6. Si es solo una referencia, permanece en documentación. No entra en `/r`.

Fuentes normativas y técnicas para ampliar fichas: [WCAG 2.2](https://www.w3.org/TR/WCAG22/), [ARIA APG](https://www.w3.org/WAI/ARIA/apg/), [MDN CSS](https://developer.mozilla.org/en-US/docs/Web/CSS), [Design Tokens Community Group](https://www.designtokens.org/), [shadcn registry](https://ui.shadcn.com/docs/registry) y la guía del propio repo. En entornos, usar la documentación del framework real (Next.js para UI Kit; Vite únicamente en ejemplos que lo usen).

## 5. Mantenimiento y límite

Actualizar este mapa al añadir o retirar un slug y al cerrar PR relevantes; no mantener una copia paralela del código. Una segunda etapa podrá convertir las fichas de conocimiento propias a un formato consultable por la interfaz y los agentes, preservando estos IDs. No hace falta otra plataforma ni un MCP nuevo.

Pendiente: reconciliar el inventario histórico con la versión autenticada vigente de los Sites y revisar derechos antes de incorporar fichas completas o demos. Este incremento es documental: no modifica dependencias, app, componentes, registry ni despliegues y no certifica funcionamiento de la versión publicada.
