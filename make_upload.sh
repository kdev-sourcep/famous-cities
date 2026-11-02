#!/bin/bash
# Builds a clean copy of the site for uploading, without backups,
# the original huge videos and the uncompressed images.
cd "$(dirname "$0")"
OUT="../Famous_Cities_upload"
rm -rf "$OUT"
rsync -a \
  --exclude 'mp4 folder' --exclude '*.bak*' --exclude '.DS_Store' --exclude 'make_upload.sh' --exclude 'blog/post*.html' \
  --exclude 'images/Tokyo_City.png' --exclude 'images/Paris_City.png' --exclude 'images/Dubai1.png' \
  --exclude 'images/Glorious_image.png' --exclude 'images/London_City.png' \
  --exclude 'images/prosperity.png' --exclude 'images/8ceef0f2*' \
  ./ "$OUT/"

# --- sitemap.xml + robots.txt ---
# Set your real domain: SITE_URL=https://yourdomain.com ./make_upload.sh
SITE_URL="${SITE_URL:-https://famous-cities.netlify.app}"
TODAY=$(date +%Y-%m-%d)
{
  echo '<?xml version="1.0" encoding="UTF-8"?>'
  echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
  for f in "$OUT"/*.html; do
    [ "$f" = "$OUT/HOMEPAGE.html" ] && continue   # duplicate of index.html
    name=$(basename "$f")
    prio=0.7
    [ "$name" = "index.html" ] && prio=1.0
    [ "$name" = "cities.html" ] && prio=0.9
    [ "$name" = "best-cities-2026.html" ] && prio=0.9
    echo "  <url><loc>$SITE_URL/$name</loc><lastmod>$TODAY</lastmod><priority>$prio</priority></url>"
  done
  for f in "$OUT"/blog/*.html; do
    name=$(basename "$f")
    [ "$name" = "blog.html" ] && continue
    echo "  <url><loc>$SITE_URL/blog/$name</loc><lastmod>$TODAY</lastmod><priority>0.6</priority></url>"
  done
  echo '</urlset>'
} > "$OUT/sitemap.xml"

cat > "$OUT/robots.txt" <<ROBOTS
User-agent: *
Allow: /

Sitemap: $SITE_URL/sitemap.xml
ROBOTS

echo "Upload folder ready: $(cd "$OUT" && pwd) ($(du -sh "$OUT" | cut -f1))"
