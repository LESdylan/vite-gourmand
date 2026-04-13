-- 006_menus.sql
-- 35 menus across various categories

INSERT INTO public.menus (id, title, description, conditions, person_min, price_per_person, remaining_qty, status, diet_id, theme_id, created_by, is_seasonal, available_from, available_until, published_at) VALUES
  -- Original menus (10)
  ('mn000000-0000-0000-0000-000000000001', 'Menu Prestige Mariage', 'Notre menu signature pour célébrer votre union', 'Service à l''assiette, maître d''hôtel inclus', 50, 95.00, NULL, 'published', 'di000000-0000-0000-0000-000000000001', 'th000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', false, NULL, NULL, now()),
  ('mn000000-0000-0000-0000-000000000002', 'Menu Cocktail Entreprise', 'Cocktail dînatoire pour vos événements professionnels', 'Pièces cocktail, verrines et mignardises', 20, 55.00, NULL, 'published', 'di000000-0000-0000-0000-000000000001', 'th000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000002', false, NULL, NULL, now()),
  ('mn000000-0000-0000-0000-000000000003', 'Menu Anniversaire Festif', 'Un menu joyeux pour marquer le coup', 'Buffet libre-service avec animation', 15, 45.00, NULL, 'published', 'di000000-0000-0000-0000-000000000001', 'th000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000003', false, NULL, NULL, now()),
  ('mn000000-0000-0000-0000-000000000004', 'Menu Végétarien Gourmand', 'Saveurs végétales raffinées', 'Cuisine 100% végétarienne, produits bio', 10, 42.00, NULL, 'published', 'di000000-0000-0000-0000-000000000002', 'th000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000004', false, NULL, NULL, now()),
  ('mn000000-0000-0000-0000-000000000005', 'Menu Barbecue Estival', 'Grillades et ambiance conviviale en plein air', 'Cuisson au feu de bois, marinades maison', 20, 38.00, NULL, 'published', 'di000000-0000-0000-0000-000000000001', 'th000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000004', true, '2026-06-01', '2026-09-30', now()),
  ('mn000000-0000-0000-0000-000000000006', 'Menu Brunch Dominical', 'Un brunch généreux mêlant sucré et salé', 'Service en buffet, boissons chaudes incluses', 10, 32.00, 50, 'published', 'di000000-0000-0000-0000-000000000001', 'th000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000005', false, NULL, NULL, now()),
  ('mn000000-0000-0000-0000-000000000007', 'Menu Gastronomique 5 services', 'Expérience culinaire d''exception', 'Accord mets-vins sur demande', 2, 120.00, 30, 'published', 'di000000-0000-0000-0000-000000000001', 'th000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000002', false, NULL, NULL, now()),
  ('mn000000-0000-0000-0000-000000000008', 'Menu Noël Traditionnel', 'Les saveurs de Noël autour d''un repas convivial', 'Décoration de table incluse', 8, 75.00, NULL, 'published', 'di000000-0000-0000-0000-000000000001', 'th000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000002', true, '2026-12-01', '2026-12-31', now()),
  ('mn000000-0000-0000-0000-000000000009', 'Menu Baptême Douceur', 'Un menu délicat pour un jour spécial', 'Service traiteur complet', 15, 48.00, NULL, 'published', 'di000000-0000-0000-0000-000000000001', 'th000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000003', false, NULL, NULL, now()),
  ('mn000000-0000-0000-0000-00000000000a', 'Menu Sans Gluten Découverte', 'Saveurs sans compromis, sans gluten', 'Cuisine dédiée sans traces de gluten', 5, 50.00, NULL, 'published', 'di000000-0000-0000-0000-000000000004', 'th000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000004', false, NULL, NULL, now()),
  -- French classics (5)
  ('mn000000-0000-0000-0000-00000000000b', 'Menu Terroir Bordelais', 'Le meilleur du Sud-Ouest à votre table', 'Producteurs locaux, circuit court', 10, 58.00, NULL, 'published', 'di000000-0000-0000-0000-000000000001', 'th000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000002', false, NULL, NULL, now()),
  ('mn000000-0000-0000-0000-00000000000c', 'Menu Bistrot Chic', 'La cuisine de bistrot revisitée avec élégance', NULL, 8, 40.00, NULL, 'published', 'di000000-0000-0000-0000-000000000001', 'th000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000004', false, NULL, NULL, now()),
  ('mn000000-0000-0000-0000-00000000000d', 'Menu Fruits de Mer', 'Plateau royal et accords marins', 'Produits frais du jour', 6, 85.00, 20, 'published', 'di000000-0000-0000-0000-000000000001', 'th000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000002', false, NULL, NULL, now()),
  ('mn000000-0000-0000-0000-00000000000e', 'Menu Canard sous toutes ses formes', 'Hommage au canard du Sud-Ouest', NULL, 10, 62.00, NULL, 'published', 'di000000-0000-0000-0000-000000000001', 'th000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000002', false, NULL, NULL, now()),
  ('mn000000-0000-0000-0000-00000000000f', 'Menu Printanier', 'Légumes nouveaux et saveurs fraîches', NULL, 8, 44.00, NULL, 'published', 'di000000-0000-0000-0000-000000000002', 'th000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000004', true, '2026-03-20', '2026-06-21', now()),
  -- Mediterranean (5)
  ('mn000000-0000-0000-0000-000000000010', 'Menu Méditerranéen', 'Soleil et saveurs de la Méditerranée', 'Huile d''olive première pression', 10, 46.00, NULL, 'published', 'di000000-0000-0000-0000-000000000001', 'th000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000004', false, NULL, NULL, now()),
  ('mn000000-0000-0000-0000-000000000011', 'Menu Orientalisant', 'Épices et douceurs d''Orient', NULL, 12, 42.00, NULL, 'published', 'di000000-0000-0000-0000-000000000005', 'th000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000004', false, NULL, NULL, now()),
  ('mn000000-0000-0000-0000-000000000012', 'Menu Grec Festif', 'Mezze, grillades et ouzo', NULL, 15, 38.00, NULL, 'published', 'di000000-0000-0000-0000-000000000001', 'th000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000005', false, NULL, NULL, now()),
  ('mn000000-0000-0000-0000-000000000013', 'Menu Provençal', 'Les saveurs de la Provence', NULL, 8, 48.00, NULL, 'published', 'di000000-0000-0000-0000-000000000001', 'th000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000002', false, NULL, NULL, now()),
  ('mn000000-0000-0000-0000-000000000014', 'Menu Tapas Party', 'Partage et convivialité à l''espagnole', NULL, 10, 35.00, NULL, 'published', 'di000000-0000-0000-0000-000000000001', 'th000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000005', false, NULL, NULL, now()),
  -- Asian fusion (5)
  ('mn000000-0000-0000-0000-000000000015', 'Menu Fusion Asiatique', 'Voyage culinaire à travers l''Asie', NULL, 8, 52.00, NULL, 'published', 'di000000-0000-0000-0000-000000000001', 'th000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000004', false, NULL, NULL, now()),
  ('mn000000-0000-0000-0000-000000000016', 'Menu Sushi Premium', 'Assortiment de sushis et sashimis', 'Poissons du jour, wasabi frais', 4, 65.00, 25, 'published', 'di000000-0000-0000-0000-000000000001', 'th000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000004', false, NULL, NULL, now()),
  ('mn000000-0000-0000-0000-000000000017', 'Menu Thaï Épicé', 'Saveurs thaïlandaises authentiques', NULL, 8, 40.00, NULL, 'published', 'di000000-0000-0000-0000-000000000001', 'th000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000005', false, NULL, NULL, now()),
  ('mn000000-0000-0000-0000-000000000018', 'Menu Dim Sum', 'Raviolis vapeur et petites bouchées', NULL, 6, 38.00, NULL, 'published', 'di000000-0000-0000-0000-000000000001', 'th000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000005', false, NULL, NULL, now()),
  ('mn000000-0000-0000-0000-000000000019', 'Menu Végan Asiatique', 'Cuisine végétalienne d''inspiration asiatique', NULL, 6, 42.00, NULL, 'published', 'di000000-0000-0000-0000-000000000003', 'th000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000004', false, NULL, NULL, now()),
  -- Special occasions (5)
  ('mn000000-0000-0000-0000-00000000001a', 'Menu Pâques Gourmand', 'Agneau pascal et chocolats de saison', NULL, 10, 65.00, NULL, 'published', 'di000000-0000-0000-0000-000000000001', 'th000000-0000-0000-0000-00000000000a', 'a0000000-0000-0000-0000-000000000002', true, '2026-03-15', '2026-04-15', now()),
  ('mn000000-0000-0000-0000-00000000001b', 'Menu Saint-Valentin', 'Dîner romantique pour deux', NULL, 2, 85.00, 20, 'published', 'di000000-0000-0000-0000-000000000001', 'th000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000003', true, '2026-02-01', '2026-02-28', now()),
  ('mn000000-0000-0000-0000-00000000001c', 'Menu Fête des Mères', 'Gâtez votre maman', NULL, 4, 58.00, NULL, 'published', 'di000000-0000-0000-0000-000000000001', 'th000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000003', true, '2026-05-15', '2026-06-01', now()),
  ('mn000000-0000-0000-0000-00000000001d', 'Menu Réveillon du Nouvel An', 'Finissez l''année en beauté', 'Champagne et cotillons inclus', 20, 110.00, NULL, 'published', 'di000000-0000-0000-0000-000000000001', 'th000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000002', true, '2026-12-28', '2027-01-01', now()),
  ('mn000000-0000-0000-0000-00000000001e', 'Menu Communion', 'Premier sacrement, premier festin', NULL, 15, 52.00, NULL, 'published', 'di000000-0000-0000-0000-000000000001', 'th000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000003', false, NULL, NULL, now()),
  -- Healthy/diet (5)
  ('mn000000-0000-0000-0000-00000000001f', 'Menu Detox Vitalité', 'Légèreté et énergie au rendez-vous', 'Ingrédients bio et de saison', 4, 36.00, NULL, 'published', 'di000000-0000-0000-0000-000000000003', 'th000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000004', false, NULL, NULL, now()),
  ('mn000000-0000-0000-0000-000000000020', 'Menu Protéiné Sport', 'Nutrition optimale pour sportifs', NULL, 4, 40.00, NULL, 'published', 'di000000-0000-0000-0000-000000000001', 'th000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000005', false, NULL, NULL, now()),
  ('mn000000-0000-0000-0000-000000000021', 'Menu Casher Tradition', 'Respect des traditions casher', 'Cuisine sous surveillance rabbinique', 10, 55.00, NULL, 'published', 'di000000-0000-0000-0000-000000000006', 'th000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000002', false, NULL, NULL, now()),
  ('mn000000-0000-0000-0000-000000000022', 'Menu Halal Premium', 'Viandes halal de qualité supérieure', 'Fournisseurs certifiés halal', 10, 52.00, NULL, 'published', 'di000000-0000-0000-0000-000000000005', 'th000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000002', false, NULL, NULL, now()),
  -- Draft menu (1)
  ('mn000000-0000-0000-0000-000000000023', 'Menu Brouillon Test', 'Menu en cours de création (brouillon)', NULL, 5, 30.00, NULL, 'draft', 'di000000-0000-0000-0000-000000000001', NULL, 'a0000000-0000-0000-0000-000000000004', false, NULL, NULL, NULL)
