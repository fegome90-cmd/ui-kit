# UI Kit

Biblioteca personal de componentes de frontend, con banco de documentación en `/componentes`.
Sigue el estilo shadcn: el código vive en el repo y se copia o importa, no es un paquete.

## Familias

Cada familia conserva su propio sistema de estilos; conviven sin pisarse.

| Familia | Origen | Estilos | Contenedor |
|---|---|---|---|
| REMI | Componentes genéricos del monitor REMI (`remi-monitor`) | CSS plano en `styles/remi.css` | `.remi` |
| Ninja | `ninja-ui` v3 | Tailwind v4 + Radix + `cva`, tokens en `styles/ninja.css` | ninguno (`:root`) |
| Kraa | `kraa-component-bank` v0.1.1 | Tailwind v4 + `cva` + `cn()` + Radix, tema en `styles/kraa-theme.css` | `KraaProvider` (`.kraa-theme`) |
| REA | `REA_Atlas_completo_v4` (2026-10-16) | Tailwind v4 + `cva` + `cn()`, tema en `styles/rea.css` | `ReaProvider` (`.rea-theme`) |

- **REMI** solo trae lo genérico. Se quedaron en el monitor el punto de pendientes, el diálogo de escala,
  las indicaciones, los indicadores clínicos y `lib/pending`. `styles/remi.css` se extrajo una vez de los
  estilos del monitor con `scripts/extract-remi-css.mjs`, y desde entonces se edita a mano.
- **REA**: `SlideNavigator` se copió del paquete y el resto se reescribió en React a partir de
  `site-concept.html` (paleta ⌘K, filtros, índice, inspector, aviso, progreso, retícula, preloader, textos en
  movimiento, escenario, cabecera y catálogo). La investigación, la skill `design-to-registry-workflow` y las
  referencias están en `docs/origen/rea-atlas/`.
- **Ninja** se copió tal cual: solo cambiaron las rutas de import, el formato (Biome) y los ajustes de lint que
  se anotan junto al código.
- **Kraa** conserva su API y sus valores, pero las clases CSS propias pasaron a utilidades de Tailwind. Su `cx()`
  se reemplazó por `cn()`, y se agregaron `KraaSelect` y `KraaAvatar` en lugar de `.kraa-select` y `.kraa-avatar`.
  Los READMEs originales están en `docs/origen/`.

## Convención (estilo shadcn)

Ninja, REA y Kraa siguen la convención; REMI todavía usa CSS con clases propias y se migra después.

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
components/ui/{remi,ninja,kraa,rea}/   componentes por familia
components/blocks/{ninja,kraa,rea}/    composiciones
components/docs/          navegación, pestañas y vistas previas del banco
lib/component-registry.ts registro: una entrada por componente (genera su página)
lib/kraa/, lib/rea/       modelo y utilidades de Kraa y REA
lib/demo/                 datos ficticios para las vistas previas
styles/                   CSS de cada familia y fuentes de muestra
```

## Agregar un componente

1. Créalo en `components/ui/<familia>/` (o en `components/blocks/<familia>/`).
2. Regístralo en `lib/component-registry.ts`.
3. Agrega su vista previa y su miniatura en `components/docs/previews.tsx`.

Si falta alguno de los tres pasos, los tests fallan: un módulo sin entrada en el registro, o una entrada sin
vista previa, no pasa.

## Comandos

```bash
npm install
npm run dev          # banco en http://localhost:3000/componentes
npm run lint         # Biome
npm run typecheck
npm test             # Vitest (unitarios + componentes en jsdom)
npm run test:e2e     # Playwright contra el build (requiere npm run build)
npm run ci           # pipeline completo (scripts/ci.sh); lo usa el hook pre-push
```

## Pendientes conocidos

- `UpdateStatus` (REMI) muestra el mismo triángulo verde con y sin hora: un estado sin verificar se ve como
  "bien". Viene así del monitor.
- REMI usa colores fijos en vez de tokens; `--remi-*` se declaran pero ningún componente los usa todavía.
- Ninja mantiene el contraste del original (coral 3,4:1). La clase `theme-aa` lo lleva a AA.
- Los bloques de Ninja tienen textos en inglés ("Filter typefaces", "Font shape").
- `AnimatedHeadline` y `KraaReadingCanvas` renderizan su propio `h1`.
- REA: `SlideNavigator` está en estado *candidate* y usa el azul FALP `#004990` como respaldo
  (`rights: review-required`). No se portaron el terreno WebGL ni el scrollytelling sticky del escenario.
- REA: la copia decorativa de `ReaNav` usa `content: attr(data-label) / ""` para no leerse dos veces. Un navegador
  sin soporte de texto alternativo en `content` descarta la declaración y no muestra la copia en hover.
- REMI aún no sigue la convención shadcn, y no hay `registry.json` para instalar con `npx shadcn add`.
- Kraa: los portales (menú de acciones, hoja móvil) replican `.kraa-theme` con `useKraaTheme`, porque salen del
  árbol del proveedor.

## Licencias

Kraa incluye Inter (SIL OFL 1.1, `docs/origen/OFL-Inter.txt`). Las fuentes de muestra de Ninja vienen de
Fontsource (OFL), igual que Geist y Geist Mono para REA. Ninja y Kraa se derivan de interfaces públicas de
terceros, y REA Atlas adapta la composición y el movimiento de piergorelli.com: no las publiques como diseño
propio.
