# UI Kit

Biblioteca personal de componentes de frontend, con banco de documentación en `/componentes`.
Sigue el estilo shadcn: el código vive en el repo y se copia o importa, no es un paquete.

Para diseñar, construir, documentar y revisar un componente, sigue la [guía de trabajo](docs/guia-de-trabajo.md).

## Tipos y familias

El banco se navega **por tipo de componente**: acciones, formularios, navegación, indicadores, gráficos,
revelación, superficies, fondos, tipografía, movimiento, iconografía, bloques y tema (`CATEGORIES` en
`lib/component-registry.ts`). La familia dice de qué sistema de estilos viene cada pieza y sirve de filtro en el
índice. Cada familia conserva su propio sistema de estilos; conviven sin pisarse.

| Familia | Origen | Estilos | Contenedor |
|---|---|---|---|
| REMI | Componentes genéricos del monitor REMI (`remi-monitor`) | Tailwind v4 + `cn()`, paleta `--color-remi-*` en `styles/remi.css` | `.remi` |
| Ninja | `ninja-ui` v3 | Tailwind v4 + Radix + `cva`, tokens en `styles/ninja.css` | ninguno (`:root`) |
| Kraa | `kraa-component-bank` v0.1.1 | Tailwind v4 + `cva` + `cn()` + Radix, tema en `styles/kraa-theme.css` | `KraaProvider` (`.kraa-theme`) |
| REA | `REA_Atlas_completo_v4` (2026-10-16) | Tailwind v4 + `cva` + `cn()`, tema en `styles/rea.css` | `ReaProvider` (`.rea-theme`) |
| Lab | Investigación propia de señales, magnitudes y revelación (2026-10-17) | Tailwind v4 + `cva` + `cn()`, tokens neutros en `styles/lab.css` | `.lab` |

- **REMI** solo trae lo genérico. Se quedaron en el monitor el punto de pendientes, el diálogo de escala,
  las indicaciones, los indicadores clínicos y `lib/pending`. Las medidas son las del monitor a
  1920×1080. La posición de `ToolPill` y `UpdateStatus` dentro de la cabecera del monitor no viaja con el
  componente: se fija con `className`.
- **REA**: `SlideNavigator` se copió del paquete y el resto se reescribió en React a partir de
  `site-concept.html` (paleta ⌘K, filtros, índice, inspector, aviso, progreso, retícula, preloader, textos en
  movimiento, escenario, cabecera y catálogo). La investigación, la skill `design-to-registry-workflow` y las
  referencias están en `docs/origen/rea-atlas/`.
- **Ninja** se copió tal cual: solo cambiaron las rutas de import, el formato (Biome) y los ajustes de lint que
  se anotan junto al código.
- **Lab** es para comparar mecanismos, no estilos: tokens neutros y un solo acento con un solo significado. Sus
  piezas salen de capturas de referencias de Awwwards con la skill `capturar-diseno` y son todas `candidate`.
  Ninguna está validada para uso clínico.
- **Kraa** conserva su API y sus valores, pero las clases CSS propias pasaron a utilidades de Tailwind. Su `cx()`
  se reemplazó por `cn()`, y se agregaron `KraaSelect` y `KraaAvatar` en lugar de `.kraa-select` y `.kraa-avatar`.
  Los READMEs originales están en `docs/origen/`.

## Convención (estilo shadcn)

Las cinco familias siguen la convención.

- **Componentes con utilidades de Tailwind**: variantes con `cva`, clases combinadas con `cn()` (`lib/utils.ts`),
  `data-slot` en la raíz y exportaciones con nombre. El código vive en el repo, no en un paquete.
- **Ninja es el tema base** de shadcn: sus tokens (`--background`, `--primary`, `--radius-*`, breakpoints `sm`/`md`/…,
  `font-sans`) son globales. Las demás familias no usan esas utilidades genéricas (`rounded-xl`, `md:`, `font-sans`):
  usan sus tokens con prefijo o valores arbitrarios (`rounded-[0.75rem]`, `max-[960px]:`).
- **Tokens por familia**: los valores viven acotados en el contenedor de la familia (p. ej. `.rea-theme`), porque
  cambian con el tema o el acento. Se exponen a Tailwind con `@theme inline` (`--color-rea-ink: var(--rea-ink)` →
  `bg-rea-ink`). Los valores fijos (fuentes, tamaños, curvas, animaciones) van en un `@theme` normal.
- **Reset en `@layer base`**: así las utilidades siempre le ganan. En CSS solo queda lo que Tailwind no expresa
  bien: keyframes y `@utility` puntuales (`rea-ruler`, `rea-grid-paper`, `rea-lift`).
- **Tamaños propios en `cn()`**: cada `--text-*` nuevo se registra en `extendTailwindMerge` (`lib/utils.ts`). Si no,
  `tailwind-merge` lo confunde con un color y lo descarta.

## Estructura

```
app/                      layout, estilos globales y páginas del banco (/componentes)
components/ui/{remi,ninja,kraa,rea,lab}/   componentes por familia
components/blocks/{ninja,kraa,rea}/    composiciones
components/docs/          navegación, pestañas y vistas previas del banco
lib/component-registry.ts registro: una entrada por componente (genera su página)
lib/kraa/, lib/rea/, lib/lab/   modelo y utilidades de Kraa, REA y Lab
lib/demo/                 datos ficticios para las vistas previas
styles/                   CSS de cada familia y fuentes de muestra
```

## Agregar un componente

