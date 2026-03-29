const form = document.querySelector(".search-box");
if (form) {
  const btn = form.querySelector("button");
  const input = form.querySelector("input");
  btn.addEventListener("click", () => {
    if (input.value.trim()) {
      // In a real app: window.location = `/search?q=${encodeURIComponent(input.value)}`
      input.value = "";
      input.focus();
    }
  });
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") btn.click();
  });
}
