(function () {
  "use strict";

  var envelope = document.getElementById("envelope");
  var seal = document.getElementById("seal");
  var card = document.getElementById("card");
  var rsvpBtn = document.getElementById("rsvpBtn");
  var closeCardBtn = document.getElementById("closeCardBtn");

  var overlay = document.getElementById("overlay");
  var dialog = document.getElementById("dialog");
  var dialogClose = document.getElementById("dialogClose");
  var dialogCancel = document.getElementById("dialogCancel");
  var form = document.getElementById("rsvpForm");
  var nameInput = document.getElementById("fName");
  var attendDetails = document.getElementById("attendDetails");

  var lastFocused = null;

  /* ---------- Toast helper ---------- */
  var toastRegion = document.getElementById("toastRegion");
  function toast(msg) {
    var el = document.createElement("div");
    el.className = "toast";
    el.textContent = msg;
    toastRegion.appendChild(el);
    setTimeout(function () {
      el.classList.add("out");
      el.addEventListener("animationend", function () {
        if (el.parentNode) el.parentNode.removeChild(el);
      });
    }, 3200);
  }

  /* ---------- Envelope open / close ---------- */
  function openEnvelope() {
    if (envelope.getAttribute("data-open") === "true") return;
    envelope.setAttribute("data-open", "true");
    seal.setAttribute("aria-expanded", "true");
    card.setAttribute("aria-hidden", "false");
    setTimeout(function () { rsvpBtn.focus(); }, 900);
  }

  function closeEnvelope() {
    envelope.setAttribute("data-open", "false");
    seal.setAttribute("aria-expanded", "false");
    card.setAttribute("aria-hidden", "true");
    seal.focus();
    toast("Envelope resealed");
  }

  seal.addEventListener("click", openEnvelope);
  closeCardBtn.addEventListener("click", closeEnvelope);

  /* ---------- Dialog ---------- */
  function getFocusable() {
    return Array.prototype.slice.call(
      dialog.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    );
  }

  function openDialog() {
    lastFocused = document.activeElement;
    overlay.hidden = false;
    document.body.style.overflow = "hidden";
    setTimeout(function () { nameInput.focus(); }, 40);
    document.addEventListener("keydown", onDialogKey);
  }

  function closeDialog() {
    overlay.hidden = true;
    document.body.style.overflow = "";
    document.removeEventListener("keydown", onDialogKey);
    if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
  }

  function onDialogKey(e) {
    if (e.key === "Escape") {
      e.preventDefault();
      closeDialog();
      return;
    }
    if (e.key === "Tab") {
      var f = getFocusable();
      if (!f.length) return;
      var first = f[0];
      var last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  rsvpBtn.addEventListener("click", openDialog);
  dialogClose.addEventListener("click", closeDialog);
  dialogCancel.addEventListener("click", closeDialog);
  overlay.addEventListener("click", function (e) {
    if (e.target === overlay) closeDialog();
  });

  /* ---------- Attendance toggle ---------- */
  form.addEventListener("change", function (e) {
    if (e.target.name === "attend") {
      var attending = form.attend.value === "yes";
      attendDetails.classList.toggle("is-hidden", !attending);
      var controls = attendDetails.querySelectorAll("select");
      controls.forEach(function (c) { c.disabled = !attending; });
    }
  });

  /* ---------- Submit + validation ---------- */
  function setError(name, msg) {
    var el = form.querySelector('.field-error[data-for="' + name + '"]');
    if (el) el.textContent = msg || "";
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var name = nameInput.value.trim();
    if (name.length < 2) {
      setError("name", "Please enter your name so we know who's coming.");
      nameInput.focus();
      return;
    }
    setError("name", "");

    var attending = form.attend.value === "yes";
    var first = name.split(" ")[0];
    closeDialog();

    if (attending) {
      toast(first + ", your seat is saved — see you there!");
    } else {
      toast("Thank you, " + first + ". You'll be missed.");
    }
    form.reset();
    attendDetails.classList.remove("is-hidden");
    attendDetails.querySelectorAll("select").forEach(function (c) { c.disabled = false; });
  });

  nameInput.addEventListener("input", function () {
    if (nameInput.value.trim().length >= 2) setError("name", "");
  });
})();
