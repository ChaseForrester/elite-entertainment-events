/* ═══════════════════════════════════════════════════
   Elite CRM attachments — FULL files for Super Admin
   Primary: Firebase Storage download URLs
   Fallback: Firestore crm_files (chunked base64) so every
   enquiry file is openable/downloadable in the dashboard.
═══════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  var MAX_FILE_BYTES = 10 * 1024 * 1024;
  var FS_CHUNK = 700000; // under Firestore 1MB doc limit

  function ensureFirebase() {
    try {
      if (typeof global.initEliteFirebase === 'function') global.initEliteFirebase();
    } catch (e) {}
  }

  function getStorage() {
    ensureFirebase();
    if (global.EliteFirebase && EliteFirebase.storage) return EliteFirebase.storage;
    try {
      if (global.firebase && firebase.storage) return firebase.storage();
    } catch (e) {}
    return null;
  }

  function getDb() {
    ensureFirebase();
    if (global.EliteFirebase && EliteFirebase.db) return EliteFirebase.db;
    try {
      if (global.firebase && firebase.firestore) return firebase.firestore();
    } catch (e) {}
    return null;
  }

  function safeFileName(name) {
    return String(name || 'file')
      .replace(/[\\/]+/g, '_')
      .replace(/[^\w.\-()+ @]+/g, '_')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 140) || 'file';
  }

  function formatBytes(n) {
    n = Number(n) || 0;
    if (n < 1024) return n + ' B';
    if (n < 1024 * 1024) return Math.round(n / 1024) + ' KB';
    return (n / (1024 * 1024)).toFixed(1) + ' MB';
  }

  function readFileAsDataUrl(file) {
    return new Promise(function (resolve, reject) {
      if (!file) return resolve('');
      var reader = new FileReader();
      reader.onload = function () { resolve(String(reader.result || '')); };
      reader.onerror = function () { reject(reader.error || new Error('read failed')); };
      try { reader.readAsDataURL(file); } catch (e) { reject(e); }
    });
  }

  function uploadToStorage(leadId, file, attId) {
    var storage = getStorage();
    if (!storage) {
      return Promise.resolve({ url: '', storagePath: '', error: 'no-storage' });
    }
    var path = 'crm_attachments/' + String(leadId) + '/' +
      String(attId) + '_' + safeFileName(file.name);
    var ref = storage.ref(path);
    var meta = {
      contentType: file.type || 'application/octet-stream',
      customMetadata: { originalName: String(file.name || 'file'), leadId: String(leadId) }
    };
    return ref.put(file, meta)
      .then(function (snap) { return snap.ref.getDownloadURL(); })
      .then(function (url) {
        return { url: url, storagePath: path, error: '' };
      })
      .catch(function (err) {
        return {
          url: '',
          storagePath: path,
          error: (err && err.code) || (err && err.message) || 'storage-failed'
        };
      });
  }

  /**
   * Store full file body in Firestore (works without Storage bucket setup).
   * Small files: one doc with dataUrl. Large: meta + chunks subcollection.
   */
  function uploadToFirestore(leadId, file, attId, dataUrl) {
    var db = getDb();
    if (!db) {
      return Promise.resolve({ fileDocId: '', error: 'no-firestore' });
    }
    var docId = String(leadId) + '__' + String(attId);
    var ref = db.collection('crm_files').doc(docId);
    var meta = {
      leadId: String(leadId),
      attId: String(attId),
      name: file.name || 'file',
      type: file.type || 'application/octet-stream',
      size: file.size || 0,
      atIso: new Date().toISOString()
    };

    if (!dataUrl) {
      return Promise.resolve({ fileDocId: '', error: 'empty-body' });
    }

    if (dataUrl.length <= FS_CHUNK) {
      return ref.set(Object.assign({}, meta, {
        chunkCount: 1,
        dataUrl: dataUrl
      })).then(function () {
        return { fileDocId: docId, error: '' };
      }).catch(function (err) {
        return { fileDocId: '', error: (err && err.message) || 'fs-write-failed' };
      });
    }

    // Chunked write
    var chunks = [];
    for (var i = 0; i < dataUrl.length; i += FS_CHUNK) {
      chunks.push(dataUrl.slice(i, i + FS_CHUNK));
    }
    return ref.set(Object.assign({}, meta, {
      chunkCount: chunks.length,
      dataUrl: '' // body in subcollection
    })).then(function () {
      var chain = Promise.resolve();
      chunks.forEach(function (chunk, idx) {
        chain = chain.then(function () {
          return ref.collection('chunks').doc(String(idx)).set({ i: idx, d: chunk });
        });
      });
      return chain;
    }).then(function () {
      return { fileDocId: docId, error: '', chunkCount: chunks.length };
    }).catch(function (err) {
      return { fileDocId: '', error: (err && err.message) || 'fs-chunk-failed' };
    });
  }

  /**
   * Load full file body for Super Admin open/download.
   * Returns a usable href (https URL or data: URL).
   */
  function resolveDownloadHref(att) {
    if (!att) return Promise.resolve('');
    if (att.url && /^https?:\/\//i.test(att.url)) return Promise.resolve(att.url);
    if (att.dataUrl && String(att.dataUrl).indexOf('data:') === 0) return Promise.resolve(att.dataUrl);

    var docId = att.fileDocId || '';
    if (!docId && att.storagePath && String(att.storagePath).indexOf('crm_files/') === 0) {
      docId = String(att.storagePath).replace(/^crm_files\//, '');
    }
    if (!docId) return Promise.resolve('');

    var db = getDb();
    if (!db) return Promise.resolve('');

    return db.collection('crm_files').doc(docId).get().then(function (snap) {
      if (!snap.exists) return '';
      var data = snap.data() || {};
      if (data.dataUrl) return data.dataUrl;
      var count = data.chunkCount || 0;
      if (count < 2) return '';
      return db.collection('crm_files').doc(docId).collection('chunks')
        .orderBy('i')
        .get()
        .then(function (cs) {
          var parts = [];
          cs.forEach(function (c) {
            var row = c.data() || {};
            if (row.d) parts.push(row.d);
          });
          return parts.join('');
        });
    }).catch(function () { return ''; });
  }

  /**
   * Convert File[] → CRM attachment records with full-file access for Super Admin.
   * opts.leadId required.
   */
  function filesToAttachments(files, opts) {
    opts = opts || {};
    var leadId = opts.leadId || opts.id || '';
    var list = files || [];
    var stamp = Date.now().toString(36);

    return Promise.all(list.map(function (file, i) {
      var attId = 'A-' + stamp + '-' + i;
      var base = {
        id: attId,
        name: (file && file.name) || ('file-' + (i + 1)),
        type: (file && file.type) || 'application/octet-stream',
        size: (file && file.size) || 0,
        at: new Date().toLocaleString(),
        emailed: true,
        dataUrl: '',
        url: '',
        storagePath: '',
        fileDocId: '',
        cloudSafe: true,
        note: '',
        status: 'pending'
      };

      if (!file || !file.size) {
        base.status = 'empty';
        base.note = 'Empty file';
        return Promise.resolve(base);
      }
      if (file.size > MAX_FILE_BYTES) {
        base.status = 'too_large';
        base.note = 'Over 10MB — not stored in CRM';
        return Promise.resolve(base);
      }
      if (!leadId) {
        base.status = 'no_lead';
        base.note = 'Missing enquiry id for storage';
        return Promise.resolve(base);
      }

      // Always read full body once (needed for Firestore fallback + thumbs)
      return readFileAsDataUrl(file).then(function (dataUrl) {
        // 1) Try Firebase Storage first
        return uploadToStorage(leadId, file, attId).then(function (up) {
          if (up.url) {
            base.url = up.url;
            base.storagePath = up.storagePath || '';
            base.status = 'stored';
            base.note = 'Full file in CRM Storage · ' + formatBytes(base.size);
            // small image thumb for cards
            if (file.type && file.type.indexOf('image/') === 0 && file.size <= 400 * 1024) {
              base.dataUrl = dataUrl;
            }
            return base;
          }

          // 2) Firestore full-file store (works without Storage bucket)
          return uploadToFirestore(leadId, file, attId, dataUrl).then(function (fs) {
            if (fs.fileDocId) {
              base.fileDocId = fs.fileDocId;
              base.storagePath = 'crm_files/' + fs.fileDocId;
              base.status = 'stored';
              base.note = 'Full file in CRM · ' + formatBytes(base.size) +
                (fs.chunkCount ? (' · ' + fs.chunkCount + ' parts') : '');
              // Keep dataUrl on record for immediate open (also cached locally).
              // For huge files, still keep it — cloudSafeLead strips heavy bodies from lead doc.
              base.dataUrl = dataUrl;
              base.cloudSafe = true;
              return base;
            }

            // 3) Last resort: local dataUrl only
            base.dataUrl = dataUrl;
            base.status = 'local_only';
            base.note = 'Stored on this browser only (cloud upload failed' +
              (up.error ? ': ' + up.error : '') +
              (fs.error ? '; ' + fs.error : '') + ')';
            return base;
          });
        });
      }).catch(function (err) {
        base.status = 'error';
        base.note = 'Could not read file: ' + ((err && err.message) || 'error');
        return base;
      });
    }));
  }

  function attachFileToLead(leadId, file) {
    return filesToAttachments([file], { leadId: leadId }).then(function (rows) {
      return rows[0] || null;
    });
  }

  global.EliteAttachments = {
    MAX_FILE_BYTES: MAX_FILE_BYTES,
    formatBytes: formatBytes,
    safeFileName: safeFileName,
    getStorage: getStorage,
    getDb: getDb,
    uploadToStorage: uploadToStorage,
    uploadToFirestore: uploadToFirestore,
    filesToAttachments: filesToAttachments,
    attachFileToLead: attachFileToLead,
    resolveDownloadHref: resolveDownloadHref,
    readFileAsDataUrl: readFileAsDataUrl
  };

  function bridgeMail() {
    if (!global.EliteMail) return;
    global.EliteMail.filesToAttachments = function (files, opts) {
      return filesToAttachments(files, opts || {});
    };
    global.EliteMail.attachFileToLead = attachFileToLead;
    global.EliteMail.resolveDownloadHref = resolveDownloadHref;
  }
  bridgeMail();
  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', bridgeMail);
  }
})(typeof window !== 'undefined' ? window : this);
