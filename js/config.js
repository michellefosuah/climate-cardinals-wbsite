/**
 * Site-wide configuration for the Climate Cardinals KNUST frontend.
 * Edit these values to point at your deployed API and update social links.
 */
(function () {
  'use strict';

  // ----------------------------------------------------------------------
  // API location
  // ----------------------------------------------------------------------
  // After deploying the backend (see DEPLOYMENT.md), paste its base URL here,
  // e.g. 'https://climate-cardinals-api.onrender.com/api'
  var PROD_API_BASE = 'https://climate-cardinals-api.onrender.com/api';

  // Resolution order:
  //   1. a runtime override in localStorage ('cc_api_base')
  //   2. localhost when developing on your own machine
  //   3. PROD_API_BASE above, if you filled it in
  //   4. same origin + '/api' (works if one host serves both site and API)
  var stored =
    typeof localStorage !== 'undefined' && localStorage.getItem('cc_api_base');
  var host = typeof location !== 'undefined' ? location.hostname : '';
  var isLocal = host === 'localhost' || host === '127.0.0.1' || host === '';
  var resolvedBase =
    stored ||
    (isLocal
      ? 'http://localhost:4000/api'
      : PROD_API_BASE || (location.origin + '/api'));

  window.CC_CONFIG = {
    apiBase: resolvedBase,

    // Organisation contact
    email: 'climatecardinalsknust@gmail.com',

    // Social media handles — update these to the chapter's real accounts.
    social: [
      { name: 'Instagram', icon: 'photo_camera', url: 'https://instagram.com/climatecardinals_knust' },
      { name: 'Email', icon: 'mail', url: 'mailto:climatecardinalsknust@gmail.com' },
    ],
  };
})();
