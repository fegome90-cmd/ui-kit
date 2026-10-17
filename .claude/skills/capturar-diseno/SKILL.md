---
name: capturar-diseno
description: Captura evidencia de una fuente de diseño autorizada (URL, imagen o repo) antes de implementar un componente en ui-kit. Verifica acceso y licencia, saca capturas con Playwright a 1440×900 y 390×844 por estado observado, guarda hashes SHA-256 y arma un inventario de candidatos con su procedencia y su estado. Úsala antes de portar o reconstruir un componente o bloque desde una página, una captura o un repo ajeno; después sigue con registrar-componente.
---

# Capturar un diseño antes de implementarlo

Adapta las compuertas G0–G2 de `docs/origen/rea-atlas/design-to-registry-workflow/SKILL.md` a lo que este repo
tiene de verdad. Ese documento cita `scripts/capture.py` y `scripts/visual_diff.py`: **no existen aquí**. No los
llames ni los cites como si existieran. La captura se hace con `scripts/capturar.mjs`, sobre el Playwright ya
instalado; sus reglas (viewports, nombres, detección de login) están en `lib/captura.ts` y tienen tests.

El objetivo no es copiar una página, sino dejar evidencia rastreable para decidir qué componentes existen, con
qué `provenance` y con qué `status`. Lo que no se pudo medir se declara como no medido.

## Entradas

Antes de empezar, ten claro (y si falta algo, pregúntale al usuario):

- **Fuente**: `url`, `image` (ruta local) o `repo` (URL más commit o tag).
- **Autorización**: quién autoriza el uso y para qué. Para páginas privadas, la sesión es del usuario y local.
- **Alcance**: qué rutas, vistas y estados captura. No captures más de lo autorizado.
- **Familia destino**: REMI, Ninja, Kraa o REA, o una nueva (eso lo decide el usuario).

## Dónde va la evidencia

Todo va en `evidencia/` en la raíz del repo, que está en `.gitignore`. Nunca se versiona: puede contener material
de terceros sin licencia de redistribución.

```text
evidencia/<AAAA-MM-DD>-<fuente>/
  evidence.json          # fuentes, autorización, licencia, fecha, estado y una entrada por captura
  captures/<vista>--<estado>--<ancho>x<alto>.png
  dom/<vista>--<estado>--<ancho>x<alto>.json   # solo con --dom (URL autorizada)
  dom/<vista>--tipografias.json                # siempre con --url
  SHA256SUMS             # salida de shasum -a 256 sobre captures/ y dom/
  inventario.md          # el inventario de G2
```

`<fuente>` es un slug corto (`atlas-home`, `kraa-figma-export`). La fecha es la de la captura, en
`America/Santiago`.

## G0 — Acceso y licencia

1. Anota en `evidence.json` la fuente (`fuentes`: `kind` y `uri`, con el commit si es un repo), la fecha, quién
   autorizó (`autoriza`) y si hubo sesión iniciada. Separa contenido actual de caché histórica o plantillas
   derivadas. El script completa `fuentes`, `fecha` y, con `--autoriza`, `autoriza`.
2. **Detente** si la URL responde 401 o 403, redirige a un login o muestra un muro de acceso («Log in to
   access», «Continue with …», SSO). Marca la fuente como `blocked-auth` en `evidence.json` y avísale al usuario.
   No intentes rodearlo.
3. **Nunca extraigas credenciales.** No leas, copies ni guardes cookies, tokens, headers de autorización,
   `localStorage` de sesión ni campos de formularios de login. No uses `cookie-list`, `cookie-get` ni
   `state-save` de playwright-cli con una fuente ajena. Si el usuario ya tiene una sesión abierta, la usa él; tú
   no la exportas.
4. Verifica la licencia: repo con `LICENSE`, términos del sitio o permiso explícito del dueño. Si no está clara,
   pregunta antes de seguir. Anota la licencia (o «sin licencia, solo referencia») en `evidence.json`.
   La licencia responde **dos preguntas distintas**; no las mezcles:
   - **¿Se puede estudiar?** El banco es personal y de estudio (lo dice el README). Una licencia de uso personal,
     de prueba (*free to try*) o «solo referencia» alcanza para capturar y analizar: la evidencia queda en
     `evidencia/`, fuera de git. Esto es lo que decide si hay G1.
   - **¿Se puede versionar?** El repo es público en GitHub: todo lo que se commitea se redistribuye. Código,
     assets o archivos de fuente entran solo si la licencia permite redistribuir (MIT, OFL…). Si no, se estudian
     pero no se commitean, y en el banco se usa una alternativa libre (como Aeonik en el README).

   Las **tipografías tienen licencia propia**, distinta de la del sitio: después de G1, completa `licencia` en
   cada familia de `evidence.json` → `tipografias` (OFL, comercial, trial personal, del sistema…) y aplica las
   mismas dos preguntas.
