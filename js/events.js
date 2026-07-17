/**
 * Events page: loads events from the API, renders cards, filters by category,
 * handles a registration modal, and wires newsletter subscription.
 */
(function () {
  'use strict';

  var MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
  var state = { category: '' };

  function fmtTime(iso) {
    var d = new Date(iso);
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }

  function cardTemplate(ev) {
    var start = new Date(ev.startTime);
    var timeRange = fmtTime(ev.startTime) + (ev.endTime ? ' - ' + fmtTime(ev.endTime) : '');
    var img = ev.imageUrl
      ? '<div class="hidden lg:block w-48 h-32 rounded-lg overflow-hidden flex-shrink-0"><img class="w-full h-full object-cover" src="' + ev.imageUrl + '" alt="' + ev.title + '"/></div>'
      : '';
    var full = ev.capacity != null && ev.registrationCount >= ev.capacity;
    return (
      '<div class="event-card-hover group flex flex-col md:flex-row gap-md p-md bg-surface-container-lowest rounded-xl border border-outline/10 overflow-hidden">' +
      '<div class="flex-shrink-0 flex flex-col items-center justify-center w-24 h-24 bg-primary-container text-on-primary-container rounded-xl">' +
      '<span class="font-label-caps text-label-caps uppercase opacity-80">' + MONTHS[start.getMonth()] + '</span>' +
      '<span class="font-headline-md text-3xl font-bold">' + String(start.getDate()).padStart(2,'0') + '</span>' +
      '</div>' +
      '<div class="flex-grow space-y-sm">' +
      '<div><h3 class="font-headline-md text-headline-md text-primary">' + ev.title + '</h3>' +
      '<div class="flex flex-wrap gap-md mt-1 text-on-surface-variant font-body-md">' +
      '<div class="flex items-center gap-1"><span class="material-symbols-outlined text-lg">schedule</span><span>' + timeRange + '</span></div>' +
      '<div class="flex items-center gap-1"><span class="material-symbols-outlined text-lg">location_on</span><span>' + ev.location + '</span></div>' +
      '</div></div>' +
      '<p class="text-on-surface-variant max-w-2xl leading-relaxed">' + ev.description + '</p>' +
      '<div class="flex items-center gap-sm pt-sm">' +
      '<button ' + (full ? 'disabled' : '') + ' data-register="' + ev.slug + '" data-title="' + ev.title.replace(/"/g,'&quot;') + '" class="px-xl py-2 ' +
      (full ? 'bg-outline/40 cursor-not-allowed' : 'bg-primary hover:bg-primary/90') +
      ' text-on-primary rounded-full transition-all font-bold shadow-sm">' + (full ? 'Fully Booked' : 'Register') + '</button>' +
      '</div></div>' + img + '</div>'
    );
  }

  async function load() {
    var list = document.getElementById('events-list');
    if (!list) return;
    list.innerHTML = '<p class="text-center text-on-surface-variant py-8">Loading events…</p>';
    try {
      var query = { upcoming: false };
      if (state.category) query.category = state.category;
      var res = await window.CC_API.listEvents(query);
      var events = res.data || [];
      if (!events.length) {
        list.innerHTML = '<p class="text-center text-on-surface-variant py-8">No events in this category yet. Check back soon!</p>';
        return;
      }
      list.innerHTML = events.map(cardTemplate).join('');
      list.querySelectorAll('[data-register]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          openModal(btn.getAttribute('data-register'), btn.getAttribute('data-title'));
        });
      });
    } catch (err) {
      list.innerHTML = '<p class="text-center text-error py-8">' + err.message + '</p>';
    }
  }

  // ---- registration modal --------------------------------------------------
  function openModal(slug, title) {
    var user = window.CC_API.getUser();
    var overlay = document.createElement('div');
    overlay.style.cssText =
      'position:fixed;inset:0;background:rgba(21,66,18,.35);backdrop-filter:blur(4px);' +
      'display:flex;align-items:center;justify-content:center;padding:24px;z-index:9998;';
    overlay.innerHTML =
      '<div style="background:#fff8f6;border-radius:24px;max-width:440px;width:100%;padding:28px;box-shadow:0 20px 60px rgba(0,0,0,.25)">' +
      '<div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:16px">' +
      '<h3 style="font-family:Plus Jakarta Sans;font-size:22px;font-weight:700;color:#154212">Register: ' + title + '</h3>' +
      '<button data-close style="background:none;border:none;cursor:pointer;color:#42493e"><span class="material-symbols-outlined">close</span></button></div>' +
      '<form data-reg-form style="display:flex;flex-direction:column;gap:12px">' +
      inputHtml('reg-name', 'Full Name', 'text', user ? user.name : '') +
      inputHtml('reg-email', 'Email', 'email', user ? user.email : '') +
      inputHtml('reg-phone', 'Phone (optional)', 'tel', '') +
      '<button type="submit" style="background:#154212;color:#fff;border:none;padding:12px;border-radius:9999px;font-weight:700;cursor:pointer;margin-top:8px">Confirm Registration</button>' +
      '</form></div>';
    document.body.appendChild(overlay);

    function close() { overlay.remove(); }
    overlay.querySelector('[data-close]').addEventListener('click', close);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });

    overlay.querySelector('[data-reg-form]').addEventListener('submit', async function (e) {
      e.preventDefault();
      var btn = e.target.querySelector('button[type="submit"]');
      var name = document.getElementById('reg-name').value.trim();
      var email = document.getElementById('reg-email').value.trim();
      var phone = document.getElementById('reg-phone').value.trim();
      if (!name || !email) { window.CC_UI.toast('Name and email are required', 'error'); return; }
      btn.disabled = true; btn.textContent = 'Registering…';
      try {
        await window.CC_API.registerForEvent(slug, { name: name, email: email, phone: phone || undefined });
        close();
        window.CC_UI.toast('You are registered! See you there 🌱');
        load();
      } catch (err) {
        window.CC_UI.toast(err.message, 'error');
        btn.disabled = false; btn.textContent = 'Confirm Registration';
      }
    });
  }

  function inputHtml(id, label, type, value) {
    return (
      '<label style="font-size:12px;text-transform:uppercase;letter-spacing:.05em;font-weight:700;color:#42493e">' + label +
      '<input id="' + id + '" type="' + type + '" value="' + (value || '') + '" style="width:100%;margin-top:4px;padding:10px;border:1px solid rgba(114,121,110,.3);border-radius:8px;font-family:Atkinson Hyperlegible Next;background:#fff"/></label>'
    );
  }

  // ---- category filter -----------------------------------------------------
  function bindFilters() {
    document.querySelectorAll('[data-event-category]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('[data-event-category]').forEach(function (b) {
          b.classList.remove('bg-primary', 'text-on-primary');
          b.classList.add('bg-surface-container-high', 'text-on-surface');
        });
        btn.classList.add('bg-primary', 'text-on-primary');
        btn.classList.remove('bg-surface-container-high', 'text-on-surface');
        state.category = btn.getAttribute('data-event-category');
        load();
      });
    });
  }

  // ---- newsletter ----------------------------------------------------------
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
      } catch (err) {
        window.CC_UI.toast(err.message, 'error');
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    bindFilters();
    bindNewsletter();
    load();
  });
})();
