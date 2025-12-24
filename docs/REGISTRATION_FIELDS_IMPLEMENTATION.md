# Implémentation des Champs Conditionnels d'Inscription

## Vue d'ensemble
Cette documentation décrit l'implémentation des champs conditionnels dans le formulaire d'inscription qui s'affichent selon le type de compte sélectionné (avocat ou client).

## Modifications Backend

### 1. Validators (`backend/src/validators/auth.validator.ts`)
Ajout de deux nouveaux schémas de validation :

```typescript
// Schéma pour les données avocat
export const lawyerDataSchema = z.object({
  barNumber: z.string().min(1, 'Bar number is required'),
  specialties: z.array(z.string()).optional(),
  officeAddress: z.string().optional(),
  officeCity: z.string().optional(),
  yearsOfExperience: z.number().min(0).max(100).optional(),
  bio: z.string().optional(),
});

// Schéma pour les données client
export const clientDataSchema = z.object({
  address: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
});
```

Le `registerSchema` a été mis à jour pour accepter ces nouveaux champs :
```typescript
export const registerSchema = z.object({
  // ... autres champs
  lawyerData: lawyerDataSchema.optional(),
  clientData: clientDataSchema.optional(),
});
```

### 2. Queries (`backend/src/database/queries/auth.queries.ts`)
La fonction `createUser` a été mise à jour pour accepter et utiliser les données additionnelles :

**Signature mise à jour :**
```typescript
export const createUser = async (
  email: string,
  passwordHash: string,
  role: string,
  firstName: string,
  lastName: string,
  phone?: string,
  lawyerData?: LawyerData,
  clientData?: ClientData
): Promise<User>
```

**Pour les avocats :**
- Utilise les données fournies dans `lawyerData` au lieu de valeurs temporaires
- Insère toutes les informations professionnelles (numéro de barreau, spécialités, adresse du cabinet, etc.)
- Génère un numéro temporaire uniquement si aucun n'est fourni

**Pour les clients :**
- Utilise les données fournies dans `clientData`
- Insère l'adresse, la ville et le code postal

### 3. Services (`backend/src/services/auth.service.ts`)
La fonction `register` a été mise à jour pour passer les nouvelles données à `createUser` :

```typescript
const user = await createUser(
  data.email,
  passwordHash,
  data.role,
  data.firstName,
  data.lastName,
  data.phone,
  data.lawyerData,  // Nouveau
  data.clientData   // Nouveau
);
```

## Modifications Frontend

### 1. Types (`frontend/types/auth.ts`)
Ajout de nouvelles interfaces :

```typescript
export interface LawyerData {
  barNumber: string;
  specialties?: string[];
  officeAddress?: string;
  officeCity?: string;
  yearsOfExperience?: number;
  bio?: string;
}

export interface ClientData {
  address?: string;
  city?: string;
  postalCode?: string;
}

export interface RegisterData {
  // ... autres champs
  lawyerData?: LawyerData;
  clientData?: ClientData;
}
```

### 2. Formulaire d'inscription (`frontend/pages/auth/register.vue`)

#### Structure du formulaire
Le formulaire contient maintenant des sections conditionnelles qui s'affichent selon le rôle sélectionné.

#### Champs pour les avocats (v-if="form.role === 'avocat'")
1. **Numéro du Barreau** (obligatoire)
   - Type: text
   - Placeholder: "ex: 75001234"
   - Validation: requis si le rôle est avocat

2. **Spécialités**
   - Type: text (entrée comma-separated)
   - Placeholder: "ex: Droit civil, Droit pénal"
   - Conversion automatique en tableau via un watcher

3. **Adresse du cabinet**
   - Type: text
   - Placeholder: "ex: 123 Rue de la Loi, 75001 Paris"

4. **Ville**
   - Type: text
   - Placeholder: "ex: Paris"

5. **Années d'expérience**
   - Type: number
   - Min: 0, Max: 60
   - Placeholder: "ex: 5"

6. **Biographie**
   - Type: textarea (3 lignes)
   - Placeholder: "Présentez votre parcours..."

#### Champs pour les clients (v-if="form.role === 'client'")
1. **Adresse**
   - Type: text
   - Placeholder: "ex: 10 Avenue des Champs"

2. **Ville**
   - Type: text
   - Placeholder: "ex: Paris"

