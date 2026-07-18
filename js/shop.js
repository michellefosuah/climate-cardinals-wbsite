/**
 * Shop page: loads products from the API, renders cards, category filter,
 * search, and add-to-cart (stores productId for real checkout).
 */
(function () {
  'use strict';

  var icon = window.CC_ICON || function () { return ''; };
  var state = { category: '', search: '', products: [] };
  var BADGE = { 'Best Seller': 'cc-badge--leaf', 'Organic Cotton': 'cc-badge--forest', 'Limited Edition': 'cc-badge--clay' };

  function card(p) {
    var badge = p.badge ? '<span class="cc-badge ' + (BADGE[p.badge] || 'cc-badge--forest') + '">' + p.badge + '</span>' : '';
    var pfb = 'images/merch/' + p.slug + '.svg';
    var img = p.imageUrl
      ? '<img src="' + p.imageUrl + '" alt="' + p.name + '" onerror="this.onerror=null;this.src=\'' + pfb + '\'"/>'
      : '';
    var out = p.stock <= 0;
    return (
      '<div class="cc-card cc-product cc-reveal">' +
      '<div class="cc-product__media">' + img + badge + '</div>' +
      '<div class="cc-product__body">' +
      '<div class="cc-product__row"><span class="cc-product__name">' + p.name + '</span>' +
      '<span class="cc-product__price">GHS ' + p.price + '</span></div>' +
      '<p class="cc-product__desc">' + p.description + '</p>' +
      '<button ' + (out ? 'disabled' : '') + ' data-add="' + p.id + '" class="cc-btn ' +
      (out ? 'cc-btn--ghost' : 'cc-btn--primary') + ' cc-btn--block">' +
      (out ? 'Sold out' : icon('cart', { size: 20 }) + ' Add to cart') + '</button>' +
      '</div></div>'
    );
  }

  function render() {
    var grid = document.getElementById('product-grid');
    if (!grid) return;
    if (!state.products.length) {
      grid.innerHTML = '<div class="cc-loading">No products found.</div>';
      return;
    }
    grid.innerHTML = state.products.map(card).join('');
    grid.querySelectorAll('.cc-reveal').forEach(function (n) { n.classList.add('is-in'); });
    grid.querySelectorAll('[data-add]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var p = state.products.find(function (x) { return x.id === btn.getAttribute('data-add'); });
        if (!p) return;
        window.CC_API.Cart.add({ productId: p.id, name: p.name, price: Number(p.price), imageUrl: p.imageUrl });
        window.CC_UI.updateCartBadge();
        feedback(btn);
      });
    });
  }

  function feedback(btn) {
    var html = btn.innerHTML;
    btn.innerHTML = window.CC_ICON('check', { size: 20 }) + ' Added!';
    btn.classList.add('cc-btn--accent'); btn.classList.remove('cc-btn--primary');
    setTimeout(function () {
      btn.innerHTML = html;
      btn.classList.add('cc-btn--primary'); btn.classList.remove('cc-btn--accent');
    }, 1500);
  }

  async function load() {
    var grid = document.getElementById('product-grid');
    if (grid) grid.innerHTML = '<div class="cc-loading">Loading products…</div>';
    try {
      var q = {};
      if (state.category) q.category = state.category;
      if (state.search) q.search = state.search;
      var res = await window.CC_API.listProducts(q);
      state.products = res.data || [];
      render();
    } catch (err) {
      if (grid) grid.innerHTML = '<div class="cc-loading" style="color:var(--danger)">' + err.message + '</div>';
    }
  }

  function bindFilters() {
    document.querySelectorAll('[data-category]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('[data-category]').forEach(function (b) { b.classList.remove('is-active'); });
        btn.classList.add('is-active');
        state.category = btn.getAttribute('data-category');
        load();
      });
    });
    var search = document.getElementById('shop-search');
    if (search) {
      var t;
      search.addEventListener('input', function () {
        clearTimeout(t);
        t = setTimeout(function () { state.search = search.value.trim(); load(); }, 300);
      });
    }
  }

  document.addEventListener('DOMContentLoaded', function () { bindFilters(); load(); });
})();
