# Guide d'utilisation des APIs Cases (Dossiers)

## Installation et Configuration

### 1. Exécuter les migrations
```bash
cd backend
npm run migrate
```

### 2. Démarrer le serveur
```bash
npm run dev
```

Le serveur démarrera sur `http://localhost:5000`

---

## Exemples d'utilisation avec CURL

### Créer un dossier
```bash
curl -X POST http://localhost:5000/api/cases \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Divorce contentieux - Dupont",
    "description": "Dossier de divorce avec partage des biens",
    "case_type": "familial",
    "priority": "medium",
    "client_id": "client-uuid-here",
    "lawyer_id": "lawyer-uuid-here",
    "court_name": "Tribunal de Grande Instance de Paris",
    "judge_name": "Juge Martin",
    "next_hearing_date": "2025-02-15T10:00:00",
    "estimated_duration_months": 6
  }'
```

### Récupérer tous les dossiers
```bash
curl -X GET "http://localhost:5000/api/cases?status=in_progress&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Récupérer un dossier spécifique
```bash
curl -X GET http://localhost:5000/api/cases/CASE_UUID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Mettre à jour un dossier
```bash
curl -X PUT http://localhost:5000/api/cases/CASE_UUID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "status": "in_progress",
    "priority": "high",
    "next_hearing_date": "2025-03-01T14:00:00"
  }'
```

### Assigner un avocat
```bash
curl -X POST http://localhost:5000/api/cases/CASE_UUID/assign-lawyer \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "lawyer_id": "lawyer-uuid-here"
  }'
```

### Récupérer les statistiques
```bash
curl -X GET http://localhost:5000/api/cases/stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Récupérer les dossiers d'un avocat
```bash
curl -X GET http://localhost:5000/api/cases/lawyer/LAWYER_UUID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Récupérer les prochaines audiences
```bash
curl -X GET "http://localhost:5000/api/cases/upcoming-hearings?lawyer_id=LAWYER_UUID" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Fermer un dossier
```bash
curl -X POST http://localhost:5000/api/cases/CASE_UUID/close \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Archiver un dossier
```bash
curl -X POST http://localhost:5000/api/cases/CASE_UUID/archive \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Supprimer un dossier
```bash
curl -X DELETE http://localhost:5000/api/cases/CASE_UUID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Exemples d'utilisation avec Fetch (JavaScript/TypeScript)

### Créer un dossier
```typescript
const createCase = async (caseData: CreateCaseDTO) => {
  const response = await fetch('http://localhost:5000/api/cases', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(caseData)
  });
  
  return await response.json();
};
```

### Récupérer tous les dossiers avec filtres
```typescript
const getAllCases = async (filters?: CaseFilters) => {
  const params = new URLSearchParams();
  
  if (filters?.status) params.append('status', filters.status);
  if (filters?.priority) params.append('priority', filters.priority);
  if (filters?.search) params.append('search', filters.search);
  if (filters?.limit) params.append('limit', filters.limit.toString());
  
  const response = await fetch(`http://localhost:5000/api/cases?${params}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return await response.json();
};
```

### Mettre à jour un dossier
```typescript
const updateCase = async (caseId: string, updates: UpdateCaseDTO) => {
  const response = await fetch(`http://localhost:5000/api/cases/${caseId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(updates)
  });
  
  return await response.json();
};
```

### Récupérer les statistiques
```typescript
const getCaseStats = async (lawyerId?: string) => {
  const url = lawyerId 
    ? `http://localhost:5000/api/cases/stats?lawyer_id=${lawyerId}`
    : 'http://localhost:5000/api/cases/stats';
    
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return await response.json();
};
```

---

## Intégration avec le Frontend Nuxt

### Composable useCase.ts
Créez un composable pour gérer les appels API des dossiers :

```typescript
// composables/useCase.ts
export const useCase = () => {
  const config = useRuntimeConfig();
  const { getToken } = useAuth();
  
  const createCase = async (caseData: CreateCaseDTO) => {
    const token = getToken();
    const response = await $fetch(`${config.public.apiBaseUrl}/cases`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: caseData
    });
    return response;
  };
  
  const getAllCases = async (filters?: CaseFilters) => {
    const token = getToken();
    const response = await $fetch(`${config.public.apiBaseUrl}/cases`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      },
      params: filters
    });
    return response;
  };
  
  const getCaseById = async (id: string) => {
    const token = getToken();
    const response = await $fetch(`${config.public.apiBaseUrl}/cases/${id}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response;
  };
  
  const updateCase = async (id: string, updates: UpdateCaseDTO) => {
    const token = getToken();
    const response = await $fetch(`${config.public.apiBaseUrl}/cases/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: updates
    });
    return response;
  };
  
  const getCaseStats = async (lawyerId?: string) => {
    const token = getToken();
    const response = await $fetch(`${config.public.apiBaseUrl}/cases/stats`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      },
      params: lawyerId ? { lawyer_id: lawyerId } : undefined
    });
    return response;
  };
  
  return {
    createCase,
    getAllCases,
    getCaseById,
    updateCase,
    getCaseStats
  };
};
```

---

## Tests

### Test de création de dossier
```typescript
// tests/unit/dossier.service.test.ts
import { dossierService } from '../src/services/dossier.service';

describe('Dossier Service', () => {
  it('should create a new case', async () => {
    const caseData = {
      title: 'Test Case',
      case_type: 'civil',
      client_id: 'test-client-id'
    };
    
    const result = await dossierService.createCase(caseData);
    
    expect(result.success).toBe(true);
    expect(result.data).toHaveProperty('id');
    expect(result.data.title).toBe('Test Case');
  });
});
```

---

## Notes importantes

1. **Authentification requise**: Toutes les routes nécessitent un token JWT valide
2. **Validation**: Les données sont validées côté serveur
3. **Relations**: Les dossiers sont liés aux clients (users) et avocats (lawyers)
4. **Statuts**: Le changement de statut est géré automatiquement (ex: assignation d'avocat)
5. **Numéros de dossier**: Générés automatiquement lors de la création
6. **Dates**: Les dates `created_at` et `updated_at` sont gérées automatiquement

---

## Troubleshooting

### Erreur 401 Unauthorized
- Vérifiez que le token JWT est valide
- Vérifiez que le header Authorization est présent

### Erreur 404 Not Found
- Vérifiez que l'ID du dossier existe
- Vérifiez l'URL de l'endpoint

### Erreur 500 Internal Server Error
- Vérifiez les logs du serveur
- Vérifiez que la base de données est accessible
- Vérifiez que les relations (client_id, lawyer_id) sont valides
