(function () {
  // Paste your Google Analytics 4 Measurement ID here (looks like "G-ABC123XYZ").
  // Leave it empty and nothing is loaded or tracked.
  var GA_MEASUREMENT_ID = "";

  if (!GA_MEASUREMENT_ID) return;

  var s = document.createElement("script");
  s.async = true;
  s.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_MEASUREMENT_ID;
  document.head.appendChild(s);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag("js", new Date());
  window.gtag("config", GA_MEASUREMENT_ID, { anonymize_ip: true });

  // Count clicks on booking, tour and donate buttons so you can see which partners people use.
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a.trip-btn, a.book-btn, a.donate-btn");
    if (!a) return;
    var group = a.closest(".trip-group");
    window.gtag("event", a.classList.contains("donate-btn") ? "donate_click" : "partner_click", {
      partner: a.textContent.replace(/^\W+/, "").trim(),
      category: group ? group.querySelector(".trip-group-title").textContent : (a.getAttribute("data-category") || ""),
      city: (document.querySelector("[data-city]") || {}).getAttribute ? document.querySelector("[data-city]").getAttribute("data-city") : "",
      link_url: a.href,
      transport_type: "beacon"
    });
  });
})();
