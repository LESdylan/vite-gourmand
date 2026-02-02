# 🧪 CLI Security Test Suite

Suite de tests interactifs en ligne de commande pour valider la sécurité et la fiabilité des validations.

## Architecture

```
cli_test/
├── index.ts              # Point d'entrée CLI interactif
├── runner.ts             # Moteur d'exécution des tests
├── validators/           # Logique de validation pure
│   ├── index.ts
│   ├── email.validator.ts      # RFC 5322 compliant
│   ├── phone.validator.ts      # E.164 format
│   ├── credit-card.validator.ts # Algorithme de Luhn
│   └── password.validator.ts   # Force du mot de passe
├── tests/                # Modules de tests
│   ├── base.test.ts            # Classe de base abstraite
│   ├── first-time-registration.test.ts
│   ├── reset-password.test.ts
│   ├── verify-credit-card.test.ts
│   ├── quick-connection.test.ts
│   ├── email-validation.test.ts
│   ├── password-strength.test.ts
│   └── db-mail-connection.test.ts
├── fuzzy/                # Tests de fuzzing
│   ├── fuzzer.ts               # Générateur de données aléatoires
│   └── strategies.ts           # Stratégies de mutation
└── utils/
    ├── logger.ts               # Affichage coloré terminal
    └── test-data.ts            # Données de test
```

## Utilisation

```bash
# Mode interactif
npx ts-node test/cli_test/index.ts

# Exécuter un test spécifique
npx ts-node test/cli_test/index.ts --test email_validation

# Exécuter tous les tests
npx ts-node test/cli_test/index.ts --all

# Mode fuzzing (100 itérations)
npx ts-node test/cli_test/index.ts --fuzzy --iterations 100
```

## Tests disponibles

| Test | Description |
|------|-------------|
| `first_time_registration` | Simule une première inscription |
| `reset_password` | Test du flux de reset mot de passe |
| `verif_credit_card` | Validation carte bancaire (Luhn) |
| `quick_connection` | Connexion rapide Google OAuth |
| `email_validation` | Validation format email RFC 5322 |
| `password_strength` | Test de force du mot de passe |
| `db_mail_connection` | Test connexion DB et mail |

## Extensibilité

Pour ajouter un nouveau test:

1. Créer `tests/mon-nouveau-test.test.ts`
2. Étendre `BaseTest`
3. Implémenter `run()` et `fuzzyRun()`
4. Ajouter au registre dans `runner.ts`

```typescript
import { BaseTest, TestResult } from './base.test';

export class MonNouveauTest extends BaseTest {
  name = 'mon_nouveau_test';
  description = 'Description du test';

  async run(): Promise<TestResult> {
    // Logique de test
    return this.success('Test réussi');
  }

  async fuzzyRun(iterations: number): Promise<TestResult[]> {
    // Logique de fuzzing
  }
}
```
