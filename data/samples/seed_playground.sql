-- ============================================
-- VITE GOURMAND - PLAYGROUND SEED DATA
-- ============================================
-- This file contains sample data for testing
-- Run with: make seed_db_playground
-- ============================================

-- Clean existing data (in correct order due to foreign keys)
TRUNCATE TABLE "_OrderMenus" CASCADE;
TRUNCATE TABLE "_DishAllergens" CASCADE;
TRUNCATE TABLE "Publish" CASCADE;
TRUNCATE TABLE "Order" CASCADE;
TRUNCATE TABLE "Dish" CASCADE;
TRUNCATE TABLE "Menu" CASCADE;
TRUNCATE TABLE "User" CASCADE;
TRUNCATE TABLE "Role" CASCADE;
TRUNCATE TABLE "Diet" CASCADE;
TRUNCATE TABLE "Theme" CASCADE;
TRUNCATE TABLE "Allergen" CASCADE;
TRUNCATE TABLE "WorkingHours" CASCADE;

-- ============================================
-- 1. ROLES (3 roles)
-- ============================================
INSERT INTO "Role" (id, libelle) VALUES
(1, 'admin'),
(2, 'manager'),
(3, 'client');

-- Reset sequence
SELECT setval('"Role_id_seq"', (SELECT MAX(id) FROM "Role"));

-- ============================================
-- 2. USERS (15 users with BCRYPT HASHED passwords)
-- ============================================
-- NOTE: All passwords are hashed with bcrypt (cost 10)
-- Plain text passwords for testing:
--   admin@vitegourmand.fr -> "Admin123!"
--   superadmin@vitegourmand.fr -> "Admin123!"
--   manager@vitegourmand.fr -> "Manager123!"
--   chef.manager@vitegourmand.fr -> "Manager123!"
--   event.manager@vitegourmand.fr -> "Manager123!"
--   All client emails -> "Client123!"
-- ============================================
INSERT INTO "User" (id, email, password, first_name, telephone_number, city, country, postal_address, "roleId") VALUES
-- Admins (password: Admin123!)
(1, 'admin@vitegourmand.fr', '$2b$10$AWWJqO5FU2yVy0wR0FcOoODQxCOw3RCAgoVNKeu/yJjHa.a15T5Zu', 'Jean', '+33612345678', 'Paris', 'France', '1 Rue de la Paix, 75001', 1),
(2, 'superadmin@vitegourmand.fr', '$2b$10$0rL3BLE0x6z4NfCyiKVs2eUW1WG/SjeTdMX310CpS750B4.GgSSue', 'Marie', '+33612345679', 'Lyon', 'France', '10 Place Bellecour, 69002', 1),

-- Managers (password: Manager123!)
(3, 'manager@vitegourmand.fr', '$2b$10$Vgq/kE7vCeflnOWWyKKTheccNDCkMcOKh57z9zwbtFep5PbCcGSEG', 'Pierre', '+33612345680', 'Marseille', 'France', '5 Vieux Port, 13001', 2),
(4, 'chef.manager@vitegourmand.fr', '$2b$10$CcUwkd5.QilF0kjnQYYBwO8CKNNfrna6zyNOzXUCwAcYoJoicMc4q', 'Sophie', '+33612345681', 'Bordeaux', 'France', '20 Quai des Chartrons, 33000', 2),
(5, 'event.manager@vitegourmand.fr', '$2b$10$PEkkWyudUKNTXKEswQoGn.d4CVbKFtjy3DopXZf.EGKdd9Sh0pYt.', 'Lucas', '+33612345682', 'Toulouse', 'France', '15 Place du Capitole, 31000', 2),

