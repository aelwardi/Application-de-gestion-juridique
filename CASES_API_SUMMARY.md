# APIs pour les Dossiers (Cases) - Résumé

## ✅ Fichiers créés

### Backend

#### Types
- `backend/src/types/case.types.ts` - Définitions TypeScript pour les dossiers

#### Base de données
- `backend/src/database/queries/dossier.queries.ts` - Requêtes SQL pour les dossiers
- `backend/src/database/migrations/006_create_cases_table.sql` - Migration de la table cases

#### Services
- `backend/src/services/dossier.service.ts` - Logique métier pour les dossiers

#### Contrôleurs
- `backend/src/controllers/dossier.controller.ts` - Gestion des requêtes HTTP

#### Routes
- `backend/src/routes/dossier.routes.ts` - Définition des endpoints
- Ajout dans `backend/src/index.ts` : `/api/cases`

#### Documentation
- `backend/docs/api-cases.md` - Documentation complète des APIs
- `backend/docs/guide-cases-api.md` - Guide d'utilisation avec exemples

### Frontend

#### Types
- `frontend/types/case.ts` - Types TypeScript et helpers pour le frontend

#### Composables
- `frontend/composables/useCase.ts` - Hook pour gérer les appels API

---

## 📋 Endpoints disponibles

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/cases` | Créer un nouveau dossier |
| GET | `/api/cases` | Récupérer tous les dossiers (avec filtres) |
| GET | `/api/cases/:id` | Récupérer un dossier par ID |
| PUT | `/api/cases/:id` | Mettre à jour un dossier |
| DELETE | `/api/cases/:id` | Supprimer un dossier |
| POST | `/api/cases/:id/assign-lawyer` | Assigner un avocat à un dossier |
| GET | `/api/cases/stats` | Récupérer les statistiques |
| GET | `/api/cases/lawyer/:lawyerId` | Dossiers d'un avocat |
| GET | `/api/cases/client/:clientId` | Dossiers d'un client |
| GET | `/api/cases/upcoming-hearings` | Prochaines audiences |
| POST | `/api/cases/:id/close` | Fermer un dossier |
| POST | `/api/cases/:id/archive` | Archiver un dossier |

---

## 🔑 Fonctionnalités principales

### Gestion des dossiers
- ✅ CRUD complet (Create, Read, Update, Delete)
- ✅ Génération automatique du numéro de dossier
- ✅ Gestion des statuts (pending, in_progress, on_hold, closed, archived)
- ✅ Gestion des priorités (low, medium, high, urgent)
- ✅ Gestion des types de dossiers (familial, civil, pénal, commercial, etc.)

### Relations
- ✅ Liaison avec les clients (users)
- ✅ Assignation d'avocats (lawyers)
- ✅ Cascade delete pour les clients

### Recherche et filtrage
- ✅ Filtres par statut, priorité, type
- ✅ Filtres par avocat ou client
- ✅ Recherche textuelle (titre, description, numéro)
- ✅ Pagination (limit/offset)

### Statistiques
- ✅ Nombre total de dossiers
- ✅ Répartition par statut
- ✅ Répartition par priorité
- ✅ Répartition par type
- ✅ Statistiques globales ou par avocat

### Audiences
- ✅ Gestion des dates d'audience
- ✅ Récupération des prochaines audiences
- ✅ Informations sur le tribunal et le juge

### Actions spéciales
- ✅ Fermeture automatique avec date
- ✅ Archivage des dossiers
- ✅ Mise à jour automatique du timestamp

---

## 🚀 Démarrage rapide

### 1. Exécuter la migration
```bash
cd backend
npm run migrate
```

### 2. Démarrer le backend
```bash
npm run dev
```

### 3. Tester l'API
```bash
# Créer un dossier
curl -X POST http://localhost:5000/api/cases \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Test Case",
    "case_type": "civil",
    "client_id": "CLIENT_UUID"
  }'
```

### 4. Utiliser dans le frontend
```typescript
const { createCase, getAllCases, getCaseStats } = useCase();

// Créer un dossier
const result = await createCase({
  title: 'Nouveau dossier',
  case_type: 'familial',
  client_id: clientId
});

// Récupérer les statistiques
const stats = await getCaseStats(lawyerId);
```

---

## 📊 Structure de la base de données

### Table: cases
- `id` (UUID) - Identifiant unique
- `case_number` (VARCHAR) - Numéro de dossier unique généré automatiquement
- `title` (VARCHAR) - Titre du dossier
- `description` (TEXT) - Description détaillée
- `case_type` (VARCHAR) - Type de dossier
- `status` (VARCHAR) - Statut actuel
- `priority` (VARCHAR) - Niveau de priorité
- `client_id` (UUID) - Référence au client
- `lawyer_id` (UUID) - Référence à l'avocat
- `opening_date` (DATE) - Date d'ouverture
- `closing_date` (DATE) - Date de clôture
- `court_name` (VARCHAR) - Nom du tribunal
- `judge_name` (VARCHAR) - Nom du juge
- `next_hearing_date` (TIMESTAMP) - Prochaine audience
- `estimated_duration_months` (INTEGER) - Durée estimée
- `created_at` (TIMESTAMP) - Date de création
- `updated_at` (TIMESTAMP) - Date de mise à jour

### Index créés
- `idx_cases_client_id` - Pour recherche par client
- `idx_cases_lawyer_id` - Pour recherche par avocat
- `idx_cases_status` - Pour filtrage par statut
- `idx_cases_case_type` - Pour filtrage par type
- `idx_cases_next_hearing_date` - Pour les audiences
- `idx_cases_created_at` - Pour le tri chronologique

---

## 🔒 Sécurité

- ✅ Authentification requise sur toutes les routes
- ✅ Token JWT vérifié via middleware
- ✅ Validation des données en entrée
- ✅ Gestion des erreurs appropriée
- ✅ Protection contre les injections SQL (requêtes paramétrées)

---

## 📝 Prochaines étapes suggérées

1. **Ajouter des rôles et permissions**
   - Autoriser seulement certains utilisateurs à créer/modifier des dossiers
   - Restreindre l'accès aux dossiers selon le rôle

2. **Ajouter la gestion des documents**
   - Table pour les documents liés aux dossiers
   - Upload de fichiers

3. **Ajouter l'historique des modifications**
   - Table d'audit pour tracer les changements
   - Qui a modifié quoi et quand

4. **Notifications**
   - Notification aux clients lors de changements
   - Rappels pour les audiences

5. **Exports**
   - Export des dossiers en PDF
   - Génération de rapports

---

## 🐛 Dépannage

### Erreur de migration
```bash
# Vérifier l'ordre des migrations
ls backend/src/database/migrations/

# Re-exécuter la migration
npm run migrate
```

### Erreur de compilation TypeScript
```bash
# Vérifier les erreurs
npm run build

# Nettoyer et réinstaller
rm -rf node_modules
npm install
```

### Erreur 401 Unauthorized
- Vérifier que le token JWT est valide
- Vérifier le middleware d'authentification

---

## 📚 Ressources

- [Documentation API complète](./backend/docs/api-cases.md)
- [Guide d'utilisation](./backend/docs/guide-cases-api.md)
- [Types TypeScript](./backend/src/types/case.types.ts)

---

## ✨ Fonctionnalités avancées disponibles

- Recherche full-text sur titre, description et numéro
- Tri et pagination des résultats
- Statistiques en temps réel
- Gestion des audiences avec dates
- Assignation dynamique des avocats
- Statuts automatiques (ex: passage à "in_progress" lors de l'assignation)
- Timestamps automatiques
- Cascade delete sur les relations
