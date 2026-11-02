/* Light/dark theme toggle — persisted in localStorage, applied to <html data-theme>. */
(function () {
  try {
    if (localStorage.getItem("fc_theme") === "light") {
      document.documentElement.setAttribute("data-theme", "light");
    }
  } catch (e) {}
  document.addEventListener("DOMContentLoaded", function () {
    var nav = document.querySelector(".city-nav");
    if (!nav) return;
    var b = document.createElement("button");
    b.type = "button";
    b.className = "nav-all nav-theme";
    b.setAttribute("aria-label", "Toggle light or dark mode");
    function paint() {
      b.innerHTML = document.documentElement.getAttribute("data-theme") === "light"
        ? "&#127769; DARK" : "&#9728; LIGHT";
    }
    b.addEventListener("click", function () {
      var light = document.documentElement.getAttribute("data-theme") === "light";
      if (light) document.documentElement.removeAttribute("data-theme");
      else document.documentElement.setAttribute("data-theme", "light");
      try { localStorage.setItem("fc_theme", light ? "dark" : "light"); } catch (e) {}
      paint();
    });
    paint();
    nav.appendChild(b);
  });
})();
