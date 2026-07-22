/* Renders 12 homepage folders + folder pages + legacy category pages */
(function () {
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function artistsAccordion(act) {
    var list = act.artists || act.lineup || [];
    if (!list.length) return '';
    var items = list.map(function (a) {
      var name = typeof a === 'string' ? a : (a.name || '');
      var role = typeof a === 'string' ? '' : (a.role || a.style || '');
      return (
        '<li class="act-lineup-item">' +
          '<span class="act-lineup-name">' + esc(name) + '</span>' +
          (role ? '<span class="act-lineup-role">' + esc(role) + '</span>' : '') +
        '</li>'
      );
    }).join('');
    return (
      '<details class="act-lineup-accordion"' + (act.recommended ? ' open' : '') + '>' +
        '<summary class="act-lineup-summary">Featured artists <span>(' + list.length + ')</span></summary>' +
        '<ul class="act-lineup-list">' + items + '</ul>' +
      '</details>'
    );
  }

  function actCard(act, ai, si, folderId) {
    var profileHref = folderId
      ? ('artist.html?folder=' + encodeURIComponent(folderId) + '&act=' + encodeURIComponent(act.name))
      : ('#category-enquiry');
    var photo = act.image
      ? '<a class="act-card-photo" href="' + esc(profileHref) + '"><img src="' + esc(act.image) + '" alt="' + esc(act.name) + '" loading="lazy" decoding="async" onerror="this.onerror=null;this.src=\'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&amp;fit=crop&amp;w=600&amp;q=80\';" />' +
        '<div class="act-card-hover-panel"><p>' + esc(act.bio || '') + '</p></div></a>'
      : '<a class="act-card-photo act-card-photo--placeholder" href="' + esc(profileHref) + '" aria-hidden="true"><span>' + esc((act.name || '?').charAt(0)) + '</span></a>';
    var recBadge = act.recommended
      ? '<span class="act-rec-badge">Recommended</span>'
      : '';
    return (
      '<article class="act-card' + (act.image ? ' act-card--has-photo' : '') + (act.recommended ? ' act-card--recommended' : '') + '" style="--delay:' + (((si || 0) * 0.04) + (ai * 0.02)) + 's">' +
        '<div class="act-card-inner">' +
          photo +
          recBadge +
          '<span class="act-card-num">' + String(ai + 1).padStart(2, '0') + '</span>' +
          '<h4 class="act-card-name"><a href="' + esc(profileHref) + '">' + esc(act.name) + '</a></h4>' +
          '<p class="act-card-style">' + esc(act.style || '') + '</p>' +
          artistsAccordion(act) +
          '<div class="act-card-actions">' +
            '<a class="btn btn-gold btn-sm act-card-btn" href="' + esc(profileHref) + '">View profile</a>' +
            '<button type="button" class="btn-cart-add btn-cart-add--sm act-card-btn" data-cart-artist="' + esc(act.name) + '" data-cart-folder="' + esc(folderId || '') + '" data-cart-style="' + esc(act.style || '') + '" data-cart-image="' + esc(act.image || '') + '" data-cart-summary="' + esc((act.bio || act.style || '').slice(0, 160)) + '">' +
              '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 6h15l-1.5 9h-12z"/><path d="M6 6L5 3H2"/><circle cx="9" cy="20" r="1"/><circle cx="18" cy="20" r="1"/></svg>' +
              '<span>Add to multi-enquiry</span>' +
            '</button>' +
          '</div>' +
        '</div>' +
      '</article>'
    );
  }

  function bindEnquire(root) {
    if (!root) return;
    root.querySelectorAll('[data-enquire-act]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        if (window.EliteCategoryForm) {
          window.EliteCategoryForm.prefillAct(btn.getAttribute('data-enquire-act'));
        }
        var sel = document.getElementById('cat-act-select');
        if (sel) {
          sel.value = btn.getAttribute('data-enquire-act') || '';
          sel.dispatchEvent(new Event('change'));
        }
      });
    });
  }

  function wireActSelect(acts, categoryName) {
    var form = document.querySelector('form.category-enquiry-form');
    if (form) {
      form.dataset.category = categoryName || '';
      var catField = document.getElementById('cat-category');
      if (catField) catField.value = categoryName || '';
    }
    var actSelect = document.getElementById('cat-act-select');
    if (actSelect && acts) {
      actSelect.innerHTML = '<option value="">Any act in this category</option>' +
        acts.map(function (a) {
          return '<option value="' + esc(a.name) + '">' + esc(a.name) + '</option>';
        }).join('');
      actSelect.onchange = function () {
        var actField = document.getElementById('cat-act');
        if (actField) actField.value = actSelect.value;
        var actLabel = document.getElementById('cat-act-label');
        if (actLabel) {
          if (actSelect.value) {
            actLabel.hidden = false;
            actLabel.textContent = 'Enquiring about: ' + actSelect.value;
          } else {
            actLabel.hidden = true;
          }
        }
      };
    }
  }

  /* Folder icon SVGs (no emoji) */
  var FOLDER_ICONS = {
    'celebrity-bands-and-artists': '<path d="M12 2l2.2 6.6H21l-5.4 4 2.1 6.5L12 15.8 6.3 19l2.1-6.5L3 8.6h6.8L12 2z"/>',
    'party-bands': '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
    'solo-acts': '<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 5-6 8-6s6.5 2 8 6"/>',
    'duos': '<circle cx="9" cy="8" r="3"/><circle cx="15" cy="8" r="3"/><path d="M3 20c1-3 3.5-5 6-5s5 2 6 5M15 15c2 0 4 1.5 5 5"/>',
    'trios': '<circle cx="8" cy="9" r="2.5"/><circle cx="12" cy="7" r="2.5"/><circle cx="16" cy="9" r="2.5"/><path d="M4 20c.8-2.5 2.5-4 4-4s3 1.2 4 3.5c.8-2 2.2-3.5 4-3.5s3.2 1.5 4 4"/>',
    'tribute-acts': '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 5v14M17 5v14M3 9h4M3 15h4M17 9h4M17 15h4"/>',
    'production-shows': '<path d="M3 7h18v12H3z"/><path d="M8 7V5h8v2M12 11v4"/>',
    'dance-troupes-mcs': '<path d="M12 3v4M9 7h6l-1 5H10L9 7z"/><path d="M10 12l-2 9M14 12l2 9M8 16h8"/>',
    'stage-shows': '<path d="M4 20h16M6 20V10l6-4 6 4v10"/><path d="M10 20v-6h4v6"/>',
    'multicultural-entertainment': '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18"/>',
    'country': '<path d="M12 22s-7-4.5-7-11a7 7 0 0114 0c0 6.5-7 11-7 11z"/><circle cx="12" cy="11" r="2.5"/>',
    'comedians': '<circle cx="12" cy="12" r="9"/><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"/>',
    'childrens-entertainment': '<path d="M12 3l2 6h6l-5 4 2 6-5-4-5 4 2-6-5-4h6z"/>',
    'classical-entertainment': '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
    'seasonal-specialty-entertainment': '<path d="M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8"/><circle cx="12" cy="12" r="3"/>',
    'roving-entertainment': '<circle cx="12" cy="5" r="2"/><path d="M10 22l2-7 2 3 3 2M9 10l3 2 4-2"/>',
    'djs-karaoke': '<circle cx="12" cy="12" r="3"/><path d="M5 12a7 7 0 0114 0M2 12a10 10 0 0120 0"/>'
  };

  function folderIcon(id) {
    var path = FOLDER_ICONS[id] || '<rect x="4" y="4" width="16" height="16" rx="2"/>';
    return '<svg class="cat-hub-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">' + path + '</svg>';
  }

  /** Recommended acts first within a folder/section */
  function sortRecommendedFirst(acts) {
    return (acts || []).slice().sort(function (a, b) {
      var ar = a && a.recommended ? 1 : 0;
      var br = b && b.recommended ? 1 : 0;
      return br - ar;
    });
  }

  /* ── Homepage categories: equal hub cards + equal act tiles ── */
  function renderHomepageFolders() {
    var mount = document.getElementById('elite-category-cards');
    if (!mount || !window.ELITE_FOLDERS) return;

    mount.className = 'home-roster';
    mount.innerHTML = window.ELITE_FOLDERS.map(function (folder, fi) {
      var cover = folder.cover || (folder.acts[0] && folder.acts[0].image) ||
        'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=800&q=80';
      var count = folder.acts ? folder.acts.length : (folder.count || 0);
      // Recommended first; homepage tiles stay compact (no lineup accordion — full lineup on profile)
      var preview = sortRecommendedFirst(folder.acts || []).slice(0, 6);
      var tiles = preview.map(function (act, ai) {
        var profileHref = 'artist.html?folder=' + encodeURIComponent(folder.id) + '&act=' + encodeURIComponent(act.name);
        var imgSrc = act.image || cover;
        var bio = act.bio || ('Premium ' + (act.style || folder.name) + ' available Australia-wide.');
        var rec = act.recommended ? '<span class="home-act-rec">Recommended</span>' : '';
        return (
          '<article class="home-act-tile' + (act.recommended ? ' home-act-tile--rec' : '') + '" style="--i:' + ai + '">' +
            '<a class="home-act-tile-media" href="' + esc(profileHref) + '" aria-label="View ' + esc(act.name) + '">' +
              '<img src="' + esc(imgSrc) + '" alt="" loading="lazy" decoding="async" width="400" height="400" onerror="this.onerror=null;this.src=\'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&amp;fit=crop&amp;w=600&amp;q=80\'" />' +
              rec +
            '</a>' +
            '<div class="home-act-tile-meta">' +
              '<a class="home-act-tile-name" href="' + esc(profileHref) + '">' + esc(act.name) + '</a>' +
              '<span class="home-act-tile-style">' + esc(act.style || folder.name) + '</span>' +
              '<button type="button" class="btn-cart-add btn-cart-add--sm" ' +
                'data-cart-artist="' + esc(act.name) + '" ' +
                'data-cart-folder="' + esc(folder.id) + '" ' +
                'data-cart-style="' + esc(act.style || folder.name) + '" ' +
                'data-cart-image="' + esc(imgSrc) + '" ' +
                'data-cart-summary="' + esc(bio.slice(0, 160)) + '">' +
                '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 6h15l-1.5 9h-12z"/><path d="M6 6L5 3H2"/><circle cx="9" cy="20" r="1"/><circle cx="18" cy="20" r="1"/></svg>' +
                '<span>Add to multi-enquiry</span>' +
              '</button>' +
            '</div>' +
          '</article>'
        );
      }).join('');

      var more = count > preview.length
        ? '<a class="home-act-more" href="' + esc(folder.slug) + '">+' + (count - preview.length) + ' more</a>'
        : '';

      return (
        '<section class="home-folder-block" id="home-folder-' + esc(folder.id) + '" style="--fi:' + fi + '">' +
          '<div class="home-folder-head">' +
            '<div class="home-folder-head-left">' +
              '<div class="home-folder-cover-wrap">' +
                '<img class="home-folder-cover" src="' + esc(cover) + '" alt="" loading="lazy" width="120" height="120" onerror="this.onerror=null;this.src=\'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&amp;fit=crop&amp;w=400&amp;q=80\'" />' +
                '<span class="home-folder-icon-badge">' + folderIcon(folder.id) + '</span>' +
              '</div>' +
              '<div class="home-folder-head-text">' +
                '<span class="home-folder-eyebrow">' + count + ' acts</span>' +
                '<h3 class="home-folder-title">' + esc(folder.name) + '</h3>' +
                '<p class="home-folder-short">' + esc(folder.short || '') + '</p>' +
              '</div>' +
            '</div>' +
            '<a class="btn btn-outline btn-sm home-folder-link" href="' + esc(folder.slug) + '">Open full roster</a>' +
          '</div>' +
          '<div class="home-act-grid" role="list">' + tiles + more + '</div>' +
        '</section>'
      );
    }).join('');
  }

  /* ── folder.html?id=... ── */
  function renderFolderPage() {
    var root = document.getElementById('folder-page-root');
    if (!root || !window.ELITE_FOLDER_MAP) return;

    var params = new URLSearchParams(window.location.search);
    var id = params.get('id') || '';
    var folder = window.ELITE_FOLDER_MAP[id];

    if (!folder) {
      // fallback to first folder
      folder = (window.ELITE_FOLDERS && window.ELITE_FOLDERS[0]) || null;
      if (!folder) return;
      id = folder.id;
    }

    document.title = folder.name + ' | Elite Entertainment & Events';
    var descMeta = document.querySelector('meta[name="description"]');
    if (descMeta) descMeta.setAttribute('content', folder.short + ' Enquire with Elite Entertainment Australia.');

    var heroImg = document.getElementById('folder-hero-img');
    if (heroImg) {
      heroImg.src = folder.cover || 'images/brand/logo-icon.png';
      heroImg.alt = folder.name;
    }
    var t = document.getElementById('folder-title');
    if (t) t.textContent = folder.name;
    var d = document.getElementById('folder-desc');
    if (d) d.textContent = folder.short;
    var c = document.getElementById('folder-count');
    if (c) c.textContent = folder.count + ' acts · ' + folder.acts.filter(function (a) { return a.image; }).length + ' with photos';
    var rt = document.getElementById('folder-roster-title');
    if (rt) rt.textContent = folder.name;

    // chips for all folders
    var chips = document.getElementById('folder-nav-chips');
    if (chips && window.ELITE_FOLDERS) {
      chips.innerHTML = window.ELITE_FOLDERS.map(function (f) {
        var active = f.id === id ? ' is-active' : '';
        return '<a class="folder-chip' + active + '" href="folder.html?id=' + encodeURIComponent(f.id) + '">' + esc(f.name) + '</a>';
      }).join('');
    }

    var orderedActs = sortRecommendedFirst(folder.acts);
    var grid = document.getElementById('folder-act-grid');
    if (grid) {
      grid.innerHTML = orderedActs.map(function (act, ai) {
        return actCard(act, ai, 0, folder.id);
      }).join('');
      bindEnquire(grid);
    }

    wireActSelect(orderedActs, folder.name);

    // deep-link ?act=
    try {
      var act = params.get('act');
      if (act && window.EliteCategoryForm) {
        setTimeout(function () {
          window.EliteCategoryForm.prefillAct(act);
          var sel = document.getElementById('cat-act-select');
          if (sel) {
            sel.value = act;
            sel.dispatchEvent(new Event('change'));
          }
        }, 150);
      }
    } catch (e) {}
  }

  /* ── Legacy mega category pages ── */
  function renderCategoryPage() {
    var root = document.getElementById('category-page-root');
    if (!root || !window.ELITE_CATEGORIES) return;
    var key = root.dataset.categoryKey;
    var cat = window.ELITE_CATEGORIES[key];
    if (!cat) return;

    document.querySelectorAll('[data-cat-title]').forEach(function (el) { el.textContent = cat.title; });
    document.querySelectorAll('[data-cat-desc]').forEach(function (el) { el.textContent = cat.description; });
    document.querySelectorAll('[data-cat-eyebrow]').forEach(function (el) { el.textContent = cat.eyebrow; });

    var count = 0;
    cat.sections.forEach(function (s) { count += s.acts.length; });
    document.querySelectorAll('[data-cat-count]').forEach(function (el) {
      el.textContent = count + ' acts on this roster';
    });

    var heroImg = document.getElementById('cat-hero-img');
    if (heroImg) {
      heroImg.src = cat.image || 'images/brand/logo-icon.png';
      heroImg.alt = cat.title;
    }

    // Show linked folder chips
    var sheet = document.getElementById('cat-sheet-preview');
    if (sheet && cat.folderIds && window.ELITE_FOLDER_MAP) {
      sheet.innerHTML =
        '<div class="cat-sheet-header">' +
          '<div class="section-eyebrow">Browse by folder</div>' +
          '<h2 class="section-title" style="font-size:clamp(1.4rem,3vw,1.9rem);">Open a roster folder</h2>' +
          '<div class="gold-divider"></div>' +
        '</div>' +
        '<div class="folder-nav-chips" style="margin-bottom:2rem;">' +
          cat.folderIds.map(function (fid) {
            var f = window.ELITE_FOLDER_MAP[fid];
            if (!f) return '';
            return '<a class="folder-chip" href="' + esc(f.slug) + '">' + esc(f.name) + ' (' + f.count + ')</a>';
          }).join('') +
        '</div>';
    }

    var roster = document.getElementById('cat-roster');
    if (roster) {
      roster.innerHTML = cat.sections.map(function (section, si) {
        var ordered = sortRecommendedFirst(section.acts);
        var cards = ordered.map(function (act, ai) {
          return actCard(act, ai, si, key);
        }).join('');
        return (
          '<div class="act-section" id="section-' + si + '">' +
            '<div class="act-section-head">' +
              '<div class="act-section-banner">' + esc(section.name) + '</div>' +
              '<span class="act-section-meta">' + ordered.length + ' acts</span>' +
            '</div>' +
            '<div class="act-grid">' + cards + '</div>' +
          '</div>'
        );
      }).join('');
      bindEnquire(roster);
    }

    var allActs = [];
    cat.sections.forEach(function (s) { allActs = allActs.concat(sortRecommendedFirst(s.acts)); });
    wireActSelect(allActs, cat.title);
  }

  document.addEventListener('click', function (e) {
    var btn = e.target && e.target.closest ? e.target.closest('[data-cart-artist]') : null;
    if (!btn || !window.EliteCart) return;
    e.preventDefault();
    var name = btn.getAttribute('data-cart-artist') || '';
    var folder = btn.getAttribute('data-cart-folder') || '';
    var style = btn.getAttribute('data-cart-style') || '';
    var image = btn.getAttribute('data-cart-image') || '';
    var summary = btn.getAttribute('data-cart-summary') || style || '';
    window.EliteCart.add({
      kind: 'artist',
      id: name,
      name: name,
      meta: style || folder,
      summary: summary,
      qty: 1,
      image: image,
      href: folder
        ? ('artist.html?folder=' + encodeURIComponent(folder) + '&act=' + encodeURIComponent(name))
        : 'index.html#categories'
    });
  });

  document.addEventListener('DOMContentLoaded', function () {
    renderHomepageFolders();
    renderFolderPage();
    renderCategoryPage();
  });
})();
