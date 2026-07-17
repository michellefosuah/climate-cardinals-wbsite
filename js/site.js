/**
 * Small shared UI helpers used across pages.
 * The header/footer chrome lives in js/chrome.js; this file only provides
 * the toast notification and the cart-badge updater.
 */
(function () {
  'use strict';

  function toast(message, type) {
    var el = document.createElement('div');
    var bg = type === 'error' ? '#ba1a1a' : '#17501a';
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
