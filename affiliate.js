/*
 * Famous Cities — affiliate/monetization config
 * ─────────────────────────────────────────────
 * Fill in values below after accounts are approved.
 * Everything stays inert (plain links, no tracking, no ads) while empty.
 *
 * STAY22    — paste your script src; monetizes every accommodation link.
 *             In their dashboard, EXCLUDE booking.com (your direct ID pays more).
 *             stay22_aid: your Stay22 affiliate ID → a live price map appears
 *             under "When are you going?" on every city page.
 * TRAVELPAYOUTS — marker + program IDs for Viator, GetYourGuide, Skyscanner,
 *             Kayak, SafetyWing, Airalo, DiscoverCars.
 * AMAZON    — your Associates tag → a "Pack for the trip" gear card appears
 *             inside the booking section of every city page.
 * ADSENSE/EZOIC — paste your AdSense client id → .ad-slot placeholders start
 *             serving real ads. (Swap loader for Ezoic script if approved there.)
 * EMAIL     — paste your Mailchimp/ConvertKit form action URL → a signup box
 *             appears above the footer on every page.
 */
var FC_AFF = {
  stay22_src: "",
  stay22_aid: "",
  tp_marker: "",
  tp_programs: {
    viator: "", getyourguide: "", skyscanner: "", kayak: "",
    safetywing: "", airalo: "", discovercars: ""
  },
  amazon_tag: "",
  adsense_client: "",
  email_action: ""
};

// ── Stay22 sitewide script ─────────────────────────────────────────
(function () {
  if (FC_AFF.stay22_src) {
    var s = document.createElement("script");
    s.src = FC_AFF.stay22_src;
    s.async = true;
    document.head.appendChild(s);
  }
})();

// ── Travelpayouts link wrapper ─────────────────────────────────────
// Safe to call unconditionally — returns the plain URL when unconfigured.
function FC_TP_WRAP(program, url) {
  var pid = FC_AFF.tp_programs[program];
  if (FC_AFF.tp_marker && pid) {
    return "https://tp.media/r?marker=" + encodeURIComponent(FC_AFF.tp_marker) +
           "&p=" + encodeURIComponent(pid) +
           "&u=" + encodeURIComponent(btoa(unescape(encodeURIComponent(url))));
  }
  return url;
}

// ── AdSense: auto-places ad slots at content breaks when configured ──
document.addEventListener("DOMContentLoaded", function () {
  if (FC_AFF.adsense_client) {
    var s = document.createElement("script");
    s.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=" +
            encodeURIComponent(FC_AFF.adsense_client);
    s.async = true; s.crossOrigin = "anonymous";
    document.head.appendChild(s);

    var anchors = [];
    var plan = document.getElementById("sec-plan-trip");
    var faq = document.getElementById("sec-faq") || document.querySelector(".faq-section");
    if (plan) anchors.push({ after: plan });          // below the booking buttons
    if (faq) anchors.push({ before: faq });           // above the FAQ accordion
    if (!anchors.length) {
      var footer = document.querySelector("footer");
      if (footer) anchors.push({ before: footer });
    }
    anchors.forEach(function (a) {
      var slot = document.createElement("div");
      slot.className = "ad-slot ad-live";
      slot.innerHTML = '<ins class="adsbygoogle" style="display:block" ' +
        'data-ad-client="' + FC_AFF.adsense_client + '" ' +
        'data-ad-format="auto" data-full-width-responsive="true"></ins>';
      if (a.after) a.after.parentNode.insertBefore(slot, a.after.nextSibling);
      else a.before.parentNode.insertBefore(slot, a.before);
      try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) {}
    });
  }

  // ── Email capture box above the footer ────────────────────────────
  if (FC_AFF.email_action) {
    var footer = document.querySelector("footer");
    if (footer) {
      var box = document.createElement("div");
      box.className = "email-signup";
      box.innerHTML =
        '<div class="email-signup-inner">' +
          '<p class="email-signup-title">Get city guides &amp; fun facts in your inbox</p>' +
          '<form class="email-signup-form" action="' + FC_AFF.email_action + '" method="post" target="_blank" rel="noopener">' +
            '<input type="email" name="EMAIL" placeholder="you@email.com" required>' +
            '<button type="submit">Subscribe</button>' +
          "</form>" +
          '<p class="email-signup-note">Occasional emails only. Unsubscribe anytime.</p>' +
        "</div>";
      footer.parentNode.insertBefore(box, footer);
    }
  }
});
