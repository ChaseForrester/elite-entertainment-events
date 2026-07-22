/* Security hire catalogue — multi-type select + quantity per type */
(function () {
  'use strict';

  /* selected[id] = quantity (number > 0) */
  var selected = {};
  var state = { type: 'all', q: '' };

  var ICONS = {
    shield: '<path d="M12 3l8 3v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-3z"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 5-6 8-6s6.5 2 8 6"/>',
    users: '<circle cx="9" cy="8" r="3"/><circle cx="16" cy="8" r="2.5"/><path d="M3 20c1-3 3.5-5 6-5s5 2 6 5M15 15c1.5 0 3.5 1 4.5 4"/>',
    star: '<path d="M12 3l2 6h6l-5 4 2 6-5-4-5 4 2-6-5-4h6z"/>',
    door: '<path d="M5 21V5a2 2 0 012-2h10v18H5z"/><path d="M14 12h.01"/>',
    pin: '<path d="M12 21s-7-5.5-7-11a7 7 0 0114 0c0 5.5-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>',
    walk: '<circle cx="12" cy="5" r="2"/><path d="M10 22l2-7 2 3 3 2M9 10l3 2 4-2"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5"/>',
    brief: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2"/>',
    heart: '<path d="M12 21s-7-4.5-7-10a4.5 4.5 0 018-2.8A4.5 4.5 0 0120 11c0 5.5-8 10-8 10z"/>',
    mic: '<rect x="9" y="2" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0014 0M12 18v4M8 22h8"/>',
    key: '<circle cx="8" cy="15" r="4"/><path d="M11 13l9-9M17 5l2 2"/>',
    search: '<circle cx="11" cy="11" r="6"/><path d="M20 20l-3.5-3.5"/>',
    car: '<path d="M3 13l2-5h14l2 5M5 13v5h2v-2h10v2h2v-5"/><circle cx="7.5" cy="16" r="1"/><circle cx="16.5" cy="16" r="1"/>',
    badge: '<path d="M12 2l2.5 5 5.5.8-4 3.9.9 5.5L12 14.8 7.1 17.2l.9-5.5-4-3.9L9.5 7 12 2z"/>',
    leader: '<path d="M12 2l3 6 6 .9-4.5 4.4 1 6.2L12 16.5 6.5 19.5l1-6.2L3 8.9 9 8 12 2z"/>',
    bolt: '<path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"/>'
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
      (ICONS[key] || ICONS.shield) + '</svg>';
  }

  function setClass(el, cls, on) {
    if (!el || !el.classList) return;
    if (on) el.classList.add(cls);
    else el.classList.remove(cls);
  }

  function list() { return window.ELITE_SECURITY || []; }

  function getSelected() {
    return list().filter(function (s) { return selected[s.id] > 0; }).map(function (s) {
      return { item: s, qty: selected[s.id] };
    });
  }

  function labelOf(entry) {
    return entry.item.name + ' x' + entry.qty + ' (' + entry.item.type + ')';
  }

  function totalStaff() {
    var n = 0;
    Object.keys(selected).forEach(function (k) { n += selected[k] || 0; });
    return n;
  }

  function syncForm() {
    try {
      var picks = getSelected();
      var ta = document.getElementById('sf-security');
      if (ta) ta.value = picks.map(labelOf).join('\n');
      var qtyField = document.getElementById('sf-quantity');
      if (qtyField && picks.length) {
        qtyField.value = 'Total staff: ' + totalStaff() + ' across ' + picks.length + ' type(s)';
      }
      var preview = document.getElementById('security-form-selected');
      if (preview) {
        if (!picks.length) {
          preview.hidden = true;
          preview.innerHTML = '';
        } else {
          preview.hidden = false;
          preview.innerHTML = '<h4>Selected security types</h4><ul>' +
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
    var staff = totalStaff();

    var bar = document.getElementById('security-selection-bar');
    if (bar) setClass(bar, 'is-visible', n > 0);
    if (document.body) setClass(document.body, 'has-security-selection', n > 0);
    var info = bar && bar.querySelector ? bar.querySelector('.security-selection-info') : null;
    if (info) {
      info.innerHTML = '<strong>' + n + ' type' + (n === 1 ? '' : 's') + ' · ' + staff + ' staff</strong>' +
        '<span>' + esc(picks.map(function (p) { return p.item.name + ' x' + p.qty; }).join(' · ') || 'Add security types above') + '</span>';
    }

    var panel = document.getElementById('security-selection-panel');
    var listEl = document.getElementById('security-selection-list');
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
            kind: 'security',
            id: s.id,
            name: s.name,
            meta: s.type + (s.typical ? ' · ' + s.typical : ''),
            summary: s.summary || (s.name + ' — licensed event security'),
            qty: qty,
            setQty: true,
            image: s.image,
            href: 'security.html'
          });
        }
      }
    }
    renderGrid();
    updateBar();
  }

  function addOne(id) {
    var item = list().find(function (s) { return s.id === id; });
    var min = (item && item.minStaff) || 1;
    var cur = selected[id] || 0;
    setQty(id, cur ? cur + 1 : min);
  }

  function enquire(id) {
    if (id && !selected[id]) addOne(id);
    syncForm();
    var form = document.getElementById('security-enquiry') || document.querySelector('[data-service-form="security"]');
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
      if (state.type !== 'all' && s.type !== state.type) return false;
      if (!q) return true;
      var hay = [s.name, s.type, s.summary, s.typical, (s.tags || []).join(' '), (s.features || []).join(' ')].join(' ').toLowerCase();
      return hay.indexOf(q) !== -1;
    });
  }

  function cardHtml(s) {
    var qty = selected[s.id] || 0;
    var on = qty > 0;
    var fallback = 'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=900&q=80';
    var idAttr = esc(s.id);
    return (
      '<article class="security-card' + (on ? ' is-selected' : '') + '" data-id="' + idAttr + '">' +
        '<div class="security-card-media">' +
          '<img src="' + esc(s.image || fallback) + '" alt="' + esc(s.name) + '" loading="lazy" decoding="async" width="600" height="400" onerror="this.onerror=null;this.src=\'' + fallback + '\'" />' +
          '<span class="security-card-badge">' + esc(s.type) + '</span>' +
        '</div>' +
        '<div class="security-card-body">' +
          '<h3 class="security-card-title">' + esc(s.name) + '</h3>' +
          '<p class="security-card-summary">' + esc(s.summary) + '</p>' +
          '<dl class="security-specs">' +
            '<div class="security-spec"><dt>Typical team</dt><dd>' + esc(s.typical) + '</dd></div>' +
            '<div class="security-spec"><dt>Min. hire</dt><dd>' + esc(String(s.minStaff)) + ' staff</dd></div>' +
          '</dl>' +
          '<ul class="security-features">' +
            (s.features || []).slice(0, 3).map(function (f) {
              return '<li>' + esc(f) + '</li>';
            }).join('') +
          '</ul>' +
          '<div class="security-qty-row">' +
            '<label class="security-qty-label">How many?</label>' +
            '<div class="security-qty-controls">' +
              '<button type="button" class="security-qty-btn" data-action="dec" data-id="' + idAttr + '" aria-label="Decrease">-</button>' +
              '<input type="number" class="security-qty-input" min="0" max="200" value="' + qty + '" data-action="qty" data-id="' + idAttr + '" aria-label="Quantity for ' + esc(s.name) + '" />' +
              '<button type="button" class="security-qty-btn" data-action="inc" data-id="' + idAttr + '" aria-label="Increase">+</button>' +
            '</div>' +
          '</div>' +
          '<div class="security-card-actions">' +
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
    var grid = document.getElementById('security-grid');
    var countEl = document.getElementById('security-count');
    if (!grid) return;
    var items = filtered();
    if (countEl) countEl.innerHTML = 'Showing <strong>' + items.length + '</strong> of ' + list().length;
    if (!items.length) {
      grid.innerHTML = '<div class="security-empty"><strong>No types match</strong>Try another filter or search.</div>';
      return;
    }
    grid.innerHTML = items.map(cardHtml).join('');
  }

  function renderTypes() {
    var wrap = document.getElementById('security-types');
    if (!wrap) return;
    var types = window.ELITE_SECURITY_TYPES || [{ id: 'all', name: 'All', icon: 'shield' }];
    wrap.innerHTML = types.map(function (t) {
      var active = state.type === t.id ? ' is-active' : '';
      return '<button type="button" class="security-type-btn' + active + '" data-action="type" data-id="' + esc(t.id) + '" title="' + esc(t.name) + '">' +
        '<span class="security-type-icon">' + iconSvg(t.icon || 'shield') + '</span>' +
        '<span class="security-type-name">' + esc(t.name) + '</span></button>';
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
        var g = document.getElementById('security-grid');
        if (g) g.innerHTML = '<div class="security-empty"><strong>Catalogue unavailable</strong>Please refresh.</div>';
        return;
      }
      var hc = document.getElementById('security-hero-count');
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
          if (walk.id === 'elite-security' || walk.id === 'security-selection-bar' ||
              walk.id === 'security-selection-panel' || walk.id === 'security-enquiry') {
            inCat = true; break;
          }
          walk = walk.parentElement;
        }
        if (inCat) onClick(e);
      });
      document.addEventListener('change', function (e) {
        var t = e.target;
        if (t && t.classList && t.classList.contains('security-qty-input')) onChange(e);
      });

      var search = document.getElementById('security-search');
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
      if (typeof console !== 'undefined') console.warn('EliteSecurity init', err);
    }
  }

  window.EliteSecurity = {
    getSelected: getSelected,
    getSelectedLabels: function () { return getSelected().map(labelOf); },
    syncForm: syncForm,
    clear: clearAll
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
