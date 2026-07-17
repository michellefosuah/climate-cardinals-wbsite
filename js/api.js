/**
 * Lightweight API client for the Climate Cardinals backend.
 * Exposes window.CC_API with typed helpers, plus a localStorage-backed cart
 * that stores productId (so guest checkout can post real line items).
 */
(function () {
  'use strict';

  var BASE = window.CC_CONFIG.apiBase;
  var TOKEN_KEY = 'cc_token';
  var USER_KEY = 'cc_user';
  var CART_KEY = 'cart';

  // ---- auth token storage --------------------------------------------------
  function getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }
  function setSession(token, user) {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
  function getUser() {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY));
    } catch (e) {
      return null;
    }
  }
  function clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  // ---- core fetch wrapper --------------------------------------------------
  async function request(path, options) {
    options = options || {};
    var headers = Object.assign(
      { 'Content-Type': 'application/json' },
      options.headers || {}
    );
    var token = getToken();
    if (token) headers['Authorization'] = 'Bearer ' + token;

    var res;
    try {
      res = await fetch(BASE + path, {
        method: options.method || 'GET',
        headers: headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
      });
    } catch (networkErr) {
      throw new Error(
        'Could not reach the server. Is the API running at ' + BASE + '?'
      );
    }

    var data = null;
    var text = await res.text();
    if (text) {
      try {
        data = JSON.parse(text);
      } catch (e) {
        data = null;
      }
    }

    if (!res.ok) {
      var msg =
        (data && data.error && data.error.message) ||
        'Request failed (' + res.status + ')';
      var err = new Error(msg);
      err.status = res.status;
      err.details = data && data.error && data.error.details;
      throw err;
    }
    return data;
  }

  // ---- localStorage cart (productId-aware) ---------------------------------
  var Cart = {
    all: function () {
      try {
        return JSON.parse(localStorage.getItem(CART_KEY)) || [];
      } catch (e) {
        return [];
      }
    },
    save: function (items) {
      localStorage.setItem(CART_KEY, JSON.stringify(items));
    },
    count: function () {
      return Cart.all().reduce(function (n, i) {
        return n + i.quantity;
      }, 0);
    },
    add: function (product, qty) {
      qty = qty || 1;
      var items = Cart.all();
      var existing = items.find(function (i) {
        return i.productId === product.productId;
      });
      if (existing) {
        existing.quantity += qty;
      } else {
        items.push({
          productId: product.productId,
          name: product.name,
          price: product.price,
          imageUrl: product.imageUrl || null,
          quantity: qty,
        });
      }
      Cart.save(items);
      return items;
    },
    setQuantity: function (productId, qty) {
      var items = Cart.all();
      var idx = items.findIndex(function (i) {
        return i.productId === productId;
      });
      if (idx === -1) return items;
      if (qty <= 0) items.splice(idx, 1);
      else items[idx].quantity = qty;
      Cart.save(items);
      return items;
    },
    remove: function (productId) {
      Cart.save(
        Cart.all().filter(function (i) {
          return i.productId !== productId;
        })
      );
      return Cart.all();
    },
    clear: function () {
      Cart.save([]);
    },
    // Totals mirror the backend rules: shipping GHS 25 if items, tax 5%.
    totals: function (donation) {
      var items = Cart.all();
      var subtotal = items.reduce(function (s, i) {
        return s + i.price * i.quantity;
      }, 0);
      var shipping = items.length > 0 ? 25 : 0;
      var tax = Math.round(subtotal * 0.05);
      var d = Number(donation) || 0;
      return {
        subtotal: subtotal,
        shipping: shipping,
        tax: tax,
        donation: d,
        total: subtotal + shipping + tax + d,
      };
    },
  };

  // ---- public API ----------------------------------------------------------
  window.CC_API = {
    base: BASE,
    getToken: getToken,
    getUser: getUser,
    isLoggedIn: function () {
      return !!getToken();
    },
    logout: function () {
      clearSession();
    },
    Cart: Cart,

    // auth
    register: async function (payload) {
      var d = await request('/auth/register', { method: 'POST', body: payload });
      setSession(d.token, d.user);
      return d;
    },
    login: async function (payload) {
      var d = await request('/auth/login', { method: 'POST', body: payload });
      setSession(d.token, d.user);
      return d;
    },
    me: function () {
      return request('/auth/me');
    },

    // products
    listProducts: function (query) {
      var qs = query ? '?' + new URLSearchParams(query).toString() : '';
      return request('/products' + qs);
    },
    getProduct: function (idOrSlug) {
      return request('/products/' + encodeURIComponent(idOrSlug));
    },

    // orders / checkout
    placeOrder: function (payload) {
      return request('/orders', { method: 'POST', body: payload });
    },
    myOrders: function () {
      return request('/orders');
    },

    // events
    listEvents: function (query) {
      var qs = query ? '?' + new URLSearchParams(query).toString() : '';
      return request('/events' + qs);
    },
    registerForEvent: function (idOrSlug, payload) {
      return request('/events/' + encodeURIComponent(idOrSlug) + '/register', {
        method: 'POST',
        body: payload,
      });
    },

    // engagement
    subscribeNewsletter: function (email) {
      return request('/newsletter/subscribe', {
        method: 'POST',
        body: { email: email },
      });
    },
    sendContact: function (payload) {
      return request('/contact', { method: 'POST', body: payload });
    },
    donate: function (payload) {
      return request('/donations', { method: 'POST', body: payload });
    },
    volunteer: function (payload) {
      return request('/volunteers', { method: 'POST', body: payload });
    },

    // content
    listTeam: function (tier) {
      return request('/team' + (tier ? '?tier=' + tier : ''));
    },
    listImpact: function () {
      return request('/impact');
    },
  };
})();
