"use client";
import * as Menu from "@radix-ui/react-dropdown-menu";
import { KraaButton } from "@/components/ui/kraa/kraa-button";
import { useKraaTheme } from "@/components/ui/kraa/kraa-theme";
import { cn } from "@/lib/utils";

export type KraaDocumentActionsProps = {
  favorite?: boolean;
  onFavoriteChange?: (favorite: boolean) => void;
  onSettings?: () => void;
  onDelete?: () => void;
};
const ITEM =
  "flex cursor-default justify-between gap-4 rounded-[8px] px-3 py-2 text-sm text-kraa-muted outline-none transition-colors duration-150 data-disabled:pointer-events-none data-disabled:opacity-40 data-highlighted:bg-kraa-surface-active data-highlighted:text-kraa-fg";
export function KraaDocumentActions({
  favorite = false,
  onFavoriteChange,
  onSettings,
  onDelete,
}: KraaDocumentActionsProps) {
  const theme = useKraaTheme();
  return (
    <Menu.Root>
      <Menu.Trigger asChild>
        <KraaButton size="icon" aria-label="Acciones del documento">
          •••
        </KraaButton>
      </Menu.Trigger>
      <Menu.Portal>
        {/* El portal sale del árbol del proveedor: replica .kraa-theme con el tema actual. */}
        <Menu.Content
          className="kraa-theme isolate min-w-[220px] animate-kraa-popup rounded-[16px] border border-kraa-border bg-kraa-glass p-2 shadow-kraa backdrop-blur-[80px]"
          data-kraa-theme={theme}
          sideOffset={8}
          align="end"
          aria-label="Acciones del documento"
        >
          <Menu.Group>
            <Menu.Item className={ITEM} disabled={!onSettings} onSelect={onSettings}>
              Ajustes del documento
            </Menu.Item>
            <Menu.CheckboxItem
              className={ITEM}
              checked={favorite}
              disabled={!onFavoriteChange}
              onCheckedChange={(v) => onFavoriteChange?.(v === true)}
            >
              Favorito <Menu.ItemIndicator>✓</Menu.ItemIndicator>
            </Menu.CheckboxItem>
          </Menu.Group>
          <Menu.Separator className="my-1.5 h-px bg-kraa-border" />
          <Menu.Item className={cn(ITEM, "text-kraa-danger")} disabled={!onDelete} onSelect={onDelete}>
            Eliminar
          </Menu.Item>
        </Menu.Content>
      </Menu.Portal>
    </Menu.Root>
  );
}
