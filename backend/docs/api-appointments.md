# Documentation API Appointments

## Vue d'ensemble

L'API Appointments gère tous les rendez-vous entre avocats et clients. Elle permet de créer, consulter, modifier et supprimer des rendez-vous, ainsi que d'obtenir des statistiques et des vues spécialisées (aujourd'hui, à venir, etc.).

## Caractéristiques principales

- ✅ CRUD complet sur les rendez-vous
- ✅ Filtrage avancé (par avocat, client, dossier, date, statut, type)
- ✅ Recherche textuelle dans titre et description
- ✅ Pagination des résultats
- ✅ Statistiques agrégées (par statut, type, localisation, période)
- ✅ Vues spécialisées (aujourd'hui, à venir)
- ✅ Actions de workflow (confirmer, annuler, terminer)
- ✅ Support de la localisation (bureau, tribunal, en ligne, etc.)
- ✅ Authentification JWT sur toutes les routes
- ✅ Typage TypeScript complet

---

## Structure de la base de données

```sql
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  lawyer_id UUID NOT NULL REFERENCES lawyers(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  appointment_type VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  location_type VARCHAR(50) CHECK (location_type IN ('office', 'court', 'client_location', 'online', 'other')),
  location_address TEXT,
  location_latitude DECIMAL(10, 8),
  location_longitude DECIMAL(11, 8),
  meeting_url VARCHAR(500),
  status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'cancelled', 'completed', 'no_show')),
  reminder_sent BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Architecture

### Backend

```
backend/src/
├── types/
│   └── appointment.types.ts       # Types et interfaces TypeScript
├── database/
│   └── queries/
│       └── appointment.queries.ts # Requêtes SQL avec JOINs
├── services/
│   └── appointment.service.ts     # Logique métier
├── controllers/
│   └── appointment.controller.ts  # Contrôleurs HTTP
├── routes/
│   └── appointment.routes.ts      # Définition des routes
└── index.ts                        # Enregistrement dans Express
```

### Frontend

```
frontend/
├── types/
│   └── appointment.ts              # Types frontend + helpers UI
└── composables/
    └── useAppointment.ts          # API wrapper avec auth JWT
```

---

## Types de données

### Énumérations

#### AppointmentType
```typescript
'consultation'        // Consultation initiale
'tribunal'           // Audience au tribunal
'rencontre_client'   // Rencontre avec le client
'expertise'          // Expertise technique
'mediation'          // Médiation
'signature'          // Signature de documents
'autre'              // Autre type
```

#### AppointmentLocationType
```typescript
'office'             // Bureau de l'avocat
'court'              // Tribunal
'client_location'    // Lieu du client
'online'             // En ligne (visio)
'other'              // Autre lieu
```

#### AppointmentStatus
```typescript
'scheduled'          // Programmé (initial)
'confirmed'          // Confirmé par le client
'cancelled'          // Annulé
'completed'          // Terminé
'no_show'            // Absence non justifiée
```

---

## Routes API

### Base URL
```
/api/appointments
```

### Liste des endpoints

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| POST | `/` | Créer un rendez-vous | ✅ |
| GET | `/` | Obtenir tous les rendez-vous | ✅ |
| GET | `/:id` | Obtenir un rendez-vous par ID | ✅ |
| PUT | `/:id` | Mettre à jour un rendez-vous | ✅ |
| DELETE | `/:id` | Supprimer un rendez-vous | ✅ |
| GET | `/lawyer/:lawyerId` | Rendez-vous d'un avocat | ✅ |
| GET | `/client/:clientId` | Rendez-vous d'un client | ✅ |
| GET | `/case/:caseId` | Rendez-vous d'un dossier | ✅ |
| GET | `/upcoming` | Rendez-vous à venir | ✅ |
| GET | `/today` | Rendez-vous d'aujourd'hui | ✅ |
| GET | `/stats` | Statistiques | ✅ |
| POST | `/:id/cancel` | Annuler un rendez-vous | ✅ |
| POST | `/:id/confirm` | Confirmer un rendez-vous | ✅ |
| POST | `/:id/complete` | Marquer comme terminé | ✅ |

---

## Détails des endpoints

### 1. Créer un rendez-vous

**Endpoint:** `POST /api/appointments`

**Body:**
```json
{
  "case_id": "uuid",               // Optionnel
  "lawyer_id": "uuid",             // Requis
  "client_id": "uuid",             // Requis
  "appointment_type": "consultation", // Requis
  "title": "Consultation initiale",   // Requis
  "description": "Première rencontre", // Optionnel
  "start_time": "2024-01-15T10:00:00Z", // Requis
  "end_time": "2024-01-15T11:00:00Z",   // Requis
  "location_type": "office",         // Requis
  "location_address": "123 Rue...",  // Optionnel
  "location_latitude": 48.8566,      // Optionnel
  "location_longitude": 2.3522,      // Optionnel
  "meeting_url": "https://...",      // Optionnel
  "notes": "Notes internes"          // Optionnel
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": { /* appointment object */ },
  "message": "Rendez-vous créé avec succès"
}
```

---

### 2. Obtenir tous les rendez-vous

**Endpoint:** `GET /api/appointments`

**Query Parameters:**
- `lawyer_id` (uuid) - Filtrer par avocat
- `client_id` (uuid) - Filtrer par client
- `case_id` (uuid) - Filtrer par dossier
- `status` (string) - Filtrer par statut
- `appointment_type` (string) - Filtrer par type
- `location_type` (string) - Filtrer par type de lieu
- `start_date` (date) - Date de début (YYYY-MM-DD)
- `end_date` (date) - Date de fin (YYYY-MM-DD)
- `search` (string) - Recherche textuelle
- `page` (number) - Page (défaut: 1)
- `limit` (number) - Résultats par page (défaut: 10)

**Exemples:**
```
GET /api/appointments?lawyer_id=xxx&status=confirmed
GET /api/appointments?start_date=2024-01-01&end_date=2024-01-31
GET /api/appointments?search=consultation&page=2&limit=20
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "case_id": "uuid",
      "lawyer_id": "uuid",
      "client_id": "uuid",
      "appointment_type": "consultation",
      "title": "Consultation initiale",
      "start_time": "2024-01-15T10:00:00Z",
      "end_time": "2024-01-15T11:00:00Z",
      "location_type": "office",
      "status": "confirmed",
      "lawyer_first_name": "Jean",
      "lawyer_last_name": "Dupont",
      "client_first_name": "Marie",
      "client_last_name": "Martin",
      "case_title": "Affaire civile",
      "created_at": "2024-01-10T12:00:00Z",
      "updated_at": "2024-01-10T12:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "totalPages": 5
  }
}
```

---

### 3. Obtenir les statistiques

**Endpoint:** `GET /api/appointments/stats?lawyer_id=xxx`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "total": 125,
    "by_status": {
      "scheduled": 30,
      "confirmed": 45,
      "cancelled": 15,
      "completed": 30,
      "no_show": 5
    },
    "by_type": {
      "consultation": 40,
      "tribunal": 35,
      "rencontre_client": 25,
      "expertise": 15,
      "mediation": 8,
      "signature": 2,
      "autre": 0
    },
    "by_location": {
      "office": 60,
      "court": 30,
      "client_location": 15,
      "online": 18,
      "other": 2
    },
    "upcoming": 25,
    "today": 3,
    "this_week": 12,
    "this_month": 35
  }
}
```

