/* Artist profile page — bio, image, share FB / Email / Copy URL */
(function () {
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function findAct(folderId, actName) {
    if (!window.ELITE_FOLDERS) return null;
    var folder = null;
    if (folderId && window.ELITE_FOLDER_MAP) folder = window.ELITE_FOLDER_MAP[folderId];
    if (!folder) {
      for (var i = 0; i < window.ELITE_FOLDERS.length; i++) {
        var hit = window.ELITE_FOLDERS[i].acts.find(function (a) {
          return a.name.toLowerCase() === (actName || '').toLowerCase();
        });
        if (hit) return { folder: window.ELITE_FOLDERS[i], act: hit };
      }
      return null;
    }
    var act = folder.acts.find(function (a) {
      return a.name.toLowerCase() === (actName || '').toLowerCase();
    });
    if (!act) act = folder.acts[0];
    return { folder: folder, act: act };
  }

  function themedFallback(style, name) {
    var s = ((style || '') + ' ' + (name || '')).toLowerCase();
    if (/dj|karaoke|crowd/.test(s)) return 'https://images.unsplash.com/photo-1571266028243-e4733b0f0bb1?auto=format&fit=crop&w=900&q=80';
    if (/comedy|comedian/.test(s)) return 'https://images.unsplash.com/photo-1527224857830-43a7acc85260?auto=format&fit=crop&w=900&q=80';
    if (/country/.test(s)) return 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=900&q=80';
    if (/classical|string|opera|piano|violin/.test(s)) return 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&w=900&q=80';
    if (/dance|troupe|mc|host/.test(s)) return 'https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&w=900&q=80';
    if (/tribute|stage|production|show/.test(s)) return 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=900&q=80';
    if (/kids|children|smurf|wiggle|magic/.test(s)) return 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=900&q=80';
    if (/yacht|car|luxury|security/.test(s)) return 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=80';
    if (/duo|solo|trio|acoustic/.test(s)) return 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=900&q=80';
    if (/band|party|funk|soul/.test(s)) return 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=900&q=80';
    if (/multicultural|latin|greek|chinese|thai|belly|lion/.test(s)) return 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=900&q=80';
    if (/roving|stilt|juggler|magician/.test(s)) return 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=900&q=80';
    return 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=900&q=80';
  }

  document.addEventListener('DOMContentLoaded', function () {
    var params = new URLSearchParams(window.location.search);
    var folderId = params.get('folder') || '';
    var actName = params.get('act') || '';
    var found = findAct(folderId, actName);

    if (!found) {
      document.getElementById('artist-name').textContent = 'Artist not found';
      document.getElementById('artist-bio').textContent = 'Please return to categories and choose an act.';
      return;
    }

    var folder = found.folder;
    var act = found.act;
    if (window.EliteMedia && typeof window.EliteMedia.enrichAct === 'function') {
      window.EliteMedia.enrichAct(act, folder);
    }
    var photo = act.image || themedFallback(act.style, act.name);
    var bio = act.bio || (act.name + ' is available through Elite Entertainment & Events for weddings, corporate galas, festivals and private events across Australia. Contact us for packages, technical riders and availability.');
    var fullBio = bio + ' Book ' + act.name + ' via Elite Entertainment for professional delivery, fully insured performers, and nationwide coordination from Sydney, Melbourne, Brisbane and the Gold Coast.';

    document.title = act.name + ' | ' + folder.name + ' | Elite Entertainment';
    document.getElementById('artist-name').textContent = act.name;
    document.getElementById('artist-category').textContent = folder.name;
    document.getElementById('artist-style').textContent = act.style || folder.name;
    document.getElementById('artist-bio').textContent = fullBio;

    // Website + YouTube preview (e.g. FABBA)
    (function wireMedia() {
      var content = document.querySelector('.artist-profile-content');
      if (!content) return;
      if (act.website && !document.getElementById('artist-website-link')) {
        var site = document.createElement('p');
        site.className = 'artist-website-line';
        site.innerHTML = 'Official site: <a id="artist-website-link" href="' + esc(act.website) + '" target="_blank" rel="noopener noreferrer">' +
          esc(act.website.replace(/^https?:\/\//, '').replace(/\/$/, '')) + '</a>';
        var bioEl = document.getElementById('artist-bio');
        if (bioEl && bioEl.parentNode) bioEl.parentNode.insertBefore(site, bioEl.nextSibling);
        else content.appendChild(site);
      }
      if (act.youtubeUrl && !document.getElementById('artist-yt-wrap')) {
        var id = '';
        if (window.EliteMedia && window.EliteMedia.youtubeId) {
          id = window.EliteMedia.youtubeId(act.youtubeUrl);
        } else {
          var match = String(act.youtubeUrl).match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|shorts\/|live\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
          id = match ? match[1] : '';
        }
        if (id) {
          var wrap = document.createElement('div');
          wrap.id = 'artist-yt-wrap';
          wrap.className = 'artist-yt-wrap';
          wrap.innerHTML =
            '<p class="artist-yt-label">Live performance</p>' +
            '<div class="artist-yt-frame">' +
            '<iframe src="https://www.youtube-nocookie.com/embed/' + id + '?rel=0&modestbranding=1" ' +
            'title="' + esc(act.name) + ' live performance" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" ' +
            'allowfullscreen loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe>' +
            '</div>';
          var media = document.querySelector('.artist-profile-media');
          if (media) media.appendChild(wrap);
          else content.appendChild(wrap);
        }
      }

      var gallery = act.gallery || act.images || [];
      if (gallery.length && !document.getElementById('artist-gallery')) {
        var gal = document.createElement('div');
        gal.id = 'artist-gallery';
        gal.className = 'artist-gallery';
        gal.innerHTML =
          '<p class="artist-yt-label">Gallery</p>' +
          '<div class="artist-gallery-grid">' +
          gallery.map(function (src, i) {
            return '<button type="button" class="artist-gallery-item" data-gallery-src="' + esc(src) + '" aria-label="View image ' + (i + 1) + '">' +
              '<img src="' + esc(src) + '" alt="' + esc(act.name) + ' photo ' + (i + 1) + '" loading="lazy" decoding="async" />' +
              '</button>';
          }).join('') +
          '</div>';
        var mediaHost = document.querySelector('.artist-profile-media');
        if (mediaHost) mediaHost.appendChild(gal);
        else content.appendChild(gal);

        gal.addEventListener('click', function (e) {
          var btn = e.target.closest('[data-gallery-src]');
          if (!btn) return;
          var src = btn.getAttribute('data-gallery-src');
          var photoEl = document.getElementById('artist-photo');
          if (photoEl && src) {
            photoEl.src = src;
            photoEl.alt = act.name;
          }
        });
      }
    })();

    // Featured artists accordion (e.g. Viva Italia lineup)
    (function wireLineup() {
      var list = act.artists || act.lineup || [];
      if (!list.length) return;
      if (document.getElementById('artist-lineup')) return;
      var wrap = document.createElement('div');
      wrap.id = 'artist-lineup';
      wrap.className = 'artist-lineup-block';
      wrap.innerHTML =
        '<details class="act-lineup-accordion artist-lineup-accordion" open>' +
        '<summary class="act-lineup-summary">Featured artists <span>(' + list.length + ')</span></summary>' +
        '<ul class="act-lineup-list">' +
        list.map(function (a) {
          var name = typeof a === 'string' ? a : (a.name || '');
          var role = typeof a === 'string' ? '' : (a.role || a.style || '');
          return '<li class="act-lineup-item"><span class="act-lineup-name">' + esc(name) + '</span>' +
            (role ? '<span class="act-lineup-role">' + esc(role) + '</span>' : '') + '</li>';
        }).join('') +
        '</ul>' +
        '</details>';
      var bioEl = document.getElementById('artist-bio');
      if (bioEl && bioEl.parentNode) bioEl.parentNode.insertBefore(wrap, bioEl.nextSibling);
    })();

    // Multi-enquiry cart button (same style as home / category cards)
    (function wireCart() {
      if (!window.EliteCart) return;
      var host = document.querySelector('.artist-share, .artist-actions, .detail-content .container') || document.body;
      if (document.getElementById('artist-add-cart')) return;
      var b = document.createElement('button');
      b.type = 'button';
      b.id = 'artist-add-cart';
      b.className = 'btn-cart-add artist-profile-cart-btn';
      b.setAttribute('aria-label', 'Add to multi-enquiry');
      b.innerHTML =
        '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">' +
        '<path d="M6 6h15l-1.5 9h-12z"/><path d="M6 6L5 3H2"/><circle cx="9" cy="20" r="1"/><circle cx="18" cy="20" r="1"/>' +
        '</svg><span>Add to multi-enquiry</span>';
      b.addEventListener('click', function () {
        window.EliteCart.add({
          kind: 'artist',
          id: act.name,
          name: act.name,
          meta: act.style || folder.name,
          summary: (act.bio || act.style || folder.name || '').slice(0, 200),
          qty: 1,
          image: photo,
          href: window.location.pathname + window.location.search
        });
        b.classList.add('is-on');
        var span = b.querySelector('span');
        if (span) span.textContent = 'In multi-enquiry';
      });
      var bio = document.getElementById('artist-bio');
      if (bio && bio.parentNode) bio.parentNode.appendChild(b);
      else host.appendChild(b);
    })();

    var img = document.getElementById('artist-photo');
    img.src = photo;
    img.alt = act.name;
    img.onerror = function () {
      img.onerror = null;
      img.src = themedFallback(act.style, act.name);
    };

    var profileUrl = window.location.href.split('#')[0];
    // Prefer clean absolute URL
    if (profileUrl.indexOf('http') !== 0) {
      profileUrl = 'https://elite-entertain-events.web.app/artist.html?folder=' +
        encodeURIComponent(folder.id) + '&act=' + encodeURIComponent(act.name);
    }

    // OG tags
    var ogTitle = document.getElementById('og-title');
    var ogDesc = document.getElementById('og-desc');
    var ogImage = document.getElementById('og-image');
    var ogUrl = document.getElementById('og-url');
    if (ogTitle) ogTitle.setAttribute('content', act.name + ' — Elite Entertainment');
    if (ogDesc) ogDesc.setAttribute('content', bio);
    if (ogImage) ogImage.setAttribute('content', photo.indexOf('http') === 0 ? photo : ('https://elite-entertain-events.web.app/' + photo));
    if (ogUrl) ogUrl.setAttribute('content', profileUrl);

    // Share links
    var fb = document.getElementById('share-facebook');
    if (fb) {
      fb.href = 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(profileUrl);
    }
    var em = document.getElementById('share-email');
    if (em) {
      var subject = encodeURIComponent('Check out ' + act.name + ' — Elite Entertainment');
      var body = encodeURIComponent(
        'I thought you might like this act:\n\n' +
        act.name + ' (' + (act.style || folder.name) + ')\n\n' +
        bio + '\n\n' +
        'View profile & book:\n' + profileUrl + '\n\n' +
        'Elite Entertainment & Events\ninfo@eeevents.com.au · +61 417 221 111'
      );
      em.href = 'mailto:?subject=' + subject + '&body=' + body;
    }
    var copyBtn = document.getElementById('share-copy');
    var copyLabel = document.getElementById('share-copy-label');
    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        var done = function () {
          if (copyLabel) copyLabel.textContent = 'Copied!';
          setTimeout(function () {
            if (copyLabel) copyLabel.textContent = 'Copy URL';
          }, 1800);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(profileUrl).then(done).catch(function () {
            window.prompt('Copy this profile URL:', profileUrl);
            done();
          });
        } else {
          window.prompt('Copy this profile URL:', profileUrl);
          done();
        }
      });
    }

    // Back to folder
    var back = document.getElementById('artist-back-folder');
    if (back) back.href = folder.slug || ('folder.html?id=' + folder.id);

    // Prefill enquiry form
    var form = document.querySelector('form.category-enquiry-form');
    if (form) {
      form.dataset.category = folder.name;
      var cat = document.getElementById('cat-category');
      var actField = document.getElementById('cat-act');
      var actLabel = document.getElementById('cat-act-label');
      if (cat) cat.value = folder.name;
      if (actField) actField.value = act.name;
      if (actLabel) {
        actLabel.hidden = false;
        actLabel.textContent = 'Enquiring about: ' + act.name;
      }
    }
  });
})();
