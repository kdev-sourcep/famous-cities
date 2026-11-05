// Snapshot round-trip flight options (Google Flights via SerpApi) for the compare box. Costs 1 search.
// Usage: SERPAPI_API_KEY=... node scripts/fetch-flights.mjs <Slug> <FROM> <TO> <outbound YYYY-MM-DD> <return YYYY-MM-DD> [count]
import fs from "node:fs/promises";
import path from "node:path";

const [slug, from, to, outDate, retDate, countArg = "8"] = process.argv.slice(2);
const key = process.env.SERPAPI_API_KEY;
if (!slug || !from || !to || !outDate || !retDate) throw new Error("Usage: node scripts/fetch-flights.mjs <Slug> <FROM> <TO> <outbound> <return> [count]");
if (!key) throw new Error("Set SERPAPI_API_KEY");
const root = path.resolve(import.meta.dirname, "..");

const u = new URL("https://serpapi.com/search.json");
for (const [k, v] of Object.entries({ engine: "google_flights", departure_id: from, arrival_id: to, outbound_date: outDate, return_date: retDate, adults: 2, currency: "USD", gl: "us", hl: "en", api_key: key })) u.searchParams.set(k, String(v));
const res = await fetch(u);
const json = await res.json();
if (!res.ok || json.error) throw new Error(`SerpApi: ${json.error || res.status}`);

const all = [...(json.best_flights || []), ...(json.other_flights || [])].filter((f) => f.price && f.flights?.length);
const seen = new Set();
const flights = all.filter((f) => { const k = f.flights.map((l) => l.flight_number).join(); return !seen.has(k) && seen.add(k); })
  .slice(0, Number(countArg))
  .map((f, i) => {
    const legs = f.flights;
    const airlines = [...new Set(legs.map((l) => l.airline))];
    return {
      id: String(i + 1),
      airline: airlines.join(" + "),
      logo: f.airline_logo || legs[0].airline_logo || "",
      price: f.price,
      stops: legs.length - 1,
      duration: f.total_duration,
      depart: legs[0].departure_airport.time,
      arrive: legs.at(-1).arrival_airport.time,
      route: [legs[0].departure_airport.id, ...legs.map((l) => l.arrival_airport.id)],
      layovers: (f.layovers || []).map((l) => ({ airport: l.id, minutes: l.duration })),
      flightNumbers: legs.map((l) => l.flight_number),
      cabin: legs[0].travel_class || "Economy",
      legroom: legs[0].legroom || "",
      extensions: [...new Set(legs.flatMap((l) => l.extensions || []))].filter((e) => /wi-fi|power|video|legroom/i.test(e)).slice(0, 3),
    };
  });

const out = { from, to, outDate, retDate, adults: 2, currency: "USD", fetchedAt: new Date().toISOString().slice(0, 10), source: "Google Flights via SerpApi", googleUrl: json.search_metadata?.google_flights_url || "", flights };
await fs.mkdir(path.join(root, "src/data/flights"), { recursive: true });
await fs.writeFile(path.join(root, "src/data/flights", `${slug}.json`), JSON.stringify(out, null, 2) + "\n");
console.log(`Wrote ${flights.length} flights ${from}->${to}, from $${Math.min(...flights.map((f) => f.price))}`);
