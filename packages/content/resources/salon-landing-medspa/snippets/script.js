/* ░░░░░ Maison Lumière — Med-Spa Landing ░░░░░ */
(function () {
  "use strict";

  /* ── tiny helpers ── */
  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));

  let toastTimer;
  function toast(msg, isError) {
    const el = $("#toast");
    if (!el) return;
    el.textContent = msg;
    el.classList.toggle("is-error", !!isError);
    el.classList.add("is-shown");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("is-shown"), 3600);
  }

  /* ── treatment data ── */
  const TREATMENTS = [
    { cat: "injectables", icon: "💉", name: "Anti-Wrinkle Injections", desc: "Softening dynamic lines across forehead, frown and crow's feet with a light, natural touch.", price: "£195", unit: "/ 1 area" },
    { cat: "injectables", icon: "✦", name: "Dermal Fillers", desc: "Hyaluronic restoration for lips, cheeks and jawline — sculpted to your facial proportions.", price: "£290", unit: "/ 1ml" },
    { cat: "injectables", icon: "◇", name: "Profhilo® Bio-Remodelling", desc: "Injectable skin-quality treatment that hydrates and firms from within. Course of two.", price: "£350", unit: "/ session" },
    { cat: "laser", icon: "⚡", name: "Laser Skin Resurfacing", desc: "Fractional resurfacing to refine texture, pores and pigmentation with minimal downtime.", price: "£420", unit: "/ session" },
    { cat: "laser", icon: "✷", name: "Laser Hair Removal", desc: "Medical-grade diode laser, safe across all skin tones. Permanent reduction over a course.", price: "£90", unit: "/ small area" },
    { cat: "laser", icon: "❋", name: "IPL Photorejuvenation", desc: "Intense pulsed light to even tone, fade redness and restore a luminous, healthy glow.", price: "£180", unit: "/ session" },
    { cat: "skin", icon: "🜄", name: "Medical Peels", desc: "Physician-strength peels tailored to acne, ageing or pigmentation under medical oversight.", price: "£120", unit: "/ session" },
    { cat: "skin", icon: "❀", name: "SkinPen® Microneedling", desc: "Collagen induction therapy for scarring, fine lines and overall skin resilience.", price: "£175", unit: "/ session" },
    { cat: "skin", icon: "✶", name: "Prescription Skincare Plan", desc: "Bespoke medical-grade regimen with VISIA imaging and a 12-week review pathway.", price: "£85", unit: "/ consult" },
    { cat: "body", icon: "◈", name: "CoolSculpting® Cryolipolysis", desc: "Non-surgical fat reduction that freezes and clears stubborn pockets over weeks.", price: "£600", unit: "/ cycle" },
    { cat: "body", icon: "▣", name: "Radiofrequency Skin Tightening", desc: "Deep-tissue heating to firm lax skin on body and neck — no incisions, no downtime.", price: "£240", unit: "/ session" },
    { cat: "body", icon: "❖", name: "EMSculpt® Muscle Toning", desc: "High-intensity electromagnetic stimulation to build muscle and define core and limbs.", price: "£320", unit: "/ session" }
  ];

  const CAT_LABEL = {
    injectables: "Injectables",
    laser: "Laser & Energy",
    skin: "Skin & Peels",
    body: "Body Contouring"
  };

  /* ── render treatment cards ── */
  function renderCards() {
    const grid = $("#treatmentGrid");
    if (!grid) return;
    grid.innerHTML = TREATMENTS.map((t, i) => `
      <article class="card reveal" data-cat="${t.cat}" style="transition-delay:${(i % 3) * 70}ms">
        <span class="card__icon" aria-hidden="true">${t.icon}</span>
        <span class="card__cat">${CAT_LABEL[t.cat]}</span>
        <h3 class="card__name">${t.name}</h3>
        <p class="card__desc">${t.desc}</p>
        <div class="card__foot">
          <span class="card__price">${t.price} <small>${t.unit}</small></span>
          <button class="card__book" type="button" data-name="${t.name}">Enquire</button>
        </div>
      </article>
    `).join("");

    // observe newly created reveal nodes
    $$(".card.reveal", grid).forEach((el) => revealObserver.observe(el));

    // enquire buttons → prefill form + scroll
    $$(".card__book", grid).forEach((btn) => {
      btn.addEventListener("click", () => {
        const name = btn.getAttribute("data-name");
        const card = btn.closest(".card");
        const cat = card ? card.getAttribute("data-cat") : "";
        const select = $("#cTreatment");
        if (select) {
          const map = {
            injectables: "Injectables & anti-wrinkle",
            laser: "Laser & skin resurfacing",
            skin: "Medical-grade skincare & peels",
            body: "Body contouring"
          };
          const wanted = map[cat];
          const opt = $$("#cTreatment option").find((o) => o.value === wanted || o.textContent.trim() === wanted);
          if (opt) select.value = opt.value || opt.textContent;
        }
        $("#consult").scrollIntoView({ behavior: "smooth", block: "start" });
        toast(`${name} added to your consultation request.`);
        setTimeout(() => { const f = $("#cName"); if (f) f.focus(); }, 600);
      });
    });
  }

  /* ── filters ── */
  function initFilters() {
    const filters = $("#filters");
    if (!filters) return;
    filters.addEventListener("click", (e) => {
      const chip = e.target.closest(".chip");
      if (!chip) return;
      $$(".chip", filters).forEach((c) => {
        c.classList.toggle("is-active", c === chip);
        c.setAttribute("aria-selected", c === chip ? "true" : "false");
      });
      const f = chip.getAttribute("data-filter");
      let shown = 0;
      $$(".card", $("#treatmentGrid")).forEach((card) => {
        const match = f === "all" || card.getAttribute("data-cat") === f;
        card.classList.toggle("is-hidden", !match);
        if (match) shown++;
      });
      toast(`${shown} treatment${shown === 1 ? "" : "s"} shown.`);
    });
  }

  /* ── reveal on scroll ── */
  const revealObserver = ("IntersectionObserver" in window)
    ? new IntersectionObserver((entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" })
    : null;

  function initReveal() {
    if (!revealObserver) { $$(".reveal").forEach((el) => el.classList.add("is-in")); return; }
    $$(".reveal").forEach((el) => revealObserver.observe(el));
  }

  /* ── animated counters ── */
  function animateCount(el) {
    const target = parseFloat(el.getAttribute("data-count"));
    const decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
    const suffix = el.getAttribute("data-suffix") || "";
    const dur = 1400;
    const start = performance.now();
    function tick(now) {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const val = target * eased;
      const out = decimals ? val.toFixed(decimals) : Math.round(val).toLocaleString("en-GB");
      el.textContent = out + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function initCounters() {
    const nums = $$("[data-count]");
    if (!nums.length) return;
    if (!("IntersectionObserver" in window)) { nums.forEach(animateCount); return; }
    const obs = new IntersectionObserver((entries, o) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { animateCount(e.target); o.unobserve(e.target); }
      });
    }, { threshold: 0.5 });
    nums.forEach((n) => obs.observe(n));
  }

  /* ── sticky nav shadow + active link ── */
  function initNav() {
    const nav = $("#nav");
    const onScroll = () => nav.classList.toggle("is-stuck", window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const links = $$(".nav__links a[href^='#']");
    const sections = links
      .map((a) => $(a.getAttribute("href")))
      .filter(Boolean);
    if ("IntersectionObserver" in window && sections.length) {
      const spy = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const id = "#" + e.target.id;
            links.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === id));
          }
        });
      }, { rootMargin: "-45% 0px -50% 0px" });
      sections.forEach((s) => spy.observe(s));
    }
  }

  /* ── mobile menu ── */
  function initMobileMenu() {
    const toggle = $("#navToggle");
    const links = $("#navLinks");
    if (!toggle || !links) return;
    const close = () => {
      toggle.classList.remove("is-open");
      links.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open menu");
    };
    toggle.addEventListener("click", () => {
      const open = toggle.classList.toggle("is-open");
      links.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    $$("a", links).forEach((a) => a.addEventListener("click", close));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
  }

  /* ── availability / hours ── */
  function initAvailability() {
    const now = new Date();
    const day = now.getDay(); // 0 Sun .. 6 Sat
    const hour = now.getHours();
    const open = day !== 0 && hour >= 9 && hour < 19; // Mon–Sat 9–19

    const pill = $("#availPill");
    if (pill) {
      pill.textContent = open ? "Open now · accepting bookings" : "Closed · book online 24/7";
      pill.classList.toggle("is-closed", !open);
    }

    const footStatus = $("#footStatus");
    if (footStatus) {
      footStatus.innerHTML = `<span class="dot" aria-hidden="true"></span>${open ? "Open now" : "Closed · opens 09:00"}`;
      footStatus.classList.toggle("is-closed", !open);
    }

    // next opening: next weekday at a tidy half-hour
    const slot = $("#nextSlot");
    if (slot) {
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      let d = new Date(now);
      if (open) {
        d.setHours(hour + 1, 30, 0, 0);
        slot.textContent = `Today, ${pad(d.getHours())}:30`;
      } else {
        do { d.setDate(d.getDate() + 1); } while (d.getDay() === 0);
        slot.textContent = `${days[d.getDay()]}, 09:30`;
      }
    }
  }
  function pad(n) { return String(n).padStart(2, "0"); }

  /* ── provider wait (lightly dynamic) ── */
  function initProviderWait() {
    const el = $("#providerWait");
    if (!el) return;
    const days = 7 + (new Date().getDate() % 6);
    el.textContent = `Typical wait: ${days} days`;
  }

  /* ── consultation form validation ── */
  function initForm() {
    const form = $("#consultForm");
    if (!form) return;

    // set min date = tomorrow
    const dateInput = $("#cDate");
    if (dateInput) {
      const t = new Date();
      t.setDate(t.getDate() + 1);
      dateInput.min = t.toISOString().split("T")[0];
    }

    const setErr = (id, msg) => {
      const input = $("#" + id);
      const err = $(`.err[data-for="${id}"]`);
      if (input) input.classList.toggle("is-invalid", !!msg);
      if (err) { err.textContent = msg || ""; err.classList.toggle("is-shown", !!msg); }
      return !msg;
    };

    const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    const phoneOk = (v) => v.replace(/[^\d]/g, "").length >= 7;

    // live-clear on input
    $$("input, select, textarea", form).forEach((el) => {
      el.addEventListener("input", () => {
        const id = el.id;
        const err = $(`.err[data-for="${id}"]`);
        if (err && err.classList.contains("is-shown")) {
          el.classList.remove("is-invalid");
          err.classList.remove("is-shown");
        }
      });
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      let ok = true;
      ok = setErr("cName", $("#cName").value.trim().length >= 2 ? "" : "Please enter your full name.") && ok;
      ok = setErr("cEmail", emailOk($("#cEmail").value.trim()) ? "" : "Enter a valid email address.") && ok;
      ok = setErr("cPhone", phoneOk($("#cPhone").value.trim()) ? "" : "Enter a contactable phone number.") && ok;
      ok = setErr("cTreatment", $("#cTreatment").value ? "" : "Choose an area of interest.") && ok;
      ok = setErr("cDate", $("#cDate").value ? "" : "Pick a preferred date.") && ok;

      const consent = $("#cConsent");
      const consentErr = $('.err[data-for="cConsent"]');
      if (!consent.checked) {
        if (consentErr) { consentErr.textContent = "Please tick to proceed."; consentErr.classList.add("is-shown"); }
        ok = false;
      } else if (consentErr) {
        consentErr.classList.remove("is-shown");
      }

      if (!ok) {
        toast("Please check the highlighted fields.", true);
        const firstInvalid = $(".is-invalid", form) || (!consent.checked ? consent : null);
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      const name = $("#cName").value.trim().split(" ")[0];
      const btn = $("button[type=submit]", form);
      btn.disabled = true;
      btn.textContent = "Sending…";
      setTimeout(() => {
        form.reset();
        btn.disabled = false;
        btn.textContent = "Request consultation";
        toast(`Thank you, ${name}. We'll confirm within one working day.`);
      }, 700);
    });
  }

  /* ── year ── */
  function initYear() {
    const y = $("#year");
    if (y) y.textContent = new Date().getFullYear();
  }

  /* ── boot ── */
  function init() {
    renderCards();
    initFilters();
    initReveal();
    initCounters();
    initNav();
    initMobileMenu();
    initAvailability();
    initProviderWait();
    initForm();
    initYear();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
