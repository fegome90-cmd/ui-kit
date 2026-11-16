# Inspector geométrico de presentaciones HTML

Núcleo sin framework: `public/rea-grid-inspector/inspector.js` y `inspector.css`.
No contiene presentaciones, datos ni activos privados. Demos enteramente sintéticas:
`/rea-grid-inspector/columns.html` y `/rea-grid-inspector/overflow.html`.

```html
<link rel="stylesheet" href="./inspector.css">
<script type="module">
import { createGridInspector } from './inspector.js';
const inspector = createGridInspector(document.querySelector('.slide'), {
  locale: "es", // "en" también disponible
  selector: '[data-inspect]', width: 960, height: 540,
});
inspector.show(); // no cambia el foco
// inspector.hide(); inspector.refresh(); inspector.destroy();
</script>
```

## Interacción y significado de las medidas

El selector **Modo de interacción** empieza en **Lectura: clicks normales**. En ese modo
la presentación conserva sus clicks y navegación. **Seleccionar con click** captura
clicks dentro de la diapositiva y elige el bloque `data-inspect` más próximo; los controles
**Bloque seleccionado** y **Comparar con bloque** ofrecen el mismo flujo por teclado.
Vuelve a Lectura para usar enlaces de la diapositiva. No hay atajos globales.

**Regla: marcar dos puntos** permite marcar dos puntos con clicks en la diapositiva.
Los cuatro campos `x1`, `y1`, `x2`, `y2` admiten edición por teclado en px locales y
muestran Δx, Δy y distancia euclidiana. Los clicks alternan entre primer y segundo punto;
cambiar de modo vuelve a iniciar esa alternancia. Las cotas dibujadas no sustituyen el
texto del panel. Escape desde el panel oculta el inspector y restaura el foco de apertura.

Se agregan nodos únicamente a `body`, nunca a la diapositiva. No hay backend, IA,
auto-layout, persistencia, telemetría ni evaluaciones de calidad editorial. El CSS queda
acotado a `.rea-gi` y oculta el inspector al imprimir.

`measureBox(slideRect, blockRect, {width,height})` devuelve x/y/ancho/alto locales,
porcentajes relativos al tamaño de la diapositiva, distancias firmadas a sus cuatro bordes
y desborde de la **caja DOM de borde**. Valores negativos indican salida de los bordes.
Las cotas gráficas muestran los cuatro bordes y la distancia entre dos bloques.
`measureDistance` devuelve separaciones horizontal/vertical (0 en ejes solapados),
distancia euclidiana entre cajas, `overlapX`/`overlapY` firmados y `relation`:
`separation`, `contact` o `overlap`. Contacto significa distancia cero sin área compartida;
solapamiento requiere intersección positiva en ambos ejes. Una caja comparada consigo
misma se solapa si tiene área positiva.

El panel distingue **caja DOM**, **tinta visible** y **márgenes CSS computados**. No mide
contornos de texto, glifos, sombras ni tinta; el margen CSS no equivale al espacio libre
entre cajas (puede colapsar, ser negativo o depender del layout). La posición y dimensiones
son relativas a la diapositiva; los márgenes se muestran tal como los devuelve CSSOM,
no como distancias visuales normalizadas. Los redondeos de pantalla son a 0,1 px.

Se admiten traslación y escala positiva alineadas a los ejes, incluso escala no uniforme;
zoom del navegador y scroll usan el mismo sistema de rectángulos de viewport. No se
admiten rotación, skew, perspectiva, escala negativa ni transformaciones del `html/body`
que creen un containing block fijo. `assertSupportedGeometry` comprueba el elemento y
sus ancestros, incluidas propiedades independientes de transformación; rechaza matrices
3D de forma conservadora. Ante geometría no soportada muestra un error e invalida también
la regla, en lugar de mantener medidas anteriores. Cajas recortadas se miden completas, no como área
visible. Una diapositiva sin dimensiones muestra estado no disponible. Shadow DOM e
iframes requieren invocar el núcleo dentro del documento correspondiente. Los cambios
DOM, tamaño y scroll actualizan las medidas; para animaciones de transformaciones sin
cambio DOM invoca `refresh()` en el momento que quieras observar.

Sin tamaño explícito se usa `offsetWidth/offsetHeight` (caja de borde local, precisión
entera del navegador); usa width/height para precisión subpíxel o tamaño de diseño.
`hide()` desconecta observadores/eventos y cancela RAF; `show()` los reactiva;
`destroy()` es idempotente y elimina la UI. Si el foco está en el panel al ocultar, vuelve
al control que estaba enfocado al mostrar, si sigue conectado.

## React

**Instalación candidata limitada:** el adaptador del registry requiere que `@/*` resuelva
la raíz del proyecto (como en este repositorio), no `src/*`, porque importa los archivos
publicados en `public/rea-grid-inspector/`. En proyectos con `src/`, usa por ahora el núcleo
HTML independiente o adapta explícitamente el alias. No se afirma instalación universal.
El item publica el JS y CSS con targets `~/public/rea-grid-inspector/inspector.js` y `.css`.

