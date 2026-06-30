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

});
