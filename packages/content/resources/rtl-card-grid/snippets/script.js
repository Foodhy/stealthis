(() => {
  const html = document.documentElement;
  const dirToggle = document.getElementById("dir-toggle");
  const dirLabel = document.getElementById("dir-label");

  dirToggle.addEventListener("click", () => {
    const isRtl = html.getAttribute("dir") === "rtl";
    const newDir = isRtl ? "ltr" : "rtl";
    html.setAttribute("dir", newDir);
    html.setAttribute("lang", isRtl ? "en" : "ar");
    dirLabel.textContent = newDir.toUpperCase();
  });
})();
