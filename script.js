/* ═══════════════════════════════════════════
   AHISTAA CROCHET — script.js [FIXED]
   ═══════════════════════════════════════════ */

/* ─────────────────────────────────────────────
   NAV CONTROLS 
   ───────────────────────────────────────────── */
function toggleNav() {
  const navLinks = document.getElementById('navLinks');
  if (navLinks) navLinks.classList.toggle('open');
}

function closeNav() {
  const navLinks = document.getElementById('navLinks');
  if (navLinks) navLinks.classList.remove('open');
}

window.addEventListener('scroll', () => {
  const nav = document.getElementById('navbar');
  if (nav) {
    if (window.scrollY > 50) {
      nav.classList.add('scrolled');
    } else { 
      nav.classList.remove('scrolled');
    } 
  }
}); 

/* ─────────────────────────────────────────────
   TOAST NOTIFICATION SYSTEM
   ───────────────────────────────────────────── */
let toastTimer;
function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.innerText = message;
  toast.classList.add('show');

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

/* ═══════════════════════════════════════════
   PRODUCT CATALOG
   ═══════════════════════════════════════════ */
const CATEGORIES = ['Toys', 'Gifts', 'Bags', 'Home Decor', 'Accessories'];

const CAT_DESC = {
  'Toys': 'Soft, huggable amigurumi friends crocheted by hand with hypoallergenic yarn — safe and snuggly for every age.',
  'Gifts': 'Thoughtful handmade gifts for birthdays, festivals, and everyday love — each one carries a little extra warmth.',
  'Bags': 'Durable, stylish crochet bags woven stitch by stitch — perfect for daily errands or a boho evening out.',
  'Home Decor': 'Bring cosy, handcrafted charm into your space with pieces made slowly, with intention and care.',
  'Accessories': 'Sweet finishing touches — hand-crocheted hair pieces, bands, and more to complete your look.'
};

const PRODUCT_NAMES = {
  'Toys': ['Cuddly Bunny Amigurumi', 'Baby Elephant Plush', 'Rainbow Octopus Toy', 'Sleepy Sloth Buddy', 'Tiny Teddy Bear'],
  'Gifts': ['Personalized Name Keychain', 'Mini Flower Bouquet', 'Heart Charm Bracelet', 'Birthday Gift Basket', 'Crochet Coaster Set'],
  'Bags': ['Boho Tote Bag', 'Mini Sling Purse', 'Granny Square Tote', 'Market Basket Bag', 'Pastel Crossbody Bag'],
  'Home Decor': ['Macrame Wall Hanging', 'Boho Table Runner', 'Coaster Set of Four', 'Hanging Planter Basket', 'Doily Centerpiece'],
  'Accessories': ['Flower Hair Clip Set', 'Pearl Headband', 'Crochet Bucket Hat', 'Boho Anklet', 'Scrunchie Trio Pack']
};

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

const IMAGE_FOLDER = 'shopimg';
const IMAGES_PER_PRODUCT = 3;

const PRODUCTS = [];
let imgCounter = 0;
CATEGORIES.forEach(cat => {
  PRODUCT_NAMES[cat].forEach((name, i) => {
    const id = `${slugify(cat)}-${i + 1}`;
    const rawPrice = 249 + ((i * 57 + cat.length * 13) % 550);
    const price = Math.round(rawPrice / 10) * 10;
    const imgs = [];
    for (let n = 0; n < IMAGES_PER_PRODUCT; n++) {
      imgCounter += 1;
      // FIX: Ensure path notation works seamlessly across local live servers
      imgs.push(`./${IMAGE_FOLDER}/img${imgCounter}.jpg`);
    }
    PRODUCTS.push({ id, name, cat, price, imgs });
  });
});

function productById(id) {
  return PRODUCTS.find(p => p.id === id);
}

const FEATURED_IDS = [];
CATEGORIES.slice(0, 4).forEach(cat => {
  PRODUCTS.filter(p => p.cat === cat).slice(0, 2).forEach(p => FEATURED_IDS.push(p.id));
});

// NOTE: There is intentionally no fallback/placeholder image function here.
// If a product photo fails to load, the <img> is simply hidden (see the
// onerror="hideBrokenImg(this)" handlers below) so the image area is left
// blank rather than showing an emoji, icon, or placeholder.
function hideBrokenImg(imgEl) {
  if (!imgEl) return;
  imgEl.onerror = null;
  imgEl.style.display = 'none';
}

