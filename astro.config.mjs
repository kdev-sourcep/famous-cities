import { defineConfig } from "astro/config";

export default defineConfig({
  site: process.env.SITE_URL || "https://kdev-sourcep.github.io",
  base: process.env.BASE_PATH || "/famous-cities",
  trailingSlash: "ignore",
  build: { format: "file" },
});
