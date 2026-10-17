# Auditoría de origen — Presentaciones FALP (16 octubre 2026)

## Fuentes verificadas

- Sitio: `https://falp-voice-banking.horizon9020.chatgpt.site/` — acceso externo en vivo exige inicio de sesión con ChatGPT (`401 Unauthorized`, título `Sign in required`). No es evidencia válida de componentes FALP.
- Fuente histórica indexada: portada «Preservar la voz antes de que cambie» y seis capítulos en una presentación de clonado de voz. Es posible que no coincida con el dashboard actual de tres presentaciones.
- Fuente canónica de diseño (código): `https://github.com/fegome90-cmd/falp-brand-system` (rama main inspeccionada el 2026-10-16).
- Especificaciones: `GOVERNANCE.md`, `PROVENANCE.md`, `specs/DESIGN.md`, `specs/guide.md`, `specs/SLIDE-DESIGN-SYSTEM.md` y `.agents/skills/falp-branding/SKILL.md`.
- Template derivado `templates/artifacts/deck.html`: tiene 11 slides, por lo que **no debe asumirse idéntico** a la presentación publicada ni al dashboard actual.

## Diseño ya estructurado en el repositorio

| Autoridad | Recurso | Observación |
| --- | --- | --- |
| Institucional L0 | `manuales/*.pdf` | Priman sobre captura/UI |
| Tokens L1 | `tokens/core.json`, `tokens/semantic.json` | Colores y roles, no inventar nuevos hex |
| Técnica L2 | `specs/DESIGN.md` | Montserrat display, Inter body, 8px grid, radius 14px |
| Adaptadores L3 | `adapters/css/*`, `adapters/antd/theme.json` | No editarlos como fuente primaria |
| Sitio consumidor L4 | Presentaciones / dashboard | Componentes locales pendientes de validación visual actual |

Colores confirmados por tokens del repositorio: `#004990` primario, `#12385f` tinta, `#f5c300` dorado, `#f5f9fd` canvas, `#ffffff` papel, `#d7e4ef` borde, `#00769f` tinta cian y `#50677e` texto secundario accesible.

## Candidatos a extracción

- `ChapterHeading` — encabezado tipo eyebrow/capítulo (documentado en specs).
- `SemanticCard` — tarjetas semánticas de tonos institucionales.
- `NumberedStep` — pasos e índices numerados.
- `ProgressIndicator` — progreso de presentación (documentado en specs).
- `SlideNavigator` — controles anterior/siguiente, contador y teclado (documentado en specs; comportamiento actual no probado).
- `SlideFrame` — contenedor 16:9 con sombra, adaptable (documentado en specs).
- `PresentationGallery` — **hipótesis** a partir del dashboard reportado, no observada desde el acceso público.

Estos nombres son propuestas de nuevas APIs, no nombres verificados del código del sitio. No deben pasar automáticamente a `approved`.

## Próxima corrida técnica sin inventar estados

1. Capturar con sesión local autorizada el dashboard actual y cada una de las tres presentaciones (portada, cuerpo, navegación y estados). Si el login no puede inspeccionarse, capturas propias de esas vistas sirven como evidencia visual parcial.
2. Comparar observaciones con `falp-brand-system`; tokens canónicos permanecen en origen.
3. Implementar seis patrones documentados y la galería **solo si se observa**. Mantener el contenedor 16:9 en `registry:block` si incorpora layout complejo.
4. Probar viewport 1440×900 y 390×844, navegación por teclado, focus y estados de componentes.
5. Aprobar `@falp/presentations` en registry privado, sin publicar recursos institucionales sin permiso.

**Estado:** Diseño/tokens existentes verificados; vista actual e identidad pixel-perfect **no verificadas**. No es aún un registry instalable.
