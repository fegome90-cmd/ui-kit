import * as PopoverPrimitive from "@radix-ui/react-popover";
import * as React from "react";
import { MenuToggle } from "@/components/ui/ninja/menu-toggle";
import { cn } from "@/lib/utils";

/**
 * Header sticky blanco con sombra suave.
 * Medidas del original (mobile-first): 60px de alto y 16px de padding;
 * ≥744px padding 32px; ≥1020px 64px de alto y aparecen los links de escritorio.
 */
function Navbar({ className, ...props }: React.ComponentProps<"header">) {
  return (
    <header
      data-slot="navbar"
      className={cn(
        "sticky top-0 z-40 flex h-[60px] items-center justify-between bg-card px-4 shadow-soft sm:px-8 md:h-16 md:px-14",
        className,
      )}
      {...props}
    />
  );
}

/** Links grandes de escritorio: ocultos bajo 1020px (pasan al menú) */
function NavbarLinks({ className, ...props }: React.ComponentProps<"nav">) {
  return <nav aria-label="Principal" className={cn("hidden items-center gap-8 md:flex", className)} {...props} />;
}

function NavbarLink({ className, active, ...props }: React.ComponentProps<"a"> & { active?: boolean }) {
  return (
    <a
      aria-current={active ? "page" : undefined}
      data-active={active || undefined}
      className={cn(
        "text-[24px] leading-[1.15] font-medium text-muted-foreground transition-colors duration-(--duration-color) ease-out-quart hover:text-foreground data-[active]:text-foreground",
        className,
      )}
      {...props}
    />
  );
}

/**
 * Menú del burger: tarjeta flotante (radio 32px, sombra suave, fade 200ms).
 * Ítems de 14px/500 con icono. Los marcados `mobileOnly` sólo se ven bajo 1020px.
 */
function NavbarMenu({ children, className }: { children: React.ReactNode; className?: string }) {
  const [open, setOpen] = React.useState(false);
  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger asChild>
        <MenuToggle open={open} />
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="end"
          sideOffset={12}
          collisionPadding={8}
          className={cn(
            "z-50 w-[min(350px,calc(100vw-16px))] rounded-xl bg-popover px-8 py-7 text-popover-foreground shadow-soft outline-none",
            "data-[state=open]:animate-menu-in data-[state=closed]:animate-menu-out",
            className,
          )}
        >
          <nav aria-label="Menú" className="flex flex-col gap-1">
            {children}
          </nav>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}

function NavbarMenuItem({
  className,
  icon,
  mobileOnly,
  children,
  ...props
}: React.ComponentProps<"a"> & { icon?: React.ReactNode; mobileOnly?: boolean }) {
  return (
    <a
      className={cn(
        "flex items-center gap-3 rounded-sm py-1.5 text-sm font-medium transition-opacity duration-(--duration-color) ease-out-quart outline-none hover:opacity-60 focus-visible:ring-[3px] focus-visible:ring-ring/40 [&_svg]:size-3.5",
        mobileOnly && "md:hidden",
        className,
      )}
      {...props}
    >
      {icon}
      {children}
    </a>
  );
}

function NavbarMenuSeparator({ mobileOnly }: { mobileOnly?: boolean }) {
  return <span aria-hidden className={cn("my-2 block h-px bg-muted", mobileOnly && "md:hidden")} />;
}

export { Navbar, NavbarLink, NavbarLinks, NavbarMenu, NavbarMenuItem, NavbarMenuSeparator };
