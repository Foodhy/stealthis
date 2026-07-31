(function () {
  "use strict";

  var ORDER = ["overview", "parts", "wiring", "assembly", "code", "usage", "trouble"];
  var LABEL = {
    overview: "Overview",
    parts: "Parts",
    wiring: "Wiring",
    assembly: "Assembly",
    code: "Code",
    usage: "Usage",
    trouble: "Troubleshooting"
  };

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- toast ---------- */
  var toastEl = $("#toast");
  var toastTimer = null;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 2200);
  }

  /* ---------- section switching ---------- */
  var tabs = $$(".secbtn");
  var dotsWrap = $("#dots");
  var progFill = $("#progFill");
  var progLabel = $("#progLabel");
  var prevBtn = $("#prevBtn");
  var nextBtn = $("#nextBtn");
  var prevTxt = $("#prevTxt");
  var nextTxt = $("#nextTxt");
  var read = { overview: true };
  var current = "overview";

  ORDER.forEach(function () {
    var i = document.createElement("i");
    dotsWrap.appendChild(i);
  });
  var dots = $$("i", dotsWrap);

  function show(id, focusPane) {
    if (ORDER.indexOf(id) === -1) return;
    current = id;
    read[id] = true;

    tabs.forEach(function (t) {
      var on = t.dataset.pane === id;
      t.classList.toggle("is-active", on);
      t.classList.toggle("is-read", !!read[t.dataset.pane]);
      t.setAttribute("aria-selected", on ? "true" : "false");
      t.tabIndex = on ? 0 : -1;
    });

    $$(".pane").forEach(function (p) {
      var on = p.id === "pane-" + id;
      p.classList.toggle("is-active", on);
      p.hidden = !on;
    });

    var idx = ORDER.indexOf(id);
    dots.forEach(function (d, i) {
      d.classList.toggle("on", !!read[ORDER[i]]);
      d.classList.toggle("cur", i === idx);
    });

    progFill.style.width = ((idx + 1) / ORDER.length) * 100 + "%";
    progLabel.textContent = (idx + 1) + " / " + ORDER.length;

    prevBtn.disabled = idx === 0;
    nextBtn.disabled = idx === ORDER.length - 1;
    prevTxt.textContent = idx === 0 ? "—" : LABEL[ORDER[idx - 1]];
    nextTxt.textContent = idx === ORDER.length - 1 ? "—" : LABEL[ORDER[idx + 1]];

    if (focusPane) {
      var pane = $("#pane-" + id);
      if (pane) pane.focus({ preventScroll: true });
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  tabs.forEach(function (t) {
    t.addEventListener("click", function () { show(t.dataset.pane, true); });
    t.addEventListener("keydown", function (e) {
      var i = ORDER.indexOf(t.dataset.pane);
      var n = null;
      if (e.key === "ArrowDown" || e.key === "ArrowRight") n = (i + 1) % ORDER.length;
      else if (e.key === "ArrowUp" || e.key === "ArrowLeft") n = (i - 1 + ORDER.length) % ORDER.length;
      else if (e.key === "Home") n = 0;
      else if (e.key === "End") n = ORDER.length - 1;
      if (n === null) return;
      e.preventDefault();
      show(ORDER[n], true);
      tabs[n].focus();
    });
  });

  prevBtn.addEventListener("click", function () {
    var i = ORDER.indexOf(current);
    if (i > 0) show(ORDER[i - 1], true);
  });
  nextBtn.addEventListener("click", function () {
    var i = ORDER.indexOf(current);
    if (i < ORDER.length - 1) show(ORDER[i + 1], true);
  });

  show("overview", false);

  /* ---------- favourite ---------- */
  var favBtn = $("#favBtn");
  var favTxt = $("#favTxt");
  favBtn.addEventListener("click", function () {
    var on = favBtn.getAttribute("aria-pressed") === "true";
    favBtn.setAttribute("aria-pressed", on ? "false" : "true");
    favTxt.textContent = on ? "Save guide" : "Saved";
    toast(on ? "Removed from your saved guides" : "Saved to your guide list");
  });

  /* ---------- cart ---------- */
  var cartCount = $("#cartCount");
  var cartChip = $("#cartChip");
  var count = 0;
  function bump(n) {
    count += n;
    cartCount.textContent = String(count);
    cartChip.classList.remove("pop");
    void cartChip.offsetWidth;
    cartChip.classList.add("pop");
  }

  $$(".part .add").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var row = btn.closest(".part");
      if (btn.classList.contains("is-added")) {
        btn.classList.remove("is-added");
        btn.textContent = "Add";
        bump(-1);
        toast(row.dataset.name + " removed");
        return;
      }
      btn.classList.add("is-added");
      btn.textContent = "In cart";
      bump(1);
      toast(row.dataset.name + " added — $" + row.dataset.price);
    });
  });

  $$("[data-addall]").forEach(function (b) {
    b.addEventListener("click", function () {
      var added = 0;
      $$(".part .add").forEach(function (btn) {
        if (!btn.classList.contains("is-added")) {
          btn.classList.add("is-added");
          btn.textContent = "In cart";
          added++;
        }
      });
      if (added) bump(added);
      toast(added ? "Added " + added + " part" + (added > 1 ? "s" : "") + " to your cart" : "Everything is already in your cart");
    });
  });

  /* running subtotal label */
  var partTotal = $("#partTotal");
  if (partTotal) {
    var sum = $$(".part").reduce(function (a, p) { return a + parseFloat(p.dataset.price); }, 0);
    partTotal.textContent = "Subtotal $" + sum.toFixed(2);
  }

  /* ---------- wiring highlight ---------- */
  var wireSvg = $("#wireSvg");
  var connBody = $("#connBody");
  if (wireSvg && connBody) {
    var setWire = function (id) {
      wireSvg.classList.toggle("dim", !!id);
      $$(".wires path", wireSvg).forEach(function (p) {
        p.classList.toggle("hot", p.id === id);
      });
    };
    $$("tr[data-wire]", connBody).forEach(function (tr) {
      tr.addEventListener("mouseenter", function () { setWire(tr.dataset.wire); });
      tr.addEventListener("mouseleave", function () { setWire(null); });
      tr.addEventListener("focus", function () { setWire(tr.dataset.wire); });
      tr.addEventListener("blur", function () { setWire(null); });
    });
  }

  /* ---------- copy code ---------- */
  var copyBtn = $("#copyBtn");
  var codeBlock = $("#codeBlock");
  copyBtn.addEventListener("click", function () {
    var text = codeBlock.innerText;
    var done = function () {
      copyBtn.textContent = "Copied";
      toast("weatherlamp.py copied to your clipboard");
      setTimeout(function () { copyBtn.textContent = "Copy"; }, 1600);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () { toast("Clipboard blocked — select the code manually"); });
    } else {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); done(); } catch (e) { toast("Clipboard blocked — select the code manually"); }
      document.body.removeChild(ta);
    }
  });

  $$("[data-dl]").forEach(function (b) {
    b.addEventListener("click", function () {
      toast("Preparing " + b.dataset.dl + " …");
      b.disabled = true;
      setTimeout(function () {
        b.disabled = false;
        toast(b.dataset.dl + " ready (demo only)");
      }, 900);
    });
  });

  /* ---------- accordion ---------- */
  $$("#acc .acc-btn").forEach(function (btn) {
    var body = btn.parentElement.nextElementSibling;
    btn.addEventListener("click", function () {
      var open = btn.getAttribute("aria-expanded") === "true";
      $$("#acc .acc-btn").forEach(function (o) {
        o.setAttribute("aria-expanded", "false");
        o.parentElement.nextElementSibling.style.maxHeight = "";
      });
      if (!open) {
        btn.setAttribute("aria-expanded", "true");
        body.style.maxHeight = body.scrollHeight + "px";
      }
    });
  });
})();
