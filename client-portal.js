/* Client portal — local profile + Firebase Auth/Firestore when available */
(function () {
  var SESSION_KEY = 'elite_client_session';
  var PROFILES_KEY = 'elite_client_profiles';
  var FEED_KEY = 'elite_client_feed';

  function $(id) { return document.getElementById(id); }
  function msg(el, text, ok) {
    if (!el) return;
    el.textContent = text || '';
    el.className = 'client-msg' + (ok === true ? ' ok' : ok === false ? ' err' : '');
  }
  function profiles() {
    try { return JSON.parse(localStorage.getItem(PROFILES_KEY) || '{}'); } catch (e) { return {}; }
  }
  function saveProfiles(p) { localStorage.setItem(PROFILES_KEY, JSON.stringify(p)); }
  function session() {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); } catch (e) { return null; }
  }
  function setSession(s) {
    if (s) localStorage.setItem(SESSION_KEY, JSON.stringify(s));
    else localStorage.removeItem(SESSION_KEY);
  }
  function pushFeed(entry) {
    var list = [];
    try { list = JSON.parse(localStorage.getItem(FEED_KEY) || '[]'); } catch (e) {}
    list.unshift(entry);
    localStorage.setItem(FEED_KEY, JSON.stringify(list.slice(0, 200)));
    try {
      if (window.EliteFirebase && EliteFirebase.db) {
        EliteFirebase.db.collection('client_feed').add(entry).catch(function () {});
      }
    } catch (e) {}
  }

  function showApp(user) {
    $('client-auth-card').hidden = true;
    $('client-app').hidden = false;
    $('pf-name').value = user.name || '';
    $('pf-phone').value = user.phone || '';
    $('pf-company').value = user.company || '';
    $('pf-venues').value = user.venues || '';
    $('pf-notes').value = user.notes || '';
    renderThread(user);
    if (window.EliteCart) $('cl-cart-summary').textContent = EliteCart.summaryText() || 'Cart empty.';
  }

  function renderThread(user) {
    var box = $('cl-thread');
    var thread = user.messages || [];
    box.innerHTML = thread.map(function (m) {
      return '<div class="bubble ' + (m.from === 'admin' ? 'admin' : 'me') + '">' +
        String(m.text || '').replace(/</g, '&lt;') +
        '<time>' + (m.at || '') + '</time></div>';
    }).join('') || '<p class="client-msg">No messages yet. Say hello to Super Admin.</p>';
    box.scrollTop = box.scrollHeight;
  }

  function currentUser() {
    var s = session();
    if (!s || !s.email) return null;
    var p = profiles()[s.email.toLowerCase()];
    return p || null;
  }

  function persistUser(user) {
    var all = profiles();
    all[user.email.toLowerCase()] = user;
    saveProfiles(all);
    setSession({ email: user.email, name: user.name });
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (window.initEliteFirebase) initEliteFirebase();

    var u = currentUser();
    if (u) showApp(u);

    document.querySelectorAll('.client-tabs [data-tab]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('.client-tabs [data-tab]').forEach(function (b) { b.classList.remove('is-on'); });
        document.querySelectorAll('.client-panel').forEach(function (p) { p.classList.remove('is-on'); });
        btn.classList.add('is-on');
        var panel = $('tab-' + btn.getAttribute('data-tab'));
        if (panel) panel.classList.add('is-on');
      });
    });

    $('cl-register').onclick = function () {
      var email = ($('cl-email').value || '').trim().toLowerCase();
      var pass = $('cl-pass').value || '';
      var name = ($('cl-name').value || '').trim();
      if (!email || !pass || pass.length < 6) {
        msg($('cl-auth-msg'), 'Use a valid email and password (6+ characters).', false);
        return;
      }
      var all = profiles();
      if (all[email]) {
        msg($('cl-auth-msg'), 'Account exists — sign in instead.', false);
        return;
      }
      var user = {
        email: email,
        pass: pass, // local demo store only
        name: name || email.split('@')[0],
        phone: '',
        company: '',
        venues: '',
        notes: '',
        messages: [],
        createdAt: new Date().toISOString()
      };
      function done() {
        persistUser(user);
        showApp(user);
        pushFeed({ at: new Date().toLocaleString(), client: email, type: 'register', detail: 'New client account' });
        msg($('cl-auth-msg'), 'Account created.', true);
      }
      if (window.EliteFirebase && EliteFirebase.auth) {
        EliteFirebase.auth.createUserWithEmailAndPassword(email, pass)
          .then(done)
          .catch(function () { done(); }); // local fallback
      } else done();
    };

    $('cl-login').onclick = function () {
      var email = ($('cl-email').value || '').trim().toLowerCase();
      var pass = $('cl-pass').value || '';
      var all = profiles();
      var user = all[email];
      function ok(u) {
        persistUser(u);
        showApp(u);
        msg($('cl-auth-msg'), 'Signed in.', true);
      }
      if (user && user.pass === pass) {
        ok(user);
        return;
      }
      if (window.EliteFirebase && EliteFirebase.auth) {
        EliteFirebase.auth.signInWithEmailAndPassword(email, pass)
          .then(function () {
            if (!user) {
              user = { email: email, pass: pass, name: email.split('@')[0], messages: [] };
              all[email] = user;
              saveProfiles(all);
            }
            ok(user);
          })
          .catch(function () {
            msg($('cl-auth-msg'), 'Sign-in failed. Check details or register.', false);
          });
      } else {
        msg($('cl-auth-msg'), 'No local account found. Register first.', false);
      }
    };

    $('cl-logout').onclick = function () {
      setSession(null);
      try { if (EliteFirebase && EliteFirebase.auth) EliteFirebase.auth.signOut(); } catch (e) {}
      $('client-app').hidden = true;
      $('client-auth-card').hidden = false;
    };

    $('pf-save').onclick = function () {
      var user = currentUser();
      if (!user) return;
      user.name = $('pf-name').value.trim();
      user.phone = $('pf-phone').value.trim();
      user.company = $('pf-company').value.trim();
      user.venues = $('pf-venues').value.trim();
      user.notes = $('pf-notes').value.trim();
      persistUser(user);
      pushFeed({ at: new Date().toLocaleString(), client: user.email, type: 'profile', detail: 'Profile updated' });
      msg($('pf-msg'), 'Profile saved.', true);
    };

    $('cs-book').onclick = function () {
      var user = currentUser();
      if (!user) return;
      var date = $('cs-date').value;
      var time = $('cs-time').value;
      if (!date || !time) {
        msg($('cs-msg'), 'Choose date and time.', false);
        return;
      }
      var detail = date + ' ' + time + ' (' + $('cs-tz').value + ') · ' + $('cs-mode').value + ' · ' + ($('cs-brief').value || '');
      var consult = {
        id: 'CS-' + Date.now(),
        date: date,
        time: time,
        tz: $('cs-tz').value,
        mode: $('cs-mode').value,
        brief: $('cs-brief').value.trim(),
        status: 'Requested',
        at: new Date().toLocaleString()
      };
      user.consultations = user.consultations || [];
      user.consultations.unshift(consult);
      persistUser(user);
      pushFeed({ at: consult.at, client: user.email, type: 'consultation', detail: detail });
      try {
        var inquiries = JSON.parse(localStorage.getItem('elite_inquiries') || '[]');
        inquiries.unshift({
          id: consult.id,
          name: user.name,
          email: user.email,
          phone: user.phone || '—',
          date: date,
          service: 'Client consultation · ' + $('cs-mode').value,
          message: detail,
          status: 'Pending',
          timestamp: consult.at,
          source: 'client-portal'
        });
        localStorage.setItem('elite_inquiries', JSON.stringify(inquiries));
        try {
          var crmLead = {
            id: consult.id,
            name: user.name,
            email: user.email,
            phone: user.phone || '',
            date: date,
            service: 'Client consultation · ' + $('cs-mode').value,
            message: detail,
            status: 'New Enquiry',
            kanbanColumn: 'new',
            priority: 'normal',
            timestamp: consult.at,
            source: 'client-portal',
            order: Date.now()
          };
          if (window.EliteCRMPush && EliteCRMPush.ingest) EliteCRMPush.ingest(crmLead);
          else if (window.EliteCRM && EliteCRM.ingestLead) EliteCRM.ingestLead(crmLead);
        } catch (crmE) {}
      } catch (e) {}
      // email full Elite team via EliteMail / FormSubmit
      try {
        if (window.EliteMail) {
          window.EliteMail.sendEnquiry({
            name: user.name,
            email: user.email,
            phone: user.phone || '—',
            _subject: '[Elite Consultation] ' + user.name + ' · ' + date,
            consultation: detail,
            source: 'client-portal'
          }).catch(function () {});
        }
      } catch (e) {}
      msg($('cs-msg'), 'Consultation requested. Super Admin will confirm.', true);
    };

    $('cl-send').onclick = function () {
      var user = currentUser();
      if (!user) return;
      var text = ($('cl-message').value || '').trim();
      if (!text) return;
      var m = { from: 'client', text: text, at: new Date().toLocaleString() };
      user.messages = user.messages || [];
      user.messages.push(m);
      persistUser(user);
      $('cl-message').value = '';
      renderThread(user);
      pushFeed({ at: m.at, client: user.email, type: 'message', detail: text });
      try {
        if (window.EliteMail) {
          window.EliteMail.sendEnquiry({
            name: user.name,
            email: user.email,
            phone: user.phone || '—',
            _subject: '[Elite Client Message] ' + user.name,
            message: text,
            source: 'client-portal'
          }).catch(function () {});
        }
      } catch (e) {}
      msg($('cl-msg-status'), 'Message sent to Super Admin.', true);
    };
  });
})();
