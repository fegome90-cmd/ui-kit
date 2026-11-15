/** Mediciones de cajas DOM. No evalúa calidad editorial. Sin dependencias. */
/** @param {DOMRect | {left:number,top:number,width:number,height:number}} slide
 * @param {DOMRect | {left:number,top:number,width:number,height:number}} block
 * @param {{width:number,height:number}} size */
export function measureBox(slide, block, size) {
  if (![slide.width, slide.height, size.width, size.height].every((n) => Number.isFinite(n) && n > 0)) {
    throw new RangeError("La diapositiva debe tener dimensiones positivas y ser visible.");
  }
  const x = ((block.left - slide.left) / slide.width) * size.width;
  const y = ((block.top - slide.top) / slide.height) * size.height;
  const width = (block.width / slide.width) * size.width;
  const height = (block.height / slide.height) * size.height;
  return {
    x,
    y,
    width,
    height,
    percent: {
      x: (x / size.width) * 100,
      y: (y / size.height) * 100,
      width: (width / size.width) * 100,
      height: (height / size.height) * 100,
    },
    edges: { left: x, top: y, right: size.width - x - width, bottom: size.height - y - height },
    overflow: x < 0 || y < 0 || x + width > size.width || y + height > size.height,
  };
}
/** Separación entre cajas: 0 en ejes solapados; euclidiana entre bordes. @param {ReturnType<typeof measureBox>} a @param {ReturnType<typeof measureBox>} b */
export function measureDistance(a, b) {
  const horizontal = Math.max(0, a.x - b.x - b.width, b.x - a.x - a.width);
  const vertical = Math.max(0, a.y - b.y - b.height, b.y - a.y - a.height);
  return { horizontal, vertical, distance: Math.hypot(horizontal, vertical) };
}
/**
 * Solo lectura sobre la diapositiva; la UI vive fuera de ella. Sin atajos globales ni captura de clicks.
 * Solo escalado/traslación en ejes: rotación, skew y perspectiva no son coordenadas locales soportadas.
 * @param {HTMLElement} slide
 * @param {{selector?:string,width?:number,height?:number,grid?:boolean,columns?:number,locale?:"es"|"en",onClose?:()=>void}} [options]
 */
