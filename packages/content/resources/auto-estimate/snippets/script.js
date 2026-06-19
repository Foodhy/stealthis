(function () {
  "use strict";

  var TAX_RATE = 0.0825;
  var SUPPLY_RATE = 0.04; // shop supplies = 4% of parts subtotal, capped
  var SUPPLY_CAP = 35;

  // Each line: labor + parts. Recommended lines default approved; optional default off.
  var LINES = [
    {
      id: "L1", title: "Cylinder 1 misfire — ignition coil & spark plug set",
      sub: "Replace failed coil-on-plug, full plug set (6), clear codes, road test.",
      dtc: "P0301", kind: "rec", labor: 168.0, parts: 214.5,
      laborHrs: 1.4, state: "approved", optional: false
    },
    {
      id: "L2", title: "Front brake pads & rotors",
      sub: "Pads at 2mm. Resurface not advised — replace rotors, lubricate hardware.",
      dtc: null, kind: "rec", labor: 132.0, parts: 286.0,
      laborHrs: 1.1, state: "pending", optional: false
    },
    {
      id: "L3", title: "Lean condition diagnosis — intake & MAF",
      sub: "Clean MAF sensor, smoke-test intake boots for vacuum leak.",
      dtc: "P0171", kind: "rec", labor: 96.0, parts: 28.0,
      laborHrs: 0.8, state: "pending", optional: false
    },
    {
      id: "L4", title: "Synthetic oil & filter change",
      sub: "6.0 qt 5W-30 full synthetic, OEM filter, reset oil life.",
      dtc: null, kind: "opt", labor: 24.0, parts: 62.0,
      laborHrs: 0.3, state: "approved", optional: true, enabled: true
    },
    {
      id: "L5", title: "Cabin & engine air filter set",
      sub: "Both filters restricted. Recommended at this mileage.",
      dtc: null, kind: "opt", labor: 18.0, parts: 44.0,
      laborHrs: 0.2, state: "pending", optional: true, enabled: false
    },
    {
      id: "L6", title: "Four-wheel alignment",
      sub: "Slight inner-edge tire wear. Set toe/camber to spec.",
      dtc: null, kind: "opt", labor: 110.0, parts: 0.0,
      laborHrs: 1.0, state: "pending", optional: true, enabled: false
    }
  ];

  var signed = false;

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var fmt = function (n) {
    return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  var toastEl = $("#toast");
  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 2200);
  }

  // A line is "active" (counts toward total) when approved AND (not optional or enabled).
  function isActive(l) {
    if (l.optional && !l.enabled) return false;
    return l.state === "approved";
  }
  function isCounted(l) {
    // Optional-off lines are excluded from the work scope entirely.
    return !(l.optional && !l.enabled);
  }

  function render() {
    var list = $("#lineList");
    list.innerHTML = "";

    LINES.forEach(function (l) {
      var li = document.createElement("li");
      li.className = "line";
      if (l.state === "approved") li.classList.add("is-approved");
      if (l.state === "declined") li.classList.add("declined");
      if (l.optional && !l.enabled) li.classList.add("optional-off");

      var lineTotal = l.labor + l.parts;

      var optToggle = "";
      if (l.optional) {
        optToggle =
          '<div class="opt-toggle">' +
            '<label class="switch">' +
              '<input type="checkbox" data-toggle="' + l.id + '" ' + (l.enabled ? "checked" : "") +
                ' aria-label="Include ' + l.title + '" />' +
              '<span class="track"></span>' +
            '</label>' +
            '<span class="switch-lbl">' + (l.enabled ? "Included" : "Not included") + '</span>' +
          '</div>';
      }

      var dtcTag = l.dtc ? '<span class="tag dtc">DTC ' + l.dtc + '</span>' : "";
      var kindTag = l.kind === "rec"
        ? '<span class="tag rec">Recommended</span>'
        : '<span class="tag opt">Optional</span>';

      var disabled = (l.optional && !l.enabled);

      li.innerHTML =
        '<span class="line-flag" aria-hidden="true"></span>' +
        '<div class="line-body">' +
          '<div class="line-title">' + l.title + '</div>' +
          '<div class="line-sub">' + l.sub + '</div>' +
          '<div class="line-meta">' +
            kindTag + dtcTag +
            '<span class="tag">' + l.laborHrs.toFixed(1) + ' hr labor</span>' +
            '<span class="tag">' + fmt(l.parts) + ' parts</span>' +
          '</div>' +
        '</div>' +
        '<div class="line-right">' +
          optToggle +
          '<div class="line-price">' + fmt(lineTotal) + '<small>labor ' + fmt(l.labor) + '</small></div>' +
          '<div class="actions">' +
            '<button class="btn btn-approve' + (l.state === "approved" ? " is-on" : "") + '" ' +
              'data-act="approve" data-id="' + l.id + '"' + (disabled ? " disabled" : "") +
              ' aria-pressed="' + (l.state === "approved") + '">Approve</button>' +
            '<button class="btn btn-decline' + (l.state === "declined" ? " is-on" : "") + '" ' +
              'data-act="decline" data-id="' + l.id + '"' + (disabled ? " disabled" : "") +
              ' aria-pressed="' + (l.state === "declined") + '">Decline</button>' +
          '</div>' +
        '</div>';

      list.appendChild(li);
    });

    recompute();
  }

  function recompute() {
    var labor = 0, parts = 0, approvedCount = 0, declinedCount = 0, pendingCount = 0;

    LINES.forEach(function (l) {
      if (!isCounted(l)) return; // optional-off excluded from scope counts
      if (l.state === "approved") approvedCount++;
      else if (l.state === "declined") declinedCount++;
      else pendingCount++;

      if (isActive(l)) { labor += l.labor; parts += l.parts; }
    });

    var subtotal = labor + parts;
    var supplies = Math.min(parts * SUPPLY_RATE, SUPPLY_CAP);
    supplies = subtotal > 0 ? supplies : 0;
    var taxable = subtotal + supplies;
    var tax = taxable * TAX_RATE;
    var total = taxable + tax;

    $("#sumLabor").textContent = fmt(labor);
    $("#sumParts").textContent = fmt(parts);
    $("#sumSub").textContent = fmt(subtotal);
    $("#sumSupplies").textContent = fmt(supplies);
    $("#sumTax").textContent = fmt(tax);
    $("#sumTotal").textContent = fmt(total);

    $("#cntApproved").textContent = approvedCount;
    $("#cntDeclined").textContent = declinedCount;
    $("#cntPending").textContent = pendingCount;

    updateSignState(pendingCount, approvedCount);
  }

  function updateSignState(pending, approved) {
    var agree = $("#agree");
    var btn = $("#signBtn");
    if (signed) return;
    // Can authorize once nothing is pending and at least one job approved.
    var ready = pending === 0 && approved > 0 && agree.checked;
    btn.disabled = !ready;
    if (pending > 0) {
      btn.textContent = "Resolve " + pending + " pending job" + (pending === 1 ? "" : "s");
    } else if (approved === 0) {
      btn.textContent = "Approve at least one job";
    } else {
      btn.textContent = "Sign & approve estimate";
    }
  }

  function getLine(id) {
    for (var i = 0; i < LINES.length; i++) if (LINES[i].id === id) return LINES[i];
    return null;
  }

  // Event delegation on the list
  $("#lineList").addEventListener("click", function (e) {
    var btn = e.target.closest("button[data-act]");
    if (!btn || btn.disabled || signed) return;
    var l = getLine(btn.dataset.id);
    if (!l) return;
    var act = btn.dataset.act;
    if (act === "approve") {
      l.state = l.state === "approved" ? "pending" : "approved";
      toast(l.state === "approved" ? "Approved: " + shortName(l) : "Set to pending");
    } else {
      l.state = l.state === "declined" ? "pending" : "declined";
      toast(l.state === "declined" ? "Declined: " + shortName(l) : "Set to pending");
    }
    render();
  });

  $("#lineList").addEventListener("change", function (e) {
    var t = e.target.closest("input[data-toggle]");
    if (!t || signed) return;
    var l = getLine(t.dataset.toggle);
    if (!l) return;
    l.enabled = t.checked;
    toast(l.enabled ? "Added: " + shortName(l) : "Removed: " + shortName(l));
    render();
  });

  function shortName(l) {
    return l.title.split("—")[0].split(" & ")[0].trim();
  }

  $("#agree").addEventListener("change", recompute);

  $("#signBtn").addEventListener("click", function () {
    if (signed) return;
    signed = true;
    var now = new Date();
    $("#signoff").hidden = true;
    var signedBox = $("#signed");
    signedBox.hidden = false;
    $("#signedMeta").textContent =
      "Marcus Delgado · " +
      now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) +
      " " + now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

    var chip = $("#statusChip");
    chip.textContent = "Authorized";
    chip.classList.remove("chip-ok");
    chip.classList.add("chip-signed");

    // Lock all controls
    document.querySelectorAll("#lineList button, #lineList input").forEach(function (el) {
      el.disabled = true;
    });
    toast("Estimate authorized — work order opened");
  });

  render();
})();