ON CONFLICT (id) DO NOTHING;

-- Link dishes to menus (sample M:N)
INSERT INTO public.menu_dishes (menu_id, dish_id) VALUES
  -- Prestige Mariage gets foie gras + rossini + fondant
  ('mn000000-0000-0000-0000-000000000001', 'ds000000-0000-0000-0000-000000000001'),
  ('mn000000-0000-0000-0000-000000000001', 'ds000000-0000-0000-0000-000000000006'),
  ('mn000000-0000-0000-0000-000000000001', 'ds000000-0000-0000-0000-000000000010'),
  -- Cocktail Entreprise
  ('mn000000-0000-0000-0000-000000000002', 'ds000000-0000-0000-0000-000000000002'),
  ('mn000000-0000-0000-0000-000000000002', 'ds000000-0000-0000-0000-000000000005'),
  -- Gastronomique gets all premium
  ('mn000000-0000-0000-0000-000000000007', 'ds000000-0000-0000-0000-000000000001'),
  ('mn000000-0000-0000-0000-000000000007', 'ds000000-0000-0000-0000-000000000007'),
  ('mn000000-0000-0000-0000-000000000007', 'ds000000-0000-0000-0000-000000000014'),
  -- Végétarien gets ratatouille + tartare tomates
  ('mn000000-0000-0000-0000-000000000004', 'ds000000-0000-0000-0000-000000000005'),
  ('mn000000-0000-0000-0000-000000000004', 'ds000000-0000-0000-0000-00000000000b'),
  ('mn000000-0000-0000-0000-000000000004', 'ds000000-0000-0000-0000-000000000013'),
  -- Noël
  ('mn000000-0000-0000-0000-000000000008', 'ds000000-0000-0000-0000-000000000001'),
  ('mn000000-0000-0000-0000-000000000008', 'ds000000-0000-0000-0000-00000000000d'),
  ('mn000000-0000-0000-0000-000000000008', 'ds000000-0000-0000-0000-000000000012'),
  -- Terroir Bordelais
  ('mn000000-0000-0000-0000-00000000000b', 'ds000000-0000-0000-0000-000000000009'),
  ('mn000000-0000-0000-0000-00000000000b', 'ds000000-0000-0000-0000-000000000011')
