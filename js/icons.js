/**
 * Self-contained inline SVG icons (no icon-font CDN).
 * Usage: CC_ICON('leaf')  ->  '<svg ...>...</svg>'
 * All icons are 24x24, currentColor stroke, 1.9 weight.
 */
(function () {
  'use strict';

  // Path/inner markup per icon (viewBox 0 0 24 24).
  var P = {
    leaf: '<path d="M11 20A7 7 0 0 1 4 13C4 7 9 3 20 3c0 10-4 15-9 15Z"/><path d="M8.5 16.5C10 12 13 9 17 7"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    account: '<circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-6 8-6s8 2 8 6"/>',
    bag: '<path d="M6 8h12l-1 12H7L6 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
    cart: '<circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M3 4h2l2.4 12.2a1 1 0 0 0 1 .8h8.8a1 1 0 0 0 1-.8L21 8H6"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/>',
    arrowRight: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    arrowLeft: '<path d="M19 12H5M11 18l-6-6 6-6"/>',
    check: '<path d="M5 13l4 4L19 7"/>',
    checkCircle: '<circle cx="12" cy="12" r="9"/><path d="M8.5 12.5l2.5 2.5 4.5-5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    trash: '<path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13h10l1-13"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    pin: '<path d="M12 21s7-6 7-11a7 7 0 1 0-14 0c0 5 7 11 7 11Z"/><circle cx="12" cy="10" r="2.4"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
    phone: '<path d="M4 5c0 8 7 15 15 15l1.5-3.5-4-2-1.5 2A11 11 0 0 1 9 9l2-1.5-2-4L5.5 5H4Z"/>',
    heart: '<path d="M12 20s-7-4.5-9.2-9C1.3 8 3 4.5 6.5 4.5c2 0 3.2 1.2 4 2.3.8-1.1 2-2.3 4-2.3C22 4.5 22.7 8 21.2 11c-2.2 4.5-9.2 9-9.2 9Z"/>',
    translate: '<path d="M4 5h8M8 4c0 6-2.5 9-6 11M6 8c0 3 3 5 6 6"/><path d="m12 20 4-9 4 9M13.5 17h5"/>',
    tree: '<path d="M12 3 6 12h4l-3 5h10l-3-5h4L12 3Z"/><path d="M12 17v4"/>',
    users: '<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3 3-5 6-5s6 2 6 5"/><path d="M16 5.5a3 3 0 0 1 0 5.6M21 20c0-2.4-1.6-4.2-3.8-4.8"/>',
    school: '<path d="M12 4 2 9l10 5 10-5-10-5Z"/><path d="M6 11v5c0 1.5 3 3 6 3s6-1.5 6-3v-5"/>',
    recycle: '<path d="M7 8 5 12l3 1M12 4l2 4 3-2M17 16l-1 4-4-1"/><path d="M9 20H6a2 2 0 0 1-1.7-3M15 5l1.6 2.6A2 2 0 0 0 20 8"/>',
    shield: '<path d="M12 3 5 6v5c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-3Z"/><path d="M9 12l2 2 4-4"/>',
    lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    login: '<path d="M14 3h4a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1h-4M10 12H3M7 8l-4 4 4 4"/>',
    userPlus: '<circle cx="9" cy="8" r="3.5"/><path d="M3 20c0-3.3 3-5.5 6-5.5 1.2 0 2.4.3 3.4.9M17 8v6M14 11h6"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>',
    sprout: '<path d="M12 21v-8M12 13C12 9 9 7 4 7c0 4 3 6 8 6ZM12 11c0-3 3-5 8-5 0 3-3 5-8 5Z"/>',
    handHeart: '<path d="M3 13l4 4 6 3 8-4c1-.5.5-2-1-2h-6M3 11v8"/><path d="M13 8s-2-2-3.5-.5S8 11 11 12c3-1 3.5-2.5 2.5-4S13 8 13 8Z"/>',
    star: '<path d="m12 3 2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9 6.8 19l1-5.8L3.5 9.2l5.9-.9L12 3Z"/>',
    instagram: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none"/>',
    verified: '<path d="m9 12 2 2 4-4"/><path d="M12 3l2.2 1.6 2.7-.2 1 2.5 2.3 1.4-.8 2.6.8 2.6-2.3 1.4-1 2.5-2.7-.2L12 21l-2.2-1.6-2.7.2-1-2.5-2.3-1.4.8-2.6-.8-2.6 2.3-1.4 1-2.5 2.7.2L12 3Z"/>',
    eco: '<path d="M11 20A7 7 0 0 1 4 13C4 7 9 3 20 3c0 10-4 15-9 15Z"/><path d="M8.5 16.5C10 12 13 9 17 7"/>',
  };

  function icon(name, opts) {
    opts = opts || {};
    var inner = P[name] || P.leaf;
    var size = opts.size || 24;
    var fillIcons = name === 'star' || name === 'heart' || name === 'instagram';
    var fill = opts.fill || (fillIcons ? 'currentColor' : 'none');
    var stroke = fillIcons && !opts.stroke ? 'none' : 'currentColor';
    return (
      '<svg viewBox="0 0 24 24" width="' + size + '" height="' + size + '" fill="' + fill + '" ' +
      'stroke="' + stroke + '" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" ' +
      'aria-hidden="true" focusable="false">' + inner + '</svg>'
    );
  }

  window.CC_ICON = icon;

  // Auto-fill any static <span data-ico="name"></span> placeholders with SVG.
  function fill() {
    document.querySelectorAll('[data-ico]').forEach(function (n) {
      if (!n.__icoDone) { n.innerHTML = icon(n.getAttribute('data-ico')); n.__icoDone = true; }
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fill);
  } else {
    fill();
  }
  window.CC_ICON.fill = fill;
})();
