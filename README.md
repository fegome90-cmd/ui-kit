# UI Kit

Biblioteca personal de componentes de frontend, con banco de documentación en `/componentes`.
Sigue el estilo shadcn: el código vive en el repo y se copia o importa, no es un paquete.

## Familias

Cada familia conserva su propio sistema de estilos; conviven sin pisarse.

| Familia | Origen | Estilos | Contenedor |
|---|---|---|---|
| REMI | Componentes genéricos del monitor REMI (`remi-monitor`) | CSS plano en `styles/remi.css` | `.remi` |
| Ninja | `ninja-ui` v3 | Tailwind v4 + Radix + `cva`, tokens en `styles/ninja.css` | ninguno (`:root`) |
| Kraa | `kraa-component-bank` v0.1.1 | CSS con tokens `--kraa-*` en `styles/kraa-theme.css` + Radix | `KraaProvider` (`.kraa-theme`) |
| REA | `REA_Atlas_completo_v4` (2026-10-16) | CSS con tokens `--rea-*` en `styles/rea.css`, sin dependencias de UI | `ReaProvider` (`.rea-theme`) |

- **REMI** solo trae lo genérico. Se quedaron en el monitor el punto de pendientes, el diálogo de escala,
  las indicaciones, los indicadores clínicos y `lib/pending`. `styles/remi.css` se extrajo una vez de los
  estilos del monitor con `scripts/extract-remi-css.mjs`, y desde entonces se edita a mano.
- **REA**: `SlideNavigator` se copió del paquete y el resto se reescribió en React a partir de
  `site-concept.html` (paleta ⌘K, filtros, índice, inspector, aviso, progreso, retícula, preloader, textos en
  movimiento, escenario, cabecera y catálogo). La investigación, la skill `design-to-registry-workflow` y las
  referencias están en `docs/origen/rea-atlas/`.
- **Ninja** y **Kraa** se copiaron tal cual. Solo cambiaron las rutas de import, el formato (Biome) y los
  ajustes de lint que se anotan junto al código. Los READMEs originales están en `docs/origen/`.

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
- REA: la copia decorativa de `ReaNav` usa `content: … / ""` para no leerse dos veces. En navegadores sin
  soporte de texto alternativo en `content`, un lector de pantalla puede leerla.

## Licencias

Kraa incluye Inter (SIL OFL 1.1, `docs/origen/OFL-Inter.txt`). Las fuentes de muestra de Ninja vienen de
Fontsource (OFL), igual que Geist y Geist Mono para REA. Ninja y Kraa se derivan de interfaces públicas de
terceros, y REA Atlas adapta la composición y el movimiento de piergorelli.com: no las publiques como diseño
propio.
