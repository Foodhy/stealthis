/* Animated Icon Set — real path-data interpolation, zero dependencies.
 *
 * Each morphing <path> carries data-from / data-to path strings that use the
 * same command sequence and the same number of points. We parse both into flat
 * number arrays once, then on toggle we rAF-tween t: 0 -> 1 and rebuild `d`.
 * Degenerate (repeated) points are how a 2-point line morphs into a 9-point
 * heart without visual tearing.
 */

const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)");
const DURATION = 420;

const status = document.querySelector(".status");
const reduceBox = document.querySelector("#reduce");

const LABELS = {
  play:  { off: ["Pause", "Play"],  on: ["Play", "Pause"] },
  menu:  { off: ["Menu", "Open menu"], on: ["Close", "Close menu"] },
  check: { off: ["Done", "Mark as done"], on: ["Undone", "Mark as not done"] },
  heart: { off: ["Like", "Add to favourites"], on: ["Liked", "Remove from favourites"] },
};

/* ---------- path parsing ---------- */

/** "M 4 7 L 20 7" -> { commands: ["M","L"], nums: [4,7,20,7] } */
function parsePath(d) {
  const tokens = d.match(/[a-zA-Z]|-?\d*\.?\d+/g) || [];
  const commands = [];
  const nums = [];
  for (const tok of tokens) {
    if (/[a-zA-Z]/.test(tok)) commands.push(tok);
    else nums.push(parseFloat(tok));
  }
  return { commands, nums };
}

function buildPath(commands, nums) {
  let out = "";
  let i = 0;
  for (const cmd of commands) {
    out += (out ? " " : "") + cmd;
    // every command used here (M / L) takes exactly one x,y pair
    out += ` ${round(nums[i++])} ${round(nums[i++])}`;
  }
  return out;
}

const round = (n) => Math.round(n * 1000) / 1000;
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/* ---------- morph engine ---------- */

class Morpher {
  constructor(path) {
    this.el = path;
    this.a = parsePath(path.dataset.from);
    this.b = parsePath(path.dataset.to);
    if (this.a.nums.length !== this.b.nums.length) {
      console.warn("morph endpoints differ in point count", path);
    }
    this.el.setAttribute("d", buildPath(this.a.commands, this.a.nums));
  }

  /** t = 0 (from) .. 1 (to) */
  set(t) {
    const { commands, nums: from } = this.a;
    const to = this.b.nums;
    const mixed = new Array(from.length);
    for (let i = 0; i < from.length; i++) {
      mixed[i] = from[i] + (to[i] - from[i]) * t;
    }
    this.el.setAttribute("d", buildPath(commands, mixed));
  }
}

/* ---------- per-button controller ---------- */

function snapping() {
  return reduceBox.checked || REDUCED.matches;
}

class IconToggle {
  constructor(btn) {
    this.btn = btn;
    this.name = btn.dataset.icon;
    this.on = false;
    this.t = 0;
    this.raf = 0;

    this.morphers = [...btn.querySelectorAll("[data-morph]")].map((p) => new Morpher(p));

    // the check icon draws its tick with a dash offset instead of a morph
    this.tick = btn.querySelector(".tick");
    if (this.tick) {
      this.tickLen = this.tick.getTotalLength();
      this.tick.style.strokeDasharray = this.tickLen;
      this.tick.style.strokeDashoffset = this.tickLen;
    }

    btn.addEventListener("click", () => this.toggle());
    this.render(0);
  }

  render(t) {
    const e = easeInOut(t);
    for (const m of this.morphers) m.set(e);
    if (this.tick) this.tick.style.strokeDashoffset = String(this.tickLen * (1 - e));
  }

  toggle() {
    this.on = !this.on;
    const target = this.on ? 1 : 0;

    const [label, aria] = LABELS[this.name][this.on ? "on" : "off"];
    this.btn.setAttribute("aria-pressed", String(this.on));
    this.btn.setAttribute("aria-label", aria);
    if (this.btn.hasAttribute("aria-expanded")) {
      this.btn.setAttribute("aria-expanded", String(this.on));
    }
    this.btn.querySelector(".icon-btn__label").textContent = label;
    status.textContent = `${aria} — state: ${this.on ? "on" : "off"}`;

    cancelAnimationFrame(this.raf);

    if (snapping()) {
      this.t = target;
      this.render(target);
      return;
    }

    const start = performance.now();
    const from = this.t;
    const delta = target - from;
    // shorten the tween if we interrupt mid-flight
    const dur = DURATION * Math.max(0.25, Math.abs(delta));

    const step = (now) => {
      const p = Math.min(1, (now - start) / dur);
      this.t = from + delta * p;
      this.render(this.t);
      if (p < 1) this.raf = requestAnimationFrame(step);
    };
    this.raf = requestAnimationFrame(step);
  }
}

const toggles = [...document.querySelectorAll(".icon-btn")].map((b) => new IconToggle(b));

reduceBox.addEventListener("change", () => {
  status.textContent = snapping()
    ? "Reduced motion: state changes apply instantly."
    : "Motion enabled: paths tween between keyframes.";
  for (const t of toggles) {
    cancelAnimationFrame(t.raf);
    t.t = t.on ? 1 : 0;
    t.render(t.t);
  }
});
