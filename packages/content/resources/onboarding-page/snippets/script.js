(function () {
  "use strict";

  /* ── State ── */
  var currentStep = 1;
  var totalSteps = 4;
  var selectedTopics = new Set();
  var invitedEmails = [];

  /* ── DOM Refs ── */
  var panels = document.querySelectorAll(".ob-panel");
  var steps = document.querySelectorAll(".ob-step");
  var lines = document.querySelectorAll(".ob-step-line");
  var nameInput = document.getElementById("ob-name");
  var nameError = document.getElementById("ob-name-error");
  var roleSelect = document.getElementById("ob-role");
  var companyInput = document.getElementById("ob-company");
  var topicsContainer = document.getElementById("ob-topics");
  var topicsError = document.getElementById("ob-topics-error");
  var frequencySelect = document.getElementById("ob-frequency");
  var emailInput = document.getElementById("ob-invite-email");
  var emailError = document.getElementById("ob-email-error");
  var inviteList = document.getElementById("ob-invite-list");
  var inviteAddBtn = document.getElementById("ob-invite-add");
  var avatarInput = document.getElementById("ob-avatar-input");
  var avatarPreview = document.getElementById("ob-avatar-preview");
  var avatarPlaceholder = document.getElementById("ob-avatar-placeholder");
  var welcomeMsg = document.getElementById("ob-welcome-msg");
  var summaryEl = document.getElementById("ob-summary");
  var confettiArea = document.getElementById("ob-confetti-area");

  /* ── Step Navigation ── */
  function goToStep(step) {
    if (step < 1 || step > totalSteps) return;

    // Validate before advancing
    if (step > currentStep) {
      if (!validateStep(currentStep)) return;
    }

    currentStep = step;
    updateProgress();
    showPanel(step);

    if (step === totalSteps) {
      buildCompletion();
    }
  }

  function showPanel(step) {
    panels.forEach(function (p) {
      p.classList.remove("active");
    });
    var target = document.getElementById("step-" + step);
    if (target) target.classList.add("active");
  }

  function updateProgress() {
    steps.forEach(function (s, i) {
      var stepNum = i + 1;
      s.classList.remove("active", "completed");
      if (stepNum === currentStep) {
        s.classList.add("active");
      } else if (stepNum < currentStep) {
        s.classList.add("completed");
        s.querySelector(".ob-step-circle").innerHTML =
          '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#fff" stroke-width="2.5"><polyline points="3,8 6.5,11.5 13,5"/></svg>';
      } else {
        s.querySelector(".ob-step-circle").textContent = stepNum;
      }
    });

    lines.forEach(function (line, i) {
      if (i < currentStep - 1) {
        line.classList.add("filled");
      } else {
        line.classList.remove("filled");
      }
    });
  }

  function validateStep(step) {
    switch (step) {
      case 1:
        var name = nameInput.value.trim();
        if (!name) {
          nameInput.classList.add("error");
          nameError.classList.add("visible");
          nameInput.focus();
          return false;
        }
        nameInput.classList.remove("error");
        nameError.classList.remove("visible");
        return true;

      case 2:
        if (selectedTopics.size === 0) {
          topicsError.classList.add("visible");
          return false;
        }
        topicsError.classList.remove("visible");
        return true;

      case 3:
        return true;

      default:
        return true;
    }
  }

  // Next / Back buttons
  document.querySelectorAll("[data-next]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      goToStep(parseInt(btn.dataset.next, 10));
    });
  });

  document.querySelectorAll("[data-prev]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      goToStep(parseInt(btn.dataset.prev, 10));
    });
  });

  // Clear validation on input
  nameInput.addEventListener("input", function () {
    nameInput.classList.remove("error");
    nameError.classList.remove("visible");
  });

  /* ── Avatar Upload ── */
  avatarInput.addEventListener("change", function () {
    var file = avatarInput.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function (e) {
      avatarPreview.src = e.target.result;
      avatarPreview.classList.add("visible");
    };
    reader.readAsDataURL(file);
  });

  /* ── Topics ── */
  topicsContainer.addEventListener("click", function (e) {
    var topic = e.target.closest(".ob-topic");
    if (!topic) return;
    var key = topic.dataset.topic;

    if (selectedTopics.has(key)) {
      selectedTopics.delete(key);
      topic.classList.remove("selected");
    } else {
      selectedTopics.add(key);
      topic.classList.add("selected");
    }

    if (selectedTopics.size > 0) {
      topicsError.classList.remove("visible");
    }
  });

  /* ── Email Invites ── */
  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function addInvite() {
    var email = emailInput.value.trim();
    if (!email || !isValidEmail(email)) {
      emailError.classList.add("visible");
      emailInput.classList.add("error");
      emailInput.focus();
      return;
    }
    if (invitedEmails.indexOf(email) !== -1) {
      emailInput.value = "";
      return;
    }

    emailError.classList.remove("visible");
    emailInput.classList.remove("error");
    invitedEmails.push(email);
    emailInput.value = "";
    renderInvites();
    emailInput.focus();
  }

  function removeInvite(email) {
    invitedEmails = invitedEmails.filter(function (e) {
      return e !== email;
    });
    renderInvites();
  }

  function renderInvites() {
    inviteList.innerHTML = "";
    invitedEmails.forEach(function (email) {
      var tag = document.createElement("span");
      tag.className = "ob-invite-tag";
      tag.innerHTML =
        email + '<button class="ob-invite-remove" data-email="' + email + '">&times;</button>';
      inviteList.appendChild(tag);
    });
  }

  inviteAddBtn.addEventListener("click", addInvite);

  emailInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      addInvite();
    }
  });

  emailInput.addEventListener("input", function () {
    emailError.classList.remove("visible");
    emailInput.classList.remove("error");
  });

  inviteList.addEventListener("click", function (e) {
    var btn = e.target.closest(".ob-invite-remove");
    if (btn) removeInvite(btn.dataset.email);
  });

  /* ── Skip Team ── */
  document.getElementById("ob-skip-team").addEventListener("click", function () {
    goToStep(4);
  });

  /* ── Completion ── */
  function buildCompletion() {
    var name = nameInput.value.trim() || "there";
    welcomeMsg.textContent = "Welcome to the platform, " + name + "!";

    // Build summary
    var summaryHtml = "";

    var role = roleSelect.value;
    if (role) {
      var roleText = roleSelect.options[roleSelect.selectedIndex].text;
      summaryHtml +=
        '<div class="ob-summary-item"><span class="ob-summary-label">Role</span><span class="ob-summary-value">' +
        roleText +
        "</span></div>";
    }

    var company = companyInput.value.trim();
    if (company) {
      summaryHtml +=
        '<div class="ob-summary-item"><span class="ob-summary-label">Company</span><span class="ob-summary-value">' +
        company +
        "</span></div>";
    }

    if (selectedTopics.size > 0) {
      var topicLabels = [];
      selectedTopics.forEach(function (key) {
        var el = topicsContainer.querySelector('[data-topic="' + key + '"] .ob-topic-label');
        if (el) topicLabels.push(el.textContent);
      });
      summaryHtml +=
        '<div class="ob-summary-item"><span class="ob-summary-label">Interests</span><span class="ob-summary-value">' +
        topicLabels.join(", ") +
        "</span></div>";
    }

    var freqText = frequencySelect.options[frequencySelect.selectedIndex].text;
    summaryHtml +=
      '<div class="ob-summary-item"><span class="ob-summary-label">Email</span><span class="ob-summary-value">' +
      freqText +
      "</span></div>";

    if (invitedEmails.length > 0) {
      summaryHtml +=
        '<div class="ob-summary-item"><span class="ob-summary-label">Invites sent</span><span class="ob-summary-value">' +
        invitedEmails.length +
        " teammate" +
        (invitedEmails.length > 1 ? "s" : "") +
        "</span></div>";
    }

    summaryEl.innerHTML = summaryHtml;

    // Launch confetti
    launchConfetti();
  }

  /* ── Confetti ── */
  function launchConfetti() {
    confettiArea.innerHTML = "";
    var colors = [
      "#6366f1",
      "#8b5cf6",
      "#ec4899",
      "#f59e0b",
      "#22c55e",
      "#3b82f6",
      "#ef4444",
      "#14b8a6",
    ];

    for (var i = 0; i < 60; i++) {
      var piece = document.createElement("div");
      piece.className = "ob-confetti-piece";
      piece.style.left = Math.random() * 100 + "%";
      piece.style.width = Math.random() * 8 + 4 + "px";
      piece.style.height = Math.random() * 8 + 4 + "px";
      piece.style.background = colors[Math.floor(Math.random() * colors.length)];
      piece.style.animationDuration = Math.random() * 2 + 1.5 + "s";
      piece.style.animationDelay = Math.random() * 0.8 + "s";
      piece.style.borderRadius = Math.random() > 0.5 ? "50%" : "2px";
      confettiArea.appendChild(piece);
    }
  }

  /* ── Dashboard CTA ── */
  document.getElementById("ob-go-dashboard").addEventListener("click", function () {
    alert("Redirecting to dashboard...");
  });
})();
