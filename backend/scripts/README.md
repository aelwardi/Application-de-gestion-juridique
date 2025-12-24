# Scripts de Seeding

Ce dossier contient les scripts pour peupler la base de données avec des données de test.

## Scripts disponibles

### 1. seed-appointments

Crée des rendez-vous de test pour l'application.

**Fichiers:**
- `seed-appointments.ts` - Script TypeScript principal
- `seed-appointments.ps1` - Script PowerShell pour Windows
- `seed-appointments.sh` - Script Bash pour Linux/Mac

**Utilisation:**

```bash
# PowerShell (Windows)
.\scripts\seed-appointments.ps1

# Bash (Linux/Mac)
./scripts/seed-appointments.sh

# Direct avec ts-node
npx ts-node scripts/seed-appointments.ts
```

**Données créées:**
- 15 rendez-vous répartis sur 3 mois
- Types variés : consultation, tribunal, rencontre_client, expertise, mediation
- Statuts variés : scheduled, confirmed, completed
- Lieux variés : office, court, client_location, online
- Dates aléatoires dans les 90 prochains jours

**Prérequis:**
- Base de données PostgreSQL en cours d'exécution
- Tables `users`, `lawyers` et `cases` déjà peuplées
- Variables d'environnement configurées (.env)

---

### 2. seed-cases

Crée des dossiers de test.

**Utilisation:**

```bash
# PowerShell (Windows)
.\scripts\seed-cases.ps1

# Bash (Linux/Mac)
./scripts/seed-cases.sh
```

**Données créées:**
- 8 dossiers avec différents statuts
- 1 client et 1 avocat associés
- Dates d'audiences futures aléatoires

---

## Ordre d'exécution recommandé

1. `seed.ts` - Crée les utilisateurs, avocats et clients de base
2. `seed-cases.ps1` / `seed-cases.sh` - Crée les dossiers
3. `seed-appointments.ps1` / `seed-appointments.sh` - Crée les rendez-vous

## Configuration

Tous les scripts utilisent les variables d'environnement du fichier `.env` :

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=legal_management
DB_USER=postgres
DB_PASSWORD=your_password
```

## Nettoyage

Les scripts suppriment automatiquement les données existantes avant de créer de nouvelles données :

```sql
DELETE FROM appointments;  -- Pour seed-appointments
DELETE FROM cases;         -- Pour seed-cases
```

⚠️ **Attention:** N'exécutez pas ces scripts en production !

---

**Dernière mise à jour:** Décembre 2024
