(function () {
  "use strict";

  /* ---------- Service categories ---------- */
  var CATS = {
    Hair: "#b08d57",
    Color: "#c9a78f",
    Nails: "#8c6d3f",
    Spa: "#5f8a6b",
  };

  /* ---------- Precomputed datasets per range ---------- */
  var DATA = {
    today: {
      label: "today",
      crew: "12 stylists on the floor",
      kpis: {
        revenue: { value: 4820, prev: 4310, fmt: "money" },
        bookings: { value: 38, prev: 35, fmt: "int" },
        ticket: { value: 127, prev: 123, fmt: "money" },
        retail: { value: 18, prev: 16, fmt: "pct" },
      },
      stylists: [
        { name: "Aria Vance", role: "Master Stylist", rev: 1180, svc: 9 },
        { name: "Noor Haddad", role: "Color Director", rev: 980, svc: 7 },
        { name: "Léa Moreau", role: "Senior Stylist", rev: 760, svc: 8 },
        { name: "Theo Brandt", role: "Stylist", rev: 640, svc: 6 },
        { name: "Mira Solis", role: "Nail Artist", rev: 540, svc: 11 },
        { name: "Jun Park", role: "Spa Therapist", rev: 480, svc: 5 },
      ],
      mix: [
        { cat: "Hair", val: 41 },
        { cat: "Color", val: 32 },
        { cat: "Nails", val: 15 },
        { cat: "Spa", val: 12 },
      ],
      txns: [
        { client: "Eleanor Pryce", stylist: "Aria Vance", svc: "Cut & Style", cat: "Hair", amt: 165 },
        { client: "Sasha Lindqvist", stylist: "Noor Haddad", svc: "Full Balayage", cat: "Color", amt: 285 },
        { client: "Priya Nair", stylist: "Mira Solis", svc: "Gel Manicure", cat: "Nails", amt: 72 },
        { client: "Daniel Voss", stylist: "Theo Brandt", svc: "Skin Fade", cat: "Hair", amt: 58 },
        { client: "Isabel Romero", stylist: "Jun Park", svc: "Aroma Facial", cat: "Spa", amt: 140 },
        { client: "Hana Okafor", stylist: "Léa Moreau", svc: "Gloss & Blowout", cat: "Color", amt: 118 },
      ],
    },
    week: {
      label: "this week",
      crew: "12 stylists · 6-day rota",
      kpis: {
        revenue: { value: 31640, prev: 29870, fmt: "money" },
        bookings: { value: 252, prev: 244, fmt: "int" },
        ticket: { value: 125, prev: 122, fmt: "money" },
        retail: { value: 21, prev: 22, fmt: "pct" },
      },
      stylists: [
        { name: "Noor Haddad", role: "Color Director", rev: 7240, svc: 49 },
        { name: "Aria Vance", role: "Master Stylist", rev: 6980, svc: 56 },
        { name: "Léa Moreau", role: "Senior Stylist", rev: 5120, svc: 52 },
        { name: "Mira Solis", role: "Nail Artist", rev: 4380, svc: 71 },
        { name: "Theo Brandt", role: "Stylist", rev: 4010, svc: 44 },
        { name: "Jun Park", role: "Spa Therapist", rev: 3910, svc: 38 },
      ],
      mix: [
        { cat: "Hair", val: 38 },
        { cat: "Color", val: 35 },
        { cat: "Nails", val: 16 },
        { cat: "Spa", val: 11 },
      ],
      txns: [
        { client: "Margot Avery", stylist: "Noor Haddad", svc: "Color Correction", cat: "Color", amt: 340 },
        { client: "Owen Fairlie", stylist: "Theo Brandt", svc: "Cut & Beard", cat: "Hair", amt: 74 },
        { client: "Yuki Tanaka", stylist: "Jun Park", svc: "Hot Stone Massage", cat: "Spa", amt: 175 },
        { client: "Renée Dubois", stylist: "Aria Vance", svc: "Bridal Updo", cat: "Hair", amt: 210 },
        { client: "Carla Esposito", stylist: "Mira Solis", svc: "Luxe Pedicure", cat: "Nails", amt: 95 },
        { client: "Thomas Reed", stylist: "Léa Moreau", svc: "Highlights", cat: "Color", amt: 188 },
      ],
    },
    month: {
      label: "this month",
      crew: "12 stylists · 26 trading days",
      kpis: {
        revenue: { value: 134920, prev: 128400, fmt: "money" },
        bookings: { value: 1086, prev: 1052, fmt: "int" },
        ticket: { value: 124, prev: 122, fmt: "money" },
        retail: { value: 23, prev: 20, fmt: "pct" },
      },
      stylists: [
        { name: "Aria Vance", role: "Master Stylist", rev: 29800, svc: 238 },
        { name: "Noor Haddad", role: "Color Director", rev: 28640, svc: 201 },
        { name: "Léa Moreau", role: "Senior Stylist", rev: 21450, svc: 224 },
        { name: "Mira Solis", role: "Nail Artist", rev: 18900, svc: 306 },
        { name: "Theo Brandt", role: "Stylist", rev: 17220, svc: 189 },
        { name: "Jun Park", role: "Spa Therapist", rev: 16910, svc: 162 },
      ],
      mix: [
        { cat: "Hair", val: 36 },
        { cat: "Color", val: 34 },
        { cat: "Nails", val: 18 },
        { cat: "Spa", val: 12 },
      ],
      txns: [
        { client: "Vivienne Clark", stylist: "Aria Vance", svc: "Signature Package", cat: "Hair", amt: 420 },
        { client: "Marcus Bell", stylist: "Theo Brandt", svc: "Executive Cut", cat: "Hair", amt: 88 },
        { client: "Anouk Vermeer", stylist: "Noor Haddad", svc: "Dimensional Blonde", cat: "Color", amt: 365 },
        { client: "Sofia Marchetti", stylist: "Jun Park", svc: "Spa Day", cat: "Spa", amt: 260 },
        { client: "Greta Lindholm", stylist: "Mira Solis", svc: "Nail Art Set", cat: "Nails", amt: 110 },
        { client: "Idris Quaye", stylist: "Léa Moreau", svc: "Tonal Gloss", cat: "Color", amt: 96 },
      ],
    },
  };

  /* ---------- Helpers ---------- */
  var $ = function (sel, root) {
    return (root || document).querySelector(sel);
  };
  var $$ = function (sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  };

  function money(n) {
    return "$" + Math.round(n).toLocaleString("en-US");
  }
  function fmtVal(v) {
    if (v.fmt === "money") return money(v.value);
    if (v.fmt === "pct") return v.value + "%";
    return v.value.toLocaleString("en-US");
  }
  function pctDelta(cur, prev) {
    if (!prev) return 0;
    return ((cur - prev) / prev) * 100;
  }
  function compactMoney(n) {
    if (n >= 1000) return "$" + (n / 1000).toFixed(n >= 10000 ? 0 : 1) + "k";
    return "$" + n;
  }

  var toastTimer;
  function toast(msg) {
    var el = $("#toast");
    el.textContent = msg;
    el.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      el.classList.remove("is-on");
    }, 2400);
  }

  /* ---------- Counter animation ---------- */
  function animateNumber(el, to, fmt) {
    var from = Number(el.getAttribute("data-cur") || 0);
    var start = performance.now();
    var dur = 650;
    function tick(now) {
      var t = Math.min(1, (now - start) / dur);
      var eased = 1 - Math.pow(1 - t, 3);
      var cur = from + (to - from) * eased;
      if (fmt === "money") el.textContent = money(cur);
      else if (fmt === "pct") el.textContent = Math.round(cur) + "%";
      else el.textContent = Math.round(cur).toLocaleString("en-US");
      if (t < 1) requestAnimationFrame(tick);
      else el.setAttribute("data-cur", String(to));
    }
    requestAnimationFrame(tick);
  }

  /* ---------- Renderers ---------- */
  function renderKpis(d) {
    Object.keys(d.kpis).forEach(function (key) {
      var k = d.kpis[key];
      var valEl = $('[data-kpi="' + key + '"]');
      if (valEl) animateNumber(valEl, k.value, k.fmt);

      var deltaEl = $('[data-delta="' + key + '"]');
      if (deltaEl) {
        var p = pctDelta(k.value, k.prev);
        var up = p >= 0;
        var cls = up ? "chip--up" : "chip--down";
        var arrow = up ? "▲" : "▼";
        deltaEl.innerHTML =
          '<span class="chip ' +
          cls +
          '">' +
          arrow +
          " " +
          Math.abs(p).toFixed(1) +
          "%</span> vs prior";
      }
    });
  }

  function renderBars(d) {
    var wrap = $("#bars");
    wrap.innerHTML = "";
    var sorted = d.stylists.slice().sort(function (a, b) {
      return b.rev - a.rev;
    });
    var max = sorted[0].rev;
    var total = 0;
    sorted.forEach(function (s) {
      total += s.rev;
      var row = document.createElement("div");
      row.className = "bar-row";
      row.innerHTML =
        '<span class="bar-row__name" title="' +
        s.name +
        '">' +
        s.name +
        "</span>" +
        '<span class="bar-track"><span class="bar-fill"></span></span>' +
        '<span class="bar-row__val">' +
        compactMoney(s.rev) +
        "</span>";
      wrap.appendChild(row);
      var fill = $(".bar-fill", row);
      requestAnimationFrame(function () {
        fill.style.width = Math.max(6, (s.rev / max) * 100) + "%";
      });
    });
    $("#barTotal").textContent = money(total) + " total";
  }

  function renderMix(d) {
    var donut = $("#donut");
    var legend = $("#legend");
    legend.innerHTML = "";
    var stops = [];
    var acc = 0;
    var top = d.mix
      .slice()
      .sort(function (a, b) {
        return b.val - a.val;
      })[0];

    d.mix.forEach(function (m) {
      var color = CATS[m.cat];
      stops.push(color + " " + acc + "% " + (acc + m.val) + "%");
      acc += m.val;

      var li = document.createElement("li");
      li.innerHTML =
        '<span class="dot" style="background:' +
        color +
        '"></span>' +
        '<span class="lg-name">' +
        m.cat +
        "</span>" +
        '<span class="lg-val">' +
        m.val +
        "%</span>";
      legend.appendChild(li);
    });
    donut.style.background = "conic-gradient(" + stops.join(",") + ")";
    $("#donutTop").textContent = top.cat;
  }

  function renderPerformers(d) {
    var list = $("#performers");
    list.innerHTML = "";
    var sorted = d.stylists.slice().sort(function (a, b) {
      return b.rev - a.rev;
    });
    sorted.forEach(function (s, i) {
      var li = document.createElement("li");
      li.className = "performer";
      var avg = s.svc ? Math.round(s.rev / s.svc) : 0;
      li.innerHTML =
        '<span class="performer__rank">' +
        (i + 1) +
        "</span>" +
        '<span class="performer__name">' +
        s.name +
        '<span class="performer__role">' +
        s.role +
        " · " +
        s.svc +
        " services</span></span>" +
        '<span class="performer__amt">' +
        money(s.rev) +
        "<small>" +
        money(avg) +
        " avg</small></span>";
      li.tabIndex = 0;
      li.setAttribute("role", "button");
      li.addEventListener("click", function () {
        toast(s.name + " — " + money(s.rev) + " from " + s.svc + " services");
      });
      li.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          li.click();
        }
      });
      list.appendChild(li);
    });
  }

  function renderTxns(d) {
    var body = $("#txnBody");
    body.innerHTML = "";
    d.txns.forEach(function (t) {
      var tr = document.createElement("tr");
      tr.innerHTML =
        '<td class="client">' +
        t.client +
        "</td>" +
        "<td>" +
        t.stylist +
        "</td>" +
        '<td><span class="svc"><span class="svc-dot" style="background:' +
        CATS[t.cat] +
        '"></span>' +
        t.svc +
        "</span></td>" +
        '<td class="amt">' +
        money(t.amt) +
        "</td>";
      body.appendChild(tr);
    });
    $("#txnCount").textContent = d.txns.length + " shown";
  }

  function render(rangeKey) {
    var d = DATA[rangeKey];
    if (!d) return;
    renderKpis(d);
    renderBars(d);
    renderMix(d);
    renderPerformers(d);
    renderTxns(d);
    var lbl = $("#rangeLabel");
    lbl.innerHTML =
      "Showing figures for <strong>" + d.label + "</strong> · " + d.crew;
  }

  /* ---------- Wire up ---------- */
  var currentRange = "today";

  $$("#range .seg__btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var range = btn.getAttribute("data-range");
      if (range === currentRange) return;
      currentRange = range;
      $$("#range .seg__btn").forEach(function (b) {
        var on = b === btn;
        b.classList.toggle("is-active", on);
        b.setAttribute("aria-selected", on ? "true" : "false");
      });
      render(range);
      toast("Switched to " + DATA[range].label);
    });
  });

  $("#exportBtn").addEventListener("click", function () {
    toast("Exporting " + DATA[currentRange].label + " report as CSV…");
  });

  render(currentRange);
})();
