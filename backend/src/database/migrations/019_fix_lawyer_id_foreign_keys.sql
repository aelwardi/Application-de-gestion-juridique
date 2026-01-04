-- Migration pour corriger les contraintes de clés étrangères incohérentes
-- Date: 2026-01-04
-- Description: Uniformiser toutes les références lawyer_id pour qu'elles pointent vers users(id)

-- ATTENTION: Cette migration doit être exécutée avec précaution
-- Elle modifie les contraintes de clés étrangères des tables existantes

BEGIN;

-- ============================================
-- 1. Corriger la table lawyer_requests
-- ============================================
-- Actuellement: lawyer_id REFERENCES lawyers(id)
-- Objectif: lawyer_id REFERENCES users(id)

-- Supprimer l'ancienne contrainte
ALTER TABLE lawyer_requests
DROP CONSTRAINT IF EXISTS lawyer_requests_lawyer_id_fkey;

-- Mettre à jour les lawyer_id pour qu'ils pointent vers les user_id
-- Cela convertit les IDs de la table lawyers en IDs de la table users
UPDATE lawyer_requests lr
SET lawyer_id = l.user_id
FROM lawyers l
WHERE lr.lawyer_id = l.id
AND lr.lawyer_id IN (SELECT id FROM lawyers);

-- Ajouter la nouvelle contrainte pointant vers users
ALTER TABLE lawyer_requests
ADD CONSTRAINT lawyer_requests_lawyer_id_fkey
FOREIGN KEY (lawyer_id) REFERENCES users(id) ON DELETE CASCADE;

-- ============================================
-- 2. Corriger la table case_offers
-- ============================================
-- Actuellement: lawyer_id REFERENCES lawyers(id)
-- Objectif: lawyer_id REFERENCES users(id)

-- Supprimer l'ancienne contrainte
ALTER TABLE case_offers
DROP CONSTRAINT IF EXISTS case_offers_lawyer_id_fkey;

-- Mettre à jour les lawyer_id pour qu'ils pointent vers les user_id
UPDATE case_offers co
SET lawyer_id = l.user_id
FROM lawyers l
WHERE co.lawyer_id = l.id
AND co.lawyer_id IN (SELECT id FROM lawyers);

-- Ajouter la nouvelle contrainte pointant vers users
ALTER TABLE case_offers
ADD CONSTRAINT case_offers_lawyer_id_fkey
FOREIGN KEY (lawyer_id) REFERENCES users(id) ON DELETE CASCADE;

-- ============================================
-- 3. Vérifications post-migration
-- ============================================

-- Vérifier que tous les lawyer_id dans lawyer_requests pointent vers des avocats valides
DO $$
DECLARE
    invalid_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO invalid_count
    FROM lawyer_requests lr
    LEFT JOIN users u ON lr.lawyer_id = u.id
    WHERE u.id IS NULL OR u.role != 'lawyer';

    IF invalid_count > 0 THEN
        RAISE EXCEPTION 'Migration failed: % invalid lawyer_id found in lawyer_requests', invalid_count;
    END IF;

    RAISE NOTICE 'lawyer_requests: All lawyer_id are valid';
END $$;

-- Vérifier que tous les lawyer_id dans case_offers pointent vers des avocats valides
DO $$
DECLARE
    invalid_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO invalid_count
    FROM case_offers co
    LEFT JOIN users u ON co.lawyer_id = u.id
    WHERE u.id IS NULL OR u.role != 'lawyer';

    IF invalid_count > 0 THEN
        RAISE EXCEPTION 'Migration failed: % invalid lawyer_id found in case_offers', invalid_count;
    END IF;

    RAISE NOTICE 'case_offers: All lawyer_id are valid';
END $$;

-- ============================================
-- 4. Créer des index pour améliorer les performances
-- ============================================

-- Index pour lawyer_requests
CREATE INDEX IF NOT EXISTS idx_lawyer_requests_lawyer_id_v2 ON lawyer_requests(lawyer_id);

-- Index pour case_offers
CREATE INDEX IF NOT EXISTS idx_case_offers_lawyer_id_v2 ON case_offers(lawyer_id);

-- ============================================
-- 5. Ajouter des commentaires pour la documentation
-- ============================================

COMMENT ON CONSTRAINT lawyer_requests_lawyer_id_fkey ON lawyer_requests IS
'FK vers users.id (utilisateurs avec role=lawyer). Modifié le 2026-01-04 pour uniformiser avec les autres tables.';

COMMENT ON CONSTRAINT case_offers_lawyer_id_fkey ON case_offers IS
'FK vers users.id (utilisateurs avec role=lawyer). Modifié le 2026-01-04 pour uniformiser avec les autres tables.';

COMMIT;

-- ============================================
-- Instructions post-migration
-- ============================================
--
-- Après avoir exécuté cette migration, TOUS les lawyer_id dans TOUTES les tables
-- pointent maintenant vers users.id (et non plus vers lawyers.id)
--
-- Tables affectées:
-- ✅ client_requests - Déjà correct (lawyer_id -> users.id)
-- ✅ lawyer_requests - Corrigé (lawyer_id -> users.id)
-- ✅ case_offers - Corrigé (lawyer_id -> users.id)
-- ✅ cases - Déjà correct (lawyer_id -> users.id)
-- ✅ appointments - Déjà correct (lawyer_id -> users.id)
-- ✅ reviews - Déjà correct (lawyer_id -> users.id)
--
-- IMPORTANT: Le backend utilise maintenant la fonction utilitaire resolveLawyerId()
-- qui gère automatiquement la conversion entre lawyers.id et users.id

