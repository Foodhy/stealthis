(function () {
  "use strict";

  /* ---------------------------------------------------------------
   * Fictional "server" data. In a real app these checks would be
   * network requests; here we resolve a Promise via setTimeout so the
   * loading -> result transition is exactly the same shape.
   * --------------------------------------------------------------- */
  var TAKEN_USERNAMES = [
    "admin",
    "support",
    "nova",
    "atlas",
    "maya",
    "river",
    "jordan",
    "sky",
    "dev",
    "team",
    "hello",
    "founder",
  ];

  var TAKEN_EMAILS = [
    "maya@company.com",
    "jordan@company.com",
    "hello@company.com",
    "team@acme.io",
    "founder@startup.dev",
  ];

  var LATENCY = 720; // simulated round-trip in ms
  var DEBOUNCE = 450; // wait after last keystroke before checking

  // Resolves to { available: boolean }
  function checkUsername(value) {
    return new Promise(function (resolve) {
      setTimeout(function () {
        resolve({ available: TAKEN_USERNAMES.indexOf(value.toLowerCase()) === -1 });
      }, LATENCY);
    });
  }

  function checkEmail(value) {
    return new Promise(function (resolve) {
      setTimeout(function () {
        resolve({ available: TAKEN_EMAILS.indexOf(value.toLowerCase()) === -1 });
      }, LATENCY);
    });
  }

  function suggestUsernames(base) {
    var clean = base.toLowerCase().replace(/[^a-z0-9._]/g, "") || "user";
    var pool = [
      clean + "1",
      clean + "_2",
      clean + ".hq",
      "the" + clean,
      clean + new Date().getFullYear().toString().slice(-2),
    ];
    // only offer ones our fictional server says are free
    return pool
      .filter(function (n) {
        return TAKEN_USERNAMES.indexOf(n) === -1;
      })
      .slice(0, 3);
  }

  /* --------------------------------------------------------------- */

  var form = document.getElementById("signup-form");
  var donePanel = document.getElementById("done-panel");
  var submitBtn = document.getElementById("submit-btn");
  var liveRegion = document.getElementById("live-region");

  // toast
  var toastEl = document.getElementById("toast");
  var toastMsgEl = document.getElementById("toast-msg");
  var toastTimer = null;
  function toast(msg, tone) {
    toastMsgEl.textContent = msg;
    toastEl.setAttribute("data-tone", tone || "");
    toastEl.setAttribute("data-state", "show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.setAttribute("data-state", "hide");
    }, 2600);
  }

  function announce(msg) {
    liveRegion.textContent = "";
    // re-set on next frame so repeated identical messages still announce
    requestAnimationFrame(function () {
      liveRegion.textContent = msg;
    });
  }

  /* --------------------------------------------------------------- */

  function FieldController(opts) {
    this.root = document.querySelector('[data-field="' + opts.name + '"]');
    this.name = opts.name;
    this.input = this.root.querySelector(".control__input");
    this.help = this.root.querySelector("[data-help]");
    this.suggestBox = this.root.querySelector("[data-suggest]");
    this.chips = this.suggestBox ? this.suggestBox.querySelector("[data-chips]") : null;
    this.countEl = opts.countId ? document.getElementById(opts.countId) : null;

    this.checkFn = opts.checkFn;
    this.localValidate = opts.localValidate;
    this.takenMsg = opts.takenMsg;
    this.okMsg = opts.okMsg;
    this.idleMsg = this.help.textContent;
    this.maxLen = opts.maxLen || 0;

    this.state = "idle"; // idle | checking | ok | taken | error
    this.requestId = 0; // guards against out-of-order async results
    this.timer = null;

    this._bind();
    this._renderCount();
  }

  FieldController.prototype._bind = function () {
    var self = this;
    this.input.addEventListener("input", function () {
      self._renderCount();
      self.onInput();
    });
    this.input.addEventListener("blur", function () {
      // if the user leaves while idle text exists but no check ran, force one
      if (self.input.value.trim() && self.state === "idle") {
        self.onInput(true);
      }
    });
  };

  FieldController.prototype._renderCount = function () {
    if (!this.countEl || !this.maxLen) return;
    this.countEl.textContent = this.input.value.length + " / " + this.maxLen;
  };

  FieldController.prototype.setState = function (state, msg) {
    this.state = state;
    this.root.setAttribute("data-state", state);

    if (state === "checking") {
      this.input.setAttribute("aria-busy", "true");
    } else {
      this.input.removeAttribute("aria-busy");
    }

    var invalid = state === "taken" || state === "error";
    this.input.setAttribute("aria-invalid", invalid ? "true" : "false");

    if (typeof msg === "string") this.help.textContent = msg;

    if (state !== "taken") this._hideSuggest();

    onAnyFieldChange();
  };

  FieldController.prototype.reset = function () {
    clearTimeout(this.timer);
    this.requestId++;
    this.state = "idle";
    this.root.removeAttribute("data-state");
    this.input.setAttribute("aria-invalid", "false");
    this.input.removeAttribute("aria-busy");
    this.input.value = "";
    this.help.textContent = this.idleMsg;
    this._hideSuggest();
    this._renderCount();
  };

  FieldController.prototype.onInput = function (immediate) {
    var self = this;
    clearTimeout(this.timer);
    this.requestId++; // cancel any in-flight result

    var value = this.input.value.trim();

    // empty -> back to idle
    if (!value) {
      this.setState("idle", this.idleMsg);
      this.root.removeAttribute("data-state");
      return;
    }

    // synchronous local rules first (format/length)
    var local = this.localValidate(value);
    if (!local.valid) {
      this.setState("error", local.msg);
      return;
    }

    // looks fine locally -> go check the "server" after a debounce
    var run = function () {
      var myId = ++self.requestId;
      self.setState("checking", "Checking availability…");
      announce("Checking availability for " + self.name);

      self.checkFn(value).then(function (res) {
        // ignore if a newer request superseded this one
        if (myId !== self.requestId) return;

        if (res.available) {
          self.setState("ok", self.okMsg);
          announce(value + " is available");
        } else {
          self.setState("taken", self.takenMsg);
          announce(value + " is already taken");
          if (self.name === "username") self._showSuggest(value);
        }
      });
    };

    if (immediate) run();
    else this.timer = setTimeout(run, DEBOUNCE);
  };

  FieldController.prototype._showSuggest = function (value) {
    if (!this.suggestBox || !this.chips) return;
    var names = suggestUsernames(value);
    if (!names.length) {
      this._hideSuggest();
      return;
    }
    var self = this;
    this.chips.innerHTML = "";
    names.forEach(function (n) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "chip";
      b.textContent = n;
      b.addEventListener("click", function () {
        self.input.value = n;
        self._renderCount();
        self.input.focus();
        self.onInput(true); // re-check the chosen name immediately
        toast("Trying " + n, "");
      });
      self.chips.appendChild(b);
    });
    this.suggestBox.hidden = false;
  };

  FieldController.prototype._hideSuggest = function () {
    if (this.suggestBox) this.suggestBox.hidden = true;
  };

  FieldController.prototype.isReady = function () {
    return this.state === "ok";
  };

  FieldController.prototype.isBlocking = function () {
    return this.state === "checking";
  };

  /* ---- local validators ---- */
  function validateUsername(v) {
    if (v.length < 3) return { valid: false, msg: "Too short — at least 3 characters." };
    if (v.length > 20) return { valid: false, msg: "Too long — 20 characters max." };
    if (!/^[a-zA-Z0-9._]+$/.test(v))
      return {
        valid: false,
        msg: "Only letters, numbers, dot and underscore.",
      };
    if (/^[._]|[._]$/.test(v))
      return { valid: false, msg: "Can't start or end with a dot or underscore." };
    return { valid: true };
  }

  function validateEmail(v) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v))
      return { valid: false, msg: "Enter a valid email, like you@company.com." };
    return { valid: true };
  }

  /* --------------------------------------------------------------- */

  var fields = [
    new FieldController({
      name: "username",
      countId: "username-count",
      maxLen: 20,
      checkFn: checkUsername,
      localValidate: validateUsername,
      okMsg: "Nice — that handle is available.",
      takenMsg: "Sorry, that one's taken.",
    }),
    new FieldController({
      name: "email",
      checkFn: checkEmail,
      localValidate: validateEmail,
      okMsg: "Looks good — no account uses this yet.",
      takenMsg: "An account already uses this email.",
    }),
  ];

  function allReady() {
    return fields.every(function (f) {
      return f.isReady();
    });
  }

  function anyChecking() {
    return fields.some(function (f) {
      return f.isBlocking();
    });
  }

  function onAnyFieldChange() {
    // submit is blocked while anything is still checking, or not all valid
    var disabled = !allReady() || anyChecking();
    submitBtn.disabled = disabled;
    submitBtn.removeAttribute("data-loading");
  }

  /* ---- submit ---- */
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    if (anyChecking()) {
      toast("Hang on — still checking availability", "");
      announce("Please wait, availability check in progress.");
      return;
    }

    // find first non-ready field and focus it
    var firstBad = fields.find(function (f) {
      return !f.isReady();
    });
    if (firstBad) {
      firstBad.input.focus();
      toast("Resolve the highlighted field first", "bad");
      return;
    }

    // fake the create call with a brief loading state
    submitBtn.setAttribute("data-loading", "true");
    submitBtn.disabled = true;
    announce("Reserving your workspace…");

    setTimeout(function () {
      var handle = fields[0].input.value.trim();
      var email = fields[1].input.value.trim();

      document.getElementById("done-handle").textContent = "app.dev/" + handle;
      document.getElementById("done-email").textContent = email;

      form.hidden = true;
      donePanel.hidden = false;
      // move focus into the confirmation so screen readers land there
      donePanel.setAttribute("tabindex", "-1");
      donePanel.focus();
      toast("Workspace reserved", "ok");
      announce("Success. Your workspace " + handle + " is reserved.");
    }, 900);
  });

  /* ---- reset / claim another ---- */
  document.getElementById("reset-btn").addEventListener("click", function () {
    fields.forEach(function (f) {
      f.reset();
    });
    submitBtn.disabled = true;
    submitBtn.removeAttribute("data-loading");
    donePanel.hidden = true;
    form.hidden = false;
    fields[0].input.focus();
    announce("Form reset. Claim a new handle.");
  });

  // start with submit disabled and focus on the first field
  onAnyFieldChange();
})();
