/**
 * Site-wide configuration for the Climate Cardinals KNUST frontend.
 * Edit these values to point at your deployed API and update social links.
 */
(function () {
  'use strict';

  // API base URL. Override at runtime with:
  //   localStorage.setItem('cc_api_base', 'https://api.yourdomain.com/api')
  var stored =
    typeof localStorage !== 'undefined' && localStorage.getItem('cc_api_base');

  window.CC_CONFIG = {
    apiBase: stored || 'http://localhost:4000/api',

    // Organisation contact
    email: 'info@climatecardinalsknust.org',

    // Social media handles — update these to the chapter's real accounts.
    social: [
      { name: 'Instagram', icon: 'photo_camera', url: 'https://instagram.com/climatecardinalsknust' },
      { name: 'X (Twitter)', icon: 'tag', url: 'https://x.com/climatecardinal' },
      { name: 'LinkedIn', icon: 'work', url: 'https://www.linkedin.com/company/climate-cardinals' },
      { name: 'Facebook', icon: 'thumb_up', url: 'https://facebook.com/climatecardinals' },
      { name: 'Email', icon: 'mail', url: 'mailto:info@climatecardinalsknust.org' },
    ],
  };
})();
