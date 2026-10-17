"use client";

import { type ReactNode, useCallback, useRef, useState } from "react";
import { ReaCatalog } from "@/components/blocks/rea/rea-catalog";
import { ReaSiteHeader } from "@/components/blocks/rea/rea-site-header";
import { ReaSpecimenStage } from "@/components/blocks/rea/rea-specimen-stage";
import { ReaButton } from "@/components/ui/rea/rea-button";
import { ReaCommandPalette } from "@/components/ui/rea/rea-command-palette";
import { ReaFilterGroup } from "@/components/ui/rea/rea-filter-group";
import { ReaGridOverlay } from "@/components/ui/rea/rea-grid-overlay";
import { ReaCodeBox, ReaDetailRows } from "@/components/ui/rea/rea-inspector";
import { ReaMonogram, ReaPreloader } from "@/components/ui/rea/rea-monogram";
import { ReaGenWords, ReaWireline } from "@/components/ui/rea/rea-motion-text";
import { ReaNav } from "@/components/ui/rea/rea-nav";
import { ReaNote, ReaSectionHead } from "@/components/ui/rea/rea-note";
import { ReaScrollProgress, useScrollProgress } from "@/components/ui/rea/rea-scroll-progress";
import { ReaSearchBox } from "@/components/ui/rea/rea-search-box";
import { ReaSpecimenList } from "@/components/ui/rea/rea-specimen-list";
import { ReaSwatches } from "@/components/ui/rea/rea-swatches";
import { ReaTerrain } from "@/components/ui/rea/rea-terrain";
import { nextAccent, type ReaAccent, ReaProvider, type ReaTheme } from "@/components/ui/rea/rea-theme";
import { ReaToast, useReaToast } from "@/components/ui/rea/rea-toast";
import { ReaAccentDot, ReaThemeIcon, ReaToolButton } from "@/components/ui/rea/rea-tool-button";
import { SlideNavigator } from "@/components/ui/rea/slide-navigator";
import { DEMO_REA_COMMANDS, DEMO_REA_ENTRIES, DEMO_REA_NAV, DEMO_REA_SWATCHES } from "@/lib/demo/rea";
import { matchesQuery } from "@/lib/rea/rea-utils";

