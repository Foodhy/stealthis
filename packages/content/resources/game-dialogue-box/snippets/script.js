(function () {
  "use strict";

  // ---- Speakers ----
  var SPEAKERS = {
    vex: { id: "vex", name: "CDR. VEX", role: "Vanguard Lead", emote: null },
    kael: { id: "kael", name: "KAEL-9", role: "Rogue Synth", emote: "?" },
    echo: { id: "echo", name: "ECHO", role: "AI Scout", emote: null },
  };

  // ---- Conversation tree ----
  // Each node: speaker, text, then either `next` (continue) or `choices`.
  var TREE = {
    start: {
      speaker: "vex",
      text: "The reactor's gone dark, soldier. Whatever the Hollow Reign did down there, it's spreading. We move on my mark — but I need to know you're with me.",
      next: "vex2",
    },
    vex2: {
      speaker: "vex",
      text: "Last team that went in didn't come back. So tell me straight: how do you want to play this?",
      choices: [
        { label: "We go in loud. Burn it to the ground.", tag: "bold", to: "loud" },
        { label: "Quiet approach. We can't lose anyone else.", tag: "calm", to: "quiet" },
        { label: "What exactly is the Hollow Reign?", tag: "lore", to: "lore" },
      ],
    },
    loud: {
      speaker: "vex",
      text: "Ha — that's the Vanguard talking. I like it. But subtlety has its uses too. Patch in the scout, let's see what it found.",
      next: "echoIntro",
    },
    quiet: {
      speaker: "vex",
      text: "Smart. Reckless heroes fill the memorial wall. Stay sharp, stay low. I'll loop in the scout to map our route.",
      next: "echoIntro",
    },
    lore: {
      speaker: "vex",
      text: "A swarm-mind. It hollows you out and wears you like a coat. Half the men I trained are wearing the Reign's colors now. That's why this matters.",
      next: "vex2",
    },
    echoIntro: {
      speaker: "echo",
      text: "Scout online. I've mapped three corridors past the blast doors. One's collapsed. One's crawling with hostiles. The third... reads as empty. Too empty.",
      choices: [
        { label: "Take the empty corridor.", tag: "bold", to: "empty" },
        { label: "Echo, run a deeper scan first.", tag: "calm", to: "scan" },
      ],
    },
    empty: {
      speaker: "echo",
      text: "Acknowledged. Routing now. Commander — be advised, something just moved in that 'empty' corridor. Something that registers as friendly.",
      next: "kaelReveal",
    },
    scan: {
      speaker: "echo",
      text: "Deeper scan complete. There's a lifesign in the empty corridor — its transponder is one of ours. It's broadcasting an old Vanguard recognition code.",
      next: "kaelReveal",
    },
    kaelReveal: {
      speaker: "kael",
      text: "...Don't shoot. Please. It's me — what's left of me. The Reign got into my wetware, but I fought it back. I can get you to the reactor core. Trust me one more time, Commander.",
      choices: [
        { label: "Lower your weapon. We trust Kael.", tag: "calm", to: "trust" },
        { label: "Stand down. Synths don't get second chances.", tag: "bold", to: "distrust" },
      ],
    },
    trust: {
      speaker: "vex",
      text: "Stand down, all of you. Kael's bled for this unit before. We finish this together — or not at all. Move out.",
      next: "endTrust",
    },
    distrust: {
      speaker: "vex",
      text: "I can't risk the squad on a maybe. I'm sorry, Kael. Echo, override the door — we take the long way around.",
      next: "endCold",
    },
    endTrust: {
      speaker: "echo",
      text: "Squad regrouped. Path to the core is clear. Logging this as the moment the Vanguard refused to leave one of its own behind.",
      end: "SCENE COMPLETE — ‘FAITH HELD’",
    },
    endCold: {
      speaker: "echo",
      text: "Alternate route locked. The corridor seals behind us. Whatever Kael was... it's on the other side of that door now.",
      end: "SCENE COMPLETE — ‘THE LONG WAY’",
    },
  };

  // ---- DOM ----
  var dialogueEl = document.getElementById("dialogue");
  var portraitEl = document.getElementById("portrait");
  var emoteEl = document.getElementById("emote");
  var nameEl = document.getElementById("speakerName");
  var roleEl = document.getElementById("speakerRole");
  var lineEl = document.getElementById("line");
  var continueEl = document.getElementById("continue");
  var hintEl = document.getElementById("hint");
  var choicesEl = document.getElementById("choices");
  var speedEl = document.getElementById("speed");
  var restartBtn = document.getElementById("restart");
  var autoBtn = document.getElementById("autoBtn");
  var toastHost = document.getElementById("toastHost");

  // ---- State ----
  var typeSpeed = 28; // ms per char
  var current = "start";
  var fullText = "";
  var typing = false;
  var typeTimer = null;
  var autoTimer = null;
  var autoOn = false;

  // ---- Toast ----
  function toast(msg) {
    var t = document.createElement("div");
    t.className = "toast";
    t.textContent = msg;
    toastHost.appendChild(t);
    requestAnimationFrame(function () {
      t.classList.add("show");
    });
    setTimeout(function () {
      t.classList.remove("show");
      setTimeout(function () {
        t.remove();
      }, 280);
    }, 1900);
  }

  // ---- Speaker swap ----
  function setSpeaker(id) {
    var s = SPEAKERS[id] || SPEAKERS.vex;
    portraitEl.setAttribute("data-speaker", id);
    dialogueEl.setAttribute("data-speaker", id);
    nameEl.textContent = s.name;
    roleEl.textContent = s.role;
    if (s.emote) {
      emoteEl.textContent = s.emote;
      emoteEl.classList.add("show");
      setTimeout(function () {
        emoteEl.classList.remove("show");
      }, 900);
    } else {
      emoteEl.classList.remove("show");
    }
  }

  // ---- Typewriter ----
  function typeLine(text, onDone) {
    clearTimeout(typeTimer);
    fullText = text;
    typing = true;
    var i = 0;
    lineEl.textContent = "";
    var caret = document.createElement("span");
    caret.className = "caret";

    function tick() {
      if (i < text.length) {
        lineEl.textContent = text.slice(0, i + 1);
        lineEl.appendChild(caret);
        i++;
        typeTimer = setTimeout(tick, typeSpeed);
      } else {
        finishTyping(onDone);
      }
    }
    tick();
  }

  function finishTyping(onDone) {
    clearTimeout(typeTimer);
    typing = false;
    lineEl.textContent = fullText;
    if (typeof onDone === "function") onDone();
  }

  function skipTyping() {
    if (typing) {
      finishTyping(afterLine);
    }
  }

  // ---- Node rendering ----
  function renderNode(key) {
    var node = TREE[key];
    if (!node) return;
    current = key;
    setSpeaker(node.speaker);
    continueEl.classList.remove("show");
    continueEl.setAttribute("aria-hidden", "true");
    choicesEl.innerHTML = "";
    typeLine(node.text, afterLine);
  }

  // Called once a line finishes typing
  function afterLine() {
    var node = TREE[current];
    if (!node) return;

    if (node.choices) {
      renderChoices(node.choices);
    } else if (node.end) {
      renderEnd(node.end);
    } else if (node.next) {
      // show continue indicator
      continueEl.classList.add("show");
      continueEl.setAttribute("aria-hidden", "false");
      hintEl.textContent = autoOn ? "auto" : "click / space";
      if (autoOn) {
        clearTimeout(autoTimer);
        autoTimer = setTimeout(function () {
          advance();
        }, 1100);
      }
    }
  }

  function renderChoices(choices) {
    choicesEl.innerHTML = "";
    choices.forEach(function (c, idx) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "choice";
      btn.style.animationDelay = idx * 0.06 + "s";
      var label = document.createElement("span");
      label.textContent = c.label;
      btn.appendChild(label);
      if (c.tag) {
        var tag = document.createElement("span");
        tag.className = "tag " + c.tag;
        tag.textContent = c.tag.toUpperCase();
        btn.appendChild(tag);
      }
      btn.addEventListener("click", function () {
        renderNode(c.to);
      });
      choicesEl.appendChild(btn);
    });
    // focus first choice for keyboard users
    var first = choicesEl.querySelector(".choice");
    if (first) first.focus();
  }

  function renderEnd(label) {
    choicesEl.innerHTML = "";
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "choice is-end";
    btn.textContent = label + "  ·  ↺ Replay";
    btn.addEventListener("click", function () {
      restart();
    });
    choicesEl.appendChild(btn);
    btn.focus();
    toast("Scene complete");
  }

  // ---- Advance (continue indicator / space / click) ----
  function advance() {
    var node = TREE[current];
    if (!node) return;
    if (typing) {
      skipTyping();
      return;
    }
    if (node.next) {
      clearTimeout(autoTimer);
      renderNode(node.next);
    }
  }

  // ---- Controls ----
  function setSpeed(ms, btn) {
    typeSpeed = ms;
    Array.prototype.forEach.call(speedEl.querySelectorAll(".speed-btn"), function (b) {
      var active = b === btn;
      b.classList.toggle("is-active", active);
      b.setAttribute("aria-pressed", active ? "true" : "false");
    });
    if (typing) {
      // re-type remaining at new speed feel: just keep going, timer already uses typeSpeed
    }
  }

  function restart() {
    clearTimeout(autoTimer);
    clearTimeout(typeTimer);
    renderNode("start");
    toast("Scene restarted");
  }

  function toggleAuto() {
    autoOn = !autoOn;
    autoBtn.setAttribute("aria-pressed", autoOn ? "true" : "false");
    autoBtn.textContent = autoOn ? "⏸ Auto" : "▶ Auto";
    toast(autoOn ? "Auto-advance on" : "Auto-advance off");
    if (autoOn && !typing) {
      var node = TREE[current];
      if (node && node.next) {
        clearTimeout(autoTimer);
        autoTimer = setTimeout(advance, 800);
      }
    }
  }

  // ---- Events ----
  // Click anywhere on the dialogue box to fast-forward / continue
  dialogueEl.addEventListener("click", function (e) {
    if (e.target.closest(".choice")) return; // choices handle themselves
    advance();
  });

  document.addEventListener("keydown", function (e) {
    if (e.code === "Space" || e.code === "Enter") {
      var tag = (e.target.tagName || "").toLowerCase();
      // let Enter/Space work normally on choice buttons
      if (e.target.classList && e.target.classList.contains("choice")) return;
      if (tag === "button") return;
      e.preventDefault();
      advance();
    }
  });

  speedEl.addEventListener("click", function (e) {
    var btn = e.target.closest(".speed-btn");
    if (!btn) return;
    setSpeed(parseInt(btn.getAttribute("data-speed"), 10), btn);
  });

  restartBtn.addEventListener("click", restart);
  autoBtn.addEventListener("click", toggleAuto);

  // ---- Boot ----
  renderNode("start");
})();
