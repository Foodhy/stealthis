// Ripple feedback on action buttons
document.querySelectorAll(".doc-btn").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    const title = btn.title;
    const card = btn.closest(".doc-card");
    const name = card.querySelector(".doc-name").textContent;

    // Visual flash
    btn.style.background = "rgba(99,102,241,0.2)";
    btn.style.borderColor = "#6366f1";
    btn.style.color = "#a5b4fc";
    setTimeout(() => {
      btn.style.background = "";
      btn.style.borderColor = "";
      btn.style.color = "";
    }, 600);
  });
});

// Hover lift on cards
document.querySelectorAll(".doc-card").forEach((card) => {
  card.addEventListener("click", (e) => {
    if (e.target.closest(".doc-btn")) return;
    card.style.borderColor = "#6366f1";
    setTimeout(() => {
      card.style.borderColor = "";
    }, 800);
  });
});
