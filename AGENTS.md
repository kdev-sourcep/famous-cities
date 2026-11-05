# Famous Cities (Astro)

Static travel site built with Astro and served from GitHub Pages at https://kdev-sourcep.github.io/famous-cities/.

## Commands
- `npm run dev`: local dev server at http://localhost:4321/famous-cities/
- `npm run build`: static build into `dist/` (104 pages)
- `npm run preview`: serve the built `dist/`
- `npm run check-links`: verify every internal href/src/data-src in `dist/` resolves (run after build)
- `npm run extract`: one-off migration from the old Nicepage HTML into `src/data/` (only while the old files exist)
- `PUBLIC_NOINDEX=1 npm run build`: adds `noindex` to every page (for preview copies)

Requires Node >= 22.23.4.

## Structure
- `src/data/cities/<Slug>.json`: one file per city guide (content, booking links, facts, FAQ)
- `src/data/regions.json`: region order and which cities belong to each (drives menus and grouping)
- `src/data/rankings.json`, `speed-tour.json`, `pages.json`, `categories.json`: other page content
- `src/lib/site.ts`: data loaders, URL helpers, region colors, icon rules
- `src/layouts/BaseLayout.astro`: head/meta/JSON-LD, header, footer, legacy scripts
- `src/components/`: Header, Footer, CityCard, SupportBand, YouTube (click-to-load), Icon (Lucide)
- `src/pages/[slug].astro`: city guide template; other pages live alongside it
- `src/scripts/site.ts`: the single client bundle (search, menus, hero video, filters)
- `src/styles/global.css`: the whole design system
- `public/`: images, videos, favicon, robots.txt, Google verification file, and the legacy scripts
  `booking-links.js`, `analytics.js`, `affiliate.js`, `donate.js`, `remember.js`

## Adding a city
1. Add `src/data/cities/<Slug>.json` (copy an existing city and edit every field). The URL becomes `<Slug>.html`.
2. Add the slug to the right region in `src/data/regions.json`.
3. Put its video in `public/videos/` and card image in `public/images/`.
4. If it is in Time Out's list, set `rank2026` and add `slug` to its row in `rankings.json`.
5. `npm run build && npm run check-links`.

## Rules
- Never hard-code internal paths. Always use `url()` / `cityHref()` from `src/lib/site.ts` (the site lives under `/famous-cities`). Migrated rich text goes through `rich()`.
- Keep the analytics classes `book-btn`, `trip-btn`, `donate-btn`, `gofundme-btn` and `data-category` on booking/donation links.
- Booking links use `rel="sponsored"`.
- Never delete `public/google0bc19cae6a0a3d6a.html` (Search Console verification).
- Stay22 map stays off until `stay22_aid` is set in `public/affiliate.js`.
