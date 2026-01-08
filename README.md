# Application de Gestion Juridique

> Application moderne de gestion des rendez-vous, dossiers et communications juridiques pour avocats, clients et collaborateurs

## Vue d'ensemble

Cette application propose une solution complète pour la digitalisation et la facilitation de la gestion des activités juridiques. Elle permet la gestion des rendez-vous, des dossiers, des échanges entre parties, avec des fonctionnalités avancées comme la cartographie intelligente, les notifications automatiques et la messagerie en temps réel.

### Déploiement en Ligne

L'application est conteneurisée et déployée sur Render avec Docker.

**URL de démonstration** : https://application-de-gestion-juridique-1.onrender.com

Vous pouvez créer des comptes client et avocat directement.

**Identifiants Admin** :
- Email : a.elwardi@myskolae.fr
- Mot de passe : Ge*h+{p.G0iC*%i

### Authentification à Deux Facteurs (2FA)

Par défaut, la double authentification est désactivée pour tous les nouveaux utilisateurs (clients, avocats, admin).

Pour activer la 2FA :
1. Connectez-vous à votre compte
2. Allez dans "Mon Profil"
3. Cliquez sur l'onglet "Sécurité"
4. En bas de "Modifier mot de passe", trouvez "Authentification à deux facteurs (2FA)"
5. Cliquez sur "Activer"
6. Scannez le QR code dans une application d'authentification (Google Authenticator, Authy, etc.)
7. Entrez le code de vérification et validez

## Démarrage du Projet

### Configuration Backend

1. Créer le fichier de configuration :
```bash
cd backend
touch .env
```

2. Ajouter les variables d'environnement dans `backend/.env` :
```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=gestion_juridique
DB_USER=postgres
DB_PASSWORD=postgres

JWT_SECRET=gestion-juridique-super-secret-jwt-key-2025-change-in-production
JWT_REFRESH_SECRET=gestion-juridique-super-secret-refresh-key-2025-change-in-production
JWT_ACCESS_TOKEN_EXPIRY=15m
JWT_REFRESH_TOKEN_EXPIRY=7d

CORS_ORIGIN=http://localhost:3001

FRONTEND_URL=http://localhost:3001

COOKIE_SECURE=false
COOKIE_SAME_SITE=lax

GMAIL_APP_USERNAME=pdog83341@gmail.com
GMAIL_APP_PASSWORD=xylnuzfgtzecqwlu
GMAIL_USERNAME=pdog83341@gmail.com
```

### Configuration Frontend

1. Créer le fichier de configuration :
```bash
cd frontend
touch .env
```

2. Ajouter les variables d'environnement dans `frontend/.env` :
```env
PORT=3001
NUXT_PUBLIC_API_BASE_URL=http://localhost:3000/api
```

### Démarrage

1. Démarrer la base de données PostgreSQL :
```bash
cd backend
docker compose up -d
```

2. Configuration de l'admin (IMPORTANT) :
   Avant de lancer les migrations, éditez le fichier `/backend/src/database/migrations/init-db.sql` à la ligne 720 et remplacez l'adresse email par la vôtre pour créer un compte administrateur.

3. Initialiser le backend :
```bash
npm i
npm run migrate
npm run dev
```

4. Pour obtenir le mot de passe admin : Utilisez la fonctionnalité "Mot de passe oublié" avec l'email que vous avez configuré. Vous recevrez un email pour réinitialiser le mot de passe et accéder au dashboard admin.

5. Démarrer le frontend :
```bash
cd frontend
npm i
npm run dev
```

6. Accéder à l'application :
   L'application affichera :
```
➜ Local:    http://0.0.0.0:3001/
➜ Network:  http://192.168.1.109:3001/
```

Pour tester en local, utilisez : **http://localhost:3001/**

### Authentification à Deux Facteurs (2FA)

Par défaut, la double authentification est désactivée pour tous les nouveaux utilisateurs (clients, avocats, admin).

Pour activer la 2FA :
1. Connectez-vous à votre compte
2. Allez dans "Mon Profil"
3. Cliquez sur l'onglet "Sécurité"
4. En bas de "Modifier mot de passe", trouvez "Authentification à deux facteurs (2FA)"
5. Cliquez sur "Activer"
6. Scannez le QR code dans une application d'authentification (Google Authenticator, Authy, etc.)
7. Entrez le code de vérification et validez

Après activation, lors de la prochaine connexion, le code de l'application d'authentification sera demandé.


## Architecture du Projet

### Stack Technologique

#### Backend

- **Runtime**: Node.js 20+
- **Framework**: Express.js 5
- **Langage**: TypeScript
- **Base de données**: PostgreSQL 15+
- **API**: RESTful
- **Validation**: Zod
- **Authentication**: JWT (jsonwebtoken) + bcrypt
- **2FA**: Speakeasy + QRCode
- **File Upload**: Multer
- **Email**: Nodemailer (Gmail SMTP)
- **Cron Jobs**: node-cron (rappels automatiques)
- **Cookie Parser**: cookie-parser
- **CORS**: cors

#### Frontend

- **Framework**: Nuxt.js 3 (Vue.js 3 avec SSR)
- **Langage**: TypeScript
- **Mode de rendu**: Universal (SSR + CSR)
- **State Management**: Pinia (@pinia/nuxt)
- **Router**: Auto-routing (file-based routing)
- **Auto-import**: Composants, composables, utils
- **UI Framework**: Tailwind CSS (@nuxtjs/tailwindcss)
- **Composants UI**: Headless UI (@headlessui/vue)
- **Icônes**: Heroicons (@heroicons/vue)
- **Maps**: Leaflet.js (@types/leaflet)
- **Charts**: Chart.js
- **HTTP Client**: $fetch / useFetch (natif Nuxt)
- **Validation**: Zod

#### DevOps & Infrastructure

- **Conteneurisation**: Docker & Docker Compose
- **Déploiement**: Render (production)
- **Stockage fichiers**: Local (Multer) avec uploads/avatars et uploads/documents
- **Base de données**: PostgreSQL (Docker pour dev, cloud pour prod)

---

## Schéma de Base de Données

### Table Principale

#### 1. **Users** (Utilisateurs - Table Unifiée)

Table unifiée pour tous les types d'utilisateurs (admin, avocat, client, collaborateur)

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'avocat', 'client', 'collaborateur')),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  profile_picture_url VARCHAR(500),
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  last_login_at TIMESTAMP,
  
  -- Authentification 2FA
  two_factor_enabled BOOLEAN DEFAULT false,
  two_factor_secret VARCHAR(255),
  two_factor_backup_codes TEXT[],
  two_factor_verified_at TIMESTAMP,
  
  -- Champs spécifiques avocats
  bar_number VARCHAR(50) UNIQUE,
  specialties TEXT[] DEFAULT '{}',
  experience_years INTEGER DEFAULT 0,
  office_address TEXT,
  office_city VARCHAR(100),
  office_postal_code VARCHAR(20),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  hourly_rate DECIMAL(10, 2),
  description TEXT,
  languages TEXT[] DEFAULT '{}',
  availability_status VARCHAR(50) DEFAULT 'available',
  verified_by_admin BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMP,
  rating DECIMAL(3, 2) DEFAULT 0.00,
  total_reviews INTEGER DEFAULT 0,
  
  -- Champs spécifiques clients
  address TEXT,
  city VARCHAR(100),
  postal_code VARCHAR(20),
  emergency_contact_name VARCHAR(255),
  emergency_contact_phone VARCHAR(20),
  notes TEXT,
  
  -- Statistiques communes
  total_cases INTEGER DEFAULT 0,
  active_cases INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 2. **Cases** (Dossiers)

