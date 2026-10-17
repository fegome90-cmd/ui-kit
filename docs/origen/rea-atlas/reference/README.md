# Biblioteca REA · Kit de referencia (no es una librería publicada)

Este ejemplo acompaña la investigación. Incluye tokens DTCG, TSX/CSS, Storybook CSF,
metadatos de catálogo, búsqueda indexada, una receta de movimiento y un registry shadcn.
El diseño y las duraciones adicionales son **autoría ilustrativa**, no una reconstrucción
verificada 1:1 de FALP. FALP sigue siendo dueño de sus tokens institucionales.

## Validación sin instalar dependencias

```bash
node src/catalog/build-index.mjs
node src/tokens/emit-css.mjs
npm test
node src/catalog/query.mjs "avanzar diapositiva" --status candidate
```

## Ejecución de Storybook (requiere instalar dependencias)

```bash
npm install
npm run typecheck
npm run storybook
```

La inclusión en `registry.json` ejemplifica el contrato de instalación: `homepage`
es una URL ficticia y el proyecto no se ha publicado. Antes de distribuirlo,
revisar los derechos de marca FALP y verificar el item con el CLI oficial.

El concepto de sitio independiente se encuentra en `site-concept.html`.

La maqueta `site-concept.html` es un archivo autónomo que usa JavaScript nativo.
Puedes abrirla en el navegador sin instalar dependencias.

`AGENTS.md` documenta cómo descubrir, consumir y comprobar los artefactos sin confundir estados `candidate` y `verified`.

## REA Atlas · adaptación visual Pier Gorelli

`site-concept.html` es la versión independiente de la maqueta, reconstruida con la
composición, tipografía y tokens de movimiento del sitio de referencia (sin copiar su
contenido ni sus assets). `site-concept-before-pier-gorelli.html` conserva la versión
anterior. Las capturas de escritorio y móvil se encuentran en este directorio.

Funciones comprobadas en el navegador: navegación de muestras, filtros y búsqueda,
inspector, alternancia light/dark, acentos, retícula y paleta de comandos (⌘/Ctrl+K).

### Verificar el HTML

```bash
python tests/test_site_preview.py
python tests/test_site_behavior.py
```

Leer [FIDELITY.md](FIDELITY.md) para la matriz de cambios, evidencia y límites.
**No se certificó comparación de píxeles 1:1 con captura equivalente del original.**

## REA Atlas v3: diff 1:1 por propiedades y comportamiento

Se realizó una tercera iteración a partir de las reglas CSS/JS públicas observables de
[referencia Pier Gorelli](https://piergorelli.com/). Antes de actualizar, se guardó la
versión v2 en `site-concept-v2-before-diff.html`. Se mantienen los contenidos y
funciones propias de REA Atlas.

Cambios principales: overlay de medidas animadas, tipografía CSS Geist variable,
WebGL2 de terreno topográfico con fallback Canvas 2D, cursor técnico/magnético,
preloader, progreso numérico, scrub del manifiesto y showcase sticky de altura
`calc(100svh - 88px)` en desktop. Los token de color/movimiento reflejan los
observados; la reconstrucción no reutiliza código fuente propietario.

Detalles y límites: [DIFF-1VS1.md](DIFF-1VS1.md). La coincidencia por medidas
no equivale a identidad de píxeles o frames. Un navegador sin Internet mostrará
fuentes de fallback (la familia Geist se solicita desde Google Fonts).

```bash
python tests/test_fidelity_v3.py
```

Salida: `REFERENCE-METRICS.json`, `QA-V3.json`, capturas finales de hero,
showcase y móvil. Las migraciones bajo `scripts/` son de un solo uso y se
niegan a ejecutarse sobre un HTML ya actualizado.


### Ajuste v4 — cursor del sistema

Por solicitud de diseño, REA Atlas utiliza el puntero normal del navegador. Se retiraron el cursor técnico (crucetas, coordenadas y cuadrado azul) y los recuadros/reglas azules de medición que aparecían en la portada. Se mantienen las transiciones, el terreno interactivo, la retícula manual opcional (Alt+G) y el hover suave de los controles. La comparación con el original queda deliberadamente divergente en estos dos elementos.

Para verificar: `python tests/test_fidelity_v4.py` y `python tests/test_site_behavior.py`.
