(function () {
  var tabs = document.querySelectorAll(".dept-tab");
  var cards = document.querySelectorAll(".team-card");
  var memberCount = document.querySelector(".member-count");

  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      var dept = tab.getAttribute("data-dept");

      // Update active tab
      tabs.forEach(function (t) {
        t.classList.remove("active");
      });
      tab.classList.add("active");

      // Filter cards
      var visibleCount = 0;

      cards.forEach(function (card) {
        var cardDept = card.getAttribute("data-department");
        var shouldShow = dept === "all" || cardDept === dept;

        if (shouldShow) {
          card.classList.remove("card-hidden");
          card.classList.add("card-fade-in");
          visibleCount++;
        } else {
          card.classList.add("card-hidden");
          card.classList.remove("card-fade-in");
        }
      });

      // Update count
      memberCount.textContent = visibleCount;

      // Remove animation class after it completes
      setTimeout(function () {
        cards.forEach(function (card) {
          card.classList.remove("card-fade-in");
        });
      }, 350);
    });
  });
})();
