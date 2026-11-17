/* ==========================================================================
   SKELETON KIT (JS): tiny helpers that return wireframe markup.
   ========================================================================== */
(function () {
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const P = {
    search: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4 4"/>',
    user: '<circle cx="12" cy="8.5" r="3.5"/><path d="M5 20c1.2-3.6 4-5.2 7-5.2s5.8 1.6 7 5.2"/>',
    back: '<path d="M15 5l-7 7 7 7"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    bag: '<path d="M5 8h14l-1 12H6L5 8z"/><path d="M9 8V6.5a3 3 0 016 0V8"/>',
    heart: '<path d="M12 20s-7-4.4-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.6-7 10-7 10z"/>',
    share: '<path d="M12 4v11M8 8l4-4 4 4"/><path d="M5 13v6h14v-6"/>',
    play: '<path d="M9 7l9 5-9 5V7z" fill="currentColor"/>',
    image: '<rect x="4" y="5" width="16" height="14" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="M5 17l5-4 3 2.5 2-1.5 4 3"/>',
    map: '<path d="M4 7l5-2 6 2 5-2v12l-5 2-6-2-5 2V7z"/><path d="M9 5v12M15 7v12"/>',
    cube: '<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z"/><path d="M12 12l8-4.5M12 12v9M12 12L4 7.5"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    chart: '<path d="M5 19V9M10 19V5M15 19v-7M20 19v-4"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  };
  function icon(name) { return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[name] || P.image}</svg>`; }

  const status = () => `<div class="sk-status" aria-hidden="true"><span>9:41</span><span><i></i></span></div>`;

  const ICON_LABELS = { search: "Buscar", user: "Perfil", back: "Voltar", close: "Fechar", bag: "Carrinho", heart: "Favoritar", share: "Compartilhar", play: "Reproduzir", image: "Imagem", map: "Mapa", cube: "Visualização 3D", check: "Confirmar", plus: "Adicionar", chart: "Gráfico", menu: "Menu" };

  function bar(o = {}) {
    const left = o.back ? `<button class="sk-ic sk-press" data-back aria-label="Voltar">${icon("back")}</button>` : `<span class="sk-logo" aria-label="Espaço reservado para a marca">MARCA</span>`;
    const mid = o.title ? `<span class="sk-title-bar">${esc(o.title)}</span>` : "";
    const right = (o.icons || ["search", "user"]).map((name) => {
      const enabled = (o.enabledIcons || []).includes(name);
      const label = (ICON_LABELS[name] || name) + (enabled ? "" : " — indisponível neste exemplo");
      return `<button type="button" class="sk-ic sk-press" data-icon="${esc(name)}" aria-label="${esc(label)}" title="${esc(label)}"${enabled ? "" : " disabled"}>${icon(name)}</button>`;
    }).join("");
    return `${status()}<header class="sk-bar"${o.clear ? " data-clear" : ""}>${left}${mid}<span class="sk-sp"></span>${right}</header>`;
  }

  const tabsList = () => (window.Proto.project.navigation || []).map((tab) => [tab.id, tab.label]);
  function tabs(active) {
    const items = tabsList();
    if (!items.length) return `<span class="sk-home" aria-hidden="true"></span>`;
    return `<nav class="sk-tabs" aria-label="Navegação principal" style="--sk-tab-count:${items.length}">${items.map(([id, l]) => `<button class="sk-tab" data-tab="${esc(id)}" ${id === active ? 'aria-current="page"' : ""}><i aria-hidden="true"></i>${esc(l)}</button>`).join("")}</nav><span class="sk-home" aria-hidden="true"></span>`;
  }

  // media placeholder: ratio "4/5", tag label, glyph icon, bleed edge
  function media(o = {}) {
    const st = o.h ? `height:${o.h}px` : `aspect-ratio:${o.ratio || "16/10"}`;
    return `<div class="sk-media"${o.bleed ? " data-bleed" : ""} style="${st}${o.w ? `;width:${o.w}px` : ""}" role="img" aria-label="${esc(o.tag || "Espaço reservado para imagem")}">${o.tag ? `<span class="sk-tag">${esc(o.tag)}</span>` : ""}${o.glyph ? `<span class="sk-glyph">${icon(o.glyph)}</span>` : ""}</div>`;
  }
  // text lines: widths in %, first can be a title
  function lines(ws = [70, 90, 55], o = {}) {
    return `<div class="sk-lines" aria-hidden="true">${ws.map((w, i) => `<span class="sk-l"${i === 0 && o.title ? (o.xl ? " data-xl" : " data-t") : ""} style="width:${w}%"></span>`).join("")}</div>`;
  }
  const tag = (t) => `<span class="sk-tag sk-tag-inline">${esc(t)}</span>`;

  function on(root, sel, type, fn) {
    const h = (e) => { const t = e.target.closest(sel); if (t && root.contains(t)) fn(e, t); };
    root.addEventListener(type, h);
    return () => root.removeEventListener(type, h);
  }

  function toast(root, msg) {
    let t = root.querySelector(".sk-toast");
    if (!t) { t = document.createElement("div"); t.className = "sk-toast"; t.setAttribute("role", "status"); root.appendChild(t); }
    t.textContent = msg; t.removeAttribute("data-on");
    requestAnimationFrame(() => t.setAttribute("data-on", ""));
    clearTimeout(t._h); t._h = setTimeout(() => t.removeAttribute("data-on"), 2200);
  }

  function modalFocus(el, close, options = {}) {
    const previous = document.activeElement;
    const changed = [];
    for (let branch = el; branch.parentElement; branch = branch.parentElement) {
      for (const sibling of branch.parentElement.children) {
        if (sibling === branch || options.keep?.includes(sibling)) continue;
        changed.push([sibling, sibling.inert]); sibling.inert = true;
      }
      if (branch.parentElement === document.body) break;
    }
    const focusable = () => [...el.querySelectorAll('button, [href], input, select, textarea, [tabindex]')]
      .filter((item) => !item.disabled && item.tabIndex >= 0 && !item.closest('[inert]') && item.getClientRects().length);
    const focusFirst = () => (options.initial || focusable()[0] || el).focus({ preventScroll: true });
    el.tabIndex = -1;
    const keydown = (event) => {
      if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); close(); }
      if (event.key !== 'Tab') return;
      const items = focusable(), first = items[0], last = items[items.length - 1];
      if (!first) { event.preventDefault(); el.focus(); return; }
      if (event.shiftKey && (document.activeElement === first || document.activeElement === el)) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    const focusin = (event) => { if (!el.contains(event.target)) focusFirst(); };
    document.addEventListener('keydown', keydown, true);
    document.addEventListener('focusin', focusin);
    focusFirst();
    let released = false;
    return (restore = true) => {
      if (released) return; released = true;
      document.removeEventListener('keydown', keydown, true);
      document.removeEventListener('focusin', focusin);
      changed.forEach(([node, inert]) => { node.inert = inert; });
      if (restore && previous?.isConnected) previous.focus({ preventScroll: true });
    };
  }

  const sheets = new WeakMap();
  function closeSheets(root) { sheets.get(root)?.(); }
  function sheet(root, html, o = {}) {
    closeSheets(root);
    const scrim = document.createElement("div"); scrim.className = "sk-scrim";
    const el = document.createElement("section"); el.className = "sk-sheet";
    el.setAttribute("role", "dialog"); el.setAttribute("aria-modal", "true"); el.setAttribute("aria-label", o.label || "Painel");
    el.innerHTML = `<span class="sk-grab" aria-hidden="true"></span>${html}`;
    root.append(scrim, el);
    let closed = false, release = () => {};
    const close = (restore = true) => {
      if (closed) return; closed = true;
      release(restore); el.inert = true; el.setAttribute("aria-hidden", "true");
      el.removeAttribute("data-open"); scrim.removeAttribute("data-open");
      sheets.delete(root);
      setTimeout(() => { el.remove(); scrim.remove(); }, root.hasAttribute("data-reduced-motion") ? 0 : 430);
    };
    sheets.set(root, () => close(false));
    scrim.addEventListener("click", close);
    el.addEventListener("click", (e) => { if (e.target.closest("[data-close]")) close(); });
    requestAnimationFrame(() => {
      if (closed) return;
      scrim.setAttribute("data-open", ""); el.setAttribute("data-open", "");
      release = modalFocus(el, close, { keep: [scrim] });
    });
    return { close, el };
  }

  function combobox(host, options) {
    if (!window.ViewerUISDK) {
      throw new Error('Habilite uiSdk: ["combobox"] em project.json e gere novamente.');
    }
    return window.ViewerUISDK.mountCombobox(host, options);
  }

  function badge(text, tone = "neutral") {
    return `<span class="sk-badge" data-tone="${esc(tone)}">${esc(text)}</span>`;
  }

  function alert(text, tone = "info", actionHtml = "") {
    const role = tone === "danger" ? "alert" : "status";
    return `<div class="sk-alert" data-tone="${esc(tone)}" role="${role}"><span>${esc(text)}</span>${actionHtml}</div>`;
  }

  function kpi(items = []) {
    return `<div class="sk-kpi-grid">${items.map((it) => `<div class="sk-kpi"><b>${esc(it.value)}</b><span>${esc(it.label)}</span></div>`).join("")}</div>`;
  }

  function table({ columns = [], rows = [] } = {}) {
    const th = columns.map((c) => `<th scope="col">${esc(c)}</th>`).join("");
    const tr = rows.map((r) => `<tr>${r.map((cell) => `<td>${esc(cell)}</td>`).join("")}</tr>`).join("");
    return `<div class="sk-table-wrap"><table class="sk-table"><thead><tr>${th}</tr></thead><tbody>${tr}</tbody></table></div>`;
  }

  function steps(items = [], activeIndex = 0) {
    return `<ol class="sk-steps" aria-label="Etapas">${items.map((label, idx) => `<li class="sk-step" data-current="${idx === activeIndex}" data-done="${idx < activeIndex}" ${idx === activeIndex ? 'aria-current="step"' : ""}>${idx + 1}. ${esc(label)}</li>`).join("")}</ol>`;
  }

  function empty({ title = "Nenhum item", body = "", actionHtml = "" } = {}) {
    return `<div class="sk-empty" role="status"><strong>${esc(title)}</strong>${body ? `<span>${esc(body)}</span>` : ""}${actionHtml}</div>`;
  }

  window.Kit = { esc, icon, status, bar, tabs, media, lines, tag, badge, alert, kpi, table, steps, empty, on, toast, sheet, closeSheets, modalFocus, combobox, get TABS() { return tabsList(); } };
})();
