(function () {
  var btn = document.getElementById("bc-expand");
  var bc  = document.getElementById("bc-collapse");
  if (btn && bc) {
    btn.addEventListener("click", function () {
      bc.classList.add("breadcrumb--expanded");
    });
  }
}());
