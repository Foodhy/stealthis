/* Aurora DB docs — version + language switcher
   Accessible custom dropdowns, outdated-version banner, language demo string. */
(function () {
  "use strict";

  const LATEST = "v3.2";

  /* ───────── toast helper ───────── */
  const toastEl = document.getElementById("toast");
  let toastTimer = null;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.hidden = false;
    requestAnimationFrame(() => toastEl.classList.add("show"));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.classList.remove("show");
      setTimeout(() => (toastEl.hidden = true), 240);
    }, 2200);
  }

  /* ───────── generic accessible dropdown ───────── */
  function Dropdown(rootId, btnId, menuId, onSelect) {
    const root = document.getElementById(rootId);
    const btn = document.getElementById(btnId);
    const menu = document.getElementById(menuId);
    if (!root || !btn || !menu) return null;

    const opts = () => Array.from(menu.querySelectorAll('[role="option"]'));
    let activeIndex = -1;

    function setActive(i) {
      const list = opts();
      if (!list.length) return;
      activeIndex = (i + list.length) % list.length;
      list.forEach((o, idx) => {
        const on = idx === activeIndex;
        o.classList.toggle("is-active", on);
        if (on) {
          o.focus();
          o.scrollIntoView({ block: "nearest" });
        }
      });
    }

    function isOpen() {
      return btn.getAttribute("aria-expanded") === "true";
    }

    function open() {
      if (isOpen()) return;
      closeAll(root);
      btn.setAttribute("aria-expanded", "true");
      menu.hidden = false;
      const sel = opts().findIndex((o) => o.getAttribute("aria-selected") === "true");
      setActive(sel >= 0 ? sel : 0);
    }

    function close(focusBtn) {
      if (!isOpen()) return;
      btn.setAttribute("aria-expanded", "false");
      menu.hidden = true;
      opts().forEach((o) => o.classList.remove("is-active"));
      activeIndex = -1;
      if (focusBtn) btn.focus();
    }

    function choose(opt) {
      opts().forEach((o) => {
        o.classList.remove("is-selected");
        o.setAttribute("aria-selected", "false");
      });
      opt.classList.add("is-selected");
      opt.setAttribute("aria-selected", "true");
      onSelect(opt);
      close(true);
    }

    btn.addEventListener("click", () => (isOpen() ? close(true) : open()));

    btn.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        open();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        open();
        setActive(opts().length - 1);
      }
    });

    menu.addEventListener("keydown", (e) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setActive(activeIndex + 1);
          break;
        case "ArrowUp":
          e.preventDefault();
          setActive(activeIndex - 1);
          break;
        case "Home":
          e.preventDefault();
          setActive(0);
          break;
        case "End":
          e.preventDefault();
          setActive(opts().length - 1);
          break;
        case "Enter":
        case " ":
          e.preventDefault();
          if (activeIndex >= 0) choose(opts()[activeIndex]);
          break;
        case "Escape":
          e.preventDefault();
          close(true);
          break;
        case "Tab":
          close(false);
          break;
      }
    });

    menu.addEventListener("click", (e) => {
      const opt = e.target.closest('[role="option"]');
      if (opt) choose(opt);
    });

    menu.addEventListener("mousemove", (e) => {
      const opt = e.target.closest('[role="option"]');
      if (!opt) return;
      const i = opts().indexOf(opt);
      if (i !== activeIndex) {
        activeIndex = i;
        opts().forEach((o, idx) => o.classList.toggle("is-active", idx === i));
      }
    });

    return { root, close };
  }

  const dropdowns = [];
  function closeAll(except) {
    dropdowns.forEach((d) => {
      if (d && d.root !== except) d.close(false);
    });
  }

  /* ───────── version switcher ───────── */
  const versionValue = document.getElementById("versionValue");
  const versionBadge = document.getElementById("versionBadge");
  const banner = document.getElementById("outdatedBanner");
  const bannerVersion = document.getElementById("bannerVersion");

  function applyBadge(el, type) {
    el.classList.remove("badge-latest", "badge-eol");
    if (type === "latest") {
      el.textContent = "latest";
      el.classList.add("badge-latest");
      el.hidden = false;
    } else if (type === "eol") {
      el.textContent = "EOL";
      el.classList.add("badge-eol");
      el.hidden = false;
    } else {
      el.hidden = true;
    }
  }

  function selectVersion(opt) {
    const v = opt.dataset.value;
    const badge = opt.dataset.badge || "";
    versionValue.textContent = v;
    applyBadge(versionBadge, badge);

    if (v === LATEST) {
      banner.hidden = true;
      toast("Now viewing " + v + " (latest)");
    } else {
      bannerVersion.textContent = v;
      banner.hidden = false;
      toast("Switched to " + v + (badge === "eol" ? " — end of life" : ""));
    }
  }

  const versionDd = Dropdown("versionSwitcher", "versionBtn", "versionMenu", selectVersion);
  dropdowns.push(versionDd);

  /* ───────── language switcher ───────── */
  const langValue = document.getElementById("langValue");
  const updatedString = document.getElementById("updatedString");
  const LANG_NAMES = { en: "English", es: "Español", ja: "日本語", de: "Deutsch", pt: "Português" };

  function selectLanguage(opt) {
    const code = opt.dataset.value;
    langValue.textContent = LANG_NAMES[code] || opt.querySelector(".opt-main").textContent;
    updatedString.textContent = opt.dataset.string;
    document.documentElement.lang = code;
    toast("Language: " + langValue.textContent);
  }

  const langDd = Dropdown("langSwitcher", "langBtn", "langMenu", selectLanguage);
  dropdowns.push(langDd);

  /* close on outside click */
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".switcher")) closeAll(null);
  });

  /* banner controls */
  const bannerClose = document.getElementById("bannerClose");
  if (bannerClose) {
    bannerClose.addEventListener("click", () => {
      banner.hidden = true;
      toast("Notice dismissed");
    });
  }
  const bannerLatest = document.getElementById("bannerLatest");
  if (bannerLatest) {
    bannerLatest.addEventListener("click", (e) => {
      e.preventDefault();
      const latestOpt = document.querySelector('#versionMenu [data-value="' + LATEST + '"]');
      if (latestOpt) latestOpt.click();
    });
  }

  /* ───────── mobile sidebar drawer ───────── */
  const navToggle = document.getElementById("navToggle");
  const scrim = document.getElementById("scrim");
  function setNav(open) {
    document.body.classList.toggle("nav-open", open);
    navToggle.setAttribute("aria-expanded", String(open));
    if (open) scrim.hidden = false;
    else setTimeout(() => (scrim.hidden = true), 220);
  }
  if (navToggle) {
    navToggle.addEventListener("click", () => setNav(!document.body.classList.contains("nav-open")));
  }
  if (scrim) scrim.addEventListener("click", () => setNav(false));
  document.querySelectorAll(".sidebar a").forEach((a) =>
    a.addEventListener("click", () => {
      if (window.matchMedia("(max-width: 820px)").matches) setNav(false);
    })
  );
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && document.body.classList.contains("nav-open")) setNav(false);
  });
})();
