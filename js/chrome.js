/**
 * Single source of truth for the site header and footer.
 * Renders one consistent, self-contained (SVG-icon) header + footer on every
 * page and removes any inline chrome so nothing duplicates.
 */
(function () {
  'use strict';

  var cfg = window.CC_CONFIG || {};
  var social = cfg.social || [];
  var email = cfg.email || 'climatecardinalsknust@gmail.com';
  var icon = window.CC_ICON || function () { return ''; };

  var NAV = [
    { label: 'Home', href: 'main.html' },
    { label: 'Events', href: 'index.html' },
    { label: 'Impact', href: 'impact.html' },
    { label: 'Shop', href: 'shop.html' },
    { label: 'About', href: 'main.html#about' },
    { label: 'Team', href: 'main.html#team' },
  ];

  function currentPage() {
    var p = location.pathname.split('/').pop();
    return p ? p : 'main.html';
  }

  var MARK =
    '<span class="cc-logo__mark"><img src="images/logo-mark.png" alt="Climate Cardinals logo" width="100%" height="100%"/></span>';

  function logo(light) {
    return (
      '<a class="cc-logo" href="main.html" aria-label="Climate Cardinals KNUST home">' +
      MARK +
      '<span class="cc-logo__text">' +
      '<span class="cc-logo__name"' + (light ? ' style="color:#fff"' : '') + '>Climate Cardinals</span>' +
      '<span class="cc-logo__tag">KNUST Chapter</span></span></a>'
    );
  }

  function buildHeader() {
    var page = currentPage();
    var links = NAV.map(function (n) {
      // Only exact page links (no #hash) get the active state, so anchor links
      // like main.html#about don't all light up on the home page.
      var active = n.href === page ? ' class="is-active"' : '';
      return '<a' + active + ' href="' + n.href + '">' + n.label + '</a>';
    }).join('');
    var mobile = NAV.map(function (n) {
      return '<a href="' + n.href + '">' + n.label + '</a>';
    }).join('');

    var header = document.createElement('header');
    header.className = 'cc-header';
    header.innerHTML =
      '<div class="cc-container cc-header__inner">' +
      logo(false) +
      '<nav class="cc-nav">' + links + '</nav>' +
      '<div class="cc-actions">' +
      '<button class="cc-icon-btn" data-account title="Account" aria-label="Account">' + icon('account') + '</button>' +
      '<a class="cc-icon-btn" href="cart.html" title="Cart" aria-label="Cart">' + icon('bag') +
      '<span class="cc-cart-badge" id="cart-badge">0</span></a>' +
      '<button class="cc-icon-btn cc-burger" aria-label="Menu">' + icon('menu') + '</button>' +
      '</div></div>' +
      '<div class="cc-mobile">' + mobile + '</div>';
    return header;
  }

  function buildFooter() {
    var socialHtml = social.map(function (s) {
      var t = s.url.indexOf('mailto:') === 0 ? '' : ' target="_blank" rel="noopener noreferrer"';
      var ic = s.name.toLowerCase().indexOf('insta') === 0 ? 'instagram' : (s.name.toLowerCase().indexOf('mail') === 0 || s.name.toLowerCase().indexOf('email') === 0 ? 'mail' : 'globe');
      return '<a href="' + s.url + '"' + t + ' title="' + s.name + '" aria-label="' + s.name + '">' + icon(ic) + '</a>';
    }).join('');

    var year = document.documentElement.getAttribute('data-year') || '2024';
    var footer = document.createElement('footer');
    footer.className = 'cc-footer';
    footer.innerHTML =
      '<div class="cc-container">' +
      '<div class="cc-footer__top">' +
      '<div class="cc-footer__brand">' + logo(true) +
      '<p class="cc-footer__blurb">Empowering KNUST youth to lead climate action through education, advocacy, translation and hands-on restoration across the Ashanti region.</p>' +
      '<div class="cc-social">' + socialHtml + '</div></div>' +

      '<div class="cc-footer__col"><h4>Explore</h4><ul>' +
      '<li><a href="main.html">Home</a></li>' +
      '<li><a href="index.html">Events</a></li>' +
      '<li><a href="impact.html">Our Impact</a></li>' +
      '<li><a href="shop.html">Merch Store</a></li></ul></div>' +

      '<div class="cc-footer__col"><h4>Get Involved</h4><ul>' +
      '<li><a href="#" data-volunteer>Volunteer</a></li>' +
      '<li><a href="#" data-donate data-project="1000-Tree Initiative">Donate</a></li>' +
      '<li><a href="main.html#team">Our Team</a></li>' +
      '<li><a href="signup.html">Create Account</a></li></ul></div>' +

      '<div class="cc-footer__col"><h4>Contact</h4><div class="cc-footer__contact">' +
      '<a href="mailto:' + email + '">' + icon('mail') + email + '</a>' +
      '<a href="https://maps.google.com/?q=KNUST+Kumasi" target="_blank" rel="noopener noreferrer">' + icon('pin') + 'KNUST, Kumasi, Ghana</a>' +
      '</div></div>' +
      '</div>' +

      '<div class="cc-footer__bottom">' +
      '<p>© ' + year + ' Climate Cardinals KNUST. All rights reserved.</p>' +
      '<div class="cc-footer__legal">' +
      '<a href="#">Privacy Policy</a><a href="#">Terms of Service</a>' +
      '<a href="mailto:' + email + '">Contact Us</a></div>' +
      '</div></div>';
    return footer;
  }

  function mount() {
    // Remove all inline chrome and render the shared header at the top.
    var oldChrome = [].slice.call(
      document.querySelectorAll('body > header, header:not(.cc-header), body > nav')
    );
    var wasFixed = oldChrome.some(function (el) { return /\bfixed\b/.test(el.className); });

    var header = buildHeader();
    document.body.insertBefore(header, document.body.firstChild);
    oldChrome.forEach(function (el) { if (el !== header) el.remove(); });

    if (wasFixed) {
      var main = document.querySelector('main');
      if (main) {
        main.className = main.className.split(/\s+/)
          .filter(function (c) { return !/^pt-(1[0-9]|2[0-9]|3[0-9])$/.test(c); })
          .join(' ');
      }
    }

    var oldFooters = [].slice.call(document.querySelectorAll('footer:not(.cc-footer)'));
    var footer = buildFooter();
    if (oldFooters.length) {
      oldFooters[0].replaceWith(footer);
      oldFooters.slice(1).forEach(function (f) { f.remove(); });
    } else {
      document.body.appendChild(footer);
    }

    wireBurger(header);
    wireAccount(header);
    if (window.CC_UI && window.CC_UI.updateCartBadge) window.CC_UI.updateCartBadge();
    if (window.CC_FORMS) rebindForms();
  }

  function wireBurger(header) {
    var burger = header.querySelector('.cc-burger');
    var menu = header.querySelector('.cc-mobile');
    if (!burger || !menu) return;
    burger.addEventListener('click', function () { menu.classList.toggle('is-open'); });
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { menu.classList.remove('is-open'); });
    });
  }

  function wireAccount(header) {
    var btn = header.querySelector('[data-account]');
    if (!btn || !window.CC_API) return;
    var user = window.CC_API.getUser && window.CC_API.getUser();
    if (window.CC_API.isLoggedIn && window.CC_API.isLoggedIn() && user) {
      btn.title = 'Signed in as ' + user.name + ' — click to log out';
    }
    btn.addEventListener('click', function () {
      if (window.CC_API.isLoggedIn && window.CC_API.isLoggedIn()) {
        if (confirm('Log out of Climate Cardinals?')) {
          window.CC_API.logout();
          if (window.CC_UI) window.CC_UI.toast('Logged out');
          setTimeout(function () { location.reload(); }, 500);
        }
      } else {
        window.location.href = 'login.html';
      }
    });
  }

  function rebindForms() {
    document.querySelectorAll('.cc-footer [data-volunteer]').forEach(function (el) {
      el.addEventListener('click', function (e) { e.preventDefault(); window.CC_FORMS.volunteer(); });
    });
    document.querySelectorAll('.cc-footer [data-donate]').forEach(function (el) {
      el.addEventListener('click', function (e) { e.preventDefault(); window.CC_FORMS.donate(el.getAttribute('data-project')); });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
