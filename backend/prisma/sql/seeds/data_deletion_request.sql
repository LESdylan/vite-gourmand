INSERT INTO "DataDeletionRequest" ("user_id", "reason", "status") VALUES
    ((SELECT "id" FROM "User" WHERE "email"='claire@example.fr'), 'Je ne souhaite plus utiliser la plateforme.', 'pending');
