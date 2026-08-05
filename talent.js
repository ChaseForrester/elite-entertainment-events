/* Models & Dancers — filters, multi-select, enquiry (no prices) */
(function () {
  'use strict';

  var selected = {};
  var state = { style: 'all', group: 'all', q: '' };

  var ICONS = {
    all: '<circle cx="12" cy="12" r="9"/><path d="M12 7v10M7 12h10"/>',
    hiphop: '<path d="M9 18V6l12-2v12"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
    latin: '<path d="M12 3v4M9 7h6l-1 5H10L9 7z"/><path d="M10 12l-2 9M14 12l2 9M8 16h8"/>',
    spark: '<path d="M12 2l1.5 6.5L20 10l-6.5 1.5L12 18l-1.5-6.5L4 10l6.5-1.5L12 2z"/>',
    mask: '<path d="M3 10c0 5 4 8 9 8s9-3 9-8c-3 1-6 1-9 0-3 1-6 1-9 0z"/><path d="M8 11h.01M16 11h.01"/>',
    star: '<polygon points="12 2 15 9 22 9 17 14 19 21 12 17 5 21 7 14 2 9 9 9"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 5-6 8-6s6.5 2 8 6"/>',
    walk: '<circle cx="12" cy="5" r="2"/><path d="M10 22l2-7 2 3 3 2M9 10l3 2 4-2"/>',
    film: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 5v14M17 5v14M3 9h4M3 15h4M17 9h4M17 15h4"/>',
    music: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
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
    return '<svg class="filter-icon-svg" viewBox="0 0 24 24" aria-hidden="true">' + (ICONS[key] || ICONS.all) + '</svg>';
  }

  function setClass(el, cls, on) {
    if (!el || !el.classList) return;
    if (on) el.classList.add(cls);
    else el.classList.remove(cls);
  }

  function list() {
    return window.ELITE_TALENT || [];
  }

  function getSelected() {
    return list().filter(function (t) { return selected[t.id]; });
  }

  function labelOf(t) {
    return t.name + ' · ' + t.style + ' · ' + t.group;
  }

  function syncForm() {
    try {
      var picks = getSelected();
      var text = picks.map(labelOf).join('\n');
      var ta = document.getElementById('sf-talent');
      if (ta) ta.value = text;
      var preview = document.getElementById('talent-form-selected');
      if (preview) {
        if (!picks.length) {
          preview.hidden = true;
          preview.innerHTML = '';
        } else {
          preview.hidden = false;
          preview.innerHTML = '<h4>Selected for this enquiry</h4><ul>' +
            picks.map(function (t) { return '<li>' + esc(t.name) + '</li>'; }).join('') +
            '</ul>';
        }
      }
    } catch (e) { /* ignore */ }
  }

  function updateBar() {
    var picks = getSelected();
    var n = picks.length;
    var names = picks.map(function (t) { return t.name; }).join(' · ');

    var bar = document.getElementById('talent-selection-bar');
    if (bar) setClass(bar, 'is-visible', n > 0);
    if (document.body) setClass(document.body, 'has-talent-selection', n > 0);
    var info = bar && bar.querySelector ? bar.querySelector('.talent-selection-info') : null;
    if (info) {
      info.innerHTML = '<strong>' + n + ' act' + (n === 1 ? '' : 's') + ' selected</strong>' +
        '<span>' + esc(names || 'Tap Add to enquiry on cards above') + '</span>';
    }

    // In-page selection panel (always in document flow, above form)
    var panel = document.getElementById('talent-selection-panel');
    var listEl = document.getElementById('talent-selection-list');
    if (panel) {
      if (n > 0) {
        panel.hidden = false;
        panel.removeAttribute('hidden');
      } else {
        panel.hidden = true;
        panel.setAttribute('hidden', '');
      }
    }
    if (listEl) {
      listEl.innerHTML = picks.map(function (t) {
        return '<li><span>' + esc(t.name) + '</span> <button type="button" class="cat-sel-remove" data-action="toggle" data-id="' + esc(t.id) + '" aria-label="Remove">Remove</button></li>';
      }).join('');
    }

    syncForm();
  }

  function toggle(id) {
    if (!id) return false;
    selected[id] = !selected[id];
    if (!selected[id]) delete selected[id];
    else if (window.EliteCart) {
      var t = list().find(function (x) { return x.id === id; });
      if (t) {
        window.EliteCart.add({
          kind: 'talent',
          id: t.id,
          name: t.name,
          meta: t.style + ' · ' + t.group + (t.location ? ' · ' + t.location : ''),
          summary: t.summary || (t.name + ' — ' + (t.style || 'talent') + ' available for hire'),
          qty: 1,
          image: t.image,
          href: 'models-dancers.html?talent=' + encodeURIComponent(t.id)
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
    var form = document.getElementById('talent-enquiry') || document.querySelector('[data-service-form="models"]');
    if (form && form.scrollIntoView) {
      form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
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
    return list().filter(function (t) {
      if (state.style !== 'all') {
        var styles = t.styles || [t.style];
        var hit = false;
        for (var i = 0; i < styles.length; i++) {
          if (styles[i] === state.style) { hit = true; break; }
        }
        if (!hit && t.style !== state.style) return false;
      }
      if (state.group !== 'all' && t.group !== state.group) return false;
      if (!q) return true;
      var hay = [t.name, t.style, t.group, t.location, t.category, t.summary,
      (t.styles || []).join(' '), (t.features || []).join(' '), (t.tags || []).join(' ')
      ].join(' ').toLowerCase();
      return hay.indexOf(q) !== -1;
    });
  }

  function cardHtml(t) {
    var on = !!selected[t.id];
    var fallback = 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=80';
    var img = t.image || fallback;
    var idAttr = esc(t.id);
    var hasVideo = !!(t.youtubeUrl && ((window.EliteMedia && window.EliteMedia.youtubeId(t.youtubeUrl)) || /watch\?v=|youtu\.be\/|shorts\//.test(String(t.youtubeUrl || ''))));
    var galCount = (t.gallery && t.gallery.length) || 0;
    return (
      '<article class="talent-card' + (on ? ' is-selected' : '') + '" data-id="' + idAttr + '">' +
      '<div class="talent-card-media">' +
      '<img src="' + esc(img) + '" alt="' + esc(t.name) + '" loading="lazy" decoding="async" onerror="this.onerror=null;this.src=\'' + fallback + '\'" />' +
      '<span class="talent-card-badge">' + esc(t.style) + '</span>' +
      '<span class="talent-card-group">' + esc(t.group) + '</span>' +
      (hasVideo ? '<span class="talent-card-live">Live video</span>' : '') +
      (on ? '<span class="talent-card-check is-on" aria-hidden="true"></span>' : '') +
      '</div>' +
      '<div class="talent-card-body">' +
      '<div class="talent-card-loc">' + esc(t.location) + '</div>' +
      '<h3 class="talent-card-title">' + esc(t.name) + '</h3>' +
      '<p class="talent-card-summary">' + esc(t.summary) + '</p>' +
      '<dl class="talent-specs">' +
      '<div class="talent-spec"><dt>Style</dt><dd>' + esc(t.style) + '</dd></div>' +
      '<div class="talent-spec"><dt>Group</dt><dd>' + esc(t.group) + '</dd></div>' +
      '</dl>' +
      '<div class="talent-card-actions">' +
      '<button type="button" class="btn btn-outline talent-profile-btn" data-action="profile" data-id="' + idAttr + '">View profile' + (galCount ? ' · ' + galCount + ' photos' : '') + '</button>' +
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

  function closeProfile() {
    var modal = document.getElementById('talent-profile-modal');
    if (!modal) return;
    var iframe = modal.querySelector('iframe');
    if (iframe) iframe.src = '';
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('talent-profile-open');
  }

  function openProfile(id) {
    var t = list().find(function (x) { return x.id === id; });
    if (!t) return;
    if (window.EliteMedia && window.EliteMedia.enrichTalent) window.EliteMedia.enrichTalent(t);

    var modal = document.getElementById('talent-profile-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'talent-profile-modal';
      modal.className = 'talent-profile-modal';
      modal.setAttribute('aria-hidden', 'true');
      modal.innerHTML =
        '<div class="talent-profile-dialog" role="dialog" aria-modal="true" aria-labelledby="talent-profile-title">' +
        '<button type="button" class="talent-profile-close" data-action="close-profile" aria-label="Close profile">&times;</button>' +
        '<div class="talent-profile-layout">' +
        '<div class="talent-profile-media-col">' +
        '<div class="talent-profile-hero"><img id="talent-profile-photo" src="" alt="" /></div>' +
        '<div id="talent-profile-yt" class="talent-profile-yt" hidden></div>' +
        '<div id="talent-profile-gallery" class="talent-profile-gallery"></div>' +
        '</div>' +
        '<div class="talent-profile-copy">' +
        '<p class="section-eyebrow" id="talent-profile-style"></p>' +
        '<h2 id="talent-profile-title"></h2>' +
        '<p class="talent-profile-meta" id="talent-profile-meta"></p>' +
        '<p class="talent-profile-summary" id="talent-profile-summary"></p>' +
        '<div class="talent-profile-actions">' +
        '<button type="button" class="btn-cart-add" id="talent-profile-toggle" data-action="toggle">Add to multi-enquiry</button>' +
        '<button type="button" class="btn btn-gold" id="talent-profile-enquire" data-action="enquire">Enquire now</button>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>';
      document.body.appendChild(modal);
      modal.addEventListener('click', function (e) {
        if (e.target === modal) closeProfile();
      });
    }

    var fallback = 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=900&q=80';
    var photo = document.getElementById('talent-profile-photo');
    photo.src = t.image || fallback;
    photo.alt = t.name;
    photo.onerror = function () { photo.onerror = null; photo.src = fallback; };

    document.getElementById('talent-profile-title').textContent = t.name;
    document.getElementById('talent-profile-style').textContent = t.style || 'Models & Dancers';
    document.getElementById('talent-profile-meta').textContent = [t.group, t.location, t.category].filter(Boolean).join(' · ');
    document.getElementById('talent-profile-summary').textContent = t.summary || (t.name + ' is available for hire through Elite Entertainment.');

    var ytHost = document.getElementById('talent-profile-yt');
    var ytId = window.EliteMedia && window.EliteMedia.youtubeId ? window.EliteMedia.youtubeId(t.youtubeUrl) : '';
    if (ytId) {
      ytHost.hidden = false;
      ytHost.innerHTML =
        '<p class="artist-yt-label">Live performance</p>' +
        '<div class="artist-yt-frame">' +
        '<iframe src="https://www.youtube-nocookie.com/embed/' + ytId + '?rel=0&modestbranding=1" title="' + esc(t.name) + ' live performance" ' +
        'allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe>' +
        '</div>';
    } else {
      ytHost.hidden = true;
      ytHost.innerHTML = '';
    }

    var galHost = document.getElementById('talent-profile-gallery');
    var gallery = t.gallery || [];
    if (gallery.length) {
      galHost.innerHTML =
        '<p class="artist-yt-label">Gallery</p>' +
        '<div class="artist-gallery-grid">' +
        gallery.map(function (src, i) {
          return '<button type="button" class="artist-gallery-item" data-gallery-src="' + esc(src) + '">' +
            '<img src="' + esc(src) + '" alt="' + esc(t.name) + ' photo ' + (i + 1) + '" loading="lazy" /></button>';
        }).join('') +
        '</div>';
      galHost.querySelectorAll('[data-gallery-src]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          photo.src = btn.getAttribute('data-gallery-src');
        });
      });
    } else {
      galHost.innerHTML = '';
    }

    var toggleBtn = document.getElementById('talent-profile-toggle');
    var enquireBtn = document.getElementById('talent-profile-enquire');
    toggleBtn.setAttribute('data-id', t.id);
    enquireBtn.setAttribute('data-id', t.id);
    var on = !!selected[t.id];
    toggleBtn.classList.toggle('is-on', on);
    toggleBtn.innerHTML =
      '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 6h15l-1.5 9h-12z"/><path d="M6 6L5 3H2"/><circle cx="9" cy="20" r="1"/><circle cx="18" cy="20" r="1"/></svg>' +
      '<span>' + (on ? 'In multi-enquiry' : 'Add to multi-enquiry') + '</span>';

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('talent-profile-open');
  }

  function renderGrid() {
    var grid = document.getElementById('talent-grid');
    var countEl = document.getElementById('talent-count');
    if (!grid) return;
    var items = filtered();
    if (countEl) countEl.innerHTML = 'Showing <strong>' + items.length + '</strong> of ' + list().length;
    if (!items.length) {
      grid.innerHTML = '<div class="talent-empty"><strong>No acts match</strong>Try another filter or search.</div>';
      return;
    }
    grid.innerHTML = items.map(cardHtml).join('');
  }

  function renderStyles() {
    var wrap = document.getElementById('talent-styles');
    if (!wrap) return;
    var styles = window.ELITE_TALENT_STYLES || [{ id: 'all', name: 'All', icon: 'all' }];
    wrap.innerHTML = styles.map(function (s) {
      var active = state.style === s.id ? ' is-active' : '';
      return '<button type="button" class="talent-style-btn' + active + '" data-action="style" data-id="' + esc(s.id) + '" title="' + esc(s.name) + '">' +
        '<span class="talent-style-icon">' + iconSvg(s.icon || 'all') + '</span>' +
        '<span class="talent-style-name">' + esc(s.name) + '</span></button>';
    }).join('');
  }

  function renderGroups() {
    var wrap = document.getElementById('talent-groups');
    if (!wrap) return;
    var groups = window.ELITE_TALENT_GROUPS || [{ id: 'all', name: 'Any size' }];
    wrap.innerHTML = groups.map(function (g) {
      var active = state.group === g.id ? ' is-active' : '';
      return '<button type="button" class="talent-group-chip' + active + '" data-action="group" data-id="' + esc(g.id) + '">' + esc(g.name) + '</button>';
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
    if (action === 'toggle') {
      e.preventDefault();
      e.stopPropagation();
      toggle(id);
      if (document.getElementById('talent-profile-modal') &&
        document.getElementById('talent-profile-modal').classList.contains('is-open') && id) {
        openProfile(id);
      }
    } else if (action === 'enquire') {
      e.preventDefault();
      e.stopPropagation();
      closeProfile();
      enquire(id);
    } else if (action === 'profile') {
      e.preventDefault();
      e.stopPropagation();
      openProfile(id);
    } else if (action === 'close-profile') {
      e.preventDefault();
      closeProfile();
    } else if (action === 'style') {
      e.preventDefault();
      state.style = id;
      renderStyles();
      renderGrid();
    } else if (action === 'group') {
      e.preventDefault();
      state.group = id;
      renderGroups();
      renderGrid();
    } else if (action === 'clear') {
      e.preventDefault();
      clearAll();
    } else if (action === 'bar-enquire') {
      e.preventDefault();
      enquire(null);
    }
  }

  function init() {
    try {
      if (window.EliteMedia && typeof window.EliteMedia.enrichAll === 'function') {
        window.EliteMedia.enrichAll();
      }
      if (!list().length) {
        var g = document.getElementById('talent-grid');
        if (g) g.innerHTML = '<div class="talent-empty"><strong>Roster unavailable</strong>Please refresh the page.</div>';
        return;
      }
      var hc = document.getElementById('talent-hero-count');
      if (hc) hc.textContent = String(list().length);

      renderStyles();
      renderGroups();
      renderGrid();
      updateBar();

      // Deep-link ?talent=id opens profile
      try {
        var params = new URLSearchParams(window.location.search);
        var tid = params.get('talent');
        if (tid) openProfile(tid);
      } catch (e) { /* ignore */ }

      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeProfile();
      });

      // Document-level click so selection panel + bar + cards all work
      document.addEventListener('click', function (e) {
        var t = e.target;
        if (t && t.nodeType === 3) t = t.parentElement;
        var inCat = false;
        var walk = t;
        while (walk && walk !== document) {
          if (walk.id === 'elite-talent' || walk.id === 'talent-selection-bar' || walk.id === 'talent-selection-panel' || walk.id === 'talent-enquiry') {
            inCat = true;
            break;
          }
          walk = walk.parentElement;
        }
        if (inCat) onClick(e);
      });

      var search = document.getElementById('talent-search');
      if (search) {
        search.addEventListener('input', function () {
          state.q = search.value || '';
          renderGrid();
        });
      }

      // Re-sync when multi-step form re-renders
      var formMount = document.querySelector('[data-service-form="models"]');
      if (formMount && window.MutationObserver) {
        new MutationObserver(function () { syncForm(); }).observe(formMount, { childList: true, subtree: true });
      }
    } catch (err) {
      if (typeof console !== 'undefined') console.warn('EliteTalent init', err);
    }
  }

  window.EliteTalent = {
    toggle: toggle,
    enquire: enquire,
    clear: clearAll,
    openProfile: openProfile,
    closeProfile: closeProfile,
    getSelected: getSelected,
    getSelectedLabels: function () { return getSelected().map(labelOf); },
    syncForm: syncForm
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
