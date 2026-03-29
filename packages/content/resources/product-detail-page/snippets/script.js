// Gallery
const mainImage = document.getElementById("mainImage");
document.querySelectorAll(".thumb").forEach((thumb) => {
  thumb.addEventListener("click", () => {
    document.querySelectorAll(".thumb").forEach((t) => t.classList.remove("active"));
    thumb.classList.add("active");
    mainImage.style.opacity = "0";
    setTimeout(() => {
      mainImage.src = thumb.dataset.src;
      mainImage.style.opacity = "1";
    }, 150);
  });
});

// Color picker
document.querySelectorAll(".swatch").forEach((swatch) => {
  swatch.addEventListener("click", () => {
    document.querySelectorAll(".swatch").forEach((s) => s.classList.remove("active"));
    swatch.classList.add("active");
    document.getElementById("selectedColor").textContent = swatch.dataset.color;
  });
});

// Size picker
document.querySelectorAll(".size-btn:not(.sold-out)").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".size-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
  });
});

// Quantity stepper
let qty = 1;
const qtyVal = document.getElementById("qtyVal");
document.getElementById("qtyDec").addEventListener("click", () => {
  if (qty > 1) {
    qty--;
    qtyVal.textContent = qty;
  }
});
document.getElementById("qtyInc").addEventListener("click", () => {
  if (qty < 12) {
    qty++;
    qtyVal.textContent = qty;
  }
});

// Add to cart
const cartBtn = document.getElementById("addToCart");
cartBtn.addEventListener("click", () => {
  if (cartBtn.classList.contains("loading")) return;
  cartBtn.classList.add("loading");
  cartBtn.textContent = "Adding…";
  setTimeout(() => {
    cartBtn.classList.remove("loading");
    cartBtn.classList.add("success");
    cartBtn.textContent = "✓ Added to Cart";
    setTimeout(() => {
      cartBtn.classList.remove("success");
      cartBtn.textContent = "Add to Cart";
    }, 2000);
  }, 900);
});

// Wishlist toggle
document.querySelector(".btn-wishlist").addEventListener("click", function () {
  this.classList.toggle("active");
});
