# Guía de trabajo de la biblioteca

Cómo diseñar, construir, documentar y revisar componentes en ui-kit. Revisada el 2026-10-18.

Sale de leer las skills de diseño instaladas (impeccable, frontend-design, design-taste-frontend, las 47 guías TypeUI, el plugin de diseño con accessibility-review, design-system, design-handoff, design-critique y ux-copy, ui-ux-pro-max y las de patrones de React de Vercel) y contrastarlas con lo que el banco ya hace. Cada skill trae el gusto de su autor: de acá se tomó lo que se repite entre varias o se puede verificar, y se dejó afuera lo que es estilo de una sola.

**Orden de prioridad cuando algo choca:** la identidad de la familia y el pedido concreto, después esta guía, después cualquier skill.

---

## 1. Principios del banco

1. **Cada familia conserva su sistema.** REMI, Ninja, Kraa, REA y Lab tienen tokens, tipografía y reglas propias. Un componente nuevo se diseña dentro de una familia, no entre familias.
2. **Todo vive en su contenedor.** REMI bajo `.remi`, Kraa en `KraaProvider`, REA en `ReaProvider`, Lab en `LabScope` (`.lab`). Ninja es el tema base y no necesita contenedor. El marco del banco es neutro y no adopta el estilo de ninguna familia.
3. **El código vive en el repo y se copia.** Lo que se instala con `shadcn add` tiene que funcionar fuera del banco: sin acoplamientos escondidos, con sus dependencias declaradas por sus imports.
4. **La procedencia y la madurez se declaran, no se suponen.** `provenance` dice de dónde sale; `status: "candidate"` dice que falta algo, y `notes` dice qué.
5. **Verificar antes de afirmar.** Un componente no es fiel a un original sin comparación visual directa, ni accesible sin probar teclado y contraste.

## 2. Antes de diseñar: qué superficie es

La misma regla no sirve para todo. impeccable distingue la superficie por lo que la hace exitosa; conviene decidirlo primero:

| Superficie | Éxito | En el banco | Skills que aplican |
|---|---|---|---|
| **Operar** (apps, paneles, formularios, componentes) | Se escanea rápido y se comporta igual en todos lados | La mayoría de REMI, Ninja, Kraa y el marco del banco | impeccable (modo operar), design-system, accessibility-review |
| **Persuadir** (landing, portada, marketing) | Se entiende y se recuerda | La portada del banco; bloques de REA y Lab | design-taste-frontend, frontend-design |
| **Leer** (documentación) | Se encuentra y se entiende | Páginas de componente | ux-copy, impeccable (modo leer) |

design-taste-frontend se excluye a sí misma de apps y dashboards: sus reglas de densidad (texto de 16 px o más a tinta plena, nada de pantallas vacías, nada de líneas finas) pelean con un componente de operación. Usarla solo para superficies de persuadir.

## 3. Describir una dirección visual como ejes

Las guías TypeUI comparten una plantilla y varían en pocos ejes. Sirve para describir una familia nueva, o para comparar dos, sin adjetivos:

| Eje | Valores típicos |
|---|---|
| Densidad | escala 4/8 estándar · baseline de 8 pt · compacta · cómoda |
| Escala tipográfica | 12/14/16/20/24/32 (la más común) · 14/16/18/24/32/40 (editorial) · cuántos tamaños y qué tan separados |
| Tipografías | sans neutra · display con personalidad · mono; para qué rol va cada una |
| Profundidad | plana · bordes · sombras · niveles de elevación |
| Radio | recto · 4–8 · 12–16 · píldora |
| Color | roles (fondo, superficie, tinta, apagado, acento, estados) y si el fondo es claro u oscuro |
| Movimiento | ninguno · solo feedback · una entrada protagonista · coreografía |

Al sumar o documentar una familia, llenar esta tabla en su sección del README.

## 4. Tokens

