/* Renders category roster + homepage cards — full sheet first, every act listed */
(function () {
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function actCount(cat) {
    return cat.sections.reduce(function (n, s) { return n + s.acts.length; }, 0);
  }

  function renderHomepageCards() {
    const mount = document.getElementById('elite-category-cards');
    if (!mount || !window.ELITE_CATEGORY_LIST) return;

    mount.innerHTML = window.ELITE_CATEGORY_LIST.map(function (cat, i) {
      var count = actCount(cat);
      var sectionLabels = cat.sections.map(function (s) { return s.name; }).join(' · ');
      return (
        '<a class="cat-card cat-card--' + (i + 1) + '" href="' + esc(cat.slug) + '" aria-label="' + esc(cat.title) + ' — ' + count + ' acts">' +
          '<div class="cat-card-media">' +
            '<img src="' + esc(cat.image) + '" alt="' + esc(cat.title) + ' full roster sheet" loading="lazy" />' +
            '<div class="cat-card-shine" aria-hidden="true"></div>' +
            '<div class="cat-card-overlay"></div>' +
            '<span class="cat-card-count">' + count + ' acts</span>' +
          '</div>' +
          '<div class="cat-card-body">' +
            '<span class="cat-card-eyebrow">' + esc(cat.eyebrow) + '</span>' +
            '<h3 class="cat-card-title">' + esc(cat.title) + '</h3>' +
            '<p class="cat-card-text">' + esc(cat.short) + '</p>' +
            '<p class="cat-card-sections">' + esc(sectionLabels) + '</p>' +
            '<span class="cat-card-cta">View full roster <span aria-hidden="true">→</span></span>' +
          '</div>' +
        '</a>'
      );
    }).join('');
  }

  function bindEnquire(root) {
    root.querySelectorAll('[data-enquire-act]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        if (window.EliteCategoryForm) {
          window.EliteCategoryForm.prefillAct(btn.getAttribute('data-enquire-act'));
        }
      });
    });
  }

  function renderCategoryPage() {
    const root = document.getElementById('category-page-root');
    if (!root || !window.ELITE_CATEGORIES) return;
    const key = root.dataset.categoryKey;
    const cat = window.ELITE_CATEGORIES[key];
    if (!cat) return;

    document.querySelectorAll('[data-cat-title]').forEach(function (el) {
      el.textContent = cat.title;
    });
    document.querySelectorAll('[data-cat-desc]').forEach(function (el) {
      el.textContent = cat.description;
    });
    document.querySelectorAll('[data-cat-eyebrow]').forEach(function (el) {
      el.textContent = cat.eyebrow;
    });

    var count = actCount(cat);
    document.querySelectorAll('[data-cat-count]').forEach(function (el) {
      el.textContent = count + ' acts on this roster';
    });

    const heroImg = document.getElementById('cat-hero-img');
    if (heroImg) {
      heroImg.src = cat.image;
      heroImg.alt = cat.title + ' entertainment roster sheet';
    }

    // Official sheet FIRST so every face/name from the PNG is visible
    const sheet = document.getElementById('cat-sheet-preview');
    if (sheet) {
      sheet.innerHTML =
        '<div class="cat-sheet-header">' +
          '<div class="section-eyebrow">Official Category Sheet</div>' +
          '<h2 class="section-title" style="font-size:clamp(1.5rem,3vw,2rem);">Every act from the original roster</h2>' +
          '<div class="gold-divider"></div>' +
          '<p class="cat-sheet-note">This is the full printed sheet — all names below match it exactly (' + count + ' acts).</p>' +
        '</div>' +
        '<figure class="cat-sheet cat-sheet--primary">' +
          '<img src="' + esc(cat.image) + '" alt="' + esc(cat.title) + ' — complete original roster sheet" />' +
          '<figcaption>' + esc(cat.eyebrow) + ' · Zoom or scroll on mobile to read every name</figcaption>' +
        '</figure>';
    }

    const roster = document.getElementById('cat-roster');
    if (roster) {
      roster.innerHTML = cat.sections.map(function (section, si) {
        const cards = section.acts.map(function (act, ai) {
          return (
            '<article class="act-card" style="--delay:' + ((si * 0.04) + (ai * 0.02)) + 's">' +
              '<div class="act-card-inner">' +
                '<span class="act-card-num">' + String(ai + 1).padStart(2, '0') + '</span>' +
                '<h4 class="act-card-name">' + esc(act.name) + '</h4>' +
                '<p class="act-card-style">' + esc(act.style) + '</p>' +
                '<button type="button" class="btn btn-gold btn-sm act-card-btn" data-enquire-act="' + esc(act.name) + '">Enquire about ' + esc(act.name.split(' ')[0]) + '</button>' +
              '</div>' +
            '</article>'
          );
        }).join('');
        return (
          '<div class="act-section" id="section-' + si + '">' +
            '<div class="act-section-head">' +
              '<div class="act-section-banner">' + esc(section.name) + '</div>' +
              '<span class="act-section-meta">' + section.acts.length + ' act' + (section.acts.length === 1 ? '' : 's') + '</span>' +
            '</div>' +
            '<div class="act-grid">' + cards + '</div>' +
          '</div>'
        );
      }).join('');

      bindEnquire(roster);
    }

    const form = document.querySelector('form.category-enquiry-form');
    if (form) {
      form.dataset.category = cat.title;
      const catField = document.getElementById('cat-category');
      if (catField) catField.value = cat.title;

      // Populate act select if present
      const actSelect = document.getElementById('cat-act-select');
      if (actSelect) {
        actSelect.innerHTML = '<option value="">Any act in this category</option>' +
          cat.sections.map(function (section) {
            return '<optgroup label="' + esc(section.name) + '">' +
              section.acts.map(function (a) {
                return '<option value="' + esc(a.name) + '">' + esc(a.name) + '</option>';
              }).join('') +
              '</optgroup>';
          }).join('');
        actSelect.addEventListener('change', function () {
          const actField = document.getElementById('cat-act');
          if (actField) actField.value = actSelect.value;
          const actLabel = document.getElementById('cat-act-label');
          if (actLabel) {
            if (actSelect.value) {
              actLabel.hidden = false;
              actLabel.textContent = 'Enquiring about: ' + actSelect.value;
            } else {
              actLabel.hidden = true;
            }
          }
        });
      }
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    renderHomepageCards();
    renderCategoryPage();

    // Deep-link ?act=Name from search
    try {
      const params = new URLSearchParams(window.location.search);
      const act = params.get('act');
      if (act && window.EliteCategoryForm) {
        setTimeout(function () {
          window.EliteCategoryForm.prefillAct(act);
          const sel = document.getElementById('cat-act-select');
          if (sel) {
            sel.value = act;
            sel.dispatchEvent(new Event('change'));
          }
        }, 200);
      }
    } catch (e) {}
  });
})();

