# API Appointments - Documentation Complète

## Vue d'ensemble

L'API Appointments fournit un système complet de gestion des rendez-vous pour l'application de gestion juridique. Elle permet aux avocats de créer, gérer et suivre leurs rendez-vous avec les clients, incluant les consultations, audiences au tribunal, et réunions.

## Base URL

```
http://localhost:5000/api/appointments
```

## Authentification

Toutes les routes nécessitent une authentification JWT via le header `Authorization: Bearer <token>`.

## Types de Rendez-vous

- `consultation` - Consultation initiale
- `tribunal` - Audience au tribunal
- `rencontre_client` - Rencontre avec le client
- `expertise` - Expertise technique
- `mediation` - Médiation
- `signature` - Signature de documents
- `autre` - Autre type de rendez-vous

## Types de Localisation

- `office` - Bureau de l'avocat
- `court` - Tribunal
- `client_location` - Lieu du client
- `online` - En ligne (visioconférence)
- `other` - Autre lieu

## Statuts

- `scheduled` - Programmé
- `confirmed` - Confirmé
- `cancelled` - Annulé
- `completed` - Terminé
- `no_show` - Absence non justifiée

---

## Endpoints

### 1. Créer un rendez-vous

```http
POST /api/appointments
```

**Body:**
```json
{
  "case_id": "uuid",
  "lawyer_id": "uuid",
  "client_id": "uuid",
  "appointment_type": "consultation",
  "title": "Consultation initiale",
  "description": "Première rencontre avec le client",
  "start_time": "2024-01-15T10:00:00Z",
  "end_time": "2024-01-15T11:00:00Z",
  "location_type": "office",
  "location_address": "123 Rue de la Loi, Paris",
  "location_latitude": 48.8566,
  "location_longitude": 2.3522,
  "meeting_url": null,
  "notes": "Notes internes"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "case_id": "uuid",
    "lawyer_id": "uuid",
    "client_id": "uuid",
    "appointment_type": "consultation",
    "title": "Consultation initiale",
    "description": "Première rencontre avec le client",
    "start_time": "2024-01-15T10:00:00Z",
    "end_time": "2024-01-15T11:00:00Z",
    "location_type": "office",
    "location_address": "123 Rue de la Loi, Paris",
    "location_latitude": 48.8566,
    "location_longitude": 2.3522,
    "meeting_url": null,
    "status": "scheduled",
    "reminder_sent": false,
    "notes": "Notes internes",
    "created_at": "2024-01-10T12:00:00Z",
    "updated_at": "2024-01-10T12:00:00Z"
  },
  "message": "Rendez-vous créé avec succès"
}
```

---

### 2. Obtenir tous les rendez-vous (avec filtres)

```http
GET /api/appointments
```

**Query Parameters:**
- `lawyer_id` (uuid) - Filtrer par avocat
- `client_id` (uuid) - Filtrer par client
- `case_id` (uuid) - Filtrer par dossier
- `status` (string) - Filtrer par statut (scheduled, confirmed, etc.)
- `appointment_type` (string) - Filtrer par type
- `location_type` (string) - Filtrer par type de lieu
- `start_date` (date) - Date de début (YYYY-MM-DD)
- `end_date` (date) - Date de fin (YYYY-MM-DD)
- `search` (string) - Recherche dans titre/description
- `page` (number) - Numéro de page (défaut: 1)
- `limit` (number) - Nombre par page (défaut: 10)

**Exemples:**
```http
GET /api/appointments?lawyer_id=123e4567-e89b-12d3-a456-426614174000
GET /api/appointments?status=confirmed&appointment_type=tribunal
GET /api/appointments?start_date=2024-01-01&end_date=2024-01-31
GET /api/appointments?search=consultation&page=1&limit=20
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
      "description": "Première rencontre",
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

### 3. Obtenir un rendez-vous par ID

```http
GET /api/appointments/:id
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "case_id": "uuid",
    "lawyer_id": "uuid",
    "client_id": "uuid",
    "appointment_type": "consultation",
    "title": "Consultation initiale",
    "description": "Première rencontre avec le client",
    "start_time": "2024-01-15T10:00:00Z",
    "end_time": "2024-01-15T11:00:00Z",
    "location_type": "office",
    "location_address": "123 Rue de la Loi, Paris",
    "location_latitude": 48.8566,
    "location_longitude": 2.3522,
    "meeting_url": null,
    "status": "confirmed",
    "reminder_sent": true,
    "notes": "Notes internes",
    "lawyer_first_name": "Jean",
    "lawyer_last_name": "Dupont",
    "lawyer_email": "jean.dupont@example.com",
    "client_first_name": "Marie",
    "client_last_name": "Martin",
    "client_email": "marie.martin@example.com",
    "case_number": "2024-001",
    "case_title": "Affaire civile",
    "created_at": "2024-01-10T12:00:00Z",
    "updated_at": "2024-01-12T14:30:00Z"
  }
}
```

---

### 4. Mettre à jour un rendez-vous

```http
PUT /api/appointments/:id
```

**Body:** (tous les champs sont optionnels)
```json
{
  "title": "Consultation - Mise à jour",
  "start_time": "2024-01-15T11:00:00Z",
  "end_time": "2024-01-15T12:00:00Z",
  "status": "confirmed",
  "notes": "Notes mises à jour"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": { /* rendez-vous mis à jour */ },
  "message": "Rendez-vous mis à jour avec succès"
}
```

---

### 5. Supprimer un rendez-vous

```http
DELETE /api/appointments/:id
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Rendez-vous supprimé avec succès"
}
```

---

### 6. Obtenir les rendez-vous d'un avocat

```http
GET /api/appointments/lawyer/:lawyerId
```

**Query Parameters:** Mêmes filtres que GET /appointments

**Response:** `200 OK` (même format que GET /appointments)

---

### 7. Obtenir les rendez-vous d'un client

```http
GET /api/appointments/client/:clientId
```

**Query Parameters:** Mêmes filtres que GET /appointments

**Response:** `200 OK` (même format que GET /appointments)

---

### 8. Obtenir les rendez-vous d'un dossier

```http
GET /api/appointments/case/:caseId
```

**Response:** `200 OK` (même format que GET /appointments)

---

### 9. Obtenir les rendez-vous à venir

```http
GET /api/appointments/upcoming
```

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
      "lawyer_first_name": "Jean",
      "lawyer_last_name": "Dupont",
      "client_first_name": "Marie",
      "client_last_name": "Martin"
    }
  ]
}
```

