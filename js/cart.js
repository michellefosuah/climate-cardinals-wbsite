/**
 * Cart page: renders the localStorage cart (productId-aware) and keeps the
 * order summary totals in sync with the backend rules.
 */
(function () {
  'use strict';

  var PLACEHOLDER =
    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150"><rect width="100%" height="100%" fill="%23fff1eb"/></svg>';

  function itemTemplate(item) {
    return (
      '<div class="glass-card rounded-xl p-md flex flex-col sm:flex-row gap-md items-center">' +
      '<div class="w-full sm:w-32 h-32 rounded-lg overflow-hidden flex-shrink-0">' +
      '<img class="w-full h-full object-cover" src="' + (item.imageUrl || PLACEHOLDER) + '" alt="' + item.name + '"/>' +
      '</div>' +
      '<div class="flex-grow space-y-1 w-full">' +
      '<div class="flex justify-between items-start">' +
      '<div><h3 class="font-headline-md text-lg text-primary">' + item.name + '</h3>' +
      '<p class="text-on-surface-variant font-body-md">Premium Item</p></div>' +
      '<span class="font-bold text-primary">GHS ' + item.price + '</span>' +
      '</div>' +
      '<div class="flex items-center justify-between mt-4">' +
      '<div class="flex items-center border border-outline-variant rounded-full p-1 bg-white/50">' +
      '<button data-dec="' + item.productId + '" class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors text-on-surface-variant"><span class="material-symbols-outlined text-base">remove</span></button>' +
      '<span class="px-4 font-bold text-primary">' + item.quantity + '</span>' +
      '<button data-inc="' + item.productId + '" class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors text-on-surface-variant"><span class="material-symbols-outlined text-base">add</span></button>' +
      '</div>' +
      '<button data-remove="' + item.productId + '" class="flex items-center gap-1 text-error hover:bg-error/5 px-3 py-1 rounded-full transition-colors"><span class="material-symbols-outlined text-sm">delete</span><span class="text-xs font-bold uppercase tracking-wider">Remove</span></button>' +
      '</div></div></div>'
    );
  }

  function render() {
    var Cart = window.CC_API.Cart;
    var items = Cart.all();
    var container = document.getElementById('cart-items');
    if (!container) return;

    if (!items.length) {
      container.innerHTML =
        '<p class="text-center text-on-surface-variant py-lg">Your cart is empty. <a href="shop.html" class="text-primary font-bold hover:underline">Continue shopping</a></p>';
    } else {
      container.innerHTML = items.map(itemTemplate).join('');
      container.querySelectorAll('[data-inc]').forEach(function (b) {
        b.addEventListener('click', function () {
          var id = b.getAttribute('data-inc');
          var it = Cart.all().find(function (x) { return x.productId === id; });
          Cart.setQuantity(id, (it ? it.quantity : 0) + 1);
          refresh();
        });
      });
      container.querySelectorAll('[data-dec]').forEach(function (b) {
        b.addEventListener('click', function () {
          var id = b.getAttribute('data-dec');
          var it = Cart.all().find(function (x) { return x.productId === id; });
          Cart.setQuantity(id, (it ? it.quantity : 0) - 1);
          refresh();
        });
      });
      container.querySelectorAll('[data-remove]').forEach(function (b) {
        b.addEventListener('click', function () {
          Cart.remove(b.getAttribute('data-remove'));
          refresh();
        });
      });
    }
    updateTotals();
  }

  function updateTotals() {
    var t = window.CC_API.Cart.totals();
    setText('subtotal', t.subtotal);
    setText('shipping', t.shipping);
    setText('tax', t.tax);
    setText('total', t.total);
  }

  function setText(id, val) {
    var el = document.getElementById(id);
    if (el) el.textContent = 'GHS ' + Number(val).toFixed(2);
  }

  function refresh() {
    render();
    if (window.CC_UI) window.CC_UI.updateCartBadge();
  }

  document.addEventListener('DOMContentLoaded', render);
})();
