
# iPhone Cameroun - Documentation

## Vue d'ensemble du Projet

L'application iPhone Cameroun est une plateforme e-commerce spécialisée dans la vente de produits Apple au Cameroun. Elle est constituée d'un frontend en React pour l'interface utilisateur et d'un backend en Node.js avec une base de données MySQL pour la gestion des données.

## Architecture Technique

### Frontend
- **Framework**: React avec TypeScript
- **Router**: React Router DOM
- **Styling**: Tailwind CSS avec shadcn/ui
- **State Management**: TanStack Query (React Query)
- **HTTP Client**: Axios

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **ORM**: Sequelize
- **Base de données**: MySQL
- **Authentification**: JWT (JSON Web Tokens)

## Structure de la Base de Données

### Tables Principales

1. **User**
   - id (PK)
   - email
   - password (crypté)
   - isAdmin
   - timestamps (createdAt, updatedAt)

2. **Category**
   - id (PK)
   - name
   - description
   - timestamps

3. **Product**
   - id (PK)
   - name
   - price
   - imageUrl
   - categoryId (FK -> Category)
   - inStock
   - quantity
   - timestamps

## API Endpoints

### Authentification
- `POST /api/auth/login` - Connexion
- `POST /api/auth/register` - Inscription
- `GET /api/auth/profile` - Récupérer le profil utilisateur

### Produits
- `GET /api/products` - Récupérer tous les produits
- `GET /api/products/:id` - Récupérer un produit par ID
- `POST /api/products` - Ajouter un produit (Admin)
- `PUT /api/products/:id` - Mettre à jour un produit (Admin)
- `DELETE /api/products/:id` - Supprimer un produit (Admin)

### Catégories
- `GET /api/categories` - Récupérer toutes les catégories
- `GET /api/categories/:id` - Récupérer une catégorie par ID
- `POST /api/categories` - Ajouter une catégorie (Admin)
- `PUT /api/categories/:id` - Mettre à jour une catégorie (Admin)
- `DELETE /api/categories/:id` - Supprimer une catégorie (Admin)

## Structure du Projet

```
/
├── server/                  # Backend
│   ├── index.js             # Point d'entrée du serveur
│   ├── seedData.js          # Script de peuplement de la base de données
│   ├── models/              # Modèles Sequelize
│   ├── routes/              # Routes API
│   └── middleware/          # Middleware d'authentification
│
├── src/                     # Frontend
│   ├── api/                 # Services API
│   ├── components/          # Composants React
│   │   ├── admin/           # Composants du panneau admin
│   │   ├── layout/          # Layouts
│   │   ├── products/        # Composants liés aux produits
│   │   └── ui/              # Composants UI
│   ├── hooks/               # Custom hooks React
│   ├── lib/                 # Fonctions utilitaires
│   ├── pages/               # Pages de l'application
│   └── App.tsx              # Composant racine React
│
├── start.js                 # Script de démarrage combiné (backend + frontend)
└── DOCUMENTATION.md         # Documentation du projet
```

## Guide d'Utilisation

### Installation

1. **Prérequis**:
   - Node.js (v14+)
   - MySQL (v5.7+)
   - npm ou yarn

2. **Étapes d'installation**:
   ```bash
   # Cloner le dépôt
   git clone [url-du-repo]
   cd iphone-cameroun

   # Installer les dépendances
   npm install
   ```

3. **Configuration de la base de données**:
   - Créer une base de données MySQL nommée 'iphone_cameroun'
   - Vérifier les informations de connexion dans server/index.js

### Démarrage de l'Application

Pour démarrer l'application complète (backend + frontend):
```bash
node start.js
```

L'application sera accessible aux URLs suivantes:
- **Site utilisateur**: [http://localhost:8080](http://localhost:8080)
- **Panneau administrateur**: [http://localhost:8080/admin](http://localhost:8080/admin)

### Connexion à l'Admin Panel

Utilisez les identifiants par défaut pour vous connecter:
- **Email**: admin@iphonecameroun.com
- **Mot de passe**: admin123

### Fonctionnalités

#### Utilisateurs
- Parcourir les produits par catégorie
- Filtrer les produits par prix et disponibilité
- Voir les détails des produits

#### Administrateurs
- Gérer les produits (ajouter, modifier, supprimer)
- Gérer les catégories (ajouter, modifier, supprimer)
- Visualiser les statistiques du tableau de bord

## Développement

Pour développer séparément le frontend et le backend:

- **Backend uniquement**:
  ```bash
  node server/index.js
  ```

- **Frontend uniquement**:
  ```bash
  npm run dev
  ```

## Déploiement

### Préparation
1. Configurer les variables d'environnement pour la production
2. Construire la version de production du frontend: `npm run build`

### Serveur de Production
1. Configurer un serveur web (Nginx/Apache)
2. Configurer PM2 pour le processus Node.js
3. Configurer la base de données MySQL

## Maintenance

- **Sauvegardes**: Effectuer des sauvegardes régulières de la base de données
- **Mises à jour**: Vérifier régulièrement les mises à jour des dépendances

## Sécurité

- Authentification par JWT
- Hachage des mots de passe avec bcrypt
- Protection des routes d'administration

## Support et Contact

Pour toute assistance technique, veuillez contacter l'équipe de développement à l'adresse support@iphonecameroun.com.
