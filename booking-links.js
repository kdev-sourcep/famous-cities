(function () {
  // Paste affiliate IDs here once you join each program.
  var AFFILIATE = {
    booking: "2243524"
  };

  var FLIGHT_CODES = {
    "London": "lon",
    "Paris": "par",
    "Tokyo": "tyo",
    "Dubai": "dxb",
    "New York": "nyc",
    "Barcelona": "bcn",
    "Rome": "rom",
    "Madrid": "mad",
    "Amsterdam": "ams",
    "Singapore": "sin",
    "Istanbul": "ist",
    "Lisbon": "lis",
    "Bangkok": "bkk",
    "Las Vegas": "las",
    "Melbourne": "mel",
    "Edinburgh": "edi",
    "Cape Town": "cpt",
    "Mexico City": "mex",
    "Seoul": "sel",
    "Sydney": "syd",
    "Shanghai": "sha",
    "Hong Kong": "hkg",
    "Beijing": "bjs",
    "Buenos Aires": "bue",
    "Abu Dhabi": "auh",
    "Doha": "doh",
    "Riyadh": "ruh",
    "Tamarindo": "lir",
    "La Fortuna": "sjo",
    "Manuel Antonio": "sjo",
    "Santa Teresa": "sjo",
    "Nosara": "nob",
    "Rio de Janeiro": "rio",
    "Medellín": "mde",
    "Lima": "lim",
    "Bogotá": "bog",
    "Cartagena": "ctg",
    "La Paz": "lpb",
    "Cusco": "cuz",
    "Sucre": "sre",
    "Arequipa": "aqp",
    "Bariloche": "brc",
    "Cajamarca": "cja",
    "Córdoba": "cor",
    "Cuenca": "cue",
    "Valparaíso": "scl",
    "Shenzhen": "szx",
    "Chongqing": "ckg",
    "Changsha": "csx",
    "Manila": "mnl",
    "Kuala Lumpur": "kul",
    "Hanoi": "han",
    "Oslo": "osl",
    "Warsaw": "waw",
    "Auckland": "akl",
    "Nairobi": "nbo",
    "Lagos": "los",
    "Accra": "acc",
    "Munich": "muc", "Stockholm": "arn", "Copenhagen": "cph", "Helsinki": "hel",
    "Tallinn": "tll", "Riga": "rix", "Vilnius": "vno", "Budapest": "bud",
    "Bucharest": "otp", "Belgrade": "beg", "Sofia": "sof", "Sarajevo": "sjj",
    "Skopje": "skp", "Tirana": "tia", "Osaka": "kix", "Jakarta": "cgk",
    "Phnom Penh": "pnh", "Zhengzhou": "cgo", "Ulaanbaatar": "uln",
    "Santiago": "scl", "Brisbane": "bne", "Perth": "per", "Adelaide": "adl",
    "Queenstown": "zqn", "Cairo": "cai", "Marrakesh": "rak", "Dakar": "dkr",
    "Addis Ababa": "add", "Luanda": "lad", "Maputo": "mpm", "Windhoek": "wdh",
    "Gaborone": "gbe", "Lusaka": "lun", "Harare": "hre"
  };

  // t = { c: encoded city, city, inD: "YYYY-MM-DD", outD, adults, has: true when valid dates }
  function q(params) {
    return Object.keys(params).filter(function (k) { return params[k] !== "" && params[k] != null; })
      .map(function (k) { return k + "=" + params[k]; }).join("&");
  }
  function us(d) { var p = d.split("-"); return p[1] + "%2F" + p[2] + "%2F" + p[0]; }

  var GROUPS = [
    {
      title: "Hotels",
      sites: [
        { name: "Booking.com", icon: "🏨", url: function (t) { return "https://www.booking.com/searchresults.html?" + q({ ss: t.c, checkin: t.has ? t.inD : "", checkout: t.has ? t.outD : "", group_adults: t.adults, aid: AFFILIATE.booking }); } },
        { name: "Expedia", icon: "🧳", url: function (t) { return "https://www.expedia.com/Hotel-Search?" + q({ destination: t.c, startDate: t.has ? t.inD : "", endDate: t.has ? t.outD : "", adults: t.adults }); } },
        { name: "Hotels.com", icon: "🛎️", url: function (t) { return "https://www.hotels.com/Hotel-Search?" + q({ destination: t.c, startDate: t.has ? t.inD : "", endDate: t.has ? t.outD : "", adults: t.adults }); } },
        { name: "Agoda", icon: "🌏", url: function (t) { return "https://www.agoda.com/search?" + q({ textToSearch: t.c, checkIn: t.has ? t.inD : "", checkOut: t.has ? t.outD : "", adults: t.adults, rooms: 1 }); } },
        { name: "Kayak", icon: "🔎", url: function (t) { return "https://www.kayak.com/hotels/" + t.c + (t.has ? "/" + t.inD + "/" + t.outD + "/" + t.adults + "adults" : ""); } },
        { name: "Tripadvisor", icon: "⭐", url: function (t) { return "https://www.tripadvisor.com/Search?q=" + t.c; } }
      ]
    },
    {
      title: "Hotel Brands",
      sites: [
        { name: "Marriott", icon: "🏛️", url: function (t) { return "https://www.marriott.com/search/findHotels.mi?" + q({ "destinationAddress.destination": t.c, fromDate: t.has ? us(t.inD) : "", toDate: t.has ? us(t.outD) : "", numberOfAdults: t.adults }); } },
        { name: "Hilton", icon: "🏢", url: function (t) { return "https://www.hilton.com/en/search/?" + q({ query: t.c, arrivalDate: t.has ? t.inD : "", departureDate: t.has ? t.outD : "", numAdults: t.adults }); } },
        { name: "Hampton", icon: "🛏️", url: function (t) { return "https://www.hilton.com/en/search/?" + q({ query: t.c, arrivalDate: t.has ? t.inD : "", departureDate: t.has ? t.outD : "", numAdults: t.adults, brandCodes: "HP" }); } },
        { name: "IHG / Holiday Inn", icon: "🏨", url: function (t) { return "https://www.ihg.com/hotels/us/en/find-hotels/hotel/list?" + q({ qDest: t.c, qAdlt: t.adults, qRms: 1 }); } },
        { name: "Hyatt", icon: "🌇", url: function (t) { return "https://www.hyatt.com/search/hotels/en-US/" + t.c + "?" + q({ checkinDate: t.has ? t.inD : "", checkoutDate: t.has ? t.outD : "", rooms: 1, adults: t.adults }); } }
      ]
    },
    {
      title: "Homes",
      sites: [
        { name: "Airbnb", icon: "🏠", url: function (t) { return "https://www.airbnb.com/s/" + t.c + "/homes?" + q({ checkin: t.has ? t.inD : "", checkout: t.has ? t.outD : "", adults: t.adults }); } },
        { name: "Vrbo", icon: "🏡", url: function (t) { return "https://www.vrbo.com/search?" + q({ destination: t.c, startDate: t.has ? t.inD : "", endDate: t.has ? t.outD : "", adults: t.adults }); } }
      ]
    },
    {
      title: "Flights",
      sites: [
        {
          name: "Skyscanner", icon: "✈️", url: function (t) {
            var code = FLIGHT_CODES[t.city];
            return code
              ? "https://www.skyscanner.net/transport/flights/to/" + code + "/cheap-flights-to-" + t.city.toLowerCase().replace(/ /g, "-") + ".html"
              : "https://www.skyscanner.net/";
          }
        },
        { name: "Google Flights", icon: "🛫", url: function (t) { return "https://www.google.com/travel/flights?q=" + encodeURIComponent("Flights to " + t.city + (t.has ? " on " + t.inD + " through " + t.outD : "")); } },
        { name: "Kayak Flights", icon: "🧭", url: function () { return "https://www.kayak.com/flights"; } }
      ]
    },
    {
      title: "Tours",
      sites: [
        { name: "Viator", icon: "🎭", url: function (t) { return "https://www.viator.com/searchResults/all?text=" + t.c; } },
        { name: "GetYourGuide", icon: "🗺️", url: function (t) { return "https://www.getyourguide.com/s/?" + q({ q: t.c, date_from: t.has ? t.inD : "", date_to: t.has ? t.outD : "" }); } },
        { name: "Klook", icon: "🎟️", url: function (t) { return "https://www.klook.com/search/result/?query=" + t.c; } },
        { name: "Tiqets", icon: "🖼️", url: function (t) { return "https://www.tiqets.com/en/search?q=" + t.c; } }
      ]
    },
    {
      title: "Travel Extras",
      sites: [
        { name: "SafetyWing", icon: "🛡️", url: function () { return "https://safetywing.com/nomad-insurance/"; } },
        { name: "Airalo", icon: "📱", url: function () { return "https://www.airalo.com/"; } },
        { name: "DiscoverCars", icon: "🚗", url: function (t) { return "https://www.discovercars.com/search?q=" + t.c; } }
      ]
    }
  ];

  function today() {
    var d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }

  var PACK_ITEMS = [
    { name: "🧳 Packing cubes", k: "packing+cubes+travel" },
    { name: "🔌 Universal adapter", k: "universal+travel+adapter" },
    { name: "🎧 Noise-canceling earbuds", k: "noise+canceling+earbuds+travel" },
    { name: "🔋 Power bank", k: "portable+charger+power+bank" },
    { name: "💧 Filtered water bottle", k: "travel+water+bottle+filter" }
  ];

  var TP_PROGRAM = {
    "Viator": "viator", "GetYourGuide": "getyourguide",
    "Skyscanner": "skyscanner", "Kayak Flights": "kayak",
    "SafetyWing": "safetywing", "Airalo": "airalo", "DiscoverCars": "discovercars"
  };

  function linksHtml(t) {
    return GROUPS.map(function (group) {
      return '<div class="trip-group"><h4 class="trip-group-title">' + group.title + '</h4><div class="trip-buttons">' +
        group.sites.map(function (site) {
          var url = site.url(t);
          var prog = TP_PROGRAM[site.name];
          if (prog && typeof FC_TP_WRAP === "function") url = FC_TP_WRAP(prog, url);
          return '<a class="trip-btn" href="' + url + '" target="_blank" rel="sponsored noopener noreferrer">' +
            site.icon + " " + site.name + "</a>";
        }).join("") +
        "</div></div>";
    }).join("");
  }

  function stayMapSrc(city, inD, outD, adults, has) {
    var p = { aid: encodeURIComponent(FC_AFF.stay22_aid), address: encodeURIComponent(city), mapstyle: "light", maincolor: "6b4eff", listviewexpand: "true", adults: adults, campaign: "famouscities" };
    if (has) { p.checkin = inD; p.checkout = outD; }
    return "https://www.stay22.com/embed/gm?" + q(p);
  }

  function render(container) {
    var city = container.getAttribute("data-city");
    var stayMap = typeof FC_AFF !== "undefined" && FC_AFF.stay22_aid;
    var min = today();
    var guests = "";
    for (var i = 1; i <= 8; i++) guests += '<option value="' + i + '"' + (i === 2 ? " selected" : "") + ">" + i + (i === 1 ? " guest" : " guests") + "</option>";
    container.innerHTML =
      '<div class="trip-dates">' +
        '<span class="trip-dates-label">When are you going?</span>' +
        '<label>Check-in <input type="date" class="trip-in" min="' + min + '"></label>' +
        '<label>Check-out <input type="date" class="trip-out" min="' + min + '"></label>' +
        '<label>Guests <select class="trip-guests">' + guests + "</select></label>" +
        '<span class="trip-dates-hint">Pick dates to compare prices across every site in one click.</span>' +
      "</div>" +
      (stayMap
        ? '<div class="stay-map"><h4 class="trip-group-title">Compare places to stay in ' + city + '</h4>' +
          '<iframe class="stay-map-frame" title="Places to stay in ' + city + '" loading="lazy"></iframe>' +
          '<p class="stay-map-note">Live prices from Booking.com, Vrbo and more. Or use the buttons below to search each site directly.</p></div>'
        : "") +
      '<div class="trip-grid"></div>' +
      (typeof FC_AFF !== "undefined" && FC_AFF.amazon_tag
        ? '<div class="pack-card"><h4 class="trip-group-title">🎒 Pack for ' + city + '</h4><div class="trip-buttons">' +
          PACK_ITEMS.map(function (item) {
            return '<a class="trip-btn pack-btn" href="https://www.amazon.com/s?k=' + item.k +
              "&tag=" + encodeURIComponent(FC_AFF.amazon_tag) +
              '" target="_blank" rel="sponsored noopener noreferrer">' + item.name + "</a>";
          }).join("") +
          "</div></div>"
        : "");

    var inEl = container.querySelector(".trip-in");
    var outEl = container.querySelector(".trip-out");
    var gEl = container.querySelector(".trip-guests");
    var grid = container.querySelector(".trip-grid");
    var hint = container.querySelector(".trip-dates-hint");
    var mapFrame = container.querySelector(".stay-map-frame");

    var restored = false;
    try {
      var saved = JSON.parse(localStorage.getItem("fc_trip") || "null");
      if (saved && saved.inD && saved.inD >= min) {
        inEl.value = saved.inD;
        if (saved.outD && saved.outD > saved.inD) outEl.value = saved.outD;
        if (saved.adults) gEl.value = saved.adults;
        restored = !!(inEl.value && outEl.value);
      }
    } catch (e) {}

    function update() {
      if (inEl.value) outEl.min = inEl.value;
      var has = !!(inEl.value && outEl.value && outEl.value > inEl.value);
      hint.textContent = has
        ? "Links now search " + inEl.value + " to " + outEl.value + " for " + gEl.value + (gEl.value === "1" ? " guest." : " guests.") + (restored ? " (restored from your last visit)" : "")
        : (inEl.value && outEl.value ? "Check-out must be after check-in." : "Pick dates to compare prices across every site in one click.");
      grid.innerHTML = linksHtml({ c: encodeURIComponent(city), city: city, inD: inEl.value, outD: outEl.value, adults: gEl.value, has: has });
      if (mapFrame) {
        var src = stayMapSrc(city, inEl.value, outEl.value, gEl.value, has);
        if (mapFrame.getAttribute("src") !== src) mapFrame.setAttribute("src", src);
      }
      try {
        localStorage.setItem("fc_trip", JSON.stringify({ inD: inEl.value, outD: outEl.value, adults: gEl.value }));
      } catch (e) {}
      restored = false;
    }
    [inEl, outEl, gEl].forEach(function (el) { el.addEventListener("change", update); });
    update();
  }

  document.addEventListener("DOMContentLoaded", function () {
    Array.prototype.forEach.call(document.querySelectorAll(".trip-links[data-city]"), render);
  });
})();