5. **Plantillas compradas.** Una plantilla de marketplace (temas de WordPress, Webflow, Framer, kits de UI…) se
   compra para usarla, no para redistribuirla: sus licencias suelen cubrir un producto final. Este banco publica
   un registry que cualquiera instala, así que redistribuye. Lee la licencia concreta de la plantilla; si no
   permite redistribuir, sirve solo como referencia (`inferred`, reconstruido sin copiar su código ni sus assets) o
   no entra.
6. **Galerías de inspiración.** Awwwards, One Page Love, Muzli, Dribbble, Pinterest y similares muestran sitios
   ajenos: no autorizan nada. El permiso es del dueño del sitio original. Si solo tienes la galería, la fuente es
   `observed-image` o `inferred` y la autorización queda pendiente; anótalo en `autoriza`.
7. Si la familia tiene un sistema canónico (tokens o manual de marca), léelo primero. Una captura no redefine
   tokens: a lo sumo propone uno nuevo, que el usuario aprueba.

Si no se puede ni estudiar (acceso bloqueado o licencia que prohíbe incluso el uso personal), no hay G1. Si se
puede estudiar pero no versionar, G1 sigue y la restricción se anota en el inventario.

## G1 — Capturar

Herramienta: `scripts/capturar.mjs` (Node más `@playwright/test`, que ya está en `devDependencies`; los
navegadores se instalan una vez con `npx playwright install chromium`). Para lo que el script no cubre, la skill
`playwright-cli`, si está instalada (no está versionada en este repo). No agregues dependencias para esto.

1. Dos viewports, siempre los mismos: **1440×900** (escritorio) y **390×844** (móvil), con DPR 1. El script los
   toma de `VIEWPORTS` en `lib/captura.ts`.
2. **Una captura por estado observado**: reposo, `hover`, `focus-visible`, `active`/`selected`, `disabled`,
   abierto (menús, diálogos), y claro/oscuro si la fuente los tiene. Solo los estados que la fuente muestra de
   verdad; no fuerces estados que no existen.
