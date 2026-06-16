/* ============================================================
   Terminal / Dev Portfolio — vanilla JS
   - typed boot intro
   - working mini command processor (reveals sections)
   - blinking caret synced to input
   - project case-file dialog
   - skills bars, clock, scanline toggle, contact form, toast
   ============================================================ */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* ---------- data ---------- */
  var PROJECTS = [
    {
      id: "northwind-pay",
      perm: "-rwxr-xr-x",
      name: "northwind-pay",
      desc: "End-to-end design system + checkout for a EU fintech.",
      tag: "[systems]",
      year: "2024",
      role: "Lead Product Designer",
      blurb:
        "Rebuilt Northwind's payment flow and the component library behind it. Shipped a tokenized design system consumed by web, iOS and three internal tools, then redesigned the checkout to cut drop-off.",
      bullets: [
        "Token pipeline (Figma → JSON → CSS vars) adopted by 4 squads.",
        "Checkout redesign rolled out behind a feature flag with A/B guardrails.",
        "Authored the accessibility playbook now used company-wide."
      ],
      metrics: [
        { n: "−31%", l: "checkout drop-off" },
        { n: "4 → 1", l: "color systems" },
        { n: "AA+", l: "contrast audit" }
      ]
    },
    {
      id: "mirage-os",
      perm: "-rw-r--r--",
      name: "mirage-os",
      desc: "Internal design OS — 180+ components, live docs.",
      tag: "[systems]",
      year: "2022",
      role: "Senior Designer",
      blurb:
        "A single source of truth for Mirage Studio's client work: Storybook-backed components, usage docs and a contribution model that let engineers ship UI without a designer in the loop.",
      bullets: [
        "180+ documented components with live props playground.",
        "Cut new-screen build time roughly in half across teams.",
        "Set up visual-regression checks in CI to stop drift."
      ],
      metrics: [
        { n: "180+", l: "components" },
        { n: "~2×", l: "faster builds" },
        { n: "12", l: "teams onboard" }
      ]
    },
    {
      id: "cadence-vitals",
      perm: "-rw-r--r--",
      name: "cadence-vitals",
      desc: "Patient vitals dashboard for clinicians, dark-first.",
      tag: "[product]",
      year: "2021",
      role: "Product Designer",
      blurb:
        "A glanceable vitals dashboard for night-shift clinicians. Dark-first, high-contrast, and tuned for triage at speed — every alert one keystroke away.",
      bullets: [
        "Triage view designed around colour-blind-safe status coding.",
        "Keyboard-first navigation validated with five working nurses.",
        "Reduced average time-to-acknowledge a critical alert."
      ],
      metrics: [
        { n: "−40%", l: "ack time" },
        { n: "5", l: "field tests" },
        { n: "WCAG", l: "AA verified" }
      ]
    },
    {
      id: "type-foundry",
      perm: "-rw-r--r--",
      name: "type-foundry.zine",
      desc: "Self-published variable-type specimen + newsletter.",
      tag: "[brand]",
      year: "2023",
      role: "Maker",
      blurb:
        "A side project that became a habit: a quarterly specimen zine and newsletter about variable fonts, built end to end — writing, layout, type pairing and a tiny static-site generator.",
      bullets: [
        "2,400 subscribers, fully organic, zero ad spend.",
        "Interactive specimens built with the variable-font API.",
        "Open-sourced the static generator behind it."
      ],
      metrics: [
        { n: "2.4k", l: "subscribers" },
        { n: "9", l: "issues" },
        { n: "MIT", l: "open source" }
      ]
    },
    {
      id: "atlas-maps",
      perm: "-rw-r--r--",
      name: "atlas-maps",
      desc: "Wayfinding + motion system for a transit app.",
      tag: "[product]",
      year: "2020",
      role: "Product Designer",
      blurb:
        "Wayfinding and a calm motion language for a city transit app — turn-by-turn that stays legible at a glance while you're moving, in sun or in a dark tunnel.",
      bullets: [
        "Motion spec (durations + easing) shared across iOS/Android.",
        "Glance-test rig to validate legibility under 0.4s exposure.",
        "Adaptive contrast for in-tunnel dark conditions."
      ],
      metrics: [
        { n: "0.4s", l: "glance target" },
        { n: "2", l: "platforms" },
        { n: "+18", l: "SUS points" }
      ]
    }
  ];

  var SKILLS = [
    { name: "Design systems", pct: 96 },
    { name: "Product design", pct: 92 },
    { name: "TypeScript/React", pct: 84 },
    { name: "CSS / motion", pct: 90 },
    { name: "Prototyping", pct: 88 },
    { name: "Accessibility", pct: 86 }
  ];

  /* ---------- helpers ---------- */
  function $(sel, ctx) {
    return (ctx || document).querySelector(sel);
  }

  var toastEl = $("#toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.hidden = false;
    // force reflow so the transition fires
    void toastEl.offsetWidth;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
      setTimeout(function () {
        toastEl.hidden = true;
      }, 220);
    }, 2400);
  }

  var screen = $("#screen");
  function scrollToEnd() {
    if (screen) screen.scrollTop = screen.scrollHeight;
  }

  /* ---------- clock ---------- */
  var clockEl = $("#clock");
  function tick() {
    if (!clockEl) return;
    var d = new Date();
    var p = function (n) {
      return String(n).padStart(2, "0");
    };
    clockEl.textContent =
      p(d.getHours()) + ":" + p(d.getMinutes()) + ":" + p(d.getSeconds());
  }
  tick();
  setInterval(tick, 1000);

  /* ---------- populate project list ---------- */
  var projList = $("#projList");
  if (projList) {
    PROJECTS.forEach(function (p, i) {
      var li = document.createElement("li");
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "proj-row";
      btn.setAttribute("data-id", p.id);
      btn.innerHTML =
        '<span class="proj-perm">' +
        p.perm +
        "</span>" +
        '<span class="proj-name"><span class="arrow">→</span><b>' +
        p.name +
        "</b> " +
        '<span class="proj-desc">' +
        p.desc +
        "</span></span>" +
        '<span class="proj-tag">' +
        p.tag +
        " " +
        p.year +
        "</span>";
      btn.addEventListener("click", function () {
        openProject(p.id);
      });
      li.appendChild(btn);
      projList.appendChild(li);
    });
  }

  /* ---------- populate skills ---------- */
  var skillList = $("#skillList");
  function renderSkills() {
    if (!skillList) return;
    skillList.innerHTML = "";
    SKILLS.forEach(function (s) {
      var li = document.createElement("li");
      li.className = "skill";
      li.innerHTML =
        '<span class="skill-name">' +
        s.name +
        "</span>" +
        '<span class="skill-bar"><span class="skill-fill"></span></span>' +
        '<span class="skill-pct">' +
        s.pct +
        "%</span>";
      skillList.appendChild(li);
    });
    // animate fills on next frame
    requestAnimationFrame(function () {
      var fills = skillList.querySelectorAll(".skill-fill");
      SKILLS.forEach(function (s, i) {
        if (fills[i]) fills[i].style.setProperty("--w", s.pct + "%");
      });
    });
  }

  /* ---------- section reveal ---------- */
  var BLOCKS = {
    whoami: "block-whoami",
    projects: "block-projects",
    about: "block-about",
    experience: "block-experience",
    skills: "block-skills",
    contact: "block-contact"
  };

  function reveal(key) {
    var el = document.getElementById(BLOCKS[key]);
    if (!el) return false;
    var wasHidden = el.hidden;
    el.hidden = false;
    if (key === "skills" && wasHidden) renderSkills();
    if (wasHidden) {
      // re-trigger reveal animation
      el.style.animation = "none";
      void el.offsetWidth;
      el.style.animation = "";
    }
    scrollToEnd();
    return true;
  }

  /* ---------- command processor ---------- */
  function printSystem(text, cls) {
    // append a transient system line into the boot/output area
    var boot = $("#boot");
    if (!boot) return;
    var line = document.createElement("div");
    if (cls) line.className = cls;
    line.textContent = text;
    boot.appendChild(line);
    scrollToEnd();
  }

  function clearScreen() {
    Object.keys(BLOCKS).forEach(function (k) {
      var el = document.getElementById(BLOCKS[k]);
      if (el) el.hidden = true;
    });
    var boot = $("#boot");
    if (boot) boot.innerHTML = "";
    printSystem("screen cleared. type `help` to list commands.", "warn");
  }

  function runCommand(raw) {
    var cmd = String(raw || "").trim().toLowerCase();
    if (!cmd) return;

    // normalize: strip leading $ / ./ , collapse spaces
    cmd = cmd.replace(/^\$\s*/, "").replace(/\s+/g, " ");

    // map of aliases -> section key
    if (/^(whoami|who|me|id)$/.test(cmd)) return done(reveal("whoami"), "whoami");
    if (/^(ls( -?[al]+)?( projects\/?)?|projects|ls|work|portfolio)$/.test(cmd))
      return done(reveal("projects"), "projects");
    if (/^(cat about(\.md)?|about|bio)$/.test(cmd))
      return done(reveal("about"), "about");
    if (/^(git log.*|experience|exp|history|work history)$/.test(cmd))
      return done(reveal("experience"), "experience");
    if (/^(\.?\/?skills( --report)?|skills|stack)$/.test(cmd))
      return done(reveal("skills"), "skills");
    if (/^(contact( --send)?|email|hire|reach)$/.test(cmd)) {
      reveal("contact");
      done(true, "contact");
      var inp = $("#cEmail");
      if (inp) setTimeout(function () { inp.focus(); }, 60);
      return;
    }

    // open <n> or open <name>
    var openMatch = cmd.match(/^open\s+(.+)$/);
    if (openMatch) {
      var arg = openMatch[1].trim();
      var idx = parseInt(arg, 10);
      var proj;
      if (!isNaN(idx) && idx >= 1 && idx <= PROJECTS.length) {
        proj = PROJECTS[idx - 1];
      } else {
        proj = PROJECTS.filter(function (p) {
          return p.name.toLowerCase().indexOf(arg) !== -1 || p.id === arg;
        })[0];
      }
      if (proj) {
        reveal("projects");
        openProject(proj.id);
        printSystem("opening case file: " + proj.name, "ok");
      } else {
        printSystem("open: no such project '" + arg + "'", "warn");
      }
      return;
    }

    if (cmd === "all") {
      ["whoami", "projects", "about", "experience", "skills", "contact"].forEach(
        reveal
      );
      printSystem("rendered full portfolio.", "ok");
      scrollToEnd();
      return;
    }

    if (/^(clear|cls)$/.test(cmd)) return clearScreen();

    if (/^(help|\?|man|ls -h|--help)$/.test(cmd)) {
      printSystem(
        "available: whoami · ls projects · cat about · experience · skills · contact · open <n> · all · clear",
        "ok"
      );
      return;
    }

    if (cmd === "sudo" || /^sudo /.test(cmd)) {
      printSystem("nice try. maya@okafor is not in the sudoers file. 😏", "warn");
      return;
    }
    if (cmd === "pwd") {
      printSystem("/home/maya/portfolio", "ok");
      return;
    }
    if (cmd === "date") {
      printSystem(new Date().toString(), "ok");
      return;
    }
    if (cmd === "echo hi" || cmd === "hi" || cmd === "hello") {
      printSystem("hello — type `all` to render the whole portfolio.", "ok");
      return;
    }
    if (cmd === "exit" || cmd === "quit") {
      printSystem("you can check out any time you like… (this is a portfolio)", "warn");
      return;
    }

    printSystem(
      "command not found: " + raw + " — type `help` for options.",
      "warn"
    );
  }

  function done(ok, label) {
    if (ok) {
      printSystem("→ rendered " + label, "ok");
    }
  }

  /* ---------- prompt input ---------- */
  var form = $("#promptForm");
  var input = $("#prompt-input");
  var caret = $("#caret");

  // position the caret so it sits right after typed text
  function syncCaret() {
    if (!input || !caret) return;
    caret.classList.toggle("typing", document.activeElement === input);
    // show caret only when input empty/at end for a believable look
  }
  if (input) {
    input.addEventListener("input", syncCaret);
    input.addEventListener("focus", syncCaret);
    input.addEventListener("blur", function () {
      caret.classList.remove("typing");
    });
    // command history (up/down)
    var history = [];
    var hIdx = -1;
    input.addEventListener("keydown", function (e) {
      if (e.key === "ArrowUp") {
        if (history.length) {
          hIdx = hIdx <= 0 ? history.length - 1 : hIdx - 1;
          input.value = history[hIdx];
          e.preventDefault();
        }
      } else if (e.key === "ArrowDown") {
        if (history.length) {
          hIdx = hIdx >= history.length - 1 ? -1 : hIdx + 1;
          input.value = hIdx === -1 ? "" : history[hIdx];
          e.preventDefault();
        }
      }
    });
    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var v = input.value;
        if (v.trim()) {
          history.push(v.trim());
          hIdx = -1;
        }
        runCommand(v);
        input.value = "";
        syncCaret();
      });
    }
  }

  // ghost command buttons + run on click
  document.querySelectorAll(".ghost-cmd").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var c = btn.getAttribute("data-cmd");
      runCommand(c);
      if (input) input.focus();
    });
  });

  /* ---------- case-file dialog ---------- */
  var dialog = $("#dialog");
  var dlgTitle = $("#dlgTitle");
  var dlgMeta = $("#dlgMeta");
  var dlgBody = $("#dlgBody");
  var dlgTag = $("#dlgTag");
  var dlgClose = $("#dlgClose");
  var lastFocus = null;

  function openProject(id) {
    var p = PROJECTS.filter(function (x) {
      return x.id === id;
    })[0];
    if (!p || !dialog) return;
    lastFocus = document.activeElement;
    dlgTag.textContent = "~/projects/" + p.name;
    dlgTitle.textContent = p.name;
    dlgMeta.textContent = p.role + " · " + p.year + " · " + p.tag;
    var bullets = p.bullets
      .map(function (b) {
        return "<li>" + b + "</li>";
      })
      .join("");
    var metrics = p.metrics
      .map(function (m) {
        return "<li><b>" + m.n + "</b><span>" + m.l + "</span></li>";
      })
      .join("");
    dlgBody.innerHTML =
      "<p>" +
      p.blurb +
      "</p><ul>" +
      bullets +
      '</ul><ul class="metrics">' +
      metrics +
      "</ul>";
    dialog.hidden = false;
    document.body.style.overflow = "hidden";
    setTimeout(function () {
      dlgClose.focus();
    }, 40);
  }

  function closeDialog() {
    if (!dialog || dialog.hidden) return;
    dialog.hidden = true;
    document.body.style.overflow = "";
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  if (dlgClose) dlgClose.addEventListener("click", closeDialog);
  if (dialog) {
    dialog.addEventListener("click", function (e) {
      if (e.target === dialog) closeDialog();
    });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeDialog();
  });

  /* ---------- scanline toggle ---------- */
  var crtBtn = $("#scanlines");
  var terminal = $(".terminal");
  if (crtBtn && terminal) {
    crtBtn.addEventListener("click", function () {
      var on = crtBtn.getAttribute("aria-pressed") === "true";
      crtBtn.setAttribute("aria-pressed", String(!on));
      terminal.classList.toggle("no-crt", on);
      toast(on ? "CRT scanlines off" : "CRT scanlines on");
    });
  }

  /* ---------- contact form ---------- */
  var contactForm = $("#contactForm");
  var formStatus = $("#formStatus");
  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var email = $("#cEmail");
      var msg = $("#cMsg");
      var emailOk = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(
        (email.value || "").trim()
      );
      if (!emailOk) {
        formStatus.textContent = "✕ invalid --from address";
        formStatus.classList.add("err");
        email.focus();
        return;
      }
      if (!(msg.value || "").trim()) {
        formStatus.textContent = "✕ --message cannot be empty";
        formStatus.classList.add("err");
        msg.focus();
        return;
      }
      formStatus.classList.remove("err");
      formStatus.textContent = "sending…";
      var btn = $(".run-btn", contactForm);
      if (btn) btn.disabled = true;
      setTimeout(function () {
        formStatus.textContent = "✓ message queued — I'll reply within 2 days.";
        toast("message sent (demo). thanks!");
        contactForm.reset();
        if (btn) btn.disabled = false;
      }, 900);
    });
  }

  // simple toast links
  document.querySelectorAll("[data-toast]").forEach(function (a) {
    a.addEventListener("click", function (e) {
      e.preventDefault();
      toast(a.getAttribute("data-toast"));
    });
  });

  /* ---------- boot sequence (typed) ---------- */
  var bootLines = [
    { t: "[ ok ] mounting /home/maya … ", s: "ok" },
    { t: "[ ok ] loading portfolio.sh v3.2.1", s: "ok" },
    { t: "[ ok ] 5 projects indexed · 6 skills calibrated", s: "ok" },
    { t: "[info] welcome — try `whoami` or `all`. (`help` for commands)", s: "warn" }
  ];

  var boot = $("#boot");
  function runBoot(done) {
    if (!boot) return done && done();
    if (reduceMotion) {
      bootLines.forEach(function (l) {
        var d = document.createElement("div");
        d.className = l.s;
        d.textContent = l.t;
        boot.appendChild(d);
      });
      return done && done();
    }
    var i = 0;
    function next() {
      if (i >= bootLines.length) return done && done();
      var l = bootLines[i++];
      var d = document.createElement("div");
      d.className = l.s;
      boot.appendChild(d);
      typeInto(d, l.t, 14, function () {
        setTimeout(next, 140);
      });
      scrollToEnd();
    }
    next();
  }

  function typeInto(el, text, speed, cb) {
    var i = 0;
    (function step() {
      el.textContent = text.slice(0, i);
      if (i++ <= text.length) {
        setTimeout(step, speed);
      } else if (cb) {
        cb();
      }
    })();
  }

  // kick off: boot, then reveal whoami automatically so the page is never empty
  runBoot(function () {
    reveal("whoami");
    reveal("projects");
  });

  // keep input focused-feeling: click anywhere on screen focuses prompt
  if (screen && input) {
    screen.addEventListener("dblclick", function () {
      input.focus();
    });
  }
})();
