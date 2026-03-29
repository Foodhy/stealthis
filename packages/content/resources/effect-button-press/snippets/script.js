document.getElementById("btn-success").addEventListener("click", function () {
  this.classList.add("done");
  const t = setTimeout(() => {
    this.classList.remove("done");
    clearTimeout(t);
  }, 1200);
});
