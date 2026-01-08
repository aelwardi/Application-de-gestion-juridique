# Application de Gestion Juridique

> Application moderne de gestion des rendez-vous, dossiers et communications juridiques pour avocats, clients et collaborateurs

## Vue d'ensemble

Cette application propose une solution complète pour la digitalisation et la facilitation de la gestion des activités juridiques. Elle permet la gestion des rendez-vous, des dossiers, des échanges entre parties, avec des fonctionnalités avancées comme la cartographie intelligente, les notifications automatiques et la messagerie en temps réel.

## Architecture du Projet

### Stack Technologique

#### Backend

- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Langage**: TypeScript
- **Base de données**: PostgreSQL 15+
- **ORM**: Prisma (migrations, type-safety)
- **API**: RESTful
- **Validation**: Zod / Joi
- **Authentication**: JWT (jsonwebtoken) + bcrypt
- **File Upload**: Multer
- **Email**: Nodemailer (SMTP)
- **SMS**: Twilio (optionnel)
- **PDF Generation**: PDFKit / Puppeteer
- **Cron Jobs**: node-cron (rappels automatiques)

#### Frontend

- **Framework**: Nuxt.js 3 (Vue.js 3 avec SSR)
- **Langage**: TypeScript
- **Mode de rendu**: Universal (SSR + CSR)
- **State Management**: Pinia (intégré Nuxt)
- **Router**: Auto-routing (file-based routing)
- **Auto-import**: Composants, composables, utils
- **UI Framework**: Vuetify 3 / Nuxt UI / Tailwind CSS
- **Maps**: Leaflet.js / Google Maps API
- **Calendar**: FullCalendar
- **Charts**: Chart.js / ApexCharts
- **HTTP Client**: $fetch / useFetch (natif Nuxt)
- **Form Validation**: VeeValidate / Zod
- **Date Management**: Day.js
- **Icons**: Nuxt Icon / Iconify
- **SEO**: Nuxt SEO Kit (meta tags, sitemap)

#### Modules Nuxt

- `@pinia/nuxt` - State management
- `@nuxtjs/tailwindcss` - Styling utility-first
- `@nuxt/image` - Optimisation d'images
- `@vueuse/nuxt` - Composables utilitaires
- `nuxt-icon` - Système d'icônes
- `@nuxtjs/color-mode` - Dark/Light mode
- `nuxt-socket-io` - WebSockets temps réel

#### DevOps & Infrastructure

- **Conteneurisation**: Docker & Docker Compose
- **CI/CD**: GitHub Actions
- **Stockage fichiers**: Local (Multer) + AWS S3 (production)
- **Notifications**: WebSockets (Socket.io)
- **Logs**: Winston / Morgan

---

## Schéma de Base de Données

### Tables Principales

#### 1. **Users** (Utilisateurs)

Table centrale pour tous les types d'utilisateurs

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
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 2. **Lawyers** (Avocats)

Informations spécifiques aux avocats

```sql
CREATE TABLE lawyers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  bar_number VARCHAR(50) UNIQUE NOT NULL,
  specialties TEXT[], -- Array de spécialités
  office_address TEXT,
  office_latitude DECIMAL(10, 8),
  office_longitude DECIMAL(11, 8),
  bio TEXT,
  years_of_experience INTEGER,
  languages TEXT[], -- Langues parlées
  availability_status VARCHAR(50) DEFAULT 'available',
  rating DECIMAL(3, 2) DEFAULT 0.00,
  total_cases INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 3. **Cases** (Dossiers)

Gestion des dossiers juridiques

```sql
CREATE TABLE cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_number VARCHAR(100) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  case_type VARCHAR(100) NOT NULL, -- Type de dossier (civil, pénal, commercial...)
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'on_hold', 'closed', 'archived')),
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lawyer_id UUID REFERENCES lawyers(id) ON DELETE SET NULL,
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

#### 4. **Appointments** (Rendez-vous)

Gestion des rendez-vous

