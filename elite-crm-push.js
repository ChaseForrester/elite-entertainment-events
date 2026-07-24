/* Lightweight public-site CRM ingest → localStorage + Firestore crm_leads */
(function (global) {
  'use strict';

  var COLLECTION = 'crm_leads';
  var LS = 'elite_inquiries';

  function readLeads() {
    try { return JSON.parse(localStorage.getItem(LS) || '[]'); } catch (e) { return []; }
  }

  function writeLeads(list) {
    try { localStorage.setItem(LS, JSON.stringify(list)); } catch (e) {}
  }

  function ensureDb() {
    try {
      if (typeof global.initEliteFirebase === 'function') global.initEliteFirebase();
      if (global.EliteFirebase && EliteFirebase.db) return EliteFirebase.db;
      if (global.firebase && firebase.firestore) return firebase.firestore();
    } catch (e) {}
    return null;
  }

  function cloudSafe(lead) {
    var copy = JSON.parse(JSON.stringify(lead || {}));
    if (Array.isArray(copy.attachments)) {
      copy.attachments = copy.attachments.map(function (a) {
        return {
          id: a.id || '',
          name: a.name || 'file',
          type: a.type || 'file',
          size: a.size || 0,
          url: a.url || '',
          at: a.at || ''
          // no dataUrl on public push
        };
      });
    }
    copy.updatedAtIso = copy.updatedAtIso || new Date().toISOString();
    copy.createdAtIso = copy.createdAtIso || copy.updatedAtIso;
    copy.kanbanColumn = copy.kanbanColumn || 'new';
    copy.status = copy.status || 'New Enquiry';
    copy.priority = copy.priority || 'normal';
    copy.assigneeEmail = copy.assigneeEmail || '';
    copy.assigneeName = copy.assigneeName || '';
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

  /**
   * Persist enquiry for Super Admin CRM (all devices via Firebase when available).
   */
  function ingest(lead) {
    if (!lead || !lead.id) return { ok: false };

    // Prefer full EliteCRM when admin scripts present
    if (global.EliteCRM && typeof EliteCRM.ingestLead === 'function') {
      try {
        EliteCRM.ingestLead(lead, { skipCloud: false });
        return { ok: true, via: 'EliteCRM' };
      } catch (e) {}
    }

    var list = readLeads();
    var idx = list.findIndex(function (r) { return r.id === lead.id; });
    var payload = Object.assign({}, lead, {
      kanbanColumn: lead.kanbanColumn || 'new',
      status: lead.status || 'New Enquiry',
      priority: lead.priority || 'normal',
      assigneeEmail: lead.assigneeEmail || '',
      updatedAtIso: new Date().toISOString(),
      createdAtIso: lead.createdAtIso || new Date().toISOString(),
      updatedAt: new Date().toLocaleString(),
      order: lead.order || Date.now()
    });
    if (idx >= 0) list[idx] = Object.assign({}, list[idx], payload);
    else list.unshift(payload);
    writeLeads(list);

    var db = ensureDb();
    if (db) {
      try {
        db.collection(COLLECTION).doc(String(lead.id)).set(cloudSafe(payload), { merge: true }).catch(function () {});
        return { ok: true, via: 'firestore' };
      } catch (e2) {
        return { ok: true, via: 'local-only' };
      }
    }
    return { ok: true, via: 'local-only' };
  }

  global.EliteCRMPush = { ingest: ingest };
})(typeof window !== 'undefined' ? window : this);