3. **URL autorizada**, una corrida por ruta (la misma `--fuente` el mismo día suma vistas a la corrida):

   ```bash
   node scripts/capturar.mjs --fuente atlas --url https://… --vista home \
     --estado hover=hover:.btn-primary --estado foco=focus:.btn-primary --estado abierto=click:"[aria-haspopup]" \
     --dom ".btn-primary, .card" --autoriza "quién y para qué" --licencia "MIT"
   ```

   - `--estado nombre=accion:selector` con `accion` en `hover`, `focus` o `click`. Por cada viewport y estado
     recarga la página, provoca el estado y captura. El reposo siempre se captura. Si el elemento está animado
     en bucle y Playwright no lo ve estable en 5 s, la acción se fuerza y la captura queda con
     `accionForzada: true`: revisa esa imagen antes de usarla como evidencia del estado.
   - `--dom <selector>` guarda bounds y estilos computados de los elementos visibles que matchean, más las
     variables CSS de `:root`. No guarda valores de formularios. Además de color, tipografía, radio, padding y
     sombra, mide:
     - **énfasis**: `opacity`, para la jerarquía por opacidad (un titular al 100 %, el texto de apoyo al 70–80 %,
       las notas al 50–60 %). El alfa de `color` también cuenta;
     - **profundidad**: `background-image` (texturas, degradados), `backdrop-filter` (vidrio esmerilado) y
       `filter`;
     - **movimiento declarado**: `transition` y `animation`. Es lo que el CSS declara, no lo que se vio: las
       capturas van con animaciones desactivadas, y cada captura de URL lo deja en `desconocido`. Si el movimiento
       importa para el componente, descríbelo como no observado en el inventario.

     Los valores largos se recortan y los `url(...)` quedan sin query; un `data:` embebido solo se nombra.
   - **Tipografías**, siempre (en reposo, en ambos viewports): familias cargadas (`document.fonts`, con pesos y
     estilos), archivos de las reglas `@font-face` y familias que usa el texto visible. Van a
     `dom/<vista>--tipografias.json` y, sumadas entre vistas, a `evidence.json` → `tipografias`, cada una con
     `licencia: null` para completar en G0. Las URL quedan sin query ni hash (pueden llevar tokens firmados) y
     las fuentes embebidas (`data:`) solo se nombran. Las familias genéricas (`sans-serif`, `system-ui`…) se
     omiten; una familia `usada` pero no `cargada` es una fuente del sistema de quien capturó, no de la marca.
     Cada familia trae sus `roles` según la etiqueta del texto (`titular`: `h1–h6`; `cuerpo`: `p`, `li`…;
     `interfaz`: `button`, `a`, `input`, `label`…; `otro`: `span`, `div` y lo ambiguo), y `evidence.json` →
     `rolesTipograficos` resume qué familias cubre cada rol. Un rol vacío usa una genérica o del sistema.
     Además, `archivosDeFuentes` lista toda fuente que la página pidió por red, sin query: cubre las
     `@font-face` de hojas de otro origen (que el navegador no deja leer, y por eso el script avisa) y las que el
     sitio baja con `fetch` y registra con la API `FontFace`. Un archivo en esa lista sin familia en `archivos`
     viene de una de esas dos vías.
   - `--pagina-completa` captura la página entera en vez del viewport. Antes recorre la página con scroll para que
     aparezca lo que se revela al entrar en pantalla.
   - `--tramos <n>` (de 1 a 40, no se combina con `--pagina-completa`) captura el viewport `n` veces bajando con la
     rueda del mouse. Es la opción para *scrollytelling* y secciones fijadas, donde lo que se ve depende de la
     posición de scroll y una captura de página completa sale casi vacía. Los archivos quedan como
     `<vista>--reposo-t01--…`, y cada captura lleva su `tramo`. Si los últimos tramos son idénticos, la página
     terminó antes.
   - `--esperar <selector>` espera hasta 20 s a que un elemento sea visible: para pantallas de carga y portales que
     montan el contenido tarde. Acepta selectores de Playwright (`"text=Explore the data"`). Si no aparece, la
     corrida queda `incompleta`.
   - `--ocultar <selector>` (repetible) esconde por CSS lo que tapa la captura: banners de cookies, chats. **No hace
     clic**: no acepta ni rechaza nada. Cada captura lo deja en `ocultos`.
   - Sale con **2** y marca `blocked-auth` si G0 falla (401/403, redirección a login o campo de contraseña
     visible): no captura nada. Usa un navegador sin sesión; nunca toca la del usuario.
   - Sale con **1** si un selector de `--estado` no existe: lo ya capturado queda registrado y la corrida queda
     marcada `incompleta`.
4. **Imagen sin DOM**: `node scripts/capturar.mjs --fuente <slug> --vista <vista> --imagen <ruta>`. Copia el
   original sin recomprimir y marca en la captura que DOM, tamaños CSS, responsive, foco e interacciones son
   **desconocidos**.
5. **Repo**: anota a mano en `evidence.json` el commit exacto y las rutas de los archivos fuente. Si además
   corres el proyecto para capturarlo, aplica el punto 3 sobre esa instancia local.
6. El script escribe `SHA256SUMS` (formato de `shasum -a 256`) y cada captura lleva su `sha256`, su `fuente`, su
   viewport y su fecha en `evidence.json`. Verifica con:

   ```bash
   cd evidencia/<run> && shasum -a 256 -c SHA256SUMS
   ```

   Las medidas son observaciones de esa captura, no verdades del sistema.

Estados que no se provocan con un hover, focus o click (por ejemplo `disabled` que depende de datos, o tema
oscuro con un toggle de varios pasos): captúralos con playwright-cli (`resize`, `screenshot --filename=…`) con el
mismo nombre de archivo. Agrega cada captura a `evidence.json` con `fuente`, `viewport`, `fecha` y `sha256`, y
corre `shasum -a 256 captures/* dom/* > SHA256SUMS` al terminar. Sin playwright-cli,
esos estados quedan como «no observado» en el inventario.

## G2 — Inventario de candidatos

Escribe `inventario.md` en dos partes: una lectura del diseño y la tabla de candidatos.

### Lectura del diseño

Antes de listar componentes, anota qué decisiones de diseño ves y **por qué** crees que se tomaron, cada una con
su evidencia (archivo de `captures/` o `dom/`). Sin el porqué, la lista no sirve para decidir tokens. Cubre:

