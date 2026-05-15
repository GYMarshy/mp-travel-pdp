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

  /* ---- Compatibility checker (Variant F) ---- */

  document.addEventListener('submit', function (e) {
    var form = e.target.closest('#compat-form');
    if (!form) return;
    e.preventDefault();
    var make = document.getElementById('car-make').value;
    var model = document.getElementById('car-model').value;
    var result = document.getElementById('compat-result');
    if (!result) return;
    if (!make || !model) {
      result.innerHTML = '<strong>Please pick both a make and model</strong> Then we can confirm the fit.';
      result.hidden = false;
      return;
    }
    result.innerHTML =
      '<strong>✓ Yes, the Cybex Cloud T fits your ' + make + ' ' + model + '</strong>' +
      'Compatible with both isofix and seatbelt installation. Front-passenger and rear-seat positions confirmed. ' +
      '<a href="#" style="color:var(--teal-dark);text-decoration:underline;">View installation guide →</a>';
    result.hidden = false;
  });

  /* ---- View toggle (Variant G — gallery lifestyle/studio) ---- */

  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-view-toggle] button');
    if (!btn) return;
    var group = btn.closest('[data-view-toggle]');
    group.querySelectorAll('button').forEach(function (b) { b.classList.remove('is-active'); });
    btn.classList.add('is-active');
    var main = document.getElementById('gallery-main-img');
    if (!main) return;
    if (btn.dataset.view === 'studio') {
      main.src = 'https://placehold.co/640x700/eaeaea/666666?text=Studio+View';
    } else {
      main.src = 'https://placehold.co/640x700/3d3530/d8c8b8?text=Lifestyle+View';
    }
  });

  /* ---- Wizard (Variant I + Variant J modal) ---- */

  function showWizardStep(step, container) {
    var scope = container || document;
    scope.querySelectorAll('.wizard-step').forEach(function (s) {
      s.hidden = s.dataset.wizardStep !== String(step);
    });
    var progress = scope.querySelector('.wizard-progress');
    if (progress) {
      var steps = progress.querySelectorAll('span');
      var done = step === 'result' ? 3 : (parseInt(step, 10) || 1);
      steps.forEach(function (sp, i) {
        sp.classList.toggle('is-done', i < done);
      });
    }
    var wizardSection = scope.id === 'wizard' ? scope : scope.querySelector('#wizard');
    if (wizardSection) wizardSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* ---- Wizard modal (Variant J) ---- */

  document.addEventListener('click', function (e) {
    if (e.target.closest('#wizard-open')) {
      var modal = document.getElementById('wizard-modal');
      if (modal) {
        modal.classList.add('is-open');
        showWizardStep(1, modal);
      }
      return;
    }
    if (e.target.closest('#wizard-close') ||
        (e.target.matches('[data-wizard-modal-overlay]'))) {
      var modal2 = document.getElementById('wizard-modal');
      if (modal2) modal2.classList.remove('is-open');
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      var modal = document.getElementById('wizard-modal');
      if (modal) modal.classList.remove('is-open');
    }
  });

  /* ---- Accessories total (Variant J) ---- */

  function recalcJAccessoriesTotal() {
    var total = 0;
    document.querySelectorAll('.j-accessory input[type="checkbox"]:checked').forEach(function (cb) {
      var label = cb.closest('.j-accessory');
      total += parseInt(label.dataset.extraPrice, 10) || 0;
    });
    var totalEl = document.getElementById('j-accessories-total');
    if (totalEl) totalEl.textContent = '£' + total.toLocaleString();
  }

  document.addEventListener('change', function (e) {
    var acc = e.target.closest('.j-accessory');
    if (!acc) return;
    acc.classList.toggle('is-on', e.target.checked);
    recalcJAccessoriesTotal();
  });

  /* ---- Details swap on config change (Variant J) ---- */

  document.addEventListener('click', function (e) {
    var opt = e.target.closest('.j-buybox .config-option');
    if (!opt) return;
    var key = opt.dataset.config;
    document.querySelectorAll('details.j-included').forEach(function (d) {
      d.hidden = d.dataset.whatsIncluded !== key;
    });
  });

  /* ---- v3 (Variant K) bundle picker — base + delta + car-seat sub-selector ---- */

  var K_BUNDLES = {
    pushchair: { name: 'Pushchair only',     pieces: 4,  basePrice:  849, saving:   0, hasCarSeat: false,
                 baseItems: ['Frame & seat unit', 'Hood', 'Rain cover', 'Cup holder'] },
    carrycot:  { name: 'Pushchair + Carrycot', pieces: 6, basePrice: 1048, saving:  30, hasCarSeat: false,
                 baseItems: ['Frame & seat unit', 'Hood', 'Rain cover', 'Cup holder', 'Lie-flat carrycot', 'Carrycot mattress'] },
    carseat:   { name: 'Pushchair + Car Seat', pieces: 7, basePrice: 1349, saving:  80, hasCarSeat: true,
                 baseItems: ['Frame & seat unit', 'Hood', 'Rain cover', 'Cup holder', 'i-Size car seat', 'Isofix base', 'Car seat adapters'] },
    travel:    { name: 'Full Travel System',   pieces: 9, basePrice: 1499, saving: 290, hasCarSeat: true,
                 baseItems: ['Frame & seat unit', 'Hood', 'Rain cover', 'Cup holder', 'Lie-flat carrycot', 'Carrycot mattress', 'i-Size car seat', 'Isofix base', 'Car seat adapters'] },
  };

  var kState = {
    bundleKey: 'travel',
    carSeatName: 'Cybex Cloud T',
    carSeatDelta: 0,
    carSeatColour: 'Sand',
    pramColour: 'Americano',
  };

  function kRender() {
    var bundle = K_BUNDLES[kState.bundleKey];
    if (!bundle) return;

    var totalPrice = bundle.basePrice + (bundle.hasCarSeat ? kState.carSeatDelta : 0);
    var priceEl = document.getElementById('k-price');
    if (priceEl) priceEl.textContent = '£' + totalPrice.toLocaleString();

    var saveEl = document.getElementById('k-price-saving');
    if (saveEl) {
      if (bundle.saving > 0) {
        saveEl.innerHTML = '£' + bundle.saving + ' less than separately <span class="k-test-mark">T4</span>';
      } else {
        saveEl.innerHTML = '<a href="#tests" class="k-test-mark">T4</a>';
        saveEl.textContent = '';
      }
    }

    var bnameEl = document.getElementById('k-bundle-name');
    if (bnameEl) bnameEl.textContent = bundle.name;

    var subtitle = document.getElementById('k-subtitle');
    if (subtitle) {
      var subStr = bundle.pieces + '-piece bundle';
      if (bundle.hasCarSeat) subStr = bundle.pieces + '-piece bundle with ' + kState.carSeatName;
      if (kState.bundleKey === 'pushchair') subStr = 'Frame, seat, hood &amp; rain cover';
      subtitle.innerHTML = subStr + ' — ' + kState.pramColour;
    }

    var countEl = document.getElementById('k-piece-count');
    if (countEl) countEl.textContent = bundle.pieces + ' pieces';

    var listEl = document.getElementById('k-included-list');
    if (listEl) {
      listEl.innerHTML = '';
      bundle.baseItems.forEach(function (item) {
        var li = document.createElement('li');
        var displayItem = item;
        if (bundle.hasCarSeat && /car seat/i.test(item) && !/adapters/i.test(item)) {
          displayItem = kState.carSeatName;
        }
        if (bundle.hasCarSeat && /isofix base/i.test(item)) {
          displayItem = kState.carSeatName.indexOf('Maxi') === 0 ? 'Maxi-Cosi FamilyFix 360' : 'Cybex Base T isofix base';
        }
        li.textContent = displayItem;
        listEl.appendChild(li);
      });
    }
  }

  document.addEventListener('click', function (e) {
    var opt = e.target.closest('.k-bundle-option');
    if (!opt) return;

    // Don't trigger bundle change if click is on a sub-selector
    if (e.target.closest('.k-sub-selector')) {
      // sub-selector clicks (car seat / car seat colour)
      var pill = e.target.closest('.k-sub-pill');
      if (pill) {
        var group = pill.closest('.k-sub-pills');
        group.querySelectorAll('.k-sub-pill').forEach(function (p) { p.classList.remove('is-active'); });
        pill.classList.add('is-active');
        kState.carSeatName = pill.dataset.csName;
        kState.carSeatDelta = parseInt(pill.dataset.csDelta, 10) || 0;
        document.querySelectorAll('[id^="k-cs-name-"]').forEach(function (el) { el.textContent = kState.carSeatName; });
        kRender();
        return;
      }
      var sw = e.target.closest('.k-sub-swatches button');
      if (sw) {
        var group2 = sw.closest('.k-sub-swatches');
        group2.querySelectorAll('button').forEach(function (b) { b.classList.remove('is-active'); });
        sw.classList.add('is-active');
        kState.carSeatColour = sw.dataset.csColour;
        document.querySelectorAll('[id^="k-cs-colour-"]').forEach(function (el) { el.textContent = kState.carSeatColour; });
        return;
      }
      return;
    }

    // Bundle option selected
    document.querySelectorAll('.k-bundle-option').forEach(function (o) { o.classList.remove('is-active'); });
    opt.classList.add('is-active');
    kState.bundleKey = opt.dataset.bundle;
    kRender();
  });

  // Track pram colour swatch changes
  document.addEventListener('click', function (e) {
    var sw = e.target.closest('.k-buybox .swatch[data-colour]');
    if (!sw) return;
    kState.pramColour = sw.dataset.colour;
    kRender();
  });

  /* ---- v3 (Variant K) — show-more on compatibility list ---- */

  document.addEventListener('click', function (e) {
    if (!e.target.closest('#k-compat-more')) return;
    var extra = document.getElementById('k-compat-extra');
    var btn = document.getElementById('k-compat-more');
    if (!extra) return;
    extra.classList.toggle('is-open');
    btn.textContent = extra.classList.contains('is-open')
      ? 'Show fewer ▴'
      : 'Show more compatible seats ▾';
  });

  /* ---- v3 (Variant K) — compare drawer ---- */

  function openCompare() {
    document.getElementById('k-compare-drawer').classList.add('is-open');
    document.getElementById('k-compare-overlay').classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }
  function closeCompare() {
    var d = document.getElementById('k-compare-drawer');
    var o = document.getElementById('k-compare-overlay');
    if (d) d.classList.remove('is-open');
    if (o) o.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  document.addEventListener('click', function (e) {
    if (e.target.closest('#k-compare-open')) openCompare();
    if (e.target.closest('#k-compare-close') || e.target.closest('[data-close-compare]')) closeCompare();
  });

  /* ---- v3 (Variant K) — test framework toggle ---- */

  document.addEventListener('click', function (e) {
    if (!e.target.closest('#k-test-toggle')) return;
    var on = document.body.classList.toggle('show-tests');
    var btn = document.getElementById('k-test-toggle');
    if (btn) btn.textContent = on ? 'Hide test framework' : 'Show test framework';
  });

  /* ---- v3 (Variant K) — test mark click → scroll to tests section ---- */

  document.addEventListener('click', function (e) {
    var mark = e.target.closest('.k-test-mark');
    if (!mark) return;
    e.preventDefault();
    e.stopPropagation();
    var tests = document.getElementById('tests');
    if (tests) tests.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  /* ---- v3 (Variant K) — keyboard support for div-based bundle options ---- */

  document.addEventListener('keydown', function (e) {
    var opt = e.target.closest('.k-bundle-option');
    if (!opt) return;
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    opt.click();
  });

  /* ---- Carousel scroll buttons (Variant J) ---- */

  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-carousel]');
    if (!btn) return;
    var carousel = document.getElementById(btn.dataset.carousel);
    if (!carousel) return;
    var firstCard = carousel.querySelector('.j-carousel-card');
    var step = firstCard ? firstCard.offsetWidth + 18 : 280;
    var dir = parseInt(btn.dataset.dir, 10) || 1;
    carousel.scrollBy({ left: step * dir, behavior: 'smooth' });
  });

  document.addEventListener('click', function (e) {
    var opt = e.target.closest('.wizard-option');
    if (opt) {
      var current = opt.closest('.wizard-step');
      var stepNum = parseInt(current.dataset.wizardStep, 10);
      if (stepNum < 3) {
        showWizardStep(stepNum + 1);
      } else {
        showWizardStep('result');
      }
      return;
    }
    var back = e.target.closest('[data-wizard-back]');
    if (back) {
      var current2 = back.closest('.wizard-step');
      var stepNum2 = current2.dataset.wizardStep;
      if (stepNum2 === 'result') {
        showWizardStep(1);
      } else {
        var n = parseInt(stepNum2, 10);
        showWizardStep(Math.max(1, n - 1));
      }
    }
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
