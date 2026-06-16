(function () {
  "use strict";

  /* ──────────────────────────────────────────────────────────
   * Fictional data sets
   * ────────────────────────────────────────────────────────── */

  // Country → Region → City
  const GEO = {
    AT: {
      label: "Atlantis",
      regions: {
        "AT-CO": { label: "Coral Coast", cities: ["Pearlhaven", "Tidemoor", "Saltspire"] },
        "AT-DP": { label: "Deepvale", cities: ["Abyssgate", "Lumenreef"] },
        "AT-RD": { label: "Reefdale", cities: ["Anemone Bay", "Kelpford", "Nautilus Point"] },
      },
    },
    NV: {
      label: "Novaria",
      regions: {
        "NV-AU": { label: "Aurora Province", cities: ["Polaris City", "Frostmere", "Glimmerhold"] },
        "NV-SK": { label: "Skylund", cities: ["Cloudreach", "Zephyr Falls"] },
      },
    },
    VR: {
      label: "Verdantia",
      regions: {
        "VR-MO": { label: "Mossgrove", cities: ["Ferndale", "Willowbrook", "Thornhollow"] },
        "VR-SN": { label: "Sunmeadow", cities: ["Goldhaven", "Amberfield"] },
        "VR-CA": { label: "Canopy Heights", cities: ["Emberleaf", "Vinewatch", "Brackenrise"] },
      },
    },
    ZE: {
      label: "Zephyria",
      regions: {
        "ZE-DU": { label: "Dunewind", cities: ["Mirage Wells", "Sandrest"] },
        "ZE-OA": { label: "Oasis Belt", cities: ["Palm Crossing", "Springgate", "Verdant Hollow"] },
      },
    },
  };

  // Category → Subcategory
  const CAT = {
    apparel: { label: "Apparel", subs: ["Outerwear", "Footwear", "Accessories", "Activewear"] },
    home: { label: "Home & Living", subs: ["Lighting", "Cookware", "Bedding", "Decor"] },
    tech: { label: "Electronics", subs: ["Audio", "Wearables", "Cameras"] },
    outdoor: { label: "Outdoor", subs: ["Camping", "Cycling", "Climbing", "Watersports"] },
  };

  /* ──────────────────────────────────────────────────────────
   * Helpers
   * ────────────────────────────────────────────────────────── */

  const $ = (sel, root) => (root || document).querySelector(sel);

  const els = {
    form: $("#ship"),
    country: $("#country"),
    region: $("#region"),
    city: $("#city"),
    category: $("#category"),
    subcategory: $("#subcategory"),
    submit: $("#submit"),
    done: $("#done"),
    doneSummary: $("#done-summary"),
    doneTitle: $(".done__title", $("#done")),
    reset: $("#reset"),
    toast: $("#toast"),
  };

  function fieldOf(select) {
    return select.closest(".field");
  }

  let toastTimer = null;
  function toast(msg) {
    els.toast.textContent = msg;
    els.toast.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => els.toast.classList.remove("is-show"), 2600);
  }

  // Build <option> elements from a list of {value,label} or strings.
  function fillOptions(select, items, placeholder) {
    select.innerHTML = "";
    const ph = document.createElement("option");
    ph.value = "";
    ph.disabled = true;
    ph.selected = true;
    ph.textContent = placeholder;
    select.appendChild(ph);

    items.forEach((it) => {
      const opt = document.createElement("option");
      if (typeof it === "string") {
        opt.value = it;
        opt.textContent = it;
      } else {
        opt.value = it.value;
        opt.textContent = it.label;
      }
      select.appendChild(opt);
    });
  }

  // Lock a select back to a disabled placeholder state.
  function lockSelect(select, placeholder) {
    select.disabled = true;
    select.innerHTML = "";
    const ph = document.createElement("option");
    ph.value = "";
    ph.disabled = true;
    ph.selected = true;
    ph.textContent = placeholder;
    select.appendChild(ph);
    setState(select, "neutral");
  }

  // Visual state per field: neutral | ok | error | disabled
  function setState(select, state, msg) {
    const field = fieldOf(select);
    const help = $(".help", field);
    field.classList.remove("is-ok", "is-error", "is-disabled");
    select.removeAttribute("aria-invalid");

    if (state === "ok") {
      field.classList.add("is-ok");
    } else if (state === "error") {
      field.classList.add("is-error");
      select.setAttribute("aria-invalid", "true");
    } else if (state === "disabled") {
      field.classList.add("is-disabled");
    }

    if (msg !== undefined && help) {
      help.textContent = msg;
    }
  }

  // Sync the disabled visual class with the actual disabled prop.
  function syncDisabledClass(select) {
    fieldOf(select).classList.toggle("is-disabled", select.disabled);
  }

  // Simulate a tiny async populate so the dependency reads as real.
  function populateAsync(select, build) {
    const field = fieldOf(select);
    field.classList.add("is-loading");
    select.disabled = true;
    syncDisabledClass(select);
    setTimeout(() => {
      build();
      field.classList.remove("is-loading");
      select.disabled = false;
      syncDisabledClass(select);
    }, 260);
  }

  /* ──────────────────────────────────────────────────────────
   * Dependency rail (Country → Region → City)
   * ────────────────────────────────────────────────────────── */

  function updateRail() {
    const map = {
      country: !!els.country.value,
      region: !!els.region.value,
      city: !!els.city.value,
    };
    document.querySelectorAll(".rail__step").forEach((step) => {
      const key = step.getAttribute("data-rail");
      step.classList.remove("is-active", "is-done");
      if (map[key]) {
        step.classList.add("is-done");
      } else {
        // The first unfilled step is the active one.
        const order = ["country", "region", "city"];
        const idx = order.indexOf(key);
        const prevDone = order.slice(0, idx).every((k) => map[k]);
        if (prevDone) step.classList.add("is-active");
      }
    });
  }

  /* ──────────────────────────────────────────────────────────
   * Wiring: location cascade
   * ────────────────────────────────────────────────────────── */

  // Seed countries.
  fillOptions(
    els.country,
    Object.keys(GEO).map((code) => ({ value: code, label: GEO[code].label })),
    "Choose a country…"
  );

  els.country.addEventListener("change", () => {
    const code = els.country.value;
    setState(els.country, code ? "ok" : "neutral", "Start here — the rest depends on it.");

    // Reset descendants whenever the parent changes.
    lockSelect(els.region, "Pick a region…");
    lockSelect(els.city, "Pick a region first");
    syncDisabledClass(els.city);
    setState(els.region, "disabled", "Loading regions…");
    setState(els.city, "disabled", "Unlocks once a region is chosen.");
    updateRail();

    if (!code) return;

    const regions = GEO[code].regions;
    populateAsync(els.region, () => {
      fillOptions(
        els.region,
        Object.keys(regions).map((rc) => ({ value: rc, label: regions[rc].label })),
        "Choose a region…"
      );
      setState(
        els.region,
        "neutral",
        Object.keys(regions).length + " regions in " + GEO[code].label + "."
      );
      els.region.focus();
    });
    toast("Loaded regions for " + GEO[code].label + ".");
  });

  els.region.addEventListener("change", () => {
    const cc = els.country.value;
    const rc = els.region.value;
    setState(els.region, rc ? "ok" : "neutral");

    lockSelect(els.city, "Choose a city…");
    setState(els.city, "disabled", "Loading cities…");
    updateRail();

    if (!cc || !rc) return;

    const cities = GEO[cc].regions[rc].cities;
    populateAsync(els.city, () => {
      fillOptions(els.city, cities, "Choose a city…");
      setState(els.city, "neutral", cities.length + " cities available.");
      els.city.focus();
    });
  });

  els.city.addEventListener("change", () => {
    setState(els.city, els.city.value ? "ok" : "neutral");
    updateRail();
  });

  /* ──────────────────────────────────────────────────────────
   * Wiring: category cascade
   * ────────────────────────────────────────────────────────── */

  fillOptions(
    els.category,
    Object.keys(CAT).map((key) => ({ value: key, label: CAT[key].label })),
    "Choose a category…"
  );

  els.category.addEventListener("change", () => {
    const key = els.category.value;
    setState(els.category, key ? "ok" : "neutral", "Sets which subcategories appear.");

    lockSelect(els.subcategory, "Pick a category first");
    setState(els.subcategory, "disabled", "Loading subcategories…");

    if (!key) return;

    const subs = CAT[key].subs;
    populateAsync(els.subcategory, () => {
      fillOptions(els.subcategory, subs, "Choose a subcategory…");
      setState(els.subcategory, "neutral", subs.length + " subcategories in " + CAT[key].label + ".");
      els.subcategory.focus();
    });
  });

  els.subcategory.addEventListener("change", () => {
    setState(els.subcategory, els.subcategory.value ? "ok" : "neutral");
  });

  /* ──────────────────────────────────────────────────────────
   * Submit / validation
   * ────────────────────────────────────────────────────────── */

  const REQUIRED = [
    { el: () => els.country, msg: "Pick a country to continue." },
    { el: () => els.region, msg: "Pick a region." },
    { el: () => els.city, msg: "Pick a city." },
    { el: () => els.category, msg: "Pick a category." },
    { el: () => els.subcategory, msg: "Pick a subcategory." },
  ];

  function validate() {
    let firstInvalid = null;
    REQUIRED.forEach((r) => {
      const sel = r.el();
      if (!sel.value) {
        setState(sel, "error", r.msg);
        if (!firstInvalid) firstInvalid = sel;
      } else {
        setState(sel, "ok");
      }
    });
    return firstInvalid;
  }

  els.form.addEventListener("submit", (e) => {
    e.preventDefault();
    const firstInvalid = validate();

    if (firstInvalid) {
      toast("Fill every menu before confirming.");
      // Focus the field, enabling it first if a parent gap left it locked.
      if (firstInvalid.disabled) {
        const gap = REQUIRED.find((r) => !r.el().disabled && !r.el().value);
        if (gap) gap.el().focus();
      } else {
        firstInvalid.focus();
      }
      return;
    }

    els.submit.classList.add("is-busy");
    setTimeout(() => {
      els.submit.classList.remove("is-busy");
      showDone();
    }, 700);
  });

  function showDone() {
    const cc = els.country.value;
    const rc = els.region.value;
    const rows = [
      ["Country", GEO[cc].label],
      ["Region", GEO[cc].regions[rc].label],
      ["City", els.city.value],
      ["Category", CAT[els.category.value].label],
      ["Subcategory", els.subcategory.value],
    ];

    els.doneSummary.innerHTML = "";
    rows.forEach(([dt, dd]) => {
      const wrap = document.createElement("div");
      const dtEl = document.createElement("dt");
      dtEl.textContent = dt;
      const ddEl = document.createElement("dd");
      ddEl.textContent = dd;
      wrap.append(dtEl, ddEl);
      els.doneSummary.appendChild(wrap);
    });

    els.form.hidden = true;
    els.done.hidden = false;
    els.doneTitle.focus();
    toast("Selection confirmed.");
  }

  els.reset.addEventListener("click", () => {
    els.form.reset();

    fillOptions(
      els.country,
      Object.keys(GEO).map((code) => ({ value: code, label: GEO[code].label })),
      "Choose a country…"
    );
    fillOptions(
      els.category,
      Object.keys(CAT).map((key) => ({ value: key, label: CAT[key].label })),
      "Choose a category…"
    );

    lockSelect(els.region, "Pick a country first");
    lockSelect(els.city, "Pick a region first");
    lockSelect(els.subcategory, "Pick a category first");

    setState(els.country, "neutral", "Start here — the rest depends on it.");
    setState(els.region, "disabled", "Unlocks once a country is chosen.");
    setState(els.city, "disabled", "Unlocks once a region is chosen.");
    setState(els.category, "neutral", "Sets which subcategories appear.");
    setState(els.subcategory, "disabled", "Unlocks once a category is chosen.");

    updateRail();

    els.done.hidden = true;
    els.form.hidden = false;
    els.country.focus();
  });

  /* ── Initial visual state ── */
  syncDisabledClass(els.region);
  syncDisabledClass(els.city);
  syncDisabledClass(els.subcategory);
  setState(els.region, "disabled");
  setState(els.city, "disabled");
  setState(els.subcategory, "disabled");
  updateRail();
})();
