/* Cross-site multi-hire cart — detailed line items + booking fields */
(function (window) {
  var KEY = 'elite_multi_cart_v2';

  function load() {
    try {
      return JSON.parse(localStorage.getItem(KEY) || '[]');
    } catch (e) {
      return [];
    }
  }

  function save(items) {
    localStorage.setItem(KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent('elite-cart-changed', { detail: { items: items } }));
    renderFab();
  }

  function uid() {
    return 'c_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 7);
  }

  /**
   * item fields:
   * kind, id, name, meta, summary, image, href, qty,
   * date, endDate, days, guests, hours, notes, location
   */
  function add(item) {
    if (!item || !item.name) return;
    var items = load();
    var kind = item.kind || 'service';
    var id = String(item.id || item.name);
    var existing = items.find(function (x) {
      return x.kind === kind && String(x.id) === id;
    });
    if (existing) {
      // setQty:true replaces quantity (security/production steppers); otherwise increment
      if (item.setQty) existing.qty = Math.max(1, item.qty || 1);
      else existing.qty = (existing.qty || 1) + (item.qty || 1);
      if (item.meta) existing.meta = item.meta;
      if (item.summary) existing.summary = item.summary;
      if (item.image) existing.image = item.image;
      if (item.href) existing.href = item.href;
    } else {
      items.push({
        cartId: uid(),
        kind: kind,
        id: id,
        name: item.name,
        meta: item.meta || '',
        summary: item.summary || item.meta || '',
        qty: item.qty || 1,
        image: item.image || '',
        href: item.href || '',
        date: item.date || '',
        endDate: item.endDate || '',
        days: item.days || '',
        guests: item.guests || '',
        hours: item.hours || '',
        location: item.location || '',
        notes: item.notes || '',
        addedAt: new Date().toISOString()
      });
    }
    save(items);
    flash('Added to multi-enquiry');
    return items;
  }

  function update(cartId, fields) {
    var items = load();
    items.forEach(function (x) {
      if (x.cartId === cartId) {
        Object.keys(fields || {}).forEach(function (k) {
          x[k] = fields[k];
        });
      }
    });
    save(items);
  }

  /** Booking fields shared across multi-hire line items (NOT notes — those stay per item) */
  var SHARED_KEYS = ['date', 'endDate', 'days', 'hours', 'guests', 'location'];

  /**
   * Apply the same booking details to every cart line (or only empty fields).
   * @param {Object} fields
   * @param {{onlyEmpty?:boolean}} [opts]
   */
  function applyToAll(fields, opts) {
    opts = opts || {};
    var onlyEmpty = !!opts.onlyEmpty;
    var items = load();
    var changed = false;
    items.forEach(function (x) {
      Object.keys(fields || {}).forEach(function (k) {
        if (SHARED_KEYS.indexOf(k) === -1 && k !== 'date' && k !== 'endDate') {
          // allow shared booking keys + any explicit key passed
        }
        var val = fields[k];
        if (val == null) return;
        if (onlyEmpty && x[k]) return;
        if (String(x[k] || '') !== String(val)) {
          x[k] = val;
          changed = true;
        }
      });
    });
    if (changed) save(items);
    return items;
  }

  /** First non-empty shared values found in the cart (for master bar prefill) */
  function sharedSnapshot() {
    var snap = { date: '', endDate: '', days: '', hours: '', guests: '', location: '' };
    var items = load();
    SHARED_KEYS.forEach(function (k) {
      for (var i = 0; i < items.length; i++) {
        if (items[i][k]) {
          snap[k] = items[i][k];
          break;
        }
      }
    });
    return snap;
  }

  /** True when every line shares the same non-empty date (or all empty) */
  function allSameDate() {
    var items = load();
    if (!items.length) return true;
    var d = items[0].date || '';
    return items.every(function (x) { return (x.date || '') === d; });
  }

  function remove(cartId) {
    save(load().filter(function (x) { return x.cartId !== cartId; }));
  }

  function setQty(cartId, qty) {
    qty = parseInt(qty, 10);
    update(cartId, { qty: Math.max(1, qty || 1) });
  }

  function clear() {
    save([]);
  }

  function count() {
    return load().reduce(function (n, x) { return n + (x.qty || 1); }, 0);
  }

  function kindLabel(kind) {
    var map = {
      artist: 'Artist',
      vehicle: 'Vehicle',
      yacht: 'Yacht / Boat',
      talent: 'Model / Dancer',
      security: 'Security',
      production: 'Stage / Sound / Lighting',
      service: 'Service'
    };
    return map[kind] || kind || 'Item';
  }

  function summaryText() {
    return load().map(function (x, i) {
      var lines = [
        (i + 1) + '. [' + kindLabel(x.kind) + '] ' + x.name + (x.qty > 1 ? ' ×' + x.qty : '')
      ];
      if (x.meta) lines.push(' Detail: ' + x.meta);
      if (x.summary && x.summary !== x.meta) lines.push(' Info: ' + x.summary);
      if (x.date) lines.push(' Start date: ' + x.date);
      if (x.endDate) lines.push(' End date: ' + x.endDate);
      if (x.days) lines.push(' Days: ' + x.days);
      if (x.hours) lines.push(' Hours / duration: ' + x.hours);
      if (x.guests) lines.push(' People / capacity: ' + x.guests);
      if (x.location) lines.push(' Location: ' + x.location);
      if (x.notes) lines.push(' Notes: ' + x.notes);
      if (x.image) lines.push(' Image: ' + x.image);
      if (x.href) lines.push(' Source: ' + x.href);
      return lines.join('\n');
    }).join('\n\n');
  }

  /** Compact snapshot for CRM / Ops UI (includes images) */
  function itemsSnapshot() {
    return load().map(function (x) {
      return {
        cartId: x.cartId || '',
        kind: x.kind || 'service',
        kindLabel: kindLabel(x.kind),
        id: x.id || '',
        name: x.name || '',
        meta: x.meta || '',
        summary: x.summary || '',
        qty: x.qty || 1,
        image: x.image || '',
        href: x.href || '',
        date: x.date || '',
        endDate: x.endDate || '',
        days: x.days || '',
        hours: x.hours || '',
        guests: x.guests || '',
        location: x.location || '',
        notes: x.notes || ''
      };
    });
  }

  function flash(msg) {
    var el = document.getElementById('elite-cart-toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'elite-cart-toast';
      el.className = 'elite-cart-toast';
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add('is-on');
    clearTimeout(el._t);
    el._t = setTimeout(function () { el.classList.remove('is-on'); }, 1800);
  }

  var CART_ICON =
    '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">' +
      '<path d="M6 6h15l-1.5 9h-12z"/><path d="M6 6L5 3H2"/><circle cx="9" cy="20" r="1"/><circle cx="18" cy="20" r="1"/>' +
    '</svg>';

  /** Unified button HTML for all pages (artists, cars, yachts, talent, security, production, home) */
  function buttonHtml(attrs) {
    attrs = attrs || {};
    var extra = attrs.extraClass ? ' ' + attrs.extraClass : '';
    var on = !!attrs.on;
    if (on) extra += ' is-on';
    var data = attrs.dataAttrs || '';
    var label = attrs.label || (on ? 'In multi-enquiry' : 'Add to multi-enquiry');
    var type = attrs.type || 'button';
    return (
      '<button type="' + type + '" class="btn-cart-add' + extra + '" ' + data + ' aria-label="' + label + '">' +
        CART_ICON +
        '<span>' + label + '</span>' +
      '</button>'
    );
  }

  function renderFab() {
    if (!document.body) return;
    // Remove any duplicate FABs (only one bottom-right control allowed)
    var allFabs = document.querySelectorAll('.elite-cart-fab, #elite-cart-fab, #elite-cart-fab-center, .multi-enquiry-fab-center');
    if (allFabs.length > 1) {
      for (var i = 1; i < allFabs.length; i++) {
        try { allFabs[i].remove(); } catch (e) {}
      }
    }
    // hide fab on multi-enquiry page itself
    if (/multi-enquiry\.html/i.test(window.location.pathname || '')) {
      var old = document.getElementById('elite-cart-fab');
      if (old) old.remove();
      document.querySelectorAll('.elite-cart-fab').forEach(function (el) { try { el.remove(); } catch (e2) {} });
      return;
    }
    var n = count();
    var fab = document.getElementById('elite-cart-fab');
    if (!fab) {
      fab = document.createElement('a');
      fab.id = 'elite-cart-fab';
      fab.className = 'elite-cart-fab';
      fab.href = 'multi-enquiry.html';
      fab.setAttribute('aria-label', 'Multi-enquiry cart');
      fab.innerHTML =
        '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8">' +
          '<path d="M6 6h15l-1.5 9h-12z"/><path d="M6 6L5 3H2"/><circle cx="9" cy="20" r="1"/><circle cx="18" cy="20" r="1"/>' +
        '</svg>' +
        '<span class="elite-cart-badge" id="elite-cart-badge">0</span>' +
        '<span class="elite-cart-label">Multi-enquiry</span>';
      document.body.appendChild(fab);
    }
    // Force bottom-right only (never centered / never on top of back-to-top)
    fab.style.position = 'fixed';
    fab.style.right = '1rem';
    fab.style.left = 'auto';
    fab.style.bottom = '1.15rem';
    fab.style.top = 'auto';
    fab.style.margin = '0';
    fab.style.background = 'linear-gradient(135deg, #8a6f27 0%, #e8c86b 42%, #c9a84c 100%)';
    fab.style.color = '#0a0a0a';
    var badge = document.getElementById('elite-cart-badge');
    if (badge) badge.textContent = String(n);
    fab.classList.toggle('has-items', n > 0);
  }

  window.EliteCart = {
    add: add,
    update: update,
    applyToAll: applyToAll,
    sharedSnapshot: sharedSnapshot,
    allSameDate: allSameDate,
    SHARED_KEYS: SHARED_KEYS.slice(),
    remove: remove,
    setQty: setQty,
    clear: clear,
    load: load,
    count: count,
    summaryText: summaryText,
    itemsSnapshot: itemsSnapshot,
    kindLabel: kindLabel,
    buttonHtml: buttonHtml,
    cartIcon: CART_ICON,
    renderFab: renderFab
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderFab);
  } else {
    renderFab();
  }
})(window);
