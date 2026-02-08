-- Menus reference diet(1-6), theme(1-10), created_by user(2=josé)
INSERT INTO "Menu" ("title","description","conditions","person_min","price_per_person","remaining_qty","status","diet_id","theme_id","created_by","published_at") VALUES
    ('Menu Prestige Mariage','Notre menu signature pour les mariages','Commander 14j avant. Matériel prêté.',50,85.00,10,'published',1,1,2,NOW()),
    ('Menu Végétarien Élégant','Alternative végétarienne raffinée','Commander 7j avant.',20,65.00,15,'published',2,1,2,NOW()),
    ('Cocktail Entreprise','Assortiment de canapés et mignardises','Commander 7j avant. Minimum 30 personnes.',30,45.00,20,'published',1,4,2,NOW()),
    ('Brunch Dominical','Formule brunch complète','Commander 5j avant.',15,35.00,25,'published',1,8,2,NOW()),
    ('Menu Gastronomique','Expérience culinaire 5 services','Commander 21j avant. Matériel prêté.',10,120.00,8,'published',1,6,2,NOW()),
    ('Barbecue Festif','Viandes grillées, salades, desserts','Commander 7j avant.',25,40.00,18,'published',1,7,2,NOW()),
    ('Menu Végan Découverte','100% végétal, saveurs du monde','Commander 7j avant.',15,55.00,12,'published',3,5,3,NOW()),
    ('Menu Noël Traditionnel','Repas de fêtes traditionnel français','Commander 14j avant.',20,95.00,10,'published',1,9,2,NOW()),
    ('Menu Pâques','Repas de Pâques printanier','Commander 10j avant.',15,75.00,15,'published',1,10,2,NOW()),
    ('Menu Brouillon Test','Menu en cours de préparation',NULL,10,50.00,5,'draft',1,2,2,NULL);
