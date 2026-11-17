/* ==========================================================================
   VIEWER: flows (left), phone (centre), notes (right), version picker.
   Screens register with:  Proto.versions("<flowId>", [ {...}, ... ])
   ========================================================================== */
(function () {
  const { esc } = window.Kit;

  const PROJECT = JSON.parse(document.getElementById("prototype-project").textContent);
  const PERSONAS = PROJECT.personas || {};
  const FLOWS = PROJECT.flows;
  const storageKey = (key) => `prototype-viewer:${PROJECT.id}:${key}`;

  const registry = Object.create(null);
  function register(flowId, list) {
    if (!FLOWS.some((flow) => flow.id === flowId)) throw new Error(`Fluxo '${flowId}' não existe em project.json.`);
    if (Object.hasOwn(registry, flowId)) throw new Error(`O fluxo '${flowId}' já foi registrado. Reúna suas versões em uma chamada.`);
    if (!Array.isArray(list) || !list.length) throw new Error(`Registre ao menos uma versão para '${flowId}'.`);
    list.forEach((version, index) => {
      const where = `${flowId}, versão ${index + 1}`;
      if (!version || typeof version.name !== "string" || !version.name.trim() || typeof version.render !== "function") {
        throw new Error(`Em ${where}, preencha name e uma função render(root, ctx).`);
      }
      for (const key of ["fixes", "tryThis", "personas"]) {
        if (version[key] !== undefined && (!Array.isArray(version[key]) || version[key].some((item) => typeof item !== "string"))) {
          throw new Error(`Em ${where}, ${key} deve ser uma lista de textos.`);
        }
      }
      for (const id of version.personas || []) {
        if (!Object.hasOwn(PERSONAS, id)) throw new Error(`A persona '${id}' de ${where} não existe em project.json.`);
      }
    });
    registry[flowId] = list.slice();
  }
  window.Proto = {
    project: PROJECT,
    storageKey,
    versions: register,
    personas: PERSONAS,
    get registry() { return registry; },
    get flows() { return FLOWS; },
  };

  /* ---- State ---- */
  const store = {
    get(k, d) {
      try {
        let value = localStorage.getItem(storageKey(k));
        if (value == null && PROJECT.id === "pitang-bikes-demo") value = localStorage.getItem("protokit:" + k);
        return value == null ? d : value;
      } catch { return d; }
    },
    set(k, v) { try { localStorage.setItem(storageKey(k), v); } catch {} },
  };
  const preference = (key, options, fallback) => { const value = store.get(key, fallback); return options.includes(value) ? value : fallback; };
  const params = (() => { try { return new URLSearchParams(location.search); } catch { return new URLSearchParams(); } })();
  const prefersReduced = (() => { try { return matchMedia("(prefers-reduced-motion: reduce)").matches; } catch { return false; } })();
  const state = {
    flow: Math.max(0, FLOWS.findIndex((f) => f.id === (params.get("flow") || store.get("flow", FLOWS[0].id)))),
    v: (parseInt(params.get("v") || store.get("v", "1"), 10) || 1) - 1,
    theme: preference("theme", ["light", "dark"], "light"),
    text: preference("text", ["default", "large"], "default"),
    motion: prefersReduced ? "reduced" : preference("motion", ["full", "reduced"], "full"),
    annot: preference("annot", ["on", "off"], "on"),
    device: ["ios", "android", "web"].includes(params.get("device")) ? params.get("device") : preference("device", ["ios", "android", "web"], "ios"),
  };
  /* Frame sizes: outer device box and the screen inside it (CSS px) */
  const DEVICES = {
    ios: { w: 414, h: 868, label: "iPhone" },
    android: { w: 436, h: 939, label: "Android" },
    web: { w: 1280, h: 820, label: "Web" },
  };

  let screen, deviceWrap, device, cleanup = null, renderFrame = 0;
  let expanded = false, actualSize = false;

  /* ---- Build chrome ---- */
  function build() {
    const flowsEl = document.querySelector(".flows");
    flowsEl.innerHTML = FLOWS.map((f, i) => `<li><button class="flow-btn" data-flow="${i}"><span class="flow-num">${String(i + 1).padStart(2, "0")}</span><span class="flow-title">${esc(f.title)}</span><span class="flow-sum">${esc(f.sum)}</span></button></li>`).join("");
    flowsEl.addEventListener("click", (e) => { const b = e.target.closest(".flow-btn"); if (b) setFlow(+b.dataset.flow, 0); });

    screen = document.getElementById("screen");
    deviceWrap = document.querySelector(".device-wrap");
    device = document.querySelector(".device");

    document.querySelector("[data-expand]").addEventListener("click", () => setExpanded(!expanded));
    document.querySelector("[data-export-spec]")?.addEventListener("click", () => exportSpecMarkdown());
    document.querySelector("[data-size]").addEventListener("click", (event) => {
      actualSize = !actualSize;
      event.currentTarget.setAttribute("aria-pressed", String(actualSize));
      fit();
    });

    segs();
    fit();
    window.addEventListener("resize", () => { fit(); moveHighlight(); });
    window.addEventListener("popstate", () => {
      const query = new URLSearchParams(location.search);
      const flow = Math.max(0, FLOWS.findIndex((item) => item.id === query.get("flow")));
      const version = Math.max(0, (parseInt(query.get("v"), 10) || 1) - 1);
      const deviceName = query.get("device");
      if (Object.hasOwn(DEVICES, deviceName)) state.device = deviceName;
      document.querySelectorAll(".seg").forEach((seg) => seg._sync?.());
      if (flow === state.flow && version === state.v) { applyPrefs(); return; }
      const scrollTop = history.state?.viewerScroll || 0;
      setFlow(flow, version, "replace", { focus: true, scrollTop });
    });

    // Keyboard: versions (picker contract), flows ↑↓
    document.addEventListener("keydown", (e) => {
      if (document.querySelector(".today-dialog[open]")) return;
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) || e.target.isContentEditable) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      // a screen that has focus owns its keys (card paging, game input)
      if (e.key !== "Escape" && e.target.closest && e.target.closest("#screen") && e.target !== screen) return;
      if (e.key === "Escape") { if (!closePop() && expanded) setExpanded(false); return; }
      if (e.target.closest(".pop")) return;
      const n = versions().length;
      const num = parseInt(e.key, 10);
      if (num >= 1 && num <= n) setVersion(num - 1);
      else if (e.key === "ArrowRight") setVersion((state.v + 1) % n);
      else if (e.key === "ArrowLeft") setVersion((state.v - 1 + n) % n);
      else if (e.key === "ArrowDown") { e.preventDefault(); setFlow((state.flow + 1) % FLOWS.length, 0); }
      else if (e.key === "ArrowUp") { e.preventDefault(); setFlow((state.flow - 1 + FLOWS.length) % FLOWS.length, 0); }
      else if (e.key === "r" || e.key === "R") mount();
    });
    document.addEventListener("click", (e) => { if (!e.target.closest(".persona, .pop")) closePop(false); });
  }

  /* ---- Segmented controls (device / theme / text / annot / motion) ---- */
  function createSegmentedControl(seg) {
    const key = seg.dataset.key;
    const btns = [...seg.querySelectorAll("button")];
    const thumb = document.createElement("span");
    thumb.className = "seg-thumb";
    thumb.setAttribute("aria-hidden", "true");
    seg.prepend(thumb);

    const sync = () => {
      btns.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.val === state[key])));
      const active = btns.find((b) => b.dataset.val === state[key]) || btns[0];
      thumb.style.width = `${active.offsetWidth}px`;
      thumb.style.transform = `translateX(${active.offsetLeft - 2}px)`;
    };

    btns.forEach((b) => b.addEventListener("click", () => {
      state[key] = b.dataset.val;
      store.set(key, state[key]);
      sync();
      applyPrefs();
      if (key === "device") persist();
    }));

    seg._sync = sync;
    sync();
    requestAnimationFrame(() => requestAnimationFrame(() => seg.setAttribute("data-ready", "")));
  }

  function segs() {
    document.querySelectorAll(".seg").forEach(createSegmentedControl);
  }
  function applyPrefs() {
    document.documentElement.dataset.theme = state.theme;
    screen.dataset.theme = state.theme;
    screen.style.setProperty("--fs", state.text === "large" ? "1.18" : "1");
    screen.toggleAttribute("data-reduced-motion", state.motion === "reduced");
    screen.dataset.annot = state.annot;
    screen.dataset.device = state.device;
    if (device && device.dataset.device !== state.device) { device.dataset.device = state.device; fit(); }
  }

  /* ---- Fit phone to available height ---- */
  function setExpanded(value) {
    closePop(false);
    expanded = value;
    document.querySelector(".app").toggleAttribute("data-expanded", value);
    const button = document.querySelector("[data-expand]");
    button.setAttribute("aria-pressed", String(value));
    button.textContent = value ? "Voltar aos painéis" : "Ampliar prévia";
    fit(); moveHighlight();
  }
  function fit() {
    const viewport = document.querySelector(".preview-viewport");
    const availH = viewport.clientHeight - 32;
    const availW = viewport.clientWidth - 32;
    const D = DEVICES[state.device] || DEVICES.ios;
    const s = actualSize ? 1 : Math.max(0.1, Math.min(1, availH / D.h, availW / D.w));
    device.dataset.device = state.device;
    device.style.transform = `scale(${s})`;
    deviceWrap.style.width = D.w * s + "px";
    deviceWrap.style.height = D.h * s + "px";
    document.querySelector(".preview-scale").textContent = `${Math.round(s * 100)}% · ${D.w} px`;
    window.__phoneScale = s;
  }

  /* ---- Picker (adapted from Emil PICKER.md) ---- */
  let picker, highlight, items = [];
  function buildPicker() {
    const vs = versions();
    if (!picker) { picker = document.createElement("nav"); picker.className = "proto-picker"; picker.setAttribute("aria-label", "Versões do protótipo"); (document.querySelector(".stage") || document.body).appendChild(picker); }
    picker.removeAttribute("data-ready");
    picker.innerHTML = `<span class="proto-picker-highlight" aria-hidden="true"></span>` +
      vs.map((v) => `<button class="proto-picker-item">${esc(v.name)}</button>`).join("") +
      `<span class="proto-picker-divider" aria-hidden="true"></span><button class="proto-picker-item proto-picker-replay" aria-label="Repetir animação (R)">↻</button>`;
    highlight = picker.querySelector(".proto-picker-highlight");
    items = [...picker.querySelectorAll(".proto-picker-item:not(.proto-picker-replay)")];
    items.forEach((el, i) => el.addEventListener("click", () => setVersion(i)));
    picker.querySelector(".proto-picker-replay").addEventListener("click", () => mount());
    markPicker();
    requestAnimationFrame(() => requestAnimationFrame(() => picker.setAttribute("data-ready", "")));
  }
  function markPicker() {
    items.forEach((el, j) => { el.toggleAttribute("data-active", j === state.v); if (j === state.v) el.setAttribute("aria-current", "true"); else el.removeAttribute("aria-current"); });
    moveHighlight();
  }
  function moveHighlight() {
    const el = items[state.v]; if (!el || !highlight) return;
    highlight.style.width = el.offsetWidth + "px";
    highlight.style.transform = `translateX(${el.offsetLeft}px)`;
  }

  const versions = () => registry[FLOWS[state.flow].id] || [];

  function setFlow(i, v = 0, historyMode = "push", restore = {}) {
    state.flow = i; state.v = v;
    document.querySelectorAll(".flow-btn").forEach((b, j) => b.setAttribute("aria-current", String(j === i)));
    buildPicker();
    renderVersion(historyMode, restore);
  }
  function setVersion(i) {
    const n = versions().length; if (i < 0 || i >= n) return;
    state.v = i; markPicker(); renderVersion();
  }
  function persist(mode = "replace") {
    store.set("flow", FLOWS[state.flow].id); store.set("v", String(state.v + 1));
    try {
      const u = new URL(location.href);
      u.searchParams.set("flow", FLOWS[state.flow].id); u.searchParams.set("v", state.v + 1); u.searchParams.set("device", state.device);
      if (mode === "push" && u.href !== location.href) {
        history.replaceState({ ...history.state, viewerScroll: screen.querySelector(".sk-scroll")?.scrollTop || 0 }, "");
        history.pushState({ viewerScroll: 0 }, "", u);
      } else history.replaceState(history.state, "", u);
    } catch {}
  }

  function renderVersion(historyMode = "push", restore = {}) {
    const f = FLOWS[state.flow], ver = versions()[state.v];
    if (!ver) { state.v = 0; }
    markPicker();
    persist(historyMode);
    document.querySelector(".stage-flow").textContent = `${String(state.flow + 1).padStart(2, "0")} · ${f.title}`;
    document.querySelector(".stage-ver").textContent = versions()[state.v]?.name || "-";
    document.title = `${versions()[state.v]?.name || f.title} · ${PROJECT.name}`;
    notes();
    fit();
    mount(restore);
  }

  /* ---- Mount: clear, then render next frame so entrances re-run ---- */
  function mount(restore = {}) {
    const ver = versions()[state.v];
    cancelAnimationFrame(renderFrame);
    const moveFocus = restore.focus || screen.contains(document.activeElement);
    window.Kit.closeSheets(screen);
    if (cleanup) { try { cleanup(); } catch {} cleanup = null; }
    // Fresh element per mount: drops every listener a screen bound to its root.
    const fresh = screen.cloneNode(false);
    fresh.removeAttribute("style");
    screen.replaceWith(fresh);
    screen = fresh;
    applyPrefs();
    if (!ver) { screenError("Fluxo sem versão", `Registre uma versão com Proto.versions("${FLOWS[state.flow].id}", [...]) no arquivo de telas e gere o HTML novamente.`); return; }
    renderFrame = requestAnimationFrame(() => {
      try {
        cleanup = ver.render(screen, ctx) || null;
        if (moveFocus) { screen.tabIndex = -1; screen.focus({ preventScroll: true }); }
        const scroll = screen.querySelector(".sk-scroll");
        if (scroll && restore.scrollTop) scroll.scrollTop = restore.scrollTop;
      }
      catch (err) { console.error(err); screenError("Não foi possível abrir esta versão", "Revise a função render desta versão e gere o HTML novamente.", err); }
    });
  }

  function screenError(title, message, error) {
    screen.innerHTML = `<section class="screen-error" role="alert"><h2>${esc(title)}</h2><p>${esc(message)}</p>${error ? `<details><summary>Detalhes técnicos</summary><pre>${esc(error.stack || error)}</pre></details>` : ""}<button class="sk-btn" type="button">Recarregar prévia</button></section>`;
    screen.querySelector("button").addEventListener("click", () => location.reload());
  }

  const ctx = {
    go(flowId, v = 0) {
      const i = FLOWS.findIndex((f) => f.id === flowId);
      if (i < 0 || !Number.isInteger(v) || !registry[flowId]?.[v]) {
        console.warn("Destino do protótipo indisponível:", flowId, v);
        window.Kit.toast(screen, "Destino indisponível. Confira o fluxo e a versão no arquivo de telas.");
        return false;
      }
      setFlow(i, v); return true;
    },
    toast(msg, o) { window.Kit.toast(screen, msg, o); },
    get theme() { return state.theme; },
    get large() { return state.text === "large"; },
    get reduced() { return state.motion === "reduced"; },
    personas: PERSONAS,
  };

  /* ---- Global tab routing: one map for every screen. A screen that needs its own
     behaviour for a tab calls e.preventDefault() in its handler. ---- */
  const TAB_ROUTES = Object.fromEntries((PROJECT.navigation || []).map((tab) => [tab.id, [tab.flow, tab.version || 0]]));
  document.addEventListener("click", (e) => {
    const t = e.target.closest(".ph .sk-tab");
    if (!t || e.defaultPrevented) return;
    const r = TAB_ROUTES[t.dataset.tab]; if (!r) return;
    const cur = FLOWS[state.flow];
    if (cur.id === r[0] && state.v === r[1]) { const sc = screen.querySelector(".sk-scroll"); if (sc) sc.scrollTo({ top: 0, behavior: state.motion === "reduced" ? "auto" : "smooth" }); return; }
    ctx.go(r[0], r[1]);
  });

  /* ---- Notes panel & SPEC export ---- */
  function renderNoteSection(title, bodyHtml) {
    return `<section class="n-block"><h2 class="n-h">${esc(title)}</h2>${bodyHtml}</section>`;
  }

  function buildPersonaChip(id) {
    const p = PERSONAS[id];
    if (!p) return "";
    return `<button class="persona" data-p="${esc(id)}" aria-expanded="false" aria-haspopup="dialog" aria-controls="persona-details"><i style="background:${esc(p.color)}">${esc(p.ini)}</i>${esc(p.name)}</button>`;
  }

  function todayMarkup(items) {
    return items.map((item, index) => typeof item === "string"
      ? `<div class="today-ph"><span>${esc(item)}</span></div>`
      : `<button type="button" class="today-btn" data-today="${index}" aria-label="Ampliar: ${esc(item.cap)}"><img src="${esc(item.src)}" alt=""><span>${esc(item.cap)}</span></button>`).join("");
  }

  function openToday(item) {
    const dialog = document.createElement("dialog");
    dialog.className = "today-dialog";
    dialog.setAttribute("aria-label", item.cap);
    const image = document.createElement("img");
    image.src = item.src;
    image.alt = item.cap;
    const close = document.createElement("button");
    close.type = "button";
    close.textContent = "Fechar imagem";
    dialog.addEventListener("keydown", (event) => {
      if (event.key !== "Tab") return;
      event.preventDefault();
      close.focus();
    });
    close.addEventListener("click", () => dialog.close());
    dialog.addEventListener("close", () => dialog.remove(), { once: true });
    dialog.append(close, image);
    document.body.append(dialog);
    dialog.showModal();
    close.focus();
  }

  function notes() {
    closePop(false);
    const f = FLOWS[state.flow];
    const v = versions()[state.v] || {};
    const el = document.querySelector(".notes");
    const listHtml = (arr, cls = "n-list") => `<ul class="${cls}">${arr.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>`;
    const personasHtml = (v.personas || []).map(buildPersonaChip).join("");

    const sections = [
      v.axis && renderNoteSection("Proposta", `<p class="n-axis">${esc(v.axis)}</p>`),
      personasHtml && renderNoteSection("Para quem", `<div class="personas">${personasHtml}</div>`),
      v.fixes?.length && renderNoteSection("Problema que resolve", listHtml(v.fixes)),
      v.tryThis?.length && renderNoteSection("Experimente", listHtml(v.tryThis, "n-list n-try")),
      v.motion && renderNoteSection("Animação", `<p class="n-motion">${esc(v.motion)}</p>`),
      v.tradeoff && renderNoteSection("Pontos de atenção", `<p class="n-motion">${esc(v.tradeoff)}</p>`),
      f.today.length && renderNoteSection("Experiência atual", `<div class="today">${todayMarkup(f.today)}</div>`),
    ].filter(Boolean);

    el.innerHTML = sections.join("");
    el.querySelectorAll("[data-today]").forEach((button) => button.addEventListener("click", () => openToday(f.today[Number(button.dataset.today)])));
    el.querySelectorAll(".persona").forEach((b) => b.addEventListener("click", (e) => {
      e.stopPropagation();
      togglePop(b);
    }));
  }

  function exportSpecMarkdown() {
    const lines = [`# ${PROJECT.name}`, "", `- **ID:** \`${PROJECT.id}\``, `- **Fluxos:** ${FLOWS.length}`, ""];
    FLOWS.forEach((f, idx) => {
      lines.push(`## ${String(idx + 1).padStart(2, "0")}. ${f.title} (\`${f.id}\`)`);
      if (f.sum) lines.push("", f.sum);
      (registry[f.id] || []).forEach((v, vIdx) => {
        lines.push("", `### Versão ${vIdx + 1}: ${v.name}`);
        if (v.axis) lines.push(`- **Proposta:** ${v.axis}`);
        if (v.personas?.length) lines.push(`- **Personas:** ${v.personas.map((id) => PERSONAS[id]?.name || id).join(", ")}`);
        if (v.fixes?.length) lines.push("- **Problemas que resolve:**", ...v.fixes.map((x) => `  - ${x}`));
        if (v.tryThis?.length) lines.push("- **Experimente:**", ...v.tryThis.map((x) => `  - ${x}`));
        if (v.tradeoff) lines.push(`- **Pontos de atenção:** ${v.tradeoff}`);
      });
      lines.push("");
    });
    const blob = new Blob([lines.join("\n")], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${PROJECT.id}-SPEC.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  /* ---- Persona popover (origin-aware) ---- */
  let pop, popFor = null;
  function positionPopover(btn) {
    const r = btn.getBoundingClientRect();
    const left = Math.max(12, Math.min(r.left, window.innerWidth - pop.offsetWidth - 12));
    const below = r.bottom + 8 + pop.offsetHeight < window.innerHeight - 12;
    const rawTop = below ? r.bottom + 8 : r.top - 8 - pop.offsetHeight;
    const top = Math.max(12, Math.min(rawTop, window.innerHeight - pop.offsetHeight - 12));
    pop.style.left = `${left}px`;
    pop.style.top = `${top}px`;
    pop.style.setProperty("--origin", `${r.left - left + 16}px ${below ? "0" : "100%"}`);
  }

  function togglePop(btn) {
    if (popFor === btn) return closePop();
    closePop();
    const p = PERSONAS[btn.dataset.p];
    if (!pop) {
      pop = document.createElement("div");
      pop.className = "pop";
      pop.id = "persona-details";
      pop.tabIndex = -1;
      pop.setAttribute("role", "dialog");
      pop.setAttribute("aria-labelledby", "persona-name");
      document.body.appendChild(pop);
    }
    pop.innerHTML = `<b id="persona-name">${esc(p.name)} · ${esc(p.tag)}</b>${esc(p.line)}<q>${esc(p.quote)}</q><div><strong>Necessidades:</strong> ${esc(p.needs)}</div><div class="src">Perfil fictício usado neste exemplo</div><button type="button" class="preview-action">Fechar perfil</button>`;
    pop.querySelector("button").addEventListener("click", () => closePop());
    pop.hidden = false;
    positionPopover(btn);
    btn.setAttribute("aria-expanded", "true");
    popFor = btn;
    requestAnimationFrame(() => {
      if (popFor !== btn) return;
      pop.setAttribute("data-open", "");
      pop.focus({ preventScroll: true });
    });
  }
  function closePop(restore = true) {
    const trigger = popFor;
    if (pop) { pop.removeAttribute("data-open"); pop.hidden = true; }
    if (trigger) { trigger.setAttribute("aria-expanded", "false"); if (restore && trigger.isConnected) trigger.focus({ preventScroll: true }); }
    popFor = null; return !!trigger;
  }

  /* ---- Boot after all screen files have registered ---- */
  window.addEventListener("DOMContentLoaded", () => {
    build();
    const vMax = (registry[FLOWS[state.flow].id] || []).length;
    setFlow(state.flow, Math.min(Math.max(0, state.v), Math.max(0, vMax - 1)), "replace");
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { fit(); moveHighlight(); document.querySelectorAll(".seg").forEach((s) => s._sync && s._sync()); });
  });
})();