/* ═══════════════════════════════════════════
   LOCALSTORAGE CART HELPERS
   ═══════════════════════════════════════════ */
const CART_KEY = 'ahistaa_cart';

function loadCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
  catch (e) { return []; }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function updateCartCount() {
  const cart = loadCart();
  const total = cart.reduce((sum, item) => sum + item.qty, 0);
  const badge = document.getElementById('cartCount');
  if (badge) badge.textContent = total;
}

function addToCart(product) {
  if (!product) return;
  const cart = loadCart();
  const existing = cart.find(i => i.id === product.id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }
  saveCart(cart);
  updateCartCount();
  renderCartPanel();
  showToast(`"${product.name}" added to cart 🛒`);
}

function changeQty(id, delta) {
  const cart = loadCart();
  const idx = cart.findIndex(i => i.id === id);
  if (idx < 0) return;
  cart[idx].qty += delta;
  if (cart[idx].qty <= 0) cart.splice(idx, 1);
  saveCart(cart);
  updateCartCount();
  renderCartPanel();
}

function removeFromCart(id) {
  const cart = loadCart().filter(i => i.id !== id);
  saveCart(cart);
  updateCartCount();
  renderCartPanel();
  showToast('Item removed from cart');
}

function renderCartPanel() {
  const cart = loadCart();
  const itemsEl = document.getElementById('cartItems');
  const totalEl = document.getElementById('cartTotal');
  if (!itemsEl || !totalEl) return;

  if (cart.length === 0) {
    itemsEl.innerHTML = `
      <div class="cart-empty">
        <div class="cart-empty-icon">🧶</div>
        <p>Your cart is empty</p>
      </div>`;
    totalEl.textContent = '₹0';
    return;
  }

  itemsEl.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img class="cart-item-img" src="${item.imgs[0]}" alt="${item.name}" onerror="hideBrokenImg(this)"/>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">₹${item.price} × ${item.qty}</div>
      </div>
      <div class="cart-item-controls">
        <button class="qty-btn" onclick="changeQty('${item.id}',-1)" aria-label="Decrease quantity">−</button>
        <span class="qty-num">${item.qty}</span>
        <button class="qty-btn" onclick="changeQty('${item.id}',1)" aria-label="Increase quantity">+</button>
        <button class="remove-btn" onclick="removeFromCart('${item.id}')" aria-label="Remove item">✕</button>
      </div>
    </div>`).join('');

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  totalEl.textContent = `₹${total}`;
}

function toggleCart() {
  const overlay = document.getElementById('cartOverlay');
  const panel = document.getElementById('cartPanel');
  if (!overlay || !panel) return;
  const opening = !panel.classList.contains('open');
  overlay.classList.toggle('open');
  panel.classList.toggle('open');
  if (opening) renderCartPanel();
}

function closeCartPanel() {
  const overlay = document.getElementById('cartOverlay');
  const panel = document.getElementById('cartPanel');
  if (overlay) overlay.classList.remove('open');
  if (panel) panel.classList.remove('open');
}

/* ═══════════════════════════════════════════
   PRODUCT RENDERING + CATEGORY FILTER
   ═══════════════════════════════════════════ */
function productCardHTML(p, featured) {
  return `
    <div class="product-card" data-cat="${p.cat}" onclick="openPreview('${p.id}')">
      ${featured ? '<span class="badge badge-featured">Featured</span>' : ''}
      <div class="product-img">
        <img class="product-img-bg" src="${p.imgs[0]}" alt="${p.name}" loading="lazy" onerror="hideBrokenImg(this)"/>
      </div>
      <div class="product-info">
        <div class="product-category">${p.cat}</div>
        <div class="product-name">${p.name}</div>
        <div class="product-price">₹${p.price}</div>
        <button class="add-btn" onclick="event.stopPropagation(); addToCart(productById('${p.id}'))">Add to Cart</button>
      </div>
    </div>`;
}

function renderFeatured() {
  const el = document.getElementById('featuredGrid');
  if (!el) return;
  el.innerHTML = FEATURED_IDS.map(id => productCardHTML(productById(id), true)).join('');
}

function renderProducts() {
  const el = document.getElementById('productsGrid');
  if (!el) return;
  el.innerHTML = PRODUCTS.map(p => productCardHTML(p, false)).join('');
}

function filterProducts(category, evt) {
  const buttons = document.querySelectorAll('.filter-btn');
  buttons.forEach(btn => btn.classList.remove('active'));
  const clicked = (evt && evt.currentTarget) || (window.event && window.event.currentTarget);
  if (clicked) clicked.classList.add('active');

  document.querySelectorAll('#productsGrid .product-card').forEach(card => {
    const show = category === 'All' || card.dataset.cat === category;
    card.style.display = show ? '' : 'none';
  });
}

/* ═══════════════════════════════════════════
   PRODUCT PREVIEW MODAL (4-image gallery)
   ═══════════════════════════════════════════ */
let previewProduct = null;
let previewIdx = 0;

function openPreview(id) {
  previewProduct = productById(id);
  if (!previewProduct) return;

  document.getElementById('previewTitle').textContent = previewProduct.name;
  document.getElementById('previewCat').textContent = previewProduct.cat;
  document.getElementById('previewPrice').textContent = `₹${previewProduct.price}`;
  document.getElementById('previewDesc').textContent = CAT_DESC[previewProduct.cat] || 'Handcrafted with love.';

  document.getElementById('previewSlides').innerHTML = previewProduct.imgs.map(src => `
    <div class="preview-slide"><img src="${src}" alt="${previewProduct.name}" onerror="hideBrokenImg(this)"/></div>
  `).join('');

  document.getElementById('previewDots').innerHTML = previewProduct.imgs.map((_, i) => `
    <button class="preview-dot${i === 0 ? ' active' : ''}" onclick="event.stopPropagation();goPreviewSlide(${i})" aria-label="Image ${i + 1}"></button>
  `).join('');

  goPreviewSlide(0);
  document.getElementById('previewOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function goPreviewSlide(idx) {
  if (!previewProduct) return;
  const count = previewProduct.imgs.length;
  previewIdx = (idx + count) % count;
  document.getElementById('previewSlides').style.transform = `translateX(-${previewIdx * 100}%)`;
  document.querySelectorAll('#previewDots .preview-dot').forEach((d, i) => d.classList.toggle('active', i === previewIdx));
}

function previewSlide(delta) {
  goPreviewSlide(previewIdx + delta);
}

function closePreview() {
  const previewOverlay = document.getElementById('previewOverlay');
  if (previewOverlay) previewOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

function handlePreviewOverlayClick(e) {
  if (e.target.id === 'previewOverlay') closePreview();
}

function addFromPreview() {
  if (previewProduct) addToCart(previewProduct);
}

function buyFromPreview() {
  if (!previewProduct) return;
  const product = previewProduct;
  closePreview();
  openOrder('single', product);
}

/* ═══════════════════════════════════════════
   ORDER MODAL & NOTIFICATIONS
   ═══════════════════════════════════════════ */
const EMAILJS_SERVICE_ID = 'YOUR_SERVICE_ID';
const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';
const EMAILJS_PUBLIC_KEY = 'YOUR_PUBLIC_KEY';

let emailjsReady = false;
try {
  if (window.emailjs && EMAILJS_PUBLIC_KEY !== 'YOUR_PUBLIC_KEY') {
    emailjs.init(EMAILJS_PUBLIC_KEY);
    emailjsReady = true;
  }
} catch (e) {}

/* ─────────────────────────────────────────────
   ORDER NOTIFICATION MESSAGE (shared by WhatsApp + Telegram)
   Includes: Order ID, Name, Phone, Alt Phone (if given),
   Address, State, City, Product name(s)/qty/price(s),
   Total, and Date & Time.
   ───────────────────────────────────────────── */
function buildOrderNotificationText(templateParams) {
  const altLine = templateParams.customer_alt_phone
    ? `☎️ Alternate: ${templateParams.customer_alt_phone}\n`
    : '';

  return (
    `🧶 New Ahistaa Order!\n` +
    `🆔 Order ID: ${templateParams.order_id}\n` +
    `👤 Name: ${templateParams.customer_name}\n` +
    `📞 Phone: ${templateParams.customer_phone}\n` +
    altLine +
    `🏠 Address: ${templateParams.customer_address}\n` +
    `📍 State: ${templateParams.customer_state}\n` +
    `🏙️ City: ${templateParams.customer_city}\n\n` +
    `🛍️ Items:\n${templateParams.product_list}\n\n` +
    `💰 Total: ${templateParams.total_amount}\n` +
    `🛒 Mode: ${templateParams.order_mode}\n` +
    `🕒 Date: ${templateParams.order_date}`
  );
}

const WHATSAPP_NUMBER = '919848205122'; 
const CALLMEBOT_APIKEY = 'YOUR_CALLMEBOT_APIKEY';

async function sendWhatsAppNotification(templateParams) {
  if (CALLMEBOT_APIKEY === 'YOUR_CALLMEBOT_APIKEY') {
    console.log('CallMeBot not configured yet — WhatsApp notification skipped.');
    return;
  }
  const text = buildOrderNotificationText(templateParams);
  const url = `https://api.callmebot.com/whatsapp.php?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(text)}&apikey=${CALLMEBOT_APIKEY}`;

  try { await fetch(url); } catch (err) { console.error('WhatsApp notification failed:', err); }
}

