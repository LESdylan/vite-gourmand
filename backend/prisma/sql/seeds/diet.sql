INSERT INTO "Diet" ("name", "description") VALUES
    ('Classique',   'Menu traditionnel sans restriction'),
    ('Végétarien',  'Sans viande ni poisson'),
    ('Végan',       'Aucun produit d''origine animale'),
    ('Sans Gluten', 'Adapté aux intolérants au gluten'),
    ('Halal',       'Conforme aux prescriptions alimentaires islamiques'),
    ('Casher',      'Conforme aux prescriptions alimentaires juives')
ON CONFLICT ("name") DO NOTHING;