```sql
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  lawyer_id UUID NOT NULL REFERENCES lawyers(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  appointment_type VARCHAR(100) NOT NULL, -- (consultation, tribunal, rencontre_client, expertise...)
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  location_type VARCHAR(50) CHECK (location_type IN ('office', 'court', 'client_location', 'online', 'other')),
  location_address TEXT,
  location_latitude DECIMAL(10, 8),
  location_longitude DECIMAL(11, 8),
  meeting_url VARCHAR(500), -- Pour les RDV en ligne
  status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'cancelled', 'completed', 'no_show')),
  reminder_sent BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 5. **Documents** (Documents)

Gestion des documents et fichiers

```sql
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  document_type VARCHAR(100) NOT NULL, -- (contract, evidence, court_decision, letter...)
  title VARCHAR(255) NOT NULL,
  description TEXT,
  file_name VARCHAR(255) NOT NULL,
  file_size BIGINT NOT NULL, -- En bytes
  file_type VARCHAR(100) NOT NULL, -- MIME type
  file_url VARCHAR(500) NOT NULL, -- URL de stockage (S3/MinIO)
  is_confidential BOOLEAN DEFAULT false,
  version INTEGER DEFAULT 1,
  parent_document_id UUID REFERENCES documents(id), -- Pour versioning
  tags TEXT[], -- Tags pour recherche
  upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 6. **Messages** (Messagerie)

Système de chat et messagerie

```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message_text TEXT,
  message_type VARCHAR(50) DEFAULT 'text' CHECK (message_type IN ('text', 'file', 'system', 'notification')),
  attachments JSONB, -- {files: [{name, url, type, size}]}
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP,
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 7. **Conversations** (Conversations)

Fil de discussions entre utilisateurs

```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  conversation_type VARCHAR(50) DEFAULT 'direct' CHECK (conversation_type IN ('direct', 'group', 'case')),
  title VARCHAR(255),
  participants UUID[] NOT NULL, -- Array des user_ids participants
  last_message_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 8. **Notifications** (Notifications)

Système de notifications

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  notification_type VARCHAR(100) NOT NULL, -- (appointment_reminder, document_uploaded, message_received, case_update...)
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  data JSONB, -- Données additionnelles (case_id, appointment_id, etc.)
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP,
  priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 9. **Case_Collaborators** (Collaborateurs sur dossiers)

Gestion des collaborateurs assignés aux dossiers

```sql
CREATE TABLE case_collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  collaborator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(100), -- Rôle du collaborateur (assistant, expert, co-avocat...)
  permissions JSONB, -- {can_view: true, can_edit: false, can_upload: true...}
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  assigned_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(case_id, collaborator_id)
);
```

#### 10. **Case_Status_History** (Historique des statuts)

Traçabilité des changements de statut

```sql
CREATE TABLE case_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  old_status VARCHAR(50),
  new_status VARCHAR(50) NOT NULL,
  changed_by UUID NOT NULL REFERENCES users(id),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 11. **Lawyer_Requests** (Demandes aux avocats)

Gestion des demandes de prise en charge

```sql
CREATE TABLE lawyer_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lawyer_id UUID NOT NULL REFERENCES lawyers(id) ON DELETE CASCADE,
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  request_type VARCHAR(100) NOT NULL, -- (new_case, consultation, second_opinion...)
  description TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled')),
  response_message TEXT,
  responded_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 12. **Reviews** (Évaluations)

Avis et évaluations des avocats

```sql
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lawyer_id UUID NOT NULL REFERENCES lawyers(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  case_id UUID REFERENCES cases(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_anonymous BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false, -- Vérifié si lié à un vrai dossier
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 13. **Activity_Logs** (Logs d'activité)

Audit et traçabilité

```sql
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(255) NOT NULL, -- (login, logout, document_uploaded, case_created...)
  entity_type VARCHAR(100), -- (case, document, appointment...)
  entity_id UUID,
  ip_address VARCHAR(45),
  user_agent TEXT,
  details JSONB, -- Données additionnelles
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Fonctionnalités Principales

### Pour les Avocats

#### Gestion des Rendez-vous

- Création/modification/suppression de rendez-vous
- **Calendrier interactif** (vue jour/semaine/mois)
- **Rappels automatiques** par email/SMS (24h et 2h avant)
- **Carte interactive** avec tous les rendez-vous du jour
- **Optimisation d'itinéraire** entre plusieurs rendez-vous
- Notes et commentaires sur chaque rendez-vous

#### Gestion des Dossiers

- CRUD complet des dossiers juridiques
- **Filtres avancés** (statut, type, client, date, priorité)
- **Recherche globale** dans tous les dossiers
- Suivi de l'avancement avec timeline
- Upload multiple de documents (drag & drop)
- **Export PDF** du dossier complet
- Partage de documents par email

