/**
 * Shop page: loads products from the API, renders cards, handles category
 * filtering, search, and add-to-cart (storing productId for real checkout).
 */
(function () {
  'use strict';

  var state = { category: '', search: '', products: [] };

  var badgeColors = {
    'Best Seller': 'bg-secondary text-on-secondary',
    'Organic Cotton': 'bg-primary text-on-primary',
    'Limited Edition': 'bg-tertiary text-on-tertiary',
  };

  function money(n) {
    return 'GHS ' + Number(n);
  }

  function cardTemplate(p) {
    var badge = p.badge
      ? '<div class="absolute top-4 left-4 ' +
        (badgeColors[p.badge] || 'bg-primary text-on-primary') +
        ' text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider">' +
        p.badge +
        '</div>'
      : '';
    var img = p.imageUrl
      ? '<img class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="' +
        p.imageUrl +
        '" alt="' + p.name + '"/>'
      : '<div class="w-full h-full flex items-center justify-center text-on-surface-variant"><span class="material-symbols-outlined text-5xl">eco</span></div>';
    var out = p.stock <= 0;
    return (
      '<div class="group relative flex flex-col h-full">' +
      '<div class="relative aspect-square rounded-[24px] overflow-hidden bg-surface-container-low mb-md border border-outline/10">' +
      img + badge +
      '</div>' +
      '<div class="flex-grow">' +
      '<div class="flex justify-between items-start mb-1">' +
      '<h3 class="font-headline-md text-body-lg font-bold text-on-surface">' + p.name + '</h3>' +
      '<span class="font-bold text-primary">' + money(p.price) + '</span>' +
      '</div>' +
      '<p class="text-on-surface-variant text-sm mb-md line-clamp-2">' + p.description + '</p>' +
      '</div>' +
      '<button ' + (out ? 'disabled' : '') +
      ' data-add="' + p.id + '" class="w-full ' +
      (out ? 'bg-outline/40 cursor-not-allowed' : 'bg-primary hover:bg-primary-container') +
      ' text-on-primary py-3 rounded-full font-bold transition-colors flex items-center justify-center gap-2">' +
      '<span class="material-symbols-outlined text-sm">' + (out ? 'block' : 'add_shopping_cart') + '</span> ' +
      (out ? 'Sold Out' : 'Add to Cart') +
      '</button>' +
      '</div>'
    );
  }

  function render() {
    var grid = document.getElementById('product-grid');
    if (!grid) return;
    if (!state.products.length) {
      grid.innerHTML =
        '<p class="col-span-full text-center text-on-surface-variant py-12">No products found.</p>';
      return;
    }
    grid.innerHTML = state.products.map(cardTemplate).join('');
    grid.querySelectorAll('[data-add]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var p = state.products.find(function (x) {
          return x.id === btn.getAttribute('data-add');
        });
        if (!p) return;
        window.CC_API.Cart.add({
          productId: p.id,
          name: p.name,
          price: Number(p.price),
          imageUrl: p.imageUrl,
        });
        window.CC_UI.updateCartBadge();
        feedback(btn);
      });
    });
  }

  function feedback(btn) {
    var html = btn.innerHTML;
    btn.innerHTML =
      '<span class="material-symbols-outlined text-sm">check</span> Added to Cart';
    btn.style.backgroundColor = '#acf847';
    btn.style.color = '#102000';
    setTimeout(function () {
      btn.innerHTML = html;
      btn.style.backgroundColor = '';
      btn.style.color = '';
    }, 1600);
  }

  async function load() {
    var grid = document.getElementById('product-grid');
    if (grid)
      grid.innerHTML =
        '<p class="col-span-full text-center text-on-surface-variant py-12">Loading products…</p>';
    try {
      var query = {};
      if (state.category) query.category = state.category;
      if (state.search) query.search = state.search;
      var res = await window.CC_API.listProducts(query);
      state.products = res.data || [];
      render();
    } catch (err) {
      if (grid)
        grid.innerHTML =
          '<p class="col-span-full text-center text-error py-12">' +
          err.message +
          '</p>';
    }
  }

  function bindFilters() {
    document.querySelectorAll('[data-category]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('[data-category]').forEach(function (b) {
          b.classList.remove('bg-primary', 'text-on-primary');
          b.classList.add('bg-surface-container', 'text-on-surface-variant');
        });
        btn.classList.add('bg-primary', 'text-on-primary');
        btn.classList.remove('bg-surface-container', 'text-on-surface-variant');
        state.category = btn.getAttribute('data-category');
        load();
      });
    });
    var search = document.getElementById('shop-search');
    if (search) {
      var t;
      search.addEventListener('input', function () {
        clearTimeout(t);
        t = setTimeout(function () {
          state.search = search.value.trim();
          load();
        }, 300);
      });
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    bindFilters();
    load();
  });
})();
