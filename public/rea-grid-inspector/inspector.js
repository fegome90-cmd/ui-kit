/** Mediciones de cajas DOM. No evalúa calidad editorial. Sin dependencias. */
/** @param {DOMRect | {left:number,top:number,width:number,height:number}} slide
 * @param {DOMRect | {left:number,top:number,width:number,height:number}} block
 * @param {{width:number,height:number}} size */
export function measureBox(slide, block, size) {
  if (![slide.width, slide.height, size.width, size.height].every((n) => Number.isFinite(n) && n > 0)) {
    throw new RangeError("La diapositiva debe tener dimensiones positivas y ser visible.");
  }
  if (
    ![slide.left, slide.top, block.left, block.top, block.width, block.height].every(Number.isFinite) ||
    block.width < 0 ||
    block.height < 0
  ) {
    throw new RangeError("Las cajas deben contener coordenadas finitas y dimensiones no negativas.");
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
  const overlapX = Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x);
  const overlapY = Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y);
  const relation = horizontal > 0 || vertical > 0 ? "separation" : overlapX > 0 && overlapY > 0 ? "overlap" : "contact";
  return { horizontal, vertical, distance: Math.hypot(horizontal, vertical), overlapX, overlapY, relation };
}
/** Copia histórica aislada: caja DOM local, tamaño y fecha; no conserva nodos ni contenido. */
export function createBoxSnapshot(box, size, label = "", timestamp = new Date().toISOString()) {
  if (
    ![size.width, size.height].every((value) => Number.isFinite(value) && value > 0) ||
    ![box.x, box.y, box.width, box.height].every(Number.isFinite) ||
    box.width < 0 ||
    box.height < 0
  ) {
    throw new RangeError("La referencia requiere una caja finita y tamaño positivo.");
  }
  const pixels = Object.freeze({ x: box.x, y: box.y, width: box.width, height: box.height });
  const percent = Object.freeze({
    x: (box.x / size.width) * 100,
    y: (box.y / size.height) * 100,
    width: (box.width / size.width) * 100,
    height: (box.height / size.height) * 100,
  });
  return Object.freeze({
    pixels,
    percent,
    size: Object.freeze({ width: size.width, height: size.height }),
    label: String(label),
    timestamp: String(timestamp),
  });
}
/** Delta actual menos referencia. Porcentajes en puntos porcentuales; nunca una distancia espacial. */
export function compareBoxSnapshots(reference, current) {
  const delta = (a, b) => ({ x: b.x - a.x, y: b.y - a.y, width: b.width - a.width, height: b.height - a.height });
  const sameSize = reference.size.width === current.size.width && reference.size.height === current.size.height;
  return {
    sameSize,
    pixels: sameSize ? delta(reference.pixels, current.pixels) : null,
    percent: delta(reference.percent, current.percent),
  };
}
/** Solo matrices de escala positiva y traslación en ejes. Valida cada ancestro, no la matriz compuesta. */
export function assertSupportedGeometry(element) {
  const win = element.ownerDocument.defaultView;
  for (let node = element; node; node = node.parentElement) {
    const style = win.getComputedStyle(node);
    const fail = () => {
      throw new RangeError(
        "Geometría no soportada: rotación, skew, perspectiva, escala no positiva o containing block de html/body.",
      );
    };
    const transform = style.transform;
    if (transform && transform !== "none") {
      const values = transform
        .slice(transform.indexOf("(") + 1, -1)
        .split(",")
        .map(Number);
      const valid =
        transform.startsWith("matrix(") &&
        values.length === 6 &&
        values.every(Number.isFinite) &&
        values[0] > 0 &&
        values[3] > 0 &&
        values[1] === 0 &&
        values[2] === 0;
      if (!valid) fail();
    }
    if (style.perspective && style.perspective !== "none") fail();
    if (
      style.translate &&
      style.translate !== "none" &&
      (style.translate.match(/(?:calc\([^)]*\)|[^\s]+)/g) ?? []).length > 2
    )
      fail();
    if (style.rotate && style.rotate !== "none" && !/^0(?:deg|rad|turn)?$/.test(style.rotate)) fail();
    if (
      style.scale &&
      style.scale !== "none" &&
      (style.scale.trim().split(/\s+/).length > 2 ||
        !style.scale
          .trim()
          .split(/\s+/)
          .every((v) => Number.isFinite(Number(v)) && Number(v) > 0))
    )
      fail();
    if (
      (node === element.ownerDocument.body || node === element.ownerDocument.documentElement) &&
      ((transform && transform !== "none") ||
        (style.translate && style.translate !== "none") ||
        (style.scale && style.scale !== "none") ||
        (style.rotate && style.rotate !== "none") ||
        (style.filter && style.filter !== "none") ||
        (style.backdropFilter && style.backdropFilter !== "none") ||
        /transform|perspective|filter|translate|rotate|scale|contain/.test(style.willChange) ||
        /paint|layout|strict|content/.test(style.contain) ||
        style.contentVisibility === "auto" ||
        style.contentVisibility === "hidden")
    )
      fail();
  }
}
/**
 * Solo lectura sobre la diapositiva; la UI vive fuera de ella. Sin atajos globales.
 * No captura clicks salvo en los modos explícitos de selección y regla.
 * Solo escalado/traslación en ejes: rotación, skew y perspectiva no son coordenadas locales soportadas.
 * @param {HTMLElement} slide
 * @param {{selector?:string,width?:number,height?:number,grid?:boolean,columns?:number,locale?:"es"|"en",onClose?:()=>void}} [options]
 */
