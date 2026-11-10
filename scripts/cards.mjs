// Builds small card photos (public/cards/<slug>.webp) from each city's video poster.
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const dir = "src/data/cities";
for (const f of fs.readdirSync(dir)) {
  const city = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
  if (!city.video) continue;
  const poster = path.join("public/posters", path.basename(city.video).replace(/\.mp4$/, ".jpg"));
  if (!fs.existsSync(poster)) { console.warn("no poster:", city.slug); continue; }
  await sharp(poster).resize(560, 340, { fit: "cover" }).webp({ quality: 58 }).toFile(`public/cards/${city.slug}.webp`);
}
