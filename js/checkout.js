/**
 * Checkout: renders summary from cart, Card/Momo toggle, donation upsell,
 * posts a real order to the API, then redirects to the confirmation page.
 */
(function () {
  'use strict';

  var icon = window.CC_ICON || function () { return ''; };
  var state = { paymentMethod: 'CARD', donation: 0 };
  var DONATION = 10;

  function money(n) { return 'GHS ' + Number(n).toFixed(2); }

  function renderSummary() {
    var items = window.CC_API.Cart.all();
    var list = document.getElementById('summary-items');
    if (list) {
      if (!items.length) {
        list.innerHTML = '<p class="cc-muted">Your cart is empty. <a href="shop.html" style="color:var(--primary);font-weight:700">Add merch →</a></p>';
      } else {
        list.innerHTML = items.map(function (it) {
          var img = it.imageUrl ? 'background-image:url(\'' + it.imageUrl + '\')' : 'background:var(--paper-2)';
          return (
            '<div style="display:flex;gap:12px;align-items:center">' +
            '<div style="width:60px;height:60px;border-radius:10px;background-size:cover;background-position:center;flex-shrink:0;' + img + '"></div>' +
            '<div style="flex:1"><b style="color:var(--forest-800);font-size:.95rem">' + it.name + '</b>' +
            '<div class="cc-muted" style="font-size:.8rem">Qty: ' + it.quantity + '</div></div>' +
            '<b class="cc-product__price">' + money(it.price * it.quantity) + '</b></div>'
          );
        }).join('');
      }
    }
    var t = window.CC_API.Cart.totals(state.donation);
    set('sum-subtotal', money(t.subtotal)); set('sum-shipping', money(t.shipping)); set('sum-tax', money(t.tax));
    var row = document.getElementById('sum-donation-row');
    if (row) row.style.display = t.donation > 0 ? 'flex' : 'none';
    set('sum-donation', money(t.donation)); set('sum-total', money(t.total));
  }
  function set(id, v) { var e = document.getElementById(id); if (e) e.textContent = v; }

  function bindPaymentToggle() {
    document.querySelectorAll('[data-pay]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.paymentMethod = btn.getAttribute('data-pay');
        document.querySelectorAll('[data-pay]').forEach(function (b) {
          b.classList.remove('cc-btn--primary'); b.classList.add('cc-btn--ghost');
        });
        btn.classList.add('cc-btn--primary'); btn.classList.remove('cc-btn--ghost');
      });
    });
  }

  function bindDonation() {
    var btn = document.getElementById('donation-toggle');
    if (!btn) return;
    btn.addEventListener('click', function () {
      state.donation = state.donation > 0 ? 0 : DONATION;
      btn.innerHTML = icon(state.donation > 0 ? 'check' : 'plus');
      renderSummary();
    });
  }

  function val(id) { var e = document.getElementById(id); return e ? e.value.trim() : ''; }
  function collect() {
    return { fullName: val('co-name'), email: val('co-email'), address: val('co-address'),
      city: val('co-city'), region: val('co-region'), phone: val('co-phone') };
  }
  function validate(f) {
    if (!f.fullName) return 'Please enter your full name';
    if (!f.email || f.email.indexOf('@') === -1) return 'Please enter a valid email';
    if (!f.address) return 'Please enter your shipping address';
    if (!f.city) return 'Please enter your city';
    return null;
  }

  function bindPlaceOrder() {
    var btn = document.getElementById('place-order');
    if (!btn) return;
    btn.addEventListener('click', async function () {
      var items = window.CC_API.Cart.all();
      if (!items.length) { window.CC_UI.toast('Your cart is empty.', 'error'); return; }
      var form = collect();
      var err = validate(form);
      if (err) { window.CC_UI.toast(err, 'error'); return; }

      var payload = Object.assign({}, form, {
        paymentMethod: state.paymentMethod, donation: state.donation,
        items: items.map(function (i) { return { productId: i.productId, quantity: i.quantity }; }),
      });
      var original = btn.innerHTML;
      btn.disabled = true; btn.textContent = 'Placing order…';
      try {
        var res = await window.CC_API.placeOrder(payload);
        sessionStorage.setItem('cc_last_order', JSON.stringify(res.data));
        window.CC_API.Cart.clear();
        window.location.href = 'confirmation.html';
      } catch (e) {
        window.CC_UI.toast(e.message, 'error');
        btn.disabled = false; btn.innerHTML = original;
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    var user = window.CC_API.getUser();
    if (user) {
      var n = document.getElementById('co-name'), e = document.getElementById('co-email');
      if (n && !n.value) n.value = user.name;
      if (e && !e.value) e.value = user.email;
    }
    renderSummary(); bindPaymentToggle(); bindDonation(); bindPlaceOrder();
  });
})();
