const badge = document.getElementById("badge");
const cart = document.getElementById("cart");
let count = 0;

document.querySelectorAll(".add-btn").forEach((btn) => {
  btn.addEventListener("click", function () {
    const btnRect = this.getBoundingClientRect();
    const cartRect = cart.getBoundingClientRect();

    // Create flying dot
    const dot = document.createElement("div");
    dot.className = "fly-dot";
    dot.style.left = btnRect.left + btnRect.width / 2 - 6 + "px";
    dot.style.top = btnRect.top + btnRect.height / 2 - 6 + "px";
    document.body.appendChild(dot);

    // Button success state
    const original = this.textContent;
    this.textContent = "Added \u2713";
    this.classList.add("added");

    // Animate dot to cart
    requestAnimationFrame(() => {
      dot.style.left = cartRect.left + cartRect.width / 2 - 6 + "px";
      dot.style.top = cartRect.top + cartRect.height / 2 - 6 + "px";
      dot.style.opacity = "0";
      dot.style.transform = "scale(0.3)";
    });

    // Update badge after dot arrives
    setTimeout(() => {
      dot.remove();
      count++;
      badge.textContent = count;
      badge.classList.add("bump");
      setTimeout(() => badge.classList.remove("bump"), 200);
    }, 600);

    // Reset button
    const self = this;
    setTimeout(() => {
      self.textContent = original;
      self.classList.remove("added");
    }, 1500);
  });
});
