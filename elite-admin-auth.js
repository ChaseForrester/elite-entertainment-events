/* ═══════════════════════════════════════════════════
   Elite Super Admin authentication (production)
   - Allowlisted emails only
   - Firebase Auth when available (reset + change password)
   - Local hashed bootstrap password (changeable, never plaintext in UI)
   - Timed sessions (no permanent "authed=true" flag alone)
═══════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  /** Who may access Super Admin (official + operational accounts) */
  var ADMIN_EMAILS = [
    'info@eeevents.com.au',
    'bookings@eeevents.com.au',
    'stormychaseforrester@gmail.com'
  ];

  /**
   * Bootstrap password SHA-256 (hex).
   * Default password (change immediately after first login):
   * Elite#SuperAdmin2026
   * After change, hash is stored under LOCAL_HASH_KEY and this bootstrap is no longer used.
   */
  var BOOTSTRAP_HASH =
    '7142a264ba7c48738c2d276cd92c921dcedab8309805dbd9d3529a33e82fd02f';

  var LOCAL_HASH_KEY = 'elite_admin_pass_hash_v1';
  var SESSION_KEY = 'elite_admin_session_v2';
  var LEGACY_FLAG = 'elite_admin_authed'; // cleared on load / logout
  var SESSION_MS = 12 * 60 * 60 * 1000; // 12 hours
  var MIN_PASSWORD_LEN = 10;

  function normalizeEmail(email) {
    return String(email || '').trim().toLowerCase();
  }

  function isAllowlisted(email) {
    return ADMIN_EMAILS.indexOf(normalizeEmail(email)) !== -1;
  }

  function sha256Hex(str) {
    if (global.crypto && crypto.subtle && typeof TextEncoder !== 'undefined') {
      var data = new TextEncoder().encode(str);
      return crypto.subtle.digest('SHA-256', data).then(function (buf) {
        return Array.from(new Uint8Array(buf))
          .map(function (b) { return b.toString(16).padStart(2, '0'); })
          .join('');
      });
    }
    // Fallback for very old browsers — not ideal, but blocks empty password
    return Promise.resolve(legacyHash(str));
  }

  function legacyHash(str) {
    var h = 0;
    for (var i = 0; i < str.length; i++) {
      h = ((h << 5) - h) + str.charCodeAt(i);
      h |= 0;
    }
    return 'legacy_' + (h >>> 0).toString(16);
  }

  function getStoredLocalHash() {
    try {
      return localStorage.getItem(LOCAL_HASH_KEY) || '';
    } catch (e) {
      return '';
    }
  }

  function setStoredLocalHash(hex) {
    try {
      localStorage.setItem(LOCAL_HASH_KEY, hex);
    } catch (e) {}
  }

  function expectedLocalHash() {
    return getStoredLocalHash() || BOOTSTRAP_HASH;
  }

  function usingBootstrapPassword() {
    return !getStoredLocalHash();
  }

  function clearLegacyFlag() {
    try { localStorage.removeItem(LEGACY_FLAG); } catch (e) {}
  }

  function readSession() {
    try {
      var raw = localStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      var s = JSON.parse(raw);
      if (!s || !s.email || !s.at) return null;
      if (!isAllowlisted(s.email)) return null;
      if (Date.now() - Number(s.at) > SESSION_MS) {
        clearSession();
        return null;
      }
      return s;
    } catch (e) {
      return null;
    }
  }

  function writeSession(email, method) {
    var s = {
      email: normalizeEmail(email),
      method: method || 'local',
      at: Date.now()
    };
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(s));
      // Keep a short-lived compatibility flag for any older checks
      localStorage.setItem(LEGACY_FLAG, 'true');
    } catch (e) {}
    return s;
  }

  function clearSession() {
    try {
      localStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(LEGACY_FLAG);
    } catch (e) {}
  }

  function isAuthed() {
    return !!readSession();
  }

  function currentEmail() {
    var s = readSession();
    return s ? s.email : '';
  }

  function getFirebaseAuth() {
    try {
      if (global.EliteFirebase && EliteFirebase.auth) return EliteFirebase.auth;
      if (global.firebase && firebase.auth) return firebase.auth();
    } catch (e) {}
    return null;
  }

  function ensureFirebase() {
    if (typeof global.initEliteFirebase === 'function') {
      try { global.initEliteFirebase(); } catch (e) {}
    }
    return getFirebaseAuth();
  }

  function validatePasswordStrength(pass) {
    if (!pass || pass.length < MIN_PASSWORD_LEN) {
      return 'Password must be at least ' + MIN_PASSWORD_LEN + ' characters.';
    }
    if (!/[A-Z]/.test(pass) || !/[a-z]/.test(pass) || !/[0-9]/.test(pass)) {
      return 'Use upper & lower case letters and at least one number.';
    }
    return '';
  }

  /**
   * Sign in: allowlisted email + Firebase password OR local hashed password.
   * @returns {Promise<{ok:boolean, method?:string, email?:string, error?:string, mustChangePassword?:boolean}>}
   */
  function login(email, password) {
    email = normalizeEmail(email);
    password = String(password || '');

    if (!email || !password) {
      return Promise.resolve({ ok: false, error: 'Enter email and password.' });
    }
    if (!isAllowlisted(email)) {
      return Promise.resolve({
        ok: false,
        error: 'That email is not authorised for Super Admin.'
      });
    }

    var auth = ensureFirebase();

    // Prefer Firebase when available
    if (auth) {
      return auth.signInWithEmailAndPassword(email, password)
        .then(function () {
          writeSession(email, 'firebase');
          return {
            ok: true,
            method: 'firebase',
            email: email,
            mustChangePassword: false
          };
        })
        .catch(function (err) {
          // Fall through to local hash (bootstrap / offline)
          return tryLocalLogin(email, password, err);
        });
    }

    return tryLocalLogin(email, password, null);
  }

  function tryLocalLogin(email, password, firebaseErr) {
    return sha256Hex(password).then(function (hash) {
      if (hash === expectedLocalHash()) {
        writeSession(email, 'local');
        return {
          ok: true,
          method: 'local',
          email: email,
          mustChangePassword: usingBootstrapPassword()
        };
      }
      var msg = 'Incorrect email or password.';
      if (firebaseErr && firebaseErr.code === 'auth/too-many-requests') {
        msg = 'Too many attempts. Wait a few minutes and try again.';
      } else if (firebaseErr && firebaseErr.code === 'auth/network-request-failed') {
        msg = 'Network error. Check connection or use local Super Admin password.';
      }
      return { ok: false, error: msg };
    });
  }

  function logout() {
    clearSession();
    var auth = getFirebaseAuth();
    if (auth) {
      try { auth.signOut(); } catch (e) {}
    }
  }

  /**
   * Send Firebase password-reset email (allowlisted only).
   */
  function sendPasswordReset(email) {
    email = normalizeEmail(email);
    if (!email) {
      return Promise.resolve({ ok: false, error: 'Enter your Super Admin email first.' });
    }
    if (!isAllowlisted(email)) {
      return Promise.resolve({
        ok: false,
        error: 'That email is not authorised for Super Admin.'
      });
    }
    var auth = ensureFirebase();
    if (!auth) {
      return Promise.resolve({
        ok: false,
        error: 'Password reset by email needs Firebase. Use Change password after signing in with the local Super Admin password, or enable Firebase Auth.'
      });
    }
    return auth.sendPasswordResetEmail(email)
      .then(function () {
        return {
          ok: true,
          message: 'If this account exists in Firebase, a reset link was sent to ' + email + '. Check inbox and spam.'
        };
      })
      .catch(function (err) {
        // Do not reveal whether the user exists
        if (err && err.code === 'auth/user-not-found') {
          return {
            ok: true,
            message: 'If this account exists in Firebase, a reset link was sent. Check inbox and spam. For local Super Admin password, sign in with the bootstrap password and use Change password.'
          };
        }
        return {
          ok: false,
          error: (err && err.message) || 'Could not send reset email.'
        };
      });
  }

  /**
   * Change password for the signed-in Super Admin.
   * Updates local hash always; also updates Firebase when session method is firebase.
   */
  function changePassword(currentPassword, newPassword, confirmPassword) {
    var session = readSession();
    if (!session) {
      return Promise.resolve({ ok: false, error: 'Sign in first.' });
    }

    currentPassword = String(currentPassword || '');
    newPassword = String(newPassword || '');
    confirmPassword = String(confirmPassword || '');

    if (newPassword !== confirmPassword) {
      return Promise.resolve({ ok: false, error: 'New passwords do not match.' });
    }
    var strength = validatePasswordStrength(newPassword);
    if (strength) {
      return Promise.resolve({ ok: false, error: strength });
    }
    if (newPassword === currentPassword) {
      return Promise.resolve({ ok: false, error: 'New password must be different from the current one.' });
    }

    return sha256Hex(currentPassword).then(function (curHash) {
      var localOk = curHash === expectedLocalHash();
      var auth = ensureFirebase();
      var user = auth && auth.currentUser ? auth.currentUser : null;

      // Verify current password via Firebase reauth and/or local hash
      var verifyPromise;
      if (user && user.email && normalizeEmail(user.email) === session.email) {
        var cred = firebase.auth.EmailAuthProvider.credential(session.email, currentPassword);
        verifyPromise = user.reauthenticateWithCredential(cred)
          .then(function () { return { firebaseOk: true, localOk: localOk }; })
          .catch(function () {
            if (localOk) return { firebaseOk: false, localOk: true };
            return Promise.reject(new Error('Current password is incorrect.'));
          });
      } else if (localOk) {
        verifyPromise = Promise.resolve({ firebaseOk: false, localOk: true });
      } else if (auth && session.method === 'firebase') {
        // Try sign-in to verify
        verifyPromise = auth.signInWithEmailAndPassword(session.email, currentPassword)
          .then(function () {
            user = auth.currentUser;
            return { firebaseOk: true, localOk: false };
          })
          .catch(function () {
            return Promise.reject(new Error('Current password is incorrect.'));
          });
      } else {
        return Promise.resolve({ ok: false, error: 'Current password is incorrect.' });
      }

      return verifyPromise.then(function (v) {
        return sha256Hex(newPassword).then(function (newHash) {
          // Always update local hash so offline login uses the new password
          setStoredLocalHash(newHash);

          var firebaseUpdate = Promise.resolve();
          if (v.firebaseOk && auth && auth.currentUser) {
            firebaseUpdate = auth.currentUser.updatePassword(newPassword).catch(function (err) {
              // Local hash already updated; surface Firebase issue
              throw new Error(
                'Local Super Admin password updated, but Firebase update failed: ' +
                ((err && err.message) || 'try again after re-login')
              );
            });
          }

          return firebaseUpdate.then(function () {
            writeSession(session.email, v.firebaseOk ? 'firebase' : 'local');
            return {
              ok: true,
              message: v.firebaseOk
                ? 'Password updated for Firebase and local Super Admin access.'
                : 'Local Super Admin password updated. Use this password on admin pages. For email reset, create/link this user in Firebase Auth.'
            };
          });
        });
      }).catch(function (err) {
        return { ok: false, error: (err && err.message) || 'Could not change password.' };
      });
    });
  }

  /**
   * Wire a standard login form block.
   * opts: {
   * emailId, passId, submitId, statusId,
   * forgotId (optional button),
   * onSuccess(result),
   * redirect (optional url)
   * }
   */
  function bindLoginForm(opts) {
    opts = opts || {};
    var emailEl = document.getElementById(opts.emailId);
    var passEl = document.getElementById(opts.passId);
    var submitEl = document.getElementById(opts.submitId);
    var statusEl = opts.statusId ? document.getElementById(opts.statusId) : null;
    var forgotEl = opts.forgotId ? document.getElementById(opts.forgotId) : null;

    function setStatus(msg, isError) {
      if (!statusEl) {
        if (msg && isError) alert(msg);
        return;
      }
      statusEl.textContent = msg || '';
      statusEl.style.color = isError ? '#ff8a8a' : '#8fd18f';
    }

    function doLogin() {
      var email = emailEl ? emailEl.value : '';
      var pass = passEl ? passEl.value : '';
      if (submitEl) {
        submitEl.disabled = true;
        submitEl.dataset.original = submitEl.dataset.original || submitEl.textContent;
        submitEl.textContent = 'Signing in…';
      }
      setStatus('Checking credentials…', false);

      login(email, pass).then(function (result) {
        if (submitEl) {
          submitEl.disabled = false;
          submitEl.textContent = submitEl.dataset.original || 'Sign in';
        }
        if (!result.ok) {
          setStatus(result.error || 'Login failed.', true);
          return;
        }
        if (result.mustChangePassword) {
          setStatus('Signed in with bootstrap password — please change it now under Account.', false);
        } else {
          setStatus('Signed in.', false);
        }
        if (typeof opts.onSuccess === 'function') {
          opts.onSuccess(result);
        } else if (opts.redirect) {
          global.location.href = opts.redirect;
        }
      });
    }

    if (submitEl) {
      submitEl.addEventListener('click', function (e) {
        e.preventDefault();
        doLogin();
      });
    }
    if (passEl) {
      passEl.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          doLogin();
        }
      });
    }
    if (forgotEl) {
      forgotEl.addEventListener('click', function (e) {
        e.preventDefault();
        var email = emailEl ? emailEl.value : '';
        setStatus('Sending reset email…', false);
        sendPasswordReset(email).then(function (r) {
          if (r.ok) setStatus(r.message, false);
          else setStatus(r.error, true);
        });
      });
    }
  }

  /**
   * Wire change-password form.
   * opts: { currentId, nextId, confirmId, submitId, statusId, onSuccess }
   */
  function bindChangePasswordForm(opts) {
    opts = opts || {};
    var cur = document.getElementById(opts.currentId);
    var next = document.getElementById(opts.nextId);
    var conf = document.getElementById(opts.confirmId);
    var btn = document.getElementById(opts.submitId);
    var statusEl = opts.statusId ? document.getElementById(opts.statusId) : null;

    function setStatus(msg, isError) {
      if (!statusEl) {
        if (msg) alert(msg);
        return;
      }
      statusEl.textContent = msg || '';
      statusEl.style.color = isError ? '#ff8a8a' : '#8fd18f';
    }

    if (!btn) return;
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      btn.disabled = true;
      setStatus('Updating password…', false);
      changePassword(
        cur ? cur.value : '',
        next ? next.value : '',
        conf ? conf.value : ''
      ).then(function (r) {
        btn.disabled = false;
        if (!r.ok) {
          setStatus(r.error, true);
          return;
        }
        setStatus(r.message, false);
        if (cur) cur.value = '';
        if (next) next.value = '';
        if (conf) conf.value = '';
        if (typeof opts.onSuccess === 'function') opts.onSuccess(r);
      });
    });
  }

  // Invalidate insecure legacy sessions on script load
  (function migrateLegacy() {
    try {
      // Old flag without timed session → force re-login
      if (localStorage.getItem(LEGACY_FLAG) === 'true' && !localStorage.getItem(SESSION_KEY)) {
        localStorage.removeItem(LEGACY_FLAG);
      }
    } catch (e) {}
  })();

  global.EliteAdminAuth = {
    ADMIN_EMAILS: ADMIN_EMAILS.slice(),
    isAllowlisted: isAllowlisted,
    isAuthed: isAuthed,
    currentEmail: currentEmail,
    login: login,
    logout: logout,
    sendPasswordReset: sendPasswordReset,
    changePassword: changePassword,
    usingBootstrapPassword: usingBootstrapPassword,
    bindLoginForm: bindLoginForm,
    bindChangePasswordForm: bindChangePasswordForm,
    readSession: readSession,
    SESSION_HOURS: SESSION_MS / (60 * 60 * 1000)
  };
})(typeof window !== 'undefined' ? window : this);
