/* FIXWELL Answers — thread interactions (vanilla JS, no dependencies) */
(function () {
  "use strict";

  /* ---------- toast helper ---------- */
  var host = document.getElementById("toasts");
  function toast(msg) {
    if (!host) return;
    var el = document.createElement("div");
    el.className = "toast";
    el.textContent = msg;
    host.appendChild(el);
    setTimeout(function () {
      el.classList.add("out");
      setTimeout(function () { el.remove(); }, 260);
    }, 2200);
  }

  document.querySelectorAll("[data-toast]").forEach(function (b) {
    b.addEventListener("click", function () { toast(b.getAttribute("data-toast")); });
  });

  /* ---------- vote controls ---------- */
  function wireVote(box) {
    var up = box.querySelector(".v-up");
    var down = box.querySelector(".v-down");
    var out = box.querySelector(".v-count");
    var base = parseInt(box.getAttribute("data-count"), 10) || 0;
    var state = 0; // -1, 0, 1

    function render() {
      var n = base + state;
      out.textContent = n;
      out.classList.remove("bump");
      void out.offsetWidth;
      out.classList.add("bump");
      up.setAttribute("aria-pressed", state === 1 ? "true" : "false");
      down.setAttribute("aria-pressed", state === -1 ? "true" : "false");
      var card = box.closest(".answer");
      if (card) card.setAttribute("data-score", String(n));
    }
    up.addEventListener("click", function () {
      state = state === 1 ? 0 : 1;
      render();
      toast(state === 1 ? "Upvote recorded." : "Vote removed.");
    });
    down.addEventListener("click", function () {
      state = state === -1 ? 0 : -1;
      render();
      toast(state === -1 ? "Downvote recorded." : "Vote removed.");
    });
  }
  document.querySelectorAll("[data-vote]").forEach(wireVote);

  /* ---------- helpful / not helpful ---------- */
  document.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-helpful]");
    if (!btn) return;
    var group = btn.parentElement;
    var num = btn.querySelector("b");
    var dir = btn.getAttribute("data-helpful");
    var active = btn.classList.contains("on") || btn.classList.contains("on-down");

    group.querySelectorAll("[data-helpful]").forEach(function (o) {
      if (o !== btn && (o.classList.contains("on") || o.classList.contains("on-down"))) {
        var n = o.querySelector("b");
        n.textContent = Math.max(0, parseInt(n.textContent, 10) - 1);
        o.classList.remove("on", "on-down");
      }
    });

    if (active) {
      btn.classList.remove("on", "on-down");
      num.textContent = Math.max(0, parseInt(num.textContent, 10) - 1);
    } else {
      btn.classList.add(dir === "up" ? "on" : "on-down");
      num.textContent = parseInt(num.textContent, 10) + 1;
      toast(dir === "up" ? "Marked as helpful." : "Feedback noted.");
    }
  });

  /* ---------- comment sub-threads ---------- */
  document.addEventListener("click", function (e) {
    var t = e.target.closest(".toggle-comments");
    if (!t) return;
    var panel = document.getElementById(t.getAttribute("aria-controls"));
    if (!panel) return;
    var open = t.getAttribute("aria-expanded") === "true";
    t.setAttribute("aria-expanded", open ? "false" : "true");
    panel.hidden = open;
  });

  /* ---------- sort tabs with FLIP reflow ---------- */
  var list = document.getElementById("answers");
  var tabs = Array.prototype.slice.call(document.querySelectorAll(".tab"));

  function sortBy(mode) {
    var items = Array.prototype.slice.call(list.children);
    // record start positions
    var first = new Map();
    items.forEach(function (el) { first.set(el, el.getBoundingClientRect().top); });

    items.sort(function (a, b) {
      if (mode === "helpful") {
        var d = (+b.dataset.score) - (+a.dataset.score);
        if (d !== 0) return d;
        return (+b.dataset.time) - (+a.dataset.time);
      }
      if (mode === "newest") return (+b.dataset.time) - (+a.dataset.time);
      return (+a.dataset.time) - (+b.dataset.time);
    });
    items.forEach(function (el) { list.appendChild(el); });

    // invert + play
    items.forEach(function (el) {
      var delta = first.get(el) - el.getBoundingClientRect().top;
      if (!delta) return;
      el.style.transition = "none";
      el.style.transform = "translateY(" + delta + "px)";
      requestAnimationFrame(function () {
        el.style.transition = "transform .42s cubic-bezier(.2,.75,.3,1)";
        el.style.transform = "";
      });
    });
  }

  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      tabs.forEach(function (o) { o.classList.remove("on"); o.setAttribute("aria-selected", "false"); });
      tab.classList.add("on");
      tab.setAttribute("aria-selected", "true");
      sortBy(tab.getAttribute("data-sort"));
    });
  });

  /* ---------- composer ---------- */
  var ta = document.getElementById("answer-input");
  var counter = document.querySelector("[data-counter]");
  var postBtn = document.getElementById("post-answer");
  var MAX = 1200;

  function sync() {
    var n = ta.value.length;
    counter.textContent = n + " / " + MAX;
    counter.classList.toggle("warn", n > MAX - 120);
    postBtn.disabled = ta.value.trim().length < 12;
  }
  ta.addEventListener("input", sync);
  sync();

  function wrapSelection(before, after, linePrefix) {
    var s = ta.selectionStart, e = ta.selectionEnd;
    var sel = ta.value.slice(s, e);
    var replacement;
    if (linePrefix) {
      var body = sel || "first step";
      replacement = body.split("\n").map(function (l) { return linePrefix + l; }).join("\n");
    } else {
      replacement = before + (sel || "text") + after;
    }
    ta.setRangeText(replacement, s, e, "end");
    ta.focus();
    sync();
  }

  document.querySelectorAll("[data-fmt]").forEach(function (b) {
    b.addEventListener("click", function () {
      var f = b.getAttribute("data-fmt");
      if (f === "bold") wrapSelection("**", "**");
      else if (f === "code") wrapSelection("`", "`");
      else wrapSelection("", "", "- ");
    });
  });

  /* ---------- optimistic post ---------- */
  var countEl = document.querySelector("[data-answer-count]");

  function esc(s) {
    return s.replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function renderBody(text) {
    return esc(text)
      .split(/\n{2,}/)
      .map(function (block) {
        var lines = block.split("\n");
        if (lines.every(function (l) { return /^\s*-\s+/.test(l); })) {
          return "<ul>" + lines.map(function (l) { return "<li>" + l.replace(/^\s*-\s+/, "") + "</li>"; }).join("") + "</ul>";
        }
        var html = block
          .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
          .replace(/`([^`]+)`/g, "<code>$1</code>")
          .replace(/\n/g, "<br>");
        return "<p>" + html + "</p>";
      })
      .join("");
  }

  postBtn.addEventListener("click", function () {
    var text = ta.value.trim();
    if (text.length < 12) return;
    var now = Date.now();

    var art = document.createElement("article");
    art.className = "card answer enter";
    art.setAttribute("data-score", "1");
    art.setAttribute("data-time", String(now));
    art.innerHTML =
      '<div class="a-grid">' +
        '<div class="vote" data-vote data-count="1" aria-label="Answer score">' +
          '<button class="v-up" type="button" aria-label="Upvote answer" aria-pressed="false"><svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true"><path d="M10 4.5 17 13H3z" fill="currentColor"/></svg></button>' +
          '<span class="v-count">1</span>' +
          '<button class="v-down" type="button" aria-label="Downvote answer" aria-pressed="false"><svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true"><path d="M10 15.5 3 7h14z" fill="currentColor"/></svg></button>' +
        "</div>" +
        '<div class="a-body">' +
          '<div class="meta"><span class="avatar avatar-me" aria-hidden="true">MV</span>' +
          '<a href="#" class="author">marek_v</a>' +
          '<span class="badge badge-bronze">● 640 rep</span>' +
          '<span class="badge badge-flat">Posting…</span>' +
          '<span class="sep" aria-hidden="true">·</span><time>just now</time></div>' +
          '<div class="prose">' + renderBody(text) + "</div>" +
          '<div class="a-foot"><div class="helpful">' +
            '<button class="hbtn" type="button" data-helpful="up">Helpful <b>0</b></button>' +
            '<button class="hbtn" type="button" data-helpful="down">Not helpful <b>0</b></button>' +
          "</div></div>" +
        "</div>" +
      "</div>";

    list.insertBefore(art, list.firstElementChild);
    wireVote(art.querySelector("[data-vote]"));
    countEl.textContent = list.children.length;
    ta.value = "";
    sync();
    art.scrollIntoView({ behavior: "smooth", block: "center" });
    toast("Answer posted — pending community review.");

    setTimeout(function () {
      var pending = art.querySelector(".badge-flat");
      if (pending) { pending.textContent = "New answer"; }
    }, 1600);
  });
})();
