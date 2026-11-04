// One-off migration: old Nicepage HTML -> clean JSON in src/data/.
import fs from "node:fs";
import path from "node:path";
import * as cheerio from "cheerio";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "src/data");
const problems = [];
const read = (f) => cheerio.load(fs.readFileSync(path.join(ROOT, f), "utf8"));
const norm = (s) => (s || "").replace(/\s+/g, " ").trim();
const fold = (s) => norm(s).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const titleCase = (s) => norm(s).toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
const slugOf = (href) => (href || "").replace(/^(\.\.\/)+/, "").replace(/\.html(#.*)?$/, "");

const RICH = new Set(["a", "strong", "em", "b", "i"]);
const BLOCK = new Set(["p", "h2", "h3", "ul", "ol", "li", "blockquote"]);
function clean($, el, allowBlock = false) {
  const allowed = allowBlock ? new Set([...RICH, ...BLOCK]) : RICH;
  const walk = (node) =>
    $(node).contents().toArray().map((c) => {
      if (c.type === "text") return escapeText(c.data);
      if (c.type !== "tag") return "";
      const tag = c.tagName.toLowerCase();
      if (tag === "br") return " ";
      if (["script", "style", "img", "video", "iframe", "svg"].includes(tag)) return "";
      const inner = walk(c);
      if (!allowed.has(tag)) return inner;
      if (tag === "a") {
        let href = $(c).attr("href") || "";
        if (!/^(https?:|mailto:|#)/.test(href)) href = "/" + href.replace(/^(\.\.\/)+/, "");
        return `<a href="${href.replace(/"/g, "&quot;")}">${inner}</a>`;
      }
      return `<${tag}>${inner}</${tag}>`;
    }).join("");
  return walk(el).replace(/[ \t\r\n]+/g, " ").replace(/<p>\s*<\/p>/g, "").trim();
}
function escapeText(t) { return t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

// ---------- Regions ----------
const $l = read("LONDON.html");
const regions = [];
$l(".nav-region").each((_, r) => {
  const name = titleCase($l(r).find(".nav-region-btn").text().replace("▾", ""));
  const cities = $l(r).find(".nav-menu a").toArray().map((a) => slugOf($l(a).attr("href")));
  regions.push({ name, cities });
});
const displayName = {};
$l(".nav-menu a").each((_, a) => { displayName[slugOf($l(a).attr("href"))] = norm($l(a).text()); });

// ---------- All Cities page ----------
const $c = read("cities.html");
const cardInfo = {};
$c("a.city-card").each((_, a) => {
  const slug = slugOf($c(a).attr("href"));
  cardInfo[slug] = { country: norm($c(a).find(".city-card-country").text()), image: ($c(a).find("img").attr("src") || "").replace(/^images\//, "") };
});

// ---------- Rankings ----------
const $r = read("best-cities-2026.html");
const rankings = $r(".rank-row").toArray().map((row) => ({
  rank: Number(norm($r(row).find(".rank-num").text())),
  name: norm($r(row).find(".rank-city").text()),
  country: norm($r(row).find(".rank-country").text()),
}));
const rankSource = norm($r(".rank-section p").first().text());

// ---------- Cities ----------
const HL = { person: "people", location: "location", promotion: "promotion", prosperity: "prosperity", programming: "programming", product: "product" };
const allSlugs = regions.flatMap((r) => r.cities);
const cities = [];
for (const slug of allSlugs) {
  const file = `${slug}.html`;
  if (!fs.existsSync(path.join(ROOT, file))) { problems.push(`missing file ${file}`); continue; }
  const html = fs.readFileSync(path.join(ROOT, file), "utf8");
  const $ = cheerio.load(html);
  const region = regions.find((r) => r.cities.includes(slug)).name;
  const name = displayName[slug];

  let country = cardInfo[slug]?.country || "";
  if (!country) {
    $('script[type="application/ld+json"]').each((_, s) => {
      try {
        const j = JSON.parse($(s).text());
        for (const n of j["@graph"] || [j]) if (n["@type"] === "TouristDestination" && n.isPartOf) country = n.isPartOf.name;
      } catch {}
    });
  }

  const metroH2 = $("h2").toArray().find((h) => /METRO:/i.test($(h).text()));
  const metro = metroH2 ? norm($(metroH2).text().split(/METRO:/i)[1]) : "";

  const seo = {
    title: norm($("title").text()),
    description: $('meta[name="description"]').attr("content") || "",
    keywords: $('meta[name="keywords"]').attr("content") || "",
  };

  const video = ($("video[src]").attr("src") || $("video source[src]").attr("src") || null);
  const yt = $('iframe[src*="youtube"]').attr("src");
  let youtube = yt ? (yt.match(/embed\/([\w-]{6,})/) || [])[1] || null : null;
  if (youtube === "LrCmXZ2f8jI") youtube = null;

  const tagEl = $("#sec-51fb p").toArray().find((p) => !$(p).closest(".fr-view").length && norm($(p).text()));
  const tagline = tagEl ? clean($, tagEl) : "";

  const highlights = [];
  $("#sec-51fb .u-social-icons-1 img").each((_, img) => {
    const f = path.basename($(img).attr("src") || "");
    const key = Object.keys(HL).find((k) => f.startsWith(k));
    if (key && !highlights.includes(HL[key])) highlights.push(HL[key]);
  });

  const social = {};
  $("a.u-social-url").each((_, a) => {
    const h = $(a).attr("href") || "";
    if (h.includes("facebook.com")) social.facebook = h;
    else if (h.includes("twitter.com") || h.includes("x.com/")) social.twitter = h;
    else if (h.includes("wikipedia.org")) social.wikipedia = h;
  });

  let longest = null, len = 0;
  $("#sec-details p, #sec-161d p").each((_, p) => { const t = norm($(p).text()).length; if (t > len) { len = t; longest = p; } });
  const overview = longest
    ? $(longest).html().split(/<br\s*\/?>\s*<br\s*\/?>/i).map((part) => clean($, cheerio.load(`<div>${part}</div>`, null, false)("div"))).filter(Boolean)
    : [];

  const booking = {};
  $(".trip-links a").each((_, a) => {
    const t = $(a).text(), h = $(a).attr("href");
    if (/hotel/i.test(t)) booking.hotels = h; else if (/tour/i.test(t)) booking.tours = h; else if (/flight/i.test(t)) booking.flights = h;
  });

  const topThings = $(".top-card").toArray().map((card) => {
    const links = {};
    $(card).find(".top-links a").each((_, a) => {
      if (/viator/i.test($(a).text())) links.viator = $(a).attr("href");
      if (/getyourguide/i.test($(a).text())) links.getyourguide = $(a).attr("href");
    });
    return { icon: norm($(card).find(".top-icon").text()), title: norm($(card).find(".top-title").text()), desc: norm($(card).find(".top-desc").text()), ...links };
  });

  const funFacts = [];
  const seen = new Set();
  $(".fact-card, #sec-cada .u-group-elements").each((_, g) => {
    if (seen.has(g)) return; seen.add(g);
    const title = norm($(g).find("h4").first().text());
    const text = clean($, $(g).find("h3").first());
    if (title || text) funFacts.push({ title, text });
  });

  let randomFacts = [];
  const m = html.match(/const \w+ = (\[[\s\S]*?\]);/);
  if (m) { try { randomFacts = new Function(`return ${m[1]}`)().map(norm).filter(Boolean); } catch (e) { problems.push(`${slug}: randomFacts parse ${e.message}`); } }

  const faq = $("details.faq-item").toArray().map((d) => ({ q: norm($(d).find("summary").text()), a: clean($, $(d).find("p").first()) }));

  const city = {
    slug, name, region, country, metro, seo,
    image: cardInfo[slug]?.image || null,
    video, youtube, tagline, highlights, social, overview, booking, topThings, funFacts, randomFacts, faq,
    speedTour: $(".speed-banner").length > 0, rank2026: null,
  };
  for (const [k, v] of Object.entries({ country, metro, tagline, video: city.video, image: city.image })) if (!v) problems.push(`${slug}: missing ${k}`);
  if (!overview.length) problems.push(`${slug}: no overview`);
  if (!funFacts.length) problems.push(`${slug}: no fun facts`);
  if (!randomFacts.length) problems.push(`${slug}: no random facts`);
  if (!faq.length) problems.push(`${slug}: no faq`);
  if (topThings.length !== 4) problems.push(`${slug}: ${topThings.length} top things`);
  if (!booking.hotels || !booking.tours || !booking.flights) problems.push(`${slug}: booking links incomplete`);
  cities.push(city);
}

// Match rankings to guides (accent-insensitive, Marrakech -> Marrakesh)
const ALIAS = { marrakech: "marrakesh" };
for (const row of rankings) {
  const key = ALIAS[fold(row.name)] || fold(row.name);
  const c = cities.find((x) => fold(x.name) === key);
  if (c) { row.slug = c.slug; c.rank2026 = row.rank; }
}

// ---------- Speed tour ----------
const $s = read("speed-tour.html");
const sec = $s("#sec-speed .u-sheet");
const speed = { title: norm(sec.find("h1").first().text()), intro: clean($s, sec.find("h1").first().nextAll("p").first()), legs: [], outro: "" };
let pendingVideos = [];
let cur = null;
sec.children().each((_, el) => {
  const $el = $s(el);
  if ($el.hasClass("tour-video")) {
    pendingVideos = $el.find("iframe").toArray().map((f) => ({ src: $s(f).attr("src"), title: $s(f).attr("title") || "" }));
  } else if (el.tagName === "h2") {
    cur = { title: norm($el.text()), text: "", cities: [], videos: pendingVideos.map((v) => ({ id: (v.src.match(/embed\/([\w-]+)/) || [])[1], params: (v.src.split("?")[1] || ""), title: v.title })) };
    pendingVideos = [];
    speed.legs.push(cur);
  } else if (el.tagName === "p" && cur) {
    const links = $el.find("a").toArray().map((a) => slugOf($s(a).attr("href"))).filter((s) => allSlugs.includes(s));
    if (links.length) cur.cities.push(...links);
    else if (!cur.text) cur.text = clean($s, el);
    else if (cur === speed.legs.at(-1)) speed.outro = clean($s, el);
  }
});
for (const leg of speed.legs) { leg.videos = leg.videos.map((v) => (v.id === "L-hm3S1aSnI" ? null : v)).filter(Boolean); }

// ---------- Prose pages ----------
const pages = {};
for (const [key, file] of Object.entries({ support: "support.html", privacy: "privacy.html", "dubai-3-day-budget": "blog/dubai-3-day-budget.html", "dubai-layover-guide": "blog/dubai-layover-guide.html" })) {
  const $p = read(file);
  const sheet = $p(".legal-section .u-sheet").first();
  const h1 = sheet.find("h1").first();
  sheet.find(".donate-buttons").remove();
  h1.remove();
  pages[key] = { title: norm($p("title").text()), description: $p('meta[name="description"]').attr("content") || "", heading: norm(h1.text()), html: clean($p, sheet, true) };
}

// ---------- Category descriptions ----------
const $i = read("Best-City-Image-Swap.html");
const bodyText = norm($i("body").text());
const categories = ["people", "location", "promotion", "prosperity", "programming", "product"].map((key) => {
  const label = key[0].toUpperCase() + key.slice(1);
  const mm = bodyText.match(new RegExp(`${label} ((?:The|A) [^]*?\\.)(?= (?:Location|Product|Programming|People|Prosperity|Promotion|FAMOUS) )`));
  if (!mm) problems.push(`category ${key}: no description`);
  return { key, label, desc: mm ? mm[1] : "" };
});

// ---------- Write ----------
fs.rmSync(path.join(OUT, "cities"), { recursive: true, force: true });
fs.mkdirSync(path.join(OUT, "cities"), { recursive: true });
const w = (f, d) => fs.writeFileSync(path.join(OUT, f), JSON.stringify(d, null, 2) + "\n");
for (const c of cities) w(`cities/${c.slug}.json`, c);
w("regions.json", regions);
w("rankings.json", { source: rankSource, rows: rankings });
w("speed-tour.json", speed);
w("pages.json", pages);
w("categories.json", categories);

const unmatched = rankings.filter((r) => !r.slug).map((r) => r.name);
console.log(`cities: ${cities.length}, regions: ${regions.length}, rankings: ${rankings.length} (${rankings.length - unmatched.length} with guides)`);
console.log(`speed legs: ${speed.legs.length} (${speed.legs.map((l) => `${l.cities.length}c/${l.videos.length}v`).join(", ")})`);
for (const n of ["Copenhagen", "Marrakech", "Hanoi", "Adelaide", "Osaka", "Cairo", "Lagos", "Auckland"]) {
  const r = rankings.find((x) => fold(x.name) === fold(n));
  if (r && !r.slug) problems.push(`ranking ${n} not linked to a guide`);
}
console.log(problems.length ? `PROBLEMS (${problems.length}):\n- ${problems.join("\n- ")}` : "No problems.");
