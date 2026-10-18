import type { Metadata } from "next";
import { ComponentPalette } from "@/components/docs/component-palette";
import { DocsNav } from "@/components/docs/docs-nav";
import "./componentes.css";

export const metadata: Metadata = { title: "Componentes — UI Kit" };

export default function ComponentesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="cb-shell">
      <aside className="cb-sidebar">
        <ComponentPalette />
        <DocsNav />
      </aside>
      <main className="cb-main">{children}</main>
    </div>
  );
}
