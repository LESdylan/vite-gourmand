-- 004_reference_data.sql
-- Allergens (EU 1169/2011), diets, themes, ingredients

-- ─── ALLERGENS (14) ──────────────────────────────────────────────
INSERT INTO public.allergens (id, name, icon_url) VALUES
  ('al000000-0000-0000-0000-000000000001', 'Gluten', '/icons/allergens/gluten.svg'),
  ('al000000-0000-0000-0000-000000000002', 'Crustacés', '/icons/allergens/crustaces.svg'),
  ('al000000-0000-0000-0000-000000000003', 'Œufs', '/icons/allergens/oeufs.svg'),
  ('al000000-0000-0000-0000-000000000004', 'Poissons', '/icons/allergens/poissons.svg'),
  ('al000000-0000-0000-0000-000000000005', 'Arachides', '/icons/allergens/arachides.svg'),
  ('al000000-0000-0000-0000-000000000006', 'Soja', '/icons/allergens/soja.svg'),
  ('al000000-0000-0000-0000-000000000007', 'Lait', '/icons/allergens/lait.svg'),
  ('al000000-0000-0000-0000-000000000008', 'Fruits à coque', '/icons/allergens/fruits-coque.svg'),
  ('al000000-0000-0000-0000-000000000009', 'Céleri', '/icons/allergens/celeri.svg'),
  ('al000000-0000-0000-0000-00000000000a', 'Moutarde', '/icons/allergens/moutarde.svg'),
  ('al000000-0000-0000-0000-00000000000b', 'Graines de sésame', '/icons/allergens/sesame.svg'),
  ('al000000-0000-0000-0000-00000000000c', 'Anhydride sulfureux et sulfites', '/icons/allergens/sulfites.svg'),
  ('al000000-0000-0000-0000-00000000000d', 'Lupin', '/icons/allergens/lupin.svg'),
  ('al000000-0000-0000-0000-00000000000e', 'Mollusques', '/icons/allergens/mollusques.svg')
ON CONFLICT (name) DO NOTHING;

-- ─── DIETS (6) ───────────────────────────────────────────────────
INSERT INTO public.diets (id, name, description, icon_url) VALUES
  ('di000000-0000-0000-0000-000000000001', 'Classique', 'Menu traditionnel sans restriction', '/icons/diets/classique.svg'),
  ('di000000-0000-0000-0000-000000000002', 'Végétarien', 'Sans viande ni poisson', '/icons/diets/vegetarien.svg'),
  ('di000000-0000-0000-0000-000000000003', 'Végan', 'Sans aucun produit d''origine animale', '/icons/diets/vegan.svg'),
  ('di000000-0000-0000-0000-000000000004', 'Sans Gluten', 'Adapté aux personnes intolérantes au gluten', '/icons/diets/sans-gluten.svg'),
  ('di000000-0000-0000-0000-000000000005', 'Halal', 'Préparé selon les règles halal', '/icons/diets/halal.svg'),
  ('di000000-0000-0000-0000-000000000006', 'Casher', 'Préparé selon les règles casher', '/icons/diets/casher.svg')
ON CONFLICT (name) DO NOTHING;

-- ─── THEMES (10) ─────────────────────────────────────────────────
INSERT INTO public.themes (id, name, description, icon_url) VALUES
  ('th000000-0000-0000-0000-000000000001', 'Mariage', 'Menus de réception de mariage', '/icons/themes/mariage.svg'),
  ('th000000-0000-0000-0000-000000000002', 'Anniversaire', 'Menus festifs pour anniversaires', '/icons/themes/anniversaire.svg'),
  ('th000000-0000-0000-0000-000000000003', 'Baptême', 'Menus pour cérémonies de baptême', '/icons/themes/bapteme.svg'),
  ('th000000-0000-0000-0000-000000000004', 'Entreprise', 'Traiteur d''entreprise et séminaires', '/icons/themes/entreprise.svg'),
  ('th000000-0000-0000-0000-000000000005', 'Cocktail', 'Buffets et cocktails dînatoires', '/icons/themes/cocktail.svg'),
  ('th000000-0000-0000-0000-000000000006', 'Gastronomique', 'Menus gastronomiques haut de gamme', '/icons/themes/gastronomique.svg'),
  ('th000000-0000-0000-0000-000000000007', 'Barbecue', 'Grillades et ambiance conviviale', '/icons/themes/barbecue.svg'),
  ('th000000-0000-0000-0000-000000000008', 'Brunch', 'Formules brunch sucrées et salées', '/icons/themes/brunch.svg'),
  ('th000000-0000-0000-0000-000000000009', 'Noël', 'Menus spéciaux fêtes de fin d''année', '/icons/themes/noel.svg'),
  ('th000000-0000-0000-0000-00000000000a', 'Pâques', 'Menus de Pâques traditionnels', '/icons/themes/paques.svg')
ON CONFLICT (name) DO NOTHING;

-- ─── INGREDIENTS (15) ────────────────────────────────────────────
INSERT INTO public.ingredients (id, name, unit, current_stock, min_stock_level, cost_per_unit) VALUES
  ('ig000000-0000-0000-0000-000000000001', 'Foie Gras', 'kg', 5.000, 2.000, 85.00),
  ('ig000000-0000-0000-0000-000000000002', 'Filet de Bœuf', 'kg', 10.000, 3.000, 45.00),
  ('ig000000-0000-0000-0000-000000000003', 'Champignons', 'kg', 8.000, 2.000, 12.00),
  ('ig000000-0000-0000-0000-000000000004', 'Œufs', 'unité', 120.000, 30.000, 0.35),
  ('ig000000-0000-0000-0000-000000000005', 'Farine', 'kg', 25.000, 5.000, 1.20),
  ('ig000000-0000-0000-0000-000000000006', 'Beurre', 'kg', 10.000, 3.000, 8.50),
  ('ig000000-0000-0000-0000-000000000007', 'Homard', 'kg', 3.000, 1.000, 55.00),
  ('ig000000-0000-0000-0000-000000000008', 'Saumon', 'kg', 6.000, 2.000, 25.00),
  ('ig000000-0000-0000-0000-000000000009', 'Riz Arborio', 'kg', 15.000, 3.000, 4.50),
  ('ig000000-0000-0000-0000-00000000000a', 'Crème Fraîche', 'L', 12.000, 4.000, 3.80),
  ('ig000000-0000-0000-0000-00000000000b', 'Chocolat noir', 'kg', 8.000, 2.000, 15.00),
  ('ig000000-0000-0000-0000-00000000000c', 'Framboises', 'kg', 4.000, 1.000, 22.00),
  ('ig000000-0000-0000-0000-00000000000d', 'Tomates', 'kg', 15.000, 4.000, 3.50),
  ('ig000000-0000-0000-0000-00000000000e', 'Courgettes', 'kg', 10.000, 3.000, 2.80),
  ('ig000000-0000-0000-0000-00000000000f', 'Pommes', 'kg', 12.000, 4.000, 2.50)
ON CONFLICT (name) DO NOTHING;
