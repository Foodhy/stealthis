(function () {
  const itemsContainer = document.getElementById("wishlistItems");
  const emptyState = document.getElementById("wishlistEmpty");
  const countEl = document.getElementById("wishlistCount");
  const sortSelect = document.getElementById("sortSelect");
  const shareBtn = document.getElementById("shareBtn");
  const toast = document.getElementById("toast");

  let toastTimer = null;

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove("show");
    }, 2500);
  }

  function updateCount() {
    var cards = itemsContainer.querySelectorAll(".wishlist-card");
    var n = cards.length;
    countEl.textContent = n + (n === 1 ? " item" : " items");
    if (n === 0) {
      itemsContainer.style.display = "none";
      emptyState.style.display = "block";
    }
  }

  function removeCard(card) {
    card.classList.add("removing");
    setTimeout(function () {
      card.remove();
      updateCount();
    }, 300);
  }

  itemsContainer.addEventListener("click", function (e) {
    var card = e.target.closest(".wishlist-card");
    if (!card) return;

    // Remove button (x)
    if (e.target.closest(".btn-remove")) {
      removeCard(card);
      showToast("Item removed from wishlist");
      return;
    }

    // Heart toggle
    var heartBtn = e.target.closest(".btn-heart");
    if (heartBtn) {
      if (heartBtn.classList.contains("active")) {
        heartBtn.classList.remove("active");
        showToast("Item will be removed");
        setTimeout(function () {
          removeCard(card);
        }, 600);
      } else {
        heartBtn.classList.add("active");
      }
      return;
    }

    // Move to cart
    var cartBtn = e.target.closest(".btn-cart");
    if (cartBtn && !cartBtn.disabled && !cartBtn.classList.contains("in-cart")) {
      cartBtn.classList.add("in-cart");
      cartBtn.textContent = "In Cart \u2713";
      showToast("Added to cart");
      return;
    }
  });

  // Sort
  sortSelect.addEventListener("change", function () {
    var cards = Array.from(itemsContainer.querySelectorAll(".wishlist-card"));
    var val = sortSelect.value;

    cards.sort(function (a, b) {
      if (val === "date-desc") {
        return b.dataset.date.localeCompare(a.dataset.date);
      }
      if (val === "date-asc") {
        return a.dataset.date.localeCompare(b.dataset.date);
      }
      if (val === "price-low") {
        return parseFloat(a.dataset.price) - parseFloat(b.dataset.price);
      }
      if (val === "price-high") {
        return parseFloat(b.dataset.price) - parseFloat(a.dataset.price);
      }
      if (val === "name-az") {
        return a.dataset.name.localeCompare(b.dataset.name);
      }
      return 0;
    });

    cards.forEach(function (card) {
      itemsContainer.appendChild(card);
    });
  });

  // Share
  shareBtn.addEventListener("click", function () {
    var url = window.location.href;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(function () {
        showToast("Wishlist link copied to clipboard");
      });
    } else {
      var input = document.createElement("input");
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      showToast("Wishlist link copied to clipboard");
    }
  });
})();
