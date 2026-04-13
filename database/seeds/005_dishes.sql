-- 005_dishes.sql
-- 20 dishes: 5 entrées, 10 plats, 5 desserts

INSERT INTO public.dishes (id, title, description, photo_url, course_type) VALUES
  -- Entrées
  ('ds000000-0000-0000-0000-000000000001', 'Foie Gras mi-cuit', 'Foie gras de canard mi-cuit, chutney de figues et pain d''épices toasté', NULL, 'entree'),
  ('ds000000-0000-0000-0000-000000000002', 'Carpaccio de Saumon', 'Fines tranches de saumon frais, câpres, aneth et citron vert', NULL, 'entree'),
  ('ds000000-0000-0000-0000-000000000003', 'Velouté de Champignons', 'Velouté onctueux aux champignons des bois, crème de truffe', NULL, 'entree'),
  ('ds000000-0000-0000-0000-000000000004', 'Salade Niçoise revisitée', 'Thon rouge mi-cuit, œuf mollet, olives de Nice et vinaigrette basilic', NULL, 'entree'),
  ('ds000000-0000-0000-0000-000000000005', 'Tartare de Tomates anciennes', 'Tomates multicolores, burrata crémeuse, pesto maison', NULL, 'entree'),
  -- Plats
  ('ds000000-0000-0000-0000-000000000006', 'Filet de Bœuf Rossini', 'Filet de bœuf, escalope de foie gras poêlée, sauce Périgueux', NULL, 'plat'),
  ('ds000000-0000-0000-0000-000000000007', 'Homard Thermidor', 'Demi-homard gratiné, sauce crémée au cognac et moutarde', NULL, 'plat'),
  ('ds000000-0000-0000-0000-000000000008', 'Risotto aux Champignons', 'Risotto crémeux aux cèpes et parmigiano reggiano 24 mois', NULL, 'plat'),
  ('ds000000-0000-0000-0000-000000000009', 'Magret de Canard', 'Magret de canard laqué au miel, légumes de saison rôtis', NULL, 'plat'),
  ('ds000000-0000-0000-0000-00000000000a', 'Pavé de Saumon', 'Pavé de saumon grillé, écrasé de pommes de terre, beurre blanc', NULL, 'plat'),
  ('ds000000-0000-0000-0000-00000000000b', 'Ratatouille Provençale', 'Tian de légumes du soleil, coulis de tomates fraîches', NULL, 'plat'),
  ('ds000000-0000-0000-0000-00000000000c', 'Blanquette de Veau', 'Blanquette traditionnelle, riz pilaf et légumes primeurs', NULL, 'plat'),
  ('ds000000-0000-0000-0000-00000000000d', 'Suprême de Volaille', 'Suprême de volaille fermière, jus au thym, gratin dauphinois', NULL, 'plat'),
  ('ds000000-0000-0000-0000-00000000000e', 'Tagine d''Agneau', 'Épaule d''agneau confite, pruneaux, amandes et semoule parfumée', NULL, 'plat'),
  ('ds000000-0000-0000-0000-00000000000f', 'Lotte rôtie', 'Queue de lotte rôtie, artichauts barigoule, émulsion safranée', NULL, 'plat'),
  -- Desserts
  ('ds000000-0000-0000-0000-000000000010', 'Fondant au Chocolat', 'Fondant au chocolat noir 70%, cœur coulant, glace vanille', NULL, 'dessert'),
  ('ds000000-0000-0000-0000-000000000011', 'Tarte Tatin', 'Tarte Tatin aux pommes caramélisées, crème fraîche d''Isigny', NULL, 'dessert'),
  ('ds000000-0000-0000-0000-000000000012', 'Crème Brûlée', 'Crème brûlée à la vanille de Madagascar', NULL, 'dessert'),
  ('ds000000-0000-0000-0000-000000000013', 'Pavlova Fruits Rouges', 'Meringue croustillante, chantilly mascarpone, fruits rouges frais', NULL, 'dessert'),
  ('ds000000-0000-0000-0000-000000000014', 'Paris-Brest', 'Pâte à choux, crème pralinée noisettes, éclats de praliné', NULL, 'dessert')
ON CONFLICT (id) DO NOTHING;

