/* Stage / sound / lighting hire catalogue — multi-type select + quantity per type */
(function () {
  'use strict';

  /* selected[id] = quantity (number > 0) */
  var selected = {};
  var state = { type: 'all', q: '' };

    var ICONS = {
    grid: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>',
    sound: '<path d="M11 5L6 9H3v6h3l5 4V5z"/><path d="M15.5 8.5a5 5 0 010 7"/><path d="M18 6a8 8 0 010 12"/>',
    light: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5"/>',
    stage: '<path d="M3 20h18M5 20V10l7-5 7 5v10"/><path d="M9 20v-6h6v6"/>',
    video: '<rect x="2" y="6" width="14" height="12" rx="2"/><path d="M16 10l6-3v10l-6-3V10z"/>',
    power: '<path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"/>',
    box: '<path d="M3 7l9-4 9 4-9 4-9-4z"/><path d="M3 7v10l9 4 9-4V7"/>'
  };

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function iconSvg(key) {
    return '<svg class="filter-icon-svg" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">' +
      (ICONS[key] || ICONS.grid) + '</svg>';
  }

  function setClass(el, cls, on) {
    if (!el || !el.classList) return;
    if (on) el.classList.add(cls);
    else el.classList.remove(cls);
  }

  function list() { return window.ELITE_PRODUCTION || []; }

  function getSelected() {
    return list().filter(function (s) { return selected[s.id] > 0; }).map(function (s) {
      return { item: s, qty: selected[s.id] };
    });
  }

  function labelOf(entry) {
    return entry.item.name + ' x' + entry.qty + ' (' + entry.item.category + ')';
  }

  function totalStaff() {
    var n = 0;
    Object.keys(selected).forEach(function (k) { n += selected[k] || 0; });
    return n;
  }

  function syncForm() {
    try {
      var picks = getSelected();
      var ta = document.getElementById('sf-production');
      if (ta) ta.value = picks.map(labelOf).join('\n');
      var qtyField = document.getElementById('sf-quantity');
      if (qtyField && picks.length) {
        qtyField.value = 'Total units: ' + totalStaff() + ' across ' + picks.length + ' type(s)';
      }
      var preview = document.getElementById('production-form-selected');
      if (preview) {
        if (!picks.length) {
          preview.hidden = true;
          preview.innerHTML = '';
        } else {
          preview.hidden = false;
          preview.innerHTML = '<h4>Selected equipment items</h4><ul>' +
            picks.map(function (p) {
              return '<li>' + esc(p.item.name) + ' &times; ' + p.qty + '</li>';
            }).join('') + '</ul>';
        }
      }
    } catch (e) { /* ignore */ }
  }

  function updateBar() {
    var picks = getSelected();
    var n = picks.length;
    var units = totalStaff();

    var bar = document.getElementById('production-selection-bar');
    if (bar) setClass(bar, 'is-visible', n > 0);
    if (document.body) setClass(document.body, 'has-production-selection', n > 0);
    var info = bar && bar.querySelector ? bar.querySelector('.production-selection-info') : null;
    if (info) {
      info.innerHTML = '<strong>' + n + ' type' + (n === 1 ? '' : 's') + ' · ' + units + ' units</strong>' +
        '<span>' + esc(picks.map(function (p) { return p.item.name + ' x' + p.qty; }).join(' · ') || 'Add equipment items above') + '</span>';
    }

    var panel = document.getElementById('production-selection-panel');
    var listEl = document.getElementById('production-selection-list');
    if (panel) {
      if (n > 0) { panel.hidden = false; panel.removeAttribute('hidden'); }
      else { panel.hidden = true; panel.setAttribute('hidden', ''); }
    }
    if (listEl) {
      listEl.innerHTML = picks.map(function (p) {
        return '<li><span>' + esc(p.item.name) + ' &times; ' + p.qty + '</span> ' +
          '<button type="button" class="cat-sel-remove" data-action="remove" data-id="' + esc(p.item.id) + '">Remove</button></li>';
      }).join('');
    }
    syncForm();
  }

  function setQty(id, qty) {
    qty = parseInt(qty, 10);
    if (!id) return;
    if (!qty || qty < 1) {
      delete selected[id];
    } else {
      selected[id] = qty;
      if (window.EliteCart) {
        var s = list().find(function (x) { return x.id === id; });
        if (s) {
          window.EliteCart.add({
            kind: 'production',
            id: s.id,
            name: s.name,
            meta: s.category + (s.coverage ? ' · ' + s.coverage : ''),
            summary: s.summary || (s.name + ' — stage / sound / lighting hire'),
            qty: qty,
            setQty: true,
            image: s.image,
            href: 'stage-sound-lighting.html'
          });
        }
      }
    }
    renderGrid();
    updateBar();
  }

  function addOne(id) {
    var item = list().find(function (s) { return s.id === id; });
    var min = 1;
    var cur = selected[id] || 0;
    setQty(id, cur ? cur + 1 : min);
  }

  function enquire(id) {
    if (id && !selected[id]) addOne(id);
    syncForm();
    var form = document.getElementById('production-enquiry') || document.querySelector('[data-service-form="security"]');
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
    return list().filter(function (s) {
      if (state.type !== 'all' && s.category !== state.type) return false;
      if (!q) return true;
      var hay = [s.name, s.category, s.summary, s.typical, (s.tags || []).join(' '), (s.includes || s.features || []).join(' ')].join(' ').toLowerCase();
      return hay.indexOf(q) !== -1;
    });
  }

  function cardHtml(s) {
    var qty = selected[s.id] || 0;
    var on = qty > 0;
    var fallback = 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=900&q=80';
    var idAttr = esc(s.id);
    return (
      '<article class="production-card' + (on ? ' is-selected' : '') + '" data-id="' + idAttr + '">' +
        '<div class="production-card-media">' +
          '<img src="' + esc(s.image || fallback) + '" alt="' + esc(s.name) + '" loading="lazy" decoding="async" width="600" height="400" onerror="this.onerror=null;this.src=\'' + fallback + '\'" />' +
          '<span class="production-card-badge">' + esc(s.category) + '</span>' +
        '</div>' +
        '<div class="production-card-body">' +
          '<h3 class="production-card-title">' + esc(s.name) + '</h3>' +
          '<p class="production-card-summary">' + esc(s.summary) + '</p>' +
          '<dl class="production-specs">' +
            '<div class="production-spec"><dt>Coverage</dt><dd>' + esc(s.coverage || '—') + '</dd></div>' +
            '<div class="production-spec"><dt>Spec</dt><dd>' + esc(s.power || '—') + '</dd></div>' +
          '</dl>' +
          '<ul class="production-features">' +
            (s.includes || s.features || []).slice(0, 3).map(function (f) {
              return '<li>' + esc(f) + '</li>';
            }).join('') +
          '</ul>' +
          '<div class="production-qty-row">' +
            '<label class="production-qty-label">How many?</label>' +
            '<div class="production-qty-controls">' +
              '<button type="button" class="production-qty-btn" data-action="dec" data-id="' + idAttr + '" aria-label="Decrease">-</button>' +
              '<input type="number" class="production-qty-input" min="0" max="200" value="' + qty + '" data-action="qty" data-id="' + idAttr + '" aria-label="Quantity for ' + esc(s.name) + '" />' +
              '<button type="button" class="production-qty-btn" data-action="inc" data-id="' + idAttr + '" aria-label="Increase">+</button>' +
            '</div>' +
          '</div>' +
          '<div class="production-card-actions">' +
            '<button type="button" class="btn-cart-add' + (on ? ' is-on' : '') + '" data-action="add" data-id="' + idAttr + '" aria-label="' + (on ? 'In multi-enquiry' : 'Add to multi-enquiry') + '">' +
              '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 6h15l-1.5 9h-12z"/><path d="M6 6L5 3H2"/><circle cx="9" cy="20" r="1"/><circle cx="18" cy="20" r="1"/></svg>' +
              '<span>' + (on ? 'In multi-enquiry (' + qty + ')' : 'Add to multi-enquiry') + '</span>' +
            '</button>' +
            '<button type="button" class="btn btn-gold" data-action="enquire" data-id="' + idAttr + '">Enquire now</button>' +
          '</div>' +
        '</div>' +
      '</article>'
    );
  }

  function renderGrid() {
    var grid = document.getElementById('production-grid');
    var countEl = document.getElementById('production-count');
    if (!grid) return;
    var items = filtered();
    if (countEl) countEl.innerHTML = 'Showing <strong>' + items.length + '</strong> of ' + list().length;
    if (!items.length) {
      grid.innerHTML = '<div class="production-empty"><strong>No types match</strong>Try another filter or search.</div>';
      return;
    }
    grid.innerHTML = items.map(cardHtml).join('');
  }

  function renderTypes() {
    var wrap = document.getElementById('production-types');
    if (!wrap) return;
    var types = window.ELITE_PRODUCTION_CATEGORIES || [{ id: 'all', name: 'All', icon: 'grid' }];
    wrap.innerHTML = types.map(function (t) {
      var active = state.type === t.id ? ' is-active' : '';
      return '<button type="button" class="production-type-btn' + active + '" data-action="type" data-id="' + esc(t.id) + '" title="' + esc(t.name) + '">' +
        '<span class="production-type-icon">' + iconSvg(t.icon || 'grid') + '</span>' +
        '<span class="production-type-name">' + esc(t.name) + '</span></button>';
    }).join('');
  }

  function onClick(e) {
    var el = e.target;
    if (el && el.nodeType === 3) el = el.parentElement;
    /* allow qty input */
    if (el && el.getAttribute && el.getAttribute('data-action') === 'qty') return;

    while (el && el !== document && !(el.getAttribute && el.getAttribute('data-action'))) {
      el = el.parentElement;
    }
    if (!el || !el.getAttribute) return;
    var action = el.getAttribute('data-action');
    var id = el.getAttribute('data-id');

    if (action === 'type') {
      e.preventDefault();
      state.type = id;
      renderTypes();
      renderGrid();
    } else if (action === 'add') {
      e.preventDefault();
      addOne(id);
    } else if (action === 'inc') {
      e.preventDefault();
      addOne(id);
    } else if (action === 'dec') {
      e.preventDefault();
      setQty(id, (selected[id] || 0) - 1);
    } else if (action === 'remove') {
      e.preventDefault();
      setQty(id, 0);
    } else if (action === 'enquire') {
      e.preventDefault();
      enquire(id);
    } else if (action === 'clear') {
      e.preventDefault();
      clearAll();
    } else if (action === 'bar-enquire') {
      e.preventDefault();
      enquire(null);
    }
  }

  function onChange(e) {
    var el = e.target;
    if (!el || !el.getAttribute || el.getAttribute('data-action') !== 'qty') return;
    var id = el.getAttribute('data-id');
    setQty(id, el.value);
  }

  function init() {
    try {
      if (!list().length) {
        var g = document.getElementById('production-grid');
        if (g) g.innerHTML = '<div class="production-empty"><strong>Catalogue unavailable</strong>Please refresh.</div>';
        return;
      }
      var hc = document.getElementById('production-hero-count');
      if (hc) hc.textContent = String(list().length);

      renderTypes();
      renderGrid();
      updateBar();

      document.addEventListener('click', function (e) {
        var t = e.target;
        if (t && t.nodeType === 3) t = t.parentElement;
        var walk = t;
        var inCat = false;
        while (walk && walk !== document) {
          if (walk.id === 'elite-production' || walk.id === 'production-selection-bar' ||
              walk.id === 'production-selection-panel' || walk.id === 'production-enquiry') {
            inCat = true; break;
          }
          walk = walk.parentElement;
        }
        if (inCat) onClick(e);
      });
      document.addEventListener('change', function (e) {
        var t = e.target;
        if (t && t.classList && t.classList.contains('production-qty-input')) onChange(e);
      });

      var search = document.getElementById('production-search');
      if (search) {
        search.addEventListener('input', function () {
          state.q = search.value || '';
          renderGrid();
        });
      }

      var formMount = document.querySelector('[data-service-form="security"]');
      if (formMount && window.MutationObserver) {
        new MutationObserver(function () { syncForm(); }).observe(formMount, { childList: true, subtree: true });
      }
    } catch (err) {
      if (typeof console !== 'undefined') console.warn('EliteProduction init', err);
    }
  }

  window.EliteProduction = {
    getSelected: getSelected,
    getSelectedLabels: function () { return getSelected().map(labelOf); },
    syncForm: syncForm,
    clear: clearAll
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
