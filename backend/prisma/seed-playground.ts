/**
 * Seed Script for Playground Data
 * ================================
 * This script generates properly hashed passwords using bcrypt
 * and seeds the database with sample data for testing.
 * 
 * Run with: npx tsx prisma/seed-playground.ts
 * Or via Makefile: make seed_db_playground
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
  console.log('🌱 Starting playground seed...\n');

  // Clean existing data
  console.log('🧹 Cleaning existing data...');
  await prisma.$executeRaw`TRUNCATE TABLE "_OrderMenus" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "_DishAllergens" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "Publish" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "Order" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "Dish" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "Menu" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "User" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "Role" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "Diet" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "Theme" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "Allergen" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "WorkingHours" CASCADE`;

  // 1. Create Roles
  console.log('👥 Creating roles...');
  const roles = await Promise.all([
    prisma.role.create({ data: { libelle: 'admin' } }),
    prisma.role.create({ data: { libelle: 'manager' } }),
    prisma.role.create({ data: { libelle: 'client' } }),
  ]);
  console.log(`   Created ${roles.length} roles`);

  // 2. Create Users with REAL bcrypt hashed passwords
  console.log('👤 Creating users with bcrypt hashed passwords...');
  
  const adminPassword = await hashPassword('Admin123!');
  const managerPassword = await hashPassword('Manager123!');
  const clientPassword = await hashPassword('Client123!');

  console.log(`   Sample admin hash: ${adminPassword.substring(0, 30)}...`);
  console.log(`   Sample client hash: ${clientPassword.substring(0, 30)}...`);

  const users = await Promise.all([
    // Admins
    prisma.user.create({
      data: {
        email: 'admin@vitegourmand.fr',
        password: adminPassword,
        first_name: 'Jean',
        telephone_number: '+33612345678',
        city: 'Paris',
        country: 'France',
        postal_address: '1 Rue de la Paix, 75001',
        roleId: roles[0].id,
      },
    }),
    prisma.user.create({
      data: {
        email: 'superadmin@vitegourmand.fr',
        password: adminPassword,
        first_name: 'Marie',
        telephone_number: '+33612345679',
        city: 'Lyon',
        country: 'France',
        postal_address: '10 Place Bellecour, 69002',
        roleId: roles[0].id,
      },
    }),
    // Managers
    prisma.user.create({
      data: {
        email: 'manager@vitegourmand.fr',
        password: managerPassword,
        first_name: 'Pierre',
        telephone_number: '+33612345680',
        city: 'Marseille',
        country: 'France',
        postal_address: '5 Vieux Port, 13001',
        roleId: roles[1].id,
      },
    }),
    prisma.user.create({
      data: {
        email: 'chef.manager@vitegourmand.fr',
        password: managerPassword,
        first_name: 'Sophie',
        telephone_number: '+33612345681',
        city: 'Bordeaux',
        country: 'France',
        postal_address: '20 Quai des Chartrons, 33000',
        roleId: roles[1].id,
      },
    }),
    // Clients
    prisma.user.create({
      data: {
        email: 'alice.dupont@email.fr',
        password: clientPassword,
        first_name: 'Alice',
        telephone_number: '+33612345683',
        city: 'Nice',
        country: 'France',
        postal_address: '8 Promenade des Anglais, 06000',
        roleId: roles[2].id,
      },
    }),
    prisma.user.create({
      data: {
        email: 'bob.martin@email.fr',
        password: clientPassword,
        first_name: 'Bob',
        telephone_number: '+33612345684',
        city: 'Nantes',
        country: 'France',
        postal_address: '3 Rue Crébillon, 44000',
        roleId: roles[2].id,
      },
    }),
    prisma.user.create({
      data: {
        email: 'claire.bernard@email.fr',
        password: clientPassword,
        first_name: 'Claire',
        telephone_number: '+33612345685',
        city: 'Strasbourg',
        country: 'France',
        postal_address: '12 Place Kléber, 67000',
        roleId: roles[2].id,
      },
    }),
    prisma.user.create({
      data: {
        email: 'david.petit@email.fr',
        password: clientPassword,
        first_name: 'David',
        telephone_number: '+33612345686',
        city: 'Montpellier',
        country: 'France',
        postal_address: '7 Place de la Comédie, 34000',
        roleId: roles[2].id,
      },
    }),
    prisma.user.create({
      data: {
        email: 'emma.leroy@email.fr',
        password: clientPassword,
        first_name: 'Emma',
        telephone_number: '+33612345687',
        city: 'Lille',
        country: 'France',
        postal_address: '25 Grand Place, 59000',
        roleId: roles[2].id,
      },
    }),
    prisma.user.create({
      data: {
        email: 'francois.moreau@email.fr',
        password: clientPassword,
        first_name: 'François',
        telephone_number: '+33612345688',
        city: 'Rennes',
        country: 'France',
        postal_address: '4 Place des Lices, 35000',
        roleId: roles[2].id,
      },
    }),
    prisma.user.create({
      data: {
        email: 'julien.garcia@email.fr',
        password: clientPassword,
        first_name: 'Julien',
        telephone_number: '+33612345692',
        city: 'Dijon',
        country: 'France',
        postal_address: '2 Place de la Libération, 21000',
        roleId: roles[2].id,
      },
    }),
  ]);
  console.log(`   Created ${users.length} users with hashed passwords`);

  // 3. Create Working Hours
  console.log('🕐 Creating working hours...');
  const workingHours = await prisma.workingHours.createMany({
    data: [
      { day: 'Lundi', opening: '09:00', closing: '18:00' },
      { day: 'Mardi', opening: '09:00', closing: '18:00' },
      { day: 'Mercredi', opening: '09:00', closing: '18:00' },
      { day: 'Jeudi', opening: '09:00', closing: '18:00' },
      { day: 'Vendredi', opening: '09:00', closing: '20:00' },
      { day: 'Samedi', opening: '10:00', closing: '22:00' },
      { day: 'Dimanche', opening: '10:00', closing: '16:00' },
    ],
  });
  console.log(`   Created ${workingHours.count} working hour entries`);

  // 4. Create Diets
  console.log('🥗 Creating dietary options...');
  const diets = await Promise.all([
    prisma.diet.create({ data: { libelle: 'Classique' } }),
    prisma.diet.create({ data: { libelle: 'Végétarien' } }),
    prisma.diet.create({ data: { libelle: 'Végan' } }),
    prisma.diet.create({ data: { libelle: 'Sans Gluten' } }),
    prisma.diet.create({ data: { libelle: 'Halal' } }),
    prisma.diet.create({ data: { libelle: 'Casher' } }),
  ]);
  console.log(`   Created ${diets.length} dietary options`);

  // 5. Create Themes
  console.log('🎨 Creating event themes...');
  const themes = await Promise.all([
    prisma.theme.create({ data: { libelle: 'Mariage' } }),
    prisma.theme.create({ data: { libelle: 'Anniversaire' } }),
    prisma.theme.create({ data: { libelle: 'Baptême' } }),
    prisma.theme.create({ data: { libelle: 'Entreprise' } }),
    prisma.theme.create({ data: { libelle: 'Cocktail' } }),
    prisma.theme.create({ data: { libelle: 'Gastronomique' } }),
    prisma.theme.create({ data: { libelle: 'Barbecue' } }),
    prisma.theme.create({ data: { libelle: 'Brunch' } }),
  ]);
  console.log(`   Created ${themes.length} event themes`);

  // 6. Create Allergens (14 major EU allergens)
  console.log('⚠️  Creating allergens...');
  const allergens = await Promise.all([
    prisma.allergen.create({ data: { libelle: 'Gluten' } }),
    prisma.allergen.create({ data: { libelle: 'Crustacés' } }),
    prisma.allergen.create({ data: { libelle: 'Œufs' } }),
    prisma.allergen.create({ data: { libelle: 'Poisson' } }),
    prisma.allergen.create({ data: { libelle: 'Arachides' } }),
    prisma.allergen.create({ data: { libelle: 'Soja' } }),
    prisma.allergen.create({ data: { libelle: 'Lait' } }),
    prisma.allergen.create({ data: { libelle: 'Fruits à coque' } }),
    prisma.allergen.create({ data: { libelle: 'Céleri' } }),
    prisma.allergen.create({ data: { libelle: 'Moutarde' } }),
    prisma.allergen.create({ data: { libelle: 'Sésame' } }),
    prisma.allergen.create({ data: { libelle: 'Sulfites' } }),
    prisma.allergen.create({ data: { libelle: 'Lupin' } }),
    prisma.allergen.create({ data: { libelle: 'Mollusques' } }),
  ]);
  console.log(`   Created ${allergens.length} allergens`);

  // 6.5. Create Ingredients
  console.log('🥕 Creating ingredients...');
  const ingredients = await Promise.all([
    prisma.ingredient.create({
      data: {
        name: 'Foie Gras',
        unit: 'kg',
        current_stock: 5.0,
        min_stock_level: 1.0,
        cost_per_unit: 120.0,
      },
    }),
    prisma.ingredient.create({
      data: {
        name: 'Filet de Bœuf',
        unit: 'kg',
        current_stock: 20.0,
        min_stock_level: 5.0,
        cost_per_unit: 45.0,
      },
    }),
    prisma.ingredient.create({
      data: {
        name: 'Champignons',
        unit: 'kg',
        current_stock: 15.0,
        min_stock_level: 3.0,
        cost_per_unit: 8.0,
      },
    }),
    prisma.ingredient.create({
      data: {
        name: 'Œufs',
        unit: 'pièces',
        current_stock: 200,
        min_stock_level: 50,
        cost_per_unit: 0.3,
      },
    }),
    prisma.ingredient.create({
      data: {
        name: 'Farine',
        unit: 'kg',
        current_stock: 50.0,
        min_stock_level: 10.0,
        cost_per_unit: 1.5,
      },
    }),
    prisma.ingredient.create({
      data: {
        name: 'Beurre',
        unit: 'kg',
        current_stock: 10.0,
        min_stock_level: 2.0,
        cost_per_unit: 12.0,
      },
    }),
    prisma.ingredient.create({
      data: {
        name: 'Homard',
        unit: 'kg',
        current_stock: 8.0,
        min_stock_level: 2.0,
        cost_per_unit: 80.0,
      },
    }),
  ]);
  console.log(`   Created ${ingredients.length} ingredients`);

  // 7. Create Menus
  console.log('📋 Creating menus...');
  const menus = await Promise.all([
    prisma.menu.create({
      data: {
        title: 'Menu Prestige Mariage',
        person_min: 50,
        price_per_person: 85.0,
        dietId: diets[0].id,
        themeId: themes[0].id,
        description: 'Notre menu signature pour les mariages, avec entrée, plat, fromage et dessert',
        remaining_qty: 10,
      },
    }),
    prisma.menu.create({
      data: {
        title: 'Menu Végétarien Élégant',
        person_min: 20,
        price_per_person: 65.0,
        dietId: diets[1].id,
        themeId: themes[0].id,
        description: 'Alternative végétarienne raffinée pour vos événements',
        remaining_qty: 15,
      },
    }),
    prisma.menu.create({
      data: {
        title: 'Cocktail Entreprise',
        person_min: 30,
        price_per_person: 45.0,
        dietId: diets[0].id,
        themeId: themes[3].id,
        description: 'Assortiment de canapés et mignardises pour vos réunions',
        remaining_qty: 20,
      },
    }),
    prisma.menu.create({
      data: {
        title: 'Brunch Dominical',
        person_min: 15,
        price_per_person: 35.0,
        dietId: diets[0].id,
        themeId: themes[7].id,
        description: 'Formule brunch complète avec viennoiseries, œufs, fruits frais',
        remaining_qty: 25,
      },
    }),
    prisma.menu.create({
      data: {
        title: 'Menu Gastronomique',
        person_min: 10,
        price_per_person: 120.0,
        dietId: diets[0].id,
        themeId: themes[5].id,
        description: 'Expérience culinaire haut de gamme en 5 services',
        remaining_qty: 8,
      },
    }),
    prisma.menu.create({
      data: {
        title: 'Barbecue Festif',
        person_min: 25,
        price_per_person: 40.0,
        dietId: diets[0].id,
        themeId: themes[6].id,
        description: 'Viandes grillées, salades, et desserts maison',
        remaining_qty: 18,
      },
    }),
  ]);
  console.log(`   Created ${menus.length} menus`);

  // 8. Create Dishes with allergen connections AND menu connections (M:N) AND ingredient connections
  console.log('🍽️  Creating dishes...');
  const dishes = await Promise.all([
    prisma.dish.create({
      data: {
        title_dish: 'Foie Gras Maison',
        photo: '/images/dishes/foie-gras.jpg',
        course_type: 'entree',
        menus: { connect: [{ id: menus[0].id }] },
        allergens: { connect: [{ id: allergens[0].id }, { id: allergens[2].id }] },
        ingredients: {
          create: [
            { ingredient_id: ingredients[0].id, quantity: 0.15 }, // 150g foie gras per serving
            { ingredient_id: ingredients[4].id, quantity: 0.05 }, // 50g flour
          ],
        },
      },
    }),
    prisma.dish.create({
      data: {
        title_dish: 'Filet de Bœuf Wellington',
        photo: '/images/dishes/beef-wellington.jpg',
        course_type: 'plat',
        menus: { connect: [{ id: menus[0].id }] },
        allergens: { connect: [{ id: allergens[0].id }, { id: allergens[2].id }, { id: allergens[6].id }] },
        ingredients: {
          create: [
            { ingredient_id: ingredients[1].id, quantity: 0.25 }, // 250g beef per serving
            { ingredient_id: ingredients[2].id, quantity: 0.1 },  // 100g mushrooms
            { ingredient_id: ingredients[4].id, quantity: 0.05 }, // 50g flour
            { ingredient_id: ingredients[5].id, quantity: 0.03 }, // 30g butter
          ],
        },
      },
    }),
    prisma.dish.create({
      data: {
        title_dish: 'Paris-Brest',
        photo: '/images/dishes/paris-brest.jpg',
        course_type: 'dessert',
        menus: { connect: [{ id: menus[0].id }, { id: menus[4].id }] },
        allergens: { connect: [{ id: allergens[0].id }, { id: allergens[2].id }, { id: allergens[6].id }, { id: allergens[7].id }] },
        ingredients: {
          create: [
            { ingredient_id: ingredients[3].id, quantity: 3 },    // 3 eggs per serving
            { ingredient_id: ingredients[4].id, quantity: 0.08 }, // 80g flour
            { ingredient_id: ingredients[5].id, quantity: 0.06 }, // 60g butter
          ],
        },
      },
    }),
    prisma.dish.create({
      data: {
        title_dish: 'Risotto aux Champignons',
        photo: '/images/dishes/mushroom-risotto.jpg',
        course_type: 'plat',
        menus: { connect: [{ id: menus[1].id }] },
        allergens: { connect: [{ id: allergens[6].id }, { id: allergens[8].id }] },
        ingredients: {
          create: [
            { ingredient_id: ingredients[2].id, quantity: 0.15 }, // 150g mushrooms per serving
            { ingredient_id: ingredients[5].id, quantity: 0.02 }, // 20g butter
          ],
        },
      },
    }),
    prisma.dish.create({
      data: {
        title_dish: 'Mini Quiches Lorraine',
        photo: '/images/dishes/mini-quiche.jpg',
        course_type: 'entree',
        menus: { connect: [{ id: menus[2].id }] },
        allergens: { connect: [{ id: allergens[0].id }, { id: allergens[2].id }, { id: allergens[6].id }] },
        ingredients: {
          create: [
            { ingredient_id: ingredients[3].id, quantity: 2 },    // 2 eggs per serving
            { ingredient_id: ingredients[4].id, quantity: 0.06 }, // 60g flour
            { ingredient_id: ingredients[5].id, quantity: 0.04 }, // 40g butter
          ],
        },
      },
    }),
    prisma.dish.create({
      data: {
        title_dish: 'Œufs Bénédicte',
        photo: '/images/dishes/eggs-benedict.jpg',
        course_type: 'plat',
        menus: { connect: [{ id: menus[3].id }] },
        allergens: { connect: [{ id: allergens[0].id }, { id: allergens[2].id }, { id: allergens[6].id }] },
        ingredients: {
          create: [
            { ingredient_id: ingredients[3].id, quantity: 2 },    // 2 eggs per serving
            { ingredient_id: ingredients[5].id, quantity: 0.03 }, // 30g butter
          ],
        },
      },
    }),
    prisma.dish.create({
      data: {
        title_dish: 'Homard Bleu',
        photo: '/images/dishes/lobster.jpg',
        course_type: 'plat',
        menus: { connect: [{ id: menus[4].id }] },
        allergens: { connect: [{ id: allergens[1].id }] },
        ingredients: {
          create: [
            { ingredient_id: ingredients[6].id, quantity: 0.4 }, // 400g lobster per serving
            { ingredient_id: ingredients[5].id, quantity: 0.02 }, // 20g butter
          ],
        },
      },
    }),
    prisma.dish.create({
      data: {
        title_dish: 'Côte de Bœuf Grillée',
        photo: '/images/dishes/grilled-beef.jpg',
        course_type: 'plat',
        menus: { connect: [{ id: menus[5].id }] },
        allergens: { connect: [] },
        ingredients: {
          create: [
            { ingredient_id: ingredients[1].id, quantity: 0.35 }, // 350g beef per serving
          ],
        },
      },
    }),
  ]);
  console.log(`   Created ${dishes.length} dishes with ingredient tracking`);

  // 9. Create Orders
  console.log('📦 Creating orders...');
  const orders = await Promise.all([
    prisma.order.create({
      data: {
        order_number: 'ORD-2026-0001',
        order_date: new Date('2026-01-15T10:30:00'),
        prestation_date: new Date('2026-02-14T18:00:00'),
        delivery_hour: '17:00',
        menu_price: 4250.0,
        person_number: 50,
        delivery_price: 150.0,
        status: 'confirmed',
        material_lending: true,
        get_back_material: false,
        userId: users[4].id,
        menus: { connect: [{ id: menus[0].id }] },
      },
    }),
    prisma.order.create({
      data: {
        order_number: 'ORD-2026-0002',
        order_date: new Date('2026-01-16T14:00:00'),
        prestation_date: new Date('2026-02-20T12:00:00'),
        delivery_hour: '11:00',
        menu_price: 1350.0,
        person_number: 30,
        delivery_price: 100.0,
        status: 'confirmed',
        material_lending: false,
        get_back_material: false,
        userId: users[5].id,
        menus: { connect: [{ id: menus[2].id }] },
      },
    }),
    prisma.order.create({
      data: {
        order_number: 'ORD-2026-0003',
        order_date: new Date('2026-01-17T09:15:00'),
        prestation_date: new Date('2026-03-01T19:00:00'),
        delivery_hour: '18:00',
        menu_price: 2400.0,
        person_number: 40,
        delivery_price: 120.0,
        status: 'pending',
        material_lending: true,
        get_back_material: false,
        userId: users[6].id,
        menus: { connect: [{ id: menus[1].id }] },
      },
    }),
    prisma.order.create({
      data: {
        order_number: 'ORD-2026-0004',
        order_date: new Date('2026-01-18T16:45:00'),
        prestation_date: new Date('2026-02-10T10:00:00'),
        delivery_hour: '09:00',
        menu_price: 525.0,
        person_number: 15,
        delivery_price: 50.0,
        status: 'delivered',
        material_lending: false,
        get_back_material: false,
        userId: users[7].id,
        menus: { connect: [{ id: menus[3].id }] },
      },
    }),
    prisma.order.create({
      data: {
        order_number: 'ORD-2026-0005',
        order_date: new Date('2026-01-19T11:00:00'),
        prestation_date: new Date('2026-04-15T20:00:00'),
        delivery_hour: '19:00',
        menu_price: 1200.0,
        person_number: 10,
        delivery_price: 80.0,
        status: 'confirmed',
        material_lending: true,
        get_back_material: false,
        userId: users[8].id,
        menus: { connect: [{ id: menus[4].id }] },
      },
    }),
  ]);
  console.log(`   Created ${orders.length} orders`);

  // 10. Create Reviews (Publish)
  console.log('⭐ Creating reviews...');
  const reviews = await Promise.all([
    prisma.publish.create({
      data: {
        note: '5',
        description: 'Service impeccable pour notre mariage ! Les invités ont adoré.',
        status: 'approved',
        userId: users[4].id,
      },
    }),
    prisma.publish.create({
      data: {
        note: '5',
        description: 'Le menu gastronomique était exceptionnel, digne d\'un restaurant étoilé.',
        status: 'approved',
        userId: users[8].id,
      },
    }),
    prisma.publish.create({
      data: {
        note: '4',
        description: 'Très bon rapport qualité-prix pour le cocktail entreprise.',
        status: 'approved',
        userId: users[5].id,
      },
    }),
    prisma.publish.create({
      data: {
        note: '5',
        description: 'Le brunch était parfait, tout le monde s\'est régalé !',
        status: 'approved',
        userId: users[7].id,
      },
    }),
    prisma.publish.create({
      data: {
        note: '3',
        description: 'Bon service mais livraison un peu en retard.',
        status: 'pending',
        userId: users[9].id,
      },
    }),
  ]);
  console.log(`   Created ${reviews.length} reviews`);

  // Summary
  console.log('\n========================================');
  console.log('✅ PLAYGROUND SEED COMPLETED!');
  console.log('========================================');
  console.log(`Roles: ${roles.length}`);
  console.log(`Users: ${users.length} (with bcrypt hashed passwords)`);
  console.log(`Working Hours: ${workingHours.count}`);
  console.log(`Diets: ${diets.length}`);
  console.log(`Themes: ${themes.length}`);
  console.log(`Allergens: ${allergens.length}`);
  console.log(`Menus: ${menus.length}`);
  console.log(`Dishes: ${dishes.length}`);
  console.log(`Orders: ${orders.length}`);
  console.log(`Reviews: ${reviews.length}`);
  console.log('========================================');
  console.log('\n🔐 TEST CREDENTIALS:');
  console.log('   Admin:   admin@vitegourmand.fr / Admin123!');
  console.log('   Manager: manager@vitegourmand.fr / Manager123!');
  console.log('   Client:  alice.dupont@email.fr / Client123!');
  console.log('========================================\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
