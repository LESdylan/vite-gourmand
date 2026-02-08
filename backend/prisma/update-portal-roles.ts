/**
 * Update Database Roles and Users for Portal
 * Run with: npx tsx prisma/update-portal-roles.ts
 */

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';

const connectionString = process.env.DATABASE_URL || '';
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
const SALT_ROUNDS = 10;

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function main() {
  console.log('🔄 Updating portal roles and users...\n');

  // 1. Create roles matching the subject
  console.log('👥 Setting up roles...');
  
  const roleNames = ['superadmin', 'admin', 'employee', 'utilisateur'];
  const roles: Record<string, { id: number }> = {};
  
  for (const name of roleNames) {
    const existing = await prisma.role.findFirst({ where: { libelle: name } });
    if (existing) {
      roles[name] = existing;
      console.log(`   ✓ Role '${name}' exists (id: ${existing.id})`);
    } else {
      const created = await prisma.role.create({ data: { libelle: name } });
      roles[name] = created;
      console.log(`   ✓ Created role '${name}' (id: ${created.id})`);
    }
  }

  // 2. Create/Update Dylan as superadmin
  console.log('\n👤 Setting up Dylan as superadmin...');
  const dylanEmail = 'dylanlesieur@outlook.fr';
  const dylanPassword = await hashPassword('Admin123!');
  
  const dylanExists = await prisma.user.findUnique({ where: { email: dylanEmail } });
  if (dylanExists) {
    await prisma.user.update({
      where: { email: dylanEmail },
      data: { roleId: roles.superadmin.id },
    });
    console.log(`   ✓ Updated Dylan to superadmin role`);
  } else {
    await prisma.user.create({
      data: {
        email: dylanEmail,
        password: dylanPassword,
        first_name: 'Dylan',
        last_name: 'Lesieur',
        telephone_number: '+33600000000',
        city: 'Bordeaux',
        country: 'France',
        postal_address: '1 Rue du Dev, 33000',
        roleId: roles.superadmin.id,
      },
    });
    console.log(`   ✓ Created Dylan as superadmin`);
  }

  // 3. Create/Update Julie as admin (subject: José asks us to create his account)
  console.log('\n👤 Setting up Julie as admin...');
  const julieEmail = 'julie@vitegourmand.fr';
  const adminPassword = await hashPassword('Admin123!');
  
  const julieExists = await prisma.user.findUnique({ where: { email: julieEmail } });
  if (julieExists) {
    await prisma.user.update({
      where: { email: julieEmail },
      data: { roleId: roles.admin.id },
    });
    console.log(`   ✓ Updated Julie to admin role`);
  } else {
    await prisma.user.create({
      data: {
        email: julieEmail,
        password: adminPassword,
        first_name: 'Julie',
        last_name: '',
        telephone_number: '+33600000001',
        city: 'Bordeaux',
        country: 'France',
        postal_address: '10 Rue Vite Gourmand, 33000 Bordeaux',
        roleId: roles.admin.id,
      },
    });
    console.log(`   ✓ Created Julie as admin`);
  }

  // 4. Create/Update José as admin
  console.log('\n👤 Setting up José as admin...');
  const joseEmail = 'jose@vitegourmand.fr';
  
  const joseExists = await prisma.user.findUnique({ where: { email: joseEmail } });
  if (joseExists) {
    await prisma.user.update({
      where: { email: joseEmail },
      data: { roleId: roles.admin.id },
    });
    console.log(`   ✓ Updated José to admin role`);
  } else {
    await prisma.user.create({
      data: {
        email: joseEmail,
        password: adminPassword,
        first_name: 'José',
        last_name: '',
        telephone_number: '+33600000002',
        city: 'Bordeaux',
        country: 'France',
        postal_address: '10 Rue Vite Gourmand, 33000 Bordeaux',
        roleId: roles.admin.id,
      },
    });
    console.log(`   ✓ Created José as admin`);
  }

  // 5. Create bot users
  console.log('\n🤖 Setting up bot users for debugging...');
  const botPassword = await hashPassword('bot_debug_only');
  
  const bots = [
    { email: 'bot_admin@debug.local', name: 'Bot Admin', role: 'admin' },
    { email: 'bot_employee@debug.local', name: 'Bot Employee', role: 'employee' },
    { email: 'bot_user@debug.local', name: 'Bot Utilisateur', role: 'utilisateur' },
  ];

  for (const bot of bots) {
    const exists = await prisma.user.findUnique({ where: { email: bot.email } });
    if (exists) {
      await prisma.user.update({
        where: { email: bot.email },
        data: { roleId: roles[bot.role].id },
      });
      console.log(`   ✓ Updated ${bot.name}`);
    } else {
      await prisma.user.create({
        data: {
          email: bot.email,
          password: botPassword,
          first_name: bot.name,
          last_name: '',
          telephone_number: '+00000000000',
          city: 'Debug',
          country: 'Debug',
          postal_address: 'Debug Address',
          roleId: roles[bot.role].id,
        },
      });
      console.log(`   ✓ Created ${bot.name}`);
    }
  }

  // 6. Summary
  console.log('\n📋 Current users and roles:');
  const users = await prisma.user.findMany({
    include: { role: true },
    orderBy: { id: 'asc' },
  });
  
  for (const user of users) {
    console.log(`   ${user.email.padEnd(35)} | ${(user.role?.libelle || 'no role').padEnd(12)} | ${user.first_name}`);
  }

  console.log('\n✅ Portal setup complete!\n');
  console.log('📌 Test credentials:');
  console.log('   Superadmin: dylanlesieur@outlook.fr / Admin123!');
  console.log('   Admin:      julie@vitegourmand.fr / Admin123!');
  console.log('   Admin:      jose@vitegourmand.fr / Admin123!');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
