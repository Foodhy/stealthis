/* DIY — Project Detail interactions (vanilla JS) */
(() => {
  "use strict";

  /* ---------- toast helper ---------- */
  const toastRegion = document.querySelector(".toast-region");
  function toast(msg) {
    const el = document.createElement("div");
    el.className = "toast";
    el.textContent = msg;
    toastRegion.appendChild(el);
    requestAnimationFrame(() => el.classList.add("show"));
    setTimeout(() => {
      el.classList.remove("show");
      el.addEventListener("transitionend", () => el.remove(), { once: true });
      setTimeout(() => el.remove(), 500); // fallback
    }, 2600);
  }

  /* generic [data-toast] buttons */
  document.querySelectorAll("[data-toast]").forEach((btn) => {
    btn.addEventListener("click", () => toast(btn.dataset.toast));
  });

  /* ---------- materials checklist progress ---------- */
  const matBoxes = Array.from(
    document.querySelectorAll("[data-checklist] input[type=checkbox]")
  );
  const matProgress = document.querySelector("[data-mat-progress]");
  function updateProgress() {
    const done = matBoxes.filter((b) => b.checked).length;
    matProgress.textContent = `${done} / ${matBoxes.length} gathered`;
    matProgress.classList.toggle("is-done", done === matBoxes.length);
    if (done === matBoxes.length) {
      toast("Everything gathered — time to make some sawdust!");
    }
  }
  matBoxes.forEach((b) => b.addEventListener("change", updateProgress));
  updateProgress();

  /* ---------- smooth expand/collapse for <details> steps ---------- */
  document.querySelectorAll("details.step").forEach((step) => {
    const summary = step.querySelector("summary");
    const body = step.querySelector(".step-body");
    let animating = false;

    summary.addEventListener("click", (e) => {
      e.preventDefault();
      if (animating) return;
      step.hasAttribute("open") ? collapse() : expand();
    });

    function expand() {
      animating = true;
      step.setAttribute("open", "");
      const h = body.scrollHeight;
      body.style.height = "0px";
      body.style.opacity = "0";
      requestAnimationFrame(() => {
        body.style.transition = "height 0.3s ease, opacity 0.3s ease";
        body.style.height = h + "px";
        body.style.opacity = "1";
      });
      body.addEventListener("transitionend", function done(ev) {
        if (ev.propertyName !== "height") return;
        body.style.transition = body.style.height = body.style.opacity = "";
        body.removeEventListener("transitionend", done);
        animating = false;
      });
    }

    function collapse() {
      animating = true;
      body.style.height = body.scrollHeight + "px";
      body.style.opacity = "1";
      requestAnimationFrame(() => {
        body.style.transition = "height 0.28s ease, opacity 0.28s ease";
        body.style.height = "0px";
        body.style.opacity = "0";
      });
      body.addEventListener("transitionend", function done(ev) {
        if (ev.propertyName !== "height") return;
        step.removeAttribute("open");
        body.style.transition = body.style.height = body.style.opacity = "";
        body.removeEventListener("transitionend", done);
        animating = false;
      });
    }
  });

  /* ---------- favorite (persisted to localStorage) ---------- */
  const FAV_KEY = "stealthis:diy-project-detail:fav";
  const favBtn = document.querySelector("[data-fav]");
  const favLabel = document.querySelector("[data-fav-label]");
  const favCount = document.querySelector("[data-fav-count]");
  const BASE_FAVS = 9312;

  function renderFav(on, announce) {
    favBtn.setAttribute("aria-pressed", String(on));
    favLabel.textContent = on ? "Favorited" : "Favorite";
    favCount.textContent = (BASE_FAVS + (on ? 1 : 0)).toLocaleString("en-US");
    if (announce) {
      favBtn.classList.remove("pop");
      void favBtn.offsetWidth; // restart animation
      favBtn.classList.add("pop");
      toast(on ? "Added to your favorites" : "Removed from favorites");
    }
  }

  let favOn = false;
  try {
    favOn = localStorage.getItem(FAV_KEY) === "1";
  } catch (_) {
    /* storage unavailable (sandboxed iframe) — degrade gracefully */
  }
  renderFav(favOn, false);

  favBtn.addEventListener("click", () => {
    favOn = !favOn;
    try {
      favOn
        ? localStorage.setItem(FAV_KEY, "1")
        : localStorage.removeItem(FAV_KEY);
    } catch (_) {}
    renderFav(favOn, true);
  });

  /* ---------- follow button ---------- */
  const followBtn = document.querySelector("[data-follow]");
  followBtn.addEventListener("click", () => {
    const on = followBtn.classList.toggle("is-following");
    followBtn.textContent = on ? "Following" : "Follow";
    toast(on ? "Now following TinkerRosa" : "Unfollowed TinkerRosa");
  });

  /* ---------- comment replies + likes ---------- */
  document.querySelectorAll("[data-reply]").forEach((btn) => {
    btn.addEventListener("click", () =>
      toast(`Replying to ${btn.dataset.reply} — editor coming right up (demo)`)
    );
  });

  document.querySelectorAll("[data-like]").forEach((btn) => {
    const n = btn.querySelector("[data-like-n]");
    btn.addEventListener("click", () => {
      const liked = btn.classList.toggle("is-liked");
      n.textContent = String(parseInt(n.textContent, 10) + (liked ? 1 : -1));
    });
  });

  /* ---------- comment form ---------- */
  const cmtForm = document.querySelector("[data-cmt-form]");
  const cmtInput = cmtForm.querySelector("input");
  cmtForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = cmtInput.value.trim();
    if (!text) {
      toast("Write something first — even a quick question helps!");
      cmtInput.focus();
      return;
    }
    cmtInput.value = "";
    toast("Comment posted — thanks for joining the build thread!");
  });
})();
