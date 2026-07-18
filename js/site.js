/**
 * Small shared UI helpers used across pages.
 * The header/footer chrome lives in js/chrome.js; this file only provides
 * the toast notification and the cart-badge updater.
 */
(function () {
  'use strict';

  function toast(message, type) {
    var el = document.createElement('div');
    el.className = 'cc-toast' + (type === 'error' ? ' cc-toast--error' : '');
    el.textContent = message;
    el.setAttribute('role', 'status');
    document.body.appendChild(el);
    requestAnimationFrame(function () { el.classList.add('show'); });
    setTimeout(function () {
      el.classList.remove('show');
      setTimeout(function () { el.remove(); }, 300);
    }, 3200);
  }

  function updateCartBadge() {
    if (!window.CC_API) return;
    var count = window.CC_API.Cart.count();
    var badge = document.getElementById('cart-badge');
    if (badge) {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    }
  }

  // One-time "demo mode" banner shown when the live API is unreachable and the
  // page is rendering bundled sample content instead.
  function showDemoBanner() {
    if (document.getElementById('cc-demo-banner')) return;
    var bar = document.createElement('div');
    bar.id = 'cc-demo-banner';
    bar.style.cssText =
      'position:sticky;top:0;z-index:1200;background:#e2b13c;color:#3a2c05;' +
      'font-family:Atkinson Hyperlegible Next,system-ui,sans-serif;font-size:14px;' +
      'padding:9px 16px;text-align:center;line-height:1.4;';
    bar.innerHTML =
      '<b>Demo mode</b> — showing sample content because the live API isn’t connected yet. ' +
      'Browsing works; checkout, sign-in and forms need the deployed backend. ' +
      '<button id="cc-demo-x" style="background:none;border:none;text-decoration:underline;cursor:pointer;color:inherit;font:inherit">Dismiss</button>';
    document.body.insertBefore(bar, document.body.firstChild);
    var x = document.getElementById('cc-demo-x');
    if (x) x.addEventListener('click', function () { bar.remove(); });
  }

  window.CC_UI = { toast: toast, updateCartBadge: updateCartBadge, showDemoBanner: showDemoBanner };

  window.addEventListener('cc:demo', showDemoBanner);
  document.addEventListener('DOMContentLoaded', function () {
    updateCartBadge();
    if (window.CC_API && window.CC_API.demoMode) showDemoBanner();
  });
})();
