"use client";

import { ArrowRight, Info, ListFilter, Search } from "lucide-react";
import { type ReactNode, useState } from "react";
import { KraaDocumentSidebar } from "@/components/blocks/kraa/kraa-document-sidebar";
import { KraaDocumentWorkspace } from "@/components/blocks/kraa/kraa-document-workspace";
import { KraaReadingCanvas } from "@/components/blocks/kraa/kraa-reading-canvas";
import { KraaTypographySettings } from "@/components/blocks/kraa/kraa-typography-settings";
import { FilterPanel } from "@/components/blocks/ninja/filter-panel";
import { FontCard } from "@/components/blocks/ninja/font-card";
import { KraaButton } from "@/components/ui/kraa/kraa-button";
import { KraaDocumentActions } from "@/components/ui/kraa/kraa-document-actions";
import { KraaDocumentListItem } from "@/components/ui/kraa/kraa-document-list-item";
import {
  KraaField,
  KraaFieldGroup,
  KraaFieldLabel,
  KraaFieldLegend,
  KraaFieldSet,
  KraaSelect,
} from "@/components/ui/kraa/kraa-field";
import { KraaMemberRoleRow } from "@/components/ui/kraa/kraa-member-role-row";
import { KraaRangeSlider } from "@/components/ui/kraa/kraa-range-slider";
import { KraaSearchInput } from "@/components/ui/kraa/kraa-search-input";
import { KraaProvider, type KraaTheme } from "@/components/ui/kraa/kraa-theme";
import { KraaToggleGroup } from "@/components/ui/kraa/kraa-toggle-group";
import { AnimatedHeadline } from "@/components/ui/ninja/animated-headline";
import { Badge } from "@/components/ui/ninja/badge";
import { Button } from "@/components/ui/ninja/button";
import { Card, CardContent, CardDescription, CardFooter, CardTitle } from "@/components/ui/ninja/card";
import { Input } from "@/components/ui/ninja/input";
import { Label } from "@/components/ui/ninja/label";
import { MenuToggle } from "@/components/ui/ninja/menu-toggle";
import { Navbar, NavbarLink, NavbarLinks, NavbarMenu, NavbarMenuItem } from "@/components/ui/ninja/navbar";
import { Panel, PanelContent, PanelTitle, PanelTrigger } from "@/components/ui/ninja/panel";
import { Dash, Separator } from "@/components/ui/ninja/separator";
import { Slider } from "@/components/ui/ninja/slider";
import { Switch } from "@/components/ui/ninja/switch";
import { TextLink } from "@/components/ui/ninja/text-link";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/ninja/toggle-group";
import { ReaProvider } from "@/components/ui/rea/rea-theme";
import { ActionCluster } from "@/components/ui/remi/action-cluster";
import { DarkButton } from "@/components/ui/remi/dark-button";
import { DateField, SelectField, TextField, UnitInput } from "@/components/ui/remi/fields";
import { BlueButton, FilterInput, FilterSelect, ToggleSwitch } from "@/components/ui/remi/form-controls";
import { IconButton } from "@/components/ui/remi/icon-button";
import { ICON_SHAPES, type IconName } from "@/components/ui/remi/icon-shapes";
import { Icon, PlusIcon, QrIcon } from "@/components/ui/remi/icons";
import * as KI from "@/components/ui/remi/kit-icons";
import { Pager, RangeSummary, SoftButton, StatusTabs } from "@/components/ui/remi/navigation";
import { ToolPill, UpdateStatus } from "@/components/ui/remi/toolbar";
import { bySlug, type Family } from "@/lib/component-registry";
import { DEMO_DOCUMENTS } from "@/lib/demo/kraa-docs";
import { DEMO_FONT_CARDS, DEMO_HEADLINE_FONTS } from "@/lib/demo/ninja-fonts";
import { DEFAULT_TYPOGRAPHY, type TypographyConfig } from "@/lib/kraa/kraa-model";
import { LAB_PREVIEWS, LAB_THUMBS } from "./previews-lab";
import { REA_PREVIEWS, REA_THUMBS } from "./previews-rea";

