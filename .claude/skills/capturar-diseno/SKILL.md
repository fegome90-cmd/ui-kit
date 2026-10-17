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

1. Anota en `evidence.json`: `source.kind`, `source.uri` (URL, ruta o repo más commit), fecha de captura, quién
   autorizó y si hubo sesión iniciada. Separa contenido actual de caché histórica o plantillas derivadas.
2. **Detente** si la URL responde 401 o 403, redirige a un login o muestra un muro de acceso («Log in to
   access», «Continue with …», SSO). Marca la fuente como `blocked-auth` en `evidence.json` y avísale al usuario.
   No intentes rodearlo.
3. **Nunca extraigas credenciales.** No leas, copies ni guardes cookies, tokens, headers de autorización,
   `localStorage` de sesión ni campos de formularios de login. No uses `cookie-list`, `cookie-get` ni
   `state-save` de playwright-cli con una fuente ajena. Si el usuario ya tiene una sesión abierta, la usa él; tú
   no la exportas.
4. Verifica la licencia: repo con `LICENSE`, términos del sitio o permiso explícito del dueño. Si no está clara,
   pregunta antes de seguir. Anota la licencia (o «sin licencia, solo referencia») en `evidence.json`.
   Las **tipografías tienen licencia propia**, distinta de la del sitio: después de G1, completa `licencia` en
   cada familia de `evidence.json` → `tipografias` (OFL, comercial, del sistema…). Una familia sin licencia de
   redistribución no entra al banco: se reemplaza por una libre equivalente y se anota en el inventario.
5. Si la familia tiene un sistema canónico (tokens o manual de marca), léelo primero. Una captura no redefine
   tokens: a lo sumo propone uno nuevo, que el usuario aprueba.

Si G0 no pasa, no hay G1.

## G1 — Capturar

Herramienta: `scripts/capturar.mjs` (Node más `@playwright/test`, que ya está en `devDependencies`; los
navegadores se instalan una vez con `npx playwright install chromium`). Para lo que el script no cubre, la skill
`playwright-cli` (`.claude/skills/playwright-cli`). No agregues dependencias para esto.

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
     recarga la página, provoca el estado y captura. El reposo siempre se captura.
   - `--dom <selector>` guarda bounds y estilos computados (color, tipografía, radio, padding, sombra…) de los
     elementos visibles que matchean, más las variables CSS de `:root`. No guarda valores de formularios.
   - **Tipografías**, siempre (en reposo, en ambos viewports): familias cargadas (`document.fonts`, con pesos y
     estilos), archivos de las reglas `@font-face` y familias que usa el texto visible. Van a
     `dom/<vista>--tipografias.json` y, sumadas entre vistas, a `evidence.json` → `tipografias`, cada una con
     `licencia: null` para completar en G0. Las URL quedan sin query ni hash (pueden llevar tokens firmados) y
     las fuentes embebidas (`data:`) solo se nombran. Las familias genéricas (`sans-serif`, `system-ui`…) se
     omiten; una familia `usada` pero no `cargada` es una fuente del sistema de quien capturó, no de la marca.
     Si avisa de hojas de otro origen ilegibles (CSS sin CORS), los `@font-face` de esas hojas faltan: revisa
     sus archivos en la pestaña de red con playwright-cli.
   - `--pagina-completa` captura la página entera en vez del viewport.
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
mismo nombre de archivo, y corre `shasum -a 256 captures/* dom/* > SHA256SUMS` al terminar.

## G2 — Inventario de candidatos

Escribe `inventario.md` con una tabla. Agrupa por semántica y repetición: no inventes componentes para rellenar.

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
