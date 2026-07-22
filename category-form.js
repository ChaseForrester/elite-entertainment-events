/* ═══════════════════════════════════════════════════
   Category enquiry forms Admin CRM + email
   Email: info@eeevents.com.au
═══════════════════════════════════════════════════ */
(function () {
  const EMAIL_PRIMARY = 'info@eeevents.com.au';

  function val(id) {
    const el = document.getElementById(id);
    return el ? String(el.value || '').trim() : '';
  }

  function saveToAdmin(lead) {
    try {
      const inquiries = JSON.parse(localStorage.getItem('elite_inquiries') || '[]');
      inquiries.unshift(lead);
      localStorage.setItem('elite_inquiries', JSON.stringify(inquiries));
      return true;
    } catch (e) {
      console.warn('Admin CRM save failed', e);
      return false;
    }
  }

  async function emailLead(payload) {
    // FormSubmit AJAX — first use may require inbox confirmation
    const body = {
      name: payload.name,
      email: payload.email,
      phone: payload.phone || '—',
      _subject: payload.subject,
      _template: 'table',
      _captcha: 'false',
      category: payload.category,
      act: payload.act || 'General enquiry',
      eventDate: payload.date || '—',
      guests: payload.guests || '—',
      venue: payload.venue || '—',
      budget: payload.budget || '—',
      message: payload.message || '—',
      source: payload.source || 'Category page',
      leadId: payload.id
    };

    try {
      const res = await fetch('https://formsubmit.co/ajax/' + encodeURIComponent(EMAIL_PRIMARY), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json().catch(() => ({}));
      return { ok: true, data };
    } catch (err) {
      return { ok: false, error: err };
    }
  }

  function setStatus(el, msg, type) {
    if (!el) return;
    el.hidden = false;
    el.textContent = msg;
    el.className = 'cat-form-status cat-form-status--' + (type || 'info');
  }

  function bindCategoryForm(form) {
    if (!form || form.dataset.bound === '1') return;
    form.dataset.bound = '1';

    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      const statusEl = form.querySelector('.cat-form-status') || document.getElementById('cat-form-status');
      const btn = form.querySelector('button[type="submit"]');
      const category = form.dataset.category || val('cat-category') || 'General';
      const act = val('cat-act') || form.dataset.act || '';
      const name = val('cat-name');
      const email = val('cat-email');
      const phone = val('cat-phone');
      const date = val('cat-date');
      const guests = val('cat-guests');
      const venue = val('cat-venue');
      const budget = val('cat-budget');
      const message = val('cat-message');

      if (!name || !email) {
        setStatus(statusEl, 'Please enter your name and email.', 'error');
        return;
      }

      const id = 'CAT-' + Date.now().toString().slice(-6);
      const lead = {
        id,
        name,
        email,
        phone,
        date,
        service: category + (act ? ' · ' + act : ''),
        message: [
          message,
          guests ? 'Guests: ' + guests : '',
          venue ? 'Venue: ' + venue : '',
          budget ? 'Budget: ' + budget : ''
        ].filter(Boolean).join('\n'),
        status: 'Pending',
        timestamp: new Date().toLocaleString(),
        source: 'category',
        category,
        act
      };

      const originalBtn = btn ? btn.textContent : '';
      if (btn) {
        btn.disabled = true;
        btn.textContent = 'Sending…';
      }
      setStatus(statusEl, 'Saving to admin pipeline and emailing our team…', 'info');

      const adminOk = saveToAdmin(lead);
      const mailResult = await emailLead({
        id,
        name,
        email,
        phone,
        date,
        guests,
        venue,
        budget,
        message: lead.message,
        category,
        act,
        subject: '[Elite Enquiry] ' + category + (act ? ' — ' + act : '') + ' · ' + name,
        source: window.location.pathname.split('/').pop() || 'category'
      });

      if (adminOk && mailResult.ok) {
        setStatus(statusEl, 'Enquiry sent! It’s in the Super Admin CRM and emailed to info@eeevents.com.au. We’ll reply shortly.', 'success');
        form.reset();
        // restore category/act hidden defaults
        const catField = document.getElementById('cat-category');
        if (catField && form.dataset.category) catField.value = form.dataset.category;
        const actField = document.getElementById('cat-act');
        if (actField && form.dataset.act) actField.value = form.dataset.act;
      } else if (adminOk && !mailResult.ok) {
        setStatus(statusEl, 'Saved to Admin CRM. Email delivery needs a one-time FormSubmit confirmation — check info@eeevents.com.au (and spam) and click “Confirm email”. Your lead is still safe in admin.', 'warn');
      } else {
        setStatus(statusEl, 'Something went wrong. Please call +61 417 221 111 or email info@eeevents.com.au directly.', 'error');
      }

      if (btn) {
        btn.disabled = false;
        btn.textContent = originalBtn || 'Send Enquiry';
      }
    });
  }

  function prefillAct(actName) {
    const actField = document.getElementById('cat-act');
    const actLabel = document.getElementById('cat-act-label');
    if (actField) actField.value = actName || '';
    if (actLabel) {
      actLabel.hidden = !actName;
      actLabel.textContent = actName ? 'Enquiring about: ' + actName : '';
    }
    const formSection = document.getElementById('category-enquiry');
    if (formSection) formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  window.EliteCategoryForm = {
    bind: bindCategoryForm,
    prefillAct: prefillAct,
    emails: { primary: EMAIL_PRIMARY }
  };

  function enhanceDateInputs() {
    var d = new Date();
    var min = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    document.querySelectorAll('input[type="date"]').forEach(function (el) {
      if (!el.getAttribute('min')) el.setAttribute('min', min);
      el.classList.add('sf-date-input');
      el.style.colorScheme = 'dark';
      el.style.cursor = 'pointer';
      // Wrap with calendar icon if not already wrapped
      if (el.parentElement && !el.parentElement.classList.contains('sf-date-wrap')) {
        var wrap = document.createElement('div');
        wrap.className = 'sf-date-wrap';
        el.parentNode.insertBefore(wrap, el);
        wrap.appendChild(el);
        var icon = document.createElement('span');
        icon.className = 'sf-date-icon';
        icon.setAttribute('aria-hidden', 'true');
        icon.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>';
        wrap.insertBefore(icon, el);
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('form.category-enquiry-form').forEach(bindCategoryForm);
    enhanceDateInputs();

    document.querySelectorAll('[data-enquire-act]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        prefillAct(btn.getAttribute('data-enquire-act'));
      });
    });
  });
})();
