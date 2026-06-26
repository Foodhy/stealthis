(function () {
  'use strict';

  // Annual figures (in dollars). Discount is a negative credit.
  var COMPONENTS = [
    { key: 'base',   label: 'Base cover',   note: 'Liability + collision', color: 'var(--c-base)',   amount: 980 },
    { key: 'risk',   label: 'Risk factors', note: 'Driver age & area',     color: 'var(--c-risk)',   amount: 264 },
    { key: 'addons', label: 'Add-ons',      note: 'Roadside + glass',      color: 'var(--c-addons)', amount: 168 },
    { key: 'tax',    label: 'Taxes & fees', note: 'State premium tax',     color: 'var(--c-tax)',    amount: 88 },
    { key: 'disc',   label: 'Discounts',    note: '3 applied',             color: 'var(--c-disc)',   amount: -216, credit: true }
  ];

  var DISCOUNTS = [
    { label: 'Safe driver (5 yrs no claims)', amount: 118 },
    { label: 'Multi-policy bundle',           amount: 64 },
    { label: 'Paid in full',                  amount: 34 }
  ];

  var state = { cycle: 'annual' };

  function money(n) {
    var abs = Math.abs(n);
    var s = abs.toFixed(2);
    // drop .00 for whole dollars
    if (s.slice(-3) === '.00') s = s.slice(0, -3);
    s = s.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return (n < 0 ? '-$' : '$') + s;
  }

  function conv(n) {
    return state.cycle === 'monthly' ? n / 12 : n;
  }

  var positives = COMPONENTS.filter(function (c) { return !c.credit; });
  var grossAnnual = positives.reduce(function (s, c) { return s + c.amount; }, 0);
  var creditAnnual = COMPONENTS
    .filter(function (c) { return c.credit; })
    .reduce(function (s, c) { return s + c.amount; }, 0); // negative
  var netAnnual = grossAnnual + creditAnnual;
  var savingsAnnual = -creditAnnual;

  // ---- donut (only positive charge components fill the ring) ----
  function buildDonut() {
    var donut = document.getElementById('donut');
    var stops = [];
    var acc = 0;
    positives.forEach(function (c) {
      var startPct = (acc / grossAnnual) * 100;
      acc += c.amount;
      var endPct = (acc / grossAnnual) * 100;
      stops.push(c.color + ' ' + startPct.toFixed(2) + '% ' + endPct.toFixed(2) + '%');
    });
    donut.style.background = 'conic-gradient(' + stops.join(', ') + ')';
  }

  function buildLegend() {
    var ul = document.getElementById('legend');
    ul.innerHTML = '';
    positives.forEach(function (c) {
      var pct = Math.round((c.amount / grossAnnual) * 100);
      var li = document.createElement('li');
      var dot = document.createElement('span');
      dot.className = 'dot';
      dot.style.background = c.color;
      var name = document.createElement('span');
      name.className = 'name';
      name.textContent = c.label;
      var p = document.createElement('span');
      p.className = 'pct';
      p.textContent = pct + '%';
      li.appendChild(dot);
      li.appendChild(name);
      li.appendChild(p);
      ul.appendChild(li);
    });
  }

  function buildItems() {
    var ul = document.getElementById('items');
    ul.innerHTML = '';
    COMPONENTS.forEach(function (c) {
      var li = document.createElement('li');

      var key = document.createElement('span');
      key.className = 'key';
      key.style.background = c.color;

      var wrap = document.createElement('span');
      var label = document.createElement('span');
      label.className = 'label';
      label.textContent = c.label;
      var note = document.createElement('span');
      note.className = 'note';
      note.textContent = c.note;
      wrap.appendChild(label);
      wrap.appendChild(note);

      var amt = document.createElement('span');
      amt.className = 'amount' + (c.credit ? ' is-credit' : '');
      amt.textContent = (c.credit ? '−' : '') + money(Math.abs(conv(c.amount)));
      amt.dataset.base = c.amount;

      li.appendChild(key);
      li.appendChild(wrap);
      li.appendChild(amt);
      ul.appendChild(li);
    });
  }

  function buildDiscounts() {
    var ul = document.getElementById('discounts');
    ul.innerHTML = '';
    DISCOUNTS.forEach(function (d) {
      var li = document.createElement('li');
      var check = document.createElement('span');
      check.className = 'check';
      check.textContent = '✓';
      check.setAttribute('aria-hidden', 'true');
      var label = document.createElement('span');
      label.textContent = d.label;
      var save = document.createElement('span');
      save.className = 'save';
      save.textContent = '−' + money(conv(d.amount));
      li.appendChild(check);
      li.appendChild(label);
      li.appendChild(save);
      ul.appendChild(li);
    });
  }

  function refreshTotals() {
    var monthly = state.cycle === 'monthly';
    var net = conv(netAnnual);
    var save = conv(savingsAnnual);
    document.getElementById('totalBig').textContent = money(net);
    document.getElementById('totalUnit').textContent = monthly ? 'per month' : 'per year';
    document.getElementById('saveBig').textContent = money(save);
    document.getElementById('footBig').textContent = money(net);
    document.getElementById('footUnit').textContent = monthly ? 'monthly' : 'annually';
  }

  function setCycle(cycle) {
    state.cycle = cycle;
    document.querySelectorAll('.toggle__btn').forEach(function (b) {
      var on = b.dataset.cycle === cycle;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    buildItems();
    buildDiscounts();
    refreshTotals();
  }

  document.querySelectorAll('.toggle__btn').forEach(function (b) {
    b.addEventListener('click', function () { setCycle(b.dataset.cycle); });
  });

  document.querySelector('.pay-btn').addEventListener('click', function () {
    var btn = this;
    var original = btn.textContent;
    btn.textContent = 'Payment confirmed ✓';
    btn.style.background = 'var(--green)';
    btn.disabled = true;
    setTimeout(function () {
      btn.textContent = original;
      btn.style.background = '';
      btn.disabled = false;
    }, 1800);
  });

  // init
  buildDonut();
  buildLegend();
  buildItems();
  buildDiscounts();
  refreshTotals();
})();
