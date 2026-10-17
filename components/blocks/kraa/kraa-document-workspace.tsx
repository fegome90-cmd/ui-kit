"use client";
import * as Dialog from "@radix-ui/react-dialog";
import * as React from "react";
import { KraaDocumentSidebar, type KraaDocumentSidebarProps } from "@/components/blocks/kraa/kraa-document-sidebar";
import { KraaButton } from "@/components/ui/kraa/kraa-button";
import { useKraaTheme } from "@/components/ui/kraa/kraa-theme";

export type KraaDocumentWorkspaceProps = KraaDocumentSidebarProps & { children: React.ReactNode };
export function KraaDocumentWorkspace({ children, ...sidebar }: KraaDocumentWorkspaceProps) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const theme = useKraaTheme();
  return (
    <div
      data-slot="kraa-document-workspace"
      className="relative flex min-h-[520px] overflow-clip rounded-[24px] bg-kraa-bg max-[700px]:block"
    >
      <div className="shrink-0 border-r border-kraa-border max-[700px]:hidden">
        <KraaDocumentSidebar {...sidebar} />
      </div>
      <div className="hidden p-4 max-[700px]:block">
        <Dialog.Root open={mobileOpen} onOpenChange={setMobileOpen}>
          <Dialog.Trigger asChild>
            <KraaButton variant="surface">☰ Documentos</KraaButton>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 animate-kraa-popup bg-black/40" />
            {/* El portal sale del árbol del proveedor: replica .kraa-theme con el tema actual. */}
            <Dialog.Content
              className="kraa-theme fixed inset-y-0 left-0 w-[min(300px,90vw)] animate-kraa-sheet overflow-auto bg-kraa-bg p-4"
              data-kraa-theme={theme}
              aria-describedby={undefined}
            >
              <Dialog.Title className="sr-only">Documentos</Dialog.Title>
              <Dialog.Close asChild>
                <KraaButton aria-label="Cerrar documentos" className="ml-auto flex">
                  Cerrar ×
                </KraaButton>
              </Dialog.Close>
              <KraaDocumentSidebar
                {...sidebar}
                collapsible={false}
                className="w-full"
                onSelect={(id) => {
                  sidebar.onSelect(id);
                  setMobileOpen(false);
                }}
              />
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
