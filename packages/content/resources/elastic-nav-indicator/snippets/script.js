/* Elastic Nav Indicator
   A shared-element pill/underline that springs between nav items and
   squashes/stretches in its direction of travel. Vanilla JS, no deps. */

(function () {
  "use strict";

  var mqReduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* ---- global tunables (driven by the controls) ---- */
  var config = {
    stiffness: 220, // spring constant k
    damping: 18,    // damping coefficient c
    stretch: 1.0,   // multiplier on velocity->squash mapping
    forceReduce: false
  };

  function reducedMotion() {
    return config.forceReduce || mqReduce.matches;
  }

  /* Critically-ish damped spring integrator for a single scalar. */
  function Spring(value) {
    this.value = value;
    this.target = value;
    this.vel = 0;
  }
  Spring.prototype.set = function (v) { this.value = this.target = v; this.vel = 0; };
  Spring.prototype.step = function (dt) {
    // semi-implicit Euler with sub-stepping for stability at high stiffness
    var steps = 4;
    var h = dt / steps;
    for (var i = 0; i < steps; i++) {
      var force = -config.stiffness * (this.value - this.target) - config.damping * this.vel;
      this.vel += force * h;
      this.value += this.vel * h;
    }
    return this.value;
  };

  function NavController(nav) {
    this.nav = nav;
    this.indicator = nav.querySelector(".nav__indicator");
    this.items = Array.prototype.slice.call(nav.querySelectorAll(".nav__item"));
    this.activeIndex = Math.max(0, this.items.findIndex(function (b) {
      return b.getAttribute("aria-selected") === "true";
    }));

    this.x = new Spring(0);
    this.w = new Spring(0);
    this.raf = null;
    this.lastT = 0;
    this.reportVel = 0;
    this.reportSquash = 1;

    this.bind();
    // measure once fonts/layout settle
    this.snapToActive();
    this.onResize = this.onResize.bind(this);
    window.addEventListener("resize", this.onResize);
    if (document.fonts && document.fonts.ready) {
      var self = this;
      document.fonts.ready.then(function () { self.snapToActive(); });
    }
  }

  NavController.prototype.metrics = function (index) {
    var item = this.items[index];
    var navRect = this.nav.getBoundingClientRect();
    var r = item.getBoundingClientRect();
    return {
      x: r.left - navRect.left + this.nav.scrollLeft,
      y: r.top - navRect.top,
      w: r.width,
      h: r.height
    };
  };

  NavController.prototype.snapToActive = function () {
    var m = this.metrics(this.activeIndex);
    this.x.set(m.x);
    this.w.set(m.w);
    this.layoutIndicatorBox(m);
    this.paint(m.x, m.w, 1, 1);
  };

  // Set the static box (height / vertical position) for the current variant.
  NavController.prototype.layoutIndicatorBox = function (m) {
    var variant = this.nav.getAttribute("data-variant");
    if (variant === "underline") {
      // indicator sits at the bottom edge; fixed 3px height from CSS
      this.indicator.style.top = (m.y + m.h - 3) + "px";
    } else {
      this.indicator.style.top = m.y + "px";
      this.indicator.style.height = m.h + "px";
    }
  };

  NavController.prototype.paint = function (x, w, sx, sy) {
    // translate by the animated left edge, then scale about center.
    // Because transform-origin is center, we translate to center-x first.
    var cx = x + w / 2;
    var el = this.indicator;
    el.style.width = w + "px";
    el.style.left = "0px";
    // move so element's own center lands at cx (element left currently 0)
    var tx = cx - w / 2;
    el.style.transform =
      "translateX(" + tx + "px) scale(" + sx + "," + sy + ")";
  };

  NavController.prototype.animateTo = function (index) {
    var m = this.metrics(index);
    this.layoutIndicatorBox(m);

    if (reducedMotion()) {
      this.x.set(m.x);
      this.w.set(m.w);
      this.paint(m.x, m.w, 1, 1);
      this.reportVel = 0; this.reportSquash = 1;
      publish();
      return;
    }

    this.x.target = m.x;
    this.w.target = m.w;
    if (!this.raf) {
      this.lastT = performance.now();
      var self = this;
      this.raf = requestAnimationFrame(function (t) { self.tick(t); });
    }
  };

  NavController.prototype.tick = function (t) {
    var dt = Math.min(0.05, (t - this.lastT) / 1000) || 0.016;
    this.lastT = t;

    var x = this.x.step(dt);
    var w = this.w.step(dt);

    // velocity -> squash. positive = moving right.
    var v = this.x.vel; // px/s
    // map speed to a scale delta; clamp so it never inverts.
    var k = 0.00035 * config.stretch;
    var sx = 1 + Math.min(0.55, Math.abs(v) * k);
    // volume-ish preservation: counter-scale the cross axis
    var sy = 1 / (1 + (sx - 1) * 0.65);

    this.reportVel = v;
    this.reportSquash = sx;

    this.paint(x, w, sx, sy);

    var settled =
      Math.abs(x - this.x.target) < 0.15 &&
      Math.abs(w - this.w.target) < 0.15 &&
      Math.abs(this.x.vel) < 3 && Math.abs(this.w.vel) < 3;

    if (settled) {
      this.x.set(this.x.target);
      this.w.set(this.w.target);
      this.paint(this.x.value, this.w.value, 1, 1);
      this.reportVel = 0; this.reportSquash = 1;
      this.raf = null;
      publish();
      return;
    }

    publish();
    var self = this;
    this.raf = requestAnimationFrame(function (tt) { self.tick(tt); });
  };

  NavController.prototype.select = function (index, focus) {
    if (index === this.activeIndex) { if (focus) this.items[index].focus(); return; }
    this.items[this.activeIndex].setAttribute("aria-selected", "false");
    this.items[this.activeIndex].setAttribute("tabindex", "-1");
    this.activeIndex = index;
    var item = this.items[index];
    item.setAttribute("aria-selected", "true");
    item.setAttribute("tabindex", "0");
    if (focus) item.focus();
    // keep the active item in view for the scrollable case
    if (item.scrollIntoView) item.scrollIntoView({ inline: "nearest", block: "nearest" });
    this.animateTo(index);
  };

  NavController.prototype.onResize = function () {
    // stop any spring and re-snap to avoid stale pixel coords
    if (this.raf) { cancelAnimationFrame(this.raf); this.raf = null; }
    this.snapToActive();
  };

  NavController.prototype.bind = function () {
    var self = this;
    this.items.forEach(function (item, i) {
      item.addEventListener("click", function () { self.select(i, true); });
    });
    this.nav.addEventListener("keydown", function (e) {
      var last = self.items.length - 1;
      var next = null;
      switch (e.key) {
        case "ArrowRight":
        case "ArrowDown": next = Math.min(last, self.activeIndex + 1); break;
        case "ArrowLeft":
        case "ArrowUp": next = Math.max(0, self.activeIndex - 1); break;
        case "Home": next = 0; break;
        case "End": next = last; break;
        default: return;
      }
      e.preventDefault();
      self.select(next, true);
    });
  };

  /* ---------- controls wiring ---------- */
  var controllers = Array.prototype.map.call(
    document.querySelectorAll(".nav"),
    function (nav) { return new NavController(nav); }
  );

  var velOut = document.getElementById("vel");
  var squashOut = document.getElementById("squash");

  function publish() {
    // report the liveliest controller
    var v = 0, sq = 1;
    controllers.forEach(function (c) {
      if (Math.abs(c.reportVel) > Math.abs(v)) v = c.reportVel;
      if (c.reportSquash > sq) sq = c.reportSquash;
    });
    if (velOut) velOut.textContent = Math.round(v);
    if (squashOut) squashOut.textContent = sq.toFixed(2) + "×";
  }

  function bindRange(id, outId, key, fmt) {
    var input = document.getElementById(id);
    var out = document.getElementById(outId);
    function apply() {
      config[key] = parseFloat(input.value);
      out.textContent = fmt ? fmt(config[key]) : input.value;
    }
    input.addEventListener("input", apply);
    apply();
    return input;
  }

  var stiffEl = bindRange("stiff", "outStiff", "stiffness");
  var dampEl = bindRange("damp", "outDamp", "damping");
  var stretchEl = bindRange("stretch", "outStretch", "stretch", function (v) {
    return v.toFixed(1);
  });

  var reduceEl = document.getElementById("reduce");
  reduceEl.addEventListener("change", function () {
    config.forceReduce = reduceEl.checked;
    // snap immediately so state is honest when toggled on
    if (config.forceReduce) {
      controllers.forEach(function (c) {
        if (c.raf) { cancelAnimationFrame(c.raf); c.raf = null; }
        c.snapToActive();
      });
      publish();
    }
  });

  document.getElementById("reset").addEventListener("click", function () {
    stiffEl.value = 220; stiffEl.dispatchEvent(new Event("input"));
    dampEl.value = 18; dampEl.dispatchEvent(new Event("input"));
    stretchEl.value = 1.0; stretchEl.dispatchEvent(new Event("input"));
    reduceEl.checked = false;
    config.forceReduce = false;
  });

  publish();
})();
