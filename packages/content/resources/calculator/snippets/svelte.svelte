<script>
const BUTTONS = [
  ["C", "+/-", "%", "÷"],
  ["7", "8", "9", "×"],
  ["4", "5", "6", "−"],
  ["1", "2", "3", "+"],
  ["0", ".", "="],
];

let display = "0";
let prev = null;
let op = null;
let waitNext = false;

function press(key) {
  if (key === "C") {
    display = "0";
    prev = null;
    op = null;
    waitNext = false;
    return;
  }
  if (key === "+/-") {
    display = String(-parseFloat(display));
    return;
  }
  if (key === "%") {
    display = String(parseFloat(display) / 100);
    return;
  }

  if (["÷", "×", "−", "+"].includes(key)) {
    prev = display;
    op = key;
    waitNext = true;
    return;
  }

  if (key === "=") {
    if (!op || !prev) return;
    const a = parseFloat(prev);
    const b = parseFloat(display);
    let result = 0;
    if (op === "÷") result = a / b;
    else if (op === "×") result = a * b;
    else if (op === "−") result = a - b;
    else if (op === "+") result = a + b;
    display = String(parseFloat(result.toPrecision(10)));
    prev = null;
    op = null;
    waitNext = false;
    return;
  }

  if (key === ".") {
    if (display.includes(".") && !waitNext) return;
    display = waitNext ? "0." : display + ".";
    waitNext = false;
    return;
  }

  display = waitNext ? key : display === "0" ? key : display + key;
  waitNext = false;
}

function btnClass(key) {
  if (["÷", "×", "−", "+", "="].includes(key)) return "op";
  if (["C", "+/-", "%"].includes(key)) return "func";
  return "num";
}

$: displayText = display.length > 9 ? parseFloat(display).toExponential(3) : display;
$: subDisplay = op ? `${prev} ${op}` : "";

const flat = BUTTONS.flat();
</script>

<style>
  .page { min-height: 100vh; background: #0d1117; display: flex; align-items: center; justify-content: center; padding: 1.5rem; }
  .calc { width: 280px; background: black; border-radius: 1.5rem; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); }
  .display-area { padding: 1.5rem 1.25rem 0.75rem; text-align: right; }
  .sub { color: #8b949e; font-size: 0.875rem; height: 1.25rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .main { color: white; font-size: 48px; font-weight: 300; line-height: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px; background: #1c1c1c; padding: 1px; }
  button {
    height: 4rem;
    border: none;
    border-radius: 0;
    font-size: 1.25rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: opacity 0.1s;
    font-family: inherit;
  }
  button:active { opacity: 0.7; }
  .num { background: #333333; color: white; }
  .num:hover { background: #4a4a4a; }
  .op { background: #f6901f; color: white; font-weight: 600; }
  .op:hover { background: #e8830a; }
  .func { background: #a5a5a5; color: black; font-weight: 600; }
  .func:hover { background: #bfbfbf; }
  .zero { grid-column: span 2; justify-content: flex-start; padding-left: 1.5rem; }
</style>

<div class="page">
  <div class="calc">
    <div class="display-area">
      <p class="sub">{subDisplay}</p>
      <p class="main">{displayText}</p>
    </div>
    <div class="grid">
      {#each flat as key}
        <button
          class="{btnClass(key)} {key === '0' ? 'zero' : ''}"
          on:click={() => press(key)}
        >
          {key}
        </button>
      {/each}
    </div>
  </div>
</div>
