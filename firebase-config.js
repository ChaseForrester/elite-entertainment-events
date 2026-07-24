/* Shared Firebase config (compat SDK). Load after firebase-*-compat.js scripts. */
(function (window) {
  var firebaseConfig = {
    projectId: 'elite-entertainment-and-events',
    appId: '1:382118825306:web:de90f67c0aed268eb9f763',
    databaseURL: 'https://elite-entertainment-and-events-default-rtdb.firebaseio.com',
    storageBucket: 'elite-entertainment-and-events.firebasestorage.app',
    apiKey: 'AIzaSyBQh3pFu5Hmiusn791esleiiVKNlcoKIPU',
    authDomain: 'elite-entertainment-and-events.firebaseapp.com',
    messagingSenderId: '382118825306'
  };

  window.ELITE_FIREBASE_CONFIG = firebaseConfig;

  function initEliteFirebase() {
    if (!window.firebase || !firebase.initializeApp) return null;
    try {
      if (!firebase.apps || !firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
      }
      var storage = null;
      try {
        if (firebase.storage) storage = firebase.storage();
      } catch (eS) {
        storage = null;
      }
      window.EliteFirebase = {
        app: firebase.app(),
        auth: firebase.auth ? firebase.auth() : null,
        db: firebase.firestore ? firebase.firestore() : null,
        storage: storage,
        ready: true
      };
      return window.EliteFirebase;
    } catch (e) {
      console.warn('Firebase init:', e && e.message);
      window.EliteFirebase = { ready: false, error: e };
      return null;
    }
  }

  window.initEliteFirebase = initEliteFirebase;

  if (window.firebase) {
    initEliteFirebase();
  }
})(window);