ON CONFLICT DO NOTHING;

-- ─── MENU IMAGES ─────────────────────────────────────────────────
INSERT INTO public.menu_images (id, menu_id, image_url, alt_text, display_order, is_primary)
VALUES
  -- Découverte
  ('mi000000-0000-0000-0000-000000000001', 'mn000000-0000-0000-0000-000000000001',
   '/images/menus/decouverte-hero.webp', 'Menu Découverte – présentation', 0, true),
  -- Gastronomique
  ('mi000000-0000-0000-0000-000000000002', 'mn000000-0000-0000-0000-000000000002',
   '/images/menus/gastronomique-hero.webp', 'Menu Gastronomique – vue d''ensemble', 0, true),
  -- Végétarien
  ('mi000000-0000-0000-0000-000000000003', 'mn000000-0000-0000-0000-000000000003',
   '/images/menus/vegetarien-hero.webp', 'Menu Végétarien – légumes de saison', 0, true),
  -- Terre & Mer
  ('mi000000-0000-0000-0000-000000000004', 'mn000000-0000-0000-0000-000000000004',
   '/images/menus/terre-mer-hero.webp', 'Menu Terre & Mer – homard et bœuf', 0, true),
  -- Noël
  ('mi000000-0000-0000-0000-000000000005', 'mn000000-0000-0000-0000-000000000008',
   '/images/menus/noel-hero.webp', 'Menu de Noël – table festive', 0, true),
  -- Terroir Bordelais
  ('mi000000-0000-0000-0000-000000000006', 'mn000000-0000-0000-0000-00000000000b',
   '/images/menus/terroir-bordelais-hero.webp', 'Menu Terroir Bordelais – spécialités', 0, true)
