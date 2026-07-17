'use strict';

/**
 * Convert an arbitrary string into a URL-safe slug.
 * "Rooted Tee" -> "rooted-tee"
 */
function slugify(input) {
  return String(input)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

module.exports = slugify;