// ⚠️ DIRECT MODE: bot token lives here in plain browser-side code.
// Anyone who views this site's source (Ctrl+U / dev tools) can see and
// copy TELEGRAM_BOT_TOKEN below and use your bot with it. Only use this
// if you understand and accept that tradeoff. Fill in your NEW token
// (after revoking the one shared earlier) and your chat ID.
const TELEGRAM_BOT_TOKEN = '8800261974:AAGBXXXyGoG_gn8ceFW9ZuauYqKTSXGc_XY';
const TELEGRAM_CHAT_ID   = '8567131544';

async function sendTelegramNotification(templateParams) {
  if (TELEGRAM_BOT_TOKEN === 'YOUR_NEW_BOT_TOKEN') {
    console.log('Telegram bot token not set yet — notification skipped.');
    return;
  }

  const text = buildOrderNotificationText(templateParams);
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: text
      })
    });
  } catch (err) { console.error('Telegram notification failed:', err); }
}

let orderContext = null; 
let currentOrderId = '';
let orderGrandTotal = 0;

function openOrder(mode, product) {
  mode = mode || 'cart';
  let items;
  if (mode === 'single' && product) {
    items = [{ ...product, qty: 1 }];
  } else {
    items = loadCart();
    if (items.length === 0) {
      showToast('Your cart is empty 🛒');
      return;
    }
  }
  orderContext = { mode, items };
  closeCartPanel();
  renderOrderForm();
  const modalOverlay = document.getElementById('modalOverlay');
  if (modalOverlay) modalOverlay.classList.add('open');
}

