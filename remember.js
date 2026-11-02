(function () {
  var MAX = 8;
  try {
    var city = document.querySelector(".trip-links[data-city]");
    var file = location.pathname.split("/").pop();
    var rec = [];
    try { rec = JSON.parse(localStorage.getItem("fc_recent") || "[]"); } catch (e) {}

    if (city) {
      rec = rec.filter(function (r) { return r.u !== file; });
      rec.unshift({ n: city.getAttribute("data-city"), u: file });
      rec = rec.slice(0, MAX);
      localStorage.setItem("fc_recent", JSON.stringify(rec));
    }

    var shown = rec.filter(function (r) { return r.u !== file; });
    if (!shown.length) return;

    var header = document.querySelector(".u-header");
    if (!header || !header.parentNode) return;

    var inBlog = /\/blog\//.test(location.pathname);
    var pre = inBlog ? "../" : "";
    var strip = document.createElement("div");
    strip.className = "recent-strip";
    strip.innerHTML = '<span class="recent-label">Recently viewed</span>' +
      shown.map(function (r) {
        return '<a href="' + pre + r.u + '">' + r.n + "</a>";
      }).join("");
    header.parentNode.insertBefore(strip, header.nextSibling);
  } catch (e) {}
})();
