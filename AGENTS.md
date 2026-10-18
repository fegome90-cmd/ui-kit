<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Repositorio

ui-kit es una biblioteca personal de componentes con un banco de documentación en `/componentes`. Para el propósito,
la estructura y las convenciones de familias, consulta el [README](README.md); para catálogo, API documentada,
archivos, madurez y procedencia, consulta [`lib/component-registry.ts`](lib/component-registry.ts). Mantén esas
fuentes de verdad actualizadas en vez de duplicar aquí su arquitectura.

- Escribe la documentación propia y los textos del catálogo en español. Conserva los identificadores de API y
  los strings heredados del origen salvo que se solicite cambiarlos; no traduzcas código ni referencias en bloque.
- Conserva los límites entre REMI, Ninja, Kraa, REA y Lab: respeta los tokens y el ámbito de estilos de cada familia,
  y su proveedor de tema cuando exista. `components/ui/` contiene primitivas; `components/blocks/`, composiciones.
- Sigue los tokens y proveedores reales de la familia. Si agregas escalas `--text-*`, amplía la configuración
  existente de `extendTailwindMerge` en `lib/utils.ts`. Los portales Kraa deben replicar el tema con `useKraaTheme`.
- Respeta las convenciones locales y las props públicas tipadas. No impongas `cva`, `data-slot` ni directivas de
  cliente a todos los componentes; conserva los límites existentes entre entradas de servidor y cliente.

## Cambios de componentes

Al agregar, mover o cambiar componentes o su registro, sigue
[`.claude/skills/registrar-componente/SKILL.md`](.claude/skills/registrar-componente/SKILL.md). Antes de reconstruir
una interfaz desde referencias visuales externas, sigue [`.claude/skills/capturar-diseno/SKILL.md`](.claude/skills/capturar-diseno/SKILL.md).
Para criterios de diseño, estados, accesibilidad, movimiento y la lista de control final, sigue la
[guía de trabajo](docs/guia-de-trabajo.md).

Comprueba que el código fuente, los metadatos y el uso documentado, la lista `files`, las vistas previas, las
miniaturas y las pruebas aplicables coincidan. Respeta el alcance autorizado y las condiciones de uso y
redistribución de cada referencia; detente y consulta si no están claras.

`provenance` describe la evidencia y `status` la madurez: no son intercambiables. `observed-image` e `inferred`
siempre deben quedar como `candidate`; toda entrada `candidate` debe indicar en `notes` qué verificación falta.
Las pruebas verifican coherencia del catálogo, no derechos ni fidelidad visual.

## Herramientas opcionales

Cárgalas solo cuando el trabajo lo requiera y estén disponibles; el repositorio no depende de ellas.

| Trabajo | Guía condicional |
|---|---|
| Sitios públicos de landing, marketing o producto | Usa `.agents/skills/design-taste-frontend/SKILL.md` si está instalada; no aplica a dashboards ni pantallas de aplicación. Elige una dirección de arte; no cargues por defecto guías incompatibles. |
| Automatización de navegador | Usa `.agents/skills/playwright-cli/SKILL.md` si está instalada y disponible. |
| Auditorías UI o de accesibilidad solicitadas | Usa los umbrales y la lista de control de la [guía de trabajo](docs/guia-de-trabajo.md) (secciones 7 y 11). Prueba teclado, foco y contraste en el navegador; una auditoría automática no los reemplaza. |

## Validación y entrega

Consulta los scripts en [`package.json`](package.json), el estilo en [`biome.json`](biome.json) y
[`.editorconfig`](.editorconfig), los hooks en [`lefthook.yml`](lefthook.yml), la CI en [`scripts/ci.sh`](scripts/ci.sh)
y las configuraciones [`vitest.config.mts`](vitest.config.mts) y [`playwright.config.ts`](playwright.config.ts) antes
de elegir comprobaciones.

- Distingue comprobaciones de mutaciones: `npm run lint` no escribe; `npm run format` modifica archivos.
  `npm run typecheck` ejecuta generación previa y puede escribir fuentes generadas o metadatos de TypeScript.
- `predev` y `prebuild` generan fuentes y registry. `lib/generated/`, `registry.json` y `public/r/` son artefactos
  ignorados: modifica sus fuentes, no esas salidas.
- El pre-commit aplica Biome con `--write` a archivos staged `js,mjs,ts,tsx,json,css` y vuelve a agregarlos;
  archivos staged TS/TSX activan typecheck completo y pruebas relacionadas. Markdown queda fuera de esos filtros.
  El pre-push ejecuta CI completa. Son hooks locales, no una garantía remota ni una política imposible de omitir.
- `npm run test:e2e` requiere un build de producción y Chromium. La CI completa incluye build y E2E;
  `SKIP_E2E=1` omite E2E; no es el valor por defecto. Informa cada omisión.

Ajusta las comprobaciones al alcance del cambio. Informa resultados observados, fallos preexistentes, pruebas
omitidas y herramientas no disponibles; no amplíes una reparación fuera del alcance autorizado. Evalúa por separado
la fidelidad visual y la interacción por foco, teclado y tamaños de pantalla. Ninguna prueba acredita permisos ni
fidelidad. Al cerrar, nombra cualquier comprobación fallida, omitida o no disponible.

## Colaboración

Preserva el trabajo existente de otras personas. No presentes ramas, commits o PR como requisitos del repositorio:
el historial muestra prefijos convencionales y descripciones en español como estilo recomendado, no como regla
validada automáticamente. Pide aprobación antes de ampliar el alcance, agregar dependencias o romper una API pública,
salvo que esa decisión ya esté autorizada expresamente.
