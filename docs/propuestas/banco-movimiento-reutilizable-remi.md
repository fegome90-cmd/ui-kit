---
id: UIKIT-MOTION-001
title: Banco de movimiento reutilizable y primera aplicación en REMI
version: 0.1.0
date: 2026-10-22
status: propuesta
owner: Felipe Gonzalez
scope: documentación de diseño e implementación futura
---

# Banco de movimiento reutilizable y primera aplicación en REMI

**Propuesta y especificación técnica · v0.1.0 · 22 de octubre de 2026**

Este documento define qué guardar en `ui-kit`, cómo reutilizarlo y cómo aplicarlo a la slide 2 de la presentación FALP. La entrega actual es documental: las APIs, archivos y entradas de catálogo indicados como **propuestos** todavía no están implementados. Los tiempos y geometrías son decisiones iniciales de diseño; requieren revisión en el prototipo.

## Índice

1. [Decisiones](#1-decisiones)
2. [Base inspeccionada](#2-base-inspeccionada)
3. [Referencias seleccionadas](#3-referencias-seleccionadas)
4. [Selección técnica](#4-selección-técnica)
5. [Patrones del banco](#5-patrones-del-banco)
6. [Archivos y registro](#6-archivos-y-registro)
7. [Tokens y tiempos](#7-tokens-y-tiempos)
8. [Contrato de integración](#8-contrato-de-integración)
9. [Transiciones e interrupciones](#9-transiciones-e-interrupciones)
10. [Escena REMI](#10-escena-remi)
11. [Integración con el deck](#11-integración-con-el-deck)
12. [Foco, teclado y tamaño de pantalla](#12-foco-teclado-y-tamaño-de-pantalla)
13. [Movimiento reducido, impresión y fallos](#13-movimiento-reducido-impresión-y-fallos)
14. [Recursos y distribución](#14-recursos-y-distribución)
15. [Implementación por entregas](#15-implementación-por-entregas)
16. [Criterios de aceptación](#16-criterios-de-aceptación)
17. [Estado de verificación](#17-estado-de-verificación)
18. [Fuentes](#18-fuentes)

## 1. Decisiones

### 1.1 Resultado buscado

Convertir la slide 2 en una escena explorable del panel: vista general, selección de una fila, apertura de Inv. o Escalas y regreso. La animación hace visible la relación entre el elemento de origen y su detalle. El contenido será HTML y SVG con datos ficticios legibles.

Los mecanismos se conservarán en el banco para aplicarlos a otras interfaces y presentaciones. REMI será el primer consumidor y una prueba de reutilización; sus nombres, datos y reglas no formarán parte del núcleo.

### 1.2 Decisiones de esta versión

| Decisión | Selección |
|---|---|
| Ubicación conceptual | Categoría existente **Movimiento**, familia **Lab**; composición de demostración en **Bloques** |
| Motor de layout | GSAP **3.15.0**, Flip y CustomEase, del mismo paquete |
| Entrada y feedback simples | CSS; Web Animations API solo si el adaptador necesita cancelación explícita |
| Modelo de uso | Código copiable mediante el registry existente; núcleo DOM y adaptador React fino |
| Primera entrega funcional futura | Entrada de escena, ampliación con retorno, revelación de comentario y una demo neutral |
| Reorganización de contexto | Parte de la ampliación en v1; componente independiente cuando exista un segundo caso que lo justifique |
| Primera integración | Slide 2 del deck HTML existente; conservar sus rutas `#2`, `#2.1`, `#2.2` |
| Interacción | Seleccionar fila, abrir Inv., abrir Escalas, volver; recorrido manual desde controles del deck |
| Foco editorial | Movimiento, tamaño y redistribución; contenido de contexto visible |
| Datos de ejemplo | Dataset cerrado de REMI, con procedencia fijada |
| Madurez futura inicial | `candidate`; verificación y procedencia descritas en `notes` |
| Alcance de esta entrega | Este MD y su enlace en el README; componentes y dependencias permanecen pendientes |

### 1.3 Límites entre repositorios

| Responsabilidad | Lugar |
|---|---|
| Duraciones, curva, contratos, captura y transición de geometría | `ui-kit` |
| Adaptador React, preview neutral, miniatura, ficha instalable | `ui-kit` |
| Iconos y controles genéricos ya existentes de REMI | Familia REMI de `ui-kit` |
| Estructura y contenido del monitor, datos sintéticos, indicadores y diálogos propios | `remi-monitor` o adaptación explícita en el proyecto consumidor |
| Guion, selección de escenas, hashes y notas del presentador | `metodo-falp` |
| Empaquetado final de la presentación y avisos de sus dependencias | `metodo-falp` |

Esta separación sigue el límite ya declarado por el README del kit: el diálogo de escala, los indicadores clínicos, las indicaciones y `lib/pending` permanecen en el monitor [R1].

## 2. Base inspeccionada

### 2.1 Versiones de referencia

| Recurso | Referencia inspeccionada | Hallazgo relevante |
|---|---|---|
| `ui-kit` | `main`, commit `4ae9b6e04afbfa50f5a9196a6a0d35d5458d8ec4` | Banco estilo shadcn; React 19.3.0 y Next 16.4.2; GSAP y Motion no aparecen en dependencies |
| Deck FALP | Rama `claude/magical-darwin-7mikni`, commit `bdd87ffb333c7744b08baededd28c4219fc4e12d` | HTML con lienzo de 1920 × 1080, nueve slides y navegación por pasos |
| Archivo del deck | `presentacion/deck/FALP-propuesta-punto-azul.html`, blob `64d6767dd4171a55e225435f0d639cc9225865d8` | La slide 2 sigue usando captura, contornos y ampliaciones de bitmap |
| `remi-monitor` | `main`, commit `b16b4e5b4641097ef864488e95ad09086ee8d8ee` | Tabla de 26 columnas; `COL_WIDTHS` suma 1885 px; seis casos sintéticos |

La rama del deck avanzó respecto de la investigación inicial, pero el blob HTML inspeccionado conserva el mismo SHA. Estos commits son la base de la propuesta; antes de implementar se debe comparar el diff de los archivos consumidores [R1–R4].

### 2.2 Reutilización que ya existe

- `components/ui/remi/icon-shapes.ts` y `icons.tsx`: trazados SVG del prototipo y tamaños naturales.
- `icon-button.tsx`, `action-cluster.tsx`, `form-controls.tsx`, `navigation.tsx` y `toolbar.tsx`: controles genéricos.
- `styles/remi.css`: Arial/Helvetica, colores y foco de la familia.
- `lib/rea/use-reduced-motion.ts`: ejemplo local de lectura segura de preferencia, con cleanup y estado inicial reducido.
- `FeatureTabs`: ya resuelve selección y panel lateral. Su comportamiento puede aprovecharse en una demo, pero su composición y sus tokens Lab no se impondrán al panel REMI.
- `ReaGenWords`, `ReaWireline`, `rea-hover-lift` y `LabMarquee`: mecanismos existentes que no cubren la ampliación contextual con retorno.

La ampliación propuesta tiene un contrato distinto de hover, marquesina o sustitución de panel. La búsqueda previa evita crear otra variante del mismo componente por cambiarle el nombre [R1, R2].

### 2.3 Problemas de integración comprobados

1. La slide 2 tiene una imagen base y detalles derivados de la misma imagen; no contiene el panel interactivo.
2. Los pasos dependen de atributos `data-step`; al retirar sus elementos actuales, hay que conservar explícitamente el máximo de pasos.
3. El gesto táctil del escenario excluye solamente `.ui,.notes`; podría convertir un toque del panel en navegación del deck.
4. El teclado global solo excluye Enter/Espacio sobre botones y aún intercepta otras teclas de controles internos.
5. El hash se actualiza con `history.replaceState`.
6. `fromHash()` muestra primero una slide y luego asigna su paso.
7. El `transform` de `#deck` ya pertenece al ajuste de ventana y al zoom de la presentación.
8. El guion identifica `Inv.` como Invasivos, pero el monitor conecta esa columna a la acción `inventario`. La adaptación debe resolver expresamente esa divergencia (§10.2).

Son observaciones del código, no resultados de una prueba de usabilidad [R3].

## 3. Referencias seleccionadas

| Referencia | Qué se toma | Selección para v1 |
|---|---|---|
| [Motion · App Store](https://examples.motion.dev/react/app-store) | Continuidad de tarjeta, título e imagen entre contexto y detalle | Referencia visual principal de `focus-expand` |
| [GSAP · Flip Advanced example](https://gsap.com/docs/v3/Plugins/Flip/#advanced-example) | Transformación entre disposiciones del DOM y ampliación de un objeto | Referencia técnica principal |
| [Slides · Auto-Animate](https://slides.com/news/auto-animate/fullscreen) | Correspondencia de elementos entre estados del relato | Modelo de continuidad del recorrido |
| [Slidev · Components](https://sli.dev/demo/starter/7) | Controles con estado propio dentro de una slide | Modelo de separación entre interacción y avance |
| [HowdyGo · demo](https://app.howdygo.com/prescreen-embed/ef8f28f9-f867-45a9-84ca-06e3f2e1f559?mobileStrategy=newTab) | Pasos, capítulos y acceso directo a secciones | Referencia para navegación guiada |
| [Codrops · Grid Layout Transitions](https://tympanus.net/Tutorials/GridLayoutTransitions/) | Cambio continuo de espacio y distribución mediante controles | Referencia secundaria de `context-reflow` |

Se probaron interacciones concretas en estas demos durante la investigación: apertura y regreso en Motion, ampliación en GSAP, avance en Slides, contador en Slidev, menú de capítulos en HowdyGo y cambio 75 % → 150 % en Codrops. No se midieron sus duraciones, FPS ni rendimiento [R5–R10].

**Selección visual propia:** conservar continuidad espacial y capacidad de retorno. El panel tendrá su identidad REMI; imágenes, textos, marcas, código premium y estilos de las demos no se incorporan como assets del banco.

## 4. Selección técnica

### 4.1 Motor y alternativas

| Opción | Decisión | Razón |
|---|---|---|
| GSAP Core + Flip + CustomEase | Seleccionada para prototipo v1 | Una implementación DOM puede atender el deck y el banco React; Flip contempla cambios de layout y ancestros transformados |
| Motion React | Alternativa futura | Buen modelo de layout compartido; incorporarlo ahora añadiría otra implementación o exigiría React en el consumidor HTML |
| CSS y WAAPI | Complemento acotado | Entrada, feedback y fundidos simples, con cancelación registrada por instancia |
| Reveal/Slides/Slidev como motor del deck | Referencias de comportamiento | La propuesta conserva el controlador del deck actual |
| View Transitions nativas | Fuera de v1 | No necesarias para demostrar el contrato elegido |
| Tours remotos o iframe del monitor desplegado | Fuera de v1 | El artefacto debe poder presentar sus datos y controles desde recursos locales |

**Versión propuesta:** `gsap: "3.15.0"`, verificada en el `package.json` oficial. No está instalada en el banco. Durante implementación se resolverá desde el registro autorizado, se fijará integridad en lockfile y se revisarán los avisos del paquete [R11].

### 4.2 Configuración seleccionada

- Importar explícitamente `gsap`, `gsap/Flip` y `gsap/CustomEase`.
- Esos imports pertenecen al driver opcional; el bootstrap de interacción no depende de su evaluación (§14.2).
- Registrar los plugins una vez por bundle.
- Registrar la curva con nombre acotado `uikit-motion-out`.
- `scale: true` en las transiciones Flip: el cambio de medidas finales se hace al aplicar el layout; los fotogramas usan transformaciones.
- Mantener `simple: false` cuando haya ancestros escalados.
- Activar `nested: true` únicamente si padre e hijos forman parte de los targets.
- El consumidor provee elementos concretos; los selectores quedan acotados a la raíz de la instancia.
- Usar un contexto GSAP por instancia y registrar dentro de él las animaciones creadas por eventos [R6, R12–R14].

~~~ts
// Configuración propuesta; todavía no incorporada al runtime.
gsap.registerPlugin(Flip, CustomEase);
CustomEase.create("uikit-motion-out", ".16,1,.3,1");
~~~

La API de CustomEase admite los cuatro valores Bézier. La misma curva se representa en CSS como `cubic-bezier(.16, 1, .3, 1)` [R13].

## 5. Patrones del banco

### M01 · Entrada de escena

**Slug propuesto:** `lab-scene-enter` · **Categoría:** Movimiento.

- Propósito: presentar una superficie completa y dejarla estable.
- Entrada: raíz, motivo de entrada, duración, desplazamiento y política de movimiento.
- Gesto: opacidad 0 → 1 y traslación vertical 16 → 0 px de diseño.
- La superficie entra como unidad; las filas y los valores no aparecen secuencialmente.
- Se ejecuta al entrar hacia adelante. Carga directa, retroceso, resize e impresión aplican el estado estable.
- Si llega una acción durante la entrada, esta termina y se procesa la nueva intención.
- Uso neutral de banco: tablero de proyectos.
- Uso REMI: entrada del panel al pasar de slide 1 a slide 2.

### M02 · Foco, ampliación y retorno

**Slug propuesto:** `lab-focus-expand` · **Categoría:** Movimiento.

- Propósito: convertir una selección contextual en un detalle legible.
- Entrada: identificador estable del objetivo, elemento de origen, región de detalle y contenido del consumidor.
- Estados: `overview` y `detail(targetId)`; fase interna `idle`, `animating` o `destroyed`.
- Apertura: el contenedor y un ancla reconocible —título o icono— conectan origen y destino.
- El texto largo del detalle aparece a su tamaño final mediante opacidad. Se evita escalar anisotrópicamente párrafos o glifos.
- Regreso: nueva transición hacia overview, con foco de retorno.
- Cambio de objetivo: sustituye el detalle sin volver primero al panel general.
- Contexto: mantiene una parte del conjunto y la identificación de la selección.
- Uso neutral: tarjeta de tarea → descripción.
- Uso REMI: Inv. o Escalas de la fila seleccionada → detalle de demostración.

El patrón recibe una región de contenido; no crea por sí mismo un diálogo modal ni carga datos.

### M03 · Redistribución de contexto

**ID de mecanismo:** `context-reflow`. **Slug reservado:** `lab-context-reflow`.

- Propósito: ceder espacio al detalle conservando la identidad y el orden de los elementos.
- En v1 forma parte de M02, como transición de sus contenedores.
- La API no ordena ni filtra datos. El consumidor declara ambos layouts.
- Se convertirá en componente instalable independiente cuando exista un segundo consumidor con una necesidad propia.
- En REMI las camas mantienen su orden; el cambio afecta al espacio del contexto y del detalle.

Esta decisión evita publicar dos APIs para una sola composición antes de probar su reutilización.

### M04 · Comentario vinculado al estado

**Slug propuesto:** `lab-step-reveal` · **Categoría:** Movimiento.

- Propósito: introducir un comentario breve asociado a un estado ya identificable.
- Entrada: clave de estado y contenido.
- Gesto seleccionado: fundido de 160 ms, sin desplazamiento por defecto.
- El contenido se activa por estado, no por temporizador autónomo.
- Tiene región de tamaño reservado para que no empuje el panel.
- Uso REMI: comentario de Encontrar, Relacionar o Interpretar, según el guion.
- Los tres verbos conservan carácter editorial; no se presentan como una ruta clínica observada [R3].

## 6. Archivos y registro

### 6.1 Rutas propuestas para implementación

Estas rutas describen entregables futuros; no son enlaces a archivos existentes.

| Archivo propuesto | Responsabilidad |
|---|---|
| `lib/motion/tokens.ts` | Valores numéricos canónicos, curva y perfil reducido |
| `lib/motion/types.ts` | Estado, motivos, interfaces y resultados |
| `lib/motion/scene-controller.ts` | Ciclo de vida, prioridades y transiciones; sin contenido de negocio |
| `lib/motion/gsap-driver.ts` | Integración acotada con Flip y CustomEase |
| `components/ui/lab/scene-enter.tsx` | Adaptador React de M01 |
| `components/ui/lab/focus-expand.tsx` | Adaptador React de M02 |
| `components/ui/lab/step-reveal.tsx` | Adaptador React de M04 |
| `components/blocks/lab/motion-scene-demo.tsx` | Ejemplo neutral con varios objetivos y retorno |
| `components/docs/previews-lab.tsx` | Previews y miniaturas de cada slug implementado |
| `lib/component-registry.ts` | Fichas y dependencias del catálogo |
| `scripts/build-registry.mjs` | Declaración de los módulos compartidos en `LIB_ITEMS` |
| `styles/lab.css` | Estética del ejemplo y exposición de tokens de Lab |

El núcleo `lib/motion` no importa React, Next, Tailwind, REMI ni tokens cromáticos de Lab. Los adaptadores conservan las convenciones de la familia: exportaciones con nombre, `data-slot`, `className` y APIs tipadas.

Los valores de tiempo tienen una sola fuente en `tokens.ts`. El adaptador expone variables CSS por instancia a partir de ella; no se mantienen dos tablas manuales de valores.

### 6.2 Alta en el catálogo

Cada componente se registra cuando existen **módulo, ficha, preview y miniatura**. La ficha usa el esquema actual:

- `family: "Lab"`.
- `category: "Movimiento"`, o `"Bloques"` para la composición.
- `status: "candidate"`.
- `provenance` según el origen real de su implementación. Para una primera implementación propia basada en esta propuesta se declara `"inferred"`; no se eleva a `"measured-dom"` por haber visitado demos.
- `notes`: fuentes, decisiones propias y verificaciones pendientes.
- `files`: todos sus módulos de componente y las fuentes que corresponda mostrar.
- `usage` y `props`: coinciden con la API realmente instalada.

El registro actual no incluye un campo `rights` en `ComponentDoc`. Los avisos pertinentes se documentan en `notes` y en la procedencia del recurso, sin inventar un campo que el esquema no utiliza [R2].

Los nuevos módulos de `lib/motion` deben publicarse como items `registry:lib` y sus imports resolver en la instalación. `registry.json`, `public/r/` y `lib/generated/` siguen siendo salidas generadas [R1, R2].

## 7. Tokens y tiempos

**Todos los valores de esta sección son propuestas iniciales.** Se ajustan a los rangos de la guía local; no constituyen tiempos óptimos demostrados ni mediciones de las referencias [R2].

### 7.1 Valores canónicos

| Token / intención | Valor normal | Movimiento reducido |
|---|---:|---:|
| `pressMs` · respuesta de activación | 120 ms | 0 ms |
| `stateMs` · cambio visual de selección | 160 ms | 0 ms |
| `enterMs` · entrada de escena | 560 ms | 0 ms |
| `openMs` · apertura de detalle | 420 ms | 0 ms |
| `switchMs` · cambio entre detalles | 280 ms | 0 ms |
| `closeMs` · regreso al conjunto | 320 ms | 0 ms |
| `contextMs` · redistribución de contexto | 360 ms | 0 ms |
| `revealMs` · comentario/cuerpo de detalle | 160 ms | 100 ms |
| `enterY` · desplazamiento inicial | 16 px de diseño | 0 px |
| `staggerMs` · secuencia por fila | 0 ms | 0 ms |
| Curva espacial | `cubic-bezier(.16,1,.3,1)` | Sin transformación |
| Curva de opacidad reducida | — | `linear` |

El cambio semántico y la disponibilidad de los controles ocurren al aceptar la acción. Los tiempos describen la representación visual, no una espera impuesta a la entrada.

`contextMs` se limita a la duración de la transición que lo contiene: 360 ms al abrir, 280 ms al cambiar y 320 ms al cerrar. Las capas se solapan; sus tiempos no se suman.

### 7.2 Cronograma de la escena

| Acción | Ventana temporal desde el evento | Resultado |
|---|---|---|
| Entrar hacia adelante | Panel 0–560 ms; comentario 400–560 ms | Overview estable a 560 ms |
| Abrir Inv. o Escalas | Ancla/contenedor 0–420 ms; contexto 0–360 ms; cuerpo/comentario 260–420 ms | Detalle completo a 420 ms |
| Cambiar de objetivo | Geometría/contexto 0–280 ms; contenido nuevo 120–280 ms | Nuevo detalle a 280 ms |
| Volver | Cuerpo saliente 0–120 ms; retorno/contexto 0–320 ms | Overview a 320 ms |
| Seleccionar otra fila en overview | Selección inmediata; feedback 0–160 ms | Mismo layout |
| Seleccionar otra fila con detalle abierto | Selección inmediata; sustitución de contenido 0–160 ms | Mismo target, nuevo registro |
| Activar movimiento reducido | Geometría inmediata; contenido 0–100 ms | Mismo estado e interacción |
| Resize, cambio de zoom, URL directa, impresión | 0 ms | Estado estable correspondiente |

No hay avance automático del relato, bucles ni tiempos de permanencia obligatorios.

## 8. Contrato de integración

### 8.1 API propuesta

La API siguiente es un contrato para implementar y verificar, no una librería ya disponible.

~~~ts
type MotionOrigin =
  | "pointer"
  | "keyboard"
  | "deck-forward"
  | "deck-back"
  | "direct"
  | "resize"
  | "print";

type SceneState =
  | { view: "overview"; targetId: null }
  | { view: "detail"; targetId: string };

type MotionPolicy = "system" | "reduce" | "none";

type TransitionResult =
  | {
      requestId: number;
      status: "completed" | "superseded" | "destroyed";
    }
  | {
      requestId: number;
      status: "failed";
      reason: "missing-target" | "commit-error";
      recoverTo: SceneState;
    };

interface CommitContext {
  readonly requestId: number;
  readonly contentKey: string;
  readonly signal: AbortSignal;
}

interface SceneHost {
  root: HTMLElement;
  coordinateRoot: HTMLElement;
  getTargets(): Element[];
  resolveTarget(id: string): HTMLElement | null;
  // Resuelve tras el commit del DOM; debe respetar la cancelación.
  applyState(state: SceneState, context: CommitContext): void | Promise<void>;
  getReturnFocus(id: string): HTMLElement | null;
  getDetailHeading(): HTMLElement | null;
  onError?(error: unknown): void;
}

interface SceneController {
  transitionTo(
    state: SceneState,
    options: {
      origin: MotionOrigin;
      animate?: boolean;
      contentKey?: string;
    }
  ): Promise<TransitionResult>;
  settle(): void;
  invalidateLayout(): void;
  destroy(): void;
}

interface SceneOptions {
  motionPolicy?: MotionPolicy;
}

declare function createSceneController(
  host: SceneHost,
  options?: SceneOptions
): SceneController;
~~~

### 8.2 Responsabilidades

- **Consumidor:** datos, selección de registro, estado de negocio, contenido, navegación, historial y estado de impresión.
- **Controlador:** última intención, fase de transición, resolución de promesas y ciclo de vida.
- **Driver:** medición y movimiento de los targets.
- **Adaptador React:** espera al commit del DOM y gestiona montaje/desmontaje; no duplica el controlador.
- **Adaptador HTML:** aplica el layout de forma sincrónica cuando todo el contenido está disponible.

`applyState` cambia estructura, clases y atributos; no inicia animaciones por su cuenta. Todo cambio de layout participante ocurre dentro de este commit, después de la captura. El consumidor prepara una instantánea de contenido asociada a `contentKey`, sin modificar antes el DOM controlado.

El adaptador React comprueba la vigencia antes de encolar o aplicar estado, descarta revisiones anteriores a la solicitud vigente y confirma qué `requestId` se renderizó. Abortar una señal no cancela por sí solo un `setState` ya solicitado. Una petición abortada resuelve su espera sin depender de un commit que ya no ocurrirá. Se comprueba la vigencia otra vez antes de animar o mover foco.

La instancia se crea sobre un estado estable y usa `motionPolicy: "system"` por defecto. Observa cambios de preferencia hasta `destroy()`. M01 se activa por el ciclo de entrada del host, dentro del mismo ciclo de cancelación y limpieza; no se repite por solicitar dos veces overview.

`contentKey` identifica el contenido sin exponer su significado al núcleo; su valor omitido es `"default"`. En REMI combina la cama seleccionada con la revisión del fixture. La idempotencia se evalúa sobre `(view, targetId, contentKey)`. Si solo cambia esta clave, se aplica el contenido y su fundido de 160 ms, sin nueva ampliación. Si había una ampliación en curso, se estabiliza el último destino y se muestra el contenido vigente. El hash y el paso no cambian.

La política `system` respeta `prefers-reduced-motion`; `reduce` puede solicitar menos movimiento; `none` aplica todo sin transición. Ninguna opción fuerza movimiento completo sobre una preferencia de reducción.

### 8.3 Identidad y aislamiento

- IDs estables por contenido, con prefijo único por instancia.
- Las claves no dependen del índice visual cuando el contenido puede cambiar de orden.
- Los atributos de coordinación propuestos son `data-motion-scene`, `data-motion-key`, `data-motion-role` y `data-motion-state`.
- El driver traduce las claves a `data-flip-id` cuando hace falta emparejar nodos.
- El identificador de movimiento es interno; no se muestra al usuario.
- Dos instancias en la misma página no comparten estado, selectores ni foco.
- Un duplicado meramente visual se marca `aria-hidden`, `inert` y sin eventos; nunca duplica IDs.

## 9. Transiciones e interrupciones

### 9.1 Estados y acciones

| Estado actual | Acción | Destino | Resultado esperado |
|---|---|---|---|
| Overview | Abrir A | Detalle A | Apertura con continuidad |
| Detalle A | Abrir B | Detalle B | Cambio directo |
| Detalle A | Volver / Escape | Overview | Retorno al contexto |
| Cualquier estado | Nueva fila | Mismo estado visual | Datos de esa selección |
| Animando hacia A | Abrir B | Detalle B | Última intención prevalece |
| Animando hacia un detalle | Volver | Overview | Cancelación del destino anterior |
| Cualquier estado | Salir de la slide | Instancia destruida | Sin callbacks tardíos |
| Cualquier estado | Resize / zoom | Último destino estable | Recalcular medidas |
| Cualquier estado | Target inexistente | Recuperación solicitada al host | Resultado `failed`; el host lleva a overview por su vía de navegación |

### 9.2 Transacción

1. Registrar `requestId`, cancelar la solicitud anterior y validar el destino.
2. Guardar la intención y su contenido sin cambiar el DOM ni encolar un render que altere su layout.
3. Capturar geometría y gestionar los Flip anteriores mediante la API del driver.
4. Aplicar estado, layout y atributos accesibles mediante `applyState`; esperar al commit si el host es React.
5. Comprobar de nuevo `requestId`, señal de cancelación y visibilidad.
6. Animar desde la captura hacia el destino.
7. Completar solo la solicitud vigente y aplicar la política de foco.

El patrón documentado de Flip es capturar estado, modificar layout y ejecutar `Flip.from`. Su `getState` gestiona los Flip previos; la implementación debe comprobar el resultado visual al interrumpir, sin añadir un `revert` general antes de medir que pueda introducir saltos [R6, R12].

**Volver es una nueva transición al estado overview.** Invertir una timeline no sustituye la actualización semántica del DOM.

Toda promesa termina: completada, reemplazada, destruida o fallida. Solicitar el mismo destino estable y la misma `contentKey` es idempotente. No se acumula una cola de reproducciones. Un callback de una solicitud anterior no anuncia contenido, cambia foco ni reaparece después de salir.

Si falta un target, el resultado es `failed`, con `reason: "missing-target"` y `recoverTo: { view: "overview", targetId: null }`. El controlador solicita esa recuperación; no cambia por su cuenta la navegación del consumidor. El host la aplica solo si sigue vigente la intención que originó el fallo. Un error de commit informa `commit-error` y permite al host mostrar su estado recuperable mediante la misma vía.

### 9.3 Limpieza

`destroy()` es idempotente: cancela promesas pendientes, observers, listeners, tareas RAF/WAAPI propias y contexto GSAP. `ctx.revert()` se usa para limpiar la instancia, no como máquina de estado [R14].

`settle()` termina visualmente en el último destino semántico. `invalidateLayout()` estabiliza, invalida la captura y permite medir otra vez cuando el host esté visible. Se suspende el trabajo visual cuando la pestaña queda oculta y se restablece un estado estable al regresar.

## 10. Escena REMI

### 10.1 Contenido y selección

**Preset propuesto:** `remi-slide-02`, definido en el consumidor.

- Datos: seis filas del fixture basado en `DEMO_CASES`.
- Selección inicial: `UPC_CR-1`.
- Targets: `invasivos` y `escalas`.
- Estado inicial: overview.
- Nombres: los ficticios del fixture como texto real.
- Rotulación visible: **Demostración · datos ficticios**.
- La selección de fila se conserva durante la sesión cargada; una carga nueva usa el valor inicial.
- El hash representa el paso, no la fila. Compartir `#2.2` abre Escalas de la fila inicial.

Los iconos, proporciones, colores y textos del panel proceden de REMI. El tamaño natural de los SVG se conserva; forzar todos los iconos a un cuadrado alteraría sus proporciones [R4, R15].

### 10.2 Qué muestra cada detalle

**Contenido comprobado en los recursos:** el monitor conecta `Inv.` a un diálogo “Inventario”, con el mensaje “Sin conexión con inventarios.” y la identificación de cama/paciente. Escalas y su botón adyacente abren la demostración Escala X, con estado del ingreso y acciones locales de Registrar/Restablecer. Por separado, el banco de `remi-monitor` contiene `ScalePanel`, `ScaleItem` y `ScaleDialog`, con fixtures `DEMO_NAS`, `DEMO_BRADEN` y `DEMO_ASPIRATION`; ese panel no está conectado al botón Escalas del monitor [R4, R22].

**Divergencia de Inv.:** las notas de la slide 2 dicen explícitamente que `Inv.` da acceso a Invasivos [R3]. Para esta escena se conserva ese significado del guion y el target `invasivos`; no se reutiliza el handler `inventario` del prototipo. La discrepancia queda documentada y debe resolverse con la fuente funcional antes de atribuir fidelidad al sistema real. El núcleo de movimiento no depende de esa decisión.

| Vista | Contenido definido para la propuesta |
|---|---|
| Overview | Panel de seis filas, selección identificable y accesos Inv./Escalas |
| Inv. / Invasivos | Cabecera de fila seleccionada, ancla del acceso y estado editorial vacío: “Sin registros conectados en esta demostración.” |
| Escalas | Cabecera de fila seleccionada y estructura de `ScalePanel`/`ScaleItem`, con contenido de demostración identificado |
| Volver | Restituye el panel general manteniendo la fila seleccionada |

El vacío de Invasivos expresa la ausencia de datos conectados en este artefacto; no afirma que la persona carezca de dispositivos o registros. El texto es una decisión editorial de la propuesta, no una pantalla observada del sistema.

**Espécimen de Escalas elegido para v1:** adaptar la cabecera, pestaña y lista desplegable de `ScalePanel` usando los cinco ítems del fixture `DEMO_BRADEN`, bajo el título **Escalas · demostración de interfaz**. Sus opciones A/B/C y valores 0/1/2 son ficticios en la fuente. La rotulación lo declara y no lo presenta como una escala completa o validada. El usuario puede desplegar un ítem y seleccionar una opción local. Este preset omite el cálculo de resultado y las acciones Firmar/Guardar/Imprimir; se documenta ese recorte como adaptación de la presentación, sin alterar el componente de origen [R22].

Al cambiar de fila se reinician las opciones de demostración; al cerrar y volver a abrir el detalle también. Solo la selección de fila se conserva durante la sesión. Estas operaciones no crean registros ni modifican el estado del motor de pendientes.

La conexión de este espécimen con Escalas es una composición editorial nueva. Las notas conservarán la distinción entre este recurso expositivo y una navegación observada del sistema. El verde de Escalas no se reinterpretará como “completado”. El diálogo Escala X, el punto azul y su motor se reservan para la escena del relato que les corresponda [R3, R4].

| Paso | Comentario editorial propuesto |
|---|---|
| Overview | **Encontrar:** identificar el acceso entre funciones y registros. |
| Inv. | **Relacionar:** ¿a qué persona, episodio y momento corresponde? |
| Escalas | **Interpretar:** distinguir el acceso a una escala del estado de su registro. |

Los comentarios orientan la pregunta de trabajo y permanecen hasta la próxima acción del presentador. No describen una secuencia de clics observada.

### 10.3 Composición de escritorio propuesta

Retícula de diseño: 1920 × 1080; margen horizontal 120 px, ancho útil 1680 px.

| Zona | Overview | Detalle |
|---|---|---|
| Título | Conserva jerarquía y posición del deck | Igual |
| Contenido | x 120, y 330, ancho 1680, alto máximo 540 | Mismo rectángulo |
| Panel de contexto | Ancho útil completo | x 120, ancho 980 |
| Separación | — | 40 |
| Detalle | — | x 1140, ancho 660 |
| Comentario editorial | x 120, y 900, ancho 1680, alto reservado 48 | Igual |
| Pie | Conserva zona inferior del deck | Igual |

Son medidas de partida para revisar visualmente. El bloque exportado incluirá cabeceras y seis filas completas. Se medirá su alto real; si excede el rectángulo se ajustará la composición sin recortar nombres, cabeceras o filas.

El panel se ajusta uniformemente desde su ancho nativo de 1885 px; los datos no cambian de orden para producir el efecto. En la vista de detalle, el contexto sirve para situar la selección y el detalle concentra la lectura. El tamaño del texto del detalle se define en el layout final, no por ampliar una captura.

### 10.4 Perfiles de presentación

- **Escritorio:** origen, contexto y detalle permanecen dentro de la raíz escalada de la slide.
- **Banco a 390 px:** el ejemplo neutral apila contexto y detalle; controles de 44 CSS px y texto de lectura de al menos 16 CSS px.
- **Deck en ventana menor de 900 CSS px:** controles locales fuera del lienzo escalado y detalle de lectura en una superficie responsive del host. Conserva estado y datos; usa sustitución instantánea o fundido reducido, sin simular un vuelo entre dos sistemas de coordenadas.
- Al cambiar de perfil se estabiliza la transición y se transfiere el estado a una sola representación activa. La otra queda oculta e inerte.

El perfil compacto es un requisito del adaptador del deck, no una obligación impuesta a todos los consumidores del banco.

## 11. Integración con el deck

### 11.1 Pasos y rutas

| Ruta | Paso | Estado visual |
|---|---:|---|
| `#2` | 0 | Overview |
| `#2.1` | 1 | Inv. |
| `#2.2` | 2 | Escalas |

Avanzar sigue **overview → Inv. → Escalas → slide 3**. Retroceder sigue **Escalas → Inv. → overview → slide 1**. El botón **Volver al panel** y Escape llevan al paso 0.

### 11.2 Única función de aplicación

Introducir un helper de host, por ejemplo `commitDeckPosition({ slideIndex, step, origin, writeHash })`, que:

1. valida y registra la intención de slide/paso sin mutar anticipadamente el layout de la escena;
2. asegura la visibilidad de su host y solicita el estado al controlador, que captura antes del commit;
3. actualiza el hash si corresponde;
4. emite un único anuncio accesible.

Botones del deck, teclado, gestos de fondo, clics del panel y carga directa usan esta vía. El controlador reutilizable no escribe la URL.

Si el controlador devuelve `missing-target`, el helper comprueba que sigue vigente su solicitud de navegación y ejecuta la recuperación al paso 0. Escena, hash y anuncio cambian juntos; no queda overview visible con `#2.2`. Un resultado tardío de una posición anterior se descarta.

`replaceState` no emite `hashchange`; escuchar ese evento no sincroniza los cambios internos del deck [R16].

### 11.3 Cambios mínimos previstos

| Punto | Cambio especificado |
|---|---|
| `stepMax` | Admitir un máximo explícito `data-max-step="2"` en la slide 2; conservar el cálculo por atributos para las demás |
| `applySteps` | Delega el estado de esta escena al adaptador; evita aplicar opacidad genérica a elementos que ya anima el driver |
| `show/fromHash` | Resolver slide y paso antes de renderizar; una URL directa no muestra antes overview |
| Gestos táctiles | Excluir `[data-deck-interactive]` desde pointerdown; el gesto mantiene su propietario hasta pointerup/cancel |
| Teclado global | Respetar `defaultPrevented`, composición de texto y controles/editables/región interactiva |
| `fit()` y zoom | Avisar explícitamente al adaptador cuando cambia el transform del deck |
| Salida de slide | Destruir la instancia activa y conservar solo el estado de selección del consumidor |

### 11.4 Política por origen

| Origen | Resultado |
|---|---|
| Avance desde slide 1 | Overview con entrada de 560 ms |
| Retroceso desde slide 3 | Paso final, Escalas, estable y sin entrada |
| URL directa a cualquier paso | Renderizado directo, sin recorrido intermedio |
| Acción local o paso dentro de slide 2 | Transición correspondiente |
| Resize o zoom | Estabilizar sin repetir entrada |
| Reentrada hacia adelante | Overview; conservar la fila seleccionada de la sesión |
| Impresión | Estado final estático definido en §13 |

### 11.5 Geometría

El driver no escribe el transform de `#deck`. Anima descendientes bajo su propia raíz. En escritorio no usa un portal hacia `document.body` para el detalle.

`getBoundingClientRect()` entrega coordenadas de viewport; no deben mezclarse directamente con las unidades de diseño. El driver se ocupa de la compensación de escala una sola vez [R17].

`ResizeObserver` observa cajas; un cambio de transform del deck necesita además notificación explícita desde `fit()`. Registrar un observer por escena no sustituye ese aviso [R18].

## 12. Foco, teclado y tamaño de pantalla

### 12.1 Semántica elegida

El detalle de escritorio es una región dentro de la página, con encabezado y nombre accesible. Los disparadores son botones con `aria-expanded` y `aria-controls`. Enter y Espacio activan una vez, conforme al patrón disclosure [R19].

- Apertura local: foco en el encabezado del detalle, `tabindex="-1"`, usando `preventScroll`, después del commit y en cuanto la representación activa sea visible. Si hay espera, la transferencia solo ocurre si la solicitud sigue vigente y el usuario no cambió de foco ni operó otro control desde la apertura.
- Cierre: foco al disparador de origen si sigue visible y pertenece a la slide activa.
- Cambio por controles del deck: mantener foco en el control que conduce la presentación.
- Cambio de fila desde selector: conservar foco en ese selector, cancelar cualquier transferencia de foco pendiente y anunciar la nueva identificación.
- Carga directa: conservar foco inicial; no forzar un salto.
- Escape desde un detalle: cerrar y consumir el evento. En overview no se consume.
- Tab: orden natural; no declarar `role="grid"` sin implementar su navegación.

El foco de teclado conserva su indicador visible. Los contornos editoriales negros actuales se sustituyen por el nuevo mecanismo; esa decisión no elimina el foco accesible.

### 12.2 Objetivos y controles

La guía del banco establece objetivos de al menos 24 × 24 CSS px y recomienda 44 × 44 en táctil [R2]. Se comprobarán después del escalado real del deck.

El área de un icono de 25 px de diseño puede quedar por debajo de ese mínimo al reducir la slide. Por eso el host ofrece acciones equivalentes **Inv.**, **Escalas**, **Volver al panel** y selector de fila en una barra sin escalar. Si una celda no tiene un área de interacción suficiente, su acceso visual no será el único medio de operación.

La barra se sitúa fuera del espacio de la presentación y no tapa el pie ni los controles generales. Sus acciones utilizan el mismo estado y los mismos handlers que los accesos del panel.

Los datos necesarios para comprender el estado se muestran en texto o estructura; un tooltip no es el único acceso a información.

## 13. Movimiento reducido, impresión y fallos

### 13.1 Movimiento reducido

Se conserva todo el recorrido y sus controles. Traslación, escala y stagger se aplican inmediatamente; solo se admite el fundido de 100 ms declarado en los tokens. Si la preferencia cambia a mitad de una transición, se estabiliza el último destino.

En renderizado de servidor se parte de un estado estable. La lectura de preferencias y geometría ocurre después del montaje. El patrón local `useReducedMotion` sirve de antecedente; cualquier extracción a una utilidad compartida deberá preservar a sus consumidores [R1, R2].

### 13.2 Impresión

El consumidor declara `printState`: panel contextual y detalle Escalas de la selección actual; si la slide no fue visitada, usar `UPC_CR-1`.

- Preparar una representación estática que no dependa del montaje o de haber navegado por la slide.
- Ocultar los controles operativos.
- Imprimir a escala y layout de impresión, sin transforms transitorios.
- `beforeprint` estabiliza y preserva el estado de navegación.
- `afterprint` restaura paso y selección sin reanimar.
- Un bloque estático de impresión puede generarse desde los mismos datos y plantillas; no requiere una segunda copia manual del contenido.

### 13.3 Fallos y contenido límite

| Caso | Comportamiento |
|---|---|
| GSAP no carga | HTML y controles disponibles; cambios de estado instantáneos |
| Target desaparece | Resultado `failed/missing-target`; el host recupera overview, selección válida y navegación sincronizada |
| Sin filas | Estado vacío explícito y accesos de detalle deshabilitados |
| Detalle sin contenido | Mensaje localizado en la región, con retorno disponible |
| Error al aplicar estado | Cancelar transacción, mostrar estado recuperable y resolver resultado `failed` |
| Texto largo | Ajuste y scroll interno del detalle; controles y título permanecen accesibles |
| JavaScript deshabilitado | Panel general y rotulación de demo visibles; los controles que requieren JS no se presentan como operativos |

## 14. Recursos y distribución

### 14.1 Manifiesto inicial

| Recurso | Fuente | Uso y tratamiento |
|---|---|---|
| Geometría de tabla y cabeceras | `remi-monitor/components/Monitor.tsx` | Referencia del consumidor; 26 columnas y 1885 px |
| Datos ficticios | `remi-monitor/lib/demo-data.ts` | Fixture versionado; sin consultas a servicios |
| Estructura de escalas | `remi-monitor/components/ui/scale-dialog.tsx` | Adaptar `ScalePanel`/`ScaleItem` en el consumidor; no trasladar dominio clínico al kit |
| Espécimen de escalas | `remi-monitor/lib/demo-kit.ts`, `DEMO_BRADEN` | Cinco ítems y opciones ficticias; uso editorial explícito, sin cálculo clínico |
| Iconos SVG | `ui-kit/components/ui/remi/icon-shapes.ts`, `icons.tsx` | Reutilizar trazados y proporciones del prototipo |
| Botones y acciones | Familia REMI del kit | Reutilizar cuando su contrato corresponde |
| Estilo REMI | `styles/remi.css` y reglas efectivas necesarias del monitor | Compilar estilos acotados; comprobar overrides finales |
| Tipografía de interfaz | Arial, Helvetica, sans-serif | Fuentes de sistema, sin descarga nueva |
| Tipografía editorial | Tokens existentes del deck | Conservar identidad de la presentación |
| Movimiento | GSAP 3.15.0, Flip y CustomEase | Dependencia declarada, avisos propios |
| Referencias externas | Enlaces de §3 | Inspiración documentada; implementación y assets propios |
| Captura actual | Archivo del deck | Evidencia de comparación; se retira como superficie interactiva |

No se importa `Monitor.tsx` completo como un componente genérico del kit: mezcla filtros, reloj, diálogos, exportación y evaluación de pendientes [R4]. La adaptación toma lo necesario y documenta su procedencia.

### 14.2 Dos formas de consumo

**Banco React:** componentes instalables por el registry actual, con dependencias declaradas y preview neutral.

**Deck HTML:** markup semántico preconstruido desde los recursos REMI y controlador DOM compilado. La v1 no necesita hidratar React en el navegador del deck. Los iconos y fixtures se incorporan en compilación; los controles usan el adaptador DOM.

El controlador de estado, el markup y los listeners operativos se inicializan sin importar GSAP. El driver se carga o inicializa detrás de una frontera protegida. Mientras no esté disponible, el controlador ejecuta `applyState` de forma instantánea. Si esa carga o inicialización falla, conserva el modo instantáneo e informa por `onError`; solo incorpora un driver recuperado desde un estado estable. Este respaldo cubre el fallo del driver, no la ausencia del bootstrap completo.

La integración producirá un artefacto local, abrible sin CDN ni llamadas al monitor desplegado. Si se conserva el HTML único actual, su JS/CSS compilado y avisos se incorporan al archivo en el proceso de build. Las fuentes editables y el artefacto generado se distinguirán en la documentación del consumidor.

El script de exportación y su herramienta de bundle son una decisión de implementación del consumidor; no se añade un segundo sistema de publicación al banco para escribir este spec.

### 14.3 Procedencia y licencias

El código propio del kit conserva su licencia. Las dependencias y referencias mantienen sus condiciones específicas.

- Motion App Store se utiliza como referencia visual. Los términos de Motion+ restringen redistribuir su código premium como biblioteca independiente; no se copia ese código [R20].
- GSAP declara una licencia Standard “no charge”, distinta de MIT. Se mantendrá como dependencia con avisos separados. La verificación del texto íntegro vigente y del paquete resuelto forma parte del paso previo a distribuir el runtime; la consulta de la página de licencia no permitió recuperar ese texto completo durante esta investigación [R11, R21].
- Iconos y estilos REMI se describen como recursos del prototipo, con la procedencia ya declarada por el banco; no se atribuye autoría institucional sobre marcas o diseños de terceros.
- Las capturas de las demos no se convierten en assets redistribuidos.

### 14.4 Presupuestos a medir

Son objetivos del prototipo, no resultados obtenidos:

- Cero solicitudes de datos o assets remotos durante la ejecución del deck.
- Cero temporizadores de reproducción permanente en estado estable.
- Una transición geométrica protagonista por escena; máximo una solicitud vigente.
- Cambios de layout concentrados en captura y commit, con transform/opacity durante el movimiento.
- Registrar tamaño de código propio, paquete de animación y bundle final por separado, en bytes sin comprimir y gzip.
- Medir rendimiento en Chrome y Safari, documentando equipo, viewport, preferencia de movimiento y escenario de interrupción.
- Revisar frames y tareas largas durante apertura, cambio y retorno. No declarar 60 FPS ni ventajas de rendimiento sin esa medición.

## 15. Implementación por entregas

| Entrega | Trabajo | Criterio de término |
|---|---|---|
| E0 · Propuesta | Este MD, fuentes y entrada de documentación | Documento coherente, enlaces y decisiones revisados |
| E1 · Mecanismo neutral | Tokens, controlador, driver y M01/M02/M04 | Abrir, cambiar y volver en una escena neutral; interrupción y cleanup verificados |
| E2 · Banco instalable | Registro, preview, miniatura, dependencias | Instalar en proyecto mínimo externo y operar sin imports ocultos |
| E3 · Escena REMI | Fixture, markup, detalle y selección | Nombres legibles, seis filas, dos objetivos y regreso funcional |
| E4 · Adaptador de deck | Pasos, teclado, tacto, zoom, impresión y perfil compacto | Matriz de navegación y accesibilidad aprobada |
| E5 · Revisión | Comparación visual, medición y ajustes de tokens | Evidencia registrada; madurez declarada con sus límites |

E1 y E2 producen el recurso reutilizable; E3 y E4 lo consumen. El registro no anticipa funcionalidad futura.

**Condición de reutilización:** una escena neutral y la escena REMI deben usar los mismos módulos de movimiento, cambiando solo targets, contenido, tema y mapeo de navegación. Además, la instalación fuera del banco debe resolver todas las dependencias. Si hace falta introducir palabras o reglas REMI en el núcleo, la extracción aún no está terminada.

## 16. Criterios de aceptación

Los casos siguientes pertenecen a la implementación futura. Su estado actual es **pendiente**.

### 16.1 Comportamiento y navegación

| ID | Prueba | Resultado exigido |
|---|---|---|
| A01 | Abrir Inv. y volver | Overview conserva selección y devuelve foco al origen |
| A02 | Inv. → Escalas durante la apertura | Termina solo en Escalas; sin callback ni anuncio atrasado |
| A03 | Abrir → volver antes de completar | Termina en overview; sin duplicados visuales |
| A04 | Seleccionar otra fila con detalle abierto, incluso durante la apertura | Nueva `contentKey`, datos vigentes, mismo target y paso; sin otra ampliación |
| A05 | Salir durante una animación | Ningún callback toca una slide oculta |
| A06 | Montar/desmontar diez veces | Una acción produce una transición; sin listeners duplicados |
| A07 | Abrir `#2.2` directamente | Escalas desde el primer estado visible; sin destello de overview |
| A08 | Retroceder desde slide 3 | Escalas estable; sin repetir entrada |
| A09 | Recorrer pasos con controles del deck | Hash, estado y anuncio coinciden |
| A10 | Tocar Inv. en móvil | Abre Inv.; no ejecuta también next/prev |
| A11 | Enter/Espacio sobre un control | Exactamente una activación |
| A12 | Escape desde detalle y desde overview | Cierra en detalle; no navega ni consume en overview |

### 16.2 Geometría, acceso y estabilidad

| ID | Prueba | Resultado exigido |
|---|---|---|
| A13 | Escalas de canvas 0.5, 0.75 y 1 | Origen y destino alineados, sin doble compensación |
| A14 | Zoom 100, 125, 150, 200 y 300 % | Layout estable, sin sobrescribir el transform del deck |
| A15 | Resize/zoom a mitad de una apertura | Último destino estable; nueva medida en siguiente acción |
| A16 | Movimiento reducido y cambio de preferencia | Mismas acciones y contenido; geometría inmediata |
| A17 | Imprimir sin haber visitado slide 2 | Estado final completo y estático |
| A18 | Volver después de imprimir | Paso y selección previos, sin entrada nueva |
| A19 | Targets y texto después de escalar | Controles accesibles por barra sin escalar; texto de detalle legible |
| A20 | Teclado y lector de pantalla; abrir y pulsar Tab o cambiar fila durante la transición | Una representación accesible; el foco conserva la última acción del usuario |
| A21 | Dos instancias en la misma página | Estado, IDs, callbacks y foco aislados |
| A22 | Fallo de carga o inicialización del driver con bootstrap disponible | Abrir, cambiar y volver operan mediante cambios instantáneos |
| A23 | Vista neutral 1440 px y 390 px | Sin desborde de página; detalle y controles utilizables |
| A24 | Otro tema y contenido | Reutiliza el núcleo sin imports clínicos ni CSS cromático obligatorio |
| A25 | Instalación desde registry fuera del banco | Código, tokens e imports completos; preview del banco no es una dependencia |
| A26 | Comparación de contenido | Sin nombres tapados, datos omitidos por animación ni reordenamiento incidental de camas |
| A27 | Target ausente o eliminado durante apertura | Host recupera overview y `#2`; un fallo obsoleto no altera una navegación posterior |
| A28 | Abrir Inv. y operar los ítems de Escalas | Se respeta el mapeo editorial declarado; no aparece el handler Inventario, un resultado clínico ni un registro persistido |

### 16.3 Verificación apropiada por etapa

- **Esta entrega documental:** coherencia entre decisiones, tokens y cronograma; enlaces, rutas existentes y futuras diferenciadas; revisión del contrato; diff limitado a documentación.
- **E1:** pruebas de reducer/controlador y cleanup que ejerciten interrupciones y promesas; browser para geometría.
- **E2:** pruebas actuales de registro y previews; generación/validación del registry; prueba de instalación externa.
- **E3–E4:** teclado, tacto, perfiles, rutas directas, zoom y print en navegador.
- **E5:** evidencia visual y medidas de rendimiento reales.

La comprobación de metadatos no acredita interacción, fidelidad visual ni derechos de un recurso. La versión permanece `candidate` mientras falten sus comprobaciones relevantes.

## 17. Estado de verificación

| Elemento | Estado al redactar v0.1.0 |
|---|---|
| Repositorio de destino y estructura del banco | Inspeccionados |
| Guía, registro, generador y dependencias | Inspeccionados |
| Recursos de REMI y fixture de seis filas | Inspeccionados |
| Código actual de navegación de la presentación | Inspeccionado |
| Demos de referencia | Interacciones seleccionadas probadas |
| Tiempos, composición y API de este documento | Propuestos; revisión técnica documental |
| Componentes nuevos del banco | No implementados |
| Dependencia GSAP en el kit | No instalada |
| Integración o sustitución de slide 2 | No ejecutada |
| FPS, bundle final y validación visual de la nueva escena | Pendientes del prototipo |

## 18. Fuentes

Las fuentes de repositorio están fijadas a commits cuando sostienen observaciones de código. Las páginas de documentación se consultaron el 22 de octubre de 2026. Las duraciones, la arquitectura y la composición seleccionadas son propuestas propias apoyadas en esas capacidades, no conclusiones experimentales.

### Repositorios y convenciones

- **R1.** [UI Kit · README y límites entre familias](https://github.com/fegome90-cmd/ui-kit/blob/4ae9b6e04afbfa50f5a9196a6a0d35d5458d8ec4/README.md).
- **R2.** UI Kit: [guía de trabajo](https://github.com/fegome90-cmd/ui-kit/blob/4ae9b6e04afbfa50f5a9196a6a0d35d5458d8ec4/docs/guia-de-trabajo.md), [registro](https://github.com/fegome90-cmd/ui-kit/blob/4ae9b6e04afbfa50f5a9196a6a0d35d5458d8ec4/lib/component-registry.ts), [generador](https://github.com/fegome90-cmd/ui-kit/blob/4ae9b6e04afbfa50f5a9196a6a0d35d5458d8ec4/scripts/build-registry.mjs) y [dependencias](https://github.com/fegome90-cmd/ui-kit/blob/4ae9b6e04afbfa50f5a9196a6a0d35d5458d8ec4/package.json).
- **R3.** [Deck FALP · archivo inspeccionado](https://github.com/fegome90-cmd/metodo-falp/blob/bdd87ffb333c7744b08baededd28c4219fc4e12d/presentacion/deck/FALP-propuesta-punto-azul.html).
- **R4.** REMI: [Monitor.tsx](https://github.com/fegome90-cmd/remi-monitor/blob/b16b4e5b4641097ef864488e95ad09086ee8d8ee/components/Monitor.tsx) y [demo-data.ts](https://github.com/fegome90-cmd/remi-monitor/blob/b16b4e5b4641097ef864488e95ad09086ee8d8ee/lib/demo-data.ts).

### Referencias de interacción

- **R5.** [Motion · App Store, explicación del ejemplo](https://motion.dev/examples/react-app-store).
- **R6.** [GSAP · Flip, capacidades y ejemplos](https://gsap.com/docs/v3/Plugins/Flip/).
- **R7.** [Slides · Auto-Animate](https://slides.com/news/auto-animate/fullscreen) y [Reveal · documentación](https://revealjs.com/auto-animate/).
- **R8.** [Slidev · componentes dentro de slides](https://sli.dev/guide/component).
- **R9.** [HowdyGo · creación y edición de demos](https://www.howdygo.com/product/create).
- **R10.** [Codrops · Grid Layout Transitions, tutorial original](https://tympanus.net/codrops/2026/01/20/animating-responsive-grid-layout-transitions-with-gsap-flip/).

### APIs, recursos y condiciones

- **R11.** [GSAP · package.json oficial](https://github.com/greensock/GSAP/blob/master/package.json). Versión observada: 3.15.0; blob inspeccionado: `6d9c0c424b35d554b930f5efc1e2f43e006809cd`.
- **R12.** [GSAP · Flip.getState](https://gsap.com/docs/v3/Plugins/Flip/static.getState()/).
- **R13.** [GSAP · CustomEase](https://gsap.com/docs/v3/Eases/CustomEase/).
- **R14.** [GSAP · gsap.context](https://gsap.com/docs/v3/GSAP/gsap.context()/).
- **R15.** UI Kit: [iconos REMI](https://github.com/fegome90-cmd/ui-kit/blob/4ae9b6e04afbfa50f5a9196a6a0d35d5458d8ec4/components/ui/remi/icons.tsx) y [estilos REMI](https://github.com/fegome90-cmd/ui-kit/blob/4ae9b6e04afbfa50f5a9196a6a0d35d5458d8ec4/styles/remi.css).
- **R16.** [MDN · hashchange](https://developer.mozilla.org/en-US/docs/Web/API/Window/hashchange_event).
- **R17.** [MDN · getBoundingClientRect](https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect).
- **R18.** [MDN · ResizeObserver](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver).
- **R19.** [WAI-ARIA APG · Disclosure](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/).
- **R20.** [Motion · términos de Motion+](https://motion.dev/terms).
- **R21.** [GSAP · licencia Standard](https://gsap.com/standard-license/). Consulta del texto íntegro no completada; revisar antes de distribuir el runtime.
- **R22.** REMI: [ScalePanel y ScaleItem](https://github.com/fegome90-cmd/remi-monitor/blob/b16b4e5b4641097ef864488e95ad09086ee8d8ee/components/ui/scale-dialog.tsx), [fixtures de demostración](https://github.com/fegome90-cmd/remi-monitor/blob/b16b4e5b4641097ef864488e95ad09086ee8d8ee/lib/demo-kit.ts) y [preview del banco](https://github.com/fegome90-cmd/remi-monitor/blob/b16b4e5b4641097ef864488e95ad09086ee8d8ee/components/docs/previews.tsx).
