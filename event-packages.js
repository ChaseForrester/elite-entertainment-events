/* Shared package grid for Weddings · Corporate · Private Parties (hire-page style) */
(function () {
  'use strict';

  var selected = {};
  var state = { type: 'all', q: '' };
  var pageKey = 'weddings';
  var formKey = 'weddings';

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

  function list() {
    var data = window.ELITE_EVENT_PACKAGES || {};
    return data[pageKey] || [];
  }

  function getSelected() {
    return list().filter(function (p) { return selected[p.id]; });
  }

  function kindForPage() {
    if (pageKey === 'corporate') return 'service';
    if (pageKey === 'parties') return 'service';
    return 'service';
  }

  function hrefForPage() {
    if (pageKey === 'corporate') return 'corporate.html';
    if (pageKey === 'parties') return 'private-parties.html';
    return 'weddings.html';
  }

  function syncForm() {
    try {
      var picks = getSelected();
      var labels = picks.map(function (p) { return p.name + ' (' + p.type + ')'; });
      var ta = document.getElementById('sf-packages');
      if (ta) ta.value = labels.join('\n');
      var msg = document.getElementById('sf-message');
      if (msg && picks.length && !msg.value) {
        msg.value = 'Interested packages:\n' + labels.map(function (l) { return '• ' + l; }).join('\n');
      }
      var preview = document.getElementById('event-form-selected');
      if (preview) {
        if (!picks.length) {
          preview.hidden = true;
          preview.innerHTML = '';
        } else {
          preview.hidden = false;
          preview.innerHTML = '<h4>Selected packages</h4><ul>' +
            picks.map(function (p) { return '<li>' + esc(p.name) + '</li>'; }).join('') +
            '</ul>';
        }
      }
      var svc = document.getElementById('sf-service');
      if (svc && picks.length === 1) {
        // best-effort preselect matching option
        var name = picks[0].name.toLowerCase();
        Array.prototype.forEach.call(svc.options || [], function (opt) {
          if (opt.value && name.indexOf(opt.value.toLowerCase().split(' ')[0]) !== -1) {
            svc.value = opt.value;
          }
        });
      }
    } catch (e) { /* ignore */ }
  }

  function updateBar() {
    var picks = getSelected();
    var n = picks.length;
    var names = picks.map(function (p) { return p.name; }).join(' · ');
    var bar = document.getElementById('event-selection-bar');
    if (bar) setClass(bar, 'is-visible', n > 0);
    if (document.body) setClass(document.body, 'has-event-selection', n > 0);
    var info = bar && bar.querySelector ? bar.querySelector('.event-selection-info') : null;
    if (info) {
      info.innerHTML = '<strong>' + n + ' package' + (n === 1 ? '' : 's') + ' selected</strong>' +
        '<span>' + esc(names || 'Tap Add to multi-enquiry on cards above') + '</span>';
    }
    var panel = document.getElementById('event-selection-panel');
    var listEl = document.getElementById('event-selection-list');
    if (panel) {
      if (n > 0) { panel.hidden = false; panel.removeAttribute('hidden'); }
      else { panel.hidden = true; panel.setAttribute('hidden', ''); }
    }
    if (listEl) {
      listEl.innerHTML = picks.map(function (p) {
        return '<li><span>' + esc(p.name) + '</span> <button type="button" class="cat-sel-remove" data-action="toggle" data-id="' + esc(p.id) + '">Remove</button></li>';
      }).join('');
    }
    syncForm();
  }

  function toggle(id) {
    if (!id) return false;
    selected[id] = !selected[id];
    if (!selected[id]) delete selected[id];
    else if (window.EliteCart) {
      var p = list().find(function (x) { return x.id === id; });
      if (p) {
        window.EliteCart.add({
          kind: kindForPage(),
          id: pageKey + ':' + p.id,
          name: p.name,
          meta: pageKey + ' · ' + p.type,
          summary: p.summary || '',
          qty: 1,
          image: p.image,
          href: hrefForPage() + '?package=' + encodeURIComponent(p.id)
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
      if (window.EliteCart) {
        var p = list().find(function (x) { return x.id === id; });
        if (p) {
          window.EliteCart.add({
            kind: kindForPage(),
            id: pageKey + ':' + p.id,
            name: p.name,
            meta: pageKey + ' · ' + p.type,
            summary: p.summary || '',
            qty: 1,
            image: p.image,
            href: hrefForPage()
          });
        }
      }
      renderGrid();
      updateBar();
    }
    syncForm();
    var form = document.getElementById('event-enquiry') || document.querySelector('[data-service-form]');
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
    return list().filter(function (p) {
      if (state.type !== 'all' && p.type !== state.type) return false;
      if (!q) return true;
      var hay = [p.name, p.type, p.summary, (p.includes || []).join(' ')].join(' ').toLowerCase();
      return hay.indexOf(q) !== -1;
    });
  }

  function cardHtml(p) {
    var on = !!selected[p.id];
    var fallback = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=80';
    var idAttr = esc(p.id);
    return (
      '<article class="event-card' + (on ? ' is-selected' : '') + '" data-id="' + idAttr + '">' +
        '<div class="event-card-media">' +
          '<img src="' + esc(p.image || fallback) + '" alt="' + esc(p.name) + '" loading="lazy" decoding="async" width="600" height="400" onerror="this.onerror=null;this.src=\'' + fallback + '\'" />' +
          '<span class="event-card-badge">' + esc(p.type) + '</span>' +
        '</div>' +
        '<div class="event-card-body">' +
          '<h3 class="event-card-title">' + esc(p.name) + '</h3>' +
          '<p class="event-card-summary">' + esc(p.summary) + '</p>' +
          '<ul class="event-features">' +
            (p.includes || []).slice(0, 3).map(function (f) {
              return '<li>' + esc(f) + '</li>';
            }).join('') +
          '</ul>' +
          '<div class="event-card-actions">' +
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
    var grid = document.getElementById('event-grid');
    var countEl = document.getElementById('event-count');
    if (!grid) return;
    var items = filtered();
    if (countEl) countEl.innerHTML = 'Showing <strong>' + items.length + '</strong> of ' + list().length;
    if (!items.length) {
      grid.innerHTML = '<div class="event-empty"><strong>No packages match</strong>Try another filter or search.</div>';
      return;
    }
    grid.innerHTML = items.map(cardHtml).join('');
  }

  function renderTypes() {
    var wrap = document.getElementById('event-types');
    if (!wrap) return;
    var types = ['all'];
    list().forEach(function (p) {
      if (p.type && types.indexOf(p.type) === -1) types.push(p.type);
    });
    wrap.innerHTML = types.map(function (t) {
      var label = t === 'all' ? 'All' : t;
      var on = state.type === t ? ' is-on' : '';
      return '<button type="button" class="event-type-btn' + on + '" data-type="' + esc(t) + '">' + esc(label) + '</button>';
    }).join('');
  }

  function detectPage() {
    var root = document.getElementById('elite-event-packages');
    if (root && root.getAttribute('data-event-key')) {
      pageKey = root.getAttribute('data-event-key');
    } else if (/corporate/i.test(location.pathname)) pageKey = 'corporate';
    else if (/private-parties|parties/i.test(location.pathname)) pageKey = 'parties';
    else pageKey = 'weddings';

    formKey = pageKey === 'parties' ? 'parties' : pageKey;
  }

  function bind() {
    // Use document so sticky bar + selection panel (outside #elite-event-packages) work
    document.addEventListener('click', function (e) {
      var t = e.target;
      if (!t || !t.closest) return;
      var typeBtn = t.closest('[data-type]');
      if (typeBtn && typeBtn.closest && typeBtn.closest('#event-types')) {
        state.type = typeBtn.getAttribute('data-type') || 'all';
        renderTypes();
        renderGrid();
        return;
      }
      var btn = t.closest('[data-action]');
      if (!btn) return;
      // Only handle our event-page actions (avoid fighting other pages)
      var action = btn.getAttribute('data-action');
      var id = btn.getAttribute('data-id');
      var inEventUi = btn.closest('#elite-event-packages') ||
        btn.closest('#event-selection-bar') ||
        btn.closest('#event-selection-panel') ||
        btn.closest('#event-enquiry');
      if (!inEventUi && action !== 'bar-enquire') return;
      if (action === 'toggle') toggle(id);
      else if (action === 'enquire' || action === 'bar-enquire') enquire(id);
      else if (action === 'clear') clearAll();
    });

    var search = document.getElementById('event-search');
    if (search) {
      search.addEventListener('input', function () {
        state.q = search.value || '';
        renderGrid();
      });
    }

    // deep-link ?package=
    try {
      var params = new URLSearchParams(window.location.search);
      var pkg = params.get('package');
      if (pkg) {
        selected[pkg] = true;
        setTimeout(function () { enquire(pkg); }, 300);
      }
    } catch (e) {}
  }

  function init() {
    detectPage();
    var heroCount = document.getElementById('event-hero-count');
    if (heroCount) heroCount.textContent = String(list().length);
    renderTypes();
    renderGrid();
    updateBar();
    bind();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  window.EliteEventPackages = {
    getSelected: getSelected,
    syncForm: syncForm,
    clear: clearAll
  };
})();
