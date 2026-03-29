// ── Show / hide toggles ──
document.querySelectorAll(".pw-toggle").forEach(function (btn) {
  var targetId = btn.dataset.target;
  var input = document.getElementById(targetId);
  var eyeOn = btn.querySelector(".icon-eye");
  var eyeOff = btn.querySelector(".icon-eye-off");

  btn.addEventListener("click", function () {
    var isHidden = input.type === "password";
    input.type = isHidden ? "text" : "password";
    eyeOn.style.display = isHidden ? "none" : "";
    eyeOff.style.display = isHidden ? "" : "none";
    btn.setAttribute("aria-label", isHidden ? "Hide password" : "Show password");
  });
});

// ── Strength meter ──
var LABELS = ["", "Weak", "Fair", "Good", "Strong"];

function score(pw) {
  if (!pw) return 0;
  var pts = 0;
  if (pw.length >= 8) pts++;
  if (/[a-z]/.test(pw)) pts++;
  if (/[A-Z]/.test(pw)) pts++;
  if (/[0-9]/.test(pw)) pts++;
  if (/[^A-Za-z0-9]/.test(pw)) pts++;
  // map 0-5 → 0-4 levels
  if (pts === 0) return 0;
  if (pts <= 2) return 1;
  if (pts === 3) return 2;
  if (pts === 4) return 3;
  return 4;
}

document.querySelectorAll(".pw-input[data-strength]").forEach(function (input) {
  var wrap = input.closest(".field-wrap");
  var meter = wrap.querySelector(".strength-meter");
  var label = wrap.querySelector(".strength-label");

  input.addEventListener("input", function () {
    var level = score(input.value);
    if (level === 0) {
      meter.removeAttribute("data-level");
      label.textContent = "";
    } else {
      meter.setAttribute("data-level", level);
      label.textContent = LABELS[level];
    }
  });
});
