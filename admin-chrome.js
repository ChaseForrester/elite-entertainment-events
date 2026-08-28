/* Shared Super Admin chrome helpers */
(function (global) {
    'use strict';

    function toast(msg, kind) {
        if (!msg) return;
        var el = document.getElementById('sa-toast');
        if (!el) {
            el = document.createElement('div');
            el.id = 'sa-toast';
            el.className = 'sa-toast';
            el.setAttribute('role', 'status');
            document.body.appendChild(el);
        }
        el.textContent = msg;
        el.classList.remove('is-error', 'is-ok');
        if (kind === 'error') el.classList.add('is-error');
        if (kind === 'ok') el.classList.add('is-ok');
        el.classList.add('is-on');
        clearTimeout(toast._t);
        toast._t = setTimeout(function () { el.classList.remove('is-on'); }, 4200);
    }

    function setAuthed(on) {
        document.body.classList.toggle('sa-authed', !!on);
        var overlay = document.getElementById('auth-overlay');
        if (overlay) overlay.setAttribute('aria-hidden', on ? 'true' : 'false');
        var dash = document.querySelector('.dashboard-wrap, .ops-dash');
        if (dash) dash.setAttribute('aria-hidden', on ? 'false' : 'true');
    }

    function markActivePage() {
        var isOps = /ops-console\.html/i.test(location.pathname || '') || /ops-console\.html/i.test(location.href || '');
        document.querySelectorAll('[data-sa-page]').forEach(function (el) {
            var page = el.getAttribute('data-sa-page');
            el.classList.toggle('is-on', isOps ? page === 'ops' : page === 'cms');
        });
    }

    function closeAdminModals() {
        document.querySelectorAll('.admin-modal-overlay.active').forEach(function (m) {
            m.classList.remove('active');
        });
    }

    function bindChrome() {
        markActivePage();
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') closeAdminModals();
        });
        if (window.EliteAdminAuth && EliteAdminAuth.isAuthed()) setAuthed(true);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bindChrome);
    } else {
        bindChrome();
    }

    global.EliteAdminUI = {
        toast: toast,
        setAuthed: setAuthed,
        markActivePage: markActivePage,
        closeModals: closeAdminModals
    };
})(window);