- **Roles, no valores.** Se nombran por función (`--rea-ink`, `--lab-accent`, `--color-remi-*`), no por color. Es la regla que repiten las 47 guías TypeUI, design-system y ui-ux-pro-max.
- **Dos capas.** Primitivos (la paleta) y semánticos (qué rol cumple cada uno). Los componentes usan los semánticos.
- **Acotados al contenedor.** Los que cambian con tema o acento viven en el contenedor de la familia y se exponen con `@theme inline`; los fijos (fuentes, curvas) en un `@theme` normal. El reset va en `@layer base` para que las utilidades siempre ganen.
- **Un hex suelto en un componente es una segunda paleta.** Hoy hay 65 hex en 10 archivos, casi todos los colores de íconos de REMI medidos del monitor, más el respaldo FALP de `SlideNavigator`. Es una excepción documentada, no un patrón: lo nuevo usa tokens.
- **Se extrae un token cuando se repite.** Tres usos con la misma intención (impeccable). No tokenizar cada valor ni fusionar componentes que se parecen pero sirven para otra cosa.
- **Tamaños de texto nuevos** se registran en `extendTailwindMerge` (`lib/utils.ts`); si no, `tailwind-merge` los descarta.

## 5. API de componentes

Lo que el banco ya hace en la práctica:

- **Raíz con `data-slot`**, exportaciones con nombre (no hay `export default`), y `className` combinado al final con `cn()`.
- **Variantes visuales con `cva`** (`variant`, `size`, `tone`): son opciones enumeradas de aspecto.
- **Modos de comportamiento como componentes o variantes explícitas, no como booleanos.** Si aparece `isEditing` o `isCompact` que cambia la estructura, es otro componente que comparte internos (vercel-composition-patterns).
- **Controlado y no controlado con la misma firma:** `value`, `defaultValue` y `onValueChange`, como en `FilteredStat`, `TimeScale` y los filtros de REA.
- **Compuestos con contexto** cuando las partes comparten estado; una parte usada fuera de su proveedor debe fallar con un error claro.
- **`children` antes que render props.** Render props solo si el padre tiene que pasarle datos al hijo.
- **`ref` es una prop común** (React 19): no se usa `forwardRef`. Esto implica que lo que se instala del registry pide React 19; declararlo si algún día se publica para React 18.
- **`"use client"` solo donde hace falta.** Hoy son 39 de 88 archivos. Un componente sin estado, efectos ni eventos queda de servidor.
- **Nada de `window` en el render.** Ni en un inicializador de `useState`: Next renderiza los componentes de cliente en el servidor. Medir en un efecto o con `useSyncExternalStore`. Si el valor del servidor no puede conocerse, empezar en el valor seguro, como `useReducedMotion`, que asume movimiento reducido hasta medir.
- **Sin componentes definidos dentro de otros**, sin mutar props (`toSorted`, no `sort`), y derivando valores en el render en vez de sincronizarlos con efectos.
- **Comportamiento accesible de Radix** cuando existe (diálogos, menús, sliders, switches), sin reemplazar a ciegas el estilo medido.

## 6. Estados que todo componente tiene que cubrir

La lista que repiten TypeUI, design-system, design-handoff e impeccable. Lo que no aplica se dice en `notes`, no se omite en silencio.

- **Interacción:** reposo, hover (dentro de `(hover: hover)` si cambia algo importante), `focus-visible`, activo, deshabilitado.
- **Datos:** cargando, error, vacío, y con datos faltantes.
- **Contenido límite:** rótulos largos, traducciones más largas, desborde, un solo ítem y muchos.
- **Entorno:** tema claro y oscuro si la familia lo tiene, pantalla angosta (390 px) y movimiento reducido.

La vista previa del banco muestra cada estado que se declara.

## 7. Accesibilidad: mínimos verificables

