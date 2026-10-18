import Link from "next/link";
import { Thumb } from "@/components/docs/previews";
import { type ComponentDoc, statusOf } from "@/lib/component-registry";

/** Tarjeta de un componente en el índice y el explorador: miniatura, nombre, descripción, familia y estado. */
export function ComponentCard({ c }: { c: ComponentDoc }) {
  return (
    <Link href={`/componentes/${c.slug}`} className="cb-card" data-family={c.family}>
      <div className="cb-card-thumb">
        <Thumb slug={c.slug} />
      </div>
      <div className="cb-card-body">
        <strong>{c.name}</strong>
        <span>{c.description}</span>
        <em className="cb-tag">
          {c.family}
          {statusOf(c) === "candidate" && " · candidato"}
        </em>
      </div>
    </Link>
  );
}