-- Link allergens to dishes
INSERT INTO public.dish_allergens (dish_id, allergen_id) VALUES
  -- Foie Gras: gluten (toast)
  ('ds000000-0000-0000-0000-000000000001', 'al000000-0000-0000-0000-000000000001'),
  -- Carpaccio Saumon: poissons
  ('ds000000-0000-0000-0000-000000000002', 'al000000-0000-0000-0000-000000000004'),
  -- Velouté: lait
  ('ds000000-0000-0000-0000-000000000003', 'al000000-0000-0000-0000-000000000007'),
  -- Salade Niçoise: œufs, poissons
  ('ds000000-0000-0000-0000-000000000004', 'al000000-0000-0000-0000-000000000003'),
  ('ds000000-0000-0000-0000-000000000004', 'al000000-0000-0000-0000-000000000004'),
  -- Tartare Tomates: lait (burrata)
  ('ds000000-0000-0000-0000-000000000005', 'al000000-0000-0000-0000-000000000007'),
  -- Rossini: gluten
  ('ds000000-0000-0000-0000-000000000006', 'al000000-0000-0000-0000-000000000001'),
  -- Homard: crustacés, lait
  ('ds000000-0000-0000-0000-000000000007', 'al000000-0000-0000-0000-000000000002'),
  ('ds000000-0000-0000-0000-000000000007', 'al000000-0000-0000-0000-000000000007'),
  -- Risotto: lait
  ('ds000000-0000-0000-0000-000000000008', 'al000000-0000-0000-0000-000000000007'),
  -- Saumon: poissons, lait
  ('ds000000-0000-0000-0000-00000000000a', 'al000000-0000-0000-0000-000000000004'),
  ('ds000000-0000-0000-0000-00000000000a', 'al000000-0000-0000-0000-000000000007'),
  -- Blanquette: lait, gluten
  ('ds000000-0000-0000-0000-00000000000c', 'al000000-0000-0000-0000-000000000007'),
  ('ds000000-0000-0000-0000-00000000000c', 'al000000-0000-0000-0000-000000000001'),
  -- Suprême: lait
  ('ds000000-0000-0000-0000-00000000000d', 'al000000-0000-0000-0000-000000000007'),
  -- Tagine: fruits à coque (amandes)
  ('ds000000-0000-0000-0000-00000000000e', 'al000000-0000-0000-0000-000000000008'),
  -- Fondant: œufs, lait, gluten
  ('ds000000-0000-0000-0000-000000000010', 'al000000-0000-0000-0000-000000000003'),
  ('ds000000-0000-0000-0000-000000000010', 'al000000-0000-0000-0000-000000000007'),
  ('ds000000-0000-0000-0000-000000000010', 'al000000-0000-0000-0000-000000000001'),
  -- Tarte Tatin: gluten, lait, œufs
  ('ds000000-0000-0000-0000-000000000011', 'al000000-0000-0000-0000-000000000001'),
  ('ds000000-0000-0000-0000-000000000011', 'al000000-0000-0000-0000-000000000007'),
  ('ds000000-0000-0000-0000-000000000011', 'al000000-0000-0000-0000-000000000003'),
  -- Crème Brûlée: lait, œufs
  ('ds000000-0000-0000-0000-000000000012', 'al000000-0000-0000-0000-000000000007'),
  ('ds000000-0000-0000-0000-000000000012', 'al000000-0000-0000-0000-000000000003'),
  -- Pavlova: œufs, lait
  ('ds000000-0000-0000-0000-000000000013', 'al000000-0000-0000-0000-000000000003'),
  ('ds000000-0000-0000-0000-000000000013', 'al000000-0000-0000-0000-000000000007'),
  -- Paris-Brest: gluten, œufs, lait, fruits à coque
  ('ds000000-0000-0000-0000-000000000014', 'al000000-0000-0000-0000-000000000001'),
  ('ds000000-0000-0000-0000-000000000014', 'al000000-0000-0000-0000-000000000003'),
  ('ds000000-0000-0000-0000-000000000014', 'al000000-0000-0000-0000-000000000007'),
  ('ds000000-0000-0000-0000-000000000014', 'al000000-0000-0000-0000-000000000008')
ON CONFLICT DO NOTHING;