| Regla | Umbral | Fuente |
|---|---|---|
| Contraste de texto | 4.5:1; 3:1 para texto grande (18,66 px en negrita o 24 px) | WCAG 1.4.3; casi todas las skills |
| Contraste de controles y gráficos | 3:1 contra lo adyacente | WCAG 1.4.11 |
| Todo por teclado | sin trampas; orden lógico | WCAG 2.1.1 |
| Foco visible | nunca quitar el anillo; 2 px con 2 px de separación funciona | WCAG 2.4.7 |
| Tamaño de objetivo | mínimo 24×24 px (AA, WCAG 2.2 2.5.8); 44×44 en táctil | WCAG 2.5.8 y 2.5.5 (AAA) |
| Nombre, rol y valor | botones de solo ícono con nombre accesible | WCAG 4.1.2 |
| Nunca solo color | estados y series también con forma, texto o patrón | ui-ux-pro-max, dataviz |
| Errores | identificados en texto, junto al campo | WCAG 3.3.1 |

Notas:
- accessibility-review cita 2.5.5 (44 px) como AA; en realidad es AAA. El AA es 2.5.8 (24 px). El botón de ícono de REMI (25 px) cumple el AA.
- HTML semántico antes que ARIA. Un `<button>` antes que un `div` con `role`.
- Un análisis automático encuentra cerca de un tercio de los problemas: probar con teclado siempre.
- Pendiente conocido: el coral de Ninja tiene contraste 3,4:1; `theme-aa` lo lleva a AA.

## 8. Movimiento

Los rangos de impeccable, design-taste-frontend y ui-ux-pro-max coinciden:

| Tipo | Duración |
|---|---|
| Feedback (presionar) | 100–150 ms |
| Cambio de estado (hover, toggle) | 150–300 ms |
| Diálogos, menús, layout | 250–500 ms |
| Entrada protagonista | 500–800 ms |

- **Curva:** salida exponencial (por ejemplo `cubic-bezier(0.16, 1, 0.3, 1)`). Sin rebote ni elástico, y sin `ease-in` para entrar.
- **Qué se anima:** `transform`, `opacity` y `clip-path`. No `width`, `height` ni `top`; `grid-template-rows` es la excepción aceptada para expandir.
- **Movimiento reducido:** se conserva el significado (opacidad, color) y se quita el desplazamiento. No apagar todo con un `0.01ms` global: un estado que solo se entiende por el movimiento tiene que seguir entendiéndose.
- **Bucles:** se pausan al pasar el mouse y al enfocar, y quedan quietos con movimiento reducido (como `LabMarquee`). Lo ideal es pausarlos también fuera de pantalla y con la pestaña oculta; `LabMarquee` todavía no lo hace.
- **El movimiento necesita un trabajo:** guiar, confirmar o explicar. Uno protagonista por vista, no lo mismo en cada sección.

## 9. Texto

De ux-copy, en español y con el tono del banco:

- **Botones:** un verbo y su objeto («Guardar cambios», «Limpiar filtros»), no «Enviar» ni «Aceptar».
- **Errores:** qué pasó, por qué y cómo seguir.
- **Vacíos:** qué es esto, por qué está vacío y cómo empezar. El explorador lo hace: «Ningún componente cumple estos filtros» y cómo salir.
- **Confirmaciones:** cuántos y qué consecuencia («¿Borrar 3 archivos? No se puede deshacer»), con el verbo en el botón.
- **Datos de ejemplo:** ficticios y marcados como tales, en `lib/demo/`.

## 10. Documentar un componente

La entrada de `lib/component-registry.ts` ya cubre la mayor parte de lo que piden design-system y design-handoff:

| Lo que piden las skills | Dónde va en el banco |
|---|---|
| Descripción y cuándo usarlo | `description` |
| Ejemplo de código | `usage` y la pestaña Código |
| Tabla de props (tipo, default, descripción) | `props` |
| Variantes | la vista previa |
| Estados | la vista previa; lo que no aplica, en `notes` |
| Accesibilidad (rol, teclado, lector) | `notes`, cuando no es obvio |
| Procedencia y madurez | `provenance`, `status` |
| Qué hacer y qué no | `notes` |