-- Clients (password: Client123!)
(6, 'alice.dupont@email.fr', '$2b$10$7h5dizd4QMCZRyeNG0OeMOHvXiKbkrtHTt3R4UKfzk3FwUGrjm/U.', 'Alice', '+33612345683', 'Nice', 'France', '8 Promenade des Anglais, 06000', 3),
(7, 'bob.martin@email.fr', '$2b$10$K6OAt0ZYI9x1meQsdMoEF.DK/.pv57jTbaTeYkFvkDM6t/ylXKJE.', 'Bob', '+33612345684', 'Nantes', 'France', '3 Rue Crébillon, 44000', 3),
(8, 'claire.bernard@email.fr', '$2b$10$W9xx3VR/WvYhy0pHJicj1O2g9APWUaGUWYXuMbbQxp6bBrHys3p3a', 'Claire', '+33612345685', 'Strasbourg', 'France', '12 Place Kléber, 67000', 3),
(9, 'david.petit@email.fr', '$2b$10$.CHht9phCGQ5bxUoP1gi7uTH1CyZv4TSKeCsCv937GwEIl1690kJu', 'David', '+33612345686', 'Montpellier', 'France', '7 Place de la Comédie, 34000', 3),
(10, 'emma.leroy@email.fr', '$2b$10$Wkr/AnMFDuGof7r5VpX.K.s1b5y3eSfwJYdEjEPH4LAU.YTiv/lKW', 'Emma', '+33612345687', 'Lille', 'France', '25 Grand Place, 59000', 3),
(11, 'francois.moreau@email.fr', '$2b$10$/VA/plvFvjeEwe/MtuXVvunpVuRq3hP59/KqMJ6KgPy/Gv3oI/L6C', 'François', '+33612345688', 'Rennes', 'France', '4 Place des Lices, 35000', 3),
(12, 'gabrielle.simon@email.fr', '$2b$10$PdCO4XfbRT.zkg3nceJx5ek9gxmXF5zqXfmMdAdzBi7oXn5sRxg/2', 'Gabrielle', '+33612345689', 'Reims', 'France', '18 Place Drouet-dErlon, 51100', 3),
(13, 'hugo.laurent@email.fr', '$2b$10$OrE/jUbEEyZkNZfP4XGhJuZujO3jG7ZftGM7kJykBOFVj8LbbndOO', 'Hugo', '+33612345690', 'Toulon', 'France', '9 Quai Cronstadt, 83000', 3),
(14, 'isabelle.michel@email.fr', '$2b$10$DmaNodFpI5ja28zb3hnBaeCGt8na.ipjdPqRQUKDebTz2xhZ1OI8e', 'Isabelle', '+33612345691', 'Grenoble', 'France', '6 Place Victor Hugo, 38000', 3),
(15, 'julien.garcia@email.fr', '$2b$10$5Sz4ldr4CSGs4.xkXq9zO.K7rddD//Kw2ngyqeMkaZLrp2c7JP332', 'Julien', '+33612345692', 'Dijon', 'France', '2 Place de la Libération, 21000', 3);

SELECT setval('"User_id_seq"', (SELECT MAX(id) FROM "User"));

-- ============================================
-- 3. WORKING HOURS (7 days)
-- ============================================
INSERT INTO "WorkingHours" (id, day, opening, closing) VALUES
(1, 'Lundi', '09:00', '18:00'),
(2, 'Mardi', '09:00', '18:00'),
(3, 'Mercredi', '09:00', '18:00'),
(4, 'Jeudi', '09:00', '18:00'),
(5, 'Vendredi', '09:00', '20:00'),
(6, 'Samedi', '10:00', '22:00'),
(7, 'Dimanche', '10:00', '16:00');

SELECT setval('"WorkingHours_id_seq"', (SELECT MAX(id) FROM "WorkingHours"));

-- ============================================
-- 4. DIETS (6 dietary options)
-- ============================================
INSERT INTO "Diet" (id, libelle) VALUES
(1, 'Classique'),
(2, 'Végétarien'),
(3, 'Végan'),
(4, 'Sans Gluten'),
(5, 'Halal'),
(6, 'Casher');

SELECT setval('"Diet_id_seq"', (SELECT MAX(id) FROM "Diet"));

-- ============================================
-- 5. THEMES (8 event themes)
-- ============================================
INSERT INTO "Theme" (id, libelle) VALUES
(1, 'Mariage'),
(2, 'Anniversaire'),
(3, 'Baptême'),
(4, 'Entreprise'),
(5, 'Cocktail'),
(6, 'Gastronomique'),
(7, 'Barbecue'),
(8, 'Brunch');

SELECT setval('"Theme_id_seq"', (SELECT MAX(id) FROM "Theme"));

-- ============================================
-- 6. ALLERGENS (14 major allergens - EU regulation)
-- ============================================
INSERT INTO "Allergen" (id, libelle) VALUES
(1, 'Gluten'),
(2, 'Crustacés'),
(3, 'Œufs'),
(4, 'Poisson'),
(5, 'Arachides'),
(6, 'Soja'),
(7, 'Lait'),
(8, 'Fruits à coque'),
(9, 'Céleri'),
(10, 'Moutarde'),
(11, 'Sésame'),
(12, 'Sulfites'),
(13, 'Lupin'),
(14, 'Mollusques');

SELECT setval('"Allergen_id_seq"', (SELECT MAX(id) FROM "Allergen"));

