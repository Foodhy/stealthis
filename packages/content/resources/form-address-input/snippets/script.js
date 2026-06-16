(function () {
  "use strict";

  // Fictional address database
  var ADDRESSES = [
    { street: "18 Marlowe Crescent", city: "Brighton", postcode: "BN1 4QT", country: "United Kingdom" },
    { street: "204 Sefton Park Road", city: "Liverpool", postcode: "L8 3SD", country: "United Kingdom" },
    { street: "7 Camden Lock Place", city: "London", postcode: "NW1 8AF", country: "United Kingdom" },
    { street: "33 Grafton Street", city: "Dublin", postcode: "D02 X285", country: "Ireland" },
    { street: "12 Quayside Walk", city: "Bristol", postcode: "BS1 5TY", country: "United Kingdom" },
    { street: "9 Rue des Abbesses", city: "Paris", postcode: "75018", country: "France" },
    { street: "41 Prinsengracht", city: "Amsterdam", postcode: "1015 DK", country: "Netherlands" },
    { street: "5 Calle de Toledo", city: "Madrid", postcode: "28005", country: "Spain" },
    { street: "88 Schönhauser Allee", city: "Berlin", postcode: "10437", country: "Germany" },
    { street: "27 Heaton Moor Road", city: "Manchester", postcode: "M19 2NP", country: "United Kingdom" },
    { street: "150 Royal Mile", city: "Edinburgh", postcode: "EH1 1PW", country: "United Kingdom" },
    { street: "62 Magdalen Street", city: "Oxford", postcode: "OX1 3AB", country: "United Kingdom" },
  ];

  var POSTCODE_RE = /^[A-Za-z0-9][A-Za-z0-9 -]{1,9}$/;

  var $ = function (id) {
    return document.getElementById(id);
  };

  var form = $("address-form");
  var input = $("ac-input");
  var listbox = $("ac-listbox");
  var clearBtn = document.querySelector(".combo__clear");
  var combo = document.querySelector(".combo");
  var manualBtn = $("manual-btn");
  var manualHint = $("manual-hint");
  var fieldset = $("manual-fields");
  var summary = $("error-summary");
  var summaryList = $("summary-list");
  var statusEl = $("form-status");
  var confirmCard = $("confirm-card");
  var confirmAddr = $("confirm-addr");
  var editBtn = $("edit-btn");
  var toastEl = $("toast");

  var fields = {
    street: $("f-street"),
    city: $("f-city"),
    postcode: $("f-postcode"),
    country: $("f-country"),
  };

  var labels = {
    street: "Street address",
    city: "City",
    postcode: "Postcode",
    country: "Country",
  };

  var activeIdx = -1;
  var current = [];
  var manualOpen = false;
  var toastTimer;

  /* ---------- toast ---------- */
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.hidden = false;
    // force reflow so transition runs
    void toastEl.offsetWidth;
    toastEl.setAttribute("data-show", "true");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.setAttribute("data-show", "false");
      setTimeout(function () {
        toastEl.hidden = true;
      }, 220);
    }, 2200);
  }

  /* ---------- highlight ---------- */
  function escapeRe(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function highlight(text, query) {
    if (!query) return text;
    var re = new RegExp("(" + escapeRe(query) + ")", "gi");
    return text.replace(re, "<mark>$1</mark>");
  }

  function pinSvg() {
    return (
      '<span class="pin">' +
      '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 0 1 18 0Z"/><circle cx="12" cy="10" r="3"/></svg></span>'
    );
  }

  /* ---------- combobox ---------- */
  function openList(items, query) {
    listbox.innerHTML = "";
    activeIdx = -1;
    current = items;

    if (items.length === 0) {
      var empty = document.createElement("li");
      empty.className = "combo__empty";
      empty.textContent = "No matching address — try “Enter manually”.";
      empty.setAttribute("role", "presentation");
      listbox.appendChild(empty);
    } else {
      items.forEach(function (addr, i) {
        var li = document.createElement("li");
        li.className = "combo__opt";
        li.id = "ac-opt-" + i;
        li.setAttribute("role", "option");
        li.setAttribute("aria-selected", "false");
        li.innerHTML =
          pinSvg() +
          "<span><span class='ln1'>" +
          highlight(addr.street, query) +
          "</span><br><span class='ln2'>" +
          highlight(addr.city + ", " + addr.postcode, query) +
          " &middot; " +
          addr.country +
          "</span></span>";
        li.addEventListener("mousedown", function (e) {
          e.preventDefault();
          choose(i);
        });
        listbox.appendChild(li);
      });
    }

    listbox.hidden = false;
    input.setAttribute("aria-expanded", "true");
    combo.setAttribute("data-state", "open");
  }

  function closeList() {
    listbox.hidden = true;
    input.setAttribute("aria-expanded", "false");
    input.removeAttribute("aria-activedescendant");
    combo.setAttribute("data-state", "idle");
    activeIdx = -1;
  }

  function setActive(idx) {
    var opts = listbox.querySelectorAll(".combo__opt");
    opts.forEach(function (o) {
      o.setAttribute("aria-selected", "false");
    });
    if (idx < 0 || idx >= opts.length) {
      activeIdx = -1;
      input.removeAttribute("aria-activedescendant");
      return;
    }
    activeIdx = idx;
    var el = opts[idx];
    el.setAttribute("aria-selected", "true");
    input.setAttribute("aria-activedescendant", el.id);
    el.scrollIntoView({ block: "nearest" });
  }

  function filter(q) {
    var lower = q.toLowerCase();
    return ADDRESSES.filter(function (a) {
      return (
        a.street.toLowerCase().indexOf(lower) > -1 ||
        a.city.toLowerCase().indexOf(lower) > -1 ||
        a.postcode.toLowerCase().indexOf(lower) > -1
      );
    });
  }

  function choose(i) {
    var addr = current[i];
    if (!addr) return;
    input.value = addr.street + ", " + addr.city;
    clearBtn.hidden = false;
    fields.street.value = addr.street;
    fields.city.value = addr.city;
    fields.postcode.value = addr.postcode;
    fields.country.value = addr.country;
    closeList();
    if (!manualOpen) setManual(true, false);
    Object.keys(fields).forEach(function (k) {
      validateField(k);
    });
    clearSummary();
    toast("Address filled — check the details.");
  }

  /* ---------- manual toggle ---------- */
  function setManual(open, announce) {
    manualOpen = open;
    fieldset.setAttribute("data-open", open ? "true" : "false");
    manualBtn.setAttribute("aria-expanded", open ? "true" : "false");
    manualBtn.textContent = open ? "Hide fields" : "Enter manually";
    manualHint.textContent = open ? "Edit any field:" : "Can’t find it?";
    if (open && announce) {
      fields.street.focus();
    }
  }

  /* ---------- validation ---------- */
  function validateField(key) {
    var el = fields[key];
    var val = el.value.trim();
    var msg = "";

    if (!val) {
      msg = labels[key] + " is required.";
    } else if (key === "postcode" && !POSTCODE_RE.test(val)) {
      msg = "Enter a valid postcode.";
    } else if (key === "street" && val.length < 4) {
      msg = "Street address looks too short.";
    }

    var errEl = $("e-" + key);
    if (msg) {
      el.setAttribute("aria-invalid", "true");
      el.removeAttribute("data-valid");
      errEl.textContent = msg;
      errEl.hidden = false;
      return false;
    }
    el.removeAttribute("aria-invalid");
    el.setAttribute("data-valid", "true");
    errEl.textContent = "";
    errEl.hidden = true;
    return true;
  }

  function clearSummary() {
    summary.hidden = true;
    summaryList.innerHTML = "";
  }

  function showSummary(errors) {
    summaryList.innerHTML = "";
    errors.forEach(function (key) {
      var li = document.createElement("li");
      var a = document.createElement("a");
      a.href = "#f-" + key;
      a.textContent = labels[key];
      a.addEventListener("click", function (e) {
        e.preventDefault();
        if (!manualOpen) setManual(true, false);
        fields[key].focus();
      });
      li.appendChild(a);
      summaryList.appendChild(li);
    });
    summary.hidden = false;
    summary.focus();
  }

  function setStatus(msg, tone) {
    statusEl.textContent = msg;
    if (tone) statusEl.setAttribute("data-tone", tone);
    else statusEl.removeAttribute("data-tone");
  }

  /* ---------- events ---------- */
  input.addEventListener("input", function () {
    var q = input.value.trim();
    clearBtn.hidden = q.length === 0;
    if (q.length < 2) {
      closeList();
      return;
    }
    openList(filter(q), q);
  });

  input.addEventListener("focus", function () {
    var q = input.value.trim();
    if (q.length >= 2) openList(filter(q), q);
  });

  input.addEventListener("keydown", function (e) {
    var opts = listbox.querySelectorAll(".combo__opt");
    if (listbox.hidden && e.key === "ArrowDown") {
      e.preventDefault();
      input.dispatchEvent(new Event("input"));
      return;
    }
    if (listbox.hidden) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActive(Math.min(activeIdx + 1, opts.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActive(activeIdx <= 0 ? opts.length - 1 : activeIdx - 1);
        break;
      case "Home":
        if (opts.length) {
          e.preventDefault();
          setActive(0);
        }
        break;
      case "End":
        if (opts.length) {
          e.preventDefault();
          setActive(opts.length - 1);
        }
        break;
      case "Enter":
        if (activeIdx >= 0) {
          e.preventDefault();
          choose(activeIdx);
        }
        break;
      case "Escape":
        closeList();
        break;
      case "Tab":
        closeList();
        break;
    }
  });

  input.addEventListener("blur", function () {
    setTimeout(closeList, 140);
  });

  clearBtn.addEventListener("click", function () {
    input.value = "";
    clearBtn.hidden = true;
    closeList();
    input.focus();
  });

  manualBtn.addEventListener("click", function () {
    setManual(!manualOpen, true);
  });

  Object.keys(fields).forEach(function (key) {
    var el = fields[key];
    var evt = key === "country" ? "change" : "blur";
    el.addEventListener(evt, function () {
      if (el.getAttribute("aria-invalid") === "true" || el.value.trim()) {
        validateField(key);
      }
    });
    el.addEventListener("input", function () {
      if (el.getAttribute("aria-invalid") === "true") validateField(key);
    });
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    closeList();
    if (!manualOpen) setManual(true, false);

    var errors = [];
    Object.keys(fields).forEach(function (key) {
      if (!validateField(key)) errors.push(key);
    });

    if (errors.length) {
      showSummary(errors);
      setStatus(errors.length + " field" + (errors.length > 1 ? "s" : "") + " need attention.", "err");
      return;
    }

    clearSummary();
    setStatus("");

    var addr = {
      street: fields.street.value.trim(),
      city: fields.city.value.trim(),
      postcode: fields.postcode.value.trim(),
      country: fields.country.value,
    };

    confirmAddr.innerHTML =
      "<span class='name'>Jordan Avery</span><br>" +
      addr.street +
      "<br>" +
      addr.city +
      ", " +
      addr.postcode +
      "<br>" +
      addr.country;

    form.hidden = true;
    confirmCard.hidden = false;
    confirmCard.scrollIntoView({ behavior: "smooth", block: "center" });
    editBtn.focus();
    toast("Address confirmed ✓");
  });

  editBtn.addEventListener("click", function () {
    confirmCard.hidden = true;
    form.hidden = false;
    setStatus("");
    input.focus();
  });
})();
