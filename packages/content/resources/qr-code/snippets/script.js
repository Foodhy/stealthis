(function () {
  "use strict";

  const input = document.getElementById("qr-input");
  const btnGen = document.getElementById("btn-generate");
  const btnDl = document.getElementById("btn-download");
  const btnCopy = document.getElementById("btn-copy");
  const img = document.getElementById("qr-img");
  const spinner = document.getElementById("qr-spinner");
  const errorEl = document.getElementById("qr-error");
  const placeholder = document.getElementById("qr-placeholder");
  const actions = document.getElementById("qr-actions");

  let currentUrl = "";
  let debounceTimer = null;
  const QR_ENDPOINTS = [
    (text, size) =>
      "https://chart.googleapis.com/chart" +
      "?cht=qr" +
      "&chs=" +
      size +
      "x" +
      size +
      "&chld=M|1" +
      "&chl=" +
      encodeURIComponent(text),
    (text, size) =>
      "https://api.qrserver.com/v1/create-qr-code/" +
      "?size=" +
      size +
      "x" +
      size +
      "&data=" +
      encodeURIComponent(text),
    (text, size) =>
      "https://quickchart.io/qr" +
      "?size=" +
      size +
      "&margin=1" +
      "&text=" +
      encodeURIComponent(text),
  ];

  /* ── Helpers ── */
  function getSize() {
    const checked = document.querySelector('input[name="qr-size"]:checked');
    return checked ? parseInt(checked.value, 10) : 200;
  }

  function buildQrUrls(text, size) {
    return QR_ENDPOINTS.map((buildUrl) => buildUrl(text, size));
  }

  function showState(state) {
    placeholder.classList.toggle("hidden", state !== "empty");
    spinner.classList.toggle("hidden", state !== "loading");
    img.classList.toggle("hidden", state !== "ready");
    errorEl.classList.toggle("hidden", state !== "error");
    actions.style.display = state === "ready" ? "flex" : "none";
  }

  function setError(msg) {
    errorEl.textContent = msg;
    showState("error");
  }

  function loadWithFallback(urls, size, index) {
    if (index >= urls.length) {
      setError("Could not load QR code. Check your connection and try again.");
      return;
    }

    const url = urls[index];
    const probe = new Image();

    probe.onload = function () {
      currentUrl = url;
      img.src = url;
      img.width = size;
      img.height = size;
      showState("ready");
    };

    probe.onerror = function () {
      loadWithFallback(urls, size, index + 1);
    };

    probe.src = url;
  }

  /* ── Generate ── */
  function generate() {
    const text = input.value.trim();
    if (!text) {
      currentUrl = "";
      showState("empty");
      return;
    }

    const size = getSize();
    const urls = buildQrUrls(text, size);

    showState("loading");
    loadWithFallback(urls, size, 0);
  }

  /* ── Download ── */
  function download() {
    if (!currentUrl) return;

    const a = document.createElement("a");
    a.href = currentUrl;
    a.download = "qr-code.png";
    a.target = "_blank";
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  /* ── Copy URL ── */
  function copyUrl() {
    if (!currentUrl) return;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentUrl).then(() => flash(btnCopy, "Copied!"));
    } else {
      // Fallback
      const ta = document.createElement("textarea");
      ta.value = currentUrl;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      flash(btnCopy, "Copied!");
    }
  }

  function flash(btn, label) {
    const original = btn.textContent;
    btn.textContent = label;
    setTimeout(() => {
      btn.textContent = original;
    }, 1800);
  }

  /* ── Size change → regenerate if QR shown ── */
  document.querySelectorAll('input[name="qr-size"]').forEach((radio) => {
    radio.addEventListener("change", () => {
      // Update active pill styling
      document
        .querySelectorAll(".size-pill")
        .forEach((p) => p.classList.remove("size-pill--active"));
      radio.closest(".size-pill").classList.add("size-pill--active");

      if (!img.classList.contains("hidden")) generate();
    });
  });

  /* ── Debounced input → auto-generate ── */
  input.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(generate, 600);
  });

  /* ── Enter key ── */
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      clearTimeout(debounceTimer);
      generate();
    }
  });

  /* ── Button events ── */
  btnGen.addEventListener("click", () => {
    clearTimeout(debounceTimer);
    generate();
  });
  btnDl.addEventListener("click", download);
  btnCopy.addEventListener("click", copyUrl);

  /* ── Initial render ── */
  generate();
})();
