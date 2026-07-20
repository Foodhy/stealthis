(function () {
  const zone = document.getElementById("dz-zone");
  const input = document.getElementById("dz-input");
  const list = document.getElementById("dz-files");
  const status = document.getElementById("dz-status");
  const count = document.getElementById("dz-count");
  if (!zone || !input) return;

  // Native DnD fires dragenter/dragleave for every descendant, so a single
  // dragleave is not a reliable "left the zone" signal. Track depth instead.
  let depth = 0;
  let files = [];

  const setState = (next) => zone.setAttribute("data-state", next);

  function formatSize(bytes) {
    const units = ["B", "KB", "MB", "GB"];
    let i = 0;
    let n = bytes;
    while (n >= 1024 && i < units.length - 1) { n /= 1024; i++; }
    return (i === 0 ? n : n.toFixed(1)) + " " + units[i];
  }

  function describe(dt) {
    if (!dt) return "Drop to add files";
    let n = dt.items ? dt.items.length : 0;
    if (!n && dt.files) n = dt.files.length;
    if (!n) return "Drop to add files";
    return n + (n === 1 ? " item" : " items") + " ready";
  }

  function render() {
    list.textContent = "";
    files.forEach((file, index) => {
      const li = document.createElement("li");

      const name = document.createElement("span");
      name.className = "files__name";
      name.textContent = file.name;

      const size = document.createElement("span");
      size.className = "files__size";
      size.textContent = formatSize(file.size);

      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "files__remove";
      remove.textContent = "×";
      remove.setAttribute("aria-label", "Remove " + file.name);
      remove.addEventListener("click", () => {
        files.splice(index, 1);
        render();
      });

      li.append(name, size, remove);
      list.appendChild(li);
    });

    status.textContent = files.length
      ? files.length + (files.length === 1 ? " file" : " files") + " selected."
      : "No files selected.";
  }

  function addFiles(fileList) {
    for (const file of fileList) {
      const dup = files.some((f) => f.name === file.name && f.size === file.size);
      if (!dup) files.push(file);
    }
    render();
    // Replace this with your upload / persistence callback.
  }

  // Stop the browser from navigating to a file dropped anywhere on the page.
  ["dragenter", "dragover", "dragleave", "drop"].forEach((type) => {
    window.addEventListener(type, (e) => e.preventDefault());
  });

  zone.addEventListener("dragenter", (e) => {
    e.preventDefault();
    depth++;
    count.textContent = describe(e.dataTransfer);
    setState("over");
  });

  zone.addEventListener("dragover", (e) => {
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = "copy";
  });

  zone.addEventListener("dragleave", (e) => {
    e.preventDefault();
    depth = Math.max(0, depth - 1);
    if (depth === 0) setState("idle");
  });

  zone.addEventListener("drop", (e) => {
    e.preventDefault();
    depth = 0;
    setState("idle");
    if (e.dataTransfer && e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
  });

  // Pointer / keyboard fallback: the zone proxies the visually hidden input.
  zone.addEventListener("click", () => input.click());
  zone.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      input.click();
    }
  });
  zone.addEventListener("focus", () => {
    if (zone.dataset.state === "idle") setState("focus");
  });
  zone.addEventListener("blur", () => {
    if (zone.dataset.state === "focus") setState("idle");
  });

  input.addEventListener("change", () => {
    addFiles(input.files);
    input.value = "";
  });

  render();
})();
