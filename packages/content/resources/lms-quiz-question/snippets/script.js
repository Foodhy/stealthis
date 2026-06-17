(function () {
  "use strict";

  /* ---------- toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2400);
  }

  /* ---------- progress / scoring ---------- */
  var graded = {}; // id -> boolean correct
  var questions = Array.prototype.slice.call(document.querySelectorAll(".q"));
  var total = questions.length;
  document.getElementById("totalCount").textContent = String(total);

  function refreshProgress() {
    var ids = Object.keys(graded);
    var answered = ids.length;
    var correct = ids.filter(function (k) { return graded[k]; }).length;
    document.getElementById("answeredCount").textContent = String(answered);
    document.getElementById("progressBar").style.width =
      (answered / total) * 100 + "%";
    var chip = document.getElementById("scoreChip");
    if (answered > 0) {
      chip.hidden = false;
      document.getElementById("scoreVal").textContent = String(correct);
    }
  }

  function markGraded(q, correct, msg) {
    graded[q.id] = correct;
    q.classList.toggle("is-correct", correct);
    q.classList.toggle("is-wrong", !correct);
    var fb = q.querySelector("[data-feedback]");
    if (fb) {
      fb.textContent = msg;
      fb.className = "feedback show " + (correct ? "ok" : "no");
    }
    var btn = q.querySelector("[data-check]");
    if (btn) btn.classList.add("is-done");
    refreshProgress();
  }

  /* ---------- 1 & 3: single choice / true-false (radio behaviour) ---------- */
  function wireSingle(q) {
    var opts = q.querySelectorAll(".opt, .tf__btn");
    opts.forEach(function (opt) {
      function select() {
        opts.forEach(function (o) {
          o.classList.remove("is-selected");
          if (o.setAttribute) o.setAttribute("aria-checked", "false");
        });
        opt.classList.add("is-selected");
        if (opt.setAttribute) opt.setAttribute("aria-checked", "true");
      }
      opt.addEventListener("click", select);
      opt.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); select(); }
      });
    });
  }

  /* ---------- 2: multi-select (checkbox toggle) ---------- */
  function wireMulti(q) {
    q.querySelectorAll(".opt").forEach(function (opt) {
      function toggle() {
        var on = opt.classList.toggle("is-selected");
        opt.setAttribute("aria-checked", on ? "true" : "false");
      }
      opt.addEventListener("click", toggle);
      opt.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); }
      });
    });
  }

  /* ---------- 4: drag to match ---------- */
  function wireMatch(q) {
    var bank = q.querySelector("#bank");
    var chips = q.querySelectorAll(".chip");
    var slots = q.querySelectorAll(".slot");
    var armed = null; // keyboard-selected chip

    function placeChip(chip, dropEl) {
      var slot = dropEl.closest(".slot");
      // if slot already holds a chip, send it back to bank
      var existing = dropEl.querySelector(".chip");
      if (existing) bank.appendChild(existing);
      dropEl.textContent = "";
      dropEl.appendChild(chip);
      dropEl.classList.add("filled");
    }

    chips.forEach(function (chip) {
      chip.addEventListener("dragstart", function (e) {
        chip.classList.add("dragging");
        e.dataTransfer.setData("text/plain", chip.dataset.key);
        e.dataTransfer.effectAllowed = "move";
      });
      chip.addEventListener("dragend", function () {
        chip.classList.remove("dragging");
      });
      // keyboard: arm chip, then activate a slot
      chip.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          chips.forEach(function (c) { c.classList.remove("is-armed"); c.setAttribute("aria-grabbed", "false"); });
          if (armed === chip) { armed = null; }
          else { armed = chip; chip.classList.add("is-armed"); chip.setAttribute("aria-grabbed", "true"); toast("Now pick a row to drop into"); }
        }
      });
    });

    slots.forEach(function (slot) {
      var drop = slot.querySelector("[data-drop]");
      slot.addEventListener("dragover", function (e) { e.preventDefault(); slot.classList.add("drop-hover"); });
      slot.addEventListener("dragleave", function () { slot.classList.remove("drop-hover"); });
      slot.addEventListener("drop", function (e) {
        e.preventDefault();
        slot.classList.remove("drop-hover");
        var key = e.dataTransfer.getData("text/plain");
        var chip = q.querySelector('.chip[data-key="' + key + '"]');
        if (chip) placeChip(chip, drop);
      });
      // keyboard drop
      slot.addEventListener("click", function () {
        if (armed) {
          placeChip(armed, drop);
          armed.classList.remove("is-armed");
          armed.setAttribute("aria-grabbed", "false");
          armed = null;
        } else {
          // click a filled drop returns its chip to bank
          var inSlot = drop.querySelector(".chip");
          if (inSlot) { bank.appendChild(inSlot); drop.classList.remove("filled"); drop.textContent = "Drop here"; }
        }
      });
    });

    q.querySelector("[data-reset-match]").addEventListener("click", function () {
      q.querySelectorAll(".slot .chip").forEach(function (c) { bank.appendChild(c); });
      slots.forEach(function (s) {
        var d = s.querySelector("[data-drop]");
        d.classList.remove("filled");
        d.textContent = "Drop here";
        s.classList.remove("mark-correct", "mark-wrong");
      });
    });

    q._gradeMatch = function () {
      var answer = JSON.parse(q.dataset.answer);
      var allFilled = true, correct = 0;
      slots.forEach(function (slot) {
        var desc = slot.dataset.desc;
        var chip = slot.querySelector(".chip");
        slot.classList.remove("mark-correct", "mark-wrong");
        if (!chip) { allFilled = false; return; }
        var ok = answer[chip.dataset.key] === desc;
        slot.classList.add(ok ? "mark-correct" : "mark-wrong");
        if (ok) correct++;
      });
      if (!allFilled) { toast("Match every row first"); return null; }
      return { correct: correct === slots.length, score: correct, of: slots.length };
    };
  }

  /* ---------- 5: fill in the blank ---------- */
  function wireFill(q) {
    q._gradeFill = function () {
      var answers = JSON.parse(q.dataset.answer);
      var inputs = q.querySelectorAll("[data-blank]");
      var correct = 0;
      inputs.forEach(function (inp, i) {
        var val = inp.value.trim().toLowerCase().replace(/[;:]$/, "");
        var ok = val === String(answers[i]).toLowerCase();
        inp.classList.remove("mark-correct", "mark-wrong");
        inp.classList.add(ok ? "mark-correct" : "mark-wrong");
        if (ok) correct++;
      });
      return { correct: correct === answers.length, score: correct, of: answers.length };
    };
  }

  /* ---------- 6: code line ordering ---------- */
  function wireCode(q) {
    var list = q.querySelector("#codeLines");
    var dragEl = null;

    function lines() { return Array.prototype.slice.call(list.querySelectorAll(".line")); }

    list.querySelectorAll(".line").forEach(function (line) {
      line.addEventListener("dragstart", function () { dragEl = line; line.classList.add("dragging"); });
      line.addEventListener("dragend", function () {
        line.classList.remove("dragging");
        lines().forEach(function (l) { l.classList.remove("over"); });
      });
      line.addEventListener("dragover", function (e) {
        e.preventDefault();
        if (!dragEl || dragEl === line) return;
        lines().forEach(function (l) { l.classList.remove("over"); });
        line.classList.add("over");
      });
      line.addEventListener("drop", function (e) {
        e.preventDefault();
        if (!dragEl || dragEl === line) return;
        var arr = lines();
        var from = arr.indexOf(dragEl), to = arr.indexOf(line);
        if (from < to) line.after(dragEl); else line.before(dragEl);
        line.classList.remove("over");
      });
      // keyboard reorder
      line.addEventListener("keydown", function (e) {
        if (e.key === "ArrowUp" && line.previousElementSibling) {
          e.preventDefault(); line.parentNode.insertBefore(line, line.previousElementSibling); line.focus();
        } else if (e.key === "ArrowDown" && line.nextElementSibling) {
          e.preventDefault(); line.parentNode.insertBefore(line.nextElementSibling, line); line.focus();
        }
      });
    });

    q._gradeCode = function () {
      var want = q.dataset.answer.split(",");
      var order = lines().map(function (l) { return l.dataset.id; });
      var ok = order.join(",") === want.join(",");
      lines().forEach(function (l, i) {
        l.classList.remove("mark-correct", "mark-wrong");
        l.classList.add(l.dataset.id === want[i] ? "mark-correct" : "mark-wrong");
      });
      return { correct: ok };
    };
  }

  /* ---------- check dispatch ---------- */
  function checkQuestion(q) {
    var type = q.dataset.type;
    var msg, res;

    if (type === "single") {
      var sel = q.querySelector(".opt.is-selected");
      if (!sel) { toast("Pick an option first"); return; }
      q.querySelectorAll(".opt").forEach(function (o) {
        o.classList.remove("mark-correct", "mark-wrong");
        if (o.dataset.val === q.dataset.answer) o.classList.add("mark-correct");
        else if (o === sel) o.classList.add("mark-wrong");
      });
      var ok = sel.dataset.val === q.dataset.answer;
      markGraded(q, ok, ok ? "Correct — nicely done." : "Not quite. The highlighted option is right.");
      return;
    }

    if (type === "multi") {
      var want = q.dataset.answer.split(",");
      var chosen = Array.prototype.slice.call(q.querySelectorAll(".opt.is-selected"))
        .map(function (o) { return o.dataset.val; });
      if (chosen.length === 0) { toast("Select at least one option"); return; }
      q.querySelectorAll(".opt").forEach(function (o) {
        o.classList.remove("mark-correct", "mark-wrong", "mark-miss");
        var inAns = want.indexOf(o.dataset.val) > -1;
        var picked = o.classList.contains("is-selected");
        if (inAns && picked) o.classList.add("mark-correct");
        else if (!inAns && picked) o.classList.add("mark-wrong");
        else if (inAns && !picked) o.classList.add("mark-miss");
      });
      var allRight = want.length === chosen.length &&
        want.every(function (w) { return chosen.indexOf(w) > -1; });
      markGraded(q, allRight, allRight ? "Perfect — all three selected." : "Some are off — dashed = missed, red = wrong.");
      return;
    }

    if (type === "boolean") {
      var b = q.querySelector(".tf__btn.is-selected");
      if (!b) { toast("Choose True or False"); return; }
      q.querySelectorAll(".tf__btn").forEach(function (t) {
        t.classList.remove("mark-correct", "mark-wrong");
        if (t.dataset.val === q.dataset.answer) t.classList.add("mark-correct");
        else if (t === b) t.classList.add("mark-wrong");
      });
      var bok = b.dataset.val === q.dataset.answer;
      markGraded(q, bok, bok ? "Correct — display:none removes it entirely." : "False is right — display:none removes the node from a11y tree and focus.");
      return;
    }

    if (type === "match") {
      res = q._gradeMatch();
      if (!res) return;
      markGraded(q, res.correct, res.correct ? "All matched correctly." : (res.score + " of " + res.of + " matched."));
      return;
    }

    if (type === "fill") {
      res = q._gradeFill();
      markGraded(q, res.correct, res.correct ? "Exactly right." : (res.score + " of " + res.of + " blanks correct."));
      return;
    }

    if (type === "code") {
      res = q._gradeCode();
      markGraded(q, res.correct, res.correct ? "Lines are in the right order." : "Order is off — green rows are in their correct slot.");
      return;
    }
  }

  /* ---------- init each question ---------- */
  questions.forEach(function (q) {
    var t = q.dataset.type;
    if (t === "single" || t === "boolean") wireSingle(q);
    if (t === "multi") wireMulti(q);
    if (t === "match") wireMatch(q);
    if (t === "fill") wireFill(q);
    if (t === "code") wireCode(q);

    var btn = q.querySelector("[data-check]");
    if (btn) btn.addEventListener("click", function () { checkQuestion(q); });
  });

  /* ---------- submit all ---------- */
  document.getElementById("submitAll").addEventListener("click", function () {
    questions.forEach(function (q) {
      if (!(q.id in graded)) checkQuestion(q);
    });
    var ids = Object.keys(graded);
    var correct = ids.filter(function (k) { return graded[k]; }).length;
    if (ids.length < total) {
      toast("Answer all questions to submit");
    } else {
      toast("Score: " + correct + " / " + total + " — " + Math.round((correct / total) * 100) + "%");
    }
  });

  /* ---------- decorative countdown timer ---------- */
  var remaining = 14 * 60 + 38;
  var timerEl = document.getElementById("timer");
  setInterval(function () {
    if (remaining <= 0) return;
    remaining--;
    var m = Math.floor(remaining / 60), s = remaining % 60;
    timerEl.textContent = m + ":" + (s < 10 ? "0" + s : s);
  }, 1000);
})();
