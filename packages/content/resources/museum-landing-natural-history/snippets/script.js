(function () {
  "use strict";

  /* ---------- Toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-visible");
    }, 2600);
  }

  /* ---------- Today's hours panel ---------- */
  var hoursBtn = document.getElementById("hoursBtn");
  var hoursPanel = document.getElementById("hoursPanel");
  if (hoursBtn && hoursPanel) {
    hoursBtn.addEventListener("click", function () {
      var open = hoursPanel.hasAttribute("hidden");
      if (open) {
        hoursPanel.removeAttribute("hidden");
      } else {
        hoursPanel.setAttribute("hidden", "");
      }
      hoursBtn.setAttribute("aria-expanded", String(open));
    });
  }

  /* ---------- Mobile menu ---------- */
  var menuToggle = document.getElementById("menuToggle");
  var mobileNav = document.getElementById("mobileNav");
  if (menuToggle && mobileNav) {
    menuToggle.addEventListener("click", function () {
      var open = mobileNav.hasAttribute("hidden");
      if (open) {
        mobileNav.removeAttribute("hidden");
      } else {
        mobileNav.setAttribute("hidden", "");
      }
      menuToggle.setAttribute("aria-expanded", String(open));
    });
    mobileNav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        mobileNav.setAttribute("hidden", "");
        menuToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------- Hall filtering ---------- */
  var chips = Array.prototype.slice.call(document.querySelectorAll(".chip"));
  var halls = Array.prototype.slice.call(document.querySelectorAll(".hall"));
  var emptyMsg = document.getElementById("hallsEmpty");

  function applyFilter(filter) {
    var visible = 0;
    halls.forEach(function (hall) {
      var match = filter === "all" || hall.getAttribute("data-cat") === filter;
      hall.classList.toggle("is-hidden", !match);
      if (match) visible++;
    });
    if (emptyMsg) emptyMsg.toggleAttribute("hidden", visible !== 0);
  }

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      chips.forEach(function (c) {
        c.classList.remove("is-active");
        c.setAttribute("aria-selected", "false");
      });
      chip.classList.add("is-active");
      chip.setAttribute("aria-selected", "true");
      applyFilter(chip.getAttribute("data-filter"));
    });
  });

  /* ---------- Visit planner ---------- */
  var plannerSelect = document.getElementById("plannerSelect");
  var plannerAdd = document.getElementById("plannerAdd");
  var plannerList = document.getElementById("plannerList");
  var plannerEmpty = document.getElementById("plannerEmpty");
  var plannerTotal = document.getElementById("plannerTotal");
  var route = [];

  function decode(s) {
    var t = document.createElement("textarea");
    t.innerHTML = s;
    return t.value;
  }

  function renderPlanner() {
    // clear except empty placeholder
    Array.prototype.slice.call(plannerList.querySelectorAll(".planner__item")).forEach(function (el) {
      el.remove();
    });

    var total = 0;
    route.forEach(function (item, idx) {
      total += item.min;
      var li = document.createElement("li");
      li.className = "planner__item";
      var name = document.createElement("span");
      name.textContent = decode(item.name);
      var min = document.createElement("span");
      min.className = "min";
      min.textContent = item.min + " min";
      var rm = document.createElement("button");
      rm.className = "planner__remove";
      rm.type = "button";
      rm.setAttribute("aria-label", "Remove " + decode(item.name));
      rm.innerHTML = "&times;";
      rm.addEventListener("click", function () {
        route.splice(idx, 1);
        renderPlanner();
        toast("Removed from your route.");
      });
      li.appendChild(name);
      li.appendChild(min);
      li.appendChild(rm);
      plannerList.appendChild(li);
    });

    plannerEmpty.style.display = route.length ? "none" : "";
    plannerTotal.textContent = total + " min";
  }

  if (plannerAdd && plannerSelect) {
    plannerAdd.addEventListener("click", function () {
      var opt = plannerSelect.options[plannerSelect.selectedIndex];
      if (!opt || !opt.value) {
        toast("Choose a hall to add first.");
        return;
      }
      if (route.some(function (r) { return r.name === opt.value; })) {
        toast("That hall is already on your route.");
        return;
      }
      route.push({ name: opt.value, min: parseInt(opt.getAttribute("data-min"), 10) || 0 });
      renderPlanner();
      toast("Added " + decode(opt.value) + " to your route.");
      plannerSelect.selectedIndex = 0;
    });
  }

  /* ---------- Program reservations ---------- */
  Array.prototype.slice.call(document.querySelectorAll("[data-prog]")).forEach(function (btn) {
    btn.addEventListener("click", function () {
      toast("Reserved a spot for “" + btn.getAttribute("data-prog") + "”. Check your email.");
      btn.textContent = "Reserved ✓";
      btn.disabled = true;
      btn.classList.remove("btn--outline");
      btn.classList.add("btn--solid");
    });
  });

  /* ---------- Ticket form ---------- */
  var ticketForm = document.getElementById("ticketForm");
  if (ticketForm) {
    // default date = today
    var tDate = document.getElementById("tDate");
    if (tDate) {
      var now = new Date();
      tDate.value = now.toISOString().slice(0, 10);
      tDate.min = now.toISOString().slice(0, 10);
    }
    ticketForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var date = ticketForm.date.value;
      var slot = ticketForm.slot.value;
      var adults = parseInt(ticketForm.adults.value, 10) || 0;
      var children = parseInt(ticketForm.children.value, 10) || 0;
      if (!date || !slot) {
        toast("Pick a date and an entry slot.");
        return;
      }
      if (adults + children === 0) {
        toast("Add at least one visitor.");
        return;
      }
      toast("Reserved " + (adults + children) + " ticket(s) for " + slot + ". See you soon!");
      ticketForm.reset();
      if (tDate) tDate.value = new Date().toISOString().slice(0, 10);
    });
  }

  /* ---------- Newsletter ---------- */
  var newsForm = document.getElementById("newsForm");
  if (newsForm) {
    newsForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var email = document.getElementById("newsEmail");
      if (!email.value || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.value)) {
        toast("Enter a valid email address.");
        return;
      }
      toast("You're on the list — thanks for joining!");
      newsForm.reset();
    });
  }

  /* ---------- Header tickets tracking nicety ---------- */
  Array.prototype.slice.call(document.querySelectorAll("[data-track]")).forEach(function (el) {
    el.addEventListener("click", function () {
      // smooth scroll handled by CSS; nothing to do, just a hook
    });
  });
})();
