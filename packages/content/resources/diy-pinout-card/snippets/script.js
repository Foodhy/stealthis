/* =========================================================
   Forge Nano MK-1 — interactive pinout card
   Vanilla JS, no dependencies.
   ========================================================= */

(function () {
  "use strict";

  /* ---------- pin data ---------- */
  // cats: power | digital | analog | comm  (a pin can belong to several)
  // primary: category used for pad color
  var PINS = [
    // LEFT SIDE — top to bottom
    { id: "L01", name: "TX1", label: "TX1", side: "L", primary: "comm", cats: ["digital", "comm"], caps: ["Digital", "UART"], volt: "3.3 V logic", current: "12 mA", desc: "Hardware UART transmit line. Shared with the USB bridge during flashing.", snip: "Serial1.begin(115200);\nSerial1.println(\"hello bench\");" },
    { id: "L02", name: "RX0", label: "RX0", side: "L", primary: "comm", cats: ["digital", "comm"], caps: ["Digital", "UART"], volt: "3.3 V logic", current: "12 mA", desc: "Hardware UART receive line. 5 V-tolerant through the input clamp.", snip: "if (Serial1.available()) {\n  char c = Serial1.read();\n}" },
    { id: "L03", name: "RST", label: "RST", side: "L", primary: "power", cats: ["power"], caps: ["Power"], volt: "3.3 V, active LOW", current: "—", desc: "Pull low for 2 ms to reset the SF-32 core. Tied to the bench reset button.", snip: "// Hardware only — pulse LOW to reset\n// (no sketch code required)" },
    { id: "L04", name: "GND", label: "GND", side: "L", primary: "power", cats: ["power"], caps: ["Power"], volt: "0 V", current: "return path", desc: "Common ground. Star-ground your sensors here to keep analog reads quiet.", snip: "// Tie all module GNDs together\n// before powering anything up" },
    { id: "L05", name: "D2", label: "D2", side: "L", primary: "digital", cats: ["digital"], caps: ["Digital"], volt: "3.3 V logic", current: "12 mA", desc: "General-purpose I/O with external interrupt INT0. Great for encoders.", snip: "attachInterrupt(digitalPinToInterrupt(2),\n  onTick, RISING);" },
    { id: "L06", name: "D3", label: "D3 ~", side: "L", primary: "digital", cats: ["digital"], caps: ["Digital", "PWM"], volt: "3.3 V logic", current: "12 mA", desc: "PWM-capable I/O on timer T2 plus interrupt INT1. Dim LEDs or drive a servo.", snip: "analogWrite(3, 128); // 50% duty" },
    { id: "L07", name: "D4", label: "D4", side: "L", primary: "digital", cats: ["digital"], caps: ["Digital"], volt: "3.3 V logic", current: "12 mA", desc: "Plain digital I/O. Boot-safe: floats high-Z during reset.", snip: "pinMode(4, INPUT_PULLUP);\nbool pressed = !digitalRead(4);" },
    { id: "L08", name: "D5", label: "D5 ~", side: "L", primary: "digital", cats: ["digital"], caps: ["Digital", "PWM"], volt: "3.3 V logic", current: "12 mA", desc: "High-frequency PWM on timer T0 — the go-to pin for motor drivers.", snip: "analogWriteFreq(20000);\nanalogWrite(5, 200);" },
    { id: "L09", name: "D6", label: "D6 ~", side: "L", primary: "digital", cats: ["digital"], caps: ["Digital", "PWM"], volt: "3.3 V logic", current: "12 mA", desc: "PWM output paired with D5 on timer T0. Good for the second motor channel.", snip: "analogWrite(6, 90); // channel B" },
    { id: "L10", name: "D7", label: "D7", side: "L", primary: "digital", cats: ["digital"], caps: ["Digital"], volt: "3.3 V logic", current: "12 mA", desc: "Digital I/O commonly used as a chip-enable for radio breakouts.", snip: "digitalWrite(7, HIGH); // enable radio" },
    { id: "L11", name: "D8", label: "D8", side: "L", primary: "digital", cats: ["digital"], caps: ["Digital"], volt: "3.3 V logic", current: "12 mA", desc: "Digital I/O with input-capture on timer T1 — ideal for reading RC pulses.", snip: "unsigned long t =\n  pulseIn(8, HIGH, 25000);" },
    { id: "L12", name: "D9", label: "D9 ~", side: "L", primary: "digital", cats: ["digital"], caps: ["Digital", "PWM"], volt: "3.3 V logic", current: "12 mA", desc: "16-bit PWM on timer T1 — the smoothest servo pin on the board.", snip: "servo.attach(9);\nservo.write(90);" },
    { id: "L13", name: "D10", label: "D10 ~", side: "L", primary: "comm", cats: ["digital", "comm"], caps: ["Digital", "PWM", "SPI"], volt: "3.3 V logic", current: "12 mA", desc: "SPI chip-select (CS) with 16-bit PWM as a bonus. Keep it OUTPUT in SPI master mode.", snip: "pinMode(10, OUTPUT);\ndigitalWrite(10, LOW); // select" },
    { id: "L14", name: "D11", label: "D11 ~", side: "L", primary: "comm", cats: ["digital", "comm"], caps: ["Digital", "PWM", "SPI"], volt: "3.3 V logic", current: "12 mA", desc: "SPI MOSI — data out to displays, SD cards and flash chips.", snip: "SPI.begin();\nSPI.transfer(0x9F); // JEDEC ID" },
    { id: "L15", name: "D12", label: "D12", side: "L", primary: "comm", cats: ["digital", "comm"], caps: ["Digital", "SPI"], volt: "3.3 V logic", current: "12 mA", desc: "SPI MISO — data back from the peripheral. Input by default in master mode.", snip: "byte id = SPI.transfer(0x00);" },

    // RIGHT SIDE — top to bottom
    { id: "R01", name: "D13", label: "D13", side: "R", primary: "comm", cats: ["digital", "comm"], caps: ["Digital", "SPI"], volt: "3.3 V logic", current: "12 mA", desc: "SPI SCK, wired to the onboard status LED. Blinks during SPI bursts — free debug light.", snip: "pinMode(13, OUTPUT);\ndigitalWrite(13, HIGH); // LED on" },
    { id: "R02", name: "3V3", label: "3V3", side: "R", primary: "power", cats: ["power"], caps: ["Power"], volt: "3.3 V out", current: "400 mA max", desc: "Regulated 3.3 V rail from the onboard LDO. Powers most sensor breakouts directly.", snip: "// Sensor VCC → 3V3\n// Sensor GND → GND" },
    { id: "R03", name: "AREF", label: "AREF", side: "R", primary: "analog", cats: ["analog"], caps: ["Analog"], volt: "0 – 3.3 V in", current: "—", desc: "External ADC reference input. Feed it a precision 2.500 V source for tighter reads.", snip: "analogReference(EXTERNAL);\nint raw = analogRead(A0);" },
    { id: "R04", name: "A0", label: "A0", side: "R", primary: "analog", cats: ["analog", "digital"], caps: ["Analog", "Digital"], volt: "0 – 3.3 V in", current: "12 mA", desc: "12-bit ADC channel 0. The classic potentiometer / battery-divider pin.", snip: "int mv = analogRead(A0) * 3300 / 4095;" },
    { id: "R05", name: "A1", label: "A1", side: "R", primary: "analog", cats: ["analog", "digital"], caps: ["Analog", "Digital"], volt: "0 – 3.3 V in", current: "12 mA", desc: "ADC channel 1 — pairs with A0 for differential-style sensor reads.", snip: "int light = analogRead(A1);" },
    { id: "R06", name: "A2", label: "A2", side: "R", primary: "analog", cats: ["analog", "digital"], caps: ["Analog", "Digital"], volt: "0 – 3.3 V in", current: "12 mA", desc: "ADC channel 2 with a touch-sense alternate function for capacitive pads.", snip: "int touch = touchRead(A2);" },
    { id: "R07", name: "A3", label: "A3", side: "R", primary: "analog", cats: ["analog", "digital"], caps: ["Analog", "Digital"], volt: "0 – 3.3 V in", current: "12 mA", desc: "ADC channel 3. Doubles as a wake-from-sleep input on the SF-32.", snip: "int soil = analogRead(A3);" },
    { id: "R08", name: "A4", label: "A4 SDA", side: "R", primary: "comm", cats: ["analog", "comm"], caps: ["Analog", "I2C"], volt: "3.3 V logic", current: "12 mA", desc: "I2C data line (SDA), shared with ADC channel 4. Onboard 4.7 kΩ pull-up.", snip: "Wire.begin();\nWire.beginTransmission(0x3C);" },
    { id: "R09", name: "A5", label: "A5 SCL", side: "R", primary: "comm", cats: ["analog", "comm"], caps: ["Analog", "I2C"], volt: "3.3 V logic", current: "12 mA", desc: "I2C clock line (SCL), shared with ADC channel 5. 400 kHz fast-mode capable.", snip: "Wire.setClock(400000); // fast mode" },
    { id: "R10", name: "A6", label: "A6", side: "R", primary: "analog", cats: ["analog"], caps: ["Analog"], volt: "0 – 3.3 V in", current: "—", desc: "Analog-only input (no digital driver). Perfect for a quiet thermistor read.", snip: "float t = readThermC(analogRead(A6));" },
    { id: "R11", name: "A7", label: "A7", side: "R", primary: "analog", cats: ["analog"], caps: ["Analog"], volt: "0 – 3.3 V in", current: "—", desc: "Analog-only input, routed away from the switcher for the lowest noise floor.", snip: "int vbat = analogRead(A7);" },
    { id: "R12", name: "5V", label: "5V", side: "R", primary: "power", cats: ["power"], caps: ["Power"], volt: "5.0 V out", current: "800 mA max", desc: "USB-fed 5 V rail. Powers strips and servos — never feed it back while on USB.", snip: "// NeoPixel VCC → 5V\n// Add a 1000 µF cap across the rail" },
    { id: "R13", name: "RST2", label: "RST", side: "R", primary: "power", cats: ["power"], caps: ["Power"], volt: "3.3 V, active LOW", current: "—", desc: "Second reset pad, mirrored for shield layouts. Electrically tied to L03.", snip: "// Same net as pin L03 (RST)" },
    { id: "R14", name: "GND2", label: "GND", side: "R", primary: "power", cats: ["power"], caps: ["Power"], volt: "0 V", current: "return path", desc: "Ground pad on the analog side — reference your ADC dividers here.", snip: "// Divider bottom leg → this GND" },
    { id: "R15", name: "VIN", label: "VIN", side: "R", primary: "power", cats: ["power"], caps: ["Power"], volt: "6 – 16 V in", current: "1 A max", desc: "Unregulated input to the onboard buck. Feed it a battery pack or wall wart.", snip: "// 2S LiPo (7.4 V) → VIN\n// Mind the polarity marking!" },
  ];

  var CAT_COLORS = {
    power: "#d4503e",
    digital: "#ff6b35",
    analog: "#2f9e6f",
    comm: "#4f8fd0",
  };

  var CAT_LABELS = {
    power: "POWER",
    digital: "DIGITAL I/O",
    analog: "ANALOG",
    comm: "COMMUNICATION",
  };

  /* ---------- dom refs ---------- */
  var svg = document.getElementById("boardSvg");
  var boardWrap = document.getElementById("boardWrap");
  var tooltip = document.getElementById("tooltip");
  var toastEl = document.getElementById("toast");
  var filterCount = document.getElementById("filterCount");

  var detailEmpty = document.getElementById("detailEmpty");
  var detailBody = document.getElementById("detailBody");
  var dId = document.getElementById("dId");
  var dCat = document.getElementById("dCat");
  var dName = document.getElementById("dName");
  var dDesc = document.getElementById("dDesc");
  var dChips = document.getElementById("dChips");
  var dVolt = document.getElementById("dVolt");
  var dCurrent = document.getElementById("dCurrent");
  var dSnippet = document.getElementById("dSnippet");
  var copyBtn = document.getElementById("copyBtn");
  var compareBtn = document.getElementById("compareBtn");
  var compareClear = document.getElementById("compareClear");
  var cslotA = document.getElementById("cslotA");
  var cslotB = document.getElementById("cslotB");

  var state = {
    filter: "all",
    selected: null, // pin id
    compare: [], // up to 2 pin ids
  };

  var toastTimer = null;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-on");
    }, 2200);
  }

  function byId(id) {
    for (var i = 0; i < PINS.length; i++) if (PINS[i].id === id) return PINS[i];
    return null;
  }

  /* ---------- build SVG board ---------- */
  var NS = "http://www.w3.org/2000/svg";
  function el(tag, attrs) {
    var node = document.createElementNS(NS, tag);
    for (var k in attrs) node.setAttribute(k, attrs[k]);
    return node;
  }

  var TOP = 78; // first pin y
  var PITCH = 37;
  var LX = 34; // left pad x
  var RX = 346; // right pad x

  function buildBoard() {
    // PCB body — blueprint navy with rounded corners
    svg.appendChild(el("rect", { x: 14, y: 10, width: 352, height: 644, rx: 18, fill: "#0f2a4a", stroke: "#0a1e36", "stroke-width": 3 }));
    // inner grid feel: subtle silkscreen frame
    svg.appendChild(el("rect", { x: 26, y: 22, width: 328, height: 620, rx: 12, fill: "none", stroke: "rgba(140,180,220,0.25)", "stroke-width": 1, "stroke-dasharray": "5 5" }));

    // USB-C connector at top
    svg.appendChild(el("rect", { x: 150, y: 2, width: 80, height: 40, rx: 8, fill: "#9aa7b4", stroke: "#6b7885", "stroke-width": 2 }));
    svg.appendChild(el("rect", { x: 162, y: 12, width: 56, height: 20, rx: 6, fill: "#3d4a57" }));

    // mounting holes
    [[40, 40], [340, 40], [40, 624], [340, 624]].forEach(function (p) {
      svg.appendChild(el("circle", { cx: p[0], cy: p[1], r: 7, fill: "#0a1e36", stroke: "rgba(217,199,167,0.6)", "stroke-width": 2 }));
    });

    // MCU chip
    var chipG = el("g", {});
    chipG.appendChild(el("rect", { x: 128, y: 250, width: 124, height: 124, rx: 8, fill: "#0a1e36", stroke: "#16385f", "stroke-width": 2 }));
    // chip legs
    for (var i = 0; i < 7; i++) {
      chipG.appendChild(el("rect", { x: 138 + i * 16, y: 242, width: 7, height: 8, fill: "#8fa3b8" }));
      chipG.appendChild(el("rect", { x: 138 + i * 16, y: 374, width: 7, height: 8, fill: "#8fa3b8" }));
    }
    var chipTxt = el("text", { x: 190, y: 306, "text-anchor": "middle", class: "pin-label", "font-size": 13 });
    chipTxt.textContent = "SF-32";
    var chipTxt2 = el("text", { x: 190, y: 324, "text-anchor": "middle", class: "pin-label", "font-size": 10, fill: "rgba(217,199,167,0.8)" });
    chipTxt2.textContent = "KESTREL";
    chipG.appendChild(chipTxt);
    chipG.appendChild(chipTxt2);
    chipG.appendChild(el("circle", { cx: 140, cy: 262, r: 3.5, fill: "#ff6b35" })); // pin-1 dot
    svg.appendChild(chipG);

    // crystal + passives for flavor
    svg.appendChild(el("rect", { x: 160, y: 420, width: 60, height: 24, rx: 12, fill: "#c9cfd6", stroke: "#8fa3b8", "stroke-width": 1.5 }));
    var xt = el("text", { x: 190, y: 436, "text-anchor": "middle", "font-size": 9, fill: "#3d4a57", "font-family": '"JetBrains Mono", monospace', "font-weight": 700 });
    xt.textContent = "16.000";
    svg.appendChild(xt);
    [[150, 480], [178, 480], [206, 480], [234, 480]].forEach(function (p, idx) {
      svg.appendChild(el("rect", { x: p[0], y: p[1], width: 18, height: 9, rx: 2, fill: idx % 2 ? "#b78650" : "#4a5a6a" }));
    });

    // status LED next to D13
    svg.appendChild(el("rect", { x: 96, y: 72, width: 12, height: 12, rx: 2, fill: "#ffd166", stroke: "rgba(255,255,255,0.4)" }));
    var ledTxt = el("text", { x: 116, y: 82, "font-size": 8.5, class: "pin-label", fill: "rgba(217,199,167,0.7)" });
    ledTxt.textContent = "LED";
    svg.appendChild(ledTxt);

    // silkscreen title
    var t1 = el("text", { x: 190, y: 560, "text-anchor": "middle", class: "pin-label", "font-size": 14, fill: "#efe6d4" });
    t1.textContent = "FORGE NANO MK-1";
    var t2 = el("text", { x: 190, y: 578, "text-anchor": "middle", class: "pin-label", "font-size": 9, fill: "rgba(217,199,167,0.7)" });
    t2.textContent = "TINKER & BOLT LABS · REV C";
    svg.appendChild(t1);
    svg.appendChild(t2);

    // pins
    PINS.forEach(function (pin, idx) {
      var row = idx % 15;
      var y = TOP + row * PITCH;
      var x = pin.side === "L" ? LX : RX;
      var g = el("g", {
        class: "pin",
        tabindex: "0",
        role: "button",
        "data-id": pin.id,
        "aria-label": pin.name + " pin. " + pin.caps.join(", ") + ". " + pin.volt + ". Press Enter to inspect.",
      });

      // castellated pad
      g.appendChild(el("circle", { class: "pad-ring", cx: x, cy: y, r: 12 }));
      g.appendChild(el("circle", { class: "pad", cx: x, cy: y, r: 9, fill: CAT_COLORS[pin.primary], stroke: "rgba(255,255,255,0.55)", "stroke-width": 1.5 }));
      g.appendChild(el("circle", { cx: x, cy: y, r: 3.2, fill: "#0a1e36" }));

      // label
      var label = el("text", {
        class: "pin-label",
        x: pin.side === "L" ? x + 18 : x - 18,
        y: y + 4,
        "text-anchor": pin.side === "L" ? "start" : "end",
      });
      label.textContent = pin.label;
      g.appendChild(label);

      // large invisible hit area
      g.appendChild(el("rect", {
        class: "pin-hit",
        x: pin.side === "L" ? x - 16 : x - 64,
        y: y - PITCH / 2 + 2,
        width: 80,
        height: PITCH - 4,
      }));

      svg.appendChild(g);
    });
  }

  /* ---------- selection + detail panel ---------- */
  function capChipHtml(cap) {
    return '<span class="cap-chip" data-cap="' + cap + '">' + cap + "</span>";
  }

  function selectPin(id) {
    state.selected = id;
    var pin = byId(id);
    if (!pin) return;

    // svg highlight
    var groups = svg.querySelectorAll(".pin");
    groups.forEach(function (g) {
      g.classList.toggle("is-selected", g.getAttribute("data-id") === id);
    });

    detailEmpty.hidden = true;
    detailBody.hidden = false;
    dId.textContent = "PIN " + pin.id;
    dCat.textContent = CAT_LABELS[pin.primary];
    dName.textContent = pin.name;
    dDesc.textContent = pin.desc;
    dChips.innerHTML = pin.caps.map(capChipHtml).join("");
    dVolt.textContent = pin.volt;
    dCurrent.textContent = pin.current;
    dSnippet.textContent = pin.snip;
  }

  /* ---------- filter ---------- */
  function applyFilter(filter) {
    state.filter = filter;
    var visible = 0;
    svg.querySelectorAll(".pin").forEach(function (g) {
      var pin = byId(g.getAttribute("data-id"));
      var match = filter === "all" || pin.cats.indexOf(filter) !== -1;
      g.classList.toggle("is-dim", !match);
      if (match) visible++;
    });
    filterCount.textContent = visible + " / " + PINS.length + " pins";

    document.querySelectorAll(".fchip").forEach(function (btn) {
      var on = btn.getAttribute("data-filter") === filter;
      btn.classList.toggle("is-active", on);
      btn.setAttribute("aria-pressed", String(on));
    });
  }

  /* ---------- tooltip ---------- */
  function showTooltip(pin, evt) {
    tooltip.innerHTML =
      "<strong>" + pin.name + "</strong><span>" + pin.caps.join(" · ") + " — " + pin.volt + "</span>";
    tooltip.classList.add("is-on");
    tooltip.setAttribute("aria-hidden", "false");
    moveTooltip(evt);
  }

  function moveTooltip(evt) {
    var rect = boardWrap.getBoundingClientRect();
    var x = evt.clientX - rect.left + 14;
    var y = evt.clientY - rect.top - 10;
    // keep inside wrap
    var maxX = rect.width - tooltip.offsetWidth - 8;
    if (x > maxX) x = evt.clientX - rect.left - tooltip.offsetWidth - 14;
    tooltip.style.left = x + "px";
    tooltip.style.top = y + "px";
  }

  function hideTooltip() {
    tooltip.classList.remove("is-on");
    tooltip.setAttribute("aria-hidden", "true");
  }

  /* ---------- compare strip ---------- */
  function renderCompare() {
    [cslotA, cslotB].forEach(function (slot, i) {
      var id = state.compare[i];
      if (!id) {
        slot.classList.remove("is-filled");
        slot.innerHTML =
          '<div class="cslot__empty mono">SLOT ' + (i === 0 ? "A" : "B") + " — EMPTY</div>";
        return;
      }
      var pin = byId(id);
      slot.classList.add("is-filled");
      slot.innerHTML =
        '<div class="cslot__head"><span class="cslot__id">' + pin.id + "</span>" +
        '<span class="cslot__name">' + pin.name + "</span></div>" +
        '<div class="cslot__chips">' + pin.caps.map(capChipHtml).join("") + "</div>" +
        '<div class="cslot__row"><span class="k">Voltage</span><span class="v">' + pin.volt + "</span></div>" +
        '<div class="cslot__row"><span class="k">Max current</span><span class="v">' + pin.current + "</span></div>" +
        '<div class="cslot__row"><span class="k">Category</span><span class="v">' + CAT_LABELS[pin.primary] + "</span></div>";
    });
  }

  function addToCompare(id) {
    if (state.compare.indexOf(id) !== -1) {
      toast("Pin " + byId(id).name + " is already on the strip");
      return;
    }
    if (state.compare.length >= 2) state.compare.shift();
    state.compare.push(id);
    renderCompare();
    toast("Pinned " + byId(id).name + " to compare strip");
  }

  /* ---------- events ---------- */
  svg.addEventListener("click", function (evt) {
    var g = evt.target.closest(".pin");
    if (!g) return;
    selectPin(g.getAttribute("data-id"));
  });

  svg.addEventListener("keydown", function (evt) {
    var g = evt.target.closest(".pin");
    if (!g) return;
    if (evt.key === "Enter" || evt.key === " ") {
      evt.preventDefault();
      selectPin(g.getAttribute("data-id"));
    }
  });

  svg.addEventListener("mouseover", function (evt) {
    var g = evt.target.closest(".pin");
    if (!g) return;
    showTooltip(byId(g.getAttribute("data-id")), evt);
  });

  svg.addEventListener("mousemove", function (evt) {
    if (!tooltip.classList.contains("is-on")) return;
    if (!evt.target.closest(".pin")) { hideTooltip(); return; }
    moveTooltip(evt);
  });

  svg.addEventListener("mouseout", function (evt) {
    var g = evt.target.closest(".pin");
    if (g && !g.contains(evt.relatedTarget)) hideTooltip();
  });

  document.querySelectorAll(".fchip").forEach(function (btn) {
    btn.addEventListener("click", function () {
      applyFilter(btn.getAttribute("data-filter"));
    });
  });

  compareBtn.addEventListener("click", function () {
    if (!state.selected) return;
    addToCompare(state.selected);
  });

  compareClear.addEventListener("click", function () {
    if (!state.compare.length) { toast("Compare strip is already empty"); return; }
    state.compare = [];
    renderCompare();
    toast("Compare strip cleared");
  });

  copyBtn.addEventListener("click", function () {
    var text = dSnippet.textContent;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(
        function () { toast("Snippet copied to clipboard"); },
        function () { toast("Copy failed — select the text manually"); }
      );
    } else {
      toast("Clipboard unavailable — select the text manually");
    }
  });

  /* ---------- boot ---------- */
  buildBoard();
  applyFilter("all");
  renderCompare();
  selectPin("R01"); // start on D13 so the panel demos itself
})();
