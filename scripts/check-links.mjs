// Verifies every internal href/src/data-src in dist/ resolves to a file.
import fs from "node:fs";
import path from "node:path";

const DIST = path.resolve("dist");
const BASE = (process.env.BASE_PATH || "/famous-cities").replace(/\/$/, "");
const files = [];
(function walk(d) { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); fs.statSync(p).isDirectory() ? walk(p) : files.push(p); } })(DIST);
const html = files.filter((f) => f.endsWith(".html"));
const ids = new Map();
const broken = [];
let checked = 0;
for (const file of html) {
  const src = fs.readFileSync(file, "utf8");
  const pageUrl = "/" + path.relative(DIST, file).split(path.sep).join("/");
  for (const m of src.matchAll(/\s(?:href|src|data-src)="([^"]+)"/g)) {
    let ref = m[1].replace(/&amp;/g, "&");
    if (/^(https?:|mailto:|tel:|data:|javascript:|\/\/)/.test(ref) || ref.includes("${")) continue;
    checked++;
    const [p, hash] = ref.split("#");
    let target;
    if (!p) target = pageUrl;
    else if (p.startsWith("/")) {
      if (!p.startsWith(BASE + "/") && p !== BASE) { broken.push(`${pageUrl}: ${ref} (missing base)`); continue; }
      target = p.slice(BASE.length) || "/";
    } else target = path.posix.join(path.posix.dirname(pageUrl), p);
    target = target.split("?")[0];
    let fsPath = path.join(DIST, decodeURIComponent(target));
    if (target.endsWith("/")) fsPath = path.join(fsPath, "index.html");
    if (!fs.existsSync(fsPath)) { broken.push(`${pageUrl}: ${ref}`); continue; }
    if (hash && fsPath.endsWith(".html")) {
      if (!ids.has(fsPath)) ids.set(fsPath, new Set([...fs.readFileSync(fsPath, "utf8").matchAll(/\sid="([^"]+)"/g)].map((x) => x[1])));
      if (!ids.get(fsPath).has(hash)) broken.push(`${pageUrl}: ${ref} (missing #${hash})`);
    }
  }
}
console.log(`${html.length} pages, ${checked} internal refs checked, ${broken.length} broken`);
if (broken.length) { console.log([...new Set(broken)].slice(0, 60).join("\n")); process.exit(1); }
