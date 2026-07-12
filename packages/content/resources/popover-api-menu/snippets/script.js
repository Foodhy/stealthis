// Native Popover API Menu — zero positioning libraries.
// Everything visible is a real [popover]; JS only wires ARIA state,
// an event log, and progressive-enhancement feature detection.

(function () {
  "use strict";

  const $ = (sel, ctx = document) => ctx.querySelector(sel);

  const accountBtn = $("#account-btn");
  const accountMenu = $("#account-menu");
  const hintBtn = $("#hint-btn");
  const hintTip = $("#key-tip");
  const logEl = $("#log");
  const toastEl = $("#toast");
  const supportEl = $("#support");

  /* ---------------------------------------------------------------
   * 1. Feature detection — surface what the browser supports.
   * ------------------------------------------------------------- */
  const hasPopover =
    typeof HTMLElement !== "undefined" &&
    HTMLElement.prototype.hasOwnProperty("popover");
  const hasAnchor =
    typeof CSS !== "undefined" &&
    CSS.supports &&
    CSS.supports("anchor-name: --x");
  const hasTopLayerAnim = CSS && CSS.supports && CSS.supports("overlay: auto");

  function chip(label, ok) {
    const el = document.createElement("span");
    el.className = "support__chip " + (ok ? "is-ok" : "is-no");
    el.textContent = (ok ? "" : "no ") + label;
    return el;
  }
  supportEl.append(
    chip("Popover API", hasPopover),
    chip("CSS Anchor Positioning", hasAnchor),
    chip("overlay transitions", hasTopLayerAnim)
  );

  // Graceful fallback: if the Popover API is missing, the [popover]
  // elements would stay visible in normal flow. Hide them and route
  // triggers through a lightweight toggle so the demo still functions.
  if (!hasPopover) {
    document.querySelectorAll("[popover]").forEach((el) => {
      el.setAttribute("data-fallback", "");
      el.style.display = "none";
      el.style.position = "absolute";
    });
    wireFallback();
  }

  /* ---------------------------------------------------------------
   * 2. Event log helper.
   * ------------------------------------------------------------- */
  function now() {
    return new Date().toLocaleTimeString([], {
      hour12: false,
      minute: "2-digit",
      second: "2-digit",
    });
  }
  let firstLog = true;
  function log(name, state) {
    if (firstLog) {
      logEl.innerHTML = "";
      firstLog = false;
    }
    const row = document.createElement("div");
    row.className = "log__row";
    const cls = state === "open" ? "on" : "off";
    row.innerHTML =
      '<span class="t">' + now() + "</span> " +
      '<span class="e">' + name + "</span> → " +
      '<span class="' + cls + '">' + state + "</span>";
    logEl.prepend(row);
    while (logEl.children.length > 30) logEl.lastChild.remove();
  }

  /* ---------------------------------------------------------------
   * 3. Dropdown menu — keep aria-expanded in sync with toggle event.
   * ------------------------------------------------------------- */
  if (hasPopover) {
    accountMenu.addEventListener("toggle", (e) => {
      const open = e.newState === "open";
      accountBtn.setAttribute("aria-expanded", String(open));
      log("menu", e.newState);
      if (open) {
        // move focus to first item for keyboard users
        const first = accountMenu.querySelector(".menu__item");
        if (first) requestAnimationFrame(() => first.focus());
      }
    });

    // Arrow-key roving focus inside the menu.
    accountMenu.addEventListener("keydown", (e) => {
      const items = [...accountMenu.querySelectorAll(".menu__item")];
      const idx = items.indexOf(document.activeElement);
      if (e.key === "ArrowDown") {
        e.preventDefault();
        items[(idx + 1) % items.length].focus();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        items[(idx - 1 + items.length) % items.length].focus();
      } else if (e.key === "Home") {
        e.preventDefault();
        items[0].focus();
      } else if (e.key === "End") {
        e.preventDefault();
        items[items.length - 1].focus();
      }
    });

    accountMenu.querySelectorAll(".menu__item").forEach((item) => {
      item.addEventListener("click", () => {
        const label = item.textContent.trim().split("\n")[0].trim();
        accountMenu.hidePopover();
        toast(item.id === "signout" ? "Signed out" : label + " opened");
      });
    });

    /* -------------------------------------------------------------
     * 4. Tooltip — imperative show/hide on hover + focus.
     * ----------------------------------------------------------- */
    hintTip.addEventListener("toggle", (e) => log("tooltip", e.newState));

    const showTip = () => {
      try { hintTip.showPopover(); } catch (_) {}
    };
    const hideTip = () => {
      try { hintTip.hidePopover(); } catch (_) {}
    };
    hintBtn.addEventListener("mouseenter", showTip);
    hintBtn.addEventListener("mouseleave", hideTip);
    hintBtn.addEventListener("focus", showTip);
    hintBtn.addEventListener("blur", hideTip);

    /* -------------------------------------------------------------
     * 5. Dialog logging + confirm toast.
     * ----------------------------------------------------------- */
    const dialog = $("#confirm-dialog");
    dialog.addEventListener("toggle", (e) => log("dialog", e.newState));
    $("#confirm-delete").addEventListener("click", () =>
      toast("Workspace deleted")
    );

    /* -------------------------------------------------------------
     * 6. Imperative control toolbar.
     * ----------------------------------------------------------- */
    document.querySelectorAll("[data-act]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const act = btn.dataset.act;
        try {
          if (act === "show") accountMenu.showPopover();
          else if (act === "hide") accountMenu.hidePopover();
          else accountMenu.togglePopover();
        } catch (err) {
          // showPopover throws if already shown — harmless here.
        }
      });
    });
  }

  /* ---------------------------------------------------------------
   * 7. Toast notification.
   * ------------------------------------------------------------- */
  let toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("is-show"), 2200);
  }

  /* ---------------------------------------------------------------
   * 8. Minimal fallback for browsers without the Popover API.
   * ------------------------------------------------------------- */
  function wireFallback() {
    document.querySelectorAll("[popovertarget]").forEach((trigger) => {
      trigger.addEventListener("click", () => {
        const target = document.getElementById(
          trigger.getAttribute("popovertarget")
        );
        if (!target) return;
        const action = trigger.getAttribute("popovertargetaction");
        const showing = target.style.display === "block";
        const next =
          action === "show" ? true : action === "hide" ? false : !showing;
        target.style.display = next ? "block" : "none";
      });
    });
    // Escape closes auto-style fallbacks.
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        document
          .querySelectorAll('[popover="auto"][data-fallback]')
          .forEach((el) => (el.style.display = "none"));
      }
    });
  }
})();