- **Tipografía por rol**: sale de `rolesTipograficos` en `evidence.json`. Cuál es la familia de los titulares (la
  que define el carácter de la página), cuál acompaña en el cuerpo y en la interfaz, y si son de la misma familia
  o un contraste buscado.
- **Paleta y proporción**: colores de fondo, de marca y de acento, con su peso aproximado en la página. La regla
  60-30-10 (neutros, marca, acento) es una referencia para describir, no una norma que imponer. Anota si un color
  está reservado para algo (por ejemplo, solo para acciones).
- **Jerarquía**: cómo se distingue lo importante. Tamaño, peso y, si `--dom` lo midió, `opacity` o alfa del
  color (titular al 100 %, apoyo al 70–80 %, notas al 50–60 %).
- **Espaciado**: padding de botones y tarjetas, separación entre secciones, si sigue una escala.
- **Profundidad y movimiento**: texturas, vidrio, sombras en capas (`background-image`, `backdrop-filter`,
  `box-shadow`); `transition` y `animation` declaradas. El movimiento va siempre como **declarado, no observado**.

Lo que no tenga evidencia va como inferido o no va.

### Candidatos

Agrupa por semántica y repetición: no inventes componentes para rellenar. Antes de crear una fila:

- **Un motivo repetido no es un componente.** Curvas, degradados, texturas, sombras o formas que reaparecen en
  distintas piezas son tokens (variables de la familia) o utilidades (`@utility` en el CSS de la familia). Anótalo
  en *Tokens* de las filas que lo usan.
- **El elemento central de la página es un bloque.** El hero, la ilustración o el titular que domina la vista va
  como `bloque` en `components/blocks/`. Si contiene piezas reutilizables, esas sí son primitivos aparte.
- **Una sola aparición no justifica un primitivo.** Si algo aparece una vez y no tiene variantes, es parte del
  bloque que lo contiene.

| Campo | Contenido |
|---|---|
| `id` | El `slug` que tendría en `lib/component-registry.ts` (con prefijo de familia salvo REMI). |
| Nivel | `primitivo` → `components/ui/<familia>/`, item `registry:ui`. `compuesto` (varias primitivas con API propia, reutilizable) → `components/ui/<familia>/`, item `registry:ui`. `bloque` (sección o página) → `components/blocks/<familia>/`, item `registry:block`. |
| Evidencia | Capturas y DOM que lo respaldan (nombres de archivo de `captures/` y `dom/`). |
| Estados vistos | Los que tienen captura. Los demás van como «no observado». |
| `provenance` | Uno de los valores de `PROVENANCES` en `lib/component-registry.ts`. |
| `status` | `stable` o `candidate` (`STATUSES`). |
| Props propuestas | Variantes y tamaños observados; marca cuáles son inferidos. |
| Tokens | Tokens de la familia que usa; colores y tipografías nuevas quedan pendientes de aprobación (y de licencia, las tipografías). |

Cómo elegir `provenance` (la misma tabla que usa `registrar-componente`):

| Evidencia que tienes | `provenance` | `status` |
|---|---|---|
| Código del origen (repo, paquete, HTML de referencia) | `source-code` | `stable` solo si además está verificado; si no, `candidate` |
| Estilos computados del DOM de una URL autorizada | `measured-dom` | `candidate` hasta tener QA visual |
| Solo capturas o imágenes | `observed-image` | siempre `candidate` (un test lo exige) |
| Nada directo; se completa por analogía | `inferred` | siempre `candidate` (un test lo exige) |

Para cada `candidate`, anota qué le falta para pasar a `stable` (QA visual, derechos, estados no observados):
eso va después a `notes` en el registro, y hay un test que lo exige.

No declares fidelidad 1:1. En este repo no hay comparación visual automatizada (G4 del documento REA no está
implementado), así que lo capturado aquí nunca justifica por sí solo `stable`.

## Entrega

- Dale al usuario la ruta de `evidencia/<run>/`, el resumen del inventario y lo que quedó bloqueado o no
  observado, incluidas las tipografías que siguen con `licencia: null`.
- Para implementar y registrar cada candidato, sigue `.claude/skills/registrar-componente/SKILL.md`, usando el
  `provenance`, el `status` y las notas del inventario.
- No hay nada que commitear de esta etapa: la evidencia está fuera de git.
