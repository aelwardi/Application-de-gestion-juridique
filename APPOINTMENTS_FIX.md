# Correction du Schéma Appointments

## Problème Identifié

La table `appointments` référençait `users.id` pour les colonnes `lawyer_id` et `client_id`, alors qu'elle devrait référencer respectivement `lawyers.id` et `clients.id`.

## Solution Implémentée

### 1. Migration SQL (011_fix_appointments_foreign_keys.sql)

**Modifications apportées :**
- Suppression des anciennes contraintes de foreign key
- Ajout des nouvelles contraintes :
  - `lawyer_id` → `lawyers(id)` ON DELETE CASCADE
  - `client_id` → `clients(id)` ON DELETE CASCADE
- Ajout des colonnes manquantes du schéma original :
  - `location_type` VARCHAR(50)
  - `location_address` TEXT
  - `location_latitude` DECIMAL(10, 8)
  - `location_longitude` DECIMAL(11, 8)
  - `meeting_url` VARCHAR(500)
- Élargissement des types d'appointments pour inclure tous les types du README

### 2. Backend - Types TypeScript

**Fichier:** `backend/src/types/appointment.types.ts`

**Modifications :**
- Interface `Appointment` mise à jour avec tous les champs location
- Interface `CreateAppointmentDTO` avec tous les champs
- Interface `UpdateAppointmentDTO` avec tous les champs
- Commentaires ajoutés pour clarifier que :
  - `lawyer_id` référence `lawyers.id`
  - `client_id` référence `clients.id`

### 3. Backend - Queries

**Fichier:** `backend/src/database/queries/appointment.queries.ts`

**Modifications :**

#### createAppointment
```typescript
INSERT INTO appointments (
  case_id, lawyer_id, client_id, appointment_type, title, description,
  start_time, end_time, location, location_type, location_address, 
  location_latitude, location_longitude, meeting_url, status, notes
)
```

#### getAllAppointments & getAppointmentById
Jointures corrigées :
```sql
FROM appointments a
LEFT JOIN cases c ON a.case_id = c.id
INNER JOIN lawyers l ON a.lawyer_id = l.id
INNER JOIN users lu ON l.user_id = lu.id
INNER JOIN clients cl ON a.client_id = cl.id
INNER JOIN users cu ON cl.user_id = cu.id
```

#### updateAppointment
Ajout de tous les champs location dans l'update dynamique.

### 4. Script de Seeding

**Fichier:** `backend/scripts/seed-appointments.ts`

**Modifications :**
- Requête pour obtenir `clients.id` au lieu de `users.id WHERE role = 'client'`
- Logs ajoutés pour afficher les IDs trouvés
- Messages d'erreur plus clairs

### 5. Scripts d'Exécution

**Créés :**
- `scripts/fix-appointments.ps1` (Windows PowerShell)
- `scripts/fix-appointments.sh` (Linux/Mac Bash)

Ces scripts :
1. Exécutent la migration SQL
2. Re-seedent les appointments avec les bons IDs

## Structure Finale

```sql
CREATE TABLE appointments (
  id UUID PRIMARY KEY,
  case_id UUID REFERENCES cases(id),
  lawyer_id UUID REFERENCES lawyers(id),     -- ✅ Corrigé
  client_id UUID REFERENCES clients(id),      -- ✅ Corrigé
  appointment_type VARCHAR(100),
  title VARCHAR(255),
  description TEXT,
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  location TEXT,
  location_type VARCHAR(50),                  -- ✅ Ajouté
  location_address TEXT,                      -- ✅ Ajouté
  location_latitude DECIMAL(10, 8),           -- ✅ Ajouté
  location_longitude DECIMAL(11, 8),          -- ✅ Ajouté
  meeting_url VARCHAR(500),                   -- ✅ Ajouté
  status VARCHAR(50),
  reminder_sent BOOLEAN,
  notes TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

## Relations de Données

```
appointments.lawyer_id  →  lawyers.id  →  users.id (via lawyers.user_id)
appointments.client_id  →  clients.id  →  users.id (via clients.user_id)
```

## Avantages de cette Structure

1. **Séparation des rôles** : Les appointments sont clairement entre des avocats (lawyers) et des clients (clients), pas entre des users génériques
2. **Intégrité référentielle** : Impossible de créer un appointment avec un user qui n'est pas avocat ou client
3. **Cascade automatique** : Suppression d'un lawyer ou client supprime automatiquement ses appointments
4. **Conformité au README** : La structure correspond exactement au schéma documenté

## Instructions de Déploiement

### Sur Windows (PowerShell)
```powershell
cd backend
.\scripts\fix-appointments.ps1
```

### Sur Linux/Mac (Bash)
```bash
cd backend
chmod +x scripts/fix-appointments.sh
./scripts/fix-appointments.sh
```

### Manuellement
```bash
cd backend

# 1. Exécuter la migration
psql -U postgres -d legal_management -f src/database/migrations/011_fix_appointments_foreign_keys.sql

# 2. Re-seeder les appointments
npx ts-node scripts/seed-appointments.ts

# 3. Redémarrer le backend
npm run dev
```

## Vérification

Après la migration, vérifiez que :

1. Les foreign keys sont correctes :
```sql
SELECT 
    conname AS constraint_name,
    conrelid::regclass AS table_name,
    confrelid::regclass AS referenced_table
FROM pg_constraint
WHERE conrelid = 'appointments'::regclass
AND contype = 'f';
```

2. Les colonnes existent :
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'appointments'
ORDER BY ordinal_position;
```

3. Les appointments ont des IDs valides :
```sql
SELECT COUNT(*) FROM appointments;
SELECT * FROM appointments LIMIT 1;
```

## Impact sur le Frontend

Aucun changement nécessaire côté frontend, car :
- Les endpoints API restent identiques
- Les IDs sont toujours des UUIDs
- Le frontend n'a pas besoin de connaître la structure interne des tables

## Notes Importantes

⚠️ **ATTENTION** : Cette migration va :
- Supprimer toutes les contraintes existantes sur appointments
- Recréer les contraintes avec les bonnes références
- Si vous avez des données existantes, elles doivent avoir des `lawyer_id` et `client_id` valides dans les tables `lawyers` et `clients`

💡 **Conseil** : Faites un backup de la base de données avant d'exécuter la migration en production.
