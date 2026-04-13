# 🔐 Comptes de Démonstration - Vite & Gourmand

## Accès à l'application

Les comptes de démonstration sont créés automatiquement par le seed SQL
(`database/seeds/002_users.sql`) lors du bootstrap de la base de données.

Rendez-vous sur **http://localhost:5173** et connectez-vous avec l'un des
identifiants ci-dessous.

> **Mot de passe universel pour tous les comptes de démo : `Test123!`**

---

## 👑 Comptes Administrateurs

**Accès complet à toutes les fonctionnalités**

| Email | Nom | Rôle |
|-------|-----|------|
| `dylan@vitegourmand.dev` | Dylan Lesieur | superadmin |
| `jose@vitegourmand.fr` | José Garcia | admin |
| `julie@vitegourmand.fr` | Julie Martin | admin |

```
Password : Test123!
```

### Fonctionnalités accessibles :
- ✅ Tableau de bord avec statistiques et graphiques
- ✅ Gestion complète des menus (créer, modifier, supprimer)
- ✅ Gestion des commandes avec suivi de statut
- ✅ Validation/rejet des avis clients
- ✅ Création et désactivation de comptes employés
- ✅ Accès aux logs système et analytics
- ✅ Consultation de la charte graphique
- ✅ Toutes les fonctionnalités utilisateur

---

## 👔 Comptes Employés

**Accès aux fonctions de gestion opérationnelle**

| Email | Nom | Actif |
|-------|-----|-------|
| `pierre@vitegourmand.fr` | Pierre Dupont | ✅ |
| `sophie@vitegourmand.fr` | Sophie Bernard | ✅ |
| `lucie@vitegourmand.fr` | Lucie Moreau | ✅ |
| `marc@vitegourmand.fr` | Marc Lefebvre | ❌ (désactivé) |

```
Password : Test123!
```

### Fonctionnalités accessibles :
- ✅ Gestion des menus (créer, modifier, supprimer)
- ✅ Gestion des commandes avec mise à jour des statuts
- ✅ Contact clients (GSM, email) pour modifications/annulations
- ✅ Filtrage des commandes par statut et client
- ❌ Pas d'accès au tableau de bord admin
- ❌ Pas d'accès à la gestion des employés
- ❌ Pas d'accès à la validation des avis

---

## 👤 Comptes Utilisateurs (Clients)

**Accès client pour commander et gérer ses commandes**

| Email | Nom | Ville |
|-------|-----|-------|
| `alice@example.fr` | Alice Durand | Bordeaux |
| `bob@example.fr` | Bob Petit | Mérignac |
| `claire@example.fr` | Claire Roux | Pessac |
| `david@example.fr` | David Fournier | Talence |
| `emma@example.fr` | Emma Girard | Bordeaux |
| `francois@example.fr` | François André | Bègles |
| `helene@example.fr` | Hélène Leroy | Bordeaux |
| `igor@example.fr` | Igor Simon | Cenon |
| `julie.client@example.fr` | Julie Laurent | Bordeaux |
| `karim@example.fr` | Karim Benali | Lormont |
| `laura@example.fr` | Laura Dubois | Bordeaux |
| `nicolas@example.fr` | Nicolas Thomas | Gradignan |

```
Password : Test123!
```

> Le compte `deleted.user@example.fr` est un utilisateur soft-deleted (marqué
> supprimé il y a 30 jours) pour tester les flux de purge RGPD.

### Fonctionnalités accessibles :
- ✅ Navigation et consultation des menus
- ✅ Commande de menus avec calcul automatique
- ✅ Espace utilisateur personnel
- ✅ Visualisation de toutes ses commandes
- ✅ Annulation des commandes en attente
- ✅ Modification des informations personnelles
- ✅ Suivi détaillé de ses commandes
- ✅ Soumission d'avis pour commandes terminées
- ❌ Pas d'accès à l'administration

---

## 🗄️ Architecture des Données

### PostgreSQL (Supabase - données structurées)
Stockage des données relationnelles via le KV Store :
- `user_roles` - Rôles des utilisateurs
- `menus` - Catalogue des menus
- `orders` - Commandes clients
- `reviews` - Avis clients

### Simulation NoSQL (Logs & Analytics)
Stockage des logs et analytics dans le KV Store :
- `system_logs` - Logs système et actions utilisateurs
- Analytics d'utilisation
- Suivi des actions admin
- Historique des modifications

---

## 📊 Tableau de Bord Administrateur

Le dashboard admin inclut :

### KPIs Principaux
- 💰 Chiffre d'affaires total
- 🛒 Nombre de commandes
- 📈 Revenu moyen par commande
- 📦 Nombre de menus actifs

