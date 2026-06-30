/* ═══════════════════════════════════════════════════
   ELITE ENTERTAINMENT — JavaScript
═══════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', function () {

  /* ─── LOADING OVERLAY & CANVAS FIREWORKS ─── */
  const loader = document.getElementById('loading-screen');
  const canvas = document.getElementById('fireworks-canvas');
  
  if (canvas && loader) {
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    class Particle {
      constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.angle = Math.random() * Math.PI * 2;
        this.speed = Math.random() * 4 + 1;
        this.friction = 0.95;
        this.gravity = 0.08;
        this.alpha = 1;
        this.decay = Math.random() * 0.015 + 0.01;
      }
      draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.restore();
      }
      update() {
        this.speed *= this.friction;
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed + this.gravity;
        this.alpha -= this.decay;
      }
    }

    class Firework {
      constructor() {
        this.x = Math.random() * width;
        this.y = height;
        this.targetY = Math.random() * (height * 0.5);
        this.speed = Math.random() * 5 + 4;
        this.particles = [];
        // Luxury gold shades
        const golds = ['#c9a84c', '#f3e5ab', '#8a6f27', '#ffffff', '#e8c86b'];
        this.color = golds[Math.floor(Math.random() * golds.length)];
      }
      draw() {
        if (this.speed > 0) {
          ctx.beginPath();
          ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
          ctx.fillStyle = this.color;
          ctx.fill();
        }
        this.particles.forEach(p => p.draw());
      }
      update() {
        if (this.speed > 0) {
          this.y -= this.speed;
          if (this.y <= this.targetY) {
            this.speed = 0;
            this.explode();
          }
        }
        this.particles.forEach((p, index) => {
          p.update();
          if (p.alpha <= 0) {
            this.particles.splice(index, 1);
          }
        });
      }
      explode() {
        for (let i = 0; i < 40; i++) {
          this.particles.push(new Particle(this.x, this.y, this.color));
        }
      }
    }

    const fireworks = [];
    let animationId;

    function loop() {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.fillRect(0, 0, width, height);

      if (Math.random() < 0.08) {
        fireworks.push(new Firework());
      }

      fireworks.forEach((fw, index) => {
        fw.update();
        fw.draw();
        if (fw.speed === 0 && fw.particles.length === 0) {
          fireworks.splice(index, 1);
        }
      });

      animationId = requestAnimationFrame(loop);
    }

    loop();

    // Fade out loading screen after 2.4s
    setTimeout(() => {
      loader.classList.add('fade-out');
      setTimeout(() => {
        cancelAnimationFrame(animationId);
        loader.remove();
      }, 800);
    }, 2400);
  }

  /* ─── FLOATING HERO SEARCH FILTER ─── */
  const searchBtn = document.getElementById('hero-search-btn');
  const searchInput = document.getElementById('hero-search-input');
  const genreSelect = document.getElementById('hero-genre-select');
  const artistInput = document.getElementById('hero-artist-input');

  const executeSearch = (queryKeyword = '', queryGenre = '', queryArtist = '') => {
    let matchedServiceCount = 0;
    let matchedArtistCount = 0;

    // Filter services
    document.querySelectorAll('.service-card').forEach(card => {
      const text = card.textContent.toLowerCase();
      const matchKeyword = !queryKeyword || text.includes(queryKeyword);
      const matchGenre = !queryGenre || text.includes(queryGenre);
      
      if (matchKeyword && matchGenre) {
        card.style.display = '';
        card.style.borderColor = (queryKeyword || queryGenre) ? 'var(--gold)' : '';
        card.style.boxShadow = (queryKeyword || queryGenre) ? 'var(--shadow-gold)' : '';
        matchedServiceCount++;
      } else {
        card.style.display = 'none';
      }
    });

    // Filter offers
    document.querySelectorAll('.offer-card').forEach(card => {
      const text = card.textContent.toLowerCase();
      const matchKeyword = !queryKeyword || text.includes(queryKeyword);
      const matchGenre = !queryGenre || text.includes(queryGenre);

      if (matchKeyword && matchGenre) {
        card.style.display = '';
        card.style.borderColor = (queryKeyword || queryGenre) ? 'var(--gold)' : '';
        matchedServiceCount++;
      } else {
        card.style.display = 'none';
      }
    });

    // Filter artists
    document.querySelectorAll('.artist-card').forEach(card => {
      const text = card.textContent.toLowerCase();
      const matchKeyword = !queryKeyword || text.includes(queryKeyword);
      const matchGenre = !queryGenre || text.includes(queryGenre);
      const matchArtistName = !queryArtist || text.includes(queryArtist);

      if (matchKeyword && matchGenre && matchArtistName) {
        card.style.display = '';
        card.style.borderColor = (queryKeyword || queryGenre || queryArtist) ? 'var(--gold)' : '';
        matchedArtistCount++;
      } else {
        card.style.display = 'none';
      }
    });

    // Scroll
    if (queryKeyword || queryGenre || queryArtist) {
      if (matchedServiceCount > 0) {
        document.getElementById('services').scrollIntoView({ behavior: 'smooth' });
      } else if (matchedArtistCount > 0) {
        document.getElementById('artists').scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  if (searchBtn) {
    searchBtn.addEventListener('click', () => {
      executeSearch(
        searchInput.value.toLowerCase().trim(),
        genreSelect.value.toLowerCase().trim(),
        artistInput.value.toLowerCase().trim()
      );
    });

    [searchInput, artistInput].forEach(input => {
      if (input) {
        input.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') {
            executeSearch(
              searchInput.value.toLowerCase().trim(),
              genreSelect.value.toLowerCase().trim(),
              artistInput.value.toLowerCase().trim()
            );
          }
        });
      }
    });
  }

  // Global function for Popular Tag clicks
  window.filterByTag = function(tag) {
    if (tag === 'weddings') executeSearch('wedding');
    else if (tag === 'corporate') executeSearch('corporate');
    else if (tag === 'bands') executeSearch('band');
    else if (tag === 'djs') executeSearch('dj');
    else if (tag === 'solo') executeSearch('solo');
    else if (tag === 'tributes') executeSearch('tribute');
    else if (tag === 'car') executeSearch('car');
    else if (tag === 'yacht') executeSearch('yacht');
    else if (tag === 'jazz') executeSearch('jazz');
    else if (tag === 'security') executeSearch('security');
  };

  /* ─── STICKY HEADER ─── */
  const header = document.getElementById('site-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  /* ─── MOBILE NAV TOGGLE ─── */
  const navToggle = document.getElementById('nav-toggle');
  const mainNav   = document.getElementById('main-nav');

  navToggle.addEventListener('click', () => {
    mainNav.classList.toggle('open');
    const spans = navToggle.querySelectorAll('span');
    if (mainNav.classList.contains('open')) {
      spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
      spans[1].style.opacity   = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
    } else {
      spans[0].style.transform = '';
      spans[1].style.opacity   = '';
      spans[2].style.transform = '';
    }
  });

  /* ─── MOBILE DROPDOWN TOGGLE ─── */
  const hasDropdowns = document.querySelectorAll('.has-dropdown > a');
  hasDropdowns.forEach(link => {
    link.addEventListener('click', (e) => {
      if (window.innerWidth <= 900) {
        e.preventDefault();
        const parent = link.parentElement;
        parent.classList.toggle('open');
      }
    });
  });

  /* ─── CLOSE NAV ON LINK CLICK ─── */
  mainNav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      if (window.innerWidth <= 900) {
        mainNav.classList.remove('open');
        const spans = navToggle.querySelectorAll('span');
        spans[0].style.transform = '';
        spans[1].style.opacity   = '';
        spans[2].style.transform = '';
      }
    });
  });

  /* ─── BACK TO TOP ─── */
  const backToTop = document.getElementById('back-to-top');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }
  });
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

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
  /* ─── FORM SUBMIT ─── */
  const form = document.getElementById('quote-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      // Extract form values
      const name = document.getElementById('form-name').value;
      const email = document.getElementById('form-email').value;
      const phone = document.getElementById('form-phone').value;
      const date = document.getElementById('form-date').value;
      const service = document.getElementById('form-service').value;
      const message = document.getElementById('form-message').value;

      const newInquiry = {
        id: 'INQ-' + Date.now().toString().slice(-5),
        name,
        email,
        phone,
        date,
        service,
        message,
        status: 'Pending',
        timestamp: new Date().toLocaleString()
      };

      // Save to localStorage
      const inquiries = JSON.parse(localStorage.getItem('elite_inquiries') || '[]');
      inquiries.unshift(newInquiry);
      localStorage.setItem('elite_inquiries', JSON.stringify(inquiries));

      const btn = form.querySelector('button[type="submit"]');
      const originalText = btn.textContent;

      btn.textContent = 'Sending…';
      btn.disabled = true;

      setTimeout(() => {
        btn.textContent = '✓ Enquiry Sent!';
        btn.style.background = 'linear-gradient(135deg, #2a5a2a, #3a7a3a)';
        btn.style.color = '#fff';

        setTimeout(() => {
          btn.textContent = originalText;
          btn.style.background = '';
          btn.style.color = '';
          btn.disabled = false;
          form.reset();
        }, 3000);
      }, 1500);
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

  /* ─── AUTOCOMPLETE & DIRECT PAGE REDIRECT SEARCH ─── */
  const searchSuggestions = [
    { name: "Wedding Band Hire", url: "artists-bands.html" },
    { name: "Wedding DJ Hire", url: "artists-djs.html" },
    { name: "Corporate Band Hire", url: "artists-bands.html" },
    { name: "Corporate DJ Hire", url: "artists-djs.html" },
    { name: "Party Band Hire", url: "artists-bands.html" },
    { name: "Party DJ Hire", url: "artists-djs.html" },
    { name: "Solo Acoustic Artists", url: "artists-solo.html" },
    { name: "Duo Artists", url: "artists-duo.html" },
    { name: "Tribute Shows & Acts", url: "artists-tributes.html" },
    { name: "Classical & Jazz Ensembles", url: "artists-jazz.html" },
    { name: "Luxury Car Hire", url: "luxury-car-hire.html" },
    { name: "Luxury Yacht Hire", url: "luxury-yacht-hire.html" },
    { name: "Models & Dancers", url: "models-dancers.html" },
    { name: "Security & Guard Services", url: "security.html" }
  ];

  const searchInputEl = document.getElementById('hero-search-input');
  const dropdownEl = document.getElementById('search-autocomplete-dropdown');
  const searchBtnEl = document.getElementById('hero-search-btn');

  if (searchInputEl && dropdownEl) {
    // Show suggestions on typing
    searchInputEl.addEventListener('input', () => {
      const val = searchInputEl.value.toLowerCase().trim();
      dropdownEl.innerHTML = '';
      
      if (!val) {
        dropdownEl.style.display = 'none';
        return;
      }

      const matches = searchSuggestions.filter(item => 
        item.name.toLowerCase().includes(val)
      );

      if (matches.length > 0) {
        matches.forEach(item => {
          const div = document.createElement('div');
          div.className = 'autocomplete-item';
          div.textContent = item.name;
          div.addEventListener('click', () => {
            searchInputEl.value = item.name;
            dropdownEl.style.display = 'none';
            window.location.href = item.url;
          });
          dropdownEl.appendChild(div);
        });
        dropdownEl.style.display = 'block';
      } else {
        dropdownEl.style.display = 'none';
      }
    });

    // Hide dropdown on click outside
    document.addEventListener('click', (e) => {
      if (!searchInputEl.contains(e.target) && !dropdownEl.contains(e.target)) {
        dropdownEl.style.display = 'none';
      }
    });

    // Direct page redirect on search click or Enter key
    const performRedirectSearch = () => {
      const query = searchInputEl.value.toLowerCase().trim();
      if (!query) return;

      // Check for exact or close matches in suggestions
      const directMatch = searchSuggestions.find(item => 
        item.name.toLowerCase().includes(query) || query.includes(item.name.toLowerCase())
      );

      if (directMatch) {
        window.location.href = directMatch.url;
      } else {
        // Fallback to in-page section scrolling
        if (typeof executeSearch === 'function') {
          executeSearch(query);
        }
      }
    };

    if (searchBtnEl) {
      searchBtnEl.addEventListener('click', (e) => {
        e.stopPropagation();
        performRedirectSearch();
      });
    }

    searchInputEl.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        performRedirectSearch();
      }
    });
  }
  /* ─── MODAL CONTROLS (LOGIN & SIGNUP & CLIENT) ─── */
  const loginOverlay = document.getElementById('login-modal');
  const signupOverlay = document.getElementById('signup-modal');
  const clientOverlay = document.getElementById('client-modal');
  
  const btnOpenLogin = document.getElementById('nav-btn-login');
  const btnOpenSignup = document.getElementById('nav-btn-signup');
  const btnOpenSignupHero = document.querySelector('.vendor-callout-card .btn');
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

  if (btnOpenLogin) btnOpenLogin.addEventListener('click', (e) => { e.preventDefault(); openModal(loginOverlay); });
  if (btnOpenSignup) btnOpenSignup.addEventListener('click', (e) => { e.preventDefault(); openModal(signupOverlay); });
  if (btnOpenSignupHero) btnOpenSignupHero.addEventListener('click', (e) => { e.preventDefault(); openModal(signupOverlay); });
  if (btnOpenHeroSignup) btnOpenHeroSignup.addEventListener('click', (e) => { e.preventDefault(); openModal(signupOverlay); });
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

      const submitBtn = clientForm.querySelector('button[type="submit"]');
      submitBtn.textContent = '✓ Schedule Registered!';
      submitBtn.style.background = 'linear-gradient(135deg, #2a5a2a, #3a7a3a)';
      submitBtn.style.color = '#fff';

      setTimeout(() => {
        submitBtn.textContent = 'Register Consultation Call';
        submitBtn.style.background = '';
        submitBtn.style.color = '';
        clientForm.reset();
        closeModal(clientOverlay);
        alert('Your consultation request has been logged. An advisor will contact you shortly.');
      }, 1800);
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
    const selectedType = typeSelector.value;
    dynamicContainer.innerHTML = '';

    if (selectedType === 'Live Band') {
      dynamicContainer.innerHTML = `
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1rem;">
          <div>
            <label style="font-size:0.65rem; text-transform:uppercase; color:var(--gold); display:block; margin-bottom:0.4rem; font-weight:700;">Genre</label>
            <input type="text" id="spec-genre" required placeholder="e.g. Rock, Pop, Jazz" style="width:100%; padding:0.65rem; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:8px; color:var(--white); outline:none;" />
          </div>
          <div>
            <label style="font-size:0.65rem; text-transform:uppercase; color:var(--gold); display:block; margin-bottom:0.4rem; font-weight:700;">Band Size (Members)</label>
            <input type="number" id="spec-size" required placeholder="e.g. 5" style="width:100%; padding:0.65rem; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:8px; color:var(--white); outline:none;" />
          </div>
        </div>
      `;
    } else if (selectedType === 'Event DJ') {
      dynamicContainer.innerHTML = `
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1rem;">
          <div>
            <label style="font-size:0.65rem; text-transform:uppercase; color:var(--gold); display:block; margin-bottom:0.4rem; font-weight:700;">Lighting Rig Included?</label>
            <select id="spec-lighting" style="width:100%; padding:0.65rem; background:rgba(20,20,20,0.95); border:1px solid rgba(255,255,255,0.1); border-radius:8px; color:var(--white); outline:none; cursor:pointer;">
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>
          <div>
            <label style="font-size:0.65rem; text-transform:uppercase; color:var(--gold); display:block; margin-bottom:0.4rem; font-weight:700;">Sound System Wattage</label>
            <input type="text" id="spec-sound" required placeholder="e.g. 2000W" style="width:100%; padding:0.65rem; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:8px; color:var(--white); outline:none;" />
          </div>
        </div>
      `;
    } else if (selectedType === 'Luxury Car Hire' || selectedType === 'Yacht Charter') {
      dynamicContainer.innerHTML = `
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1rem;">
          <div>
            <label style="font-size:0.65rem; text-transform:uppercase; color:var(--gold); display:block; margin-bottom:0.4rem; font-weight:700;">Make & Model</label>
            <input type="text" id="spec-model" required placeholder="e.g. Rolls-Royce Ghost" style="width:100%; padding:0.65rem; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:8px; color:var(--white); outline:none;" />
          </div>
          <div>
            <label style="font-size:0.65rem; text-transform:uppercase; color:var(--gold); display:block; margin-bottom:0.4rem; font-weight:700;">Hourly Hire Rate ($)</label>
            <input type="number" id="spec-rate" required placeholder="e.g. 250" style="width:100%; padding:0.65rem; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:8px; color:var(--white); outline:none;" />
          </div>
        </div>
      `;
    } else if (selectedType === 'Security') {
      dynamicContainer.innerHTML = `
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1rem;">
          <div>
            <label style="font-size:0.65rem; text-transform:uppercase; color:var(--gold); display:block; margin-bottom:0.4rem; font-weight:700;">License Number</label>
            <input type="text" id="spec-lic" required placeholder="e.g. 40998822" style="width:100%; padding:0.65rem; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:8px; color:var(--white); outline:none;" />
          </div>
          <div>
            <label style="font-size:0.65rem; text-transform:uppercase; color:var(--gold); display:block; margin-bottom:0.4rem; font-weight:700;">Coverage Range</label>
            <input type="text" id="spec-region" required placeholder="e.g. Sydney Metro" style="width:100%; padding:0.65rem; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:8px; color:var(--white); outline:none;" />
          </div>
        </div>
      `;
    }
  };

  if (typeSelector) {
    typeSelector.addEventListener('change', updateDynamicFields);
    updateDynamicFields();
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
      } else if (type === 'Event DJ') {
        details.lighting = document.getElementById('spec-lighting').value;
        details.sound = document.getElementById('spec-sound').value;
      } else if (type === 'Luxury Car Hire' || type === 'Yacht Charter') {
        details.model = document.getElementById('spec-model').value;
        details.rate = document.getElementById('spec-rate').value;
      } else if (type === 'Security') {
        details.license = document.getElementById('spec-lic').value;
        details.region = document.getElementById('spec-region').value;
      }

      const newPartner = {
        id: 'PRT-' + Date.now().toString().slice(-4),
        name,
        type,
        email,
        phone,
        link,
        experience,
        details,
        status: 'Pending',
        timestamp: new Date().toLocaleString()
      };

      const partners = JSON.parse(localStorage.getItem('elite_partners') || '[]');
      partners.unshift(newPartner);
      localStorage.setItem('elite_partners', JSON.stringify(partners));

      const submitBtn = document.getElementById('btn-signup-submit');
      submitBtn.textContent = '✓ Submitted!';
      submitBtn.style.background = 'linear-gradient(135deg, #2a5a2a, #3a7a3a)';
      submitBtn.style.color = '#fff';

      setTimeout(() => {
        submitBtn.textContent = 'Submit Profile';
        submitBtn.style.background = '';
        submitBtn.style.color = '';
        vendorSignupForm.reset();
        closeModal(signupOverlay);
        
        // Reset steps
        step3.style.display = 'none';
        step1.style.display = 'block';
        dot2.style.background = 'rgba(255,255,255,0.1)';
        dot2.style.color = 'var(--white)';
        dot3.style.background = 'rgba(255,255,255,0.1)';
        dot3.style.color = 'var(--white)';
        
        alert('Thank you for registering! Our curation team will review your specs and links shortly.');
      }, 1800);
    });
  }

});
