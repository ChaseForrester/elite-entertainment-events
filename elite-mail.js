/* ═══════════════════════════════════════════════════
   Elite Entertainment — shared form email delivery
   FormSubmit AJAX + multi-recipient CC + file attachments
═══════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  /** Official Elite inboxes — FormSubmit primary + CC */
  var EMAIL_PRIMARY = 'info@eeevents.com.au';

  /** Additional official inbox receives every submission via FormSubmit _cc */
  var EMAIL_CC = [
    'bookings@eeevents.com.au'
  ];

  var MAX_TOTAL_BYTES = 10 * 1024 * 1024; // FormSubmit 10MB limit
  var CC_STRING = EMAIL_CC.join(',');

  function allRecipients() {
    return [EMAIL_PRIMARY].concat(EMAIL_CC);
  }

  function recipientsLabel() {
    return allRecipients().join(', ');
  }

  /**
   * Collect File objects from file inputs / FileList / arrays.
   * @param {HTMLInputElement|FileList|File[]|null} source
   * @returns {File[]}
   */
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

  /**
   * Send enquiry via FormSubmit.
   * Always uses multipart FormData so file attachments work.
   *
   * @param {Object} fields Plain string fields (name, email, message, _subject, …)
   * @param {File[]|HTMLInputElement[]} [filesOrInputs]
   * @returns {Promise<{ok:boolean, data?:any, error?:any, recipients:string[]}>}
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
        recipients: allRecipients()
      });
    }
    files = check.files;

    var fd = new FormData();

    // Core identity fields
    if (fields.name) fd.append('name', String(fields.name));
    if (fields.email) fd.append('email', String(fields.email));
    if (fields.phone) fd.append('phone', String(fields.phone));

    // FormSubmit controls
    fd.append('_subject', String(fields._subject || fields.subject || '[Elite Enquiry] Website form'));
    fd.append('_template', String(fields._template || 'table'));
    fd.append('_captcha', 'false');
    fd.append('_cc', CC_STRING);
    // Reply-To the submitter when we have their email
    if (fields.email) fd.append('_replyto', String(fields.email));

    // Remaining payload fields (skip reserved / already set)
    var skip = {
      name: 1, email: 1, phone: 1,
      _subject: 1, subject: 1, _template: 1, _captcha: 1, _cc: 1, _replyto: 1
    };
    Object.keys(fields).forEach(function (key) {
      if (skip[key]) return;
      var val = fields[key];
      if (val == null || val === '') return;
      fd.append(key, typeof val === 'string' ? val : String(val));
    });

    // Attachments — FormSubmit accepts multiple file fields
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

    var url = 'https://formsubmit.co/ajax/' + encodeURIComponent(EMAIL_PRIMARY);

    return fetch(url, {
      method: 'POST',
      // Do NOT set Content-Type — browser sets multipart boundary for files
      headers: { Accept: 'application/json' },
      body: fd
    }).then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json().catch(function () { return {}; });
    }).then(function (data) {
      return { ok: true, data: data, recipients: allRecipients() };
    }).catch(function (err) {
      return { ok: false, error: err, recipients: allRecipients() };
    });
  }

  /**
   * Build a small reusable file-upload UI block (HTML string).
   * @param {Object} opts
   * @param {string} opts.id input id
   * @param {string} [opts.label]
   * @param {string} [opts.accept]
   * @param {boolean} [opts.multiple]
   * @param {string} [opts.hint]
   */
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

  /** Wire status text for a file input */
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

  var api = {
    EMAIL_PRIMARY: EMAIL_PRIMARY,
    EMAIL_CC: EMAIL_CC.slice(),
    allRecipients: allRecipients,
    recipientsLabel: recipientsLabel,
    collectFiles: collectFiles,
    validateFiles: validateFiles,
    sendEnquiry: sendEnquiry,
    fileFieldHtml: fileFieldHtml,
    bindFileStatus: bindFileStatus
  };

  global.EliteMail = api;
})(typeof window !== 'undefined' ? window : this);
