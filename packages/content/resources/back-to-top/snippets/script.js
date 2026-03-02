(function () {
  var THRESHOLD = 300; // px before button appears

  var btn      = document.getElementById("btt-btn");
  var ringFill = document.getElementById("btt-ring-fill");

  if (!btn) return;

  // ── Progress ring setup ──
  var radius = 23; // matches SVG r attribute
  var circumference = 2 * Math.PI * radius; // ~144.51

  if (ringFill) {
    ringFill.style.strokeDasharray  = circumference;
    ringFill.style.strokeDashoffset = circumference; // fully hidden
  }

  // ── Scroll handler ──
  function onScroll() {
    var scrollY = window.scrollY || window.pageYOffset;
    var maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    var pct = maxScroll > 0 ? scrollY / maxScroll : 0;

    // Show / hide button
    if (scrollY > THRESHOLD) {
      btn.classList.add("visible");
    } else {
      btn.classList.remove("visible");
    }

    // Update progress ring
    if (ringFill) {
      var offset = circumference * (1 - pct);
      ringFill.style.strokeDashoffset = offset;
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll(); // initialise on load

  // ── Click: smooth scroll to top ──
  btn.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // ── Keyboard activation ──
  btn.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });
}());