`ReaGridInspector` se exporta desde `rea-grid-overlay.tsx`; importa el mismo núcleo y CSS,
y reutiliza `ReaGridOverlay`, sin implementar otra medición. Colócalo dentro de la
misma diapositiva con `position: relative`, pásale su ref y `visible`. No modifica estilos
del contenedor ni instala atajos. `onVisibleChange(false)` sincroniza el cierre local
con el estado del consumidor; además, el adaptador oculta la retícula internamente al cerrar. El núcleo puro también incluye una retícula opcional;
el adaptador la desactiva para no duplicar la retícula REA. Las filas existentes de
`rea-inspector` siguen disponibles para otras composiciones; el núcleo no depende de React.

## Evidencia histórica del candidato anterior

Pruebas automatizadas observadas: `npm test` aprobó 22 archivos y 271 tests;
`npm run typecheck`, `npm run lint` y `npm run registry` aprobaron. El registry generó
108 items y se verificaron los targets y tipos `registry:file` de ambos archivos del núcleo.

Revisión funcional en Chromium mediante CUA, usando un consumidor de integración con
los bytes exactos de JS/CSS del commit `2dba737` y contenido exclusivamente sintético:

- Ambas demos HTML cargaron y permitieron seleccionar/comparar bloques.
- La demo de columnas mostró separación de 52 px y la de desborde un borde de -270 px.
- Un escenario sintético al 50 % de escala CSS conservó medidas locales y separación de 24 px.
- Escape restauró el foco al control de apertura; el enlace de navegación siguió funcionando.
- Destruir eliminó la UI; las interfaces ES/EN funcionaron.

**Límites de esta evidencia:** escala CSS no equivale a zoom nativo. El intento de
Ctrl++ no cambió devicePixelRatio ni viewport en CUA, por lo que no se declara probado
el zoom real del navegador. Tampoco se verificaron visualmente la impresión, todos los
navegadores/tamaños, la instalación del registry en un consumidor nuevo ni el build/E2E
completo de esta biblioteca. La supresión de impresión tiene cobertura de código/tests,
no una comprobación visual de salida impresa. El componente permanece candidato.
Estas pruebas geométricas y funcionales no acreditan calidad editorial.


## Investigación de referencia y límites actuales

Se reutilizó el núcleo existente y su adaptador; no se copió código de las herramientas
siguientes. Fuentes primarias consultadas para orientar el comportamiento:

- [Figma: distancias entre capas](https://help.figma.com/hc/en-us/articles/360039956974-Measure-distances-between-layers): medidas sobre límites, también en texto.
- [Penpot: herramientas de inspección](https://help.penpot.app/user-guide/dev-tools/): selección de capas, separación a otras capas y bordes.
- [CSSOM View: getBoundingClientRect](https://www.w3.org/TR/cssom-view/#dom-element-getboundingclientrect): rectángulo envolvente de cajas transformadas, no tinta.
- [CSS Transforms 2](https://www.w3.org/TR/css-transforms-2/#individual-transforms): propiedades individuales y contexto de transformación.

La comparación entre diapositivas queda pendiente: este candidato compara únicamente
bloques de una misma diapositiva. No se infiere equivalencia entre slides de dimensiones
distintas ni se presentan capturas históricas como mediciones actuales.

La ampliación requiere QA visual actual, teclado real, contraste efectivo, impresión,
zoom nativo y matriz de navegadores. La evidencia histórica anterior no verifica los
nuevos modos de selección y regla. Las pruebas de DOM simulado no sustituyen esas
comprobaciones. El componente permanece **candidate** y el PR **draft**.

## Verificación de la ampliación (noviembre de 2026)

- Registry generado, validado y construido: 108 items; núcleo JS/CSS incluidos.
- Biome global: 166 archivos comprobados, sin errores. TypeScript aprobado.
- Suite unitaria y de componentes: 23 archivos, 285 tests aprobados. Incluye 9 escenarios
  independientes de interacción, regla, rechazos geométricos, foco y limpieza.
- Build de producción aprobado: compilación, tipos y 100 páginas estáticas generadas.
- Auditoría independiente encontró y verificó la corrección de dos fallos: lectura de
  regla obsoleta bajo geometría inválida y `will-change` individual en `html/body`.
- CI completa **no aprobada**: E2E bloqueado al iniciar Next por `uv_interface_addresses`
  (`Operation not permitted` del entorno). Chromium directo también falló al crear un
  socket. No se declara QA visual de esta ampliación ni E2E aprobado.

La cobertura agregada de la biblioteca no representa cobertura del JS distribuido en
`public/`: la configuración heredada instrumenta `lib/` y componentes. El núcleo sí es
importado directamente por las pruebas geométricas y de interacción.
