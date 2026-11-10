import { absUrl } from "../lib/site";

export function GET() {
  return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${absUrl("sitemap.xml")}\n`, { headers: { "Content-Type": "text/plain" } });
}
