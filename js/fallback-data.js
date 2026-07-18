/**
 * Bundled content used when the live API can't be reached (e.g. the backend
 * isn't deployed/running yet). Lets the site render fully for browsing/demo
 * with zero setup. Mirrors the backend seed data and shapes.
 * Once the API is live, api.js uses it automatically and ignores this.
 */
(function () {
  'use strict';

  var products = [
    { name: 'Rooted Tee', slug: 'rooted-tee', description: 'Breathable, sustainably sourced cotton with water-based eco-ink printing.', price: 120, category: 'APPAREL', badge: 'Organic Cotton', stock: 50 },
    { name: 'Cardinal Tote Bag', slug: 'cardinal-tote-bag', description: 'Extra-durable canvas for your daily essentials and grocery hauls.', price: 85, category: 'ACCESSORIES', badge: 'Best Seller', stock: 80 },
    { name: 'Climate Justice Pack', slug: 'climate-justice-pack', description: 'Waterproof vinyl stickers to deck out your laptop and bottles.', price: 45, category: 'STICKERS', badge: null, stock: 200 },
    { name: 'Earth First Mug', slug: 'earth-first-mug', description: 'Hand-finished ceramic mug, perfect for your morning brew.', price: 60, category: 'DRINKWARE', badge: 'Limited Edition', stock: 40 },
    { name: 'Stainless Hydrator', slug: 'stainless-hydrator', description: 'Double-walled insulated stainless steel bottle that keeps drinks cold all day.', price: 120, category: 'DRINKWARE', badge: null, stock: 35 },
  ].map(function (p) { return Object.assign({ id: p.slug, imageUrl: 'images/merch/' + p.slug + '.svg', isActive: true }, p); });

  var events = [
    { title: 'Tree Planting Workshop', slug: 'tree-planting-workshop', category: 'WORKSHOP', location: 'KNUST Botanical Gardens', startTime: '2026-10-20T09:00:00Z', endTime: '2026-10-20T12:00:00Z', capacity: 60, description: 'Join us for a hands-on session on native species restoration. Learn about the diverse ecosystems within our campus and help us plant over 50 saplings to increase local canopy cover.' },
    { title: 'Climate Advocacy Seminar', slug: 'climate-advocacy-seminar', category: 'SEMINAR', location: 'KNUST Main Auditorium', startTime: '2026-11-05T14:00:00Z', endTime: '2026-11-05T16:30:00Z', capacity: 200, description: 'Learn how to effectively communicate climate science to local policymakers and influence community-level environmental decisions. This seminar features guest speakers from environmental NGOs.' },
    { title: 'Youth Climate Meeting', slug: 'youth-climate-meeting', category: 'MEETING', location: 'Student Union Building', startTime: '2026-11-12T17:00:00Z', endTime: '2026-11-12T18:30:00Z', capacity: 40, description: "Strategy session for our upcoming local language translation drive. We'll be discussing how to translate key climate terminology into Twi and other local languages for wider accessibility." },
    { title: 'Bio-Diversity Nature Walk', slug: 'bio-diversity-nature-walk', category: 'NATURE_WALK', location: 'Wewe River Trail', startTime: '2026-12-01T07:30:00Z', endTime: '2026-12-01T10:00:00Z', capacity: 30, description: 'A guided educational walk exploring local flora and fauna along the Wewe River. Perfect for biology enthusiasts and anyone looking to reconnect with the natural beauty of our campus.' },
  ].map(function (e) { return Object.assign({ id: e.slug, imageUrl: 'images/events/' + e.slug + '.svg', isPublished: true, registrationCount: 0 }, e); });

  var team = [
    { name: 'Dr. Edmund Yamba', role: 'Patron', tier: 'LEADERSHIP', imageUrl: 'images/patron.jpeg' },
    { name: 'Michelle Fosuah Kwarteng', role: 'Chapter President', tier: 'LEADERSHIP', imageUrl: 'images/delegate.jpeg' },
    { name: 'Akosua Nyarko Duodu', role: 'Chapter Vice President', tier: 'LEADERSHIP', imageUrl: 'images/akosua nyarko .jpeg' },
    { name: 'Rachel Opoku Asiamah', role: 'General Secretary', tier: 'LEADERSHIP', imageUrl: 'images/general secretary.jpeg' },
    { name: 'Yvonne Antwi-Agyei', role: 'Public Relations and Media Head', tier: 'LEADERSHIP', imageUrl: 'images/10-IMG_6954 (2).jpg' },
    { name: 'Perpetual Nyamaa Sam', role: 'Organizing Secretary', tier: 'LEADERSHIP', imageUrl: 'images/organizing secretary.jpeg' },
    { name: 'Benjamin Agorbia', role: 'Deputy Organizing Secretary', tier: 'LEADERSHIP', imageUrl: 'images/organizing secretary 2.jpeg' },
    { name: 'Ebo Mensah', role: 'Financial Secretary', tier: 'LEADERSHIP', imageUrl: null },
    { name: 'Daniel Amponsah', role: 'Research Fellow', tier: 'FELLOW', imageUrl: 'images/Daniel Amponsah.jpeg' },
    { name: 'Justice Osei Kwakye', role: 'Policy Fellow', tier: 'FELLOW', imageUrl: 'images/Justice .jpeg' },
    { name: 'Samuella Christa Sarpong', role: 'Chemical Engineering Student', tier: 'FELLOW', imageUrl: 'images/samuella christa.jpeg' },
    { name: 'Akua Dankwa', role: 'Education Fellow', tier: 'FELLOW', imageUrl: null },
  ].map(function (m, i) { return Object.assign({ id: 't' + i }, m); });

  var impact = [
    { label: 'Pages of Climate Data Translated', value: '500+', description: 'Translated into local dialects for wider accessibility.', icon: 'translate' },
    { label: 'Volunteers Engaged', value: '1,200', description: 'Students and community members mobilised for climate action.', icon: 'groups' },
    { label: 'Trees Planted on Campus', value: '350', description: 'Native shade trees planted across KNUST and Kumasi.', icon: 'forest' },
    { label: 'Schools Reached', value: '15', description: 'Educational outreach across local schools in the Kumasi region.', icon: 'school' },
    { label: 'Languages', value: '25+', description: 'Global translation reach across many languages.', icon: 'language' },
  ].map(function (s, i) { return Object.assign({ id: 's' + i }, s); });

  window.CC_FALLBACK = { products: products, events: events, team: team, impact: impact };
})();
