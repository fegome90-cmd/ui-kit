---
name: registrar-componente
description: Da de alta (o actualiza) un componente o bloque en el banco de ui-kit con sus tres piezas obligatorias (archivo en components/, entrada en lib/component-registry.ts con status y provenance, y vista previa más miniatura) y lo deja instalable por el registry shadcn. Úsala al agregar, portar o mover un componente de cualquier familia (REMI, Ninja, Kraa, REA, Lab) o al cambiar su madurez o su procedencia.
---

# Registrar un componente en el banco

El banco es la documentación viva: si falta una pieza, los tests fallan. Esta skill es el checklist para que
la entrada quede completa a la primera y con su madurez y su procedencia declaradas sin inflarlas.

## 0. Antes de escribir

- Lee el README (secciones *Convención* y *Agregar un componente*) y el código de un componente vecino de la misma
  familia. Imita su estilo: `cva`, `cn()`, `data-slot` en la raíz y exportaciones con nombre.
- Busca si ya existe algo parecido en `components/ui/<familia>/` o en `components/blocks/<familia>/`. Si existe,
  extiéndelo en lugar de duplicarlo.
- Decide la **procedencia** con evidencia, no por costumbre:

  | Valor | Cuándo |
  |---|---|
  | `source-code` (por defecto) | Copiado o reescrito desde código del origen (paquete, repo o HTML de referencia). |
  | `measured-dom` | Medido en el DOM de una página que el dueño autorizó. |
  | `observed-image` | Reconstruido desde capturas, sin DOM. Tamaños, responsive, foco e interacciones no están medidos. |
  | `inferred` | Sin evidencia directa. |

- Decide el **estado**. `stable` (por defecto) solo si el componente está verificado. Si tiene QA visual, derechos o
  comportamiento pendientes, usa `candidate`. Lo que sea `observed-image` o `inferred` es siempre `candidate`, y
  hay un test que lo exige.

Si la procedencia o los derechos no están claros, pregúntale al usuario antes de seguir: no los asumas.

## 1. El componente

- Va en `components/ui/<familia>/<nombre>.tsx` (primitivo) o en `components/blocks/<familia>/<nombre>.tsx`
  (composición).
- Usa los tokens de su familia. Ninja usa los tokens globales de shadcn; REMI, Kraa, REA y Lab usan sus tokens con
  prefijo o valores arbitrarios (`rounded-[0.75rem]`, `max-[960px]:`), nunca `rounded-xl`, `md:` ni `font-sans`.
- Si agregas un tamaño `--text-*` al tema, regístralo en `extendTailwindMerge` (`lib/utils.ts`). Si no,
  `tailwind-merge` lo descarta.
- Importa solo desde `@/…` o con rutas relativas. Todo archivo interno que importes debe estar publicado en algún
  item. Si no, `npm run registry` falla con «importa X, que no está publicado en ningún item».
- No metas lógica de negocio ni datos reales. Los datos de ejemplo van en `lib/demo/`.

## 2. La entrada del registro

En `lib/component-registry.ts`, dentro del bloque de su familia (los comentarios `// ---------- <Familia>`):

```ts
{
  slug: "rea-ejemplo",            // único; con prefijo de familia salvo en REMI
  family: "REA",
  name: "Ejemplo",                // en español; es el h1 de la página
  category: "Superficies",        // una de CATEGORIES: el TIPO de componente, que ordena el banco
  description: "Qué hace y en qué se distingue, en una o dos frases.",
  files: ["components/ui/rea/rea-ejemplo.tsx"],   // lo que muestra la pestaña Código y lo que instala shadcn
  usage: `<ReaEjemplo … />`,
  props: [{ name: "tone", type: '"muted" | "ink"', default: '"muted"', description: "…" }],
  // Solo si no es el valor por defecto:
  status: "candidate",
  provenance: "observed-image",
  notes: ["Qué falta para pasar a stable (QA visual, derechos, estados no observados…)."],
}
```

- `status` y `provenance` se omiten cuando valen `stable` y `source-code`. No los escribas solo para rellenar.
- Un `candidate` lleva en `notes` qué le falta. Hay un test que lo exige.
- `files` cita **todos** los módulos nuevos de `components/ui` y `components/blocks`. Un módulo que no aparece en
  ninguna entrada hace fallar el test.

## 3. Vista previa y miniatura

- REA va en `components/docs/previews-rea.tsx` (`REA_PREVIEWS` y `REA_THUMBS`) y Lab en
  `components/docs/previews-lab.tsx` (`LAB_PREVIEWS` y `LAB_THUMBS`). El resto va en
  `components/docs/previews.tsx` (`PREVIEWS` y `THUMBS`), bajo el comentario de su familia.
- La clave es el `slug`. `FamilyScope` ya envuelve en el contenedor de la familia (`.remi`, `KraaProvider`,
  `ReaProvider`, `.lab`), así que no lo repitas.
- La vista previa muestra cada variante o estado que declares. La miniatura es una sola instancia chica: va con
  `inert`, sin interacción.

## 4. Verificar

```bash
make check                   # Biome, tipos y tests (incluye registro, vistas previas y estado)
npm run registry             # genera registry.json y public/r; falla si un import no está publicado
npx shadcn registry validate
```

Revisa el item generado: en `registry.json`, `meta.status` y `meta.provenance` deben coincidir con la entrada,
y `dependencies` y `registryDependencies` deben salir de los imports reales.

**Contraste.** Revisa cada combinación de texto o ícono sobre su fondo, en todas las variantes y estados que
declaras (hover, foco, deshabilitado, claro y oscuro si aplica), contra WCAG AA: **4.5:1** para texto normal,
**3:1** para texto grande y para bordes, íconos e indicadores de foco. Un texto con `opacity` o con alfa en el
color pierde contraste: mídelo con el color resultante, no con el de la paleta. Si tienes disponible la skill
`design:accessibility-review` o `web-design-guidelines`, úsala para esto. Un componente que no cumple queda
`candidate` con una nota que diga qué combinación falla; no lo arregles cambiando colores de la familia sin
preguntar.

`make e2e` y `make ci` levantan el build. Córrelos solo si el usuario lo pide; si no, el pre-push los corre igual.

## 5. Cerrar

- Si el componente cambia algo de *Pendientes conocidos* o de la tabla de familias del README, actualízalo.
- Informa qué quedó como `candidate` y por qué. No digas que es fiel al original si no hubo una comparación visual
  directa.
- No hagas commit sin autorización del usuario. Cuando la haya, usa un commit atómico
  (`feat(<familia>): agrega <Componente>`) y agrega solo las rutas que tocaste.
