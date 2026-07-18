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
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD6vaU5tEJlV8hbsAdKXvsfQMHtpt6CrfDZ1UWFDfed1iiz5gnbzldpkdnnldlv5eiNNONv593djX5zA7Virtp58Qcm0vvFc8vjDccSlEiZd1BR2yol1u-OKT5ml9LQmRUZvfA26yL_SCUHzZjpHP_yUM4CMG9pbrtUS3R5JP1jVSy7Zyq5lpyuqn686aKPrl_TMUxS9p6W_Vgv8E-mULwdFtiPP_GRGbs8kmDEKJgRgXzDzZSiHG9gZuqKjSpLp844ezgkOFwo9klz',
  },
  {
    name: 'Cardinal Tote Bag',
    description: 'Extra-durable canvas for your daily essentials and grocery hauls.',
    price: 85,
    category: 'ACCESSORIES',
    badge: 'Best Seller',
    stock: 80,
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDTUD0u3Pd3GGs20dVLbgyLMMaCvtGes4gS3qikgUtKXQ5t2dWr0Is4FQ0TJlKsxqXSUoYe8UmJ9n7SrPyCTGMTzxzOnCE5j4UnhVnFyG6AOXE0ArNmS4SU4WxF-mO3uHYzy7szv69AKt2EEJ3Hh61p3SDyN62wB5qFQ5lNYykkBbbPY610hbf4529ktgUsgS4OXT9yZPijM4AIlLXLSkZg_ejbiknoASqtl6bLWIXSNjHuJ3ykZBE4JBzrwi7QCKtPDER6L-Q5usOr',
  },
  {
    name: 'Climate Justice Pack',
    description: 'Waterproof vinyl stickers to deck out your laptop and bottles.',
    price: 45,
    category: 'STICKERS',
    badge: null,
    stock: 200,
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB1Phr3UfTPE5w0SJdZt3cDRdrrakP7Vw6dKA4jv-zD3U5NIKjcCInHdl_zycqGtC-1VW5Q15mBVAv7Q0JAVsQWkLw66q8KjI0o1gPLCvH_XNOk92f739kj-NGKMPuD-8q6CXZxVMltURyNDhe_mIDL_LvxNM-Y0gA0RzAccpyk7dO6jfDzwsGKUm8KiByaBADE7_aVWs07aTP_51up1ea_fNOTnNosLMkfJP6CWRhyKlC3roUc5iZ5xpvhFIOra8Z2YKgxJAtBO9wc',
  },
  {
    name: 'Earth First Mug',
    description: 'Hand-finished ceramic mug, perfect for your morning brew.',
    price: 60,
    category: 'DRINKWARE',
    badge: 'Limited Edition',
    stock: 40,
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDxJBsZvhJXaMurDY4ohlOpSrzn-WSwjbcpsxRuUEHbCQIJizoavKTMG5Kh5yeHfqD-T-CER5IjQHVeEq7W4KqO4yO027hp77LHs3LVrQxx8iL_SRLuQ5X0v3ZEZROvOeFjWZPVCCPB56FVhur0ls_z6PqIlW_UZcz1npgav3PzG3w4-jtEE_YMAGxWpnZjuRR3MbU_yNuTgix85fTEEk6jDay6Y3wzABAsKjc4i7KdUXHfXDKBOi97kXWvQtZBFgnjpnWCgjtZ-Isv',
  },
  {
    name: 'Stainless Hydrator',
    description: 'Double-walled insulated stainless steel bottle that keeps drinks cold all day.',
    price: 120,
    category: 'DRINKWARE',
    badge: null,
    stock: 35,
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBibtMPf2-0mODBwfUA51T1ipTdXnOkopYrL6LrtZqO6HKp5-7d8ml1agX1vCuqs4NQyJwdHDM1Z9Jn-AngaH3SiguunExjzf1zVMjNUvdICpsLA_ASuTkXXXTal07pXTl4959aT-Lnf874oRbfU0DAmWMus9p-FUEx33DUOn6j2UB8EguLYd_T5leOVbiVipmEzcoqGVCt4CoAqRiaGRiISPCz50E7LhwerhYqD6YULqbdTZ0bHGHTNGz4oy5s9xvx8ZcGtF-vvDnw',
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
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBibtMPf2-0mODBwfUA51T1ipTdXnOkopYrL6LrtZqO6HKp5-7d8ml1agX1vCuqs4NQyJwdHDM1Z9Jn-AngaH3SiguunExjzf1zVMjNUvdICpsLA_ASuTkXXXTal07pXTl4959aT-Lnf874oRbfU0DAmWMus9p-FUEx33DUOn6j2UB8EguLYd_T5leOVbiVipmEzcoqGVCt4CoAqRiaGRiISPCz50E7LhwerhYqD6YULqbdTZ0bHGHTNGz4oy5s9xvx8ZcGtF-vvDnw',
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
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAarqH848UL6xgTV5ysihNq20i8_yP2O2GeHj73CqFk8__avqj__AU36_-FCVWf-TE9OxNfeUu5aeL62oZ3ljtb0JrmbR5Qy9R5Aw-layfyZIpdBNAsC85Mv_sJmLzWZpNg7ONe5gd0rbBMUlfpg1brp9qHdFIqZ1PFF6zLM8MnwtXZTLAGG7Sb7g7eqneXVaZdTEAcOiLzwR-IZQ5hiZKLL72hMgtRyDli3K7jv0e85hfIpJ_HfZz1KaOQy8qbi7g9pynaerm3FdcF',
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
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBjBwPDe4N1wNBWHvEMDlZ9BzTqvNx7soG9FbDe_TNt1TMIpZXXQ-PqvfgboSZO5ZXnwvqthUMFW4_yHNQg-cnCsXmyjrUSKseLNN_fF43rSO1iKaYXM77o4mksPo8Mm-_CqqETqFpxgLdJLMApd_svm207wPL7gO4eh1lKhj_NoGx2KfMkFxlHp65hh8vbFOaWm7rHCdr_ohqOXbOL1HX3QiQ2UO4gLSFr8c0ZNn81jVm36pJccADhOYYoWiynEY9srWe9vQdXN7Q4',
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
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCb9gtLUSuSJLwEHG6INbrPhMGMlrQRl_ihxk8aVmhc6CBb2neGUGV_imTGFsJhlMiwHHrNtcW1f3b1Djk6LNU3QCxnai4N9-gbxDknyjewcYDAk3ERMMRs6paA2bS355yR00zJPsqoyskOYDc5GPf6BjOcEbkVgqvHCv157ynTOiMhOEuKUTzrTRAVj0aqMeuLU6B_TNLik7iVrGdXGNxf8y02xGL0DxYcbMDyLz8F9EwcDkGcomIY75FFqUP0djqoDSFeVyidT-mj',
  },
];