-- ============================================
-- 7. MENUS (12 menus)
-- ============================================
INSERT INTO "Menu" (id, title, person_min, price_per_person, "dietId", "themeId", description, remaining_qty) VALUES
(1, 'Menu Prestige Mariage', 50, 85.00, 1, 1, 'Notre menu signature pour les mariages, avec entrée, plat, fromage et dessert', 10),
(2, 'Menu Végétarien Élégant', 20, 65.00, 2, 1, 'Alternative végétarienne raffinée pour vos événements', 15),
(3, 'Cocktail Entreprise', 30, 45.00, 1, 4, 'Assortiment de canapés et mignardises pour vos réunions', 20),
(4, 'Brunch Dominical', 15, 35.00, 1, 8, 'Formule brunch complète avec viennoiseries, œufs, fruits frais', 25),
(5, 'Menu Gastronomique', 10, 120.00, 1, 6, 'Expérience culinaire haut de gamme en 5 services', 8),
(6, 'Barbecue Festif', 25, 40.00, 1, 7, 'Viandes grillées, salades, et desserts maison', 18),
(7, 'Menu Végan Créatif', 15, 55.00, 3, 5, 'Cuisine végétale créative et savoureuse', 12),
(8, 'Menu Sans Gluten', 10, 70.00, 4, 6, 'Menu complet adapté aux intolérants au gluten', 10),
(9, 'Cocktail Anniversaire', 20, 50.00, 1, 2, 'Finger food et petits fours pour célébrer', 22),
(10, 'Menu Halal Premium', 30, 75.00, 5, 1, 'Menu respectant les prescriptions halal', 15),
(11, 'Baptême Tradition', 25, 55.00, 1, 3, 'Menu familial pour célébration de baptême', 20),
(12, 'Menu Casher Élégant', 20, 80.00, 6, 1, 'Menu raffiné respectant les règles casher', 10);

SELECT setval('"Menu_id_seq"', (SELECT MAX(id) FROM "Menu"));

-- ============================================
-- 8. DISHES (24 dishes)
-- ============================================
INSERT INTO "Dish" (id, title_dish, photo, "menuId") VALUES
-- Menu Prestige Mariage dishes
(1, 'Foie Gras Maison', '/images/dishes/foie-gras.jpg', 1),
(2, 'Filet de Bœuf Wellington', '/images/dishes/beef-wellington.jpg', 1),
(3, 'Plateau de Fromages Affinés', '/images/dishes/cheese-platter.jpg', 1),
(4, 'Paris-Brest', '/images/dishes/paris-brest.jpg', 1),

-- Menu Végétarien dishes
(5, 'Carpaccio de Légumes', '/images/dishes/veggie-carpaccio.jpg', 2),
(6, 'Risotto aux Champignons', '/images/dishes/mushroom-risotto.jpg', 2),
(7, 'Tarte Tatin aux Légumes', '/images/dishes/veggie-tatin.jpg', 2),

-- Cocktail Entreprise dishes
(8, 'Mini Quiches Lorraine', '/images/dishes/mini-quiche.jpg', 3),
(9, 'Verrines de Saumon', '/images/dishes/salmon-verrine.jpg', 3),
(10, 'Brochettes Caprese', '/images/dishes/caprese.jpg', 3),

-- Brunch dishes
(11, 'Œufs Bénédicte', '/images/dishes/eggs-benedict.jpg', 4),
(12, 'Pancakes Fruits Rouges', '/images/dishes/pancakes.jpg', 4),
(13, 'Granola Maison', '/images/dishes/granola.jpg', 4),

-- Menu Gastronomique dishes
(14, 'Amuse-bouche du Chef', '/images/dishes/amuse-bouche.jpg', 5),
(15, 'Homard Bleu', '/images/dishes/lobster.jpg', 5),
(16, 'Pigeon Rôti', '/images/dishes/roasted-pigeon.jpg', 5),
(17, 'Soufflé au Chocolat', '/images/dishes/chocolate-souffle.jpg', 5),

-- Barbecue dishes
(18, 'Côte de Bœuf Grillée', '/images/dishes/grilled-beef.jpg', 6),
(19, 'Brochettes Marinées', '/images/dishes/kebabs.jpg', 6),
(20, 'Salade César', '/images/dishes/caesar-salad.jpg', 6),

-- Végan dishes
(21, 'Buddha Bowl', '/images/dishes/buddha-bowl.jpg', 7),
(22, 'Curry de Légumes', '/images/dishes/veggie-curry.jpg', 7),

-- Sans Gluten dishes
(23, 'Pavé de Saumon GF', '/images/dishes/salmon-gf.jpg', 8),
(24, 'Fondant au Chocolat GF', '/images/dishes/chocolate-fondant-gf.jpg', 8);

