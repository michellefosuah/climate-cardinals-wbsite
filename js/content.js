/**
 * Loads editable site content from the API into any matching containers:
 *   [data-impact-stats]      -> impact metrics
 *   [data-team=leadership]   -> leadership team cards
 *   [data-team=fellow]       -> fellows cards
 *   [data-featured-products] -> up to N product cards
 *   [data-scroll-reveal]     -> fade-in on scroll
 * Safe on any page: only runs for containers that exist.
 */
(function () {
  'use strict';

  var icon = window.CC_ICON || function () { return ''; };
  var STAT_ICONS = { translate: 'translate', groups: 'users', forest: 'tree', school: 'school', language: 'globe' };

  function el(id) { return document.querySelector(id); }

  // ---- impact stats --------------------------------------------------------
  async function loadImpact() {
    var box = document.querySelector('[data-impact-stats]');
    if (!box) return;
    try {
      var res = await window.CC_API.listImpact();
      var stats = res.data || [];
      if (!stats.length) return;
      box.innerHTML = stats.map(function (s) {
        return (
          '<div class="cc-card cc-stat cc-reveal">' +
          '<div class="cc-stat__num">' + s.value + '</div>' +
          '<div class="cc-stat__label">' + s.label + '</div>' +
          (s.description ? '<div class="cc-stat__desc">' + s.description + '</div>' : '') +
          '</div>'
        );
      }).join('');
      observeReveal(box);
    } catch (e) { /* leave any static fallback in place */ }
  }

  // ---- team ----------------------------------------------------------------
  function teamCard(m) {
    var photo = m.imageUrl
      ? '<img src="' + m.imageUrl + '" alt="' + m.name + '" onerror="this.style.display=\'none\'"/>'
      : '';
    return (
      '<div class="cc-card cc-team-card cc-reveal">' +
      '<div class="cc-team-card__photo">' + photo + '</div>' +
      '<h3>' + m.name + '</h3><div class="role">' + m.role + '</div>' +
      (m.bio ? '<p>' + m.bio + '</p>' : '') +
      '</div>'
    );
  }
  async function loadTeam() {
    var lead = document.querySelector('[data-team="leadership"]');
    var fellows = document.querySelector('[data-team="fellow"]');
    if (!lead && !fellows) return;
    try {
      var res = await window.CC_API.listTeam();
      var members = res.data || [];
      if (lead) {
        lead.innerHTML = members.filter(function (m) { return m.tier === 'LEADERSHIP'; }).map(teamCard).join('');
        observeReveal(lead);
      }
      if (fellows) {
        fellows.innerHTML = members.filter(function (m) { return m.tier === 'FELLOW'; }).map(teamCard).join('');
        observeReveal(fellows);
      }
    } catch (e) { /* keep fallback */ }
  }

  // ---- featured products ---------------------------------------------------
  async function loadFeatured() {
    var box = document.querySelector('[data-featured-products]');
    if (!box) return;
    var limit = parseInt(box.getAttribute('data-limit'), 10) || 3;
    try {
      var res = await window.CC_API.listProducts({ limit: limit });
      var items = res.data || [];
      box.innerHTML = items.map(function (p) {
        var img = p.imageUrl
          ? '<img src="' + p.imageUrl + '" alt="' + p.name + '" onerror="this.parentNode.innerHTML=\'\'"/>'
          : '';
        return (
          '<a href="shop.html" class="cc-card cc-product cc-reveal">' +
          '<div class="cc-product__media">' + img + '</div>' +
          '<div class="cc-product__body">' +
          '<div class="cc-product__row"><span class="cc-product__name">' + p.name + '</span>' +
          '<span class="cc-product__price">GHS ' + p.price + '</span></div>' +
          '<p class="cc-product__desc">' + p.description + '</p></div></a>'
        );
      }).join('');
      observeReveal(box);
    } catch (e) { /* keep fallback */ }
  }

  // ---- upcoming events (home) ---------------------------------------------
  var MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
  function fmtTime(iso) {
    return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }
  async function loadHomeEvents() {
    var box = document.querySelector('[data-home-events]');
    if (!box) return;
    try {
      var res = await window.CC_API.listEvents({});
      var events = (res.data || []).slice(0, 3);
      if (!events.length) { box.innerHTML = '<div class="cc-loading">No upcoming events right now.</div>'; return; }
      box.innerHTML = events.map(function (ev) {
        var d = new Date(ev.startTime);
        var time = fmtTime(ev.startTime) + (ev.endTime ? ' – ' + fmtTime(ev.endTime) : '');
        var evfb = 'images/events/' + ev.slug + '.svg';
        var thumb = ev.imageUrl ? '<div class="cc-event__thumb"><img src="' + ev.imageUrl + '" alt="' + ev.title + '" onerror="this.onerror=null;this.src=\'' + evfb + '\'"/></div>' : '';
        return (
          '<article class="cc-card cc-event cc-reveal">' +
          '<div class="cc-event__date"><span class="m">' + MONTHS[d.getMonth()] + '</span><span class="d">' + String(d.getDate()).padStart(2,'0') + '</span></div>' +
          '<div class="cc-event__body">' +
          '<h3 class="cc-event__title">' + ev.title + '</h3>' +
          '<div class="cc-event__meta"><span>' + icon('clock',{size:17}) + time + '</span><span>' + icon('pin',{size:17}) + ev.location + '</span></div>' +
          '<p class="cc-muted" style="font-size:.95rem">' + ev.description + '</p>' +
          '<div style="margin-top:4px"><a href="index.html" class="cc-btn cc-btn--primary">Register</a></div>' +
          '</div>' + thumb + '</article>'
        );
      }).join('');
      observeReveal(box);
    } catch (e) { box.innerHTML = '<div class="cc-loading">Could not load events.</div>'; }
  }

  // ---- scroll reveal -------------------------------------------------------
  var io;
  function observeReveal(scope) {
    if (!('IntersectionObserver' in window)) {
      (scope || document).querySelectorAll('.cc-reveal').forEach(function (n) { n.classList.add('is-in'); });
      return;
    }
    if (!io) {
      io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
        });
      }, { threshold: 0.12 });
    }
    (scope || document).querySelectorAll('.cc-reveal:not(.is-in)').forEach(function (n) { io.observe(n); });
  }

  document.addEventListener('DOMContentLoaded', function () {
    loadImpact();
    loadTeam();
    loadFeatured();
    loadHomeEvents();
    observeReveal(document);
  });
})();
