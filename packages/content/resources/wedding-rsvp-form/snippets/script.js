(function () {
  "use strict";

  /* ---- Fictional guest list ---- */
  var GUESTS = [
    { name: "Eleanor Whitfield", party: "The Whitfield Family", seats: 2 },
    { name: "Marcus Bell", party: "Mr. Marcus Bell", seats: 1 },
    { name: "Priya Anand", party: "Priya & Guest", seats: 2 },
    { name: "Daniel & Sofia Reyes", party: "The Reyes Family", seats: 2 },
    { name: "Harriet Osei", party: "Harriet Osei", seats: 1 }
  ];

  var state = {
    guest: null,
    attend: null,
    meal: null,
    plusOne: false,
    songs: [],
    diet: []
  };
  var replies = 47; // running fictional count

  /* ---- Helpers ---- */
  function $(id) { return document.getElementById(id); }
  function norm(s) { return (s || "").trim().toLowerCase().replace(/\s+/g, " "); }

  var toastEl = $("toast");
  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 2600);
  }

  function updateSubmit() {
    var ok = state.attend === "no" || (state.attend === "yes" && !!state.meal);
    $("submitBtn").disabled = !ok;
  }

  /* ---- Lookup ---- */
  $("lookupForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var q = norm($("lookupName").value);
    var empty = $("lookupEmpty");
    if (!q) { $("lookupName").focus(); return; }

    var match = GUESTS.find(function (g) {
      var n = norm(g.name);
      return n === q || n.indexOf(q) !== -1 || q.indexOf(n.split(" ")[0]) === 0;
    });

    if (!match) {
      empty.hidden = false;
      return;
    }
    empty.hidden = true;
    state.guest = match;

    $("greeting").innerHTML =
      '<span class="g-name">Welcome, ' + match.name + "</span>" +
      '<span class="g-sub">' + match.party + " &middot; " +
      match.seats + (match.seats > 1 ? " seats reserved" : " seat reserved") + "</span>";

    // plus-one availability
    var plusBlock = $("plusOneBlock");
    if (match.seats > 1) {
      plusBlock.style.display = "";
      $("allowBadge").textContent = (match.seats - 1) + " extra seat";
    } else {
      plusBlock.style.display = "none";
    }

    $("lookupStep").hidden = true;
    $("responseForm").hidden = false;
    toast("Invitation found — welcome " + match.name.split(" ")[0] + "!");
    $("responseForm").scrollIntoView({ behavior: "smooth", block: "start" });
  });

  /* ---- Attend toggle ---- */
  document.querySelectorAll(".pill-toggle").forEach(function (btn) {
    btn.addEventListener("click", function () {
      state.attend = btn.dataset.attend;
      document.querySelectorAll(".pill-toggle").forEach(function (b) {
        b.setAttribute("aria-checked", b === btn ? "true" : "false");
      });
      var attending = state.attend === "yes";
      $("details").hidden = !attending;
      $("declineNote").hidden = attending;
      $("submitBtn").textContent = attending ? "Send RSVP" : "Send Regrets";
      updateSubmit();
    });
  });

  /* ---- Meal choice ---- */
  document.querySelectorAll(".meal").forEach(function (btn) {
    btn.addEventListener("click", function () {
      state.meal = btn.dataset.meal;
      document.querySelectorAll(".meal").forEach(function (b) {
        b.setAttribute("aria-checked", b === btn ? "true" : "false");
      });
      updateSubmit();
    });
  });

  /* ---- Plus one ---- */
  $("plusOneToggle").addEventListener("change", function () {
    state.plusOne = this.checked;
    $("plusFields").hidden = !this.checked;
  });

  /* ---- Songs ---- */
  function addSong() {
    var input = $("songInput");
    var val = input.value.trim();
    if (!val) { input.focus(); return; }
    if (state.songs.length >= 5) { toast("Five songs is plenty — thank you!"); return; }
    state.songs.push(val);
    input.value = "";
    renderSongs();
    toast("Added to the dance-floor wishlist");
  }
  function renderSongs() {
    var ul = $("songList");
    ul.innerHTML = "";
    state.songs.forEach(function (s, i) {
      var li = document.createElement("li");
      li.innerHTML = '<span class="note">♪</span><span style="margin-right:auto">' +
        s + '</span><button type="button" aria-label="Remove ' + s + '">&times;</button>';
      li.querySelector("button").addEventListener("click", function () {
        state.songs.splice(i, 1);
        renderSongs();
      });
      ul.appendChild(li);
    });
  }
  $("addSong").addEventListener("click", addSong);
  $("songInput").addEventListener("keydown", function (e) {
    if (e.key === "Enter") { e.preventDefault(); addSong(); }
  });

  /* ---- Dietary ---- */
  document.querySelectorAll(".diet").forEach(function (btn) {
    btn.setAttribute("aria-pressed", "false");
    btn.addEventListener("click", function () {
      var on = btn.getAttribute("aria-pressed") === "true";
      btn.setAttribute("aria-pressed", on ? "false" : "true");
      var d = btn.dataset.diet;
      if (on) { state.diet = state.diet.filter(function (x) { return x !== d; }); }
      else { state.diet.push(d); }
    });
  });

  /* ---- Submit ---- */
  $("responseForm").addEventListener("submit", function (e) {
    e.preventDefault();
    if ($("submitBtn").disabled) return;

    var attending = state.attend === "yes";
    var g = state.guest;

    $("confirmSub").innerHTML = attending
      ? "We can’t wait to celebrate with you, " + g.name.split(" ")[0] +
        ". Your response has been noted below."
      : "We’ll miss you, " + g.name.split(" ")[0] +
        ", but thank you for letting us know. Sending love.";

    var rows = [["Guest", g.name]];
    rows.push(["Attending", attending ? "Joyfully accepts ♥" : "Regretfully declines"]);

    if (attending) {
      rows.push(["Entrée", state.meal || "—"]);
      if (state.plusOne) {
        var pn = $("plusName").value.trim() || "Guest";
        var pm = $("plusMeal").value || "—";
        rows.push(["Plus-one", pn + " &middot; " + pm]);
      }
      if (state.songs.length) {
        rows.push(["Song requests",
          state.songs.map(function (s) { return '<span class="tag">' + s + "</span>"; }).join("")]);
      }
      if (state.diet.length) {
        rows.push(["Dietary",
          state.diet.map(function (d) { return '<span class="tag">' + d + "</span>"; }).join("")]);
      }
      var note = $("dietNote").value.trim();
      if (note) rows.push(["Notes", note]);
    } else {
      var wish = $("wishNote").value.trim();
      if (wish) rows.push(["Message", wish]);
    }

    var dl = $("summary");
    dl.innerHTML = "";
    rows.forEach(function (r) {
      var dt = document.createElement("dt"); dt.textContent = r[0];
      var dd = document.createElement("dd"); dd.innerHTML = r[1];
      dl.appendChild(dt); dl.appendChild(dd);
    });

    replies += 1;
    $("confirmCount").textContent = replies + " guests have responded so far.";

    $("responseForm").hidden = true;
    $("lookupStep").hidden = true;
    $("confirm").hidden = false;
    $("confirm").scrollIntoView({ behavior: "smooth", block: "start" });
    toast(attending ? "RSVP sent — see you there!" : "Regrets sent — thank you");
  });

  /* ---- Edit / restart ---- */
  $("editAnswer").addEventListener("click", function () {
    $("confirm").hidden = true;
    $("responseForm").hidden = false;
    $("responseForm").scrollIntoView({ behavior: "smooth", block: "start" });
  });

  function reset() {
    state = { guest: null, attend: null, meal: null, plusOne: false, songs: [], diet: [] };
    $("responseForm").reset();
    document.querySelectorAll(".pill-toggle").forEach(function (b) { b.setAttribute("aria-checked", "false"); });
    document.querySelectorAll(".meal").forEach(function (b) { b.setAttribute("aria-checked", "false"); });
    document.querySelectorAll(".diet").forEach(function (b) { b.setAttribute("aria-pressed", "false"); });
    $("details").hidden = true;
    $("declineNote").hidden = true;
    $("plusFields").hidden = true;
    renderSongs();
    updateSubmit();
    $("confirm").hidden = true;
    $("responseForm").hidden = true;
    $("lookupStep").hidden = false;
    $("lookupName").value = "";
    $("lookupName").focus();
  }
  $("startOver").addEventListener("click", reset);

  updateSubmit();
})();