export function createGridInspector(slide, options = {}) {
  options = { ...options };
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
  close.setAttribute("aria-label", t("Ocultar inspector", "Hide inspector"));
  close.textContent = t("Ocultar inspector", "Hide inspector");
  const mode = doc.createElement("select");
  mode.setAttribute("aria-label", t("Modo de interacción", "Interaction mode"));
  [
    ["read", t("Lectura: clicks normales", "Read: normal clicks")],
    ["select", t("Seleccionar con click", "Select with click")],
    ["ruler", t("Regla: marcar dos puntos", "Ruler: pick two points")],
  ].forEach(([value, label]) => {
    mode.add(new win.Option(label, value));
  });
  const ruler = doc.createElement("fieldset");
  const legend = doc.createElement("legend");
  legend.textContent = t("Regla en px locales (también por teclado)", "Ruler in local px (keyboard supported)");
  ruler.append(legend);
  const coordinates = ["x1", "y1", "x2", "y2"].map((name) => {
    const label = doc.createElement("label");
    label.textContent = name;
    const input = doc.createElement("input");
    input.type = "number";
    input.step = "any";
    input.value = "0";
    input.setAttribute("aria-label", name);
    label.append(input);
    ruler.append(label);
    return input;
  });
  const rulerOutput = doc.createElement("output");
  rulerOutput.setAttribute("aria-live", "polite");
  ruler.append(rulerOutput);
  const saveReference = doc.createElement("button");
  saveReference.type = "button";
  saveReference.textContent = t("Guardar referencia", "Save reference");
  const clearReference = doc.createElement("button");
  clearReference.type = "button";
  clearReference.textContent = t("Borrar referencia", "Clear reference");
  const referenceOutput = doc.createElement("output");
  referenceOutput.setAttribute("aria-label", t("Comparación histórica", "Historical comparison"));
  referenceOutput.setAttribute("aria-live", "polite");
  let reference = null;
  let currentSnapshot = null;
  panel.append(title, mode, choose, compare, output, ruler, saveReference, clearReference, referenceOutput, close);
  const outlines = doc.createElement("div");
  outlines.className = "rea-gi-outlines";
  outlines.setAttribute("aria-hidden", "true");
  host.append(outlines, panel);
  doc.body.append(host);
  let destroyed = false;
  let frame = 0;
  let pointIndex = 0;
  /** @type {HTMLElement[]} */
  let blocks = [];
  /** @type {Element | null} */
  let previousFocus = null;
  const number = (/** @type {number} */ n) => Math.round(n * 10) / 10;
  function refresh() {
    if (destroyed || host.hidden) return;
    currentSnapshot = null;
    saveReference.disabled = true;
    clearReference.disabled = !reference;
    referenceOutput.textContent = reference
      ? `${t("Referencia histórica", "Historical reference")}: ${reference.label}; ${reference.timestamp}; ${reference.size.width} × ${reference.size.height} px. ${t("Selecciona una caja válida para comparar.", "Select a valid box to compare.")}`
      : t(
          "Sin referencia histórica. Selecciona un bloque y guarda su caja.",
          "No historical reference. Select a block and save its box.",
        );
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
    rulerOutput.textContent = t(
      "Regla no disponible hasta validar la geometría.",
      "Ruler unavailable until geometry is validated.",
    );
    output.textContent = t(
      "Selecciona un bloque. Valores en px locales y % de diapositiva.",
      "Select a block. Local pixels and slide percentages.",
    );
    if (![rect.width, rect.height, size.width, size.height].every((value) => Number.isFinite(value) && value > 0)) {
      output.textContent = t("Diapositiva no visible o sin dimensiones.", "Slide is hidden or has no dimensions.");
      return;
    }
    try {
      assertSupportedGeometry(slide);
      blocks.forEach(assertSupportedGeometry);
    } catch (error) {
      output.textContent = en
        ? "Unsupported geometry: rotation, skew, perspective, non-positive scale or html/body fixed containing block."
        : String(error.message);
      return;
    }
    function line(x1, y1, x2, y2, label) {
      const mark = doc.createElement("div");
      mark.className = "rea-gi-dimension";
      Object.assign(mark.style, {
        left: `${x1}px`,
        top: `${y1}px`,
        width: `${Math.hypot(x2 - x1, y2 - y1)}px`,
        transform: `rotate(${Math.atan2(y2 - y1, x2 - x1)}rad)`,
      });
      const text = doc.createElement("span");
      text.textContent = label;
      mark.append(text);
      outlines.append(mark);
    }
    const values = coordinates.map((input) => Number(input.value));
    if (coordinates.every((input) => input.value !== "") && values.every(Number.isFinite)) {
      const [x1, y1, x2, y2] = values;
      rulerOutput.textContent = `Δx ${number(x2 - x1)}; Δy ${number(y2 - y1)}; d ${number(Math.hypot(x2 - x1, y2 - y1))} px`;
      if (mode.value === "ruler")
        line(
          rect.left + (x1 / size.width) * rect.width,
          rect.top + (y1 / size.height) * rect.height,
          rect.left + (x2 / size.width) * rect.width,
          rect.top + (y2 / size.height) * rect.height,
          rulerOutput.textContent,
        );
    } else rulerOutput.textContent = t("Introduce cuatro coordenadas finitas.", "Enter four finite coordinates.");
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
    const selectedBox = blocks[index].getBoundingClientRect();
    if (!hasRenderedBox(blocks[index], selectedBox)) {
      output.textContent = t(
        "Bloque no visible o sin caja renderizada. Selecciona otro bloque para medir o guardar referencia.",
        "Block is hidden or has no rendered box. Select another block to measure or save a reference.",
      );
      return;
    }
    const m = measureBox(rect, selectedBox, size);
    output.textContent = `x ${number(m.x)} px (${number(m.percent.x)}%); y ${number(m.y)} px (${number(m.percent.y)}%); ancho ${number(m.width)} px (${number(m.percent.width)}%); alto ${number(m.height)} px (${number(m.percent.height)}%). Bordes: izq ${number(m.edges.left)}, arriba ${number(m.edges.top)}, der ${number(m.edges.right)}, abajo ${number(m.edges.bottom)} px. ${m.overflow ? "Desborde detectado." : "Sin desborde de caja."}`;
    if (en)
      output.textContent = `x ${number(m.x)} px (${number(m.percent.x)}%); y ${number(m.y)} px (${number(m.percent.y)}%); width ${number(m.width)} px (${number(m.percent.width)}%); height ${number(m.height)} px (${number(m.percent.height)}%). Edges: left ${number(m.edges.left)}, top ${number(m.edges.top)}, right ${number(m.edges.right)}, bottom ${number(m.edges.bottom)} px. ${m.overflow ? "Box overflow detected." : "No box overflow."}`;
    currentSnapshot = createBoxSnapshot(
      m,
      size,
      blocks[index].getAttribute("data-inspect") || `${t("Bloque", "Block")} ${index + 1}`,
    );
    saveReference.disabled = false;
    if (reference) {
      const comparison = compareBoxSnapshots(reference, currentSnapshot);
      const formatDelta = (delta) =>
        `Δx ${number(delta.x)}; Δy ${number(delta.y)}; Δw ${number(delta.width)}; Δh ${number(delta.height)}`;
      referenceOutput.textContent = `${t("Referencia histórica", "Historical reference")}: ${reference.label}; ${reference.timestamp}; ${reference.size.width} × ${reference.size.height} px. ${t("Actual", "Current")}: ${currentSnapshot.label}; ${currentSnapshot.size.width} × ${currentSnapshot.size.height} px. ${t("Actual menos referencia, no gap espacial", "Current minus reference, not a spatial gap")}: ${formatDelta(comparison.percent)} ${t("puntos porcentuales", "percentage points")}. ${comparison.pixels ? `${formatDelta(comparison.pixels)} px.` : t("Tamaños distintos: delta px no comparable.", "Different sizes: pixel delta not comparable.")}`;
    }
    const selectedRect = blocks[index].getBoundingClientRect();
    const cx = selectedRect.left + selectedRect.width / 2;
    const cy = selectedRect.top + selectedRect.height / 2;
    line(rect.left, cy, selectedRect.left, cy, `${number(m.edges.left)} px`);
    line(selectedRect.right, cy, rect.right, cy, `${number(m.edges.right)} px`);
    line(cx, rect.top, cx, selectedRect.top, `${number(m.edges.top)} px`);
    line(cx, selectedRect.bottom, cx, rect.bottom, `${number(m.edges.bottom)} px`);
    const style = win.getComputedStyle(blocks[index]);
    output.textContent += `${t(
      " Caja DOM (border-box), no tinta visible ni límites de glifos. Márgenes CSS declarados/computados (no separación efectiva): ",
      " DOM box (border-box), not visible ink or glyph bounds. Computed CSS margins (not effective spacing): ",
    )}top ${style.marginTop}; right ${style.marginRight}; bottom ${style.marginBottom}; left ${style.marginLeft}.`;
    const other = blocks[Number(compare.value)];
    if (other) {
      const b = other.getBoundingClientRect();
      if (!hasRenderedBox(other, b)) {
        output.textContent += t(
          " Bloque comparado no visible o sin caja renderizada. No se puede medir la separación.",
          " Compared block is hidden or has no rendered box. Its gap cannot be measured.",
        );
        return;
      }
      const d = measureDistance(m, measureBox(rect, b, size));
      const ax = Math.max(selectedRect.left, Math.min(b.left + b.width / 2, selectedRect.right));
      const ay = Math.max(selectedRect.top, Math.min(b.top + b.height / 2, selectedRect.bottom));
      const bx = Math.max(b.left, Math.min(ax, b.right));
      const by = Math.max(b.top, Math.min(ay, b.bottom));
      line(ax, ay, bx, by, `${d.relation}: ${number(d.distance)} px`);
      output.textContent += ` ${t("Relación", "Relation")}: ${d.relation === "overlap" ? t("solapamiento", "overlap") : d.relation === "contact" ? t("contacto", "contact") : t("separación", "separation")}.`;
      output.textContent += en
        ? ` Gap: horizontal ${number(d.horizontal)} px, vertical ${number(d.vertical)} px, distance ${number(d.distance)} px.`
        : ` Separación: horizontal ${number(d.horizontal)} px, vertical ${number(d.vertical)} px, distancia ${number(d.distance)} px.`;
    }
  }
  function hasRenderedBox(element, box) {
    if (box.width === 0 && box.height === 0) return false;
    for (let node = element; node; node = node.parentElement) {
      const style = win.getComputedStyle(node);
      if (
        style.display === "none" ||
        (node === element && (style.visibility === "hidden" || style.visibility === "collapse")) ||
        style.contentVisibility === "hidden"
      )
        return false;
    }
    return true;
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
    doc.removeEventListener("click", pick, true);
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
  function pick(event) {
    if (host.hidden || mode.value === "read" || host.contains(event.target)) return;
    if (!slide.contains(event.target)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if (mode.value === "select") {
      const target = event.target.closest(options.selector ?? "[data-inspect]");
      choose.value = String(blocks.indexOf(target));
    } else {
      const rect = slide.getBoundingClientRect();
      const size = { width: options.width ?? slide.offsetWidth, height: options.height ?? slide.offsetHeight };
      if (![rect.width, rect.height, size.width, size.height].every((value) => Number.isFinite(value) && value > 0)) {
        refresh();
        return;
      }
      try {
        assertSupportedGeometry(slide);
      } catch {
        refresh();
        return;
      }
      coordinates[pointIndex * 2].value = String(((event.clientX - rect.left) / rect.width) * size.width);
      coordinates[pointIndex * 2 + 1].value = String(((event.clientY - rect.top) / rect.height) * size.height);
      pointIndex = 1 - pointIndex;
    }
    refresh();
  }
  coordinates.forEach((input) => {
    input.addEventListener("input", refresh);
  });
  mode.addEventListener("change", () => {
    pointIndex = 0;
    refresh();
  });
  saveReference.addEventListener("click", () => {
    refresh();
    if (currentSnapshot) reference = currentSnapshot;
    refresh();
  });
  clearReference.addEventListener("click", () => {
    reference = null;
    refresh();
  });
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
  const api = {
    show() {
      if (destroyed || !host.hidden) return;
      previousFocus = doc.activeElement;
      host.hidden = false;
      observe();
      doc.addEventListener("click", pick, true);
      mutation.observe(slide, { subtree: true, childList: true, attributes: true, characterData: true });
      for (let ancestor = slide.parentElement; ancestor; ancestor = ancestor.parentElement) {
        mutation.observe(ancestor, { attributes: true });
      }
      win.addEventListener("resize", schedule);
      win.addEventListener("scroll", schedule, true);
      win.visualViewport?.addEventListener("resize", schedule);
      win.visualViewport?.addEventListener("scroll", schedule);
      refresh();
    },
    /** Cambia de superficie sin compartir nodos; las dimensiones omitidas usan offsetWidth/Height.
     * @param {HTMLElement} nextSlide
     * @param {{width?:number,height?:number}} [dimensions] */
    setSlide(nextSlide, dimensions = {}) {
      if (destroyed) return;
      if (!(nextSlide instanceof win.HTMLElement) || nextSlide.ownerDocument !== doc)
        throw new TypeError("La nueva diapositiva debe pertenecer al mismo documento.");
      const visible = !host.hidden;
      const panelFocus = host.contains(doc.activeElement) ? doc.activeElement : null;
      hide();
      slide = nextSlide;
      options = { ...options, width: dimensions.width, height: dimensions.height };
      blocks = [];
      choose.value = "-1";
      compare.value = "-1";
      pointIndex = 0;
      mode.value = "read";
      coordinates.forEach((input) => {
        input.value = "0";
      });
      currentSnapshot = null;
      if (visible) {
        api.show();
        if (panelFocus instanceof win.HTMLElement && panelFocus.isConnected) panelFocus.focus({ preventScroll: true });
      }
    },
    hide,
    refresh,
    destroy() {
      if (destroyed) return;
      hide();
      destroyed = true;
      reference = null;
      currentSnapshot = null;
      host.remove();
    },
  };
  return api;
}
