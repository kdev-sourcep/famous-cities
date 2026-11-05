import regionsData from "../data/regions.json";
import rankingsData from "../data/rankings.json";
import categoriesData from "../data/categories.json";

export interface City {
  slug: string; name: string; region: string; country: string; metro: string;
  seo: { title: string; description: string; keywords: string };
  image: string | null; video: string | null; youtube: string | null; tagline: string;
  highlights: string[]; social: { facebook?: string; twitter?: string; wikipedia?: string };
  overview: string[]; booking: { hotels?: string; tours?: string; flights?: string };
  topThings: { icon: string; title: string; desc: string; viator?: string; getyourguide?: string }[];
  funFacts: { title: string; text: string }[]; randomFacts: string[]; faq: { q: string; a: string }[];
  speedTour: boolean; rank2026: number | null;
}

export const SITE_NAME = "Famous Cities";
export const SITE_URL = "https://kdev-sourcep.github.io";
const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

/** Every internal href/src goes through this so the base path is always added. */
export function url(path = ""): string {
  const p = path.replace(/^\/+/, "");
  return `${BASE}/${p}`;
}
export const absUrl = (path = "") => SITE_URL + url(path);
export const cityHref = (slug: string) => url(`${slug}.html`);

/** Rewrite root-relative links inside migrated rich text. */
export function rich(html: string): string {
  return html.replace(/href="\/(?!\/)([^"]*)"/g, (_, p) => `href="${url(p)}"`);
}

const cityModules = import.meta.glob<City>("../data/cities/*.json", { eager: true, import: "default" });
export const regions: { name: string; cities: string[] }[] = regionsData;
const bySlug = new Map(Object.values(cityModules).map((c) => [c.slug, c]));
export const cities: City[] = regions.flatMap((r) => r.cities.map((s) => bySlug.get(s)!).filter(Boolean));
export const getCity = (slug: string) => bySlug.get(slug);
export const citiesIn = (region: string) => cities.filter((c) => c.region === region);
export const rankings = rankingsData as { source: string; rows: { rank: number; name: string; country: string; slug?: string }[] };
export const categories = categoriesData as { key: string; label: string; desc: string }[];
export const rankedCities = cities.filter((c) => c.rank2026).sort((a, b) => a.rank2026! - b.rank2026!);

export const REGION_COLORS: Record<string, [string, string]> = {
  "Europe": ["#6B4EFF", "#A855F7"],
  "Asia": ["#FF5A5F", "#FF8A3D"],
  "Middle East": ["#F59E0B", "#FB7185"],
  "Africa": ["#0FB5A2", "#22C55E"],
  "North America": ["#FF4FA3", "#8B5CF6"],
  "South America": ["#16A34A", "#0EA5E9"],
  "Oceania": ["#0EA5E9", "#6366F1"],
};
export const regionId = (r: string) => r.toLowerCase().replace(/\s+/g, "-");
export function regionStyle(region: string): string {
  const [a, b] = REGION_COLORS[region] || ["#6b4eff", "#ff4fa3"];
  return `--c1:${a};--c2:${b}`;
}

const KEEP_UPPER = new Set(["UNESCO", "USA", "UK", "UAE"]);
export function factTitle(s: string): string {
  return s.replace(/\s+/g, " ").trim().split(" ").map((w) => {
    const bare = w.replace(/[^A-Za-z]/g, "");
    if (KEEP_UPPER.has(bare)) return w;
    return w.toLowerCase().replace(/(^|[-'"(“‘])([a-z])/g, (_, p, c) => p + c.toUpperCase());
  }).join(" ").replace(/\s+([!?.,])/g, "$1");
}

export const CATEGORY_COLORS: Record<string, string> = { people: "--c1:#FF4FA3;--c2:#8B5CF6", location: "--c1:#0EA5E9;--c2:#6366F1", promotion: "--c1:#FF5A5F;--c2:#FF8A3D", prosperity: "--c1:#0FB5A2;--c2:#22C55E", programming: "--c1:#6B4EFF;--c2:#A855F7", product: "--c1:#F59E0B;--c2:#FB7185" };

export const CATEGORY_ICONS: Record<string, string> = {
  people: "users", location: "map-pin", promotion: "megaphone",
  prosperity: "banknote", programming: "drama", product: "landmark",
};

const TOP_ICON_RULES: [RegExp, string][] = [
  [/food|eat|taste|tasting|cook|culinary|street food|market|dinner|brunch/i, "utensils"],
  [/wine|beer|brewery|pub|bar crawl|vineyard/i, "wine"],
  [/cruise|boat|ferry|river|canal|sail|yacht|harbou?r|abra|kayak/i, "ship"],
  [/castle|palace|fort|citadel|tower of|kremlin|alhambra/i, "castle"],
  [/museum|art|gallery|louvre|exhibit/i, "palette"],
  [/church|cathedral|temple|mosque|basilica|monastery|shrine|abbey/i, "church"],
  [/safari|wildlife|zoo|animal|condor|penguin|aquarium/i, "binoculars"],
  [/beach|surf|snorkel|dive|island|coast|swim/i, "waves-horizontal"],
  [/hike|trek|volcano|mountain|canyon|glacier|peak|desert|dune/i, "mountain"],
  [/park|garden|forest|jungle|rainforest/i, "tree-pine"],
  [/show|theatre|theater|music|concert|tango|flamenco|opera/i, "drama"],
  [/bike|cycling|e-bike/i, "bike"],
  [/train|rail|tram/i, "train-front"],
  [/walk|walking|old town|historic|heritage|history/i, "footprints"],
  [/view|observation|skyline|tower|deck|wheel|eye/i, "building"],
  [/shop|souk|bazaar|mall/i, "shopping-bag"],
  [/day trip|excursion|tour/i, "map-pin"],
];
export function topIcon(title: string, desc: string): string {
  for (const [re, icon] of TOP_ICON_RULES) if (re.test(title)) return icon;
  for (const [re, icon] of TOP_ICON_RULES) if (re.test(desc)) return icon;
  return "ticket";
}

export const searchIndex = () => cities.map((c) => ({ n: c.name, c: c.country, r: c.region, u: cityHref(c.slug) }));

export const KOFI_URL = "https://ko-fi.com/famouscities";
export const GOFUNDME_URL = "https://www.gofundme.com/f/support-famous-cities-and-its-creator";
