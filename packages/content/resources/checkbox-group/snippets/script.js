(function () {
  // Set indeterminate state on demo checkbox
  var indeterminate = document.getElementById("indeterminate-demo");
  if (indeterminate) indeterminate.indeterminate = true;
  if (indeterminate) indeterminate.classList.add("is-indeterminate");

  // Select-all logic
  var master   = document.getElementById("master-check");
  var children = Array.from(document.querySelectorAll(".child-check"));

  function updateMaster() {
    if (!master) return;
    var checked = children.filter(function (c) { return c.checked; }).length;
    if (checked === 0) {
      master.checked = false;
      master.indeterminate = false;
      master.classList.remove("is-indeterminate");
    } else if (checked === children.length) {
      master.checked = true;
      master.indeterminate = false;
      master.classList.remove("is-indeterminate");
    } else {
      master.checked = false;
      master.indeterminate = true;
      master.classList.add("is-indeterminate");
    }
  }

  if (master) {
    master.addEventListener("change", function () {
      master.classList.remove("is-indeterminate");
      master.indeterminate = false;
      children.forEach(function (c) { c.checked = master.checked; });
    });
  }

  children.forEach(function (c) {
    c.addEventListener("change", updateMaster);
  });

  updateMaster();
}());
