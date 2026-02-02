# 🔐 Portail d'Authentification - Vite Gourmand

Portail d'authentification complet avec Bootstrap, connecté au backend NestJS.

## 📋 Fonctionnalités

- **Connexion classique** (email/mot de passe)
- **Connexion Google** (OAuth simulé)
- **Inscription** avec validation complète
- **Mot de passe oublié** → email de réinitialisation
- **Réinitialisation** du mot de passe avec token

## 🏗️ Structure

```
frontend/src/test/
├── index.ts                    # Exports
├── AuthPortal.tsx              # Composant principal
│
├── components/
│   ├── LoginForm.tsx           # Formulaire de connexion
│   ├── RegisterForm.tsx        # Formulaire d'inscription
│   ├── ForgotPasswordForm.tsx  # Demande de reset
│   ├── ResetPasswordForm.tsx   # Nouveau mot de passe
│   └── GoogleLoginButton.tsx   # Bouton OAuth Google
│
├── hooks/
│   └── useAuth.tsx             # Context + hook d'authentification
│
├── services/
│   └── api.ts                  # Client API (axios)
│
└── styles/
    └── auth-portal.css         # Styles Bootstrap personnalisés
```

## 🚀 Utilisation

### Lancer le frontend

```bash
cd frontend
npm install
npm run dev
```

### Lancer le backend

```bash
cd backend
npm run start:dev
```

### URLs

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

## 🔧 Configuration

### Variables d'environnement

Créer `.env` dans `frontend/`:

```env
VITE_API_URL=http://localhost:3000
```

### Proxy (development)

Le proxy Vite est configuré dans `vite.config.ts` :

```typescript
server: {
  proxy: {
    '/auth': {
      target: 'http://localhost:3000',
      changeOrigin: true,
    },
  },
}
```

## 📡 API Endpoints utilisés

| Endpoint                | Méthode | Description              |
| ----------------------- | ------- | ------------------------ |
| `/auth/login`           | POST    | Connexion email/password |
| `/auth/register`        | POST    | Inscription              |
| `/auth/forgot-password` | POST    | Demande reset password   |
| `/auth/reset-password`  | POST    | Reset avec token         |
| `/auth/refresh`         | POST    | Refresh access token     |
| `/auth/me`              | GET     | Profil utilisateur       |

## 📝 Formats des données

### Login

```json
{
  "email": "user@example.com",
  "password": "Password123"
}
```

### Register

```json
{
  "email": "user@example.com",
  "password": "Password123",
  "firstName": "Jean",
  "telephoneNumber": "+33612345678",
  "city": "Paris",
  "country": "France",
  "postalAddress": "75001"
}
```

### Reset Password

```json
{
  "token": "abc123...",
  "newPassword": "NewPassword123"
}
```

## 🎨 Design

- **Bootstrap 5.3** via CDN
- **CSS personnalisé** pour le branding
- **Mode sombre** supporté
- **Responsive** (mobile-first)

## 🔒 Sécurité

- Tokens JWT stockés en `localStorage`
- Refresh token automatique sur 401
- Validation côté client (UX)
- Validation côté serveur (sécurité)
- Password strength indicator
- HTTPS recommandé en production

## 🧪 Tests

### Test manuel

1. Lancer le backend + frontend
2. Accéder à http://localhost:5173
3. Tester :
   - Création de compte
   - Connexion
   - Déconnexion
   - Mot de passe oublié
   - Google OAuth (simulé)

### Test automatisé (CLI)

```bash
cd backend
npx ts-node test/cli_test/interactive.ts
```
