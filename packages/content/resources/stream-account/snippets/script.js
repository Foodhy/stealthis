(function () {
  "use strict";

  /* ----------------------------- data ----------------------------- */
  var plans = [
    {
      id: "basic",
      name: "Basic",
      price: 8.99,
      desc: "720p HD · 1 device · with ads",
      features: ["720p HD streaming", "Watch on 1 device", "Limited downloads"],
    },
    {
      id: "standard",
      name: "Standard",
      price: 13.99,
      desc: "1080p Full HD · 2 devices",
      features: ["1080p Full HD", "Watch on 2 devices", "Ad-free · downloads"],
    },
    {
      id: "premium",
      name: "Premium",
      price: 19.99,
      desc: "4K UHD + HDR · 4 devices · spatial audio",
      features: ["Ultra HD (4K) + HDR", "Watch on 4 devices at once", "Spatial audio & downloads"],
    },
  ];

  var devices = [
    { id: "d1", name: "Living Room TV", type: "LG OLED · Lumora app", icon: "📺", here: false, loc: "Madrid, ES · last used 2h ago" },
    { id: "d2", name: "MacBook Pro", type: "Chrome · macOS", icon: "💻", here: true, loc: "Madrid, ES · this device" },
    { id: "d3", name: "iPhone 15", type: "iOS app", icon: "📱", here: false, loc: "Barcelona, ES · last used yesterday" },
    { id: "d4", name: "iPad Air", type: "iOS app", icon: "📱", here: false, loc: "Madrid, ES · last used 4 days ago" },
  ];

  var settings = [
    { id: "autoplay", title: "Autoplay next episode", sub: "Continue playing in a series", on: true },
    { id: "previews", title: "Autoplay previews", sub: "Play trailers while browsing", on: false },
    { id: "hd", title: "Always stream in 4K", sub: "Uses more data on mobile", on: true },
    { id: "spatial", title: "Spatial audio", sub: "Where the device supports it", on: true },
  ];

  var billing = [
    { date: "Jun 3, 2026", desc: "Premium — monthly", method: "Visa •••• 4218", amt: "$19.99", status: "Paid", cls: "paid" },
    { date: "May 3, 2026", desc: "Premium — monthly", method: "Visa •••• 4218", amt: "$19.99", status: "Paid", cls: "paid" },
    { date: "Apr 3, 2026", desc: "Premium — monthly", method: "Visa •••• 4218", amt: "$19.99", status: "Paid", cls: "paid" },
    { date: "Mar 14, 2026", desc: "Service credit — outage", method: "Account balance", amt: "−$4.50", status: "Refunded", cls: "refunded" },
    { date: "Mar 3, 2026", desc: "Premium — monthly", method: "Visa •••• 4218", amt: "$19.99", status: "Paid", cls: "paid" },
  ];

  var currentPlanId = "premium";
  var selectedPlanId = currentPlanId;

  /* ----------------------------- toast ----------------------------- */
  var host = document.getElementById("toast-host");
  window.toast = function (msg) {
    var el = document.createElement("div");
    el.className = "toast";
    el.textContent = msg;
    host.appendChild(el);
    setTimeout(function () {
      el.classList.add("out");
      el.addEventListener("animationend", function () {
        el.remove();
      });
    }, 2600);
  };

  /* ----------------------------- helpers ----------------------------- */
  function $(id) {
    return document.getElementById(id);
  }
  function money(n) {
    return "$" + n.toFixed(2);
  }
  function planById(id) {
    return plans.filter(function (p) {
      return p.id === id;
    })[0];
  }

  /* ----------------------------- render: devices ----------------------------- */
  function renderDevices() {
    var ul = $("devices");
    ul.innerHTML = "";
    devices.forEach(function (d) {
      var li = document.createElement("li");
      li.className = "device";
      li.dataset.id = d.id;
      li.innerHTML =
        '<span class="dev-ic" aria-hidden="true">' + d.icon + "</span>" +
        '<span class="dev-meta">' +
        '<span class="dev-name">' + d.name +
        (d.here ? ' <span class="tag-this">This device</span>' : "") +
        "</span>" +
        '<span class="dev-sub">' + d.type + " · " + d.loc + "</span>" +
        "</span>";
      var btn = document.createElement("button");
      btn.className = "dev-remove";
      btn.type = "button";
      if (d.here) {
        btn.disabled = true;
        btn.textContent = "In use";
      } else {
        btn.textContent = "Remove";
        btn.setAttribute("aria-label", "Remove " + d.name);
        btn.addEventListener("click", function () {
          removeDevice(d.id, li);
        });
      }
      li.appendChild(btn);
      ul.appendChild(li);
    });
    updateDeviceCount();
  }

  function removeDevice(id, li) {
    li.classList.add("removing");
    setTimeout(function () {
      devices = devices.filter(function (d) {
        return d.id !== id;
      });
      renderDevices();
      window.toast("Device removed and signed out");
    }, 280);
  }

  function updateDeviceCount() {
    $("device-count").textContent = devices.length + " active";
  }

  /* ----------------------------- render: settings ----------------------------- */
  function renderSettings() {
    var ul = $("settings");
    ul.innerHTML = "";
    settings.forEach(function (s) {
      var li = document.createElement("li");
      li.className = "setting";
      var sw = document.createElement("button");
      sw.className = "switch";
      sw.type = "button";
      sw.setAttribute("role", "switch");
      sw.setAttribute("aria-checked", String(s.on));
      sw.setAttribute("aria-label", s.title);
      sw.addEventListener("click", function () {
        s.on = !s.on;
        sw.setAttribute("aria-checked", String(s.on));
        window.toast(s.title + (s.on ? " turned on" : " turned off"));
      });
      li.innerHTML =
        '<span class="set-text"><span class="set-title">' + s.title +
        '</span><span class="set-sub">' + s.sub + "</span></span>";
      li.appendChild(sw);
      ul.appendChild(li);
    });
  }

  /* ----------------------------- render: billing ----------------------------- */
  function renderBilling() {
    var tb = $("billing");
    tb.innerHTML = "";
    billing.forEach(function (b) {
      var tr = document.createElement("tr");
      tr.innerHTML =
        "<td>" + b.date + "</td>" +
        "<td>" + b.desc + "</td>" +
        "<td>" + b.method + "</td>" +
        '<td class="num">' + b.amt + "</td>" +
        '<td><span class="pay-status ' + b.cls + '">' + b.status + "</span></td>";
      tb.appendChild(tr);
    });
  }

  /* ----------------------------- render: current plan ----------------------------- */
  function renderCurrentPlan() {
    var p = planById(currentPlanId);
    $("plan-name").textContent = p.name;
    $("plan-price").textContent = money(p.price);
    var fl = $("plan-features");
    fl.innerHTML = "";
    p.features.forEach(function (f) {
      var li = document.createElement("li");
      li.textContent = f;
      fl.appendChild(li);
    });
    $("next-bill").textContent = money(p.price) + " on Jul 3, 2026";
  }

  /* ----------------------------- plan modal ----------------------------- */
  function renderPlanOptions() {
    var box = $("plan-options");
    box.innerHTML = "";
    plans.forEach(function (p) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "opt";
      btn.dataset.id = p.id;
      btn.setAttribute("aria-pressed", String(p.id === selectedPlanId));
      var right =
        p.id === currentPlanId
          ? '<span class="opt-current">Current</span>'
          : '<span class="opt-price">' + money(p.price) + "<small>/month</small></span>";
      btn.innerHTML =
        '<span class="opt-radio" aria-hidden="true"></span>' +
        '<span class="opt-info"><span class="opt-name">' + p.name +
        '</span><span class="opt-desc">' + p.desc + "</span></span>" +
        right;
      btn.addEventListener("click", function () {
        selectedPlanId = p.id;
        renderPlanOptions();
      });
      box.appendChild(btn);
    });
  }

  /* ----------------------------- modal plumbing ----------------------------- */
  var lastFocused = null;

  function openModal(which) {
    var m = which === "plan" ? $("modal-plan") : $("modal-cancel");
    lastFocused = document.activeElement;
    if (which === "plan") {
      selectedPlanId = currentPlanId;
      renderPlanOptions();
    }
    m.hidden = false;
    var focusable = m.querySelector("button:not([disabled])");
    if (focusable) focusable.focus();
    document.addEventListener("keydown", onKey);
  }

  function closeModal() {
    ["modal-plan", "modal-cancel"].forEach(function (id) {
      $(id).hidden = true;
    });
    document.removeEventListener("keydown", onKey);
    if (lastFocused) lastFocused.focus();
  }

  function onKey(e) {
    if (e.key === "Escape") closeModal();
  }

  document.querySelectorAll("[data-open]").forEach(function (b) {
    b.addEventListener("click", function () {
      openModal(b.dataset.open);
    });
  });
  document.querySelectorAll("[data-close]").forEach(function (b) {
    b.addEventListener("click", closeModal);
  });
  document.querySelectorAll(".modal").forEach(function (m) {
    m.addEventListener("click", function (e) {
      if (e.target === m) closeModal();
    });
  });

  $("confirm-plan").addEventListener("click", function () {
    if (selectedPlanId === currentPlanId) {
      window.toast("That's already your current plan");
      closeModal();
      return;
    }
    var p = planById(selectedPlanId);
    currentPlanId = selectedPlanId;
    renderCurrentPlan();
    closeModal();
    window.toast("Switched to " + p.name + " — effective Jul 3");
  });

  $("confirm-cancel").addEventListener("click", function () {
    closeModal();
    window.toast("Membership set to cancel on Jul 3, 2026");
    var pill = document.querySelector(".status-pill");
    pill.style.background = "rgba(245,166,35,0.14)";
    pill.style.borderColor = "rgba(245,166,35,0.4)";
    pill.style.color = "#ffce82";
    pill.childNodes[2].textContent = " Ending Jul 3";
    pill.querySelector(".dot").style.background = "#f5a623";
    pill.querySelector(".dot").style.boxShadow = "0 0 10px #f5a623";
  });

  /* ----------------------------- nav fade on scroll ----------------------------- */
  var nav = $("topnav");
  window.addEventListener(
    "scroll",
    function () {
      nav.style.boxShadow = window.scrollY > 8 ? "0 6px 24px rgba(0,0,0,0.5)" : "none";
    },
    { passive: true }
  );

  /* ----------------------------- init ----------------------------- */
  renderCurrentPlan();
  renderDevices();
  renderSettings();
  renderBilling();
})();