3. **Code postal**
   - Type: text
   - Placeholder: "ex: 75008"

#### Gestion des spécialités
Un système de conversion automatique transforme l'entrée comma-separated en tableau :

```typescript
const specialtiesInput = ref('');

watch(specialtiesInput, (value) => {
  if (value) {
    form.value.lawyerData.specialties = value
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);
  } else {
    form.value.lawyerData.specialties = [];
  }
});
```

#### Validation
Avant la soumission, le formulaire valide que :
- Les mots de passe correspondent
- Si le rôle est "avocat", le numéro de barreau est fourni

```typescript
if (form.value.role === 'avocat') {
  if (!form.value.lawyerData.barNumber) {
    errorMessage.value = 'Le numéro du barreau est requis pour les avocats';
    return;
  }
}
```

## Flux de données

1. **Sélection du rôle** → Affichage conditionnel des champs
2. **Remplissage du formulaire** → Mise à jour du modèle réactif
3. **Conversion des spécialités** → Transformation string → array
4. **Validation côté client** → Vérification des champs requis
5. **Envoi au backend** → POST /auth/register avec données complètes
6. **Validation côté serveur** → Zod validation
7. **Création de l'utilisateur** → Transaction PostgreSQL
8. **Insertion du profil** → Création dans lawyers ou clients avec données réelles

## Base de données

### Table lawyers
Colonnes mises à jour lors de l'inscription :
- `user_id` (FK vers users)
- `bar_number` (fourni par l'utilisateur)
- `specialties` (array de strings)
- `office_address` (optionnel)
- `office_city` (optionnel)
- `years_of_experience` (optionnel)
- `bio` (optionnel)

### Table clients
Colonnes mises à jour lors de l'inscription :
- `user_id` (FK vers users)
- `address` (optionnel)
- `city` (optionnel)
- `postal_code` (optionnel)
- `total_cases` (0 par défaut)
- `active_cases` (0 par défaut)

## Avantages de cette implémentation

1. **Expérience utilisateur améliorée**
   - Formulaire unique avec champs contextuels
   - Pas besoin de remplir un profil après l'inscription
   - Feedback visuel clair (couleurs différentes par rôle)

2. **Intégrité des données**
   - Utilisation de transactions PostgreSQL
   - Validation stricte côté client et serveur
   - Numéros de barreau réels dès l'inscription

3. **Maintenabilité**
   - Types TypeScript stricts
   - Validation Zod centralisée
   - Code modulaire et réutilisable

4. **Évolutivité**
   - Facile d'ajouter de nouveaux champs
   - Structure extensible pour d'autres rôles
   - Validation flexible

## Tests recommandés

1. **Inscription avocat avec toutes les données**
   - Vérifier l'insertion dans users et lawyers
   - Vérifier que les spécialités sont bien un tableau
   - Vérifier que toutes les données optionnelles sont sauvegardées

2. **Inscription avocat avec données minimales**
   - Seulement numéro de barreau (requis)
   - Vérifier que les champs optionnels sont NULL

3. **Inscription client avec toutes les données**
   - Vérifier l'insertion dans users et clients
   - Vérifier les compteurs (total_cases, active_cases)

4. **Inscription client sans données additionnelles**
   - Vérifier que l'inscription fonctionne
   - Vérifier que les champs optionnels sont NULL

5. **Validation des erreurs**
   - Tenter d'inscrire un avocat sans numéro de barreau
   - Vérifier les messages d'erreur appropriés

## Notes techniques

### Gestion des transactions
Toutes les insertions utilisent une transaction PostgreSQL pour garantir l'atomicité :
```sql
BEGIN;
INSERT INTO users (...);
INSERT INTO lawyers/clients (...);
COMMIT;
```

En cas d'erreur, un ROLLBACK est effectué pour annuler toutes les modifications.

### Conversion des spécialités
Le frontend envoie un tableau de strings, pas une string comma-separated :
```json
{
  "lawyerData": {
    "specialties": ["Droit civil", "Droit pénal", "Droit des affaires"]
  }
}
```

PostgreSQL stocke cela dans une colonne `text[]`.

### Valeurs par défaut
- Si `lawyerData` n'est pas fourni et le rôle est avocat : génération d'un numéro temporaire
- Si `clientData` n'est pas fourni : champs NULL dans la table clients
- Compteurs clients : toujours initialisés à 0
