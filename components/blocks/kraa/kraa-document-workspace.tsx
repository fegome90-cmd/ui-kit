"use client";
import * as Dialog from "@radix-ui/react-dialog";
import * as React from "react";
import { KraaDocumentSidebar, type KraaDocumentSidebarProps } from "@/components/blocks/kraa/kraa-document-sidebar";
import { KraaButton } from "@/components/ui/kraa/kraa-button";
import { useKraaTheme } from "@/components/ui/kraa/kraa-theme";
export type KraaDocumentWorkspaceProps = KraaDocumentSidebarProps & { children: React.ReactNode };
export function KraaDocumentWorkspace({ children, ...sidebar }: KraaDocumentWorkspaceProps) {
  const [mobileOpen, setMobileOpen] = React.useState(false),
    theme = useKraaTheme();
  return (
    <div className="kraa-workspace">
      <div className="kraa-workspace-desktop">
        <KraaDocumentSidebar {...sidebar} />
      </div>
      <div className="kraa-workspace-mobile">
        <Dialog.Root open={mobileOpen} onOpenChange={setMobileOpen}>
          <Dialog.Trigger asChild>
            <KraaButton variant="surface">☰ Documentos</KraaButton>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="kraa-sheet-backdrop" />
            <Dialog.Content className="kraa-theme kraa-sheet" data-kraa-theme={theme} aria-describedby={undefined}>
              <Dialog.Title className="kraa-sr">Documentos</Dialog.Title>
              <Dialog.Close asChild>
                <KraaButton aria-label="Cerrar documentos">Cerrar ×</KraaButton>
              </Dialog.Close>
              <KraaDocumentSidebar
                {...sidebar}
                collapsible={false}
                onSelect={(id) => {
                  sidebar.onSelect(id);
                  setMobileOpen(false);
                }}
              />
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
      <main className="kraa-workspace-main">{children}</main>
    </div>
  );
}
