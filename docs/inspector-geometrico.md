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

Los bloques se seleccionan en los dos controles del panel, también por teclado. Escape
solo actúa desde ese panel. No se capturan teclas ni clicks del contenido. Se agregan
nodos únicamente a `body`, nunca a la diapositiva. No hay backend, IA ni auto-layout.
El CSS queda acotado a `.rea-gi` y oculta el inspector al imprimir.

`measureBox(slideRect, blockRect, {width,height})` devuelve x/y/ancho/alto locales,
porcentajes relativos al tamaño de la diapositiva, distancias firmadas a sus bordes y
desborde de la **caja**. Valores negativos indican salida de los bordes. `measureDistance`
devuelve separaciones horizontal/vertical (0 si hay solapamiento) y distancia euclidiana
entre bordes de cajas. No mide contornos de texto, tinta ni calidad editorial.

Se admiten traslación y escala positiva alineadas a los ejes, incluso escala no uniforme;
zoom del navegador y scroll usan el mismo sistema de rectángulos de viewport. No se
admiten rotación, skew, perspectiva, escala negativa ni transformaciones del `html/body`
que creen un containing block fijo. Cajas recortadas se miden completas, no como área
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

## Verificación del candidato

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
