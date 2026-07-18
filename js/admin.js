/**
 * Climate Cardinals — Admin dashboard.
 * Password-protected (ADMIN role) CRUD for products, events, team and impact,
 * driven by the live API. Self-contained: reuses CC_API + the site theme.
 */
(function () {
  'use strict';

  var API = window.CC_API;
  var app = document.getElementById('admin-app');
  function toast(m, t) { if (window.CC_UI) window.CC_UI.toast(m, t); else if (t === 'error') alert(m); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  // ---- Entity configuration ------------------------------------------------
  var A = API.Admin;
  var ENTITIES = {
    products: {
      label: 'Products', singular: 'Product',
      list: A.listProducts, create: A.createProduct, update: A.updateProduct, del: A.deleteProduct,
      title: function (x) { return x.name; },
      columns: [
        { k: 'name', label: 'Name' },
        { k: 'category', label: 'Category' },
        { k: 'price', label: 'Price', fmt: function (v) { return 'GHS ' + v; } },
        { k: 'stock', label: 'Stock' },
        { k: 'isActive', label: 'Active', fmt: yesno },
      ],
      fields: [
        { k: 'name', label: 'Name', type: 'text', required: true },
        { k: 'category', label: 'Category', type: 'select', options: ['APPAREL', 'STICKERS', 'ACCESSORIES', 'DRINKWARE', 'OTHER'], def: 'OTHER' },
        { k: 'price', label: 'Price (GHS)', type: 'number', required: true },
        { k: 'stock', label: 'Stock', type: 'number', def: 0 },
        { k: 'description', label: 'Description', type: 'textarea', required: true },
        { k: 'imageUrl', label: 'Image URL (optional)', type: 'url', hint: 'Paste a full https:// image link, or leave blank.' },
        { k: 'badge', label: 'Badge (optional)', type: 'text', hint: 'e.g. Best Seller, Limited Edition' },
        { k: 'isActive', label: 'Active (visible in shop)', type: 'checkbox', def: true },
      ],
    },
    events: {
      label: 'Events', singular: 'Event',
      list: A.listEvents, create: A.createEvent, update: A.updateEvent, del: A.deleteEvent,
      title: function (x) { return x.title; },
      columns: [
        { k: 'title', label: 'Title' },
        { k: 'category', label: 'Category' },
        { k: 'startTime', label: 'Starts', fmt: fmtDate },
        { k: 'location', label: 'Location' },
        { k: 'isPublished', label: 'Published', fmt: yesno },
      ],
      fields: [
        { k: 'title', label: 'Title', type: 'text', required: true },
        { k: 'category', label: 'Category', type: 'select', options: ['WORKSHOP', 'SEMINAR', 'MEETING', 'NATURE_WALK', 'OTHER'], def: 'OTHER' },
        { k: 'location', label: 'Location', type: 'text', required: true },
        { k: 'startTime', label: 'Start time', type: 'datetime', required: true },
        { k: 'endTime', label: 'End time (optional)', type: 'datetime' },
        { k: 'capacity', label: 'Capacity (optional)', type: 'number' },
        { k: 'description', label: 'Description', type: 'textarea', required: true },
        { k: 'imageUrl', label: 'Image URL (optional)', type: 'url' },
        { k: 'isPublished', label: 'Published (visible on site)', type: 'checkbox', def: true },
      ],
    },
    team: {
      label: 'Team', singular: 'Member',
      list: A.listTeam, create: A.createTeam, update: A.updateTeam, del: A.deleteTeam,
      title: function (x) { return x.name; },
      columns: [
        { k: 'name', label: 'Name' },
        { k: 'role', label: 'Role' },
        { k: 'tier', label: 'Tier' },
        { k: 'sortOrder', label: 'Order' },
        { k: 'isActive', label: 'Active', fmt: yesno },
      ],
      fields: [
        { k: 'name', label: 'Name', type: 'text', required: true },
        { k: 'role', label: 'Role', type: 'text', required: true },
        { k: 'tier', label: 'Tier', type: 'select', options: ['LEADERSHIP', 'FELLOW'], def: 'FELLOW' },
        { k: 'bio', label: 'Bio (optional)', type: 'textarea' },
        { k: 'imageUrl', label: 'Photo URL (optional)', type: 'url' },
        { k: 'sortOrder', label: 'Sort order (optional)', type: 'number', hint: 'Lower numbers show first.' },
        { k: 'isActive', label: 'Active (visible)', type: 'checkbox', def: true },
      ],
    },
    impact: {
      label: 'Impact', singular: 'Stat',
      list: A.listImpact, create: A.createImpact, update: A.updateImpact, del: A.deleteImpact,
      title: function (x) { return x.label; },
      columns: [
        { k: 'value', label: 'Value' },
        { k: 'label', label: 'Label' },
        { k: 'sortOrder', label: 'Order' },
        { k: 'isActive', label: 'Active', fmt: yesno },
      ],
      fields: [
        { k: 'value', label: 'Value', type: 'text', required: true, hint: 'e.g. 500+, 1,200, 25+' },
        { k: 'label', label: 'Label', type: 'text', required: true, hint: 'e.g. Trees planted' },
        { k: 'description', label: 'Description (optional)', type: 'textarea' },
        { k: 'icon', label: 'Icon key (optional)', type: 'text' },
        { k: 'sortOrder', label: 'Sort order (optional)', type: 'number' },
        { k: 'isActive', label: 'Active (visible)', type: 'checkbox', def: true },
      ],
    },
  };
  var ORDER = ['products', 'events', 'team', 'impact'];

  function yesno(v) { return v ? '✓' : '—'; }
  function fmtDate(v) { try { return new Date(v).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }); } catch (e) { return v; } }
  function toLocalInput(iso) { var d = new Date(iso); var local = new Date(d.getTime() - d.getTimezoneOffset() * 60000); return local.toISOString().slice(0, 16); }

  // ---- Styles --------------------------------------------------------------
  var css = document.createElement('style');
  css.textContent = [
    '.ad-top{display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;margin-bottom:26px}',
    '.ad-brand{display:flex;align-items:center;gap:12px;font-family:var(--font-head);font-weight:700;font-size:1.2rem;color:var(--ink)}',
    '.ad-brand img{width:40px;height:40px}',
    '.ad-tabs{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:22px}',
    '.ad-tab{padding:10px 18px;border-radius:var(--r-full);font-family:var(--font-head);font-weight:600;border:1.5px solid var(--glass-border);background:var(--glass);color:var(--ink);cursor:pointer}',
    '.ad-tab.is-active{background:var(--royal);color:#fff;border-color:var(--royal)}',
    '.ad-head{display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap;margin-bottom:16px}',
    '.ad-table-wrap{overflow-x:auto;border:1.5px solid var(--glass-border);border-radius:var(--r-lg);background:var(--glass-strong);backdrop-filter:var(--glass-blur)}',
    '.ad-table{width:100%;border-collapse:collapse;min-width:640px}',
    '.ad-table th,.ad-table td{text-align:left;padding:13px 16px;border-bottom:1px solid var(--line);font-size:.94rem;vertical-align:middle}',
    '.ad-table th{font-family:var(--font-head);font-size:.72rem;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}',
    '.ad-table tr:last-child td{border-bottom:none}',
    '.ad-actions{display:flex;gap:8px;white-space:nowrap}',
    '.ad-mini{padding:7px 13px;font-size:.85rem;border-radius:var(--r-full);font-family:var(--font-head);font-weight:600;border:1.5px solid var(--glass-border);background:#fff;cursor:pointer}',
    '.ad-mini--del{color:#c8352b}',
    '.ad-mini:hover{border-color:var(--ink)}',
    '.ad-overlay{position:fixed;inset:0;background:rgba(7,26,43,.5);backdrop-filter:blur(4px);display:grid;place-items:center;padding:20px;z-index:100}',
    '.ad-modal{background:var(--paper);border-radius:var(--r-xl);border:1.5px solid var(--glass-border);box-shadow:var(--shadow-lg);width:100%;max-width:560px;max-height:90vh;overflow:auto;padding:clamp(22px,4vw,34px)}',
    '.ad-field{margin-bottom:15px}',
    '.ad-field label{display:block;font-family:var(--font-head);font-weight:600;font-size:.85rem;margin-bottom:6px;color:var(--ink)}',
    '.ad-field .hint{font-size:.78rem;color:var(--muted);margin-top:5px}',
    '.ad-row-check{display:flex;align-items:center;gap:10px}',
    '.ad-row-check input{width:18px;height:18px}',
    '.ad-empty{padding:40px;text-align:center;color:var(--muted)}',
    '.ad-login{max-width:420px;margin:6vh auto 0}',
  ].join('');
  document.head.appendChild(css);

  // ---- Boot / auth gate ----------------------------------------------------
  function boot() {
    if (!API.isLoggedIn || !API.isLoggedIn()) return renderLogin();
    API.me().then(function (res) {
      var u = (res && (res.user || res.data)) || null;
      if (u && u.role === 'ADMIN') renderDashboard(u);
      else renderLogin('This account is not an administrator.');
    }).catch(function () { renderLogin(); });
  }

  function renderLogin(msg) {
    app.innerHTML =
      '<div class="ad-login">' +
      '<div class="cc-card" style="padding:clamp(24px,4vw,36px)">' +
      '<h1 class="cc-h2" style="margin-bottom:6px">Admin sign in</h1>' +
      '<p class="cc-muted" style="margin-bottom:20px">Manage the catalogue, events, team and impact.</p>' +
      (msg ? '<p style="color:#c8352b;margin-bottom:14px;font-weight:600">' + esc(msg) + '</p>' : '') +
      '<form id="ad-login-form">' +
      '<div class="ad-field"><label>Email</label><input class="cc-input" type="email" name="email" required autocomplete="username"/></div>' +
      '<div class="ad-field"><label>Password</label><input class="cc-input" type="password" name="password" required autocomplete="current-password"/></div>' +
      '<button class="cc-btn cc-btn--primary cc-btn--block cc-btn--lg" type="submit">Sign in</button>' +
      '</form>' +
      '<p style="margin-top:16px"><a href="index.html" style="color:var(--muted)">← Back to site</a></p>' +
      '</div></div>';
    document.getElementById('ad-login-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = e.target.querySelector('button[type=submit]'); btn.disabled = true; btn.textContent = 'Signing in…';
      var f = e.target;
      API.login({ email: f.email.value.trim(), password: f.password.value }).then(function (d) {
        if (d.user && d.user.role === 'ADMIN') renderDashboard(d.user);
        else { API.logout(); renderLogin('This account is not an administrator.'); }
      }).catch(function (err) {
        btn.disabled = false; btn.textContent = 'Sign in';
        toast(err.message || 'Sign in failed', 'error');
      });
    });
  }

  var state = { tab: 'products', user: null };

  function renderDashboard(user) {
    state.user = user;
    app.innerHTML =
      '<div class="ad-top">' +
      '<div class="ad-brand"><img src="images/logo-mark.png" alt=""/> Admin Dashboard</div>' +
      '<div style="display:flex;align-items:center;gap:12px">' +
      '<span class="cc-muted" style="font-size:.9rem">' + esc(user.name || user.email) + '</span>' +
      '<a href="index.html" class="ad-mini">View site</a>' +
      '<button class="ad-mini" id="ad-logout">Log out</button>' +
      '</div></div>' +
      '<div class="ad-tabs">' + ORDER.map(function (k) {
        return '<button class="ad-tab" data-tab="' + k + '">' + ENTITIES[k].label + '</button>';
      }).join('') + '</div>' +
      '<div id="ad-panel"></div>';
    document.getElementById('ad-logout').addEventListener('click', function () {
      API.logout(); toast('Logged out'); renderLogin();
    });
    app.querySelectorAll('.ad-tab').forEach(function (b) {
      b.addEventListener('click', function () { state.tab = b.getAttribute('data-tab'); renderTab(); });
    });
    renderTab();
  }

  function renderTab() {
    app.querySelectorAll('.ad-tab').forEach(function (b) {
      b.classList.toggle('is-active', b.getAttribute('data-tab') === state.tab);
    });
    var cfg = ENTITIES[state.tab];
    var panel = document.getElementById('ad-panel');
    panel.innerHTML =
      '<div class="ad-head"><h2 class="cc-h3">' + cfg.label + '</h2>' +
      '<button class="cc-btn cc-btn--accent" id="ad-add">+ Add ' + cfg.singular + '</button></div>' +
      '<div id="ad-list"><div class="cc-loading">Loading…</div></div>';
    document.getElementById('ad-add').addEventListener('click', function () { openForm(cfg, null); });
    cfg.list().then(function (res) {
      renderList(cfg, (res && res.data) || []);
    }).catch(function (err) {
      document.getElementById('ad-list').innerHTML = '<div class="ad-empty">Could not load. ' + esc(err.message || '') + '</div>';
    });
  }

  function renderList(cfg, items) {
    var box = document.getElementById('ad-list');
    if (!items.length) { box.innerHTML = '<div class="ad-table-wrap"><div class="ad-empty">No ' + cfg.label.toLowerCase() + ' yet. Click “Add ' + cfg.singular + '”.</div></div>'; return; }
    var head = cfg.columns.map(function (c) { return '<th>' + c.label + '</th>'; }).join('') + '<th></th>';
    var rows = items.map(function (x, i) {
      var tds = cfg.columns.map(function (c) {
        var v = x[c.k]; return '<td>' + esc(c.fmt ? c.fmt(v) : (v == null ? '—' : v)) + '</td>';
      }).join('');
      return '<tr>' + tds + '<td><div class="ad-actions">' +
        '<button class="ad-mini" data-edit="' + i + '">Edit</button>' +
        '<button class="ad-mini ad-mini--del" data-del="' + i + '">Delete</button>' +
        '</div></td></tr>';
    }).join('');
    box.innerHTML = '<div class="ad-table-wrap"><table class="ad-table"><thead><tr>' + head + '</tr></thead><tbody>' + rows + '</tbody></table></div>';
    box.querySelectorAll('[data-edit]').forEach(function (b) {
      b.addEventListener('click', function () { openForm(cfg, items[+b.getAttribute('data-edit')]); });
    });
    box.querySelectorAll('[data-del]').forEach(function (b) {
      b.addEventListener('click', function () {
        var item = items[+b.getAttribute('data-del')];
        if (!confirm('Delete “' + cfg.title(item) + '”? This cannot be undone.')) return;
        cfg.del(item.id).then(function () { toast('Deleted'); renderTab(); })
          .catch(function (err) { toast(err.message || 'Delete failed', 'error'); });
      });
    });
  }

  // ---- Create / edit form --------------------------------------------------
  function openForm(cfg, item) {
    var editing = !!item;
    var fieldsHtml = cfg.fields.map(function (f) {
      var val = item ? item[f.k] : (f.def !== undefined ? f.def : '');
      var id = 'f_' + f.k;
      var input;
      if (f.type === 'textarea') {
        input = '<textarea class="cc-textarea" id="' + id + '" rows="3"' + (f.required ? ' required' : '') + '>' + esc(val) + '</textarea>';
      } else if (f.type === 'select') {
        input = '<select class="cc-select" id="' + id + '">' + f.options.map(function (o) {
          return '<option value="' + o + '"' + (String(val) === o ? ' selected' : '') + '>' + o + '</option>';
        }).join('') + '</select>';
      } else if (f.type === 'checkbox') {
        return '<div class="ad-field"><div class="ad-row-check"><input type="checkbox" id="' + id + '"' + (val ? ' checked' : '') + '/><label for="' + id + '" style="margin:0">' + f.label + '</label></div></div>';
      } else if (f.type === 'datetime') {
        var dv = val ? toLocalInput(val) : '';
        input = '<input class="cc-input" type="datetime-local" id="' + id + '" value="' + dv + '"' + (f.required ? ' required' : '') + '/>';
      } else {
        var t = f.type === 'number' ? 'number' : (f.type === 'url' ? 'url' : 'text');
        input = '<input class="cc-input" type="' + t + '" id="' + id + '" value="' + esc(val) + '"' + (f.required ? ' required' : '') + (f.type === 'number' ? ' step="any"' : '') + '/>';
      }
      return '<div class="ad-field"><label for="' + id + '">' + f.label + (f.required ? ' *' : '') + '</label>' + input +
        (f.hint ? '<div class="hint">' + f.hint + '</div>' : '') + '</div>';
    }).join('');

    var overlay = document.createElement('div');
    overlay.className = 'ad-overlay';
    overlay.innerHTML =
      '<div class="ad-modal"><h2 class="cc-h3" style="margin-bottom:18px">' + (editing ? 'Edit ' : 'Add ') + cfg.singular + '</h2>' +
      '<form id="ad-form">' + fieldsHtml +
      '<div style="display:flex;gap:10px;margin-top:8px">' +
      '<button type="submit" class="cc-btn cc-btn--primary" style="flex:1">' + (editing ? 'Save changes' : 'Create') + '</button>' +
      '<button type="button" class="cc-btn cc-btn--light" id="ad-cancel">Cancel</button>' +
      '</div></form></div>';
    document.body.appendChild(overlay);
    function close() { overlay.remove(); }
    overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
    document.getElementById('ad-cancel').addEventListener('click', close);
    document.addEventListener('keydown', function esc2(e) { if (e.key === 'Escape') { close(); document.removeEventListener('keydown', esc2); } });

    document.getElementById('ad-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var payload = buildPayload(cfg, editing);
      if (payload === null) return; // validation message already shown
      var submitBtn = e.target.querySelector('button[type=submit]'); submitBtn.disabled = true; submitBtn.textContent = 'Saving…';
      var p = editing ? cfg.update(item.id, payload) : cfg.create(payload);
      p.then(function () { close(); toast(editing ? 'Saved' : 'Created'); renderTab(); })
        .catch(function (err) {
          submitBtn.disabled = false; submitBtn.textContent = editing ? 'Save changes' : 'Create';
          var detail = err.details && err.details.length ? ' — ' + err.details.map(function (d) { return (d.path ? d.path + ': ' : '') + d.message; }).join('; ') : '';
          toast((err.message || 'Save failed') + detail, 'error');
        });
    });
  }

  function buildPayload(cfg, editing) {
    var out = {};
    for (var i = 0; i < cfg.fields.length; i++) {
      var f = cfg.fields[i];
      var eln = document.getElementById('f_' + f.k);
      if (f.type === 'checkbox') { out[f.k] = eln.checked; continue; }
      var raw = eln.value;
      var v = typeof raw === 'string' ? raw.trim() : raw;
      if (v === '' || v == null) {
        if (f.required) { toast(f.label + ' is required.', 'error'); return null; }
        continue; // omit empty optional fields
      }
      if (f.type === 'number') { out[f.k] = Number(v); }
      else if (f.type === 'datetime') { out[f.k] = new Date(v).toISOString(); }
      else { out[f.k] = v; }
    }
    return out;
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
