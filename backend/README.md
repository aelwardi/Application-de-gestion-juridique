# Documentation Prisma - Application de Gestion Juridique

## Table des matières
1. [Introduction](#introduction)
2. [Configuration](#configuration)
3. [Schéma de base de données](#schéma-de-base-de-données)
4. [Commandes Prisma](#commandes-prisma)
5. [Modèles de données](#modèles-de-données)
6. [Relations](#relations)
7. [Migrations](#migrations)
8. [Requêtes Prisma](#requêtes-prisma)
9. [Bonnes pratiques](#bonnes-pratiques)

---

## Introduction

Prisma est un ORM (Object-Relational Mapping) moderne pour Node.js et TypeScript qui facilite l'accès à la base de données PostgreSQL de l'application.

### Avantages de Prisma
- ✅ **Type-safety** : Génération automatique de types TypeScript
- ✅ **Auto-complétion** : Support IDE complet
- ✅ **Migrations** : Gestion des évolutions du schéma
- ✅ **Relations** : Gestion simplifiée des relations entre tables
- ✅ **Transactions** : Support natif des transactions ACID

---

## Configuration

### Installation

```bash
npm install prisma @prisma/client --save-dev
npm install @prisma/client
```

### Fichier de configuration `.env`

```env
DATABASE_URL=postgresql://postgres:MonMotDePasse123!@localhost:5434/legal_management
```

### Fichier `prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

---

## Schéma de base de données

### Vue d'ensemble

L'application utilise 4 tables principales :
- `migrations` : Historique des migrations
- `users` : Utilisateurs de l'application
- `avocat` (lawyers) : Profils des avocats
- `client` (clients) : Profils des clients

### Architecture

```
users (parent)
  ├── avocat (1:1)
  └── client (1:1)
```

---

## Commandes Prisma

### Commandes de base

#### 1. **Initialiser Prisma**
```bash
npx prisma init
```
Crée le dossier `prisma/` et le fichier `schema.prisma`.

#### 2. **Générer le client Prisma**
```bash
npx prisma generate
```
Génère le client TypeScript dans `node_modules/.prisma/client/`.

#### 3. **Synchroniser le schéma avec la base de données**
```bash
npx prisma db push
```
Applique les changements du schéma sans créer de migration.

#### 4. **Créer une migration**
```bash
npx prisma migrate dev --name nom_de_la_migration
```
Crée une nouvelle migration et l'applique.

#### 5. **Appliquer les migrations en production**
```bash
npx prisma migrate deploy
```

#### 6. **Ouvrir Prisma Studio (interface graphique)**
```bash
npx prisma studio
```
Lance une interface web sur `http://localhost:5555` pour visualiser/éditer les données.

#### 7. **Formater le schéma**
```bash
npx prisma format
```

#### 8. **Valider le schéma**
```bash
npx prisma validate
```

#### 9. **Réinitialiser la base de données**
```bash
npx prisma migrate reset
```
⚠️ **Attention** : Supprime toutes les données et recrée la base.

---

## Modèles de données

### Model `users`

```prisma
model users {
  id                  String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  email               String    @unique @db.VarChar(255)
  password_hash       String    @db.VarChar(255)
  role                String    @db.VarChar(50)
  first_name          String    @db.VarChar(100)
  last_name           String    @db.VarChar(100)
  phone               String?   @db.VarChar(20)
  profile_picture_url String?   @db.VarChar(500)
  is_active           Boolean?  @default(true)
  is_verified         Boolean?  @default(false)
  last_login_at       DateTime? @db.Timestamp(6)
  created_at          DateTime? @default(now()) @db.Timestamp(6)
  updated_at          DateTime? @default(now()) @db.Timestamp(6)
  
  // Relations
  avocat              avocat?
  client              client?
}
```

**Champs clés :**
- `@id` : Clé primaire
- `@unique` : Contrainte d'unicité
- `@default()` : Valeur par défaut
- `@db.Uuid` : Type PostgreSQL spécifique
- `?` : Champ optionnel (nullable)

### Model `avocat`

```prisma
model avocat {
  id                  String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  user_id             String   @unique @db.Uuid
  user                users    @relation(fields: [user_id], references: [id], onDelete: Cascade)
  bar_number          String   @unique @db.VarChar(50)
  specialties         String[] @db.Text
  office_address      String?  @db.Text
  office_latitude     Decimal? @db.Decimal(10, 8)
  office_longitude    Decimal? @db.Decimal(11, 8)
  bio                 String?  @db.Text
  years_of_experience Int?
  languages           String[] @db.Text
  availability_status String?  @default("available") @db.VarChar(50)
  rating              Decimal  @default(0.00) @db.Decimal(3, 2)
  total_cases         Int      @default(0)
  created_at          DateTime @default(now()) @db.Timestamp(6)
  updated_at          DateTime @default(now()) @db.Timestamp(6)

  @@map("lawyers")
}
```

**Spécificités :**
- `String[]` : Tableau de chaînes
- `Decimal` : Nombres décimaux (latitude, longitude, rating)
- `@@map("lawyers")` : Nom de la table en base différent du modèle
- `onDelete: Cascade` : Suppression en cascade

### Model `client`

```prisma
model client {
  id                  String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  user_id             String   @unique @db.Uuid
  user                users    @relation(fields: [user_id], references: [id], onDelete: Cascade)
  address             String?  @db.Text
  city                String?  @db.VarChar(100)
  postal_code         String?  @db.VarChar(20)
  country             String?  @db.VarChar(100)
  date_of_birth       DateTime? @db.Date
  occupation          String?  @db.VarChar(100)
  company_name        String?  @db.VarChar(255)
  emergency_contact   String?  @db.VarChar(100)
  emergency_phone     String?  @db.VarChar(20)
  notes               String?  @db.Text
  created_at          DateTime @default(now()) @db.Timestamp(6)
  updated_at          DateTime @default(now()) @db.Timestamp(6)

  @@map("clients")
}
```

---

## Relations

### Types de relations

#### 1. **One-to-One (1:1)**

Relation entre `users` et `avocat` :

```prisma
// Dans users
avocat avocat?

// Dans avocat
user_id String @unique @db.Uuid
user    users  @relation(fields: [user_id], references: [id], onDelete: Cascade)
```

**Explication :**
- `user_id` : Clé étrangère
- `@unique` : Garantit la relation 1:1
- `fields: [user_id]` : Champ local
- `references: [id]` : Champ référencé dans `users`
- `onDelete: Cascade` : Supprime l'avocat si l'utilisateur est supprimé

#### 2. **Suppression en cascade**

```prisma
onDelete: Cascade  // Supprime les enfants
onDelete: SetNull  // Met à null
onDelete: Restrict // Empêche la suppression
onDelete: NoAction // Pas d'action
```

---

## Migrations

### Workflow de migration

1. **Modifier le schéma** `prisma/schema.prisma`
2. **Créer la migration**
   ```bash
   npx prisma migrate dev --name add_new_field
   ```
3. **Vérifier la migration** dans `prisma/migrations/`
4. **Générer le client**
   ```bash
   npx prisma generate
   ```

### Exemple de migration

```bash
# Ajouter un champ 'website' au model avocat
npx prisma migrate dev --name add_website_to_avocat
```

Prisma crée automatiquement le fichier SQL :
```sql
-- CreateTable
ALTER TABLE "lawyers" ADD COLUMN "website" VARCHAR(255);
```

### Historique des migrations

```bash
# Voir l'état des migrations
npx prisma migrate status

# Appliquer les migrations en attente
npx prisma migrate deploy

# Annuler la dernière migration (dev uniquement)
npx prisma migrate reset
```

---

## Requêtes Prisma

### Initialisation du client

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
```

### CRUD Operations

#### **CREATE**

```typescript
// Créer un utilisateur simple
const user = await prisma.users.create({
  data: {
    email: 'test@mail.com',
    password_hash: 'hashed',
    role: 'client',
    first_name: 'Jean',
    last_name: 'Dupont',
  },
});

// Créer avec relation
const avocat = await prisma.avocat.create({
  data: {
    bar_number: 'BAR123',
    specialties: ['Droit civil'],
    languages: ['français'],
    user: {
      connect: { id: userId } // Lier à un utilisateur existant
    }
  },
  include: {
    user: true // Inclure les données utilisateur
  }
});

// Créer avec relation imbriquée
const avocatWithUser = await prisma.avocat.create({
  data: {
    bar_number: 'BAR456',
    specialties: ['Droit pénal'],
    languages: ['français'],
    user: {
      create: { // Créer un nouvel utilisateur
        email: 'avocat@mail.com',
        password_hash: 'hashed',
        role: 'avocat',
        first_name: 'Marie',
        last_name: 'Martin',
      }
    }
  },
  include: {
    user: true
  }
});
```

#### **READ**

```typescript
// Trouver un élément unique
const user = await prisma.users.findUnique({
  where: { id: 'uuid' }
});

// Trouver le premier correspondant
const avocat = await prisma.avocat.findFirst({
  where: {
    specialties: { has: 'Droit civil' }
  }
});

// Trouver tous
const clients = await prisma.client.findMany({
  where: {
    city: 'Paris'
  },
  include: {
    user: true
  },
  orderBy: {
    created_at: 'desc'
  },
  take: 10, // Limite
  skip: 0   // Offset
});

// Recherche avec relations
const avocatWithUser = await prisma.avocat.findUnique({
  where: { id: 'uuid' },
  include: {
    user: {
      select: {
        email: true,
        first_name: true,
        last_name: true
      }
    }
  }
});

// Filtres avancés
const avocats = await prisma.avocat.findMany({
  where: {
    AND: [
      { rating: { gte: 4.0 } }, // >= 4.0
      { years_of_experience: { gte: 5 } },
      { specialties: { hasSome: ['Droit commercial', 'Droit fiscal'] } }
    ]
  }
});
```

#### **UPDATE**

```typescript
// Mise à jour simple
const updatedUser = await prisma.users.update({
  where: { id: 'uuid' },
  data: {
    phone: '0612345678',
    is_verified: true
  }
});

// Mise à jour avec relations
const updatedAvocat = await prisma.avocat.update({
  where: { id: 'uuid' },
  data: {
    bio: 'Nouvelle bio',
    rating: 4.8,
    user: {
      update: {
        phone: '0698765432'
      }
    }
  },
  include: {
    user: true
  }
});

// Mise à jour multiple
const updateMany = await prisma.avocat.updateMany({
  where: {
    availability_status: 'available'
  },
  data: {
    availability_status: 'busy'
  }
});
```

#### **DELETE**

```typescript
// Supprimer un élément
const deletedClient = await prisma.client.delete({
  where: { id: 'uuid' }
});

// Supprimer plusieurs
const deleteMany = await prisma.users.deleteMany({
  where: {
    is_active: false
  }
});

// Suppression avec cascade (automatique)
const deletedUser = await prisma.users.delete({
  where: { id: 'uuid' }
  // L'avocat ou client lié sera automatiquement supprimé
});
```

### Transactions

```typescript
// Transaction simple
const result = await prisma.$transaction([
  prisma.users.create({ data: userData }),
  prisma.avocat.create({ data: avocatData })
]);

// Transaction interactive
const result = await prisma.$transaction(async (tx) => {
  // Créer l'utilisateur
  const user = await tx.users.create({
    data: {
      email: 'test@mail.com',
      password_hash: 'hashed',
      role: 'avocat',
      first_name: 'Jean',
      last_name: 'Dupont',
    }
  });

  // Créer l'avocat lié
  const avocat = await tx.avocat.create({
    data: {
      user_id: user.id,
      bar_number: 'BAR789',
      specialties: ['Droit commercial'],
      languages: ['français'],
    }
  });

  return { user, avocat };
});

// En cas d'erreur, tout est annulé (rollback)
```

### Agrégations

```typescript
// Compter
const count = await prisma.avocat.count({
  where: {
    availability_status: 'available'
  }
});

// Agrégations
const stats = await prisma.avocat.aggregate({
  _avg: {
    rating: true,
    years_of_experience: true
  },
  _max: {
    total_cases: true
  },
  _min: {
    rating: true
  },
  _sum: {
    total_cases: true
  }
});

// Grouper
const groupByCity = await prisma.client.groupBy({
  by: ['city'],
  _count: {
    id: true
  },
  orderBy: {
    _count: {
      id: 'desc'
    }
  }
});
```

### Requêtes brutes (Raw SQL)

```typescript
// Requête SELECT
const users = await prisma.$queryRaw`
  SELECT * FROM users WHERE role = 'avocat'
`;

// Requête avec paramètres
const email = 'test@mail.com';
const user = await prisma.$queryRaw`
  SELECT * FROM users WHERE email = ${email}
`;

// Exécuter une commande SQL
await prisma.$executeRaw`
  UPDATE users SET is_active = true WHERE role = 'client'
`;
```

---

## Bonnes pratiques

### 1. **Gestion de l'instance Prisma**

❌ **Mauvais** : Créer une instance à chaque fois
```typescript
const prisma = new PrismaClient();
// Risque de fuites mémoire
```

✅ **Bon** : Instance singleton
```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query', 'error', 'warn'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

### 2. **Fermer les connexions**

```typescript
// À la fin de l'application
await prisma.$disconnect();
```

### 3. **Gestion des erreurs**

```typescript
try {
  const user = await prisma.users.create({ data: userData });
} catch (error) {
  if (error.code === 'P2002') {
    // Violation de contrainte d'unicité
    console.error('Email déjà utilisé');
  } else if (error.code === 'P2025') {
    // Enregistrement non trouvé
    console.error('Utilisateur non trouvé');
  }
}
```

**Codes d'erreur Prisma courants :**
- `P2002` : Contrainte d'unicité violée
- `P2003` : Contrainte de clé étrangère violée
- `P2025` : Enregistrement non trouvé
- `P1001` : Impossible de se connecter à la base de données

### 4. **Utiliser `select` au lieu de `include` pour optimiser**

❌ **Moins performant** :
```typescript
const avocat = await prisma.avocat.findUnique({
  where: { id },
  include: { user: true } // Récupère tous les champs
});
```

✅ **Plus performant** :
```typescript
const avocat = await prisma.avocat.findUnique({
  where: { id },
  include: {
    user: {
      select: {
        email: true,
        first_name: true,
        last_name: true
      }
    }
  }
});
```

### 5. **Pagination**

```typescript
const page = 1;
const limit = 20;

const clients = await prisma.client.findMany({
  skip: (page - 1) * limit,
  take: limit,
  orderBy: {
    created_at: 'desc'
  }
});

const total = await prisma.client.count();
```

### 6. **Validation des données**

```typescript
import { z } from 'zod';

const createUserSchema = z.object({
  email: z.string().email(),
  password_hash: z.string().min(8),
  first_name: z.string().min(2),
  last_name: z.string().min(2),
  role: z.enum(['admin', 'avocat', 'client', 'collaborateur']),
});

// Avant d'insérer
const validatedData = createUserSchema.parse(userData);
await prisma.users.create({ data: validatedData });
```

### 7. **Indexes pour optimiser les performances**

```prisma
model users {
  // ...
  @@index([email])
  @@index([role])
}

model avocat {
  // ...
  @@index([bar_number])
  @@index([specialties])
}
```

### 8. **Middleware Prisma**

```typescript
prisma.$use(async (params, next) => {
  // Avant la requête
  console.log(`Query: ${params.model}.${params.action}`);
  const before = Date.now();

  // Exécuter la requête
  const result = await next(params);

  // Après la requête
  const after = Date.now();
  console.log(`Duration: ${after - before}ms`);

  return result;
});
```

---

## Ressources

- 📚 [Documentation officielle Prisma](https://www.prisma.io/docs)
- 🎓 [Prisma Examples](https://github.com/prisma/prisma-examples)
- 🛠️ [Prisma Studio](https://www.prisma.io/studio)
- 💬 [Prisma Discord](https://discord.gg/prisma)
- 📖 [Prisma Data Guide](https://www.prisma.io/dataguide)

---

## Commandes de débogage

```bash
# Voir la configuration
npx prisma debug

# Introspection de la base existante
npx prisma db pull

# Pousser le schéma sans migration
npx prisma db push

# Voir les logs
npx prisma studio --port 5555
```

---

## Scripts npm personnalisés

Ajoute ces scripts à [`package.json`](backend/package.json ) :

```json
{
  "scripts": {
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:migrate:prod": "prisma migrate deploy",
    "prisma:studio": "prisma studio",
    "prisma:reset": "prisma migrate reset --force",
    "prisma:seed": "ts-node prisma/seed.ts"
  }
}
```

---
## API Avocats - Documentation Détaillée

### Vue d'ensemble

L'API Avocats permet de gérer les profils des avocats et leurs utilisateurs associés. Elle offre des fonctionnalités CRUD complètes avec création automatique de l'utilisateur lors de l'enregistrement d'un avocat.

### Base URL

```
http://localhost:5000/api/avocats
```

---

### Endpoints

#### 1. **Créer un avocat**

Crée automatiquement un utilisateur avec le rôle "avocat" et le profil avocat associé dans une transaction.

**Endpoint**
```
POST /api/avocats
```

**Body (JSON)**
```json
{
  "user": {
    "email": "avocat.test@mail.com",
    "password_hash": "hashedpassword123",
    "first_name": "Pierre",
    "last_name": "Legrand",
    "phone": "0698765432",
    "profile_picture_url": "https://example.com/avatar.jpg"
  },
  "bar_number": "BAR88888",
  "specialties": ["Droit commercial", "Droit des sociétés"],
  "office_address": "25 rue de la Paix, Paris",
  "office_latitude": 48.8698,
  "office_longitude": 2.3310,
  "bio": "Avocat d'affaires avec 15 ans d'expérience.",
  "years_of_experience": 15,
  "languages": ["français", "anglais", "allemand"],
  "availability_status": "available"
}
```

**Paramètres du body**

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| `user.email` | string | Oui | Email unique de l'avocat |
| `user.password_hash` | string | Oui | Mot de passe hashé (bcrypt) |
| `user.first_name` | string | Oui | Prénom |
| `user.last_name` | string | Oui | Nom de famille |
| `user.phone` | string | Non | Numéro de téléphone |
| `user.profile_picture_url` | string | Non | URL de la photo de profil |
| `bar_number` | string | Oui | Numéro d'inscription au barreau (unique) |
| `specialties` | string[] | Oui | Liste des spécialités juridiques |
| `office_address` | string | Non | Adresse du cabinet |
| `office_latitude` | number | Non | Latitude GPS du cabinet |
| `office_longitude` | number | Non | Longitude GPS du cabinet |
| `bio` | string | Non | Biographie/présentation |
| `years_of_experience` | number | Non | Années d'expérience |
| `languages` | string[] | Oui | Langues parlées |
| `availability_status` | string | Non | Statut de disponibilité (défaut: "available") |
| `rating` | number | Non | Note moyenne (défaut: 0) |
| `total_cases` | number | Non | Nombre total de dossiers traités (défaut: 0) |

**Réponse (201 Created)**
```json
{
  "status": "SUCCESS",
  "message": "Avocat et utilisateur créés avec succès",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "user_id": "660e8400-e29b-41d4-a716-446655440001",
    "bar_number": "BAR88888",
    "specialties": ["Droit commercial", "Droit des sociétés"],
    "office_address": "25 rue de la Paix, Paris",
    "office_latitude": 48.8698,
    "office_longitude": 2.3310,
    "bio": "Avocat d'affaires avec 15 ans d'expérience.",
    "years_of_experience": 15,
    "languages": ["français", "anglais", "allemand"],
    "availability_status": "available",
    "rating": 0,
    "total_cases": 0,
    "created_at": "2025-12-17T10:30:00.000Z",
    "updated_at": "2025-12-17T10:30:00.000Z",
    "user": {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "email": "avocat.test@mail.com",
      "role": "avocat",
      "first_name": "Pierre",
      "last_name": "Legrand",
      "phone": "0698765432",
      "profile_picture_url": "https://example.com/avatar.jpg",
      "is_active": true,
      "is_verified": false,
      "created_at": "2025-12-17T10:30:00.000Z"
    }
  }
}
```

**Erreurs possibles**
- `400 Bad Request` : Données invalides ou email/bar_number déjà utilisé
- `500 Internal Server Error` : Erreur serveur

---

#### 2. **Récupérer tous les avocats**

Retourne la liste de tous les avocats avec leurs informations utilisateur.

**Endpoint**
```
GET /api/avocats
```

**Réponse (200 OK)**
```json
{
  "status": "SUCCESS",
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "user_id": "660e8400-e29b-41d4-a716-446655440001",
      "bar_number": "BAR88888",
      "specialties": ["Droit commercial"],
      "office_address": "25 rue de la Paix, Paris",
      "rating": 4.5,
      "total_cases": 150,
      "user": {
        "id": "660e8400-e29b-41d4-a716-446655440001",
        "email": "avocat.test@mail.com",
        "first_name": "Pierre",
        "last_name": "Legrand",
        "profile_picture_url": "https://example.com/avatar.jpg"
      }
    }
  ]
}
```

---

#### 3. **Récupérer un avocat par ID**

Retourne les détails d'un avocat spécifique.

**Endpoint**
```
GET /api/avocats/:id
```

**Paramètres URL**
- `id` (UUID) : Identifiant de l'avocat

**Exemple**
```
GET /api/avocats/550e8400-e29b-41d4-a716-446655440000
```

**Réponse (200 OK)**
```json
{
  "status": "SUCCESS",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "user_id": "660e8400-e29b-41d4-a716-446655440001",
    "bar_number": "BAR88888",
    "specialties": ["Droit commercial", "Droit des sociétés"],
    "office_address": "25 rue de la Paix, Paris",
    "office_latitude": 48.8698,
    "office_longitude": 2.3310,
    "bio": "Avocat d'affaires avec 15 ans d'expérience.",
    "years_of_experience": 15,
    "languages": ["français", "anglais", "allemand"],
    "availability_status": "available",
    "rating": 4.8,
    "total_cases": 180,
    "user": {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "email": "avocat.test@mail.com",
      "role": "avocat",
      "first_name": "Pierre",
      "last_name": "Legrand",
      "phone": "0698765432",
      "is_active": true
    }
  }
}
```

**Erreurs**
- `404 Not Found` : Avocat non trouvé

---

#### 4. **Récupérer un avocat par email**

Recherche un avocat via l'email de son compte utilisateur.

**Endpoint**
```
GET /api/avocats/email/:email
```

**Paramètres URL**
- `email` (string) : Adresse email de l'avocat

**Exemple**
```
GET /api/avocats/email/avocat.test@mail.com
```

**Réponse (200 OK)**
```json
{
  "status": "SUCCESS",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "bar_number": "BAR88888",
    "specialties": ["Droit commercial"],
    "user": {
      "email": "avocat.test@mail.com",
      "first_name": "Pierre",
      "last_name": "Legrand"
    }
  }
}
```

**Erreurs**
- `404 Not Found` : Aucun avocat trouvé avec cet email

---

#### 5. **Mettre à jour un avocat**

Met à jour les informations d'un avocat (ne met pas à jour les données utilisateur).

**Endpoint**
```
PUT /api/avocats/:id
```

**Paramètres URL**
- `id` (UUID) : Identifiant de l'avocat

**Body (JSON)** - Tous les champs sont optionnels
```json
{
  "bio": "Nouvelle biographie mise à jour",
  "years_of_experience": 16,
  "availability_status": "busy",
  "office_address": "Nouvelle adresse",
  "specialties": ["Droit pénal", "Droit du travail"]
}
```

**Réponse (200 OK)**
```json
{
  "status": "SUCCESS",
  "message": "Avocat mis à jour avec succès",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "bio": "Nouvelle biographie mise à jour",
    "years_of_experience": 16,
    "availability_status": "busy"
  }
}
```

**Erreurs**
- `404 Not Found` : Avocat non trouvé
- `400 Bad Request` : Données invalides

---

#### 6. **Supprimer un avocat**

Supprime un avocat et son utilisateur associé (cascade).

**Endpoint**
```
DELETE /api/avocats/:id
```

**Paramètres URL**
- `id` (UUID) : Identifiant de l'avocat

**Réponse (200 OK)**
```json
{
  "status": "SUCCESS",
  "message": "Avocat supprimé avec succès"
}
```

**Erreurs**
- `404 Not Found` : Avocat non trouvé
- `500 Internal Server Error` : Erreur lors de la suppression

---

### Modèles de données

#### CreateAvocatInput

```typescript
interface CreateAvocatInput {
  user: {
    email: string;
    password_hash: string;
    first_name: string;
    last_name: string;
    phone?: string;
    profile_picture_url?: string;
  };
  bar_number: string;
  specialties: string[];
  office_address?: string;
  office_latitude?: number;
  office_longitude?: number;
  bio?: string;
  years_of_experience?: number;
  languages: string[];
  availability_status?: string;
  rating?: number;
  total_cases?: number;
}
```

#### Avocat (Response)

```typescript
interface Avocat {
  id: string;
  user_id: string;
  bar_number: string;
  specialties: string[];
  office_address?: string;
  office_latitude?: number;
  office_longitude?: number;
  bio?: string;
  years_of_experience?: number;
  languages: string[];
  availability_status?: string;
  rating: number;
  total_cases: number;
  created_at: Date;
  updated_at: Date;
  user?: {
    id: string;
    email: string;
    role: string;
    first_name: string;
    last_name: string;
    phone?: string;
    profile_picture_url?: string;
    is_active: boolean;
    is_verified: boolean;
  };
}
```

---

### Notes techniques

#### Transaction automatique
Lors de la création d'un avocat, une transaction Prisma garantit que :
- Si la création de l'utilisateur échoue, aucun avocat n'est créé
- Si la création de l'avocat échoue, l'utilisateur est rollback
- Les deux opérations réussissent ensemble ou échouent ensemble

#### Suppression en cascade
La suppression d'un avocat entraîne automatiquement la suppression de son utilisateur associé grâce à la contrainte `ON DELETE CASCADE` dans le schéma de base de données.

#### Inclusion automatique
Toutes les requêtes GET incluent automatiquement les données utilisateur via la relation Prisma `include: { user: true }`.

---

### Exemples de tests (cURL)

#### Créer un avocat
```bash
curl -X POST http://localhost:5000/api/avocats \
  -H "Content-Type: application/json" \
  -d '{
    "user": {
      "email": "test@mail.com",
      "password_hash": "hashed123",
      "first_name": "Jean",
      "last_name": "Dupont",
      "phone": "0612345678"
    },
    "bar_number": "BAR12345",
    "specialties": ["Droit civil"],
    "office_address": "10 rue de Paris",
    "years_of_experience": 10,
    "languages": ["français"]
  }'
```

#### Récupérer tous les avocats
```bash
curl http://localhost:5000/api/avocats
```

#### Récupérer par email
```bash
curl http://localhost:5000/api/avocats/email/test@mail.com
```

#### Mettre à jour
```bash
curl -X PUT http://localhost:5000/api/avocats/{id} \
  -H "Content-Type: application/json" \
  -d '{
    "bio": "Nouvelle bio",
    "availability_status": "busy"
  }'
```

#### Supprimer
```bash
curl -X DELETE http://localhost:5000/api/avocats/{id}
```

---

## API Clients - Documentation Détaillée

### Vue d'ensemble

L'API Clients permet de gérer les profils des clients et leurs utilisateurs associés. Elle offre des fonctionnalités CRUD complètes avec création automatique de l'utilisateur lors de l'enregistrement d'un client.

### Base URL

```
http://localhost:5000/api/clients
```

---

### Endpoints

#### 1. **Créer un client**

Crée automatiquement un utilisateur avec le rôle "client" et le profil client associé dans une transaction.

**Endpoint**
```
POST /api/clients
```

**Body (JSON)**
```json
{
  "user": {
    "email": "client.test@mail.com",
    "password_hash": "hashedpassword123",
    "first_name": "Sophie",
    "last_name": "Martin",
    "phone": "0612345678",
    "profile_picture_url": "https://example.com/avatar.jpg"
  },
  "address": "15 avenue des Champs",
  "city": "Paris",
  "postal_code": "75008",
  "country": "France",
  "date_of_birth": "1990-05-15T00:00:00.000Z",
  "occupation": "Ingénieur",
  "company_name": "Tech Corp",
  "emergency_contact": "Marie Martin",
  "emergency_phone": "0698765432",
  "notes": "Client VIP"
}
```

**Paramètres du body**

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| `user.email` | string | Oui | Email unique du client |
| `user.password_hash` | string | Oui | Mot de passe hashé (bcrypt) |
| `user.first_name` | string | Oui | Prénom |
| `user.last_name` | string | Oui | Nom de famille |
| `user.phone` | string | Non | Numéro de téléphone |
| `user.profile_picture_url` | string | Non | URL de la photo de profil |
| `address` | string | Non | Adresse postale |
| `city` | string | Non | Ville |
| `postal_code` | string | Non | Code postal |
| `country` | string | Non | Pays |
| `date_of_birth` | string (ISO-8601) | Non | Date de naissance (format: YYYY-MM-DDTHH:mm:ss.sssZ) |
| `occupation` | string | Non | Profession |
| `company_name` | string | Non | Nom de l'entreprise |
| `emergency_contact` | string | Non | Contact d'urgence |
| `emergency_phone` | string | Non | Téléphone d'urgence |
| `notes` | string | Non | Notes additionnelles |

**Réponse (201 Created)**
```json
{
  "status": "SUCCESS",
  "message": "Client et utilisateur créés avec succès",
  "data": {
    "id": "750e8400-e29b-41d4-a716-446655440000",
    "user_id": "860e8400-e29b-41d4-a716-446655440001",
    "address": "15 avenue des Champs",
    "city": "Paris",
    "postal_code": "75008",
    "country": "France",
    "date_of_birth": "1990-05-15T00:00:00.000Z",
    "occupation": "Ingénieur",
    "company_name": "Tech Corp",
    "emergency_contact": "Marie Martin",
    "emergency_phone": "0698765432",
    "notes": "Client VIP",
    "created_at": "2025-12-20T10:30:00.000Z",
    "updated_at": "2025-12-20T10:30:00.000Z",
    "user": {
      "id": "860e8400-e29b-41d4-a716-446655440001",
      "email": "client.test@mail.com",
      "role": "client",
      "first_name": "Sophie",
      "last_name": "Martin",
      "phone": "0612345678",
      "profile_picture_url": "https://example.com/avatar.jpg",
      "is_active": true,
      "is_verified": false,
      "created_at": "2025-12-20T10:30:00.000Z"
    }
  }
}
```

**Erreurs possibles**
- `400 Bad Request` : Données invalides ou email déjà utilisé
- `500 Internal Server Error` : Erreur serveur

---

#### 2. **Récupérer tous les clients**

Retourne la liste de tous les clients avec leurs informations utilisateur.

**Endpoint**
```
GET /api/clients
```

**Réponse (200 OK)**
```json
{
  "status": "SUCCESS",
  "data": [
    {
      "id": "750e8400-e29b-41d4-a716-446655440000",
      "user_id": "860e8400-e29b-41d4-a716-446655440001",
      "address": "15 avenue des Champs",
      "city": "Paris",
      "postal_code": "75008",
      "country": "France",
      "occupation": "Ingénieur",
      "company_name": "Tech Corp",
      "user": {
        "id": "860e8400-e29b-41d4-a716-446655440001",
        "email": "client.test@mail.com",
        "first_name": "Sophie",
        "last_name": "Martin",
        "profile_picture_url": "https://example.com/avatar.jpg"
      }
    }
  ]
}
```

---

#### 3. **Récupérer un client par ID**

Retourne les détails d'un client spécifique.

**Endpoint**
```
GET /api/clients/:id
```

**Paramètres URL**
- `id` (UUID) : Identifiant du client

**Exemple**
```
GET /api/clients/750e8400-e29b-41d4-a716-446655440000
```

**Réponse (200 OK)**
```json
{
  "status": "SUCCESS",
  "data": {
    "id": "750e8400-e29b-41d4-a716-446655440000",
    "user_id": "860e8400-e29b-41d4-a716-446655440001",
    "address": "15 avenue des Champs",
    "city": "Paris",
    "postal_code": "75008",
    "country": "France",
    "date_of_birth": "1990-05-15T00:00:00.000Z",
    "occupation": "Ingénieur",
    "company_name": "Tech Corp",
    "emergency_contact": "Marie Martin",
    "emergency_phone": "0698765432",
    "notes": "Client VIP",
    "user": {
      "id": "860e8400-e29b-41d4-a716-446655440001",
      "email": "client.test@mail.com",
      "role": "client",
      "first_name": "Sophie",
      "last_name": "Martin",
      "phone": "0612345678",
      "is_active": true
    }
  }
}
```

**Erreurs**
- `404 Not Found` : Client non trouvé

---

#### 4. **Récupérer un client par email**

Recherche un client via l'email de son compte utilisateur.

**Endpoint**
```
GET /api/clients/email/:email
```

**Paramètres URL**
- `email` (string) : Adresse email du client

**Exemple**
```
GET /api/clients/email/client.test@mail.com
```

**Réponse (200 OK)**
```json
{
  "status": "SUCCESS",
  "data": {
    "id": "750e8400-e29b-41d4-a716-446655440000",
    "address": "15 avenue des Champs",
    "city": "Paris",
    "occupation": "Ingénieur",
    "user": {
      "email": "client.test@mail.com",
      "first_name": "Sophie",
      "last_name": "Martin"
    }
  }
}
```

**Erreurs**
- `404 Not Found` : Aucun client trouvé avec cet email

---

#### 5. **Mettre à jour un client**

Met à jour les informations d'un client (ne met pas à jour les données utilisateur).

**Endpoint**
```
PUT /api/clients/:id
```

**Paramètres URL**
- `id` (UUID) : Identifiant du client

**Body (JSON)** - Tous les champs sont optionnels
```json
{
  "address": "Nouvelle adresse",
  "city": "Lyon",
  "postal_code": "69001",
  "occupation": "Directeur technique",
  "notes": "Client prioritaire"
}
```

**Réponse (200 OK)**
```json
{
  "status": "SUCCESS",
  "message": "Client mis à jour avec succès",
  "data": {
    "id": "750e8400-e29b-41d4-a716-446655440000",
    "address": "Nouvelle adresse",
    "city": "Lyon",
    "postal_code": "69001",
    "occupation": "Directeur technique",
    "notes": "Client prioritaire"
  }
}
```

**Erreurs**
- `404 Not Found` : Client non trouvé
- `500 Internal Server Error` : Erreur lors de la mise à jour

---

#### 6. **Supprimer un client**

Supprime un client et son utilisateur associé (cascade).

**Endpoint**
```
DELETE /api/clients/:id
```

**Paramètres URL**
- `id` (UUID) : Identifiant du client

**Réponse (200 OK)**
```json
{
  "status": "SUCCESS",
  "message": "Client supprimé avec succès"
}
```

**Erreurs**
- `404 Not Found` : Client non trouvé
- `500 Internal Server Error` : Erreur lors de la suppression

---

### Modèles de données

#### CreateClientInput

```typescript
interface CreateClientInput {
  user: {
    email: string;
    password_hash: string;
    first_name: string;
    last_name: string;
    phone?: string;
    profile_picture_url?: string;
  };
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  date_of_birth?: Date;
  occupation?: string;
  company_name?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  notes?: string;
}
```

#### Client (Response)

```typescript
interface Client {
  id: string;
  user_id: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  date_of_birth?: Date;
  occupation?: string;
  company_name?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  notes?: string;
  created_at: Date;
  updated_at: Date;
  user?: {
    id: string;
    email: string;
    role: string;
    first_name: string;
    last_name: string;
    phone?: string;
    profile_picture_url?: string;
    is_active: boolean;
    is_verified: boolean;
  };
}
```

---

### Notes techniques

#### Transaction automatique
Lors de la création d'un client, une transaction Prisma garantit que :
- Si la création de l'utilisateur échoue, aucun client n'est créé
- Si la création du client échoue, l'utilisateur est rollback
- Les deux opérations réussissent ensemble ou échouent ensemble

#### Format de date
Le champ `date_of_birth` doit être au format ISO-8601 complet : `YYYY-MM-DDTHH:mm:ss.sssZ`
Exemple : `"1990-05-15T00:00:00.000Z"`

Le service convertit automatiquement la chaîne en objet `Date` avant l'insertion.

#### Suppression en cascade
La suppression d'un client entraîne automatiquement la suppression de son utilisateur associé grâce à la contrainte `ON DELETE CASCADE` dans le schéma de base de données.

#### Inclusion automatique
Toutes les requêtes GET incluent automatiquement les données utilisateur via la relation Prisma `include: { user: true }`.

---

### Exemples de tests (cURL)

#### Créer un client
```bash
curl -X POST http://localhost:5000/api/clients \
  -H "Content-Type: application/json" \
  -d '{
    "user": {
      "email": "nouveau.client@mail.com",
      "password_hash": "hashed123",
      "first_name": "Thomas",
      "last_name": "Bernard",
      "phone": "0687654321"
    },
    "address": "10 rue de la République",
    "city": "Marseille",
    "postal_code": "13001",
    "country": "France",
    "date_of_birth": "1985-08-20T00:00:00.000Z",
    "occupation": "Chef de projet",
    "company_name": "Innovate SA"
  }'
```

#### Récupérer tous les clients
```bash
curl http://localhost:5000/api/clients
```

#### Récupérer par ID
```bash
curl http://localhost:5000/api/clients/750e8400-e29b-41d4-a716-446655440000
```

#### Récupérer par email
```bash
curl http://localhost:5000/api/clients/email/client.test@mail.com
```

#### Mettre à jour
```bash
curl -X PUT http://localhost:5000/api/clients/750e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json" \
  -d '{
    "city": "Bordeaux",
    "postal_code": "33000",
    "notes": "Client fidèle depuis 2020"
  }'
```

#### Supprimer
```bash
curl -X DELETE http://localhost:5000/api/clients/750e8400-e29b-41d4-a716-446655440000
```

---

### Différences avec l'API Avocats

| Caractéristique | API Avocats | API Clients |
|----------------|-------------|-------------|
| **Champs métier** | `bar_number`, `specialties`, `rating`, `total_cases` | `address`, `city`, `occupation`, `company_name` |
| **Géolocalisation** | Oui (`office_latitude`, `office_longitude`) | Non |
| **Date de naissance** | Non | Oui (`date_of_birth`) |
| **Contact d'urgence** | Non | Oui (`emergency_contact`, `emergency_phone`) |
| **Statut de disponibilité** | Oui (`availability_status`) | Non |
| **Rôle utilisateur** | `avocat` | `client` |

---