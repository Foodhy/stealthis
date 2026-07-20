/**
 * Local password entropy scoring.
 * Estimates bits of entropy from the effective character pool, then subtracts
 * penalties for repeats, sequences, keyboard runs and dictionary words.
 * Nothing is ever transmitted.
 */

const form = document.querySelector(".pw");
const input = document.querySelector("#password");
const reveal = document.querySelector(".pw__reveal");
const bar = document.querySelector(".pw__bar");
const segs = [...bar.querySelectorAll(".pw__seg")];
const label = document.querySelector("#strength-label");
const entropyOut = document.querySelector("#entropy-out");
const crackOut = document.querySelector("#crack-time");
const submit = document.querySelector(".pw__submit");
const ruleEls = new Map(
  [...document.querySelectorAll(".pw__rules li")].map((li) => [li.dataset.rule, li])
);

const COMMON = [
  "password", "passwd", "qwerty", "letmein", "welcome", "admin", "iloveyou",
  "dragon", "monkey", "football", "baseball", "master", "sunshine", "princess",
  "login", "abc123", "trustno1", "shadow", "superman", "batman", "hello",
];
const ROWS = ["1234567890", "qwertyuiop", "asdfghjkl", "zxcvbnm", "abcdefghijklmnopqrstuvwxyz"];

/** Size of the character pool actually used. */
function poolSize(pw) {
  let n = 0;
  if (/[a-z]/.test(pw)) n += 26;
  if (/[A-Z]/.test(pw)) n += 26;
  if (/[0-9]/.test(pw)) n += 10;
  if (/[^A-Za-z0-9]/.test(pw)) n += 33;
  // Any character outside ASCII widens the pool considerably.
  if (/[^\x20-\x7e]/.test(pw)) n += 100;
  return n;
}

/** Longest run of characters that follow a keyboard row / alphabet / digits. */
function longestRun(pw) {
  const low = pw.toLowerCase();
  let best = 0;
  for (const row of ROWS) {
    const rev = [...row].reverse().join("");
    for (const source of [row, rev]) {
      for (let i = 0; i < low.length; i++) {
        let len = 0;
        while (
          i + len < low.length &&
          source.indexOf(low.slice(i, i + len + 1)) !== -1 &&
          len + 1 <= source.length
        ) len++;
        if (len > best) best = len;
      }
    }
  }
  return best;
}

/** Longest immediately repeated character or repeated chunk ("abcabc"). */
function repetitionPenalty(pw) {
  let penalty = 0;
  let run = 1;
  for (let i = 1; i < pw.length; i++) {
    run = pw[i] === pw[i - 1] ? run + 1 : 1;
    if (run >= 3) penalty += 2;
  }
  for (let size = 1; size <= Math.floor(pw.length / 2); size++) {
    const chunk = pw.slice(0, size);
    if (chunk.repeat(Math.ceil(pw.length / size)).slice(0, pw.length) === pw) {
      penalty += pw.length - size; // "abcabcabc" is barely longer than "abc"
      break;
    }
  }
  return penalty;
}

function dictionaryHit(pw) {
  const low = pw.toLowerCase().replace(/0/g, "o").replace(/1/g, "l").replace(/3/g, "e").replace(/@/g, "a").replace(/\$/g, "s");
  return COMMON.find((w) => low.includes(w)) || null;
}

function analyze(pw) {
  const rules = {
    length: pw.length >= 12,
    case: /[a-z]/.test(pw) && /[A-Z]/.test(pw),
    digit: /[0-9]/.test(pw),
    symbol: /[^A-Za-z0-9]/.test(pw),
    varied: true,
  };

  const pool = poolSize(pw);
  let bits = pw.length > 0 ? pw.length * Math.log2(Math.max(pool, 2)) : 0;

  const run = longestRun(pw);
  const reps = repetitionPenalty(pw);
  const word = dictionaryHit(pw);
  const unique = new Set(pw).size;

  let advice = "";
  if (run >= 4) { bits -= (run - 3) * 4; advice = "Avoid keyboard or alphabet runs."; }
  if (reps > 0) { bits -= reps * 2; advice ||= "Avoid repeated characters."; }
  if (word) { bits -= 14; advice ||= `“${word}” is a very common word.`; }
  if (pw.length > 4 && unique <= Math.ceil(pw.length / 3)) {
    bits -= 8;
    advice ||= "Use more distinct characters.";
  }
  rules.varied = pw.length > 0 && run < 4 && reps === 0 && !word;

  bits = Math.max(0, Math.round(bits));

  let level = 0;
  if (bits >= 90) level = 4;
  else if (bits >= 60) level = 3;
  else if (bits >= 40) level = 2;
  else if (bits > 0) level = 1;

  if (!advice) {
    if (!rules.length) advice = "Length beats complexity — aim for 12+.";
    else if (!rules.case) advice = "Mix upper and lower case.";
    else if (!rules.digit) advice = "Add a number.";
    else if (!rules.symbol) advice = "Add a symbol.";
  }

  return { bits, level, rules, advice };
}

/** 10^10 guesses/sec offline attack against 2^bits keyspace (half on average). */
function crackTime(bits) {
  if (bits === 0) return "—";
  const seconds = Math.pow(2, bits - 1) / 1e10;
  const units = [
    [1, "second"], [60, "minute"], [3600, "hour"], [86400, "day"],
    [2592000, "month"], [31536000, "year"], [31536000 * 1000, "millennium"],
  ];
  if (seconds < 1) return "instantly";
  let chosen = units[0];
  for (const u of units) if (seconds >= u[0]) chosen = u;
  const n = seconds / chosen[0];
  if (n > 1e6) return `${n.toExponential(1)} ${chosen[1]}s`;
  const rounded = n < 10 ? n.toFixed(1) : Math.round(n).toLocaleString();
  return `${rounded} ${chosen[1]}${n >= 2 ? "s" : ""}`;
}

const LEVEL_NAMES = ["Enter a password", "Very weak", "Weak", "Good", "Strong"];

function render() {
  const pw = input.value;
  const { bits, level, rules, advice } = analyze(pw);

  bar.dataset.level = String(level);
  segs.forEach((seg, i) => seg.classList.toggle("is-on", i < level));

  const name = LEVEL_NAMES[level];
  label.textContent = pw && advice ? `${name} — ${advice}` : name;
  label.dataset.level = String(level);
  entropyOut.textContent = `${bits} bits`;
  crackOut.textContent = crackTime(bits);

  for (const [key, el] of ruleEls) el.classList.toggle("is-met", rules[key]);

  submit.disabled = level < 3;
}

input.addEventListener("input", render);

reveal.addEventListener("click", () => {
  const shown = input.type === "text";
  input.type = shown ? "password" : "text";
  reveal.setAttribute("aria-pressed", String(!shown));
  reveal.setAttribute("aria-label", shown ? "Show password" : "Hide password");
  reveal.textContent = shown ? "Show" : "Hide";
  input.focus();
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  submit.textContent = "Password accepted";
  submit.classList.add("is-done");
});

render();
