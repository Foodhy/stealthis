(function () {
  "use strict";

  /* ---------- Data (fictional) ---------- */
  var PEOPLE = [
    {
      group: "pi", name: "Dr. Imara N. Velasco", role: "Professor & Director",
      pron: "she/her", color: "#1a4f8a",
      interests: ["Ocean–atmosphere coupling", "Extreme-event attribution", "Ensemble dynamics"],
      bio: "Leads the lab's work on <b>regional downscaling</b> of CMIP-class projections. PI on three federal grants; chairs the Pacific Decadal Variability working group.",
      since: "Joined 2014", orcid: "0000-0002-7741-3120",
      links: { email: "i.velasco@whitford.example.edu", orcid: "0000-0002-7741-3120", scholar: "#", site: "#" }
    },
    {
      group: "postdoc", name: "Dr. Theo R. Aaltonen", role: "Postdoctoral Fellow",
      pron: "he/him", color: "#0f7d78",
      interests: ["ML emulators", "Bayesian calibration", "Cloud microphysics"],
      bio: "Builds neural emulators that reproduce a 50-member ensemble at <b>1/400th the cost</b>. NOAA Climate &amp; Global Change fellow.",
      since: "Joined 2023", orcid: "0000-0001-5582-9043",
      links: { email: "t.aaltonen@whitford.example.edu", orcid: "0000-0001-5582-9043", scholar: "#", site: "#" }
    },
    {
      group: "postdoc", name: "Dr. Priya S. Ravichandran", role: "Postdoctoral Researcher",
      pron: "she/her", color: "#123a66",
      interests: ["Monsoon dynamics", "Teleconnections", "Reanalysis"],
      bio: "Quantifies how <b>ENSO–monsoon teleconnections</b> shift under warming using a 4,000-year coupled run. Co-leads the field campaign in the Bay of Mara&iacute;na.",
      since: "Joined 2022", orcid: "0000-0003-2218-7765",
      links: { email: "p.ravichandran@whitford.example.edu", orcid: "0000-0003-2218-7765", scholar: "#", site: "#" }
    },
    {
      group: "phd", name: "Lukas Bergström", role: "PhD Candidate (Y4)",
      pron: "they/them", color: "#7a4ea8",
      interests: ["Sea-ice albedo", "Polar amplification", "GPU solvers"],
      bio: "Thesis on <b>marginal-ice-zone feedbacks</b>; ported the radiative core to GPUs for a 6&times; speedup. Expected defense Spring 2027.",
      since: "Joined 2021", orcid: "0000-0004-9981-1207",
      links: { email: "l.bergstrom@whitford.example.edu", orcid: "0000-0004-9981-1207", scholar: "#", site: "#" }
    },
    {
      group: "phd", name: "Amara Okonkwo", role: "PhD Student (Y2)",
      pron: "she/her", color: "#c9821f",
      interests: ["Heatwave attribution", "Extreme statistics", "Causal inference"],
      bio: "Develops a <b>causal-attribution pipeline</b> for compound heat&ndash;humidity events across coastal megacities. NSF Graduate Research Fellow.",
      since: "Joined 2024", orcid: "0000-0002-6630-8842",
      links: { email: "a.okonkwo@whitford.example.edu", orcid: "0000-0002-6630-8842", scholar: "#", site: "#" }
    },
    {
      group: "phd", name: "Diego Fuentes-Lara", role: "PhD Student (Y1)",
      pron: "he/him", color: "#2f9e6f",
      interests: ["Mesoscale eddies", "Lagrangian tracking", "Visualization"],
      bio: "Studies <b>submesoscale stirring</b> of heat in eastern boundary currents; builds interactive volume-rendering tools for the lab.",
      since: "Joined 2025", orcid: "0000-0001-3094-5518",
      links: { email: "d.fuentes@whitford.example.edu", orcid: "0000-0001-3094-5518", scholar: "#", site: "#" }
    },
    {
      group: "alumni", name: "Dr. Wen-Hui Chao", role: "Now Asst. Prof., Kestrel Univ.",
      pron: "she/her", color: "#697892",
      interests: ["Coupled data assimilation", "Predictability"],
      bio: "PhD 2021. Pioneered the lab's <b>strongly-coupled assimilation</b> scheme; now runs the Predictability Group at Kestrel University.",
      since: "2016–2021", orcid: "0000-0003-7712-4490",
      links: { email: "wh.chao@kestrel.example.edu", orcid: "0000-0003-7712-4490", scholar: "#", site: "#" }
    },
    {
      group: "alumni", name: "Dr. Samuel Drève", role: "Now Research Scientist, OceaniQ",
      pron: "he/him", color: "#697892",
      interests: ["Reduced-order models", "Climate services"],
      bio: "Postdoc 2018&ndash;2021. Translated lab projections into operational <b>climate-risk products</b>; now leads modeling at OceaniQ Labs.",
      since: "2018–2021", orcid: "0000-0002-1145-6638",
      links: { email: "s.dreve@oceaniq.example.com", orcid: "0000-0002-1145-6638", scholar: "#", site: "#" }
    }
  ];

  /* ---------- Helpers ---------- */
  function initials(name) {
    var parts = name.replace(/^Dr\.\s+/, "").trim().split(/\s+/);
    var first = parts[0] || "";
    var last = parts[parts.length - 1] || "";
    return (first.charAt(0) + (parts.length > 1 ? last.charAt(0) : "")).toUpperCase();
  }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function svgIcon(kind) {
    var p = {
      email: '<path d="M3 5h18v14H3z" fill="none" stroke="currentColor" stroke-width="2"/><path d="M3 6l9 7 9-7" fill="none" stroke="currentColor" stroke-width="2"/>',
      scholar: '<path d="M12 3L1 9l11 6 9-4.9V17h2V9z" fill="currentColor"/><path d="M5 12.5V16c0 1.7 3.1 3 7 3s7-1.3 7-3v-3.5" fill="none" stroke="currentColor" stroke-width="2"/>',
      site: '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" fill="none" stroke="currentColor" stroke-width="1.6"/>'
    };
    return '<svg viewBox="0 0 24 24" aria-hidden="true">' + p[kind] + "</svg>";
  }

  var toastTimer;
  function toast(msg) {
    var el = document.getElementById("toast");
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove("show"); }, 2400);
  }

  /* ---------- Render ---------- */
  function cardHTML(p, idx) {
    var mono = initials(p.name);
    var chips = p.interests.map(function (i) {
      return '<span class="chip" data-int>' + esc(i) + "</span>";
    }).join("");
    var orcidLink = p.links.orcid && p.links.orcid !== "#"
      ? "https://orcid.org/" + p.links.orcid : "#";

    return '' +
      '<article class="person" data-group="' + p.group + '" data-idx="' + idx + '" ' +
        'data-search="' + esc((p.name + " " + p.role + " " + p.interests.join(" ")).toLowerCase()) + '">' +
        '<div class="person-inner">' +
          '<div class="face face-front">' +
            '<div class="card-head">' +
              '<div class="avatar" style="background:linear-gradient(135deg,' + p.color + ',' + shade(p.color) + ')">' + mono + "</div>" +
              '<div class="card-id">' +
                '<h4 class="person-name" data-name>' + esc(p.name) + "</h4>" +
                '<p class="person-role" data-role>' + esc(p.role) + ' <span class="person-pron">(' + esc(p.pron) + ")</span></p>" +
              "</div>" +
            "</div>" +
            '<div class="interests">' + chips + "</div>" +
            '<div class="card-foot">' +
              '<a class="icon-link" href="mailto:' + esc(p.links.email) + '" title="Email" aria-label="Email ' + esc(p.name) + '" data-track="Email">' + svgIcon("email") + "</a>" +
              '<a class="icon-link" href="' + orcidLink + '" target="_blank" rel="noopener" title="ORCID" aria-label="ORCID profile" data-track="ORCID">iD</a>' +
              '<a class="icon-link" href="' + esc(p.links.scholar) + '" title="Scholar" aria-label="Google Scholar" data-track="Scholar">' + svgIcon("scholar") + "</a>" +
              '<a class="icon-link" href="' + esc(p.links.site) + '" title="Website" aria-label="Personal website" data-track="Website">' + svgIcon("site") + "</a>" +
              '<button class="flip-btn" type="button" data-flip aria-expanded="false">Bio &rsaquo;</button>' +
            "</div>" +
          "</div>" +
          '<div class="face face-back">' +
            '<h4 class="person-name">' + esc(p.name) + "</h4>" +
            '<p class="bio">' + p.bio + "</p>" +
            '<div class="meta-row"><span>' + esc(p.since) + "</span><span>ORCID " + esc(p.links.orcid) + "</span></div>" +
            '<button class="back-close" type="button" data-flip>&lsaquo; Back</button>' +
          "</div>" +
        "</div>" +
      "</article>";
  }

  // darken a hex color slightly for gradient depth
  function shade(hex) {
    var n = parseInt(hex.slice(1), 16);
    var r = Math.max(0, (n >> 16) - 38), g = Math.max(0, ((n >> 8) & 255) - 38), b = Math.max(0, (n & 255) - 38);
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  function render() {
    PEOPLE.forEach(function (p, i) {
      var grid = document.querySelector('[data-grid="' + p.group + '"]');
      if (grid) grid.insertAdjacentHTML("beforeend", cardHTML(p, i));
    });
  }

  /* ---------- Filtering / search ---------- */
  var state = { filter: "all", query: "" };

  function clearMarks(card) {
    card.querySelectorAll("mark.hit").forEach(function (m) {
      m.replaceWith(document.createTextNode(m.textContent));
    });
    card.querySelectorAll("[data-name],[data-role],[data-int]").forEach(function (n) { n.normalize(); });
  }

  function highlight(card, q) {
    if (!q) return;
    var rx = new RegExp("(" + q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "ig");
    card.querySelectorAll("[data-name],[data-role],[data-int]").forEach(function (node) {
      node.childNodes.forEach(function (child) {
        if (child.nodeType !== 3) return;
        var txt = child.nodeValue;
        if (!rx.test(txt)) return;
        rx.lastIndex = 0;
        var span = document.createElement("span");
        span.innerHTML = esc(txt).replace(rx, '<mark class="hit">$1</mark>');
        child.replaceWith(span);
      });
    });
  }

  function apply() {
    var q = state.query.trim().toLowerCase();
    var shown = 0;
    var perGroup = {};

    document.querySelectorAll(".person").forEach(function (card) {
      clearMarks(card);
      var g = card.getAttribute("data-group");
      var matchGroup = state.filter === "all" || state.filter === g;
      var matchQuery = !q || card.getAttribute("data-search").indexOf(q) !== -1;
      var visible = matchGroup && matchQuery;
      card.classList.toggle("is-hidden", !visible);
      if (visible) {
        shown++;
        perGroup[g] = (perGroup[g] || 0) + 1;
        if (q) highlight(card, q);
      }
    });

    document.querySelectorAll(".group").forEach(function (sec) {
      var g = sec.getAttribute("data-group");
      sec.classList.toggle("is-hidden", !perGroup[g]);
    });

    document.querySelector("[data-result-count]").textContent = shown;
    document.querySelector("[data-empty]").hidden = shown !== 0;
  }

  /* ---------- Flip ---------- */
  function flip(card) {
    var willFlip = !card.classList.contains("flipped");
    card.classList.toggle("flipped", willFlip);
    var btn = card.querySelector(".flip-btn");
    if (btn) btn.setAttribute("aria-expanded", String(willFlip));
  }

  /* ---------- Wire up ---------- */
  function init() {
    render();

    document.querySelector("[data-count-active]").textContent =
      PEOPLE.filter(function (p) { return p.group !== "alumni"; }).length;

    var search = document.getElementById("search");
    var clearBtn = document.getElementById("clear-search");
    var debounce;
    search.addEventListener("input", function () {
      state.query = search.value;
      clearBtn.hidden = !search.value;
      clearTimeout(debounce);
      debounce = setTimeout(apply, 110);
    });
    clearBtn.addEventListener("click", function () {
      search.value = "";
      state.query = "";
      clearBtn.hidden = true;
      apply();
      search.focus();
    });

    document.querySelectorAll(".chip-filter").forEach(function (btn) {
      btn.addEventListener("click", function () {
        document.querySelectorAll(".chip-filter").forEach(function (b) {
          b.classList.remove("is-active");
          b.setAttribute("aria-pressed", "false");
        });
        btn.classList.add("is-active");
        btn.setAttribute("aria-pressed", "true");
        state.filter = btn.getAttribute("data-filter");
        apply();
      });
    });

    var resetAll = document.getElementById("reset-all");
    if (resetAll) resetAll.addEventListener("click", function () {
      search.value = ""; state.query = ""; clearBtn.hidden = true;
      state.filter = "all";
      document.querySelectorAll(".chip-filter").forEach(function (b) {
        var on = b.getAttribute("data-filter") === "all";
        b.classList.toggle("is-active", on);
        b.setAttribute("aria-pressed", String(on));
      });
      apply();
    });

    // delegated flip + link tracking
    document.addEventListener("click", function (e) {
      var flipEl = e.target.closest("[data-flip]");
      if (flipEl) {
        e.preventDefault();
        flip(flipEl.closest(".person"));
        return;
      }
      var noop = e.target.closest("[data-noop]");
      if (noop) { e.preventDefault(); toast("Demo navigation — section not wired up."); return; }

      var link = e.target.closest(".icon-link");
      if (link) {
        var kind = link.getAttribute("data-track");
        if (link.getAttribute("href") === "#") {
          e.preventDefault();
          toast(kind + " link is illustrative in this demo.");
        } else if (kind === "Email") {
          toast("Opening email to " + link.getAttribute("href").replace("mailto:", "") + " …");
        }
      }
    });

    // keyboard: Esc closes any flipped card
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        document.querySelectorAll(".person.flipped").forEach(function (c) { flip(c); });
      }
    });

    apply();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
