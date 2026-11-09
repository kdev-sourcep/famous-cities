type Entry = { n: string; c: string; r: string; u: string };
const fold = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
const esc = (s: string) => s.replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[ch]!);

let index: Entry[] = [];
try { index = JSON.parse(document.getElementById("city-index")?.textContent || "[]"); } catch {}

/* City search: accent-insensitive with keyboard navigation */
function initSearch(root: HTMLElement) {
  const input = root.querySelector<HTMLInputElement>(".search__input")!;
  const list = root.querySelector<HTMLUListElement>(".search__list")!;
  let active = -1;
  const close = () => { list.hidden = true; input.setAttribute("aria-expanded", "false"); active = -1; };
  const items = () => Array.from(list.querySelectorAll<HTMLAnchorElement>("a"));
  const setActive = (i: number) => {
    const a = items(); if (!a.length) return;
    active = (i + a.length) % a.length;
    a.forEach((el, j) => el.classList.toggle("is-active", j === active));
    a[active].scrollIntoView({ block: "nearest" });
  };
  const render = () => {
    const q = fold(input.value);
    if (!q) return close();
    const hits = index
      .map((e) => ({ e, n: fold(e.n), c: fold(e.c) }))
      .filter((x) => x.n.includes(q) || x.c.includes(q))
      .sort((a, b) => Number(!a.n.startsWith(q)) - Number(!b.n.startsWith(q)) || a.n.localeCompare(b.n))
      .slice(0, 8);
    list.innerHTML = hits.length
      ? hits.map((x) => `<li role="option"><a href="${x.e.u}">${esc(x.e.n)} <small>${esc(x.e.c)}</small></a></li>`).join("")
      : `<li class="search__empty">No city matches “${esc(input.value)}”</li>`;
    list.hidden = false; input.setAttribute("aria-expanded", "true"); active = -1;
    if (hits.length) setActive(0);
  };
  input.addEventListener("input", render);
  input.addEventListener("focus", () => input.value && render());
  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); if (list.hidden) render(); else setActive(active + 1); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive(active - 1); }
    else if (e.key === "Enter") { const a = items()[active] || items()[0]; if (a) { e.preventDefault(); location.href = a.href; } }
    else if (e.key === "Escape") { close(); }
  });
  document.addEventListener("click", (e) => { if (!root.contains(e.target as Node)) close(); });
}
document.querySelectorAll<HTMLElement>("[data-search]").forEach(initSearch);

/* Mega menu */
const megaBtn = document.querySelector<HTMLButtonElement>("[data-mega-toggle]");
const mega = document.getElementById("mega");
if (megaBtn && mega) {
  const set = (open: boolean) => { mega.hidden = !open; megaBtn.setAttribute("aria-expanded", String(open)); };
  megaBtn.addEventListener("click", () => set(mega.hidden));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") set(false); });
  document.addEventListener("click", (e) => { if (!mega.hidden && !mega.contains(e.target as Node) && !megaBtn.contains(e.target as Node)) set(false); });
}

/* Drawer */
const drawer = document.querySelector<HTMLElement>("[data-drawer]");
const openBtn = document.querySelector<HTMLButtonElement>("[data-drawer-open]");
if (drawer && openBtn) {
  const set = (open: boolean) => {
    drawer.hidden = !open; openBtn.setAttribute("aria-expanded", String(open));
    document.documentElement.style.overflow = open ? "hidden" : "";
    if (open) drawer.querySelector<HTMLInputElement>(".search__input")?.focus();
  };
  openBtn.addEventListener("click", () => set(true));
  drawer.querySelectorAll("[data-drawer-close]").forEach((b) => b.addEventListener("click", () => set(false)));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !drawer.hidden) set(false); });
  matchMedia("(min-width: 1200px)").addEventListener("change", (m) => m.matches && set(false));
}

/* Lite YouTube */
document.addEventListener("click", (e) => {
  const btn = (e.target as HTMLElement).closest(".yt button");
  if (!btn) return;
  const box = btn.parentElement as HTMLElement;
  const f = document.createElement("iframe");
  f.src = box.dataset.ytSrc!;
  f.title = btn.getAttribute("aria-label") || "YouTube video";
  f.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
  f.allowFullscreen = true;
  box.replaceChildren(f);
});

