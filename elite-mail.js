/* ═══════════════════════════════════════════════════
   Elite Entertainment — shared form email delivery
   Dual-inbox FormSubmit + full payload + attachments
═══════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  /** Official Elite inboxes — each receives a full FormSubmit delivery */
  var EMAIL_PRIMARY = 'info@eeevents.com.au';
  var EMAIL_CC = ['bookings@eeevents.com.au'];
  var ALL_INBOXES = [EMAIL_PRIMARY].concat(EMAIL_CC);

  var MAX_TOTAL_BYTES = 10 * 1024 * 1024; // FormSubmit 10MB limit

  function allRecipients() {
    return ALL_INBOXES.slice();
  }

  function recipientsLabel() {
    return ALL_INBOXES.join(', ');
  }

  function collectFiles(source) {
    var out = [];
    if (!source) return out;
    if (source instanceof File) {
      out.push(source);
      return out;
    }
    var list = source.files || source;
    if (!list || typeof list.length !== 'number') return out;
    for (var i = 0; i < list.length; i++) {
      if (list[i] instanceof File) out.push(list[i]);
    }
    return out;
  }

  function totalSize(files) {
    var n = 0;
    (files || []).forEach(function (f) { n += f.size || 0; });
    return n;
  }

  function validateFiles(files) {
    files = files || [];
    if (!files.length) return { ok: true, files: files };
    var size = totalSize(files);
    if (size > MAX_TOTAL_BYTES) {
      return {
        ok: false,
        error: 'Attachments total ' + (size / 1024 / 1024).toFixed(1) +
          'MB — please keep under 10MB combined (FormSubmit limit).'
      };
    }
    return { ok: true, files: files };
  }

  /** Per-file ceiling for CRM in-browser preview (localStorage / Indexed path). */
  var MAX_CRM_PREVIEW_BYTES = 1.5 * 1024 * 1024;
  /** Smaller files also sync as dataUrl across devices via Firestore. */
  var MAX_CRM_CLOUD_BYTES = 200 * 1024;

  function readFileAsDataUrl(file) {
    return new Promise(function (resolve, reject) {
      if (!file) return resolve('');
      var reader = new FileReader();
      reader.onload = function () { resolve(String(reader.result || '')); };
      reader.onerror = function () { reject(reader.error || new Error('read failed')); };
      try {
        reader.readAsDataURL(file);
      } catch (e) {
        reject(e);
      }
    });
  }

  /**
   * Convert File objects into CRM attachment records with real dataUrls
   * (when under size limits). Always returns name/type/size so the Kanban
   * card can list every client file even if the body is email-only.
   */
  function filesToAttachments(files, opts) {
    opts = opts || {};
    var maxPreview = opts.maxPreviewBytes || MAX_CRM_PREVIEW_BYTES;
    var maxCloud = opts.maxCloudBytes || MAX_CRM_CLOUD_BYTES;
    var list = files || [];
    var stamp = Date.now().toString(36);

    return Promise.all(list.map(function (file, i) {
      var base = {
        id: 'A-' + stamp + '-' + i,
        name: (file && file.name) || ('file-' + (i + 1)),
        type: (file && file.type) || 'application/octet-stream',
        size: (file && file.size) || 0,
        at: new Date().toLocaleString(),
        emailed: true,
        dataUrl: '',
        url: '',
        cloudSafe: false,
        note: ''
      };
      if (!file || !file.size) {
        base.note = 'Empty file';
        return Promise.resolve(base);
      }
      if (file.size > maxPreview) {
        base.note = 'Full file emailed to the team (over ' +
          Math.round(maxPreview / 1024) + 'KB CRM preview limit)';
        return Promise.resolve(base);
      }
      return readFileAsDataUrl(file).then(function (dataUrl) {
        base.dataUrl = dataUrl || '';
        base.cloudSafe = !!(file.size <= maxCloud && dataUrl);
        if (!base.cloudSafe && base.dataUrl) {
          base.note = 'Preview on this browser; full file also emailed to the team';
        }
        return base;
      }).catch(function () {
        base.note = 'Could not preview in CRM — full file still emailed to the team';
        return base;
      });
    }));
  }

  function flattenPayload(fields) {
    var lines = [];
    var keys = Object.keys(fields || {}).sort();
    keys.forEach(function (key) {
      if (key.charAt(0) === '_' || key === 'subject') return;
      var val = fields[key];
      if (val == null || val === '') return;
      lines.push(String(key).toUpperCase() + ':\n' + String(val));
    });
    return lines.join('\n\n');
  }

  /**
   * Build FormData for one recipient inbox.
   * Sends full details both as table fields and a complete text dump.
   */
  function buildFormData(fields, files, toEmail) {
    fields = fields || {};
    files = files || [];
    var fd = new FormData();

    var name = fields.name || fields.fullName || 'Website enquiry';
    var email = fields.email || fields.replyEmail || '';
    var phone = fields.phone || '';

    fd.append('name', String(name));
    if (email) fd.append('email', String(email));
    if (phone) fd.append('phone', String(phone));

    fd.append('_subject', String(fields._subject || fields.subject || '[Elite Enquiry] Website form'));
    fd.append('_template', String(fields._template || 'table'));
    fd.append('_captcha', 'false');
    // Help FormSubmit route replies to the customer
    if (email) fd.append('_replyto', String(email));
    // Honey pot empty
    fd.append('_honey', '');

    // CC the other official inboxes (in addition to dual-primary send)
    var others = ALL_INBOXES.filter(function (e) {
      return e.toLowerCase() !== String(toEmail || '').toLowerCase();
    });
    if (others.length) fd.append('_cc', others.join(','));

    // Delivered-to stamp
    fd.append('delivered_to', String(toEmail));
    fd.append('elite_inboxes', recipientsLabel());
    fd.append('site_url', (typeof location !== 'undefined' ? location.href : ''));
    fd.append('submitted_at', new Date().toISOString());

    var skip = {
      name: 1, fullName: 1, email: 1, replyEmail: 1, phone: 1,
      _subject: 1, subject: 1, _template: 1, _captcha: 1, _cc: 1, _replyto: 1, _honey: 1
    };

    Object.keys(fields).forEach(function (key) {
      if (skip[key]) return;
      var val = fields[key];
      if (val == null || val === '') return;
      // Flatten objects/arrays for email readability
      if (typeof val === 'object') {
        try { val = JSON.stringify(val, null, 2); } catch (e) { val = String(val); }
      }
      fd.append(key, String(val));
    });

    // Full dump so nothing is lost if table template truncates
    var full = flattenPayload(fields);
    if (full) {
      fd.append('full_enquiry_details', full);
      // Also map to FormSubmit's common "message" if empty
      if (!fields.message && !fields.Message) {
        fd.append('message', full);
      }
    }

    files.forEach(function (file, idx) {
      var fieldName = files.length === 1 ? 'attachment' : ('attachment_' + (idx + 1));
      fd.append(fieldName, file, file.name);
    });

    if (files.length) {
      fd.append('attachment_count', String(files.length));
      fd.append(
        'attachment_names',
        files.map(function (f) { return f.name + ' (' + Math.round(f.size / 1024) + 'KB)'; }).join('; ')
      );
    }

    return fd;
  }

  function postToInbox(toEmail, formData) {
    var url = 'https://formsubmit.co/ajax/' + encodeURIComponent(toEmail);
    return fetch(url, {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: formData
    }).then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (data) {
        return {
          ok: res.ok || !!(data && (data.success || data.message)),
          status: res.status,
          data: data,
          to: toEmail
        };
      });
    }).catch(function (err) {
      return { ok: false, error: err, to: toEmail };
    });
  }

  /**
   * Send enquiry to EVERY official inbox as a primary recipient
   * (more reliable than CC-only) and include the full form payload.
   */
  function sendEnquiry(fields, filesOrInputs) {
    fields = fields || {};
    var files = [];

    if (filesOrInputs) {
      if (Array.isArray(filesOrInputs)) {
        filesOrInputs.forEach(function (item) {
          if (item instanceof File) files.push(item);
          else files = files.concat(collectFiles(item));
        });
      } else {
        files = collectFiles(filesOrInputs);
      }
    }

    var check = validateFiles(files);
    if (!check.ok) {
      return Promise.resolve({
        ok: false,
        error: new Error(check.error),
        recipients: allRecipients(),
        results: []
      });
    }
    files = check.files;

    // Fire one full delivery per official inbox
    var jobs = ALL_INBOXES.map(function (inbox) {
      var fd = buildFormData(fields, files, inbox);
      return postToInbox(inbox, fd);
    });

    return Promise.all(jobs).then(function (results) {
      var anyOk = results.some(function (r) { return r && r.ok; });
      var allOk = results.every(function (r) { return r && r.ok; });
      var failed = results.filter(function (r) { return !r || !r.ok; }).map(function (r) { return r && r.to; });
      return {
        ok: anyOk,
        allOk: allOk,
        results: results,
        recipients: allRecipients(),
        failed: failed,
        error: anyOk ? null : new Error(
          'Email delivery failed for: ' + (failed.join(', ') || 'all inboxes') +
          '. Confirm FormSubmit for each address (check spam for “Confirm your email”).'
        )
      };
    });
  }

  function fileFieldHtml(opts) {
    opts = opts || {};
    var id = opts.id || 'elite-attachment';
    var label = opts.label || 'Attach docs / images (optional)';
    var accept = opts.accept || 'image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip';
    var multiple = opts.multiple !== false ? ' multiple' : '';
    var hint = opts.hint || 'Images, PDF, Word, Excel — max 10MB total. Files are emailed to the Elite team.';
    return (
      '<div class="form-group form-group--full elite-file-field">' +
        '<label for="' + id + '">' + label + '</label>' +
        '<div class="elite-file-drop">' +
          '<input type="file" id="' + id + '" name="' + id + '" accept="' + accept + '"' + multiple + ' />' +
          '<p class="elite-file-status" id="' + id + '-status" data-empty="true">No files selected</p>' +
        '</div>' +
        '<p class="elite-file-hint">' + hint + '</p>' +
      '</div>'
    );
  }

  function bindFileStatus(inputId) {
    var input = document.getElementById(inputId);
    var status = document.getElementById(inputId + '-status');
    if (!input || !status) return;
    input.addEventListener('change', function () {
      var files = collectFiles(input);
      if (!files.length) {
        status.textContent = 'No files selected';
        status.setAttribute('data-empty', 'true');
        return;
      }
      var names = files.map(function (f) {
        return f.name + ' (' + Math.round(f.size / 1024) + 'KB)';
      }).join(', ');
      status.textContent = files.length + ' file' + (files.length > 1 ? 's' : '') + ': ' + names;
      status.removeAttribute('data-empty');
    });
  }

  global.EliteMail = {
    EMAIL_PRIMARY: EMAIL_PRIMARY,
    EMAIL_CC: EMAIL_CC.slice(),
    ALL_INBOXES: ALL_INBOXES.slice(),
    allRecipients: allRecipients,
    recipientsLabel: recipientsLabel,
    collectFiles: collectFiles,
    validateFiles: validateFiles,
    totalSize: totalSize,
    readFileAsDataUrl: readFileAsDataUrl,
    filesToAttachments: filesToAttachments,
    sendEnquiry: sendEnquiry,
    fileFieldHtml: fileFieldHtml,
    bindFileStatus: bindFileStatus,
    MAX_TOTAL_BYTES: MAX_TOTAL_BYTES,
    MAX_CRM_PREVIEW_BYTES: MAX_CRM_PREVIEW_BYTES,
    MAX_CRM_CLOUD_BYTES: MAX_CRM_CLOUD_BYTES
  };
})(typeof window !== 'undefined' ? window : this);
