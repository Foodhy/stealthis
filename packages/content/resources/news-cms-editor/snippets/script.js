(function () {
  "use strict";

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  /* ---------- Toast helper ---------- */
  var toastEl = $("#toast");
  var toastTimer = null;
  function toast(msg, kind) {
    toastEl.textContent = msg;
    toastEl.className = "toast is-show" + (kind ? " toast--" + kind : "");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.className = "toast" + (kind ? " toast--" + kind : "");
    }, 2600);
  }

  /* ---------- Elements ---------- */
  var body = $("#articleBody");
  var headline = $("#headlineInput");
  var deck = $("#deckInput");
  var byline = $("#bylineInput");
  var slugInput = $("#slugInput");
  var saveDot = $("#saveDot");
  var saveLabel = $("#saveLabel");

  /* ---------- Dirty / save state ---------- */
  var dirty = false;
  function markDirty() {
    if (dirty) return;
    dirty = true;
    saveDot.className = "dot dot--dirty";
    saveLabel.textContent = "Unsaved changes";
  }
  function markSaved() {
    dirty = false;
    saveDot.className = "dot dot--saved";
    saveLabel.textContent = "All changes saved";
  }

  /* ---------- Word count & read time ---------- */
  var wordCountEl = $("#wordCount");
  var readTimeEl = $("#readTime");
  var charCountEl = $("#charCount");
  var readTimeMeta = $("#readTimeMeta");

  function plainText(el) {
    return (el.innerText || el.textContent || "").replace(/ /g, " ");
  }

  function updateStats() {
    var text = (plainText(headline) + " " + plainText(deck) + " " + plainText(body)).trim();
    var words = text.length ? text.split(/\s+/).filter(Boolean).length : 0;
    var chars = plainText(body).length;
    var minutes = Math.max(1, Math.round(words / 220));
    wordCountEl.textContent = words.toLocaleString();
    charCountEl.textContent = chars.toLocaleString();
    readTimeEl.textContent = minutes + " min";
    readTimeMeta.textContent = minutes + " min read";
  }

  /* ---------- Kicker / dateline echoes ---------- */
  var sectionSelect = $("#sectionSelect");
  var kickerEcho = $("#kickerEcho");
  var datelineEcho = $("#datelineEcho");

  function syncKicker() {
    kickerEcho.textContent = sectionSelect.value + " · The Meridian Dispatch";
  }
  sectionSelect.addEventListener("change", function () {
    syncKicker();
    markDirty();
  });

  /* ---------- Slugify ---------- */
  function slugify(s) {
    return s.toLowerCase()
      .replace(/['"’]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60);
  }
  $("#slugSync").addEventListener("click", function () {
    slugInput.value = slugify(plainText(headline)) || "untitled-story";
    markDirty();
    toast("Slug synced from headline", "ok");
  });
  slugInput.addEventListener("input", markDirty);

  /* ---------- Toolbar formatting ---------- */
  var toolbar = $("#toolbar");

  function focusBody() {
    if (document.activeElement !== body && !body.contains(document.activeElement)) {
      body.focus();
    }
  }

  function exec(cmd, value) {
    focusBody();
    try { document.execCommand(cmd, false, value || null); } catch (e) {}
    markDirty();
    updateStats();
    updateToolbarState();
  }

  $$(".tbtn[data-cmd]").forEach(function (btn) {
    btn.addEventListener("mousedown", function (e) { e.preventDefault(); });
    btn.addEventListener("click", function () {
      var cmd = btn.getAttribute("data-cmd");
      var val = btn.getAttribute("data-value");
      if (cmd === "formatBlock") {
        exec("formatBlock", val);
      } else {
        exec(cmd);
      }
    });
  });

  function updateToolbarState() {
    try {
      $$(".tbtn[data-cmd='bold']").forEach(function (b) {
        b.classList.toggle("is-active", document.queryCommandState("bold"));
      });
      $$(".tbtn[data-cmd='italic']").forEach(function (b) {
        b.classList.toggle("is-active", document.queryCommandState("italic"));
      });
    } catch (e) {}
  }
  document.addEventListener("selectionchange", function () {
    if (body.contains(document.getSelection().anchorNode)) updateToolbarState();
  });

  /* ---------- Link insert ---------- */
  $("#linkBtn").addEventListener("mousedown", function (e) { e.preventDefault(); });
  $("#linkBtn").addEventListener("click", function () {
    focusBody();
    var sel = document.getSelection();
    var hasText = sel && sel.toString().length > 0;
    var url = window.prompt("Link URL", "https://");
    if (!url) return;
    if (hasText) {
      exec("createLink", url);
    } else {
      var label = window.prompt("Link text", url) || url;
      document.execCommand("insertHTML", false,
        '<a href="' + escapeAttr(url) + '">' + escapeHtml(label) + "</a>");
      markDirty();
      updateStats();
    }
    toast("Link inserted", "ok");
  });

  /* ---------- Figure insert ---------- */
  var coverTreatments = ["", "press-photo--t2", "press-photo--t3"];
  var figCounter = 0;
  $("#figureBtn").addEventListener("mousedown", function (e) { e.preventDefault(); });
  $("#figureBtn").addEventListener("click", function () {
    focusBody();
    var cap = window.prompt("Figure caption", "Front Street after the January king tide.");
    if (cap === null) return;
    var treat = coverTreatments[figCounter % coverTreatments.length];
    figCounter++;
    var html =
      '<figure contenteditable="false">' +
        '<span class="press-photo ' + treat + '"></span>' +
        '<figcaption><em>' + escapeHtml(cap || "Untitled figure.") +
          '</em> <span class="credit">Meridian Dispatch / Picture Desk</span></figcaption>' +
      '</figure><p><br></p>';
    document.execCommand("insertHTML", false, html);
    markDirty();
    updateStats();
    toast("Figure inserted", "ok");
  });

  function escapeHtml(s) {
    return String(s).replace(/[&<>]/g, function (c) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c];
    });
  }
  function escapeAttr(s) {
    return escapeHtml(s).replace(/"/g, "&quot;");
  }

  /* ---------- Status chips ---------- */
  var statusNotes = {
    draft: "A draft is visible only to the newsroom.",
    review: "Sent to the desk editor for review before publication.",
    scheduled: "Queued to go live automatically at the scheduled time.",
    published: "Live on the wire and visible to all readers."
  };
  var statusNote = $("#statusNote");
  $$(".status-chip").forEach(function (chip) {
    chip.addEventListener("click", function () {
      $$(".status-chip").forEach(function (c) {
        c.classList.remove("is-active");
        c.setAttribute("aria-checked", "false");
      });
      chip.classList.add("is-active");
      chip.setAttribute("aria-checked", "true");
      var st = chip.getAttribute("data-status");
      statusNote.textContent = statusNotes[st] || "";
      markDirty();
      toast("Status set to " + chip.textContent.trim(), st === "published" ? "ok" : "accent");
    });
  });

  /* ---------- Tags ---------- */
  var tagList = $("#tagList");
  function bindTagRemove(btn) {
    btn.addEventListener("click", function () {
      btn.parentNode.remove();
      markDirty();
    });
  }
  $$("#tagList .tag button").forEach(bindTagRemove);

  $("#tagForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var input = $("#tagInput");
    var raw = input.value.trim().toLowerCase().replace(/[^a-z0-9\- ]/g, "");
    if (!raw) return;
    var exists = $$("#tagList .tag").some(function (t) {
      return t.textContent.replace("×", "").trim() === raw;
    });
    if (exists) { toast("Tag already added", "accent"); input.value = ""; return; }
    var span = document.createElement("span");
    span.className = "tag";
    span.innerHTML = escapeHtml(raw) +
      ' <button type="button" aria-label="Remove ' + escapeAttr(raw) + '">×</button>';
    tagList.appendChild(span);
    bindTagRemove(span.querySelector("button"));
    input.value = "";
    markDirty();
  });

  /* ---------- Cover treatment cycle ---------- */
  var coverArt = $("#coverArt");
  var coverIdx = 0;
  $("#coverBtn").addEventListener("click", function () {
    coverIdx = (coverIdx + 1) % coverTreatments.length;
    coverArt.className = "press-photo press-photo--cover " + coverTreatments[coverIdx];
    markDirty();
    toast("Cover treatment updated");
  });
  $("#coverCaption").addEventListener("input", markDirty);

  /* ---------- Preview toggle ---------- */
  var previewToggle = $("#previewToggle");
  var reader = $("#reader");
  var previewing = false;

  function buildPreview() {
    $("#rdKicker").textContent = sectionSelect.value;
    $("#rdHeadline").textContent = plainText(headline);
    $("#rdDeck").textContent = plainText(deck);
    $("#rdByline").textContent = "By " + plainText(byline);
    $("#rdDateline").textContent = datelineEcho.textContent;
    $("#rdReadtime").textContent = readTimeMeta.textContent;
    $("#rdCoverCap").textContent = $("#coverCaption").value;
    $("#rdHero").className = "press-photo press-photo--hero " + coverTreatments[coverIdx];
    $("#rdBody").innerHTML = body.innerHTML;
  }

  function setPreview(on) {
    previewing = on;
    document.body.classList.toggle("is-preview", on);
    reader.hidden = !on;
    previewToggle.setAttribute("aria-pressed", String(on));
    previewToggle.lastChild.textContent = on ? " Edit" : " Preview";
    if (on) {
      buildPreview();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }
  previewToggle.addEventListener("click", function () { setPreview(!previewing); });

  /* ---------- Save / publish ---------- */
  $("#saveDraft").addEventListener("click", function () {
    markSaved();
    toast("Draft saved · " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), "ok");
  });
  $("#publishBtn").addEventListener("click", function () {
    var pub = $(".status-chip[data-status='published']");
    $$(".status-chip").forEach(function (c) {
      c.classList.remove("is-active"); c.setAttribute("aria-checked", "false");
    });
    pub.classList.add("is-active");
    pub.setAttribute("aria-checked", "true");
    statusNote.textContent = statusNotes.published;
    markSaved();
    toast("Published to the wire — “" + plainText(headline).slice(0, 42) + "…”", "ok");
  });

  /* ---------- Keyboard shortcuts ---------- */
  document.addEventListener("keydown", function (e) {
    var mod = e.metaKey || e.ctrlKey;
    if (mod && e.key.toLowerCase() === "s") {
      e.preventDefault();
      $("#saveDraft").click();
    }
    if (mod && e.key.toLowerCase() === "b" && body.contains(document.activeElement)) {
      updateToolbarState();
      markDirty();
    }
  });

  /* ---------- Wire up dirty + stats on editing ---------- */
  [headline, deck, byline, body].forEach(function (el) {
    el.addEventListener("input", function () { markDirty(); updateStats(); });
  });
  body.addEventListener("keyup", updateToolbarState);
  body.addEventListener("mouseup", updateToolbarState);

  /* ---------- Init ---------- */
  syncKicker();
  updateStats();
  markSaved();
})();