Gestion des dossiers juridiques

```sql
CREATE TABLE cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_number VARCHAR(100) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  case_type VARCHAR(100) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  priority VARCHAR(20) DEFAULT 'medium',
  client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lawyer_id UUID REFERENCES users(id) ON DELETE SET NULL,
  opening_date DATE NOT NULL DEFAULT CURRENT_DATE,
  closing_date DATE,
  court_name VARCHAR(255),
  judge_name VARCHAR(255),
  next_hearing_date TIMESTAMP,
  estimated_duration_months INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 3. **Appointments** (Rendez-vous)

Gestion des rendez-vous

```sql
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  lawyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  appointment_type VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  location_type VARCHAR(50),
  location_address TEXT,
  location_latitude DECIMAL(10, 8),
  location_longitude DECIMAL(11, 8),
  meeting_url VARCHAR(500),
  status VARCHAR(50) DEFAULT 'scheduled',
  reminder_sent BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 4. **Documents** (Documents)

Gestion des documents et fichiers

```sql
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  document_type VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  file_name VARCHAR(255) NOT NULL,
  file_size BIGINT NOT NULL,
  file_type VARCHAR(100) NOT NULL,
  file_url VARCHAR(500) NOT NULL,
  is_confidential BOOLEAN DEFAULT false,
  version INTEGER DEFAULT 1,
  parent_document_id UUID REFERENCES documents(id),
  tags TEXT[],
  upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 5. **Messages** (Messagerie)

Système de messagerie entre utilisateurs

```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message_text TEXT,
  message_type VARCHAR(50) DEFAULT 'text',
  attachments JSONB,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP,
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 6. **Conversations** (Conversations)

Fil de discussions entre utilisateurs

