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

  window.CC_UI = { toast: toast, updateCartBadge: updateCartBadge };

  document.addEventListener('DOMContentLoaded', updateCartBadge);
})();
