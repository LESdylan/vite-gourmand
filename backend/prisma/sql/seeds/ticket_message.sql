INSERT INTO "TicketMessage" ("ticket_id", "user_id", "body", "is_internal") VALUES
    (1, (SELECT "id" FROM "User" WHERE "email"='bob@example.fr'),        'La livraison avait 30 minutes de retard.',                       FALSE),
    (1, (SELECT "id" FROM "User" WHERE "email"='pierre@vitegourmand.fr'),'Nous nous excusons. Un geste commercial sera appliqué.',          FALSE),
    (1, (SELECT "id" FROM "User" WHERE "email"='pierre@vitegourmand.fr'),'Note interne: vérifier le livreur assigné à cette zone.',        TRUE),
    (2, (SELECT "id" FROM "User" WHERE "email"='claire@example.fr'),     'Suite à mon annulation, je souhaite un remboursement complet.',  FALSE),
    (2, (SELECT "id" FROM "User" WHERE "email"='sophie@vitegourmand.fr'),'Demande transmise au service comptabilité.',                     FALSE);
