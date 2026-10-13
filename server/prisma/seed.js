// Seeds the admin account, default categories and (optionally) a demo user with sample data.
// Safe to run more than once: existing records are reused rather than duplicated.
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const CATEGORIES = [
  { name: 'Food & Dining', color: '#f97316' },
  { name: 'Transport', color: '#0ea5e9' },
  { name: 'Housing', color: '#6366f1' },
  { name: 'Utilities', color: '#14b8a6' },
  { name: 'Entertainment', color: '#ec4899' },
  { name: 'Health', color: '#22c55e' },
  { name: 'Shopping', color: '#a855f7' },
  { name: 'Education', color: '#eab308' },
  { name: 'Travel', color: '#06b6d4' },
  { name: 'Other', color: '#64748b' },
];

const SAMPLE_EXPENSES = {
  'Food & Dining': ['Groceries', 'Lunch with team', 'Coffee', 'Dinner out', 'Bakery'],
  Transport: ['Bus fare', 'Moto ride', 'Fuel', 'Taxi to airport'],
  Housing: ['Rent'],
  Utilities: ['Electricity', 'Water bill', 'Internet', 'Phone airtime'],
  Entertainment: ['Cinema tickets', 'Streaming subscription', 'Concert'],
  Health: ['Pharmacy', 'Gym membership', 'Doctor visit'],
  Shopping: ['Clothes', 'Headphones', 'Household items'],
  Education: ['Online course', 'Books'],
};

const PAYMENT_METHODS = ['CASH', 'CARD', 'MOBILE_MONEY', 'BANK_TRANSFER'];

// Small deterministic PRNG so the demo data is the same on every machine.
let seed = 42;
const random = () => {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
};
const pick = (items) => items[Math.floor(random() * items.length)];

const upsertUser = async ({ name, email, password, role }) =>
  prisma.user.upsert({
    where: { email },
    update: {},
    create: { name, email, role, passwordHash: await bcrypt.hash(password, 10) },
  });

const seedDemoData = async (categoriesByName) => {
  const demo = await upsertUser({
    name: 'Demo User',
    email: 'demo@retain.app',
    password: 'Demo@12345',
    role: 'USER',
  });

  if ((await prisma.expense.count({ where: { userId: demo.id } })) > 0) {
    console.log('Demo user already has expenses - skipping sample data');
    return;
  }

  const today = new Date();
  const expenses = [];

  // Four months of history including the current month.
  for (let offset = 3; offset >= 0; offset -= 1) {
    const year = today.getUTCFullYear();
    const monthIndex = today.getUTCMonth() - offset;
    const monthStart = new Date(Date.UTC(year, monthIndex, 1));
    const lastDay = offset === 0 ? today.getUTCDate() : new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
    const month = monthStart.toISOString().slice(0, 7);

    expenses.push({
      title: 'Rent',
      amount: 450,
      date: new Date(Date.UTC(year, monthIndex, 1)),
      paymentMethod: 'BANK_TRANSFER',
      categoryId: categoriesByName.Housing.id,
      userId: demo.id,
      notes: 'Monthly apartment rent',
    });

    // The current month only has the days elapsed so far, so it gets proportionally fewer expenses.
    const daysInMonth = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
    const count = Math.max(4, Math.round((18 * lastDay) / daysInMonth));
    for (let i = 0; i < count; i += 1) {
      const categoryName = pick(Object.keys(SAMPLE_EXPENSES).filter((name) => name !== 'Housing'));
      expenses.push({
        title: pick(SAMPLE_EXPENSES[categoryName]),
        amount: Math.round((5 + random() * 95) * 100) / 100,
        date: new Date(Date.UTC(year, monthIndex, 1 + Math.floor(random() * lastDay))),
        paymentMethod: pick(PAYMENT_METHODS),
        categoryId: categoriesByName[categoryName].id,
        userId: demo.id,
        notes: random() > 0.7 ? 'Added from receipt' : null,
      });
    }

    await prisma.budget.upsert({
      where: { userId_month: { userId: demo.id, month } },
      update: {},
      create: { userId: demo.id, month, amount: 1200 },
    });
  }

  await prisma.expense.createMany({ data: expenses });
  console.log(`Seeded demo user demo@retain.app with ${expenses.length} expenses`);
};

const main = async () => {
  const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD, SEED_DEMO_DATA } = process.env;
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be set to seed the admin account');
  }

  const admin = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL.toLowerCase() },
    update: { role: 'ADMIN' },
    create: {
      name: ADMIN_NAME || 'Retain Admin',
      email: ADMIN_EMAIL.toLowerCase(),
      role: 'ADMIN',
      passwordHash: await bcrypt.hash(ADMIN_PASSWORD, 10),
    },
  });
  console.log(`Admin account ready: ${admin.email}`);

  const categoriesByName = {};
  for (const category of CATEGORIES) {
    categoriesByName[category.name] = await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    });
  }
  console.log(`${CATEGORIES.length} categories ready`);

  if (SEED_DEMO_DATA === 'true') {
    await seedDemoData(categoriesByName);
  }
};

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
