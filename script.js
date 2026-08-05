/* ═══════════════════════════════════════════════════
   ELITE ENTERTAINMENT — JavaScript
═══════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', function () {
  try {

    /* Intro animation removed — page loads immediately */

    /* ─── CARD LOOP VIDEOS (services + premium add-ons) ─── */
    (function initCardLoopVideos() {
      const videos = Array.from(document.querySelectorAll('.card-loop-video'));
      if (!videos.length) return;

      const forcePlay = (v) => {
        try {
          v.muted = true;
          v.defaultMuted = true;
          v.playsInline = true;
          v.setAttribute('muted', '');
          v.setAttribute('playsinline', '');
          const p = v.play();
          if (p && typeof p.catch === 'function') p.catch(function () { });
        } catch (e) { }
      };

      videos.forEach(forcePlay);

      if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            const v = entry.target;
            if (entry.isIntersecting) forcePlay(v);
            else {
              try { v.pause(); } catch (e) { }
            }
          });
        }, { rootMargin: '80px', threshold: 0.15 });
        videos.forEach(function (v) { io.observe(v); });
      }

      document.addEventListener('visibilitychange', function () {
        if (!document.hidden) videos.forEach(forcePlay);
      });
    })();

    /* ─── HERO SEARCH (artists / folders / hire) ─── */
    const searchBtn = document.getElementById('hero-search-btn');
    const searchInput = document.getElementById('hero-search-input');
    const genreSelect = document.getElementById('hero-genre-select');
    const artistInput = document.getElementById('hero-artist-input'); // optional legacy field

    /** Filter homepage roster tiles by keyword and scroll to matches */
    const executeSearch = (queryKeyword = '') => {
      const q = String(queryKeyword || '').toLowerCase().trim();
      const folders = document.querySelectorAll('.home-folder-block');
      let anyFolder = false;

      folders.forEach((block) => {
        const tiles = block.querySelectorAll('.home-act-tile');
        let visibleInFolder = 0;
        tiles.forEach((tile) => {
          const text = (tile.textContent || '').toLowerCase();
          const show = !q || text.includes(q);
          tile.style.display = show ? '' : 'none';
          if (show) visibleInFolder++;
        });
        const more = block.querySelector('.home-act-more');
        if (more) more.style.display = q ? 'none' : '';
        const showFolder = !q || visibleInFolder > 0 || (block.textContent || '').toLowerCase().includes(q);
        block.style.display = showFolder ? '' : 'none';
        if (showFolder) anyFolder = true;
      });

      // Soft-highlight matching service / offer cards without hiding the page
      document.querySelectorAll('.service-card, .offer-card').forEach((card) => {
        const text = (card.textContent || '').toLowerCase();
        const hit = q && text.includes(q);
        card.style.borderColor = hit ? 'var(--gold)' : '';
        card.style.boxShadow = hit ? 'var(--shadow-gold)' : '';
      });

      if (q) {
        try {
          const cats = document.getElementById('categories');
          if (cats && anyFolder) cats.scrollIntoView({ behavior: 'smooth', block: 'start' });
          else if (document.getElementById('services')) {
            document.getElementById('services').scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        } catch (err) { /* ignore */ }
      }
    };

    window.filterByTag = function (tag) {
      const routes = {
        weddings: 'weddings.html',
        bands: 'folder.html?id=party-bands',
        tributes: 'folder.html?id=tribute-acts',
        djs: 'folder.html?id=djs-karaoke',
        solo: 'folder.html?id=solo-acts',
        jazz: 'folder.html?id=classical-entertainment',
        corporate: 'corporate.html',
        car: 'luxury-car-hire.html',
        yacht: 'luxury-yacht-hire.html',
        security: 'security.html'
      };
      if (routes[tag]) {
        window.location.href = routes[tag];
        return;
      }
      executeSearch(tag);
    };

    /* ─── STICKY HEADER ─── */
    const header = document.getElementById('site-header');
    if (header) {
      window.addEventListener('scroll', () => {
        if (window.scrollY > 60) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
      }, { passive: true });
    }

    /* ─── MOBILE NAV — handled solely by site-nav.js (EliteNav) ─── */
    // Do not bind a second hamburger listener here; double-toggle was closing the drawer instantly.

    /* ─── BACK TO TOP ─── */
    const backToTop = document.getElementById('back-to-top');
    if (backToTop) {
      window.addEventListener('scroll', () => {
        if (window.scrollY > 400) {
          backToTop.classList.add('visible');
        } else {
          backToTop.classList.remove('visible');
        }
      }, { passive: true });
      backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    /* ─── HERO YOUTUBE BACKGROUND (always muted, no audio/music) ─── */
    (function initHeroYoutubeBg() {
      const iframe = document.getElementById('hero-yt-iframe');
      if (!iframe) return;
      // Reinforce mute via YouTube IFrame API postMessage (autoplay policies + no sound)
      function postMute() {
        try {
          const win = iframe.contentWindow;
          if (!win) return;
          win.postMessage(JSON.stringify({ event: 'command', func: 'mute', args: [] }), '*');
          win.postMessage(JSON.stringify({ event: 'command', func: 'setVolume', args: [0] }), '*');
          win.postMessage(JSON.stringify({ event: 'command', func: 'playVideo', args: [] }), '*');
        } catch (e) { }
      }
      iframe.addEventListener('load', function () {
        postMute();
        setTimeout(postMute, 800);
        setTimeout(postMute, 2500);
      });
      // Re-mute if user returns to tab (some browsers resume audio on focus)
      document.addEventListener('visibilitychange', function () {
        if (!document.hidden) postMute();
      });
    })();

    /* ─── HERO MULTI-EVENT VIDEO REEL (legacy mp4 slides — no-op if none) ─── */
    (function initHeroVideoReel() {
      const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
      const photoShow = document.getElementById('hero-photo-slideshow');
      if (!slides.length) return;

      let idx = 0;
      let rotating = false;
      let videoWorking = false;

      function forceMute(v) {
        v.muted = true;
        v.defaultMuted = true;
        v.setAttribute('muted', '');
        v.playsInline = true;
        v.setAttribute('playsinline', '');
        v.setAttribute('webkit-playsinline', '');
      }

      function showPhotoFallback() {
        if (!photoShow) return;
        photoShow.hidden = false;
        slides.forEach(v => {
          v.classList.remove('is-active');
          try { v.pause(); } catch (e) { }
        });
        const photos = photoShow.querySelectorAll('.hero-photo-slide');
        if (!photos.length) return;
        let pi = 0;
        photos.forEach(p => p.classList.remove('is-active'));
        photos[0].classList.add('is-active');
        setInterval(() => {
          photos[pi].classList.remove('is-active');
          pi = (pi + 1) % photos.length;
          photos[pi].classList.add('is-active');
        }, 4500);
      }

      function activate(i) {
        slides.forEach((v, n) => {
          forceMute(v);
          if (n === i) {
            v.classList.add('is-active');
            const p = v.play();
            if (p && typeof p.catch === 'function') {
              p.catch(() => { });
            }
          } else {
            v.classList.remove('is-active');
            try { v.pause(); v.currentTime = 0; } catch (e) { }
          }
        });
      }

      function startRotation() {
        if (rotating) return;
        rotating = true;
        videoWorking = true;
        activate(0);
        setInterval(() => {
          idx = (idx + 1) % slides.length;
          activate(idx);
        }, 8000);
      }

      slides.forEach(forceMute);

      // Preload all sources
      slides.forEach(v => { try { v.load(); } catch (e) { } });

      const first = slides[0];
      const tryStart = () => {
        forceMute(first);
        first.classList.add('is-active');
        const p = first.play();
        if (p && typeof p.then === 'function') {
          p.then(startRotation).catch(() => {
            // User-gesture retry
            const unlock = () => {
              forceMute(first);
              first.play().then(startRotation).catch(showPhotoFallback);
            };
            ['click', 'touchstart', 'keydown', 'scroll'].forEach(evt => {
              window.addEventListener(evt, unlock, { once: true, passive: true });
            });
            // If still blocked after a moment, photo slideshow
            setTimeout(() => {
              if (!videoWorking) showPhotoFallback();
            }, 3000);
          });
        } else {
          startRotation();
        }
      };

      if (first.readyState >= 2) tryStart();
      else {
        first.addEventListener('canplay', tryStart, { once: true });
        first.addEventListener('loadeddata', tryStart, { once: true });
        setTimeout(tryStart, 600);
      }

      document.addEventListener('visibilitychange', () => {
        if (!document.hidden && videoWorking) activate(idx);
      });
    })();

    /* ─── SCROLL REVEAL ─── */
    const revealEls = document.querySelectorAll(
      '.service-card, .artist-card, .quick-item, .hire-item, ' +
      '.testimonial-card, .client-logo, .hero-stats, .legacy-content, ' +
      '.contact-left, .quote-form, .footer-col, .footer-brand'
    );

    revealEls.forEach((el, i) => {
      el.classList.add('reveal');
      el.style.transitionDelay = `${(i % 6) * 0.07}s`;
    });

    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(el => revealObserver.observe(el));
    /* ─── FORM SUBMIT (wired to Admin CRM / elite_inquiries) ─── */
    const form = document.getElementById('quote-form');
    if (form) {
      if (window.EliteMail) {
        try { window.EliteMail.bindFileStatus('form-attachments'); } catch (e) { }
      }
      form.addEventListener('submit', function (e) {
        e.preventDefault();

        const nameEl = document.getElementById('form-name');
        const emailEl = document.getElementById('form-email');
        const phoneEl = document.getElementById('form-phone');
        const dateEl = document.getElementById('form-date');
        const serviceEl = document.getElementById('form-service');
        const messageEl = document.getElementById('form-message');
        const artistEl = document.getElementById('form-artist-type');
        const attachEl = document.getElementById('form-attachments');

        const name = nameEl ? nameEl.value.trim() : '';
        const email = emailEl ? emailEl.value.trim() : '';
        const phone = phoneEl ? phoneEl.value.trim() : '';
        const date = dateEl ? dateEl.value : '';
        const service = serviceEl ? serviceEl.value : '';
        const artistType = artistEl ? artistEl.value : '';
        const message = messageEl ? messageEl.value.trim() : '';
        const files = window.EliteMail ? window.EliteMail.collectFiles(attachEl) : [];

        if (!name || !email || !service) {
          alert('Please complete name, email, and event type.');
          return;
        }

        if (window.EliteMail && files.length) {
          const check = window.EliteMail.validateFiles(files);
          if (!check.ok) {
            alert(check.error);
            return;
          }
        }

        const btn = form.querySelector('button[type="submit"]');
        const originalText = btn ? btn.textContent : 'Send Enquiry';

        if (btn) {
          btn.textContent = files.length ? 'Uploading files…' : 'Sending…';
          btn.disabled = true;
        }

        // Email full team via EliteMail (FormSubmit + CC list + attachments)
        (async () => {
          try {
            const leadId = 'INQ-' + Date.now().toString().slice(-5);
            var attachmentRecords = [];
            if (window.EliteAttachments && EliteAttachments.filesToAttachments) {
              attachmentRecords = await EliteAttachments.filesToAttachments(files, { leadId: leadId });
            } else if (window.EliteMail && window.EliteMail.filesToAttachments) {
              attachmentRecords = await window.EliteMail.filesToAttachments(files, { leadId: leadId });
            } else {
              attachmentRecords = files.map(function (f, i) {
                return {
                  id: 'A-' + Date.now().toString(36) + '-' + i,
                  name: f.name,
                  type: f.type || 'file',
                  size: f.size || 0,
                  at: new Date().toLocaleString(),
                  emailed: true,
                  dataUrl: '',
                  url: ''
                };
              });
            }

            const newInquiry = {
              id: leadId,
              name,
              email,
              phone,
              date,
              service: artistType ? (service + ' · ' + artistType) : service,
              message: message + (attachmentRecords.length
                ? '\nAttachments: ' + attachmentRecords.map(function (a) { return a.name; }).join(', ')
                : ''),
              status: 'New Enquiry',
              kanbanColumn: 'new',
              timestamp: new Date().toLocaleString(),
              attachmentNames: attachmentRecords.map(function (a) { return a.name; }),
              attachmentCount: attachmentRecords.length,
              attachments: attachmentRecords,
              notes: [],
              order: Date.now()
            };

            try {
              if (window.EliteCRMPush && EliteCRMPush.ingest) EliteCRMPush.ingest(newInquiry);
              else if (window.EliteCRM && EliteCRM.ingestLead) EliteCRM.ingestLead(newInquiry);
              else {
                const inquiries = JSON.parse(localStorage.getItem('elite_inquiries') || '[]');
                inquiries.unshift(newInquiry);
                localStorage.setItem('elite_inquiries', JSON.stringify(inquiries));
              }
            } catch (crmErr) { }

            if (btn) btn.textContent = 'Sending…';

            if (window.EliteMail) {
              await window.EliteMail.sendEnquiry({
                name,
                email,
                phone: phone || '—',
                _subject: '[Elite Enquiry] Quote form · ' + service + ' · ' + name,
                service: artistType ? (service + ' · ' + artistType) : service,
                eventDate: date || '—',
                message: newInquiry.message || '—',
                attachment_names: attachmentRecords.map(function (a) { return a.name; }).join('; '),
                leadId: newInquiry.id,
                source: 'Homepage quote form'
              }, files.length ? files : (attachEl ? [attachEl] : []));
            }
          } catch (err) {
            console.warn('Email delivery deferred — lead saved in admin CRM', err);
          }

          if (btn) {
            btn.textContent = 'Enquiry Sent!';
            btn.style.background = 'linear-gradient(135deg, #2a5a2a, #3a7a3a)';
            btn.style.color = '#fff';
          }
          setTimeout(() => {
            if (btn) {
              btn.textContent = originalText;
              btn.style.background = '';
              btn.style.color = '';
              btn.disabled = false;
            }
            form.reset();
            var st = document.getElementById('form-attachments-status');
            if (st) {
              st.textContent = 'No files selected';
              st.setAttribute('data-empty', 'true');
            }
          }, 2800);
        })();
      });
    }

    /* ─── SMOOTH ACTIVE NAV LINK ─── */
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.main-nav a');

    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach(link => {
            link.style.color = '';
            if (link.getAttribute('href') === `#${id}`) {
              link.style.color = 'var(--gold)';
            }
          });
        }
      });
    }, { threshold: 0.4 });

    sections.forEach(s => sectionObserver.observe(s));

    /* ─── PARTICLE SPARKLE ON HERO ─── */
    const hero = document.querySelector('.hero');
    if (hero) {
      for (let i = 0; i < 20; i++) {
        const spark = document.createElement('div');
        spark.style.cssText = `
        position: absolute;
        width: ${Math.random() * 3 + 1}px;
        height: ${Math.random() * 3 + 1}px;
        background: var(--gold);
        opacity: ${Math.random() * 0.6 + 0.2};
        border-radius: 50%;
        top: ${Math.random() * 100}%;
        left: ${Math.random() * 100}%;
        z-index: 1;
        animation: sparkle ${Math.random() * 4 + 3}s ease-in-out infinite;
        animation-delay: ${Math.random() * 4}s;
        pointer-events: none;
        transition: background 0.5s ease;
      `;
        hero.appendChild(spark);
      }

      const style = document.createElement('style');
      style.textContent = `
      @keyframes sparkle {
        0%, 100% { opacity: 0; transform: scale(0); }
        50% { opacity: 1; transform: scale(1); }
      }
    `;
      document.head.appendChild(style);
    }

    /* ─── ARTIST CARD TILT ─── */
    document.querySelectorAll('.artist-card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const cx = rect.width / 2;
        const cy = rect.height / 2;
        const tiltX = ((y - cy) / cy) * 6;
        const tiltY = ((x - cx) / cx) * -6;
        card.style.transform = `translateY(-8px) perspective(600px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });

    /* ─── NUMBER COUNTER ANIMATION ─── */
    const counters = document.querySelectorAll('.stat-num');
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const text = el.textContent;
          const num = parseInt(text.replace(/\D/g, ''));
          const suffix = text.replace(/[\d]/g, '');
          let current = 0;
          const step = Math.ceil(num / 50);
          const interval = setInterval(() => {
            current = Math.min(current + step, num);
            el.textContent = current + suffix;
            if (current >= num) clearInterval(interval);
          }, 30);
          counterObserver.unobserve(el);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(c => counterObserver.observe(c));

    /* ─── AUTOCOMPLETE WITH ARTIST IMAGES ─── */
    function buildSearchIndex() {
      const items = [];
      if (window.ELITE_FOLDERS) {
        window.ELITE_FOLDERS.forEach(folder => {
          if (!folder || !folder.acts || !folder.acts.length) return;
          items.push({
            type: 'folder',
            name: folder.name,
            style: folder.count + ' acts',
            image: folder.cover,
            url: folder.slug
          });
          folder.acts.forEach(act => {
            items.push({
              type: 'act',
              name: act.name,
              style: act.style || folder.name,
              bio: act.bio || '',
              image: act.image || folder.cover,
              url: 'artist.html?folder=' + encodeURIComponent(folder.id) + '&act=' + encodeURIComponent(act.name),
              folder: folder.name
            });
          });
        });
      }
      // Service pages
      [
        { name: 'Weddings', url: 'weddings.html', style: 'Event package', image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=200&q=80' },
        { name: 'Corporate Events', url: 'corporate.html', style: 'Event package', image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=200&q=80' },
        { name: 'Private Parties', url: 'private-parties.html', style: 'Event package', image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=200&q=80' },
        { name: 'Luxury Car Hire', url: 'luxury-car-hire.html', style: 'Luxury hire', image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=200&q=80' },
        { name: 'Luxury Yacht Hire', url: 'luxury-yacht-hire.html', style: 'Luxury hire', image: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&w=200&q=80' },
        { name: 'Models & Dancers', url: 'models-dancers.html', style: 'Talent', image: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=200&q=80' },
        { name: 'Security & Crowd Control', url: 'security.html', style: 'Support', image: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=200&q=80' },
        { name: 'Stage, Sound & Lighting', url: 'stage-sound-lighting.html', style: 'Production hire', image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=200&q=80' }
      ].forEach(s => items.push(Object.assign({ type: 'service' }, s)));
      return items;
    }

    const searchIndex = buildSearchIndex();
    const searchInputEl = document.getElementById('hero-search-input');
    const dropdownEl = document.getElementById('search-autocomplete-dropdown');
    const searchBtnEl = document.getElementById('hero-search-btn');

    function renderAutocomplete(val) {
      if (!dropdownEl) return;
      dropdownEl.innerHTML = '';
      if (!val || val.length < 1) {
        dropdownEl.style.display = 'none';
        return;
      }
      const q = val.toLowerCase();
      const matches = searchIndex.filter(item =>
        item.name.toLowerCase().includes(q) ||
        (item.style && item.style.toLowerCase().includes(q)) ||
        (item.folder && item.folder.toLowerCase().includes(q)) ||
        (item.bio && item.bio.toLowerCase().includes(q))
      ).slice(0, 10);

      if (!matches.length) {
        dropdownEl.style.display = 'none';
        return;
      }

      matches.forEach(item => {
        const div = document.createElement('div');
        div.className = 'autocomplete-item autocomplete-item--media';
        div.setAttribute('role', 'option');
        const imgSrc = item.image || 'images/brand/logo-nav-icon.png';
        div.innerHTML =
          '<div class="ac-thumb"><img src="' + imgSrc + '" alt="" loading="lazy" onerror="this.src=\'images/brand/logo-nav-icon.png\'" /></div>' +
          '<div class="ac-meta">' +
          '<div class="ac-name">' + item.name + '</div>' +
          '<div class="ac-style">' + (item.style || item.type) + (item.folder ? ' · ' + item.folder : '') + '</div>' +
          '</div>' +
          '<span class="ac-tag">' + (item.type === 'act' ? 'Artist' : item.type === 'folder' ? 'Category' : 'Service') + '</span>';
        div.addEventListener('click', () => {
          searchInputEl.value = item.name;
          dropdownEl.style.display = 'none';
          window.location.href = item.url;
        });
        dropdownEl.appendChild(div);
      });
      dropdownEl.style.display = 'block';
    }

    if (searchInputEl && dropdownEl) {
      searchInputEl.addEventListener('input', () => {
        renderAutocomplete(searchInputEl.value.trim());
      });
      searchInputEl.addEventListener('focus', () => {
        if (searchInputEl.value.trim()) renderAutocomplete(searchInputEl.value.trim());
      });

      document.addEventListener('click', (e) => {
        if (!searchInputEl.contains(e.target) && !dropdownEl.contains(e.target)) {
          dropdownEl.style.display = 'none';
        }
      });

      const performRedirectSearch = () => {
        const query = searchInputEl.value.trim();
        const genre = genreSelect ? genreSelect.value.trim() : '';
        if (!query && !genre) return;

        // Category dropdown: jump straight to folder or hire page
        if (genre.indexOf('folder:') === 0) {
          window.location.href = 'folder.html?id=' + encodeURIComponent(genre.slice(7));
          return;
        }
        if (genre.indexOf('page:') === 0) {
          window.location.href = genre.slice(5);
          return;
        }

        const needle = query.toLowerCase();
        if (needle && window.ELITE_FOLDERS) {
          for (let i = 0; i < window.ELITE_FOLDERS.length; i++) {
            const folder = window.ELITE_FOLDERS[i];
            if (folder.name.toLowerCase().includes(needle)) {
              window.location.href = folder.slug;
              return;
            }
            const hit = folder.acts.find(a =>
              a.name.toLowerCase().includes(needle) ||
              (a.style && a.style.toLowerCase().includes(needle))
            );
            if (hit) {
              window.location.href = 'artist.html?folder=' + encodeURIComponent(folder.id) + '&act=' + encodeURIComponent(hit.name);
              return;
            }
          }
        }

        const idxHit = searchIndex.find(item =>
          item.name.toLowerCase().includes(needle) ||
          (item.style && item.style.toLowerCase().includes(needle))
        );
        if (idxHit) {
          window.location.href = idxHit.url;
          return;
        }

        // Fall back to filtering homepage roster in place
        executeSearch(needle);
      };

      if (searchBtnEl) {
        searchBtnEl.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          performRedirectSearch();
        });
      }

      if (genreSelect) {
        genreSelect.addEventListener('change', () => {
          if (genreSelect.value && !searchInputEl.value.trim()) {
            performRedirectSearch();
          }
        });
      }

      [searchInputEl, artistInput].forEach(input => {
        if (!input) return;
        input.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            performRedirectSearch();
          }
        });
      });
    }
    /* ─── MODAL CONTROLS (LOGIN & SIGNUP & CLIENT) ─── */
    const loginOverlay = document.getElementById('login-modal');
    const signupOverlay = document.getElementById('signup-modal');
    const clientOverlay = document.getElementById('client-modal');

    const btnOpenLogin = document.getElementById('nav-btn-login');
    const btnOpenSignup = document.getElementById('nav-btn-signup');
    const btnOpenClientNav = document.getElementById('nav-btn-client');

    const btnCloseLogin = document.getElementById('login-modal-close');
    const btnCloseSignup = document.getElementById('signup-modal-close');
    const btnCloseClient = document.getElementById('client-modal-close');

    const openModal = (modal) => {
      if (modal) modal.classList.add('active');
    };

    const closeModal = (modal) => {
      if (modal) modal.classList.remove('active');
    };

    const btnOpenHeroSignup = document.getElementById('hero-btn-vendor-signup');
    const btnVendorCallout = document.getElementById('vendor-callout-btn');

    if (btnOpenLogin) btnOpenLogin.addEventListener('click', (e) => { e.preventDefault(); openModal(loginOverlay); });
    if (btnOpenSignup) btnOpenSignup.addEventListener('click', (e) => { e.preventDefault(); openModal(signupOverlay); });
    if (btnOpenHeroSignup) btnOpenHeroSignup.addEventListener('click', (e) => { e.preventDefault(); openModal(signupOverlay); });
    if (btnVendorCallout) btnVendorCallout.addEventListener('click', (e) => { e.preventDefault(); openModal(signupOverlay); });
    if (btnOpenClientNav) btnOpenClientNav.addEventListener('click', (e) => { e.preventDefault(); openModal(clientOverlay); });

    if (btnCloseLogin) btnCloseLogin.addEventListener('click', () => closeModal(loginOverlay));
    if (btnCloseSignup) btnCloseSignup.addEventListener('click', () => closeModal(signupOverlay));
    if (btnCloseClient) btnCloseClient.addEventListener('click', () => closeModal(clientOverlay));

    // Close modals on overlay background click
    [loginOverlay, signupOverlay, clientOverlay].forEach(overlay => {
      if (overlay) {
        overlay.addEventListener('click', (e) => {
          if (e.target === overlay) closeModal(overlay);
        });
      }
    });

    /* ─── CLIENT CONSULTATION FORM (CRM) ─── */
    const clientForm = document.getElementById('client-signup-form');
    if (clientForm) {
      clientForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('client-name').value;
        const email = document.getElementById('client-email').value;
        const phone = document.getElementById('client-phone').value;
        const date = document.getElementById('client-date').value;
        const budget = document.getElementById('client-budget').value;
        const message = document.getElementById('client-message').value;

        const newClient = {
          id: 'CRM-' + Date.now().toString().slice(-4),
          name,
          email,
          phone,
          date,
          budget,
          message,
          status: 'Lead',
          notes: [],
          timestamp: new Date().toLocaleString()
        };

        const clients = JSON.parse(localStorage.getItem('elite_clients') || '[]');
        clients.unshift(newClient);
        localStorage.setItem('elite_clients', JSON.stringify(clients));
        try {
          const crmLead = Object.assign({}, newClient, {
            service: 'Consultation',
            kanbanColumn: 'new',
            status: 'New Enquiry',
            source: 'consultation',
            priority: 'normal',
            order: Date.now()
          });
          if (window.EliteCRMPush && EliteCRMPush.ingest) EliteCRMPush.ingest(crmLead);
          else if (window.EliteCRM && EliteCRM.ingestLead) EliteCRM.ingestLead(crmLead);
        } catch (crmErr) { }

        const submitBtn = clientForm.querySelector('button[type="submit"]');
        const originalClientBtn = submitBtn ? submitBtn.textContent : 'Register Consultation Call';
        if (submitBtn) {
          submitBtn.textContent = 'Sending…';
          submitBtn.disabled = true;
        }

        (async () => {
          try {
            if (window.EliteMail) {
              await window.EliteMail.sendEnquiry({
                name, email, phone,
                _subject: '[Elite Consultation] ' + name,
                eventDate: date || '—',
                budget: budget || '—',
                message: message || '—',
                leadId: newClient.id,
                source: 'Consultation modal'
              });
            }
          } catch (err) {
            console.warn('Consultation email deferred — saved in admin', err);
          }

          if (submitBtn) {
            submitBtn.textContent = 'Schedule Registered!';
            submitBtn.style.background = 'linear-gradient(135deg, #2a5a2a, #3a7a3a)';
            submitBtn.style.color = '#fff';
          }
          setTimeout(() => {
            if (submitBtn) {
              submitBtn.textContent = originalClientBtn;
              submitBtn.style.background = '';
              submitBtn.style.color = '';
              submitBtn.disabled = false;
            }
            clientForm.reset();
            closeModal(clientOverlay);
            var who = window.EliteMail ? window.EliteMail.recipientsLabel() : 'the Elite team';
            alert('Consultation logged in Super Admin and emailed to ' + who + '.');
          }, 1600);
        })();
      });
    }

    /* ─── 3-STEP DYNAMIC VENDOR REGISTRATION WIZARD ─── */
    const step1 = document.getElementById('step-1-panel');
    const step2 = document.getElementById('step-2-panel');
    const step3 = document.getElementById('step-3-panel');

    const dot1 = document.getElementById('dot-1');
    const dot2 = document.getElementById('dot-2');
    const dot3 = document.getElementById('dot-3');

    const typeSelector = document.getElementById('signup-type');
    const dynamicContainer = document.getElementById('dynamic-fields-container');

    const updateDynamicFields = () => {
      if (!typeSelector || !dynamicContainer) return;
      const selectedType = typeSelector.value;
      dynamicContainer.innerHTML = '';

      if (selectedType === 'Live Band') {
        dynamicContainer.innerHTML = `
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1rem;">
          <div>
            <label style="font-size:0.65rem; text-transform:uppercase; color:var(--gold); display:block; margin-bottom:0.4rem; font-weight:700;">Genre / Style</label>
            <input type="text" id="spec-genre" required placeholder="e.g. Rock, Pop, Jazz" style="width:100%; padding:0.65rem; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:8px; color:var(--white); outline:none;" />
          </div>
          <div>
            <label style="font-size:0.65rem; text-transform:uppercase; color:var(--gold); display:block; margin-bottom:0.4rem; font-weight:700;">Band Size (Members)</label>
            <input type="number" id="spec-size" required placeholder="e.g. 5" style="width:100%; padding:0.65rem; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:8px; color:var(--white); outline:none;" />
          </div>
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1rem;">
          <div>
            <label style="font-size:0.65rem; text-transform:uppercase; color:var(--gold); display:block; margin-bottom:0.4rem; font-weight:700;">Set List Duration</label>
            <select id="spec-duration" style="width:100%; padding:0.65rem; background:rgba(20,20,20,0.95); border:1px solid rgba(255,255,255,0.1); border-radius:8px; color:var(--white); outline:none;">
              <option value="1 Hour">1 Hour Total</option>
              <option value="2 Hours">2 Hours (2x 45m sets)</option>
              <option value="3 Hours">3 Hours (3x 45m sets)</option>
              <option value="4+ Hours">4+ Hours (Premium acts)</option>
            </select>
          </div>
          <div>
            <label style="font-size:0.65rem; text-transform:uppercase; color:var(--gold); display:block; margin-bottom:0.4rem; font-weight:700;">Technical Rider Provided?</label>
            <select id="spec-rider" style="width:100%; padding:0.65rem; background:rgba(20,20,20,0.95); border:1px solid rgba(255,255,255,0.1); border-radius:8px; color:var(--white); outline:none;">
              <option value="Yes">Yes, technical rider ready</option>
              <option value="No">No, need standard PA system</option>
            </select>
          </div>
        </div>
      `;
      } else if (selectedType === 'Event DJ') {
        dynamicContainer.innerHTML = `
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1rem;">
          <div>
            <label style="font-size:0.65rem; text-transform:uppercase; color:var(--gold); display:block; margin-bottom:0.4rem; font-weight:700;">DJ Specialist Category</label>
            <select id="spec-djstyle" style="width:100%; padding:0.65rem; background:rgba(20,20,20,0.95); border:1px solid rgba(255,255,255,0.1); border-radius:8px; color:var(--white); outline:none;">
              <option value="Open-Format">Open-Format / Corporate</option>
              <option value="Wedding DJ">Wedding Specialist</option>
              <option value="Club / Electronic">Club / Electronic (Techno, House)</option>
              <option value="R&B / Hip-Hop">Retro R&amp;B / Hip-Hop</option>
            </select>
          </div>
          <div>
            <label style="font-size:0.65rem; text-transform:uppercase; color:var(--gold); display:block; margin-bottom:0.4rem; font-weight:700;">Sound System Wattage</label>
            <input type="text" id="spec-sound" required placeholder="e.g. 1500W RMS" style="width:100%; padding:0.65rem; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:8px; color:var(--white); outline:none;" />
          </div>
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1rem;">
          <div>
            <label style="font-size:0.65rem; text-transform:uppercase; color:var(--gold); display:block; margin-bottom:0.4rem; font-weight:700;">Lighting Rig Included?</label>
            <select id="spec-lighting" style="width:100%; padding:0.65rem; background:rgba(20,20,20,0.95); border:1px solid rgba(255,255,255,0.1); border-radius:8px; color:var(--white); outline:none;">
              <option value="Yes">Yes, multi-beam rig</option>
              <option value="No">No, basic booth lights only</option>
            </select>
          </div>
          <div>
            <label style="font-size:0.65rem; text-transform:uppercase; color:var(--gold); display:block; margin-bottom:0.4rem; font-weight:700;">Microphones Provided</label>
            <select id="spec-mics" style="width:100%; padding:0.65rem; background:rgba(20,20,20,0.95); border:1px solid rgba(255,255,255,0.1); border-radius:8px; color:var(--white); outline:none;">
              <option value="Wireless Mics">Wireless Shure Mics (x2)</option>
              <option value="Wired Mics">Wired Mics (x1)</option>
              <option value="None">None</option>
            </select>
          </div>
        </div>
      `;
      } else if (selectedType === 'Luxury Car Hire') {
        dynamicContainer.innerHTML = `
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1rem;">
          <div>
            <label style="font-size:0.65rem; text-transform:uppercase; color:var(--gold); display:block; margin-bottom:0.4rem; font-weight:700;">Vehicle Make, Model &amp; Year</label>
            <input type="text" id="spec-car-model" required placeholder="e.g. Rolls-Royce Ghost 2022" style="width:100%; padding:0.65rem; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:8px; color:var(--white); outline:none;" />
          </div>
          <div>
            <label style="font-size:0.65rem; text-transform:uppercase; color:var(--gold); display:block; margin-bottom:0.4rem; font-weight:700;">Exterior Color</label>
            <select id="spec-car-color" style="width:100%; padding:0.65rem; background:rgba(20,20,20,0.95); border:1px solid rgba(255,255,255,0.1); border-radius:8px; color:var(--white); outline:none;">
              <option value="White">White / Pearl</option>
              <option value="Black">Gloss Black</option>
              <option value="Silver">Silver / Chrome</option>
              <option value="Gold">Gilded Gold</option>
              <option value="Other">Other Custom Wrap</option>
            </select>
          </div>
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1rem;">
          <div>
            <label style="font-size:0.65rem; text-transform:uppercase; color:var(--gold); display:block; margin-bottom:0.4rem; font-weight:700;">Min. Hire Duration (Hours)</label>
            <input type="number" id="spec-car-min" required placeholder="e.g. 3" style="width:100%; padding:0.65rem; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:8px; color:var(--white); outline:none;" />
          </div>
          <div>
            <label style="font-size:0.65rem; text-transform:uppercase; color:var(--gold); display:block; margin-bottom:0.4rem; font-weight:700;">Chauffeur Service Included?</label>
            <select id="spec-car-driver" style="width:100%; padding:0.65rem; background:rgba(20,20,20,0.95); border:1px solid rgba(255,255,255,0.1); border-radius:8px; color:var(--white); outline:none;">
              <option value="Yes">Yes, licensed chauffeur</option>
              <option value="No">No, dry hire only</option>
            </select>
          </div>
        </div>
      `;
      } else if (selectedType === 'Yacht Charter') {
        dynamicContainer.innerHTML = `
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1rem;">
          <div>
            <label style="font-size:0.65rem; text-transform:uppercase; color:var(--gold); display:block; margin-bottom:0.4rem; font-weight:700;">Vessel Name &amp; Length (ft)</label>
            <input type="text" id="spec-yacht-len" required placeholder="e.g. Athena II (80ft)" style="width:100%; padding:0.65rem; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:8px; color:var(--white); outline:none;" />
          </div>
          <div>
            <label style="font-size:0.65rem; text-transform:uppercase; color:var(--gold); display:block; margin-bottom:0.4rem; font-weight:700;">Max Passenger Capacity</label>
            <input type="number" id="spec-yacht-cap" required placeholder="e.g. 45" style="width:100%; padding:0.65rem; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:8px; color:var(--white); outline:none;" />
          </div>
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1rem;">
          <div>
            <label style="font-size:0.65rem; text-transform:uppercase; color:var(--gold); display:block; margin-bottom:0.4rem; font-weight:700;">Catering Service Packages</label>
            <select id="spec-yacht-catering" style="width:100%; padding:0.65rem; background:rgba(20,20,20,0.95); border:1px solid rgba(255,255,255,0.1); border-radius:8px; color:var(--white); outline:none;">
              <option value="BYO Only">BYO Food &amp; Drinks Allowed</option>
              <option value="Gold Menu">Gold Canape &amp; Beverage Package</option>
              <option value="Platinum Menu">Platinum Private Chef Menu</option>
            </select>
          </div>
          <div>
            <label style="font-size:0.65rem; text-transform:uppercase; color:var(--gold); display:block; margin-bottom:0.4rem; font-weight:700;">Captain &amp; Onboard Crew Size</label>
            <input type="number" id="spec-yacht-crew" required placeholder="e.g. 3" style="width:100%; padding:0.65rem; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:8px; color:var(--white); outline:none;" />
          </div>
        </div>
      `;
      } else if (selectedType === 'Security') {
        dynamicContainer.innerHTML = `
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1rem;">
          <div>
            <label style="font-size:0.65rem; text-transform:uppercase; color:var(--gold); display:block; margin-bottom:0.4rem; font-weight:700;">Class 1A License Number</label>
            <input type="text" id="spec-sec-lic" required placeholder="e.g. 40998822" style="width:100%; padding:0.65rem; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:8px; color:var(--white); outline:none;" />
          </div>
          <div>
            <label style="font-size:0.65rem; text-transform:uppercase; color:var(--gold); display:block; margin-bottom:0.4rem; font-weight:700;">License Expiry Date</label>
            <input type="date" id="spec-sec-exp" required style="width:100%; padding:0.65rem; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:8px; color:var(--white); outline:none;" />
          </div>
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1rem;">
          <div>
            <label style="font-size:0.65rem; text-transform:uppercase; color:var(--gold); display:block; margin-bottom:0.4rem; font-weight:700;">First-Aid Certified Staff?</label>
            <select id="spec-sec-firstaid" style="width:100%; padding:0.65rem; background:rgba(20,20,20,0.95); border:1px solid rgba(255,255,255,0.1); border-radius:8px; color:var(--white); outline:none;">
              <option value="Yes">Yes, all guards certified</option>
              <option value="No">No / Select Guards Only</option>
            </select>
          </div>
          <div>
            <label style="font-size:0.65rem; text-transform:uppercase; color:var(--gold); display:block; margin-bottom:0.4rem; font-weight:700;">Crowd Control Experience</label>
            <select id="spec-sec-exp" style="width:100%; padding:0.65rem; background:rgba(20,20,20,0.95); border:1px solid rgba(255,255,255,0.1); border-radius:8px; color:var(--white); outline:none;">
              <option value="1-3 years">1-3 years</option>
              <option value="4-7 years">4-7 years</option>
              <option value="8+ years">8+ years</option>
            </select>
          </div>
        </div>
      `;
      } else if (selectedType === 'Models & Dancers') {
        dynamicContainer.innerHTML = `
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1rem;">
          <div>
            <label style="font-size:0.65rem; text-transform:uppercase; color:var(--gold); display:block; margin-bottom:0.4rem; font-weight:700;">Performer Type</label>
            <select id="spec-model-type" style="width:100%; padding:0.65rem; background:rgba(20,20,20,0.95); border:1px solid rgba(255,255,255,0.1); border-radius:8px; color:var(--white); outline:none;">
              <option value="Promotional Model">Promotional Model / Hostess</option>
              <option value="Choreographed Dancer">Choreographed Dancer</option>
              <option value="Acrobat / Stage Act">Acrobat / Stage performer</option>
            </select>
          </div>
          <div>
            <label style="font-size:0.65rem; text-transform:uppercase; color:var(--gold); display:block; margin-bottom:0.4rem; font-weight:700;">Height (cm)</label>
            <input type="number" id="spec-model-height" required placeholder="e.g. 175" style="width:100%; padding:0.65rem; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:8px; color:var(--white); outline:none;" />
          </div>
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1rem;">
          <div>
            <label style="font-size:0.65rem; text-transform:uppercase; color:var(--gold); display:block; margin-bottom:0.4rem; font-weight:700;">Costumes / Outfits Provided?</label>
            <select id="spec-model-outfit" style="width:100%; padding:0.65rem; background:rgba(20,20,20,0.95); border:1px solid rgba(255,255,255,0.1); border-radius:8px; color:var(--white); outline:none;">
              <option value="BYO Costumes">BYO Performance Costumes</option>
              <option value="Client Provided">Client / Venue Provided Uniform</option>
            </select>
          </div>
          <div>
            <label style="font-size:0.65rem; text-transform:uppercase; color:var(--gold); display:block; margin-bottom:0.4rem; font-weight:700;">Performance Video Reel Link</label>
            <input type="url" id="spec-model-reel" placeholder="https://vimeo.com/yourshow" style="width:100%; padding:0.65rem; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:8px; color:var(--white); outline:none;" />
          </div>
        </div>
      `;
      } else if (selectedType === 'RSA & RCG Staff') {
        dynamicContainer.innerHTML = `
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1rem;">
          <div>
            <label style="font-size:0.65rem; text-transform:uppercase; color:var(--gold); display:block; margin-bottom:0.4rem; font-weight:700;">RSA Card Number</label>
            <input type="text" id="spec-staff-rsa" required placeholder="e.g. RSA009988" style="width:100%; padding:0.65rem; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:8px; color:var(--white); outline:none;" />
          </div>
          <div>
            <label style="font-size:0.65rem; text-transform:uppercase; color:var(--gold); display:block; margin-bottom:0.4rem; font-weight:700;">RCG Card Number (Optional)</label>
            <input type="text" id="spec-staff-rcg" placeholder="e.g. RCG001122" style="width:100%; padding:0.65rem; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:8px; color:var(--white); outline:none;" />
          </div>
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1rem;">
          <div>
            <label style="font-size:0.65rem; text-transform:uppercase; color:var(--gold); display:block; margin-bottom:0.4rem; font-weight:700;">Bar / Mixology Experience</label>
            <select id="spec-staff-mixology" style="width:100%; padding:0.65rem; background:rgba(20,20,20,0.95); border:1px solid rgba(255,255,255,0.1); border-radius:8px; color:var(--white); outline:none;">
              <option value="General Server">General Bar / Drink Server</option>
              <option value="Cocktail Maker">Cocktail Maker / Intermediate</option>
              <option value="Master Mixologist">Master Mixologist / Flair Bartender</option>
            </select>
          </div>
          <div>
            <label style="font-size:0.65rem; text-transform:uppercase; color:var(--gold); display:block; margin-bottom:0.4rem; font-weight:700;">Uniform Size</label>
            <select id="spec-staff-size" style="width:100%; padding:0.65rem; background:rgba(20,20,20,0.95); border:1px solid rgba(255,255,255,0.1); border-radius:8px; color:var(--white); outline:none;">
              <option value="S">Small (S)</option>
              <option value="M">Medium (M)</option>
              <option value="L">Large (L)</option>
              <option value="XL">Extra Large (XL)</option>
            </select>
          </div>
        </div>
      `;
      } else {
        dynamicContainer.innerHTML = `
        <div>
          <label style="font-size:0.65rem; text-transform:uppercase; color:var(--gold); display:block; margin-bottom:0.4rem; font-weight:700;">Service Description &amp; Specifications</label>
          <textarea id="spec-corporate" required placeholder="Describe corporate services, staffing, and staging details..." style="width:100%; height:90px; padding:0.65rem; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:8px; color:var(--white); outline:none; resize:none;"></textarea>
        </div>
      `;
      }
    };

    if (typeSelector) {
      typeSelector.addEventListener('change', updateDynamicFields);
      updateDynamicFields();
    }

    // File Upload labels change observers
    const photoInput = document.getElementById('signup-file-photo');
    const photoStatus = document.getElementById('photo-upload-status');
    if (photoInput && photoStatus) {
      photoInput.addEventListener('change', () => {
        if (photoInput.files.length > 0) {
          photoStatus.textContent = '' + photoInput.files[0].name;
          photoStatus.style.color = 'var(--gold)';
        }
      });
    }

    const certInput = document.getElementById('signup-file-cert');
    const certStatus = document.getElementById('cert-upload-status');
    if (certInput && certStatus) {
      certInput.addEventListener('change', () => {
        if (certInput.files.length > 0) {
          certStatus.textContent = '' + certInput.files[0].name;
          certStatus.style.color = 'var(--gold)';
        }
      });
    }

    // Next / Back buttons
    const btnNext1 = document.getElementById('btn-next-1');
    const btnNext2 = document.getElementById('btn-next-2');
    const btnPrev2 = document.getElementById('btn-prev-2');
    const btnPrev3 = document.getElementById('btn-prev-3');

    if (btnNext1) {
      btnNext1.addEventListener('click', () => {
        // Validate step 1 fields
        if (!document.getElementById('signup-name').value || !document.getElementById('signup-email').value || !document.getElementById('signup-phone').value) {
          alert('Please fill out all profile fields.');
          return;
        }
        step1.style.display = 'none';
        step2.style.display = 'block';
        dot2.style.background = 'var(--gold)';
        dot2.style.color = '#000';
      });
    }

    if (btnNext2) {
      btnNext2.addEventListener('click', () => {
        step2.style.display = 'none';
        step3.style.display = 'block';
        dot3.style.background = 'var(--gold)';
        dot3.style.color = '#000';
      });
    }

    if (btnPrev2) {
      btnPrev2.addEventListener('click', () => {
        step2.style.display = 'none';
        step1.style.display = 'block';
        dot2.style.background = 'rgba(255,255,255,0.1)';
        dot2.style.color = 'var(--white)';
      });
    }

    if (btnPrev3) {
      btnPrev3.addEventListener('click', () => {
        step3.style.display = 'none';
        step2.style.display = 'block';
        dot3.style.background = 'rgba(255,255,255,0.1)';
        dot3.style.color = 'var(--white)';
      });
    }

    // Final Vendor Form submit
    const vendorSignupForm = document.getElementById('vendor-signup-form');
    if (vendorSignupForm) {
      vendorSignupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!document.getElementById('signup-agree').checked) {
          alert('You must agree to Elite standards.');
          return;
        }

        const name = document.getElementById('signup-name').value;
        const type = typeSelector.value;
        const email = document.getElementById('signup-email').value;
        const phone = document.getElementById('signup-phone').value;
        const link = document.getElementById('signup-link').value;
        const experience = document.getElementById('signup-exp').value;

        // Extract dynamic step 2 fields
        let details = {};
        if (type === 'Live Band') {
          details.genre = document.getElementById('spec-genre').value;
          details.size = document.getElementById('spec-size').value;
          details.duration = document.getElementById('spec-duration').value;
          details.rider = document.getElementById('spec-rider').value;
        } else if (type === 'Event DJ') {
          details.djstyle = document.getElementById('spec-djstyle').value;
          details.sound = document.getElementById('spec-sound').value;
          details.lighting = document.getElementById('spec-lighting').value;
          details.mics = document.getElementById('spec-mics').value;
        } else if (type === 'Luxury Car Hire') {
          details.carModel = document.getElementById('spec-car-model').value;
          details.carColor = document.getElementById('spec-car-color').value;
          details.carMinHours = document.getElementById('spec-car-min').value;
          details.carChauffeur = document.getElementById('spec-car-driver').value;
        } else if (type === 'Yacht Charter') {
          details.yachtLength = document.getElementById('spec-yacht-len').value;
          details.yachtCapacity = document.getElementById('spec-yacht-cap').value;
          details.yachtCatering = document.getElementById('spec-yacht-catering').value;
          details.yachtCrew = document.getElementById('spec-yacht-crew').value;
        } else if (type === 'Security') {
          details.license = document.getElementById('spec-sec-lic').value;
          details.expiry = document.getElementById('spec-sec-exp').value;
          details.firstAid = document.getElementById('spec-sec-firstaid').value;
          details.experience = document.getElementById('spec-sec-exp').value;
        } else if (type === 'Models & Dancers') {
          details.modelType = document.getElementById('spec-model-type').value;
          details.height = document.getElementById('spec-model-height').value;
          details.outfits = document.getElementById('spec-model-outfit').value;
          details.reel = document.getElementById('spec-model-reel').value;
        } else if (type === 'RSA & RCG Staff') {
          details.rsa = document.getElementById('spec-staff-rsa').value;
          details.rcg = document.getElementById('spec-staff-rcg').value;
          details.mixology = document.getElementById('spec-staff-mixology').value;
          details.size = document.getElementById('spec-staff-size').value;
        } else {
          details.corporate = document.getElementById('spec-corporate').value;
        }

        // Read files if selected — names for CRM, real File objects for email attachments
        const photoFile = photoInput && photoInput.files.length > 0 ? photoInput.files[0].name : 'Not provided';
        const certFile = certInput && certInput.files.length > 0 ? certInput.files[0].name : 'Not provided';
        const attachInputs = [];
        if (photoInput && photoInput.files && photoInput.files.length) attachInputs.push(photoInput);
        if (certInput && certInput.files && certInput.files.length) attachInputs.push(certInput);

        if (window.EliteMail && attachInputs.length) {
          const allFiles = attachInputs.reduce(function (acc, inp) {
            return acc.concat(window.EliteMail.collectFiles(inp));
          }, []);
          const check = window.EliteMail.validateFiles(allFiles);
          if (!check.ok) {
            alert(check.error);
            return;
          }
        }

        const abn = document.getElementById('signup-abn').value;
        const price = document.getElementById('signup-price').value;
        const insurance = document.getElementById('signup-insurance').value;

        const newPartner = {
          id: 'PRT-' + Date.now().toString().slice(-4),
          name,
          type,
          email,
          phone,
          link,
          experience,
          abn,
          price,
          insurance,
          photoFile,
          certFile,
          details,
          status: 'Pending',
          timestamp: new Date().toLocaleString()
        };

        const partners = JSON.parse(localStorage.getItem('elite_partners') || '[]');
        partners.unshift(newPartner);
        localStorage.setItem('elite_partners', JSON.stringify(partners));

        const submitBtn = document.getElementById('btn-signup-submit');
        const originalSignupText = submitBtn ? submitBtn.textContent : 'Submit Profile';
        if (submitBtn) {
          submitBtn.textContent = 'Sending…';
          submitBtn.disabled = true;
        }

        (async () => {
          let mailOk = false;
          try {
            if (window.EliteMail) {
              const detailLines = Object.keys(details || {}).map(function (k) {
                return k + ': ' + details[k];
              }).join('\n');
              const result = await window.EliteMail.sendEnquiry({
                name,
                email,
                phone: phone || '—',
                _subject: '[Elite Partner Signup] ' + type + ' · ' + name,
                partnerType: type,
                website: link || '—',
                experience: experience || '—',
                abn: abn || '—',
                packagePrice: price || '—',
                insurance: insurance || '—',
                photoFile,
                certFile,
                specifications: detailLines || '—',
                leadId: newPartner.id,
                source: 'Vendor registration wizard',
                message: 'New partner registration for review.'
              }, attachInputs);
              mailOk = !!(result && result.ok);
            }
          } catch (err) {
            console.warn('Partner email deferred — saved in admin partners list', err);
          }

          if (submitBtn) {
            submitBtn.textContent = 'Submitted!';
            submitBtn.style.background = 'linear-gradient(135deg, #2a5a2a, #3a7a3a)';
            submitBtn.style.color = '#fff';
          }

          setTimeout(() => {
            if (submitBtn) {
              submitBtn.textContent = originalSignupText;
              submitBtn.style.background = '';
              submitBtn.style.color = '';
              submitBtn.disabled = false;
            }
            vendorSignupForm.reset();
            if (photoStatus) {
              photoStatus.textContent = 'Select Photo file';
              photoStatus.style.color = '';
            }
            if (certStatus) {
              certStatus.textContent = 'Select Doc file';
              certStatus.style.color = '';
            }
            closeModal(signupOverlay);

            // Reset steps
            step3.style.display = 'none';
            step1.style.display = 'block';
            if (dot2) {
              dot2.style.background = 'rgba(255,255,255,0.1)';
              dot2.style.color = 'var(--white)';
            }
            if (dot3) {
              dot3.style.background = 'rgba(255,255,255,0.1)';
              dot3.style.color = 'var(--white)';
            }

            var who = window.EliteMail ? window.EliteMail.recipientsLabel() : 'the Elite team';
            alert(
              'Thank you for registering! Your profile' +
              (attachInputs.length ? ' and uploaded files' : '') +
              ' were saved' +
              (mailOk ? ' and emailed to ' + who : ' in Super Admin (email may need FormSubmit confirmation)') +
              '. Our curation team will review shortly.'
            );
          }, 1600);
        })();
      });
    }

    // Automatic slideshow logic for Hero Showcase frame
    const slides = document.querySelectorAll('.slideshow-frame .slide-item');
    if (slides.length > 0) {
      let currentSlide = 0;
      setInterval(() => {
        slides[currentSlide].style.opacity = '0';
        slides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].style.opacity = '1';
        slides[currentSlide].classList.add('active');
      }, 4000);
    }

    // Live Shows Calendar Data & Filtering
    const eventsData = [
      {
        date: '20 AUG 2026',
        venue: 'Merrylands RSL',
        artist: 'The Velvet Tones Live',
        mapUrl: 'https://maps.google.com/?q=Merrylands+RSL',
        soldOut: true,
        month: 'aug'
      },
      {
        date: '27 AUG 2026',
        venue: 'Castle Hill RSL',
        artist: 'Symphonic Beatles Tribute',
        mapUrl: 'https://maps.google.com/?q=Castle+Hill+RSL',
        soldOut: false,
        month: 'aug'
      },
      {
        date: '05 SEP 2026',
        venue: 'Shellharbour Club',
        artist: 'Club DJ Sunset Lounge Set',
        mapUrl: 'https://maps.google.com/?q=Shellharbour+Club',
        soldOut: false,
        month: 'sep'
      },
      {
        date: '18 SEP 2026',
        venue: 'Penrith Panthers',
        artist: 'Rock Anthology Show',
        mapUrl: 'https://maps.google.com/?q=Penrith+Panthers',
        soldOut: true,
        month: 'sep'
      },
      {
        date: '03 OCT 2026',
        venue: 'Darling Harbour Centre',
        artist: 'Spring Gala Big Band Concert',
        mapUrl: 'https://maps.google.com/?q=Darling+Harbour',
        soldOut: false,
        month: 'oct'
      },
      {
        date: '17 OCT 2026',
        venue: 'Merrylands RSL',
        artist: 'Groove Syndicate Funk Tour',
        mapUrl: 'https://maps.google.com/?q=Merrylands+RSL',
        soldOut: false,
        month: 'oct'
      }
    ];

    window.renderEvents = (filter = 'all') => {
      const listContainer = document.getElementById('events-calendar-list');
      if (!listContainer) return;
      listContainer.innerHTML = '';

      const filtered = filter === 'all' ? eventsData : eventsData.filter(e => e.month === filter);

      filtered.forEach(evt => {
        const row = document.createElement('div');
        row.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: rgba(255,255,255,0.02);
        border: 1px solid rgba(255,255,255,0.06);
        border-radius: 12px;
        padding: 1.25rem 2rem;
        transition: 0.3s;
      `;
        row.className = 'evt-row-card';

        row.onmouseover = () => {
          row.style.borderColor = 'rgba(200,168,76,0.3)';
          row.style.background = 'rgba(200,168,76,0.02)';
          row.style.transform = 'translateY(-2px)';
        };
        row.onmouseout = () => {
          row.style.borderColor = 'rgba(255,255,255,0.06)';
          row.style.background = 'rgba(255,255,255,0.02)';
          row.style.transform = 'translateY(0)';
        };

        const parts = evt.date.split(' ');
        const dateHtml = `
        <div style="text-align:center; min-width:80px; border-right:1px solid rgba(255,255,255,0.08); padding-right:1.5rem; margin-right:1.5rem; display:flex; flex-direction:column; justify-content:center;">
          <span style="font-family:'Bebas Neue', sans-serif; font-size:1.8rem; color:var(--white); line-height:1; display:block;">${parts[0]}</span>
          <span style="font-size:0.65rem; color:var(--gold); font-weight:800; letter-spacing:0.1em; display:block; margin-top:0.2rem;">${parts[1]} ${parts[2]}</span>
        </div>
      `;

        const detailsHtml = `
        <div style="flex-grow:1; text-align:left; display:flex; flex-direction:column; justify-content:center;">
          <h4 style="color:var(--white); font-size:1.05rem; margin-bottom:0.3rem; font-weight:600;">${evt.artist}</h4>
          <p style="font-size:0.78rem; color:var(--silver-light); margin-bottom:0; display:flex; align-items:center; gap:0.5rem;">
            <span>${evt.venue}</span>
            <span style="color:rgba(255,255,255,0.15);">|</span>
            <a href="${evt.mapUrl}" target="_blank" style="color:var(--gold); text-decoration:none; font-weight:600; font-size:0.75rem;">Directions</a>
          </p>
        </div>
      `;

        const btnHtml = evt.soldOut
          ? `<button disabled style="background:rgba(255,255,255,0.05); color:rgba(255,255,255,0.25); border:1px solid rgba(255,255,255,0.05); border-radius:30px; padding:0.55rem 1.4rem; font-size:0.72rem; font-weight:700; cursor:not-allowed;">SOLD OUT</button>`
          : `<a href="#" onclick="alert('Securing connection with ticketing agent...'); return false;" class="btn btn-gold" style="border-radius:30px; padding:0.55rem 1.4rem; font-size:0.72rem; font-weight:700; text-transform:none; box-shadow:none;">Buy Tickets</a>`;

        row.innerHTML = `
        <div style="display:flex; align-items:center; flex-grow:1; flex-wrap:wrap;">
          ${dateHtml}
          ${detailsHtml}
        </div>
        <div style="margin-left:1.5rem; display:flex; align-items:center;">
          ${btnHtml}
        </div>
      `;
        listContainer.appendChild(row);
      });
    };

    window.filterEvents = (month) => {
      const btns = document.querySelectorAll('.evt-filter-btn');
      btns.forEach(btn => {
        btn.style.background = 'rgba(255,255,255,0.02)';
        btn.style.border = '1px solid rgba(255,255,255,0.08)';
        btn.style.color = 'var(--silver-light)';
      });

      const activeBtn = document.getElementById('evt-btn-' + month);
      if (activeBtn) {
        activeBtn.style.background = 'var(--gradient-gold)';
        activeBtn.style.border = 'none';
        activeBtn.style.color = '#000';
      }

      renderEvents(month);
    };

    // Initial event calendar render
    renderEvents();

    /* ─── PWA SERVICE WORKER & INSTALL PROMPT ─── */
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
          .then((reg) => console.log('[SW] Registered successfully scope:', reg.scope))
          .catch((err) => console.warn('[SW] Registration failed:', err));
      });
    }

    let deferredPrompt;
    const PWA_TOAST_KEY = 'elite_pwa_install_dismissed';

    function hasDismissedPwaToast() {
      try {
        return localStorage.getItem(PWA_TOAST_KEY) === '1';
      } catch (e) {
        return false;
      }
    }

    function dismissPwaToast() {
      try {
        localStorage.setItem(PWA_TOAST_KEY, '1');
      } catch (e) { /* ignore */ }
    }

    function isAppAlreadyInstalled() {
      try {
        if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) return true;
        if (window.navigator.standalone === true) return true; // iOS Safari
      } catch (e) { /* ignore */ }
      return false;
    }

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;

      // Only show once — skip if already dismissed, installed, or toast already on page
      if (hasDismissedPwaToast() || isAppAlreadyInstalled()) return;
      if (document.getElementById('pwa-install-toast')) return;

      const installToast = document.createElement('div');
      installToast.id = 'pwa-install-toast';
      installToast.style.cssText = `
      position: fixed;
      bottom: 25px;
      right: 25px;
      z-index: 10000;
      background: rgba(13,13,13,0.95);
      border: 1px solid var(--gold);
      border-radius: 12px;
      padding: 1rem 1.5rem;
      box-shadow: 0 10px 30px rgba(0,0,0,0.8), 0 0 20px rgba(200,168,76,0.3);
      display: flex;
      align-items: center;
      gap: 1rem;
      backdrop-filter: blur(10px);
    `;
      installToast.innerHTML = `
      <img src="./icons/icon-192.png" style="width:36px; height:36px; border-radius:6px;" alt="Elite App">
      <div>
        <div style="font-size:0.85rem; font-weight:700; color:#fff;">Install Elite App</div>
        <div style="font-size:0.7rem; color:var(--silver-mid);">Fast offline access &amp; instant booking</div>
      </div>
      <button id="pwa-install-btn" class="btn btn-gold btn-sm" style="padding:0.4rem 1rem;">Install</button>
      <button id="pwa-close-btn" style="color:var(--silver-dark); font-size:1.2rem; margin-left:0.5rem;">&times;</button>
    `;
      document.body.appendChild(installToast);

      document.getElementById('pwa-install-btn').addEventListener('click', () => {
        dismissPwaToast();
        installToast.remove();
        if (deferredPrompt) {
          deferredPrompt.prompt();
          deferredPrompt = null;
        }
      });
      document.getElementById('pwa-close-btn').addEventListener('click', () => {
        dismissPwaToast();
        installToast.remove();
      });
    });

    // If user installs (or already installed), never show again
    window.addEventListener('appinstalled', () => {
      dismissPwaToast();
      deferredPrompt = null;
      const t = document.getElementById('pwa-install-toast');
      if (t) t.remove();
    });

    /* ─── DYNAMIC CMS CONTENT POPULATION ─── */
    function applyCmsContent() {
      if (!window.EliteCMS) return;
      const siteContent = window.EliteCMS.getContent();

      // Prefer explicit data-cms hooks so we don't clobber designed hero markup
      document.querySelectorAll('[data-cms]').forEach(el => {
        const key = el.getAttribute('data-cms');
        if (!key || siteContent[key] == null) return;
        if (key === 'heroTitle') {
          // Keep accent span if present
          const accent = el.querySelector('.hero-title-accent');
          if (accent) {
            el.childNodes.forEach(n => {
              if (n.nodeType === 3) n.textContent = '';
            });
            // Insert text before accent
            const text = String(siteContent.heroTitle).replace(/marketplace/i, '').trim() || siteContent.heroTitle;
            if (!el.querySelector('.cms-title-text')) {
              const span = document.createElement('span');
              span.className = 'cms-title-text';
              span.textContent = text + ' ';
              el.insertBefore(span, accent);
            } else {
              el.querySelector('.cms-title-text').textContent = text + ' ';
            }
          } else {
            el.textContent = siteContent.heroTitle;
          }
        } else {
          el.textContent = siteContent[key];
        }
      });

      // Contact chips from CMS
      if (siteContent.contactPhone) {
        document.querySelectorAll('a[href^="tel:"]').forEach(a => {
          if (a.closest('.topbar') || a.closest('.contact-info-item') || a.closest('.mobile-contact-info') || a.closest('.footer-col')) {
            a.textContent = siteContent.contactPhone;
            a.href = 'tel:' + siteContent.contactPhone.replace(/\s+/g, '');
          }
        });
      }
      if (siteContent.contactEmail) {
        document.querySelectorAll('a[href^="mailto:info@"]').forEach(a => {
          a.textContent = a.textContent.includes('@') ? siteContent.contactEmail : a.textContent;
          a.href = 'mailto:' + siteContent.contactEmail;
        });
      }

      // Dynamic Artist cards on category pages (id=artists-grid / .artist-grid)
      const artistGrid = document.getElementById('artists-grid') || document.querySelector('.artist-grid');
      if (artistGrid && document.body.dataset.category) {
        const pageCategory = document.body.dataset.category;
        const cmsArtists = window.EliteCMS.getArtists(pageCategory);

        if (cmsArtists && cmsArtists.length > 0) {
          artistGrid.innerHTML = '';
          cmsArtists.forEach(art => {
            const card = document.createElement('div');
            card.className = 'artist-card service-card';
            const ytBtn = art.youtubeUrl ? `<button class="btn btn-outline btn-full" style="margin-bottom:0.5rem; border-color:rgba(255,80,80,0.6); color:#ff6b6b;" onclick="openVideoModal('${art.youtubeUrl.replace(/'/g, "\\'")}', '${art.name.replace(/'/g, "\\'")}')">▶ Watch Video Preview</button>` : '';
            card.innerHTML = `
            <div class="artist-img-wrap" style="position:relative; overflow:hidden; border-radius:12px; margin-bottom:1.2rem;">
              <img src="${art.image}" alt="${art.name}" style="width:100%; height:260px; object-fit:cover; transition:var(--transition);" loading="lazy" />
              <div style="position:absolute; top:12px; right:12px; background:rgba(0,0,0,0.75); border:1px solid var(--gold); color:var(--gold); padding:0.25rem 0.75rem; border-radius:20px; font-size:0.65rem; font-weight:700; text-transform:uppercase;">${art.rate}</div>
            </div>
            <h3 style="font-family:var(--font-heading); font-size:1.6rem; color:var(--white); margin-bottom:0.3rem;">${art.name}</h3>
            <p style="color:var(--gold); font-size:0.75rem; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; margin-bottom:0.6rem;">${art.genre}</p>
            <div class="artist-rich-bio" style="font-size:0.85rem; color:var(--silver-light); line-height:1.6; margin-bottom:1.2rem;">${art.bio}</div>
            ${ytBtn}
            <button class="btn btn-gold btn-full" onclick="openBookingModal('${art.name.replace(/'/g, "\\'")}', '${art.category}')">Hire ${art.name} &rarr;</button>
          `;
            artistGrid.appendChild(card);
          });
        }
      }

      // Homepage: inject featured CMS artists into a featured strip
      const featuredMount = document.getElementById('cms-featured-artists');
      if (featuredMount && window.EliteCMS.getArtists) {
        const allArt = window.EliteCMS.getArtists();
        const featured = allArt.filter(a => a.featured).slice(0, 8);
        if (featured.length) {
          featuredMount.innerHTML = featured.map(art => {
            const ytBtn = art.youtubeUrl ? `<button class="btn btn-outline btn-sm btn-full" style="margin-bottom:0.4rem; border-color:rgba(255,80,80,0.6); color:#ff6b6b; font-size:0.7rem;" onclick="openVideoModal('${art.youtubeUrl.replace(/'/g, "\\'")}', '${art.name.replace(/'/g, "\\'")}')">▶ Watch Video</button>` : '';
            return `
          <article class="featured-artist-card" style="background:rgba(255,255,255,0.03); border:1px solid rgba(200,168,76,0.25); border-radius:12px; padding:1.2rem; text-align:left;">
            <div class="featured-artist-img" style="background-image:url('${art.image}'); height:200px; background-size:cover; background-position:center; border-radius:8px; margin-bottom:1rem;"></div>
            <div class="featured-artist-body">
              <h4 style="color:var(--white); font-family:var(--font-heading); font-size:1.4rem; margin-bottom:0.2rem;">${art.name}</h4>
              <p class="featured-artist-genre" style="color:var(--gold); font-size:0.72rem; text-transform:uppercase; margin-bottom:0.4rem;">${art.genre}</p>
              <p class="featured-artist-rate" style="color:#55c555; font-weight:700; font-size:0.85rem; margin-bottom:0.8rem;">${art.rate}</p>
              ${ytBtn}
              <button class="btn btn-gold btn-sm btn-full" onclick="openBookingModal('${art.name.replace(/'/g, "\\'")}', '${art.category}')">Hire ${art.name} &rarr;</button>
            </div>
          </article>
        `;
          }).join('');
        }
      }
    }

    /* ─── YOUTUBE VIDEO PREVIEW MODAL ─── */
    window.openVideoModal = function (youtubeUrl, title) {
      let videoModal = document.getElementById('video-preview-modal');
      if (!videoModal) {
        videoModal = document.createElement('div');
        videoModal.id = 'video-preview-modal';
        videoModal.className = 'custom-modal-overlay';
        videoModal.innerHTML = `
        <div class="custom-modal-card" style="max-width:720px; width:90%; padding:1.5rem;">
          <button class="modal-close-btn" onclick="document.getElementById('video-preview-modal').classList.remove('active'); document.getElementById('video-modal-iframe').src=''">&times;</button>
          <h3 style="color:var(--white); font-family:var(--font-heading); font-size:1.5rem; margin-bottom:1rem; text-align:center;" id="video-modal-title">Watch Performance Preview</h3>
          <div style="position:relative; padding-bottom:56.25%; height:0; overflow:hidden; border-radius:10px; border:1px solid var(--gold);">
            <iframe id="video-modal-iframe" src="" style="position:absolute; top:0; left:0; width:100%; height:100%; border:none;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
          </div>
        </div>
      `;
        document.body.appendChild(videoModal);
      }

      let embedUrl = youtubeUrl;
      let vidId = '';
      if (window.EliteMedia && window.EliteMedia.youtubeId) {
        vidId = window.EliteMedia.youtubeId(youtubeUrl);
      } else {
        const match = String(youtubeUrl || '').match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|shorts\/|live\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
        if (match) vidId = match[1];
      }
      if (vidId) {
        embedUrl = `https://www.youtube.com/embed/${vidId}?autoplay=1`;
      }

      document.getElementById('video-modal-title').textContent = title ? (`Watch ${title} Preview`) : 'Video Performance Preview';
      document.getElementById('video-modal-iframe').src = embedUrl;
      videoModal.classList.add('active');
    };

    /* ─── GLOBAL ARTIST HIRING MODAL & EMAIL DISPATCH ─── */
    window.openBookingModal = function (artistName, categoryName) {
      let modal = document.getElementById('artist-hire-modal');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'artist-hire-modal';
        modal.className = 'custom-modal-overlay';
        modal.innerHTML = `
        <div class="custom-modal-card">
          <button class="modal-close-btn" onclick="document.getElementById('artist-hire-modal').classList.remove('active')">&times;</button>
          <div style="text-align:center; margin-bottom:1.5rem;">
            <span style="font-family:'Montserrat',sans-serif; font-weight:800; font-size:1.8rem; color:var(--white); letter-spacing:-0.02em;">ELITE</span>
            <span style="font-family:'Cormorant Garamond',serif; font-size:0.6rem; letter-spacing:0.18em; color:var(--gold); display:block; text-transform:uppercase;">Artist Hire Enquiry</span>
          </div>
          <h3 style="margin-bottom:0.5rem; color:var(--white); text-align:center;" id="hire-modal-artist-title">Book Artist</h3>
          <p style="font-size:0.8rem; color:var(--silver-mid); margin-bottom:1.5rem; text-align:center;">Fill out the form below to receive a direct quote. Your enquiry will be logged in the CRM &amp; emailed to info@eeevents.com.au and bookings@eeevents.com.au.</p>
          
          <form id="artist-hire-form" style="display:flex; flex-direction:column; gap:1rem; text-align:left;">
            <input type="hidden" id="hire-artist-name" />
            <input type="hidden" id="hire-artist-category" />
            
            <div>
              <label style="font-size:0.65rem; text-transform:uppercase; color:var(--gold); display:block; margin-bottom:0.4rem; font-weight:700;">Full Name *</label>
              <input type="text" id="hire-user-name" required placeholder="e.g. Sarah Jenkins" style="width:100%; padding:0.65rem; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:8px; color:var(--white); outline:none;" />
            </div>
            
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">
              <div>
                <label style="font-size:0.65rem; text-transform:uppercase; color:var(--gold); display:block; margin-bottom:0.4rem; font-weight:700;">Email Address *</label>
                <input type="email" id="hire-user-email" required placeholder="sarah@example.com" style="width:100%; padding:0.65rem; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:8px; color:var(--white); outline:none;" />
              </div>
              <div>
                <label style="font-size:0.65rem; text-transform:uppercase; color:var(--gold); display:block; margin-bottom:0.4rem; font-weight:700;">Phone Number *</label>
                <input type="tel" id="hire-user-phone" required placeholder="+61 400 000 000" style="width:100%; padding:0.65rem; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:8px; color:var(--white); outline:none;" />
              </div>
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">
              <div>
                <label style="font-size:0.65rem; text-transform:uppercase; color:var(--gold); display:block; margin-bottom:0.4rem; font-weight:700;">Event Date</label>
                <input type="date" id="hire-event-date" style="width:100%; padding:0.65rem; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:8px; color:var(--white); outline:none;" />
              </div>
              <div>
                <label style="font-size:0.65rem; text-transform:uppercase; color:var(--gold); display:block; margin-bottom:0.4rem; font-weight:700;">Estimated Budget ($)</label>
                <input type="number" id="hire-event-budget" placeholder="3000" style="width:100%; padding:0.65rem; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:8px; color:var(--white); outline:none;" />
              </div>
            </div>

            <div>
              <label style="font-size:0.65rem; text-transform:uppercase; color:var(--gold); display:block; margin-bottom:0.4rem; font-weight:700;">Event Location / Special Requests</label>
              <textarea id="hire-event-message" placeholder="Venue location, guest count, acoustic or full band setup..." style="width:100%; height:70px; padding:0.65rem; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:8px; color:var(--white); outline:none; resize:none;"></textarea>
            </div>

            <button type="submit" class="btn btn-gold" style="width:100%; border-radius:30px; padding:0.75rem; font-weight:700; margin-top:0.5rem;">Submit Hire Request &rarr;</button>
          </form>
        </div>
      `;
        document.body.appendChild(modal);

        document.getElementById('artist-hire-form').addEventListener('submit', function (e) {
          e.preventDefault();
          const artist = document.getElementById('hire-artist-name').value;
          const userName = document.getElementById('hire-user-name').value.trim();
          const userEmail = document.getElementById('hire-user-email').value.trim();
          const userPhone = document.getElementById('hire-user-phone').value.trim();
          const eventDate = document.getElementById('hire-event-date').value;
          const budget = document.getElementById('hire-event-budget').value;
          const message = document.getElementById('hire-event-message').value.trim();

          const newInquiry = {
            id: 'INQ-' + Date.now().toString().slice(-5),
            name: userName,
            email: userEmail,
            phone: userPhone,
            date: eventDate,
            service: 'Artist Hire: ' + artist,
            message: `Budget: $${budget || 'N/A'} | Notes: ${message}`,
            status: 'Pending',
            timestamp: new Date().toLocaleString()
          };

          const inquiries = JSON.parse(localStorage.getItem('elite_inquiries') || '[]');
          newInquiry.kanbanColumn = 'new';
          newInquiry.status = 'New Enquiry';
          newInquiry.priority = 'normal';
          newInquiry.order = Date.now();
          inquiries.unshift(newInquiry);
          localStorage.setItem('elite_inquiries', JSON.stringify(inquiries));
          try {
            if (window.EliteCRMPush && EliteCRMPush.ingest) EliteCRMPush.ingest(newInquiry);
            else if (window.EliteCRM && EliteCRM.ingestLead) EliteCRM.ingestLead(newInquiry);
          } catch (crmErr) { }

          const submitBtn = e.target.querySelector('button[type="submit"]');
          if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending…';
          }

          (async () => {
            let mailOk = false;
            try {
              if (window.EliteMail) {
                const result = await window.EliteMail.sendEnquiry({
                  name: userName,
                  email: userEmail,
                  phone: userPhone || '—',
                  _subject: '[Elite Artist Hire] ' + artist + ' · ' + userName,
                  artist: artist,
                  eventDate: eventDate || 'TBD',
                  budget: budget ? ('$' + budget) : 'N/A',
                  message: message || 'None',
                  leadId: newInquiry.id,
                  source: 'Artist hire modal'
                });
                mailOk = !!(result && result.ok);
              }
            } catch (err) {
              console.warn('Artist hire email deferred — saved in admin CRM', err);
            }

            var who = window.EliteMail ? window.EliteMail.recipientsLabel() : 'the Elite team';
            alert(
              `Thank you ${userName}! Your hire request for ${artist} has been registered` +
              (mailOk ? ` and emailed to ${who}.` : ' in Super Admin (email may need FormSubmit confirmation).')
            );
            modal.classList.remove('active');
            if (submitBtn) {
              submitBtn.disabled = false;
              submitBtn.textContent = 'Submit Hire Request →';
            }
          })();
        });
      }

      document.getElementById('hire-artist-name').value = artistName || 'Featured Act';
      document.getElementById('hire-artist-category').value = categoryName || '';
      document.getElementById('hire-modal-artist-title').textContent = 'Book ' + (artistName || 'Artist');
      modal.classList.add('active');
    };

    applyCmsContent();
    window.addEventListener('elite-cms-synced', applyCmsContent);

    // Pause marquees when reduced motion preferred
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.querySelectorAll('.ticket-marquee-track, .clients-track, .venue-marquee-track').forEach(el => {
        el.style.animation = 'none';
      });
    }

  } catch (eliteScriptErr) {
    if (typeof console !== 'undefined' && console.warn) {
      console.warn('Elite script.js non-fatal error:', eliteScriptErr);
    }
  }

});




