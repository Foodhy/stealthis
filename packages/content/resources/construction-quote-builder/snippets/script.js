(function () {
  'use strict';

  var USD = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });

  var tpl = document.getElementById('row-tpl');
  var laborRows = document.getElementById('labor-rows');
  var materialRows = document.getElementById('material-rows');

  var seed = {
    labor: [
      { desc: 'Site demolition & haul-off', qty: 24, unit: 'hr', price: 68 },
      { desc: 'Framing crew — interior walls', qty: 40, unit: 'hr', price: 72 },
      { desc: 'Licensed electrician — rough-in', qty: 16, unit: 'hr', price: 95 },
    ],
    material: [
      { desc: '2x4 SPF studs (8 ft)', qty: 120, unit: 'ea', price: 4.85 },
      { desc: '1/2" drywall sheets (4x8)', qty: 38, unit: 'sheet', price: 14.2 },
      { desc: 'Romex 12/2 wiring', qty: 250, unit: 'ft', price: 0.92 },
    ],
  };

  function makeRow(kind, data) {
    var node = tpl.content.firstElementChild.cloneNode(true);
    var desc = node.querySelector('.f-desc');
    var qty = node.querySelector('.f-qty');
    var unit = node.querySelector('.f-unit');
    var price = node.querySelector('.f-price');

    desc.value = data.desc;
    qty.value = data.qty;
    unit.value = data.unit;
    price.value = data.price;

    // mobile column labels
    node.querySelector('.col-qty').setAttribute('data-lbl', 'Qty');
    node.querySelector('.col-unit').setAttribute('data-lbl', 'Unit');
    node.querySelector('.col-price').setAttribute('data-lbl', 'Price');

    node.dataset.kind = kind;

    node.addEventListener('input', recalc);
    node.querySelector('.rm').addEventListener('click', function () {
      node.remove();
      recalc();
    });

    return node;
  }

  function lineTotal(row) {
    var q = parseFloat(row.querySelector('.f-qty').value) || 0;
    var p = parseFloat(row.querySelector('.f-price').value) || 0;
    var total = q * p;
    row.querySelector('.lt').textContent = USD.format(total);
    return total;
  }

  function sumGroup(container) {
    var total = 0;
    container.querySelectorAll('.row').forEach(function (row) {
      total += lineTotal(row);
    });
    return total;
  }

  function pct(id) {
    var v = parseFloat(document.getElementById(id).value);
    return isNaN(v) || v < 0 ? 0 : v / 100;
  }

  function set(id, val) {
    document.getElementById(id).textContent = USD.format(val);
  }

  function recalc() {
    var labor = sumGroup(laborRows);
    var mat = sumGroup(materialRows);
    var base = labor + mat;

    var markup = base * pct('markup');
    var contingency = (base + markup) * pct('contingency');
    var preTax = base + markup + contingency;
    var tax = preTax * pct('tax');
    var grand = preTax + tax;

    set('sum-labor', labor);
    set('sum-mat', mat);
    set('sum-base', base);
    set('sum-markup', markup);
    set('sum-cont', contingency);
    set('sum-tax', tax);
    set('grand-total', grand);

    resetSend();
  }

  // ---- add rows ----
  document.querySelectorAll('[data-add]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var kind = btn.getAttribute('data-add');
      var blank = { desc: '', qty: 1, unit: kind === 'labor' ? 'hr' : 'ea', price: 0 };
      var target = kind === 'labor' ? laborRows : materialRows;
      var row = makeRow(kind, blank);
      target.appendChild(row);
      row.querySelector('.f-desc').focus();
      recalc();
    });
  });

  // ---- live percentages ----
  ['markup', 'contingency', 'tax'].forEach(function (id) {
    document.getElementById(id).addEventListener('input', recalc);
  });

  // ---- send quote ----
  var sendBtn = document.getElementById('send-quote');
  var note = document.getElementById('send-note');
  var sent = false;

  function resetSend() {
    if (sent) {
      sent = false;
      sendBtn.classList.remove('is-sent');
      sendBtn.textContent = 'Send quote';
      note.textContent = '';
    }
  }

  sendBtn.addEventListener('click', function () {
    var grand = document.getElementById('grand-total').textContent;
    var no = 'EST-' + (4800 + Math.floor(Math.random() * 200));
    document.getElementById('quote-no').textContent = no;
    sent = true;
    sendBtn.classList.add('is-sent');
    sendBtn.textContent = 'Quote sent ✓';
    note.textContent = 'Quote ' + no + ' for ' + grand + ' sent to Marshall Renovations.';
  });

  // ---- init ----
  seed.labor.forEach(function (d) {
    laborRows.appendChild(makeRow('labor', d));
  });
  seed.material.forEach(function (d) {
    materialRows.appendChild(makeRow('material', d));
  });
  recalc();
})();
