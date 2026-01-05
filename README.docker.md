# 🐳 Docker Setup - Application de Gestion Juridique

## 📋 Prérequis

- Docker (version 20.10 ou supérieure)
- Docker Compose (version 2.0 ou supérieure)

## 🚀 Démarrage rapide

### Mode Développement

1. **Cloner le projet** (si ce n'est pas déjà fait)
   ```bash
   git clone <repository-url>
   cd Application-de-gestion-juridique
   ```

2. **Créer les fichiers d'environnement**
   ```bash
   cp .env.example backend/.env
   cp .env.example frontend/.env
   ```

3. **Démarrer tous les services**
   ```bash
   docker-compose up -d
   ```

4. **Vérifier que tout fonctionne**
   ```bash
   docker-compose ps
   ```

5. **Accéder à l'application**
   - Frontend: http://localhost:3001
   - Backend API: http://localhost:3000/api
   - PostgreSQL: localhost:5434

### Arrêter les services
```bash
docker-compose down
```

### Arrêter et supprimer les volumes
```bash
docker-compose down -v
```

## 🏗️ Architecture

```
┌─────────────────┐
│   Frontend      │
│   (Nuxt.js)     │
│   Port: 3001    │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│   Backend       │
│   (Node.js)     │
│   Port: 3000    │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│   PostgreSQL    │
│   Port: 5434    │
└─────────────────┘
```

## 📝 Commandes utiles

### Logs
```bash
# Tous les services
docker-compose logs -f

# Service spécifique
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Rebuild
```bash
# Reconstruire tous les services
docker-compose up -d --build

# Reconstruire un service spécifique
docker-compose up -d --build backend
```

### Exécuter des commandes dans les conteneurs
```bash
# Backend - Migrations
docker-compose exec backend npm run migrate

# Backend - Shell
docker-compose exec backend sh

# PostgreSQL - psql
docker-compose exec postgres psql -U postgres -d gestion_juridique

# Frontend - Shell
docker-compose exec frontend sh
```

### Redémarrer un service
```bash
docker-compose restart backend
docker-compose restart frontend
```

## 🏭 Mode Production

1. **Configurer les variables d'environnement**
   - Créer un fichier `.env` à la racine avec les valeurs de production
   - **IMPORTANT**: Changer les secrets JWT et mots de passe

2. **Démarrer en production**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

3. **Configuration Nginx** (optionnel)
   - Le fichier `docker-compose.prod.yml` inclut un reverse proxy Nginx
   - Configurer SSL/TLS dans `nginx/nginx.conf`

## 🔧 Développement

### Hot Reload
Les volumes montés permettent le hot reload :
- Backend: Les modifications TypeScript sont automatiquement recompilées
- Frontend: Les changements Nuxt sont immédiatement visibles

### Installer de nouvelles dépendances
```bash
# Backend
docker-compose exec backend npm install <package-name>

# Frontend
docker-compose exec frontend npm install <package-name>
```

Puis reconstruire l'image :
```bash
docker-compose up -d --build backend
```

## 🗄️ Base de données

### Accéder à PostgreSQL
```bash
docker-compose exec postgres psql -U postgres -d gestion_juridique
```

### Backup
```bash
docker-compose exec postgres pg_dump -U postgres gestion_juridique > backup.sql
```

### Restore
```bash
cat backup.sql | docker-compose exec -T postgres psql -U postgres -d gestion_juridique
```

### Migrations
```bash
docker-compose exec backend npm run migrate
```

## 🐛 Dépannage

### Les conteneurs ne démarrent pas
```bash
# Vérifier les logs
docker-compose logs

# Vérifier l'état
docker-compose ps
```

### La base de données ne se connecte pas
```bash
# Vérifier que PostgreSQL est prêt
docker-compose exec postgres pg_isready -U postgres

# Attendre le healthcheck
docker-compose up -d postgres
sleep 10
docker-compose up -d backend
```

### Erreur de port déjà utilisé
```bash
# Trouver quel processus utilise le port
netstat -ano | findstr :3000
netstat -ano | findstr :3001
netstat -ano | findstr :5434

# Arrêter le processus ou changer le port dans docker-compose.yml
```

### Supprimer tout et recommencer
```bash
docker-compose down -v
docker system prune -a
docker-compose up -d --build
```

## 📊 Monitoring

### Ressources utilisées
```bash
docker stats
```

### Espace disque
```bash
docker system df
```

## 🔐 Sécurité (Production)

- ✅ Changer tous les mots de passe par défaut
- ✅ Utiliser des secrets Docker pour les données sensibles
- ✅ Activer HTTPS avec certificats SSL
- ✅ Configurer des limites de ressources
- ✅ Ne pas exposer PostgreSQL publiquement
- ✅ Activer les logs d'audit
- ✅ Mettre à jour régulièrement les images

## 📚 Ressources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Node.js Docker Best Practices](https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md)
