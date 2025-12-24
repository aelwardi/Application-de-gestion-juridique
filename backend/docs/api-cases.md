# API Documentation - Cases (Dossiers)

## Base URL
`http://localhost:5000/api/cases`

Toutes les routes nécessitent une authentification (token JWT).

---

## Endpoints

### 1. Créer un nouveau dossier
**POST** `/`

**Body:**
```json
{
  "title": "Divorce contentieux",
  "description": "Description du dossier",
  "case_type": "familial",
  "priority": "medium",
  "client_id": "uuid-du-client",
  "lawyer_id": "uuid-de-l-avocat",
  "court_name": "Tribunal de Grande Instance",
  "judge_name": "Juge Dupont",
  "next_hearing_date": "2025-01-15T10:00:00",
  "estimated_duration_months": 6
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": { ... },
  "message": "Dossier créé avec succès"
}
```

---

### 2. Récupérer tous les dossiers
**GET** `/`

**Query Parameters:**
- `status`: pending | in_progress | on_hold | closed | archived
- `priority`: low | medium | high | urgent
- `case_type`: string
- `lawyer_id`: UUID
- `client_id`: UUID
- `search`: string (recherche dans title, description, case_number)
- `limit`: number
- `offset`: number

**Example:** `/api/cases?status=in_progress&priority=high&limit=10`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "case_number": "CASE-1234567890-ABC",
      "title": "Divorce contentieux",
      "status": "in_progress",
      "priority": "high",
      "client_first_name": "Jean",
      "client_last_name": "Dupont",
      "lawyer_first_name": "Marie",
      "lawyer_last_name": "Martin",
      ...
    }
  ],
  "total": 25
}
```

---

### 3. Récupérer un dossier par ID
**GET** `/:id`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "case_number": "CASE-1234567890-ABC",
    "title": "Divorce contentieux",
    "description": "...",
    "status": "in_progress",
    "priority": "high",
    "case_type": "familial",
    "client_id": "uuid",
    "lawyer_id": "uuid",
    "opening_date": "2025-01-01",
    "closing_date": null,
    "court_name": "TGI Paris",
    "judge_name": "Juge Dupont",
    "next_hearing_date": "2025-01-15T10:00:00",
    "estimated_duration_months": 6,
    "client_first_name": "Jean",
    "client_last_name": "Dupont",
    "client_email": "jean@example.com",
    "lawyer_first_name": "Marie",
    "lawyer_last_name": "Martin",
    "lawyer_email": "marie@example.com",
    "created_at": "2025-01-01T00:00:00",
    "updated_at": "2025-01-01T00:00:00"
  }
}
```

---

### 4. Mettre à jour un dossier
**PUT** `/:id`

**Body:**
```json
{
  "title": "Nouveau titre",
  "status": "in_progress",
  "priority": "urgent",
  "description": "Nouvelle description",
  "next_hearing_date": "2025-02-01T14:00:00"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": { ... },
  "message": "Dossier mis à jour avec succès"
}
```

---

### 5. Supprimer un dossier
**DELETE** `/:id`

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Dossier supprimé avec succès"
}
```

---

### 6. Assigner un avocat à un dossier
**POST** `/:id/assign-lawyer`

**Body:**
```json
{
  "lawyer_id": "uuid-de-l-avocat"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": { ... },
  "message": "Avocat assigné avec succès"
}
```

---

### 7. Récupérer les statistiques des dossiers
**GET** `/stats`

**Query Parameters:**
- `lawyer_id`: UUID (optionnel - pour filtrer par avocat)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "total": 100,
    "pending": 15,
    "in_progress": 45,
    "on_hold": 10,
    "closed": 25,
    "archived": 5,
    "by_priority": {
      "low": 20,
      "medium": 50,
      "high": 25,
      "urgent": 5
    },
    "by_type": {
      "familial": 30,
      "civil": 25,
      "pénal": 20,
      "commercial": 15,
      "administratif": 10
    }
  }
}
```

---

### 8. Récupérer les dossiers d'un avocat
**GET** `/lawyer/:lawyerId`

**Query Parameters:** (mêmes que GET `/`)
- `status`, `priority`, `case_type`, `search`, `limit`, `offset`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [ ... ],
  "total": 15
}
```

---

### 9. Récupérer les dossiers d'un client
**GET** `/client/:clientId`

**Query Parameters:** (mêmes que GET `/`)
- `status`, `priority`, `case_type`, `search`, `limit`, `offset`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [ ... ],
  "total": 3
}
```

---

### 10. Récupérer les prochaines audiences
**GET** `/upcoming-hearings`

**Query Parameters:**
- `lawyer_id`: UUID (optionnel)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "case_number": "CASE-1234567890-ABC",
      "title": "Divorce contentieux",
      "next_hearing_date": "2025-01-15T10:00:00",
      "client_first_name": "Jean",
      "client_last_name": "Dupont",
      ...
    }
  ],
  "total": 5
}
```

---

### 11. Fermer un dossier
**POST** `/:id/close`

Met le statut du dossier à `closed` et définit `closing_date` à la date actuelle.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": { ... },
  "message": "Dossier fermé avec succès"
}
```

---

### 12. Archiver un dossier
**POST** `/:id/archive`

Met le statut du dossier à `archived`.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": { ... },
  "message": "Dossier archivé avec succès"
}
```

---

## Statuts possibles
- `pending`: En attente
- `in_progress`: En cours
- `on_hold`: En suspens
- `closed`: Fermé
- `archived`: Archivé

## Priorités possibles
- `low`: Faible
- `medium`: Moyenne
- `high`: Haute
- `urgent`: Urgente

## Types de dossiers (exemples)
- `familial`: Droit de la famille
- `civil`: Droit civil
- `pénal`: Droit pénal
- `commercial`: Droit commercial
- `administratif`: Droit administratif
- `travail`: Droit du travail
- `immobilier`: Droit immobilier

---

## Codes d'erreur
- `400`: Requête invalide (données manquantes ou incorrectes)
- `401`: Non authentifié
- `404`: Dossier non trouvé
- `500`: Erreur serveur
