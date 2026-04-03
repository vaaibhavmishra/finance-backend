import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import {
  Category,
  PrismaClient,
  RecordType,
  Role,
  UserStatus,
} from '../src/generated/prisma/client';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

// ============================================
// Seed Data
// ============================================

async function main() {
  console.log('🌱 Starting database seed...\n');

  // Clean existing data
  await prisma.financialRecord.deleteMany();
  await prisma.user.deleteMany();
  console.log('🗑️  Cleared existing data');

  // ------------------------------------------
  // 1. Create Users
  // ------------------------------------------
  const passwordHash = await bcrypt.hash('Password123!', 12);

  const admin = await prisma.user.create({
    data: {
      name: 'Vaibhav Mishra',
      email: 'admin@finance.app',
      password: passwordHash,
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
    },
  });

  const analyst = await prisma.user.create({
    data: {
      name: 'Priya Sharma',
      email: 'analyst@finance.app',
      password: passwordHash,
      role: Role.ANALYST,
      status: UserStatus.ACTIVE,
    },
  });

  const viewer = await prisma.user.create({
    data: {
      name: 'Rahul Kumar',
      email: 'viewer@finance.app',
      password: passwordHash,
      role: Role.VIEWER,
      status: UserStatus.ACTIVE,
    },
  });

  const inactiveUser = await prisma.user.create({
    data: {
      name: 'Inactive User',
      email: 'inactive@finance.app',
      password: passwordHash,
      role: Role.VIEWER,
      status: UserStatus.INACTIVE,
    },
  });

  console.log('👤 Created users:');
  console.log(`   Admin:    ${admin.email} (${admin.role})`);
  console.log(`   Analyst:  ${analyst.email} (${analyst.role})`);
  console.log(`   Viewer:   ${viewer.email} (${viewer.role})`);
  console.log(`   Inactive: ${inactiveUser.email} (${inactiveUser.status})\n`);

  // ------------------------------------------
  // 2. Create Financial Records
  // ------------------------------------------

  // Helper to create a date N days ago
  const daysAgo = (days: number): Date => {
    const d = new Date();
    d.setDate(d.getDate() - days);
    d.setHours(Math.floor(Math.random() * 12) + 8); // Random hour 8-20
    return d;
  };

  const records = [
    // --- Income Records ---
    {
      amount: 85000,
      type: RecordType.INCOME,
      category: Category.SALARY,
      date: daysAgo(1),
      description: 'Monthly salary — March 2026',
      userId: admin.id,
    },
    {
      amount: 85000,
      type: RecordType.INCOME,
      category: Category.SALARY,
      date: daysAgo(31),
      description: 'Monthly salary — February 2026',
      userId: admin.id,
    },
    {
      amount: 85000,
      type: RecordType.INCOME,
      category: Category.SALARY,
      date: daysAgo(60),
      description: 'Monthly salary — January 2026',
      userId: admin.id,
    },
    {
      amount: 25000,
      type: RecordType.INCOME,
      category: Category.FREELANCE,
      date: daysAgo(5),
      description: 'Freelance web development project — React dashboard',
      userId: admin.id,
    },
    {
      amount: 15000,
      type: RecordType.INCOME,
      category: Category.FREELANCE,
      date: daysAgo(20),
      description: 'API integration consulting',
      userId: admin.id,
    },
    {
      amount: 12000,
      type: RecordType.INCOME,
      category: Category.INVESTMENT,
      date: daysAgo(10),
      description: 'Mutual fund dividend payout',
      userId: admin.id,
    },
    {
      amount: 8500,
      type: RecordType.INCOME,
      category: Category.INVESTMENT,
      date: daysAgo(45),
      description: 'Fixed deposit interest',
      userId: admin.id,
    },
    {
      amount: 30000,
      type: RecordType.INCOME,
      category: Category.RENTAL,
      date: daysAgo(3),
      description: 'Monthly rental income — Apartment 2B',
      userId: admin.id,
    },
    {
      amount: 30000,
      type: RecordType.INCOME,
      category: Category.RENTAL,
      date: daysAgo(33),
      description: 'Monthly rental income — Apartment 2B',
      userId: admin.id,
    },
    {
      amount: 50000,
      type: RecordType.INCOME,
      category: Category.BUSINESS,
      date: daysAgo(15),
      description: 'Client payment — E-commerce platform build',
      userId: admin.id,
    },

    // --- Expense Records ---
    {
      amount: 2500,
      type: RecordType.EXPENSE,
      category: Category.FOOD,
      date: daysAgo(1),
      description: 'Weekly groceries — BigBasket order',
      userId: admin.id,
    },
    {
      amount: 1800,
      type: RecordType.EXPENSE,
      category: Category.FOOD,
      date: daysAgo(4),
      description: 'Dinner at Italian restaurant with team',
      userId: admin.id,
    },
    {
      amount: 3200,
      type: RecordType.EXPENSE,
      category: Category.FOOD,
      date: daysAgo(8),
      description: 'Weekly groceries and household supplies',
      userId: admin.id,
    },
    {
      amount: 1500,
      type: RecordType.EXPENSE,
      category: Category.FOOD,
      date: daysAgo(14),
      description: 'Swiggy and Zomato orders this week',
      userId: admin.id,
    },
    {
      amount: 5000,
      type: RecordType.EXPENSE,
      category: Category.TRANSPORTATION,
      date: daysAgo(2),
      description: 'Petrol and car maintenance',
      userId: admin.id,
    },
    {
      amount: 2200,
      type: RecordType.EXPENSE,
      category: Category.TRANSPORTATION,
      date: daysAgo(18),
      description: 'Uber rides — office commute this week',
      userId: admin.id,
    },
    {
      amount: 4500,
      type: RecordType.EXPENSE,
      category: Category.UTILITIES,
      date: daysAgo(6),
      description: 'Electricity bill — March',
      userId: admin.id,
    },
    {
      amount: 1200,
      type: RecordType.EXPENSE,
      category: Category.UTILITIES,
      date: daysAgo(7),
      description: 'Internet and phone bill',
      userId: admin.id,
    },
    {
      amount: 2000,
      type: RecordType.EXPENSE,
      category: Category.UTILITIES,
      date: daysAgo(35),
      description: 'Electricity bill — February',
      userId: admin.id,
    },
    {
      amount: 3500,
      type: RecordType.EXPENSE,
      category: Category.ENTERTAINMENT,
      date: daysAgo(3),
      description: 'Netflix, Spotify, and gaming subscriptions',
      userId: admin.id,
    },
    {
      amount: 8000,
      type: RecordType.EXPENSE,
      category: Category.ENTERTAINMENT,
      date: daysAgo(12),
      description: 'Movie tickets and weekend outing',
      userId: admin.id,
    },
    {
      amount: 15000,
      type: RecordType.EXPENSE,
      category: Category.HEALTHCARE,
      date: daysAgo(9),
      description: 'Annual health checkup and dental cleaning',
      userId: admin.id,
    },
    {
      amount: 2500,
      type: RecordType.EXPENSE,
      category: Category.HEALTHCARE,
      date: daysAgo(25),
      description: 'Pharmacy — monthly medicines',
      userId: admin.id,
    },
    {
      amount: 12000,
      type: RecordType.EXPENSE,
      category: Category.EDUCATION,
      date: daysAgo(11),
      description: 'Udemy and Coursera course bundle — Backend & DevOps',
      userId: admin.id,
    },
    {
      amount: 18000,
      type: RecordType.EXPENSE,
      category: Category.SHOPPING,
      date: daysAgo(16),
      description: 'New mechanical keyboard and monitor stand',
      userId: admin.id,
    },
    {
      amount: 6500,
      type: RecordType.EXPENSE,
      category: Category.SHOPPING,
      date: daysAgo(22),
      description: 'Clothing — Amazon order',
      userId: admin.id,
    },
    {
      amount: 35000,
      type: RecordType.EXPENSE,
      category: Category.TRAVEL,
      date: daysAgo(28),
      description: 'Weekend trip to Goa — flights and hotel',
      userId: admin.id,
    },
    {
      amount: 25000,
      type: RecordType.EXPENSE,
      category: Category.INSURANCE,
      date: daysAgo(40),
      description: 'Term life insurance premium — quarterly',
      userId: admin.id,
    },
    {
      amount: 8000,
      type: RecordType.EXPENSE,
      category: Category.INSURANCE,
      date: daysAgo(42),
      description: 'Health insurance premium — monthly',
      userId: admin.id,
    },
    {
      amount: 45000,
      type: RecordType.EXPENSE,
      category: Category.TAXES,
      date: daysAgo(50),
      description: 'Advance tax payment — Q4 FY2025-26',
      userId: admin.id,
    },
    {
      amount: 5000,
      type: RecordType.EXPENSE,
      category: Category.OTHER,
      date: daysAgo(13),
      description: 'Charity donation — local school fund',
      userId: admin.id,
    },
    {
      amount: 3000,
      type: RecordType.EXPENSE,
      category: Category.OTHER,
      date: daysAgo(30),
      description: 'Home repair — plumbing fix',
      userId: admin.id,
    },

    // --- Records by Analyst user ---
    {
      amount: 65000,
      type: RecordType.INCOME,
      category: Category.SALARY,
      date: daysAgo(2),
      description: 'Monthly salary — March 2026',
      userId: analyst.id,
    },
    {
      amount: 8000,
      type: RecordType.EXPENSE,
      category: Category.FOOD,
      date: daysAgo(3),
      description: 'Monthly food expenses',
      userId: analyst.id,
    },
    {
      amount: 15000,
      type: RecordType.EXPENSE,
      category: Category.SHOPPING,
      date: daysAgo(7),
      description: 'New laptop accessories',
      userId: analyst.id,
    },

    // --- Records by Viewer user ---
    {
      amount: 45000,
      type: RecordType.INCOME,
      category: Category.SALARY,
      date: daysAgo(1),
      description: 'Monthly salary — March 2026',
      userId: viewer.id,
    },
    {
      amount: 3000,
      type: RecordType.EXPENSE,
      category: Category.ENTERTAINMENT,
      date: daysAgo(5),
      description: 'Gaming subscription and movie tickets',
      userId: viewer.id,
    },
  ];

  const createdRecords = await prisma.financialRecord.createMany({
    data: records,
  });

  console.log(`📊 Created ${createdRecords.count} financial records\n`);

  // ------------------------------------------
  // Summary
  // ------------------------------------------
  const totalIncome = records
    .filter((r) => r.type === RecordType.INCOME)
    .reduce((sum, r) => sum + r.amount, 0);

  const totalExpense = records
    .filter((r) => r.type === RecordType.EXPENSE)
    .reduce((sum, r) => sum + r.amount, 0);

  console.log('📈 Seed Summary:');
  console.log(`   Users created:   4`);
  console.log(`   Records created: ${createdRecords.count}`);
  console.log(`   Total Income:    ₹${totalIncome.toLocaleString('en-IN')}`);
  console.log(`   Total Expenses:  ₹${totalExpense.toLocaleString('en-IN')}`);
  console.log(`   Net Balance:     ₹${(totalIncome - totalExpense).toLocaleString('en-IN')}`);
  console.log('\n🔑 Login Credentials (all passwords: Password123!)');
  console.log('   admin@finance.app   → ADMIN role');
  console.log('   analyst@finance.app → ANALYST role');
  console.log('   viewer@finance.app  → VIEWER role');
  console.log('\n✅ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
