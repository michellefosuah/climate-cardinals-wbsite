/**
 * Events page: loads events from the API, renders cards, filters by category,
 * registration modal, and newsletter subscription. Self-contained styling.
 */
(function () {
  'use strict';

  var icon = window.CC_ICON || function () { return ''; };
  var MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
  var state = { category: '' };

  function fmtTime(iso) {
    return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }

  function card(ev) {
    var start = new Date(ev.startTime);
    var time = fmtTime(ev.startTime) + (ev.endTime ? ' – ' + fmtTime(ev.endTime) : '');
    var thumb = ev.imageUrl
      ? '<div class="cc-event__thumb"><img src="' + ev.imageUrl + '" alt="' + ev.title + '" onerror="this.parentNode.style.display=\'none\'"/></div>'
      : '';
    var full = ev.capacity != null && ev.registrationCount >= ev.capacity;
    return (
      '<article class="cc-card cc-event cc-reveal">' +
      '<div class="cc-event__date"><span class="m">' + MONTHS[start.getMonth()] + '</span>' +
      '<span class="d">' + String(start.getDate()).padStart(2, '0') + '</span></div>' +
      '<div class="cc-event__body">' +
      '<h3 class="cc-event__title">' + ev.title + '</h3>' +
      '<div class="cc-event__meta">' +
      '<span>' + icon('clock', { size: 17 }) + time + '</span>' +
      '<span>' + icon('pin', { size: 17 }) + ev.location + '</span>' +
      (ev.capacity != null ? '<span>' + icon('users', { size: 17 }) + (ev.registrationCount || 0) + '/' + ev.capacity + '</span>' : '') +
      '</div>' +
      '<p class="cc-muted" style="font-size:.95rem">' + ev.description + '</p>' +
      '<div style="margin-top:6px">' +
      '<button ' + (full ? 'disabled' : '') + ' data-register="' + ev.slug + '" data-title="' +
      ev.title.replace(/"/g, '&quot;') + '" class="cc-btn ' + (full ? 'cc-btn--ghost' : 'cc-btn--primary') + '">' +
      (full ? 'Fully booked' : 'Register') + '</button>' +
      '</div></div>' + thumb + '</article>'
    );
  }

  async function load() {
    var list = document.getElementById('events-list');
    if (!list) return;
    list.innerHTML = '<div class="cc-loading">Loading events…</div>';
    try {
      var query = {};
      if (state.category) query.category = state.category;
      var res = await window.CC_API.listEvents(query);
      var events = res.data || [];
      if (!events.length) {
        list.innerHTML = '<div class="cc-loading">No events in this category yet — check back soon!</div>';
        return;
      }
      list.innerHTML = events.map(card).join('');
      list.querySelectorAll('[data-register]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          openModal(btn.getAttribute('data-register'), btn.getAttribute('data-title'));
        });
      });
      revealIn(list);
    } catch (err) {
      list.innerHTML = '<div class="cc-loading" style="color:var(--danger)">' + err.message + '</div>';
    }
  }

  function revealIn(scope) {
    scope.querySelectorAll('.cc-reveal').forEach(function (n) { n.classList.add('is-in'); });
  }

  function fieldHtml(id, label, type, value) {
    return (
      '<div class="cc-field"><label class="cc-label" for="' + id + '">' + label + '</label>' +
      '<input id="' + id + '" class="cc-input" type="' + type + '" value="' + (value || '') + '"/></div>'
    );
  }

  function openModal(slug, title) {
    var user = window.CC_API.getUser();
    var overlay = document.createElement('div');
    overlay.className = 'cc-modal-overlay';
    overlay.innerHTML =
      '<div class="cc-modal"><div class="cc-modal__head"><h3>Register: ' + title + '</h3>' +
      '<button class="cc-modal__close" data-close aria-label="Close">' + icon('close') + '</button></div>' +
      '<form data-reg-form>' +
      fieldHtml('reg-name', 'Full name', 'text', user ? user.name : '') +
      fieldHtml('reg-email', 'Email', 'email', user ? user.email : '') +
      fieldHtml('reg-phone', 'Phone (optional)', 'tel', '') +
      '<button type="submit" class="cc-btn cc-btn--primary cc-btn--block">Confirm registration</button>' +
      '</form></div>';
    document.body.appendChild(overlay);

    function close() { overlay.remove(); }
    overlay.querySelector('[data-close]').addEventListener('click', close);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });

    overlay.querySelector('[data-reg-form]').addEventListener('submit', async function (e) {
      e.preventDefault();
      var btn = e.target.querySelector('button[type="submit"]');
      var name = document.getElementById('reg-name').value.trim();
      var em = document.getElementById('reg-email').value.trim();
      var phone = document.getElementById('reg-phone').value.trim();
      if (!name || !em) { window.CC_UI.toast('Name and email are required', 'error'); return; }
      btn.disabled = true; btn.textContent = 'Registering…';
      try {
        await window.CC_API.registerForEvent(slug, { name: name, email: em, phone: phone || undefined });
        close();
        window.CC_UI.toast('You are registered! See you there 🌱');
        load();
      } catch (err) {
        window.CC_UI.toast(err.message, 'error');
        btn.disabled = false; btn.textContent = 'Confirm registration';
      }
    });
  }

  function bindFilters() {
    document.querySelectorAll('[data-event-category]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('[data-event-category]').forEach(function (b) { b.classList.remove('is-active'); });
        btn.classList.add('is-active');
        state.category = btn.getAttribute('data-event-category');
        load();
      });
    });
  }

  function bindNewsletter() {
    var form = document.getElementById('newsletter-form');
    if (!form) return;
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      var input = form.querySelector('input[type="email"]');
      var email = input.value.trim();
      if (!email) return;
      try {
        await window.CC_API.subscribeNewsletter(email);
        input.value = '';
        window.CC_UI.toast('Subscribed! Watch your inbox 🌍');
      } catch (err) { window.CC_UI.toast(err.message, 'error'); }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    bindFilters();
    bindNewsletter();
    load();
  });
})();