function Row({ children, caption }: { children: ReactNode; caption?: string }) {
  return (
    <figure className="cb-variant">
      <div className="flex min-h-[50px] items-center justify-center leading-none">{children}</div>
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}

function useClicks() {
  const [last, setLast] = useState<string | null>(null);
  return { last, hit: (what: string) => () => setLast(what) };
}

function ClickLog({ last }: { last: string | null }) {
  return (
    <p className="cb-log" aria-live="polite">
      {last ? `Clic: ${last}` : "Haz clic en un elemento"}
    </p>
  );
}

function simple(node: ReactNode, caption?: string) {
  function SimplePreview() {
    return (
      <div className="cb-variants">
        <Row caption={caption}>{node}</Row>
      </div>
    );
  }
  return SimplePreview;
}

// ---------- REMI ----------

function SwitchPreview() {
  const [a, setA] = useState(false);
  const [b, setB] = useState(true);
  return (
    <div className="cb-variants cb-left">
      <ToggleSwitch label="Activo" checked={a} onChange={setA} />
      <ToggleSwitch label="Solo asignado" checked={b} onChange={setB} />
    </div>
  );
}

function SelectPreview() {
  const [v, setV] = useState("all");
  const options = [
    { value: "all", label: "Todos" },
    { value: "a", label: "Grupo A" },
  ];
  return (
    <div className="cb-form">
      <FilterSelect label="Grupo" count={0} value={v} onChange={setV} options={options} />
      <FilterSelect label="Sin contador" value={v} onChange={setV} options={options} />
    </div>
  );
}

function InputPreview() {
  const [v, setV] = useState("");
  return (
    <div className="cb-form">
      <FilterInput label="Responsable" placeholder="Nombre" value={v} onChange={setV} />
    </div>
  );
}

function ToolPillPreview() {
  const c = useClicks();
  return (
    <>
      <div className="cb-variants">
        <ToolPill
          tools={[
            { kind: "print", label: "Imprimir", onClick: c.hit("imprimir") },
            { kind: "save", label: "Guardar", onClick: c.hit("guardar") },
            { kind: "refresh", label: "Actualizar", onClick: c.hit("actualizar") },
          ]}
        />
      </div>
      <ClickLog last={c.last} />
    </>
  );
}

function ActionPreview() {
  const c = useClicks();
  return (
    <>
      <div className="cb-variants">
        <Row caption="Normal">
          <ActionCluster onCare={c.hit("acción 1")} onBed={c.hit("acción 2")} onAttend={c.hit("atender")} />
        </Row>
        <Row caption="Con aviso">
          <ActionCluster
            alert
            onCare={c.hit("acción 1 (aviso)")}
            onBed={c.hit("acción 2")}
            onAttend={c.hit("atender")}
          />
        </Row>
      </div>
      <ClickLog last={c.last} />
    </>
  );
}

function IconsPreview() {
  const names = Object.keys(ICON_SHAPES) as IconName[];
  return (
    <div className="cb-icon-grid">
      {names.map((n) => (
        <figure key={n}>
          <span className={n === "usercheck" || n === "bed" ? "cb-icon-dark" : undefined}>
            <Icon name={n} color={n === "bed" ? "#fff" : n === "usercheck" ? "#00cd2a" : undefined} />
          </span>
          <figcaption>{n}</figcaption>
        </figure>
      ))}
      <figure>
        <span>
          <PlusIcon />
        </span>
        <figcaption>PlusIcon</figcaption>
      </figure>
      <figure>
        <span>
          <QrIcon />
        </span>
        <figcaption>QrIcon</figcaption>
      </figure>
    </div>
  );
}

function PagerPreview() {
  const [page, setPage] = useState(1);
  return (
    <div className="cb-variants cb-col">
      <Pager page={page} total={3} onPrev={() => setPage((p) => p - 1)} onNext={() => setPage((p) => p + 1)} />
      <RangeSummary from={(page - 1) * 6 + 1} to={Math.min(page * 6, 15)} total={15} />
    </div>
  );
}

function TabsPreview() {
  const [tab, setTab] = useState("b");
  return (
    <div style={{ width: "100%" }}>
      <StatusTabs
        active={tab}
        onChange={setTab}
        tabs={[
          { id: "a", label: "Resumen", done: true },
          { id: "b", label: "Detalle", done: true },
          { id: "c", label: "Historial" },
          { id: "d", label: "Ajustes", done: true },
        ]}
      />
    </div>
  );
}

function FieldsPreview() {
  const [cant, setCant] = useState("");
  const [tipo, setTipo] = useState("");
  const [inicio, setInicio] = useState("2026-03-02T19:44");
  const [dias, setDias] = useState("");
  return (
    <div className="cb-fields">
      <UnitInput label="Cantidad" value={cant} onChange={setCant} width={170} />
      <SelectField
        label="Tipo"
        placeholder="Tipo"
        value={tipo}
        onChange={setTipo}
        width={175}
        options={[
          { value: "a", label: "Opción A" },
          { value: "b", label: "Opción B" },
        ]}
      />
      <DateField label="Fecha inicio" value={inicio} onChange={setInicio} width={185} />
      <TextField label="Días" placeholder="Días" value={dias} onChange={setDias} width={80} />
    </div>
  );
}

const KIT_ICONS: [string, ReactNode][] = [
  ["InfoIcon", <KI.InfoIcon key="i" />],
  ["ChevronCircle", <KI.ChevronCircle key="c" />],
  ["SaveIcon", <KI.SaveIcon key="s" />],
  [
    "ArrowCircle",
    <span key="a" className="cb-icon-dark">
      <KI.ArrowCircle />
    </span>,
  ],
  ["CalendarIcon", <KI.CalendarIcon key="cal" />],
  [
    "ChevronDown",
    <span key="cd" className="cb-icon-dark">
      <KI.ChevronDown />
    </span>,
  ],
  ["CommentIcon", <KI.CommentIcon key="co" />],
  ["CommentIcon highlight", <KI.CommentIcon key="coh" highlight />],
  ["EditBubbleIcon", <KI.EditBubbleIcon key="eb" />],
  ["EditSquareIcon", <KI.EditSquareIcon key="es" />],
  ["CheckCircle", <KI.CheckCircle key="ck" />],
  ["XCircle", <KI.XCircle key="x" />],
  ["ClockIcon", <KI.ClockIcon key="cl" />],
  ["SwapIcon", <KI.SwapIcon key="sw" />],
  ["RescheduleIcon", <KI.RescheduleIcon key="r" />],
  [
    "HourSquare",
    <span key="h" className="cb-icon-dark">
      <KI.HourSquare />
    </span>,
  ],
];

// ---------- Ninja ----------

function NinjaStack({ children }: { children: ReactNode }) {
  return <div className="flex w-full flex-wrap items-center gap-3">{children}</div>;
}

function NinjaSliderPreview() {
  return (
    <div className="grid w-full max-w-md grid-cols-[90px_1fr] items-center gap-y-5">
      <Label>Único</Label>
      <Slider defaultValue={[2]} max={5} step={1} ticks={5} aria-label="Único" />
      <Label>Rango</Label>
      <Slider defaultValue={[0, 100]} ticks={5} aria-label="Rango" formatLabel={(v) => (v >= 100 ? "100+" : `${v}`)} />
      <Label>Con valor</Label>
      <Slider defaultValue={[4]} min={1} max={20} aria-label="Con valor" formatLabel={(v) => `${v}+`} />
    </div>
  );
}

function NinjaMenuTogglePreview() {
  const [open, setOpen] = useState(false);
  return (
    <NinjaStack>
      <MenuToggle open={open} onOpenChange={setOpen} />
      <span className="text-sm text-muted-foreground">{open ? "Abierto" : "Cerrado"}</span>
    </NinjaStack>
  );
}

function NinjaPanelPreview() {
  return (
    <Panel>
      <PanelTrigger asChild>
        <Button>
          <ListFilter /> Abrir panel
        </Button>
      </PanelTrigger>
      <PanelContent aria-describedby={undefined}>
        <PanelTitle className="mb-4">Panel flotante</PanelTitle>
        <p className="text-sm text-muted-foreground">Se cierra con Escape, con la × o al hacer clic afuera.</p>
      </PanelContent>
    </Panel>
  );
}

function NinjaFontCardPreview() {
  return (
    <div className="grid w-full gap-2 sm:grid-cols-2">
      {DEMO_FONT_CARDS.slice(0, 2).map((f) => (
        <FontCard key={f.name} {...f} />
      ))}
    </div>
  );
}

// ---------- Kraa ----------

function KraaToggleGroupPreview() {
  const [v, setV] = useState("static");
  return (
    <KraaToggleGroup
      label="Escala tipográfica"
      value={v}
      onValueChange={setV}
      choices={[
        { value: "static", label: "Estática" },
        { value: "fluid", label: "Fluida" },
      ]}
    />
  );
}

function KraaSearchPreview() {
  const [q, setQ] = useState("");
  return (
    <div style={{ width: 280 }}>
      <KraaSearchInput value={q} onValueChange={setQ} />
    </div>
  );
}

function KraaActionsPreview() {
  const [fav, setFav] = useState(false);
  const [log, setLog] = useState<string | null>(null);
  return (
    <>
      <KraaDocumentActions
        favorite={fav}
        onFavoriteChange={setFav}
        onSettings={() => setLog("Ajustes")}
        onDelete={() => setLog("Eliminar")}
      />
      <p className="cb-log" aria-live="polite">
        {log ? `Acción: ${log}` : fav ? "Marcado como favorito" : "Abre el menú •••"}
      </p>
    </>
  );
}

function KraaSidebarPreview() {
  const [id, setId] = useState("d1");
  return <KraaDocumentSidebar documents={DEMO_DOCUMENTS} selectedId={id} onSelect={setId} onNew={() => {}} />;
}

function KraaTypographyPreview() {
  const [v, setV] = useState<TypographyConfig>(DEFAULT_TYPOGRAPHY);
  return <KraaTypographySettings value={v} onValueChange={setV} />;
}

function KraaWorkspacePreview() {
  const [id, setId] = useState("d1");
  const doc = DEMO_DOCUMENTS.find((d) => d.id === id) ?? DEMO_DOCUMENTS[0];
  return (
    <div style={{ width: "100%" }}>
      <KraaDocumentWorkspace documents={DEMO_DOCUMENTS} selectedId={id} onSelect={setId}>
        <KraaReadingCanvas title={doc.title} author={doc.author} date={doc.date}>
          <p>{doc.excerpt}</p>
        </KraaReadingCanvas>
      </KraaDocumentWorkspace>
    </div>
  );
}

function KraaThemePreview() {
  const themes: KraaTheme[] = ["light", "dark"];
  return (
    <div className="cb-variants">
      {themes.map((t) => (
        <KraaProvider key={t} theme={t} style={{ padding: 16, borderRadius: 16, background: "var(--kraa-bg)" }}>
          <KraaButton variant="surface">Tema {t === "light" ? "claro" : "oscuro"}</KraaButton>
        </KraaProvider>
      ))}
    </div>
  );
}

export const PREVIEWS: Record<string, () => ReactNode> = {
  // REMI
  "icon-button": simple(
    <IconButton label="Comentarios">
      <Icon name="chat" color="#2bc77b" />
    </IconButton>,
    "Hover oscurece",
  ),
  "action-cluster": ActionPreview,
  "blue-button": () => (
    <div className="cb-variants cb-left">
      <BlueButton>Buscar</BlueButton>
      <BlueButton>Limpiar</BlueButton>
    </div>
  ),
  "filter-select": SelectPreview,
  "filter-input": InputPreview,
  "toggle-switch": SwitchPreview,
  "tool-pill": ToolPillPreview,
  "update-status": () => (
    <div className="cb-status-stack">
      <UpdateStatus time="14:02" />
      <UpdateStatus time={null} />
    </div>
  ),
  "dark-button": () => (
    <div className="cb-variants cb-left">
      <DarkButton>Imprimir</DarkButton>
      <DarkButton>Firmar</DarkButton>
      <DarkButton icon={<KI.SaveIcon />}>Guardar</DarkButton>
    </div>
  ),
  pager: PagerPreview,
  "status-tabs": TabsPreview,
  "soft-button": () => (
    <div className="cb-variants cb-left">
      <SoftButton>Solicitar</SoftButton>
      <SoftButton>Re-programar</SoftButton>
      <SoftButton disabled>Enviar validación</SoftButton>
    </div>
  ),
  "form-fields": FieldsPreview,
  "kit-icons": () => (
    <div className="cb-icon-grid">
      {KIT_ICONS.map(([n, node]) => (
        <figure key={n}>
          <span>{node}</span>
          <figcaption>{n}</figcaption>
        </figure>
      ))}
    </div>
  ),
  icons: IconsPreview,
  // Ninja
  "ninja-button": () => (
    <NinjaStack>
      <Button>Primario</Button>
      <Button variant="secondary">Secundario</Button>
      <Button variant="outline">Contorno</Button>
      <Button variant="ghost">Fantasma</Button>
      <Button variant="link">Enlace</Button>
      <Button size="sm">Pequeño</Button>
      <Button variant="icon" size="icon" aria-label="Buscar">
        <Search />
      </Button>
    </NinjaStack>
  ),
  "ninja-badge": () => (
    <NinjaStack>
      <Badge>Nuevo</Badge>
      <Badge>1+</Badge>
      <Badge variant="secondary">Variable</Badge>
      <Badge variant="outline">Prueba</Badge>
      <Badge variant="dark">Pro</Badge>
    </NinjaStack>
  ),
  "ninja-card": () => (
    <Card className="w-full max-w-sm shadow-soft">
      <CardContent>
        <span className="text-7xl">Aa</span>
      </CardContent>
      <CardFooter>
        <div>
          <CardTitle>Fraunces</CardTitle>
          <CardDescription>Undercase Type</CardDescription>
        </div>
        <CardDescription>18 estilos</CardDescription>
      </CardFooter>
    </Card>
  ),
  "ninja-input": () => (
    <div className="grid w-full max-w-md gap-2">
      <Label htmlFor="ninja-q">Buscar</Label>
      <Input id="ninja-q" placeholder="Buscar una tipografía…" />
      <Input placeholder="Deshabilitado" disabled />
    </div>
  ),
  "ninja-label": () => (
    <NinjaStack>
      <Label htmlFor="ninja-l">Mostrar solo variables</Label>
      <Switch id="ninja-l" />
    </NinjaStack>
  ),
  "ninja-separator": () => (
    <div className="w-full">
      <Dash />
      <p className="text-2xl font-bold">Componentes</p>
      <Separator className="my-6" />
      <p className="text-xs text-muted-foreground">Pie de sección</p>
    </div>
  ),
  "ninja-slider": NinjaSliderPreview,
  "ninja-switch": () => (
    <div className="grid gap-3">
      <div className="flex items-center justify-between gap-6">
        <Label htmlFor="ninja-s1">Solo con prueba</Label>
        <Switch id="ninja-s1" />
      </div>
      <div className="flex items-center justify-between gap-6">
        <Label htmlFor="ninja-s2">Solo variables</Label>
        <Switch id="ninja-s2" defaultChecked />
      </div>
    </div>
  ),
  "ninja-toggle-group": () => (
    <ToggleGroup type="single" defaultValue="b" aria-label="Forma de la letra">
      <ToggleGroupItem value="a" aria-label="Serif" style={{ fontFamily: "Georgia, serif" }}>
        E
      </ToggleGroupItem>
      <ToggleGroupItem value="b" aria-label="Sans" style={{ fontFamily: "Arial, sans-serif" }}>
        E
      </ToggleGroupItem>
      <ToggleGroupItem value="c" aria-label="Display" style={{ fontFamily: "'Abril Fatface'" }}>
        E
      </ToggleGroupItem>
    </ToggleGroup>
  ),
  "ninja-text-link": () => (
    <p className="text-2xl">
      Una librería de componentes. <TextLink href="#">Ver los componentes</TextLink>
    </p>
  ),
  "ninja-animated-headline": () => (
    <div className="w-full">
      <AnimatedHeadline text="TYPE INDEX" fonts={DEMO_HEADLINE_FONTS} />
    </div>
  ),
  "ninja-menu-toggle": NinjaMenuTogglePreview,
  "ninja-navbar": () => (
    <div className="w-full overflow-clip rounded-xl">
      <Navbar className="static">
        <span className="font-bold">Logo</span>
        <div className="flex items-center gap-6">
          <NavbarLinks>
            <NavbarLink href="#" active>
              Fuentes
            </NavbarLink>
            <NavbarLink href="#">Marcadores</NavbarLink>
          </NavbarLinks>
          <NavbarMenu>
            <NavbarMenuItem href="#" mobileOnly className="text-base">
              Fuentes
            </NavbarMenuItem>
            <NavbarMenuItem href="#" icon={<Info />}>
              Acerca de
            </NavbarMenuItem>
            <NavbarMenuItem href="#" icon={<ArrowRight />}>
              Contacto
            </NavbarMenuItem>
          </NavbarMenu>
        </div>
      </Navbar>
    </div>
  ),
  "ninja-panel": NinjaPanelPreview,
  "ninja-font-card": NinjaFontCardPreview,
  "ninja-filter-panel": () => (
    <>
      <p className="cb-log">El botón «Filter typefaces» aparece fijo abajo, al centro de la ventana.</p>
      <FilterPanel />
    </>
  ),
  // Kraa
  "kraa-theme": KraaThemePreview,
  "kraa-button": () => (
    <div className="cb-variants cb-left">
      <KraaButton>Discreto</KraaButton>
      <KraaButton variant="surface">Superficie</KraaButton>
      <KraaButton variant="accent">Acento</KraaButton>
      <KraaButton variant="danger">Eliminar</KraaButton>
      <KraaButton disabled>Deshabilitado</KraaButton>
    </div>
  ),
  "kraa-field": () => (
    <KraaFieldSet style={{ width: 280 }}>
      <KraaFieldLegend>Tipografía</KraaFieldLegend>
      <KraaFieldGroup>
        <KraaField>
          <KraaFieldLabel htmlFor="kraa-f">Familia</KraaFieldLabel>
          <KraaSelect id="kraa-f" defaultValue="inter">
            <option value="inter">Inter</option>
            <option value="serif">Serif</option>
          </KraaSelect>
        </KraaField>
      </KraaFieldGroup>
    </KraaFieldSet>
  ),
  "kraa-search-input": KraaSearchPreview,
  "kraa-document-list-item": () => (
    <div style={{ display: "grid", gap: 8, width: 260 }}>
      <KraaDocumentListItem document={DEMO_DOCUMENTS[0]} selected />
      <KraaDocumentListItem document={DEMO_DOCUMENTS[1]} />
    </div>
  ),
  "kraa-range-slider": () => (
    <div style={{ display: "grid", gap: 16, width: 280 }}>
      <KraaRangeSlider label="Tamaño" min={12} max={40} defaultValue={[16]} />
      <KraaRangeSlider label="Ancho" min={320} max={960} step={20} defaultValue={[480, 720]} />
    </div>
  ),
  "kraa-toggle-group": KraaToggleGroupPreview,
  "kraa-member-role-row": () => (
    <div style={{ display: "grid", gap: 8, width: 320 }}>
      {/* biome-ignore lint/a11y/useValidAriaRole: role es una prop de KraaMemberRoleRow (texto del rol), no un rol ARIA */}
      <KraaMemberRoleRow name="Ana Ruiz" role="Editora" meta="ana@ejemplo.test" />
      {/* biome-ignore lint/a11y/useValidAriaRole: role es una prop de KraaMemberRoleRow (texto del rol), no un rol ARIA */}
      <KraaMemberRoleRow name="Leo Paz" role="Lector" trailing={<KraaButton size="icon">×</KraaButton>} />
    </div>
  ),
  "kraa-document-actions": KraaActionsPreview,
  "kraa-document-sidebar": KraaSidebarPreview,
  "kraa-reading-canvas": () => (
    <KraaReadingCanvas title="Notas de lectura" subtitle="Un borrador" author="Ana Ruiz" date="12 oct">
      <p>Una página tranquila para escribir y volver a mirar.</p>
    </KraaReadingCanvas>
  ),
  "kraa-typography-settings": KraaTypographyPreview,
  "kraa-document-workspace": KraaWorkspacePreview,
  // REA (en previews-rea.tsx)
  ...REA_PREVIEWS,
  // Lab (en previews-lab.tsx)
  ...LAB_PREVIEWS,
};

/** Miniaturas para la grilla del índice; siempre estáticas e inertes. */
export const THUMBS: Record<string, ReactNode> = {
  // REMI
  "icon-button": (
    <IconButton label="Comentarios">
      <Icon name="chat" color="#2bc77b" />
    </IconButton>
  ),
  "action-cluster": <ActionCluster />,
  "blue-button": <BlueButton>Buscar</BlueButton>,
  "filter-select": (
    <FilterSelect
      label="Grupo"
      count={0}
      value="all"
      onChange={() => {}}
      options={[{ value: "all", label: "Todos" }]}
      className="w-[210px]"
    />
  ),
  "filter-input": (
    <FilterInput label="Responsable" placeholder="Nombre" value="" onChange={() => {}} className="w-[210px]" />
  ),
  "toggle-switch": <ToggleSwitch label="" checked onChange={() => {}} />,
  "tool-pill": (
    <ToolPill
      tools={[
        { kind: "print", label: "Imprimir" },
        { kind: "save", label: "Guardar" },
        { kind: "refresh", label: "Actualizar" },
      ]}
    />
  ),
  "update-status": <UpdateStatus time="14:02" className="text-[13px]" />,
  "dark-button": <DarkButton>Firmar</DarkButton>,
  pager: <Pager page={1} total={1} />,
  "status-tabs": (
    <span className="status-tab" style={{ background: "#fff" }}>
      <KI.CheckCircle size={13} />
      Detalle
    </span>
  ),
  "soft-button": <SoftButton>Re-programar</SoftButton>,
  "form-fields": <SelectField label="Tipo" placeholder="Tipo" value="" onChange={() => {}} options={[]} width={200} />,
  "kit-icons": (
    <>
      <KI.InfoIcon />
      <KI.CalendarIcon />
      <KI.EditSquareIcon />
    </>
  ),
  icons: (
    <>
      <Icon name="nurse" />
      <Icon name="stethoscope" />
      <Icon name="heart" />
    </>
  ),
  // Ninja
  "ninja-button": <Button size="sm">Primario</Button>,
  "ninja-badge": (
    <>
      <Badge>Nuevo</Badge>
      <Badge variant="outline">Prueba</Badge>
    </>
  ),
  "ninja-card": <span className="cb-thumb-chip">Aa</span>,
  "ninja-input": <Input placeholder="Buscar…" className="h-9 w-44 text-sm" />,
  "ninja-label": <Label>Etiqueta</Label>,
  "ninja-separator": <Dash className="mb-0 sm:mb-0" />,
  "ninja-slider": (
    <div className="w-40">
      <Slider defaultValue={[2]} max={5} ticks={5} aria-label="Muestra" />
    </div>
  ),
  "ninja-switch": <Switch defaultChecked aria-label="Muestra" />,
  "ninja-toggle-group": (
    <ToggleGroup type="single" defaultValue="a" aria-label="Muestra">
      <ToggleGroupItem value="a">E</ToggleGroupItem>
      <ToggleGroupItem value="b">E</ToggleGroupItem>
    </ToggleGroup>
  ),
  // Las miniaturas viven dentro del enlace de la tarjeta: nada de <a> anidados.
  "ninja-text-link": <span className="inline-flex items-baseline text-primary">Ver más ↗</span>,
  "ninja-animated-headline": (
    <span className="text-3xl font-semibold" style={{ fontFamily: "'Fraunces Variable'" }}>
      TYPE
    </span>
  ),
  "ninja-menu-toggle": <MenuToggle open={false} />,
  "ninja-navbar": <span className="text-sm font-medium text-muted-foreground">Fuentes · Marcadores</span>,
  "ninja-panel": <span className="cb-thumb-modal">Panel</span>,
  "ninja-font-card": (
    <span className="text-4xl" style={{ fontFamily: "'DM Serif Display'" }}>
      Aa
    </span>
  ),
  "ninja-filter-panel": (
    <Button size="sm">
      <ListFilter /> Filtrar
    </Button>
  ),
  // Kraa
  "kraa-theme": <KraaButton variant="surface">Tema</KraaButton>,
  "kraa-button": <KraaButton variant="accent">Acento</KraaButton>,
  "kraa-field": <span className="text-[13px] text-kraa-muted">Familia</span>,
  "kraa-search-input": <KraaSearchInput />,
  "kraa-document-list-item": <KraaDocumentListItem document={DEMO_DOCUMENTS[1]} />,
  "kraa-range-slider": (
    <div style={{ width: 160 }}>
      <KraaRangeSlider label="Muestra" defaultValue={[16]} min={12} max={40} />
    </div>
  ),
  "kraa-toggle-group": (
    <KraaToggleGroup
      label="Muestra"
      value="a"
      onValueChange={() => {}}
      choices={[
        { value: "a", label: "Estática" },
        { value: "b", label: "Fluida" },
      ]}
    />
  ),
  // biome-ignore lint/a11y/useValidAriaRole: role es una prop de KraaMemberRoleRow (texto del rol), no un rol ARIA
  "kraa-member-role-row": <KraaMemberRoleRow name="Ana Ruiz" role="Editora" />,
  "kraa-document-actions": <KraaButton size="icon">•••</KraaButton>,
  "kraa-document-sidebar": <span className="text-[13px] text-kraa-muted">Documentos</span>,
  "kraa-reading-canvas": <span style={{ fontSize: 28 }}>Notas</span>,
  "kraa-typography-settings": <span className="text-[13px] text-kraa-muted">Ajustes de lectura</span>,
  "kraa-document-workspace": <span className="text-[13px] text-kraa-muted">Espacio de trabajo</span>,
  ...REA_THUMBS,
  ...LAB_THUMBS,
};

/**
 * Cada familia necesita su contenedor: REMI bajo .remi, Ninja con su fuente, y Kraa y REA dentro
 * de su proveedor de tema. En la vista previa REA pinta su fondo (`surface`); en la miniatura no.
 */
export function FamilyScope({
  family,
  surface = false,
  children,
}: {
  family?: Family;
  surface?: boolean;
  children: ReactNode;
}) {
  // w-full: dentro de la columna centrada del banco, el contenedor se encogería a su contenido
  // y las grillas auto-fill (íconos) quedarían en una sola columna.
  if (family === "REMI") return <div className="remi w-full">{children}</div>;
  if (family === "Kraa")
    return (
      <KraaProvider theme="light" style={{ background: "transparent" }}>
        {children}
      </KraaProvider>
    );
  // Ninja hereda fuente y color del body en su demo; en el banco el body es del banco.
  // contents: el envoltorio solo aporta herencia, no caja.
  if (family === "Ninja") return <div className="contents font-sans text-foreground">{children}</div>;
  if (family === "Lab") return <div className="lab w-full">{children}</div>;
  if (family === "REA")
    return (
      <ReaProvider surface={surface} style={surface ? { padding: 24, width: "100%" } : undefined}>
        {children}
      </ReaProvider>
    );
  return <>{children}</>;
}

export function Preview({ slug }: { slug: string }) {
  const P = PREVIEWS[slug];
  return (
    <FamilyScope family={bySlug(slug)?.family} surface>
      {P ? <P /> : <p className="cb-log">Sin vista previa.</p>}
    </FamilyScope>
  );
}

/** Miniatura para la grilla del índice. */
export function Thumb({ slug }: { slug: string }) {
  return (
    <FamilyScope family={bySlug(slug)?.family}>
      <div className="flex min-h-[50px] items-center justify-center gap-2 leading-none" inert>
        {THUMBS[slug]}
      </div>
    </FamilyScope>
  );
}
