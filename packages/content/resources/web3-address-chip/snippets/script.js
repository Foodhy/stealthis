/* Web3 — Address Chip — UI-only simulation. No wallet / RPC / on-chain calls. */
(function () {
  "use strict";

  /* ---------- tiny deterministic hash for blockies ---------- */
  function seedFrom(str) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619) >>> 0;
    }
    return h >>> 0;
  }
  function mulberry32(a) {
    return function () {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* Build a gradient "blockie" purely from the address string. */
  function paintBlockie(el) {
    var addr = (el.getAttribute("data-blockie") || "").toLowerCase();
    var rng = mulberry32(seedFrom(addr || "0x"));
    function hue() { return Math.floor(rng() * 360); }
    var h1 = hue();
    var h2 = (h1 + 80 + Math.floor(rng() * 160)) % 360;
    var h3 = (h2 + 60 + Math.floor(rng() * 120)) % 360;
    var ang = Math.floor(rng() * 360);
    var px = Math.floor(rng() * 100);
    var py = Math.floor(rng() * 100);
    el.style.backgroundImage =
      "radial-gradient(circle at " + px + "% " + py + "%, hsl(" + h3 + " 90% 62%), transparent 60%)," +
      "linear-gradient(" + ang + "deg, hsl(" + h1 + " 85% 58%), hsl(" + h2 + " 80% 50%))";
  }

  document.querySelectorAll("[data-blockie]").forEach(paintBlockie);

  /* ---------- address helpers ---------- */
  function truncate(addr) {
    if (!addr || addr.length < 12) return addr || "";
    return addr.slice(0, 6) + "…" + addr.slice(-4);
  }
  // Pre-fill title attributes with the full address for accessibility.
  document.querySelectorAll(".chip[data-address]").forEach(function (chip) {
    var full = chip.getAttribute("data-address");
    chip.setAttribute("title", full);
  });

  /* ---------- toast ---------- */
  var wrap = document.getElementById("toastWrap");
  function toast(msg, hash) {
    var el = document.createElement("div");
    el.className = "toast";
    el.setAttribute("role", "status");
    var dot = document.createElement("span");
    dot.className = "t-dot";
    el.appendChild(dot);
    var label = document.createElement("span");
    label.textContent = msg;
    el.appendChild(label);
    if (hash) {
      var h = document.createElement("span");
      h.className = "t-hash";
      h.textContent = hash;
      el.appendChild(h);
    }
    wrap.appendChild(el);
    var ttl = setTimeout(dismiss, 2600);
    function dismiss() {
      clearTimeout(ttl);
      el.classList.add("out");
      el.addEventListener("animationend", function () { el.remove(); }, { once: true });
    }
  }

  /* ---------- copy to clipboard ---------- */
  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      try {
        var ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.position = "absolute";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        resolve();
      } catch (e) { reject(e); }
    });
  }

  document.querySelectorAll("[data-copy]").forEach(function (chip) {
    var locked = false;
    chip.addEventListener("click", function () {
      var addr = chip.getAttribute("data-address");
      copyText(addr).then(function () {
        if (!locked) {
          locked = true;
          chip.classList.add("copied");
          setTimeout(function () {
            chip.classList.remove("copied");
            locked = false;
          }, 1400);
        }
        toast("Address copied", truncate(addr));
      }).catch(function () {
        toast("Couldn't access clipboard");
      });
    });
  });

  /* ---------- explorer links (simulated) ---------- */
  document.querySelectorAll("[data-explorer]").forEach(function (link) {
    var addr = link.getAttribute("data-explorer");
    // Fictional explorer — kept as a hash so nothing navigates off-page.
    link.setAttribute("href", "#lumenscan/address/" + addr);
    link.addEventListener("click", function (e) {
      e.preventDefault();
      toast("Opening on Lumen Scan", truncate(addr));
    });
  });

  /* ---------- hero: toggle raw / ENS ---------- */
  var toggle = document.getElementById("toggleEns");
  if (toggle) {
    var heroChip = document.querySelector(".hero .chip-copy");
    var heroName = document.getElementById("heroName");
    var addrEl = heroChip ? heroChip.querySelector("[data-addr]") : null;
    var fullAddr = heroChip ? heroChip.getAttribute("data-address") : "";
    var ensName = "nova.lumen";
    var showingEns = true;

    function render() {
      if (showingEns) {
        if (heroName) heroName.textContent = ensName;
        if (addrEl) addrEl.textContent = truncate(fullAddr);
        toggle.querySelector(".ti").textContent = "Showing ENS";
        toggle.setAttribute("aria-pressed", "true");
      } else {
        if (heroName) heroName.textContent = truncate(fullAddr);
        if (addrEl) addrEl.textContent = truncate(fullAddr);
        toggle.querySelector(".ti").textContent = "Showing raw";
        toggle.setAttribute("aria-pressed", "false");
      }
    }
    toggle.addEventListener("click", function () {
      showingEns = !showingEns;
      render();
      toast(showingEns ? "Resolved to nova.lumen" : "Showing raw address");
    });
    render();
  }
})();
