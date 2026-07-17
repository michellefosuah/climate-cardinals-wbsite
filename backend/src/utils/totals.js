'use strict';

// Business rules mirrored from the frontend cart (cart.html):
//   shipping = flat GHS 25 when the cart has items, otherwise 0
//   tax      = 5% of subtotal, rounded to the nearest cedi
const FLAT_SHIPPING = 25;
const TAX_RATE = 0.05;

/**
 * Compute order totals from a list of line items.
 * @param {Array<{ unitPrice: number, quantity: number }>} lines
 * @param {number} [donation] optional donation add-on (e.g. "Plant a tree")
 * @returns {{ subtotal:number, shipping:number, tax:number, donation:number, total:number }}
 */
function computeTotals(lines, donation = 0) {
  const subtotal = lines.reduce(
    (sum, l) => sum + Number(l.unitPrice) * Number(l.quantity),
    0
  );
  const shipping = lines.length > 0 ? FLAT_SHIPPING : 0;
  const tax = Math.round(subtotal * TAX_RATE);
  const donationAmount = Number(donation) || 0;
  const total = subtotal + shipping + tax + donationAmount;

  return {
    subtotal: round2(subtotal),
    shipping: round2(shipping),
    tax: round2(tax),
    donation: round2(donationAmount),
    total: round2(total),
  };
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

module.exports = { computeTotals, FLAT_SHIPPING, TAX_RATE };
