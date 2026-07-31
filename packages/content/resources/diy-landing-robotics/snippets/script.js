/* Servolab — robotics lab landing interactions (vanilla JS) */
(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- toast ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer = null;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2600);
  }

  function pad(n, len) {
    var s = String(Math.floor(n));
    while (s.length < len) s = "0" + s;
    return s;
  }

  /* ---------- telemetry ---------- */
  var tm = {
    servo: document.getElementById("tm-servo"),
    batt: document.getElementById("tm-batt"),
    up: document.getElementById("tm-up"),
    pkt: document.getElementById("tm-pkt"),
    temp: document.getElementById("tm-temp"),
    link: document.getElementById("tm-link")
  };
  var hud = {
    cycles: document.getElementById("hud-cycles"),
    torque: document.getElementById("hud-torque"),
    mode: document.getElementById("hud-mode")
  };

  var t0 = Date.now();
  var packets = 18420;
  var battery = 92.4;
  var temp = 38.2;
  var phase = 0;
  var cycles = 0;

  function tick() {
    phase += 0.09;
    packets += 3 + Math.floor(Math.random() * 5);
    battery = Math.max(61.5, battery - 0.004);
    temp += (Math.random() - 0.5) * 0.18;
    if (temp < 35.4) temp = 35.4;
    if (temp > 44.2) temp = 44.2;

    var angle = 64 + Math.sin(phase) * 38;
    var up = Math.floor((Date.now() - t0) / 1000);

    if (tm.servo) tm.servo.textContent = pad(angle, 3) + "." + pad(Math.abs(angle * 10) % 10, 1) + "°";
    if (tm.batt) {
      tm.batt.textContent = battery.toFixed(1) + "%";
      tm.batt.className = "t-val" + (battery < 70 ? " warn" : "");
    }
    if (tm.up) {
      tm.up.textContent =
        pad(up / 3600, 2) + ":" + pad((up % 3600) / 60, 2) + ":" + pad(up % 60, 2);
    }
    if (tm.pkt) tm.pkt.textContent = pad(packets, 6);
    if (tm.temp) {
      tm.temp.textContent = temp.toFixed(1) + " °C";
      tm.temp.className = "t-val" + (temp > 42 ? " warn" : "");
    }
    if (tm.link) {
      var jitter = Math.random();
      tm.link.textContent = jitter > 0.965 ? "RESYNC" : "MESH OK";
      tm.link.className = "t-val " + (jitter > 0.965 ? "warn" : "ok");
    }
    if (hud.torque) hud.torque.textContent = (0.34 + Math.abs(Math.sin(phase)) * 0.42).toFixed(2) + " N·m";
  }
  tick();
  setInterval(tick, 1000);

  /* cycle counter — matches the 6s CSS arm loop */
  if (!reduced) {
    setInterval(function () {
      cycles += 1;
      if (hud.cycles) hud.cycles.textContent = pad(cycles, 3);
      if (hud.mode) hud.mode.textContent = cycles % 7 === 0 ? "RECAL" : "CYCLE";
    }, 6000);
  } else {
    if (hud.mode) hud.mode.textContent = "HOLD";
    if (hud.cycles) hud.cycles.textContent = "000";
  }

  /* ---------- kit cards: tap to open spec on touch/keyboard ---------- */
  var kits = document.querySelectorAll(".kit");
  Array.prototype.forEach.call(kits, function (card) {
    card.addEventListener("click", function () {
      var open = card.classList.contains("is-open");
      Array.prototype.forEach.call(kits, function (c) { c.classList.remove("is-open"); });
      if (!open) {
        card.classList.add("is-open");
        var name = card.querySelector("h3");
        toast("Spec sheet — " + (name ? name.textContent : "kit"));
      }
    });
    card.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        card.click();
      }
    });
  });

  /* ---------- skill path ---------- */
  var STAGES = {
    1: {
      title: "Assemble",
      body: "Frame, gearbox and servo horns. You work from a printed exploded map with torque values on every fastener, and finish with a dry-run gait on the bench cradle.",
      items: [
        ["TOOLS", "2.0 / 2.5 mm hex, thread lock, digital caliper"],
        ["OUTPUT", "Rolling chassis, zero-backlash joints"],
        ["CHECK", "Coach signs the torque card"]
      ]
    },
    2: {
      title: "Wire",
      body: "SL-Bus daisy chains, power budgeting and strain relief. You crimp your own JST harness, label every node and prove the loop with a bus sniffer before power-up.",
      items: [
        ["TOOLS", "Crimper, multimeter, SL-Bus sniffer"],
        ["OUTPUT", "Labelled 12-node harness, 5 A budget"],
        ["CHECK", "Continuity + polarity sweep passes"]
      ]
    },
    3: {
      title: "Program",
      body: "Flash the firmware core, then write the behaviour on top. Sessions cover the 1 kHz control tick, PID tuning by ear, and reading a fault map without guessing.",
      items: [
        ["TOOLS", "arm-none-eabi-gcc, SWD probe, plot bench"],
        ["OUTPUT", "Custom gait or drive routine in C"],
        ["CHECK", "60 s autonomous run, no faults"]
      ]
    },
    4: {
      title: "Compete",
      body: "Heat strategy, pit discipline and repairs under a clock. Teams run mock rounds against lab bots, then enter the Harbour Circuit qualifiers as a scored entry.",
      items: [
        ["TOOLS", "Pit crate, spares kit, heat timer"],
        ["OUTPUT", "Scored league entry + match log"],
        ["CHECK", "Three clean heats in mock rounds"]
      ]
    }
  };

  var stageBtns = document.querySelectorAll(".stage");
  var spTitle = document.getElementById("sp-title");
  var spBody = document.getElementById("sp-body");
  var spList = document.getElementById("sp-list");
  var railFill = document.getElementById("rail-fill");
  var panel = document.getElementById("stage-panel");

  function selectStage(n) {
    var data = STAGES[n];
    if (!data) return;
    Array.prototype.forEach.call(stageBtns, function (b) {
      var on = b.getAttribute("data-stage") === String(n);
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-selected", on ? "true" : "false");
      if (on && panel) panel.setAttribute("aria-labelledby", b.id);
    });
    if (railFill) railFill.style.width = (n - 1) / 3 * 88 + 12 + "%";
    if (spTitle) spTitle.textContent = data.title;
    if (spBody) spBody.textContent = data.body;
    if (spList) {
      spList.innerHTML = "";
      data.items.forEach(function (pair) {
        var li = document.createElement("li");
        var b = document.createElement("b");
        b.textContent = pair[0];
        li.appendChild(b);
        li.appendChild(document.createTextNode(pair[1]));
        spList.appendChild(li);
      });
    }
  }

  Array.prototype.forEach.call(stageBtns, function (b, i) {
    b.addEventListener("click", function () {
      selectStage(parseInt(b.getAttribute("data-stage"), 10));
    });
    b.addEventListener("keydown", function (e) {
      var next = null;
      if (e.key === "ArrowRight") next = (i + 1) % stageBtns.length;
      if (e.key === "ArrowLeft") next = (i - 1 + stageBtns.length) % stageBtns.length;
      if (next === null) return;
      e.preventDefault();
      stageBtns[next].focus();
      selectStage(parseInt(stageBtns[next].getAttribute("data-stage"), 10));
    });
  });
  selectStage(1);

  /* ---------- copy code ---------- */
  var copyBtn = document.getElementById("copy-btn");
  var codeBlock = document.getElementById("code-block");
  if (copyBtn && codeBlock) {
    copyBtn.addEventListener("click", function () {
      var text = codeBlock.innerText;
      var done = function () {
        copyBtn.textContent = "Copied";
        toast("gait_step.c copied to clipboard");
        setTimeout(function () { copyBtn.textContent = "Copy"; }, 1800);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, function () { fallback(text, done); });
      } else {
        fallback(text, done);
      }
    });
  }
  function fallback(text, done) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); done(); } catch (e) { toast("Copy blocked by the browser"); }
    document.body.removeChild(ta);
  }

  /* ---------- countdown ---------- */
  var target = new Date(Date.now() + (17 * 86400 + 6 * 3600 + 42 * 60 + 18) * 1000);
  var cd = {
    d: document.getElementById("cd-d"),
    h: document.getElementById("cd-h"),
    m: document.getElementById("cd-m"),
    s: document.getElementById("cd-s")
  };
  function countdown() {
    var left = Math.max(0, Math.floor((target - Date.now()) / 1000));
    if (cd.d) cd.d.textContent = pad(left / 86400, 2);
    if (cd.h) cd.h.textContent = pad((left % 86400) / 3600, 2);
    if (cd.m) cd.m.textContent = pad((left % 3600) / 60, 2);
    if (cd.s) cd.s.textContent = pad(left % 60, 2);
  }
  countdown();
  setInterval(countdown, 1000);

  /* ---------- leaderboard live scoring ---------- */
  var rows = document.querySelectorAll(".board-list .row");
  if (rows.length && !reduced) {
    setInterval(function () {
      var row = rows[Math.floor(Math.random() * rows.length)];
      var cell = row.querySelector(".sc");
      if (!cell) return;
      var val = parseInt(cell.textContent.replace(/\D/g, ""), 10) + Math.floor(Math.random() * 9) + 1;
      cell.textContent = String(val).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
      row.classList.remove("bump");
      void row.offsetWidth;
      row.classList.add("bump");
    }, 4200);
  }

  /* ---------- signup ---------- */
  var form = document.getElementById("signup-form");
  var email = document.getElementById("email");
  var msg = document.getElementById("form-msg");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var v = (email.value || "").trim();
      var ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
      email.setAttribute("aria-invalid", ok ? "false" : "true");
      msg.className = "form-msg " + (ok ? "ok" : "err");
      msg.textContent = ok
        ? "Confirmed — bench brief queued for " + v
        : "Enter a valid email address to subscribe.";
      if (ok) {
        toast("Welcome to the bench brief");
        form.reset();
      } else {
        email.focus();
      }
    });
  }
})();
