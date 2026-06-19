(function () {
  "use strict";

  // status flow: index into STEPS
  var STEPS = [
    { key: "checked", label: "Checked in", icon: "M4 7h16M4 12h16M4 17h10" },
    { key: "loaded", label: "Loaded", icon: "M3 16v-2l8-5V3.5A1 1 0 0 1 13 4v5l8 5v2l-8-2.5V19l2 1.5V22l-3-1-3 1v-1.5L11 19v-5.5z" },
    { key: "transit", label: "In transit", icon: "M2 12h20M14 6l6 6-6 6" },
    { key: "arrived", label: "Arrived", icon: "M5 12l5 5L20 7" },
    { key: "carousel", label: "On carousel", icon: "M4 7a8 4 0 0 1 16 0v10a8 4 0 0 1-16 0z" }
  ];

  var PILL = {
    checked: { cls: "pill--checked", text: "Checked" },
    loaded: { cls: "pill--checked", text: "Loaded" },
    transit: { cls: "pill--transit", text: "In transit" },
    arrived: { cls: "pill--arrived", text: "Arrived" },
    carousel: { cls: "pill--carousel", text: "On carousel" }
  };

  var bags = [
    { tag: "0125 4467 901", desc: "Hard-shell · 23 kg · Navy", step: 4, carousel: 7, updated: "2 min ago · LHR T5", delayed: false },
    { tag: "0125 4467 902", desc: "Duffel · 18 kg · Olive", step: 2, carousel: 7, updated: "12 min ago · in transit", delayed: false },
    { tag: "0125 4467 903", desc: "Soft case · 27 kg · Charcoal", step: 1, carousel: 7, updated: "26 min ago · loading bay", delayed: true }
  ];

  var listEl = document.getElementById("bagList");
  var bagCountEl = document.getElementById("bagCount");

  function svg(path) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="' + path + '"/></svg>';
  }

  function pillFor(bag) {
    if (bag.delayed && bag.step < 4) {
      return '<span class="pill pill--delayed">Delayed</span>';
    }
    var p = PILL[STEPS[bag.step].key];
    return '<span class="pill ' + p.cls + '">' + p.text + "</span>";
  }

  function render() {
    bagCountEl.textContent = String(bags.length);
    listEl.innerHTML = "";
    bags.forEach(function (bag, i) {
      var li = document.createElement("li");
      li.className = "bag";
      li.dataset.index = String(i);

      var steps = STEPS.map(function (s, si) {
        var state = si < bag.step ? "is-done" : si === bag.step ? "is-current" : "";
        var mark = si < bag.step ? svg("M5 12l5 5L20 7") : svg(s.icon);
        return (
          '<div class="step ' + state + '">' +
          '<span class="step__dot">' + mark + "</span>" +
          '<span class="step__label">' + s.label + "</span>" +
          "</div>"
        );
      }).join("");

      var pct = (bag.step / (STEPS.length - 1)) * 100;
      var showCarousel = bag.step >= 4;

      li.innerHTML =
        '<div class="bag__top">' +
          '<div class="bag__id">' +
            '<span class="bag__icon">' + svg("M6 7V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2M4 7h16v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1zM9 11v6M15 11v6") + "</span>" +
            '<span class="bag__labels">' +
              '<span class="bag__tag tnum">' + bag.tag + "</span>" +
              '<span class="bag__desc">' + bag.desc + "</span>" +
            "</span>" +
          "</div>" +
          pillFor(bag) +
        "</div>" +
        '<div class="track">' +
          '<div class="track__steps">' +
            '<div class="track__bar"><span class="track__fill"></span></div>' +
            steps +
          "</div>" +
        "</div>" +
        '<div class="bag__footer">' +
          '<span class="bag__update">Last update: ' + bag.updated + "</span>" +
          '<span class="bag__carousel' + (showCarousel ? "" : " is-hidden") + '">Carousel <strong class="tnum">' + bag.carousel + "</strong></span>" +
          '<button type="button" class="btn--link" data-report="' + i + '">Report issue</button>' +
        "</div>";

      listEl.appendChild(li);

      // animate the fill after paint
      var fill = li.querySelector(".track__fill");
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { fill.style.width = pct + "%"; });
      });
    });
  }

  // ---------- Advance simulation ----------
  document.getElementById("advanceBtn").addEventListener("click", function () {
    var moved = false;
    bags.forEach(function (bag) {
      if (bag.step < STEPS.length - 1) {
        bag.step++;
        moved = true;
        if (bag.step >= 4) bag.delayed = false;
        bag.updated = "just now · " + STEPS[bag.step].label;
        if (bag.step === STEPS.length - 1) {
          toast("Bag " + bag.tag + " is on carousel " + bag.carousel, "ok");
        }
      }
    });
    render();
    if (!moved) toast("All bags have reached the carousel", "ok");
    else toast("Status updated", "");
  });

  // ---------- Lookup ----------
  document.getElementById("lookupForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var q = document.getElementById("lookupInput").value.trim().replace(/\s+/g, "");
    if (!q) { toast("Enter a bag tag ID to track", "warn"); return; }
    var found = -1;
    bags.forEach(function (bag, i) {
      if (bag.tag.replace(/\s+/g, "").indexOf(q) !== -1) found = i;
    });
    if (found === -1) {
      toast("No bag found for " + q, "warn");
      return;
    }
    var card = listEl.querySelector('[data-index="' + found + '"]');
    if (card) {
      card.scrollIntoView({ behavior: "smooth", block: "center" });
      card.style.boxShadow = "0 0 0 3px var(--sky-50), var(--sh-md)";
      setTimeout(function () { card.style.boxShadow = ""; }, 1400);
    }
    toast("Showing bag " + bags[found].tag, "ok");
  });

  // ---------- Report modal ----------
  var modal = document.getElementById("reportModal");
  var reportSub = document.getElementById("reportSub");
  var activeTag = null;

  function openModal(idx) {
    activeTag = bags[idx] ? bags[idx].tag : null;
    reportSub.textContent = activeTag
      ? "Bag tag " + activeTag + " — tell us what happened."
      : "Tell us what happened with your bag.";
    modal.hidden = false;
    var first = modal.querySelector("select");
    if (first) first.focus();
  }
  function closeModal() {
    modal.hidden = true;
    document.getElementById("reportForm").reset();
  }

  listEl.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-report]");
    if (btn) openModal(parseInt(btn.dataset.report, 10));
  });

  modal.addEventListener("click", function (e) {
    if (e.target.closest("[data-close]")) closeModal();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !modal.hidden) closeModal();
  });

  document.getElementById("reportForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var type = document.getElementById("issueType").value;
    if (!type) { toast("Please choose an issue type", "warn"); return; }
    closeModal();
    toast("Report filed" + (activeTag ? " for " + activeTag : "") + " — case #SK" + (Math.floor(Math.random() * 9000) + 1000), "ok");
  });

  // ---------- Toast ----------
  var toastWrap = document.getElementById("toastWrap");
  function toast(msg, kind) {
    var el = document.createElement("div");
    el.className = "toast" + (kind ? " toast--" + kind : "");
    el.textContent = msg;
    toastWrap.appendChild(el);
    setTimeout(function () {
      el.classList.add("is-out");
      setTimeout(function () { el.remove(); }, 300);
    }, 2600);
  }

  render();
})();