// Team roster from index.html.
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

// Impact stats from index.html / impact.html.
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

  // Sample content is seeded ONLY when a table is empty, so any changes made
  // through the admin dashboard survive future deploys (this seed runs on
  // every deploy). To re-seed a section, clear that table first.

  // Products
  if ((await prisma.product.count()) === 0) {
    for (const p of products) {
      const slug = slugify(p.name);
      await prisma.product.create({ data: { ...p, slug, imageUrl: `images/merch/${slug}.svg` } });
    }
    console.log(`   ✓ ${products.length} products (seeded)`);
  } else {
    console.log('   • products already present — left untouched');
  }

  // Events
  if ((await prisma.event.count()) === 0) {
    for (const e of events) {
      const slug = slugify(e.title);
      await prisma.event.create({ data: { ...e, slug, imageUrl: `images/events/${slug}.svg` } });
    }
    console.log(`   ✓ ${events.length} events (seeded)`);
  } else {
    console.log('   • events already present — left untouched');
  }

  // Team
  if ((await prisma.teamMember.count()) === 0) {
    await prisma.teamMember.createMany({ data: team });
    console.log(`   ✓ ${team.length} team members (seeded)`);
  } else {
    console.log('   • team already present — left untouched');
  }

  // Impact stats
  if ((await prisma.impactStat.count()) === 0) {
    await prisma.impactStat.createMany({ data: impactStats });
    console.log(`   ✓ ${impactStats.length} impact stats (seeded)`);
  } else {
    console.log('   • impact stats already present — left untouched');
  }

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
