/* Clean site navigation — same on every page */
(function () {
  /* Social profiles — topbar + footer */
  var SOCIALS = [
    {
      label: 'Facebook',
      href: 'https://www.facebook.com/',
      icon: '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>'
    },
    {
      label: 'Instagram',
      href: 'https://www.instagram.com/',
      icon: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/></svg>'
    },
    {
      label: 'LinkedIn',
      href: 'https://www.linkedin.com/company/elite-entertainment-and-events',
      icon: '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-4 0v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>'
    },
    {
      label: 'YouTube',
      href: 'https://www.youtube.com/',
      icon: '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true"><path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 001.46 6.42 29 29 0 001 12a29 29 0 00.46 5.58 2.78 2.78 0 001.95 1.95C5.12 20 12 20 12 20s6.88 0 8.59-.47a2.78 2.78 0 001.95-1.95A29 29 0 0023 12a29 29 0 00-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="#0a0a0a"/></svg>'
    }
  ];

  /* All "Browse Our Artists" folders (matches homepage #categories order) */
  var ARTIST_FOLDERS = [
    { label: 'Browse all artists', href: 'index.html#categories' },
    { label: 'Celebrities', href: 'folder.html?id=celebrity-bands-and-artists' },
    { label: 'Solos', href: 'folder.html?id=solo-acts' },
    { label: 'Duos', href: 'folder.html?id=duos' },
    { label: 'Trios', href: 'folder.html?id=trios' },
    { label: 'Party Bands', href: 'folder.html?id=party-bands' },
    { label: 'Tribute', href: 'folder.html?id=tribute-acts' },
    { label: 'Production Shows', href: 'folder.html?id=production-shows' },
    { label: 'Dance Troupes', href: 'folder.html?id=dance-troupes-mcs' },
    { label: 'MCs & Hosts', href: 'folder.html?id=mcs' },
    { label: "DJ's & Karaoke", href: 'folder.html?id=djs-karaoke' },
    { label: 'Instrumentalists', href: 'folder.html?id=instrumentals' },
    { label: 'Stage Shows', href: 'folder.html?id=stage-shows' },
    { label: 'Multicultural', href: 'folder.html?id=multicultural-entertainment' },
    { label: 'Country', href: 'folder.html?id=country' },
    { label: 'Comedians', href: 'folder.html?id=comedians' },
    { label: "Children's Entertainment", href: 'folder.html?id=childrens-entertainment' },
    { label: 'Classical Entertainment', href: 'folder.html?id=classical-entertainment' },
    { label: 'Seasonal & Specialty', href: 'folder.html?id=seasonal-specialty-entertainment' },
    { label: 'Roving Entertainment', href: 'folder.html?id=roving-entertainment' }
  ];

  var NAV = [
    { label: 'Home', href: 'index.html' },
    {
      label: 'Artists',
      href: 'index.html#categories',
      mega: true,
      children: ARTIST_FOLDERS
    },
    {
      label: 'Events',
      href: 'index.html#services',
      children: [
        { label: 'Weddings', href: 'weddings.html' },
        { label: 'Corporate Events', href: 'corporate.html' },
        { label: 'Private Parties', href: 'private-parties.html' }
      ]
    },
    {
      label: 'Hire',
      href: 'models-dancers.html',
      children: [
        { label: 'Models & Dancers', href: 'models-dancers.html' },
        { label: 'Luxury Car Hire', href: 'luxury-car-hire.html' },
        { label: 'Luxury Yacht Hire', href: 'luxury-yacht-hire.html' },
        { label: 'Security', href: 'security.html' },
        { label: 'Stage, Sound & Lighting', href: 'stage-sound-lighting.html' }
      ]
    },
    { label: 'About', href: 'index.html#company' },
    {
      label: 'Account',
      href: 'client.html',
      children: [
        { label: 'Client login', href: 'client.html' },
        { label: 'Legal centre', href: 'legal.html' }
      ]
    },
    { label: 'Contact', href: 'index.html#contact' }
  ];

  function pageFile() {
    try {
      var path = (window.location.pathname || '').split('/').pop() || 'index.html';
      return path || 'index.html';
    } catch (e) {
      return 'index.html';
    }
  }

  function isActive(href) {
    var file = pageFile();
    if (!href || href.charAt(0) === '#') return false;
    var base = href.split('#')[0].split('?')[0];
    return base === file;
  }

  function buildNavHtml() {
    var items = NAV.map(function (item) {
      if (item.children && item.children.length) {
        var kids = item.children.map(function (c) {
          var cur = isActive(c.href) ? ' class="is-current"' : '';
          return '<li><a href="' + c.href + '"' + cur + '>' + c.label + '</a></li>';
        }).join('');
        var topCur = isActive(item.href) ? ' is-current' : '';
        var ddClass = item.mega ? 'dropdown dropdown--cols' : 'dropdown';
        return (
          '<li class="has-dropdown">' +
            '<a href="' + item.href + '" class="nav-top-link' + topCur + '">' +
              item.label +
              '<svg class="nav-caret" viewBox="0 0 24 24" width="11" height="11" aria-hidden="true">' +
                '<path fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" d="M6 9l6 6 6-6"/>' +
              '</svg>' +
            '</a>' +
            '<ul class="' + ddClass + '">' + kids + '</ul>' +
          '</li>'
        );
      }
      var cur = isActive(item.href) ? ' class="nav-top-link is-current"' : ' class="nav-top-link"';
      return '<li><a href="' + item.href + '"' + cur + '>' + item.label + '</a></li>';
    }).join('');

    return (
      '<ul class="nav-primary">' + items + '</ul>' +
      '<div class="mobile-contact-info">' +
        '<a href="tel:+61417221111">+61 417 221 111</a>' +
        '<a href="mailto:info@eeevents.com.au">info@eeevents.com.au</a>' +
        '<a href="index.html#contact" class="btn btn-gold" style="margin-top:0.75rem;border-radius:30px;width:100%;">Get a Quote</a>' +
      '</div>'
    );
  }

  function ensureHeaderShell() {
    var header = document.querySelector('.site-header') || document.getElementById('site-header');
    if (!header) return null;
    if (!header.id) header.id = 'site-header';

    var inner = header.querySelector('.header-inner');
    if (!inner) {
      inner = document.createElement('div');
      inner.className = 'container header-inner';
      header.appendChild(inner);
    }

    var nav = document.getElementById('main-nav') || header.querySelector('.main-nav');
    if (!nav) {
      nav = document.createElement('nav');
      nav.className = 'main-nav';
      nav.id = 'main-nav';
      nav.setAttribute('aria-label', 'Primary');
      inner.appendChild(nav);
    } else {
      nav.id = 'main-nav';
      nav.className = 'main-nav';
    }

    var actions = header.querySelector('.header-actions');
    if (!actions) {
      actions = document.createElement('div');
      actions.className = 'header-actions';
      inner.appendChild(actions);
    }

    if (!document.getElementById('nav-toggle')) {
      var btn = document.createElement('button');
      btn.className = 'nav-toggle';
      btn.id = 'nav-toggle';
      btn.type = 'button';
      btn.setAttribute('aria-label', 'Toggle navigation');
      btn.setAttribute('aria-expanded', 'false');
      btn.setAttribute('aria-controls', 'main-nav');
      btn.innerHTML = '<span></span><span></span><span></span>';
      actions.appendChild(btn);
    }

    if (!actions.querySelector('.header-cta, a.btn-gold')) {
      var quote = document.createElement('a');
      quote.href = 'index.html#contact';
      quote.className = 'btn btn-gold header-cta';
      quote.textContent = 'Get a Quote';
      actions.insertBefore(quote, actions.firstChild);
    }

    return nav;
  }

  function bindNav() {
    var navToggle = document.getElementById('nav-toggle');
    var mainNav = document.getElementById('main-nav');
    if (!mainNav) return;

    function closeMobile() {
      if (!mainNav || !navToggle) return;
      mainNav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      var spans = navToggle.querySelectorAll('span');
      if (spans[0]) spans[0].style.transform = '';
      if (spans[1]) spans[1].style.opacity = '';
      if (spans[2]) spans[2].style.transform = '';
      mainNav.querySelectorAll('.has-dropdown.open').forEach(function (li) {
        li.classList.remove('open');
      });
    }

    if (navToggle && !navToggle.dataset.bound) {
      navToggle.dataset.bound = '1';
      navToggle.addEventListener('click', function () {
        var isOpen = mainNav.classList.toggle('open');
        navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        var spans = navToggle.querySelectorAll('span');
        if (isOpen) {
          if (spans[0]) spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
          if (spans[1]) spans[1].style.opacity = '0';
          if (spans[2]) spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
        } else {
          closeMobile();
        }
      });
    }

    mainNav.querySelectorAll('.has-dropdown > a').forEach(function (link) {
      if (link.dataset.ddBound) return;
      link.dataset.ddBound = '1';
      link.addEventListener('click', function (e) {
        if (window.innerWidth <= 900) {
          e.preventDefault();
          var parent = link.parentElement;
          var wasOpen = parent.classList.contains('open');
          mainNav.querySelectorAll('.has-dropdown.open').forEach(function (li) {
            li.classList.remove('open');
          });
          if (!wasOpen) parent.classList.add('open');
        }
      });
    });

    mainNav.querySelectorAll('.dropdown a, .nav-primary > li:not(.has-dropdown) > a').forEach(function (a) {
      if (a.dataset.navBound) return;
      a.dataset.navBound = '1';
      a.addEventListener('click', function () {
        if (window.innerWidth <= 900) closeMobile();
      });
    });
  }

  function ensureCartAssets() {
    try {
      if (!document.querySelector('link[href="cart.css"]')) {
        var l = document.createElement('link');
        l.rel = 'stylesheet';
        l.href = 'cart.css';
        document.head.appendChild(l);
      }
      if (!window.EliteCart && !document.querySelector('script[src="elite-cart.js"]')) {
        var s = document.createElement('script');
        s.src = 'elite-cart.js';
        s.async = true;
        document.body.appendChild(s);
      } else if (window.EliteCart && window.EliteCart.renderFab) {
        window.EliteCart.renderFab();
      }
    } catch (e) {}
  }

  function socialHtml() {
    return SOCIALS.map(function (s) {
      return (
        '<a href="' + s.href + '" target="_blank" rel="noopener noreferrer" aria-label="' + s.label + '" title="' + s.label + '">' +
          s.icon +
        '</a>'
      );
    }).join('');
  }

  /** Topbar + footer socials (LinkedIn, YouTube, etc.) on every page */
  function ensureSocials() {
    try {
      var topRight = document.querySelector('.topbar-right');
      if (topRight) {
        topRight.innerHTML = socialHtml();
        topRight.classList.add('topbar-socials');
      }

      var footerSocials = document.querySelector('.footer-socials');
      if (footerSocials) {
        footerSocials.innerHTML = socialHtml();
      } else {
        var brand = document.querySelector('.footer-brand, .site-footer .footer-top-inner > div:first-child');
        if (brand && !brand.querySelector('.footer-socials')) {
          var wrap = document.createElement('div');
          wrap.className = 'footer-socials';
          wrap.innerHTML = socialHtml();
          brand.appendChild(wrap);
        }
      }
    } catch (e) {}
  }

  /** Fix footer legal links that still point to #contact */
  function ensureFooterLegalLinks() {
    try {
      var map = {
        'privacy policy': 'privacy-policy.html',
        'privacy': 'privacy-policy.html',
        'terms of service': 'terms.html',
        'terms of hire': 'terms.html',
        'terms': 'terms.html',
        'refund policy': 'refund-policy.html',
        'refunds': 'refund-policy.html',
        'legal centre': 'legal.html',
        'legal center': 'legal.html',
        'legal': 'legal.html',
        'nda': 'nda.html'
      };
      document.querySelectorAll('.footer-bottom-links a, .site-footer a, .footer-col a').forEach(function (a) {
        var label = (a.textContent || '').trim().toLowerCase();
        var href = (a.getAttribute('href') || '').trim();
        if (map[label] && (href === '#' || href === '#contact' || href.indexOf('#contact') !== -1 || !href)) {
          a.setAttribute('href', map[label]);
        }
      });
      // Ensure standard legal set exists in footer-bottom-links when present
      var links = document.querySelector('.footer-bottom-links');
      if (links && !links.querySelector('a[href="privacy-policy.html"]')) {
        var privacy = document.createElement('a');
        privacy.href = 'privacy-policy.html';
        privacy.textContent = 'Privacy Policy';
        links.insertBefore(privacy, links.firstChild);
      }
      if (links && !links.querySelector('a[href="terms.html"]')) {
        var terms = document.createElement('a');
        terms.href = 'terms.html';
        terms.textContent = 'Terms of Service';
        var after = links.querySelector('a[href="privacy-policy.html"]');
        if (after && after.nextSibling) links.insertBefore(terms, after.nextSibling);
        else links.appendChild(terms);
      }
      if (links && !links.querySelector('a[href="legal.html"]')) {
        var legal = document.createElement('a');
        legal.href = 'legal.html';
        legal.textContent = 'Legal Centre';
        links.appendChild(legal);
      }
    } catch (e) {}
  }

  function init() {
    try {
      var nav = ensureHeaderShell();
      if (nav) {
        nav.innerHTML = buildNavHtml();
        bindNav();
      }
      ensureSocials();
      ensureFooterLegalLinks();
      ensureCartAssets();
    } catch (err) {
      if (typeof console !== 'undefined' && console.warn) console.warn('site-nav', err);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
