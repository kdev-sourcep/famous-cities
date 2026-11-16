import { cities, absUrl } from "../lib/site";
import guides from "../data/guides.json";

export function GET() {
  const pages: [string, number][] = [
    ["", 1.0], ["cities.html", 0.9], ["best-cities-2026.html", 0.9], ["speed-tour.html", 0.8], ["book.html", 0.8], ["city-vs-city.html", 0.7], ["picks.html", 0.7], ["feature-restaurant.html", 0.5],
    ["Best-City-Image-Swap.html", 0.6], ["blog/blog.html", 0.6],
    ["blog/dubai-3-day-budget.html", 0.6], ["blog/dubai-layover-guide.html", 0.6],
    ["support.html", 0.5], ["about.html", 0.4], ["terms.html", 0.3], ["privacy.html", 0.3],
    ...guides.map((g) => [`guides/${g.slug}.html`, 0.7] as [string, number]),
    ...cities.map((c) => [`${c.slug}.html`, 0.8] as [string, number]),
  ];
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages
    .map(([p, pr]) => `  <url><loc>${absUrl(p)}</loc><priority>${pr.toFixed(1)}</priority></url>`)
    .join("\n")}\n</urlset>\n`;
  return new Response(body, { headers: { "Content-Type": "application/xml" } });
}
