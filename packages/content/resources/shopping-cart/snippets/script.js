let items = [
  { id: 1, name: 'Pro UI Component Pack', variant: 'License · Indigo', price: 29, qty: 1, bg: 'linear-gradient(135deg,#818cf8,#6366f1)', icon: 'PRO' },
  { id: 2, name: 'GSAP Animation Bundle', variant: 'Full Access', price: 49, qty: 1, bg: 'linear-gradient(135deg,#f59e0b,#fb923c)', icon: '⚡' },
  { id: 3, name: 'React Starter Kit', variant: 'Standard · Green', price: 19, qty: 2, bg: 'linear-gradient(135deg,#34d399,#059669)', icon: '🚀' },
];
let discount = 0, freeShipping = false, removedItem = null, undoTimer = null;
const SHIPPING = 9;

const drawer  = document.getElementById('cartDrawer');
const overlay = document.getElementById('cartOverlay');
const trigger = document.getElementById('cartTrigger');
const closeBtn = document.getElementById('cartClose');
const closeBtn2 = document.getElementById('cartClose2');
const couponInput = document.getElementById('couponInput');
const couponBtn   = document.getElementById('couponBtn');
const couponMsg   = document.getElementById('couponMsg');

function openCart()  { drawer.classList.add('open'); overlay.classList.add('visible'); }
function closeCart() { drawer.classList.remove('open'); overlay.classList.remove('visible'); }

trigger?.addEventListener('click', openCart);
closeBtn?.addEventListener('click', closeCart);
closeBtn2?.addEventListener('click', closeCart);
overlay?.addEventListener('click', closeCart);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeCart(); });

function updateBadge() {
  const total = items.reduce((a, i) => a + i.qty, 0);
  document.getElementById('cartCount').textContent = total;
  document.getElementById('triggerBadge').textContent = total;
}

function recalc() {
  const subtotal = items.reduce((a, i) => a + i.price * i.qty, 0);
  const discountAmt = Math.round(subtotal * discount);
  const shipping = freeShipping || subtotal === 0 ? 0 : SHIPPING;
  const total = subtotal - discountAmt + shipping;

  document.getElementById('subtotal').textContent = '$' + subtotal.toFixed(2);
  document.getElementById('shipping').textContent = shipping === 0 ? (subtotal ? 'FREE' : '—') : '$' + shipping.toFixed(2);
  document.getElementById('total').textContent = '$' + (total > 0 ? total : 0).toFixed(2);

  const discRow = document.getElementById('discountRow');
  discRow.hidden = !discountAmt;
  document.getElementById('discount').textContent = '-$' + discountAmt.toFixed(2);
}

function renderItems() {
  const list = document.getElementById('cartItems');
  const empty = document.getElementById('cartEmpty');
  const footer = document.getElementById('cartFooter');

  list.innerHTML = '';

  if (!items.length) {
    list.hidden = true;
    empty.hidden = false;
    footer.hidden = true;
    updateBadge();
    return;
  }
  list.hidden = false;
  empty.hidden = true;
  footer.hidden = false;

  items.forEach(item => {
    const el = document.createElement('div');
    el.className = 'cart-item';
    el.dataset.id = item.id;
    el.innerHTML = `
      <div class="item-thumb" style="background:${item.bg}">${item.icon}</div>
      <div class="item-info">
        <div class="item-name">${item.name}</div>
        <div class="item-variant">${item.variant}</div>
        <div class="item-controls">
          <button class="qty-btn" data-action="dec" data-id="${item.id}">−</button>
          <span class="qty-num">${item.qty}</span>
          <button class="qty-btn" data-action="inc" data-id="${item.id}">+</button>
          <button class="item-remove" data-id="${item.id}">Remove</button>
        </div>
      </div>
      <div class="item-price">$${(item.price * item.qty).toFixed(2)}</div>
    `;
    list.appendChild(el);
  });

  // Events
  list.querySelectorAll('.qty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = items.find(i => i.id === +btn.dataset.id);
      if (!item) return;
      if (btn.dataset.action === 'inc') item.qty++;
      else if (btn.dataset.action === 'dec' && item.qty > 1) item.qty--;
      renderItems(); recalc();
    });
  });
  list.querySelectorAll('.item-remove').forEach(btn => {
    btn.addEventListener('click', () => removeItem(+btn.dataset.id));
  });

  updateBadge();
  recalc();
}

function removeItem(id) {
  const idx = items.findIndex(i => i.id === id);
  if (idx === -1) return;
  removedItem = { item: { ...items[idx] }, idx };
  items.splice(idx, 1);
  renderItems();

  clearTimeout(undoTimer);
  const toast = document.getElementById('undoToast');
  toast.hidden = false;
  undoTimer = setTimeout(() => { toast.hidden = true; removedItem = null; }, 4000);
}

document.getElementById('undoBtn')?.addEventListener('click', () => {
  if (!removedItem) return;
  items.splice(removedItem.idx, 0, removedItem.item);
  removedItem = null;
  clearTimeout(undoTimer);
  document.getElementById('undoToast').hidden = true;
  renderItems();
});

// Coupon
couponBtn?.addEventListener('click', () => {
  const code = couponInput.value.trim().toUpperCase();
  couponMsg.hidden = false;
  if (code === 'SAVE10') {
    discount = 0.10; freeShipping = false;
    couponMsg.className = 'coupon-msg ok'; couponMsg.textContent = '✓ 10% discount applied!';
  } else if (code === 'FREE') {
    freeShipping = true; discount = 0;
    couponMsg.className = 'coupon-msg ok'; couponMsg.textContent = '✓ Free shipping applied!';
  } else {
    couponMsg.className = 'coupon-msg err'; couponMsg.textContent = '✗ Invalid coupon code.';
    discount = 0; freeShipping = false;
  }
  recalc();
});

// Checkout
document.getElementById('checkoutBtn')?.addEventListener('click', async () => {
  const btn = document.getElementById('checkoutBtn');
  const txt = document.getElementById('checkoutText');
  btn.disabled = true;
  txt.textContent = 'Processing…';
  await new Promise(r => setTimeout(r, 1500));
  txt.textContent = '✓ Order placed! (demo)';
  setTimeout(() => { txt.textContent = 'Proceed to Checkout'; btn.disabled = false; }, 2000);
});

renderItems();
