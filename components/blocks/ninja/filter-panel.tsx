import { ListFilter } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/ninja/button";
import { Label } from "@/components/ui/ninja/label";
import { Panel, PanelContent, PanelTitle, PanelTrigger } from "@/components/ui/ninja/panel";
import { Slider } from "@/components/ui/ninja/slider";
import { Switch } from "@/components/ui/ninja/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/ninja/toggle-group";

const SHAPES = [
  { v: "serif", f: "Georgia, serif" },
  { v: "sans", f: "Arial, sans-serif" },
  { v: "slab", f: "Rockwell, 'Courier New', serif" },
  { v: "mono", f: "ui-monospace, monospace" },
  { v: "display", f: "Impact, sans-serif" },
  { v: "humanist", f: "Optima, Candara, sans-serif" },
  { v: "script", f: "'Brush Script MT', cursive", italic: true },
  { v: "blackletter", f: "'Old English Text MT', serif" },
];

// Bloque compuesto: botón flotante coral + panel con tiles, sliders y switches
/**
 * `visible`: el original mantiene el botón escondido (translateY 80px) hasta
 * que la grilla entra en pantalla, y lo hace subir con easing "back".
 */
export function FilterPanel({ visible = true }: { visible?: boolean }) {
  const [price, setPrice] = React.useState([0, 100]);
  const [open, setOpen] = React.useState(false);
  return (
    <Panel open={open} onOpenChange={setOpen}>
      <PanelTrigger asChild>
        {/* Al abrir, el botón cae fuera de pantalla con easing "back" (400ms, medido en el original) */}
        <Button
          data-hidden={open || !visible || undefined}
          tabIndex={open || !visible ? -1 : undefined}
          aria-hidden={!visible || undefined}
          className="fixed bottom-8 left-1/2 z-40 -translate-x-1/2 transition-[background-color,translate] [transition-duration:var(--duration-color),var(--duration-move)] [transition-timing-function:var(--ease-out-quart),var(--ease-back)] data-[hidden]:translate-y-[80px] data-[hidden]:pointer-events-none"
        >
          <ListFilter /> Filter typefaces
        </Button>
      </PanelTrigger>
      <PanelContent aria-describedby={undefined}>
        <div className="grid gap-8 md:grid-cols-[auto_1fr] md:gap-10">
          <section>
            <PanelTitle className="mb-4 sm:mb-6">Font shape</PanelTitle>
            <ToggleGroup type="multiple" className="w-max">
              {SHAPES.map((s) => (
                <ToggleGroupItem
                  key={s.v}
                  value={s.v}
                  aria-label={s.v}
                  style={{ fontFamily: s.f, fontStyle: s.italic ? "italic" : undefined }}
                >
                  E
                </ToggleGroupItem>
              ))}
              <ToggleGroupItem value="more" aria-label="more">
                •••
              </ToggleGroupItem>
            </ToggleGroup>
          </section>
          <section>
            <p className="mb-4 font-medium sm:mb-6">Font options</p>
            <div className="grid gap-x-10 gap-y-3 sm:grid-cols-2">
              <div className="grid grid-cols-[80px_1fr] items-center gap-y-3">
                {["Contrast", "Width", "Ending", "Weight"].map((l) => (
                  <React.Fragment key={l}>
                    <Label>{l}</Label>
                    <Slider defaultValue={[0]} max={5} step={1} ticks={5} aria-label={l} />
                  </React.Fragment>
                ))}
              </div>
              <div className="grid grid-cols-[96px_1fr] items-center gap-x-4 gap-y-3">
                <Label>Price range</Label>
                <Slider
                  value={price}
                  onValueChange={setPrice}
                  ticks={5}
                  aria-label="Price range"
                  formatLabel={(v) => (v >= 100 ? "$100+" : `${v}`)}
                />
                <Label>Min. styles</Label>
                <Slider defaultValue={[1]} min={1} max={20} aria-label="Min. styles" formatLabel={(v) => `${v}+`} />
                <div className="col-span-2 flex items-center justify-between gap-4">
                  <Label htmlFor="trials">Show only fonts with trials</Label>
                  <Switch id="trials" />
                </div>
                <div className="col-span-2 flex items-center justify-between gap-4">
                  <Label htmlFor="variable">Show only variable fonts</Label>
                  <Switch id="variable" />
                </div>
              </div>
            </div>
          </section>
        </div>
      </PanelContent>
    </Panel>
  );
}
