# REA Atlas · estado de fidelidad v3 (16-10-2026)

**Referencia seleccionada:** [Pier Gorelli](https://piergorelli.com/) · **Implementación:** `site-concept.html` · **Detalle técnico:** [DIFF-1VS1.md](DIFF-1VS1.md).

La auditoría está construida a partir del HTML, CSS y JavaScript visibles de la referencia; se ha comparado su retícula, escala, paleta, proporciones, transiciones y los disparadores principales frente al HTML de REA Atlas. La versión previa se conserva como `site-concept-v2-before-diff.html`.

### Confirmado

- Coincidencia numérica de las **propiedades CSS del color, la escala, la distribución básica, las duraciones tokenizadas y las curvas CSS** según los archivos fuente inspeccionados.
- Header **72px**, hero **100svh**, gutter **31.68px a 1440px**, titulares CSS **177.6px y 70.08px**, showcase fijado **812px a 900px de alto**, retícula **12/4 columnas**.
- Preloader sin planos de medición; cursor normal del sistema (sin crucetas ni coordenadas); hover magnético en botones, progreso de scroll, manifiesto con revelado progresivo y showcase con desplazamiento y selección interactiva. El puntero técnico y los recuadros azules iniciales se retiraron expresamente a petición del usuario.
- WebGL2 implementado de manera independiente, con Canvas 2D para entornos sin aceleración gráfica; respeta movimiento reducido.
- Funciones preservadas: filtros, búsqueda, colecciones, botones y navegación de muestras, inspector, paleta `⌘K`, retícula `⌥G`, tema y acentos.
- **9/9 pruebas Node**, navegación/funciones móviles aprobadas y **40/40 comprobaciones Playwright**. No hay desborde entre **320 y 1920px**.

### Pendiente / no afirmar

- **No se ha certificado paridad píxel a píxel**: no fue posible guardar capturas temporales equivalentes del original en el mismo entorno para calcular un *image diff* real.
- En el navegador de pruebas aislado **no cargaron las fuentes Geist externas**. La familia se referencia correctamente en CSS, pero el raster final no se puede afirmar idéntico. Los HTML no contienen archivos de fuentes.
- GSAP, ScrollTrigger, Lenis, WebGL y el shader del autor no se copiaron ni reutilizaron. Los efectos se recrearon de forma independiente, por lo que el recorrido de fotogramas y la interpolación completa son aproximados.
- La librería FALP continúa siendo un ejemplo `candidate`: no se ha certificado la fidelidad de sus componentes a un sitio institucional autenticado.
- No se ha publicado el HTML, el registry ni un nuevo sitio. No hubo PR, merge ni deploy.

### Reproducción

```bash
npm test
python tests/test_site_preview.py
python tests/test_site_behavior.py
python tests/test_fidelity_v3.py
```

La matriz fuente → versión anterior → versión actual está en **[DIFF-1VS1.md](DIFF-1VS1.md)**. Las medidas brutas están en `REFERENCE-METRICS.json` y `QA-V3.json`. El protocolo para lograr una comparación fotograma a fotograma está descrito en la sección de pendientes de ese archivo.

### Ajuste por preferencia del usuario (v4)

**Cursor y reglas de medición eliminados:** no se oculta el puntero del sistema, no existe overlay que lo persiga y ya no aparecen los cuadros azules de medición en la entrada. La función de terreno interactivo y las animaciones normales del catálogo continúan.
