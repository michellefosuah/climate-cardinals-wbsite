/**
 * Checkout page: renders the order summary from the cart, collects shipping
 * and payment details, and posts a real order to the API. On success it stores
 * the order for the confirmation page and clears the cart.
 */
(function () {
  'use strict';

  var state = { paymentMethod: 'CARD', donation: 0 };
  var DONATION_AMOUNT = 10;

  function money(n) {
    return 'GHS ' + Number(n).toFixed(2);
  }

  function renderSummary() {
    var items = window.CC_API.Cart.all();
    var list = document.getElementById('summary-items');
    if (list) {
      if (!items.length) {
        list.innerHTML =
          '<p class="text-on-surface-variant text-sm">Your cart is empty. <a href="shop.html" class="text-primary font-bold hover:underline">Add some merch</a>.</p>';
      } else {
        list.innerHTML = items
          .map(function (it) {
            return (
              '<div class="flex items-center gap-md">' +
              '<div class="w-20 h-20 rounded-lg bg-surface-bright border border-outline/10 flex-shrink-0 bg-cover bg-center" style="background-image:url(\'' +
              (it.imageUrl || '') + '\')"></div>' +
              '<div class="flex-grow"><p class="font-body-md font-bold text-on-surface">' + it.name + '</p>' +
              '<p class="font-label-caps text-label-caps text-on-surface-variant">Qty: ' + it.quantity + '</p></div>' +
              '<p class="font-body-md font-bold text-primary">' + money(it.price * it.quantity) + '</p>' +
              '</div>'
            );
          })
          .join('');
      }
    }
    var t = window.CC_API.Cart.totals(state.donation);
    setText('sum-subtotal', money(t.subtotal));
    setText('sum-shipping', money(t.shipping));
    setText('sum-tax', money(t.tax));
    var donationRow = document.getElementById('sum-donation-row');
    if (donationRow) donationRow.style.display = t.donation > 0 ? '' : 'none';
    setText('sum-donation', money(t.donation));
    setText('sum-total', money(t.total));
  }

  function setText(id, val) {
    var el = document.getElementById(id);
    if (el) el.textContent = val;
  }

  function bindPaymentToggle() {
    document.querySelectorAll('[data-pay]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.paymentMethod = btn.getAttribute('data-pay');
        document.querySelectorAll('[data-pay]').forEach(function (b) {
          b.classList.remove('border-primary', 'bg-primary/5', 'text-primary');
          b.classList.add('border-outline/20', 'text-on-surface-variant');
        });
        btn.classList.add('border-primary', 'bg-primary/5', 'text-primary');
        btn.classList.remove('border-outline/20', 'text-on-surface-variant');
      });
    });
  }

  function bindDonation() {
    var btn = document.getElementById('donation-toggle');
    if (!btn) return;
    btn.addEventListener('click', function () {
      state.donation = state.donation > 0 ? 0 : DONATION_AMOUNT;
      btn.innerHTML =
        '<span class="material-symbols-outlined">' +
        (state.donation > 0 ? 'check' : 'add') +
        '</span>';
      renderSummary();
    });
  }

  function collectForm() {
    return {
      fullName: val('co-name'),
      email: val('co-email'),
      address: val('co-address'),
      city: val('co-city'),
      region: val('co-region'),
      phone: val('co-phone'),
    };
  }

  function val(id) {
    var el = document.getElementById(id);
    return el ? el.value.trim() : '';
  }

  function validate(form) {
    if (!form.fullName) return 'Please enter your full name';
    if (!form.email || form.email.indexOf('@') === -1)
      return 'Please enter a valid email';
    if (!form.address) return 'Please enter your shipping address';
    if (!form.city) return 'Please enter your city';
    return null;
  }

  function bindPlaceOrder() {
    var btn = document.getElementById('place-order');
    if (!btn) return;
    btn.addEventListener('click', async function () {
      var items = window.CC_API.Cart.all();
      if (!items.length) {
        window.CC_UI.toast('Your cart is empty.', 'error');
        return;
      }
      var form = collectForm();
      var error = validate(form);
      if (error) {
        window.CC_UI.toast(error, 'error');
        return;
      }

      var payload = Object.assign({}, form, {
        paymentMethod: state.paymentMethod,
        donation: state.donation,
        items: items.map(function (i) {
          return { productId: i.productId, quantity: i.quantity };
        }),
      });

      var original = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML =
        '<span class="material-symbols-outlined animate-spin">progress_activity</span> Placing order…';
      try {
        var res = await window.CC_API.placeOrder(payload);
        sessionStorage.setItem('cc_last_order', JSON.stringify(res.data));
        window.CC_API.Cart.clear();
        window.location.href = 'confirmation.html';
      } catch (err) {
        window.CC_UI.toast(err.message, 'error');
        btn.disabled = false;
        btn.innerHTML = original;
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    // Pre-fill email/name if logged in.
    var user = window.CC_API.getUser();
    if (user) {
      var n = document.getElementById('co-name');
      var e = document.getElementById('co-email');
      if (n && !n.value) n.value = user.name;
      if (e && !e.value) e.value = user.email;
    }
    renderSummary();
    bindPaymentToggle();
    bindDonation();
    bindPlaceOrder();
  });
})();
