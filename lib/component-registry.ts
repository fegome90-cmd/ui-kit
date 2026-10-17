/**
 * Registro del banco de componentes (estilo shadcn: el código vive en el repo
 * y se copia/importa desde components/ui). Cada entrada genera una página en
 * /componentes/<slug>.
 */

export interface PropDoc {
  name: string;
  type: string;
  default?: string;
  description: string;
}

export interface ComponentDoc {
  slug: string;
  family: Family;
  name: string;
  category: Category;
  description: string;
  /** Archivos fuente que muestra la pestaña "Código", relativos a la raíz. */
  files: string[];
  usage: string;
  props: PropDoc[];
  notes?: string[];
  /** Madurez. Sin valor: "stable". Un "candidate" explica en `notes` qué le falta. */
  status?: Status;
  /** De dónde sale la implementación. Sin valor: "source-code". */
  provenance?: Provenance;
}

/**
 * stable: verificado y listo para instalar. candidate: se publica, pero tiene QA visual,
 * derechos o comportamiento pendientes.
 */
export const STATUSES = ["stable", "candidate"] as const;
export type Status = (typeof STATUSES)[number];

/**
 * Taxonomía de G2 en docs/origen/rea-atlas/design-to-registry-workflow/SKILL.md.
 * source-code: copiado o reescrito desde código del origen. measured-dom: medido en el DOM de
 * una página autorizada. observed-image: reconstruido desde capturas, sin DOM. inferred: sin
 * evidencia directa.
 */
export const PROVENANCES = ["source-code", "measured-dom", "observed-image", "inferred"] as const;
export type Provenance = (typeof PROVENANCES)[number];

export const PROVENANCE_LABELS: Record<Provenance, string> = {
  "source-code": "Código fuente del origen",
  "measured-dom": "Medido en el DOM",
  "observed-image": "Reconstruido desde capturas",
  inferred: "Inferido",
};

export const statusOf = (c: ComponentDoc): Status => c.status ?? "stable";
export const provenanceOf = (c: ComponentDoc): Provenance => c.provenance ?? "source-code";

/** Origen del componente. Cada familia trae su propio sistema de estilos. */
export const FAMILIES = ["REMI", "Ninja", "Kraa", "REA", "Lab"] as const;
export type Family = (typeof FAMILIES)[number];

/** Tipos de componente. El banco se navega por tipo; la familia es una etiqueta y un filtro. */
export const CATEGORIES = [
  "Acciones",
  "Formularios",
  "Navegación",
  "Barra de herramientas",
  "Indicadores",
  "Gráficos",
  "Revelación",
  "Superficies",
  "Fondos",
  "Tipografía",
  "Movimiento",
  "Iconografía",
  "Bloques",
  "Tema",
] as const;
export type Category = (typeof CATEGORIES)[number];