---

### 10. Obtenir les rendez-vous d'aujourd'hui

```http
GET /api/appointments/today
```

**Query Parameters:**
- `lawyer_id` (uuid) - Filtrer par avocat
- `client_id` (uuid) - Filtrer par client

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
      "location_address": "Tribunal de Grande Instance"
    }
  ]
}
```

---

### 11. Obtenir les statistiques des rendez-vous

```http
GET /api/appointments/stats
```

**Query Parameters:**
- `lawyer_id` (uuid) - Filtrer par avocat

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

### 12. Annuler un rendez-vous

```http
POST /api/appointments/:id/cancel
```

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
  "data": { /* rendez-vous avec status = 'cancelled' */ },
  "message": "Rendez-vous annulé avec succès"
}
```

---

### 13. Confirmer un rendez-vous

```http
POST /api/appointments/:id/confirm
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": { /* rendez-vous avec status = 'confirmed' */ },
  "message": "Rendez-vous confirmé avec succès"
}
```

---

### 14. Marquer un rendez-vous comme terminé

```http
POST /api/appointments/:id/complete
```

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
  "data": { /* rendez-vous avec status = 'completed' */ },
  "message": "Rendez-vous marqué comme terminé"
}
```

---

## Codes d'erreur

- `400 Bad Request` - Données invalides
- `401 Unauthorized` - Token manquant ou invalide
- `404 Not Found` - Rendez-vous non trouvé
- `500 Internal Server Error` - Erreur serveur

**Exemple de réponse d'erreur:**
```json
{
  "success": false,
  "message": "Rendez-vous non trouvé",
  "error": "Appointment with id xxx not found"
}
```

---

## Exemples d'utilisation

### Créer un rendez-vous pour une consultation

```bash
curl -X POST http://localhost:5000/api/appointments \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "lawyer_id": "123e4567-e89b-12d3-a456-426614174000",
    "client_id": "123e4567-e89b-12d3-a456-426614174001",
    "appointment_type": "consultation",
    "title": "Consultation initiale",
    "start_time": "2024-01-15T10:00:00Z",
    "end_time": "2024-01-15T11:00:00Z",
    "location_type": "office"
  }'
```

### Obtenir les rendez-vous confirmés d'un avocat

```bash
curl -X GET "http://localhost:5000/api/appointments/lawyer/123e4567-e89b-12d3-a456-426614174000?status=confirmed" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Obtenir les rendez-vous d'aujourd'hui

```bash
curl -X GET "http://localhost:5000/api/appointments/today?lawyer_id=123e4567-e89b-12d3-a456-426614174000" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Confirmer un rendez-vous

```bash
curl -X POST http://localhost:5000/api/appointments/123e4567-e89b-12d3-a456-426614174000/confirm \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Notes importantes

1. **Dates et heures**: Toutes les dates sont au format ISO 8601 (UTC)
2. **Filtrage**: Les filtres peuvent être combinés pour des recherches précises
3. **Pagination**: Par défaut, limite de 10 résultats par page
4. **Authentification**: Toutes les routes nécessitent un token JWT valide
5. **Permissions**: Les utilisateurs ne peuvent voir que leurs propres rendez-vous (sauf admins)

---

## Workflow typique

1. **Créer un rendez-vous** - POST /api/appointments
2. **Confirmer le rendez-vous** - POST /api/appointments/:id/confirm
3. **Consulter les rendez-vous à venir** - GET /api/appointments/upcoming
4. **Marquer comme terminé** - POST /api/appointments/:id/complete

---

**Dernière mise à jour:** Décembre 2024