export function createGridInspector(slide, options = {}) {
  const en = options.locale === "en";
  const t = (/** @type {string} */ es, /** @type {string} */ english) => (en ? english : es);
  const doc = slide.ownerDocument;
  const win = doc.defaultView;
  if (!win) throw new Error("Se requiere un documento con ventana.");
  const host = doc.createElement("div");
  host.className = "rea-gi";
  host.hidden = true;
  host.setAttribute("data-rea-grid-inspector", "");
  const panel = doc.createElement("section");
  panel.className = "rea-gi-panel";
  panel.setAttribute("aria-label", t("Inspector geométrico", "Geometry inspector"));
  const title = doc.createElement("strong");
  title.textContent = t("Geometría · no evalúa diseño", "Geometry · not design evaluation");
  const choose = doc.createElement("select");
  choose.setAttribute("aria-label", t("Bloque seleccionado", "Selected block"));
  const compare = doc.createElement("select");
  compare.setAttribute("aria-label", t("Comparar con bloque", "Compare with block"));
  const output = doc.createElement("output");
  output.setAttribute("aria-live", "polite");
  const close = doc.createElement("button");
  close.type = "button";
  close.textContent = t("Ocultar inspector", "Hide inspector");
  panel.append(title, choose, compare, output, close);
  const outlines = doc.createElement("div");
  outlines.className = "rea-gi-outlines";
  outlines.setAttribute("aria-hidden", "true");
  host.append(outlines, panel);
  doc.body.append(host);
  let destroyed = false;
  let frame = 0;
  /** @type {HTMLElement[]} */
  let blocks = [];
  /** @type {Element | null} */
  let previousFocus = null;
  const number = (/** @type {number} */ n) => Math.round(n * 10) / 10;
  function refresh() {
    if (destroyed || host.hidden) return;
    const rect = slide.getBoundingClientRect();
    const size = { width: options.width ?? slide.offsetWidth, height: options.height ?? slide.offsetHeight };
    const next = Array.from(slide.querySelectorAll(options.selector ?? "[data-inspect]")).filter(
      (el) => el instanceof win.HTMLElement,
    );
    const selected = blocks[Number(choose.value)];
    const compared = blocks[Number(compare.value)];
    blocks = /** @type {HTMLElement[]} */ (next);
    for (const [select, placeholder, old] of [
      [choose, t("Seleccionar bloque", "Select block"), selected],
      [compare, t("Sin comparación", "No comparison"), compared],
    ]) {
      const control = /** @type {HTMLSelectElement} */ (select);
      control.replaceChildren(new win.Option(/** @type {string} */ (placeholder), "-1"));
      blocks.forEach((el, i) => {
        control.add(new win.Option(el.getAttribute("data-inspect") || `${t("Bloque", "Block")} ${i + 1}`, String(i)));
      });
      control.value = String(old ? blocks.indexOf(/** @type {HTMLElement} */ (old)) : -1);
    }
    outlines.replaceChildren();
    output.textContent = t(
      "Selecciona un bloque. Valores en px locales y % de diapositiva.",
      "Select a block. Local pixels and slide percentages.",
    );
    if (rect.width <= 0 || rect.height <= 0 || size.width <= 0 || size.height <= 0) {
      output.textContent = t("Diapositiva no visible o sin dimensiones.", "Slide is hidden or has no dimensions.");
      return;
    }
    if (options.grid !== false) {
      const grid = doc.createElement("div");
      grid.className = "rea-gi-grid";
      Object.assign(grid.style, {
        left: `${rect.left}px`,
        top: `${rect.top}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
        gridTemplateColumns: `repeat(${Math.min(64, Math.max(1, Math.round(options.columns ?? 12)))},1fr)`,
      });
      for (let i = 0; i < Math.min(64, Math.max(1, Math.round(options.columns ?? 12))); i++)
        grid.append(doc.createElement("span"));
      outlines.append(grid);
    }
    const index = Number(choose.value);
    blocks.forEach((block, i) => {
      const box = block.getBoundingClientRect();
      const outline = doc.createElement("div");
      outline.className = `rea-gi-box${i === index ? " rea-gi-selected" : ""}`;
      Object.assign(outline.style, {
        left: `${box.left}px`,
        top: `${box.top}px`,
        width: `${box.width}px`,
        height: `${box.height}px`,
      });
      outlines.append(outline);
    });
    if (!blocks[index]) return;
    const m = measureBox(rect, blocks[index].getBoundingClientRect(), size);
    output.textContent = `x ${number(m.x)} px (${number(m.percent.x)}%); y ${number(m.y)} px (${number(m.percent.y)}%); ancho ${number(m.width)} px (${number(m.percent.width)}%); alto ${number(m.height)} px (${number(m.percent.height)}%). Bordes: izq ${number(m.edges.left)}, arriba ${number(m.edges.top)}, der ${number(m.edges.right)}, abajo ${number(m.edges.bottom)} px. ${m.overflow ? "Desborde detectado." : "Sin desborde de caja."}`;
    if (en)
      output.textContent = `x ${number(m.x)} px (${number(m.percent.x)}%); y ${number(m.y)} px (${number(m.percent.y)}%); width ${number(m.width)} px (${number(m.percent.width)}%); height ${number(m.height)} px (${number(m.percent.height)}%). Edges: left ${number(m.edges.left)}, top ${number(m.edges.top)}, right ${number(m.edges.right)}, bottom ${number(m.edges.bottom)} px. ${m.overflow ? "Box overflow detected." : "No box overflow."}`;
    const other = blocks[Number(compare.value)];
    if (other) {
      const d = measureDistance(m, measureBox(rect, other.getBoundingClientRect(), size));
      output.textContent += en
        ? ` Gap: horizontal ${number(d.horizontal)} px, vertical ${number(d.vertical)} px, distance ${number(d.distance)} px.`
        : ` Separación: horizontal ${number(d.horizontal)} px, vertical ${number(d.vertical)} px, distancia ${number(d.distance)} px.`;
    }
  }
  function schedule() {
    if (!host.hidden && !destroyed && !frame)
      frame = win.requestAnimationFrame(() => {
        frame = 0;
        refresh();
      });
  }
  const resize = typeof win.ResizeObserver === "function" ? new win.ResizeObserver(schedule) : null;
  const mutation = new win.MutationObserver(() => {
    observe();
    schedule();
  });
  function observe() {
    resize?.disconnect();
    resize?.observe(slide);
    slide.querySelectorAll(options.selector ?? "[data-inspect]").forEach((el) => {
      resize?.observe(el);
    });
  }
  function stop() {
    resize?.disconnect();
    mutation.disconnect();
    win.removeEventListener("resize", schedule);
    win.removeEventListener("scroll", schedule, true);
    win.visualViewport?.removeEventListener("resize", schedule);
    win.visualViewport?.removeEventListener("scroll", schedule);
    if (frame) win.cancelAnimationFrame(frame);
    frame = 0;
  }
  function hide() {
    if (destroyed) return;
    const restore = host.contains(doc.activeElement);
    host.hidden = true;
    stop();
    if (restore && previousFocus instanceof win.HTMLElement && previousFocus.isConnected) previousFocus.focus();
  }
  choose.addEventListener("change", refresh);
  compare.addEventListener("change", refresh);
  close.addEventListener("click", () => {
    hide();
    options.onClose?.();
  });
  panel.addEventListener("keydown", (event) => {
    event.stopPropagation();
    if (event.key === "Escape") {
      hide();
      options.onClose?.();
    }
  });
  panel.addEventListener("keyup", (event) => event.stopPropagation());
  panel.addEventListener("click", (event) => event.stopPropagation());
  return {
    show() {
      if (destroyed || !host.hidden) return;
      previousFocus = doc.activeElement;
      host.hidden = false;
      observe();
      mutation.observe(slide, { subtree: true, childList: true, attributes: true, characterData: true });
      win.addEventListener("resize", schedule);
      win.addEventListener("scroll", schedule, true);
      win.visualViewport?.addEventListener("resize", schedule);
      win.visualViewport?.addEventListener("scroll", schedule);
      refresh();
    },
    hide,
    refresh,
    destroy() {
      if (destroyed) return;
      hide();
      destroyed = true;
      host.remove();
    },
  };
}
