(function () {
  /* ---- Variant routing (gallery × picker × bundle) ----
     URL params drive three independent variants of this PDP without
     duplicating the file. We default to the original behaviour so existing
     links keep working.
       ?gallery=mosaic|classic
       ?picker=inline|links
       ?bundle=<data-bundle key>      (only meaningful in picker=links mode —
                                       simulates a reload landing on that
                                       bundle's expanded panel)
  */
  var kParams = new URLSearchParams(window.location.search);
  var kGallery = kParams.get('gallery') === 'classic' ? 'classic' : 'mosaic';
  var kPicker = kParams.get('picker') === 'links' ? 'links' : 'inline';
  var kBundle = kParams.get('bundle') || '';

  // Script is at end of body, so body exists by now — apply classes
  // immediately to avoid a flash of the wrong gallery treatment.
  document.documentElement.classList.add('g-' + kGallery, 'p-' + kPicker);
  document.body.classList.add('g-' + kGallery, 'p-' + kPicker);

  // The rest needs the full DOM (bundle tiles etc.) ready — defer.
  function kInitVariants() {
    renderVariantChip();
    initClassicGallery();
    if (kPicker === 'links' && kBundle) {
      var target = document.querySelector('.k-bundle-tile[data-bundle="' + kBundle + '"]');
      if (target) activateBundleTile(target);
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', kInitVariants);
  } else {
    kInitVariants();
  }

  function renderVariantChip() {
    var chip = document.createElement('div');
    chip.className = 'k-variant-chip';
    chip.innerHTML =
      '<div class="k-variant-chip-label">Prototype variants</div>' +
      '<div class="k-variant-chip-row">' +
      '  <span class="k-variant-chip-leader">Gallery</span>' +
      '  <button class="k-variant-chip-btn ' + (kGallery==='mosaic'?'is-active':'') + '" data-set="gallery=mosaic">Mosaic</button>' +
      '  <button class="k-variant-chip-btn ' + (kGallery==='classic'?'is-active':'') + '" data-set="gallery=classic">Classic</button>' +
      '</div>' +
      '<div class="k-variant-chip-row">' +
      '  <span class="k-variant-chip-leader">Picker</span>' +
      '  <button class="k-variant-chip-btn ' + (kPicker==='inline'?'is-active':'') + '" data-set="picker=inline">Inline expand</button>' +
      '  <button class="k-variant-chip-btn ' + (kPicker==='links'?'is-active':'') + '" data-set="picker=links">Links + reload</button>' +
      '</div>';
    document.body.appendChild(chip);
    chip.addEventListener('click', function (e) {
      var btn = e.target.closest('.k-variant-chip-btn');
      if (!btn) return;
      var parts = btn.dataset.set.split('=');
      var url = new URL(window.location.href);
      url.searchParams.set(parts[0], parts[1]);
      // When flipping the picker mode away from links, drop the bundle param
      if (parts[0] === 'picker' && parts[1] !== 'links') url.searchParams.delete('bundle');
      window.location.href = url.toString();
    });
  }

  /* Bundle activation — extracted so both the click handler and the
     on-load (links + ?bundle=) path can call it. */
  function activateBundleTile(tile) {
    document.querySelectorAll('.k-bundle-tile').forEach(function (t) { t.classList.remove('is-active'); });
    tile.classList.add('is-active');
    var name = tile.dataset.name || '';
    var price = parseFloat(tile.dataset.price);
    var saving = parseFloat(tile.dataset.saving);
    var image = tile.dataset.image || '';
    var priceEl = document.getElementById('k-price');
    if (priceEl && !isNaN(price)) priceEl.textContent = '£' + price.toLocaleString();
    var saveEl = document.getElementById('k-price-saving');
    if (saveEl) {
      if (!isNaN(saving) && saving > 0) {
        var saveStr = saving % 1 === 0 ? saving.toFixed(0) : saving.toFixed(2);
        saveEl.textContent = 'Save £' + saveStr + ' compared to buying separately';
      } else {
        saveEl.textContent = '';
      }
    }
    var nameEl = document.getElementById('k-bundle-name');
    if (nameEl) nameEl.textContent = name;
    var mainImg = document.getElementById('k-main-img');
    if (mainImg && image) mainImg.src = image;
    var classicMain = document.getElementById('k-classic-main-img');
    if (classicMain && image) classicMain.src = image;
  }

  /* Classic gallery — populated at runtime from the mosaic markup so the
     image list stays single-source. */
  function initClassicGallery() {
    if (!document.body.classList.contains('g-classic')) return;
    var container = document.querySelector('.k-gallery-classic');
    if (!container) return;
    var mainImg = container.querySelector('#k-classic-main-img');
    var strip = container.querySelector('.k-classic-thumbs');
    if (!mainImg || !strip) return;

    var sources = [];
    document.querySelectorAll('.k-gallery-mosaic .k-mosaic-tile img').forEach(function (img) {
      sources.push(img.src);
    });
    if (!sources.length) return;
    mainImg.src = sources[0];

    sources.forEach(function (src, i) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'k-classic-thumb' + (i === 0 ? ' is-active' : '');
      btn.innerHTML = '<img src="' + src + '" alt="" />';
      btn.addEventListener('click', function () {
        strip.querySelectorAll('.k-classic-thumb').forEach(function (t) { t.classList.remove('is-active'); });
        btn.classList.add('is-active');
        mainImg.src = src;
      });
      strip.appendChild(btn);
    });

    var prev = container.querySelector('.k-classic-arrow-prev');
    var next = container.querySelector('.k-classic-arrow-next');
    function step(dir) {
      var thumbs = strip.querySelectorAll('.k-classic-thumb');
      var idx = 0;
      thumbs.forEach(function (t, i) { if (t.classList.contains('is-active')) idx = i; });
      var nextIdx = (idx + dir + thumbs.length) % thumbs.length;
      thumbs[nextIdx].click();
    }
    if (prev) prev.addEventListener('click', function () { step(-1); });
    if (next) next.addEventListener('click', function () { step(1); });
  }

  // Expose for the click handler further down the file
  window.__kActivateBundleTile = activateBundleTile;

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

  /* ---- v3 (Variant K) bundle selector — production-style 7-tile grid (V1) ---- */

  // Capture-phase handler so we can intercept in p-links mode before the
  // default inline-expand behaviour runs.
  document.addEventListener('click', function (e) {
    var tile = e.target.closest('.k-bundle-tile');
    if (!tile) return;

    if (document.body.classList.contains('p-links')) {
      e.preventDefault();
      e.stopImmediatePropagation();
      // Simulate a full PDP reload landing on the chosen bundle
      var url = new URL(window.location.href);
      url.searchParams.set('picker', 'links');
      url.searchParams.set('bundle', tile.dataset.bundle || '');
      window.location.href = url.toString();
      return;
    }

    // Inline mode — activate in place
    if (window.__kActivateBundleTile) window.__kActivateBundleTile(tile);
  }, true);

  // Track pram colour swatch changes
  document.addEventListener('click', function (e) {
    var sw = e.target.closest('.k-buybox .swatch[data-colour]');
    if (!sw) return;
    kState.pramColour = sw.dataset.colour;
    kRender();
  });

  /* ---- v3 (Variant K) — What's-in-the-box card opens detail drawer ---- */

  function openWib(card) {
    var nameEl     = document.getElementById('k-wib-drawer-name');
    var descEl     = document.getElementById('k-wib-drawer-desc');
    var imgEl      = document.getElementById('k-wib-drawer-img');
    var featuresEl = document.getElementById('k-wib-drawer-features');
    var drawer     = document.getElementById('k-wib-drawer');
    var overlay    = document.getElementById('k-wib-overlay');

    if (nameEl)    nameEl.textContent = card.dataset.name || '';
    if (descEl)    descEl.textContent = card.dataset.desc || '';
    if (imgEl)     { imgEl.src = card.dataset.image || ''; imgEl.alt = card.dataset.name || ''; }
    if (featuresEl) {
      featuresEl.innerHTML = '';
      (card.dataset.features || '').split('|').forEach(function (f) {
        if (!f) return;
        var li = document.createElement('li');
        li.innerHTML = f;
        featuresEl.appendChild(li);
      });
    }
    if (drawer)  drawer.classList.add('is-open');
    if (overlay) overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function closeWib() {
    var drawer  = document.getElementById('k-wib-drawer');
    var overlay = document.getElementById('k-wib-overlay');
    if (drawer)  drawer.classList.remove('is-open');
    if (overlay) overlay.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  document.addEventListener('click', function (e) {
    var card = e.target.closest('.k-wib-card');
    if (card) { openWib(card); return; }
    if (e.target.closest('[data-close-wib]')) closeWib();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeWib();
  });

  /* ---- v3 (Variant K) — Features carousel tabs + scroll arrows ---- */

  document.addEventListener('click', function (e) {
    var tab = e.target.closest('.k-features-tab[data-features-tab]');
    if (!tab) return;
    var key = tab.dataset.featuresTab;
    var section = tab.closest('.k-features-section');
    section.querySelectorAll('.k-features-tab').forEach(function (t) { t.classList.remove('is-active'); });
    tab.classList.add('is-active');
    section.querySelectorAll('.k-features-panel').forEach(function (p) {
      p.hidden = p.dataset.featuresPanel !== key;
    });
  });

  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.k-features-scroll');
    if (!btn) return;
    var section = btn.closest('.k-features-section');
    var visible = section.querySelector('.k-features-panel:not([hidden]) .k-features-carousel');
    if (!visible) return;
    var dir = parseInt(btn.dataset.featuresDir, 10) || 1;
    visible.scrollBy({ left: dir * 300, behavior: 'smooth' });
  });

  /* ---- v3 (Variant K) — Style your way: swatch swaps name + tints the detail grid ---- */

  document.addEventListener('click', function (e) {
    var sw = e.target.closest('.k-syw-swatch[data-syw-name]');
    if (!sw) return;
    var group = sw.closest('.k-syw-swatch-row');
    group.querySelectorAll('.k-syw-swatch').forEach(function (s) { s.classList.remove('is-active'); });
    sw.classList.add('is-active');

    var name = sw.dataset.sywName;
    var tint = sw.dataset.sywTint;
    var nameEl    = document.getElementById('k-syw-name');
    var ctaNameEl = document.getElementById('k-syw-cta-name');
    if (nameEl)    nameEl.textContent    = name;
    if (ctaNameEl) ctaNameEl.textContent = name;

    document.querySelectorAll('.k-syw-tile img').forEach(function (img) {
      var alt = img.getAttribute('alt') || '';
      var label = encodeURIComponent(alt);
      img.src = 'https://placehold.co/420x420/' + tint + '/d8c8b8?text=' + label;
    });
  });

  /* ---- v3 (Variant K) — Style your way: arrow keys cycle swatches ---- */

  document.addEventListener('click', function (e) {
    var arrow = e.target.closest('.k-syw-arrow');
    if (!arrow) return;
    var row = arrow.parentElement.querySelector('.k-syw-swatch-row');
    if (!row) return;
    var swatches = Array.from(row.querySelectorAll('.k-syw-swatch'));
    var activeIdx = swatches.findIndex(function (s) { return s.classList.contains('is-active'); });
    var dir = arrow.previousElementSibling ? 1 : -1; // first arrow = prev, second = next
    var nextIdx = (activeIdx + dir + swatches.length) % swatches.length;
    swatches[nextIdx].click();
  });

  /* ---- v3 (Variant K) — gallery thumbnails swap main image ---- */

  document.addEventListener('click', function (e) {
    var thumb = e.target.closest('.k-gallery-thumbs img');
    if (!thumb) return;
    var thumbs = thumb.closest('.k-gallery-thumbs');
    thumbs.querySelectorAll('img').forEach(function (t) { t.classList.remove('is-active'); });
    thumb.classList.add('is-active');
    var main = document.getElementById('k-main-img');
    if (main && thumb.dataset.full) main.src = thumb.dataset.full;
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

  /* ---- v3 (Variant K) — compare drawers (bundle matrix + cross-product) ---- */

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

  function openProductCompare() {
    document.getElementById('k-product-compare-drawer').classList.add('is-open');
    document.getElementById('k-product-compare-overlay').classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }
  function closeProductCompare() {
    var d = document.getElementById('k-product-compare-drawer');
    var o = document.getElementById('k-product-compare-overlay');
    if (d) d.classList.remove('is-open');
    if (o) o.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  document.addEventListener('click', function (e) {
    if (e.target.closest('#k-compare-open')) openCompare();
    if (e.target.closest('#k-compare-close') || e.target.closest('[data-close-compare]')) closeCompare();
    if (e.target.closest('#k-product-compare-open')) openProductCompare();
    if (e.target.closest('#k-product-compare-close') || e.target.closest('[data-close-product-compare]')) closeProductCompare();
  });

  /* ---- v3 (Variant K) — hot-reload inspector toggle ---- */

  document.addEventListener('click', function (e) {
    var btn = e.target.closest('#k-hot-toggle');
    if (!btn) return;
    var on = document.body.classList.toggle('show-hot-reload');
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    var label = btn.querySelector('.k-hot-toggle-label');
    if (label) label.textContent = on ? 'Hide bundle-reload areas' : 'Show bundle-reload areas';
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