export const COMPONENTS: ComponentDoc[] = [
  // ---------- REMI (CSS plano bajo .remi) ----------
  {
    slug: "icon-button",
    family: "REMI",
    name: "Botón de ícono",
    category: "Acciones",
    description:
      "Base de todos los íconos clicables de la fila: sin fondo, área mínima 25 px, nombre accesible obligatorio.",
    files: ["components/ui/remi/icon-button.tsx"],
    usage: `<IconButton label="Evolución" onClick={abrir}>\n  <Icon name="chat" color="#2bc77b" />\n</IconButton>`,
    props: [
      { name: "label", type: "string", description: "Obligatorio: tooltip y nombre accesible." },
      { name: "children", type: "ReactNode", description: "El ícono." },
      { name: "className", type: "string", description: "Clases extra; se combinan con cn()." },
      { name: "...rest", type: "ButtonHTMLAttributes", description: "onClick, disabled, etc." },
    ],
  },
  {
    slug: "action-cluster",
    family: "REMI",
    name: "Grupo de acciones",
    category: "Acciones",
    description: "Tres botones unidos: actividades de cuidado (verde/rojo), vista cama y Atender.",
    files: ["components/ui/remi/action-cluster.tsx"],
    usage: `<ActionCluster alert={tieneActividades} context="UPC_CR-3"\n  onCare={…} onBed={…} onAttend={…} />`,
    props: [
      { name: "alert", type: "boolean", default: "false", description: "Primer botón en rojo." },
      { name: "onCare / onBed / onAttend", type: "() => void", description: "Acción de cada botón." },
      { name: "context", type: "string", description: "Sufijo accesible." },
    ],
  },
  {
    slug: "blue-button",
    family: "REMI",
    name: "Botón azul",
    category: "Acciones",
    description: "Botón primario rectangular de la referencia (Buscar, Limpiar).",
    files: ["components/ui/remi/form-controls.tsx"],
    usage: `<BlueButton type="submit">Buscar</BlueButton>`,
    props: [
      { name: "children", type: "ReactNode", description: "Texto." },
      { name: "type", type: '"button" | "submit" | "reset"', default: '"button"', description: "Tipo HTML." },
      { name: "onClick", type: "() => void", description: "Clic." },
    ],
  },
  {
    slug: "filter-select",
    family: "REMI",
    name: "Selector de filtro",
    category: "Formularios",
    description: "Select con el pictograma azul de dos capas y contador opcional.",
    files: ["components/ui/remi/form-controls.tsx"],
    usage: `<FilterSelect label="Servicio" count={0} value={v} onChange={setV}\n  options={[{ value: "all", label: "Todos" }]} />`,
    props: [
      { name: "label", type: "string", description: "Etiqueta visible." },
      { name: "value / onChange", type: "string / (v) => void", description: "Controlado." },
      { name: "options", type: "{ value; label }[]", description: "Opciones." },
      { name: "count", type: "number", description: "Número a la derecha (opcional)." },
    ],
  },
  {
    slug: "filter-input",
    family: "REMI",
    name: "Campo de búsqueda",
    category: "Formularios",
    description: "Input de búsqueda con el pictograma azul.",
    files: ["components/ui/remi/form-controls.tsx"],
    usage: `<FilterInput label="Enfermera" placeholder="Rut/ Nombre Enfermera" value={v} onChange={setV} />`,
    props: [
      { name: "label", type: "string", description: "Etiqueta visible." },
      { name: "value / onChange", type: "string / (v) => void", description: "Controlado." },
      { name: "placeholder", type: "string", description: "Texto de ayuda." },
    ],
  },
  {
    slug: "toggle-switch",
    family: "REMI",
    name: "Interruptor",
    category: "Formularios",
    description: 'Switch ON/OFF accesible (checkbox con role="switch").',
    files: ["components/ui/remi/form-controls.tsx"],
    usage: `<ToggleSwitch label="Paciente activo" checked={on} onChange={setOn} />`,
    props: [
      { name: "label", type: "string", description: "Texto a la derecha." },
      { name: "checked / onChange", type: "boolean / (v) => void", description: "Controlado." },
    ],
  },
  {
    slug: "tool-pill",
    family: "REMI",
    name: "Píldora de herramientas",
    category: "Barra de herramientas",
    description: "Cápsula azul con botones de ícono (imprimir, guardar, actualizar).",
    files: ["components/ui/remi/toolbar.tsx"],
    usage: `<ToolPill tools={[\n  { kind: "print", label: "Imprimir", onClick: () => window.print() },\n  { kind: "refresh", label: "Actualizar", onClick: recargar },\n]} />`,
    props: [
      {
        name: "tools",
        type: '{ kind: "print" | "save" | "refresh"; label; onClick? }[]',
        description: "Botones en orden.",
      },
      { name: "className", type: "string", description: "Posición; en el monitor iba absoluta en la cabecera." },
    ],
  },
  {
    slug: "update-status",
    family: "REMI",
    name: "Estado de actualización",
    category: "Barra de herramientas",
    description: "Triángulo verde y texto “Última actualización a las HH:MM hrs”.",
    files: ["components/ui/remi/toolbar.tsx"],
    usage: `<UpdateStatus time="14:02" />`,
    props: [
      { name: "time", type: "string | null", description: "Hora; null muestra el texto alternativo." },
      { name: "fallback", type: "string", default: '"Vista sintética lista"', description: "Texto sin hora." },
      {
        name: "className",
        type: "string",
        description: "Posición y tamaño; en el monitor iba desplazado en la cabecera.",
      },
    ],
  },
  {
    slug: "dark-button",
    family: "REMI",
    name: "Botón oscuro",
    category: "Acciones",
    description: "Botón con degradado negro y texto celeste de los diálogos (Imprimir, Firmar, Guardar con disquete).",
    files: ["components/ui/remi/dark-button.tsx"],
    usage: `<DarkButton>Firmar</DarkButton>\n<DarkButton icon={<SaveIcon />}>Guardar</DarkButton>`,
    props: [
      { name: "children", type: "ReactNode", description: "Texto." },
      { name: "icon", type: "ReactNode", description: "Ícono a la izquierda (opcional)." },
      { name: "onClick / disabled", type: "() => void / boolean", description: "Acción y estado." },
    ],
  },
  {
    slug: "pager",
    family: "REMI",
    name: "Paginador",
    category: "Navegación",
    description: "Cápsula azul “1 de N” con flechas en círculo, más el resumen “Mostrando 1 a 6 de 6”.",
    files: ["components/ui/remi/navigation.tsx", "components/ui/remi/kit-icons.tsx"],
    usage: `<RangeSummary from={1} to={6} total={6} />\n<Pager page={page} total={3} onPrev={() => setPage(page - 1)} onNext={() => setPage(page + 1)} />`,
    props: [
      {
        name: "page / total",
        type: "number",
        description: "Página actual y total. Las flechas se desactivan en los extremos.",
      },
      { name: "onPrev / onNext", type: "() => void", description: "Navegación." },
    ],
  },
  {
    slug: "status-tabs",
    family: "REMI",
    name: "Pestañas con estado",
    category: "Navegación",
    description:
      "Pestañas de categoría con check verde cuando la sección tiene contenido (Nutrición, Reposo, Medicamentos…).",
    files: ["components/ui/remi/navigation.tsx"],
    usage: `<StatusTabs active={tab} onChange={setTab} tabs={[\n  { id: "nut", label: "Nutrición", done: true },\n  { id: "inv", label: "Invasivos" },\n]} />`,
    props: [
      { name: "tabs", type: "{ id; label; done? }[]", description: "Pestañas; done muestra el check." },
      { name: "active / onChange", type: "string / (id) => void", description: "Controlado." },
    ],
  },
  {
    slug: "soft-button",
    family: "REMI",
    name: "Botón de pie",
    category: "Navegación",
    description:
      "Botón azul plano de las barras inferiores (Sol. de enfermería, Re-programar, Asumir, Tipo de cama); azul claro cuando está desactivado.",
    files: ["components/ui/remi/navigation.tsx"],
    usage: `<SoftButton>Re-programar</SoftButton>\n<SoftButton disabled>Asumir</SoftButton>`,
    props: [
      { name: "children", type: "ReactNode", description: "Texto." },
      { name: "onClick / disabled", type: "() => void / boolean", description: "Acción y estado." },
    ],
  },
  {
    slug: "form-fields",
    family: "REMI",
    name: "Campos de indicación",
    category: "Formularios",
    description: "Select con chevron azul, fecha con calendario, número con unidad y texto, con la etiqueta arriba.",
    files: ["components/ui/remi/fields.tsx", "components/ui/remi/kit-icons.tsx"],
    usage: `<UnitInput label="Dosis" value={dosis} onChange={setDosis} unit="mg" />\n<SelectField label="Vía Administración" placeholder="Vía de administración" value={via} onChange={setVia} options={vias} />\n<DateField label="Fecha inicio" value={inicio} onChange={setInicio} />`,
    props: [
      { name: "label", type: "string", description: "Etiqueta visible (asociada al control)." },
      { name: "value / onChange", type: "string / (v) => void", description: "Controlado." },
      { name: "options / placeholder", type: "SelectField", description: "Opciones y texto inicial en cursiva." },
      { name: "unit", type: "string", default: '"--"', description: "Caja gris de UnitInput." },
      { name: "withTime", type: "boolean", default: "true", description: "DateField con hora." },
      { name: "width", type: "number | string", description: "Ancho del campo." },
    ],
  },
  {
    slug: "kit-icons",
    family: "REMI",
    name: "Íconos de diálogos e indicaciones",
    category: "Iconografía",
    description:
      "Información, chevron, disquete, flechas, calendario, comentario, editar, check, X, reloj, intercambio, re-programar y H.",
    files: ["components/ui/remi/kit-icons.tsx"],
    usage: `<CheckCircle size={18} />\n<ClockIcon />\n<CommentIcon highlight />`,
    props: [
      { name: "size", type: "number", description: "Ancho y alto en px (cada ícono tiene su tamaño por defecto)." },
      { name: "className", type: "string", description: "Clase opcional." },
    ],
  },
  {
    slug: "icons",
    family: "REMI",
    name: "Íconos",
    category: "Iconografía",
    description: "Set SVG redibujado para el prototipo, más la cruz gruesa y el QR.",
    files: ["components/ui/remi/icons.tsx", "components/ui/remi/icon-shapes.ts"],
    usage: `<Icon name="nurse" />\n<Icon name="chat" color="#2bc77b" size={21} />\n<PlusIcon />\n<QrIcon />`,
    props: [
      { name: "name", type: "IconName", description: "Clave de ICON_SHAPES." },
      { name: "color", type: "string", default: '"currentColor"', description: "Reemplaza currentColor del trazado." },
      { name: "size", type: "number", default: "23", description: "Ancho y alto en px." },
    ],
    notes: ["Los SVG son constantes del código; nunca pasar datos de pacientes por estos componentes."],
  },

  // ---------- Ninja (Tailwind v4 + Radix + cva) ----------
  {
    slug: "ninja-button",
    family: "Ninja",
    name: "Botón",
    category: "Acciones",
    description: "Píldora coral de 48 px con variantes secundaria, contorno, fantasma, enlace e ícono. Admite asChild.",
    files: ["components/ui/ninja/button.tsx", "lib/utils.ts"],
    usage: `<Button>Primario</Button>
<Button variant="outline" size="sm">Contorno</Button>
<Button variant="icon" size="icon" aria-label="Buscar"><Search /></Button>`,
    props: [
      {
        name: "variant",
        type: '"default" | "secondary" | "outline" | "ghost" | "link" | "icon"',
        default: '"default"',
        description: "Estilo visual.",
      },
      { name: "size", type: '"default" | "sm" | "lg" | "icon"', default: '"default"', description: "Alto y relleno." },
      { name: "asChild", type: "boolean", default: "false", description: "Delega el render en el hijo (Radix Slot)." },
    ],
    notes: ["El coral original con texto blanco da 3,4:1. Usa la clase theme-aa para llegar a AA (4,5:1)."],
  },
  {
    slug: "ninja-badge",
    family: "Ninja",
    name: "Insignia",
    category: "Indicadores",
    description: "Píldora de 20 px, texto 12/500, en coral, gris, contorno u oscura.",
    files: ["components/ui/ninja/badge.tsx", "lib/utils.ts"],
    usage: `<Badge>Nuevo</Badge>
<Badge variant="outline">Prueba</Badge>`,
    props: [
      {
        name: "variant",
        type: '"default" | "secondary" | "outline" | "dark"',
        default: '"default"',
        description: "Color de la píldora.",
      },
    ],
  },
  {
    slug: "ninja-card",
    family: "Ninja",
    name: "Tarjeta",
    category: "Superficies",
    description: "Tarjeta blanca de radio 32 px con Content, Footer, Title y Description. Usa overflow: clip.",
    files: ["components/ui/ninja/card.tsx", "lib/utils.ts"],
    usage: `<Card>
  <CardContent>…</CardContent>
  <CardFooter>
    <CardTitle>Fraunces</CardTitle>
    <CardDescription>18 estilos</CardDescription>
  </CardFooter>
</Card>`,
    props: [{ name: "className", type: "string", description: "Se combina con cn() en cada parte." }],
  },
  {
    slug: "ninja-input",
    family: "Ninja",
    name: "Campo de texto",
    category: "Formularios",
    description: "Input de 48 px con borde de 1,5 px y anillo de foco coral.",
    files: ["components/ui/ninja/input.tsx", "lib/utils.ts"],
    usage: `<Label htmlFor="q">Buscar</Label>
<Input id="q" placeholder="Buscar una tipografía…" />`,
    props: [{ name: "...props", type: 'ComponentProps<"input">', description: "Props nativas del input." }],
  },
  {
    slug: "ninja-label",
    family: "Ninja",
    name: "Etiqueta",
    category: "Formularios",
    description: "Label nativo de 15 px para campos, sliders y switches.",
    files: ["components/ui/ninja/label.tsx", "lib/utils.ts"],
    usage: `<Label htmlFor="trial">Solo con prueba</Label>`,
    props: [{ name: "htmlFor", type: "string", description: "id del control asociado." }],
  },
  {
    slug: "ninja-separator",
    family: "Ninja",
    name: "Separador y raya",
    category: "Superficies",
    description: "Separator es una línea de 2 px. Dash es la raya negra de 32×4 px que va sobre los titulares.",
    files: ["components/ui/ninja/separator.tsx", "lib/utils.ts"],
    usage: `<Dash />
<h2>Componentes</h2>
<Separator className="my-6" />`,
    props: [{ name: "className", type: "string", description: "Ajusta márgenes o color." }],
  },
  {
    slug: "ninja-slider",
    family: "Ninja",
    name: "Deslizador",
    category: "Formularios",
    description: "Track de 2 px con tramo coral. Thumb con punto o píldora con valor, marcas opcionales y rango.",
    files: ["components/ui/ninja/slider.tsx", "lib/utils.ts"],
    usage: `<Slider defaultValue={[2]} max={5} step={1} ticks={5} aria-label="Peso" />
<Slider defaultValue={[0, 100]} aria-label="Precio" formatLabel={(v) => \`\${v}\`} />`,
    props: [
      { name: "ticks", type: "number", default: "0", description: "Cantidad de segmentos dibujados en el track." },
      { name: "formatLabel", type: "(v: number) => string", description: "Muestra el valor dentro del thumb." },
      {
        name: "thumbLabels",
        type: "string[]",
        description: "Nombre accesible por thumb; si falta, se deriva de aria-label.",
      },
    ],
  },
  {
    slug: "ninja-switch",
    family: "Ninja",
    name: "Interruptor",
    category: "Formularios",
    description: "Switch de 30×18 px, gris apagado y coral encendido. Área táctil ampliada a 42×30 px.",
    files: ["components/ui/ninja/switch.tsx", "lib/utils.ts"],
    usage: `<Label htmlFor="var">Solo variables</Label>
<Switch id="var" defaultChecked />`,
    props: [
      { name: "checked", type: "boolean", description: "Estado controlado." },
      { name: "onCheckedChange", type: "(checked: boolean) => void", description: "Cambio de estado." },
    ],
  },
  {
    slug: "ninja-toggle-group",
    family: "Ninja",
    name: "Grupo de selección",
    category: "Formularios",
    description: "Tiles de 48×40 px con borde y sombra suave; el activo pasa a coral.",
    files: ["components/ui/ninja/toggle-group.tsx", "lib/utils.ts"],
    usage: `<ToggleGroup type="single" defaultValue="sans" aria-label="Forma">
  <ToggleGroupItem value="serif">E</ToggleGroupItem>
  <ToggleGroupItem value="sans">E</ToggleGroupItem>
</ToggleGroup>`,
    props: [
      { name: "type", type: '"single" | "multiple"', description: "Selección única o múltiple (Radix)." },
      { name: "value / defaultValue", type: "string | string[]", description: "Valor seleccionado." },
    ],
  },
  {
    slug: "ninja-text-link",
    family: "Ninja",
    name: "Enlace con flecha",
    category: "Tipografía",
    description: "Enlace coral en línea con flecha ↗ opcional.",
    files: ["components/ui/ninja/text-link.tsx", "lib/utils.ts"],
    usage: `<TextLink href="#componentes">Ver los componentes</TextLink>`,
    props: [{ name: "arrow", type: "boolean", default: "true", description: "Muestra la flecha ↗." }],
  },
  {
    slug: "ninja-animated-headline",
    family: "Ninja",
    name: "Titular animado",
    category: "Tipografía",
    description:
      "Wordmark a todo el ancho que rota entre tipografías letra por letra. Se pausa con hover, foco, pestaña oculta y movimiento reducido.",
    files: ["components/ui/ninja/animated-headline.tsx", "lib/utils.ts"],
    usage: `<AnimatedHeadline
  text="TYPE INDEX"
  fonts={[{ family: "'Fraunces Variable'", weight: 600, label: "Fraunces" }, …]}
/>`,
    props: [
      { name: "text", type: "string", description: "Texto del titular." },
      { name: "fonts", type: "HeadlineFont[]", description: "Tipografías entre las que rota." },
      { name: "interval", type: "number", default: "2600", description: "ms que cada tipografía queda quieta." },
      { name: "pauseControl", type: "boolean", default: "true", description: "Botón de pausa (WCAG 2.2.2)." },
    ],
    notes: ["Las fuentes de muestra salen de Fontsource y se cargan en styles/ninja-demo-fonts.css."],
  },
  {
    slug: "ninja-menu-toggle",
    family: "Ninja",
    name: "Botón de menú",
    category: "Navegación",
    description: "Burger de tres barras que se transforma en X; la barra central colapsa con 140 ms de retraso.",
    files: ["components/ui/ninja/menu-toggle.tsx", "lib/utils.ts"],
    usage: `<MenuToggle open={open} onOpenChange={setOpen} />`,
    props: [
      { name: "open", type: "boolean", description: "Estado; define aria-expanded y el nombre accesible." },
      { name: "onOpenChange", type: "(open: boolean) => void", description: "Se llama al hacer clic." },
    ],
  },
  {
    slug: "ninja-navbar",
    family: "Ninja",
    name: "Barra de navegación",
    category: "Navegación",
    description:
      "Header sticky con links de escritorio (desde 1020 px) y menú del burger en popover. Los ítems mobileOnly solo se ven bajo 1020 px.",
    files: ["components/ui/ninja/navbar.tsx", "components/ui/ninja/menu-toggle.tsx", "lib/utils.ts"],
    usage: `<Navbar>
  <a href="/">Inicio</a>
  <NavbarLinks>
    <NavbarLink href="#" active>Fuentes</NavbarLink>
  </NavbarLinks>
  <NavbarMenu>
    <NavbarMenuItem href="#" icon={<Info />}>Acerca de</NavbarMenuItem>
  </NavbarMenu>
</Navbar>`,
    props: [
      { name: "NavbarLink.active", type: "boolean", description: 'Marca la página actual (aria-current="page").' },
      { name: "NavbarMenuItem.mobileOnly", type: "boolean", description: "Solo bajo 1020 px." },
      { name: "NavbarMenuItem.icon", type: "ReactNode", description: "Ícono a la izquierda." },
    ],
  },
  {
    slug: "ninja-panel",
    family: "Ninja",
    name: "Panel flotante",
    category: "Superficies",
    description:
      "Panel inferior sobre Radix Dialog, sin overlay oscuro: radio 32 px y sombra de 80 px. En móvil funciona como bottom sheet.",
    files: ["components/ui/ninja/panel.tsx", "lib/utils.ts"],
    usage: `<Panel>
  <PanelTrigger asChild><Button>Filtrar</Button></PanelTrigger>
  <PanelContent aria-describedby={undefined}>
    <PanelTitle>Filtros</PanelTitle>
    …
  </PanelContent>
</Panel>`,
    props: [
      { name: "Panel.open / onOpenChange", type: "boolean / (open) => void", description: "Control opcional (Radix)." },
      { name: "PanelContent", type: "Dialog.Content", description: "Incluye el botón Cerrar." },
    ],
  },
  {
    slug: "ninja-font-card",
    family: "Ninja",
    name: "Tarjeta de tipografía",
    category: "Bloques",
    description:
      "Espécimen «Aa» con metadatos. Con hover o foco de teclado muestra un pangrama, un slider de tamaño y un marcador.",
    files: ["components/blocks/ninja/font-card.tsx", "components/ui/ninja/card.tsx", "components/ui/ninja/slider.tsx"],
    usage: `<FontCard name="Fraunces" foundry="Undercase Type" price="$0" styles={18} fontFamily="'Fraunces Variable'" />`,
    props: [
      { name: "name / foundry / price / styles", type: "string / string / string / number", description: "Metadatos." },
      { name: "fontFamily", type: "string", description: "Familia CSS del espécimen." },
      { name: "bookmarked / onBookmarkChange", type: "boolean / (v) => void", description: "Estado del marcador." },
    ],
  },
  {
    slug: "ninja-filter-panel",
    family: "Ninja",
    name: "Panel de filtros",
    category: "Bloques",
    description:
      "Botón flotante «Filter» que abre el panel con forma, opciones, sliders y switches. El botón se esconde cuando visible es false.",
    files: [
      "components/blocks/ninja/filter-panel.tsx",
      "components/ui/ninja/panel.tsx",
      "components/ui/ninja/toggle-group.tsx",
    ],
    usage: `<FilterPanel visible={gridInView} />`,
    props: [{ name: "visible", type: "boolean", default: "true", description: "Muestra el botón flotante." }],
    notes: ["El botón es position: fixed; en el banco aparece abajo, al centro de la ventana."],
  },
  // ---------- Kraa (CSS con tokens --kraa-* + Radix) ----------
  {
    slug: "kraa-theme",
    family: "Kraa",
    name: "Proveedor de tema",
    category: "Tema",
    description:
      "KraaProvider envuelve el contenido en .kraa-theme con tema claro u oscuro. Todo componente Kraa debe ir dentro.",
    files: ["components/ui/kraa/kraa-theme.tsx", "lib/utils.ts"],
    usage: `<KraaProvider theme="dark">
  <KraaButton>Hola</KraaButton>
</KraaProvider>`,
    props: [
      { name: "theme", type: '"light" | "dark"', default: '"dark"', description: "Tema del subárbol." },
      { name: "→ useKraaTheme()", type: "KraaTheme", description: "Tema actual; los portales lo replican." },
    ],
  },
  {
    slug: "kraa-button",
    family: "Kraa",
    name: "Botón",
    category: "Acciones",
    description: "Botón discreto con variantes surface, accent y danger, y tamaños icon y row.",
    files: ["components/ui/kraa/kraa-button.tsx", "lib/utils.ts"],
    usage: `<KraaButton variant="accent">Compartir</KraaButton>`,
    props: [
      {
        name: "variant",
        type: '"quiet" | "surface" | "accent" | "danger"',
        default: '"quiet"',
        description: "Estilo.",
      },
      { name: "size", type: '"default" | "icon" | "row"', default: '"default"', description: "Tamaño." },
    ],
  },
  {
    slug: "kraa-field",
    family: "Kraa",
    name: "Campos",
    category: "Formularios",
    description: "Primitivas de formulario: FieldGroup, Field, FieldSet, FieldLegend, FieldLabel y Select.",
    files: ["components/ui/kraa/kraa-field.tsx", "lib/utils.ts"],
    usage: `<KraaFieldSet>
  <KraaFieldLegend>Tipografía</KraaFieldLegend>
  <KraaField>
    <KraaFieldLabel htmlFor="f">Familia</KraaFieldLabel>
    <KraaSelect id="f">…</KraaSelect>
  </KraaField>
</KraaFieldSet>`,
    props: [{ name: "...props", type: "props nativas", description: "Cada parte envuelve su elemento nativo." }],
  },
  {
    slug: "kraa-search-input",
    family: "Kraa",
    name: "Búsqueda",
    category: "Formularios",
    description: "Input de búsqueda con lupa y etiqueta accesible oculta.",
    files: ["components/ui/kraa/kraa-search-input.tsx", "lib/utils.ts"],
    usage: `<KraaSearchInput value={q} onValueChange={setQ} />`,
    props: [
      { name: "label", type: "string", default: '"Buscar documentos"', description: "Nombre accesible." },
      { name: "size", type: '"default" | "row"', default: '"default"', description: "Tamaño." },
      { name: "onValueChange", type: "(value: string) => void", description: "Texto escrito." },
    ],
  },
  {
    slug: "kraa-document-list-item",
    family: "Kraa",
    name: "Ítem de documento",
    category: "Navegación",
    description: "Botón con título, extracto y metadatos de un documento. El seleccionado lleva aria-current.",
    files: [
      "components/ui/kraa/kraa-document-list-item.tsx",
      "components/ui/kraa/kraa-avatar.tsx",
      "lib/kraa/kraa-model.ts",
    ],
    usage: `<KraaDocumentListItem document={doc} selected onClick={() => abrir(doc.id)} />`,
    props: [
      { name: "document", type: "DocumentItem", description: "Datos del documento." },
      { name: "selected", type: "boolean", default: "false", description: "Marca el actual." },
    ],
  },
  {
    slug: "kraa-range-slider",
    family: "Kraa",
    name: "Deslizador",
    category: "Formularios",
    description: "Slider de 28 px de alto con valores debajo; admite un valor o un rango.",
    files: ["components/ui/kraa/kraa-range-slider.tsx", "lib/utils.ts"],
    usage: `<KraaRangeSlider label="Tamaño" min={12} max={40} value={[16]} onValueChange={setSize} />`,
    props: [
      { name: "label", type: "string", description: "Nombre accesible (agrega mínimo/máximo en rangos)." },
      { name: "thumbLabels", type: "string[]", description: "Nombres por thumb." },
    ],
  },
  {
    slug: "kraa-toggle-group",
    family: "Kraa",
    name: "Grupo de selección",
    category: "Formularios",
    description: "Selector segmentado de opción única; no permite quedar sin selección.",
    files: ["components/ui/kraa/kraa-toggle-group.tsx"],
    usage: `<KraaToggleGroup label="Escala" value={mode} onValueChange={setMode} choices={[{ value: "static", label: "Estática" }]} />`,
    props: [
      { name: "label", type: "string", description: "Nombre accesible del grupo." },
      { name: "choices", type: "KraaChoice[]", description: "Opciones { value, label, disabled? }." },
    ],
  },
  {
    slug: "kraa-member-role-row",
    family: "Kraa",
    name: "Fila de miembro",
    category: "Indicadores",
    description: "Avatar (imagen o iniciales), nombre, metadato y rol. Si la imagen falla, muestra las iniciales.",
    files: ["components/ui/kraa/kraa-member-role-row.tsx", "components/ui/kraa/kraa-avatar.tsx"],
    usage: `<KraaMemberRoleRow name="Ana Ruiz" role="Editora" meta="ana@ejemplo.test" />`,
    props: [
      { name: "name / role", type: "string", description: "Texto principal y rol." },
      { name: "avatarUrl", type: "string", description: "Imagen opcional." },
      { name: "trailing", type: "ReactNode", description: "Acción al final de la fila." },
    ],
  },
  {
    slug: "kraa-document-actions",
    family: "Kraa",
    name: "Menú de acciones",
    category: "Acciones",
    description:
      "Menú desplegable con Ajustes, Favorito y Eliminar. Si falta su callback, la acción queda deshabilitada.",
    files: ["components/ui/kraa/kraa-document-actions.tsx", "components/ui/kraa/kraa-button.tsx"],
    usage: `<KraaDocumentActions favorite={fav} onFavoriteChange={setFav} onDelete={borrar} />`,
    props: [
      { name: "favorite / onFavoriteChange", type: "boolean / (v) => void", description: "Estado del favorito." },
      { name: "onSettings / onDelete", type: "() => void", description: "Sin callback, el ítem se deshabilita." },
    ],
    notes: ["No implementa permisos ni borrado en servidor: solo llama a los callbacks."],
  },
  {
    slug: "kraa-document-sidebar",
    family: "Kraa",
    name: "Barra de documentos",
    category: "Bloques",
    description: "Lista lateral plegable con búsqueda sin tildes, botón Nuevo y estado vacío anunciado.",
    files: ["components/blocks/kraa/kraa-document-sidebar.tsx", "lib/kraa/kraa-model.ts"],
    usage: `<KraaDocumentSidebar documents={docs} selectedId={id} onSelect={setId} onNew={crear} />`,
    props: [
      { name: "documents", type: "DocumentItem[]", description: "Documentos a listar." },
      { name: "open / onOpenChange", type: "boolean / (v) => void", description: "Plegado controlado (opcional)." },
      { name: "collapsible", type: "boolean", default: "true", description: "Muestra el botón de plegar." },
    ],
  },
  {
    slug: "kraa-reading-canvas",
    family: "Kraa",
    name: "Lienzo de lectura",
    category: "Tipografía",
    description: "Documento con título, subtítulo, metadatos y cuerpo. Aplica tamaño, interlineado y ancho de lectura.",
    files: ["components/blocks/kraa/kraa-reading-canvas.tsx", "lib/kraa/kraa-model.ts"],
    usage: `<KraaReadingCanvas title="Notas" author="Ana" settings={typography}>
  <p>Contenido.</p>
</KraaReadingCanvas>`,
    props: [
      { name: "title / subtitle", type: "string", description: "Encabezado del documento." },
      { name: "settings", type: "Partial<TypographyConfig>", description: "Se normaliza con normalizeTypography()." },
      { name: "actions", type: "ReactNode", description: "Acciones en la barra superior." },
    ],
    notes: ["Es una composición de lectura, no un editor con persistencia."],
  },
  {
    slug: "kraa-typography-settings",
    family: "Kraa",
    name: "Ajustes de lectura",
    category: "Bloques",
    description:
      "Familia, tamaño, interlineado, ancho y escala con vista previa. Restablecer vuelve a los valores base.",
    files: ["components/blocks/kraa/kraa-typography-settings.tsx", "lib/kraa/kraa-model.ts"],
    usage: `<KraaTypographySettings value={typography} onValueChange={setTypography} />`,
    props: [
      { name: "value / onValueChange", type: "TypographyConfig / (v) => void", description: "Estado controlado." },
      {
        name: "licensedSuisseAvailable",
        type: "boolean",
        default: "false",
        description: "Ofrece SuisseIntl solo si tienes la licencia.",
      },
    ],
  },
  {
    slug: "kraa-document-workspace",
    family: "Kraa",
    name: "Espacio de trabajo",
    category: "Bloques",
    description:
      "Barra de documentos más área principal. Bajo 700 px la barra se convierte en una hoja lateral (Radix Dialog).",
    files: ["components/blocks/kraa/kraa-document-workspace.tsx", "components/blocks/kraa/kraa-document-sidebar.tsx"],
    usage: `<KraaDocumentWorkspace documents={docs} selectedId={id} onSelect={setId}>
  <KraaReadingCanvas title="Notas">…</KraaReadingCanvas>
</KraaDocumentWorkspace>`,
    props: [
      { name: "...sidebar", type: "KraaDocumentSidebarProps", description: "Se pasan a la barra." },
      { name: "children", type: "ReactNode", description: "Contenido principal." },
    ],
  },
  // ---------- REA (CSS con tokens --rea-* bajo .rea-theme) ----------
  {
    slug: "rea-theme",
    family: "REA",
    name: "Proveedor de tema",
    category: "Tema",
    description:
      "ReaProvider acota los tokens de REA Atlas a un contenedor, con tema claro u oscuro y acento azul, naranjo o lima.",
    files: ["components/ui/rea/rea-theme.tsx", "styles/rea.css"],
    usage: `const [theme, setTheme] = useState<ReaTheme>("light");
<ReaProvider theme={theme} accent="blue" surface>
  <ReaButton>Explorar</ReaButton>
</ReaProvider>`,
    props: [
      { name: "theme", type: '"light" | "dark"', default: '"light"', description: "Tema del subárbol." },
      { name: "accent", type: '"blue" | "orange" | "lime"', default: '"blue"', description: "Color de acento." },
      { name: "surface", type: "boolean", default: "false", description: "Pinta el fondo del tema." },
      { name: "→ nextAccent(a)", type: "ReaAccent", description: "Siguiente acento del ciclo." },
    ],
    notes: ["En el sitio original el tema vivía en :root; aquí se acota para convivir con las otras familias."],
  },
  {
    slug: "rea-slide-navigator",
    family: "REA",
    name: "Navegador de diapositivas",
    category: "Navegación",
    description:
      "Flechas, puntos y contador para un deck. Controlado: el padre guarda el índice. ←, →, Inicio y Fin con el foco dentro.",
    files: ["components/ui/rea/slide-navigator.tsx", "styles/rea.css"],
    usage: `const [i, setI] = useState(0);
<SlideNavigator index={i} count={5} onChange={setI} />`,
    props: [
      { name: "index", type: "number", description: "Índice activo de base cero; se limita al rango." },
      { name: "count", type: "number", description: "Total de diapositivas; con 0 no se renderiza." },
      { name: "onChange", type: "(index: number) => void", description: "Siempre recibe un índice válido." },
      { name: "showPosition", type: "boolean", default: "true", description: "Muestra «n / total»." },
    ],
    status: "candidate",
    notes: [
      "QA visual pendiente. Usa el azul FALP #004990 como respaldo (rights: review-required).",
      "Los atajos globales son del presentador, no del componente.",
    ],
  },
  {
    slug: "rea-button",
    family: "REA",
    name: "Botón píldora",
    category: "Acciones",
    description: "Píldora sólida o fantasma con flecha que se desplaza en hover. Con href se renderiza como enlace.",
    files: ["components/ui/rea/rea-button.tsx", "components/ui/rea/use-magnetic.ts"],
    usage: `<ReaButton href="#catalogo">Explorar componentes</ReaButton>
<ReaButton variant="ghost" arrow="↓">Cómo funciona</ReaButton>`,
    props: [
      { name: "variant", type: '"solid" | "ghost"', default: '"solid"', description: "Relleno o borde." },
      { name: "size", type: '"default" | "sm"', default: '"default"', description: "52 px o 39 px de alto." },
      { name: "arrow", type: '"↗" | "↓" | "→" | null', default: '"↗"', description: "Flecha final." },
      { name: "magnetic", type: "boolean", default: "false", description: "Sigue al puntero (solo puntero fino)." },
    ],
  },
  {
    slug: "rea-tool-button",
    family: "REA",
    name: "Botón de herramienta",
    category: "Acciones",
    description:
      "Botón cuadrado con borde fino para la barra de herramientas. Incluye ícono de tema y punto de acento.",
    files: ["components/ui/rea/rea-tool-button.tsx", "components/ui/rea/use-magnetic.ts"],
    usage: `<ReaToolButton label="Alternar tema" onClick={toggle}><ReaThemeIcon /></ReaToolButton>
<ReaToolButton label="Cambiar acento" onClick={cycle}><ReaAccentDot /></ReaToolButton>`,
    props: [
      { name: "label", type: "string", description: "Nombre accesible y tooltip (obligatorio)." },
      { name: "magnetic", type: "boolean", default: "false", description: "Sigue al puntero." },
    ],
  },
  {
    slug: "rea-nav",
    family: "REA",
    name: "Navegación rodante",
    category: "Navegación",
    description:
      "Links numerados cuyo texto sube y deja entrar una copia en acento al pasar el puntero o con foco. La copia no se lee.",
    files: ["components/ui/rea/rea-nav.tsx"],
    usage: `<ReaNav items={[{ href: "#catalogo", label: "Muestras" }]} current="#catalogo" />`,
    props: [
      { name: "items", type: "ReaNavItem[]", description: "{ href, label }." },
      { name: "current", type: "string", description: 'href activo (aria-current="page").' },
    ],
  },
  {
    slug: "rea-note",
    family: "REA",
    name: "Nota técnica",
    category: "Tipografía",
    description: "Texto mono en mayúsculas para rótulos y metadatos, y la cabecera de sección con dos notas.",
    files: ["components/ui/rea/rea-note.tsx"],
    usage: `<ReaNote tone="accent">01 · REA / COMPONENT</ReaNote>
<ReaSectionHead title="[01] Manifiesto" aside="fig. 01" />`,
    props: [
      { name: "tone", type: '"muted" | "ink" | "accent"', default: '"muted"', description: "Color." },
      { name: "ReaSectionHead.title / aside", type: "string", description: "Notas izquierda y derecha." },
    ],
  },
  {
    slug: "rea-filter-group",
    family: "REA",
    name: "Grupo de filtros",
    category: "Formularios",
    description: "Opción única con botones aria-pressed, en chips o subrayado con conteo. Siempre hay una activa.",
    files: ["components/ui/rea/rea-filter-group.tsx"],
    usage: `<ReaFilterGroup label="Filtrar por tipo" value={tipo} onValueChange={setTipo}
  options={[{ value: "all", label: "Todo" }, { value: "tokens", label: "Tokens" }]} />`,
    props: [
      { name: "label", type: "string", description: "Nombre accesible del grupo." },
      { name: "variant", type: '"chip" | "underline"', default: '"chip"', description: "Estilo." },
      { name: "options", type: "ReaFilterOption[]", description: "{ value, label, count? }." },
    ],
  },
  {
    slug: "rea-search-box",
    family: "REA",
    name: "Búsqueda",
    category: "Formularios",
    description: "Campo de búsqueda con lupa, etiqueta accesible oculta y rótulo de atajo opcional.",
    files: ["components/ui/rea/rea-search-box.tsx"],
    usage: `<ReaSearchBox label="Buscar en la biblioteca" value={q} onValueChange={setQ} shortcut="⌘ K" />`,
    props: [
      { name: "label", type: "string", description: "Nombre accesible." },
      { name: "shortcut", type: "string", description: "Solo informa; el atajo lo registra quien lo usa." },
    ],
  },
  {
    slug: "rea-specimen-list",
    family: "REA",
    name: "Índice de muestras",
    category: "Navegación",
    description:
      "Filas grandes numeradas que se invierten con hover o foco; la seleccionada va en acento. Estado vacío anunciado.",
    files: ["components/ui/rea/rea-specimen-list.tsx", "lib/rea/rea-utils.ts"],
    usage: `<ReaSpecimenList items={items} selectedId={id} onSelect={setId} />`,
    props: [
      { name: "items", type: "ReaSpecimen[]", description: "{ id, title, meta? }." },
      { name: "selectedId / onSelect", type: "string / (id) => void", description: "Selección controlada." },
      { name: "emptyText", type: "string", description: "Texto cuando no hay elementos." },
    ],
  },
  {
    slug: "rea-inspector",
    family: "REA",
    name: "Inspector",
    category: "Superficies",
    description:
      "Filas clave/valor (lista de descripción) y bloque de código oscuro con copiar. Si el portapapeles falla, lo dice.",
    files: ["components/ui/rea/rea-inspector.tsx"],
    usage: `<ReaDetailRows rows={[{ key: "Tipo", value: "Componente React" }]} />
<ReaCodeBox code={cmd} badge="Ejemplo" onCopyResult={(ok) => toast(ok ? "Copiado" : "No se pudo copiar")} />`,
    props: [
      { name: "ReaDetailRows.rows", type: "ReaDetail[]", description: "{ key, value }." },
      { name: "ReaCodeBox.code", type: "string", description: "Texto que se muestra y copia." },
      { name: "ReaCodeBox.onCopyResult", type: "(ok: boolean) => void", description: "Resultado real de la copia." },
    ],
  },
  {
    slug: "rea-command-palette",
    family: "REA",
    name: "Paleta de comandos",
    category: "Navegación",
    description:
      "Diálogo nativo con búsqueda sin tildes y lista de acciones. ⌘K / Ctrl+K con useCommandShortcut; Escape y clic afuera cierran.",
    files: ["components/ui/rea/rea-command-palette.tsx", "lib/rea/rea-utils.ts"],
    usage: `const [open, setOpen] = useState(false);
useCommandShortcut(() => setOpen(true));
<ReaCommandPalette open={open} onOpenChange={setOpen} commands={cmds} onSelect={run} />`,
    props: [
      { name: "open / onOpenChange", type: "boolean / (open) => void", description: "Estado controlado." },
      { name: "commands", type: "ReaCommand[]", description: "{ id, label, hint?, keywords? }." },
      { name: "onSelect", type: "(id: string) => void", description: "Se llama tras cerrar." },
      { name: "→ useCommandShortcut(fn)", type: "void", description: "Registra ⌘K / Ctrl+K en el documento." },
    ],
    notes: ["<dialog> con showModal(): el foco entra, queda atrapado y vuelve al disparador al cerrar."],
  },
  {
    slug: "rea-toast",
    family: "REA",
    name: "Aviso",
    category: "Indicadores",
    description: "Mensaje breve abajo a la derecha (role=status). useReaToast lo oculta solo a los 3,7 s.",
    files: ["components/ui/rea/rea-toast.tsx"],
    usage: `const { message, show } = useReaToast();
<ReaToast message={message} />
show("Ejemplo copiado");`,
    props: [
      { name: "message", type: "string | null", description: "Texto; null lo oculta." },
      { name: "→ useReaToast(duration)", type: "{ message, show }", description: "Estado del aviso." },
    ],
  },
  {
    slug: "rea-scroll-progress",
    family: "REA",
    name: "Progreso de lectura",
    category: "Indicadores",
    description:
      "Regla graduada con barra de acento y porcentaje (progressbar). useScrollProgress mide página o contenedor.",
    files: ["components/ui/rea/rea-scroll-progress.tsx", "lib/rea/rea-utils.ts"],
    usage: `const progress = useScrollProgress(ref);
<ReaScrollProgress value={progress} />`,
    props: [
      { name: "value", type: "number", description: "0..1; valores no finitos cuentan como 0." },
      { name: "showLabel", type: "boolean", default: "true", description: "Etiqueta con el porcentaje." },
    ],
  },
  {
    slug: "rea-grid-overlay",
    family: "REA",
    name: "Retícula superpuesta",
    category: "Superficies",
    description: "Columnas tenues en acento para revisar alineación. useGridShortcut la alterna con Alt+G.",
    files: ["components/ui/rea/rea-grid-overlay.tsx"],
    usage: `const [on, setOn] = useState(false);
useGridShortcut(() => setOn((v) => !v));
<ReaGridOverlay visible={on} />`,
    props: [
      { name: "visible", type: "boolean", description: "Muestra la retícula." },
      { name: "columns", type: "number", default: "12", description: "Cantidad de columnas." },
      { name: "contained", type: "boolean", default: "false", description: "Se ajusta al contenedor." },
    ],
  },
  {
    slug: "rea-monogram",
    family: "REA",
    name: "Monograma y preloader",
    category: "Movimiento",
    description:
      "Monograma RA que se traza al montar, y pantalla de carga con porcentaje. El preloader es decorativo y no aparece con movimiento reducido.",
    files: ["components/ui/rea/rea-monogram.tsx", "lib/rea/use-reduced-motion.ts"],
    usage: `<ReaMonogram label="Monograma de REA Atlas" />
<ReaPreloader duration={900} onDone={() => setReady(true)} />`,
    props: [
      { name: "ReaMonogram.label", type: "string", description: "Si falta, el SVG es decorativo." },
      { name: "ReaPreloader.duration", type: "number", default: "900", description: "ms hasta 100 %." },
      { name: "ReaPreloader.fullscreen", type: "boolean", default: "false", description: "Cubre la ventana." },
    ],
    notes: ["No espera recursos reales: no lo uses para tapar contenido que ya está listo."],
  },
  {
    slug: "rea-gen-words",
    family: "REA",
    name: "Frase que se compila",
    category: "Movimiento",
    description:
      "Las palabras pasan de borrosas a nítidas una tras otra, con un cursor de acento. El texto completo se lee de una vez.",
    files: ["components/ui/rea/rea-motion-text.tsx"],
    usage: `<ReaGenWords text="A library of interfaces, motion and reusable systems." />`,
    props: [
      { name: "text", type: "string", description: "Frase completa." },
      { name: "as", type: '"p" | "h1" | "h2" | "h3" | "span"', default: '"p"', description: "Elemento." },
      { name: "start", type: "number", default: "0.2", description: "Segundos antes de la primera palabra." },
    ],
  },
  {
    slug: "rea-wireline",
    family: "REA",
    name: "Titular en contorno",
    category: "Movimiento",
    description: "Texto en contorno que se rellena según el desplazamiento o al pasar el puntero.",
    files: ["components/ui/rea/rea-motion-text.tsx", "lib/rea/use-reduced-motion.ts"],
    usage: `<ReaWireline text="Find the detail." measure="type / step-4" />`,
    props: [
      { name: "text", type: "string", description: "Titular." },
      { name: "progress", type: "number", description: "0..1 manual; si falta, sigue al scroll." },
      { name: "measure", type: "string", description: "Rótulo técnico sobre la línea." },
    ],
    notes: ["Con movimiento reducido se muestra relleno y sin barrido."],
  },
  {
    slug: "rea-swatches",
    family: "REA",
    name: "Muestras de color",
    category: "Tema",
    description: "Tira de colores con su valor escrito en cada muestra.",
    files: ["components/ui/rea/rea-swatches.tsx"],
    usage: `<ReaSwatches colors={[{ value: "#2f5bff", label: "Acento" }]} />`,
    props: [{ name: "colors", type: "ReaSwatch[]", description: "{ value, label?, ink? (color del texto) }." }],
  },
  {
    slug: "rea-hover-lift",
    family: "REA",
    name: "Elevación al pasar",
    category: "Movimiento",
    description:
      "Receta card-hover-lift: sube 3 px con sombra en 160 ms. Con movimiento reducido no se mueve: el borde se refuerza.",
    files: ["styles/rea.css"],
    usage: `<article className="rea-lift">…</article>`,
    props: [{ name: ".rea-lift", type: "clase CSS", description: "Aplica la receta a cualquier elemento." }],
    notes: ["Receta de autoría ilustrativa del paquete REA: no está extraída ni verificada 1:1."],
  },
  {
    slug: "rea-specimen-stage",
    family: "REA",
    name: "Escenario de muestras",
    category: "Bloques",
    description:
      "Contador, ficha, Anterior/Siguiente y pasos a la izquierda; la muestra a la derecha entra con un barrido.",
    files: ["components/blocks/rea/rea-specimen-stage.tsx"],
    usage: `<ReaSpecimenStage items={[{ id: "nav", title: "SlideNavigator", render: () => <Demo /> }]}
  selectedId={id} onSelect={setId} />`,
    props: [
      { name: "items", type: "ReaStageItem[]", description: "{ id, title, tag?, description?, short?, render }." },
      { name: "selectedId / onSelect", type: "string / (id) => void", description: "Selección controlada." },
    ],
    notes: ["El scrollytelling sticky del original no se incluye: el avance es explícito."],
  },
  {
    slug: "rea-site-header",
    family: "REA",
    name: "Cabecera del sitio",
    category: "Bloques",
    description: "Marca con monograma, navegación rodante, herramientas y regla con el progreso de lectura.",
    files: ["components/blocks/rea/rea-site-header.tsx"],
    usage: `<ReaSiteHeader nav={items} tools={<ReaButton size="sm">Importar</ReaButton>} progress={p} sticky />`,
    props: [
      { name: "nav", type: "ReaNavItem[]", description: "Links centrales." },
      { name: "tools", type: "ReactNode", description: "Contenido a la derecha." },
      { name: "progress", type: "number", description: "0..1; si falta, la regla va sin barra." },
    ],
  },
  {
    slug: "rea-catalog",
    family: "REA",
    name: "Catálogo",
    category: "Bloques",
    description:
      "Búsqueda, filtros por tipo y colección, índice e inspector. Si los filtros vacían el índice, lo dice.",
    files: ["components/blocks/rea/rea-catalog.tsx", "lib/rea/rea-utils.ts"],
    usage: `<ReaCatalog entries={entries} onCopyResult={(ok) => show(ok ? "Copiado" : "No se pudo copiar")} />`,
    props: [
      {
        name: "entries",
        type: "ReaCatalogEntry[]",
        description: "{ id, title, category, collection, meta?, keywords?, details, code }.",
      },
      { name: "onCopyResult", type: "(ok: boolean) => void", description: "Resultado de copiar el código." },
    ],
  },

  // ---------- Lab (tokens --lab-* bajo .lab; investigación de señales y magnitudes) ----------
  {
    slug: "lab-presence-dot",
    family: "Lab",
    name: "Punto de presencia",
    category: "Indicadores",
    description:
      "Dice que hay algo, no cuánto ni qué tan grave. Anillos fijos opcionales y pulso solo con motion-safe.",
    files: ["components/ui/lab/presence-dot.tsx", "lib/utils.ts"],
    usage: `<PresenceDot label="Hay notas nuevas" rings={2} />
<PresenceDot label="En curso" pulse />`,
    props: [
      {
        name: "label",
        type: "string",
        description: "Qué significa. Sin etiqueta, el punto es decorativo (aria-hidden).",
      },
      { name: "rings", type: "0 | 1 | 2", default: "0", description: "Anillos concéntricos fijos." },
      { name: "pulse", type: "boolean", default: "false", description: "Pulso; no corre con movimiento reducido." },
      { name: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "8, 12 o 16 px." },
      { name: "tone", type: '"accent" | "muted"', default: '"accent"', description: "Color del punto." },
    ],
    status: "candidate",
    provenance: "observed-image",
    notes: [
      "Reconstruido desde los marcadores del mapa de Voices from the Frontlines (evidencia/2026-10-17-voices-frontlines).",
      "El pulso no se observó: las capturas van sin animación. Validar que no se lea como alarma ni como gravedad.",
      "Un punto solo codifica presencia: no usarlo para cantidad, categoría ni estado en la misma interfaz.",
    ],
  },
  {
    slug: "lab-stat-ring",
    family: "Lab",
    name: "Cifra en anillo",
    category: "Gráficos",
    description: "Una cifra total dentro de un anillo cerrado, con su explicación debajo. El anillo enmarca, no mide.",
    files: ["components/ui/lab/stat-ring.tsx", "lib/utils.ts"],
    usage: `<StatRing value="2B" caption="Personas con enfermedad cardiometabólica" />`,
    props: [
      { name: "value", type: "string", description: "La cifra tal como se muestra." },
      { name: "caption", type: "string", description: "Qué cuenta la cifra." },
      { name: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "88, 120 o 156 px." },
      { name: "tone", type: '"neutral" | "accent"', default: '"neutral"', description: "Borde neutro o de acento." },
    ],
    status: "candidate",
    provenance: "observed-image",
    notes: [
      "Reconstruido desde las cifras de BioAge (evidencia/2026-10-17-bioage, platform t02); medidas inferidas.",
      "Riesgo: un anillo puede leerse como porcentaje. Por eso va siempre cerrado; validar con usuarios.",
    ],
  },
  {
    slug: "lab-encoding-compare",
    family: "Lab",
    name: "Comparador de codificaciones",
    category: "Gráficos",
    description:
      "La misma tabla como longitud, área o arco, con la tabla siempre visible para comparar qué se lee mejor.",
    files: ["components/ui/lab/encoding-compare.tsx", "lib/lab/encodings.ts", "lib/utils.ts"],
    usage: `<EncodingCompare
  title="Pacientes por turno"
  data={[{ label: "Mañana", value: 12 }, { label: "Tarde", value: 9 }, { label: "Noche", value: 4 }]}
/>`,
    props: [
      { name: "data", type: "{ label: string; value: number }[]", description: "De 1 a 5 datos; etiquetas únicas." },
      { name: "title", type: "string", description: "Título del gráfico y de la tabla." },
      {
        name: "encoding / defaultEncoding",
        type: '"length" | "area" | "arc"',
        default: '"length"',
        description: "Controlado o no.",
      },
      { name: "onEncodingChange", type: "(e: Encoding) => void", description: "Aviso al cambiar." },
      { name: "format", type: "(v: number) => string", description: "Formato de valores (es-CL por defecto)." },
    ],
    status: "candidate",
    provenance: "inferred",
    notes: [
      "Mecanismo de Google Data GIF Maker (evidencia/2026-10-17-data-gif-maker); la interfaz es propia.",
      "Longitud y área comparan con el mayor; el arco muestra la parte del total. No responden la misma pregunta.",
      "Los ítems se distinguen por opacidad del acento: los más tenues no llegan a 3:1. La tabla lleva los valores.",
    ],
  },
  {
    slug: "lab-signal-disclosure",
    family: "Lab",
    name: "Señal con detalle",
    category: "Revelación",
    description: "Señal y título siempre visibles; el detalle se abre con clic o teclado y sigue en el DOM.",
    files: ["components/ui/lab/signal-disclosure.tsx", "components/ui/lab/presence-dot.tsx", "lib/utils.ts"],
    usage: `<SignalDisclosure title="Indicaciones nuevas" summary="2 desde el último turno">
  Ajuste de dosis de las 14:00 y control de glicemia cada 6 h.
</SignalDisclosure>`,
    props: [
      { name: "title", type: "ReactNode", description: "Qué hay detrás." },
      { name: "summary", type: "ReactNode", description: "Una línea visible también cerrado." },
      { name: "signal", type: "ReactNode", description: "Señal a la izquierda; por defecto un punto decorativo." },
      { name: "open / defaultOpen", type: "boolean", default: "false", description: "Controlado o no." },
      { name: "onOpenChange", type: "(open: boolean) => void", description: "Aviso al abrir o cerrar." },
    ],
    status: "candidate",
    provenance: "observed-image",
    notes: [
      "Mecanismo del FAQ de Paradigm y la lista con panel de Meridian (evidencia/2026-10-17-{paradigm,meridian-ai}).",
      "La expansión por hover de «Additional Information» solo está en video: no se reprodujo. Nunca abre solo con hover.",
      "Validar qué no debe ocultarse nunca: un dato crítico no va detrás de una revelación.",
    ],
  },
  {
    slug: "lab-backdrop",
    family: "Lab",
    name: "Fondo con resplandor",
    category: "Fondos",
    description: "Superficie con un único resplandor del acento y viñeta. Decorativo: nunca codifica información.",
    files: ["components/ui/lab/lab-backdrop.tsx", "lib/utils.ts"],
    usage: `<LabBackdrop tone="deep" glow="corner" className="p-8">…</LabBackdrop>`,
    props: [
      { name: "tone", type: '"soft" | "deep"', default: '"soft"', description: "Fondo claro u oscuro." },
      {
        name: "glow",
        type: '"none" | "corner" | "center"',
        default: '"corner"',
        description: "Dónde cae el resplandor.",
      },
    ],
    status: "candidate",
    provenance: "observed-image",
    notes: [
      "Motivo de BioAge (fondo con un solo acento, evidencia/2026-10-17-bioage), rehecho con los tokens de Lab.",
      "Revisar el contraste del texto sobre el resplandor en cada tono antes de pasar a stable.",
    ],
  },
];

export const bySlug = (slug: string) => COMPONENTS.find((c) => c.slug === slug);
