'use strict';

/**
 * Seed script — populates the database with the content currently hard-coded
 * in the static frontend (products, events, team members, impact stats) plus a
 * bootstrap admin account. Safe to re-run: it upserts by unique keys.
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const slugify = (s) =>
  String(s)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

// --- Data drawn from the frontend --------------------------------------------

const products = [
  {
    name: 'Rooted Tee',
    description:
      'Breathable, sustainably sourced cotton with water-based eco-ink printing.',
    price: 120,
    category: 'APPAREL',
    badge: 'Organic Cotton',
    stock: 50,
  },
  {
    name: 'Cardinal Tote Bag',
    description: 'Extra-durable canvas for your daily essentials and grocery hauls.',
    price: 85,
    category: 'ACCESSORIES',
    badge: 'Best Seller',
    stock: 80,
  },
  {
    name: 'Climate Justice Pack',
    description: 'Waterproof vinyl stickers to deck out your laptop and bottles.',
    price: 45,
    category: 'STICKERS',
    badge: null,
    stock: 200,
  },
  {
    name: 'Earth First Mug',
    description: 'Hand-finished ceramic mug, perfect for your morning brew.',
    price: 60,
    category: 'DRINKWARE',
    badge: 'Limited Edition',
    stock: 40,
  },
  {
    name: 'Stainless Hydrator',
    description: 'Double-walled insulated stainless steel bottle that keeps drinks cold all day.',
    price: 120,
    category: 'DRINKWARE',
    badge: null,
    stock: 35,
  },
];

// Events from index.html. Year set to 2026 so they remain upcoming.
const events = [
  {
    title: 'Tree Planting Workshop',
    description:
      'Join us for a hands-on session on native species restoration. Learn about the diverse ecosystems within our campus and help us plant over 50 saplings to increase local canopy cover.',
    category: 'WORKSHOP',
    location: 'KNUST Botanical Gardens',
    startTime: new Date('2026-10-20T09:00:00Z'),
    endTime: new Date('2026-10-20T12:00:00Z'),
    capacity: 60,
  },
  {
    title: 'Climate Advocacy Seminar',
    description:
      'Learn how to effectively communicate climate science to local policymakers and influence community-level environmental decisions. This seminar features guest speakers from environmental NGOs.',
    category: 'SEMINAR',
    location: 'KNUST Main Auditorium',
    startTime: new Date('2026-11-05T14:00:00Z'),
    endTime: new Date('2026-11-05T16:30:00Z'),
    capacity: 200,
  },
  {
    title: 'Youth Climate Meeting',
    description:
      "Strategy session for our upcoming local language translation drive. We'll be discussing how to translate key climate terminology into Twi and other local languages for wider accessibility.",
    category: 'MEETING',
    location: 'Student Union Building',
    startTime: new Date('2026-11-12T17:00:00Z'),
    endTime: new Date('2026-11-12T18:30:00Z'),
    capacity: 40,
  },
  {
    title: 'Bio-Diversity Nature Walk',
    description:
      'A guided educational walk exploring local flora and fauna along the Wewe River. Perfect for biology enthusiasts and anyone looking to reconnect with the natural beauty of our campus.',
    category: 'NATURE_WALK',
    location: 'Wewe River Trail',
    startTime: new Date('2026-12-01T07:30:00Z'),
    endTime: new Date('2026-12-01T10:00:00Z'),
    capacity: 30,
  },
];

// Team roster from main.html.
const team = [
  { name: 'Dr. Edmund Yamba', role: 'Patron', tier: 'LEADERSHIP', imageUrl: 'images/patron.jpeg', sortOrder: 1 },
  { name: 'Michelle Fosuah Kwarteng', role: 'Chapter President', tier: 'LEADERSHIP', imageUrl: 'images/delegate.jpeg', sortOrder: 2 },
  { name: 'Akosua Nyarko Duodu', role: 'Chapter Vice President', tier: 'LEADERSHIP', imageUrl: 'images/akosua nyarko .jpeg', sortOrder: 3 },
  { name: 'Rachel Opoku Asiamah', role: 'General Secretary', tier: 'LEADERSHIP', imageUrl: 'images/general secretary.jpeg', sortOrder: 4 },
  { name: 'Yvonne Antwi-Agyei', role: 'Public Relations and Media Head', tier: 'LEADERSHIP', imageUrl: 'images/10-IMG_6954 (2).jpg', sortOrder: 5 },
  { name: 'Perpetual Nyamaa Sam', role: 'Organizing Secretary', tier: 'LEADERSHIP', imageUrl: 'images/organizing secretary.jpeg', sortOrder: 6 },
  { name: 'Benjamin Agorbia', role: 'Deputy Organizing Secretary', tier: 'LEADERSHIP', imageUrl: 'images/organizing secretary 2.jpeg', sortOrder: 7 },
  { name: 'Ebo Mensah', role: 'Financial Secretary', tier: 'LEADERSHIP', sortOrder: 8 },
  { name: 'Daniel Amponsah', role: 'Research Fellow', tier: 'FELLOW', imageUrl: 'images/Daniel Amponsah.jpeg', sortOrder: 1 },
  { name: 'Justice Osei Kwakye', role: 'Policy Fellow', tier: 'FELLOW', imageUrl: 'images/Justice .jpeg', sortOrder: 2 },
  { name: 'Samuella Christa Sarpong', role: 'Chemical Engineering Student', tier: 'FELLOW', imageUrl: 'images/samuella christa.jpeg', sortOrder: 3 },
  { name: 'Akua Dankwa', role: 'Education Fellow', tier: 'FELLOW', sortOrder: 4 },
];

// Impact stats from main.html / impact.html.
const impactStats = [
  { label: 'Pages of Climate Data Translated', value: '500+', description: 'Translated into local dialects for wider accessibility.', icon: 'translate', sortOrder: 1 },
  { label: 'Volunteers Engaged', value: '1,200', description: 'Students and community members mobilised for climate action.', icon: 'groups', sortOrder: 2 },
  { label: 'Trees Planted on Campus', value: '350', description: 'Native shade trees planted across KNUST and Kumasi.', icon: 'forest', sortOrder: 3 },
  { label: 'Schools Reached', value: '15', description: 'Educational outreach across local schools in the Kumasi region.', icon: 'school', sortOrder: 4 },
  { label: 'Languages', value: '25+', description: 'Global translation reach across many languages.', icon: 'language', sortOrder: 5 },
];

async function main() {
  console.log('🌱 Seeding database...');

  // Admin user
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@climatecardinalsknust.org';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'ChangeMe123!';
  const adminName = process.env.SEED_ADMIN_NAME || 'Chapter Admin';
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: 'ADMIN' },
    create: { name: adminName, email: adminEmail, passwordHash, role: 'ADMIN' },
  });
  console.log(`   ✓ Admin user: ${adminEmail}`);

  // Products
  for (const p of products) {
    const slug = slugify(p.name);
    await prisma.product.upsert({
      where: { slug },
      update: { ...p, slug },
      create: { ...p, slug },
    });
  }
  console.log(`   ✓ ${products.length} products`);

  // Events
  for (const e of events) {
    const slug = slugify(e.title);
    await prisma.event.upsert({
      where: { slug },
      update: { ...e, slug },
      create: { ...e, slug },
    });
  }
  console.log(`   ✓ ${events.length} events`);

  // Team — no natural unique key, so reset and re-insert for idempotency.
  await prisma.teamMember.deleteMany();
  await prisma.teamMember.createMany({ data: team });
  console.log(`   ✓ ${team.length} team members`);

  // Impact stats — same approach.
  await prisma.impactStat.deleteMany();
  await prisma.impactStat.createMany({ data: impactStats });
  console.log(`   ✓ ${impactStats.length} impact stats`);

  console.log('✅ Seed complete.');
}

main()
  .catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
