(function () {
  function buildPages(current, total) {
    var pages = [];
    if (total <= 7) {
      for (var i = 1; i <= total; i++) pages.push(i);
      return pages;
    }
    pages.push(1);
    if (current > 3) pages.push("...");
    for (var i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i);
    if (current < total - 2) pages.push("...");
    pages.push(total);
    return pages;
  }

  function renderFull(el, state) {
    var pages = buildPages(state.current, state.total);
    el.innerHTML = "";

    function btn(label, page, disabled, active, ellipsis) {
      var b = document.createElement("button");
      b.className = "pg-btn" + (active ? " pg-btn--active" : "") + (ellipsis ? " pg-btn--ellipsis" : "");
      b.textContent = label;
      if (disabled || ellipsis) b.disabled = true;
      if (!disabled && !ellipsis && !active) {
        b.addEventListener("click", function () { state.current = page; renderFull(el, state); });
      }
      return b;
    }

    el.appendChild(btn("«", 1, state.current === 1, false, false));
    el.appendChild(btn("‹", state.current - 1, state.current === 1, false, false));
    pages.forEach(function (p) {
      if (p === "...") el.appendChild(btn("…", null, false, false, true));
      else el.appendChild(btn(p, p, false, p === state.current, false));
    });
    el.appendChild(btn("›", state.current + 1, state.current === state.total, false, false));
    el.appendChild(btn("»", state.total, state.current === state.total, false, false));
  }

  function renderMini(el, state) {
    el.innerHTML = "";
    function btn(label, page, disabled) {
      var b = document.createElement("button");
      b.className = "pg-btn";
      b.textContent = label;
      b.disabled = disabled;
      if (!disabled) b.addEventListener("click", function () { state.current = page; renderMini(el, state); });
      return b;
    }
    var info = document.createElement("span");
    info.className = "pg-info";
    info.textContent = "Page " + state.current + " of " + state.total;
    el.appendChild(btn("‹", state.current - 1, state.current === 1));
    el.appendChild(info);
    el.appendChild(btn("›", state.current + 1, state.current === state.total));
  }

  var stFull = { current: 8, total: 20 };
  var stMini = { current: 4, total: 20 };
  var stSize = { current: 2, total: 20 };

  renderFull(document.getElementById("pg-full"), stFull);
  renderMini(document.getElementById("pg-mini"), stMini);
  renderFull(document.getElementById("pg-size"), stSize);

  var sizeSel = document.getElementById("pg-size-sel");
  if (sizeSel) {
    sizeSel.addEventListener("change", function () {
      var perPage = parseInt(sizeSel.value);
      stSize.total = Math.ceil(100 / perPage);
      stSize.current = 1;
      renderFull(document.getElementById("pg-size"), stSize);
    });
  }
}());