const stack = { display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" } as const;
const column = { display: "grid", gap: 20, width: "100%" } as const;

function Log({ children }: { children: ReactNode }) {
  return (
    <p className="cb-log" aria-live="polite">
      {children}
    </p>
  );
}

function ThemePreview() {
  const [theme, setTheme] = useState<ReaTheme>("light");
  const [accent, setAccent] = useState<ReaAccent>("blue");
  return (
    <ReaProvider theme={theme} accent={accent} surface style={{ padding: 24, width: "100%" }}>
      <div style={stack}>
        <ReaToolButton
          label="Alternar tema claro y oscuro"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        >
          <ReaThemeIcon />
        </ReaToolButton>
        <ReaToolButton label="Cambiar color de acento" onClick={() => setAccent(nextAccent(accent))}>
          <ReaAccentDot />
        </ReaToolButton>
        <ReaNote tone="accent">
          {theme} · {accent}
        </ReaNote>
        <ReaButton size="sm">Explorar</ReaButton>
      </div>
    </ReaProvider>
  );
}

function SlideNavigatorPreview() {
  const [i, setI] = useState(1);
  return (
    <div style={{ ...column, justifyItems: "start" }}>
      <SlideNavigator index={i} count={5} onChange={setI} />
      <SlideNavigator index={0} count={3} onChange={() => {}} showPosition={false} />
    </div>
  );
}

function FilterGroupPreview() {
  const [tipo, setTipo] = useState("all");
  const [col, setCol] = useState("all");
  return (
    <div style={column}>
      <ReaFilterGroup
        label="Filtrar por tipo"
        value={tipo}
        onValueChange={setTipo}
        options={[
          { value: "all", label: "Todo" },
          { value: "comp", label: "Componentes" },
          { value: "tokens", label: "Tokens" },
          { value: "motion", label: "Movimiento" },
        ]}
      />
      <ReaFilterGroup
        label="Colecciones"
        variant="underline"
        value={col}
        onValueChange={setCol}
        options={[
          { value: "all", label: "Todas", count: 4 },
          { value: "falp", label: "FALP", count: 2 },
          { value: "rea", label: "REA / Conceptos", count: 2 },
          { value: "ninja", label: "Ninja", count: 0 },
        ]}
      />
    </div>
  );
}

function SearchPreview() {
  const [q, setQ] = useState("");
  const hits = DEMO_REA_ENTRIES.filter((e) => matchesQuery(q, e.title, e.keywords));
  return (
    <div style={column}>
      <ReaSearchBox label="Buscar en la biblioteca" value={q} onValueChange={setQ} shortcut="⌘ K" />
      <Log>{`${hits.length} resultados: ${hits.map((h) => h.title).join(", ") || "ninguno"}`}</Log>
    </div>
  );
}

function SpecimenListPreview() {
  const [id, setId] = useState("navigator");
  return (
    <div style={{ width: "100%" }}>
      <ReaSpecimenList
        items={DEMO_REA_ENTRIES.map((e) => ({ id: e.id, title: e.title, meta: e.meta }))}
        selectedId={id}
        onSelect={setId}
      />
    </div>
  );
}

function InspectorPreview() {
  const { message, show } = useReaToast();
  const e = DEMO_REA_ENTRIES[0];
  return (
    <div
      style={{ display: "grid", gap: 20, gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", width: "100%" }}
    >
      <ReaDetailRows rows={e.details} label="Detalles" />
      <ReaCodeBox
        code={e.code}
        title="Code / registry"
        badge="Ejemplo · no publicado"
        onCopyResult={(ok) => show(ok ? "Ejemplo copiado." : "No se pudo copiar: selecciona el texto a mano.")}
      />
      <ReaToast message={message} />
    </div>
  );
}

function PalettePreview() {
  const [open, setOpen] = useState(false);
  const [last, setLast] = useState<string | null>(null);
  return (
    <div style={column}>
      <div style={stack}>
        <ReaToolButton label="Abrir comandos" onClick={() => setOpen(true)}>
          ⌘K
        </ReaToolButton>
        <ReaNote>Abre la paleta, filtra y elige; Escape cierra.</ReaNote>
      </div>
      <ReaCommandPalette
        open={open}
        onOpenChange={setOpen}
        commands={DEMO_REA_COMMANDS}
        onSelect={(id) => setLast(DEMO_REA_COMMANDS.find((c) => c.id === id)?.label ?? id)}
      />
      <Log>{last ? `Comando: ${last}` : "Ningún comando elegido"}</Log>
    </div>
  );
}

function ToastPreview() {
  const { message, show } = useReaToast();
  return (
    <div style={stack}>
      <ReaButton size="sm" arrow={null} onClick={() => show("Flujo futuro: la importación aún no está implementada.")}>
        Mostrar aviso
      </ReaButton>
      <ReaToast message={message} />
    </div>
  );
}

function ScrollProgressPreview() {
  const ref = useRef<HTMLDivElement>(null);
  const value = useScrollProgress(ref);
  return (
    <div style={column}>
      <ReaScrollProgress value={value} />
      <div ref={ref} style={{ height: 140, overflow: "auto", border: "1px solid var(--rea-line)", padding: 16 }}>
        {Array.from({ length: 12 }, (_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: párrafos de relleno fijos, sin identidad propia
          <p key={`p-${i + 1}`} style={{ margin: "0 0 12px" }}>
            Párrafo {i + 1}: desplaza esta caja para mover la barra.
          </p>
        ))}
      </div>
    </div>
  );
}

function GridOverlayPreview() {
  const [on, setOn] = useState(true);
  return (
    <div style={{ position: "relative", width: "100%", minHeight: 160 }}>
      <ReaGridOverlay visible={on} contained />
      <div style={{ position: "relative", ...stack }}>
        <ReaButton size="sm" variant="ghost" arrow={null} onClick={() => setOn((v) => !v)} aria-pressed={on}>
          {on ? "Ocultar retícula" : "Mostrar retícula"}
        </ReaButton>
      </div>
    </div>
  );
}

function MonogramPreview() {
  const [run, setRun] = useState(0);
  const [done, setDone] = useState(false);
  const onDone = useCallback(() => setDone(true), []);
  return (
    <div style={column}>
      <div style={{ position: "relative", height: 220, overflow: "hidden", border: "1px solid var(--rea-line)" }}>
        <ReaPreloader key={run} duration={1400} onDone={onDone} />
        <div style={{ display: "grid", placeItems: "center", height: "100%" }}>
          <ReaMonogram key={`m-${run}`} label="Monograma de REA Atlas" className="h-auto w-[110px]" />
        </div>
      </div>
      <div style={stack}>
        <ReaButton
          size="sm"
          variant="ghost"
          arrow={null}
          onClick={() => {
            setDone(false);
            setRun((r) => r + 1);
          }}
        >
          Repetir
        </ReaButton>
        <ReaNote>{done ? "Carga terminada" : "Cargando…"}</ReaNote>
      </div>
    </div>
  );
}

function GenWordsPreview() {
  const [run, setRun] = useState(0);
  return (
    <div style={column}>
      <ReaGenWords
        key={run}
        text="A library of interfaces, motion and reusable systems."
        className="m-0 max-w-[24ch] text-rea-step-3 leading-[0.95] font-medium tracking-[-0.045em]"
      />
      <div>
        <ReaButton size="sm" variant="ghost" arrow={null} onClick={() => setRun((r) => r + 1)}>
          Repetir
        </ReaButton>
      </div>
    </div>
  );
}

function WirelinePreview() {
  const [p, setP] = useState(0.4);
  return (
    <div style={{ ...column, overflow: "hidden" }}>
      <ReaWireline text="Find the detail." measure="type / step-4" progress={p} />
      <label style={stack}>
        <ReaNote>Relleno</ReaNote>
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round(p * 100)}
          onChange={(e) => setP(Number(e.target.value) / 100)}
        />
      </label>
    </div>
  );
}

const STAGE_ITEMS = [
  {
    id: "navigator",
    title: "SlideNavigator",
    tag: "01 · FALP / COMPONENT",
    short: "Nav",
    description: "Controles de navegación de diapositivas con teclado y estados de progreso.",
    render: () => <StageNavigator />,
  },
  {
    id: "tokens",
    title: "Color Foundations",
    tag: "02 · REA / TOKENS",
    short: "Tokens",
    description: "Roles cromáticos del tema REA, con su valor escrito.",
    render: () => <ReaSwatches colors={DEMO_REA_SWATCHES} label="Paleta REA" />,
  },
  {
    id: "motion",
    title: "Card Hover Lift",
    tag: "03 · REA / MOTION",
    short: "Motion",
    description: "Receta de elevación al pasar el puntero; efecto ilustrativo, no observado.",
    render: () => (
      <button
        type="button"
        className="rea-lift"
        style={{ padding: "28px 40px", background: "var(--rea-ink)", color: "var(--rea-bg)", border: 0 }}
      >
        HOVER TO STUDY ↗
      </button>
    ),
  },
];

function StageNavigator() {
  const [i, setI] = useState(1);
  return <SlideNavigator index={i} count={5} onChange={setI} />;
}

function StagePreview() {
  const [id, setId] = useState("navigator");
  return (
    <div style={{ width: "100%" }}>
      <ReaSpecimenStage items={STAGE_ITEMS} selectedId={id} onSelect={setId} />
    </div>
  );
}

function SiteHeaderPreview() {
  const [p, setP] = useState(0.35);
  return (
    <div style={{ ...column, overflow: "hidden" }}>
      <ReaSiteHeader
        nav={DEMO_REA_NAV}
        current="#catalogo"
        progress={p}
        tools={
          <ReaButton size="sm" onClick={() => setP((v) => (v >= 1 ? 0 : Math.min(1, v + 0.15)))}>
            Avanzar
          </ReaButton>
        }
      />
    </div>
  );
}

function CatalogPreview() {
  const { message, show } = useReaToast();
  return (
    <div style={{ width: "100%" }}>
      <ReaCatalog
        entries={DEMO_REA_ENTRIES}
        onCopyResult={(ok) => show(ok ? "Ejemplo copiado." : "No se pudo copiar.")}
      />
      <ReaToast message={message} />
    </div>
  );
}

function TerrainPreview() {
  const [theme, setTheme] = useState<ReaTheme>("light");
  const [accent, setAccent] = useState<ReaAccent>("blue");
  return (
    <ReaProvider theme={theme} accent={accent} surface style={{ width: "100%" }}>
      <section className="relative isolate grid min-h-[420px] content-end gap-[16px] overflow-hidden p-[24px]">
        <ReaTerrain />
        <p className="m-0 max-w-[30ch] font-rea-sans text-rea-step-2 leading-[1.05] text-rea-ink">
          Mové el puntero sobre el terreno.
        </p>
        <div style={stack}>
          <ReaButton
            size="sm"
            variant="ghost"
            arrow={null}
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          >
            Tema: {theme === "light" ? "claro" : "oscuro"}
          </ReaButton>
          <ReaButton size="sm" variant="ghost" arrow={null} onClick={() => setAccent(nextAccent(accent))}>
            Acento: {accent}
          </ReaButton>
        </div>
        <Log>Solo corre con puntero fino, desde 900 px de ancho y sin movimiento reducido.</Log>
      </section>
    </ReaProvider>
  );
}

export const REA_PREVIEWS: Record<string, () => ReactNode> = {
  "rea-theme": ThemePreview,
  "rea-slide-navigator": SlideNavigatorPreview,
  "rea-button": () => (
    <div style={stack}>
      <ReaButton>Explorar componentes</ReaButton>
      <ReaButton variant="ghost" arrow="↓">
        Cómo funciona
      </ReaButton>
      <ReaButton size="sm" magnetic>
        Importar
      </ReaButton>
      <ReaButton href="#" variant="ghost" size="sm">
        Enlace
      </ReaButton>
    </div>
  ),
  "rea-tool-button": () => (
    <div style={stack}>
      <ReaToolButton label="Tema claro / oscuro">
        <ReaThemeIcon />
      </ReaToolButton>
      <ReaToolButton label="Cambiar acento">
        <ReaAccentDot />
      </ReaToolButton>
      <ReaToolButton label="Abrir comandos">⌘K</ReaToolButton>
    </div>
  ),
  "rea-nav": () => <ReaNav items={DEMO_REA_NAV} current="#catalogo" />,
  "rea-note": () => (
    <div style={column}>
      <div style={stack}>
        <ReaNote>Nota</ReaNote>
        <ReaNote tone="ink">Tinta</ReaNote>
        <ReaNote tone="accent">01 · REA / COMPONENT</ReaNote>
      </div>
      <ReaSectionHead title="[01] Manifiesto" aside="fig. 01 · de la evidencia al componente" />
    </div>
  ),
  "rea-filter-group": FilterGroupPreview,
  "rea-search-box": SearchPreview,
  "rea-specimen-list": SpecimenListPreview,
  "rea-inspector": InspectorPreview,
  "rea-command-palette": PalettePreview,
  "rea-toast": ToastPreview,
  "rea-scroll-progress": ScrollProgressPreview,
  "rea-grid-overlay": GridOverlayPreview,
  "rea-monogram": MonogramPreview,
  "rea-gen-words": GenWordsPreview,
  "rea-wireline": WirelinePreview,
  "rea-swatches": () => <ReaSwatches colors={DEMO_REA_SWATCHES} label="Paleta REA" />,
  "rea-terrain": TerrainPreview,
  "rea-hover-lift": () => (
    <div style={stack}>
      <div
        className="rea-lift"
        style={{ padding: 24, border: "1px solid var(--rea-line-strong)", background: "var(--rea-bg)" }}
      >
        Pasa el puntero
      </div>
      <button
        type="button"
        className="rea-lift"
        style={{ padding: "14px 20px", border: "1px solid var(--rea-line-strong)" }}
      >
        O enfoca con Tab
      </button>
    </div>
  ),
  "rea-specimen-stage": StagePreview,
  "rea-site-header": SiteHeaderPreview,
  "rea-catalog": CatalogPreview,
};

export const REA_THUMBS: Record<string, ReactNode> = {
  "rea-theme": (
    <>
      <ReaAccentDot />
      <ReaNote tone="accent">light · blue</ReaNote>
    </>
  ),
  "rea-slide-navigator": <SlideNavigator index={1} count={4} onChange={() => {}} showPosition={false} />,
  "rea-button": <ReaButton size="sm">Explorar</ReaButton>,
  "rea-tool-button": (
    <ReaToolButton label="Tema">
      <ReaThemeIcon />
    </ReaToolButton>
  ),
  "rea-nav": <ReaNote tone="ink">01 Muestras · 02 Método</ReaNote>,
  "rea-note": <ReaNote tone="accent">[01] Manifiesto</ReaNote>,
  "rea-filter-group": (
    <ReaFilterGroup
      label="Muestra"
      value="a"
      onValueChange={() => {}}
      options={[
        { value: "a", label: "Todo" },
        { value: "b", label: "Tokens" },
      ]}
    />
  ),
  "rea-search-box": <ReaNote>⌕ Buscar… ⌘ K</ReaNote>,
  "rea-specimen-list": <strong style={{ fontSize: 22, letterSpacing: "-0.05em" }}>01 SlideNavigator ↗</strong>,
  "rea-inspector": <ReaNote tone="ink">Tipo · Fuente · QA</ReaNote>,
  "rea-command-palette": <ReaNote tone="ink">⌘K · Comandos</ReaNote>,
  "rea-toast": <ReaNote className="bg-rea-ink px-2.5 py-1.5 text-rea-bg">Aviso</ReaNote>,
  "rea-scroll-progress": (
    <div style={{ width: 160 }}>
      <ReaScrollProgress value={0.42} />
    </div>
  ),
  "rea-grid-overlay": <ReaNote tone="accent">| | | | | | 12 col</ReaNote>,
  "rea-monogram": <ReaMonogram className="h-7 w-12" />,
  "rea-gen-words": <span style={{ fontSize: 22, letterSpacing: "-0.04em" }}>A library of…</span>,
  "rea-wireline": (
    <span style={{ fontSize: 28, color: "transparent", WebkitTextStroke: "1px var(--rea-line-strong)" }}>Find</span>
  ),
  "rea-swatches": (
    <>
      {DEMO_REA_SWATCHES.slice(1, 4).map((s) => (
        <span key={s.value} style={{ width: 18, height: 32, background: s.value }} />
      ))}
    </>
  ),
  "rea-hover-lift": <ReaNote tone="ink">translateY(-3px)</ReaNote>,
  // Miniatura estática: el fondo CSS de anillos que el original usaba antes del shader (v3).
  "rea-terrain": (
    <span
      className="block h-[50px] w-[120px]"
      style={{
        background:
          "repeating-radial-gradient(ellipse at 52% 44%, transparent 0, transparent 6px, color-mix(in srgb, var(--rea-accent) 45%, transparent) 6.5px, transparent 7.5px, transparent 11px)",
      }}
    />
  ),
  "rea-specimen-stage": <span style={{ fontSize: 34, letterSpacing: "-0.06em" }}>01/04</span>,
  "rea-site-header": <ReaNote tone="ink">REA ATLAS / design library</ReaNote>,
  "rea-catalog": <ReaNote tone="ink">Index / 04 entries</ReaNote>,
};