function closeOrder() {
  const modalOverlay = document.getElementById('modalOverlay');
  if (modalOverlay) modalOverlay.classList.remove('open');
}

function renderOrderForm() {
  const total = orderContext.items.reduce((s, i) => s + i.price * i.qty, 0);
  orderGrandTotal = total;

  const itemsHtml = orderContext.items.map(i => `
    <div class="order-item-row"><span>${i.name} × ${i.qty}</span><span>₹${i.price * i.qty}</span></div>
  `).join('');

  const modalBody = document.getElementById('modalBody');
  if (!modalBody) return;

  modalBody.innerHTML = `
    <div class="form-row">
      <div class="form-group">
        <label>Full Name</label>
        <input type="text" id="ordName" placeholder="Your name" />
      </div>
      <div class="form-group">
        <label>Phone</label>
        <input type="tel" id="ordPhone" placeholder="10-digit number" maxlength="10" inputmode="numeric" />
      </div>
    </div>
    <div class="form-group">
      <label>Alternate Mobile Number <span style="text-transform:none;font-weight:400;letter-spacing:0;opacity:.65">(optional)</span></label>
      <input type="tel" id="ordAltPhone" placeholder="10-digit number (optional)" maxlength="10" inputmode="numeric" />
    </div>
    <div class="form-group">
      <label>Address</label>
      <textarea id="ordAddress" rows="2" placeholder="House no, street, area"></textarea>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>State</label>
        <select id="ordState" onchange="onOrderStateChange()">
          <option value="">Select State</option>
        </select>
      </div>
      <div class="form-group">
        <label>City</label>
        <select id="ordCity" disabled>
          <option value="">Select State first</option>
        </select>
      </div>
    </div>
    <div class="order-summary">
      <h4>Order Summary</h4>
      ${itemsHtml}
      <div class="order-total-row"><span>Total</span><span>₹${total}</span></div>
    </div>
    <button class="submit-btn" id="placeOrderBtn" onclick="submitOrder()">Confirm Order</button>
    <div id="orderFormStatus" style="font-size:.8rem;text-align:center;color:var(--text-soft)"></div>
  `;

  populateOrderStateDropdown();
}

/* ─────────────────────────────────────────────
   STATE → CITY DEPENDENT DROPDOWN
   ───────────────────────────────────────────── */
