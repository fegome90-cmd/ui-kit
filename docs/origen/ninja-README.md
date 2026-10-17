# ninja-ui — librería estilo shadcn

Componentes y tokens extraídos (vía estilos computados) de la UI de referencia, reescritos con el patrón de shadcn/ui: Radix + `cva` + `cn()` + variables CSS en Tailwind v4. `components.json` incluido, así que `npx shadcn add <componente>` sigue funcionando sobre este tema.

## Uso
```bash
npm install
npm run dev      # demo en http://localhost:5173
npm run build
```

## Tokens (src/index.css)
| Token | Valor | Uso en el original |
|---|---|---|
| `--background` | `#F7F6F6` | fondo de página |
| `--foreground` | `#121212` | texto |
| `--card` | `#FFFFFF` | tarjetas, header, paneles |
| `--primary` | `#EE585A` | CTA, links, sliders, badges |
| `--muted` / `--border` | `#D7D7DB` | tracks, switch apagado, bordes de tiles |
| `--muted-foreground` | `#8E8E93` | nav inactivo, footer |
| `--accent` | `#FAF9F5` | crema |
| `--shadow-soft` | `0 2px 32px rgb(72 72 74/.16)` | header, tiles |
| `--shadow-float` | `0 2px 80px rgb(72 72 74/.16)` | panel de filtros |
| radios | 12 / 16 / 24 / 32 px | `sm` / `md` (tiles) / `lg` (botones) / `xl` (tarjetas) |

Tipografía: 44px/400/-0.5px (display), 32/700 (h), 24/500 (nav), 16/400–500 (body/labels), 14/700 + 14/400 (tarjetas), 12/500 (badges), 12/400 gris (footer).

**Fuente:** el original usa Aeonik (comercial). `--font-sans` la pone primero si la cargas con licencia; si no, cae en Hanken Grotesk (OFL).

## Componentes (`src/components/ui`)
- `Button`: default (píldora coral 48px), secondary, outline, ghost, link, icon
- `Badge`: píldora 20px, 12/500
- `Card` (+ Content, Footer, Title, Description)
- `Slider`: track de 2px, thumb con punto o píldora con valor (`formatLabel`), `ticks`, rango
- `Switch`: 30×18
- `ToggleGroup`: tiles 48×40 con borde y sombra suave
- `Input`, `Label`, `Separator`, `Dash` (la rayita sobre los titulares)
- `Navbar` (+ Links, Link activo/inactivo)
- `Panel`: panel flotante inferior sobre Radix Dialog
- `TextLink`: link coral con ↗
- `AnimatedHeadline`: wordmark a todo el ancho que rota entre tipografías (ver abajo)
- `MenuToggle`: burger → X
- `NavbarMenu` / `NavbarMenuItem`: menú desplegable del burger; `mobileOnly` muestra un ítem sólo bajo 1020px

## Bloques (`src/components/blocks`)
- `FontCard`: espécimen "Aa" + metadatos
- `FilterPanel`: botón flotante + panel con forma, opciones, sliders y switches

El logo, los textos y las marcas del sitio original no están incluidos. La demo usa fuentes open-source de Fontsource.

## Movimiento (medido en el original)
Las transiciones se leyeron directamente de los estilos del sitio y se exponen como tokens:

| Token | Curva | Dónde |
|---|---|---|
| `ease-out-expo` | `cubic-bezier(.19,1,.22,1)` | contenido de tarjetas (400ms), burger (800ms) |
| `ease-out-quart` | `cubic-bezier(.165,.84,.44,1)` | colores de botones, iconos y links (250ms) |
| `ease-in-out-quart` | `cubic-bezier(.77,0,.175,1)` | entrada y salida del panel flotante (400ms) |
| `ease-back` | `cubic-bezier(.68,-.55,.265,1.55)` | botón flotante que se esconde (400ms) |

- **FontCard (hover o foco):** "Aa" baja 40px y se desvanece. El pangrama entra desde −60px (fade de 130ms). Los metadatos suben 46px. La barra con slider y Bookmark sube desde +102px. El slider cambia el tamaño del pangrama.
- **Panel:** `panel-in` / `panel-out` (sube + fade). El botón "Filter" cae fuera de pantalla con rebote y vuelve al cerrar.
- **MenuToggle:** 3 barras → X; la central colapsa con 140ms de retraso.
- **`prefers-reduced-motion`:** anula animaciones y transiciones.

## Accesibilidad
- El coral original (`#EE585A`) con texto blanco da 3.4:1 y el gris `#8E8E93` da 3.0:1, por debajo del mínimo AA de 4.5:1. El tema por defecto los mantiene para ser fiel al original.
- Agrega la clase `theme-aa` en `<html>` para usar `#C93538` y `#6B6B70`. Con ella, axe no reporta violaciones WCAG 2 A/AA.

## Título animado (`AnimatedHeadline`)
```tsx
<AnimatedHeadline text="TYPE INDEX" fonts={[{ family: "'Fraunces Variable'", weight: 600, label: "Fraunces", href: "/fonts/fraunces" }, …]} />
```
- **Ancho:** ajusta el tamaño de letra para que el texto llene el ancho del contenedor con cada tipografía.
- **Cambio de tipografía:** cada ~2,6 s pasa a la siguiente con un barrido letra por letra, de izquierda a derecha (45 ms entre letras). Cada letra pasa por cortes horizontales tipo glitch y deja un eco coral.
- **Origen del efecto:** el original lo dibuja con un shader (WebGL). Esto es una aproximación en CSS que no carga un motor 3D.
- **Botón coral:** lleva a la tipografía actual. En hover despliega su nombre (scaleX 0→1, 200 ms ease-in, medido en el original).
- **Pausa:** se detiene con el puntero o el foco encima y cuando la pestaña no está visible. Trae un botón de pausa (WCAG 2.2.2), que se puede quitar con `pauseControl={false}`.
- **Movimiento reducido:** con `prefers-reduced-motion` el título queda fijo.

## Responsive (medido en las hojas de estilo del original)
Breakpoints mobile-first iguales al original: `sm` 744 · `md` 1020 · `lg` 1280 · `xl` 1440 · `2xl` 1920.

| | <744 | 744 | 1020 | 1280 | 1440 |
|---|---|---|---|---|---|
| Header | 60px, padding 16 | padding 32 | 64px + links de escritorio | | |
| Grilla | 1 col | 2 col | 2 col | 3 col | 3 col |
| Tarjeta | 240px | 304px | 304px | 280px | 314px |
| Texto del hero | 24px | 44px | | | |

- **Hero:** ocupa la pantalla (`100dvh − header`, máx. 900px), con el título arriba y la descripción abajo.
- **Botón Filter:** queda escondido (translateY 80px) hasta que la grilla entra en pantalla, a 32px del borde inferior.
- **Panel en móvil:** funciona como bottom sheet, con 8px de margen y scroll interno.
- **Coreografía de las tarjetas:** sólo se activa en dispositivos con hover o con foco de teclado; un toque no la dispara. La tarjeta usa `overflow: clip` para que el foco no pueda desplazar su contenido.
- **Áreas táctiles:** los thumbs del slider y el switch conservan el tamaño visual del original, pero el área de toque se amplía a ≥24px (WCAG 2.5.8).

## Verificación
```bash
npm run build && npx vite preview &      # http://localhost:4173
npx playwright install chromium          # una vez
npm run verify:all                       # 75 pruebas
#   verify        → 37: componentes, teclado, animaciones, accesibilidad (axe)
#   verify:mobile → 38: título animado, menú, 6 breakpoints, iPhone táctil, áreas táctiles
```
