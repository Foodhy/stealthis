(function () {
  'use strict';

  var PRODUCTS = [
    { id: 'p1', name: 'Hill’s Science Diet Adult Chicken', cat: 'food', emoji: '🐕', price: 42.99, rating: 4.8, reviews: 312, rx: false, desc: 'Dry dog food, 12 lb bag' },
    { id: 'p2', name: 'Royal Canin Kitten Formula', cat: 'food', emoji: '🐱', price: 28.5, rating: 4.7, reviews: 198, rx: false, desc: 'Wet pouches, pack of 12' },
    { id: 'p3', name: 'Apoquel 16mg Allergy Relief', cat: 'meds', emoji: '💊', price: 64.0, rating: 4.6, reviews: 87, rx: true, desc: 'Anti-itch tablets, 30 ct' },
    { id: 'p4', name: 'Bravecto Flea &amp; Tick Chew', cat: 'meds', emoji: '🐛', price: 54.95, rating: 4.9, reviews: 421, rx: true, desc: '12-week protection, large dog' },
    { id: 'p5', name: 'Frontline Plus (no Rx)', cat: 'meds', emoji: '🦴', price: 39.99, rating: 4.5, reviews: 256, rx: false, desc: 'Topical flea drops, 3 doses' },
    { id: 'p6', name: 'Orthopedic Memory Foam Bed', cat: 'supplies', emoji: '🛏️', price: 79.0, rating: 4.8, reviews: 143, rx: false, desc: 'Washable cover, medium' },
    { id: 'p7', name: 'Stainless Steel Slow Feeder', cat: 'supplies', emoji: '🍽️', price: 18.75, rating: 4.4, reviews: 92, rx: false, desc: 'Anti-gulp bowl, 2-cup' },
    { id: 'p8', name: 'Gabapentin 100mg Capsules', cat: 'meds', emoji: '💊', price: 31.5, rating: 4.3, reviews: 64, rx: true, desc: 'Pain &amp; anxiety, 60 ct' },
    { id: 'p9', name: 'Greenies Dental Treats', cat: 'food', emoji: '🦷', price: 22.99, rating: 4.7, reviews: 510, rx: false, desc: 'Daily chews, 27 ct' },
    { id: 'p10', name: 'Reflective No-Pull Harness', cat: 'supplies', emoji: '🦮', price: 26.4, rating: 4.6, reviews: 178, rx: false, desc: 'Adjustable, sizes S–XL' },
    { id: 'p11', name: 'Cerenia Anti-Nausea Tablets', cat: 'meds', emoji: '💊', price: 47.25, rating: 4.5, reviews: 41, rx: true, desc: 'Motion sickness, 4 ct' },
    { id: 'p12', name: 'Cat Scratching Post Tower', cat: 'supplies', emoji: '🏗️', price: 58.0, rating: 4.8, reviews: 207, rx: false, desc: 'Sisal-wrapped, 32 in' }
  ];

  var CAT_LABEL = { food: 'Food', meds: 'Meds', supplies: 'Supplies' };

  var cart = {}; // id -> qty
  var activeCat = 'all';
  var query = '';

  var grid = document.getElementById('grid');
  var emptyGrid = document.getElementById('emptyGrid');
  var resultCount = document.getElementById('resultCount');
  var resultLabel = document.getElementById('resultLabel');
  var search = document.getElementById('search');
  var chips = Array.prototype.slice.call(document.querySelectorAll('.chip'));

  var cartBtn = document.getElementById('cartBtn');
  var cartCount = document.getElementById('cartCount');
  var drawer = document.getElementById('cartDrawer');
  var scrim = document.getElementById('scrim');
  var closeCart = document.getElementById('closeCart');
  var cartItems = document.getElementById('cartItems');
  var cartEmpty = document.getElementById('cartEmpty');
  var totalEl = document.getElementById('total');
  var rxNote = document.getElementById('rxNote');
  var checkout = document.getElementById('checkout');

  function money(n) {
    return '$' + n.toFixed(2);
  }

  function starString(rating) {
    var full = Math.round(rating);
    return '★★★★★'.slice(0, full) + '☆☆☆☆☆'.slice(0, 5 - full);
  }

  function matches(p) {
    if (activeCat !== 'all' && p.cat !== activeCat) return false;
    if (query) {
      var hay = (p.name + ' ' + p.desc + ' ' + CAT_LABEL[p.cat]).toLowerCase();
      if (hay.indexOf(query) === -1) return false;
    }
    return true;
  }

  function renderGrid() {
    var list = PRODUCTS.filter(matches);
    grid.innerHTML = '';

    list.forEach(function (p) {
      var li = document.createElement('li');
      li.className = 'card';

      var rxBadge = p.rx ? '<span class="rx-badge">℞ Rx</span>' : '';
      var rxWarn = p.rx ? '<p class="rx-warn">℞ Prescription — vet approval needed before this ships.</p>' : '';

      li.innerHTML =
        '<div class="thumb" aria-hidden="true">' + p.emoji + '</div>' +
        '<div class="card-tags"><span class="cat-tag">' + CAT_LABEL[p.cat] + '</span>' + rxBadge + '</div>' +
        '<h3>' + p.name + '</h3>' +
        '<p class="desc">' + p.desc + '</p>' +
        '<div class="rating"><span class="stars" aria-hidden="true">' + starString(p.rating) + '</span>' +
        '<span>' + p.rating.toFixed(1) + ' (' + p.reviews + ')</span></div>' +
        rxWarn +
        '<div class="card-foot"><span class="price">' + money(p.price) + '</span>' +
        '<button class="add-btn" type="button" data-id="' + p.id + '" aria-label="Add ' + stripTags(p.name) + ' to cart">Add</button></div>';

      grid.appendChild(li);
    });

    var count = list.length;
    resultCount.textContent = count;
    emptyGrid.hidden = count !== 0;
    grid.hidden = count === 0;

    var catTxt = activeCat === 'all' ? 'All products' : CAT_LABEL[activeCat];
    resultLabel.childNodes[0].nodeValue = catTxt + ' ';
  }

  function stripTags(s) {
    return s.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&');
  }

  function totalQty() {
    var n = 0;
    for (var k in cart) if (cart.hasOwnProperty(k)) n += cart[k];
    return n;
  }

  function cartTotal() {
    var t = 0;
    for (var k in cart) {
      if (!cart.hasOwnProperty(k)) continue;
      var p = byId(k);
      if (p) t += p.price * cart[k];
    }
    return t;
  }

  function byId(id) {
    for (var i = 0; i < PRODUCTS.length; i++) if (PRODUCTS[i].id === id) return PRODUCTS[i];
    return null;
  }

  function hasRx() {
    for (var k in cart) {
      if (!cart.hasOwnProperty(k)) continue;
      var p = byId(k);
      if (p && p.rx) return true;
    }
    return false;
  }

  function updateCartCount() {
    var n = totalQty();
    cartCount.textContent = n;
    cartCount.classList.remove('bump');
    void cartCount.offsetWidth; // restart animation
    cartCount.classList.add('bump');
  }

  function renderCart() {
    var ids = Object.keys(cart);
    cartItems.innerHTML = '';

    if (ids.length === 0) {
      cartEmpty.hidden = false;
      checkout.disabled = true;
    } else {
      cartEmpty.hidden = true;
      checkout.disabled = false;

      ids.forEach(function (id) {
        var p = byId(id);
        if (!p) return;
        var qty = cart[id];
        var line = document.createElement('div');
        line.className = 'line';
        var rxTag = p.rx ? '<div class="line-rx">℞ Vet approval needed</div>' : '';
        line.innerHTML =
          '<div class="line-thumb" aria-hidden="true">' + p.emoji + '</div>' +
          '<div class="line-main"><h4>' + p.name + '</h4>' + rxTag +
          '<div class="line-bottom"><div class="qty">' +
          '<button type="button" data-dec="' + id + '" aria-label="Decrease quantity">−</button>' +
          '<span aria-live="polite">' + qty + '</span>' +
          '<button type="button" data-inc="' + id + '" aria-label="Increase quantity">+</button></div>' +
          '<span class="line-price">' + money(p.price * qty) + '</span></div>' +
          '<button class="remove" type="button" data-rm="' + id + '">Remove</button></div>';
        cartItems.appendChild(line);
      });
    }

    totalEl.textContent = money(cartTotal());
    rxNote.hidden = !hasRx();
  }

  function addToCart(id, btn) {
    cart[id] = (cart[id] || 0) + 1;
    updateCartCount();
    renderCart();
    if (btn) {
      btn.textContent = 'Added ✓';
      btn.classList.add('added');
      setTimeout(function () {
        btn.textContent = 'Add';
        btn.classList.remove('added');
      }, 1000);
    }
  }

  function changeQty(id, delta) {
    if (!cart[id]) return;
    cart[id] += delta;
    if (cart[id] <= 0) delete cart[id];
    updateCartCount();
    renderCart();
  }

  function removeItem(id) {
    delete cart[id];
    updateCartCount();
    renderCart();
  }

  function openDrawer() {
    scrim.hidden = false;
    requestAnimationFrame(function () { scrim.classList.add('show'); });
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    closeCart.focus();
  }

  function closeDrawer() {
    scrim.classList.remove('show');
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    setTimeout(function () { scrim.hidden = true; }, 250);
    cartBtn.focus();
  }

  // ---- Events ----
  grid.addEventListener('click', function (e) {
    var btn = e.target.closest('.add-btn');
    if (btn) addToCart(btn.getAttribute('data-id'), btn);
  });

  cartItems.addEventListener('click', function (e) {
    var t = e.target;
    if (t.hasAttribute('data-inc')) changeQty(t.getAttribute('data-inc'), 1);
    else if (t.hasAttribute('data-dec')) changeQty(t.getAttribute('data-dec'), -1);
    else if (t.hasAttribute('data-rm')) removeItem(t.getAttribute('data-rm'));
  });

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      chips.forEach(function (c) {
        c.classList.remove('is-active');
        c.setAttribute('aria-pressed', 'false');
      });
      chip.classList.add('is-active');
      chip.setAttribute('aria-pressed', 'true');
      activeCat = chip.getAttribute('data-cat');
      renderGrid();
    });
  });

  search.addEventListener('input', function () {
    query = search.value.trim().toLowerCase();
    renderGrid();
  });

  cartBtn.addEventListener('click', openDrawer);
  closeCart.addEventListener('click', closeDrawer);
  scrim.addEventListener('click', closeDrawer);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && drawer.classList.contains('open')) closeDrawer();
  });

  checkout.addEventListener('click', function () {
    if (totalQty() === 0) return;
    checkout.textContent = 'Demo only — no real checkout';
    setTimeout(function () { checkout.textContent = 'Checkout'; }, 1600);
  });

  // ---- Init ----
  renderGrid();
  renderCart();
})();
