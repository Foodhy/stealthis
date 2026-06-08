(function () {
  "use strict";

  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));

  /* ---------- Toast helper ---------- */
  const toastWrap = $("#toasts");
  function toast(msg, ms = 2600) {
    const el = document.createElement("div");
    el.className = "toast";
    el.setAttribute("role", "status");
    el.innerHTML = '<span class="dot" aria-hidden="true"></span>';
    el.append(msg);
    toastWrap.appendChild(el);
    setTimeout(() => {
      el.classList.add("is-out");
      el.addEventListener("animationend", () => el.remove(), { once: true });
    }, ms);
  }

  /* ---------- Sticky nav shadow ---------- */
  const nav = $("#nav");
  const onScroll = () => nav.classList.toggle("is-stuck", window.scrollY > 8);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Mobile nav toggle ---------- */
  const navToggle = $("#navToggle");
  const navLinks = $("#navLinks");
  function closeNav() {
    navLinks.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open menu");
  }
  navToggle.addEventListener("click", () => {
    const open = navLinks.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });
  navLinks.addEventListener("click", (e) => {
    if (e.target.closest("a")) closeNav();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeNav();
  });

  /* ---------- Active link on scroll ---------- */
  const sections = ["services", "gallery", "offers", "team"]
    .map((id) => document.getElementById(id))
    .filter(Boolean);
  const linkFor = {};
  $$("#navLinks a[data-link]").forEach((a) => {
    const id = a.getAttribute("href").slice(1);
    linkFor[id] = a;
  });
  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          Object.values(linkFor).forEach((a) => a.classList.remove("is-active"));
          const a = linkFor[en.target.id];
          if (a) a.classList.add("is-active");
        }
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  sections.forEach((s) => spy.observe(s));

  /* ---------- Reveal on scroll ---------- */
  const revealer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add("is-in");
          obs.unobserve(en.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  $$(".reveal").forEach((el) => revealer.observe(el));

  /* ---------- Animated stat counters ---------- */
  let countersRun = false;
  const statsEl = $("#stats");
  function runCounters() {
    if (countersRun) return;
    countersRun = true;
    $$("[data-count]", statsEl).forEach((el) => {
      const target = parseFloat(el.dataset.count);
      const decimals = parseInt(el.dataset.decimals || "0", 10);
      const dur = 1400;
      const start = performance.now();
      function tick(now) {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        const val = target * eased;
        el.textContent =
          decimals > 0
            ? val.toFixed(decimals)
            : Math.round(val).toLocaleString("en-US");
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  }
  const statSpy = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        runCounters();
        statSpy.disconnect();
      }
    },
    { threshold: 0.4 }
  );
  if (statsEl) statSpy.observe(statsEl);

  /* ---------- Booking form ---------- */
  const form = $("#bookForm");
  const fService = $("#bService");
  const fDate = $("#bDate");
  const fName = $("#bName");
  const bTotal = $("#bTotal");

  // sensible min date = today
  const today = new Date();
  fDate.min = today.toISOString().split("T")[0];

  function currentPrice() {
    const opt = fService.options[fService.selectedIndex];
    return opt && opt.dataset.price ? parseInt(opt.dataset.price, 10) : 0;
  }
  function updateTotal() {
    bTotal.textContent = "$" + currentPrice();
  }
  fService.addEventListener("change", () => {
    updateTotal();
    field(fService).classList.remove("is-invalid");
  });

  function field(input) {
    return input.closest(".field");
  }
  [fName, fDate].forEach((inp) =>
    inp.addEventListener("input", () => field(inp).classList.remove("is-invalid"))
  );

  // Pick a service from a card / select option
  function selectService(name) {
    const opt = $$("#bService option").find((o) => o.value === name);
    if (opt) {
      fService.value = name;
      updateTotal();
    }
    $$(".svc").forEach((c) =>
      c.classList.toggle("is-picked", c.dataset.service === name)
    );
  }

  $("#svcGrid").addEventListener("click", (e) => {
    const card = e.target.closest(".svc");
    if (!card) return;
    selectService(card.dataset.service);
    toast(card.dataset.emoji + " " + card.dataset.service + " selected");
    $("#book").scrollIntoView({ behavior: "smooth", block: "start" });
    fName.focus({ preventScroll: true });
  });

  // Artist picker
  let pickedArtist = null;
  $("#team").addEventListener("click", (e) => {
    const card = e.target.closest(".artist");
    if (!card) return;
    const name = card.dataset.artist;
    const same = pickedArtist === name;
    pickedArtist = same ? null : name;
    $$(".artist").forEach((c) =>
      c.classList.toggle("is-picked", !same && c.dataset.artist === name)
    );
    toast(same ? "Artist cleared" : "Requested " + name + " ✦");
    if (!same) $("#book").scrollIntoView({ behavior: "smooth", block: "start" });
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let ok = true;
    if (!fName.value.trim()) {
      field(fName).classList.add("is-invalid");
      ok = false;
    }
    if (!fService.value) {
      field(fService).classList.add("is-invalid");
      ok = false;
    }
    if (!fDate.value) {
      field(fDate).classList.add("is-invalid");
      ok = false;
    }
    if (!ok) {
      toast("Pop in your name, service & date 💕");
      return;
    }
    const when = new Date(fDate.value + "T00:00:00").toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
    const artist = pickedArtist ? " with " + pickedArtist : "";
    toast(
      "Booked! " + fService.value + artist + " on " + when + " — $" + currentPrice()
    );
    form.reset();
    pickedArtist = null;
    $$(".svc, .artist").forEach((c) => c.classList.remove("is-picked"));
    updateTotal();
    fDate.min = today.toISOString().split("T")[0];
  });

  /* ---------- Gallery ---------- */
  const looks = [
    { name: "Liquid Chrome", cat: "chrome", g: "linear-gradient(135deg,#d8dde6,#a98fe0,#e58aa6)" },
    { name: "Sunset Ombré", cat: "ombre", g: "linear-gradient(160deg,#f7c8d6,#e58aa6,#cdbdf0)" },
    { name: "Petal Bloom", cat: "floral", g: "radial-gradient(circle at 30% 30%,#f7c8d6,#cdbdf0)" },
    { name: "Milk Bath", cat: "minimal", g: "linear-gradient(135deg,#fdf6f9,#d8dde6)" },
    { name: "Mirror Mauve", cat: "chrome", g: "linear-gradient(120deg,#cdbdf0,#d8dde6,#a98fe0)" },
    { name: "Peach Fade", cat: "ombre", g: "linear-gradient(170deg,#f7c8d6,#fdf6f9)" },
    { name: "Wildflower", cat: "floral", g: "radial-gradient(circle at 70% 20%,#cdbdf0,#f7c8d6,#e58aa6)" },
    { name: "Glass Nude", cat: "minimal", g: "linear-gradient(135deg,#f7c8d6,#fdf6f9,#d8dde6)" },
  ];
  const galleryEl = $("#gallery-grid");
  const likeState = {};

  function renderGallery() {
    galleryEl.innerHTML = "";
    looks.forEach((look, i) => {
      const likes = (likeState[i] = likeState[i] ?? 40 + ((i * 17) % 60));
      const liked = likeState["liked_" + i] || false;
      const btn = document.createElement("button");
      btn.className = "tile" + (liked ? " is-liked" : "");
      btn.dataset.cat = look.cat;
      btn.style.background = look.g;
      btn.setAttribute("aria-label", "Like " + look.name + " design");
      btn.innerHTML =
        '<span class="tile__meta">' +
        '<span class="tile__name">' + look.name + "</span>" +
        '<span class="tile__like"><span class="heart" aria-hidden="true">' +
        (liked ? "♥" : "♡") +
        '</span><span class="cnt">' + likes + "</span></span>" +
        "</span>";
      btn.addEventListener("click", () => {
        const now = !likeState["liked_" + i];
        likeState["liked_" + i] = now;
        likeState[i] += now ? 1 : -1;
        btn.classList.toggle("is-liked", now);
        $(".heart", btn).textContent = now ? "♥" : "♡";
        $(".cnt", btn).textContent = likeState[i];
      });
      galleryEl.appendChild(btn);
    });
    applyFilter(activeFilter);
  }

  let activeFilter = "all";
  function applyFilter(cat) {
    activeFilter = cat;
    $$(".tile", galleryEl).forEach((t) => {
      t.classList.toggle("is-hidden", cat !== "all" && t.dataset.cat !== cat);
    });
  }

  $("#filters").addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    $$(".chip").forEach((c) => {
      c.classList.remove("is-active");
      c.setAttribute("aria-selected", "false");
    });
    chip.classList.add("is-active");
    chip.setAttribute("aria-selected", "true");
    applyFilter(chip.dataset.filter);
  });

  renderGallery();

  /* ---------- Copy promo code ---------- */
  const copyBtn = $("#copyCode");
  copyBtn.addEventListener("click", async () => {
    const code = $("#promoCode").textContent.trim();
    try {
      await navigator.clipboard.writeText(code);
    } catch (_) {
      const r = document.createRange();
      r.selectNode($("#promoCode"));
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(r);
      document.execCommand("copy");
      sel.removeAllRanges();
    }
    toast("Code " + code + " copied ✨");
  });

  /* ---------- Book buttons ---------- */
  $$("[data-book]").forEach((b) =>
    b.addEventListener("click", () => {
      closeNav();
      setTimeout(() => fName.focus({ preventScroll: true }), 400);
    })
  );

  updateTotal();
})();
