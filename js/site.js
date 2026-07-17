/**
 * Shared site chrome, loaded on every page:
 *  - injects a consistent social-media bar into the footer
 *  - keeps the cart badge count in sync
 *  - wires the account icon (login / logout depending on session)
 *  - provides CC_UI.toast() for lightweight feedback
 */
(function () {
  'use strict';

  var social = (window.CC_CONFIG && window.CC_CONFIG.social) || [];

  // ---- toast --------------------------------------------------------------
  function toast(message, type) {
    var el = document.createElement('div');
    var bg = type === 'error' ? '#ba1a1a' : '#154212';
    el.textContent = message;
    el.setAttribute('role', 'status');
    el.style.cssText =
      'position:fixed;left:50%;bottom:24px;transform:translateX(-50%);' +
      'background:' + bg + ';color:#fff;padding:12px 20px;border-radius:9999px;' +
      'font-family:Atkinson Hyperlegible Next,sans-serif;font-size:15px;' +
      'box-shadow:0 8px 24px rgba(0,0,0,.18);z-index:9999;opacity:0;' +
      'transition:opacity .25s,transform .25s;max-width:90vw;text-align:center;';
    document.body.appendChild(el);
    requestAnimationFrame(function () {
      el.style.opacity = '1';
    });
    setTimeout(function () {
      el.style.opacity = '0';
      el.style.transform = 'translateX(-50%) translateY(8px)';
      setTimeout(function () {
        el.remove();
      }, 300);
    }, 3200);
  }

  // ---- social bar injection ----------------------------------------------
  function buildSocialBar() {
    if (!social.length) return null;
    var wrap = document.createElement('div');
    wrap.className = 'cc-social-bar';
    wrap.style.cssText =
      'display:flex;gap:10px;align-items:center;justify-content:center;flex-wrap:wrap;';
    social.forEach(function (s) {
      var a = document.createElement('a');
      a.href = s.url;
      a.title = s.name;
      a.setAttribute('aria-label', s.name);
      if (s.url.indexOf('mailto:') !== 0) {
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
      }
      a.style.cssText =
        'width:40px;height:40px;border-radius:9999px;display:flex;' +
        'align-items:center;justify-content:center;background:rgba(21,66,18,.08);' +
        'color:#154212;transition:background .2s,transform .15s;text-decoration:none;';
      a.onmouseenter = function () {
        a.style.background = '#acf847';
      };
      a.onmouseleave = function () {
        a.style.background = 'rgba(21,66,18,.08)';
      };
      var icon = document.createElement('span');
      icon.className = 'material-symbols-outlined';
      icon.textContent = s.icon;
      a.appendChild(icon);
      wrap.appendChild(a);
    });
    return wrap;
  }

  function injectSocial() {
    var footer = document.querySelector('footer');
    if (!footer || footer.querySelector('.cc-social-bar')) return;
    var bar = buildSocialBar();
    if (!bar) return;
    var container = footer.querySelector('.max-w-container-max') || footer;
    // Add a small "Follow us" row.
    var row = document.createElement('div');
    row.style.cssText =
      'width:100%;display:flex;flex-direction:column;align-items:center;gap:8px;' +
      'padding:16px 0 4px;';
    var label = document.createElement('div');
    label.textContent = 'Follow the movement';
    label.style.cssText =
      'font-family:Plus Jakarta Sans,sans-serif;font-size:12px;letter-spacing:.05em;' +
      'text-transform:uppercase;font-weight:700;color:#416900;';
    row.appendChild(label);
    row.appendChild(bar);
    container.appendChild(row);
  }

  // ---- cart badge ---------------------------------------------------------
  function updateCartBadge() {
    if (!window.CC_API) return;
    var count = window.CC_API.Cart.count();
    var badge = document.getElementById('cart-badge');
    if (badge) {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    }
  }

  // ---- account icon -------------------------------------------------------
  function wireAccount() {
    if (!window.CC_API) return;
    var loggedIn = window.CC_API.isLoggedIn();
    var user = window.CC_API.getUser();
    // Any element with [data-account] or the account_circle icons become links.
    var nodes = document.querySelectorAll(
      '[data-account], .material-symbols-outlined'
    );
    nodes.forEach(function (node) {
      var isAccount =
        node.hasAttribute('data-account') ||
        node.textContent.trim() === 'account_circle';
      if (!isAccount) return;
      var target = node.closest('a,button') || node;
      target.style.cursor = 'pointer';
      if (loggedIn && user) target.title = 'Signed in as ' + user.name;
      target.addEventListener('click', function (e) {
        e.preventDefault();
        if (window.CC_API.isLoggedIn()) {
          if (confirm('Log out of Climate Cardinals?')) {
            window.CC_API.logout();
            toast('Logged out');
            setTimeout(function () {
              location.reload();
            }, 600);
          }
        } else {
          window.location.href = 'login.html';
        }
      });
    });
  }

  window.CC_UI = { toast: toast, updateCartBadge: updateCartBadge };

  document.addEventListener('DOMContentLoaded', function () {
    injectSocial();
    updateCartBadge();
    wireAccount();
  });
})();
