# Kraa · Banco de componentes N4N

Paquete candidato v0.1.1: **13 componentes y bloques React, 14 entradas de registro, Inter variable, tokens de color/tipografía/dimensión y 6 recetas de movimiento**. Se creó con REA Reuse a partir de la interfaz pública actual de Kraa y las referencias de Awwwards.

## Mirar y buscar

Abre `catalog.html`. Es autónomo e incluye el React compilado, los estilos y la fuente Inter: sus ejemplos ejecutan los componentes reales. Puedes buscar piezas, consultar su código y variantes, alternar temas, abrir un documento y ajustar la tipografía. Los textos de muestra son sintéticos.

`catalog.json` sirve para búsqueda por agentes. `docs/API.md` describe las entradas. `tokens/tokens.json` usa tipos DTCG con procedencia en `$extensions.org.n4n`; `tokens/motion.json` conserva duraciones, propiedades y límites.

## Instalar componentes

React 19, TypeScript y CSS normal; no requiere Tailwind para representar el diseño. Los componentes con interacción usan Radix. Archivos con prefijo `kraa-` y tokens `--kraa-*` para coexistir con el banco Ninja.

Con las dependencias del paquete disponibles:

```sh
npm install
npm run build
npm test
npm run preview
```

La implementación se compiló y comprobó con dependencias ya disponibles en el entorno de trabajo, sin modificar el proyecto de N4N. La instalación limpia desde npm y la CLI shadcn se mantienen como verificaciones separadas pendientes.

Para servir el registro local:

```sh
npm run registry:serve
```

Desde un proyecto consumidor configurado con shadcn:

```sh
npx shadcn@latest add http://127.0.0.1:4188/r/kraa-document-sidebar.json
npx shadcn@latest add http://127.0.0.1:4188/r/kraa-fonts.json
```

Cada entrada de componente contiene su cierre de archivos locales y dependencias npm. La entrada de fuentes se instala una vez. El registro aún no tiene URL pública.

El instalador coloca `styles/kraa-theme.css` y `styles/kraa-fonts.css` en la raíz del proyecto (`~/styles`). Importa ambos una sola vez desde el CSS global con las rutas relativas que correspondan. Envuelve el contenido con `KraaProvider`. Al copiar manualmente, usa `src/components`, `src/lib` y `src/styles`; adapta el alias `@/` a tu proyecto.

```tsx
import { KraaProvider } from "@/components/ui/kraa-theme"
import { KraaDocumentWorkspace } from "@/components/blocks/kraa-document-workspace"
import { KraaReadingCanvas } from "@/components/blocks/kraa-reading-canvas"

<KraaProvider theme="dark">
  <KraaDocumentWorkspace documents={documents} selectedId={selectedId} onSelect={setSelectedId}>
    <KraaReadingCanvas title={title} settings={settings}>
      <p>Contenido del documento.</p>
    </KraaReadingCanvas>
  </KraaDocumentWorkspace>
</KraaProvider>
```

En React Server Components, conserva `"use client"` en los módulos interactivos y coloca el estado/callbacks en un contenedor cliente. `KraaReadingCanvas` es una composición de lectura, no un editor con persistencia. Las acciones y los roles reciben callbacks y etiquetas: no implementan permisos, guardado ni eliminación en un servidor.

## Fuentes

- **Inter**: WOFF2 variable sin modificar, incluida y con licencia SIL OFL 1.1 en `fonts/OFL-Inter.txt`. CSS con data URL para uso autónomo; alias CSS `Kraa Inter`.
- **SuisseIntl**: observada en el documento de referencia. Binarios no incluidos; requiere licencia propia. El fallback Inter cambia la forma y métricas del texto.
- **Domine y Monaspace**: declaradas en el CSS fuente; archivos no cargados en la superficie inspeccionada. El manifiesto conserva la referencia y los fallbacks, sin afirmar que se extrajeron sus binarios.

Para habilitar SuisseIntl, carga tus archivos autorizados, pasa `licensedSuisseAvailable` a `KraaTypographySettings` y elige `font: "suisse"` en la configuración. No se solicitan ni incluyen claves, cookies o datos de cuentas.

## Movimiento y fidelidad

Se conservaron los valores observados: 150 ms para color y contenido lateral, 200 ms para el contenedor lateral y sliders, 250 ms para etiquetas y un retraso de 1.000 ms para ayuda contextual. Se quitó la animación de ancho añadida en v0.1.0. La reducción a 56 px, la entrada del menú y el panel móvil siguen siendo adaptaciones documentadas.

La variante `size="row"` del botón y de la búsqueda conserva filas de 28 px, etiquetas de 13/19 px, iconos de 24 px y padding `0 2px 0 8px`. El subtítulo de lectura toma 44/55.7333 px y `hsl(270 10% 70%)` de la plantilla Echo. Consulta `docs/FIDELITY.md` para la comparación por propiedad; la medición no equivale a identidad del componente entero.

El paquete respeta `prefers-reduced-motion`. La ficha de cada componente distingue `measured-dom`, `declared-source-css`, `observed-image` y adaptación independiente. **No se certifica identidad visual 1:1**: faltan la tipografía comercial y comparaciones completas por estado/viewport.

## Procedencia y mantenimiento

Ver `evidence/source-observations.json`, `fonts/manifest.json`, `docs/QA.md` y `docs/REA.md`. No se copió el bundle de la aplicación ni sus imágenes/editor/servicios. El código de los componentes es una reconstrucción independiente; no atribuirle una licencia del producto original.

Tras editar los módulos o metadatos (la preparación devuelve QA a pendiente hasta volver a comprobarlo):

```sh
python3 scripts/prepare-bank.py
npm run build
npm test
```

Los informes separan compilación, pruebas de lógica/integridad e interacción real. No se modificó ni publicó N4N desde este paquete.