Falta un lugar propio para estados y accesibilidad: hoy van en `notes`. Si se vuelven frecuentes, conviene un campo `a11y` en `ComponentDoc`.

El checklist de alta está en la skill `registrar-componente`; la captura previa, en `capturar-diseno`.

## 11. Revisar

**Lista de control antes de dar algo por terminado:**

- [ ] Usa tokens de su familia; ningún hex nuevo sin justificar.
- [ ] Cubre los estados de la sección 6, o dice en `notes` cuáles no aplican.
- [ ] Contraste, teclado, foco y objetivos medidos (sección 7).
- [ ] Movimiento con propósito y con su versión reducida (sección 8).
- [ ] Probado a 1440 px y a 390 px, sin desborde horizontal.
- [ ] Sin `window` en el render; `"use client"` solo si hace falta.
- [ ] `make check` y la validación del registry en verde.
- [ ] `status` y `provenance` honestos; si es `candidate`, `notes` dice qué falta.

**Para criticar un diseño** (design-critique): ser específico, dar la razón y una alternativa, y clasificar por gravedad (crítico, moderado, menor). Ajustar la exigencia a la etapa: no pulir lo que todavía se está explorando.

**Para revisar con capturas** (impeccable y design-taste-frontend coinciden): pocas rondas acotadas (tres como máximo), no un ciclo abierto.

## 12. Qué tomar de cada skill y qué dejar

| Skill | Tomar | Dejar |
|---|---|---|
| impeccable | Superficies por modo, extraer tokens con 3 usos, estados completos, formato DESIGN.md | Sus vetos de estilo (eyebrows, secciones numeradas, mono) |
| frontend-design | Elegir una dirección antes de codificar; intención antes que intensidad | Vetar Inter, Roboto o tipografías de sistema; gradientes dramáticos |
| design-taste-frontend | Rangos de movimiento, separar superficies por tono, revisar con capturas | Vetos de líneas finas, radios medios, violetas, mínimos de fotos: es estilo de su autor |
| TypeUI | La plantilla por ejes, la lista de estados, el checklist de calidad | Las direcciones decorativas y el texto de marketing de algunas guías |
| Plugin de diseño | Umbrales WCAG, documentación por componente, ux-copy | Citar 2.5.5 como AA |
| Patrones de Vercel y React | Composición, variantes explícitas, rendimiento de render | `forwardRef` (React 18), ejemplos que leen `window` en el render |

**Contradicciones conocidas entre skills**, para no tomarlas como regla:
- **Gradientes:** design-taste-frontend los veta, frontend-design los recomienda e impeccable veta solo el texto con gradiente.
- **Sombras en reposo:** vetadas, obligatorias o dramáticas, según cuál se lea.
- **Bordes de 1 px:** vetados por design-taste-frontend. En REA y Lab son parte de la identidad.
- **Radio:** design-taste-frontend llama débil a 9–16 px e impeccable lo recomienda para tarjetas.
- **Peso del texto claro sobre fondo oscuro:** una skill sube un paso y otra lo baja.

En estos casos decide la familia (principio 1).

## Fuentes

Skills leídas el 2026-10-18, en cuatro exploraciones de solo lectura. Son skills instaladas en el entorno de quien mantiene el banco; no forman parte del repo.

- **Dirección visual:** impeccable, frontend-design (del paquete de skills de Anthropic) y design-taste-frontend (tasteskill v2).
- **TypeUI:** 47 guías de dirección visual; fuente declarada `typeui.sh`.
- **Plugin de diseño:** accessibility-review, design-system, design-handoff, design-critique y ux-copy, más ui-ux-pro-max.
- **Patrones de React:** vercel-composition-patterns, vercel-react-best-practices, vercel-react-view-transitions, frontend-patterns y react-expert.

Los datos del banco se midieron en el repo (`main`, `b66e98b`).
