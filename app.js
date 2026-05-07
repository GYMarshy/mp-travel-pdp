(function () {
  /* ---- Bag drawer ---- */

  function openDrawer() { document.body.classList.add('drawer-open'); }
  function closeDrawer() { document.body.classList.remove('drawer-open'); }

  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-open-bag-drawer]')) { openDrawer(); return; }
    if (e.target.closest('[data-close-drawer]'))   { closeDrawer(); return; }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeDrawer();
  });

  /* ---- Stepper ---- */

  document.addEventListener('click', function (e) {
    var stepper = e.target.closest('[data-stepper]');
    if (!stepper) return;
    var display = stepper.querySelector('[data-qty-value]');
    var qty = parseInt(display.textContent, 10);
    if (e.target.closest('[data-step-plus]'))  display.textContent = qty + 1;
    if (e.target.closest('[data-step-minus]')) display.textContent = Math.max(1, qty - 1);
  });

  /* ---- Colour swatches ---- */

  document.addEventListener('click', function (e) {
    var swatch = e.target.closest('.swatch[data-colour]');
    if (!swatch) return;
    var group = swatch.closest('.colour-swatches');
    group.querySelectorAll('.swatch').forEach(function (s) { s.classList.remove('is-active'); });
    swatch.classList.add('is-active');
    var label = document.getElementById('selected-colour');
    if (label) label.textContent = swatch.dataset.colour;
  });

  /* ---- Config swatches ---- */

  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.swatch-text[data-config]');
    if (!btn) return;
    var group = btn.closest('.swatch-text-list');
    group.querySelectorAll('.swatch-text').forEach(function (b) { b.classList.remove('is-active'); });
    btn.classList.add('is-active');
    var label = document.getElementById('selected-config');
    if (label) label.textContent = btn.dataset.config;
  });

  /* ---- Config builder (step-builder for Variant B) ---- */

  document.addEventListener('click', function (e) {
    var opt = e.target.closest('.config-option');
    if (!opt) return;

    var builder = opt.closest('.config-builder');
    builder.querySelectorAll('.config-option').forEach(function (o) { o.classList.remove('is-active'); });
    opt.classList.add('is-active');

    var configKey = opt.dataset.config;
    var label     = document.getElementById('selected-config-label');
    var priceEl   = document.getElementById('pdp-price-main');
    var prefixEl  = document.getElementById('pdp-price-prefix');
    var subEl     = document.getElementById('pdp-price-sub');

    if (label && opt.dataset.title)    label.textContent    = opt.dataset.title;
    if (priceEl && opt.dataset.price)  priceEl.textContent  = '£' + opt.dataset.price;
    if (prefixEl)                      prefixEl.textContent = configKey === 'pushchair' ? 'From' : '';
    if (subEl && opt.dataset.pricesub) subEl.textContent    = opt.dataset.pricesub;

    document.querySelectorAll('[data-whats-included]').forEach(function (panel) {
      panel.hidden = panel.dataset.whatsIncluded !== configKey;
    });
  });

  /* ---- Gallery thumbnails ---- */

  document.addEventListener('click', function (e) {
    var thumb = e.target.closest('.thumbs img');
    if (!thumb) return;
    var thumbs = thumb.closest('.thumbs');
    thumbs.querySelectorAll('img').forEach(function (t) { t.classList.remove('is-active'); });
    thumb.classList.add('is-active');
    var main = document.getElementById('gallery-main-img');
    if (main && thumb.dataset.full) main.src = thumb.dataset.full;
  });

  /* ---- Accordion ---- */

  document.addEventListener('click', function (e) {
    var item = e.target.closest('[data-acc]');
    if (!item) return;
    item.classList.toggle('is-open');
  });

  /* ---- Add to bag (prototype simulation) ---- */

  var bagItems = [];

  document.addEventListener('click', function (e) {
    if (!e.target.closest('[data-add-to-bag]')) return;

    var qty = 1;
    var qtyEl = document.querySelector('[data-qty-value]');
    if (qtyEl) qty = parseInt(qtyEl.textContent, 10);

    var colour = document.getElementById('selected-colour');
    var config = document.getElementById('selected-config');
    var title = document.querySelector('.pdp-title');

    bagItems.push({
      name: title ? title.textContent : 'Product',
      variant: [colour ? colour.textContent : '', config ? config.textContent : ''].filter(Boolean).join(' — '),
      qty: qty,
      price: 795,
    });

    renderBag();
    openDrawer();
  });

  function renderBag() {
    var emptyEl = document.getElementById('drawer-empty');
    var itemsEl = document.getElementById('drawer-items');
    var totalEl = document.getElementById('drawer-total');
    var countEl = document.getElementById('bag-count');

    if (!itemsEl) return;

    if (emptyEl) emptyEl.style.display = bagItems.length ? 'none' : '';

    var existingItems = itemsEl.querySelectorAll('.drawer-item');
    existingItems.forEach(function (el) { el.remove(); });

    var total = 0;
    bagItems.forEach(function (item) {
      total += item.price * item.qty;
      var div = document.createElement('div');
      div.className = 'drawer-item';
      div.innerHTML =
        '<img src="https://placehold.co/82x98/f4f0ec/999999?text=" alt="" />' +
        '<div>' +
          '<div class="name">' + item.name + '</div>' +
          '<div style="font-size:12px;color:#666;margin-top:3px">' + item.variant + '</div>' +
          '<div class="price-row" style="margin-top:6px"><strong>£' + item.price.toFixed(2) + '</strong></div>' +
          '<div style="font-size:12px;color:#666">Qty: ' + item.qty + '</div>' +
        '</div>';
      itemsEl.appendChild(div);
    });

    if (totalEl) totalEl.textContent = '£' + total.toFixed(2);
    if (countEl) countEl.textContent = bagItems.length ? '(' + bagItems.reduce(function (s, i) { return s + i.qty; }, 0) + ')' : '';
  }
})();
