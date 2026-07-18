/**
 * Cart page: renders the localStorage cart (productId-aware) with backend-
 * matching totals.
 */
(function () {
  'use strict';

  var icon = window.CC_ICON || function () { return ''; };

  function line(item) {
    var img = item.imageUrl
      ? '<img src="' + item.imageUrl + '" alt="' + item.name + '" onerror="this.style.display=\'none\'"/>'
      : '';
    return (
      '<div class="cc-card cc-line">' +
      '<div class="cc-line__img">' + img + '</div>' +
      '<div class="cc-line__body">' +
      '<div style="display:flex;justify-content:space-between;gap:12px">' +
      '<div><h3 style="font-family:var(--font-head);font-weight:700;color:var(--forest-800)">' + item.name + '</h3>' +
      '<p class="cc-muted" style="font-size:.85rem">Premium item</p></div>' +
      '<b class="cc-product__price">GHS ' + item.price + '</b></div>' +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-top:14px">' +
      '<div class="cc-qty">' +
      '<button data-dec="' + item.productId + '" aria-label="Decrease">' + icon('minus', { size: 18 }) + '</button>' +
      '<span>' + item.quantity + '</span>' +
      '<button data-inc="' + item.productId + '" aria-label="Increase">' + icon('plus', { size: 18 }) + '</button></div>' +
      '<button class="cc-link-danger" data-remove="' + item.productId + '">' + icon('trash', { size: 16 }) + ' Remove</button>' +
      '</div></div></div>'
    );
  }

  function render() {
    var Cart = window.CC_API.Cart;
    var items = Cart.all();
    var box = document.getElementById('cart-items');
    if (!box) return;

    if (!items.length) {
      box.innerHTML = '<div class="cc-card" style="padding:40px;text-align:center;color:var(--ink-soft)">Your cart is empty. <a href="shop.html" style="color:var(--primary);font-weight:700">Continue shopping →</a></div>';
    } else {
      box.innerHTML = items.map(line).join('');
      box.querySelectorAll('[data-inc]').forEach(function (b) {
        b.addEventListener('click', function () {
          var id = b.getAttribute('data-inc');
          var it = Cart.all().find(function (x) { return x.productId === id; });
          Cart.setQuantity(id, (it ? it.quantity : 0) + 1); refresh();
        });
      });
      box.querySelectorAll('[data-dec]').forEach(function (b) {
        b.addEventListener('click', function () {
          var id = b.getAttribute('data-dec');
          var it = Cart.all().find(function (x) { return x.productId === id; });
          Cart.setQuantity(id, (it ? it.quantity : 0) - 1); refresh();
        });
      });
      box.querySelectorAll('[data-remove]').forEach(function (b) {
        b.addEventListener('click', function () { Cart.remove(b.getAttribute('data-remove')); refresh(); });
      });
    }
    updateTotals();
  }

  function updateTotals() {
    var t = window.CC_API.Cart.totals();
    set('subtotal', t.subtotal); set('shipping', t.shipping); set('tax', t.tax); set('total', t.total);
  }
  function set(id, v) { var e = document.getElementById(id); if (e) e.textContent = 'GHS ' + Number(v).toFixed(2); }

  function refresh() { render(); if (window.CC_UI) window.CC_UI.updateCartBadge(); }

  document.addEventListener('DOMContentLoaded', render);
})();
