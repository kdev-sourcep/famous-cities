// Snapshot real hotel data (Google Hotels via SerpApi) for the two-hotel compare box.
// Usage: SERPAPI_API_KEY=... node scripts/fetch-hotels.mjs <Slug> <checkIn> <checkOut> [count] [hotels|brands|homes]
// Costs 1 + count searches. Writes src/data/hotels/<Slug>[.<kind>].json and photos to public/hotel-photos/<Slug>/.
import fs from "node:fs/promises";
import path from "node:path";

const [slug, checkIn, checkOut, countArg = "8", kind = "hotels"] = process.argv.slice(2);
const BRANDS = [["Marriott", /marriott|courtyard|westin|sheraton|m[ée]ridien|renaissance|moxy|ac hotel|autograph|w paris|luxury collection|aloft|citizenm/i], ["Hilton", /hilton|hampton|doubletree|canopy|curio|conrad|waldorf|tapestry/i], ["IHG", /holiday inn|crowne plaza|intercontinental|indigo|kimpton|voco|regent/i], ["Hyatt", /hyatt|andaz/i], ["Accor", /novotel|ibis|mercure|pullman|sofitel|mgallery|adagio|swiss[oô]tel|fairmont|mama shelter|raffles|movenpick|m[öo]venpick/i]];
const brandOf = (n) => BRANDS.find(([, re]) => re.test(n))?.[0] || "";
const LIST = () => ({ hotels: {}, brands: { brands: "46,28,17,37,33" }, homes: { vacation_rentals: true, q: cityName } })[kind];
if (!["hotels", "brands", "homes"].includes(kind)) throw new Error("kind must be hotels, brands or homes");
const key = process.env.SERPAPI_API_KEY;
if (!slug || !checkIn || !checkOut) throw new Error("Usage: node scripts/fetch-hotels.mjs <Slug> <checkIn> <checkOut> [count]");
if (!key) throw new Error("Set SERPAPI_API_KEY");

const root = path.resolve(import.meta.dirname, "..");
const city = JSON.parse(await fs.readFile(path.join(root, "src/data/cities", `${slug}.json`), "utf8"));
const cityName = city.name;
const adults = 2;
const bookingAid = new URL(city.booking.hotels).searchParams.get("aid");

async function serp(params) {
  const u = new URL("https://serpapi.com/search.json");
  const all = { engine: "google_hotels", q: `${cityName} hotels`, check_in_date: checkIn, check_out_date: checkOut, adults, currency: "USD", gl: "us", hl: "en", ...params, api_key: key };
  for (const [k, v] of Object.entries(all)) u.searchParams.set(k, String(v));
  const res = await fetch(u);
  const json = await res.json();
  if (!res.ok || json.error) throw new Error(`SerpApi: ${json.error || res.status}`);
  return json;
}

function bookingUrl(name) {
  const u = new URL("https://www.booking.com/searchresults.html");
  u.searchParams.set("ss", `${name}, ${cityName}`);
  u.searchParams.set("checkin", checkIn);
  u.searchParams.set("checkout", checkOut);
  u.searchParams.set("group_adults", String(adults));
  if (bookingAid) u.searchParams.set("aid", bookingAid);
  return u.toString();
}

const list = await serp(LIST());
const picks = (list.properties || [])
  .filter((p) => (kind === "homes" ? p.type !== "hotel" : p.type === "hotel") && p.property_token && p.overall_rating && (p.reviews || 0) >= (kind === "homes" ? 10 : 100) && (kind !== "brands" || brandOf(p.name)))
  .slice(0, Number(countArg));

const photoDir = path.join(root, "public/hotel-photos", slug);
await fs.mkdir(photoDir, { recursive: true });
const prefix = kind === "hotels" ? "" : `${kind}-`;
for (const f of await fs.readdir(photoDir)) if (prefix ? f.startsWith(prefix) : /^\d+\.jpg$/.test(f)) await fs.rm(path.join(photoDir, f));

const hotels = [];
for (const [i, p] of picks.entries()) {
  const d = await serp({ ...LIST(), property_token: p.property_token });
  const seen = new Set();
  const prices = (d.prices || [])
    .map((x) => ({ source: x.source, price: x.rate_per_night?.extracted_lowest, official: !!x.official, link: x.link }))
    .filter((x) => x.price && x.source && !seen.has(x.source) && seen.add(x.source))
    .map((x) => (x.source === "Booking.com" ? { ...x, link: bookingUrl(d.name) } : x))
    .sort((a, b) => a.price - b.price);
  const room = (d.featured_prices || []).flatMap((f) => f.rooms || []).find((r) => r.images?.length);
  if (prices.length < 2 || /dorm/i.test(room?.name || "")) continue;
  const photoSrc = room?.images[0] || d.images?.[0]?.original_image;
  let photo = "";
  if (photoSrc) {
    const r = await fetch(photoSrc);
    if (r.ok) {
      photo = `${prefix}${i + 1}.jpg`;
      await fs.writeFile(path.join(photoDir, photo), Buffer.from(await r.arrayBuffer()));
    }
  }
  hotels.push({
    id: p.property_token,
    name: d.name,
    address: d.address || "",
    brand: kind === "brands" ? brandOf(d.name) : "",
    info: kind === "homes" ? (d.essential_info || []).slice(0, 3) : [],
    stars: d.extracted_hotel_class || 0,
    rating: d.overall_rating,
    reviews: d.reviews || 0,
    room: room?.name || "",
    photo,
    freeCancellation: (d.featured_prices || []).some((f) => f.free_cancellation),
    amenities: (d.amenities || []).slice(0, 3),
    prices,
  });
  console.log(`${d.name}: ${prices.length} prices, from $${prices[0].price}`);
}

const out = { city: cityName, checkIn, checkOut, adults, currency: "USD", fetchedAt: new Date().toISOString().slice(0, 10), source: "Google Hotels via SerpApi", hotels };
await fs.writeFile(path.join(root, "src/data/hotels", `${slug}${kind === "hotels" ? "" : "." + kind}.json`), JSON.stringify(out, null, 2) + "\n");
console.log(`Wrote ${hotels.length} hotels (${1 + picks.length} searches used)`);
