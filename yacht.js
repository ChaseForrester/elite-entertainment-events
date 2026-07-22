/* Luxury yachts — filters, multi-select, enquiry (no prices) */
(function () {
  'use strict';

  var selected = {};
  var state = { type: 'all', size: 'all', q: '' };

  var ICONS = {
    all: '<circle cx="12" cy="12" r="9"/><path d="M12 7v10M7 12h10"/>',
    anchor: '<circle cx="12" cy="5" r="2"/><path d="M12 7v14M8 15H5a7 7 0 0014 0h-3M5 12h3M16 12h3"/>',
    yacht: '<path d="M3 17l9-12 9 12H3z"/><path d="M5 17h14v2a2 2 0 01-2 2H7a2 2 0 01-2-2v-2z"/>',
    boat: '<path d="M2 16l3-6h14l3 6H2z"/><path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2"/><path d="M12 4v6"/>',
    glass: '<path d="M8 2h8l-1 9a4 4 0 01-6 0L8 2z"/><path d="M12 11v9M9 20h6"/>',
    spark: '<path d="M12 2l1.5 6.5L20 10l-6.5 1.5L12 18l-1.5-6.5L4 10l6.5-1.5L12 2z"/>',
    waves: '<path d="M2 12c2 2 4 2 6 0s4-2 6 0 4 2 6 0"/><path d="M2 17c2 2 4 2 6 0s4-2 6 0 4 2 6 0"/>',
    classic: '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M9 9h6v6H9z"/>'
  };

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function iconSvg(key) {
    return '<svg class="filter-icon-svg" viewBox="0 0 24 24" aria-hidden="true">' + (ICONS[key] || ICONS.anchor) + '</svg>';
  }

  function setClass(el, cls, on) {
    if (!el || !el.classList) return;
    if (on) el.classList.add(cls);
    else el.classList.remove(cls);
  }

  function list() { return window.ELITE_YACHTS || []; }

  function getSelected() {
    return list().filter(function (y) { return selected[y.id]; });
  }

  function labelOf(y) {
    return y.name + ' · ' + y.capacityLabel + ' · ' + y.type;
  }

  function syncForm() {
    try {
      var picks = getSelected();
      var ta = document.getElementById('sf-yachts');
      if (ta) ta.value = picks.map(labelOf).join('\n');
      var preview = document.getElementById('yacht-form-selected');
      if (preview) {
        if (!picks.length) {
          preview.hidden = true;
          preview.innerHTML = '';
        } else {
          preview.hidden = false;
          preview.innerHTML = '<h4>Selected for this enquiry</h4><ul>' +
            picks.map(function (y) { return '<li>' + esc(y.name) + ' (' + esc(y.capacityLabel) + ')</li>'; }).join('') +
            '</ul>';
        }
      }
    } catch (e) { /* ignore */ }
  }

  function updateBar() {
    var picks = getSelected();
    var n = picks.length;
    var names = picks.map(function (y) { return y.name; }).join(' · ');
    var guests = 0;
    for (var i = 0; i < picks.length; i++) guests += picks[i].capacity || 0;

    var bar = document.getElementById('yacht-selection-bar');
    if (bar) setClass(bar, 'is-visible', n > 0);
    if (document.body) setClass(document.body, 'has-yacht-selection', n > 0);
    var info = bar && bar.querySelector ? bar.querySelector('.yacht-selection-info') : null;
    if (info) {
      info.innerHTML = '<strong>' + n + ' vessel' + (n === 1 ? '' : 's') + ' selected</strong>' +
        '<span>' + esc(names || 'Tap Add to enquiry on cards above') + (guests ? ' · ~' + guests + ' guests' : '') + '</span>';
    }

    var panel = document.getElementById('yacht-selection-panel');
    var listEl = document.getElementById('yacht-selection-list');
    if (panel) {
      if (n > 0) { panel.hidden = false; panel.removeAttribute('hidden'); }
      else { panel.hidden = true; panel.setAttribute('hidden', ''); }
    }
    if (listEl) {
      listEl.innerHTML = picks.map(function (y) {
        return '<li><span>' + esc(y.name) + ' · ' + esc(y.capacityLabel) + '</span> <button type="button" class="cat-sel-remove" data-action="toggle" data-id="' + esc(y.id) + '">Remove</button></li>';
      }).join('');
    }
    syncForm();
  }

  function toggle(id) {
    if (!id) return false;
    selected[id] = !selected[id];
    if (!selected[id]) delete selected[id];
    else if (window.EliteCart) {
      var y = list().find(function (x) { return x.id === id; });
      if (y) {
        window.EliteCart.add({
          kind: 'yacht',
          id: y.id,
          name: y.name,
          meta: y.capacityLabel + ' · ' + y.type + (y.location ? ' · ' + y.location : ''),
          summary: y.summary || (y.name + ' — luxury yacht / boat charter'),
          qty: 1,
          image: y.image,
          href: 'luxury-yacht-hire.html?yacht=' + encodeURIComponent(y.id)
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
    var form = document.getElementById('yacht-enquiry') || document.querySelector('[data-service-form="luxury-yacht"]');
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
    return list().filter(function (y) {
      if (state.type !== 'all' && y.type !== state.type) return false;
      if (state.size !== 'all' && y.sizeBand !== state.size) return false;
      if (!q) return true;
      var hay = [y.name, y.type, y.sizeBand, y.capacityLabel, y.length, y.location, y.crew, y.summary,
        (y.features || []).join(' '), (y.tags || []).join(' ')].join(' ').toLowerCase();
      return hay.indexOf(q) !== -1;
    });
  }

  function cardHtml(y) {
    var on = !!selected[y.id];
    var fallback = 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&w=900&q=80';
    var idAttr = esc(y.id);
    var overnight = y.overnight ? (y.overnight + ' overnight') : 'Day charter';
    return (
      '<article class="yacht-card' + (on ? ' is-selected' : '') + '" data-id="' + idAttr + '">' +
        '<div class="yacht-card-media">' +
          '<img src="' + esc(y.image || fallback) + '" alt="' + esc(y.name) + '" loading="lazy" decoding="async" onerror="this.onerror=null;this.src=\'' + fallback + '\'" />' +
          '<span class="yacht-card-badge">' + esc(y.type) + '</span>' +
          '<span class="yacht-card-cap">' + esc(y.capacityLabel) + '</span>' +
        '</div>' +
        '<div class="yacht-card-body">' +
          '<div class="yacht-card-type">' + esc(y.sizeBand) + '</div>' +
          '<h3 class="yacht-card-title">' + esc(y.name) + '</h3>' +
          '<p class="yacht-card-loc">' + esc(y.location) + '</p>' +
          '<p class="yacht-card-summary">' + esc(y.summary) + '</p>' +
          '<dl class="yacht-specs">' +
            '<div class="yacht-spec"><dt>Capacity</dt><dd>' + esc(y.capacityLabel) + '</dd></div>' +
            '<div class="yacht-spec"><dt>Type</dt><dd>' + esc(y.type) + '</dd></div>' +
            '<div class="yacht-spec"><dt>Crew</dt><dd>' + esc(y.crew) + '</dd></div>' +
            '<div class="yacht-spec"><dt>Stay</dt><dd>' + esc(overnight) + '</dd></div>' +
          '</dl>' +
          '<div class="yacht-card-actions">' +
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
    var grid = document.getElementById('yacht-grid');
    var countEl = document.getElementById('yacht-count');
    if (!grid) return;
    var items = filtered();
    if (countEl) countEl.innerHTML = 'Showing <strong>' + items.length + '</strong> of ' + list().length;
    if (!items.length) {
      grid.innerHTML = '<div class="yacht-empty"><strong>No vessels match</strong>Try another filter or search.</div>';
      return;
    }
    grid.innerHTML = items.map(cardHtml).join('');
  }

  function renderTypes() {
    var wrap = document.getElementById('yacht-types');
    if (!wrap) return;
    var types = window.ELITE_YACHT_TYPES || [{ id: 'all', name: 'All', icon: 'anchor' }];
    wrap.innerHTML = types.map(function (t) {
      var active = state.type === t.id ? ' is-active' : '';
      return '<button type="button" class="yacht-type-btn' + active + '" data-action="type" data-id="' + esc(t.id) + '" title="' + esc(t.name) + '">' +
        '<span class="yacht-type-icon">' + iconSvg(t.icon || 'anchor') + '</span>' +
        '<span class="yacht-type-name">' + esc(t.name) + '</span></button>';
    }).join('');
  }

  function renderSizes() {
    var wrap = document.getElementById('yacht-sizes');
    if (!wrap) return;
    var sizes = window.ELITE_YACHT_SIZES || [{ id: 'all', name: 'Any size' }];
    wrap.innerHTML = sizes.map(function (s) {
      var active = state.size === s.id ? ' is-active' : '';
      return '<button type="button" class="yacht-size-chip' + active + '" data-action="size" data-id="' + esc(s.id) + '">' + esc(s.name) + '</button>';
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
    else if (action === 'type') { e.preventDefault(); state.type = id; renderTypes(); renderGrid(); }
    else if (action === 'size') { e.preventDefault(); state.size = id; renderSizes(); renderGrid(); }
    else if (action === 'clear') { e.preventDefault(); clearAll(); }
    else if (action === 'bar-enquire') { e.preventDefault(); enquire(null); }
  }

  function init() {
    try {
      if (!list().length) {
        var g = document.getElementById('yacht-grid');
        if (g) g.innerHTML = '<div class="yacht-empty"><strong>Fleet unavailable</strong>Please refresh.</div>';
        return;
      }
      var hc = document.getElementById('yacht-hero-count');
      if (hc) hc.textContent = String(list().length);
      renderTypes();
      renderSizes();
      renderGrid();
      updateBar();

      document.addEventListener('click', function (e) {
        var t = e.target;
        if (t && t.nodeType === 3) t = t.parentElement;
        var walk = t;
        var inCat = false;
        while (walk && walk !== document) {
          if (walk.id === 'elite-yachts' || walk.id === 'yacht-selection-bar' || walk.id === 'yacht-selection-panel' || walk.id === 'yacht-enquiry') {
            inCat = true; break;
          }
          walk = walk.parentElement;
        }
        if (inCat) onClick(e);
      });

      var search = document.getElementById('yacht-search');
      if (search) {
        search.addEventListener('input', function () {
          state.q = search.value || '';
          renderGrid();
        });
      }

      var formMount = document.querySelector('[data-service-form="luxury-yacht"]');
      if (formMount && window.MutationObserver) {
        new MutationObserver(function () { syncForm(); }).observe(formMount, { childList: true, subtree: true });
      }
    } catch (err) {
      if (typeof console !== 'undefined') console.warn('EliteYachts init', err);
    }
  }

  window.EliteYachts = {
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
