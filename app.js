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

  /* ---- Features tabs ---- */

  document.addEventListener('click', function (e) {
    var tab = e.target.closest('.features-tab');
    if (!tab) return;
    var key = tab.dataset.featuresTab;
    var section = tab.closest('.section-block');
    section.querySelectorAll('.features-tab').forEach(function (t) { t.classList.remove('is-active'); });
    tab.classList.add('is-active');
    section.querySelectorAll('.features-panel').forEach(function (p) {
      p.hidden = p.dataset.featuresPanel !== key;
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

  /* ---- Configurator (Variant E): live preview + total ---- */

  function recalcConfigTotal() {
    var activeOpt = document.querySelector('.config-rail .config-option.is-active');
    if (!activeOpt) return;
    var base = parseInt(activeOpt.dataset.base, 10) || 0;
    var extras = 0;
    document.querySelectorAll('.config-extras input[type="checkbox"]:checked').forEach(function (cb) {
      extras += parseInt(cb.dataset.extraPrice, 10) || 0;
    });
    var total = base + extras;
    var totalEl = document.getElementById('config-total');
    if (totalEl) totalEl.textContent = '£' + total.toLocaleString();

    var savings = { 'pushchair': 0, 'carrycot': 30, 'carseat': 80, 'travel': 290 };
    var key = activeOpt.dataset.config;
    var savingEl = document.getElementById('config-saving');
    if (savingEl) savingEl.textContent = savings[key] ? 'Save £' + savings[key] + ' vs separately' : '';
  }

  document.addEventListener('click', function (e) {
    var rail = e.target.closest('.config-rail');
    if (!rail) return;

    var swatch = e.target.closest('.swatch[data-colour]');
    if (swatch) {
      var colourLabel = document.getElementById('config-colour-label');
      var bundleColour = document.getElementById('config-bundle-colour');
      var preview = document.getElementById('config-preview-img');
      if (colourLabel)  colourLabel.textContent  = swatch.dataset.colour;
      if (bundleColour) bundleColour.textContent = swatch.dataset.colour;
      if (preview && swatch.dataset.preview) {
        preview.src = 'https://placehold.co/420x420/' + swatch.dataset.preview + '/d8c8b8?text=Live+Preview';
      }
    }

    var opt = e.target.closest('.config-option');
    if (opt) {
      var bundleTitle = document.getElementById('config-bundle-title');
      var bundlePieces = document.getElementById('config-bundle-pieces');
      if (bundleTitle  && opt.dataset.title)  bundleTitle.textContent  = opt.dataset.title;
      if (bundlePieces && opt.dataset.pieces) bundlePieces.textContent = opt.dataset.pieces;
      recalcConfigTotal();
    }
  });

  document.addEventListener('change', function (e) {
    if (!e.target.closest('.config-extras')) return;
    var label = e.target.closest('.config-extra');
    if (label) label.classList.toggle('is-on', e.target.checked);
    recalcConfigTotal();
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
