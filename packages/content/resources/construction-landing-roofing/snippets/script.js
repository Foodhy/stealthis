(function () {
  "use strict";

  /* ---------- Inspection form ---------- */
  var form = document.getElementById("inspectForm");
  var successPanel = document.getElementById("successPanel");
  var ticketNo = document.getElementById("ticketNo");
  var resetBtn = document.getElementById("resetForm");

  function setError(name, msg) {
    var input = form.elements[name];
    if (!input) return;
    var field = input.closest(".field");
    var err = field ? field.querySelector('.err[data-for="' + name + '"]') : null;
    if (field) field.classList.toggle("invalid", !!msg);
    if (err) err.textContent = msg || "";
    if (msg) input.setAttribute("aria-invalid", "true");
    else input.removeAttribute("aria-invalid");
  }

  function validate() {
    var ok = true;
    var name = form.elements.name.value.trim();
    var phone = form.elements.phone.value.trim();
    var address = form.elements.address.value.trim();

    if (name.length < 2) { setError("name", "Please enter your name."); ok = false; }
    else setError("name", "");

    // require at least 7 digits in the phone
    var digits = phone.replace(/\D/g, "");
    if (digits.length < 7) { setError("phone", "Enter a valid phone number."); ok = false; }
    else setError("phone", "");

    if (address.length < 5) { setError("address", "Enter the property address."); ok = false; }
    else setError("address", "");

    return ok;
  }

  function makeTicket() {
    var n = Math.floor(10000 + Math.random() * 89999);
    return "#IR-" + n;
  }

  if (form) {
    // clear errors as the user fixes them
    ["name", "phone", "address"].forEach(function (n) {
      var el = form.elements[n];
      if (el) el.addEventListener("input", function () {
        if (el.closest(".field").classList.contains("invalid")) setError(n, "");
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!validate()) {
        var firstBad = form.querySelector(".field.invalid input");
        if (firstBad) firstBad.focus();
        return;
      }
      ticketNo.textContent = makeTicket();
      form.hidden = true;
      successPanel.hidden = false;
      successPanel.focus && successPanel.focus();
      successPanel.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", function () {
      form.reset();
      ["name", "phone", "address"].forEach(function (n) { setError(n, ""); });
      successPanel.hidden = true;
      form.hidden = false;
      form.elements.name.focus();
    });
  }

  /* ---------- Before / After slider ---------- */
  var viewer = document.getElementById("baViewer");
  var divider = document.getElementById("baDivider");
  var handle = document.getElementById("baHandle");
  var afterPanel = viewer ? viewer.querySelector(".ba__panel--after") : null;
  var dragging = false;

  function setSplit(pct) {
    pct = Math.max(4, Math.min(96, pct));
    if (afterPanel) afterPanel.style.clipPath = "inset(0 0 0 " + pct + "%)";
    if (divider) divider.style.left = pct + "%";
  }

  function pointerToPct(clientX) {
    var rect = viewer.getBoundingClientRect();
    return ((clientX - rect.left) / rect.width) * 100;
  }

  if (viewer && divider && afterPanel) {
    var start = function (e) { dragging = true; e.preventDefault(); };
    var move = function (e) {
      if (!dragging) return;
      var x = (e.touches ? e.touches[0].clientX : e.clientX);
      setSplit(pointerToPct(x));
    };
    var end = function () { dragging = false; };

    handle.addEventListener("mousedown", start);
    handle.addEventListener("touchstart", start, { passive: false });
    window.addEventListener("mousemove", move);
    window.addEventListener("touchmove", move, { passive: false });
    window.addEventListener("mouseup", end);
    window.addEventListener("touchend", end);

    // click anywhere on the viewer to jump
    viewer.addEventListener("click", function (e) {
      if (e.target === handle) return;
      setSplit(pointerToPct(e.clientX));
    });

    // keyboard support
    handle.addEventListener("keydown", function (e) {
      var cur = parseFloat(divider.style.left) || 50;
      if (e.key === "ArrowLeft") { setSplit(cur - 4); e.preventDefault(); }
      if (e.key === "ArrowRight") { setSplit(cur + 4); e.preventDefault(); }
    });

    setSplit(50);
  }

  /* ---------- Smooth-scroll active nav highlight (tiny enhancement) ---------- */
  var navLinks = document.querySelectorAll(".nav__links a");
  if (navLinks.length && "IntersectionObserver" in window) {
    var map = {};
    navLinks.forEach(function (a) {
      var id = a.getAttribute("href").slice(1);
      var sec = document.getElementById(id);
      if (sec) map[id] = a;
    });
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting && map[en.target.id]) {
          navLinks.forEach(function (a) { a.style.borderColor = "transparent"; a.style.color = ""; });
          map[en.target.id].style.borderColor = "var(--hv)";
          map[en.target.id].style.color = "#fff";
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    Object.keys(map).forEach(function (id) { obs.observe(document.getElementById(id)); });
  }
})();
