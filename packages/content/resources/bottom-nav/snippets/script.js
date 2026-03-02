(function () {
  var tabs = document.querySelectorAll(".tab");
  var indicator = document.querySelector(".bottom-nav__indicator");
  var screenContent = document.getElementById("screen-content");
  var screenIcon = screenContent ? screenContent.querySelector(".screen-icon") : null;
  var screenLabel = screenContent ? screenContent.querySelector(".screen-label") : null;

  function setActive(index) {
    tabs.forEach(function (tab, i) {
      var isActive = i === index;
      tab.classList.toggle("tab--active", isActive);
      tab.setAttribute("aria-selected", isActive ? "true" : "false");
    });

    // Move indicator — skip the Add button (index 2) visually but still track
    document.documentElement.style.setProperty("--active-index", index);

    // Update screen content with transition
    var tab = tabs[index];
    if (screenContent && tab) {
      screenContent.classList.add("fade");
      setTimeout(function () {
        if (screenIcon) screenIcon.textContent = tab.dataset.icon || "";
        if (screenLabel) screenLabel.textContent = tab.dataset.label || "";
        screenContent.classList.remove("fade");
      }, 180);
    }
  }

  tabs.forEach(function (tab, index) {
    tab.addEventListener("click", function () {
      setActive(index);
    });

    tab.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        setActive((index + 1) % tabs.length);
        tabs[(index + 1) % tabs.length].focus();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setActive((index - 1 + tabs.length) % tabs.length);
        tabs[(index - 1 + tabs.length) % tabs.length].focus();
      }
    });
  });
}());