SELECT setval('"Dish_id_seq"', (SELECT MAX(id) FROM "Dish"));

-- ============================================
-- 9. DISH-ALLERGEN RELATIONSHIPS
-- A = Allergen ID, B = Dish ID (Prisma convention)
-- ============================================
INSERT INTO "_DishAllergens" ("A", "B") VALUES
-- Foie Gras (Dish 1): eggs, gluten
(3, 1), (1, 1),
-- Beef Wellington (Dish 2): gluten, eggs, milk
(1, 2), (3, 2), (7, 2),
-- Cheese Platter (Dish 3): milk
(7, 3),
-- Paris-Brest (Dish 4): gluten, eggs, milk, tree nuts
(1, 4), (3, 4), (7, 4), (8, 4),
-- Risotto (Dish 6): milk, celery
(7, 6), (9, 6),
-- Mini Quiches (Dish 8): gluten, eggs, milk
(1, 8), (3, 8), (7, 8),
-- Salmon Verrine (Dish 9): fish, eggs
(4, 9), (3, 9),
-- Caprese (Dish 10): milk
(7, 10),
-- Eggs Benedict (Dish 11): eggs, gluten, milk
(3, 11), (1, 11), (7, 11),
-- Pancakes (Dish 12): gluten, eggs, milk
(1, 12), (3, 12), (7, 12),
-- Granola (Dish 13): gluten, tree nuts
(1, 13), (8, 13),
-- Lobster (Dish 15): crustaceans
(2, 15),
-- Pigeon (Dish 16): sulfites in sauce
(12, 16),
-- Chocolate Souffle (Dish 17): eggs, milk, gluten
(3, 17), (7, 17), (1, 17),
-- Caesar Salad (Dish 20): fish (anchovies), eggs, milk, mustard
(4, 20), (3, 20), (7, 20), (10, 20),
-- Buddha Bowl (Dish 21): sesame, soy
(11, 21), (6, 21),
-- Veggie Curry (Dish 22): tree nuts
(8, 22),
-- Salmon GF (Dish 23): fish
(4, 23),
-- Chocolate Fondant GF (Dish 24): eggs, milk
(3, 24), (7, 24);

-- ============================================
-- 10. ORDERS (15 orders)
-- ============================================
INSERT INTO "Order" (id, order_number, order_date, prestation_date, delivery_hour, menu_price, person_number, delivery_price, status, material_lending, get_back_material, "userId") VALUES
(1, 'ORD-2026-0001', '2026-01-15 10:30:00', '2026-02-14 18:00:00', '17:00', 4250.00, 50, 150.00, 'confirmed', true, false, 6),
(2, 'ORD-2026-0002', '2026-01-16 14:00:00', '2026-02-20 12:00:00', '11:00', 1350.00, 30, 100.00, 'confirmed', false, false, 7),
(3, 'ORD-2026-0003', '2026-01-17 09:15:00', '2026-03-01 19:00:00', '18:00', 2400.00, 40, 120.00, 'pending', true, false, 8),
(4, 'ORD-2026-0004', '2026-01-18 16:45:00', '2026-02-10 10:00:00', '09:00', 525.00, 15, 50.00, 'delivered', false, false, 9),
(5, 'ORD-2026-0005', '2026-01-19 11:00:00', '2026-04-15 20:00:00', '19:00', 1200.00, 10, 80.00, 'confirmed', true, false, 10),
(6, 'ORD-2026-0006', '2026-01-20 13:30:00', '2026-03-08 13:00:00', '12:00', 1000.00, 25, 75.00, 'pending', false, false, 11),
(7, 'ORD-2026-0007', '2026-01-21 10:00:00', '2026-02-28 19:30:00', '18:30', 825.00, 15, 60.00, 'confirmed', true, false, 12),
(8, 'ORD-2026-0008', '2026-01-22 15:20:00', '2026-03-15 12:30:00', '11:30', 700.00, 10, 55.00, 'pending', false, false, 13),
(9, 'ORD-2026-0009', '2026-01-23 09:45:00', '2026-02-22 18:00:00', '17:00', 1000.00, 20, 70.00, 'confirmed', true, true, 14),
(10, 'ORD-2026-0010', '2026-01-24 14:15:00', '2026-04-01 20:00:00', '19:00', 2250.00, 30, 100.00, 'pending', true, false, 15),
(11, 'ORD-2026-0011', '2026-01-25 11:30:00', '2026-03-20 13:00:00', '12:00', 1375.00, 25, 85.00, 'confirmed', false, false, 6),
(12, 'ORD-2026-0012', '2026-01-26 16:00:00', '2026-02-18 19:00:00', '18:00', 1600.00, 20, 90.00, 'delivered', true, true, 7),
(13, 'ORD-2026-0013', '2026-01-27 10:30:00', '2026-03-25 11:00:00', '10:00', 350.00, 10, 40.00, 'pending', false, false, 8),
(14, 'ORD-2026-0014', '2026-01-28 13:00:00', '2026-04-10 18:30:00', '17:30', 3000.00, 40, 130.00, 'confirmed', true, false, 9),
(15, 'ORD-2026-0015', '2026-01-29 09:00:00', '2026-02-25 20:00:00', '19:00', 1700.00, 20, 95.00, 'cancelled', false, false, 10);