#### Dashboard & Statistiques

- Statistiques personnelles (nombre de dossiers, rendez-vous, clients)
- Graphiques : dossiers par statut, rendez-vous par mois
- Prochains rendez-vous (aujourd'hui, cette semaine)
- Dossiers nécessitant une action
- Activité récente

#### Communication

- Messagerie en temps réel avec clients/collaborateurs
- Notifications email pour nouveaux messages
- Notifications in-app (nouveaux dossiers, messages, rendez-vous)

### Pour les Clients

#### Recherche & Sélection

- **Recherche avancée** d'avocats
  - Par spécialité juridique
  - Par localisation (carte interactive)
  - Par note/avis
  - Par disponibilité
- Profils détaillés des avocats
- Système d'évaluation et d'avis

#### Gestion de Dossiers

- Consultation de leurs dossiers en cours
- Upload de documents (pièces justificatives, preuves)
- Visualisation de l'avancement en temps réel
- Téléchargement des documents partagés
- Réception de notifications automatiques

#### Communication

- Chat direct avec leur avocat
- Demande de rendez-vous en ligne
- Notifications (email + in-app) pour :
  - Nouveau message
  - Rendez-vous confirmé/modifié
  - Mise à jour du dossier
  - Document ajouté

### Pour les Collaborateurs

- Accès aux dossiers assignés (selon permissions)
- Upload et partage de documents
- Communication avec avocats et clients
- Consultation du calendrier partagé
- Ajout de notes sur les dossiers
- Vue des tâches assignées

### Pour l'Admin

#### Gestion Utilisateurs

- CRUD complet des utilisateurs
- Attribution des rôles et permissions
- Activation/désactivation de comptes
- Vérification des avocats (validation du barreau)

#### Statistiques Globales

- Dashboard administrateur avec :
  - Nombre total d'utilisateurs par rôle
  - Nombre de dossiers actifs/fermés
  - Rendez-vous du jour/semaine
  - Activité des utilisateurs
- Graphiques d'évolution
- Export Excel/CSV des données

#### Monitoring

- Logs d'activité (qui a fait quoi et quand)
- Alertes sur activités suspectes
- Statistiques d'utilisation

---

## Structure du Projet

```
Application-de-gestion-juridique/
├── backend/                      # API Express + TypeScript
│   ├── src/
│   │   ├── config/              # Configuration (DB, env, etc.)
│   │   ├── controllers/         # Contrôleurs (logique métier)
│   │   ├── database/
│   │   │   ├── migrations/      # Migrations de la DB
│   │   │   ├── seeds/           # Données de test
│   │   │   └── queries/         # Requêtes SQL réutilisables
│   │   ├── middleware/          # Middlewares (auth, validation...)
│   │   ├── routes/              # Routes API
│   │   ├── services/            # Services (logique métier)
│   │   ├── types/               # Types TypeScript
│   │   ├── utils/               # Utilitaires
│   │   ├── validators/          # Validation des données
│   │   └── index.ts            # Point d'entrée
│   ├── tests/                   # Tests unitaires et intégration
│   ├── docker-compose.yml       # Configuration Docker
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
├── app/
│   └── app.vue                          # Point d'entrée principal
│
├── types/
│   ├── index.ts                         # Types globaux
│   ├── user.ts                          # Types User, UserRole
│   ├── lawyer.ts                        # Types Lawyer
│   ├── case.ts                          # Types Case, CaseStatus, CasePriority
│   ├── appointment.ts                   # Types Appointment, AppointmentStatus
│   ├── document.ts                      # Types Document
│   ├── message.ts                       # Types Message, Conversation
│   ├── notification.ts                  # Types Notification
│   ├── review.ts                        # Types Review
│   └── api.ts                           # Types ApiResponse, PaginatedResponse
│
├── composables/
│   ├── useApi.ts                        # Composable pour les appels API
│   ├── useAuth.ts                       # Composable authentification
│   ├── useCases.ts                      # Composable gestion dossiers
│   ├── useAppointments.ts               # Composable rendez-vous
│   ├── useDocuments.ts                  # Composable documents
│   ├── useMessages.ts                   # Composable messagerie
│   ├── useLawyers.ts                    # Composable avocats
│   ├── useNotifications.ts              # Composable notifications
│   └── useStats.ts                      # Composable statistiques
│
├── stores/
│   ├── auth.ts                          # Store authentification (Pinia)
│   ├── cases.ts                         # Store dossiers
│   ├── appointments.ts                  # Store rendez-vous
│   ├── documents.ts                     # Store documents
│   ├── messages.ts                      # Store messagerie
│   ├── notifications.ts                 # Store notifications
│   └── ui.ts                            # Store UI (sidebar, modals, etc.)
│
├── middleware/
│   ├── auth.ts                          # Middleware authentification
│   ├── role.ts                          # Middleware contrôle rôles
│   └── guest.ts                         # Middleware pages publiques
│
├── layouts/
│   ├── default.vue                      # Layout par défaut
│   ├── auth.vue                         # Layout pages authentification
│   ├── dashboard.vue                    # Layout dashboard (sidebar)
│   └── admin.vue                        # Layout admin
│
├── pages/
│   ├── index.vue                        # Page d'accueil
│   │
│   ├── auth/
│   │   ├── login.vue                    # Page connexion
│   │   ├── register.vue                 # Page inscription
│   │   ├── forgot-password.vue          # Mot de passe oublié
│   │   └── reset-password.vue           # Réinitialiser mot de passe
│   │
│   ├── dashboard/
│   │   ├── index.vue                    # Dashboard principal
│   │   ├── avocat.vue                   # Dashboard avocat
│   │   ├── client.vue                   # Dashboard client
│   │   └── admin.vue                    # Dashboard admin
│   │
│   ├── cases/
│   │   ├── index.vue                    # Liste dossiers
│   │   ├── create.vue                   # Créer dossier
│   │   └── [id].vue                     # Détails dossier
│   │       ├── index.vue                # Vue générale
│   │       ├── documents.vue            # Documents du dossier
│   │       ├── appointments.vue         # Rendez-vous du dossier
│   │       ├── collaborators.vue        # Collaborateurs
│   │       └── timeline.vue             # Historique
│   │
│   ├── appointments/
│   │   ├── index.vue                    # Liste rendez-vous
│   │   ├── calendar.vue                 # Vue calendrier
│   │   ├── map.vue                      # Vue carte
│   │   ├── create.vue                   # Créer rendez-vous
│   │   └── [id].vue                     # Détails rendez-vous
│   │
│   ├── documents/
│   │   ├── index.vue                    # Liste documents
│   │   ├── upload.vue                   # Upload documents
│   │   └── [id].vue                     # Détails/Prévisualisation
│   │
│   ├── messages/
│   │   ├── index.vue                    # Liste conversations
│   │   └── [id].vue                     # Conversation
│   │
│   ├── lawyers/
│   │   ├── index.vue                    # Recherche avocats
│   │   ├── map.vue                      # Carte avocats
│   │   └── [id].vue                     # Profil avocat
│   │
│   ├── clients/
│   │   ├── index.vue                    # Liste clients (avocat)
│   │   └── [id].vue                     # Profil client
│   │
│   ├── profile/
│   │   ├── index.vue                    # Mon profil
│   │   ├── edit.vue                     # Modifier profil
│   │   └── settings.vue                 # Paramètres
│   │
│   ├── notifications/
│   │   └── index.vue                    # Liste notifications
│   │
│   ├── reviews/
│   │   ├── index.vue                    # Mes avis
│   │   └── create.vue                   # Créer avis
│   │
│   └── admin/
│       ├── index.vue                    # Dashboard admin
│       ├── users/
│       │   ├── index.vue                # Liste utilisateurs
│       │   └── [id].vue                 # Détails utilisateur
│       ├── lawyers/
│       │   ├── index.vue                # Gestion avocats
│       │   └── requests.vue             # Demandes avocats
│       ├── cases/
│       │   └── index.vue                # Tous les dossiers
│       ├── stats/
│       │   └── index.vue                # Statistiques globales
│       └── logs/
│           └── index.vue                # Logs d'activité
│
├── components/
│   ├── ui/
│   │   ├── Button.vue                   # Bouton réutilisable
│   │   ├── Card.vue                     # Carte
│   │   ├── Modal.vue                    # Modal
│   │   ├── Input.vue                    # Input
│   │   ├── Select.vue                   # Select
│   │   ├── Badge.vue                    # Badge
│   │   ├── Table.vue                    # Tableau
│   │   └── Pagination.vue               # Pagination
│   │
│   ├── common/
│   │   ├── Navbar.vue                   # Barre navigation
│   │   ├── Sidebar.vue                  # Barre latérale
│   │   ├── Footer.vue                   # Pied de page
│   │   ├── Breadcrumb.vue               # Fil d'Ariane
│   │   ├── LoadingSpinner.vue           # Spinner chargement
│   │   └── EmptyState.vue               # État vide
│   │
│   ├── cases/
│   │   ├── CaseCard.vue                 # Carte dossier
│   │   ├── CaseList.vue                 # Liste dossiers
│   │   ├── CaseForm.vue                 # Formulaire dossier
│   │   ├── CaseFilters.vue              # Filtres dossiers
│   │   ├── CaseStatusBadge.vue          # Badge statut
│   │   └── CaseTimeline.vue             # Timeline dossier
│   │
│   ├── appointments/
│   │   ├── AppointmentCard.vue          # Carte rendez-vous
│   │   ├── AppointmentList.vue          # Liste rendez-vous
│   │   ├── AppointmentForm.vue          # Formulaire rendez-vous
│   │   ├── AppointmentCalendar.vue      # Calendrier (FullCalendar)
│   │   └── AppointmentMap.vue           # Carte rendez-vous
│   │
│   ├── documents/
│   │   ├── DocumentCard.vue             # Carte document
│   │   ├── DocumentList.vue             # Liste documents
│   │   ├── DocumentUpload.vue           # Upload document
│   │   ├── DocumentPreview.vue          # Prévisualisation
│   │   └── DocumentFilters.vue          # Filtres documents
│   │
│   ├── messages/
│   │   ├── ConversationList.vue         # Liste conversations
│   │   ├── MessageList.vue              # Liste messages
│   │   ├── MessageInput.vue             # Input message
│   │   └── MessageBubble.vue            # Bulle message
│   │
│   ├── lawyers/
│   │   ├── LawyerCard.vue               # Carte avocat
│   │   ├── LawyerList.vue               # Liste avocats
│   │   ├── LawyerFilters.vue            # Filtres avocats
│   │   ├── LawyerMap.vue                # Carte avocats
│   │   └── LawyerProfile.vue            # Profil avocat
│   │
│   ├── notifications/
│   │   ├── NotificationBell.vue         # Icône notifications
│   │   ├── NotificationDropdown.vue     # Dropdown notifications
│   │   └── NotificationItem.vue         # Item notification
│   │
│   ├── stats/
│   │   ├── StatCard.vue                 # Carte statistique
│   │   ├── LineChart.vue                # Graphique ligne
│   │   ├── PieChart.vue                 # Graphique camembert
│   │   └── BarChart.vue                 # Graphique barre
│   │
│   └── forms/
│       ├── LoginForm.vue                # Formulaire connexion
│       ├── RegisterForm.vue             # Formulaire inscription
│       ├── CaseForm.vue                 # Formulaire dossier
│       ├── AppointmentForm.vue          # Formulaire rendez-vous
│       └── ReviewForm.vue               # Formulaire avis
│
├── assets/
│   ├── css/
│   │   └── main.css                     # Styles Tailwind
│   ├── images/
│   └── icons/
│
├── utils/
│   ├── formatters.ts                    # Formatage dates, nombres
│   ├── validators.ts                    # Validations
│   ├── constants.ts                     # Constantes
│   └── helpers.ts                       # Fonctions utilitaires
│
├── plugins/
│   ├── api.ts                           # Plugin API
│   └── socket.ts                        # Plugin WebSocket
│
├── public/
│   ├── favicon.ico
│   └── images/
│
├── .env                                 # Variables environnement
├── nuxt.config.ts                       # Configuration Nuxt
├── tailwind.config.ts                   # Configuration Tailwind
├── tsconfig.json                        # Configuration TypeScript
└── package.json                         # Dépendances
│
├── docs/                        # Documentation
├── .gitignore
└── README.md
```

---

## API Endpoints Principaux

### Authentication (`/api/auth`)

```
POST   /api/auth/register        # Inscription
POST   /api/auth/login           # Connexion (retourne JWT)
POST   /api/auth/logout          # Déconnexion
POST   /api/auth/refresh-token   # Rafraîchir le token
POST   /api/auth/forgot-password # Mot de passe oublié
POST   /api/auth/reset-password  # Réinitialiser mot de passe
```

### Users (`/api/users`)

```
GET    /api/users/me            # Profil utilisateur connecté
PUT    /api/users/me            # Mettre à jour profil
PATCH  /api/users/me/password   # Changer mot de passe
POST   /api/users/upload-avatar # Upload photo de profil
```

### Lawyers (`/api/lawyers`)

```
GET    /api/lawyers                    # Liste/recherche avocats (filtres)
GET    /api/lawyers/:id                # Détails avocat
GET    /api/lawyers/:id/reviews        # Avis sur avocat
POST   /api/lawyers/:id/request        # Envoyer demande
GET    /api/lawyers/requests           # Mes demandes reçues
PATCH  /api/lawyers/requests/:id       # Accepter/refuser demande
GET    /api/lawyers/:id/stats          # Statistiques avocat
```

### Cases (`/api/cases`)

```
GET    /api/cases              # Liste dossiers (pagination, filtres)
POST   /api/cases              # Créer dossier
GET    /api/cases/:id          # Détails dossier
PUT    /api/cases/:id          # Mettre à jour dossier
DELETE /api/cases/:id          # Supprimer dossier
GET    /api/cases/:id/timeline # Historique des modifications
POST   /api/cases/:id/collaborators    # Ajouter collaborateur
DELETE /api/cases/:id/collaborators/:userId  # Retirer
GET    /api/cases/:id/export   # Export PDF du dossier
```

### Appointments (`/api/appointments`)

```
GET    /api/appointments           # Liste rendez-vous (filtres)
POST   /api/appointments           # Créer rendez-vous
GET    /api/appointments/:id       # Détails rendez-vous
PUT    /api/appointments/:id       # Modifier rendez-vous
DELETE /api/appointments/:id       # Annuler rendez-vous
GET    /api/appointments/calendar  # Vue calendrier
GET    /api/appointments/map       # Rendez-vous sur carte
GET    /api/appointments/today     # Rendez-vous du jour
```

### Documents (`/api/documents`)

```
GET    /api/documents              # Liste documents
POST   /api/documents/upload       # Upload (multiple)
GET    /api/documents/:id          # Télécharger document
GET    /api/documents/:id/preview  # Prévisualisation
DELETE /api/documents/:id          # Supprimer document
POST   /api/documents/:id/share    # Partager par email
```

### Messages (`/api/messages`)

```
GET    /api/conversations          # Liste conversations
POST   /api/conversations          # Créer conversation
GET    /api/conversations/:id      # Messages d'une conversation
POST   /api/conversations/:id/messages  # Envoyer message
PATCH  /api/messages/:id/read      # Marquer comme lu
GET    /api/messages/unread-count  # Nombre non lus
```

### Notifications (`/api/notifications`)

```
GET    /api/notifications          # Liste notifications
PATCH  /api/notifications/:id/read # Marquer comme lu
PATCH  /api/notifications/read-all # Tout marquer lu
DELETE /api/notifications/:id      # Supprimer
```

### Reviews (`/api/reviews`)

```
POST   /api/reviews                # Créer avis
GET    /api/reviews/lawyer/:id     # Avis d'un avocat
PUT    /api/reviews/:id            # Modifier avis
DELETE /api/reviews/:id            # Supprimer avis
```

### Stats (`/api/stats`)

```
GET    /api/stats/dashboard        # Stats dashboard (selon rôle)
GET    /api/stats/cases            # Stats dossiers
GET    /api/stats/appointments     # Stats rendez-vous
GET    /api/stats/activity         # Activité récente
```

### Admin (`/api/admin`)

```
GET    /api/admin/users            # Gestion utilisateurs
PATCH  /api/admin/users/:id/role   # Changer rôle
PATCH  /api/admin/users/:id/status # Activer/désactiver
GET    /api/admin/logs             # Logs système
GET    /api/admin/stats            # Stats globales
GET    /api/admin/export           # Export données (CSV/Excel)
```

---

## Installation et Démarrage

### Prérequis

- Node.js (v18+)
- PostgreSQL (v14+)
- Docker & Docker Compose (optionnel mais recommandé)
- npm ou yarn

### Installation

#### 1. Cloner le repository

```bash
git clone https://github.com/aelwardi/Application-de-gestion-juridique.git
cd Application-de-gestion-juridique
```

#### 2. Backend Setup

```bash
cd backend
npm install

# Créer le fichier .env
cp .env.example .env
# Éditer .env avec vos configurations

# Lancer la base de données avec Docker
docker-compose up -d

# Exécuter les migrations
npm run migrate

# (Optionnel) Charger les données de test
npm run seed

# Démarrer le serveur de développement
npm run dev
```

#### 3. Frontend Setup (Nuxt.js)

```bash
cd ../frontend
npm install

# Créer le fichier .env
cp .env.example .env
# Éditer .env avec l'URL de l'API

# Démarrer le serveur de développement
npm run dev
# L'application sera accessible sur http://localhost:3000
```

### Démarrage avec Docker (Recommandé)

```bash
# À la racine du projet
docker-compose up -d

# L'application sera accessible sur:
# - Frontend: http://localhost:3000
# - Backend API: http://localhost:5000
# - PostgreSQL: localhost:5432
```

---

## 🔧 Variables d'Environnement

### Backend (.env)

```env
# Application
NODE_ENV=development
PORT=5000
API_URL=http://localhost:5000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=legal_management
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_EXPIRES_IN=30d

# File Storage (S3/MinIO)
STORAGE_PROVIDER=s3
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=eu-west-1
AWS_S3_BUCKET=legal-docs

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_password
SMTP_FROM=noreply@legal-app.com

# Maps API
GOOGLE_MAPS_API_KEY=your_google_maps_key

# WebSockets
SOCKET_PORT=5001
```

### Frontend (.env)

```env
# API Configuration
NUXT_PUBLIC_API_URL=http://localhost:5000/api
NUXT_PUBLIC_SOCKET_URL=http://localhost:5001

# Google Maps
NUXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key

# App Configuration
NUXT_PUBLIC_APP_NAME=Legal Management App
NUXT_PUBLIC_APP_URL=http://localhost:3000
```

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

## Tests

```bash
# Backend
cd backend
npm run test              # Tests unitaires
npm run test:integration  # Tests d'intégration
npm run test:coverage     # Couverture des tests

# Frontend
cd frontend
npm run test              # Tests avec Vitest
npm run test:e2e          # Tests end-to-end avec Playwright
```

---

## Fonctionnalités Techniques

### Notifications & Rappels

- **Email automatique** (Nodemailer)
  - Confirmation d'inscription
  - Nouveau rendez-vous créé/modifié
  - Rappels 24h et 2h avant rendez-vous
  - Nouveau message reçu
  - Mise à jour de dossier
  - Document partagé
- **Notifications in-app** (temps réel)
  - Badge avec compteur de non-lus
  - Liste déroulante des notifications
  - Marquer comme lu/non lu
- **SMS** (Twilio - optionnel)
  - Rappels de rendez-vous urgents

### Export & Génération

- **Export PDF**
  - Dossier complet avec tous les documents
  - Calendrier mensuel des rendez-vous
  - Rapport de statistiques
- **Export Excel/CSV** (Admin)
  - Liste des utilisateurs
  - Dossiers avec filtres
  - Historique des rendez-vous

### Recherche & Filtres

- **Recherche globale**
  - Dans tous les dossiers
  - Dans tous les documents
  - Dans les messages
- **Filtres avancés**
  - Dossiers : statut, type, client, date, priorité
  - Rendez-vous : date, type, statut, avocat
  - Avocats : spécialité, localisation, note
  - Multi-critères combinables

### Cartographie

- **Carte interactive** (Leaflet.js ou Google Maps)
  - Affichage des avocats par localisation
  - Rendez-vous du jour sur carte
  - Calcul d'itinéraire optimisé
  - Estimation du temps de trajet

### Statistiques & Dashboard

- **Pour Avocats**
  - Nombre de dossiers actifs/fermés
  - Rendez-vous à venir (aujourd'hui, semaine)
  - Graphique : dossiers par statut (pie chart)
  - Graphique : rendez-vous par mois (line chart)
  - Activité récente
- **Pour Admin**
  - Utilisateurs par rôle (bar chart)
  - Évolution des inscriptions (line chart)
  - Dossiers actifs vs fermés (pie chart)
  - Taux d'activité

### Tâches Automatisées (Cron Jobs)

- Envoi de rappels de rendez-vous (tous les jours à 8h)
- Notification des rendez-vous du jour (chaque matin)
- Nettoyage des anciens logs (hebdomadaire)
- Backup automatique base de données (quotidien)

### Interface Responsive

- Design adaptatif (mobile, tablette, desktop)
- Menu hamburger sur mobile
- Calendrier adapté aux petits écrans
- Upload par drag & drop ou bouton mobile

---

## Sécurité

- Authentification JWT avec refresh tokens
- Hashage des mots de passe avec bcrypt (10 rounds)
- Validation des entrées (Zod)
- Protection CSRF
- Rate limiting (express-rate-limit)
- Helmet.js pour sécuriser les headers HTTP
- CORS configuré strictement
- Permissions basées sur les rôles (RBAC)
- Upload sécurisé (validation type/taille fichiers)
- SQL Injection prevention (Prisma ORM)
- XSS protection (sanitization)
- Logs d'audit complets (Winston)

---

## Déploiement

### Docker Production

```bash
# Build des images
docker-compose -f docker-compose.prod.yml build

# Démarrer en production
docker-compose -f docker-compose.prod.yml up -d
```

### CI/CD

- Configuration GitHub Actions pour tests automatiques
- Déploiement automatique sur AWS/DigitalOcean/Heroku
- Migrations automatiques

---

## 🤝 Contribution

Les contributions sont les bienvenues ! Pour contribuer :

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

---

## License

Ce projet est sous licence MIT.

---

## 👥 Équipe

- **Développeur Principal** : [El Wardi]
- **Repository** : [GitHub](https://github.com/aelwardi/Application-de-gestion-juridique)

---

## 📞 Contact

Pour toute question ou suggestion :

- Email : contact@legal-app.com
- GitHub Issues : [Créer une issue](https://github.com/aelwardi/Application-de-gestion-juridique/issues)

---

## Roadmap (1 Mois)

### Semaine 1 - Backend Foundation

- [x] Configuration projet (Express + TypeScript)
- [x] Setup PostgreSQL + Prisma
- [x] Schema de base de données (13 tables)
- [ ] Authentication (JWT + bcrypt)
- [ ] API Users (register, login, profile)
- [ ] Middleware (auth, validation, error handling)
- [ ] Configuration Docker

### Semaine 2 - Core Features Backend

- [ ] API Cases (CRUD + filtres)
- [ ] API Appointments (CRUD + calendar)
- [ ] API Documents (upload Multer + download)
- [ ] API Lawyers (profil, recherche, stats)
- [ ] API Messages (conversations, temps réel)
- [ ] Système de notifications (email + in-app)
- [ ] Cron jobs pour rappels automatiques

### Semaine 3 - Frontend (Nuxt.js)

- [ ] Setup Nuxt 3 + Tailwind/Vuetify + Pinia
- [ ] Configuration nuxt.config.ts (modules, runtimeConfig)
- [ ] Layouts (default, auth, dashboard)
- [ ] Pages d'authentification (login, register)
- [ ] Middleware d'authentification et rôles
- [ ] Dashboard par rôle (avocat, client, admin)
- [ ] Pages Dossiers (/cases/\*) avec filtres
- [ ] Pages Rendez-vous (/appointments/\*) avec calendrier
- [ ] Pages Documents avec upload multiple
- [ ] Messagerie temps réel (Socket.io)
- [ ] Système de notifications

### Semaine 4 - Polish & Features Bonus

- [ ] Page recherche avocats (carte + filtres)
- [ ] Système d'évaluation (reviews)
- [ ] Statistiques et graphiques (Chart.js)
- [ ] Export PDF des dossiers (PDFKit)
- [ ] Optimisation d'itinéraire (Google Maps API)
- [ ] Tests unitaires essentiels
- [ ] Documentation API (Swagger/Postman)
- [ ] Déploiement (Docker Compose)

### Fonctionnalités Prioritaires (Must Have)

1. Authentification JWT
2. Gestion utilisateurs (CRUD)
3. Gestion dossiers (CRUD + filtres)
4. Gestion rendez-vous (CRUD + calendrier)
5. Upload/download documents
6. Messagerie temps réel
7. Notifications email
8. Dashboard avec stats basiques

### Fonctionnalités Bonus (Nice to Have)

- Cartographie des rendez-vous
- Graphiques avancés
- Export PDF
- Système d'avis
- Rappels SMS (Twilio)
- Recherche globale (Elasticsearch - si temps)

---

**Dernière mise à jour** : Novembre 2025
