/* Luxury fleet — filters, multi-select, enquiry (no prices) */
(function () {
  'use strict';

  var selected = {};
  var state = { brand: 'all', type: 'All', q: '' };

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function setClass(el, cls, on) {
    if (!el || !el.classList) return;
    if (on) el.classList.add(cls);
    else el.classList.remove(cls);
  }

  function list() { return window.ELITE_FLEET || []; }

  function getSelected() {
    return list().filter(function (v) { return selected[v.id]; });
  }

  function labelOf(v) {
    return v.brand + ' ' + v.model + ' (' + v.year + ')';
  }

  function syncForm() {
    try {
      var picks = getSelected();
      var ta = document.getElementById('sf-vehicles');
      if (ta) ta.value = picks.map(labelOf).join('\n');
      var preview = document.getElementById('fleet-form-selected');
      if (preview) {
        if (!picks.length) {
          preview.hidden = true;
          preview.innerHTML = '';
        } else {
          preview.hidden = false;
          preview.innerHTML = '<h4>Selected for this enquiry</h4><ul>' +
            picks.map(function (v) { return '<li>' + esc(v.brand + ' ' + v.model) + '</li>'; }).join('') +
            '</ul>';
        }
      }
    } catch (e) { /* ignore */ }
  }

  function updateBar() {
    var picks = getSelected();
    var n = picks.length;
    var names = picks.map(function (v) { return v.brand + ' ' + v.model; }).join(' · ');

    var bar = document.getElementById('fleet-selection-bar');
    if (bar) setClass(bar, 'is-visible', n > 0);
    if (document.body) setClass(document.body, 'has-fleet-selection', n > 0);
    var info = bar && bar.querySelector ? bar.querySelector('.fleet-selection-info') : null;
    if (info) {
      info.innerHTML = '<strong>' + n + ' vehicle' + (n === 1 ? '' : 's') + ' selected</strong>' +
        '<span>' + esc(names || 'Tap Add to enquiry on cards above') + '</span>';
    }

    var panel = document.getElementById('fleet-selection-panel');
    var listEl = document.getElementById('fleet-selection-list');
    if (panel) {
      if (n > 0) { panel.hidden = false; panel.removeAttribute('hidden'); }
      else { panel.hidden = true; panel.setAttribute('hidden', ''); }
    }
    if (listEl) {
      listEl.innerHTML = picks.map(function (v) {
        return '<li><span>' + esc(v.brand + ' ' + v.model) + '</span> <button type="button" class="cat-sel-remove" data-action="toggle" data-id="' + esc(v.id) + '">Remove</button></li>';
      }).join('');
    }
    syncForm();
  }

  function toggle(id) {
    if (!id) return false;
    selected[id] = !selected[id];
    if (!selected[id]) delete selected[id];
    else if (window.EliteCart) {
      var v = list().find(function (x) { return x.id === id; });
      if (v) {
        window.EliteCart.add({
          kind: 'vehicle',
          id: v.id,
          name: v.brand + ' ' + v.model,
          meta: v.year + ' · ' + v.type + ' · ' + (v.seats ? v.seats + ' seats' : ''),
          summary: v.summary || (v.brand + ' ' + v.model + ' — luxury vehicle hire'),
          qty: 1,
          image: v.image,
          href: 'luxury-car-hire.html?vehicle=' + encodeURIComponent(v.id)
        });
      }
    }
    renderGrid();
    updateBar();
    return !!selected[id];
  }

  function enquire(id) {
    if (id && !selected[id]) {
      selected[id] = true;
      renderGrid();
      updateBar();
    }
    syncForm();
    var form = document.getElementById('fleet-enquiry') || document.querySelector('[data-service-form="luxury-car"]');
    if (form && form.scrollIntoView) form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(syncForm, 200);
    setTimeout(syncForm, 600);
  }

  function clearAll() {
    selected = {};
    renderGrid();
    updateBar();
  }

  function filtered() {
    var q = (state.q || '').trim().toLowerCase();
    return list().filter(function (v) {
      if (state.brand !== 'all' && v.brand !== state.brand) return false;
      if (state.type !== 'All' && v.type !== state.type) return false;
      if (!q) return true;
      var hay = [v.brand, v.model, v.year, v.type, v.engine, v.power, v.topSpeed, v.acceleration,
        v.drivetrain, v.transmission, (v.colours || []).join(' '), (v.tags || []).join(' '), v.summary
      ].join(' ').toLowerCase();
      return hay.indexOf(q) !== -1;
    });
  }

  function cardHtml(v) {
    var on = !!selected[v.id];
    var fallback = 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80';
    var idAttr = esc(v.id);
    var seatsLabel = v.type === 'Motorcycle'
      ? (v.seats + ' rider' + (v.seats > 1 ? 's' : ''))
      : (v.seats + ' seats');
    return (
      '<article class="fleet-card' + (on ? ' is-selected' : '') + '" data-id="' + idAttr + '">' +
        '<div class="fleet-card-media">' +
          '<img src="' + esc(v.image || fallback) + '" alt="' + esc(v.brand + ' ' + v.model) + '" loading="lazy" decoding="async" onerror="this.onerror=null;this.src=\'' + fallback + '\'" />' +
          '<span class="fleet-card-badge">' + esc(v.type) + '</span>' +
        '</div>' +
        '<div class="fleet-card-body">' +
          '<div class="fleet-card-brand">' + esc(v.brand) + '</div>' +
          '<h3 class="fleet-card-title">' + esc(v.model) + '</h3>' +
          '<p class="fleet-card-year">Year · ' + esc(v.year) + '</p>' +
          '<p class="fleet-card-summary">' + esc(v.summary) + '</p>' +
          '<dl class="fleet-specs">' +
            '<div class="fleet-spec"><dt>Seats</dt><dd>' + esc(seatsLabel) + '</dd></div>' +
            '<div class="fleet-spec"><dt>Top speed</dt><dd>' + esc(v.topSpeed) + '</dd></div>' +
            '<div class="fleet-spec"><dt>0–100</dt><dd>' + esc(v.acceleration) + '</dd></div>' +
            '<div class="fleet-spec"><dt>Power</dt><dd>' + esc(v.power) + '</dd></div>' +
          '</dl>' +
          '<div class="fleet-card-actions">' +
            '<button type="button" class="btn-cart-add' + (on ? ' is-on' : '') + '" data-action="toggle" data-id="' + idAttr + '" aria-label="' + (on ? 'In multi-enquiry' : 'Add to multi-enquiry') + '">' +
              '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 6h15l-1.5 9h-12z"/><path d="M6 6L5 3H2"/><circle cx="9" cy="20" r="1"/><circle cx="18" cy="20" r="1"/></svg>' +
              '<span>' + (on ? 'In multi-enquiry' : 'Add to multi-enquiry') + '</span>' +
            '</button>' +
            '<button type="button" class="btn btn-gold" data-action="enquire" data-id="' + idAttr + '">Enquire now</button>' +
          '</div>' +
        '</div>' +
      '</article>'
    );
  }

  function renderGrid() {
    var grid = document.getElementById('fleet-grid');
    var countEl = document.getElementById('fleet-count');
    if (!grid) return;
    var items = filtered();
    if (countEl) countEl.innerHTML = 'Showing <strong>' + items.length + '</strong> of ' + list().length;
    if (!items.length) {
      grid.innerHTML = '<div class="fleet-empty"><strong>No vehicles match</strong>Try another filter or search.</div>';
      return;
    }
    grid.innerHTML = items.map(cardHtml).join('');
  }

  function brandLogoHtml(b) {
    if (!b.logo) return '<span class="fleet-brand-fallback">ALL</span>';
    return '<img class="fleet-brand-logo" src="' + esc(b.logo) + '" alt="" width="28" height="28" loading="lazy" onerror="this.style.display=\'none\';var n=this.nextElementSibling;if(n)n.style.display=\'flex\'" />' +
      '<span class="fleet-brand-fallback" style="display:none">' + esc((b.name || '?').charAt(0)) + '</span>';
  }

  function renderBrands() {
    var wrap = document.getElementById('fleet-brands');
    if (!wrap) return;
    var brands = window.ELITE_FLEET_BRANDS || [{ id: 'all', name: 'All', logo: null }];
    wrap.innerHTML = brands.map(function (b) {
      var active = state.brand === b.id ? ' is-active' : '';
      return '<button type="button" class="fleet-brand-btn' + active + '" data-action="brand" data-id="' + esc(b.id) + '" title="' + esc(b.name) + '">' +
        brandLogoHtml(b) +
        '<span class="fleet-brand-name">' + esc(b.name) + '</span></button>';
    }).join('');
  }

  function renderTypes() {
    var wrap = document.getElementById('fleet-types');
    if (!wrap) return;
    var types = ['All'];
    list().forEach(function (v) {
      if (v.type && types.indexOf(v.type) === -1) types.push(v.type);
    });
    var order = ['All', 'Supercar', 'Coupe', 'Sedan', 'SUV', 'Motorcycle'];
    types.sort(function (a, b) {
      var ia = order.indexOf(a); var ib = order.indexOf(b);
      if (ia < 0) ia = 99; if (ib < 0) ib = 99;
      return ia - ib || a.localeCompare(b);
    });
    wrap.innerHTML = types.map(function (t) {
      var active = state.type === t ? ' is-active' : '';
      return '<button type="button" class="fleet-type-chip' + active + '" data-action="type" data-id="' + esc(t) + '">' + esc(t) + '</button>';
    }).join('');
  }

  function onClick(e) {
    var el = e.target;
    if (el && el.nodeType === 3) el = el.parentElement;
    while (el && el !== document && !(el.getAttribute && el.getAttribute('data-action'))) {
      el = el.parentElement;
    }
    if (!el || !el.getAttribute) return;
    var action = el.getAttribute('data-action');
    var id = el.getAttribute('data-id');
    if (action === 'toggle') { e.preventDefault(); e.stopPropagation(); toggle(id); }
    else if (action === 'enquire') { e.preventDefault(); e.stopPropagation(); enquire(id); }
    else if (action === 'brand') { e.preventDefault(); state.brand = id; renderBrands(); renderGrid(); }
    else if (action === 'type') { e.preventDefault(); state.type = id; renderTypes(); renderGrid(); }
    else if (action === 'clear') { e.preventDefault(); clearAll(); }
    else if (action === 'bar-enquire') { e.preventDefault(); enquire(null); }
  }

  function init() {
    try {
      if (!list().length) {
        var g = document.getElementById('fleet-grid');
        if (g) g.innerHTML = '<div class="fleet-empty"><strong>Fleet unavailable</strong>Please refresh.</div>';
        return;
      }
      var hc = document.getElementById('fleet-hero-count');
      if (hc) hc.textContent = String(list().length);
      renderBrands();
      renderTypes();
      renderGrid();
      updateBar();

      document.addEventListener('click', function (e) {
        var t = e.target;
        if (t && t.nodeType === 3) t = t.parentElement;
        var walk = t;
        var inCat = false;
        while (walk && walk !== document) {
          if (walk.id === 'elite-fleet' || walk.id === 'fleet-selection-bar' || walk.id === 'fleet-selection-panel' || walk.id === 'fleet-enquiry') {
            inCat = true; break;
          }
          walk = walk.parentElement;
        }
        if (inCat) onClick(e);
      });

      var search = document.getElementById('fleet-search');
      if (search) {
        search.addEventListener('input', function () {
          state.q = search.value || '';
          renderGrid();
        });
      }

      var formMount = document.querySelector('[data-service-form="luxury-car"]');
      if (formMount && window.MutationObserver) {
        new MutationObserver(function () { syncForm(); }).observe(formMount, { childList: true, subtree: true });
      }
    } catch (err) {
      if (typeof console !== 'undefined') console.warn('EliteFleet init', err);
    }
  }

  window.EliteFleet = {
    toggle: toggle,
    enquire: enquire,
    clear: clearAll,
    getSelected: getSelected,
    getSelectedLabels: function () { return getSelected().map(labelOf); },
    syncForm: syncForm
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
