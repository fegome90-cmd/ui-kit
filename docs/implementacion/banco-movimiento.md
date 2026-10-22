# Banco de movimiento · primera implementación

Implementa la propuesta [UIKIT-MOTION-001](../propuestas/banco-movimiento-reutilizable-remi.md), versión 0.1.0 del 22 de octubre de 2026. El documento original conserva su carácter de propuesta; este archivo registra el código y la evidencia de esta entrega.

## Recursos

| Recurso | Módulo | Uso |
|---|---|---|
| `lab-scene-enter` | `components/ui/lab/scene-enter.tsx` | Entrada explícita de una superficie |
| `lab-focus-expand` | `components/ui/lab/focus-expand.tsx` | Abrir, cambiar, actualizar contenido y volver |
| `lab-step-reveal` | `components/ui/lab/step-reveal.tsx` | Comentario al cambiar el estado |
| `lab-motion-scene-demo` | `components/blocks/lab/motion-scene-demo.tsx` | Composición neutral con proyectos aportados por el consumidor |

Cada recurso tiene ficha, preview, miniatura y archivos en el registry. Todos permanecen `candidate`: las pruebas de coherencia e interacción no reemplazan la revisión visual, de accesibilidad y de rendimiento completa.

## Núcleo y adaptadores

`lib/motion/scene-controller.ts` recibe un `SceneHost` con targets DOM, commit del estado y destinos de foco. No conoce React, REMI ni hashes. `tokens.ts` concentra los tiempos; `types.ts` declara los contratos. `load-driver.ts` carga de forma diferida `gsap-driver.ts`, que usa GSAP 3.15.0, Flip y CustomEase. El controlador sigue funcionando si falta el driver o su carga falla.

La última solicitud prevalece. Una nueva acción aborta el commit pendiente, resuelve la solicitud sustituida y cancela los callbacks anteriores. Las promesas terminan con `completed`, `superseded`, `destroyed` o un fallo recuperable. El host recupera overview cuando falta un target; un fallo antiguo no puede modificar el estado posterior.

`transitionTo` es idempotente para estado y `contentKey` estables. Cambiar solo la clave actualiza contenido sin otra ampliación. `enter(origin)` es una extensión explícita del contrato propuesto para repetir una entrada por acción del presentador. No existe reproducción automática continua.

El adaptador React captura antes del commit y espera su confirmación mediante `useLayoutEffect`. El driver transforma superficies decorativas; el contenido conserva su tamaño final. El encabezado y el control de retorno permanecen fuera del fundido. El foco se decide al confirmar el estado y una interacción posterior del usuario impide que una solicitud pendiente lo recupere.

El controlador asienta la última intención al cambiar tamaño, preferencia de movimiento, visibilidad o impresión. El host debe llamar `invalidateLayout()` cuando cambie un zoom propio. El `coordinateRoot` puede ser un ancestro transformado: el driver no escribe el transform de ese ancestro.

## Instalación

```bash
npx shadcn add @ui-kit/lab-motion-scene-demo @ui-kit/lab-scene-enter
```

Configura `@ui-kit` con la URL del registry y agrega los imports CSS que informa el CLI. El bloque recibe `projects`; no importa `lib/demo/motion.ts`. Las dependencias relativas y el import dinámico literal se resuelven como items del registry, incluido el driver y su dependencia `gsap@3.15.0`.

Para HTML sin React, usa el mismo controlador y driver con un host DOM. El consumidor mantiene sus datos, estilos y navegación. La integración REMI conserva copias verificables de estos módulos, sin introducir palabras o reglas clínicas en el núcleo.

## Evidencia del 22 de octubre de 2026

| Verificación | Resultado observado |
|---|---|
| `make check` | Lint, tipos y 345 pruebas correctos |
| Controlador y driver | 65 pruebas de interrupciones, promesas, foco, aislamiento, fallback, geometría transformada y limpieza |
| Adaptadores React y bloque | 17 pruebas, incluidos commits, StrictMode, cambios de contenido y fallos obsoletos |
| Registry | 117 items generados y validados con shadcn |
| Build de producción | Next.js compila y genera las rutas del catálogo |
| Proyecto React externo | 11 items materializados desde los JSON publicados; TypeScript y bundle independientes correctos; sin imports al repo ni a las fixtures del catálogo |
| Navegador Chromium | Abrir, cambiar objetivo, cambiar proyecto, volver y foco del selector comprobados en el proyecto externo |
| Viewport móvil de 390 px | Sin desborde horizontal de página; cuerpo del detalle de 16 px y controles utilizables |

El CLI de instalación resolvió el registry e instaló sus dependencias, pero se detuvo al descargar `https://ui.shadcn.com/r/colors/neutral.json` por una restricción del proxy. La verificación externa continuó copiando exactamente los archivos de los JSON, siguiendo sus dependencias. Esto comprueba la integridad de los recursos, **no** una ejecución completa y exitosa del CLI.

El preview administrado de Next.js no arrancó porque el entorno le agrega `--host`, argumento que esa versión de Next no acepta. La comprobación visual se hizo en el proyecto React independiente. No se ejecutó la suite E2E de Playwright del catálogo ni la CI completa con cobertura. La consola del navegador no mostró errores propios de la aplicación; sí hubo mensajes de la extensión del entorno.

Quedan pendientes Safari, lector de pantalla, dispositivo táctil real, impresión real, la matriz completa de escalas y zoom y mediciones de frames/tareas largas. No se afirma 60 FPS ni se da por aprobada E5. Los tiempos de la propuesta siguen siendo parámetros iniciales.

## Revisión de consolidación

La revisión posterior corrigió tres defectos reproducidos: un target creado por el nuevo contenido se validaba contra el DOM anterior; un observador de fallo podía iniciar una nueva transición y recibir después una recuperación obsoleta; la entrada podía borrar el transform y la opacidad propios del consumidor. La validación ocurre tras el commit, la recuperación revalida la solicitud vigente y el driver restaura los valores inline y sus prioridades al completar, asentar o destruir una entrada.

Se añadieron seis regresiones. La entrada inicial sigue siendo estable e instantánea mientras carga el driver; su llegada no reproduce una animación tardía. Una repetición explícita sí puede usar el motor una vez disponible. Esta política evita que una carga pendiente oculte contenido que ya se está operando.

## GSAP

GSAP se distribuye con sus propias condiciones; no queda cubierto por la licencia MIT del código propio. La consulta de `gsap.com/standard-license` devolvió una página de servicio no disponible. Se revisó la sección 9 de los [términos oficiales de Webflow](https://webflow.com/legal/product-terms), que describe los usos de GSAP y excluye herramientas visuales de animación sin código que compitan con Webflow.

El banco expone código y ejemplos de interfaz. Al redistribuir el runtime deben conservarse sus avisos de autoría y licencia, incluidos los de Flip y CustomEase. No se añade una licencia alternativa al paquete ni se presenta como MIT.