/* Hero background video: autoplays like v1; skipped only when the visitor has data saver on */
const heroVideo = document.querySelector<HTMLVideoElement>("[data-hero-video]");
if (heroVideo) {
  const conn = (navigator as any).connection;
  const toggle = document.querySelector<HTMLButtonElement>("[data-video-toggle]");
  if (conn && conn.saveData) {
    heroVideo.pause();
    heroVideo.removeAttribute("src");
    heroVideo.load();
  } else {
    if (toggle) toggle.hidden = false;
    heroVideo.play().catch(() => {});
    toggle?.addEventListener("click", () => {
      const paused = heroVideo.paused;
      paused ? heroVideo.play() : heroVideo.pause();
      toggle.setAttribute("aria-pressed", String(!paused));
      toggle.querySelector("[data-play]")!.toggleAttribute("hidden", !paused ? false : true);
      toggle.querySelector("[data-pause]")!.toggleAttribute("hidden", !paused ? true : false);
      toggle.setAttribute("aria-label", paused ? "Pause background video" : "Play background video");
    });
  }
}

/* Section nav: highlight current section */
const secNav = document.querySelector<HTMLElement>("[data-section-nav]");
if (secNav) {
  const links = Array.from(secNav.querySelectorAll<HTMLAnchorElement>("a[href^='#']"));
  const targets = links.map((a) => document.getElementById(a.hash.slice(1))).filter(Boolean) as HTMLElement[];
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      links.forEach((a) => a.classList.toggle("is-active", a.hash === "#" + en.target.id));
      const cur = links.find((a) => a.hash === "#" + en.target.id);
      cur?.scrollIntoView({ block: "nearest", inline: "nearest" });
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  targets.forEach((t) => obs.observe(t));
}

/* Random fact */
document.querySelectorAll<HTMLElement>("[data-random-facts]").forEach((box) => {
  let facts: string[] = [];
  try { facts = JSON.parse(box.dataset.randomFacts || "[]"); } catch {}
  const out = box.querySelector<HTMLElement>("[data-fact-out]");
  let last = -1;
  box.querySelector("button")?.addEventListener("click", () => {
    if (!facts.length || !out) return;
    let i = Math.floor(Math.random() * facts.length);
    if (facts.length > 1 && i === last) i = (i + 1) % facts.length;
    last = i; out.textContent = facts[i];
  });
});

/* All-cities filter */
const filter = document.querySelector<HTMLInputElement>("[data-city-filter]");
if (filter) {
  const cards = Array.from(document.querySelectorAll<HTMLElement>("[data-filter-item]"));
  const groups = Array.from(document.querySelectorAll<HTMLElement>("[data-filter-group]"));
  const empty = document.querySelector<HTMLElement>("[data-filter-empty]");
  const apply = () => {
    const q = fold(filter.value);
    cards.forEach((c) => { c.hidden = !!q && !fold(c.dataset.filterItem || "").includes(q); });
    groups.forEach((g) => { g.hidden = !g.querySelector("[data-filter-item]:not([hidden])"); });
    if (empty) empty.hidden = cards.some((c) => !c.hidden);
  };
  filter.addEventListener("input", apply);
}

/* Light/dark theme toggle (light is the default) */
const themeBtns = document.querySelectorAll<HTMLButtonElement>("[data-theme-toggle]");
const syncTheme = () => { const dark = document.documentElement.dataset.theme === "dark"; themeBtns.forEach((b) => b.setAttribute("aria-pressed", String(dark))); };
themeBtns.forEach((b) => b.addEventListener("click", () => {
  const dark = document.documentElement.dataset.theme !== "dark";
  if (dark) document.documentElement.dataset.theme = "dark"; else delete document.documentElement.dataset.theme;
  try { localStorage.setItem("fc-theme", dark ? "dark" : "light"); } catch {}
  syncTheme();
}));
syncTheme();
