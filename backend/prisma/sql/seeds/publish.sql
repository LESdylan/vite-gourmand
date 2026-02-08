INSERT INTO "Publish" ("user_id", "order_id", "note", "description", "status") VALUES
    ((SELECT "id" FROM "User" WHERE "email"='alice@example.fr'),  1, '5', 'Service impeccable pour notre mariage ! Tous les invités ont adoré.',                 'approved'),
    ((SELECT "id" FROM "User" WHERE "email"='bob@example.fr'),    2, '4', 'Très bon rapport qualité-prix. Livraison ponctuelle.',                                 'approved'),
    ((SELECT "id" FROM "User" WHERE "email"='david@example.fr'),  NULL, '5', 'Le brunch était parfait, tout le monde s''est régalé !',                            'approved'),
    ((SELECT "id" FROM "User" WHERE "email"='alice@example.fr'),  NULL, '5', 'Menu gastronomique exceptionnel, digne d''un restaurant étoilé.',                   'approved'),
    ((SELECT "id" FROM "User" WHERE "email"='claire@example.fr'), NULL, '3', 'Bon service mais livraison un peu en retard.',                                      'pending'),
    ((SELECT "id" FROM "User" WHERE "email"='bob@example.fr'),    NULL, '4', 'Cocktail entreprise réussi, collègues ravis.',                                      'pending'),
    ((SELECT "id" FROM "User" WHERE "email"='david@example.fr'),  NULL, '2', 'Qualité en dessous de mes attentes pour le prix.',                                  'rejected'),
    ((SELECT "id" FROM "User" WHERE "email"='alice@example.fr'),  NULL, '5', 'Troisième commande et toujours au top !',                                           'approved'),
    ((SELECT "id" FROM "User" WHERE "email"='claire@example.fr'), NULL, '4', 'Belle présentation, saveurs au rendez-vous.',                                       'pending'),
    ((SELECT "id" FROM "User" WHERE "email"='bob@example.fr'),    NULL, '5', 'Le barbecue festif a fait l''unanimité. On recommande vivement.',                   'approved');
