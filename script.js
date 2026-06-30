/* ═══════════════════════════════════════════════════
   ELITE ENTERTAINMENT — JavaScript
═══════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', function () {

  /* ─── METALLIC THEME TOGGLE ─── */
  const themeToggle = document.getElementById('theme-toggle');
  const currentTheme = localStorage.getItem('theme');

  // Apply saved theme preference on load
  if (currentTheme === 'silver') {
    document.body.classList.add('theme-silver');
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      document.body.classList.toggle('theme-silver');
      
      let theme = 'gold';
      if (document.body.classList.contains('theme-silver')) {
        theme = 'silver';
      }
      localStorage.setItem('theme', theme);
    });
  }

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
