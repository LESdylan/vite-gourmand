# 🧪 CLI Security Test Suite - Vite Gourmand

Suite de tests interactive en ligne de commande pour valider la sécurité, les validations et les flux utilisateurs.

## 📋 Table des matières

- [Architecture](#-architecture)
- [Installation](#-installation)
- [Mode automatique](#-mode-automatique)
- [Mode interactif manuel](#-mode-interactif-manuel)
- [Validateurs](#-validateurs)
- [Tests disponibles](#-tests-disponibles)
- [Fuzzy Testing](#-fuzzy-testing)
- [Extensibilité](#-extensibilité)

---

## 🏗️ Architecture

```
cli_test/
├── index.ts                      # Point d'entrée CLI (tests automatiques)
├── interactive.ts                # Shell interactif (tests manuels avec DB)
├── runner.ts                     # Moteur d'exécution des tests
├── README.md                     # Cette documentation
│
├── validators/                   # Logique de validation pure
│   ├── index.ts
│   ├── email.validator.ts        # RFC 5322 compliant
│   ├── phone.validator.ts        # E.164 international format
│   ├── credit-card.validator.ts  # Algorithme de Luhn (ISO/IEC 7812)
│   └── password.validator.ts     # Force + entropie + crack time
│
├── tests/                        # Modules de tests automatiques
│   ├── base.test.ts              # Classe abstraite de base
│   ├── email-validation.test.ts
│   ├── verify-credit-card.test.ts
│   ├── password-strength.test.ts
│   ├── first-time-registration.test.ts
│   ├── reset-password.test.ts
│   ├── quick-connection.test.ts
│   └── db-mail-connection.test.ts
│
├── fuzzy/                        # Tests de fuzzing
│   ├── fuzzer.ts                 # Générateur de données aléatoires
│   └── strategies.ts             # Stratégies de mutation
│
└── utils/
    ├── logger.ts                 # Affichage coloré terminal
    └── test-data.ts              # Données de test (fixtures)
```

---

## 🚀 Installation

```bash
cd backend

# Les dépendances sont déjà installées avec le projet
npm install

# S'assurer que la base de données est up
docker compose up -d

# Lancer les migrations
npx prisma migrate dev
```

---

## 🤖 Mode automatique

Le mode automatique exécute les tests de validation sans interaction avec la base de données réelle.

### Commandes principales

```bash
# Afficher l'aide
npx ts-node test/cli_test/index.ts --help

# Lister tous les tests disponibles
npx ts-node test/cli_test/index.ts --list

# Lancer TOUS les tests
npx ts-node test/cli_test/index.ts --all

# Lancer un test spécifique
npx ts-node test/cli_test/index.ts --test email_validation
npx ts-node test/cli_test/index.ts --test verif_credit_card

# Lancer par catégorie
npx ts-node test/cli_test/index.ts --category validation
npx ts-node test/cli_test/index.ts --category flow

# Avec verbose
npx ts-node test/cli_test/index.ts --all --verbose
```

### Avec Fuzzy Testing

```bash
# Tous les tests avec 100 itérations fuzzy
npx ts-node test/cli_test/index.ts --all --fuzzy

# Avec un nombre personnalisé d'itérations
npx ts-node test/cli_test/index.ts --all --fuzzy --iterations 50

# Un seul test avec fuzzy
npx ts-node test/cli_test/index.ts --test verif_credit_card --fuzzy --iterations 200
```

---

## 🎮 Mode interactif manuel

Le mode interactif permet de tester **manuellement** les fonctionnalités avec la vraie base de données.

```bash
npx ts-node test/cli_test/interactive.ts
```

### Fonctionnalités

1. **Inscription utilisateur** - Créer un nouveau compte (vraie DB)
2. **Connexion** - Se connecter avec email/mot de passe
3. **Connexion Google** - Simuler OAuth Google
4. **Reset mot de passe** - Générer token + reset
5. **Valider carte bancaire** - Tester l'algorithme de Luhn
6. **Valider email** - Tester le format RFC 5322
7. **Tester force mot de passe** - Voir le score et suggestions

### ⚠️ Nettoyage automatique

Tous les utilisateurs créés pendant la session interactive sont **automatiquement supprimés** à la sortie du programme (commande `exit`).

### Exemple de session

```
╔═══════════════════════════════════════════════════════════════╗
║        🧪 Vite Gourmand - Shell de Test Interactif            ║
╚═══════════════════════════════════════════════════════════════╝

  [1] 📝 Inscription (register)
  [2] 🔐 Connexion (login)
  [3] 🔑 Connexion Google (oauth)
  [4] 🔄 Reset mot de passe (reset)
  [5] 💳 Valider carte bancaire (card)
  [6] 📧 Valider email (email)
  [7] 🔒 Tester force mot de passe (password)
  [8] 📋 Voir utilisateurs créés (users)
  [9] 🧹 Nettoyer les utilisateurs (clean)
  [0] ❌ Quitter (exit)

> 1

═══ 📝 Inscription d'un nouveau compte ═══

Email: test.user@example.com
Mot de passe: ********
Prénom: Jean
Téléphone: +33612345678
Ville: Paris
Code postal: 75001
Pays: France

✓ Inscription réussie !
  ID: 42
  Email: test.user@example.com
  Rôle: Client

> exit

🧹 Nettoyage des utilisateurs de test...
  ✓ Supprimé: test.user@example.com (ID: 42)

👋 Au revoir !
```

---

## ✅ Validateurs

### Email (RFC 5322)

```typescript
import { EmailValidator } from './validators';

const result = EmailValidator.validate('user@example.com');
// {
//   isValid: true,
//   email: 'user@example.com',
//   normalized: 'user@example.com',
//   parts: { local: 'user', domain: 'example.com', tld: 'com' },
//   errors: []
// }

// Suggestion de correction
EmailValidator.suggestCorrection('user@gmial.com');
// 'user@gmail.com'
```

### Téléphone (E.164)

```typescript
import { PhoneValidator } from './validators';

const result = PhoneValidator.validate('+33612345678', { country: 'FR' });
// {
//   isValid: true,
//   normalized: '+33612345678',
//   countryCode: '+33',
//   nationalNumber: '612345678',
//   format: 'E164'
// }

// Formatage pour affichage
PhoneValidator.formatForDisplay('0612345678', 'FR');
// '06 12 34 56 78'
```

### Carte bancaire (Luhn - ISO/IEC 7812)

```typescript
import { CreditCardValidator } from './validators';

const result = CreditCardValidator.validate('4111111111111111');
// {
//   isValid: true,
//   cardType: 'Visa',
//   issuer: 'Visa Inc.',
//   normalized: '4111111111111111',
//   checkDigit: 1
// }

// Masquage pour affichage
CreditCardValidator.mask('4111111111111111');
// '************1111'

// Formatage
CreditCardValidator.format('4111111111111111');
// '4111 1111 1111 1111'

// Générer une carte de test valide
CreditCardValidator.generateTestCard('Visa');
// '4532015112830366'
```

### Mot de passe (Force + Entropie)

```typescript
import { PasswordValidator } from './validators';

const result = PasswordValidator.validate('MySecureP@ssw0rd!');
// {
//   isValid: true,
//   score: 5,
//   strength: 'very_strong',
//   entropy: 95.2,
//   crackTime: {
//     online: '1 million years',
//     offlineSlow: '1000 years',
//     offlineFast: '1 day'
//   },
//   criteria: {
//     minLength: true,
//     hasLowercase: true,
//     hasUppercase: true,
//     hasNumbers: true,
//     hasSpecialChars: true,
//     noCommonPatterns: true,
//     notInBlacklist: true
//   },
//   suggestions: []
// }

// Générer un mot de passe sécurisé
PasswordValidator.generate(16);
// 'k#Lm9@Np2$Qr5&Ts'
```

---

## 🧪 Tests disponibles

| Test | Description | Catégorie |
|------|-------------|-----------|
| `email_validation` | Validation RFC 5322 (28 cas) | validation |
| `verif_credit_card` | Algorithme de Luhn (23 cas) | validation |
| `password_strength` | Force + entropie (31 cas) | validation |
| `first_time_registration` | Inscription complète | flow |
| `reset_password` | Reset mot de passe | flow |
| `quick_connection` | Google OAuth mock | flow |
| `db_mail_connection` | Connexions DB/SMTP | connection |

### Résultats typiques

```
════════════════════════════════════════════════════════════
  🧪 Running All Tests
════════════════════════════════════════════════════════════

  PASS email_validation          All 28 email validations passed
  PASS verif_credit_card         All 23 credit card validations passed
  PASS password_strength         All 31 password strength tests passed
  PASS first_time_registration   All 13 registration tests passed
  PASS reset_password            All 16 password reset tests passed
  PASS quick_connection          All 28 OAuth tests passed
  PASS db_mail_connection        All 21 connection tests passed

────────────────────────────────────────────────────────────
  Tests:    7 passed, 0 failed, 7 total
  Rate:     100.0%
  Duration: 510ms
────────────────────────────────────────────────────────────
```

---

## 🔀 Fuzzy Testing

Le fuzzy testing génère des entrées aléatoires pour trouver des cas limites.

### Stratégies disponibles

| Stratégie | Description |
|-----------|-------------|
| `random` | Génération purement aléatoire |
| `boundary` | Cas limites (vide, min, max) |
| `mutation` | Mutation de données valides |
| `injection` | Patterns SQL/XSS injection |
| `unicode` | Caractères unicode edge cases |
| `overflow` | Tentatives de buffer overflow |
| `format` | Attaques format string |

### Utilisation directe

```typescript
import { Fuzzer, createSeededFuzzer } from './fuzzy';

// Fuzzer standard
const fuzzer = new Fuzzer();
fuzzer.fuzzEmail('injection');
// "admin'--@domain.com"

// Fuzzer reproductible (avec seed)
const seededFuzzer = createSeededFuzzer(12345);
const emails = seededFuzzer.generateBatch(100, (s) => seededFuzzer.fuzzEmail(s));
```

---

## 🔧 Extensibilité

### Ajouter un nouveau validateur

1. Créer `validators/my-validator.ts`:

```typescript
export interface MyValidationResult {
  isValid: boolean;
  errors: string[];
}

export class MyValidator {
  static validate(input: string): MyValidationResult {
    const errors: string[] = [];
    // ... logique de validation
    return { isValid: errors.length === 0, errors };
  }
}
```

2. L'exporter dans `validators/index.ts`

### Ajouter un nouveau test

1. Créer `tests/my-test.test.ts`:

```typescript
import { BaseTest, TestResult, FuzzyTestResult } from './base.test';

export class MyTest extends BaseTest {
  name = 'my_test';
  description = 'Description du test';
  category = 'validation'; // ou 'flow', 'connection'

  async run(): Promise<TestResult> {
    const errors: string[] = [];
    let passed = 0;
    let failed = 0;

    // ... logique de test ...

    if (failed === 0) {
      return this.success(`All ${passed} tests passed`);
    }
    return this.failure(`${failed} tests failed`, errors);
  }

  async fuzzyRun(iterations: number): Promise<FuzzyTestResult> {
    // ... logique de fuzzy testing ...
  }
}
```

2. L'exporter dans `tests/index.ts`
3. L'enregistrer dans `runner.ts`

---

## 📊 Cartes de test valides (Luhn)

Ces numéros sont des cartes de test officielles, valides selon l'algorithme de Luhn:

| Type | Numéro | CVV |
|------|--------|-----|
| Visa | 4111 1111 1111 1111 | 123 |
| Visa | 4012 8888 8888 1881 | 123 |
| Mastercard | 5555 5555 5555 4444 | 123 |
| Mastercard | 5105 1051 0510 5100 | 123 |
| American Express | 3782 822463 10005 | 1234 |
| Discover | 6011 1111 1111 1117 | 123 |

---

## 🔐 Sécurité

- Les mots de passe sont **hashés avec bcrypt** (12 rounds)
- Les tokens de reset sont générés avec `crypto.randomBytes(32)`
- Les validations sont effectuées **côté serveur**
- Les données de test sont **automatiquement nettoyées**
- Aucune donnée sensible n'est logguée

---

## 📝 License

MIT - Projet ECF Vite Gourmand
