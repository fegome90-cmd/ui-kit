# REA Design Library — guía de consumo para agentes (referencia)

> Estado: `reference`, sin publicación. No afirmar que el sitio FALP actual fue clonado ni que el registry remoto existe.

## Descubrir antes de generar

1. Consultar `src/catalog/index.generated.json` o ejecutar `node src/catalog/query.mjs "avanzar diapositiva"`.
2. Leer el registro `src/catalog/slide-navigator.meta.json` completo: propósito, colección, fuente, permisos y QA.
3. Leer el TSX real y la story; las props válidas provienen de TypeScript, **no** de inferencias hechas por el agente.
4. Comprobar los tokens en `tokens/foundations.tokens.json` y el adaptador FALP antes de aplicar colores. Para FALP, la autoridad externa sigue siendo `fegome90-cmd/falp-brand-system`.
5. Para animaciones, leer `src/motion/recipes/*.json`; las cifras aquí son **ejemplos**, no mediciones del sitio original.

## Implementar o instalar

- Comprobar dependencias y destino del item en `registry.json`.
- El `homepage` y las direcciones `OWNER/REPO` son marcadores. No ejecutar comandos de instalación remota como si estuvieran publicados.
- Si se distribuye: validar registry con shadcn CLI, probar instalación en proyecto limpio y preferir una ref inmutable.
- Nunca sobrescribir tokens canónicos FALP basándose en una captura del sitio.

## Verificar

```bash
node src/catalog/build-index.mjs
node src/tokens/emit-css.mjs
npm test
```

- `candidate` no es `verified`.
- No afirmar fidelidad 1:1 sin fuente válida, captura por estado/viewport y comparación funcional/temporal.
- No incluir secretos ni datos clínicos reales en evidencias, screenshots o ejemplos.

## Navegación de archivos

| Necesidad | Archivo |
|---|---|
| Buscar por intención | `src/catalog/query.mjs` |
| Descripción, tags, evidencia, QA | `src/catalog/slide-navigator.meta.json` |
| Props e implementación | `src/components/slide-navigator/slide-navigator.tsx` |
| Demo y variantes | `src/components/slide-navigator/slide-navigator.stories.tsx` |
| CSS | `src/components/slide-navigator/slide-navigator.css` |
| Tokens | `tokens/foundations.tokens.json` |
| Movimiento | `src/motion/recipes/card-hover-lift.json` |
| Distribución | `registry.json` |

## Diseño visual del catálogo (no del kit FALP)

El HTML `site-concept.html` utiliza una reinterpretación de los patrones observados en
https://piergorelli.com/. Sus tokens de presentación (`--bg`, `--ink`, `--accent`,
`--dur-1`, etc.) gobiernan exclusivamente el catálogo REA Atlas. No confundirlos con
los tokens institucionales FALP que siguen siendo canónicos en `falp-brand-system`.
El informe [FIDELITY.md](FIDELITY.md) detalla fuente, pruebas y pendientes.
No afirmar paridad de píxeles ni publicación; importación y registry son demos.

## Fidelidad v3: lectura obligatoria antes de cambiar el HTML

Leer `DIFF-1VS1.md` y `REFERENCE-METRICS.json` para decidir si un estilo es
observado, reconstruido o una inferencia. No declarar identidad 1:1 en píxeles
sin un oráculo de captura original equivalente. No descargar ni redistribuir
las fuentes, logos, CSS completo o JS propietario del diseño de referencia.

Después de editar `site-concept.html`, ejecutar `npm test`,
`python tests/test_site_behavior.py` y `python tests/test_fidelity_v3.py`;
registrar diferencias visuales y QA pendientes en `FIDELITY.md`.
