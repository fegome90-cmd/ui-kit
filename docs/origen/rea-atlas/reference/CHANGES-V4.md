# REA Atlas v4 — Puntero nativo y portada limpia

**Cambio solicitado:** retirar el puntero de medición con cruceta/regla y cuadros azules.

## Cambios

- Eliminado del HTML el overlay `#technicalCursor`, incluyendo líneas horizontal/vertical, cuadro azul, círculo y coordenadas.
- Restaurado el puntero normal del navegador (se eliminó la regla `cursor: none`).
- Eliminado el overlay inicial `#blueprint`, con recuadros, etiquetas, guías y animación de entrada de mediciones.
- Conservados: movimiento topográfico del fondo, preloader, animación de titulares, scroll, catálogo, búsqueda, inspector, temas, comandos, retícula opcional y la respuesta magnética de los botones.
- Conservada copia previa `site-concept-v3-before-cursor-removal.html` para revertir.

## Verificación

- `node --check tests/site-script.generated.mjs`: PASS
- `npm test`: 9/9 PASS
- `python tests/test_site_behavior.py`: PASS
- `python tests/test_site_preview.py`: PASS
- `python tests/test_fidelity_v4.py`: 41/41 PASS (paridad geométrica + desviaciones intencionales).

La retícula que se activa manualmente con `Alt+G` permanece porque es una herramienta de visualización opcional, distinta del cursor técnico. El efecto de terreno responde al movimiento del ratón, pero no dibuja una regla ni sustituye al puntero.
