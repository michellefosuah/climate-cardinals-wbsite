/**
 * Reusable modal forms for Contact, Volunteer, and Donation CTAs.
 * Any [data-contact], [data-volunteer], or [data-donate] element opens the
 * matching form and submits it to the API.
 */
(function () {
  'use strict';

  var icon = window.CC_ICON || function () { return ''; };

  function field(id, label, type, opts) {
    opts = opts || {};
    var control = type === 'textarea'
      ? '<textarea id="' + id + '" class="cc-textarea" ' + (opts.required ? 'required' : '') + '></textarea>'
      : '<input id="' + id + '" class="cc-input" type="' + type + '" ' + (opts.required ? 'required' : '') + ' value="' + (opts.value || '') + '"/>';
    return '<div class="cc-field"><label class="cc-label" for="' + id + '">' + label + '</label>' + control + '</div>';
  }

  function openModal(title, bodyHtml, submitLabel, onSubmit) {
    var overlay = document.createElement('div');
    overlay.className = 'cc-modal-overlay';
    overlay.innerHTML =
      '<div class="cc-modal"><div class="cc-modal__head"><h3>' + title + '</h3>' +
      '<button class="cc-modal__close" data-close aria-label="Close">' + icon('close') + '</button></div>' +
      '<form data-form>' + bodyHtml +
      '<button type="submit" class="cc-btn cc-btn--primary cc-btn--block">' + (submitLabel || 'Submit') + '</button>' +
      '</form></div>';
    document.body.appendChild(overlay);

    function close() { overlay.remove(); }
    overlay.querySelector('[data-close]').addEventListener('click', close);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });

    var user = window.CC_API.getUser();
    if (user) {
      var n = overlay.querySelector('#f-name'), em = overlay.querySelector('#f-email');
      if (n && !n.value) n.value = user.name;
      if (em && !em.value) em.value = user.email;
    }

    overlay.querySelector('[data-form]').addEventListener('submit', async function (e) {
      e.preventDefault();
      var btn = e.target.querySelector('button[type="submit"]');
      var original = btn.textContent;
      btn.disabled = true; btn.textContent = 'Submitting…';
      try { await onSubmit(overlay); close(); }
      catch (err) { window.CC_UI.toast(err.message, 'error'); btn.disabled = false; btn.textContent = original; }
    });
    return overlay;
  }

  function v(o, id) { var e = o.querySelector('#' + id); return e ? e.value.trim() : ''; }

  function contactModal() {
    openModal('Contact the Chapter',
      field('f-name', 'Full name', 'text', { required: true }) +
      field('f-email', 'Email', 'email', { required: true }) +
      field('f-subject', 'Subject', 'text', {}) +
      field('f-message', 'Message', 'textarea', { required: true }),
      'Send message',
      async function (o) {
        await window.CC_API.sendContact({ name: v(o, 'f-name'), email: v(o, 'f-email'),
          subject: v(o, 'f-subject') || undefined, message: v(o, 'f-message') });
        window.CC_UI.toast('Message sent! We will be in touch 🌿');
      });
  }

  function volunteerModal() {
    openModal('Become a Volunteer',
      field('f-name', 'Full name', 'text', { required: true }) +
      field('f-email', 'Email', 'email', { required: true }) +
      field('f-phone', 'Phone (optional)', 'tel', {}) +
      field('f-interest', 'Area of interest', 'text', {}) +
      field('f-message', 'Why do you want to join?', 'textarea', {}),
      'Apply to volunteer',
      async function (o) {
        await window.CC_API.volunteer({ name: v(o, 'f-name'), email: v(o, 'f-email'),
          phone: v(o, 'f-phone') || undefined, interest: v(o, 'f-interest') || undefined, message: v(o, 'f-message') || undefined });
        window.CC_UI.toast('Application received! Welcome to the flock 🐦');
      });
  }

  function donateModal(defaultProject) {
    openModal('Support Our Mission',
      field('f-name', 'Full name', 'text', { required: true }) +
      field('f-email', 'Email', 'email', { required: true }) +
      field('f-amount', 'Amount (GHS)', 'number', { required: true }) +
      field('f-project', 'Project', 'text', { value: defaultProject || '' }) +
      field('f-message', 'Message (optional)', 'textarea', {}),
      'Donate',
      async function (o) {
        var amount = Number(v(o, 'f-amount'));
        if (!amount || amount <= 0) throw new Error('Please enter a valid amount');
        await window.CC_API.donate({ name: v(o, 'f-name'), email: v(o, 'f-email'), amount: amount,
          project: v(o, 'f-project') || undefined, message: v(o, 'f-message') || undefined });
        window.CC_UI.toast('Thank you for your generosity! 💚');
      });
  }

  function bind() {
    document.querySelectorAll('[data-contact]').forEach(function (el) {
      el.addEventListener('click', function (e) { e.preventDefault(); contactModal(); });
    });
    document.querySelectorAll('[data-volunteer]').forEach(function (el) {
      el.addEventListener('click', function (e) { e.preventDefault(); volunteerModal(); });
    });
    document.querySelectorAll('[data-donate]').forEach(function (el) {
      el.addEventListener('click', function (e) { e.preventDefault(); donateModal(el.getAttribute('data-project')); });
    });
  }

  window.CC_FORMS = { contact: contactModal, volunteer: volunteerModal, donate: donateModal };
  document.addEventListener('DOMContentLoaded', bind);
})();