```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  conversation_type VARCHAR(50) DEFAULT 'direct',
  title VARCHAR(255),
  participants UUID[] NOT NULL,
  last_message_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 7. **Notifications** (Notifications)

Système de notifications

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  notification_type VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP,
  priority VARCHAR(20) DEFAULT 'normal',
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 8. **Reviews** (Évaluations)

Avis et évaluations des avocats

```sql
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lawyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  case_id UUID REFERENCES cases(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_anonymous BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 9. **Lawyer_Requests** (Demandes aux avocats)

Gestion des demandes de prise en charge

```sql
CREATE TABLE lawyer_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lawyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  request_type VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  response_message TEXT,
  responded_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 10. **Document_Requests** (Demandes de documents)

Gestion des demandes de documents entre avocats et clients

```sql
CREATE TABLE document_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  requested_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  requested_from UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  document_type VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  due_date TIMESTAMP,
  completed_at TIMESTAMP,
  document_id UUID REFERENCES documents(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 11. **Support_Tickets** (Tickets de support)

Système de support et assistance

```sql
CREATE TABLE support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  subject VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'open',
  priority VARCHAR(50) DEFAULT 'medium',
  category VARCHAR(100),
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 12. **Support_Messages** (Messages de support)

Messages dans les tickets de support

```sql
CREATE TABLE support_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT FALSE,
  attachments JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 13. **Password_Reset_Tokens** (Tokens de réinitialisation)

Gestion des tokens de réinitialisation de mot de passe

```sql
CREATE TABLE password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 14. **Two_Factor_Temp_Tokens** (Tokens temporaires 2FA)

Tokens temporaires pour le processus de connexion avec 2FA

```sql
CREATE TABLE two_factor_temp_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  temp_token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  verified BOOLEAN DEFAULT false,
  ip_address VARCHAR(50),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 15. **Activity_Logs** (Logs d'activité)

Audit et traçabilité des actions

```sql
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID,
  ip_address VARCHAR(50),
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 16. **Appointment_Suggestions** (Suggestions de rendez-vous)

Propositions de créneaux horaires

```sql
CREATE TABLE appointment_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lawyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  suggested_times JSONB NOT NULL,
  message TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  selected_time TIMESTAMP,
  responded_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 17. **Offers** (Offres et promotions)

Offres spéciales ou promotions des avocats

```sql
CREATE TABLE offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lawyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  discount_percentage DECIMAL(5, 2),
  valid_from TIMESTAMP,
  valid_until TIMESTAMP,
  terms_and_conditions TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 18. **Feedback** (Retours utilisateurs)

Retours et suggestions des utilisateurs

```sql
CREATE TABLE feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  feedback_type VARCHAR(50),
  subject VARCHAR(255),
  message TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  page_url VARCHAR(500),
  browser_info TEXT,
  status VARCHAR(50) DEFAULT 'new',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Fonctionnalités Principales

### Authentification et Sécurité

#### Authentification à Deux Facteurs (2FA)
- Configuration optionnelle de la 2FA via Speakeasy
- Génération de QR Code pour applications d'authentification
- Codes de secours pour accès d'urgence
- Tokens temporaires pour le processus de connexion
- Vérification des codes TOTP à 6 chiffres

#### Gestion des Mots de Passe
- Réinitialisation sécurisée par email
- Tokens à usage unique avec expiration
- Hashage bcrypt des mots de passe

### Pour les Avocats

#### Gestion des Rendez-vous
- Création/modification/suppression de rendez-vous
- Suggestions de créneaux horaires aux clients
- Rappels automatiques par email
- Gestion du statut (planifié, confirmé, annulé, terminé)
- Association aux dossiers
- Localisation géographique (carte Leaflet)
- Notes et commentaires

#### Gestion des Dossiers
- CRUD complet des dossiers juridiques
- Filtres avancés (statut, type, client, date, priorité)
- Numérotation automatique des dossiers
- Suivi de l'avancement
- Upload multiple de documents
- Gestion des collaborateurs
- Historique des modifications

#### Profil et Visibilité
- Profil complet avec spécialités
- Localisation du cabinet sur carte
- Tarif horaire
- Langues parlées
- Années d'expérience
- Vérification par l'admin
- Système de notation et avis

#### Communication
- Messagerie en temps réel avec clients
- Demandes de documents aux clients
- Notifications email automatiques
- Système de support intégré

### Pour les Clients

#### Recherche et Sélection d'Avocats
- Recherche avancée par spécialité
- Filtre par localisation (carte interactive)
- Filtre par note/avis
- Filtre par disponibilité
- Profils détaillés des avocats
- Système d'évaluation et d'avis

#### Gestion de Dossiers
- Consultation des dossiers en cours
- Suivi de l'avancement en temps réel
- Upload de documents
- Réponse aux demandes de documents
- Téléchargement des documents partagés

#### Communication
- Chat direct avec l'avocat assigné
- Demande de rendez-vous
- Réponse aux suggestions de créneaux
- Notifications (email + in-app)
  - Nouveau message
  - Rendez-vous confirmé/modifié
  - Mise à jour du dossier
  - Demande de document
  - Document ajouté

#### Demandes aux Avocats
- Envoi de demandes de prise en charge
- Suivi du statut des demandes
- Consultation des réponses

### Pour les Collaborateurs

- Accès aux dossiers assignés
- Upload et partage de documents
- Communication avec avocats et clients
- Ajout de notes sur les dossiers

### Pour l'Admin

#### Gestion Utilisateurs
- CRUD complet des utilisateurs
- Attribution des rôles (admin, avocat, client, collaborateur)
- Activation/désactivation de comptes
- Vérification des avocats (validation du barreau)
- Consultation de l'activité des utilisateurs

#### Gestion du Système
- Dashboard administrateur avec statistiques globales
- Gestion des tickets de support
- Assignation des tickets aux admins
- Réponses aux tickets (publiques et notes internes)
- Consultation des logs d'activité
- Gestion des retours utilisateurs (feedback)

#### Statistiques Globales
- Nombre total d'utilisateurs par rôle
- Nombre de dossiers actifs/fermés
- Rendez-vous planifiés
- Activité des utilisateurs
- Graphiques d'évolution

#### Support et Assistance
- Système de tickets de support
- Gestion des priorités
- Catégorisation des demandes
- Résolution et suivi
- Messages internes (notes admin)

---

## Structure du Projet

```
Application-de-gestion-juridique/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   │   ├── admin.controller.ts
│   │   │   ├── appointment.controller.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── case.controller.ts
│   │   │   ├── client.controller.ts
│   │   │   ├── document.controller.ts
│   │   │   ├── lawyer.controller.ts
│   │   │   ├── message.controller.ts
│   │   │   ├── notification.controller.ts
│   │   │   ├── support.controller.ts
│   │   │   ├── two-factor.controller.ts
│   │   │   └── user.controller.ts
│   │   ├── database/
│   │   │   ├── migrations/
│   │   │   │   └── init-db.sql
│   │   │   └── db.ts
│   │   ├── jobs/
│   │   │   └── reminder.job.ts
│   │   │   └── auto-complete.job.ts
│   │   ├── middleware/          # Middlewares
│   │   │   ├── auth.middleware.ts       # Vérification JWT
│   │   │   ├── role.middleware.ts       # Contrôle rôles
│   │   │   ├── validation.middleware.ts # Validation Zod
│   │   │   └── upload.middleware.ts     # Multer upload
│   │   ├── routes/              # Routes API
│   │   │   ├── admin.routes.ts
│   │   │   ├── appointment.routes.ts
│   │   │   ├── appointment-suggestion.routes.ts
│   │   │   ├── auth.routes.ts
│   │   │   ├── client.routes.ts
│   │   │   ├── client-extended.routes.ts
│   │   │   ├── document.routes.ts
│   │   │   ├── document-request.routes.ts
│   │   │   ├── dossier.routes.ts
│   │   │   ├── email.routes.ts
│   │   │   ├── feedback.routes.ts
│   │   │   ├── jobs.routes.ts
│   │   │   ├── lawyer.routes.ts
│   │   │   ├── lawyer-request.routes.ts
│   │   │   ├── message.routes.ts
│   │   │   ├── notification.routes.ts
│   │   │   ├── offer.routes.ts
│   │   │   ├── support.routes.ts
│   │   │   ├── two-factor.routes.ts
│   │   │   ├── upload.routes.ts
│   │   │   └── user.routes.ts
│   │   ├── services/
│   │   │   ├── auth.service.ts
│   │   │   ├── email.service.ts
│   │   │   ├── notification.service.ts
│   │   │   ├── two-factor.service.ts
│   │   │   └── upload.service.ts
│   │   ├── types/
│   │   ├── utils/
│   │   └── index.ts
│   ├── tests/
│   │   ├── setup.ts
│   │   ├── helpers/
│   │   └── unit/
│   ├── uploads/ 
│   │   ├── avatars/
│   │   └── documents/
│   ├── scripts/
│   │   ├── create-avatars-dir.js
│   │   └── migrate.ts
│   ├── docker-compose.yml
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   └── jest.config.js
│
├── frontend/
│   ├── app.vue
│   ├── types/
│   │   ├── api.ts
│   │   ├── appointment.ts
│   │   ├── auth.ts
│   │   ├── case.ts
│   │   ├── client.ts
│   │   ├── global.d.ts
│   │   ├── lawyer.ts
│   │   └── suggestion.ts
│   │
│   ├── composables/
│   │   ├── useAdmin.ts
│   │   ├── useApi.ts
│   │   ├── useAppointment.ts
│   │   ├── useAvatar.ts
│   │   ├── useCase.ts
│   │   ├── useClient.ts
│   │   ├── useConfirm.ts
│   │   ├── useConflict.ts
│   │   ├── useDocument.ts
│   │   ├── useDocumentRequest.ts
│   │   ├── useEmail.ts
│   │   ├── useGeolocation.ts
│   │   ├── useLawyer.ts
│   │   ├── useMessage.ts
│   │   ├── useNotifications.ts
│   │   ├── useSuggestion.ts
│   │   ├── useSupport.ts
│   │   └── useToast.ts
│   │
│   ├── stores/
│   │   ├── auth.ts
│   │   ├── confirm.ts
│   │   ├── notifications.ts
│   │   └── toast.ts
│   │
│   ├── middleware/
│   │   ├── auth.ts
│   │   ├── admin.ts
│   │   ├── client.ts
│   │   ├── lawyer.ts
│   │   └── guest.ts
│   │
│   ├── layouts/
│   │   ├── default.vue
│   │   ├── authenticated.vue
│   │   └── admin.vue
│   │
│   ├── pages/
│   │   ├── index.vue
│   │   ├── contact.vue
│   │   ├── auth/
│   │   │   ├── login.vue
│   │   │   ├── register.vue
│   │   │   ├── forgot-password.vue
│   │   │   ├── reset-password.vue
│   │   │   └── verify-2fa.vue
│   │   ├── dashboard/
│   │   │   ├── index.vue
│   │   │   ├── lawyer.vue
│   │   │   ├── client.vue
│   │   │   └── admin.vue
│   │   ├── cases/
│   │   │   ├── index.vue
│   │   │   ├── create.vue
│   │   │   └── [id].vue
│   │   ├── appointments/
│   │   │   ├── index.vue
│   │   │   ├── create.vue
│   │   │   └── [id].vue
│   │   ├── documents/
│   │   │   ├── index.vue
│   │   │   └── [id].vue
│   │   ├── upload-documents/
│   │   │   └── index.vue
│   │   ├── messages/
│   │   │   ├── index.vue
│   │   │   └── [id].vue
│   │   ├── lawyers/
│   │   │   ├── index.vue
│   │   │   └── [id].vue
│   │   ├── clients/
│   │   │   ├── index.vue
│   │   │   └── [id].vue
│   │   ├── profile/
│   │   │   └── index.vue
│   │   ├── notifications/
│   │   │   └── index.vue
│   │   ├── reviews/
│   │   │   └── index.vue
│   │   ├── support/
│   │   │   ├── index.vue
│   │   │   ├── create.vue
│   │   │   └── [id].vue
│   │   ├── admin/
│   │   │   ├── index.vue
│   │   │   ├── users.vue
│   │   │   ├── lawyers.vue
│   │   │   ├── cases.vue
│   │   │   ├── support.vue
│   │   │   ├── feedback.vue
│   │   │   └── logs.vue
│   │   └── home/
│   │       └── index.vue
│   │
│   ├── components/
│   │   ├── ui/
│   │   ├── common/
│   │   │   ├── Footer.vue
│   │   │   └── FeedbackModal.vue
│   │   ├── auth/
│   │   ├── cases/
│   │   ├── appointments/
│   │   ├── documents/
│   │   ├── messages/
│   │   ├── lawyers/
│   │   ├── clients/
│   │   ├── notifications/
│   │   ├── stats/
│   │   └── forms/
│   │
│   ├── assets/
│   │   ├── css/
│   │   │   └── main.css
│   │   ├── images/
│   │   └── icons/
│   │
│   ├── utils/
│   │
│   ├── plugins/
│   │   ├── auth.ts
│   │   ├── error-handler.ts
│   │   └── leaflet.client.ts
│   │
│   ├── public/
│   │   ├── favicon.ico
│   │   ├── robots.txt
│   │   └── images/
│   │
│   ├── tests/
│   │   ├── setup.ts
│   │   ├── auth.store.test.ts
│   │   ├── notifications.store.test.ts
│   │   ├── useApi.test.ts
│   │   ├── useAppointment.test.ts
│   │   ├── useCase.test.ts
│   │   ├── useClient.test.ts
│   │   ├── useDocument.test.ts
│   │   └── useLawyer.test.ts
│   │
│   ├── .env
│   ├── nuxt.config.ts
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── package.json
│
├── docs/
│   ├── description_projet_annuel.md
│   ├── description_projet_annuel_V2.md
│   └── SyllabusDuProjet.pdf
│
├── docker-compose.yml
├── docker-compose.prod.yml
└── README.md
```

---

## API Endpoints Principaux

### Authentication (`/api/auth`)

```
POST   /api/auth/register              # Inscription
POST   /api/auth/login                 # Connexion (retourne JWT)
POST   /api/auth/logout                # Déconnexion
POST   /api/auth/refresh-token         # Rafraîchir le token
POST   /api/auth/forgot-password       # Mot de passe oublié
POST   /api/auth/reset-password        # Réinitialiser mot de passe
GET    /api/auth/verify-email          # Vérifier email
```

### Two-Factor Authentication (`/api/two-factor`)

```
POST   /api/two-factor/setup           # Configurer la 2FA (génère QR code)
POST   /api/two-factor/verify          # Vérifier code 2FA lors de la connexion
POST   /api/two-factor/enable          # Activer la 2FA
POST   /api/two-factor/disable         # Désactiver la 2FA
POST   /api/two-factor/verify-setup    # Vérifier la configuration initiale
GET    /api/two-factor/backup-codes    # Obtenir les codes de secours
POST   /api/two-factor/regenerate-backup-codes  # Régénérer codes de secours
```

### Users (`/api/users`)

```
GET    /api/users/me                   # Profil utilisateur connecté
PUT    /api/users/me                   # Mettre à jour profil
PATCH  /api/users/me/password          # Changer mot de passe
POST   /api/users/upload-avatar        # Upload photo de profil
GET    /api/users/:id                  # Détails utilisateur
DELETE /api/users/:id                  # Supprimer utilisateur
```

### Lawyers (`/api/lawyers`)

```
GET    /api/lawyers                    # Liste/recherche avocats (filtres)
GET    /api/lawyers/:id                # Détails avocat
GET    /api/lawyers/:id/reviews        # Avis sur avocat
POST   /api/lawyers/request            # Envoyer demande à un avocat
GET    /api/lawyers/requests           # Mes demandes reçues (avocat)
GET    /api/lawyers/requests/sent      # Mes demandes envoyées (client)
PATCH  /api/lawyers/requests/:id       # Accepter/refuser demande
GET    /api/lawyers/:id/stats          # Statistiques avocat
GET    /api/lawyers/specialties        # Liste des spécialités
```

### Clients (`/api/clients`)

```
GET    /api/clients                    # Liste clients (pour avocats)
GET    /api/clients/:id                # Détails client
GET    /api/clients/:id/cases          # Dossiers d'un client
GET    /api/clients/:id/appointments   # Rendez-vous d'un client
```

### Cases/Dossiers (`/api/cases` ou `/api/dossiers`)

```
GET    /api/cases                      # Liste dossiers (pagination, filtres)
POST   /api/cases                      # Créer dossier
GET    /api/cases/:id                  # Détails dossier
PUT    /api/cases/:id                  # Mettre à jour dossier
DELETE /api/cases/:id                  # Supprimer dossier
GET    /api/cases/:id/timeline         # Historique des modifications
POST   /api/cases/:id/collaborators    # Ajouter collaborateur
DELETE /api/cases/:id/collaborators/:userId  # Retirer collaborateur
GET    /api/cases/stats                # Statistiques dossiers
```

### Appointments (`/api/appointments`)

```
GET    /api/appointments               # Liste rendez-vous (filtres)
POST   /api/appointments               # Créer rendez-vous
GET    /api/appointments/:id           # Détails rendez-vous
PUT    /api/appointments/:id           # Modifier rendez-vous
DELETE /api/appointments/:id           # Annuler rendez-vous
GET    /api/appointments/upcoming      # Rendez-vous à venir
GET    /api/appointments/today         # Rendez-vous du jour
PATCH  /api/appointments/:id/status    # Modifier statut
```

### Appointment Suggestions (`/api/appointment-suggestions`)

```
GET    /api/appointment-suggestions    # Liste suggestions reçues
POST   /api/appointment-suggestions    # Créer une suggestion de créneaux
GET    /api/appointment-suggestions/:id # Détails suggestion
PUT    /api/appointment-suggestions/:id # Répondre à la suggestion
DELETE /api/appointment-suggestions/:id # Supprimer suggestion
```

### Documents (`/api/documents`)

```
GET    /api/documents                  # Liste documents (filtres)
POST   /api/documents/upload           # Upload document(s)
GET    /api/documents/:id              # Télécharger document
GET    /api/documents/:id/preview      # Prévisualisation
DELETE /api/documents/:id              # Supprimer document
POST   /api/documents/:id/share        # Partager par email
GET    /api/documents/case/:caseId     # Documents d'un dossier
```

### Document Requests (`/api/document-requests`)

```
GET    /api/document-requests          # Liste demandes de documents
POST   /api/document-requests          # Créer demande de document
GET    /api/document-requests/:id      # Détails demande
PUT    /api/document-requests/:id      # Répondre à la demande
DELETE /api/document-requests/:id      # Supprimer demande
PATCH  /api/document-requests/:id/status  # Mettre à jour statut
```

### Messages (`/api/messages`)

```
GET    /api/messages/conversations     # Liste conversations
POST   /api/messages/conversations     # Créer conversation
GET    /api/messages/conversations/:id # Messages d'une conversation
POST   /api/messages                   # Envoyer message
PATCH  /api/messages/:id/read          # Marquer comme lu
DELETE /api/messages/:id               # Supprimer message
GET    /api/messages/unread-count      # Nombre de messages non lus
```

### Notifications (`/api/notifications`)

```
GET    /api/notifications              # Liste notifications
POST   /api/notifications              # Créer notification
GET    /api/notifications/:id          # Détails notification
PATCH  /api/notifications/:id/read     # Marquer comme lu
PATCH  /api/notifications/read-all     # Tout marquer comme lu
DELETE /api/notifications/:id          # Supprimer notification
GET    /api/notifications/unread-count # Nombre de notifications non lues
```

### Support (`/api/support`)

```
GET    /api/support/tickets            # Liste tickets de support
POST   /api/support/tickets            # Créer ticket
GET    /api/support/tickets/:id        # Détails ticket
PUT    /api/support/tickets/:id        # Mettre à jour ticket
DELETE /api/support/tickets/:id        # Supprimer ticket
POST   /api/support/tickets/:id/messages  # Ajouter message au ticket
GET    /api/support/tickets/:id/messages  # Messages du ticket
PATCH  /api/support/tickets/:id/status    # Changer statut
PATCH  /api/support/tickets/:id/assign    # Assigner ticket
```

### Feedback (`/api/feedback`)

```
GET    /api/feedback                   # Liste retours utilisateurs
POST   /api/feedback                   # Soumettre retour
GET    /api/feedback/:id               # Détails retour
PUT    /api/feedback/:id               # Mettre à jour retour
DELETE /api/feedback/:id               # Supprimer retour
PATCH  /api/feedback/:id/status        # Changer statut
```

### Offers (`/api/offers`)

```
GET    /api/offers                     # Liste offres/promotions
POST   /api/offers                     # Créer offre (avocat)
GET    /api/offers/:id                 # Détails offre
PUT    /api/offers/:id                 # Mettre à jour offre
DELETE /api/offers/:id                 # Supprimer offre
GET    /api/offers/lawyer/:lawyerId    # Offres d'un avocat
PATCH  /api/offers/:id/activate        # Activer/désactiver offre
```

### Email (`/api/email`)

```
POST   /api/email/send                 # Envoyer email
POST   /api/email/send-bulk            # Envoi groupé
POST   /api/email/contact              # Formulaire de contact
```

### Upload (`/api/upload`)

```
POST   /api/upload/avatar              # Upload avatar
POST   /api/upload/document            # Upload document
POST   /api/upload/multiple            # Upload multiple fichiers
```

### Jobs (`/api/jobs`)

```
POST   /api/jobs/send-reminders        # Déclencher envoi rappels (admin)
GET    /api/jobs/status                # Statut des jobs
POST   /api/jobs/test-email            # Tester envoi email
```

### Admin (`/api/admin`)

```
GET    /api/admin/users                # Gestion utilisateurs
GET    /api/admin/users/:id            # Détails utilisateur
PATCH  /api/admin/users/:id/role       # Changer rôle
PATCH  /api/admin/users/:id/status     # Activer/désactiver
DELETE /api/admin/users/:id            # Supprimer utilisateur
PATCH  /api/admin/users/:id/verify     # Vérifier avocat
GET    /api/admin/lawyers              # Liste avocats à vérifier
GET    /api/admin/cases                # Tous les dossiers
GET    /api/admin/stats                # Statistiques globales
GET    /api/admin/stats/users          # Stats utilisateurs
GET    /api/admin/stats/cases          # Stats dossiers
GET    /api/admin/stats/appointments   # Stats rendez-vous
GET    /api/admin/activity-logs        # Logs d'activité
GET    /api/admin/support              # Gestion tickets support
POST   /api/admin/support/:id/assign   # Assigner ticket
```

---

## Installation et Démarrage

### Prérequis

- Node.js (v20+)
- PostgreSQL (v15+)
- Docker & Docker Compose (recommandé)
- npm ou yarn

### Installation Locale

#### 1. Cloner le repository

```bash
git clone https://github.com/aelwardi/Application-de-gestion-juridique.git
cd Application-de-gestion-juridique
```

#### 2. Configuration Backend

```bash
cd backend
npm install

touch .env
```

Éditer `backend/.env` avec :
```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=gestion_juridique
DB_USER=postgres
DB_PASSWORD=postgres

JWT_SECRET=gestion-juridique-super-secret-jwt-key-2025-change-in-production
JWT_REFRESH_SECRET=gestion-juridique-super-secret-refresh-key-2025-change-in-production
JWT_ACCESS_TOKEN_EXPIRY=15m
JWT_REFRESH_TOKEN_EXPIRY=7d

CORS_ORIGIN=http://localhost:3001

FRONTEND_URL=http://localhost:3001

COOKIE_SECURE=false
COOKIE_SAME_SITE=lax

GMAIL_APP_USERNAME=votre-email@gmail.com
GMAIL_APP_PASSWORD=votre-app-password
GMAIL_USERNAME=votre-email@gmail.com
```

```bash
docker compose up -d

npm run migrate

npm run dev
```

#### 3. Configuration Frontend

```bash
cd ../frontend
npm install

touch .env
```

Éditer `frontend/.env` avec :
```env
PORT=3001
NUXT_PUBLIC_API_BASE_URL=http://localhost:3000/api
```

```bash
npm run dev
```

#### 4. Accès à l'Application

- Frontend: http://localhost:3001/
- Backend API: http://localhost:3000/api

#### 5. Récupérer le Mot de Passe Admin

Utilisez la fonctionnalité "Mot de passe oublié" avec l'email que vous avez configuré dans la migration. Vous recevrez un email pour réinitialiser le mot de passe.

### Démarrage avec Docker (Production)

```bash
docker-compose -f docker-compose.prod.yml up -d

```

---

## Variables d'Environnement

### Backend (`backend/.env`)

```env
# Application
NODE_ENV=development
PORT=3000

# Base de données PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gestion_juridique
DB_USER=postgres
DB_PASSWORD=postgres

# JWT Authentication
JWT_SECRET=gestion-juridique-super-secret-jwt-key-2025-change-in-production
JWT_REFRESH_SECRET=gestion-juridique-super-secret-refresh-key-2025-change-in-production
JWT_ACCESS_TOKEN_EXPIRY=15m
JWT_REFRESH_TOKEN_EXPIRY=7d

# CORS & Frontend
CORS_ORIGIN=http://localhost:3001
FRONTEND_URL=http://localhost:3001

# Cookies
COOKIE_SECURE=false
COOKIE_SAME_SITE=lax

# Email (Gmail SMTP)
GMAIL_APP_USERNAME=votre-email@gmail.com
GMAIL_APP_PASSWORD=votre-app-password-gmail
GMAIL_USERNAME=votre-email@gmail.com
```
### Frontend (`frontend/.env`)

```env
# Port de l'application
PORT=3001

# URL de l'API Backend
NUXT_PUBLIC_API_BASE_URL=http://localhost:3000/api
```

### Production (`docker-compose.prod.yml`)

Pour la production, assurez-vous de :
- Changer tous les secrets (JWT_SECRET, JWT_REFRESH_SECRET)
- Utiliser `COOKIE_SECURE=true`
- Utiliser `COOKIE_SAME_SITE=strict` ou `none` selon votre configuration
- Configurer un serveur SMTP professionnel ou un service comme SendGrid
- Utiliser une base de données PostgreSQL hébergée (pas en local)
- Configurer correctement `CORS_ORIGIN` avec votre domaine de production

---

## API Endpoints (Exemples)

### Authentication

- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `POST /api/auth/logout` - Déconnexion
- `POST /api/auth/refresh-token` - Rafraîchir le token
- `POST /api/auth/forgot-password` - Mot de passe oublié
- `POST /api/auth/reset-password` - Réinitialiser le mot de passe

### Users

- `GET /api/users/me` - Profil utilisateur
- `PUT /api/users/me` - Mettre à jour le profil
- `GET /api/users/:id` - Obtenir un utilisateur
- `DELETE /api/users/:id` - Supprimer un utilisateur (admin)

### Cases

- `GET /api/cases` - Liste des dossiers
- `POST /api/cases` - Créer un dossier
- `GET /api/cases/:id` - Détails d'un dossier
- `PUT /api/cases/:id` - Mettre à jour un dossier
- `DELETE /api/cases/:id` - Supprimer un dossier

### Appointments

- `GET /api/appointments` - Liste des rendez-vous
- `POST /api/appointments` - Créer un rendez-vous
- `GET /api/appointments/:id` - Détails d'un rendez-vous
- `PUT /api/appointments/:id` - Mettre à jour un rendez-vous
- `DELETE /api/appointments/:id` - Annuler un rendez-vous

### Documents

- `GET /api/documents` - Liste des documents
- `POST /api/documents/upload` - Upload un document
- `GET /api/documents/:id` - Télécharger un document
- `DELETE /api/documents/:id` - Supprimer un document

### Lawyers

- `GET /api/lawyers` - Rechercher des avocats
- `GET /api/lawyers/:id` - Profil d'un avocat
- `POST /api/lawyers/request` - Envoyer une demande à un avocat
- `GET /api/lawyers/requests` - Mes demandes reçues

---

## Fonctionnalités Techniques

### Authentification et Sécurité

#### Authentification à Deux Facteurs (2FA)
- **Implémentation TOTP** avec Speakeasy
- Génération de secret unique par utilisateur
- QR Code généré avec la bibliothèque `qrcode`
- Codes de secours (backup codes) pour accès d'urgence
- Tokens temporaires pour le processus de connexion
- Vérification des codes à 6 chiffres
- Possibilité d'activer/désactiver la 2FA

#### Gestion des Sessions
- **JWT** avec access tokens et refresh tokens
- Access token : durée courte (15 minutes)
- Refresh token : durée longue (7 jours)
- Stockage sécurisé dans les cookies HTTP-only
- Middleware d'authentification sur toutes les routes protégées

#### Sécurité des Mots de Passe
- Hashage avec **bcrypt** (rounds configurables)
- Tokens de réinitialisation à usage unique
- Expiration des tokens (24h par défaut)
- Vérification de la force du mot de passe (frontend)

### Notifications & Rappels

#### Email Automatique (Nodemailer + Gmail SMTP)
- Confirmation d'inscription
- Vérification d'email
- Réinitialisation de mot de passe
- Configuration de la 2FA
- Nouveau rendez-vous créé/modifié
- Rappels de rendez-vous (cron job)
- Nouveau message reçu
- Mise à jour de dossier
- Demande de document
- Invitation à évaluer un avocat

#### Notifications In-App
- Système de notifications en temps réel
- Badge avec compteur de notifications non lues
- Marquer comme lu/non lu
- Notifications avec priorité (low, normal, high, urgent)
- Expiration automatique des notifications
- Types de notifications :
  - Rendez-vous
  - Messages
  - Documents
  - Dossiers
  - Demandes
  - Système

#### Rappels Automatiques (Cron Jobs)
- Job quotidien pour rappels de rendez-vous
- Envoi d'emails 24h avant le rendez-vous
- Notifications in-app pour les rendez-vous du jour
- Configurable via `node-cron`

### Upload et Gestion de Fichiers

#### Upload avec Multer
- Upload d'avatars (photos de profil)
- Upload de documents juridiques
- Upload multiple de fichiers
- Validation des types de fichiers (MIME type)
- Limitation de taille configurable
- Stockage local dans `uploads/avatars/` et `uploads/documents/`

#### Organisation des Fichiers
- Renommage automatique avec UUID
- Conservation de l'extension originale
- Organisation par type (avatars vs documents)
- Métadonnées stockées en base de données

### Recherche et Filtres

#### Recherche d'Avocats
- Filtres multiples :
  - Par spécialité juridique
  - Par ville/localisation
  - Par note/évaluation
  - Par disponibilité
  - Par tarif horaire
  - Par années d'expérience
  - Par langues parlées

#### Filtres de Dossiers
- Par statut (pending, in_progress, closed, etc.)
- Par type de dossier
- Par client (pour avocats)
- Par avocat (pour clients)
- Par date d'ouverture
- Par priorité

#### Filtres de Rendez-vous
- Par date/période
- Par statut
- Par type de rendez-vous
- Par client/avocat
- Rendez-vous à venir / passés

### Cartographie (Leaflet.js)

- **Carte interactive** pour localisation des avocats
- Marqueurs sur la carte avec popup d'information
- Localisation du cabinet de l'avocat
- Localisation des rendez-vous
- Géolocalisation automatique (si autorisée)
- Composable `useGeolocation` pour gérer la géolocalisation

### Messagerie

- Conversations directes entre utilisateurs
- Conversations liées aux dossiers
- Support des pièces jointes (JSON)
- Marquer les messages comme lus
- Compteur de messages non lus
- Suppression logique (soft delete)

### Système de Support

- Tickets de support avec priorités
- Catégorisation des tickets
- Assignation aux administrateurs
- Messages publics et notes internes
- Suivi du statut (open, in_progress, resolved, closed)
- Historique complet des interactions

### Statistiques et Graphiques

#### Pour Avocats
- Nombre de dossiers actifs
- Nombre de clients
- Rendez-vous à venir
- Taux d'occupation
- Note moyenne et nombre d'avis

#### Pour Admin
- Utilisateurs par rôle (Chart.js)
- Évolution des inscriptions
- Dossiers actifs vs fermés
- Rendez-vous par période
- Tickets de support en cours

### Tâches Automatisées

- **Rappels de rendez-vous** (quotidien)
- Nettoyage des tokens expirés
- Notifications automatiques
- Mise à jour des statistiques

### Logs et Audit

- **Activity Logs** pour traçabilité
- Enregistrement des actions importantes :
  - Connexion/déconnexion
  - Création/modification/suppression d'entités
  - Changements de statut
  - Actions administratives
- Métadonnées JSON pour contexte additionnel
- IP et User-Agent enregistrés

---

## Sécurité

### Authentification
- **JWT** (JSON Web Tokens) avec access et refresh tokens
- Tokens stockés dans des cookies HTTP-only
- Expiration configurable des tokens
- Refresh token rotation
- Déconnexion avec invalidation des tokens

### Authentification à Deux Facteurs (2FA)
- Implémentation TOTP (Time-based One-Time Password)
- Secret unique par utilisateur
- Codes de secours pour accès d'urgence
- Vérification obligatoire après activation
- Possibilité de désactiver (avec vérification)

### Protection des Mots de Passe
- Hashage avec **bcrypt** (coût configurable)
- Jamais de stockage en clair
- Tokens de réinitialisation à usage unique
- Expiration des tokens de réinitialisation
- Vérification de la force du mot de passe

### Validation des Données
- Validation côté serveur avec **Zod**
- Validation côté client (frontend)
- Sanitization des entrées utilisateur
- Validation des types de fichiers uploadés
- Limitation de taille des fichiers

### Contrôle d'Accès
- **Role-Based Access Control (RBAC)**
- 4 rôles : admin, avocat, client, collaborateur
- Middleware d'authentification
- Middleware de vérification des rôles
- Permissions granulaires par ressource

### Protection CSRF
- Tokens CSRF pour les formulaires sensibles
- SameSite cookies (Lax ou Strict en production)
- Vérification de l'origine des requêtes

### CORS
- Configuration CORS stricte
- Liste blanche des origines autorisées
- Headers sécurisés
- Credentials autorisés pour les cookies

### Cookies Sécurisés
- HTTP-only cookies (pas accessible en JavaScript)
- Secure flag en production (HTTPS uniquement)
- SameSite attribute
- Expiration appropriée

### Audit et Traçabilité
- Logs d'activité (activity_logs)
- Enregistrement des actions sensibles
- Stockage de l'IP et User-Agent
- Métadonnées JSON pour contexte
- Horodatage de toutes les actions

### Protection des Données
- Données sensibles en base de données
- Pas de logs de mots de passe ou tokens
- Suppression logique (soft delete) des données
- Backup réguliers recommandés

### Bonnes Pratiques
- Variables d'environnement pour les secrets
- Pas de secrets dans le code source
- Mise à jour régulière des dépendances
- Gestion des erreurs sans leak d'information
- Rate limiting recommandé en production

---

## Déploiement

### Déploiement sur Render

L'application est actuellement déployée sur Render avec Docker.

**URL de production** : https://application-de-gestion-juridique-1.onrender.com

#### Configuration pour Render

1. **Backend** : Web Service avec Dockerfile
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Variables d'environnement configurées via Render Dashboard

2. **Frontend** : Web Service avec Dockerfile
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run preview` ou serveur de production
   - Variable `NUXT_PUBLIC_API_BASE_URL` pointant vers le backend

3. **Base de données** : PostgreSQL hébergé sur Render
   - Service PostgreSQL
   - Connexion sécurisée
   - Backups automatiques

#### Docker Production

```bash
docker-compose -f docker-compose.prod.yml build

docker-compose -f docker-compose.prod.yml up -d

docker-compose -f docker-compose.prod.yml logs -f

docker-compose -f docker-compose.prod.yml down
```

#### Variables d'Environnement en Production

**IMPORTANT** : En production, assurez-vous de :

- Changer `JWT_SECRET` et `JWT_REFRESH_SECRET` avec des valeurs aléatoires fortes
- Utiliser `NODE_ENV=production`
- Configurer `COOKIE_SECURE=true` (nécessite HTTPS)
- Utiliser `COOKIE_SAME_SITE=strict` ou `none` selon votre configuration
- Configurer un serveur SMTP professionnel (ou SendGrid, Mailgun, etc.)
- Utiliser une base de données PostgreSQL hébergée
- Configurer correctement `CORS_ORIGIN` avec votre domaine
- Configurer `FRONTEND_URL` avec votre domaine frontend

#### Migrations en Production

```bash
docker exec -it <container-backend> sh

npm run migrate
```

#### Monitoring et Logs

- Utiliser les logs Render pour le monitoring
- Configurer des alertes pour les erreurs
- Surveiller l'utilisation des ressources
- Vérifier régulièrement les logs d'activité

---

## Contribution

Les contributions sont les bienvenues ! Pour contribuer :

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

### Guidelines

- Suivre les conventions de code existantes
- Ajouter des tests pour les nouvelles fonctionnalités
- Mettre à jour la documentation si nécessaire
- S'assurer que tous les tests passent avant de soumettre

---

---

## Auteur

- **Développeur** : El Wardi, Ahmet, Zakaria, Sendu
- **Email** : a.elwardi98@gmail.com

---

## Remerciements

- Express.js pour le framework backend
- Nuxt.js pour le framework frontend
- PostgreSQL pour la base de données
- Leaflet.js pour la cartographie
- Speakeasy pour la 2FA
- Tous les contributeurs open-source

---

**Janvier 2026**
