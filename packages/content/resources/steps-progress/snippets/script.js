(function () {
  var STEPS = [
    {
      title: "Create your account",
      desc: "Enter your email and choose a secure password to get started.",
    },
    { title: "Personal details", desc: "Tell us your name, location, and a bit about yourself." },
    {
      title: "Payment information",
      desc: "Add a payment method — you won't be charged until you confirm.",
    },
    {
      title: "Review and confirm",
      desc: "Double-check your details. Everything looks good? Let's go!",
    },
  ];

  var current = 0;
  var stepEls = document.querySelectorAll(".step");
  var labels = document.querySelectorAll(".step-label");
  var panel = document.getElementById("step-panel");
  var title = document.getElementById("panel-title");
  var desc = document.getElementById("panel-desc");
  var btnPrev = document.getElementById("btn-prev");
  var btnNext = document.getElementById("btn-next");

  function render() {
    stepEls.forEach(function (el, i) {
      el.classList.toggle("is-active", i === current);
      el.classList.toggle("is-complete", i < current);

      var node = el.querySelector(".step__node");
      if (node) {
        if (i === current) {
          node.setAttribute("aria-current", "step");
        } else {
          node.removeAttribute("aria-current");
        }
      }
    });

    labels.forEach(function (lbl, i) {
      lbl.classList.toggle("step-label--active", i === current);
      lbl.classList.toggle("step-label--complete", i < current);
    });

    // Animate panel transition
    if (panel) {
      panel.classList.add("fade");
      setTimeout(function () {
        if (title) title.textContent = STEPS[current].title;
        if (desc) desc.textContent = STEPS[current].desc;
        panel.classList.remove("fade");
      }, 160);
    }

    if (btnPrev) btnPrev.disabled = current === 0;
    if (btnNext) {
      if (current === STEPS.length - 1) {
        btnNext.textContent = "Finish";
        btnNext.className = "btn btn--success";
      } else {
        btnNext.textContent = "Next";
        btnNext.className = "btn btn--primary";
      }
    }
  }

  if (btnPrev) {
    btnPrev.addEventListener("click", function () {
      if (current > 0) {
        current--;
        render();
      }
    });
  }

  if (btnNext) {
    btnNext.addEventListener("click", function () {
      if (current < STEPS.length - 1) {
        current++;
        render();
      } else {
        // Reset demo on Finish
        current = 0;
        render();
      }
    });
  }

  render();
})();