### Graphiques & Visualisations
- **Graphique à barres** : Commandes par menu
- **Graphique à barres** : CA par menu
- **Graphique circulaire** : Répartition du CA
- **Classement** : Top 5 des menus les plus populaires
- **Activité récente** : Feed des dernières actions

### Métriques Avancées
- 🌟 Taux de satisfaction : 98%
- 🎯 Taux de conversion : 24%
- 👥 Clients fidèles : 156

---

## 🎨 Charte Graphique

Accessible uniquement par les administrateurs via le bouton **"Charte Graphique"** dans le panneau d'administration.

### Contenu de la charte :
- **Palette de couleurs** : Couleurs primaires et secondaires
- **Typographie** : Hiérarchie des textes
- **Boutons** : Toutes les variantes disponibles
- **Badges** : Étiquettes et statuts
- **Alertes** : Messages d'information
- **Espacement** : Système d'espacement cohérent
- **Ombres** : Profondeur et élévation
- **Arrondis** : Rayon des bordures
- **Principes de design** : Guidelines pour maintenir la cohérence

---

## 🚀 Fonctionnalités Principales

### Page d'Accueil (Hero Section)
- ✨ Section hero spectaculaire avec fond vidéo
- 📊 Statistiques clés (25 ans, 5000+ événements)
- 🎯 Présentation des avantages
- 🎬 Espace vidéo de démonstration
- 💬 Avis clients validés

### Système de Commande
- 📍 Adresse de livraison avec ville
- 🕐 Date et heure de livraison
- 🚚 Calcul automatique des frais de livraison
  - Gratuit à Bordeaux
  - 5€ + 0,59€/km hors Bordeaux
- 💰 Réduction de 10% pour 5+ personnes au-dessus du minimum
- 📝 Détail complet du prix (menu + livraison)

### Espace Utilisateur
- 📦 Liste de toutes les commandes
- 🔍 Détails de chaque commande
- ❌ Annulation (si statut = en attente)
- ✏️ Modification du profil
- 📈 Suivi de commande avec historique des statuts
- ⭐ Soumission d'avis (note 1-5 + commentaire)

### Espace Employé
- 📋 Gestion des menus, plats et horaires
- 📞 Contact client obligatoire avant modification/annulation
- 🔍 Filtres sur commandes (statut, client)
- 📊 Mise à jour des statuts de commande :
  - ✅ Accepté
  - 👨‍🍳 En préparation
  - 🚚 En cours de livraison
  - 📦 Livré
  - ⏳ En attente du retour de matériel
  - ✔️ Terminée
- ✅ Validation/rejet des avis clients

### Espace Administrateur
- 📊 Dashboard complet avec graphiques
- 👥 Création de comptes employés
- 🔒 Désactivation de comptes employés
- 📈 Statistiques de commandes par menu
- 💰 Calcul du CA par menu avec filtres
- 📊 Comparaison via graphiques
- 🎨 Accès à la charte graphique
- 🔧 Toutes les fonctions employé

---

## 📧 Notifications Email (Simulation)

L'application simule l'envoi d'emails dans les cas suivants :
- ✅ Confirmation de commande
- 📦 Statut "En attente du retour de matériel"
  - Notification des 10 jours ouvrés
  - Frais de 600€ si non restitué (CGV)
- ✔️ Commande terminée → Invitation à laisser un avis
- 👤 Création de compte employé (sans le mot de passe)

---

## 🔒 Sécurité

### Exigences des mots de passe :
- Minimum 10 caractères
- Au moins 1 majuscule
- Au moins 1 minuscule
- Au moins 1 chiffre
- Au moins 1 caractère spécial (@$!%*?&)

### Contrôle d'accès (RBAC) :
- Routes protégées par authentification
- Vérification des rôles pour chaque action
- Tokens JWT pour les sessions

---

## 📜 Conformité RGPD

- ✅ Pages légales (Mentions légales, CGV)
- ✅ Gestion des données personnelles
- ✅ Droit de modification des informations
- ✅ Transparence sur l'utilisation des données

---

## 🛠️ Technologies Utilisées

### Frontend
- **React** avec TypeScript
- **Tailwind CSS** v4 pour le styling
- **Recharts** pour les graphiques
- **Lucide React** pour les icônes
- **Sonner** pour les notifications

### Backend
- **Supabase** (PostgreSQL + Auth)
- **Deno** + **Hono** pour le serveur
- **KV Store** pour le stockage clé-valeur

### Design
- **Shadcn/ui** pour les composants
- Design system cohérent et accessible
- Responsive design (mobile-first)

---

## 📞 Support

Pour toute question ou problème :
1. Consultez la charte graphique pour les guidelines design
2. Vérifiez les logs système dans l'espace admin
3. Contactez l'équipe via la page Contact

---

**🎉 Profitez de votre exploration de Vite & Gourmand !**
