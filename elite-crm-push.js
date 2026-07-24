/* Lightweight public-site CRM ingest → localStorage + Firestore (multi-device) */
(function (global) {
  'use strict';

  var COLLECTION = 'crm_leads';
  var LEGACY_INQ = 'inquiries';
  var FEED_COL = 'client_feed';
  var LS = 'elite_inquiries';
  var FEED_KEY = 'elite_client_feed';

  function readJson(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); } catch (e) { return fallback; }
  }

  function writeJson(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {}
  }

  function ensureDb() {
    try {
      if (typeof global.initEliteFirebase === 'function') global.initEliteFirebase();
      if (global.EliteFirebase && EliteFirebase.db) return EliteFirebase.db;
      if (global.firebase && firebase.firestore) return firebase.firestore();
    } catch (e) {}
    return null;
  }

  var MAX_CLOUD_BODY = 280000;
  var MAX_CLOUD_BUDGET = 750000;

  function cloudSafe(lead) {
    var copy;
    try { copy = JSON.parse(JSON.stringify(lead || {})); } catch (e) { copy = Object.assign({}, lead || {}); }
    if (Array.isArray(copy.attachments)) {
      var budget = MAX_CLOUD_BUDGET;
      copy.attachments = copy.attachments.map(function (a) {
        var out = {
          id: a.id || '',
          name: a.name || 'file',
          type: a.type || 'file',
          size: a.size || 0,
          url: a.url || '',
          storagePath: a.storagePath || '',
          fileDocId: a.fileDocId || '',
          at: a.at || '',
          emailed: a.emailed !== false,
          note: a.note || '',
          status: a.status || (a.url || a.fileDocId ? 'stored' : '')
        };
        // Prefer remote pointers; only tiny thumbs on the lead doc
        var body = a.dataUrl ? String(a.dataUrl) : '';
        if (!out.url && !out.fileDocId && body && body.length < Math.min(MAX_CLOUD_BODY, 80000) && body.length <= budget) {
          out.dataUrl = body;
          budget -= body.length;
        } else if (body && body.length < 60000 && body.length <= budget && /^data:image\//i.test(body)) {
          out.dataUrl = body;
          budget -= body.length;
        }
        return out;
      });
      copy.attachmentNames = copy.attachments.map(function (a) { return a.name; });
      copy.attachmentCount = copy.attachments.length;
    } else if (Array.isArray(copy.attachmentNames)) {
      copy.attachmentCount = copy.attachmentNames.length;
    }
    // Strip undefined (Firestore rejects them)
    Object.keys(copy).forEach(function (k) {
      if (copy[k] === undefined) delete copy[k];
    });
    copy.updatedAtIso = copy.updatedAtIso || new Date().toISOString();
    copy.createdAtIso = copy.createdAtIso || copy.updatedAtIso;
    copy.kanbanColumn = copy.kanbanColumn || 'new';
    copy.status = copy.status || 'New Enquiry';
    copy.priority = copy.priority || 'normal';
    copy.assigneeEmail = copy.assigneeEmail || '';
    copy.assigneeName = copy.assigneeName || '';
    copy.timestamp = copy.timestamp || new Date().toLocaleString();
    copy.activity = copy.activity || [{
      id: 'ACT-web',
      type: 'create',
      text: 'New enquiry from website',
      actor: 'Website',
      at: new Date().toLocaleString(),
      atIso: new Date().toISOString()
    }];
    copy.syncOrigin = 'website';
    return copy;
  }

  function pushClientFeed(entry) {
    var list = readJson(FEED_KEY, []);
    list.unshift(entry);
    writeJson(FEED_KEY, list.slice(0, 200));
    var db = ensureDb();
    if (db) {
      try {
        var id = entry.id || ('feed_' + Date.now());
        db.collection(FEED_COL).doc(String(id)).set(Object.assign({}, entry, {
          id: id,
          atIso: entry.atIso || new Date().toISOString()
        }), { merge: true }).catch(function () {});
      } catch (e) {}
    }
  }

  /**
   * Persist enquiry for Super Admin CRM (all devices via Firebase when available).
   * Also mirrors client_feed for consultations/messages so Ops Console fills.
   */
  function cacheAttachLocal(lead) {
    if (!lead || !lead.id || !Array.isArray(lead.attachments) || !lead.attachments.length) return;
    try {
      var key = 'elite_crm_attach_cache_v1';
      var map = readJson(key, {});
      map[lead.id] = lead.attachments.map(function (a) {
        return {
          id: a.id || '',
          name: a.name || 'file',
          type: a.type || 'file',
          size: a.size || 0,
          dataUrl: a.dataUrl || '',
          url: a.url || '',
          at: a.at || '',
          emailed: a.emailed !== false,
          note: a.note || ''
        };
      });
      writeJson(key, map);
    } catch (e) {}
  }

  function ingest(lead) {
    if (!lead || !lead.id) return { ok: false };

    // Prefer full EliteCRM when admin scripts present
    if (global.EliteCRM && typeof EliteCRM.ingestLead === 'function') {
      try {
        EliteCRM.ingestLead(lead, { skipCloud: false });
        maybeFeedFromLead(lead);
        return { ok: true, via: 'EliteCRM' };
      } catch (e) {}
    }

    var list = readJson(LS, []);
    var idx = list.findIndex(function (r) { return r.id === lead.id; });
    var payload = Object.assign({}, lead, {
      kanbanColumn: lead.kanbanColumn || 'new',
      status: lead.status || 'New Enquiry',
      priority: lead.priority || 'normal',
      assigneeEmail: lead.assigneeEmail || '',
      updatedAtIso: new Date().toISOString(),
      createdAtIso: lead.createdAtIso || new Date().toISOString(),
      updatedAt: new Date().toLocaleString(),
      timestamp: lead.timestamp || new Date().toLocaleString(),
      order: lead.order || Date.now(),
      attachmentNames: (lead.attachments || []).map(function (a) { return a.name; }).filter(Boolean)
        .concat(lead.attachmentNames || []).filter(function (v, i, arr) { return arr.indexOf(v) === i; }),
      attachmentCount: (lead.attachments && lead.attachments.length) || (lead.attachmentNames && lead.attachmentNames.length) || 0
    });
    if (idx >= 0) list[idx] = Object.assign({}, list[idx], payload);
    else list.unshift(payload);
    writeJson(LS, list);
    cacheAttachLocal(payload);

    maybeFeedFromLead(payload);

    var db = ensureDb();
    if (db) {
      try {
        var safe = cloudSafe(payload);
        db.collection(COLLECTION).doc(String(lead.id)).set(safe, { merge: true }).catch(function () {});
        // Legacy ops path
        db.collection(LEGACY_INQ).doc(String(lead.id)).set(safe, { merge: true }).catch(function () {});
        return { ok: true, via: 'firestore' };
      } catch (e2) {
        return { ok: true, via: 'local-only' };
      }
    }
    return { ok: true, via: 'local-only' };
  }

  function maybeFeedFromLead(lead) {
    var src = String(lead.source || lead.page || '').toLowerCase();
    var isClient =
      src.indexOf('consult') !== -1 ||
      src.indexOf('client') !== -1 ||
      src.indexOf('message') !== -1 ||
      /consultation/i.test(lead.service || '');
    if (!isClient && src !== 'consultation-modal' && src !== 'client-portal') return;

    var type = /message/i.test(src) || /message/i.test(lead.service || '')
      ? 'message'
      : 'consultation';
    pushClientFeed({
      id: 'feed_' + String(lead.id),
      at: lead.timestamp || new Date().toLocaleString(),
      atIso: lead.updatedAtIso || new Date().toISOString(),
      client: lead.email || lead.name || 'client',
      type: type,
      detail: (lead.service ? lead.service + ' — ' : '') + (lead.message || lead.consultation || ''),
      leadId: lead.id,
      name: lead.name || '',
      phone: lead.phone || ''
    });
  }

  global.EliteCRMPush = {
    ingest: ingest,
    pushClientFeed: pushClientFeed
  };
})(typeof window !== 'undefined' ? window : this);
