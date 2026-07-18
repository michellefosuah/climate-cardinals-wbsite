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
      var e = new Error(
        'We could not reach the Climate Cardinals server. Browsing works in demo mode, but this action needs the live API to be running.'
      );
      e.isNetwork = true;
      throw e;
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

    // Demo mode flag — set true the first time we fall back to bundled data.
    demoMode: false,

    // products
    listProducts: async function (query) {
      try {
        var qs = query ? '?' + new URLSearchParams(query).toString() : '';
        return await request('/products' + qs);
      } catch (e) {
        if (!e.isNetwork) throw e;
        var items = fallback('products').slice();
        if (query && query.category) items = items.filter(function (p) { return p.category === query.category; });
        if (query && query.search) {
          var s = String(query.search).toLowerCase();
          items = items.filter(function (p) {
            return p.name.toLowerCase().indexOf(s) !== -1 || p.description.toLowerCase().indexOf(s) !== -1;
          });
        }
        if (query && query.limit) items = items.slice(0, query.limit);
        return { data: items, demo: true };
      }
    },
    getProduct: async function (idOrSlug) {
      try {
        return await request('/products/' + encodeURIComponent(idOrSlug));
      } catch (e) {
        if (!e.isNetwork) throw e;
        var found = fallback('products').find(function (p) { return p.id === idOrSlug || p.slug === idOrSlug; });
        if (!found) throw e;
        return { data: found, demo: true };
      }
    },

    // orders / checkout
    placeOrder: function (payload) {
      return request('/orders', { method: 'POST', body: payload });
    },
    myOrders: function () {
      return request('/orders');
    },

    // events
    listEvents: async function (query) {
      try {
        var qs = query ? '?' + new URLSearchParams(query).toString() : '';
        return await request('/events' + qs);
      } catch (e) {
        if (!e.isNetwork) throw e;
        var items = fallback('events').slice();
        if (query && query.category) items = items.filter(function (x) { return x.category === query.category; });
        return { data: items, demo: true };
      }
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
    listTeam: async function (tier) {
      try {
        return await request('/team' + (tier ? '?tier=' + tier : ''));
      } catch (e) {
        if (!e.isNetwork) throw e;
        var items = fallback('team').slice();
        if (tier) items = items.filter(function (m) { return m.tier === tier; });
        return { data: items, demo: true };
      }
    },
    listImpact: async function () {
      try {
        return await request('/impact');
      } catch (e) {
        if (!e.isNetwork) throw e;
        return { data: fallback('impact').slice(), demo: true };
      }
    },

    // ---- Admin CRUD (require an ADMIN token; never fall back to demo) ----
    Admin: {
      // Products
      listProducts: function () { return request('/products?includeInactive=true&limit=100'); },
      createProduct: function (body) { return request('/products', { method: 'POST', body: body }); },
      updateProduct: function (id, body) { return request('/products/' + encodeURIComponent(id), { method: 'PATCH', body: body }); },
      deleteProduct: function (id) { return request('/products/' + encodeURIComponent(id), { method: 'DELETE' }); },
      // Events
      listEvents: function () { return request('/events?limit=100'); },
      createEvent: function (body) { return request('/events', { method: 'POST', body: body }); },
      updateEvent: function (id, body) { return request('/events/' + encodeURIComponent(id), { method: 'PATCH', body: body }); },
      deleteEvent: function (id) { return request('/events/' + encodeURIComponent(id), { method: 'DELETE' }); },
      // Team
      listTeam: function () { return request('/team?includeInactive=true'); },
      createTeam: function (body) { return request('/team', { method: 'POST', body: body }); },
      updateTeam: function (id, body) { return request('/team/' + encodeURIComponent(id), { method: 'PATCH', body: body }); },
      deleteTeam: function (id) { return request('/team/' + encodeURIComponent(id), { method: 'DELETE' }); },
      // Impact
      listImpact: function () { return request('/impact'); },
      createImpact: function (body) { return request('/impact', { method: 'POST', body: body }); },
      updateImpact: function (id, body) { return request('/impact/' + encodeURIComponent(id), { method: 'PATCH', body: body }); },
      deleteImpact: function (id) { return request('/impact/' + encodeURIComponent(id), { method: 'DELETE' }); },
    },
  };

  // Return bundled fallback content and flag demo mode (used when the API is
  // unreachable so the site still renders for browsing).
  function fallback(kind) {
    if (!window.CC_API.demoMode) {
      window.CC_API.demoMode = true;
      try { window.dispatchEvent(new Event('cc:demo')); } catch (e) {}
    }
    return (window.CC_FALLBACK && window.CC_FALLBACK[kind]) || [];
  }
})();