---

### 4. Obtenir les rendez-vous d'aujourd'hui

**Endpoint:** `GET /api/appointments/today?lawyer_id=xxx`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Audience au tribunal",
      "start_time": "2024-01-10T14:00:00Z",
      "end_time": "2024-01-10T16:00:00Z",
      "status": "confirmed",
      "appointment_type": "tribunal",
      "location_type": "court",
      "location_address": "Tribunal de Grande Instance",
      "client_first_name": "Marie",
      "client_last_name": "Martin"
    }
  ]
}
```

---

### 5. Obtenir les rendez-vous à venir

**Endpoint:** `GET /api/appointments/upcoming?lawyer_id=xxx&days=30&limit=10`

**Query Parameters:**
- `lawyer_id` (uuid) - Filtrer par avocat
- `client_id` (uuid) - Filtrer par client
- `days` (number) - Nombre de jours à venir (défaut: 30)
- `limit` (number) - Nombre maximum de résultats

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Consultation initiale",
      "start_time": "2024-01-15T10:00:00Z",
      "end_time": "2024-01-15T11:00:00Z",
      "status": "confirmed",
      "appointment_type": "consultation",
      "location_type": "office",
      "client_first_name": "Marie",
      "client_last_name": "Martin"
    }
  ]
}
```

---

### 6. Actions sur un rendez-vous

#### Confirmer
**Endpoint:** `POST /api/appointments/:id/confirm`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": { /* appointment with status = 'confirmed' */ },
  "message": "Rendez-vous confirmé avec succès"
}
```

#### Annuler
**Endpoint:** `POST /api/appointments/:id/cancel`

**Body:** (optionnel)
```json
{
  "notes": "Raison de l'annulation"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": { /* appointment with status = 'cancelled' */ },
  "message": "Rendez-vous annulé avec succès"
}
```

#### Terminer
**Endpoint:** `POST /api/appointments/:id/complete`

**Body:** (optionnel)
```json
{
  "notes": "Compte-rendu de la réunion"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": { /* appointment with status = 'completed' */ },
  "message": "Rendez-vous marqué comme terminé"
}
```

---

## Requêtes SQL

Les requêtes utilisent des JOINs pour récupérer les informations liées :

```sql
SELECT 
  a.*,
  u_lawyer.first_name as lawyer_first_name,
  u_lawyer.last_name as lawyer_last_name,
  u_lawyer.email as lawyer_email,
  u_client.first_name as client_first_name,
  u_client.last_name as client_last_name,
  u_client.email as client_email,
  c.case_number,
  c.title as case_title
