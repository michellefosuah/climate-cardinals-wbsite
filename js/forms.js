/**
 * Reusable modal forms for Contact, Volunteer, and Donation CTAs.
 * Any element with [data-contact], [data-volunteer], or [data-donate] opens
 * the matching form and submits it to the API.
 */
(function () {
  'use strict';

  function field(id, label, type, opts) {
    opts = opts || {};
    if (type === 'textarea') {
      return (
        '<label style="font-size:12px;text-transform:uppercase;letter-spacing:.05em;font-weight:700;color:#42493e">' + label +
        '<textarea id="' + id + '" rows="3" ' + (opts.required ? 'required' : '') +
        ' style="width:100%;margin-top:4px;padding:10px;border:1px solid rgba(114,121,110,.3);border-radius:8px;font-family:Atkinson Hyperlegible Next;background:#fff"></textarea></label>'
      );
    }
    return (
      '<label style="font-size:12px;text-transform:uppercase;letter-spacing:.05em;font-weight:700;color:#42493e">' + label +
      '<input id="' + id + '" type="' + type + '" ' + (opts.required ? 'required' : '') +
      ' value="' + (opts.value || '') + '"' +
      ' style="width:100%;margin-top:4px;padding:10px;border:1px solid rgba(114,121,110,.3);border-radius:8px;font-family:Atkinson Hyperlegible Next;background:#fff"/></label>'
    );
  }

  function openModal(title, bodyHtml, onSubmit) {
    var overlay = document.createElement('div');
    overlay.style.cssText =
      'position:fixed;inset:0;background:rgba(21,66,18,.35);backdrop-filter:blur(4px);' +
      'display:flex;align-items:center;justify-content:center;padding:24px;z-index:9998;overflow:auto;';
    overlay.innerHTML =
      '<div style="background:#fff8f6;border-radius:24px;max-width:460px;width:100%;padding:28px;box-shadow:0 20px 60px rgba(0,0,0,.25)">' +
      '<div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:16px">' +
      '<h3 style="font-family:Plus Jakarta Sans;font-size:22px;font-weight:700;color:#154212">' + title + '</h3>' +
      '<button data-close style="background:none;border:none;cursor:pointer;color:#42493e"><span class="material-symbols-outlined">close</span></button></div>' +
      '<form data-form style="display:flex;flex-direction:column;gap:12px">' + bodyHtml +
      '<button type="submit" style="background:#154212;color:#fff;border:none;padding:12px;border-radius:9999px;font-weight:700;cursor:pointer;margin-top:8px">Submit</button>' +
      '</form></div>';
    document.body.appendChild(overlay);

    function close() { overlay.remove(); }
    overlay.querySelector('[data-close]').addEventListener('click', close);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });

    var user = window.CC_API.getUser();
    if (user) {
      var n = overlay.querySelector('#f-name');
      var em = overlay.querySelector('#f-email');
      if (n && !n.value) n.value = user.name;
      if (em && !em.value) em.value = user.email;
    }

    overlay.querySelector('[data-form]').addEventListener('submit', async function (e) {
      e.preventDefault();
      var btn = e.target.querySelector('button[type="submit"]');
      var original = btn.textContent;
      btn.disabled = true; btn.textContent = 'Submitting…';
      try {
        await onSubmit(overlay);
        close();
      } catch (err) {
        window.CC_UI.toast(err.message, 'error');
        btn.disabled = false; btn.textContent = original;
      }
    });
    return overlay;
  }

  function v(overlay, id) {
    var el = overlay.querySelector('#' + id);
    return el ? el.value.trim() : '';
  }

  function contactModal() {
    openModal(
      'Contact the Chapter',
      field('f-name', 'Full Name', 'text', { required: true }) +
        field('f-email', 'Email', 'email', { required: true }) +
        field('f-subject', 'Subject', 'text', {}) +
        field('f-message', 'Message', 'textarea', { required: true }),
      async function (overlay) {
        await window.CC_API.sendContact({
          name: v(overlay, 'f-name'),
          email: v(overlay, 'f-email'),
          subject: v(overlay, 'f-subject') || undefined,
          message: v(overlay, 'f-message'),
        });
        window.CC_UI.toast('Message sent! We will be in touch 🌿');
      }
    );
  }

  function volunteerModal() {
    openModal(
      'Become a Volunteer',
      field('f-name', 'Full Name', 'text', { required: true }) +
        field('f-email', 'Email', 'email', { required: true }) +
        field('f-phone', 'Phone (optional)', 'tel', {}) +
        field('f-interest', 'Area of Interest', 'text', {}) +
        field('f-message', 'Why do you want to join?', 'textarea', {}),
      async function (overlay) {
        await window.CC_API.volunteer({
          name: v(overlay, 'f-name'),
          email: v(overlay, 'f-email'),
          phone: v(overlay, 'f-phone') || undefined,
          interest: v(overlay, 'f-interest') || undefined,
          message: v(overlay, 'f-message') || undefined,
        });
        window.CC_UI.toast('Application received! Welcome to the flock 🐦');
      }
    );
  }

  function donateModal(defaultProject) {
    openModal(
      'Support Our Mission',
      field('f-name', 'Full Name', 'text', { required: true }) +
        field('f-email', 'Email', 'email', { required: true }) +
        field('f-amount', 'Amount (GHS)', 'number', { required: true }) +
        field('f-project', 'Project', 'text', { value: defaultProject || '' }) +
        field('f-message', 'Message (optional)', 'textarea', {}),
      async function (overlay) {
        var amount = Number(v(overlay, 'f-amount'));
        if (!amount || amount <= 0) throw new Error('Please enter a valid amount');
        await window.CC_API.donate({
          name: v(overlay, 'f-name'),
          email: v(overlay, 'f-email'),
          amount: amount,
          project: v(overlay, 'f-project') || undefined,
          message: v(overlay, 'f-message') || undefined,
        });
        window.CC_UI.toast('Thank you for your generosity! 💚');
      }
    );
  }

  function bind() {
    document.querySelectorAll('[data-contact]').forEach(function (el) {
      el.addEventListener('click', function (e) { e.preventDefault(); contactModal(); });
    });
    document.querySelectorAll('[data-volunteer]').forEach(function (el) {
      el.addEventListener('click', function (e) { e.preventDefault(); volunteerModal(); });
    });
    document.querySelectorAll('[data-donate]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        donateModal(el.getAttribute('data-project'));
      });
    });
  }

  window.CC_FORMS = { contact: contactModal, volunteer: volunteerModal, donate: donateModal };
  document.addEventListener('DOMContentLoaded', bind);
})();
