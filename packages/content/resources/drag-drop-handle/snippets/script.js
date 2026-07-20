/**
 * Drag Handle — reorder a list from a dedicated grip only.
 * Pointer Events + pointer capture; rows shift via transform (no reflow while dragging).
 * Keyboard fallback: focus a handle and press ArrowUp / ArrowDown.
 */
(function () {
  "use strict";

  var list = document.getElementById("list");
  var orderOut = document.getElementById("order");
  if (!list) return;

  function rows() {
    return Array.prototype.slice.call(list.querySelectorAll(".dl__row"));
  }

  function report() {
    if (!orderOut) return;
    orderOut.textContent =
      "Order: " +
      rows()
        .map(function (r, i) {
          return i + 1 + ". " + r.querySelector(".dl__title").textContent.trim();
        })
        .join("  ·  ");
  }

  /* ---------------- pointer drag ---------------- */

  var drag = null;

  list.addEventListener("pointerdown", function (event) {
    var handle = event.target.closest(".dl__handle");
    if (!handle || (event.button && event.button !== 0)) return;

    var row = handle.closest(".dl__row");
    var items = rows();
    var geometry = items.map(function (el) {
      var rect = el.getBoundingClientRect();
      return { el: el, height: rect.height, top: rect.top };
    });
    if (geometry.length < 2) return;

    var gap = geometry[1].top - (geometry[0].top + geometry[0].height);
    var index = items.indexOf(row);

    drag = {
      row: row,
      geometry: geometry,
      step: geometry[index].height + gap,
      from: index,
      to: index,
      startY: event.clientY,
      pointerId: event.pointerId
    };

    handle.setPointerCapture(event.pointerId);
    row.classList.add("is-dragging");
    list.classList.add("is-active");
    event.preventDefault();
  });

  list.addEventListener("pointermove", function (event) {
    if (!drag || event.pointerId !== drag.pointerId) return;

    var count = drag.geometry.length;
    var min = -drag.from * drag.step;
    var max = (count - 1 - drag.from) * drag.step;
    var offset = Math.max(min, Math.min(max, event.clientY - drag.startY));

    var target = Math.max(0, Math.min(count - 1, drag.from + Math.round(offset / drag.step)));
    drag.to = target;

    drag.geometry.forEach(function (entry, i) {
      if (entry.el === drag.row) {
        entry.el.style.transform = "translateY(" + offset + "px)";
        return;
      }
      var shift = 0;
      if (target > drag.from && i > drag.from && i <= target) shift = -drag.step;
      else if (target < drag.from && i >= target && i < drag.from) shift = drag.step;
      entry.el.style.transform = shift ? "translateY(" + shift + "px)" : "";
      entry.el.classList.toggle("is-bumped", shift !== 0);
    });
  });

  function endDrag(event) {
    if (!drag || (event && event.pointerId !== drag.pointerId)) return;
    var d = drag;
    drag = null;

    d.geometry.forEach(function (entry) {
      entry.el.style.transform = "";
      entry.el.classList.remove("is-bumped");
    });
    d.row.classList.remove("is-dragging");
    list.classList.remove("is-active");

    if (d.to !== d.from) {
      var reference = rows()[d.to];
      if (d.to > d.from) reference.after(d.row);
      else reference.before(d.row);
      // Persist here: POST the new order, or lift it into your state store.
      report();
    }
  }

  list.addEventListener("pointerup", endDrag);
  list.addEventListener("pointercancel", endDrag);
  list.addEventListener("lostpointercapture", endDrag);

  /* ---------------- keyboard fallback ---------------- */

  list.addEventListener("keydown", function (event) {
    var handle = event.target.closest(".dl__handle");
    if (!handle) return;
    if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;

    var row = handle.closest(".dl__row");
    var siblings = rows();
    var i = siblings.indexOf(row);
    var next = event.key === "ArrowUp" ? i - 1 : i + 1;
    if (next < 0 || next >= siblings.length) return;

    event.preventDefault();
    if (next > i) siblings[next].after(row);
    else siblings[next].before(row);
    handle.focus();
    report();
  });

  report();
})();
