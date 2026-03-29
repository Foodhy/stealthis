// Wishlist toggles
document.querySelectorAll(".wishlist-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const wishlisted = btn.dataset.wishlisted === "true";
    btn.dataset.wishlisted = String(!wishlisted);
    btn.setAttribute("aria-label", wishlisted ? "Add to wishlist" : "Remove from wishlist");
  });
});

// Swatch selection
document.querySelectorAll(".product-card").forEach((card) => {
  card.querySelectorAll(".swatch").forEach((swatch) => {
    swatch.addEventListener("click", () => {
      card.querySelectorAll(".swatch").forEach((s) => s.classList.remove("swatch--active"));
      swatch.classList.add("swatch--active");
    });
  });
});

// Add to cart
document.querySelectorAll(".add-to-cart-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    btn.classList.add("success");
    btn.innerHTML = `
      <svg class="cart-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
      Added!
    `;
    setTimeout(() => {
      btn.classList.remove("success");
      btn.innerHTML = `
        <svg class="cart-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
          <line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
        </svg>
        Add to Cart
      `;
    }, 1800);
  });
});

// Quick add
document.querySelectorAll(".quick-add-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    btn.textContent = "✓ Added!";
    btn.classList.add("success");
    setTimeout(() => {
      btn.textContent = "Quick Add";
      btn.classList.remove("success");
    }, 1800);
  });
});