SELECT setval('"Order_id_seq"', (SELECT MAX(id) FROM "Order"));

-- ============================================
-- 11. ORDER-MENU RELATIONSHIPS
-- ============================================
INSERT INTO "_OrderMenus" ("A", "B") VALUES
(1, 1),  -- Order 1 -> Menu Prestige Mariage
(3, 2),  -- Order 2 -> Cocktail Entreprise
(4, 3),  -- Order 3 -> Menu Végétarien
(4, 4),  -- Order 4 -> Brunch
(5, 5),  -- Order 5 -> Menu Gastronomique
(6, 6),  -- Order 6 -> Barbecue
(7, 7),  -- Order 7 -> Menu Végan
(8, 8),  -- Order 8 -> Menu Sans Gluten
(9, 9),  -- Order 9 -> Cocktail Anniversaire
(10, 10), -- Order 10 -> Menu Halal
(11, 11), -- Order 11 -> Baptême Tradition
(12, 12), -- Order 12 -> Menu Casher
(2, 13),  -- Order 13 -> Brunch (again)
(1, 14),  -- Order 14 -> Menu Prestige (again)
(3, 15);  -- Order 15 -> Cocktail Entreprise (cancelled)

-- ============================================
-- 12. PUBLISHES / REVIEWS (12 reviews)
-- ============================================
INSERT INTO "Publish" (id, note, description, status, "userId") VALUES
(1, '5', 'Service impeccable pour notre mariage ! Les invités ont adoré.', 'approved', 6),
(2, '5', 'Le menu gastronomique était exceptionnel, digne d''un restaurant étoilé.', 'approved', 10),
(3, '4', 'Très bon rapport qualité-prix pour le cocktail entreprise.', 'approved', 7),
(4, '5', 'Le brunch était parfait, tout le monde s''est régalé !', 'approved', 9),
(5, '4', 'Menu végétarien créatif et savoureux.', 'approved', 8),
(6, '5', 'Équipe professionnelle et à l''écoute.', 'approved', 11),
(7, '3', 'Bon service mais livraison un peu en retard.', 'pending', 12),
(8, '5', 'Le barbecue était une réussite totale !', 'approved', 13),
(9, '4', 'Menu sans gluten excellent, enfin une vraie alternative.', 'approved', 14),
(10, '5', 'Parfait pour notre baptême, merci à toute l''équipe.', 'approved', 15),
(11, '2', 'Déçu par la quantité servie, un peu juste.', 'rejected', 6),
(12, '5', 'Menu halal de qualité, je recommande vivement.', 'approved', 7);

SELECT setval('"Publish_id_seq"', (SELECT MAX(id) FROM "Publish"));

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'SEED DATA LOADED SUCCESSFULLY!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Roles: %', (SELECT COUNT(*) FROM "Role");
  RAISE NOTICE 'Users: %', (SELECT COUNT(*) FROM "User");
  RAISE NOTICE 'Working Hours: %', (SELECT COUNT(*) FROM "WorkingHours");
  RAISE NOTICE 'Diets: %', (SELECT COUNT(*) FROM "Diet");
  RAISE NOTICE 'Themes: %', (SELECT COUNT(*) FROM "Theme");
  RAISE NOTICE 'Allergens: %', (SELECT COUNT(*) FROM "Allergen");
  RAISE NOTICE 'Menus: %', (SELECT COUNT(*) FROM "Menu");
  RAISE NOTICE 'Dishes: %', (SELECT COUNT(*) FROM "Dish");
  RAISE NOTICE 'Orders: %', (SELECT COUNT(*) FROM "Order");
  RAISE NOTICE 'Reviews (Publish): %', (SELECT COUNT(*) FROM "Publish");
  RAISE NOTICE '========================================';
END $$;
