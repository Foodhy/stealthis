(function () {
  "use strict";

  /* ---------------- toast ---------------- */
  var toastHost = document.getElementById("toasts");
  function toast(msg) {
    var el = document.createElement("div");
    el.className = "toast";
    el.textContent = msg;
    toastHost.appendChild(el);
    setTimeout(function () {
      el.classList.add("out");
      setTimeout(function () { el.remove(); }, 320);
    }, 2600);
  }

  /* ---------------- countdown ---------------- */
  var DEADLINE = new Date(Date.now() + (23 * 864e5) + (7 * 36e5) + (41 * 6e4) + 12e3);
  var cd = {
    d: document.querySelector('[data-cd="d"]'),
    h: document.querySelector('[data-cd="h"]'),
    m: document.querySelector('[data-cd="m"]'),
    s: document.querySelector('[data-cd="s"]')
  };
  var live = document.getElementById("cd-live");
  var closeEl = document.getElementById("cd-close");
  closeEl.textContent = DEADLINE.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });

  function pad(n) { return String(n).padStart(2, "0"); }
  var lastAnnounce = 0;
  function tick() {
    var left = Math.max(0, DEADLINE - Date.now());
    var s = Math.floor(left / 1000);
    var d = Math.floor(s / 86400);
    var h = Math.floor((s % 86400) / 3600);
    var m = Math.floor((s % 3600) / 60);
    cd.d.textContent = pad(d);
    cd.h.textContent = pad(h);
    cd.m.textContent = pad(m);
    cd.s.textContent = pad(s % 60);
    if (Date.now() - lastAnnounce > 60000) {
      lastAnnounce = Date.now();
      live.textContent = d + " days, " + h + " hours and " + m + " minutes left to enter.";
    }
  }
  tick();
  setInterval(tick, 1000);

  /* ---------------- criteria bars on scroll ---------------- */
  var criteria = document.getElementById("criteria");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.35 });
    io.observe(criteria);
  } else {
    criteria.classList.add("is-in");
  }

  /* ---------------- entries data ---------------- */
  var PALETTES = [
    ["#e8552d", "#f2b134"], ["#0f8a8a", "#7fc9c0"], ["#f2b134", "#e8552d"],
    ["#22201e", "#0f8a8a"], ["#c9421d", "#f2b134"], ["#0b6d6d", "#f2b134"]
  ];

  var ENTRIES = [
    { t: "Pallet-slat hall bench", m: "Rina Okafor", likes: 412, age: 2, art: 0 },
    { t: "Offcut chessboard, no glue-up jig", m: "Tomas Vidal", likes: 388, age: 9, art: 1 },
    { t: "Chevron plant stand from fence pickets", m: "Devi Ramaswamy", likes: 356, age: 1, art: 2 },
    { t: "Scrap-strip serving tray", m: "Jonah Kessler", likes: 301, age: 14, art: 3 },
    { t: "Wall-hung tool till, all salvage", m: "Marit Solheim", likes: 277, age: 4, art: 4 },
    { t: "End-grain phone dock", m: "Ade Bankole", likes: 244, age: 21, art: 5 },
    { t: "Nesting crates from crib rails", m: "Lucia Ferrante", likes: 198, age: 3, art: 1 },
    { t: "Shopmade mallet, hickory offcut", m: "Peter Nowak", likes: 176, age: 17, art: 0 },
    { t: "Louvered shoe rack, deck leftovers", m: "Sana Qureshi", likes: 151, age: 6, art: 2 },
    { t: "Segmented lamp from stair treads", m: "Elias Brandt", likes: 133, age: 11, art: 3 },
    { t: "Kerf-bent tissue box", m: "Noor Haddad", likes: 108, age: 0, art: 4 },
    { t: "Two-board birdhouse, zero waste", m: "Grace Whitlow", likes: 87, age: 8, art: 5 }
  ];

  function initials(name) {
    return name.split(" ").map(function (p) { return p[0]; }).join("").slice(0, 2).toUpperCase();
  }

  function artSvg(kind, i) {
    var p = PALETTES[i % PALETTES.length];
    var shapes = [
      '<rect x="30" y="52" width="200" height="14" rx="3" fill="' + p[0] + '"/><rect x="30" y="72" width="200" height="14" rx="3" fill="' + p[1] + '" opacity=".8"/><rect x="30" y="92" width="200" height="14" rx="3" fill="' + p[0] + '" opacity=".55"/><rect x="46" y="106" width="14" height="34" rx="3" fill="#22201e" opacity=".7"/><rect x="200" y="106" width="14" height="34" rx="3" fill="#22201e" opacity=".7"/>',
      '<g>' + (function () { var o = ""; for (var r = 0; r < 4; r++) for (var c = 0; c < 6; c++) { o += '<rect x="' + (44 + c * 29) + '" y="' + (30 + r * 29) + '" width="27" height="27" rx="2" fill="' + ((r + c) % 2 ? p[0] : p[1]) + '"/>'; } return o; })() + '</g>',
      '<path d="M130 24l84 48v66h-84z" fill="' + p[0] + '"/><path d="M130 24L46 72v66h84z" fill="' + p[1] + '"/><rect x="60" y="138" width="140" height="10" rx="3" fill="#22201e" opacity=".65"/>',
      '<rect x="34" y="42" width="192" height="76" rx="10" fill="none" stroke="' + p[0] + '" stroke-width="9"/><rect x="56" y="60" width="30" height="40" rx="3" fill="' + p[1] + '"/><rect x="94" y="60" width="30" height="40" rx="3" fill="' + p[0] + '" opacity=".6"/><rect x="132" y="60" width="30" height="40" rx="3" fill="' + p[1] + '" opacity=".75"/><rect x="170" y="60" width="30" height="40" rx="3" fill="' + p[0] + '" opacity=".45"/>',
      '<rect x="48" y="30" width="164" height="110" rx="8" fill="' + p[1] + '" opacity=".35"/><rect x="62" y="44" width="60" height="38" rx="4" fill="' + p[0] + '"/><rect x="132" y="44" width="66" height="38" rx="4" fill="' + p[0] + '" opacity=".6"/><rect x="62" y="92" width="136" height="34" rx="4" fill="#22201e" opacity=".55"/>',
      '<circle cx="130" cy="84" r="52" fill="' + p[1] + '" opacity=".38"/><circle cx="130" cy="84" r="32" fill="' + p[0] + '"/><rect x="118" y="84" width="24" height="62" rx="5" fill="#22201e" opacity=".7"/>'
    ];
    return '<svg viewBox="0 0 260 160" role="img" aria-label="Stylised illustration of the project"><rect width="260" height="160" fill="#fbf6ef"/>' + shapes[kind] + "</svg>";
  }

  var gallery = document.getElementById("gallery");
  var state = ENTRIES.map(function (e, i) { return Object.assign({ id: i, liked: false }, e); });

  function render(list) {
    gallery.innerHTML = "";
    list.forEach(function (e, idx) {
      var card = document.createElement("article");
      card.className = "entry";
      card.style.animationDelay = (idx * 45) + "ms";
      var pal = PALETTES[e.id % PALETTES.length];
      card.innerHTML =
        '<div class="entry-art">' + artSvg(e.art, e.id) +
        (e.age <= 2 ? '<span class="badge-new">New</span>' : "") +
        "</div>" +
        '<div class="entry-body">' +
          "<h3>" + e.t + "</h3>" +
          '<div class="entry-meta">' +
            '<span class="maker"><span class="av" style="background:' + pal[0] + '">' + initials(e.m) + "</span>" + e.m + "</span>" +
            '<button class="like' + (e.liked ? " on" : "") + '" data-id="' + e.id + '" aria-pressed="' + e.liked + '" aria-label="Like ' + e.t + '">' +
              '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7-4.5-7-9a4 4 0 017-2.6A4 4 0 0119 11c0 4.5-7 9-7 9z"/></svg>' +
              '<span class="like-n">' + (e.likes + (e.liked ? 1 : 0)) + "</span>" +
            "</button>" +
          "</div>" +
        "</div>";
      gallery.appendChild(card);
    });
  }

  var sorters = {
    all: function (a, b) { return a.id - b.id; },
    liked: function (a, b) { return (b.likes + (b.liked ? 1 : 0)) - (a.likes + (a.liked ? 1 : 0)); },
    "new": function (a, b) { return a.age - b.age; }
  };
  var currentSort = "all";

  function apply() { render(state.slice().sort(sorters[currentSort])); }
  apply();

  gallery.addEventListener("click", function (ev) {
    var btn = ev.target.closest(".like");
    if (!btn) return;
    var item = state[Number(btn.dataset.id)];
    item.liked = !item.liked;
    btn.classList.toggle("on", item.liked);
    btn.setAttribute("aria-pressed", String(item.liked));
    btn.querySelector(".like-n").textContent = item.likes + (item.liked ? 1 : 0);
    btn.classList.remove("bump");
    void btn.offsetWidth;
    btn.classList.add("bump");
    toast(item.liked ? "Liked “" + item.t + "”" : "Removed your like");
  });

  document.querySelectorAll(".tab").forEach(function (tab) {
    tab.addEventListener("click", function () {
      document.querySelectorAll(".tab").forEach(function (t) {
        t.classList.toggle("is-active", t === tab);
        t.setAttribute("aria-selected", String(t === tab));
      });
      currentSort = tab.dataset.sort;
      apply();
    });
  });

  /* ---------------- judges ---------------- */
  var JUDGES = [
    { n: "Halina Bem", r: "Furniture maker · Kraków", c: "#f2b134", b: "Twenty years of chairs, most of them out of material somebody else threw away. Scores hard on joinery and forgives a rough finish." },
    { n: "Curtis Amadi", r: "Shop teacher · Detroit", c: "#e8552d", b: "Runs a high-school woodshop with a permanent offcut bin. Cares most about whether a beginner could follow your steps without getting hurt." },
    { n: "Yuki Tanabe", r: "Design writer · Osaka", c: "#7fc9c0", b: "Writes about repair culture and low-waste making. Reads every build log end to end, which is why documentation is worth 20 percent." }
  ];
  var jl = document.getElementById("judges-list");
  JUDGES.forEach(function (j) {
    var li = document.createElement("li");
    li.className = "judge";
    li.tabIndex = 0;
    li.innerHTML =
      '<div class="judge-top"><span class="judge-av" style="background:' + j.c + '">' + initials(j.n) + "</span>" +
      "<div><h3>" + j.n + '</h3><span class="role">' + j.r + "</span></div></div>" +
      '<p class="judge-bio">' + j.b + "</p>" +
      '<p class="judge-hint">Hover or focus for bio</p>';
    jl.appendChild(li);
  });

  /* ---------------- faq ---------------- */
  var FAQ = [
    ["Can I enter more than one project?", "Yes — up to three per maker. Each one is judged on its own, but only your highest-scoring entry is eligible for the grand prize so the shortlist stays varied."],
    ["Does plywood count as scrap wood?", "It counts if it was already cut and headed for disposal — a shelf out of a skip, a crate panel, a cut-off from someone else's job. A fresh sheet from the yard does not."],
    ["What if I can't take good photos?", "Phone photos in daylight against a plain wall score exactly the same as studio shots. Judges are told to ignore photography quality and read the steps."],
    ["How are ties broken?", "By the reuse score first, then by community likes on the entry page. If it is still tied, all tied entries receive the prize."],
    ["When do winners hear back?", "Two weeks after entries close. Everyone shortlisted gets an email either way, and the full scoring sheet is published with the results."]
  ];
  var faqHost = document.getElementById("faq-list");
  FAQ.forEach(function (pair, i) {
    var wrap = document.createElement("div");
    wrap.className = "q";
    wrap.innerHTML =
      '<button class="q-btn" aria-expanded="false" aria-controls="fa' + i + '">' + pair[0] + '<span class="q-ico" aria-hidden="true">+</span></button>' +
      '<div class="q-body" id="fa' + i + '" role="region"><p>' + pair[1] + "</p></div>";
    faqHost.appendChild(wrap);
  });
  faqHost.addEventListener("click", function (ev) {
    var btn = ev.target.closest(".q-btn");
    if (!btn) return;
    var q = btn.parentElement;
    var body = q.querySelector(".q-body");
    var open = q.classList.toggle("open");
    btn.setAttribute("aria-expanded", String(open));
    body.style.maxHeight = open ? body.scrollHeight + "px" : "0px";
  });

  /* ---------------- smooth scroll ---------------- */
  document.querySelectorAll("[data-scroll]").forEach(function (b) {
    b.addEventListener("click", function () {
      var t = document.querySelector(b.dataset.scroll);
      if (t) t.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  /* ---------------- modal ---------------- */
  var modal = document.getElementById("modal");
  var lastFocus = null;
  function openModal() {
    lastFocus = document.activeElement;
    modal.hidden = false;
    document.getElementById("e-title").focus();
  }
  function closeModal() {
    modal.hidden = true;
    document.getElementById("form-err").hidden = true;
    if (lastFocus) lastFocus.focus();
  }
  document.querySelectorAll("[data-enter]").forEach(function (b) { b.addEventListener("click", openModal); });
  modal.querySelectorAll("[data-close]").forEach(function (b) { b.addEventListener("click", closeModal); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !modal.hidden) closeModal();
  });

  document.getElementById("enter-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var err = document.getElementById("form-err");
    var title = document.getElementById("e-title").value.trim();
    var url = document.getElementById("e-url").value.trim();
    var ok = document.getElementById("e-ok").checked;
    if (!title) { err.textContent = "Give your project a title."; err.hidden = false; return; }
    if (!/^https?:\/\/.+\..+/.test(url)) { err.textContent = "That build log URL doesn't look right."; err.hidden = false; return; }
    if (!ok) { err.textContent = "Please confirm your entry meets the eligibility rules."; err.hidden = false; return; }
    err.hidden = true;
    closeModal();
    this.reset();
    toast("Entry received — “" + title + "” is in the queue.");
  });
})();
