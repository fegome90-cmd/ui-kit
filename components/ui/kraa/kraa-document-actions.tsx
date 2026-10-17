"use client";
import * as Menu from "@radix-ui/react-dropdown-menu";
import { KraaButton } from "@/components/ui/kraa/kraa-button";
import { useKraaTheme } from "@/components/ui/kraa/kraa-theme";
export type KraaDocumentActionsProps = {
  favorite?: boolean;
  onFavoriteChange?: (favorite: boolean) => void;
  onSettings?: () => void;
  onDelete?: () => void;
};
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
        <Menu.Content
          className="kraa-theme kraa-actions-menu"
          data-kraa-theme={theme}
          sideOffset={8}
          align="end"
          aria-label="Acciones del documento"
        >
          <Menu.Group>
            <Menu.Item className="kraa-menu-item" disabled={!onSettings} onSelect={onSettings}>
              Ajustes del documento
            </Menu.Item>
            <Menu.CheckboxItem
              className="kraa-menu-item"
              checked={favorite}
              disabled={!onFavoriteChange}
              onCheckedChange={(v) => onFavoriteChange?.(v === true)}
            >
              Favorito <Menu.ItemIndicator>✓</Menu.ItemIndicator>
            </Menu.CheckboxItem>
          </Menu.Group>
          <Menu.Separator className="kraa-separator" />
          <Menu.Item className="kraa-menu-item" data-destructive disabled={!onDelete} onSelect={onDelete}>
            Eliminar
          </Menu.Item>
        </Menu.Content>
      </Menu.Portal>
    </Menu.Root>
  );
}
