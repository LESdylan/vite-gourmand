# 🍽️ Vite & Gourmand - Plateforme de Traiteur Premium

```
╔══════════════════════════════════════════════════════════════════════════╗
║                                                                          ║
║         🎉  NOUVEAU v2.0 : SYSTÈME KANBAN & SUIVI TEMPS RÉEL  🎉         ║
║                                                                          ║
║    📋 Vue Kanban pour équipes  |  📱 Suivi animé pour clients          ║
║    🔧 Gestion d'équipement     |  ⏰ Chronomètre automatique           ║
║                                                                          ║
║    👉  Consultez INDEX_DOCUMENTATION.md pour la doc complète            ║
║                                                                          ║
╚══════════════════════════════════════════════════════════════════════════╝
```

> Une application web complète pour la gestion d'une entreprise de traiteur bordelaise avec 25 ans d'expérience.

![Version](https://img.shields.io/badge/version-2.0.0-orange)
![React](https://img.shields.io/badge/React-18.x-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![Tailwind](https://img.shields.io/badge/Tailwind-4.0-cyan)

---

## 🚀 Démarrage Rapide

### Mode Démonstration (Par Défaut)

Au lancement, l'application affiche une **page de sélection de rôle** :

#### 🎯 3 Boutons - 3 Rôles

1. **👑 Accès Administrateur**
   - Dashboard avec statistiques
   - Gestion complète (menus, commandes, employés)
   - Charte graphique

2. **👔 Accès Employé**
   - Gestion des menus
   - Gestion des commandes
   - Validation des avis

3. **👤 Accès Utilisateur**
   - Consulter les menus
   - Passer commande
   - Suivre mes commandes
   - Laisser un avis

**✨ Aucune configuration requise - Cliquez et explorez !**

📖 **[Guide Complet → QUICKSTART.md](./QUICKSTART.md)**

---

### Changer de Rôle

1. Cliquez sur l'icône utilisateur (en haut à droite)
2. Sélectionnez "Déconnexion"
3. Choisissez un nouveau rôle

📖 **[Mode Démo Détaillé → DEMO_MODE.md](./DEMO_MODE.md)**

---

## ✨ Fonctionnalités Principales

### 📋 Système Kanban & Suivi Temps Réel ⭐ NOUVEAU !

**Vue Kanban pour Employés/Admins**
- 7 colonnes de production (Confirmées → Livraison)
- Tri automatique par priorité et date
- Statistiques en temps réel
- Métadonnées complètes

**Suivi Client avec Animations SVG**
- Animations dynamiques pour chaque étape (🔪 🔥 📦 🚚)
- Barre de progression en temps réel
- Historique détaillé avec timestamps
- Nom de l'employé visible

**Gestion d'Équipement Intelligente**
- Tracking automatique (chafing dishes, etc.)
- Chronomètre de 2 jours pour le retour
- Alertes 12h avant deadline
- Pénalité automatique de 600€

📖 **[Guide Complet → KANBAN_WORKFLOW.md](./KANBAN_WORKFLOW.md)**

---

### 🏠 Page d'Accueil Premium
- **Hero Section** spectaculaire avec fond vidéo
- Statistiques clés de l'entreprise
- Avis clients validés avec système de notation
- Section de présentation de l'équipe
- CTA vers les menus et contact

### 📋 Catalogue de Menus
- Filtres dynamiques (prix, thème, régime alimentaire, nombre de personnes)
- Vue détaillée avec informations allergènes et conditions
- Images haute qualité
- Prix transparent avec conditions

### 🛒 Système de Commande Avancé
- **Calcul intelligent des frais de livraison**
  - Gratuit à Bordeaux
  - 5€ + 0,59€/km hors Bordeaux
- **Réduction automatique de 10%**
  - Pour 5+ personnes au-dessus du minimum
- Date et heure de livraison personnalisées
- Demandes spéciales et allergies
- Récapitulatif détaillé avant validation

### 👤 Espace Utilisateur
- Visualisation de toutes les commandes
- Suivi en temps réel avec historique des statuts
- Annulation possible (si non acceptée)
- Modification du profil
- Soumission d'avis avec notation 1-5 étoiles

### 👔 Espace Employé
- Gestion complète des menus
- Mise à jour des statuts de commande
- Filtrage avancé des commandes
- Contact client obligatoire avant modification
- Validation/rejet des avis

### 👑 Espace Administrateur
- **Dashboard Analytics complet**
  - KPIs en temps réel
  - Graphiques interactifs (Recharts)
  - Statistiques de CA par menu
  - Top des menus les plus populaires
- Gestion des employés (création, désactivation)
- Accès aux logs système
- Contrôle total sur toutes les fonctionnalités

### 🎨 Charte Graphique (Admin)
- Palette de couleurs officielle
- Typographie et hiérarchie
- Composants UI standardisés
- Guidelines d'accessibilité
- Principes de design cohérents

---

## 🏗️ Architecture Technique

### Frontend
```
React + TypeScript
├── Tailwind CSS 4.0 (Design moderne)
├── Shadcn/ui (Composants UI)
├── Recharts (Graphiques)
├── Lucide React (Icônes)
└── Sonner (Notifications)
```

### Backend
```
Supabase + Deno
├── PostgreSQL (Base de données principale)
├── Supabase Auth (Authentification JWT)
├── Hono Framework (API REST)
└── KV Store (Stockage clé-valeur)
```

### Architecture des Données

#### 🟢 PostgreSQL (Données structurées)
Via KV Store Supabase :
- `user_roles` - Mapping utilisateur → rôle
- `menus` - Catalogue des menus
- `orders` - Commandes clients avec historique
- `reviews` - Avis clients avec validation

#### 🔵 Simulation NoSQL (Logs & Analytics)
Stockage dans KV Store :
- `system_logs` - Logs système et actions
- Analytics d'utilisation
- Audit trail administrateur
- Suivi des performances

---

## 🔐 Sécurité & Conformité

### Authentification
- ✅ JWT tokens via Supabase Auth
- ✅ Mots de passe sécurisés (10 car. min, complexité)
- ✅ Email de confirmation automatique
- ✅ Réinitialisation par email

### Contrôle d'accès (RBAC)
- ✅ 3 niveaux de rôles (user, employee, admin)
- ✅ Routes protégées par middleware
- ✅ Vérification des permissions à chaque action
- ✅ Isolation des données par utilisateur

### RGPD
- ✅ Pages légales (Mentions, CGV)
- ✅ Gestion des données personnelles
- ✅ Droit de modification
- ✅ Transparence sur l'utilisation

### Accessibilité (RGAA)
- ✅ Navigation au clavier complète
- ✅ Contraste de couleurs WCAG AA
- ✅ Alt-text sur toutes les images
- ✅ Labels explicites pour les formulaires
- ✅ Structure sémantique HTML

---

## 📊 Statuts de Commande

Le cycle de vie d'une commande :

1. **🟡 pending** (En attente)
   - Commande reçue, en attente de validation
   - Annulation possible par le client

2. **🔵 accepted** (Acceptée)
   - Validée par l'équipe
   - Plus d'annulation client possible

3. **🟣 preparing** (En préparation)
   - Cuisine en cours de préparation

4. **🟠 delivering** (En cours de livraison)
   - Équipe logistique en route

5. **🟢 delivered** (Livrée)
   - Commande livrée au client

6. **🟠 awaiting_equipment** (Attente matériel)
   - En attente du retour de matériel prêté
   - Email automatique avec délai de 10 jours
   - Frais de 600€ si non restitué (CGV)

7. **⚪ completed** (Terminée)
   - Commande finalisée
   - Email pour laisser un avis

8. **🔴 cancelled** (Annulée)
   - Annulée par client ou employé
   - Motif obligatoire si annulation employé

---

## 📧 Notifications Email (Simulées)

L'application simule l'envoi d'emails :

| Événement | Destinataire | Contenu |
|-----------|--------------|---------|
| Nouvelle commande | Client | Confirmation avec détails |
| Commande acceptée | Client | Validation de la prise en charge |
| Attente matériel | Client | Rappel des 10 jours + frais |
| Commande terminée | Client | Invitation à laisser un avis |
| Compte employé créé | Employé | Notification (sans mot de passe) |
| Annulation | Client | Motif + contact effectué |

---

## 🎨 Design System

### Couleurs Principales
- **Orange Primary**: `#ea580c` - Actions principales
- **Orange Dark**: `#c2410c` - Hover states
- **Orange Light**: `#ffedd5` - Backgrounds
- **Success**: `#16a34a` - Confirmations
- **Error**: `#dc2626` - Erreurs
- **Warning**: `#eab308` - Alertes

### Typographie
- **Font Stack**: System fonts (optimisé)
- **Échelle**: 4xl / 3xl / 2xl / xl / lg / base / sm / xs
- **Poids**: Regular (400) / Medium (500) / Semibold (600) / Bold (700)

### Composants UI
- Boutons (6 variantes)
- Cards avec ombres
- Badges colorés
- Alertes contextuelles
- Formulaires accessibles
- Tables responsives
- Graphiques interactifs

---

## 📱 Responsive Design

✅ **Mobile-first** approach
✅ **Breakpoints** :
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

✅ **Navigation** adaptative
✅ **Grids** flexibles
✅ **Images** optimisées
✅ **Touch-friendly** interfaces

---

## 🧪 Comptes de Test

### 👑 Administrateur
```
Email: admin@demo.app
Password: Admin123!@#
```

### 👔 Employé
```
Email: employee@demo.app
Password: Employee123!@#
```

### 👤 Utilisateur
```
Email: user@demo.app
Password: User123!@#
```

📖 **[Documentation complète des comptes](./COMPTES_DEMO.md)**

---

## 📈 Roadmap Future

### Phase 2 - Fonctionnalités avancées
- [ ] Système de réservation en temps réel
- [ ] Chat en direct avec le traiteur
- [ ] Application mobile (React Native)
- [ ] Intégration paiement en ligne (Stripe)
- [ ] Système de fidélité et points
- [ ] Calendrier de disponibilité interactif

### Phase 3 - Analytics & IA
- [ ] Dashboard BI avancé (Power BI style)
- [ ] Prédictions de demande (ML)
- [ ] Recommandations personnalisées
- [ ] Détection d'anomalies automatique
- [ ] Chatbot IA pour support client

### Phase 4 - Scalabilité
- [ ] Multi-tenancy (plusieurs traiteurs)
- [ ] API publique pour partenaires
- [ ] Marketplace de menus
- [ ] Integration avec Google Maps
- [ ] Système de reviews tiers (Google, TripAdvisor)

---

## 🤝 Contribution

Ce projet est une démonstration complète d'une application de traiteur moderne.

---

## 📄 Licence

Propriété de Vite & Gourmand - Julie et José Martinez
© 2026 - Tous droits réservés

---

## 🙏 Crédits

- **Design**: Système de design moderne et accessible
- **Photos**: Unsplash (stock images)
- **Icons**: Lucide React
- **Charts**: Recharts
- **UI Components**: Shadcn/ui
- **Backend**: Supabase + Deno

---

## 📞 Contact

**Vite & Gourmand**
📍 15 Rue Sainte-Catherine, 33000 Bordeaux
📞 +33 6 12 34 56 78
📧 contact@vite-gourmand.fr
🌐 www.vite-gourmand.fr

---

**🎉 Bon appétit et bonne exploration de l'application !**
