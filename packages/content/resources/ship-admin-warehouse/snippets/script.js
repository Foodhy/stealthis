(function () {
  "use strict";

  /* ---------- data (fictional) ---------- */
  var lists = [
    {
      id: "PL-2291",
      order: "Order #88204",
      sub: "Wave 3 · Priority · Carrier cutoff 14:30",
      priority: "priority",
      done: false,
      picks: [
        { sku: "TRL-0042", name: "Trail Runner Sock 3-pack", bin: "B-12-A", qty: 2, route: [30, 150] },
        { sku: "HYD-0118", name: "Hydro Flask 32oz Slate", bin: "B-12-C", qty: 1, route: [90, 150] },
        { sku: "LMP-0905", name: "Folding Camp Lantern", bin: "B-07-B", qty: 1, route: [90, 60] },
        { sku: "TNT-2210", name: "2-Person Ridge Tent", bin: "B-04-A", qty: 1, route: [180, 60] },
        { sku: "GLV-0331", name: "Insulated Work Gloves L", bin: "B-09-D", qty: 3, route: [180, 120] },
        { sku: "BTL-0077", name: "Stainless Bottle 18oz", bin: "B-15-A", qty: 2, route: [260, 120] },
        { sku: "MAP-0451", name: "Topo Trail Map Set", bin: "B-21-C", qty: 1, route: [260, 30] },
        { sku: "BAR-1290", name: "Oat Energy Bar Box", bin: "B-22-A", qty: 4, route: [260, 30] }
      ]
    },
    {
      id: "PL-2294",
      order: "Order #88219",
      sub: "Wave 3 · Standard · Carrier cutoff 16:00",
      priority: "standard",
      done: false,
      picks: []
    },
    {
      id: "PL-2298",
      order: "Order #88231",
      sub: "Wave 4 · Standard · Carrier cutoff 16:00",
      priority: "standard",
      done: false,
      picks: []
    }
  ];

  var inventory = [
    { sku: "TRL-0042", name: "Trail Runner Sock 3-pack", bin: "B-12-A", qty: 142, reorder: 60 },
    { sku: "HYD-0118", name: "Hydro Flask 32oz Slate", bin: "B-12-C", qty: 38, reorder: 40 },
    { sku: "LMP-0905", name: "Folding Camp Lantern", bin: "B-07-B", qty: 9, reorder: 25 },
    { sku: "TNT-2210", name: "2-Person Ridge Tent", bin: "B-04-A", qty: 71, reorder: 30 },
    { sku: "GLV-0331", name: "Insulated Work Gloves L", bin: "B-09-D", qty: 0, reorder: 50 },
    { sku: "BTL-0077", name: "Stainless Bottle 18oz", bin: "B-15-A", qty: 88, reorder: 45 },
    { sku: "MAP-0451", name: "Topo Trail Map Set", bin: "B-21-C", qty: 210, reorder: 80 },
    { sku: "BAR-1290", name: "Oat Energy Bar Box", bin: "B-22-A", qty: 17, reorder: 35 },
    { sku: "PCK-0612", name: "Daypack 22L Pine", bin: "B-03-B", qty: 64, reorder: 30 },
    { sku: "HAT-0440", name: "Wide-Brim Sun Hat", bin: "B-18-A", qty: 121, reorder: 50 },
    { sku: "STV-1004", name: "Compact Trail Stove", bin: "B-05-C", qty: 27, reorder: 20 },
    { sku: "RPE-0290", name: "Static Rope 30m", bin: "B-11-D", qty: 95, reorder: 40 }
  ];

  var activeIdx = 0;

  /* ---------- helpers ---------- */
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var checkSvg = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12.5l4.2 4.2L19 7" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  function toast(msg, kind) {
    var wrap = $("#toastWrap");
    var el = document.createElement("div");
    el.className = "toast" + (kind ? " " + kind : "");
    var ico = kind === "ok" ? "✓" : kind === "warn" ? "!" : "›";
    el.innerHTML = '<span class="t-ico" aria-hidden="true">' + ico + "</span><span>" + msg + "</span>";
    wrap.appendChild(el);
    setTimeout(function () {
      el.style.transition = "opacity .3s, transform .3s";
      el.style.opacity = "0";
      el.style.transform = "translateY(8px)";
      setTimeout(function () { el.remove(); }, 320);
    }, 2600);
  }

  function statusFor(item) {
    if (item.qty === 0) return "out";
    if (item.qty <= item.reorder) return "low";
    return "ok";
  }

  /* ---------- queue render ---------- */
  function renderQueue() {
    var q = $("#queue");
    q.innerHTML = "";
    var remaining = 0;
    lists.forEach(function (l, i) {
      if (!l.done) remaining++;
      var li = document.createElement("li");
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "queue-item" + (i === activeIdx ? " is-active" : "") + (l.done ? " is-done" : "");
      btn.setAttribute("role", "tab");
      btn.setAttribute("aria-selected", i === activeIdx ? "true" : "false");
      var count = l.picks.length || (l.id === "PL-2294" ? 5 : 6);
      var pillCls = l.done ? "done" : l.priority;
      var pillTxt = l.done ? "Done" : (l.priority === "priority" ? "Priority" : "Standard");
      btn.innerHTML =
        '<span class="qi-rank">' + (i + 1) + "</span>" +
        '<span class="qi-body"><span class="qi-title">' + l.id + " · " + l.order + "</span>" +
        '<span class="qi-meta">' + count + " lines · " + l.sub.split(" · ")[1] + "</span></span>" +
        '<span class="pill ' + pillCls + '">' + pillTxt + "</span>";
      btn.addEventListener("click", function () { selectList(i); });
      li.appendChild(btn);
      q.appendChild(li);
    });
    $("#queueCount").textContent = remaining + " in queue";
  }

  /* ---------- active list render ---------- */
  function renderActive() {
    var l = lists[activeIdx];
    $("#apId").textContent = l.id;
    $("#apOrder").textContent = l.order;
    $("#apSub").textContent = l.sub;

    var ol = $("#picks");
    ol.innerHTML = "";

    if (!l.picks.length) {
      var p = document.createElement("li");
      p.className = "pick";
      p.style.gridTemplateColumns = "1fr";
      p.innerHTML = '<span class="pick-name">No lines staged yet for this list.</span>';
      ol.appendChild(p);
      $("#completeBtn").disabled = true;
      updateProgress();
      return;
    }

    l.picks.forEach(function (item, idx) {
      var li = document.createElement("li");
      li.className = "pick" + (item.checked ? " checked" : "");
      li.innerHTML =
        '<button class="pick-check" type="button" aria-pressed="' + (item.checked ? "true" : "false") +
        '" aria-label="Scan-to-pick ' + item.name + '">' + checkSvg + "</button>" +
        '<span class="pick-info"><span class="pick-name">' + item.name + "</span>" +
        '<span class="pick-sub"><span class="pick-sku">SKU ' + item.sku + "</span></span></span>" +
        '<span class="pick-right"><span class="bin-tag">' + item.bin + '</span>' +
        '<span class="qty-tag">×' + item.qty + "</span></span>";
      li.querySelector(".pick-check").addEventListener("click", function () { togglePick(idx); });
      ol.appendChild(li);
    });
    updateProgress();
  }

  function togglePick(idx) {
    var l = lists[activeIdx];
    var item = l.picks[idx];
    item.checked = !item.checked;
    renderActive();
    moveMarker();
    if (item.checked) {
      toast("Picked " + item.qty + " × " + item.name, "ok");
    }
  }

  function updateProgress() {
    var l = lists[activeIdx];
    var total = l.picks.length;
    var done = l.picks.filter(function (p) { return p.checked; }).length;
    $("#bpNum").textContent = done;
    $(".bp-den").textContent = "/" + (total || 0);
    var pct = total ? (done / total) * 100 : 0;
    $("#fill").style.width = pct + "%";
    var rail = $("#rail");
    rail.setAttribute("aria-valuemax", total);
    rail.setAttribute("aria-valuenow", done);
    $("#completeBtn").disabled = !(total && done === total);

    // next bin
    var next = l.picks.find(function (p) { return !p.checked; });
    $("#nextBin").textContent = next ? next.bin : "— all picked —";
  }

  function moveMarker() {
    var l = lists[activeIdx];
    if (!l.picks.length) return;
    var next = l.picks.find(function (p) { return !p.checked; });
    var target = next ? next.route : l.picks[l.picks.length - 1].route;
    var m = $("#marker");
    if (m && target) {
      m.setAttribute("cx", target[0]);
      m.setAttribute("cy", target[1]);
    }
  }

  function selectList(i) {
    activeIdx = i;
    renderQueue();
    renderActive();
    moveMarker();
    toast("Opened " + lists[i].id);
  }

  /* ---------- inventory render ---------- */
  function renderInventory() {
    var body = $("#invBody");
    var lowOnly = $("#lowOnly").checked;
    body.innerHTML = "";
    var lowCount = 0;
    var shown = 0;

    inventory.forEach(function (item) {
      var st = statusFor(item);
      if (st !== "ok") lowCount++;
      if (lowOnly && st === "ok") return;
      shown++;
      var tr = document.createElement("tr");
      if (st !== "ok") tr.className = "is-low";
      var label = st === "out" ? "Out of stock" : st === "low" ? "Below reorder" : "In stock";
      tr.innerHTML =
        '<td><span class="sku-name">' + item.name + "</span><br>" +
        '<span class="sku-id">' + item.sku + "</span></td>" +
        '<td class="bin-cell">' + item.bin + "</td>" +
        '<td class="num">' + item.qty + "</td>" +
        '<td><span class="stat ' + st + '">' + label + "</span></td>";
      body.appendChild(tr);
    });

    if (!shown) {
      var tr = document.createElement("tr");
      tr.className = "empty-row";
      tr.innerHTML = '<td colspan="4">No SKUs match this filter.</td>';
      body.appendChild(tr);
    }
    $("#invFoot").textContent =
      inventory.length + " SKUs · " + lowCount + " below reorder point";
  }

  /* ---------- actions ---------- */
  $("#resetBtn").addEventListener("click", function () {
    var l = lists[activeIdx];
    l.picks.forEach(function (p) { p.checked = false; });
    renderActive();
    moveMarker();
    toast("Checks reset for " + l.id, "warn");
  });

  $("#completeBtn").addEventListener("click", function () {
    var l = lists[activeIdx];
    l.done = true;
    toast(l.id + " completed — staged for packing", "ok");
    // advance to next undone list
    var nextIdx = lists.findIndex(function (x) { return !x.done; });
    activeIdx = nextIdx === -1 ? activeIdx : nextIdx;
    renderQueue();
    renderActive();
    moveMarker();
  });

  $("#lowOnly").addEventListener("change", function () {
    renderInventory();
    toast(this.checked ? "Showing low stock only" : "Showing all SKUs");
  });

  /* ---------- init ---------- */
  renderQueue();
  renderActive();
  renderInventory();
  moveMarker();
})();
