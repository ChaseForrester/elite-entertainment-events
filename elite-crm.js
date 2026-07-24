/* ═══════════════════════════════════════════════════
   Elite CRM — multi-device Kanban + team assignment
   LocalStorage (offline) + Firestore realtime (crm_leads)
═══════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  var COLLECTION = 'crm_leads';
  var TEAM_DOC = 'crm_settings/team';
  var LS_LEADS = 'elite_inquiries';
  var LS_CLIENTS = 'elite_clients';
  var LS_TEAM = 'elite_crm_team_v1';
  var LS_ATTACH = 'elite_crm_attach_cache_v1';
  var MAX_CLOUD_ATTACH_CHARS = 12000; // strip large dataUrls from cloud docs
  var LISTEN_LIMIT = 400;

  var KANBAN_COLUMNS = [
    { id: 'new', label: 'New Enquiry', color: '#c9a84c' },
    { id: 'contacted', label: 'Contacted', color: '#6db3f2' },
    { id: 'quoted', label: 'Quoted', color: '#b48cf2' },
    { id: 'negotiating', label: 'Negotiating', color: '#f0c060' },
    { id: 'booked', label: 'Booked / Won', color: '#55c555' },
    { id: 'lost', label: 'Lost / Closed', color: '#ff6b6b' }
  ];

  var PRIORITIES = [
    { id: 'low', label: 'Low', color: '#888' },
    { id: 'normal', label: 'Normal', color: '#c9a84c' },
    { id: 'high', label: 'High', color: '#f0a040' },
    { id: 'urgent', label: 'Urgent', color: '#ff5555' }
  ];

  var DEFAULT_TEAM = [
    { id: 'tm-info', name: 'Elite Info', email: 'info@eeevents.com.au', color: '#c9a84c', role: 'Super Admin' },
    { id: 'tm-bookings', name: 'Elite Bookings', email: 'bookings@eeevents.com.au', color: '#6db3f2', role: 'Bookings' },
    { id: 'tm-stormy', name: 'Stormy Forrester', email: 'stormychaseforrester@gmail.com', color: '#55c555', role: 'Super Admin' }
  ];

  var state = {
    syncing: false,
    online: typeof navigator !== 'undefined' ? navigator.onLine : true,
    lastSyncAt: null,
    lastError: '',
    unsubLeads: null,
    unsubTeam: null,
    listenersReady: false,
    suppressRemoteApply: false
  };

  function nowIso() {
    return new Date().toISOString();
  }

  function nowLocal() {
    return new Date().toLocaleString();
  }

  function readJson(key, fallback) {
    try {
      return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
    } catch (e) {
      return fallback;
    }
  }

  function writeJson(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn('CRM storage write failed', e);
    }
  }

  function emit(type, detail) {
    try {
      global.dispatchEvent(new CustomEvent(type, { detail: detail || {} }));
    } catch (e) {}
  }

  function getDb() {
    try {
      if (typeof global.initEliteFirebase === 'function') {
        try { global.initEliteFirebase(); } catch (e1) {}
      }
      if (global.EliteFirebase && EliteFirebase.db) return EliteFirebase.db;
      if (global.firebase && firebase.firestore) return firebase.firestore();
    } catch (e) {}
    return null;
  }

  function statusLabel(columnId) {
    var col = KANBAN_COLUMNS.find(function (c) { return c.id === columnId; });
    return col ? col.label : columnId;
  }

  function normalizeColumn(raw) {
    var s = String(raw || 'Pending').toLowerCase();
    if (s.includes('book') || s === 'won' || s === 'confirmed') return 'booked';
    if (s.includes('lost') || s.includes('reject') || s.includes('closed') || s === 'spam') return 'lost';
    if (s.includes('negot')) return 'negotiating';
    if (s.includes('quote') || s.includes('proposal')) return 'quoted';
    if (s.includes('contact') || s === 'lead' || s === 'in progress') return 'contacted';
    if (s === 'new' || s.includes('pend') || s === 'new enquiry') return 'new';
    if (KANBAN_COLUMNS.some(function (c) { return c.id === s; })) return s;
    return 'new';
  }

  function normalizePriority(raw) {
    var p = String(raw || 'normal').toLowerCase();
    if (p === 'low' || p === 'normal' || p === 'high' || p === 'urgent') return p;
    return 'normal';
  }

  function normalizeEmail(email) {
    return String(email || '').trim().toLowerCase();
  }

  function initials(name) {
    var parts = String(name || '?').trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return '?';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  function teamColor(email) {
    var m = getTeam().find(function (t) { return normalizeEmail(t.email) === normalizeEmail(email); });
    return (m && m.color) || '#888';
  }

  function teamName(email) {
    var m = getTeam().find(function (t) { return normalizeEmail(t.email) === normalizeEmail(email); });
    return (m && m.name) || email || 'Unassigned';
  }

  /* ─── Attachment local cache (keeps heavy dataUrls off Firestore) ─── */
  function attachCache() {
    return readJson(LS_ATTACH, {});
  }

  function setAttachCache(map) {
    writeJson(LS_ATTACH, map);
  }

  function cacheAttachments(leadId, attachments) {
    if (!leadId || !attachments || !attachments.length) return;
    var map = attachCache();
    map[leadId] = (attachments || []).map(function (a) {
      return {
        id: a.id,
        name: a.name,
        type: a.type,
        size: a.size,
        dataUrl: a.dataUrl || '',
        url: a.url || '',
        at: a.at
      };
    });
    setAttachCache(map);
  }

  function hydrateAttachments(lead) {
    if (!lead) return lead;
    var cached = attachCache()[lead.id] || [];
    if (!cached.length) return lead;
    var byId = {};
    cached.forEach(function (a) { if (a.id) byId[a.id] = a; });
    var byName = {};
    cached.forEach(function (a) { if (a.name) byName[a.name] = a; });
    lead.attachments = (lead.attachments || []).map(function (a) {
      var hit = (a.id && byId[a.id]) || (a.name && byName[a.name]);
      if (hit && !a.dataUrl && hit.dataUrl) {
        return Object.assign({}, a, { dataUrl: hit.dataUrl });
      }
      return a;
    });
    return lead;
  }

  function cloudSafeLead(lead) {
    var copy = JSON.parse(JSON.stringify(lead || {}));
    // Firestore rejects undefined; strip heavy attachment bodies
    if (Array.isArray(copy.attachments)) {
      copy.attachments = copy.attachments.map(function (a) {
        var out = {
          id: a.id || '',
          name: a.name || 'file',
          type: a.type || 'file',
          size: a.size || 0,
          url: a.url || '',
          at: a.at || ''
        };
        // Only keep tiny dataUrls (icons/snippets)
        if (a.dataUrl && String(a.dataUrl).length < MAX_CLOUD_ATTACH_CHARS) {
          out.dataUrl = a.dataUrl;
        }
        return out;
      });
    }
    // Prefer ISO timestamps for merge
    copy.updatedAtIso = copy.updatedAtIso || nowIso();
    copy.updatedAt = copy.updatedAt || nowLocal();
    // Remove undefined
    Object.keys(copy).forEach(function (k) {
      if (copy[k] === undefined) delete copy[k];
    });
    return copy;
  }

  function normalizeLead(raw, sourceHint) {
    if (!raw || typeof raw !== 'object') return null;
    var column = raw.kanbanColumn || normalizeColumn(raw.status);
    var attachments = Array.isArray(raw.attachments)
      ? raw.attachments
      : (Array.isArray(raw.attachmentNames)
          ? raw.attachmentNames.map(function (n) {
              return typeof n === 'string'
                ? { id: 'A-' + Math.random().toString(36).slice(2, 8), name: n, type: 'ref', size: 0, at: nowLocal() }
                : n;
            })
          : []);
    var activity = Array.isArray(raw.activity) ? raw.activity : [];
    var lead = {
      id: raw.id || ('LEAD-' + Date.now().toString(36)),
      name: raw.name || 'Unknown',
      email: raw.email || '',
      phone: raw.phone || '',
      date: raw.date || raw.eventDate || '',
      endDate: raw.endDate || '',
      dueDate: raw.dueDate || '',
      service: raw.service || raw.category || '',
      message: raw.message || '',
      budget: raw.budget || '',
      venue: raw.venue || '',
      guests: raw.guests || '',
      company: raw.company || '',
      status: statusLabel(column),
      kanbanColumn: column,
      priority: normalizePriority(raw.priority),
      assigneeEmail: normalizeEmail(raw.assigneeEmail || raw.assignee || ''),
      assigneeName: raw.assigneeName || '',
      notes: Array.isArray(raw.notes) ? raw.notes : [],
      attachments: attachments,
      activity: activity,
      source: raw.source || sourceHint || 'enquiry',
      page: raw.page || raw.category || '',
      timestamp: raw.timestamp || raw.at || nowLocal(),
      createdAtIso: raw.createdAtIso || raw.updatedAtIso || nowIso(),
      updatedAt: raw.updatedAt || raw.timestamp || nowLocal(),
      updatedAtIso: raw.updatedAtIso || nowIso(),
      order: typeof raw.order === 'number' ? raw.order : Date.now(),
      syncOrigin: raw.syncOrigin || 'local'
    };
    if (lead.assigneeEmail && !lead.assigneeName) {
      lead.assigneeName = teamName(lead.assigneeEmail);
    }
    return hydrateAttachments(lead);
  }

  function pushActivity(lead, type, text, actor) {
    var activity = (lead.activity || []).slice();
    activity.unshift({
      id: 'ACT-' + Date.now().toString(36),
      type: type || 'info',
      text: text || '',
      actor: actor || 'System',
      at: nowLocal(),
      atIso: nowIso()
    });
    // cap activity trail
    lead.activity = activity.slice(0, 80);
    return lead;
  }

  /* ─── Team ─── */
  function getTeam() {
    var team = readJson(LS_TEAM, null);
    if (!team || !team.length) {
      team = DEFAULT_TEAM.slice();
      writeJson(LS_TEAM, team);
    }
    return team;
  }

  function saveTeam(members, opts) {
    opts = opts || {};
    var clean = (members || []).map(function (m, i) {
      return {
        id: m.id || ('tm-' + Date.now().toString(36) + i),
        name: String(m.name || '').trim() || 'Team member',
        email: normalizeEmail(m.email),
        color: m.color || '#c9a84c',
        role: m.role || 'Admin'
      };
    }).filter(function (m) { return m.email; });
    writeJson(LS_TEAM, clean);
    if (!opts.skipCloud) pushTeamCloud(clean);
    emit('elite-crm-team', { team: clean });
    return clean;
  }

  function pushTeamCloud(team) {
    var db = getDb();
    if (!db) return Promise.resolve({ ok: false, offline: true });
    return db.doc(TEAM_DOC).set({
      members: team || getTeam(),
      updatedAtIso: nowIso()
    }, { merge: true }).then(function () {
      return { ok: true };
    }).catch(function (err) {
      state.lastError = (err && err.message) || 'Team sync failed';
      return { ok: false, error: state.lastError };
    });
  }

  /* ─── Local lead store ─── */
  function getLocalLeadsRaw() {
    return readJson(LS_LEADS, []);
  }

  function getAllLeads() {
    var inquiries = getLocalLeadsRaw().map(function (r) {
      return normalizeLead(r, r.source || 'enquiry');
    });
    var clients = readJson(LS_CLIENTS, []).map(function (r) {
      return normalizeLead(Object.assign({}, r, {
        service: r.service || 'Consultation',
        source: r.source || 'consultation'
      }), 'consultation');
    });
    var map = {};
    clients.forEach(function (l) { if (l) map[l.id] = l; });
    inquiries.forEach(function (l) { if (l) map[l.id] = l; });
    return Object.keys(map).map(function (k) { return map[k]; }).sort(function (a, b) {
      return (b.order || 0) - (a.order || 0);
    });
  }

  function getLeadsByColumn(filter) {
    filter = filter || {};
    var cols = {};
    KANBAN_COLUMNS.forEach(function (c) { cols[c.id] = []; });
    getAllLeads().forEach(function (lead) {
      if (filter.assigneeEmail && normalizeEmail(lead.assigneeEmail) !== normalizeEmail(filter.assigneeEmail)) return;
      if (filter.priority && lead.priority !== filter.priority) return;
      if (filter.q) {
        var q = String(filter.q).toLowerCase();
        var blob = [
          lead.name, lead.email, lead.phone, lead.service, lead.message,
          lead.venue, lead.company, lead.id, lead.source, lead.assigneeName, lead.assigneeEmail
        ].join(' ').toLowerCase();
        if (blob.indexOf(q) === -1) return;
      }
      var col = cols[lead.kanbanColumn] ? lead.kanbanColumn : 'new';
      cols[col].push(lead);
    });
    Object.keys(cols).forEach(function (k) {
      cols[k].sort(function (a, b) { return (b.order || 0) - (a.order || 0); });
    });
    return cols;
  }

  function writeLocalLead(payload) {
    var inquiries = getLocalLeadsRaw();
    var clients = readJson(LS_CLIENTS, []);
    var iqIdx = inquiries.findIndex(function (r) { return r.id === payload.id; });
    var clIdx = clients.findIndex(function (r) { return r.id === payload.id; });
    if (iqIdx >= 0) {
      inquiries[iqIdx] = Object.assign({}, inquiries[iqIdx], payload);
      writeJson(LS_LEADS, inquiries);
    } else if (clIdx >= 0) {
      clients[clIdx] = Object.assign({}, clients[clIdx], payload);
      writeJson(LS_CLIENTS, clients);
    } else {
      inquiries.unshift(payload);
      writeJson(LS_LEADS, inquiries);
    }
    if (payload.attachments && payload.attachments.length) {
      cacheAttachments(payload.id, payload.attachments);
    }
  }

  function pushLeadCloud(lead) {
    var db = getDb();
    if (!db) return Promise.resolve({ ok: false, offline: true });
    var safe = cloudSafeLead(lead);
    state.syncing = true;
    emit('elite-crm-sync', getSyncStatus());
    return db.collection(COLLECTION).doc(String(lead.id)).set(safe, { merge: true })
      .then(function () {
        state.syncing = false;
        state.lastSyncAt = nowIso();
        state.lastError = '';
        emit('elite-crm-sync', getSyncStatus());
        return { ok: true };
      })
      .catch(function (err) {
        state.syncing = false;
        state.lastError = (err && err.message) || 'Cloud save failed';
        emit('elite-crm-sync', getSyncStatus());
        return { ok: false, error: state.lastError };
      });
  }

  function saveLead(partial, opts) {
    opts = opts || {};
    if (!partial) partial = {};
    if (!partial.id) partial.id = 'CRM-' + Date.now().toString(36);
    var existing = getAllLeads().find(function (l) { return l.id === partial.id; }) || {};
    var merged = normalizeLead(Object.assign({}, existing, partial), partial.source || existing.source);
    merged.order = typeof partial.order === 'number' ? partial.order : (existing.order || Date.now());
    merged.updatedAtIso = nowIso();
    merged.updatedAt = nowLocal();
    merged.createdAtIso = existing.createdAtIso || merged.createdAtIso || nowIso();
    merged.syncOrigin = opts.origin || 'admin';

    // Auto activity for key field changes
    var actor = opts.actor || 'Super Admin';
    if (existing.id) {
      if (existing.kanbanColumn && existing.kanbanColumn !== merged.kanbanColumn) {
        pushActivity(merged, 'stage', 'Moved to ' + statusLabel(merged.kanbanColumn), actor);
      }
      if (normalizeEmail(existing.assigneeEmail) !== normalizeEmail(merged.assigneeEmail)) {
        pushActivity(
          merged,
          'assign',
          merged.assigneeEmail
            ? ('Assigned to ' + (merged.assigneeName || merged.assigneeEmail))
            : 'Unassigned',
          actor
        );
      }
      if (existing.priority && existing.priority !== merged.priority) {
        pushActivity(merged, 'priority', 'Priority set to ' + merged.priority, actor);
      }
    } else {
      pushActivity(merged, 'create', 'Enquiry created', actor);
    }

    writeLocalLead(merged);
    if (!opts.skipCloud) pushLeadCloud(merged);
    emit('elite-crm-updated', { id: merged.id, lead: merged });
    return merged;
  }

  function ingestLead(raw, opts) {
    opts = opts || {};
    var lead = normalizeLead(raw, raw && raw.source);
    if (!lead) return null;
    lead.createdAtIso = lead.createdAtIso || nowIso();
    lead.updatedAtIso = nowIso();
    lead.kanbanColumn = lead.kanbanColumn || 'new';
    lead.status = statusLabel(lead.kanbanColumn);
    if (!lead.activity || !lead.activity.length) {
      pushActivity(lead, 'create', 'New enquiry from ' + (lead.source || 'website'), 'Website');
    }
    writeLocalLead(lead);
    if (!opts.skipCloud) pushLeadCloud(lead);
    emit('elite-crm-updated', { id: lead.id, lead: lead });
    return lead;
  }

  function moveLeadToColumn(id, columnId, order, opts) {
    opts = opts || {};
    if (!KANBAN_COLUMNS.some(function (c) { return c.id === columnId; })) return null;
    var lead = getAllLeads().find(function (l) { return l.id === id; });
    if (!lead) return null;
    return saveLead(Object.assign({}, lead, {
      kanbanColumn: columnId,
      status: statusLabel(columnId),
      order: typeof order === 'number' ? order : Date.now()
    }), opts);
  }

  function assignLead(id, assigneeEmail, opts) {
    opts = opts || {};
    var lead = getAllLeads().find(function (l) { return l.id === id; });
    if (!lead) return null;
    var email = normalizeEmail(assigneeEmail);
    return saveLead(Object.assign({}, lead, {
      assigneeEmail: email,
      assigneeName: email ? teamName(email) : ''
    }), opts);
  }

  function setPriority(id, priority, opts) {
    return saveLead({ id: id, priority: normalizePriority(priority) }, opts);
  }

  function addLeadNote(id, text, author, opts) {
    var lead = getAllLeads().find(function (l) { return l.id === id; });
    if (!lead) return null;
    var notes = (lead.notes || []).slice();
    notes.unshift({
      id: 'N-' + Date.now().toString(36),
      text: String(text || '').trim(),
      author: author || 'Super Admin',
      at: nowLocal(),
      atIso: nowIso()
    });
    lead = Object.assign({}, lead, { notes: notes });
    pushActivity(lead, 'note', 'Note added', author || 'Super Admin');
    return saveLead(lead, opts);
  }

  function addLeadAttachment(id, attachment, opts) {
    var lead = getAllLeads().find(function (l) { return l.id === id; });
    if (!lead || !attachment) return null;
    var attachments = (lead.attachments || []).slice();
    attachments.push({
      id: attachment.id || ('A-' + Date.now().toString(36)),
      name: attachment.name || 'file',
      type: attachment.type || 'file',
      size: attachment.size || 0,
      dataUrl: attachment.dataUrl || '',
      url: attachment.url || '',
      at: nowLocal()
    });
    lead = Object.assign({}, lead, { attachments: attachments });
    pushActivity(lead, 'file', 'Attachment: ' + (attachment.name || 'file'), opts && opts.actor);
    return saveLead(lead, opts);
  }

  function removeLeadAttachment(id, attachmentId, opts) {
    var lead = getAllLeads().find(function (l) { return l.id === id; });
    if (!lead) return null;
    var attachments = (lead.attachments || []).filter(function (a) {
      return a.id !== attachmentId && a.name !== attachmentId;
    });
    return saveLead(Object.assign({}, lead, { attachments: attachments }), opts);
  }

  function deleteLead(id, opts) {
    opts = opts || {};
    writeJson(LS_LEADS, getLocalLeadsRaw().filter(function (r) { return r.id !== id; }));
    writeJson(LS_CLIENTS, readJson(LS_CLIENTS, []).filter(function (r) { return r.id !== id; }));
    var map = attachCache();
    delete map[id];
    setAttachCache(map);
    if (!opts.skipCloud) {
      var db = getDb();
      if (db) {
        db.collection(COLLECTION).doc(String(id)).delete().catch(function () {});
      }
    }
    emit('elite-crm-updated', { id: id, deleted: true });
  }

  function clearInquiries(opts) {
    opts = opts || {};
    writeJson(LS_LEADS, []);
    writeJson(LS_CLIENTS, []);
    writeJson(LS_ATTACH, {});
    if (!opts.skipCloud) {
      // Cloud clear is intentional only when admin confirms — batch delete not free on client
      // Leave cloud data; next merge will re-import unless deleted individually
    }
    emit('elite-crm-updated', { cleared: true });
  }

  function estimatePipeline() {
    return getAllLeads().filter(function (l) { return l.kanbanColumn !== 'lost'; }).length;
  }

  /* ─── Merge remote ─── */
  function isoTime(v) {
    var t = Date.parse(v || '');
    return isNaN(t) ? 0 : t;
  }

  function mergeAttachmentLists(localAtts, remoteAtts) {
    var map = {};
    (remoteAtts || []).forEach(function (a) {
      var key = a.id || a.name;
      if (key) map[key] = Object.assign({}, a);
    });
    (localAtts || []).forEach(function (a) {
      var key = a.id || a.name;
      if (!key) return;
      if (!map[key]) map[key] = a;
      else if (a.dataUrl && !map[key].dataUrl) map[key] = Object.assign({}, map[key], { dataUrl: a.dataUrl });
    });
    return Object.keys(map).map(function (k) { return map[k]; });
  }

  function applyRemoteLeads(remoteList) {
    if (state.suppressRemoteApply) return;
    var localMap = {};
    getAllLeads().forEach(function (l) { localMap[l.id] = l; });
    var changed = false;
    var nextInquiries = getLocalLeadsRaw().slice();

    function upsertLocal(lead) {
      var idx = nextInquiries.findIndex(function (r) { return r.id === lead.id; });
      if (idx >= 0) nextInquiries[idx] = Object.assign({}, nextInquiries[idx], lead);
      else nextInquiries.unshift(lead);
    }

    remoteList.forEach(function (raw) {
      var remote = normalizeLead(raw, raw.source || 'cloud');
      if (!remote) return;
      var local = localMap[remote.id];
      if (!local) {
        upsertLocal(remote);
        changed = true;
        return;
      }
      var remoteTs = isoTime(remote.updatedAtIso);
      var localTs = isoTime(local.updatedAtIso);
      if (remoteTs >= localTs) {
        var merged = Object.assign({}, remote, {
          attachments: mergeAttachmentLists(local.attachments, remote.attachments),
          notes: (remote.notes && remote.notes.length >= (local.notes || []).length)
            ? remote.notes
            : mergeById(local.notes, remote.notes),
          activity: mergeById(local.activity, remote.activity).slice(0, 80)
        });
        // Prefer richer fields if remote empty
        ['name', 'email', 'phone', 'message', 'service', 'venue'].forEach(function (f) {
          if (!merged[f] && local[f]) merged[f] = local[f];
        });
        upsertLocal(normalizeLead(merged));
        changed = true;
      }
    });

    if (changed) {
      writeJson(LS_LEADS, nextInquiries);
      emit('elite-crm-updated', { fromRemote: true });
    }
  }

  function mergeById(a, b) {
    var map = {};
    (b || []).forEach(function (item) {
      if (item && item.id) map[item.id] = item;
      else if (item) map[JSON.stringify(item).slice(0, 80)] = item;
    });
    (a || []).forEach(function (item) {
      if (item && item.id) {
        if (!map[item.id]) map[item.id] = item;
      }
    });
    return Object.keys(map).map(function (k) { return map[k]; });
  }

  function pullOnce() {
    var db = getDb();
    if (!db) return Promise.resolve({ ok: false, offline: true });
    state.syncing = true;
    emit('elite-crm-sync', getSyncStatus());
    return db.collection(COLLECTION).orderBy('updatedAtIso', 'desc').limit(LISTEN_LIMIT).get()
      .then(function (snap) {
        var remote = [];
        snap.forEach(function (doc) {
          remote.push(Object.assign({ id: doc.id }, doc.data()));
        });
        applyRemoteLeads(remote);
        state.syncing = false;
        state.lastSyncAt = nowIso();
        state.lastError = '';
        emit('elite-crm-sync', getSyncStatus());
        return { ok: true, count: remote.length };
      })
      .catch(function (err) {
        // Fallback without orderBy if index missing
        return db.collection(COLLECTION).limit(LISTEN_LIMIT).get().then(function (snap) {
          var remote = [];
          snap.forEach(function (doc) {
            remote.push(Object.assign({ id: doc.id }, doc.data()));
          });
          applyRemoteLeads(remote);
          state.syncing = false;
          state.lastSyncAt = nowIso();
          state.lastError = '';
          emit('elite-crm-sync', getSyncStatus());
          return { ok: true, count: remote.length, noIndex: true };
        }).catch(function (err2) {
          state.syncing = false;
          state.lastError = (err2 && err2.message) || (err && err.message) || 'Pull failed';
          emit('elite-crm-sync', getSyncStatus());
          return { ok: false, error: state.lastError };
        });
      });
  }

  function pushAllLocal() {
    var db = getDb();
    if (!db) return Promise.resolve({ ok: false, offline: true });
    var leads = getAllLeads();
    state.syncing = true;
    emit('elite-crm-sync', getSyncStatus());
    var batchSize = 40;
    var chain = Promise.resolve();
    var i = 0;
    function pushChunk(chunk) {
      var batch = db.batch();
      chunk.forEach(function (lead) {
        var ref = db.collection(COLLECTION).doc(String(lead.id));
        batch.set(ref, cloudSafeLead(lead), { merge: true });
      });
      return batch.commit();
    }
    while (i < leads.length) {
      (function (chunk) {
        chain = chain.then(function () { return pushChunk(chunk); });
      })(leads.slice(i, i + batchSize));
      i += batchSize;
    }
    return chain.then(function () {
      state.syncing = false;
      state.lastSyncAt = nowIso();
      state.lastError = '';
      emit('elite-crm-sync', getSyncStatus());
      return { ok: true, count: leads.length };
    }).catch(function (err) {
      state.syncing = false;
      state.lastError = (err && err.message) || 'Push all failed';
      emit('elite-crm-sync', getSyncStatus());
      return { ok: false, error: state.lastError };
    });
  }

  function startRealtime() {
    var db = getDb();
    if (!db) {
      state.lastError = 'Firebase offline — CRM works locally until connection is available.';
      emit('elite-crm-sync', getSyncStatus());
      return { ok: false, offline: true };
    }
    stopRealtime();

    try {
      state.unsubLeads = db.collection(COLLECTION)
        .orderBy('updatedAtIso', 'desc')
        .limit(LISTEN_LIMIT)
        .onSnapshot(function (snap) {
          var remote = [];
          snap.forEach(function (doc) {
            remote.push(Object.assign({ id: doc.id }, doc.data()));
          });
          applyRemoteLeads(remote);
          state.lastSyncAt = nowIso();
          state.lastError = '';
          state.listenersReady = true;
          emit('elite-crm-sync', getSyncStatus());
        }, function (err) {
          // Retry without composite index
          state.unsubLeads = db.collection(COLLECTION).limit(LISTEN_LIMIT).onSnapshot(function (snap) {
            var remote = [];
            snap.forEach(function (doc) {
              remote.push(Object.assign({ id: doc.id }, doc.data()));
            });
            applyRemoteLeads(remote);
            state.lastSyncAt = nowIso();
            state.listenersReady = true;
            emit('elite-crm-sync', getSyncStatus());
          }, function (err2) {
            state.lastError = (err2 && err2.message) || (err && err.message) || 'Realtime failed';
            emit('elite-crm-sync', getSyncStatus());
          });
        });
    } catch (e) {
      state.lastError = (e && e.message) || 'Realtime start failed';
    }

    try {
      state.unsubTeam = db.doc(TEAM_DOC).onSnapshot(function (doc) {
        if (doc.exists) {
          var data = doc.data() || {};
          if (Array.isArray(data.members) && data.members.length) {
            writeJson(LS_TEAM, data.members);
            emit('elite-crm-team', { team: data.members, fromRemote: true });
          }
        }
      }, function () {});
    } catch (e2) {}

    // Seed cloud with local if empty (first run)
    pullOnce().then(function (res) {
      if (res && res.ok && res.count === 0) {
        pushAllLocal();
        pushTeamCloud(getTeam());
      }
    });

    return { ok: true };
  }

  function stopRealtime() {
    try { if (state.unsubLeads) state.unsubLeads(); } catch (e) {}
    try { if (state.unsubTeam) state.unsubTeam(); } catch (e2) {}
    state.unsubLeads = null;
    state.unsubTeam = null;
    state.listenersReady = false;
  }

  function getSyncStatus() {
    return {
      online: state.online,
      syncing: state.syncing,
      lastSyncAt: state.lastSyncAt,
      lastError: state.lastError,
      listenersReady: state.listenersReady,
      firebase: !!getDb()
    };
  }

  // Online/offline
  if (typeof global.addEventListener === 'function') {
    global.addEventListener('online', function () {
      state.online = true;
      emit('elite-crm-sync', getSyncStatus());
      pullOnce();
    });
    global.addEventListener('offline', function () {
      state.online = false;
      emit('elite-crm-sync', getSyncStatus());
    });
  }

  var api = {
    KANBAN_COLUMNS: KANBAN_COLUMNS,
    PRIORITIES: PRIORITIES,
    DEFAULT_TEAM: DEFAULT_TEAM.slice(),
    getTeam: getTeam,
    saveTeam: saveTeam,
    teamName: teamName,
    teamColor: teamColor,
    initials: initials,
    getAllLeads: getAllLeads,
    getLeadsByColumn: getLeadsByColumn,
    normalizeLead: normalizeLead,
    ingestLead: ingestLead,
    saveLead: saveLead,
    moveLeadToColumn: moveLeadToColumn,
    assignLead: assignLead,
    setPriority: setPriority,
    addLeadNote: addLeadNote,
    addLeadAttachment: addLeadAttachment,
    removeLeadAttachment: removeLeadAttachment,
    deleteLead: deleteLead,
    clearInquiries: clearInquiries,
    estimatePipeline: estimatePipeline,
    startRealtime: startRealtime,
    stopRealtime: stopRealtime,
    pullOnce: pullOnce,
    pushAllLocal: pushAllLocal,
    getSyncStatus: getSyncStatus,
    statusLabel: statusLabel
  };

  global.EliteCRM = api;

  // Bridge older EliteCMS CRM methods if present
  function bridgeCms() {
    if (!global.EliteCMS) return;
    var cms = global.EliteCMS;
    cms.KANBAN_COLUMNS = KANBAN_COLUMNS;
    cms.getAllLeads = function () { return getAllLeads(); };
    cms.getLeadsByColumn = function (f) { return getLeadsByColumn(f || {}); };
    cms.saveLead = function (p) { return saveLead(p, { origin: 'admin' }); };
    cms.updateLeadStatus = function (id, next) {
      return moveLeadToColumn(id, normalizeColumn(next), Date.now(), { origin: 'admin' });
    };
    cms.moveLeadToColumn = function (id, col, order) {
      return moveLeadToColumn(id, col, order, { origin: 'admin' });
    };
    cms.addLeadNote = function (id, text, author) {
      return addLeadNote(id, text, author, { origin: 'admin', actor: author });
    };
    cms.addLeadAttachment = function (id, att) {
      return addLeadAttachment(id, att, { origin: 'admin' });
    };
    cms.removeLeadAttachment = function (id, attId) {
      return removeLeadAttachment(id, attId, { origin: 'admin' });
    };
    cms.deleteLead = function (id) { return deleteLead(id); };
    cms.clearInquiries = function () { return clearInquiries(); };
    cms.estimatePipeline = function () { return estimatePipeline(); };
    cms.getPartners = cms.getPartners || function () { return readJson('elite_partners', []); };
    cms.clearPartners = cms.clearPartners || function () { writeJson('elite_partners', []); };
    cms.updatePartnerStatus = cms.updatePartnerStatus || function (id, status) {
      var partners = readJson('elite_partners', []);
      var idx = partners.findIndex(function (p) { return p.id === id; });
      if (idx < 0) return null;
      partners[idx].status = status;
      writeJson('elite_partners', partners);
      return partners[idx];
    };
  }

  if (global.EliteCMS) bridgeCms();
  else {
    // cms.js may load after this file
    global.addEventListener('DOMContentLoaded', bridgeCms);
    setTimeout(bridgeCms, 0);
  }
})(typeof window !== 'undefined' ? window : this);
