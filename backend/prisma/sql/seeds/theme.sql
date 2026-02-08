INSERT INTO "Theme" ("name", "description") VALUES
    ('Noël',          'Menus festifs pour les fêtes de fin d''année'),
    ('Pâques',        'Menus printaniers et chocolatés'),
    ('Classique',     'Menus intemporels pour toute occasion'),
    ('Événement',     'Menus personnalisés pour événements spéciaux'),
    ('Mariage',       'Menus raffinés pour le plus beau jour'),
    ('Anniversaire',  'Menus festifs pour célébrer un anniversaire'),
    ('Entreprise',    'Menus professionnels pour séminaires et réunions'),
    ('Barbecue',      'Grillades et ambiance décontractée'),
    ('Brunch',        'Formules matinales sucrées et salées'),
    ('Gastronomique', 'Expérience culinaire haut de gamme')
ON CONFLICT ("name") DO NOTHING;
