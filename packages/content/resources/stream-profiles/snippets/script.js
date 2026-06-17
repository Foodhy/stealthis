(function () {
  "use strict";

  var GRADIENTS = ["c-1", "c-2", "c-3", "c-4", "c-5"];

  var profiles = [
    { id: "p1", name: "Mara", color: "c-1", kids: false },
    { id: "p2", name: "Devon", color: "c-2", kids: false },
    { id: "p3", name: "Priya", color: "c-3", kids: false },
    { id: "p4", name: "Lil' Cosmos", color: "c-kids", kids: true }
  ];

  var managing = false;

  var grid = document.getElementById("grid");
  var stage = document.getElementById("profiles");
  var stageTitle = document.getElementById("stageTitle");
  var stageSub = document.getElementById("stageSub");
  var manageBtn = document.getElementById("manageBtn");
  var manageLabel = document.getElementById("manageLabel");
  var exitManage = document.getElementById("exitManage");

  var curtain = document.getElementById("curtain");
  var curtainAvatar = document.getElementById("curtainAvatar");
  var curtainName = document.getElementById("curtainName");

  var overlay = document.getElementById("overlay");
  var nameInput = document.getElementById("nameInput");
  var kidsInput = document.getElementById("kidsInput");
  var newAvatar = document.getElementById("newAvatar");
  var confirmAdd = document.getElementById("confirmAdd");
  var cancelAdd = document.getElementById("cancelAdd");

  var toastEl = document.getElementById("toast");
  var toastTimer;

  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-show");
    }, 2400);
  }

  function gradientVar(color) {
    return "var(--" + color + ")";
  }

  function initial(name) {
    return (name.trim()[0] || "?").toUpperCase();
  }

  function nextColor() {
    return GRADIENTS[profiles.length % GRADIENTS.length];
  }

  /* ---------- Render ---------- */
  function render() {
    grid.innerHTML = "";

    profiles.forEach(function (p) {
      var li = document.createElement("li");
      li.className = "profile";
      li.dataset.id = p.id;

      var del = document.createElement("button");
      del.className = "profile__delete";
      del.type = "button";
      del.setAttribute("aria-label", "Delete " + p.name);
      del.innerHTML =
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>';
      del.addEventListener("click", function (e) {
        e.stopPropagation();
        removeProfile(p.id);
      });

      var btn = document.createElement("button");
      btn.className = "profile__btn";
      btn.type = "button";
      btn.setAttribute("aria-label", p.name + (p.kids ? " (kids profile)" : ""));

      var avatar = document.createElement("span");
      avatar.className = "profile__avatar";
      avatar.style.background = gradientVar(p.color);
      avatar.textContent = initial(p.name);

      if (p.kids) {
        var badge = document.createElement("span");
        badge.className = "badge-kids";
        badge.textContent = "Kids";
        avatar.appendChild(badge);
      }

      var edit = document.createElement("span");
      edit.className = "profile__edit";
      edit.innerHTML =
        '<svg viewBox="0 0 24 24" fill="none"><path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>';
      avatar.appendChild(edit);

      btn.appendChild(avatar);

      var nameEl = document.createElement("span");
      nameEl.className = "profile__name";
      nameEl.textContent = p.name;

      btn.addEventListener("click", function () {
        if (managing) {
          renameProfile(p);
        } else {
          selectProfile(p);
        }
      });

      li.appendChild(del);
      li.appendChild(btn);
      li.appendChild(nameEl);
      grid.appendChild(li);
    });

    if (!managing && profiles.length < 6) {
      grid.appendChild(buildAddTile());
    }
  }

  function buildAddTile() {
    var li = document.createElement("li");
    li.className = "profile profile--add";

    var btn = document.createElement("button");
    btn.className = "profile__btn";
    btn.type = "button";
    btn.setAttribute("aria-label", "Add profile");

    var avatar = document.createElement("span");
    avatar.className = "profile__avatar";
    avatar.innerHTML =
      '<svg width="46" height="46" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
    btn.appendChild(avatar);

    var nameEl = document.createElement("span");
    nameEl.className = "profile__name";
    nameEl.textContent = "Add Profile";

    btn.addEventListener("click", openAdd);

    li.appendChild(btn);
    li.appendChild(nameEl);
    return li;
  }

  /* ---------- Select (loading transition) ---------- */
  function selectProfile(p) {
    curtainAvatar.style.background = gradientVar(p.color);
    curtainAvatar.textContent = initial(p.name);
    curtainName.textContent = "Loading " + p.name + "…";
    curtain.classList.add("is-open");
    curtain.setAttribute("aria-hidden", "false");

    setTimeout(function () {
      curtain.classList.remove("is-open");
      curtain.setAttribute("aria-hidden", "true");
      toast("Welcome back, " + p.name + (p.kids ? " — Kids mode on" : ""));
    }, 1700);
  }

  /* ---------- Manage mode ---------- */
  function setManaging(on) {
    managing = on;
    stage.classList.toggle("is-managing", on);
    manageBtn.setAttribute("aria-pressed", String(on));
    manageLabel.textContent = on ? "Editing…" : "Manage Profiles";
    stageTitle.textContent = on ? "Manage Profiles" : "Who's watching?";
    stageSub.textContent = on
      ? "Tap a profile to rename, or remove it"
      : "Select a profile to continue";
    exitManage.hidden = !on;
    render();
  }

  function renameProfile(p) {
    var next = window.prompt("Rename profile", p.name);
    if (next === null) return;
    next = next.trim();
    if (!next) {
      toast("Name can't be empty.");
      return;
    }
    p.name = next.slice(0, 16);
    render();
    toast("Profile renamed to " + p.name + ".");
  }

  function removeProfile(id) {
    if (profiles.length <= 1) {
      toast("You need at least one profile.");
      return;
    }
    var p = profiles.find(function (x) { return x.id === id; });
    if (!window.confirm("Delete " + (p ? p.name : "this profile") + "? This can't be undone.")) {
      return;
    }
    profiles = profiles.filter(function (x) { return x.id !== id; });
    render();
    toast("Profile removed.");
  }

  /* ---------- Add profile modal ---------- */
  function openAdd() {
    nameInput.value = "";
    kidsInput.checked = false;
    paintNewAvatar();
    overlay.hidden = false;
    confirmAdd.disabled = true;
    setTimeout(function () { nameInput.focus(); }, 30);
    document.addEventListener("keydown", onModalKey);
  }

  function closeAdd() {
    overlay.hidden = true;
    document.removeEventListener("keydown", onModalKey);
  }

  function onModalKey(e) {
    if (e.key === "Escape") closeAdd();
  }

  function paintNewAvatar() {
    var color = kidsInput.checked ? "c-kids" : nextColor();
    newAvatar.style.background = gradientVar(color);
    var name = nameInput.value.trim();
    newAvatar.textContent = name ? initial(name) : "?";
    newAvatar.dataset.color = color;
  }

  function commitAdd() {
    var name = nameInput.value.trim();
    if (!name) return;
    profiles.push({
      id: "p" + Date.now(),
      name: name.slice(0, 16),
      color: newAvatar.dataset.color || nextColor(),
      kids: kidsInput.checked
    });
    closeAdd();
    render();
    toast(name + " added to Nebula.");
  }

  /* ---------- Wire up ---------- */
  manageBtn.addEventListener("click", function () { setManaging(!managing); });
  exitManage.addEventListener("click", function () { setManaging(false); });

  nameInput.addEventListener("input", function () {
    confirmAdd.disabled = nameInput.value.trim().length === 0;
    paintNewAvatar();
  });
  kidsInput.addEventListener("change", paintNewAvatar);
  confirmAdd.addEventListener("click", commitAdd);
  cancelAdd.addEventListener("click", closeAdd);
  overlay.addEventListener("click", function (e) {
    if (e.target === overlay) closeAdd();
  });
  nameInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && !confirmAdd.disabled) commitAdd();
  });

  render();
})();
