var dropzone = document.getElementById("dropzone");
var fileInput = document.getElementById("file-input");
var fileList = document.getElementById("file-list");

var MAX_SIZE = 5 * 1024 * 1024; // 5 MB
var ACCEPT_RE = /^image\//;
var dragCounter = 0;

function formatBytes(n) {
  if (n < 1024) return n + " B";
  if (n < 1024 * 1024) return (n / 1024).toFixed(1) + " KB";
  return (n / (1024 * 1024)).toFixed(1) + " MB";
}

function simulateProgress(item, bar) {
  var pct = 0;
  var iv = setInterval(function () {
    pct += Math.random() * 18 + 4;
    if (pct >= 100) {
      pct = 100;
      clearInterval(iv);
      item.classList.add("is-done");
    }
    bar.style.width = pct + "%";
  }, 120);
}

function addFile(file) {
  var isInvalidType = !ACCEPT_RE.test(file.type);
  var isTooBig = file.size > MAX_SIZE;

  var li = document.createElement("li");
  li.className = "file-item" + (isInvalidType || isTooBig ? " is-error" : "");

  var name = document.createElement("span");
  name.className = "file-name";
  name.textContent = file.name;

  var size = document.createElement("span");
  size.className = "file-size";
  size.textContent = isInvalidType
    ? "Invalid file type"
    : isTooBig
      ? "File too large (" + formatBytes(file.size) + ")"
      : formatBytes(file.size);

  var progressWrap = document.createElement("div");
  progressWrap.className = "file-progress-wrap";
  var progressBar = document.createElement("div");
  progressBar.className = "file-progress";
  if (isInvalidType || isTooBig) progressBar.style.width = "100%";
  progressWrap.appendChild(progressBar);

  var removeBtn = document.createElement("button");
  removeBtn.className = "file-remove";
  removeBtn.setAttribute("aria-label", "Remove " + file.name);
  removeBtn.innerHTML =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
  removeBtn.addEventListener("click", function () {
    li.remove();
  });

  li.appendChild(name);
  li.appendChild(size);
  li.appendChild(progressWrap);
  li.appendChild(removeBtn);
  fileList.appendChild(li);

  if (!isInvalidType && !isTooBig) {
    simulateProgress(li, progressBar);
  }
}

function handleFiles(files) {
  Array.from(files).forEach(addFile);
  // reset so same file can be re-added
  fileInput.value = "";
}

// Click to open file picker
dropzone.addEventListener("click", function (e) {
  if (e.target !== fileInput) fileInput.click();
});
dropzone.addEventListener("keydown", function (e) {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    fileInput.click();
  }
});

fileInput.addEventListener("change", function () {
  handleFiles(fileInput.files);
});

// Drag and drop
dropzone.addEventListener("dragenter", function (e) {
  e.preventDefault();
  dragCounter++;
  dropzone.classList.add("is-dragging");
});
dropzone.addEventListener("dragover", function (e) {
  e.preventDefault();
});
dropzone.addEventListener("dragleave", function () {
  dragCounter--;
  if (dragCounter <= 0) {
    dragCounter = 0;
    dropzone.classList.remove("is-dragging");
  }
});
dropzone.addEventListener("drop", function (e) {
  e.preventDefault();
  dragCounter = 0;
  dropzone.classList.remove("is-dragging");
  if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
});
