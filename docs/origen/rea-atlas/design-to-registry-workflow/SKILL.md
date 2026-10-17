---
name: design-to-shadcn-registry
description: Convierte URLs, capturas e imágenes autorizadas en un catálogo verificable de componentes React y un registry compatible con shadcn, conservando procedencia, tokens, pruebas visuales y estados observados vs inferidos.
---

# Design → shadcn Registry (Agent Skill)

## Resultado esperado

No entregar solo una copia de una página. Producir una **biblioteca instalable** que contenga (a) tokens canónicos, (b) componentes React TypeScript con API clara, (c) estados/variantes documentados, (d) Storybook o catálogo equivalente, (e) pruebas y (f) un registry conforme al esquema oficial shadcn. Si faltan capturas o acceso, entregar inventario **candidato**, nunca presentarlo como clon 1:1 verificado.

## Entradas

- `source`: `{kind: "url"|"image"|"repo", uri: string}` y versión/fecha de referencia.
- `authority`: `{canonicalDesignSystemRepo?, institutionalManuals?, licenses?, knownTokens?}`.
- `target`: React + TypeScript + Tailwind + shadcn registry (`registry:ui` o `registry:block`).
- `scope`: páginas/rutas, vistas, viewports y estados que autoriza el dueño.
- `authorization`: acceso explícitamente autorizado; para páginas privadas, sesión solo local en máquina del usuario. No volcar cookies, headers ni contraseñas.

## Workflow secuencial con compuertas

### G0 — Verificar origen y permisos
1. Registrar URL/ruta, screenshot/repo/commit, fecha y estado de autenticación. Separar contenido actual, caché histórica y template derivado.
2. Si el sitio muestra **«Log in to access», «Continue with ChatGPT»** o errores 401/403, marcar `blocked-auth` y **detener extracción DOM y captura del sitio**. Nunca extraer tokens del formulario de login.
3. Comprobar licencia y restricciones de reutilización. Para sitios privados, conservar capturas y datos localmente, bajo `.gitignore`.
4. Si existe sistema canónico (ej. FALP), leer su gobernanza antes de derivar estilos: manual → core/semantic tokens → specs → adaptadores → producto. Un screenshot jamás actualiza solo la fuente L0/L1.

### G1 — Capturar evidencia
1. Ejecutar `scripts/capture.py --url ... --out runs/...` o `--image ...` (ver README).
2. Múltiples rutas, 1440×900 y 390×844; cuando corresponda, light/dark, hover, focus, selected, disabled y open. Mantener estado y dispositivo registrados por captura.
3. Extraer CSS computado, variables, bounds, jerarquía básica, fuentes e iconos **solo para elementos visibles y autorizados**. Para una imagen, declarar interacciones, DOM, responsive y código exacto **desconocidos**.
4. Crear `evidence.json`, screenshots originales, crops; calcular SHA-256. Las medidas son observaciones situadas, no verdades universales.

### G2 — Construir inventario rastreable
1. Agrupar patrones por semántica y repetición: **primitivos**, **componentes compuestos**, **patrones de presentación** y **bloques/páginas**. No inventar 20 componentes porque una plantilla enumere 20.
2. Cada candidato requiere: `id`, `name`, `sourceRefs`, `provenance` (`measured-dom|observed-image|source-code|inferred`), `status`, estados vistos, variantes, propuesta de props y tokenRefs.
3. Marcar por separado valores **medidos**, **documentados**, **derivados** e **inferidos**. Para imágenes sin DOM, no afirmar tamaño CSS exacto, responsive, focus ni interacciones.
4. Reconciliar tokens: nuevos nombres semánticos se derivan de la fuente canónica; colores nuevos requieren nueva aprobación y una referencia de origen.

### G3 — Modelo genera componentes
Prompt de ejecución por componente:

> Usa exclusivamente la evidencia adjunta para implementar `<Component>` en React/TypeScript accesible, sin inventar estados no observados. No copies el DOM monolítico. Separa primitivas, compuestos y patrones. Mapea todo color a tokens canónicos. Genera `.tsx`, stories que muestren cada estado observado, pruebas de interacción relevantes y README de props. Identifica cualquier detalle inferido y solicita validación antes de elevarlo a confirmado. No declares fidelidad 1:1 sin ejecutar el gate visual.

- Preferir `shadcn` y primitivas accesibles como Radix cuando aporten semántica/comportamiento, sin reemplazar a ciegas el estilo medido.
- Props explícitas, sin lógica de negocio ni datos reales. No usar posicionamiento absoluto para simular artificialmente páginas completas.
- Separar `registry:ui` (primitivo reutilizable) de `registry:block` (bloque compuesto); incluir fuentes, estilos y dependencias.

### G4 — Auditoría de fidelidad 1:1
1. Capturar original y story con viewport, DPR, fuentes, contenido, color scheme y estado **iguales**.
2. Comparar imágenes con `scripts/visual_diff.py`. Revisar overlay y diferencia; registrar desplazamientos, tamaños, fuente, radio, espaciado, iconos, sombras y estados. Ajustar y repetir.
3. Inspeccionar funciones separadamente: teclado, focus visible, clic, hover, navegación, scroll, responsive y accesibilidad. **La similitud visual no prueba funcionalidad.**
4. Aprobar solo el par **componente+estado+viewport** cubierto; no generalizar desde un único screenshot.
5. Congelar evidencia QA en el catálogo (`qa.visual.passed`, `qa.behavior.passed`) con referencias a capturas y pruebas. Umbrales de pixel diffs son heurísticos; la revisión humana resuelve diferencias toleradas (antialias, plataforma).

### G5 — Registry + consumo
1. `scripts/build_registry.mjs` valida los componentes aprobados, el origen, la evidencia y los paths locales antes de generar `registry.json`.
2. Ejecutar `npx shadcn@latest build` sobre el catálogo y servir `public/r/*.json` (opcionalmente registry privado con autenticación).
3. Instalar desde `components.json` con un namespace propio, por ejemplo `@falp` solamente cuando exista un endpoint autorizado. Registrar versiones y contrato de dependencias.
4. Gate final: typecheck, tests de comportamiento, visual QA por estado/viewport, contraste/a11y y licencia. Publicar manualmente o mediante PR revisado; **nunca realizar publicación automática de assets institucionales por inferencia**.

## Entregables por corrida

```text
runs/<id>/
  evidence.json
  captures/*.png
  dom/*.json
  crops/**
  catalog.json
  tokens.proposed.json
  qa/<component>/<state>/<viewport>/report.json
registry/default/<component>/<component>.tsx
registry.json
```

## Prohibiciones

- No inferir tokens institucionales desde UI de login, screenshots antiguos ni templates genéricos.
- No declarar componentes idénticos sin comparación directa; no usar capturas de distintos tamaños.
- No subir credenciales, fotos privadas, datos clínicos identificatorios ni archivos sin licencia de redistribución.
- No editar `adapters/` como fuente si existe un sistema canónico aguas arriba.
- No introducir componentes o interacciones solo para rellenar un catálogo.

## Gate de cierre

«¿El registry realmente instala componentes en otro proyecto, se muestran los estados declarados y el original 1:1 está comprobado o claramente marcado como pendiente?» Si no, la salida es **candidata/no publicable**, aunque el código compile.
