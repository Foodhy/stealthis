(function () {
  var openTimer  = null;
  var closeTimer = null;
  var currentCard = null;

  function showCard(card) {
    clearTimeout(closeTimer);
    if (currentCard && currentCard !== card) {
      currentCard.classList.remove("is-visible");
    }
    currentCard = card;
    openTimer = setTimeout(function () {
      card.classList.add("is-visible");
    }, 200);
  }

  function hideCard(card) {
    clearTimeout(openTimer);
    closeTimer = setTimeout(function () {
      card.classList.remove("is-visible");
      currentCard = null;
    }, 150);
  }

  document.querySelectorAll(".hc-trigger").forEach(function (trigger) {
    var cardId = trigger.dataset.hc;
    var card = document.getElementById(cardId);
    if (!card) return;

    trigger.addEventListener("mouseenter", function () { showCard(card); });
    trigger.addEventListener("mouseleave", function () { hideCard(card); });
    card.addEventListener("mouseenter", function () { clearTimeout(closeTimer); });
    card.addEventListener("mouseleave", function () { hideCard(card); });
  });
}());
