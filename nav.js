(function () {
  // Lets the region menus open by tap/click (phones) as well as hover (desktop).
  document.addEventListener("click", function (e) {
    var btn = e.target.closest && e.target.closest(".nav-region-btn");
    Array.prototype.forEach.call(document.querySelectorAll(".nav-region.open"), function (r) {
      if (!btn || r !== btn.parentNode) {
        r.classList.remove("open");
        r.querySelector(".nav-region-btn").setAttribute("aria-expanded", "false");
      }
    });
    if (btn) {
      var open = btn.parentNode.classList.toggle("open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    }
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      Array.prototype.forEach.call(document.querySelectorAll(".nav-region.open"), function (r) { r.classList.remove("open"); });
    }
  });
})();
