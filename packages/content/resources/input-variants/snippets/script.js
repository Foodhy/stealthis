(function () {
  // Password toggle
  var pwToggle = document.getElementById("pw-toggle");
  var pwInput  = document.getElementById("i-pass");
  var eyeShow  = document.getElementById("eye-show");
  var eyeHide  = document.getElementById("eye-hide");
  if (pwToggle && pwInput) {
    pwToggle.addEventListener("click", function () {
      var isText = pwInput.type === "text";
      pwInput.type = isText ? "password" : "text";
      eyeShow.style.display = isText ? "" : "none";
      eyeHide.style.display = isText ? "none" : "";
      pwToggle.setAttribute("aria-label", isText ? "Show password" : "Hide password");
    });
  }

  // Character counter
  var bioArea  = document.getElementById("i-bio");
  var bioCount = document.getElementById("bio-count");
  if (bioArea && bioCount) {
    bioArea.addEventListener("input", function () {
      bioCount.textContent = bioArea.value.length;
    });
  }
}());