ON CONFLICT DO NOTHING;

-- ─── MENU INGREDIENTS (aggregate per person) ─────────────────────
INSERT INTO public.menu_ingredients (menu_id, ingredient_id, quantity_per_person)
VALUES
  -- Découverte (Velouté + Risotto + Crème Brûlée)
  ('mn000000-0000-0000-0000-000000000001', 'ig000000-0000-0000-0000-000000000003', 0.450),  -- Champignons
  ('mn000000-0000-0000-0000-000000000001', 'ig000000-0000-0000-0000-00000000000a', 0.300),  -- Crème Fraîche
  ('mn000000-0000-0000-0000-000000000001', 'ig000000-0000-0000-0000-000000000009', 0.200),  -- Riz Arborio
  ('mn000000-0000-0000-0000-000000000001', 'ig000000-0000-0000-0000-000000000006', 0.060),  -- Beurre
  ('mn000000-0000-0000-0000-000000000001', 'ig000000-0000-0000-0000-000000000004', 4.000),  -- Œufs
  -- Gastronomique (Foie Gras + Bœuf Rossini + Fondant)
  ('mn000000-0000-0000-0000-000000000002', 'ig000000-0000-0000-0000-000000000001', 0.280),  -- Foie Gras
  ('mn000000-0000-0000-0000-000000000002', 'ig000000-0000-0000-0000-000000000002', 0.250),  -- Filet de Bœuf
  ('mn000000-0000-0000-0000-000000000002', 'ig000000-0000-0000-0000-00000000000b', 0.200),  -- Chocolat noir
  ('mn000000-0000-0000-0000-000000000002', 'ig000000-0000-0000-0000-000000000006', 0.200),  -- Beurre
  ('mn000000-0000-0000-0000-000000000002', 'ig000000-0000-0000-0000-000000000004', 3.000),  -- Œufs
  -- Terre & Mer (Carpaccio + Homard + Ratatouille + Pavlova)
  ('mn000000-0000-0000-0000-000000000004', 'ig000000-0000-0000-0000-000000000008', 0.180),  -- Saumon
  ('mn000000-0000-0000-0000-000000000004', 'ig000000-0000-0000-0000-000000000007', 0.500),  -- Homard
  ('mn000000-0000-0000-0000-000000000004', 'ig000000-0000-0000-0000-00000000000d', 0.200),  -- Tomates
  ('mn000000-0000-0000-0000-000000000004', 'ig000000-0000-0000-0000-00000000000e', 0.200),  -- Courgettes
  ('mn000000-0000-0000-0000-000000000004', 'ig000000-0000-0000-0000-00000000000c', 0.200)   -- Framboises
ON CONFLICT DO NOTHING;
