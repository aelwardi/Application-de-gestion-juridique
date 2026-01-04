-- ============================================================================
-- MIGRATION FINALE - Unification de la table users
-- ============================================================================
-- Cette migration unifie tout dans la table users et supprime les tables
-- lawyers et clients qui sont maintenant redondantes
-- ============================================================================

BEGIN;

-- 1. Ajouter les colonnes spécifiques aux avocats dans users (si elles n'existent pas)
ALTER TABLE users ADD COLUMN IF NOT EXISTS bar_number VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS specialties TEXT[];
ALTER TABLE users ADD COLUMN IF NOT EXISTS experience_years INTEGER;
ALTER TABLE users ADD COLUMN IF NOT EXISTS education TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS languages TEXT[];
ALTER TABLE users ADD COLUMN IF NOT EXISTS hourly_rate DECIMAL(10, 2);
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS office_address TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS office_city VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS office_postal_code VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS website_url VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS linkedin_url VARCHAR(255);

-- 2. Ajouter les colonnes spécifiques aux clients dans users (si elles n'existent pas)
ALTER TABLE users ADD COLUMN IF NOT EXISTS company_name VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS company_siret VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS city VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS postal_code VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS nationality VARCHAR(100);

-- 3. Migrer les données des avocats depuis la table lawyers vers users
UPDATE users u
SET
    bar_number = l.bar_number,
    specialties = l.specialties,
    experience_years = l.experience_years,
    education = l.education,
    languages = l.languages,
    hourly_rate = l.hourly_rate,
    bio = l.bio,
    office_address = l.office_address,
    office_city = l.office_city,
    office_postal_code = l.office_postal_code,
    website_url = l.website_url,
    linkedin_url = l.linkedin_url
FROM lawyers l
WHERE u.id = l.user_id;

-- 4. Migrer les données des clients depuis la table clients vers users
UPDATE users u
SET
    company_name = c.company_name,
    company_siret = c.company_siret,
    address = c.address,
    city = c.city,
    postal_code = c.postal_code,
    date_of_birth = c.date_of_birth,
    nationality = c.nationality
FROM clients c
WHERE u.id = c.user_id;

-- 5. Créer les users manquants pour les avocats orphelins
INSERT INTO users (id, email, password, first_name, last_name, role, phone, created_at)
SELECT
    l.user_id,
    CONCAT('lawyer_', SUBSTRING(l.user_id::text, 1, 8), '@temporaire.com'),
    '$2b$10$rZ8yF5vK9X.qJ3mP6wN8XeHJY7xQ4tL2bM9dR5sA6cT8vK3wE1hNi', -- TempPassword123!
    'Avocat',
    COALESCE(l.bar_number, 'Inconnu'),
    'lawyer',
    NULL,
    CURRENT_TIMESTAMP
FROM lawyers l
LEFT JOIN users u ON l.user_id = u.id
WHERE u.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- 6. Créer les users manquants pour les clients orphelins
INSERT INTO users (id, email, password, first_name, last_name, role, phone, created_at)
SELECT
    c.user_id,
    CONCAT('client_', SUBSTRING(c.user_id::text, 1, 8), '@temporaire.com'),
    '$2b$10$rZ8yF5vK9X.qJ3mP6wN8XeHJY7xQ4tL2bM9dR5sA6cT8vK3wE1hNi',
    'Client',
    'Inconnu',
    'client',
    NULL,
    CURRENT_TIMESTAMP
FROM clients c
LEFT JOIN users u ON c.user_id = u.id
WHERE u.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- 7. Créer des index pour optimiser les recherches
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role) WHERE role IN ('lawyer', 'client');
CREATE INDEX IF NOT EXISTS idx_users_specialties ON users USING GIN(specialties) WHERE role = 'lawyer';
CREATE INDEX IF NOT EXISTS idx_users_office_city ON users(office_city) WHERE role = 'lawyer';
CREATE INDEX IF NOT EXISTS idx_users_bar_number ON users(bar_number) WHERE role = 'lawyer';
CREATE INDEX IF NOT EXISTS idx_users_city ON users(city) WHERE role = 'client';

-- 8. Vérification finale
DO $$
DECLARE
    orphan_lawyers INT;
    orphan_clients INT;
    total_lawyers INT;
    total_clients INT;
BEGIN
    -- Compter les avocats orphelins
    SELECT COUNT(*) INTO orphan_lawyers
    FROM lawyers l
    LEFT JOIN users u ON l.user_id = u.id
    WHERE u.id IS NULL;

    -- Compter les clients orphelins
    SELECT COUNT(*) INTO orphan_clients
    FROM clients c
    LEFT JOIN users u ON c.user_id = u.id
    WHERE u.id IS NULL;

    -- Compter le total
    SELECT COUNT(*) INTO total_lawyers FROM users WHERE role = 'lawyer';
    SELECT COUNT(*) INTO total_clients FROM users WHERE role = 'client';

    RAISE NOTICE '========================================';
    RAISE NOTICE 'RÉSULTAT DE LA MIGRATION';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Avocats orphelins restants: %', orphan_lawyers;
    RAISE NOTICE 'Clients orphelins restants: %', orphan_clients;
    RAISE NOTICE 'Total avocats dans users: %', total_lawyers;
    RAISE NOTICE 'Total clients dans users: %', total_clients;
    RAISE NOTICE '========================================';

    IF orphan_lawyers > 0 OR orphan_clients > 0 THEN
        RAISE WARNING 'Il reste des enregistrements orphelins!';
    ELSE
        RAISE NOTICE '✅ Migration réussie! Aucun orphelin.';
    END IF;
END $$;

-- 9. OPTIONNEL: Supprimer les anciennes tables (décommentez si vous êtes sûr)
-- DROP TABLE IF EXISTS lawyers CASCADE;
-- DROP TABLE IF EXISTS clients CASCADE;

-- Note: Les tables lawyers et clients sont conservées pour l'instant
-- Vous pouvez les supprimer manuellement après vérification complète

COMMIT;

-- ============================================================================
-- FIN DE LA MIGRATION
-- ============================================================================
-- Après avoir exécuté cette migration:
-- 1. Recompiler le backend: npm run build
-- 2. Redémarrer le serveur: npm run dev
-- 3. Tester l'acceptation d'offres
-- 4. Si tout fonctionne, vous pouvez supprimer les tables lawyers et clients
-- ============================================================================

