/**
 * Renders ONE consistent header and footer on every page, replacing whatever
 * inline header/nav/footer the page shipped with. This is the single source of
 * truth for site chrome, so the header length and footer content are identical
 * everywhere. Also wires the mobile menu, cart badge, and account button.
 */
(function () {
  'use strict';

  var cfg = window.CC_CONFIG || {};
  var social = cfg.social || [];
  var email = cfg.email || 'climatecardinalsknust@gmail.com';

  var NAV = [
    { label: 'Home', href: 'main.html' },
    { label: 'Events', href: 'index.html' },
    { label: 'Impact', href: 'impact.html' },
    { label: 'Shop', href: 'shop.html' },
    { label: 'About', href: 'main.html#about' },
    { label: 'Team', href: 'main.html#team' },
  ];

  function currentPage() {
    var path = location.pathname.split('/').pop() || 'main.html';
    return path === '' ? 'main.html' : path;
  }

  function logoMark() {
    return (
      '<span class="cc-logo__mark"><span class="material-symbols-outlined">eco</span></span>'
    );
  }

  // ---- HEADER --------------------------------------------------------------
  function buildHeader() {
    var page = currentPage();
    var links = NAV.map(function (n) {
      var active = n.href.split('#')[0] === page ? ' is-active' : '';
      return '<a class="' + active.trim() + '" href="' + n.href + '">' + n.label + '</a>';
    }).join('');

    var mobileLinks = NAV.map(function (n) {
      return '<a href="' + n.href + '">' + n.label + '</a>';
    }).join('');

    var header = document.createElement('header');
    header.className = 'cc-header';
    header.innerHTML =
      '<div class="cc-container cc-header__inner">' +
      '<a class="cc-logo" href="main.html" aria-label="Climate Cardinals KNUST home">' +
      logoMark() +
      '<span class="cc-logo__text"><span class="cc-logo__name">Climate Cardinals</span>' +
      '<span class="cc-logo__tag">KNUST Chapter</span></span></a>' +
      '<nav class="cc-nav">' + links + '</nav>' +
      '<div class="cc-actions">' +
      '<button class="cc-icon-btn" data-account title="Account" aria-label="Account"><span class="material-symbols-outlined">account_circle</span></button>' +
      '<a class="cc-icon-btn" href="cart.html" title="Cart" aria-label="Cart"><span class="material-symbols-outlined">shopping_bag</span>' +
      '<span class="cc-cart-badge" id="cart-badge">0</span></a>' +
      '<button class="cc-icon-btn cc-burger" aria-label="Menu"><span class="material-symbols-outlined">menu</span></button>' +
      '</div></div>' +
      '<div class="cc-mobile">' + mobileLinks + '</div>';
    return header;
  }

  // ---- FOOTER --------------------------------------------------------------
  function buildFooter() {
    var socialHtml = social.map(function (s) {
      var target = s.url.indexOf('mailto:') === 0 ? '' : ' target="_blank" rel="noopener noreferrer"';
      return '<a href="' + s.url + '"' + target + ' title="' + s.name + '" aria-label="' + s.name + '">' +
        '<span class="material-symbols-outlined">' + s.icon + '</span></a>';
    }).join('');

    var year = document.documentElement.getAttribute('data-year') || '2024';

    var footer = document.createElement('footer');
    footer.className = 'cc-footer';
    footer.innerHTML =
      '<div class="cc-container">' +
      '<div class="cc-footer__top">' +

      // Brand
      '<div class="cc-footer__brand">' +
      '<a class="cc-logo" href="main.html">' + logoMark() +
      '<span class="cc-logo__text"><span class="cc-logo__name" style="color:#fff">Climate Cardinals</span>' +
      '<span class="cc-logo__tag">KNUST Chapter</span></span></a>' +
      '<p class="cc-footer__blurb">Empowering KNUST youth to lead climate action through education, advocacy, translation, and hands-on restoration across the Ashanti region.</p>' +
      '<div class="cc-social">' + socialHtml + '</div>' +
      '</div>' +

      // Explore
      '<div class="cc-footer__col"><h4>Explore</h4><ul>' +
      '<li><a href="main.html">Home</a></li>' +
      '<li><a href="index.html">Events</a></li>' +
      '<li><a href="impact.html">Our Impact</a></li>' +
      '<li><a href="shop.html">Merch Store</a></li>' +
      '</ul></div>' +

      // Get involved
      '<div class="cc-footer__col"><h4>Get Involved</h4><ul>' +
      '<li><a href="main.html#contact" data-volunteer>Volunteer</a></li>' +
      '<li><a href="impact.html" data-donate data-project="1000-Tree Initiative">Donate</a></li>' +
      '<li><a href="main.html#team">Our Team</a></li>' +
      '<li><a href="signup.html">Create Account</a></li>' +
      '</ul></div>' +

      // Contact
      '<div class="cc-footer__col"><h4>Contact</h4>' +
      '<div class="cc-footer__contact">' +
      '<a href="mailto:' + email + '"><span class="material-symbols-outlined">mail</span>' + email + '</a>' +
      '<a href="https://maps.google.com/?q=KNUST+Kumasi" target="_blank" rel="noopener noreferrer"><span class="material-symbols-outlined">location_on</span>KNUST, Kumasi, Ghana</a>' +
      '</div></div>' +

      '</div>' + // /top

      '<div class="cc-footer__bottom">' +
      '<p>© ' + year + ' Climate Cardinals KNUST. All rights reserved.</p>' +
      '<div class="cc-footer__legal">' +
      '<a href="#">Privacy Policy</a>' +
      '<a href="#">Terms of Service</a>' +
      '<a href="mailto:' + email + '">Contact Us</a>' +
      '</div>' +
      '</div>' +
      '</div>';
    return footer;
  }

  // ---- mount ---------------------------------------------------------------
  function mount() {
    // Collect every piece of inline chrome the page shipped with: inline
    // <header>s and any top-level <nav> bars / mobile menus that are direct
    // children of <body>. We remove them all and render one shared header.
    var oldChrome = [].slice.call(
      document.querySelectorAll('body > header, header:not(.cc-header), body > nav')
    );
    var wasFixed = oldChrome.some(function (el) {
      return /\bfixed\b/.test(el.className);
    });

    // Insert the shared header at the very top of the body.
    var header = buildHeader();
    document.body.insertBefore(header, document.body.firstChild);

    // Remove all the old chrome (header contains its own .cc-nav, which is not
    // a direct child of body, so it is never matched here).
    oldChrome.forEach(function (el) {
      if (el !== header) el.remove();
    });

    // Pages that used a position:fixed header added top padding to <main> to
    // compensate. Our sticky header sits in normal flow, so strip that padding.
    if (wasFixed) {
      var main = document.querySelector('main');
      if (main) {
        main.className = main.className
          .split(/\s+/)
          .filter(function (c) { return !/^pt-(1[0-9]|2[0-9]|3[0-9])$/.test(c); })
          .join(' ');
      }
    }

    // Replace every inline footer with the single shared footer.
    var oldFooters = [].slice.call(
      document.querySelectorAll('footer:not(.cc-footer)')
    );
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
    // Re-bind engagement CTAs that now live in the footer (contact/volunteer/donate).
    if (window.CC_FORMS) rebindForms();
  }

  function wireBurger(header) {
    var burger = header.querySelector('.cc-burger');
    var menu = header.querySelector('.cc-mobile');
    if (burger && menu) {
      burger.addEventListener('click', function () {
        menu.classList.toggle('is-open');
      });
      menu.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', function () { menu.classList.remove('is-open'); });
      });
    }
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
      el.addEventListener('click', function (e) {
        e.preventDefault();
        window.CC_FORMS.donate(el.getAttribute('data-project'));
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
