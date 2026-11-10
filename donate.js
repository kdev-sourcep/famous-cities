(function () {
  // Change these two lines to update every donate button on the site.
  // DONATE_URL: your Ko-fi / PayPal / email link.
  var DONATE_URL = "https://ko-fi.com/famouscities";

  // GOFUNDME_URL: paste your GoFundMe campaign URL when it is live,
  // e.g. "https://www.gofundme.com/f/support-famous-cities".
  // Until then, the button links to the support.html statement page.
  var GOFUNDME_URL = "https://www.gofundme.com/f/support-famous-cities-and-its-creator";

  document.addEventListener("DOMContentLoaded", function () {
    Array.prototype.forEach.call(document.querySelectorAll(".donate-btn"), function (btn) {
      btn.href = DONATE_URL;
      if (/^https?:\/\//.test(DONATE_URL)) {
        btn.target = "_blank";
        btn.rel = "noopener";
      } else {
        btn.removeAttribute("target");
      }
    });
    Array.prototype.forEach.call(document.querySelectorAll(".gofundme-btn"), function (btn) {
      btn.href = GOFUNDME_URL;
      if (/^https?:\/\//.test(GOFUNDME_URL)) {
        btn.target = "_blank";
        btn.rel = "noopener";
      }
    });
  });
})();