1. Créalo en `components/ui/<familia>/` (o en `components/blocks/<familia>/`).
2. Regístralo en `lib/component-registry.ts`.
3. Agrega su vista previa y su miniatura en `components/docs/previews.tsx` (REA en `previews-rea.tsx`, Lab en
   `previews-lab.tsx`).

Si falta alguno de los tres pasos, los tests fallan: un módulo sin entrada en el registro, o una entrada sin
vista previa, no pasa.

Antes de dar un componente por terminado, revisa la lista de control de la
[guía de trabajo](docs/guia-de-trabajo.md#11-revisar): tokens, estados, accesibilidad, movimiento y anchos.

## Instalar en otro proyecto (registry shadcn)

`scripts/build-registry.mjs` genera `registry.json` desde `lib/component-registry.ts` y `shadcn build` lo
convierte en `public/r/<item>.json` (los dos son artefactos: corren en `predev`, `prebuild` y en la CI, que
además valida el registry). Hay un item por componente, más `<familia>-tokens` (el CSS del tema), `ui-kit-utils`
(`cn()`) y los módulos de `lib` que usan los componentes.

En el proyecto que instala, el namespace `@ui-kit` apunta a la URL del banco:

```json
{ "registries": { "@ui-kit": "http://localhost:3000/r/{name}.json" } }
```

```bash
npx shadcn@latest add @ui-kit/rea-catalog
```

El CLI copia los archivos con su subcarpeta de familia (`components/ui/rea/…`), instala las dependencias npm y
deja el tema en `styles/`. El tema se importa a mano: el CLI muestra la línea de `@import` para el CSS global.
`ui-kit-utils` reemplaza `lib/utils.ts`; si el proyecto ya tiene un `cn()` propio, revisa el diff antes de
aceptar.

## Comandos

```bash
npm install
npm run dev          # banco en http://localhost:3000/componentes
npm run lint         # Biome
npm run typecheck
npm test             # Vitest (unitarios + componentes en jsdom)
npm run test:e2e     # Playwright contra el build (requiere npm run build)
npm run registry     # registry.json + public/r (también corre en predev/prebuild)
npm run ci           # pipeline completo (scripts/ci.sh); lo usa el hook pre-push
```

## Pendientes conocidos

- `UpdateStatus` (REMI) muestra el mismo triángulo verde con y sin hora: un estado sin verificar se ve como
  "bien". Viene así del monitor.
- Ninja mantiene el contraste del original (coral 3,4:1). La clase `theme-aa` lo lleva a AA.
- Los bloques de Ninja tienen textos en inglés ("Filter typefaces", "Font shape").
- `AnimatedHeadline` y `KraaReadingCanvas` renderizan su propio `h1`.
- REA: `SlideNavigator` está en estado *candidate* y usa el azul FALP `#004990` como respaldo
  (`rights: review-required`). No se portaron el terreno WebGL ni el scrollytelling sticky del escenario.
- REA: la copia decorativa de `ReaNav` usa `content: attr(data-label) / ""` para no leerse dos veces. Un navegador
  sin soporte de texto alternativo en `content` descarta la declaración y no muestra la copia en hover.
- El registry no tiene URL pública: `homepage` y el ejemplo de `components.json` usan localhost.
- `shadcn` (devDependency) arrastra 7 vulnerabilidades altas en dependencias de desarrollo (`fast-glob` vía
  `ts-morph`); no llegan al build de la app.
- REMI: los íconos toman su tamaño natural del `viewBox` (1 unidad = 1 px de la captura); `size` los fuerza
  a un cuadrado.
- Kraa: los portales (menú de acciones, hoja móvil) replican `.kraa-theme` con `useKraaTheme`, porque salen del
  árbol del proveedor.

## Procedencia y derechos

El código original del repo está bajo licencia MIT (`LICENSE`). Esa licencia **no** cubre diseños, marcas,
fuentes ni material de referencia de terceros:

- **Ninja**: reconstrucción, a partir de estilos computados, de la interfaz pública de un índice tipográfico.
  Sin logo, textos ni marcas del original. La fuente original (Aeonik) es comercial y no se incluye.
- **Kraa**: reconstrucción candidata de la interfaz pública de Kraa (paquete `kraa-component-bank` v0.1.1).
- **REA**: adapta la composición, la tipografía y el movimiento de piergorelli.com sin reutilizar su código
  ni sus assets. `docs/origen/rea-atlas` conserva la investigación, el HTML de referencia y las capturas.
- **FALP**: `SlideNavigator` usa como respaldo el azul institucional `#004990`, marcado
  `rights: review-required`. La autoridad de marca es `fegome90-cmd/falp-brand-system`.
- **REMI**: componentes genéricos del prototipo REMI, con medidas tomadas de capturas de un monitor de
  enfermería. Solo datos ficticios; no es para uso clínico.
- **Lab**: reconstrucciones propias, sin código ni assets de los originales, a partir de capturas de BioAge,
  Voices from the Frontlines (CLEVER°FRANKE), Meridian AI, Paradigm Solutions y Google Data GIF Maker, encontrados
  en Awwwards. La evidencia (capturas y hashes) queda fuera de git, en `evidencia/`.
- **Fuentes**: Inter (SIL OFL 1.1, `docs/origen/OFL-Inter.txt`) en Kraa. Hanken Grotesk, Geist, Geist Mono y
  las tipografías de muestra de Ninja vienen de Fontsource (OFL).

Estas piezas son material de estudio y referencia: no las uses ni publiques como diseño propio de quien
las reutilice.