function populateOrderStateDropdown() {
  const stateSel = document.getElementById('ordState');
  if (!stateSel || typeof INDIA_STATES_CITIES === 'undefined') return;

  const states = Object.keys(INDIA_STATES_CITIES);
  stateSel.innerHTML =
    '<option value="">Select State</option>' +
    states.map(s => `<option value="${s}">${s}</option>`).join('');
}

function onOrderStateChange() {
  const stateSel = document.getElementById('ordState');
  const citySel = document.getElementById('ordCity');
  if (!stateSel || !citySel) return;

  const state = stateSel.value;
  const cities = (typeof INDIA_STATES_CITIES !== 'undefined' && INDIA_STATES_CITIES[state]) || [];

  if (!state || cities.length === 0) {
    citySel.innerHTML = '<option value="">Select State first</option>';
    citySel.disabled = true;
    return;
  }

  citySel.disabled = false;
  citySel.innerHTML =
    '<option value="">Select City</option>' +
    cities.map(c => `<option value="${c}">${c}</option>`).join('');
}

function validateOrderForm() {
  const name = document.getElementById('ordName').value.trim();
  const phone = document.getElementById('ordPhone').value.trim().replace(/\D/g, '');
  const altPhone = document.getElementById('ordAltPhone').value.trim().replace(/\D/g, '');
  const address = document.getElementById('ordAddress').value.trim();
  const state = document.getElementById('ordState').value;
  const city = document.getElementById('ordCity').value;

  if (name.length < 2) { showToast('Please enter your name'); return null; }
  if (!/^\d{10}$/.test(phone)) { showToast('Enter a valid 10-digit phone number'); return null; }
  // Alternate mobile number is OPTIONAL — only validated if the customer typed something in.
  if (altPhone && !/^\d{10}$/.test(altPhone)) {
    showToast('Enter a valid 10-digit alternate number, or leave it blank');
    return null;
  }
  if (address.length < 5) { showToast('Please enter your full address'); return null; }
  if (!state) { showToast('Please select your state'); return null; }
  if (!city) { showToast('Please select your city'); return null; }

  return { name, phone, altPhone, address, state, city };
}

function generateOrderId() {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, '');
  const key = `ahistaa_order_counter_${date}`;
  const count = parseInt(localStorage.getItem(key) || '0') + 1;
  localStorage.setItem(key, count);
  return `AC-${date}-${String(count).padStart(4, '0')}`;
}

async function submitOrder() {
  const data = validateOrderForm();
  if (!data) return;

  const btn = document.getElementById('placeOrderBtn');
  const status = document.getElementById('orderFormStatus');
  if (btn) {
    btn.disabled = true;
    btn.textContent = '⏳ Placing Order…';
  }
  if (status) status.textContent = '';

  currentOrderId = generateOrderId();

  const productList = orderContext.items
    .map(i => `• ${i.name} (${i.cat}) — Qty: ${i.qty} — Price: ₹${i.price} each — Subtotal: ₹${i.price * i.qty}`)
    .join('\n');

  const templateParams = {
    order_id: currentOrderId,
    customer_name: data.name,
    customer_phone: data.phone,
    customer_alt_phone: data.altPhone || '',
    customer_address: data.address,
    customer_state: data.state,
    customer_city: data.city,
    product_list: productList,
    total_amount: `₹${orderGrandTotal}`,
    order_mode: orderContext.mode === 'cart' ? 'Cart Order' : 'Direct Buy',
    order_date: now_str()
  };

  if (emailjsReady) {
    try { await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams); } 
    catch (err) { console.error('EmailJS error:', err); }
  }

  sendWhatsAppNotification(templateParams);
  sendTelegramNotification(templateParams);

  if (orderContext.mode === 'cart') {
    saveCart([]);
    updateCartCount();
    renderCartPanel();
  }

  showOrderSuccess(data.name);
}

function now_str() {
  return new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
}

function showOrderSuccess(name) {
  const modalBody = document.getElementById('modalBody');
  if (modalBody) {
    modalBody.innerHTML = `
      <div class="success-modal">
        <div class="success-icon">💝</div>
        <h3>Order Received!</h3>
        <p>Thank you, ${name}! Your order <strong>${currentOrderId}</strong> worth ₹${orderGrandTotal} has been placed.</p>
        <button class="success-close-btn" onclick="closeOrder()">Continue Shopping</button>
      </div>`;
  }
}

/* ═══════════════════════════════════════════
   INIT
   ═══════════════════════════════════════════ */
document.addEventListener("DOMContentLoaded", () => {
  renderFeatured();
  renderProducts();
  updateCartCount();
});