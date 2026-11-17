/* ==========================================================================
   FIRST-VISIT TOUR: three steps: sections (left), directions (bottom), the why (right).
   Shows once per browser; "Show me around" in the rail replays it; ?tour=1 forces it.
   Skipped under automation (navigator.webdriver) so screenshots stay clean.
   ========================================================================== */
(function () {
  const KEY = window.Proto.storageKey("toured");
  const store = {
    get() { try { return localStorage.getItem(KEY); } catch { return null; } },
    set() { try { localStorage.setItem(KEY, "1"); } catch {} },
  };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const currentNames = () => [...document.querySelectorAll(".proto-picker-item:not(.proto-picker-replay)")].map((item) => item.textContent);
  const fine = () => { try { return matchMedia("(pointer: fine)").matches && innerWidth > 760; } catch { return true; } };
  const list = (arr) => arr.length < 2 ? (arr[0] || "") : arr.slice(0, -1).join(", ") + " e " + arr[arr.length - 1];

  const steps = [
    {
      target: () => document.querySelector(".flows"), place: "right",
      title: "Navegue pelos fluxos",
      body: () => `Os fluxos de ${esc(window.Proto.project.name)} ficam neste menu. Selecione um para explorar o protótipo.${fine() ? " Você também pode usar as teclas <kbd>↑</kbd> <kbd>↓</kbd> fora da prévia." : ""}`,
    },
    {
      target: () => document.querySelector(".proto-picker"), place: "top",
      title: "Explore as versões disponíveis",
      body: () => {
        const names = currentNames();
        return names.length > 1
          ? `Neste fluxo, compare ${esc(list(names))} nos botões abaixo do dispositivo. A seta circular reinicia a versão e suas interações.`
          : `Este fluxo tem uma versão: ${esc(names[0] || "ainda não registrada")}. A seta circular reinicia a tela. Outros fluxos podem ter mais versões.`;
      },
    },
    {
      target: () => document.querySelector(".notes"), place: "left",
      title: "Entenda cada proposta",
      body: () => `As notas descrevem a proposta e as interações que você pode experimentar. O conteúdo depende das informações registradas para cada versão.`,
    },
  ];

  let root, hole, card, i = 0, open = false, releaseFocus = null;

  function build() {
    root = document.createElement("div");
    root.className = "tour";
    root.innerHTML = `<div class="tour-hole" aria-hidden="true"></div>
      <section class="tour-card" role="dialog" aria-modal="true" aria-labelledby="tour-t" aria-describedby="tour-b">
        <p class="tour-k"></p><h2 class="tour-t" id="tour-t"></h2><p class="tour-b" id="tour-b"></p>
        <div class="tour-f"><span class="tour-dots" aria-hidden="true">${steps.map(() => "<i></i>").join("")}</span>
          <button type="button" class="tour-skip">Pular</button>
          <button type="button" class="tour-back">Voltar</button>
          <button type="button" class="tour-next">Avançar</button></div>
      </section>`;
    document.body.appendChild(root);
    hole = root.querySelector(".tour-hole");
    card = root.querySelector(".tour-card");
    root.querySelector(".tour-skip").addEventListener("click", finish);
    root.querySelector(".tour-back").addEventListener("click", () => go(i - 1));
    root.querySelector(".tour-next").addEventListener("click", () => (i === steps.length - 1 ? finish() : go(i + 1)));
  }

  function place() {
    if (!open) return;
    const st = steps[i], t = st.target();
    const W = innerWidth, H = innerHeight, pad = 8, gap = 18, m = 12;
    const narrow = W <= 760;
    let r = t && t.getBoundingClientRect();
    const visible = r && r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < H;
    if (visible) {
      const top = Math.max(m, r.top - pad), left = Math.max(m, r.left - pad);
      const bottom = Math.min(H - m, r.bottom + pad), right = Math.min(W - m, r.right + pad);
      hole.style.transform = `translate(${left}px, ${top}px)`;
      hole.style.width = right - left + "px"; hole.style.height = bottom - top + "px";
      hole.removeAttribute("data-off");
    } else hole.setAttribute("data-off", "");
    const cw = card.offsetWidth, ch = card.offsetHeight;
    let x, y, side = st.place;
    if (!visible || narrow) {
      // on phones the card takes the half of the screen the target isn't in
      const low = visible && (r.top + r.height / 2) > H / 2;
      x = (W - cw) / 2; y = low ? 20 : H - ch - 20; side = "none";
    }
    else if (side === "right") { x = r.right + pad + gap; y = r.top + 8; }
    else if (side === "left") { x = r.left - pad - gap - cw; y = r.top + 8; }
    else { x = r.left + r.width / 2 - cw / 2; y = r.top - pad - gap - ch; }
    if (side === "right" && x + cw > W - m) { x = (W - cw) / 2; y = H - ch - 20; side = "none"; }
    if (side === "left" && x < m) { x = (W - cw) / 2; y = H - ch - 20; side = "none"; }
    x = Math.min(W - cw - m, Math.max(m, x)); y = Math.min(H - ch - m, Math.max(m, y));
    card.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
    card.dataset.side = side;
  }

  function go(n) {
    i = Math.max(0, Math.min(steps.length - 1, n));
    const st = steps[i];
    card.querySelector(".tour-k").textContent = `${i + 1} de ${steps.length}`;
    card.querySelector(".tour-t").textContent = st.title;
    card.querySelector(".tour-b").innerHTML = st.body();
    card.querySelector(".tour-back").hidden = i === 0;
    card.querySelector(".tour-next").textContent = i === steps.length - 1 ? "Entendi" : "Avançar";
    root.querySelectorAll(".tour-dots i").forEach((d, k) => d.toggleAttribute("data-on", k === i));
    const t = st.target();
    if (t && innerWidth <= 760) t.scrollIntoView({ block: "center", behavior: "instant" });
    card.removeAttribute("data-in");
    requestAnimationFrame(() => { place(); requestAnimationFrame(() => card.setAttribute("data-in", "")); });
    card.querySelector(".tour-next").focus({ preventScroll: true });
  }

  function start() {
    if (open) return;
    if (!root) build();
    open = true; root.setAttribute("data-open", "");
    releaseFocus = window.Kit.modalFocus(card, finish, { initial: card.querySelector(".tour-next") });
    go(0);
  }
  function finish() {
    if (!open) return;
    open = false; store.set();
    root.removeAttribute("data-open");
    releaseFocus?.(); releaseFocus = null;
  }

  // While the tour is open it owns the keyboard: the viewer's version/flow keys stay quiet.
  window.addEventListener("keydown", (e) => {
    if (!open) return;
    if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); finish(); return; }
    if (e.key === "ArrowRight") { e.preventDefault(); e.stopPropagation(); i === steps.length - 1 ? finish() : go(i + 1); return; }
    if (e.key === "ArrowLeft") { e.preventDefault(); e.stopPropagation(); go(i - 1); return; }
    if (e.key === "Tab" || e.key === "Enter" || e.key === " ") return;
    e.stopPropagation();
  }, true);
  window.addEventListener("resize", place);
  document.addEventListener("scroll", place, true);

  window.addEventListener("DOMContentLoaded", () => {
    const again = document.querySelector(".tour-again");
    if (again) again.addEventListener("click", start);
    let force = false;
    try { force = new URLSearchParams(location.search).get("tour") === "1"; } catch {}
    if (!force && (navigator.webdriver || store.get())) return;
    const ready = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    ready.then(() => setTimeout(start, 700));
  });
})();