FROM appointments a
LEFT JOIN lawyers l ON a.lawyer_id = l.id
LEFT JOIN users u_lawyer ON l.user_id = u_lawyer.id
LEFT JOIN users u_client ON a.client_id = u_client.id
LEFT JOIN cases c ON a.case_id = c.id
WHERE ...
ORDER BY a.start_time ASC
```

---

## Utilisation dans le Frontend

### Composable useAppointment

```typescript
import { useAppointment } from '~/composables/useAppointment'

const {
  createAppointment,
  getAllAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
  getAppointmentsByLawyer,
  getAppointmentsByClient,
  getAppointmentsByCase,
  getUpcomingAppointments,
  getTodayAppointments,
  getAppointmentStats,
  cancelAppointment,
  confirmAppointment,
  completeAppointment
} = useAppointment()
```

### Exemple : Dashboard

```typescript
const stats = ref({ today: 0, this_week: 0 })
const upcomingAppointments = ref([])

const loadDashboard = async (lawyerId: string) => {
  // Statistiques
  const statsRes = await getAppointmentStats(lawyerId)
  if (statsRes.success) {
    stats.value = statsRes.data
  }

  // Prochains rendez-vous
  const upcomingRes = await getUpcomingAppointments(lawyerId, { limit: 5 })
  if (upcomingRes.success) {
    upcomingAppointments.value = upcomingRes.data
  }
}
```

---

## Helpers UI

Le fichier `types/appointment.ts` contient des helpers pour l'affichage :

```typescript
// Labels en français
export const AppointmentStatusLabels = {
  scheduled: 'Programmé',
  confirmed: 'Confirmé',
  cancelled: 'Annulé',
  completed: 'Terminé',
  no_show: 'Absence'
}

// Couleurs pour badges
export const AppointmentStatusColors = {
  scheduled: '#3B82F6',  // Bleu
  confirmed: '#10B981',  // Vert
  cancelled: '#EF4444',  // Rouge
  completed: '#6B7280',  // Gris
  no_show: '#F59E0B'     // Orange
}

// Labels types
export const AppointmentTypeLabels = {
  consultation: 'Consultation',
  tribunal: 'Tribunal',
  rencontre_client: 'Rencontre client',
  expertise: 'Expertise',
  mediation: 'Médiation',
  signature: 'Signature',
  autre: 'Autre'
}

// Labels localisation
export const AppointmentLocationTypeLabels = {
  office: 'Bureau',
  court: 'Tribunal',
  client_location: 'Chez le client',
  online: 'En ligne',
  other: 'Autre'
}
```

---

## Gestion des erreurs

### Codes d'erreur

- `400` - Données invalides
- `401` - Non authentifié
- `404` - Rendez-vous non trouvé
- `500` - Erreur serveur

### Format de réponse d'erreur

```json
{
  "success": false,
  "message": "Rendez-vous non trouvé",
  "error": "Appointment with id xxx not found"
}
```

---

## Tests

### Test manuel avec curl

```bash
# Login pour obtenir le token
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"avocat.test@example.com","password":"Avocat123!"}' \
  | jq -r '.data.accessToken')

# Créer un rendez-vous
curl -X POST http://localhost:5000/api/appointments \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "lawyer_id": "xxx",
    "client_id": "yyy",
    "appointment_type": "consultation",
    "title": "Consultation initiale",
    "start_time": "2024-01-15T10:00:00Z",
    "end_time": "2024-01-15T11:00:00Z",
    "location_type": "office"
  }'

# Obtenir les rendez-vous d'un avocat
curl -X GET "http://localhost:5000/api/appointments/lawyer/xxx?status=confirmed" \
  -H "Authorization: Bearer $TOKEN"

# Obtenir les statistiques
curl -X GET "http://localhost:5000/api/appointments/stats?lawyer_id=xxx" \
  -H "Authorization: Bearer $TOKEN"
```

---

## Seeding de données

### Script de seed

```bash
# PowerShell
.\backend\scripts\seed-appointments.ps1

# Bash
./backend/scripts/seed-appointments.sh
```

Le script crée 15 rendez-vous répartis sur 3 mois avec :
- Différents types (consultation, tribunal, etc.)
- Différents statuts (scheduled, confirmed, completed)
- Différents lieux (bureau, tribunal, en ligne)
- Dates aléatoires dans le futur

---

## Intégration Dashboard

Le dashboard avocat utilise l'API appointments pour afficher :

1. **Cartes statistiques**
   - Rendez-vous aujourd'hui
   - Rendez-vous cette semaine

2. **Graphique mensuel**
   - Distribution des rendez-vous sur 12 mois
   - Données réelles de la base de données

3. **Liste des prochains rendez-vous**
   - 5 prochains rendez-vous
   - Informations complètes (client, date, lieu, statut)

---

## Prochaines étapes

- [ ] Page de gestion des rendez-vous (`/appointments`)
- [ ] Vue calendrier (FullCalendar.js)
- [ ] Vue carte avec géolocalisation
- [ ] Notifications par email avant les rendez-vous
- [ ] Synchronisation avec Google Calendar
- [ ] Export iCal

---

**Dernière mise à jour:** Décembre 2024
