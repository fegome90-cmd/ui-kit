import { Suspense } from "react";
import { Explorer } from "@/components/docs/explorer";

export const metadata = { title: "Explorar — UI Kit" };

// El explorador lee los filtros con useSearchParams: va dentro de <Suspense> para que el resto de la página se
// prerenderice (con cacheComponents, leerlos fuera bloquearía el prerender).
export default function ExplorarPage() {
  return (
    <article className="cb-article cb-article-wide">
      <p className="cb-eyebrow">Banco de componentes</p>
      <h1>Explorar</h1>
      <p className="cb-lead">
        Busca y filtra los componentes por grupo, familia y estado. Los filtros quedan en la dirección: la vista se
        puede compartir.
      </p>
      <Suspense fallback={<p className="cb-lead">Cargando filtros…</p>}>
        <Explorer />
      </Suspense>
    </article>
  );
}
