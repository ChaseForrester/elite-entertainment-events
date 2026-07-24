/* Multi-step enquiry forms for service pages — Admin CRM + multi-recipient email + attachments */
(function () {
  function mail() {
    return window.EliteMail || null;
  }

  function recipientsText() {
    var m = mail();
    return m ? m.recipientsLabel() : 'info@eeevents.com.au, bookings@eeevents.com.au';
  }

  var CONFIGS = {
    weddings: {
      title: 'Wedding Enquiry',
      steps: [
        { key: 'couple', label: 'Your Details', fields: [
          { id: 'sf-name', label: 'Couple / Contact Name *', type: 'text', required: true },
          { id: 'sf-email', label: 'Email *', type: 'email', required: true },
          { id: 'sf-phone', label: 'Phone *', type: 'tel', required: true }
        ]},
        { key: 'event', label: 'Wedding Details', fields: [
          { id: 'sf-date', label: 'Wedding Date *', type: 'date', required: true, calendar: true },
          { id: 'sf-end-date', label: 'End date (if multi-day)', type: 'date', calendar: true },
          { id: 'sf-venue', label: 'Venue / Suburb *', type: 'text', required: true },
          { id: 'sf-guests', label: 'Guest Numbers', type: 'text' }
        ]},
        { key: 'entertainment', label: 'Entertainment', fields: [
          { id: 'sf-packages', label: 'Packages of interest', type: 'textarea', placeholder: 'Select packages from the catalogue above, or type (e.g. Ceremony musicians + Wedding DJ)' },
          { id: 'sf-service', label: 'Primary focus *', type: 'select', required: true, options: [
            'Ceremony musicians', 'Cocktail hour duo', 'Reception party band', 'Wedding DJ',
            'MC / Host', 'Full wedding package', 'Not sure — need advice'
          ]},
          { id: 'sf-budget', label: 'Budget (AUD)', type: 'text' },
          { id: 'sf-message', label: 'Vision & notes', type: 'textarea' }
        ]}
      ]
    },
    corporate: {
      title: 'Corporate Enquiry',
      steps: [
        { key: 'contact', label: 'Contact', fields: [
          { id: 'sf-name', label: 'Full Name *', type: 'text', required: true },
          { id: 'sf-email', label: 'Work Email *', type: 'email', required: true },
          { id: 'sf-phone', label: 'Phone *', type: 'tel', required: true },
          { id: 'sf-company', label: 'Company', type: 'text' }
        ]},
        { key: 'event', label: 'Event', fields: [
          { id: 'sf-date', label: 'Event Date *', type: 'date', required: true, calendar: true },
          { id: 'sf-end-date', label: 'End date (if multi-day)', type: 'date', calendar: true },
          { id: 'sf-venue', label: 'Venue / City *', type: 'text', required: true },
          { id: 'sf-guests', label: 'Guest / Delegate Numbers', type: 'text' }
        ]},
        { key: 'needs', label: 'Requirements', fields: [
          { id: 'sf-packages', label: 'Packages of interest', type: 'textarea', placeholder: 'Select packages from the catalogue above, or type (e.g. Awards MC + Party band)' },
          { id: 'sf-service', label: 'Entertainment Type *', type: 'select', required: true, options: [
            'Keynote / celebrity talent', 'Party band', 'Corporate DJ', 'MC / awards host',
            'Comedy', 'Production show', 'Background classical / jazz', 'Full package'
          ]},
          { id: 'sf-budget', label: 'Budget (AUD)', type: 'text' },
          { id: 'sf-message', label: 'Brief / brand notes', type: 'textarea' }
        ]}
      ]
    },
    parties: {
      title: 'Private Party Enquiry',
      steps: [
        { key: 'contact', label: 'Contact', fields: [
          { id: 'sf-name', label: 'Full Name *', type: 'text', required: true },
          { id: 'sf-email', label: 'Email *', type: 'email', required: true },
          { id: 'sf-phone', label: 'Phone *', type: 'tel', required: true }
        ]},
        { key: 'event', label: 'Party Details', fields: [
          { id: 'sf-date', label: 'Party Date *', type: 'date', required: true, calendar: true },
          { id: 'sf-end-date', label: 'End date (if multi-day)', type: 'date', calendar: true },
          { id: 'sf-venue', label: 'Venue / Suburb *', type: 'text', required: true },
          { id: 'sf-guests', label: 'Guest Numbers', type: 'text' }
        ]},
        { key: 'vibe', label: 'Vibe', fields: [
          { id: 'sf-packages', label: 'Packages of interest', type: 'textarea', placeholder: 'Select packages from the catalogue above, or type (e.g. Party band + Karaoke)' },
          { id: 'sf-service', label: 'What do you need? *', type: 'select', required: true, options: [
            'Party band', 'DJ', 'Duo / cocktail set', 'Karaoke', 'Tribute act',
            'Roving entertainment', 'Dance troupe', 'Mixed package'
          ]},
          { id: 'sf-budget', label: 'Budget (AUD)', type: 'text' },
          { id: 'sf-message', label: 'Theme & special requests', type: 'textarea' }
        ]}
      ]
    },
    'luxury-car': {
      title: 'Luxury Fleet Enquiry',
      steps: [
        { key: 'contact', label: 'Contact', fields: [
          { id: 'sf-name', label: 'Full Name *', type: 'text', required: true },
          { id: 'sf-email', label: 'Email *', type: 'email', required: true },
          { id: 'sf-phone', label: 'Phone *', type: 'tel', required: true }
        ]},
        { key: 'hire', label: 'Hire Details', fields: [
          { id: 'sf-date', label: 'Hire start date *', type: 'date', required: true, calendar: true },
          { id: 'sf-end-date', label: 'Hire end date', type: 'date', calendar: true },
          { id: 'sf-venue', label: 'Pickup Suburb / Venue *', type: 'text', required: true },
          { id: 'sf-dropoff', label: 'Drop-off location (if different)', type: 'text' },
          { id: 'sf-guests', label: 'Duration (hours / days)', type: 'text' }
        ]},
        { key: 'vehicle', label: 'Vehicles & Bikes', fields: [
          { id: 'sf-vehicles', label: 'Vehicles / bikes of interest *', type: 'textarea', required: true, placeholder: 'Select from the garage above, or type models (e.g. Rolls-Royce Phantom + 2 supercars)' },
          { id: 'sf-quantity', label: 'How many vehicles / bikes? *', type: 'text', required: true, placeholder: 'e.g. 1 wedding car + 2 supercars, or 3 bikes' },
          { id: 'sf-service', label: 'Occasion *', type: 'select', required: true, options: [
            'Wedding car package',
            'VIP / executive transfer',
            'Red carpet / premiere',
            'Photoshoot / content',
            'Weekend supercar experience',
            'Multi-vehicle convoy',
            'Motorcycle hire',
            'Corporate event fleet',
            'Birthday / celebration',
            'Not sure — need advice'
          ]},
          { id: 'sf-drive', label: 'Drive preference *', type: 'select', required: true, options: [
            'Chauffeur-driven',
            'Self-drive',
            'Mix of both',
            'Not sure'
          ]},
          { id: 'sf-message', label: 'Occasion details & special requests', type: 'textarea', placeholder: 'Colours preferred, passenger numbers, chauffeur notes, multi-car schedule…' }
        ]}
      ]
    },
    'luxury-yacht': {
      title: 'Luxury Yacht Charter Enquiry',
      steps: [
        { key: 'contact', label: 'Contact', fields: [
          { id: 'sf-name', label: 'Full Name *', type: 'text', required: true },
          { id: 'sf-email', label: 'Email *', type: 'email', required: true },
          { id: 'sf-phone', label: 'Phone *', type: 'tel', required: true },
          { id: 'sf-company', label: 'Company (if corporate)', type: 'text' }
        ]},
        { key: 'charter', label: 'Charter', fields: [
          { id: 'sf-date', label: 'Charter start date *', type: 'date', required: true, calendar: true },
          { id: 'sf-end-date', label: 'Charter end date (if multi-day)', type: 'date', calendar: true },
          { id: 'sf-venue', label: 'Preferred harbour / marina *', type: 'text', required: true, placeholder: 'e.g. Sydney Harbour, Circular Quay, Rose Bay' },
          { id: 'sf-guests', label: 'Guest numbers *', type: 'text', required: true, placeholder: 'e.g. 40 cocktail / 24 seated' },
          { id: 'sf-duration', label: 'Duration (hours / overnight)', type: 'text', placeholder: 'e.g. 4 hours, sunset cruise, overnight' }
        ]},
        { key: 'vessels', label: 'Vessels', fields: [
          { id: 'sf-yachts', label: 'Vessels of interest *', type: 'textarea', required: true, placeholder: 'Select from the fleet above, or type boat names (e.g. Ghost 2 + a support vessel)' },
          { id: 'sf-quantity', label: 'How many vessels? *', type: 'text', required: true, placeholder: 'e.g. 1 superyacht, or 2 boats for a convoy' },
          { id: 'sf-service', label: 'Occasion *', type: 'select', required: true, options: [
            'Private yacht charter',
            'Wedding on water',
            'Corporate harbour event',
            'Team building',
            'Birthday / celebration',
            'Christmas party',
            'Product launch / media',
            'Overnight charter',
            'Multi-vessel package',
            'Full production + entertainment',
            'Not sure — need advice'
          ]},
          { id: 'sf-catering', label: 'Catering preference', type: 'select', options: [
            'Full catering package',
            'Canapés & drinks',
            'BYO food / drink',
            'Mix / flexible',
            'Not sure'
          ]},
          { id: 'sf-message', label: 'Catering, entertainment & special requests', type: 'textarea', placeholder: 'DJ / live band, décor, boarding time, accessibility, multi-boat schedule…' }
        ]}
      ]
    },
    models: {
      title: 'Models & Dancers Enquiry',
      steps: [
        { key: 'contact', label: 'Contact', fields: [
          { id: 'sf-name', label: 'Full Name *', type: 'text', required: true },
          { id: 'sf-email', label: 'Email *', type: 'email', required: true },
          { id: 'sf-phone', label: 'Phone *', type: 'tel', required: true },
          { id: 'sf-company', label: 'Company / brand (if corporate)', type: 'text' }
        ]},
        { key: 'event', label: 'Event', fields: [
          { id: 'sf-date', label: 'Event Date *', type: 'date', required: true, calendar: true },
          { id: 'sf-end-date', label: 'End date (if multi-day)', type: 'date', calendar: true },
          { id: 'sf-venue', label: 'Venue / City *', type: 'text', required: true, placeholder: 'e.g. Sydney CBD, ICC, private residence' },
          { id: 'sf-guests', label: 'Guest / audience size', type: 'text', placeholder: 'e.g. 200 cocktail' },
          { id: 'sf-duration', label: 'Performance window / hours', type: 'text', placeholder: 'e.g. 2 × 15-min sets, 4 hours roving' }
        ]},
        { key: 'talent', label: 'Talent', fields: [
          { id: 'sf-talent', label: 'Acts / talent of interest *', type: 'textarea', required: true, placeholder: 'Select from the roster above, or type styles (e.g. 6 showgirls + hip hop crew)' },
          { id: 'sf-quantity', label: 'How many performers / acts? *', type: 'text', required: true, placeholder: 'e.g. 1 crew of 6, or 4 models + 2 dancers' },
          { id: 'sf-service', label: 'Occasion *', type: 'select', required: true, options: [
            'Corporate launch / brand activation',
            'Trade show / expo',
            'Wedding entertainment',
            'Private party / birthday',
            'Gala / awards night',
            'Nightclub / VIP podium',
            'Festival / public event',
            'Photoshoot / content',
            'Multi-act package',
            'Not sure — need advice'
          ]},
          { id: 'sf-look', label: 'Look / style preference', type: 'select', options: [
            'Hip hop / street',
            'Latin / salsa / samba',
            'Showgirls / cabaret',
            'Bollywood',
            'Models / hostesses',
            'Multicultural / world',
            'Roving / stilts',
            'Mixed package',
            'Not sure'
          ]},
          { id: 'sf-message', label: 'Brief, wardrobe notes & special requests', type: 'textarea', placeholder: 'Theme, colours, stage vs roving, music tracks, multi-act schedule…' }
        ]}
      ]
    },
    multi: {
      title: 'Multi-Enquiry Package',
      steps: [
        { key: 'contact', label: 'Contact', fields: [
          { id: 'sf-name', label: 'Full Name *', type: 'text', required: true },
          { id: 'sf-email', label: 'Email *', type: 'email', required: true },
          { id: 'sf-phone', label: 'Phone *', type: 'tel', required: true },
          { id: 'sf-company', label: 'Company / organiser', type: 'text' }
        ]},
        { key: 'event', label: 'Event', fields: [
          { id: 'sf-date', label: 'Event start date *', type: 'date', required: true, calendar: true },
          { id: 'sf-end-date', label: 'Event end date (if multi-day)', type: 'date', calendar: true },
          { id: 'sf-venue', label: 'Venue / City *', type: 'text', required: true },
          { id: 'sf-guests', label: 'Guest numbers', type: 'text' },
          { id: 'sf-duration', label: 'Schedule notes', type: 'text', placeholder: 'Ceremony, reception, bump-in times…' }
        ]},
        { key: 'package', label: 'Package', fields: [
          { id: 'sf-cart', label: 'Full multi-enquiry list *', type: 'textarea', required: true, placeholder: 'Your cart items appear here — artists, cars, yachts, security, production…' },
          { id: 'sf-quantity', label: 'Totals summary', type: 'text' },
          { id: 'sf-service', label: 'Primary event type *', type: 'select', required: true, options: [
            'Wedding', 'Corporate', 'Private party', 'Festival / public', 'Mixed package', 'Not sure'
          ]},
          { id: 'sf-message', label: 'Brief & special requests', type: 'textarea', placeholder: 'Priorities, budget band (optional), accessibility, must-haves…' }
        ]}
      ]
    },
    production: {
      title: 'Stage, Sound & Lighting Enquiry',
      steps: [
        { key: 'contact', label: 'Contact', fields: [
          { id: 'sf-name', label: 'Full Name *', type: 'text', required: true },
          { id: 'sf-email', label: 'Email *', type: 'email', required: true },
          { id: 'sf-phone', label: 'Phone *', type: 'tel', required: true },
          { id: 'sf-company', label: 'Company / organiser', type: 'text' }
        ]},
        { key: 'event', label: 'Event', fields: [
          { id: 'sf-date', label: 'Event / load-in date *', type: 'date', required: true, calendar: true },
          { id: 'sf-end-date', label: 'Bump-out date', type: 'date', calendar: true },
          { id: 'sf-venue', label: 'Venue / Location *', type: 'text', required: true, placeholder: 'e.g. ballroom, marquee, outdoor stage' },
          { id: 'sf-guests', label: 'Audience / capacity', type: 'text', placeholder: 'e.g. 400 seated' },
          { id: 'sf-duration', label: 'Bump-in / show hours', type: 'text', placeholder: 'e.g. load-in 10am, show 7–11pm' }
        ]},
        { key: 'gear', label: 'Equipment', fields: [
          { id: 'sf-production', label: 'Equipment of interest *', type: 'textarea', required: true, placeholder: 'Select from the catalogue above (e.g. Concert PA x1 + LED wall x1 + uplights x24)' },
          { id: 'sf-quantity', label: 'Quantities / package summary *', type: 'text', required: true, placeholder: 'e.g. 1 PA + 1 stage + 16 uplights' },
          { id: 'sf-service', label: 'Production need *', type: 'select', required: true, options: [
            'Wedding ceremony + reception AV',
            'Corporate conference / keynote',
            'Concert / live band production',
            'Festival / outdoor',
            'Fashion / runway',
            'DJ / dancefloor package',
            'Full production package',
            'Tech + crew only',
            'Not sure — need a design'
          ]},
          { id: 'sf-message', label: 'Tech notes & special requests', type: 'textarea', placeholder: 'Power available, outdoor/indoor, content files, operator required, load-in access…' }
        ]}
      ]
    },
    security: {
      title: 'Event Security Enquiry',
      steps: [
        { key: 'contact', label: 'Contact', fields: [
          { id: 'sf-name', label: 'Full Name *', type: 'text', required: true },
          { id: 'sf-email', label: 'Email *', type: 'email', required: true },
          { id: 'sf-phone', label: 'Phone *', type: 'tel', required: true },
          { id: 'sf-company', label: 'Company / organiser', type: 'text' }
        ]},
        { key: 'event', label: 'Event', fields: [
          { id: 'sf-date', label: 'Event start date *', type: 'date', required: true, calendar: true },
          { id: 'sf-end-date', label: 'End date (if multi-day)', type: 'date', calendar: true },
          { id: 'sf-venue', label: 'Venue / Location *', type: 'text', required: true, placeholder: 'e.g. ICC Sydney, private estate, festival site' },
          { id: 'sf-guests', label: 'Expected attendance *', type: 'text', required: true, placeholder: 'e.g. 500 guests' },
          { id: 'sf-duration', label: 'Coverage hours', type: 'text', placeholder: 'e.g. 4pm–1am, load-in from 10am' }
        ]},
        { key: 'coverage', label: 'Security mix', fields: [
          { id: 'sf-security', label: 'Security types & headcount *', type: 'textarea', required: true, placeholder: 'Select types above (e.g. 4 door supervisors + 2 VIP + 6 crowd control), or type your mix' },
          { id: 'sf-quantity', label: 'Total staff / summary *', type: 'text', required: true, placeholder: 'e.g. 12 staff across 3 roles' },
          { id: 'sf-service', label: 'Event type *', type: 'select', required: true, options: [
            'Wedding / private party',
            'Corporate / conference',
            'Concert / festival',
            'Nightclub / bar',
            'Red carpet / premiere',
            'VIP / celebrity appearance',
            'Outdoor public event',
            'Multi-day production',
            'Not sure — need a security plan'
          ]},
          { id: 'sf-message', label: 'Risk notes, access points, special requests', type: 'textarea', placeholder: 'Entrances, VIP lists, bag check policy, overnight coverage, radio requirements…' }
        ]}
      ]
    }
  };

  function todayISO() {
    var d = new Date();
    var m = String(d.getMonth() + 1).padStart(2, '0');
    var day = String(d.getDate()).padStart(2, '0');
    return d.getFullYear() + '-' + m + '-' + day;
  }

  /** Reliable value for text, date, textarea, and select (avoids disabled-placeholder bugs) */
  function fieldValue(el) {
    if (!el) return '';
    if (el.tagName === 'SELECT') {
      var idx = el.selectedIndex;
      if (idx < 0 || idx >= el.options.length) return '';
      var opt = el.options[idx];
      if (!opt || opt.disabled) return '';
      var v = opt.value != null ? String(opt.value) : '';
      // Some browsers leave value="" on the selected option; fall back to label text
      if (!v.trim() && opt.text && opt.text.trim() && opt.text.trim() !== 'Select…') {
        v = opt.text;
      }
      return v.trim();
    }
    return String(el.value != null ? el.value : '').trim();
  }

  function fieldHtml(f) {
    var req = f.required ? ' required' : '';
    var label = '<label for="' + f.id + '">' + f.label + '</label>';
    var ph = f.placeholder ? ' placeholder="' + f.placeholder.replace(/"/g, '&quot;') + '"' : '';
    if (f.type === 'select') {
      var opts = (f.options || []).map(function (o) {
        // Explicit value attribute — never rely on implicit option values
        var safe = String(o).replace(/"/g, '&quot;');
        return '<option value="' + safe + '">' + safe + '</option>';
      }).join('');
      return '<div class="form-group form-group--select">' + label +
        '<select id="' + f.id + '" name="' + f.id + '"' + req + '>' +
        // Placeholder must NOT be disabled+selected (breaks value reads on mobile browsers)
        '<option value="" selected>Select…</option>' + opts +
        '</select></div>';
    }
    if (f.type === 'textarea') {
      var rows = (f.id === 'sf-vehicles' || f.id === 'sf-yachts' || f.id === 'sf-talent' || f.id === 'sf-security' || f.id === 'sf-production' || f.id === 'sf-cart') ? '6' : '3';
      var defPh = f.placeholder || 'Optional notes…';
      return '<div class="form-group form-group--full">' + label +
        '<textarea id="' + f.id + '" name="' + f.id + '" rows="' + rows + '" placeholder="' + defPh.replace(/"/g, '&quot;') + '"' + req + '></textarea></div>';
    }
    if (f.type === 'date' || f.calendar) {
      return (
        '<div class="form-group form-group--date">' +
          label +
          '<div class="sf-date-wrap">' +
            '<span class="sf-date-icon" aria-hidden="true">' +
              '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8">' +
                '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>' +
              '</svg>' +
            '</span>' +
            '<input type="date" id="' + f.id + '" name="' + f.id + '" class="sf-date-input" min="' + todayISO() + '"' + req + ' />' +
          '</div>' +
          '<p class="sf-date-hint">Tap to open calendar</p>' +
        '</div>'
      );
    }
    return '<div class="form-group">' + label +
      '<input type="' + f.type + '" id="' + f.id + '" name="' + f.id + '"' + ph + req + ' /></div>';
  }

  function mountForm(root, key) {
    var cfg = CONFIGS[key];
    if (!root || !cfg) return;

    var step = 0;
    var collected = {};
    /** Persist selected File objects when navigating multi-step form */
    var pendingFiles = [];

    function captureAttachments() {
      var input = document.getElementById('sf-attachments');
      if (!input || !mail()) return;
      var files = mail().collectFiles(input);
      if (files.length) pendingFiles = files;
    }

    function restoreAttachmentStatus() {
      var status = document.getElementById('sf-attachments-status');
      if (!status) return;
      if (!pendingFiles.length) {
        status.textContent = 'No files selected';
        status.setAttribute('data-empty', 'true');
        return;
      }
      status.textContent = pendingFiles.length + ' file' + (pendingFiles.length > 1 ? 's' : '') +
        ' ready: ' + pendingFiles.map(function (f) { return f.name; }).join(', ');
      status.removeAttribute('data-empty');
    }

    function render() {
      var s = cfg.steps[step];
      var dots = cfg.steps.map(function (st, i) {
        var cls = i === step ? ' is-active' : (i < step ? ' is-done' : '');
        return '<span class="sf-dot' + cls + '">' + (i + 1) + '</span><span class="sf-dot-label' + cls + '">' + st.label + '</span>';
      }).join('<span class="sf-dot-line"></span>');

      var fields = s.fields.map(fieldHtml).join('');
      var isLast = step === cfg.steps.length - 1;

      var fleetPreview = '';
      if (key === 'luxury-car') {
        fleetPreview = '<div class="fleet-form-selected" id="fleet-form-selected" hidden></div>';
      } else if (key === 'luxury-yacht') {
        fleetPreview = '<div class="yacht-form-selected" id="yacht-form-selected" hidden></div>';
      } else if (key === 'models') {
        fleetPreview = '<div class="talent-form-selected" id="talent-form-selected" hidden></div>';
      } else if (key === 'security') {
        fleetPreview = '<div class="talent-form-selected" id="security-form-selected" hidden></div>';
      } else if (key === 'production') {
        fleetPreview = '<div class="talent-form-selected" id="production-form-selected" hidden></div>';
      }

      root.innerHTML =
        '<div class="sf-card">' +
          '<div class="sf-header">' +
            '<p class="section-eyebrow" style="text-align:left;margin-bottom:0.35rem;">Book with Elite</p>' +
            '<h2 class="sf-title">' + cfg.title + '</h2>' +
            '<p class="sf-sub">Multi-step enquiry · calendars on date fields · saved to Super Admin · emailed to the full Elite team (with optional file attachments)</p>' +
          '</div>' +
          '<div class="sf-steps" aria-label="Form progress">' + dots + '</div>' +
          fleetPreview +
          '<form class="sf-form quote-form" id="service-enquiry-form" data-service-key="' + key + '" novalidate enctype="multipart/form-data">' +
            '<h3 class="sf-step-title">Step ' + (step + 1) + ': ' + s.label + '</h3>' +
            '<div class="sf-fields">' + fields +
              (isLast && mail()
                ? mail().fileFieldHtml({
                    id: 'sf-attachments',
                    label: 'Attach docs / images (optional)',
                    accept: 'image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip',
                    multiple: true,
                    hint: 'Briefs, floor plans, mood boards, photos, insurance docs — max 10MB total. Files email to the full Elite inbox list.'
                  })
                : '') +
            '</div>' +
            '<div class="sf-actions">' +
              (step > 0 ? '<button type="button" class="btn btn-outline" id="sf-back">Back</button>' : '<span></span>') +
              '<button type="submit" class="btn btn-gold" id="sf-next">' + (isLast ? 'Submit Enquiry' : 'Next Step') + '</button>' +
            '</div>' +
            '<p class="cat-form-status" id="sf-status" hidden></p>' +
          '</form>' +
        '</div>';

      // restore values (including selects — match by value)
      s.fields.forEach(function (f) {
        var el = document.getElementById(f.id);
        if (!el || collected[f.id] == null || collected[f.id] === '') return;
        el.value = collected[f.id];
        // Select restore fallback: match option text if value set failed
        if (el.tagName === 'SELECT' && fieldValue(el) !== String(collected[f.id]).trim()) {
          for (var i = 0; i < el.options.length; i++) {
            if (String(el.options[i].value).trim() === String(collected[f.id]).trim() ||
                String(el.options[i].text).trim() === String(collected[f.id]).trim()) {
              el.selectedIndex = i;
              break;
            }
          }
        }
      });

      // Prefill fleet selection into vehicles field
      if (key === 'luxury-car' && window.EliteFleet) {
        try {
          var labels = window.EliteFleet.getSelectedLabels();
          var veh = document.getElementById('sf-vehicles');
          if (veh && labels && labels.length && !collected['sf-vehicles']) {
            veh.value = labels.join('\n');
          }
          window.EliteFleet.syncForm();
        } catch (err) {}
      }
      if (key === 'luxury-yacht' && window.EliteYachts) {
        try {
          var yLabels = window.EliteYachts.getSelectedLabels();
          var yta = document.getElementById('sf-yachts');
          if (yta && yLabels && yLabels.length && !collected['sf-yachts']) {
            yta.value = yLabels.join('\n');
          }
          window.EliteYachts.syncForm();
        } catch (err2) {}
      }
      if (key === 'models' && window.EliteTalent) {
        try {
          var tLabels = window.EliteTalent.getSelectedLabels();
          var tta = document.getElementById('sf-talent');
          if (tta && tLabels && tLabels.length && !collected['sf-talent']) {
            tta.value = tLabels.join('\n');
          }
          window.EliteTalent.syncForm();
        } catch (err3) {}
      }
      if (key === 'security' && window.EliteSecurity) {
        try {
          var sLabels = window.EliteSecurity.getSelectedLabels();
          var sta = document.getElementById('sf-security');
          if (sta && sLabels && sLabels.length && !collected['sf-security']) {
            sta.value = sLabels.join('\n');
          }
          window.EliteSecurity.syncForm();
        } catch (err4) {}
      }
      if (key === 'production' && window.EliteProduction) {
        try {
          var pLabels = window.EliteProduction.getSelectedLabels();
          var pta = document.getElementById('sf-production');
          if (pta && pLabels && pLabels.length && !collected['sf-production']) {
            pta.value = pLabels.join('\n');
          }
          window.EliteProduction.syncForm();
        } catch (err5) {}
      }
      if (key === 'multi' && window.EliteCart) {
        try {
          var cartTa = document.getElementById('sf-cart');
          if (cartTa && !collected['sf-cart']) cartTa.value = window.EliteCart.summaryText();
          var cartQ = document.getElementById('sf-quantity');
          if (cartQ && !collected['sf-quantity']) {
            cartQ.value = window.EliteCart.load().length + ' lines · ' + window.EliteCart.count() + ' units';
          }
        } catch (err6) {}
      }

      var form = root.querySelector('form.sf-form') || document.getElementById('service-enquiry-form');
      var back = document.getElementById('sf-back');
      if (back) back.addEventListener('click', function () {
        saveStep();
        captureAttachments();
        step = Math.max(0, step - 1);
        render();
      });
      if (isLast && mail()) {
        try {
          mail().bindFileStatus('sf-attachments');
          var att = document.getElementById('sf-attachments');
          if (att) {
            att.addEventListener('change', function () {
              pendingFiles = mail().collectFiles(att);
              restoreAttachmentStatus();
            });
          }
          restoreAttachmentStatus();
        } catch (bindErr) {}
      }

      // Keep select values in collected as soon as user picks (fixes flaky submit validation)
      if (form) {
        form.querySelectorAll('select').forEach(function (sel) {
          sel.addEventListener('change', function () {
            if (sel.id) collected[sel.id] = fieldValue(sel);
            sel.style.borderColor = '';
            sel.classList.remove('sf-invalid');
          });
        });
        form.addEventListener('submit', function (e) {
          e.preventDefault();
          e.stopPropagation();
          // Snapshot all current step fields before validate
          cfg.steps[step].fields.forEach(function (f) {
            var el = document.getElementById(f.id);
            if (el) collected[f.id] = fieldValue(el);
          });
          if (!validateStep()) return;
          saveStep();
          if (step < cfg.steps.length - 1) {
            step++;
            render();
          } else {
            submitAll();
          }
        });
      }
    }

    function saveStep() {
      cfg.steps[step].fields.forEach(function (f) {
        var el = document.getElementById(f.id);
        if (el) collected[f.id] = fieldValue(el);
      });
      if (step === cfg.steps.length - 1) captureAttachments();
      // Multi-enquiry: push event details into every cart line when same-day hire
      if (key === 'multi' && window.EliteCart && EliteCart.applyToAll) {
        var push = {};
        if (collected['sf-date']) push.date = collected['sf-date'];
        if (collected['sf-end-date']) push.endDate = collected['sf-end-date'];
        if (collected['sf-venue']) push.location = collected['sf-venue'];
        if (collected['sf-guests']) push.guests = collected['sf-guests'];
        if (collected['sf-duration']) push.hours = collected['sf-duration'];
        if (Object.keys(push).length) {
          try { EliteCart.applyToAll(push, { onlyEmpty: false }); } catch (e) {}
        }
      }
    }

    function validateStep() {
      var ok = true;
      var missing = [];
      cfg.steps[step].fields.forEach(function (f) {
        if (!f.required) return;
        var el = document.getElementById(f.id);
        // Prefer live DOM; fall back to already-collected values
        var val = el ? fieldValue(el) : (collected[f.id] || '');
        if (!val) {
          ok = false;
          missing.push(f.label.replace(/\s*\*$/, ''));
          if (el) {
            el.style.borderColor = '#ff5555';
            el.classList.add('sf-invalid');
          }
        } else if (el) {
          el.style.borderColor = '';
          el.classList.remove('sf-invalid');
          // Persist immediately so re-renders keep the selection
          collected[f.id] = val;
        }
      });
      if (!ok) {
        var st = document.getElementById('sf-status');
        if (st) {
          st.hidden = false;
          st.className = 'cat-form-status cat-form-status--error';
          st.textContent = missing.length
            ? ('Please complete: ' + missing.join(', ') + '.')
            : 'Please complete the required fields.';
        }
      }
      return ok;
    }

    function submitAll() {
      var status = document.getElementById('sf-status');
      var btn = document.getElementById('sf-next');
      var name = collected['sf-name'] || '';
      var email = collected['sf-email'] || '';
      var phone = collected['sf-phone'] || '';
      var service = (collected['sf-service'] || key) + (collected['sf-company'] ? ' · ' + collected['sf-company'] : '');
      if (collected['sf-vehicles']) {
        service = service + ' · Vehicles: ' + collected['sf-vehicles'].replace(/\n/g, ', ');
      }
      if (collected['sf-yachts']) {
        service = service + ' · Vessels: ' + collected['sf-yachts'].replace(/\n/g, ', ');
      }
      if (collected['sf-talent']) {
        service = service + ' · Talent: ' + collected['sf-talent'].replace(/\n/g, ', ');
      }
      if (collected['sf-security']) {
        service = service + ' · Security: ' + collected['sf-security'].replace(/\n/g, ', ');
      }
      if (collected['sf-production']) {
        service = service + ' · Production: ' + collected['sf-production'].replace(/\n/g, ', ');
      }
      if (collected['sf-cart']) {
        service = service + ' · Multi-cart: ' + collected['sf-cart'].replace(/\n/g, ' | ');
      }
      if (collected['sf-look']) {
        service = service + ' · Look: ' + collected['sf-look'];
      }
      if (collected['sf-quantity']) {
        service = service + ' · Qty: ' + collected['sf-quantity'];
      }
      if (collected['sf-drive']) {
        service = service + ' · ' + collected['sf-drive'];
      }
      if (collected['sf-duration']) {
        service = service + ' · Duration: ' + collected['sf-duration'];
      }
      if (collected['sf-catering']) {
        service = service + ' · Catering: ' + collected['sf-catering'];
      }

      captureAttachments();
      var attachInput = document.getElementById('sf-attachments');
      var liveFiles = mail() ? mail().collectFiles(attachInput) : [];
      var files = liveFiles.length ? liveFiles : pendingFiles.slice();
      if (mail() && files.length) {
        var check = mail().validateFiles(files);
        if (!check.ok) {
          if (status) {
            status.hidden = false;
            status.className = 'cat-form-status cat-form-status--error';
            status.textContent = check.error;
          }
          return;
        }
      }

      // Always refresh multi-cart summary from live cart at submit time
      if (key === 'multi' && window.EliteCart) {
        try {
          collected['sf-cart'] = window.EliteCart.summaryText();
          collected['sf-quantity'] = window.EliteCart.load().length + ' lines · ' + window.EliteCart.count() + ' units';
          var shared = window.EliteCart.sharedSnapshot ? window.EliteCart.sharedSnapshot() : {};
          if (shared.date && !collected['sf-date']) collected['sf-date'] = shared.date;
          if (shared.endDate && !collected['sf-end-date']) collected['sf-end-date'] = shared.endDate;
          if (shared.location && !collected['sf-venue']) collected['sf-venue'] = shared.location;
          if (shared.guests && !collected['sf-guests']) collected['sf-guests'] = shared.guests;
          if (shared.hours && !collected['sf-duration']) collected['sf-duration'] = shared.hours;
        } catch (cartErr) {}
      }

      var msgParts = [];
      Object.keys(collected).forEach(function (k) {
        if (collected[k]) msgParts.push(k.replace('sf-', '') + ': ' + collected[k]);
      });
      if (files.length) {
        msgParts.push('attachments: ' + files.map(function (f) { return f.name; }).join(', '));
      }
      if (key === 'multi' && window.EliteCart) {
        try {
          msgParts.push('--- FULL MULTI-CART ---');
          msgParts.push(window.EliteCart.summaryText());
        } catch (e2) {}
      }
      var fullDetails = msgParts.join('\n');
      var lead = {
        id: 'SVC-' + Date.now().toString().slice(-6),
        name: name,
        email: email,
        phone: phone,
        date: collected['sf-date'] || '',
        endDate: collected['sf-end-date'] || '',
        venue: collected['sf-venue'] || '',
        guests: collected['sf-guests'] || '',
        budget: collected['sf-budget'] || '',
        company: collected['sf-company'] || '',
        service: cfg.title + ' · ' + service,
        message: fullDetails,
        status: 'New Enquiry',
        kanbanColumn: 'new',
        priority: 'normal',
        timestamp: new Date().toLocaleString(),
        source: 'service-page',
        page: key,
        formFields: collected,
        attachmentNames: files.map(function (f) { return f.name; }),
        attachments: files.map(function (f) {
          return { name: f.name, type: f.type || 'file', size: f.size || 0, at: new Date().toLocaleString() };
        }),
        notes: [],
        order: Date.now()
      };

      try {
        var inquiries = JSON.parse(localStorage.getItem('elite_inquiries') || '[]');
        inquiries.unshift(lead);
        localStorage.setItem('elite_inquiries', JSON.stringify(inquiries));
      } catch (e) {}
      try {
        if (window.EliteCRMPush && EliteCRMPush.ingest) EliteCRMPush.ingest(lead);
        else if (window.EliteCRM && EliteCRM.ingestLead) EliteCRM.ingestLead(lead);
      } catch (crmErr) {}

      if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }
      if (status) {
        status.hidden = false;
        status.className = 'cat-form-status cat-form-status--info';
        status.textContent = 'Saving to Super Admin CRM and emailing ' + recipientsText() + '…';
      }

      var emailPayload = {
        name: name,
        email: email,
        phone: phone || '—',
        _subject: '[Elite] ' + cfg.title + ' · ' + name,
        form_type: cfg.title,
        page: key,
        service: service,
        eventDate: collected['sf-date'] || '—',
        eventEndDate: collected['sf-end-date'] || '—',
        venue: collected['sf-venue'] || '—',
        guests: collected['sf-guests'] || '—',
        company: collected['sf-company'] || '—',
        duration: collected['sf-duration'] || '—',
        budget: collected['sf-budget'] || '—',
        multi_cart: collected['sf-cart'] || '—',
        quantity_summary: collected['sf-quantity'] || '—',
        vehicles: collected['sf-vehicles'] || '',
        yachts: collected['sf-yachts'] || '',
        talent: collected['sf-talent'] || '',
        security: collected['sf-security'] || '',
        production: collected['sf-production'] || '',
        message: fullDetails,
        full_form_json: JSON.stringify(collected, null, 2),
        leadId: lead.id,
        source: (typeof location !== 'undefined' ? location.pathname : key)
      };

      var sendPromise;
      if (mail()) {
        var fileSource = (liveFiles.length && attachInput) ? [attachInput] : files;
        sendPromise = mail().sendEnquiry(emailPayload, fileSource);
      } else {
        sendPromise = Promise.resolve({ ok: false, error: new Error('EliteMail missing') });
      }

      sendPromise.then(function (result) {
        if (result && result.ok) {
          if (status) {
            status.className = 'cat-form-status cat-form-status--success';
            var extra = '';
            if (result.allOk === false && result.failed && result.failed.length) {
              extra = ' (partial: confirm FormSubmit for ' + result.failed.join(', ') + ')';
            }
            status.textContent = 'Enquiry sent to Super Admin CRM and ' + recipientsText() +
              (files.length ? ' with ' + files.length + ' attachment' + (files.length > 1 ? 's' : '') : '') +
              extra + '.';
          }
          if (btn) { btn.textContent = 'Sent'; }
          if (key === 'multi' && window.EliteCart) { try { window.EliteCart.clear(); } catch (e) {} }
          collected = {};
          pendingFiles = [];
          step = 0;
          setTimeout(render, 2200);
        } else {
          if (status) {
            status.className = 'cat-form-status cat-form-status--warn';
            status.textContent = 'Saved to Super Admin CRM. Email needs a one-time FormSubmit confirmation — open ' +
              recipientsText() + ' (and spam) and click “Confirm email”, then submit again.';
          }
          if (btn) { btn.disabled = false; btn.textContent = 'Submit Enquiry'; }
        }
      });
    }

    render();
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-service-form]').forEach(function (el) {
      mountForm(el, el.getAttribute('data-service-form'));
    });
  });
})();
